// app/api/rag/[...path]/route.js
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/* -------------------- Config -------------------- */

// Sisemine RAG teenus (Uvicorn/FastAPI) — võib olla "127.0.0.1:8000" või "http://127.0.0.1:8000" vms
const RAW_RAG_HOST = (process.env.RAG_INTERNAL_HOST || "127.0.0.1:8000").trim();

// API võti, mis lisatakse X-API-Key päisesse
const RAG_KEY = (process.env.RAG_SERVICE_API_KEY || process.env.RAG_API_KEY || "").trim();

// Proxy timeout (ms)
const RAG_TIMEOUT_MS = Number(process.env.RAG_TIMEOUT_MS || 30_000);

// Lubame väljapoole localhosti ainult, kui admin on nii otsustanud
const ALLOW_EXTERNAL = process.env.ALLOW_EXTERNAL_RAG === "1";

/* -------------------- Utils -------------------- */

function normalizeBaseFromHost(host) {
  // kui antakse täis-URL, kasuta seda; muidu eelda http://
  const trimmed = String(host || "").trim().replace(/\/+$/, "");
  if (!trimmed) return "http://127.0.0.1:8000";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `http://${trimmed}`;
}

function isLocalHostHostPort(hp) {
  // lubame 127.0.0.1, localhost, ::1 (kõik valikulise :port’iga)
  return /^(127\.0\.0\.1|localhost|\[?::1\]?)(:\d+)?$/i.test(hp || "");
}

function isLocalBaseUrl(u) {
  try {
    const url = new URL(u);
    const hostport = url.host; // sisaldab porti kui olemas
    return isLocalHostHostPort(hostport);
  } catch {
    return false;
  }
}

// Väike util, et koostada siht-URL ilma topelt kaldkriipsudeta
function buildTargetUrl(req, params) {
  const incoming = new URL(req.url);
  const segments = Array.isArray(params?.path) ? [...params.path] : [];

  // backward-compat: /api/rag/query -> /search
  if (segments[0] === "query") segments[0] = "search";

  const subPath = segments.join("/");
  const base = normalizeBaseFromHost(RAW_RAG_HOST).replace(/\/+$/, "");
  const path = ("/" + subPath).replace(/\/{2,}/g, "/");
  return `${base}${path}${incoming.search}`;
}

// Hop-by-hop päised, mida ei tohiks edasi kanda
const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "upgrade",
  "transfer-encoding",
]);

// Sissetulevatest päistest, mida võib turvaliselt edasi anda RAG-ile
const SAFE_FORWARD_REQ_HEADERS = [
  "accept",
  "accept-language",
  "content-type",
  "range",
  "if-none-match",
  "if-modified-since",
  "if-range",
];

// Kas päringul on sisuline body (väldi GET/HEAD või Content-Length: 0 juhtudel)
function requestHasBody(req) {
  if (req.method === "GET" || req.method === "HEAD") return false;
  const cl = req.headers.get("content-length");
  if (cl && Number(cl) === 0) return false;
  return true;
}

/* -------------------- Core proxy -------------------- */

async function proxy(req, { params }) {
  // turvaventiilid
  if (!RAG_KEY) {
    return new Response(
      JSON.stringify({ ok: false, message: "RAG_SERVICE_API_KEY missing on frontend" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const base = normalizeBaseFromHost(RAW_RAG_HOST);
  if (!ALLOW_EXTERNAL && !isLocalBaseUrl(base)) {
    return new Response(
      JSON.stringify({
        ok: false,
        message:
          'RAG_INTERNAL_HOST ei ole localhost. Luba välise hosti kasutus seadistusega ALLOW_EXTERNAL_RAG=1.',
      }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  const target = buildTargetUrl(req, params);

  // Koosta päised: alati X-API-Key + ohutud forwarditavad päised
  const headers = new Headers();
  headers.set("X-API-Key", RAG_KEY);

  for (const name of SAFE_FORWARD_REQ_HEADERS) {
    const v = req.headers.get(name);
    if (v) headers.set(name, v);
  }
  // NB: ära forwardi Cookie / Authorization – RAG ei peaks neist sõltuma

  // Streami body otse (sobib ka multipartile)
  const body = requestHasBody(req) ? req.body : undefined;

  // Timeout (AbortController)
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), RAG_TIMEOUT_MS);

  try {
    const res = await fetch(target, {
      method: req.method,
      headers,
      body,
      cache: "no-store",
      redirect: "manual",
      signal: controller.signal,
      // Node fetch: vajalik, kui body on ReadableStream
      // (Next Node runtime toetab seda; brauseris seda ei kasutata)
      duplex: body ? "half" : undefined,
    });

    // Puhasta hop-by-hop päised
    const responseHeaders = new Headers();
    res.headers.forEach((val, key) => {
      if (!HOP_BY_HOP.has(key.toLowerCase())) responseHeaders.set(key, val);
    });

    // SSE-le sobivad päised (ära lase vahekihtidel puskida)
    const ctype = (res.headers.get("content-type") || "").toLowerCase();
    if (ctype.includes("text/event-stream")) {
      responseHeaders.set("Cache-Control", "no-cache, no-transform");
      responseHeaders.set("X-Accel-Buffering", "no");
      // connection keep-alive on hop-by-hop – ei sea seda ise
    } else {
      // Ära lase Nextil/vahekihil response'i cache'ida
      responseHeaders.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
      responseHeaders.set("Pragma", "no-cache");
      responseHeaders.set("Expires", "0");
    }

    // Säilita sisuvoog (stream passthrough)
    return new Response(res.body, { status: res.status, headers: responseHeaders });
  } catch (err) {
    const isAbort = err?.name === "AbortError";
    const msg = isAbort ? "RAG proxy timeout" : (err?.message || "RAG proxy error");
    const code = isAbort ? 504 : 502;
    return new Response(JSON.stringify({ ok: false, message: msg }), {
      status: code,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    clearTimeout(timer);
  }
}

/* -------------------- Route exports -------------------- */

export async function GET(req, ctx)   { return proxy(req, ctx); }
export async function POST(req, ctx)  { return proxy(req, ctx); }
export async function PUT(req, ctx)   { return proxy(req, ctx); }
export async function PATCH(req, ctx) { return proxy(req, ctx); }
export async function DELETE(req, ctx){ return proxy(req, ctx); }
export async function HEAD(req, ctx)  { return proxy(req, ctx); }

// Kasulik CORS/preflight jaoks (kui kunagi vaja)
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,HEAD,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-API-Key, Range, If-None-Match, If-Modified-Since, If-Range, Accept-Language",
      "Access-Control-Max-Age": "600",
    },
  });
}
