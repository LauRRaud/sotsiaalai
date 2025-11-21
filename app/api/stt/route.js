import { NextResponse } from "next/server";

const STT_URL = process.env.STT_SERVER_URL;

export async function POST(req) {
  if (!STT_URL) {
    return NextResponse.json(
      { ok: false, message: "STT teenus pole konfigureeritud." },
      { status: 503 },
    );
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
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, message: err?.message || "STT teenuse viga." },
      { status: 502 },
    );
  }
}
