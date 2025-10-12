// app/api/rag/documents/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth";
import { isAdmin } from "@/lib/authz";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const RAG_TIMEOUT_MS = Number(process.env.RAG_TIMEOUT_MS || 30_000);

function makeError(message, status = 400, extras = {}) {
  return NextResponse.json({ ok: false, message, ...extras }, { status });
}

export async function GET(req) {
  const session = await getServerSession(authConfig);
  if (!session) return makeError("Pole sisse logitud", 401);
  if (!isAdmin(session?.user)) return makeError("Ligipääs keelatud", 403);

  const url = new URL(req.url);
  const limitParam = Number(url.searchParams.get("limit") || 25);
  const limit = Number.isFinite(limitParam)
    ? Math.min(Math.max(limitParam, 1), 100)
    : 25;

  const ragBase = process.env.RAG_API_BASE;
  const apiKey = process.env.RAG_SERVICE_API_KEY || process.env.RAG_API_KEY || "";
  if (!ragBase) return makeError("RAG_API_BASE puudub serveri keskkonnast.", 500);
  if (!apiKey) return makeError("RAG_SERVICE_API_KEY puudub serveri keskkonnast.", 500);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), RAG_TIMEOUT_MS);

    const doFetch = () =>
      fetch(`${ragBase.replace(/\/+$/, "")}/documents`, {
        headers: { "X-API-Key": apiKey },
        cache: "no-store",
        signal: controller.signal,
      });

    let res;
    try {
      res = await doFetch();
    } catch {
      // 1× kiire retry
      await new Promise((r) => setTimeout(r, 250));
      res = await doFetch();
    }

    clearTimeout(timeout);

    const raw = await res.text();
    let data = null;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      return makeError("RAG /documents tagastas vigase JSON-i.", 502, { raw: raw?.slice?.(0, 300) });
    }

    if (!res.ok) {
      const msg = data?.detail || data?.message || `RAG /documents viga (${res.status})`;
      return makeError(msg, res.status);
    }

    // Toeta nii [] kui { docs: [] }
    const docs = Array.isArray(data) ? data : Array.isArray(data?.docs) ? data.docs : [];

    // Lisa UI-le mugav 'status' väli; kärbi limiidini
    const out = docs.slice(0, limit).map((d) => {
      let status = d?.chunks && d.chunks > 0 ? "COMPLETED" : "PENDING";
      if (d?.error) status = "FAILED";
      return { ...d, status };
    });

    // ⚠️ Tagasta paljas massiiv (UI ootab [])
    return NextResponse.json(out);
  } catch (err) {
    const msg = err?.name === "AbortError" ? "RAG /documents aegus (timeout)" : err?.message || String(err);
    return makeError(`RAG /documents viga: ${msg}`, 502);
  }
}
