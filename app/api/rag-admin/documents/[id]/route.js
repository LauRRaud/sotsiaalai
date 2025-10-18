// app/api/rag-admin/documents/[id]/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const RAG_TIMEOUT_MS = Number(process.env.RAG_TIMEOUT_MS || 15_000);

/* ---------- headers & json helper ---------- */
const NO_STORE = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

function json(data, status = 200) {
  return NextResponse.json(data, { status, headers: NO_STORE });
}

/* ---------- Auth helpers ---------- */
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
  if (!session?.user?.id) return { ok: false, status: 401, message: "Logi sisse." };
  if (!isAdmin) return { ok: false, status: 403, message: "Pole õigusi." };
  return { ok: true, userId: session.user.id };
}

/* ---------- misc utils ---------- */
function isPlausibleId(id) {
  if (!id || typeof id !== "string") return false;
  const s = id.trim();
  return s.length >= 8 && s.length <= 200;
}

function buildRagUrl(base, id) {
  const b = String(base || "").trim().replace(/\/+$/, "");
  return `${b}/documents/${encodeURIComponent(id)}`;
}

async function fetchDeleteWithRetries(url, { headers, timeoutMs, tries = 3 }) {
  let lastErr;
  for (let i = 0; i < Math.max(1, tries); i++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        method: "DELETE",
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
        await new Promise((r) => setTimeout(r, i === 0 ? 150 : 350));
      }
    }
  }
  throw lastErr;
}

/* ---------- DELETE ---------- */
export async function DELETE(_req, { params }) {
  const auth = await requireAdmin();
  if (!auth.ok) return json({ ok: false, message: auth.message }, auth.status);

  const id = params?.id ? String(params.id).trim() : "";
  if (!isPlausibleId(id)) return json({ ok: false, message: "ID on kohustuslik või vigane." }, 400);

  // Leia lokaalne kirje, et saada remoteId
  let existing;
  try {
    existing = await prisma.ragDocument.findUnique({ where: { id } });
  } catch (err) {
    return json(
      { ok: false, message: "Andmebaasi viga dokumendi leidmisel.", error: err?.message },
      500
    );
  }
  if (!existing) return json({ ok: false, message: "Dokument puudub." }, 404);

  const ragId = existing.remoteId ?? id;

  const ragBase = (process.env.RAG_API_BASE || "").trim();
  const apiKey =
    (process.env.RAG_SERVICE_API_KEY || process.env.RAG_API_KEY || "").trim();

  if (!ragBase) return json({ ok: false, message: "RAG_API_BASE puudub serveri keskkonnast." }, 500);
  if (!apiKey) return json({ ok: false, message: "RAG API võti puudub serveri keskkonnast." }, 500);

  // 1) Kustuta RAG-ist (idempotent: 404 = OK)
  const endpoint = buildRagUrl(ragBase, ragId);
  try {
    const res = await fetchDeleteWithRetries(endpoint, {
      headers: { "X-API-Key": apiKey, Accept: "application/json" },
      timeoutMs: RAG_TIMEOUT_MS,
      tries: 3,
    });

    if (!res.ok && res.status !== 404) {
      const raw = await res.text().catch(() => "");
      let data = null;
      try { data = raw ? JSON.parse(raw) : null; } catch {}
      const msg =
        data?.detail ||
        data?.message ||
        `RAG /documents/${ragId} viga (${res.status})`;
      return json({ ok: false, message: msg, response: data || raw }, 502);
    }
  } catch (err) {
    const msg =
      err?.name === "AbortError" ? "RAG ühenduse timeout" : (err?.message || String(err));
    return json({ ok: false, message: `RAG ühenduse viga: ${msg}` }, 502);
  }

  // 2) Kustuta lokaalne kirje idempotentselt
  try {
    await prisma.ragDocument.deleteMany({ where: { id } });
  } catch (err) {
    return json(
      { ok: false, message: "Andmebaasi viga dokumendi kustutamisel", error: err?.message },
      500
    );
  }

  return json({ ok: true, deleted: id, usedRemoteId: ragId !== id ? ragId : null });
}
