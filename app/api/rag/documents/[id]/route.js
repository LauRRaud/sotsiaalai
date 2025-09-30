import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";
import { deleteRagDocument } from "@/lib/ragClient";

export async function DELETE(_req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ ok: false, message: "Logi sisse." }, { status: 401 });
  }
  const isAdmin =
    session.user?.isAdmin === true ||
    String(session.user?.role || "").toUpperCase() === "ADMIN";
  if (!isAdmin) {
    return NextResponse.json({ ok: false, message: "Pole õigusi." }, { status: 403 });
  }

  const id = params?.id;
  if (!id) return NextResponse.json({ ok: false, message: "ID on kohustuslik." }, { status: 400 });

  // kontrolli, et kirje on olemas
  const doc = await prisma.ragDocument.findUnique({ where: { id } });
  if (!doc) {
    return NextResponse.json({ ok: false, message: "Dokumenti ei leitud." }, { status: 404 });
  }

  // Kui hetkel PROCESSING, võid kas keelata või lubada “force” kustutamise.
  if (doc.status === "PROCESSING") {
    // vali kumb strateegia:
    // return NextResponse.json({ ok: false, message: "Dokument on töötlemisel." }, { status: 409 });
    // või lubame kustutada ikkagi — RAG-teenus lihtsalt saab puhastuse käsu.
  }

  // 1) proovi kustutada RAG teenusest
  const rag = await deleteRagDocument(id);
  // kui RAG vastab 404, loeme selleks, et seal juba pole — jätkame
  if (!rag.ok && rag.status !== 404) {
    const msg = rag.message || rag.response?.message || "RAG kustutamine ebaõnnestus";
    return NextResponse.json({ ok: false, message: msg }, { status: 502 });
  }

  // 2) kustuta kirje andmebaasist
  await prisma.ragDocument.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
