import { NextResponse } from "next/server";
import { Buffer } from "node:buffer";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/authz";
import { pushFileToRag } from "@/lib/ragClient";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DEFAULT_MAX_MB = 20;
const MAX_SIZE_BYTES = Number(process.env.RAG_MAX_UPLOAD_MB || DEFAULT_MAX_MB) * 1024 * 1024;
const ALLOWED_TYPES = (process.env.RAG_ALLOWED_MIME || "application/pdf,text/plain,text/markdown,text/html,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document").split(",").map((s) => s.trim()).filter(Boolean);
const AUDIENCE_VALUES = new Set(["SOCIAL_WORKER", "CLIENT", "BOTH"]);
const TEXT_LIKE_MIME = new Set(["text/plain", "text/markdown", "text/html"]);
const DOCX_SIGNATURE = Buffer.from([0x50, 0x4B, 0x03, 0x04]);

function sanitizeFileName(name) {
  if (!name) return "fail";
  const base = String(name).split(/[\\/]/).pop() || "fail";
  const cleaned = base.normalize("NFC").replace(/[^a-zA-Z0-9._-]+/g, "_");
  const trimmed = cleaned.replace(/^_+|_+$/g, "") || "fail";
  return trimmed.slice(-120);
}

function normalizeAudience(value) {
  if (!value) return null;
  const str = String(value).toUpperCase().trim();
  return AUDIENCE_VALUES.has(str) ? str : null;
}

function validateMagicType(buffer, mime) {
  if (!buffer || !Buffer.isBuffer(buffer)) return "Faili sisu ei õnnestunud lugeda.";
  if (TEXT_LIKE_MIME.has(mime) || mime === "application/msword") {
    return null;
  }
  if (mime === "application/pdf") {
    return buffer.slice(0, 4).toString("utf8") === "%PDF" ? null : "Fail ei paista olevat kehtiv PDF.";
  }
  if (mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    return buffer.slice(0, DOCX_SIGNATURE.length).equals(DOCX_SIGNATURE)
      ? null
      : "DOCX fail on vigane või vale tüübiga.";
  }
  return null;
}

function makeError(message, status = 400, extras = {}) {
  return NextResponse.json({ ok: false, message, ...extras }, { status });
}

export async function POST(req) {
  const session = await auth();
  if (!isAdmin(session)) {
    return makeError("Ligipääs keelatud", 403);
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!file || typeof file.name !== "string") {
    return makeError("Fail puudub või on vigane.");
  }

  const audience = normalizeAudience(form.get("audience"));
  if (!audience) {
    return makeError("Palun vali sihtgrupp.");
  }

  const safeFileName = sanitizeFileName(file.name);
  const titleRaw = form.get("title");
  const descriptionRaw = form.get("description");
  const title = String(titleRaw || safeFileName).trim().slice(0, 255) || safeFileName;
  const description = descriptionRaw ? String(descriptionRaw).trim().slice(0, 2000) : null;

  if (typeof file.size === "number" && file.size > MAX_SIZE_BYTES) {
    const limitMb = Math.round((MAX_SIZE_BYTES / 1024 / 1024) * 10) / 10;
    return makeError(`Fail on liiga suur. Lubatud maksimaalselt ${limitMb} MB.`, 413);
  }

  const type = file.type || "application/octet-stream";
  if (ALLOWED_TYPES.length && !ALLOWED_TYPES.includes(type)) {
    return makeError("Seda failitüüpi ei saa üles laadida RAG andmebaasi.", 415, { type });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const magicError = validateMagicType(buffer, type);
  if (magicError) {
    return makeError(magicError, 415);
  }

  const now = new Date();

  const doc = await prisma.ragDocument.create({
    data: {
      title,
      description,
      type: "FILE",
      status: "PENDING",
      fileName: safeFileName,
      mimeType: type,
      fileSize: buffer.length,
      adminId: session?.userId || session?.user?.id || null,
      audience,
      metadata: {
        uploadedAt: now.toISOString(),
        origin: "file",
        audience,
        originalFileName: file.name,
      },
    },
  });

  const ragResult = await pushFileToRag({
    docId: doc.id,
    fileName: safeFileName,
    mimeType: type,
    data: buffer,
    audience,
    title,
    description,
  });

  if (!ragResult?.ok) {
    const failed = await prisma.ragDocument.update({
      where: { id: doc.id },
      data: {
        status: "FAILED",
        error: ragResult?.message || "RAG serveriga ühenduse loomine ebaõnnestus.",
      },
    });
    return makeError(ragResult?.message || "RAG server ei vastanud.", ragResult?.status || 502, { doc: failed });
  }

  const updated = await prisma.ragDocument.update({
    where: { id: doc.id },
    data: {
      status: ragResult.data?.status || "PROCESSING",
      remoteId: ragResult.data?.remoteId || null,
      insertedAt: ragResult.data?.insertedAt ? new Date(ragResult.data.insertedAt) : null,
      error: null,
    },
  });

  return NextResponse.json({ ok: true, doc: updated, rag: ragResult.data });
}
