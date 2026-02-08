import { NextResponse } from "next/server";
import textToSpeech from "@google-cloud/text-to-speech";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getRequestIpFromRequest } from "@/lib/request-ip";
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
  if (base === "ru") return {
    languageCode: "ru-RU",
    name: "ru-RU-Standard-D"
  };
  if (base === "en") return {
    languageCode: "en-US",
    name: "en-US-Standard-C"
  };
  return {
    languageCode: "et-EE",
    name: "et-EE-Standard-A"
  };
}
async function synthGoogle({
  text,
  locale
}) {
  const [resp] = await gcpTtsClient.synthesizeSpeech({
    input: {
      text
    },
    voice: pickGoogleVoice(locale),
    audioConfig: {
      audioEncoding: "MP3",
      speakingRate: 1.0
    }
  });
  if (!resp?.audioContent) {
    return {
      ok: false,
      message: "Teksti süntees ebaõnnestus (no audioContent)."
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
async function synthOpenAI({
  text
}) {
  const {
    default: OpenAI
  } = await import("openai");
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
  const session = await getServerSession(authConfig).catch(() => null);
  if (!session?.user?.id) {
    return NextResponse.json({
      ok: false,
      message: "Unauthorized."
    }, {
      status: 401
    });
  }
  const ip = getRequestIpFromRequest(req);
  const limit = consumeRateLimit(`tts:${session.user.id}:${ip}`, TTS_RATE_LIMIT_MAX, TTS_RATE_LIMIT_WINDOW_MS);
  if (!limit.allowed) {
    return NextResponse.json({
      ok: false,
      message: "Liiga palju TTS päringuid. Proovi hiljem uuesti."
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
    return NextResponse.json({
      ok: false,
      message: "TTS teenus pole konfigureeritud."
    }, {
      status: 503
    });
  }
  let payload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({
      ok: false,
      message: "Kehtetu päring."
    }, {
      status: 400
    });
  }
  const text = String(payload?.text || "").trim();
  const locale = String(payload?.locale || "et");
  if (!text) return NextResponse.json({
    ok: false,
    message: "Tekst puudub."
  }, {
    status: 400
  });
  const maxLen = googleEnabled ? 4500 : 4096;
  if (text.length > maxLen) {
    return NextResponse.json({
      ok: false,
      message: `Tekst on liiga pikk (max ${maxLen} märki).`
    }, {
      status: 413
    });
  }
  try {
    const result = googleEnabled ? await synthGoogle({
      text,
      locale
    }) : await synthOpenAI({
      text
    });
    if (!result.ok) {
      return NextResponse.json({
        ok: false,
        message: result.message || "TTS ebaõnnestus."
      }, {
        status: 502
      });
    }
    return NextResponse.json({
      ok: true,
      audioContent: result.audioContent,
      contentType: result.contentType || "audio/mpeg",
      provider: result.provider
    });
  } catch (err) {
    console.error("tts", err);
    return NextResponse.json({
      ok: false,
      message: "TTS teenuse viga."
    }, {
      status: 500
    });
  }
}
