// app/api/rag/documents/[id]/reindex/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth";
import { isAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function makeError(message, status = 400, extras = {}) {
  return NextResponse.json({ ok: false, message, ...extras }, { status });
}

export async function POST(_req, { params }) {
  const session = await getServerSession(authConfig);
  if (!session) return makeError("Pole sisse logitud", 401);
  if (!isAdmin(session?.user)) return makeError("Ligipääs keelatud", 403);

  const docId = params?.id;
  if (!docId) return makeError("ID puudub.", 400);

  // Kontrolli, et kirje eksisteerib
  const doc = await prisma.ragDocument.findUnique({ where: { id: docId } });
  if (!doc) return makeError("Dokument puudub.", 404);

  // Märgi kohe PROCESSING (UI saab kohe staatust näha)
  await prisma.ragDocument.update({
    where: { id: docId },
    data: { status: "PROCESSING", error: null },
  });

  const ragBase = process.env.RAG_API_BASE;
  const apiKey = process.env.RAG_API_KEY || "";

  try {
    const res = await fetch(`${ragBase}/documents/${encodeURIComponent(docId)}/reindex`, {
      method: "POST",
      headers: { "X-API-Key": apiKey, "Content-Type": "application/json" },
      cache: "no-store",
    });

    const raw = await res.text();
    const data = raw ? JSON.parse(raw) : null;

    if (!res.ok) {
      // Märgi FAILED, kui RAG kukkus
      await prisma.ragDocument.update({
        where: { id: docId },
        data: { status: "FAILED", error: data?.detail || data?.message || `RAG reindex viga (${res.status})` },
      });
      const msg = data?.detail || data?.message || `RAG reindex viga (${res.status})`;
      return makeError(msg, 502);
    }

    // Võid soovi korral märkida ka lastIngested'i
    await prisma.ragDocument.update({
      where: { id: docId },
      data: { /* status jääb PROCESSING; RAG töötleb veel */ },
    });

    // RAG tagastab { ok, inserted, doc }, peegeldame edasi
    return NextResponse.json({ ok: true, ...(data || {}), doc: { id: docId, status: "PROCESSING" } });
  } catch (err) {
    // Märgi FAILED, kui võrguviga
    await prisma.ragDocument.update({
      where: { id: docId },
      data: { status: "FAILED", error: err?.message || "RAG ühenduse viga" },
    });
    return makeError(`RAG ühenduse viga: ${err?.message || String(err)}`, 502);
  }
}
