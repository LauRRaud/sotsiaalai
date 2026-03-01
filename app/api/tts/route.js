import { NextResponse } from "next/server";
import textToSpeech from "@google-cloud/text-to-speech";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth";
import { requireSubscription, resolveSessionRoleState } from "@/lib/authz";
import { logEvent } from "@/lib/chat/logger";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getRequestIpFromRequest } from "@/lib/request-ip";
import { normalizeServerLocale, serverT } from "@/lib/i18n/serverMessages";
import { canSpendMonthlyBudget } from "@/lib/usageBudget";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_TTS_MODEL = process.env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts";
const OPENAI_TTS_VOICE = process.env.OPENAI_TTS_VOICE || "alloy";
const TTS_RATE_LIMIT_WINDOW_MS = Number(process.env.TTS_RATE_LIMIT_WINDOW_MS || 60_000);
const TTS_RATE_LIMIT_MAX = Number(process.env.TTS_RATE_LIMIT_MAX || 30);
const gcpTtsClient = new textToSpeech.TextToSpeechClient();

function pickGoogleVoice(locale) {
  const base = (locale || "et").toLowerCase().split("-")[0];
  if (base === "ru") return { languageCode: "ru-RU", name: "ru-RU-Standard-D" };
  if (base === "en") return { languageCode: "en-US", name: "en-US-Standard-C" };
  return { languageCode: "et-EE", name: "et-EE-Standard-A" };
}

function localeFromRequest(req, fallback = "en") {
  const fromHeader =
    normalizeServerLocale(req.headers.get("x-ui-locale")) ||
    normalizeServerLocale(req.headers.get("x-locale")) ||
    normalizeServerLocale(req.headers.get("accept-language"));
  return fromHeader || fallback;
}

function errorJson(messageKey, status, locale = "en", extras = {}) {
  const translated = serverT(locale, messageKey, undefined, messageKey);
  return NextResponse.json({
    ok: false,
    messageKey,
    message: translated,
    ...extras
  }, {
    status
  });
}

async function synthGoogle({ text, locale }) {
  const [resp] = await gcpTtsClient.synthesizeSpeech({
    input: { text },
    voice: pickGoogleVoice(locale),
    audioConfig: {
      audioEncoding: "MP3",
      speakingRate: 1.0
    }
  });
  if (!resp?.audioContent) {
    return {
      ok: false,
      messageKey: "api.tts.synthesis_failed"
    };
  }
  const audio = resp.audioContent;
  const buf = typeof audio === "string" ? Buffer.from(audio, "base64") : Buffer.from(audio);
  return {
    ok: true,
    audioContent: buf.toString("base64"),
    contentType: "audio/mpeg",
    provider: "google"
  };
}

async function synthOpenAI({ text }) {
  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({
    apiKey: OPENAI_API_KEY
  });
  const speech = await client.audio.speech.create({
    model: OPENAI_TTS_MODEL,
    voice: OPENAI_TTS_VOICE,
    input: text,
    response_format: "mp3",
    speed: 1.0
  });
  const buf = Buffer.from(await speech.arrayBuffer());
  return {
    ok: true,
    audioContent: buf.toString("base64"),
    contentType: "audio/mpeg",
    provider: "openai"
  };
}

export async function POST(req) {
  const uiLocale = localeFromRequest(req);
  const session = await getServerSession(authConfig).catch(() => null);
  if (!session?.user?.id) {
    return errorJson("api.common.unauthorized", 401, uiLocale);
  }

  const roleState = resolveSessionRoleState(session, req.cookies);
  const role = roleState.effectiveRole;
  const gate = await requireSubscription(session, role);
  if (!gate.ok) {
    return NextResponse.json({
      ok: false,
      messageKey: gate.message,
      message: serverT(uiLocale, gate.message, undefined, gate.message),
      redirect: gate.redirect,
      requireSubscription: gate.requireSubscription
    }, {
      status: gate.status
    });
  }

  const ip = getRequestIpFromRequest(req);
  const limit = consumeRateLimit(`tts:${session.user.id}:${ip}`, TTS_RATE_LIMIT_MAX, TTS_RATE_LIMIT_WINDOW_MS);
  if (!limit.allowed) {
    return NextResponse.json({
      ok: false,
      messageKey: "api.tts.rate_limited",
      message: serverT(uiLocale, "api.tts.rate_limited", undefined, "api.tts.rate_limited")
    }, {
      status: 429,
      headers: {
        "Retry-After": String(limit.retryAfterSec)
      }
    });
  }

  const googleEnabled = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const openaiEnabled = !!OPENAI_API_KEY;
  if (!googleEnabled && !openaiEnabled) {
    return errorJson("api.tts.not_configured", 503, uiLocale);
  }

  let payload;
  try {
    payload = await req.json();
  } catch {
    return errorJson("api.common.invalid_request", 400, uiLocale);
  }

  const text = String(payload?.text || "").trim();
  const locale = String(payload?.locale || "et");
  if (!text) return errorJson("api.tts.text_missing", 400, localeFromRequest(req, locale));

  const maxLen = googleEnabled ? 4500 : 4096;
  if (text.length > maxLen) {
    return errorJson("api.tts.text_too_long", 413, localeFromRequest(req, locale), {
      maxLen,
      length: text.length
    });
  }
  const budgetCheck = await canSpendMonthlyBudget(session.user.id, {
    ttsRequests: 1,
    ttsChars: text.length
  });
  if (!budgetCheck.allowed) {
    return errorJson("api.common.monthly_budget_exceeded", 429, localeFromRequest(req, locale), {
      budgetEur: budgetCheck.budgetEur,
      usedEur: budgetCheck.usedEur,
      remainingEur: budgetCheck.remainingEur
    });
  }

  try {
    const result = googleEnabled ? await synthGoogle({ text, locale }) : await synthOpenAI({ text });
    if (!result.ok) {
      return errorJson(result.messageKey || "api.tts.synthesis_failed", 502, localeFromRequest(req, locale));
    }
    await logEvent("tts_request", {
      userId: session.user.id,
      role,
      provider: result.provider || (googleEnabled ? "google" : "openai"),
      locale,
      textLength: text.length
    });
    return NextResponse.json({
      ok: true,
      audioContent: result.audioContent,
      contentType: result.contentType || "audio/mpeg",
      provider: result.provider
    });
  } catch (err) {
    console.error("tts", err);
    return errorJson("api.tts.service_error", 500, localeFromRequest(req, locale));
  }
}
