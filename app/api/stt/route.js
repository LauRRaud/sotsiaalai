import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const STT_URL = process.env.STT_SERVER_URL;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_STT_MODEL = process.env.OPENAI_STT_MODEL || "whisper-1";

function normalizeLanguage(locale) {
  const base = String(locale || "").toLowerCase().split("-")[0].trim();
  if (!base || base === "auto") return undefined;
  if (base.length === 2) return base;
  return undefined;
}

export async function POST(req) {
  if (!STT_URL && !OPENAI_API_KEY) {
    return NextResponse.json({ ok: false, message: "STT teenus pole konfigureeritud." }, { status: 503 });
  }

  let form;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, message: "Kehtetu päring." }, { status: 400 });
  }

  const file = form.get("audio");
  const locale = form.get("locale") || "auto";

  if (!file) {
    return NextResponse.json({ ok: false, message: "Audio puudub." }, { status: 400 });
  }

  // 1) eelista eraldi STT serverit, kui on seadistatud
  if (STT_URL) {
    try {
      const fd = new FormData();
      fd.append("audio", file, file.name || "audio.webm");
      fd.append("locale", locale);

      const res = await fetch(STT_URL, { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false || !data?.text) {
        throw new Error(data?.message || "Kõne tekstiks teisendamine ebaõnnestus.");
      }
      return NextResponse.json({
        ok: true,
        text: data.text,
        language: data.language || locale,
        provider: "external",
      });
    } catch (err) {
      return NextResponse.json({ ok: false, message: err?.message || "STT teenuse viga." }, { status: 502 });
    }
  }

  // 2) fallback OpenAI STT peale
  try {
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey: OPENAI_API_KEY });
    const language = normalizeLanguage(locale);
    const transcription = await client.audio.transcriptions.create({
      file,
      model: OPENAI_STT_MODEL,
      response_format: "json",
      ...(language ? { language } : {}),
    });
    const text = String(transcription?.text || "").trim();
    if (!text) throw new Error("Kõne tekstiks teisendamine ebaõnnestus.");
    return NextResponse.json({ ok: true, text, language: language || locale, provider: "openai" });
  } catch (err) {
    return NextResponse.json({ ok: false, message: err?.message || "STT teenuse viga." }, { status: 502 });
  }
}
