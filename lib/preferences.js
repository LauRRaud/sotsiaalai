// lib/preferences.js
// Ühine utiliit eelistuste (keel + ligipääsetavus) valideerimiseks ja küpsiste haldamiseks.

export const SUPPORTED_LOCALES = ["et", "en", "ru"];
export const DEFAULT_LOCALE = "et";

export const LOCALE_COOKIE = "locale";
export const CONTRAST_COOKIE = "a11y_contrast";
export const FONT_SIZE_COOKIE = "a11y_fs";
export const MOTION_COOKIE = "a11y_motion";
export const ONBOARDING_DONE_COOKIE = "onboarding_done";
export const UPDATED_AT_COOKIE = "a11y_updated_at";

export const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 12 kuud
export const COOKIE_BASE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  path: "/",
  secure: process.env.NODE_ENV === "production",
  maxAge: COOKIE_MAX_AGE_SECONDS,
};

const LOCALE_SET = new Set(SUPPORTED_LOCALES);
const CONTRAST_VALUES = ["normal", "high"];
const CONTRAST_SET = new Set(CONTRAST_VALUES);
const FONT_SIZE_VALUES = ["md", "lg", "xl"];
const FONT_SIZE_SET = new Set(FONT_SIZE_VALUES);
const MOTION_VALUES = ["normal", "reduce"];
const MOTION_SET = new Set(MOTION_VALUES);

export const DEFAULT_PREFERENCES = {
  locale: DEFAULT_LOCALE,
  contrast: "normal",
  fontSize: "md",
  motion: "normal",
};

function getCookieValue(store, name) {
  if (!store) return null;
  if (typeof store.get === "function") {
    return store.get(name)?.value ?? null;
  }
  if (store instanceof Map) {
    return store.get(name) ?? null;
  }
  if (typeof store === "object" && store !== null) {
    return store[name] ?? null;
  }
  return null;
}

export function parseTimestamp(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const date = new Date(trimmed);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isoTimestamp() {
  return new Date().toISOString();
}

export function normalizeLocale(value) {
  if (typeof value !== "string") return null;
  const lower = value.trim().toLowerCase();
  return LOCALE_SET.has(lower) ? lower : null;
}

export function normalizeContrast(value) {
  if (typeof value !== "string") return null;
  const lower = value.trim().toLowerCase();
  return CONTRAST_SET.has(lower) ? lower : null;
}

export function normalizeFontSize(value) {
  if (typeof value !== "string") return null;
  const lower = value.trim().toLowerCase();
  return FONT_SIZE_SET.has(lower) ? lower : null;
}

export function normalizeMotion(value) {
  if (typeof value !== "string") return null;
  const lower = value.trim().toLowerCase();
  return MOTION_SET.has(lower) ? lower : null;
}

export function sanitizeNextPath(nextValue, baseUrl) {
  if (typeof nextValue !== "string") return null;
  const trimmed = nextValue.trim();
  if (!trimmed || trimmed.startsWith("//")) return null;
  if (!trimmed.startsWith("/")) return null;

  try {
    const base = typeof baseUrl === "string" ? baseUrl : String(baseUrl ?? "http://localhost");
    const url = new URL(trimmed, base);
    const baseOrigin = new URL(base).origin;
    if (url.origin !== baseOrigin) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

export function buildRedirectPath(locale, nextPath) {
  const normalizedLocale = normalizeLocale(locale) ?? DEFAULT_LOCALE;
  if (nextPath) return nextPath;
  return `/${normalizedLocale}`;
}

export function preferenceToHtmlAttrs(preferences) {
  const contrast = normalizeContrast(preferences?.contrast) ?? DEFAULT_PREFERENCES.contrast;
  const fontSize = normalizeFontSize(preferences?.fontSize ?? preferences?.fs) ?? DEFAULT_PREFERENCES.fontSize;
  const motion = normalizeMotion(preferences?.motion) ?? DEFAULT_PREFERENCES.motion;

  return {
    lang: normalizeLocale(preferences?.locale) ?? DEFAULT_LOCALE,
    contrast,
    fontSize,
    motion,
  };
}

export function readPreferencesFromCookies(cookieStore) {
  const locale = normalizeLocale(getCookieValue(cookieStore, LOCALE_COOKIE));
  const contrast = normalizeContrast(getCookieValue(cookieStore, CONTRAST_COOKIE));
  const fontSize = normalizeFontSize(getCookieValue(cookieStore, FONT_SIZE_COOKIE));
  const motion = normalizeMotion(getCookieValue(cookieStore, MOTION_COOKIE));
  const updatedAt = parseTimestamp(getCookieValue(cookieStore, UPDATED_AT_COOKIE));

  return {
    locale: locale ?? DEFAULT_LOCALE,
    contrast: contrast ?? DEFAULT_PREFERENCES.contrast,
    fontSize: fontSize ?? DEFAULT_PREFERENCES.fontSize,
    motion: motion ?? DEFAULT_PREFERENCES.motion,
    updatedAt,
  };
}

export function getAllowedPreferences() {
  return {
    locales: [...SUPPORTED_LOCALES],
    contrasts: [...CONTRAST_VALUES],
    fontSizes: [...FONT_SIZE_VALUES],
    motions: [...MOTION_VALUES],
  };
}

export function prismaPreferenceToValues(record) {
  if (!record) return null;
  const locale = normalizeLocale(record.locale);
  const contrast = normalizeContrast(
    typeof record.contrast === "string" ? record.contrast.toLowerCase() : null
  );
  const fontSize = normalizeFontSize(
    typeof record.fontSize === "string" ? record.fontSize.toLowerCase() : null
  );
  const motion = normalizeMotion(
    typeof record.motion === "string" ? record.motion.toLowerCase() : null
  );
  const updatedAt = record.updatedAt ? new Date(record.updatedAt) : null;
  return {
    locale,
    contrast,
    fontSize,
    motion,
    updatedAt,
  };
}

export function pickLatestPreference(cookiePrefs, dbPrefs) {
  if (!dbPrefs) return cookiePrefs;
  if (!cookiePrefs) return dbPrefs;

  const cookieUpdated = cookiePrefs.updatedAt ?? null;
  const dbUpdated = dbPrefs.updatedAt ?? null;

  if (cookieUpdated && dbUpdated) {
    if (dbUpdated > cookieUpdated) return dbPrefs;
    return cookiePrefs;
  }

  if (dbUpdated && !cookieUpdated) return dbPrefs;
  if (cookieUpdated && !dbUpdated) return cookiePrefs;

  return {
    locale: dbPrefs.locale ?? cookiePrefs.locale,
    contrast: dbPrefs.contrast ?? cookiePrefs.contrast,
    fontSize: dbPrefs.fontSize ?? cookiePrefs.fontSize,
    motion: dbPrefs.motion ?? cookiePrefs.motion,
    updatedAt: dbUpdated ?? cookieUpdated ?? null,
  };
}
