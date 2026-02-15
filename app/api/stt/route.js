import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getRequestIpFromRequest } from "@/lib/request-ip";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const STT_URL = process.env.STT_SERVER_URL;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_STT_MODEL = process.env.OPENAI_STT_MODEL || "gpt-4o-mini-transcribe";
const STT_RATE_LIMIT_WINDOW_MS = Number(process.env.STT_RATE_LIMIT_WINDOW_MS || 60_000);
const STT_RATE_LIMIT_MAX = Number(process.env.STT_RATE_LIMIT_MAX || 20);

function normalizeLanguage(locale) {
  const base = String(locale || "").toLowerCase().split("-")[0].trim();
  if (!base || base === "auto") return undefined;
  if (base.length === 2) return base;
  return undefined;
}

function errorJson(messageKey, status, extras = {}) {
  return NextResponse.json({
    ok: false,
    messageKey,
    message: messageKey,
    ...extras
  }, {
    status
  });
}

export async function POST(req) {
  const session = await getServerSession(authConfig).catch(() => null);
  if (!session?.user?.id) {
    return errorJson("api.common.unauthorized", 401);
  }

  const ip = getRequestIpFromRequest(req);
  const limit = consumeRateLimit(`stt:${session.user.id}:${ip}`, STT_RATE_LIMIT_MAX, STT_RATE_LIMIT_WINDOW_MS);
  if (!limit.allowed) {
    return NextResponse.json({
      ok: false,
      messageKey: "api.stt.rate_limited",
      message: "api.stt.rate_limited"
    }, {
      status: 429,
      headers: {
        "Retry-After": String(limit.retryAfterSec)
      }
    });
  }

  if (!STT_URL && !OPENAI_API_KEY) {
    return errorJson("api.stt.not_configured", 503);
  }

  let form;
  try {
    form = await req.formData();
  } catch {
    return errorJson("api.common.invalid_request", 400);
  }

  const file = form.get("audio");
  const locale = form.get("locale") || "auto";
  if (!file) {
    return errorJson("api.stt.audio_missing", 400);
  }

  if (STT_URL) {
    try {
      const fd = new FormData();
      fd.append("audio", file, file.name || "audio.webm");
      fd.append("locale", locale);

      const res = await fetch(STT_URL, {
        method: "POST",
        body: fd
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false || !data?.text) {
        throw new Error(data?.message || "api.stt.transcription_failed");
      }

      return NextResponse.json({
        ok: true,
        text: data.text,
        language: data.language || locale,
        provider: "external"
      });
    } catch (err) {
      return errorJson(err?.message || "api.stt.service_error", 502);
    }
  }

  try {
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({
      apiKey: OPENAI_API_KEY
    });
    const language = normalizeLanguage(locale);
    const transcription = await client.audio.transcriptions.create({
      file,
      model: OPENAI_STT_MODEL,
      response_format: "json",
      ...(language ? { language } : {})
    });
    const text = String(transcription?.text || "").trim();
    if (!text) throw new Error("api.stt.transcription_failed");

    return NextResponse.json({
      ok: true,
      text,
      language: language || locale,
      provider: "openai"
    });
  } catch (err) {
    return errorJson(err?.message || "api.stt.service_error", 502);
  }
}
