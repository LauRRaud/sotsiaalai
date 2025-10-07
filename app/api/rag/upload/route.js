// app/api/rag/upload/route.js
import { NextResponse } from "next/server";
import { Buffer } from "node:buffer";
import { randomUUID } from "node:crypto";            // ⬅️ lisatud
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth";
import { isAdmin } from "@/lib/authz";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DEFAULT_MAX_MB = 20;
const MAX_SIZE_BYTES =
  Number(process.env.RAG_MAX_UPLOAD_MB || DEFAULT_MAX_MB) * 1024 * 1024;

const ALLOWED_TYPES = (process.env.RAG_ALLOWED_MIME ||
  "application/pdf,text/plain,text/markdown,text/html,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const AUDIENCE_VALUES = new Set(["SOCIAL_WORKER", "CLIENT", "BOTH"]);
const TEXT_LIKE_MIME = new Set(["text/plain", "text/markdown", "text/html"]);
const DOCX_SIGNATURE = Buffer.from([0x50, 0x4b, 0x03, 0x04]);

function makeError(message, status = 400, extras = {}) {
  return NextResponse.json({ ok: false, message, ...extras }, { status });
}
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
  if (TEXT_LIKE_MIME.has(mime) || mime === "application/msword") return null;
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

export async function POST(req) {
  const session = await getServerSession(authConfig);
  if (!session) return makeError("Pole sisse logitud", 401);
  if (!isAdmin(session?.user)) return makeError("Ligipääs keelatud", 403);

  const form = await req.formData();
  const file = form.get("file");
  if (!file || typeof file.name !== "string") return makeError("Fail puudub või on vigane.");

  const audience = normalizeAudience(form.get("audience"));
  if (!audience) return makeError("Palun vali sihtgrupp.");

  const safeFileName = sanitizeFileName(file.name);
  const type = file.type || "application/octet-stream";

  if (typeof file.size === "number" && file.size > MAX_SIZE_BYTES) {
    const limitMb = Math.round((MAX_SIZE_BYTES / 1024 / 1024) * 10) / 10;
    return makeError(`Fail on liiga suur. Lubatud maksimaalselt ${limitMb} MB.`, 413);
  }
  if (ALLOWED_TYPES.length && !ALLOWED_TYPES.includes(type)) {
    return makeError("Seda failitüüpi ei saa üles laadida RAG andmebaasi.", 415, { type });
  }

  const ab = await file.arrayBuffer();
  const buffer = Buffer.from(ab);
  const magicError = validateMagicType(buffer, type);
  if (magicError) return makeError(magicError, 415);

  const titleRaw = form.get("title");
  const descriptionRaw = form.get("description");
  const title = (String(titleRaw || safeFileName).trim().slice(0, 255)) || safeFileName;
  const description = descriptionRaw ? String(descriptionRaw).trim().slice(0, 2000) : null;

  // --- RAG /ingest/file ---
  const ragBase = process.env.RAG_API_BASE;
  const apiKey = process.env.RAG_API_KEY || "";
  if (!ragBase) return makeError("RAG_API_BASE puudub serveri keskkonnast.", 500);

  const payload = {
    docId: randomUUID(),                // ⬅️ UUID siit
    fileName: safeFileName,
    mimeType: type,
    data: buffer.toString("base64"),
    title,
    description,
    audience,
  };

  try {
    const controller = new AbortController();        // ⬅️ timeoutiga
    const timeout = setTimeout(() => controller.abort(), 30_000);

    const res = await fetch(`${ragBase}/ingest/file`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const raw = await res.text();
    const data = raw ? JSON.parse(raw) : null;

    if (!res.ok) {
      const msg = data?.detail || data?.message || `RAG viga (${res.status})`;
      const status = res.status === 413 ? 413 : res.status === 415 ? 415 : 502;
      return makeError(msg, status, { response: data });
    }

    return NextResponse.json({
      ok: true,
      doc: {
        id: payload.docId,
        title,
        description,
        type: "FILE",
        status: "COMPLETED",
        fileName: safeFileName,
        mimeType: type,
        fileSize: buffer.length,
        audience,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        insertedAt: new Date().toISOString(),
        remoteId: payload.docId,
      },
      rag: data,
    });
  } catch (err) {
    const message =
      err?.name === "AbortError"
        ? "RAG päring aegus (timeout)."
        : `RAG ühenduse viga: ${err?.message || String(err)}`;
    return makeError(message, 502);
  }
}
