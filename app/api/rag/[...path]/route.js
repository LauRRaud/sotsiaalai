export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getRequestIpFromRequest } from "@/lib/request-ip";
const RAW_RAG_HOST = (process.env.RAG_INTERNAL_HOST || "127.0.0.1:8000").trim();
const RAG_KEY = (process.env.RAG_SERVICE_API_KEY || process.env.RAG_API_KEY || "").trim();
const RAG_TIMEOUT_MS = Number(process.env.RAG_TIMEOUT_MS || 30_000);
const ALLOW_EXTERNAL = process.env.ALLOW_EXTERNAL_RAG === "1";
const RAG_PROXY_RATE_LIMIT_WINDOW_MS = Number(process.env.RAG_PROXY_RATE_LIMIT_WINDOW_MS || 60_000);
const RAG_PROXY_RATE_LIMIT_MAX = Number(process.env.RAG_PROXY_RATE_LIMIT_MAX || 120);
function normalizeBaseFromHost(host) {
  const trimmed = String(host || "").trim().replace(/\/+$/, "");
  if (!trimmed) return "http://127.0.0.1:8000";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `http://${trimmed}`;
}
function isLocalHostHostPort(hp) {
  return /^(127\.0\.0\.1|localhost|\[?::1\]?)(:\d+)?$/i.test(hp || "");
}
function isLocalBaseUrl(u) {
  try {
    const url = new URL(u);
    const hostport = url.host;
    return isLocalHostHostPort(hostport);
  } catch {
    return false;
  }
}
function buildTargetUrl(req, segmentsInput) {
  const incoming = new URL(req.url);
  const segments = Array.isArray(segmentsInput) ? [...segmentsInput] : [];
  if (segments[0] === "query") segments[0] = "search";
  const subPath = segments.join("/");
  const base = normalizeBaseFromHost(RAW_RAG_HOST).replace(/\/+$/, "");
  const path = ("/" + subPath).replace(/\/{2,}/g, "/");
  return `${base}${path}${incoming.search}`;
}
const HOP_BY_HOP = new Set(["connection", "keep-alive", "proxy-authenticate", "proxy-authorization", "te", "trailer", "upgrade", "transfer-encoding"]);
const SAFE_FORWARD_REQ_HEADERS = ["accept", "accept-language", "content-type", "range", "if-none-match", "if-modified-since", "if-range"];
function requestHasBody(req) {
  if (req.method === "GET" || req.method === "HEAD") return false;
  const cl = req.headers.get("content-length");
  if (cl && Number(cl) === 0) return false;
  return true;
}
async function proxy(req, ctx = {}) {
  const session = await getServerSession(authConfig).catch(() => null);
  if (!session?.user?.id) {
    return new Response(JSON.stringify({
      ok: false,
      message: "Unauthorized."
    }), {
      status: 401,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
  const ip = getRequestIpFromRequest(req);
  const limit = consumeRateLimit(`rag-proxy:${session.user.id}:${ip}`, RAG_PROXY_RATE_LIMIT_MAX, RAG_PROXY_RATE_LIMIT_WINDOW_MS);
  if (!limit.allowed) {
    return new Response(JSON.stringify({
      ok: false,
      message: "Liiga palju RAG päringuid. Proovi hiljem uuesti."
    }), {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(limit.retryAfterSec)
      }
    });
  }
  let resolvedParams = ctx?.params;
  if (resolvedParams && typeof resolvedParams.then === "function") {
    resolvedParams = await resolvedParams;
  }
  const paramSegments = Array.isArray(resolvedParams?.path) ? resolvedParams.path : [];
  if (!RAG_KEY) {
    return new Response(JSON.stringify({
      ok: false,
      message: "RAG_SERVICE_API_KEY missing on frontend"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
  const base = normalizeBaseFromHost(RAW_RAG_HOST);
  if (!ALLOW_EXTERNAL && !isLocalBaseUrl(base)) {
    return new Response(JSON.stringify({
      ok: false,
      message: "RAG_INTERNAL_HOST ei ole localhost. Luba välise hosti kasutus seadistusega ALLOW_EXTERNAL_RAG=1."
    }), {
      status: 503,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
  const target = buildTargetUrl(req, paramSegments);
  const headers = new Headers();
  headers.set("X-API-Key", RAG_KEY);
  for (const name of SAFE_FORWARD_REQ_HEADERS) {
    const v = req.headers.get(name);
    if (v) headers.set(name, v);
  }
  const body = requestHasBody(req) ? req.body : undefined;
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
      ...(body ? {
        duplex: "half"
      } : {})
    });
    const responseHeaders = new Headers();
    res.headers.forEach((val, key) => {
      if (!HOP_BY_HOP.has(key.toLowerCase())) responseHeaders.set(key, val);
    });
    const ctype = (res.headers.get("content-type") || "").toLowerCase();
    if (ctype.includes("text/event-stream")) {
      responseHeaders.set("Cache-Control", "no-cache, no-transform");
      responseHeaders.set("X-Accel-Buffering", "no");
    } else {
      responseHeaders.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
      responseHeaders.set("Pragma", "no-cache");
      responseHeaders.set("Expires", "0");
    }
    return new Response(res.body, {
      status: res.status,
      headers: responseHeaders
    });
  } catch (err) {
    const isAbort = err?.name === "AbortError";
    const msg = isAbort ? "RAG proxy timeout" : err?.message || "RAG proxy error";
    const code = isAbort ? 504 : 502;
    return new Response(JSON.stringify({
      ok: false,
      message: msg
    }), {
      status: code,
      headers: {
        "Content-Type": "application/json"
      }
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
export async function HEAD(req, ctx) {
  return proxy(req, ctx);
}
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,HEAD,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-API-Key, Range, If-None-Match, If-Modified-Since, If-Range, Accept-Language",
      "Access-Control-Max-Age": "600"
    }
  });
}
