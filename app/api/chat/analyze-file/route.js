export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth";
import { normalizeRole, requireSubscription } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { getAnalyzeLimit, utcDayStart, secondsUntilUtcMidnight } from "@/lib/analyzeQuota";
import { enforceChatRateLimit, readChatRateLimit } from "@/lib/chat-api-rate-limit";
import { normalizeServerLocale, serverT } from "@/lib/i18n/serverMessages";

const MAX_MB = Number(
  process.env.RAG_SERVER_MAX_MB || process.env.RAG_MAX_UPLOAD_MB || process.env.NEXT_PUBLIC_RAG_MAX_UPLOAD_MB || 25
);
const RAW_ALLOWED_MIME = String(
  process.env.RAG_ALLOWED_MIME ||
    process.env.RAG_SERVER_ALLOWED_MIME ||
    process.env.NEXT_PUBLIC_RAG_ALLOWED_MIME ||
    "application/pdf,text/plain,text/markdown,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
);
const ALLOWED_MIME = new Set(
  RAW_ALLOWED_MIME.split(",")
    .map(v => v.trim().toLowerCase())
    .filter(Boolean)
);
const RAW_RAG_HOST = (process.env.RAG_INTERNAL_HOST || "127.0.0.1:8000").trim();
const RAG_KEY = (process.env.RAG_SERVICE_API_KEY || process.env.RAG_API_KEY || "").trim();
const RAG_TIMEOUT_MS = Number(process.env.RAG_TIMEOUT_MS || 30_000);
const ALLOW_EXTERNAL = process.env.ALLOW_EXTERNAL_RAG === "1";
const LOCAL_HOST_RE = /^(127\.0\.0\.1|localhost|\[?::1\]?)(:\d+)?$/i;
const CHAT_RATE_LIMIT_WINDOW_MS = readChatRateLimit(process.env.CHAT_RATE_LIMIT_WINDOW_MS, 60_000, 1000);
const CHAT_ANALYZE_FILE_POST_RATE_LIMIT_MAX = readChatRateLimit(process.env.CHAT_RATE_LIMIT_ANALYZE_FILE_POST_MAX, 15);
const CHAT_ANALYZE_MAX_CHUNKS = readChatRateLimit(process.env.CHAT_ANALYZE_MAX_CHUNKS, 80, 1);

function json(data, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0"
    }
  });
}

function localeFromRequest(req) {
  const url = new URL(req.url);
  const fromQuery = normalizeServerLocale(url.searchParams.get("locale") || url.searchParams.get("lang"));
  if (fromQuery) return fromQuery;
  const fromHeader =
    normalizeServerLocale(req.headers.get("x-ui-locale")) ||
    normalizeServerLocale(req.headers.get("x-locale")) ||
    normalizeServerLocale(req.headers.get("accept-language"));
  return fromHeader || "en";
}

function errorJson(messageKey, status, locale = "en", extras = {}) {
  const translated = serverT(locale, messageKey, undefined, messageKey);
  return json({
    ok: false,
    messageKey,
    message: translated,
    ...extras
  }, status);
}

function normalizeBaseFromHost(host) {
  const trimmed = String(host || "").trim().replace(/\/+$/, "");
  if (!trimmed) return "http://127.0.0.1:8000";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `http://${trimmed}`;
}

function isLocalBaseUrl(url) {
  try {
    const parsed = new URL(url);
    return LOCAL_HOST_RE.test(parsed.host);
  } catch {
    return false;
  }
}

function inferMimeFromFileName(fileName) {
  const name = String(fileName || "").trim().toLowerCase();
  if (!name) return "";
  if (name.endsWith(".pdf")) return "application/pdf";
  if (name.endsWith(".txt")) return "text/plain";
  if (name.endsWith(".md") || name.endsWith(".markdown")) return "text/markdown";
  if (name.endsWith(".html") || name.endsWith(".htm")) return "text/html";
  if (name.endsWith(".docx")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  return "";
}

async function callRagAnalyze(formData) {
  if (!RAG_KEY) throw new Error("api.chat.analyze.rag_key_missing");

  const base = normalizeBaseFromHost(RAW_RAG_HOST);
  if (!ALLOW_EXTERNAL && !isLocalBaseUrl(base)) {
    throw new Error("api.chat.analyze.rag_host_external_denied");
  }

  const headers = new Headers();
  headers.set("X-API-Key", RAG_KEY);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), RAG_TIMEOUT_MS);

  try {
    const res = await fetch(`${base}/analyze`, {
      method: "POST",
      headers,
      body: formData,
      cache: "no-store",
      signal: controller.signal
    });

    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    if (!res.ok) {
      const messageKey = data?.messageKey || data?.message || "api.chat.analyze.rag_service_failed";
      const err = new Error(messageKey);
      err.status = res.status;
      err.payload = data;
      throw err;
    }

    return data || {};
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(request) {
  const locale = localeFromRequest(request);
  const session = await getServerSession(authConfig).catch(() => null);
  if (!session?.user?.id) {
    return errorJson("api.common.unauthorized", 401, locale);
  }
  const rateLimitResponse = enforceChatRateLimit(request, {
    scope: "analyze_file_post",
    userId: session.user.id,
    limit: CHAT_ANALYZE_FILE_POST_RATE_LIMIT_MAX,
    windowMs: CHAT_RATE_LIMIT_WINDOW_MS
  });
  if (rateLimitResponse) return rateLimitResponse;

  const pickedRole = String(session.user.role || "CLIENT").toUpperCase();
  const role = normalizeRole(pickedRole);
  const gate = await requireSubscription(session, role);
  if (!gate.ok) {
    return json({
      ok: false,
      messageKey: gate.message,
      message: serverT(locale, gate.message, undefined, gate.message),
      redirect: gate.redirect,
      requireSubscription: gate.requireSubscription
    }, gate.status);
  }

  let fd;
  try {
    fd = await request.formData();
  } catch {
    return errorJson("api.chat.analyze.multipart_required", 400, locale);
  }

  const file = fd.get("file");
  if (!file || typeof file === "string") {
    return errorJson("api.chat.analyze.file_required", 400, locale);
  }

  const sizeMB = (file.size || 0) / (1024 * 1024);
  if (sizeMB > MAX_MB) {
    return errorJson("api.chat.analyze.file_too_large", 413, locale, {
      sizeMB: Number(sizeMB.toFixed(1)),
      maxMB: MAX_MB
    });
  }

  const mimeTypeRaw = fd.get("mimeType");
  const mimeTypeFromRequest = typeof mimeTypeRaw === "string" ? mimeTypeRaw.trim().toLowerCase() : "";
  const mimeTypeFromFile = String(file?.type || "").trim().toLowerCase();
  const mimeTypeInferred = inferMimeFromFileName(file?.name || "");
  const resolvedMimeType = [mimeTypeFromRequest, mimeTypeFromFile, mimeTypeInferred].find(
    mime => mime && ALLOWED_MIME.has(mime)
  );
  if (!resolvedMimeType) {
    return errorJson("api.chat.analyze.mime_not_allowed", 415, locale);
  }

  const userId = String(session.user.id);
  const day = utcDayStart();
  const isAdmin = !!session.user.isAdmin || pickedRole === "ADMIN";
  const limit = getAnalyzeLimit(role, isAdmin);

  try {
    await prisma.$transaction(async tx => {
      await tx.analyzeUsage.upsert({
        where: { userId_day: { userId, day } },
        create: { userId, day, count: 0 },
        update: {}
      });

      const updated = await tx.analyzeUsage.updateMany({
        where: {
          userId,
          day,
          count: { lt: limit }
        },
        data: {
          count: { increment: 1 }
        }
      });

      if (updated.count === 0) {
        const err = new Error("api.chat.analyze.quota_exceeded");
        err.code = "QUOTA";
        throw err;
      }
    });
  } catch (e) {
    if (e?.code === "QUOTA") {
      const retry = secondsUntilUtcMidnight();
      return new NextResponse(JSON.stringify({
        ok: false,
        messageKey: "api.chat.analyze.quota_exceeded",
        message: serverT(locale, "api.chat.analyze.quota_exceeded", undefined, "api.chat.analyze.quota_exceeded")
      }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(retry)
        }
      });
    }

    console.error("[analyze-file] quota check failed:", e);
    return errorJson("api.chat.analyze.quota_check_failed", 503, locale);
  }

  const forward = new FormData();
  forward.append("file", file, file.name || "file");

  forward.append("mimeType", resolvedMimeType);

  const maxChunksRaw = fd.get("maxChunks");
  let maxChunks = CHAT_ANALYZE_MAX_CHUNKS;
  if (typeof maxChunksRaw === "string" && maxChunksRaw.trim()) {
    const parsed = Number(maxChunksRaw);
    if (Number.isFinite(parsed) && parsed > 0) {
      maxChunks = Math.min(Math.floor(parsed), CHAT_ANALYZE_MAX_CHUNKS);
    }
  }
  forward.append("maxChunks", String(maxChunks));

  try {
    const data = await callRagAnalyze(forward);
    return json({
      ok: true,
      privacy: {
        ephemeral: true,
        noteKey: "api.chat.analyze.privacy_ephemeral"
      },
      ...data
    });
  } catch (e) {
    console.error("[analyze-file] RAG analyze error:", e);
    const status = Number(e?.status) || 502;
    return errorJson(e?.message || "api.chat.analyze.service_unavailable", status, locale);
  }
}
