"use client";

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

const I18nContext = createContext(null);

function get(obj, path, fallback) {
  if (!obj) return fallback;
  const parts = String(path).split(".");
  let cur = obj;
  for (const p of parts) {
    if (cur && Object.prototype.hasOwnProperty.call(cur, p)) cur = cur[p];
    else return fallback;
  }
  return cur;
}

export default function I18nProvider({ initialLocale = "et", messages = {}, children }) {
  const [locale, setLocaleState] = useState(initialLocale);
  const [dict, setDict] = useState(messages || {});
  const liveRef = useRef(null);
  const missingKeysRef = useRef(new Set());

  const t = useCallback(
    (key, fallback = "") => {
      const val = get(dict, key, undefined);
      if (val == null) {
        if (process.env.NODE_ENV !== "production" && !missingKeysRef.current.has(key)) {
          missingKeysRef.current.add(key);
          console.warn(`[i18n] missing key: ${key}`);
        }
        return fallback || key;
      }
      return val;
    },
    [dict],
  );

  const announce = useCallback((msg) => {
    const el = liveRef.current;
    if (!el) return;
    el.textContent = "";
    setTimeout(() => { el.textContent = msg; }, 30);
  }, []);

  const setLocale = useCallback(async (nextLocale) => {
    if (!nextLocale || nextLocale === locale) return;
    try {
      document.documentElement.setAttribute("lang", nextLocale);
    } catch {}
    try { localStorage.setItem("NEXT_LOCALE", nextLocale); } catch {}
    try { document.cookie = `NEXT_LOCALE=${encodeURIComponent(nextLocale)}; path=/; max-age=31536000; SameSite=Lax`; } catch {}
    // Client-side load of messages is optional; we rely mainly on refresh/SSR.
    // To avoid a hard dependency, just refresh the route so SSR sends new messages.
    try {
      // next/navigation's useRouter not available here; let caller refresh.
    } catch {}
    setLocaleState(nextLocale);
    // Do not change dict here to avoid bundling dynamic imports; refresh will replace on SSR.
    const languageName = get(dict, `common.languages.${nextLocale}`, nextLocale);
    const template = get(dict, "common.language_changed", "Language changed: {language}");
    announce(template.replace("{language}", languageName));
  }, [locale, dict, announce]);

  const value = useMemo(() => ({ locale, messages: dict, t, setLocale }), [locale, dict, t, setLocale]);

  return (
    <I18nContext.Provider value={value}>
      <div ref={liveRef} aria-live="polite" aria-atomic="true" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }} />
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
