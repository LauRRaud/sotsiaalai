// app/api/rag/documents/[id]/route.js
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

export async function DELETE(_req, { params }) {
  const session = await getServerSession(authConfig);
  if (!session) return makeError("Logi sisse.", 401);
  if (!isAdmin(session?.user)) return makeError("Pole õigusi.", 403);

  const id = params?.id;
  if (!id) return makeError("ID on kohustuslik.", 400);

  const ragBase = process.env.RAG_API_BASE;
  const apiKey = process.env.RAG_SERVICE_API_KEY || process.env.RAG_API_KEY || "";
  if (!ragBase) return makeError("RAG_API_BASE puudub serveri keskkonnast.", 500);

  // 1) proovi kustutada RAG-ist (idempotentne: 404 = OK)
  try {
    const res = await fetch(`${ragBase}/documents/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { "X-API-Key": apiKey, "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok && res.status !== 404) {
      const raw = await res.text().catch(() => "");
      let data = null;
      try { data = raw ? JSON.parse(raw) : null; } catch {}
      const msg = data?.detail || data?.message || `RAG /documents/${id} viga (${res.status})`;
      return makeError(msg, 502, { response: data || raw });
    }
  } catch (err) {
    return makeError(`RAG ühenduse viga: ${err?.message || String(err)}`, 502);
  }

  // 2) kustuta lokaalne kirje (idempotentne)
  try {
    await prisma.ragDocument.delete({ where: { id } });
  } catch {
    // kui puudus, loeme ka OK-ks
  }

  return NextResponse.json({ ok: true, deleted: id });
}

