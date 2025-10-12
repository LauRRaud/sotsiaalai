// app/api/rag-admin/documents/route.js
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
  return { ok: true };
}

/* ---------- GET ---------- */
export async function GET(req) {
  const auth = await requireAdmin();
  if (!auth.ok) return json({ ok: false, message: auth.message }, auth.status);

  const url = new URL(req.url);
  const limitParam = Number(url.searchParams.get("limit") || 25);
  const limit = Number.isFinite(limitParam)
    ? Math.min(Math.max(limitParam, 1), 100)
    : 25;

  const ragBase = (process.env.RAG_API_BASE || "").trim();
  const apiKey =
    (process.env.RAG_SERVICE_API_KEY || process.env.RAG_API_KEY || "").trim();

  if (!ragBase) return json({ ok: false, message: "RAG_API_BASE puudub serveri keskkonnast." }, 500);
  if (!apiKey) return json({ ok: false, message: "RAG_SERVICE_API_KEY puudub serveri keskkonnast." }, 500);

  const endpoint = `${ragBase.replace(/\/+$/, "")}/documents`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), RAG_TIMEOUT_MS);

    const doFetch = () =>
      fetch(endpoint, {
        headers: {
          "X-API-Key": apiKey,
          "Accept": "application/json",
        },
        cache: "no-store",
        signal: controller.signal,
      });

    let res;
    try {
      res = await doFetch();
    } catch {
      // üks kiire retry
      await new Promise((r) => setTimeout(r, 250));
      res = await doFetch();
    } finally {
      clearTimeout(timeout);
    }

    const raw = await res.text();
    let data = null;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      return json(
        { ok: false, message: "RAG /documents tagastas vigase JSON-i.", raw: raw?.slice?.(0, 300) },
        502
      );
    }

    if (!res.ok) {
      const msg = data?.detail || data?.message || `RAG /documents viga (${res.status})`;
      return json({ ok: false, message: msg }, res.status);
    }

    // Toeta nii [] kui { docs: [] }
    const docs = Array.isArray(data) ? data : Array.isArray(data?.docs) ? data.docs : [];

    // Lisa lihtne status tuletus UI jaoks ja kärbi limiidini
    const out = docs.slice(0, limit).map((d) => {
      let status = d?.chunks && d.chunks > 0 ? "COMPLETED" : "PENDING";
      if (d?.error) status = "FAILED";
      return { ...d, status };
    });

    // tagasta paljas massiiv (UI ootab [])
    return json(out, 200);
  } catch (err) {
    const msg =
      err?.name === "AbortError"
        ? "RAG /documents aegus (timeout)"
        : err?.message || String(err);
    return json({ ok: false, message: `RAG /documents viga: ${msg}` }, 502);
  }
}
