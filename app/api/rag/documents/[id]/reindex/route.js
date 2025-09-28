import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/authz";
import { requestReindex } from "@/lib/ragClient";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function makeError(message, status = 400, extras = {}) {
  return NextResponse.json({ ok: false, message, ...extras }, { status });
}

export async function POST(_req, { params }) {
  const session = await auth();
  if (!isAdmin(session)) {
    return makeError("Ligipaas keelatud", 403);
  }

  const docId = params?.id;
  if (!docId) {
    return makeError("ID puudub.");
  }

  const doc = await prisma.ragDocument.findUnique({ where: { id: docId } });
  if (!doc) {
    return makeError("Dokument puudub.", 404);
  }

  const ragResult = await requestReindex(docId);
  if (!ragResult?.ok) {
    await prisma.ragDocument.update({
      where: { id: docId },
      data: {
        status: "FAILED",
        error: ragResult?.message || "RAG server ei vastanud.",
      },
    });
    return makeError(ragResult?.message || "RAG server ei ole saadaval.", ragResult?.status || 502);
  }

  const updated = await prisma.ragDocument.update({
    where: { id: docId },
    data: {
      status: ragResult.data?.status || "PROCESSING",
      error: null,
    },
  });

  return NextResponse.json({ ok: true, doc: updated, rag: ragResult.data });
}
