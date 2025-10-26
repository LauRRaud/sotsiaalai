const SUPPORTED_LOCALES = ["et", "ru", "en"];
const DEFAULT_LOCALE = "et";

function normalizePathname(pathname = "/") {
  if (!pathname) return "/";
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

export function stripLocaleFromPath(pathname = "/") {
  const normalized = normalizePathname(pathname);
  const stripped = normalized.replace(/^\/(et|ru|en)(?=\/|$)/, "") || "/";
  return stripped === "" ? "/" : stripped;
}

export function localizePath(pathname = "/", locale = DEFAULT_LOCALE) {
  const normalized = normalizePathname(pathname);
  const match = normalized.match(/^[^?#]+/);
  const basePath = match ? match[0] : normalized;
  const suffix = normalized.slice(basePath.length);
  const stripped = stripLocaleFromPath(basePath);
  const targetLocale = SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
  const localized =
    targetLocale === DEFAULT_LOCALE
      ? stripped
      : `/${targetLocale}${stripped === "/" ? "" : stripped}`;
  return `${localized || "/"}${suffix}`;
}

export function buildLocaleAlternates(pathname = "/") {
  const stripped = stripLocaleFromPath(pathname);
  const languages = {};
  for (const locale of SUPPORTED_LOCALES) {
    languages[locale] =
      locale === DEFAULT_LOCALE
        ? stripped
        : `/${locale}${stripped === "/" ? "" : stripped}`;
  }
  return { languages };
}

export const LOCALES = SUPPORTED_LOCALES;
export { DEFAULT_LOCALE };
