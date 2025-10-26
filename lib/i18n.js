// lib/i18n.js
import fs from "fs";
import path from "path";

export function getLocaleFromCookies(cookies) {
  const v = cookies?.get?.("NEXT_LOCALE")?.value;
  if (v === "et" || v === "ru" || v === "en") return v;
  return "et";
}

export function getMessagesSync(locale = "et") {
  const root = process.cwd();
  const tryFiles = [
    path.join(root, "messages", `${locale}.json`),
    path.join(root, "messages", locale, "common.json"),
  ];
  for (const f of tryFiles) {
    try {
      if (fs.existsSync(f)) {
        const txt = fs.readFileSync(f, "utf8");
        return JSON.parse(txt);
      }
    } catch {}
  }
  if (locale !== "et") return getMessagesSync("et");
  return {};
}

