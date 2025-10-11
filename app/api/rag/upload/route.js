// app/api/rag/upload/route.js
import { NextResponse } from "next/server";
import { Buffer } from "node:buffer";
import { randomUUID } from "node:crypto";
import crypto from "node:crypto";
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
const RAG_TIMEOUT_MS = Number(process.env.RAG_TIMEOUT_MS || 30_000);

function makeError(message, status = 400, extras = {}) {
  return NextResponse.json({ ok: false, message, ...extras }, { status });
}

function sanitizeFileName(name) {
  if (!name) return "fail";
  let base = String(name).split(/[\\/]/).pop() || "fail";
  if (base === "." || base === "..") base = "fail";
  const cleaned = base.normalize("NFC").replace(/[^a-zA-Z0-9._-]+/g, "_");
  const trimmed = cleaned.replace(/^_+|_+$/g, "") || "fail";
  // viimane 120 märki ilma negatiivse indeksita
  return trimmed.length > 120 ? trimmed.substring(trimmed.length - 120) : trimmed;
}

function normalizeAudience(value) {
  if (!value) return null;
  const str = String(value).toUpperCase().trim();
  return AUDIENCE_VALUES.has(str) ? str : null;
}

function parseTags(raw) {
  if (!raw) return null;
  try {
    if (typeof raw === "string") {
      if (!raw.trim()) return null;
      if (raw.trim().startsWith("[")) {
        const arr = JSON.parse(raw);
        return Array.isArray(arr) ? arr.map(String).map((s) => s.trim()).filter(Boolean).slice(0, 20) : null;
      }
      return raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 20);
    }
  } catch {
    // ignore parse error – tags stay null
  }
  return null;
}

function parseStringList(raw, max = 10) {
  if (!raw) return [];
  try {
    if (typeof raw === "string") {
      const trimmed = raw.trim();
      if (!trimmed) return [];
      if (trimmed.startsWith("[")) {
        const arr = JSON.parse(trimmed);
        if (Array.isArray(arr)) {
          return arr
            .map((v) => (typeof v === "string" ? v.trim() : ""))
            .filter(Boolean)
            .slice(0, max);
        }
        return [];
      }
      return trimmed
        .split(/[,;\n]/)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, max);
    }
    if (Array.isArray(raw)) {
      return raw
        .map((v) => (typeof v === "string" ? v.trim() : ""))
        .filter(Boolean)
        .slice(0, max);
    }
  } catch {
    return [];
  }
  return [];
}

function parsePages(raw) {
  if (!raw) return [];
  try {
    if (typeof raw === "string") {
      const trimmed = raw.trim();
      if (!trimmed) return [];
      if (trimmed.startsWith("[")) {
        const arr = JSON.parse(trimmed);
        if (Array.isArray(arr)) {
          return arr
            .map((v) => Number(v))
            .filter((n) => Number.isFinite(n))
            .slice(0, 50);
        }
        return [];
      }
      return trimmed
        .split(/[,;\s]+/)
        .map((s) => Number(s))
        .filter((n) => Number.isFinite(n))
        .slice(0, 50);
    }
    if (Array.isArray(raw)) {
      return raw
        .map((v) => Number(v))
        .filter((n) => Number.isFinite(n))
        .slice(0, 50);
    }
  } catch {
    return [];
  }
  return [];
}

function parseYear(raw) {
  if (!raw) return null;
  const year = Number(raw);
  if (!Number.isFinite(year)) return null;
  if (year < 1800 || year > 2100) return null;
  return year;
}

function validateMagicType(buffer, mime) {
  if (!buffer || !Buffer.isBuffer(buffer)) return "Faili sisu ei õnnestunud lugeda.";
  if (TEXT_LIKE_MIME.has(mime) || mime === "application/msword") return null;

  if (mime === "application/pdf") {
    // subarray, mitte slice
    return buffer.subarray(0, 4).toString("utf8") === "%PDF"
      ? null
      : "Fail ei paista olevat kehtiv PDF.";
  }

  if (mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    return buffer.subarray(0, DOCX_SIGNATURE.length).equals(DOCX_SIGNATURE)
      ? null
      : "DOCX fail on vigane või vale tüübiga.";
  }

  return null;
}

export async function POST(req) {
  const t0 = Date.now();

  const session = await getServerSession(authConfig);
  if (!session) return makeError("Pole sisse logitud", 401);
  if (!isAdmin(session?.user)) return makeError("Ligipääs keelatud", 403);

  const form = await req.formData();
  const file = form.get("file");
  if (!file || typeof file.name !== "string") return makeError("Fail puudub või on vigane.");
  if (typeof file.size !== "number" || file.size <= 0) {
    return makeError("Fail on tühi või vigane (0 B).");
  }

  const audience = normalizeAudience(form.get("audience"));
  if (!audience) return makeError("Palun vali sihtgrupp.");

  const safeFileName = sanitizeFileName(file.name);
  const type = file.type || "application/octet-stream";
  const ext = (safeFileName.split(".").pop() || "").toLowerCase();

  // Mime vs laiend – hoiatus (mitte blocker)
  const extOk =
    (type === "application/pdf" && ext === "pdf") ||
    (type === "text/plain" && ext === "txt") ||
    (type === "text/markdown" && (ext === "md" || ext === "markdown")) ||
    (type === "text/html" && (ext === "html" || ext === "htm")) ||
    (type === "application/msword" && ext === "doc") ||
    (type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" && ext === "docx") ||
    // fallback: lubame muu sisu, kui MIME on lubatud ja magic test hiljem kinnitab
    false;

  if (!extOk) {
    console.warn(`[RAG upload] Laiend ei vasta MIME-le: ${safeFileName} (${type})`);
  }

  if (typeof file.size === "number" && file.size > MAX_SIZE_BYTES) {
    const limitMb = Math.round((MAX_SIZE_BYTES / 1024 / 1024) * 10) / 10;
    return makeError(`Fail on liiga suur. Lubatud maksimaalselt ${limitMb} MB.`, 413);
  }
  if (ALLOWED_TYPES.length && !ALLOWED_TYPES.includes(type)) {
    return makeError("Seda failitüüpi ei saa üles laadida RAG andmebaasi.", 415, {
      type,
      allowed: ALLOWED_TYPES,
    });
  }

  const ab = await file.arrayBuffer();
  const buffer = Buffer.from(ab);
  const magicError = validateMagicType(buffer, type);
  if (magicError) return makeError(magicError, 415);

  // meta
  const titleRaw = form.get("title");
  const descriptionRaw = form.get("description");
  const tagsRaw = form.get("tags");
  const authorsRaw = form.get("authors");
  const issueIdRaw = form.get("issueId");
  const issueLabelRaw = form.get("issueLabel");
  const yearRaw = form.get("year");
  const articleIdRaw = form.get("articleId");
  const sectionRaw = form.get("section");
  const pagesRaw = form.get("pages");
  const pageRangeRaw = form.get("pageRange");

  const titleCandidate = (titleRaw && String(titleRaw)) || safeFileName;
  const descCandidate = descriptionRaw ? String(descriptionRaw) : null;

  const title = titleCandidate.trim().substring(0, 255) || safeFileName;
  const description = descCandidate ? descCandidate.trim().substring(0, 2000) : null;
  const tags = parseTags(tagsRaw);
  const authors = parseStringList(authorsRaw, 12);
  const issueId =
    typeof issueIdRaw === "string" ? issueIdRaw.trim().slice(0, 160) : null;
  const issueLabel =
    typeof issueLabelRaw === "string" ? issueLabelRaw.trim().slice(0, 160) : null;
  const year = parseYear(yearRaw);
  const articleId =
    typeof articleIdRaw === "string" ? articleIdRaw.trim().slice(0, 200) : null;
  const section =
    typeof sectionRaw === "string" ? sectionRaw.trim().slice(0, 160) : null;
  const pages = parsePages(pagesRaw);
  const pageRange =
    typeof pageRangeRaw === "string" ? pageRangeRaw.trim().slice(0, 120) : null;

  // sisu hash (idempotentsuse/duplikaadi tuvastamiseks)
  const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");

  // RAG endpoint
  const ragBase = process.env.RAG_API_BASE;
  const apiKey = process.env.RAG_API_KEY || "";
  if (!ragBase) return makeError("RAG_API_BASE puudub serveri keskkonnast.", 500);

  const payload = {
    docId: randomUUID(),
    contentSha256: sha256,
    fileName: safeFileName,
    mimeType: type,
    data: buffer.toString("base64"),
    title,
    description,
    audience,
    ...(Array.isArray(tags) ? { tags } : {}),
    ...(authors.length ? { authors } : {}),
    ...(issueId ? { issueId } : {}),
    ...(issueLabel ? { issueLabel } : {}),
    ...(typeof year === "number" ? { year } : {}),
    ...(articleId ? { articleId } : {}),
    ...(section ? { section } : {}),
    ...(pages.length ? { pages } : {}),
    ...(pageRange ? { pageRange } : {}),
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), RAG_TIMEOUT_MS);

    const doFetch = () =>
      fetch(`${ragBase}/ingest/file`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
        },
        body: JSON.stringify(payload),
        cache: "no-store",
        signal: controller.signal,
      });

    // 1 kiire retry väikese backoffiga
    let res;
    try {
      res = await doFetch();
    } catch (e) {
      await new Promise((r) => setTimeout(r, 300));
      res = await doFetch();
    }

    clearTimeout(timeout);

    // loe vastus turvaliselt
    const raw = await res.text();
    let data = null;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      // kui backend saatis mitte-JSON, paneme selle diagnosti kohta
      data = { raw };
    }

    if (!res.ok) {
      const msg = data?.detail || data?.message || `RAG viga (${res.status})`;
      const status = res.status === 413 ? 413 : res.status === 415 ? 415 : 502;
      const code =
        res.status === 413
          ? "FILE_TOO_LARGE"
          : res.status === 415
          ? "UNSUPPORTED_MIME"
          : "RAG_BACKEND_ERROR";
      console.warn(
        `[RAG upload] FAIL(${status}, ${code}) ${safeFileName} in ${Date.now() - t0}ms: ${msg}`
      );
      return makeError(msg, status, { code, response: data });
    }

    const out = NextResponse.json({
      ok: true,
      doc: {
        id: payload.docId,
        contentSha256: sha256,
        title,
        description,
        tags: Array.isArray(tags) ? tags : undefined,
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

    console.info(`[RAG upload] OK ${safeFileName} in ${Date.now() - t0}ms`);
    return out;
  } catch (err) {
    const message =
      err?.name === "AbortError"
        ? "RAG päring aegus (timeout)."
        : `RAG ühenduse viga: ${err?.message || String(err)}`;
    console.warn(`[RAG upload] FAIL (${safeFileName}) in ${Date.now() - t0}ms: ${message}`);
    return makeError(message, 502);
  }
}
