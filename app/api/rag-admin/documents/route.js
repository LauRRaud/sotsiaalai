// app/api/rag-admin/documents/route.js
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const RAG_TIMEOUT_MS = Number(process.env.RAG_TIMEOUT_MS || 30_000);

/* ---------- utils ---------- */
const NO_STORE = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

function json(data, status = 200) {
  return NextResponse.json(data, { status, headers: NO_STORE });
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

function clampLimit(n, min = 1, max = 100, fallback = 25) {
  const x = Number(n);
  if (!Number.isFinite(x)) return fallback;
  return Math.min(Math.max(x, min), max);
}

function normalizeBase(raw) {
  const t = String(raw || "").trim().replace(/\/+$/, "");
  if (!t) return "";
  return /^https?:\/\//i.test(t) ? t : `http://${t}`;
}

function buildEndpoint(base, limit) {
  const b = normalizeBase(base);
  const qs = new URLSearchParams();
  if (Number.isFinite(limit)) qs.set("limit", String(limit));
  return `${b}/documents${qs.toString() ? `?${qs.toString()}` : ""}`;
}

async function fetchWithRetry(url, { headers, timeoutMs, tries = 2 }) {
  let lastErr;
  for (let i = 0; i < Math.max(1, tries); i++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        method: "GET",
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
        await new Promise((r) => setTimeout(r, 250));
      }
    }
  }
  throw lastErr;
}

/* ---------- GET ---------- */
export async function GET(req) {
  const auth = await requireAdmin();
  if (!auth.ok) return json({ ok: false, message: auth.message }, auth.status);

  const url = new URL(req.url);
  const limit = clampLimit(url.searchParams.get("limit"));

  const ragBase = (process.env.RAG_API_BASE || "").trim();
  const apiKey =
    (process.env.RAG_SERVICE_API_KEY || process.env.RAG_API_KEY || "").trim();

  if (!ragBase) return json({ ok: false, message: "RAG_API_BASE puudub serveri keskkonnast." }, 500);
  if (!apiKey) return json({ ok: false, message: "RAG_SERVICE_API_KEY puudub serveri keskkonnast." }, 500);

  const endpoint = buildEndpoint(ragBase, limit);

  try {
    const res = await fetchWithRetry(endpoint, {
      headers: { "X-API-Key": apiKey, Accept: "application/json" },
      timeoutMs: RAG_TIMEOUT_MS,
      tries: 2,
    });

    const raw = await res.text();
    let data = null;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      return json(
        {
          ok: false,
          message: "RAG /documents tagastas vigase JSON-i.",
          raw: typeof raw === "string" ? raw.slice(0, 400) : null,
        },
        502
      );
    }

    if (!res.ok) {
      const msg = data?.detail || data?.message || `RAG /documents viga (${res.status})`;
      return json({ ok: false, message: msg }, res.status);
    }

    // Toeta nii [] kui { docs: [...] }
    const docs = Array.isArray(data) ? data : Array.isArray(data?.docs) ? data.docs : [];

    // Lisa lihtne status tuletus UI jaoks (kui backend ei anna)
    const out = docs.map((d) => {
      let status = d?.status;
      if (!status) {
        status = d?.error ? "FAILED" : (d?.chunks && d.chunks > 0 ? "COMPLETED" : "PENDING");
      }
      return { ...d, status };
    });

    return json(out, 200);
  } catch (err) {
    const msg =
      err?.name === "AbortError"
        ? "RAG /documents aegus (timeout)"
        : err?.message || String(err);
    return json({ ok: false, message: `RAG /documents viga: ${msg}` }, 502);
  }
}
