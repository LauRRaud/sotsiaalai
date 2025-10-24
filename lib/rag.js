// lib/rag.js
// Ühine helper RAG admin route’idele (upload, url, ingest-articles, documents, reindex, delete)

function _trim(s) {
  return String(s || "").trim();
}

function normalizeBase(raw) {
  const t = _trim(raw).replace(/\/+$/, "");
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;

  const lower = t.toLowerCase();
  const isLocal =
    lower.startsWith("localhost") ||
    lower.startsWith("127.") ||
    lower.startsWith("0.0.0.0") ||
    lower.startsWith("[::1") ||
    lower.startsWith("::1");

  return `${isLocal ? "http" : "https"}://${t}`;
}

export function normalizeRagBase(raw) {
  return normalizeBase(raw);
}

/** Leia RAG teenuse baas-URL (toetab sinu .env võtmeid) */
export function getRagBase() {
  // eelistusjärjekord
  const svc = process.env.RAG_SERVICE_URL;
  if (_trim(svc)) return normalizeBase(svc);

  const internal = process.env.RAG_INTERNAL_HOST;
  if (_trim(internal)) return normalizeBase(internal);

  const base = process.env.RAG_API_BASE;
  return normalizeBase(base);
}

/** Tagasta RAG API võti (Next → FastAPI). Eelistab RAG_SERVICE_API_KEY, muidu RAG_API_KEY. */
export function getRagApiKey() {
  const a = _trim(process.env.RAG_SERVICE_API_KEY);
  const b = _trim(process.env.RAG_API_KEY);
  return a || b || "";
}

/** No-store päised (vältida cache’i) */
export const NO_STORE = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

/** JSON vastus Next route’ides (no-store päistega) */
export function json(payload, status = 200, extraHeaders) {
  const { NextResponse } = require("next/server");
  return NextResponse.json(payload, {
    status,
    headers: { ...NO_STORE, ...(extraHeaders || {}) },
  });
}

/** Väike cache authOptions jaoks (väldib topelt-importe) */
let _authOptionsCache;
export async function getAuthOptions() {
  if (_authOptionsCache) return _authOptionsCache;
  try {
    const mod = await import("@/auth");
    _authOptionsCache =
      mod.authOptions || mod.default || mod.authConfig || undefined;
    return _authOptionsCache;
  } catch {
    return undefined;
  }
}

/** Kontrolli, et kasutaja on admin (isAdmin või role=ADMIN) */
export async function requireAdmin() {
  const { getServerSession } = await import("next-auth/next");
  const authOptions = await getAuthOptions();
  const session = await getServerSession(authOptions);

  const isAdmin =
    !!session?.user?.isAdmin || String(session?.user?.role || "").toUpperCase() === "ADMIN";

  if (!session?.user?.id) return { ok: false, status: 401, message: "Pole sisse logitud" };
  if (!isAdmin) return { ok: false, status: 403, message: "Ligipääs keelatud" };

  return { ok: true, userId: session.user.id, session };
}

/** Ohutu fetch koos retry ja timeout'iga (vaikimisi timeout .env RAG_TIMEOUT_MS või 30000ms) */
export async function fetchWithRetry(
  url,
  { method = "GET", headers, timeoutMs, tries = 2, body } = {}
) {
  const to = Number(process.env.RAG_TIMEOUT_MS || 30000);
  const timeout = Number.isFinite(timeoutMs) ? Number(timeoutMs) : to;

  let lastErr;
  for (let i = 0; i < Math.max(1, tries); i++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await fetch(url, {
        method,
        headers,
        body,
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

/** Koosta päised RAG päringuks (lisab X-API-Key + etteantud) */
export function ragHeaders(extra = {}) {
  const key = getRagApiKey();
  const base = {
    "X-API-Key": key,
    Accept: "application/json",
  };
  return { ...base, ...(extra || {}) };
}

/** Võta X-Request-Id päis edasi (kui olemas) */
export function forwardRequestId(req) {
  try {
    return req?.headers?.get?.("x-request-id") || null;
  } catch {
    return null;
  }
}

/** Laadimispiirangud UI/route’ide jaoks */
export function getUploadLimits() {
  const uiMb = Number(process.env.NEXT_PUBLIC_RAG_MAX_UPLOAD_MB || 0);
  const srvMb = Number(process.env.RAG_MAX_UPLOAD_MB || 0);
  return {
    uiMaxMB: uiMb || null,
    serverMaxMB: srvMb || null,
    effectiveMaxMB: srvMb || uiMb || 20,
  };
}

/** Lubatud MIME-de loetelu (server ja/või UI) */
export function getAllowedMime() {
  const serverList = _trim(process.env.RAG_ALLOWED_MIME);
  const uiList = _trim(process.env.NEXT_PUBLIC_RAG_ALLOWED_MIME);
  const raw = serverList || uiList || "";
  const list = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return { list, set: new Set(list), raw };
}

/** Kiire kontroll, et baas ja apiKey on olemas (tagasta {ok:false,...} kui midagi puudu) */
export function requireRagConfig() {
  const base = getRagBase();
  const key = getRagApiKey();
  if (!base)
    return {
      ok: false,
      status: 500,
      message:
        "RAG baas-URL (RAG_API_BASE / RAG_INTERNAL_HOST / RAG_SERVICE_URL) puudub.",
    };
  if (!key)
    return {
      ok: false,
      status: 500,
      message: "RAG API võti (RAG_SERVICE_API_KEY / RAG_API_KEY) puudub.",
    };
  return { ok: true, base, key };
}

/** Ehita absoluutne RAG URL (võtab base .env-ist; kui path on juba absoluutne, tagastab muutmata) */
export function buildRagUrl(pathOrUrl) {
  const p = _trim(pathOrUrl);
  if (!p) return "";
  // Kui juba absoluutne URL:
  if (/^https?:\/\//i.test(p)) return p;
  const base = getRagBase();
  const a = base.replace(/\/+$/, "");
  const b = p.startsWith("/") ? p : `/${p}`;
  return `${a}${b}`;
}

/**
 * Ühine JSON fetch RAG vastu.
 * Kasutus: await ragFetchJson("/parse/issue", { method: "POST", body: JSON.stringify({...}) })
 */
export async function ragFetchJson(pathOrUrl, opts = {}) {
  const cfg = requireRagConfig();
  if (!cfg.ok) {
    const err = new Error(cfg.message);
    err.status = cfg.status;
    throw err;
  }

  const {
    method = "GET",
    headers = {},
    body,
    timeoutMs,
    tries = 2,
    req, // Next Request (valikuline) – et forwardida X-Request-Id
  } = opts;

  const url = buildRagUrl(pathOrUrl);
  const fwdReqId = req ? forwardRequestId(req) : null;

  const res = await fetchWithRetry(url, {
    method,
    headers: ragHeaders({
      "Content-Type": "application/json",
      ...headers,
      ...(fwdReqId ? { "X-Request-Id": fwdReqId } : {}),
    }),
    body,
    timeoutMs,
    tries,
  });

  const raw = await res.text().catch(() => "");
  let data = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = { raw: typeof raw === "string" ? raw.slice(0, 2000) : null };
  }

  if (!res.ok) {
    const msg = data?.detail || data?.message || `RAG viga (${res.status})`;
    const e = new Error(msg);
    e.status = res.status;
    e.response = data;
    throw e;
  }
  return data;
}
