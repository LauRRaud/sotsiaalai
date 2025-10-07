// app/api/rag/documents/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth";
import { isAdmin } from "@/lib/authz";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function makeError(message, status = 400, extras = {}) {
  return NextResponse.json({ ok: false, message, ...extras }, { status });
}

export async function GET(req) {
  const session = await getServerSession(authConfig);
  if (!session) return makeError("Pole sisse logitud", 401);
  if (!isAdmin(session?.user)) return makeError("Ligipääs keelatud", 403);

  // piirang URL-ist (UI saadab ?limit=50)
  const { searchParams } = new URL(req.url);
  const limitParam = Number(searchParams.get("limit") || 25);
  const limit = Number.isNaN(limitParam) ? 25 : Math.min(Math.max(limitParam, 1), 100);

  // RAG baas-URL ja API võti
  const ragBase = process.env.RAG_API_BASE;
  const apiKey = process.env.RAG_API_KEY || "";

  if (!ragBase) {
    return makeError("RAG_API_BASE puudub serveri keskkonnast.", 500);
  }

  try {
    const ragRes = await fetch(`${ragBase}/documents`, {
      headers: { "X-API-Key": apiKey },
      cache: "no-store",
    });

    const raw = await ragRes.text();
    const data = raw ? JSON.parse(raw) : null;

    if (!ragRes.ok) {
      const msg = data?.detail || data?.message || `RAG /documents vastus ${ragRes.status}`;
      return makeError(msg, ragRes.status);
    }

    // toeta nii [] kui {docs: []}; null -> []
    const docs = Array.isArray(data)
      ? data
      : Array.isArray(data?.docs)
      ? data.docs
      : [];

    // Staatuse heuristika:
    // - kui on error, siis FAILED
    // - kui chunks > 0, siis COMPLETED
    // - muidu PENDING
    const withStatus = docs.slice(0, limit).map((d) => {
      let status = d?.chunks && d.chunks > 0 ? "COMPLETED" : "PENDING";
      if (d?.error) status = "FAILED";
      return { ...d, status };
    });

    return NextResponse.json({ ok: true, docs: withStatus });
  } catch (err) {
    return makeError(`RAG /documents viga: ${err?.message || String(err)}`, 502);
  }
}
