// app/api/rag-admin/documents/[id]/reindex/route.js
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const RAG_TIMEOUT_MS = Number(process.env.RAG_TIMEOUT_MS || 30_000);

/* ---------- utils ---------- */
const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

function json(data, status = 200) {
  return NextResponse.json(data, { status, headers: noStoreHeaders });
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

function isPlausibleId(id) {
  if (!id || typeof id !== "string") return false;
  const s = id.trim();
  return s.length >= 8 && s.length <= 200; // piisavalt leebe, aga välistab tühjad
}

function buildRagEndpoint(base, docId) {
  const b = (base || "").trim().replace(/\/+$/, "");
  return `${b}/documents/${encodeURIComponent(docId)}/reindex`;
}

async function fetchWithRetries(url, { headers, timeoutMs, tries = 3 }) {
  // 3 proovikat (nt RAG restart), backoff: 150ms, 350ms
  let lastErr;
  for (let i = 0; i < Math.max(1, tries); i++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers,
        cache: "no-store",
        signal: controller.signal,
      });
      clearTimeout(timer);
      return res;
    } catch (err) {
      clearTimeout(timer);
      lastErr = err;
      if (i < tries - 1) {
        const backoff = i === 0 ? 150 : 350;
        await new Promise((r) => setTimeout(r, backoff));
        continue;
      }
      throw lastErr;
    }
  }
}

/* ---------- POST /reindex ---------- */
export async function POST(_req, { params }) {
  const admin = await requireAdmin();
  if (!admin.ok) return json({ ok: false, message: admin.message }, admin.status);

  const docId = params?.id ? String(params.id).trim() : "";
  if (!isPlausibleId(docId)) {
    return json({ ok: false, message: "Vigane või puuduva formaadiga ID." }, 400);
  }

  const { prisma } = await import("@/lib/prisma");

  // 0) kontrolli, et dokument on olemas
  let existing;
  try {
    existing = await prisma.ragDocument.findUnique({ where: { id: docId } });
  } catch (err) {
    return json(
      { ok: false, message: "Andmebaasi viga (otsing ebaõnnestus).", error: err?.message },
      500
    );
  }
  if (!existing) return json({ ok: false, message: "Dokument puudub." }, 404);

  // **Kasuta RAG-is remoteId-d; kui seda pole (vanad kirjed), siis fallback lokaalsele id-le**
  const ragId = existing.remoteId ?? docId;

  // 1) Märgi DB-s PROCESSING (UI saab kohe peegeldada)
  try {
    await prisma.ragDocument.update({
      where: { id: docId },
      data: { status: "PROCESSING", error: null, updatedAt: new Date() },
    });
  } catch (err) {
    return json(
      { ok: false, message: "Andmebaasi viga (staatuse uuendamine ebaõnnestus).", error: err?.message },
      500
    );
  }

  const ragBase = (process.env.RAG_API_BASE || "").trim();
  const apiKey =
    (process.env.RAG_SERVICE_API_KEY || process.env.RAG_API_KEY || "").trim();

  if (!ragBase) return json({ ok: false, message: "RAG_API_BASE puudub serveri keskkonnast." }, 500);
  if (!apiKey) return json({ ok: false, message: "RAG_SERVICE_API_KEY puudub serveri keskkonnast." }, 500);

  const endpoint = buildRagEndpoint(ragBase, ragId);

  let res;
  try {
    res = await fetchWithRetries(endpoint, {
      headers: {
        "X-API-Key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeoutMs: RAG_TIMEOUT_MS,
      tries: 3,
    });
  } catch (err) {
    const msg =
      err?.name === "AbortError"
        ? "RAG reindekseerimine aegus (timeout)."
        : `RAG ühenduse viga: ${err?.message || String(err)}`;
    try {
      await prisma.ragDocument.update({
        where: { id: docId },
        data: { status: "FAILED", error: msg, updatedAt: new Date() },
      });
    } catch {}
    return json({ ok: false, message: msg }, 502);
  }

  const raw = await res.text().catch(() => "");
  let data = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = { raw }; // salvestame raw (nt traceback/HTML) kui polnud JSON
  }

  if (!res.ok) {
    const detail =
      data?.detail || data?.message || `RAG reindekseerimine ebaõnnestus (${res.status}).`;
    try {
      await prisma.ragDocument.update({
        where: { id: docId },
        data: { status: "FAILED", error: detail, updatedAt: new Date() },
      });
    } catch {}
    return json({ ok: false, message: detail, response: data, responseStatus: res.status }, 502);
  }

  // Kui RAG tagastas inserted, kasutame seda optimistlikult
  const inserted = Number.isFinite(data?.inserted) ? Number(data.inserted) : null;
  const nextStatus = inserted && inserted > 0 ? "COMPLETED" : "PROCESSING";

  let updated;
  try {
    updated = await prisma.ragDocument.update({
      where: { id: docId },
      data: {
        status: nextStatus,
        error: null,
        updatedAt: new Date(),
        insertedAt: nextStatus === "COMPLETED" ? new Date() : existing.insertedAt ?? null,
      },
      select: { id: true, status: true, updatedAt: true, insertedAt: true },
    });
  } catch (err) {
    return json(
      { ok: false, message: "Andmebaasi viga (lõpp-uuendus ebaõnnestus).", error: err?.message },
      500
    );
  }

  return json({
    ok: true,
    doc: updated,
    rag: data,
    responseStatus: res.status,
    usedRemoteId: ragId !== docId ? ragId : null, // väike abi-debug UI jaoks
  });
}
