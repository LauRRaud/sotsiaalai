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

  // 0) Kontrolli, et dokument on olemas
  const doc = await prisma.ragDocument.findUnique({ where: { id: docId } });
  if (!doc) return makeError("Dokument puudub.", 404);

  // 1) Märgi DB-s PROCESSING (UI saab kohe)
  await prisma.ragDocument.update({
    where: { id: docId },
    data: { status: "PROCESSING", error: null },
  });

  const ragBase = process.env.RAG_API_BASE;
  const apiKey = process.env.RAG_SERVICE_API_KEY || process.env.RAG_API_KEY || "";
  if (!ragBase) return makeError("RAG_API_BASE puudub serveri keskkonnast.", 500);

  try {
    const res = await fetch(`${ragBase}/documents/${encodeURIComponent(docId)}/reindex`, {
      method: "POST",
      headers: { "X-API-Key": apiKey, "Content-Type": "application/json" },
      cache: "no-store",
    });

    const raw = await res.text().catch(() => "");
    let data = null;
    try { data = raw ? JSON.parse(raw) : null; } catch { data = { raw }; }

    if (!res.ok) {
      const msg = data?.detail || data?.message || `RAG reindex viga (${res.status})`;
      await prisma.ragDocument.update({
        where: { id: docId },
        data: { status: "FAILED", error: msg },
      });
      return makeError(msg, 502, { response: data });
    }

    // Kui RAG vastus annab koheselt teada, et tükid valmis, võime märkida COMPLETED.
    // Enamasti on see asünk; jätame PROCESSING-ks ja UI saab värskendada /documents kaudu.
    await prisma.ragDocument.update({
      where: { id: docId },
      data: {
        // status: "COMPLETED", // kui tahad optimistlikult kohe lõpetatuks märkida, võta kommentaar maha
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      ok: true,
      doc: { id: docId, status: "PROCESSING" },
      rag: data,
    });
  } catch (err) {
    const msg = `RAG ühenduse viga: ${err?.message || String(err)}`;
    await prisma.ragDocument.update({
      where: { id: docId },
      data: { status: "FAILED", error: msg },
    });
    return makeError(msg, 502);
  }
}

