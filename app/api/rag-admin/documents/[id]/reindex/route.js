// app/api/rag-admin/documents/[id]/reindex/route.js
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const RAG_TIMEOUT_MS = Number(process.env.RAG_TIMEOUT_MS || 30_000);

/* ---------- utils ---------- */
function json(data, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

async function getAuthOptions() {
  try {
    const mod = await import("@/pages/api/auth/[...nextauth]");
    return mod.authOptions || mod.default || mod.authConfig;
  } catch {
    try {
      const mod = await import("@/auth");
      return mod.authOptions || mod.default || mod.authConfig;
    } catch {
      return undefined;
    }
  }
}

async function requireAdmin() {
  const { getServerSession } = await import("next-auth/next");
  const authOptions = await getAuthOptions();
  const session = await getServerSession(authOptions);
  const isAdmin =
    !!session?.user?.isAdmin ||
    String(session?.user?.role || "").toUpperCase() === "ADMIN";

  if (!session?.user?.id) return { ok: false, status: 401, message: "Pole sisse logitud" };
  if (!isAdmin) return { ok: false, status: 403, message: "Ligipääs keelatud" };
  return { ok: true, userId: session.user.id };
}

/* ---------- POST /reindex ---------- */
export async function POST(_req, { params }) {
  const admin = await requireAdmin();
  if (!admin.ok) return json({ ok: false, message: admin.message }, admin.status);

  const docId = params?.id ? String(params.id).trim() : "";
  if (!docId) return json({ ok: false, message: "ID puudub." }, 400);

  const { prisma } = await import("@/lib/prisma");

  // 0) kontrolli, et dokument on olemas
  const existing = await prisma.ragDocument.findUnique({ where: { id: docId } });
  if (!existing) return json({ ok: false, message: "Dokument puudub." }, 404);

  // 1) Märgi DB-s PROCESSING (UI saab kohe peegeldada)
  await prisma.ragDocument.update({
    where: { id: docId },
    data: { status: "PROCESSING", error: null, updatedAt: new Date() },
  });

  const ragBase = (process.env.RAG_API_BASE || "").trim();
  const apiKey =
    (process.env.RAG_SERVICE_API_KEY || process.env.RAG_API_KEY || "").trim();

  if (!ragBase) return json({ ok: false, message: "RAG_API_BASE puudub serveri keskkonnast." }, 500);
  if (!apiKey) return json({ ok: false, message: "RAG_SERVICE_API_KEY puudub serveri keskkonnast." }, 500);

  const endpoint = `${ragBase.replace(/\/+$/, "")}/documents/${encodeURIComponent(docId)}/reindex`;

  // timeout + 1× kiire retry
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), RAG_TIMEOUT_MS);
  const doFetch = () =>
    fetch(endpoint, {
      method: "POST",
      headers: { "X-API-Key": apiKey, "Content-Type": "application/json", Accept: "application/json" },
      cache: "no-store",
      signal: controller.signal,
    });

  let res;
  try {
    try {
      res = await doFetch();
    } catch {
      // üks kiire retry (nt värskelt restartinud RAG)
      await new Promise((r) => setTimeout(r, 250));
      res = await doFetch();
    }
  } catch (err) {
    clearTimeout(timeout);
    const msg = err?.name === "AbortError" ? "RAG reindex aegus (timeout)" : `RAG ühenduse viga: ${err?.message || String(err)}`;
    await prisma.ragDocument.update({
      where: { id: docId },
      data: { status: "FAILED", error: msg, updatedAt: new Date() },
    });
    return json({ ok: false, message: msg }, 502);
  } finally {
    clearTimeout(timeout);
  }

  const raw = await res.text().catch(() => "");
  let data = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    // kui server vastas mitte-JSONiga, salvesta raw debuggimiseks
    data = { raw };
  }

  if (!res.ok) {
    const detail = data?.detail || data?.message || `RAG reindex viga (${res.status})`;
    await prisma.ragDocument.update({
      where: { id: docId },
      data: { status: "FAILED", error: detail, updatedAt: new Date() },
    });
    return json({ ok: false, message: detail, response: data }, 502);
  }

  // Kui RAG vastus ütleb, mitu tükki lisati, võime optimistlikult COMPLETED’iks märkida.
  // Soovi korral jäta PROCESSING, et UI ootaks /documents värskendust.
  const inserted = Number.isFinite(data?.inserted) ? Number(data.inserted) : null;
  const nextStatus = inserted && inserted > 0 ? "COMPLETED" : "PROCESSING";

  const updated = await prisma.ragDocument.update({
    where: { id: docId },
    data: {
      status: nextStatus,
      error: null,
      updatedAt: new Date(),
      insertedAt: nextStatus === "COMPLETED" ? new Date() : existing.insertedAt ?? null,
    },
  });

  return json({
    ok: true,
    doc: {
      id: updated.id,
      status: updated.status,
      updatedAt: updated.updatedAt,
      insertedAt: updated.insertedAt,
    },
    rag: data,
  });
}
