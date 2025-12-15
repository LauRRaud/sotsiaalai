import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const GOOGLE_TTS_API_KEY = process.env.GOOGLE_TTS_API_KEY;
const GOOGLE_TTS_ENDPOINT = "https://texttospeech.googleapis.com/v1/text:synthesize";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_TTS_MODEL = process.env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts";
const OPENAI_TTS_VOICE = process.env.OPENAI_TTS_VOICE || "alloy";

function pickGoogleVoice(locale) {
  const base = (locale || "et").toLowerCase().split("-")[0];
  if (base === "ru") return { languageCode: "ru-RU", name: "ru-RU-Standard-D" };
  if (base === "en") return { languageCode: "en-US", name: "en-US-Standard-C" };
  return { languageCode: "et-EE", name: "et-EE-Standard-A" };
}

async function synthGoogle({ text, locale }) {
  const body = {
    input: { text },
    voice: pickGoogleVoice(locale),
    audioConfig: { audioEncoding: "MP3", speakingRate: 1.0 },
  };

  const res = await fetch(`${GOOGLE_TTS_ENDPOINT}?key=${encodeURIComponent(GOOGLE_TTS_API_KEY)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.audioContent) {
    const reason = data?.error?.message || data?.message || "Teksti süntees ebaõnnestus.";
    return { ok: false, message: reason };
  }
  return { ok: true, audioContent: data.audioContent, contentType: "audio/mpeg", provider: "google" };
}

async function synthOpenAI({ text }) {
  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey: OPENAI_API_KEY });
  const speech = await client.audio.speech.create({
    model: OPENAI_TTS_MODEL,
    voice: OPENAI_TTS_VOICE,
    input: text,
    response_format: "mp3",
    speed: 1.0,
  });
  const buf = Buffer.from(await speech.arrayBuffer());
  return { ok: true, audioContent: buf.toString("base64"), contentType: "audio/mpeg", provider: "openai" };
}

export async function POST(req) {
  if (!GOOGLE_TTS_API_KEY && !OPENAI_API_KEY) {
    return NextResponse.json({ ok: false, message: "TTS teenus pole konfigureeritud." }, { status: 503 });
  }

  let payload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Kehtetu päring." }, { status: 400 });
  }

  const text = String(payload?.text || "").trim();
  const locale = String(payload?.locale || "et");

  if (!text) return NextResponse.json({ ok: false, message: "Tekst puudub." }, { status: 400 });

  const maxLen = GOOGLE_TTS_API_KEY ? 4500 : 4096;
  if (text.length > maxLen) {
    return NextResponse.json({ ok: false, message: `Tekst on liiga pikk (max ${maxLen} märki).` }, { status: 413 });
  }

  try {
    const result = GOOGLE_TTS_API_KEY ? await synthGoogle({ text, locale }) : await synthOpenAI({ text });
    if (!result.ok) {
      return NextResponse.json({ ok: false, message: result.message || "TTS ebaõnnestus." }, { status: 502 });
    }
    return NextResponse.json({
      ok: true,
      audioContent: result.audioContent,
      contentType: result.contentType || "audio/mpeg",
      provider: result.provider,
    });
  } catch (err) {
    console.error("tts", err);
    return NextResponse.json({ ok: false, message: "TTS teenuse viga." }, { status: 500 });
  }
}
