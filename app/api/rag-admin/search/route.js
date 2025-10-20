// app/api/rag-admin/search/route.js
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const RAG_TIMEOUT_MS = Number(process.env.RAG_TIMEOUT_MS || 30_000);
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
  return { ok: true, userId: session.user.id };
}

export async function POST(req) {
  const admin = await requireAdmin();
  if (!admin.ok) return json({ ok: false, message: admin.message }, admin.status);

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, message: "Keha peab olema JSON." }, 400);
  }

  if (!body?.query || typeof body.query !== "string") {
    return json({ ok: false, message: "Väli 'query' on kohustuslik (string)." }, 400);
  }

  const ragBase = (process.env.RAG_API_BASE || "").trim().replace(/\/+$/, "");
  const apiKey =
    (process.env.RAG_SERVICE_API_KEY || process.env.RAG_API_KEY || "").trim();

  if (!ragBase) return json({ ok: false, message: "RAG_API_BASE puudub" }, 500);
  if (!apiKey) return json({ ok: false, message: "RAG_SERVICE_API_KEY puudub" }, 500);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), RAG_TIMEOUT_MS);

  try {
    const res = await fetch(`${ragBase}/search`, {
      method: "POST",
      headers: {
        "X-API-Key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: controller.signal,
    });
    const raw = await res.text();
    let data;
    try { data = raw ? JSON.parse(raw) : null; } catch { data = { raw }; }
    if (!res.ok) {
      return json({ ok: false, message: data?.detail || data?.message || "RAG otsing ebaõnnestus", response: data }, 502);
    }
    return json({ ok: true, ...data });
  } catch (err) {
    const msg = err?.name === "AbortError" ? "RAG päring aegus (timeout)." : `RAG ühenduse viga: ${err?.message || String(err)}`;
    return json({ ok: false, message: msg }, 502);
  } finally {
    clearTimeout(timer);
  }
}
