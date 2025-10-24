// app/page.js (juurekülastus → suuna keele prefiksiga teele)
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { normalizeLocale, DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/lib/preferences";

// Meta (kuvatakse / lehe kohta)
export const metadata = {
  title: "SotsiaalAI",
  description:
    "SotsiaalAI ühendab killustatud sotsiaalvaldkonna info ja pakub arusaadavat tuge nii spetsialistidele kui eluküsimusega pöördujatele.",
};

// Keele utiliidid
const SUPPORTED_LOCALE_SET = new Set(SUPPORTED_LOCALES);

function pickSupportedLocale(value) {
  const normalized = normalizeLocale(value);
  if (normalized && SUPPORTED_LOCALE_SET.has(normalized)) {
    return normalized;
  }
  return null;
}

// Turvaline Cookie päise parsimine
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

// Accept-Language -> eelistatud supported locale
function parseAcceptLanguage(headerValue) {
  if (!headerValue || typeof headerValue !== "string") return null;

  const candidates = headerValue
    .split(",")
    .map((entry) => entry.split(";")[0]?.trim()?.toLowerCase())
    .filter(Boolean);

  for (const candidate of candidates) {
    const direct = pickSupportedLocale(candidate);
    if (direct) return direct;

    const base = candidate.split("-")[0];
    const baseMatch = pickSupportedLocale(base);
    if (baseMatch) return baseMatch;
  }
  return null;
}

export default function Page() {
  const h = headers();

  // 1) cookie 'locale' → ülimuslik
  const cookieHeader = (h.get("cookie") || "").toString();
  const cookieLocale = pickSupportedLocale(readCookieFromHeader("locale", cookieHeader));
  if (cookieLocale) {
    redirect(`/${cookieLocale}`);
  }

  // 2) Accept-Language → fallback
  const acceptHeader = (h.get("accept-language") || "").toString();
  const acceptLocale = parseAcceptLanguage(acceptHeader);

  // 3) viimane fallback → DEFAULT_LOCALE
  const targetLocale = acceptLocale ?? DEFAULT_LOCALE;

  redirect(`/${targetLocale}`);
}
