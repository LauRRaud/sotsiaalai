// app/api/rag-admin/upload/route.js
import { NextResponse } from "next/server";
import { Buffer } from "node:buffer";
import { randomUUID } from "node:crypto";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/* ---------- limiidid & tüübid ---------- */
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

/* ---------- no-store päised ---------- */
const NO_STORE = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

/* ---------- auth loader (joondatud teistega) ---------- */
async function getAuthOptions() {
  try {
    const mod = await import("@/pages/api/auth/[...nextauth]");
    return mod.authOptions || mod.default || mod.authConfig;
  } catch {
    try {
      const mod = await import("@/auth");
      return mod.authOptions || mod.default || mod.authConfig;
    } catch {
      return undefined;
    }
  }
}

async function requireAdmin() {
  const { getServerSession } = await import("next-auth/next");
  const authOptions = await getAuthOptions();
  const session = await getServerSession(authOptions);
  const isAdmin =
    !!session?.user?.isAdmin ||
    String(session?.user?.role || "").toUpperCase() === "ADMIN";

  if (!session?.user?.id) return { ok: false, status: 401, message: "Pole sisse logitud" };
  if (!isAdmin) return { ok: false, status: 403, message: "Ligipääs keelatud" };
  return { ok: true, userId: session.user.id, session };
}

/* ---------- utils ---------- */
function makeError(message, status = 400, extras = {}) {
  return NextResponse.json({ ok: false, message, ...extras }, { status, headers: NO_STORE });
}

function sanitizeFileName(name) {
  if (!name) return "fail";
  let base = String(name).split(/[\\/]/).pop() || "fail";
  if (base === "." || base === "..") base = "fail";
  const cleaned = base.normalize("NFC").replace(/[^a-zA-Z0-9._-]+/g, "_");
  const trimmed = cleaned.replace(/^_+|_+$/g, "") || "fail";
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
        return Array.isArray(arr)
          ? arr.map(String).map((s) => s.trim()).filter(Boolean).slice(0, 20)
          : null;
      }
      return raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 20);
    }
  } catch {}
  return null;
}

function parseStringList(raw, max = 12) {
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

function normalizeBase(raw) {
  const t = String(raw || "").trim().replace(/\/+$/, "");
  if (!t) return "";
  return /^https?:\/\//i.test(t) ? t : `http://${t}`;
}

async function fetchWithRetry(url, init, tries = 2, timeoutMs = RAG_TIMEOUT_MS) {
  let lastErr;
  for (let i = 0; i < Math.max(1, tries); i++) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...init, signal: controller.signal });
      clearTimeout(t);
      return res;
    } catch (err) {
      clearTimeout(t);
      lastErr = err;
      if (i < tries - 1) {
        await new Promise((r) => setTimeout(r, 250));
      }
    }
  }
  throw lastErr;
}

/* ---------- route ---------- */
export async function POST(req) {
  const t0 = Date.now();
  const admin = await requireAdmin();
  if (!admin.ok) return makeError(admin.message, admin.status);

  const form = await req.formData();
  const file = form.get("file");
  if (!file || typeof file.name !== "string") return makeError("Fail puudub või on vigane.");
  if (typeof file.size !== "number" || file.size <= 0) {
    return makeError("Fail on tühi või vigane (0 B).");
  }

  const audience = normalizeAudience(form.get("audience"));
  if (!audience) return makeError("Palun vali sihtgrupp.");

  // valikulised ülekirjutused (joondus RAG backendiga)
  const formDocId = (form.get("docId") && String(form.get("docId")).trim()) || null;
  const formFileName = (form.get("fileName") && String(form.get("fileName")).trim()) || null;
  const formMimeType = (form.get("mimeType") && String(form.get("mimeType")).trim()) || null;

  const safeFileName = sanitizeFileName(formFileName || file.name);
  const type = formMimeType || file.type || "application/octet-stream";
  const ext = (safeFileName.split(".").pop() || "").toLowerCase();

  // leebe, aga logime – MIME ↔ laiend
  const extOk =
    (type === "application/pdf" && ext === "pdf") ||
    (type === "text/plain" && ext === "txt") ||
    (type === "text/markdown" && (ext === "md" || ext === "markdown")) ||
    (type === "text/html" && (ext === "html" || ext === "htm")) ||
    (type === "application/msword" && ext === "doc") ||
    (type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" && ext === "docx") ||
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

  /* --- meta --- */
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
  const journalTitleRaw = form.get("journalTitle");

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
  const journalTitle =
    typeof journalTitleRaw === "string" ? journalTitleRaw.trim().slice(0, 255) : null;

  const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");

  const ragBaseRaw = (process.env.RAG_API_BASE || "").trim();
  const ragBase = normalizeBase(ragBaseRaw);
  const apiKey =
    (process.env.RAG_SERVICE_API_KEY || process.env.RAG_API_KEY || "").trim();
  if (!ragBase) return makeError("RAG_API_BASE puudub serveri keskkonnast.", 500);
  if (!apiKey) return makeError("RAG_SERVICE_API_KEY puudub serveri keskkonnast.", 500);

  const remoteDocId = formDocId || randomUUID();

  const payload = {
    docId: remoteDocId,
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
    ...(journalTitle ? { journalTitle } : {}),
  };

  // kanna edasi X-Request-Id / X-Client-Id kui olemas
  const fwdReqId = req.headers.get("x-request-id");
  const fwdClientId = req.headers.get("x-client-id");

  try {
    const base = ragBase.replace(/\/+$/, "");
    const res = await fetchWithRetry(
      `${base}/ingest/file`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-API-Key": apiKey,
          ...(fwdReqId ? { "X-Request-Id": fwdReqId } : {}),
          ...(fwdClientId ? { "X-Client-Id": fwdClientId } : {}),
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      },
      2,
      RAG_TIMEOUT_MS
    );

    const raw = await res.text();
    let data = null;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      data = { raw: typeof raw === "string" ? raw.slice(0, 500) : null };
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

    /* --- lokaalne DB logi (idempotentne kõrvaltvaates) --- */
    let dbDoc = null;
    try {
      const inserted = Number.isFinite(data?.inserted) ? Number(data.inserted) : null;
      const status = inserted && inserted > 0 ? "COMPLETED" : "COMPLETED"; // vajadusel muuda PROCESSING
      const createData = {
        title,
        description,
        type: "FILE",
        status,
        audience,
        fileName: safeFileName,
        mimeType: type,
        fileSize: buffer.length,
        sourceUrl: null,
        remoteId: remoteDocId,
        insertedAt: new Date(),
        metadata: {
          ...data,
          _uploadMeta: {
            authors,
            issueId,
            issueLabel,
            year,
            articleId,
            section,
            pages,
            pageRange,
            journalTitle,
            contentSha256: sha256,
          },
        },
      };
      if (admin.userId) {
        createData.admin = { connect: { id: admin.userId } };
      }
      dbDoc = await prisma.ragDocument.create({ data: createData });
    } catch (e) {
      console.warn("[RAG upload] DB create ebaõnnestus:", e?.message || e);
    }

    console.info(`[RAG upload] OK ${safeFileName} in ${Date.now() - t0}ms`);
    return NextResponse.json(
      {
        ok: true,
        warning: dbDoc
          ? undefined
          : "Dokument indekseeriti, kuid lokaalsesse andmebaasi salvestus ebaõnnestus.",
        doc: {
          id: dbDoc?.id || remoteDocId,
          dbId: dbDoc?.id || null,
          contentSha256: sha256,
          title,
          description,
          tags: Array.isArray(tags) ? tags : undefined,
          type: "FILE",
          status: dbDoc?.status || "COMPLETED",
          fileName: safeFileName,
          mimeType: type,
          fileSize: buffer.length,
          audience,
          createdAt: dbDoc?.createdAt?.toISOString?.() || new Date().toISOString(),
          updatedAt: dbDoc?.updatedAt?.toISOString?.() || new Date().toISOString(),
          insertedAt: dbDoc?.insertedAt?.toISOString?.() || new Date().toISOString(),
          remoteId: remoteDocId,
        },
        rag: data,
      },
      { headers: NO_STORE }
    );
  } catch (err) {
    const message =
      err?.name === "AbortError"
        ? "RAG päring aegus (timeout)."
        : `RAG ühenduse viga: ${err?.message || String(err)}`;
    console.warn(`[RAG upload] FAIL (${safeFileName}) in ${Date.now() - t0}ms: ${message}`);
    return makeError(message, 502);
  }
}
