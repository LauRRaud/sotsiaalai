// app/api/rag/[...path]/route.js
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Sisemine RAG teenus (Uvicorn/FastAPI)
const RAG_HOST = (process.env.RAG_INTERNAL_HOST || "127.0.0.1:8000").trim();

// API võti, mis lisatakse X-API-Key päisesse
const RAG_KEY =
  (process.env.RAG_SERVICE_API_KEY || process.env.RAG_API_KEY || "").trim();

// Proxy timeout (ms)
const RAG_TIMEOUT_MS = Number(process.env.RAG_TIMEOUT_MS || 30_000);

// Väike util, et koostada siht-URL ilma topelt kaldkriipsudeta
function buildTargetUrl(req, params) {
  const incoming = new URL(req.url);
  const subPath = Array.isArray(params?.path) ? params.path.join("/") : "";
  const base = `http://${RAG_HOST}`.replace(/\/+$/, "");
  const path = `/${subPath}`.replace(/\/{2,}/g, "/");
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

// Valikuline: piirame vaikimisi ainult localhostile
function isLocalHost(host) {
  return /^127\.0\.0\.1(?::\d+)?$/.test(host) || /^localhost(?::\d+)?$/i.test(host);
}
if (!isLocalHost(RAG_HOST) && process.env.ALLOW_EXTERNAL_RAG !== "1") {
  console.warn(
    `[RAG PROXY] RAG_INTERNAL_HOST="${RAG_HOST}" ei ole localhost. Kui see on taotluslik, sea ALLOW_EXTERNAL_RAG=1.`
  );
}

async function proxy(req, { params }) {
  if (!RAG_KEY) {
    return new Response(
      JSON.stringify({ ok: false, message: "RAG_SERVICE_API_KEY missing on frontend" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const target = buildTargetUrl(req, params);

  // Koosta päised: alati X-API-Key, lisaks mõistlik forward (nt Accept/Content-Type/Range)
  const headers = new Headers();
  headers.set("X-API-Key", RAG_KEY);

  const ct = req.headers.get("content-type");
  if (ct) headers.set("Content-Type", ct);

  const accept = req.headers.get("accept");
  if (accept) headers.set("Accept", accept);

  const range = req.headers.get("range");
  if (range) headers.set("Range", range);

  // Streami request-body otse (ei kopeeri mälu; sobib ka failide/MF uploadiks)
  const body = req.method === "GET" || req.method === "HEAD" ? undefined : req.body;

  // Timeoutiga fetch (AbortController)
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
      // Node.js fetchiga on ReadableStream body puhul vajalik:
      duplex: body ? "half" : undefined,
    });

    // Puhasta hop-by-hop päised (jäta Content-Encoding alles — muidu rikume gzip/deflate)
    const responseHeaders = new Headers();
    res.headers.forEach((val, key) => {
      if (!HOP_BY_HOP.has(key.toLowerCase())) responseHeaders.set(key, val);
    });

    // SSE-le sõbralikumad päised (kui applicable)
    const ctype = res.headers.get("content-type") || "";
    if (ctype.includes("text/event-stream")) {
      responseHeaders.set("Cache-Control", "no-cache, no-transform");
      responseHeaders.set("X-Accel-Buffering", "no");
    } else {
      // Üldiselt ei taha proxyd midagi cache'ida
      responseHeaders.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
      responseHeaders.set("Pragma", "no-cache");
      responseHeaders.set("Expires", "0");
    }

    // Säilita sisuvoog (stream)
    return new Response(res.body, {
      status: res.status,
      headers: responseHeaders,
    });
  } catch (err) {
    const msg =
      err?.name === "AbortError"
        ? "RAG proxy timeout"
        : err?.message || "RAG proxy error";
    return new Response(JSON.stringify({ ok: false, message: msg }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(req, ctx) {
  return proxy(req, ctx);
}
export async function POST(req, ctx) {
  return proxy(req, ctx);
}
export async function PUT(req, ctx) {
  return proxy(req, ctx);
}
export async function PATCH(req, ctx) {
  return proxy(req, ctx);
}
export async function DELETE(req, ctx) {
  return proxy(req, ctx);
}
// Kasulik CORS/preflight jaoks (kui kunagi vaja)
export async function HEAD(req, ctx) {
  return proxy(req, ctx);
}
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,HEAD,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
      "Access-Control-Max-Age": "600",
    },
  });
}
