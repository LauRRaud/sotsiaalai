// app/api/rag-admin/documents/[id]/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const RAG_TIMEOUT_MS = Number(process.env.RAG_TIMEOUT_MS || 15_000);

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

/* ---------- Auth helpers (joondatud teiste route'idega) ---------- */
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
  const isAdmin = !!session?.user?.isAdmin || String(session?.user?.role || "").toUpperCase() === "ADMIN";
  if (!session?.user?.id) return { ok: false, status: 401, message: "Logi sisse." };
  if (!isAdmin) return { ok: false, status: 403, message: "Pole õigusi." };
  return { ok: true, userId: session.user.id };
}

/* ---------- DELETE ---------- */
export async function DELETE(_req, { params }) {
  const auth = await requireAdmin();
  if (!auth.ok) return json({ ok: false, message: auth.message }, auth.status);

  const id = params?.id ? String(params.id).trim() : "";
  if (!id) return json({ ok: false, message: "ID on kohustuslik." }, 400);

  const ragBase = (process.env.RAG_API_BASE || "").trim();
  const apiKey =
    (process.env.RAG_SERVICE_API_KEY || process.env.RAG_API_KEY || "").trim();

  if (!ragBase) return json({ ok: false, message: "RAG_API_BASE puudub serveri keskkonnast." }, 500);
  if (!apiKey) return json({ ok: false, message: "RAG API võti puudub serveri keskkonnast." }, 500);

  // 1) Kustuta RAG-ist (idempotent: 404 = OK)
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), RAG_TIMEOUT_MS);

    const res = await fetch(`${ragBase}/documents/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: {
        "X-API-Key": apiKey,
        "Accept": "application/json",
      },
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(t);

    if (!res.ok && res.status !== 404) {
      const raw = await res.text().catch(() => "");
      let data = null;
      try { data = raw ? JSON.parse(raw) : null; } catch {}
      const msg = data?.detail || data?.message || `RAG /documents/${id} viga (${res.status})`;
      return json({ ok: false, message: msg, response: data || raw }, 502);
    }
  } catch (err) {
    const msg = err?.name === "AbortError" ? "RAG ühenduse timeout" : (err?.message || String(err));
    return json({ ok: false, message: `RAG ühenduse viga: ${msg}` }, 502);
  }

  // 2) Kustuta lokaalne kirje idempotentselt
  await prisma.ragDocument.deleteMany({ where: { id } });

  return json({ ok: true, deleted: id });
}
