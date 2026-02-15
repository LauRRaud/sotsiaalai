export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth";
import { normalizeRole, requireSubscription } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { getAnalyzeLimit, utcDayStart, secondsUntilUtcMidnight } from "@/lib/analyzeQuota";

const MAX_MB = Number(process.env.NEXT_PUBLIC_RAG_MAX_UPLOAD_MB || 50);
const RAW_RAG_HOST = (process.env.RAG_INTERNAL_HOST || "127.0.0.1:8000").trim();
const RAG_KEY = (process.env.RAG_SERVICE_API_KEY || process.env.RAG_API_KEY || "").trim();
const RAG_TIMEOUT_MS = Number(process.env.RAG_TIMEOUT_MS || 30_000);
const ALLOW_EXTERNAL = process.env.ALLOW_EXTERNAL_RAG === "1";
const LOCAL_HOST_RE = /^(127\.0\.0\.1|localhost|\[?::1\]?)(:\d+)?$/i;

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

function errorJson(messageKey, status, extras = {}) {
  return json({
    ok: false,
    messageKey,
    message: messageKey,
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
  const session = await getServerSession(authConfig).catch(() => null);
  if (!session?.user?.id) {
    return errorJson("api.common.unauthorized", 401);
  }

  const pickedRole = String(session.user.role || "CLIENT").toUpperCase();
  const role = normalizeRole(pickedRole);
  const gate = await requireSubscription(session, role);
  if (!gate.ok) {
    return json({
      ok: false,
      messageKey: gate.message,
      message: gate.message,
      redirect: gate.redirect,
      requireSubscription: gate.requireSubscription
    }, gate.status);
  }

  let fd;
  try {
    fd = await request.formData();
  } catch {
    return errorJson("api.chat.analyze.multipart_required", 400);
  }

  const file = fd.get("file");
  if (!file || typeof file === "string") {
    return errorJson("api.chat.analyze.file_required", 400);
  }

  const sizeMB = (file.size || 0) / (1024 * 1024);
  if (sizeMB > MAX_MB) {
    return errorJson("api.chat.analyze.file_too_large", 413, {
      sizeMB: Number(sizeMB.toFixed(1)),
      maxMB: MAX_MB
    });
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
        message: "api.chat.analyze.quota_exceeded"
      }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(retry)
        }
      });
    }

    console.error("[analyze-file] quota check failed:", e);
    return errorJson("api.chat.analyze.quota_check_failed", 503);
  }

  const forward = new FormData();
  forward.append("file", file, file.name || "file");

  const mimeType = fd.get("mimeType");
  if (mimeType && typeof mimeType === "string") {
    forward.append("mimeType", mimeType);
  }

  const maxChunks = fd.get("maxChunks");
  if (maxChunks && typeof maxChunks === "string") {
    forward.append("maxChunks", maxChunks);
  }

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
    return errorJson(e?.message || "api.chat.analyze.service_unavailable", status);
  }
}
