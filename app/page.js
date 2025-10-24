// app/page.js (juurekülastus → suuna keele prefiksiga teele)
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { normalizeLocale, DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/lib/preferences";

const SUPPORTED_LOCALE_SET = new Set(SUPPORTED_LOCALES);

function pickSupportedLocale(value) {
  const normalized = normalizeLocale(value);
  if (normalized && SUPPORTED_LOCALE_SET.has(normalized)) {
    return normalized;
  }
  return null;
}

function readCookieFromHeader(name, cookieHeader) {
  if (!cookieHeader || typeof cookieHeader !== "string") return null;
  const found = cookieHeader
    .split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith(`${name}=`));
  if (!found) return null;
  const value = found.slice(name.length + 1);
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function parseAcceptLanguage(headerValue) {
  if (!headerValue || typeof headerValue !== "string") {
    return null;
  }

  const candidates = headerValue
    .split(",")
    .map((entry) => entry.split(";")[0]?.trim()?.toLowerCase())
    .filter(Boolean);

  for (const candidate of candidates) {
    const directMatch = pickSupportedLocale(candidate);
    if (directMatch) {
      return directMatch;
    }

    const base = candidate.split("-")[0];
    const baseMatch = pickSupportedLocale(base);
    if (baseMatch) {
      return baseMatch;
    }
  }

  return null;
}

export default async function Page() {
  const h = await headers();

  const cookieHeader = (h.get("cookie") || "").toString();
  const cookieLocale = pickSupportedLocale(readCookieFromHeader("locale", cookieHeader));
  if (cookieLocale) {
    redirect(`/${cookieLocale}`);
  }

  const acceptHeader = (h.get("accept-language") || "").toString();
  const acceptLocale = parseAcceptLanguage(acceptHeader);
  const targetLocale = acceptLocale ?? DEFAULT_LOCALE;

  redirect(`/${targetLocale}`);
}
