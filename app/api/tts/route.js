import { NextResponse } from "next/server";

const GOOGLE_TTS_API_KEY = process.env.GOOGLE_TTS_API_KEY;
const GOOGLE_TTS_ENDPOINT = "https://texttospeech.googleapis.com/v1/text:synthesize";

function pickVoice(locale) {
  const base = (locale || "et").toLowerCase().split("-")[0];
  if (base === "ru") {
    return { languageCode: "ru-RU", name: "ru-RU-Standard-D" };
  }
  if (base === "en") {
    return { languageCode: "en-US", name: "en-US-Standard-C" };
  }
  // default et
  return { languageCode: "et-EE", name: "et-EE-Standard-A" };
}

export async function POST(req) {
  if (!GOOGLE_TTS_API_KEY) {
    return NextResponse.json(
      { ok: false, message: "TTS teenus pole konfigureeritud." },
      { status: 503 },
    );
  }
  let payload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Kehtetu päring." }, { status: 400 });
  }
  const text = String(payload?.text || "").trim();
  const locale = String(payload?.locale || "et");
  if (!text) {
    return NextResponse.json({ ok: false, message: "Tekst puudub." }, { status: 400 });
  }
  if (text.length > 4500) {
    return NextResponse.json(
      { ok: false, message: "Tekst on liiga pikk (max 4500 märki)." },
      { status: 413 },
    );
  }
  const voice = pickVoice(locale);
  const body = {
    input: { text },
    voice,
    audioConfig: {
      audioEncoding: "MP3",
      speakingRate: 1.0,
    },
  };
  try {
    const res = await fetch(`${GOOGLE_TTS_ENDPOINT}?key=${encodeURIComponent(GOOGLE_TTS_API_KEY)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.audioContent) {
      const reason = data?.error?.message || data?.message || "Teksti süntees ebaõnnestus.";
      return NextResponse.json({ ok: false, message: reason }, { status: 502 });
    }
    return NextResponse.json({
      ok: true,
      audioContent: data.audioContent,
      contentType: "audio/mpeg",
    });
  } catch (err) {
    console.error("google-tts", err);
    return NextResponse.json(
      { ok: false, message: "TTS teenuse viga." },
      { status: 500 },
    );
  }
}
