export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const RAG_HOST = process.env.RAG_INTERNAL_HOST || "127.0.0.1:8000";
const RAG_KEY = process.env.RAG_SERVICE_API_KEY || process.env.RAG_API_KEY || "";

async function proxy(req, { params }) {
  if (!RAG_KEY) {
    return new Response(
      JSON.stringify({ ok: false, message: "RAG_SERVICE_API_KEY missing on frontend" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const incoming = new URL(req.url);
  const subPath = Array.isArray(params?.path) ? params.path.join("/") : "";
  const target = `http://${RAG_HOST}/${subPath}${incoming.search}`;

  const headers = {
    "X-API-Key": RAG_KEY,
  };
  const contentType = req.headers.get("content-type");
  if (contentType) headers["Content-Type"] = contentType;

  const body =
    req.method === "GET" || req.method === "HEAD" ? undefined : await req.arrayBuffer();

  const res = await fetch(target, {
    method: req.method,
    headers,
    body,
    cache: "no-store",
  });

  const responseHeaders = new Headers(res.headers);
  responseHeaders.delete("transfer-encoding");
  responseHeaders.delete("content-encoding");

  return new Response(res.body, {
    status: res.status,
    headers: responseHeaders,
  });
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
