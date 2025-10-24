// app/api/rag-admin/documents/[id]/route.js
import { NextResponse } from "next/server";
import { normalizeRagBase } from "@/lib/rag";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const RAG_TIMEOUT_MS = Number(process.env.RAG_TIMEOUT_MS || 15_000);

/* ---------- headers & json helper ---------- */
const NO_STORE = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};
const json = (data, status = 200) =>
  NextResponse.json(data, { status, headers: NO_STORE });

/* ---------- Auth helpers ---------- */
  async function getAuthOptions() {
    try {
      const mod = await import("@/auth");
      return mod.authOptions || mod.default || mod.authConfig;
    } catch {
      return undefined;
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
  const b = normalizeRagBase(base);
  if (!b) return "";
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

  const pathId = params?.id ? String(params.id).trim() : "";
  if (!isPlausibleId(pathId)) {
    return json({ ok: false, message: "ID on kohustuslik või vigane." }, 400);
  }

  const { prisma } = await import("@/lib/prisma");

  // 1) Leia lokaalne kirje id VÕI remoteId järgi (kui on)
  let existing = null;
  try {
    existing = await prisma.ragDocument.findFirst({
      where: { OR: [{ id: pathId }, { remoteId: pathId }] },
    });
  } catch (err) {
    return json(
      { ok: false, message: "Andmebaasi viga dokumendi leidmisel.", error: err?.message },
      500
    );
  }

  // Kui leidus, kasuta remoteId; muidu eelda, et pathId ongi RAG-i ID
  const ragId = existing?.remoteId ?? pathId;

  const ragBaseEnv = (process.env.RAG_API_BASE || "").trim();
  const ragBase = normalizeRagBase(ragBaseEnv);
  const apiKey =
    (process.env.RAG_SERVICE_API_KEY || process.env.RAG_API_KEY || "").trim();

  if (!ragBase) {
    return json({ ok: false, message: "RAG_API_BASE puudub serveri keskkonnast." }, 500);
  }
  if (!apiKey) {
    return json({ ok: false, message: "RAG API võti puudub serveri keskkonnast." }, 500);
  }

  // 2) Kustuta RAG-ist (idempotent: 404 = OK)
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
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {}
      const msg =
        data?.detail || data?.message || `RAG /documents/${ragId} viga (${res.status})`;
      return json({ ok: false, message: msg, response: data || raw }, 502);
    }
  } catch (err) {
    const msg =
      err?.name === "AbortError" ? "RAG ühenduse timeout" : (err?.message || String(err));
    return json({ ok: false, message: `RAG ühenduse viga: ${msg}` }, 502);
  }

  // 3) Kustuta lokaalne kirje idempotentselt (nii id kui remoteId variandid)
  try {
    await prisma.ragDocument.deleteMany({
      where: { OR: [{ id: pathId }, { remoteId: pathId }, { remoteId: ragId }] },
    });
  } catch (err) {
    return json(
      { ok: false, message: "Andmebaasi viga dokumendi kustutamisel", error: err?.message },
      500
    );
  }

  return json({
    ok: true,
    deleted: pathId,
    usedRemoteId: ragId !== pathId ? ragId : null,
    hadLocal: !!existing,
  });
}
