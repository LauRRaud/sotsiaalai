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

async function proxy(req, { params }) {
  if (!RAG_KEY) {
    return new Response(
      JSON.stringify({ ok: false, message: "RAG_SERVICE_API_KEY missing on frontend" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const target = buildTargetUrl(req, params);

  // Koosta päised: X-API-Key alati, Content-Type ainult kui olemas
  const headers = new Headers({ "X-API-Key": RAG_KEY });
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);

  // GET/HEAD ilma body’ta; muidu tõmba binaarne body (töötab ka file uploadiga)
  const body =
    req.method === "GET" || req.method === "HEAD"
      ? undefined
      : await req.arrayBuffer();

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
    });

    // Puhasta päised, mis võivad tekitada topelt-encoding’u
    const responseHeaders = new Headers(res.headers);
    responseHeaders.delete("transfer-encoding");
    responseHeaders.delete("content-encoding");

    // Säilita sisuvoog (stream) — ära loe bufferiks
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
