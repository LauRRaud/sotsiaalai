"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import AccessibilityModal from "./AccessibilityModal";
import { useI18n } from "@/components/i18n/I18nProvider";
const A11yContext = createContext(null);
const DEFAULT_PREFS = {
  textScale: "md", // sm | md | lg | xl
  contrast: "normal", // normal | hc
  reduceMotion: false, // true | false
  theme: "dark", // dark | light
};
function getCookie(name) {
  if (typeof document === "undefined") return null;
  const v = document.cookie.split("; ").find((row) => row.startsWith(name + "="));
  return v ? decodeURIComponent(v.split("=")[1]) : null;
}
function setCookie(name, value, maxAgeSec = 60 * 60 * 24 * 365) {
  if (typeof document === "undefined") return;
  const encoded = encodeURIComponent(value);
  document.cookie = `${name}=${encoded}; path=/; max-age=${maxAgeSec}; SameSite=Lax`;
}
function readPrefsFromCookie() {
  try {
    const raw = getCookie("a11y_prefs");
    if (!raw) return null;
    const obj = JSON.parse(raw);
    const textScale = obj?.textScale || DEFAULT_PREFS.textScale;
    const contrast = obj?.contrast || DEFAULT_PREFS.contrast;
    const reduceMotion = !!obj?.reduceMotion;
    const theme = obj?.theme === "light" ? "light" : DEFAULT_PREFS.theme;
    return { textScale, contrast, reduceMotion, theme };
  } catch {
    return null;
  }
}
function readInitialPrefsFromDom() {
  if (typeof document === "undefined") return { ...DEFAULT_PREFS };
  const html = document.documentElement;
  let theme = html.classList.contains("theme-light") ? "light" : DEFAULT_PREFS.theme;
  // Prefer localStorage theme if present (align with inline script)
  try {
    const storedTheme = window.localStorage.getItem("theme");
    if (storedTheme === "light" || storedTheme === "dark") {
      theme = storedTheme;
    }
  } catch {}
  const fromDataset = {
    textScale: html.getAttribute("data-text-scale") || DEFAULT_PREFS.textScale,
    contrast: html.getAttribute("data-contrast") || DEFAULT_PREFS.contrast,
    reduceMotion: html.getAttribute("data-reduce-motion") === "1",
    theme,
  };
  // If cookie missing, optionally use system reduced-motion as first hint
  const hasCookie = !!getCookie("a11y_prefs");
  if (!hasCookie) {
    try {
      const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      if (prefersReduced) fromDataset.reduceMotion = true;
    } catch {}
  }
  return fromDataset;
}
function applyPrefsToDom(prefs) {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  html.setAttribute("data-text-scale", prefs.textScale || DEFAULT_PREFS.textScale);
  html.setAttribute("data-contrast", prefs.contrast || DEFAULT_PREFS.contrast);
  html.setAttribute("data-reduce-motion", prefs.reduceMotion ? "1" : "0");
  const forceDark = prefs.contrast === "hc";
  const shouldBeLight = !forceDark && prefs.theme === "light";
  const currentlyLight = html.classList.contains("theme-light");
  if (shouldBeLight !== currentlyLight) {
    html.classList.toggle("theme-light", shouldBeLight);
  }
}
function buildInitialPrefs(initialPrefs) {
  if (initialPrefs) {
    const contrast = initialPrefs.contrast || DEFAULT_PREFS.contrast;
    return {
      ...DEFAULT_PREFS,
      ...initialPrefs,
      contrast,
      theme: contrast === "hc" ? "dark" : (initialPrefs.theme === "light" ? "light" : DEFAULT_PREFS.theme),
    };
  }
  return { ...DEFAULT_PREFS };
}
function AccessibilityProvider({ children, initialPrefs = null }) {
  const [prefs, setPrefsState] = useState(() => buildInitialPrefs(initialPrefs));
  const [open, setOpen] = useState(false);
  const hydratedRef = useRef(false);
  const lastOpenerRef = useRef(null);
  const liveRef = useRef(null);
  const pathname = usePathname();
  const { t } = useI18n();
  const promptedOnceRef = useRef(false);
  const initialIsHomeRef = useRef(pathname === "/");
  // Initialize from DOM and cookie (client-only) to sync after hydration
  useEffect(() => {
    const domPrefs = readInitialPrefsFromDom();
    const cookiePrefs = readPrefsFromCookie();
    const initial = cookiePrefs ? { ...domPrefs, ...cookiePrefs, theme: domPrefs.theme } : domPrefs;
    setPrefsState(initial);
    applyPrefsToDom(initial);
    hydratedRef.current = true;
    // Auto-open only on Home ("/") and only if no cookie yet
    const hasCookie = !!cookiePrefs;
    if (!hasCookie && initialIsHomeRef.current) {
      promptedOnceRef.current = true;
      setTimeout(() => setOpen(true), 50);
    }
  }, []);
  // Re-check on route changes: open on first arrival to Home if no cookie
  useEffect(() => {
    const hasCookie = !!getCookie("a11y_prefs");
    if (!hasCookie && pathname === "/" && !promptedOnceRef.current) {
      promptedOnceRef.current = true;
      setOpen(true);
    }
  }, [pathname]);
  // Re-apply current prefs on route changes to keep attributes persistent
  useEffect(() => {
    if (!hydratedRef.current) return;
    applyPrefsToDom(prefs);
  }, [prefs, pathname]);
  // Sync theme state if it is toggled elsewhere (e.g. Home page switch)
  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const html = document.documentElement;
    const observer = new MutationObserver(() => {
      const domTheme = html.classList.contains("theme-light") ? "light" : "dark";
      setPrefsState((prev) => (prev.theme === domTheme ? prev : { ...prev, theme: domTheme }));
    });
    observer.observe(html, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  const announce = useCallback((msg) => {
    if (!msg) return;
    if (typeof document === "undefined") return;
    const node = liveRef.current;
    if (!node) return;
    node.textContent = "";
    // slight delay forces SR to re-announce
    setTimeout(() => {
      node.textContent = msg;
    }, 50);
  }, []);
  const setPrefs = useCallback((next) => {
    const merged = { ...DEFAULT_PREFS, ...prefs, ...next };
    if (merged.contrast === "hc") {
      merged.theme = "dark";
    }
    setPrefsState(merged);
    applyPrefsToDom(merged);
    try { localStorage.setItem("a11y_prefs", JSON.stringify(merged)); } catch {}
    try { setCookie("a11y_prefs", JSON.stringify(merged)); } catch {}
    try {
      if (merged.theme === "light" || merged.theme === "dark") {
        localStorage.setItem("theme", merged.theme);
      }
    } catch {}
    announce(t("profile.preferences.saved", "Eelistused salvestatud."));
  }, [prefs, announce, t]);
  const previewPrefs = useCallback((partial) => {
    const preview = { ...DEFAULT_PREFS, ...prefs, ...partial };
    if (preview.contrast === "hc") {
      preview.theme = "dark";
    }
    applyPrefsToDom(preview);
  }, [prefs]);
  const resetPreview = useCallback(() => {
    applyPrefsToDom(prefs);
  }, [prefs]);
  const openModal = useCallback(() => {
    try { lastOpenerRef.current = document.activeElement; } catch {}
    setOpen(true);
  }, []);
  const closeModal = useCallback(() => {
    setOpen(false);
    resetPreview();
    // Restore focus back to the element that opened the modal
    setTimeout(() => {
      const el = lastOpenerRef.current;
      if (el && typeof el.focus === "function") {
        try { el.focus(); } catch {}
      }
    }, 0);
  }, [resetPreview]);
  // While modal is open, lock background from SR and interaction
  useEffect(() => {
    if (typeof document === "undefined") return;
    const main = document.getElementById("main");
    const bg = document.querySelector("[data-bg-layer]");
    const body = document.body;
    if (open) {
      if (main) {
        main.setAttribute("aria-hidden", "true");
        // @ts-ignore inert may not exist in all browsers
        main.inert = true;
      }
      if (bg) bg.setAttribute("aria-hidden", "true");
      // body scroll-lock
      const prev = {
        overflow: body.style.overflow,
        position: body.style.position,
        width: body.style.width,
        top: body.style.top,
        touchAction: body.style.touchAction,
      };
      const scrollY = window.scrollY || 0;
      body.dataset.a11yScrollLock = "1";
      body.style.overflow = "hidden";
      body.style.position = "fixed";
      body.style.top = `-${scrollY}px`;
      body.style.width = "100%";
      body.style.touchAction = "none";
      return () => {
        if (main) {
          main.removeAttribute("aria-hidden");
          // @ts-ignore
          main.inert = false;
        }
        if (bg) bg.removeAttribute("aria-hidden");
        // restore body styles
        if (body.dataset.a11yScrollLock) {
          delete body.dataset.a11yScrollLock;
          body.style.overflow = prev.overflow;
          body.style.position = prev.position;
          body.style.width = prev.width;
          body.style.top = prev.top;
          body.style.touchAction = prev.touchAction;
          const y = Math.max(0, scrollY);
          window.scrollTo(0, y);
        }
      };
    }
  }, [open]);
  const value = useMemo(() => ({
    prefs,
    setPrefs,
    openModal,
    closeModal,
    isModalOpen: open,
    announce,
  }), [prefs, setPrefs, openModal, closeModal, open, announce]);
  return (
    <A11yContext.Provider value={value}>
      {/* Püsiv "polite" live region väljade/teadete kuulutamiseks */}
      <div aria-live="polite" aria-atomic="true" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }} ref={liveRef} />
      {/* Ujuvat nuppu ei renderda enam üldlehtedel; nupp lisatakse eraldi profiili lehel */}
      {children}
      {/* Modaal: SSR-i väliselt, kliendis */}
      {open && (
        <AccessibilityModal
          onClose={closeModal}
          prefs={prefs}
          onSave={setPrefs}
          onPreview={previewPrefs}
          onPreviewEnd={resetPreview}
        />
      )}
    </A11yContext.Provider>
  );
}
export default AccessibilityProvider;
export function useAccessibility() {
  const ctx = useContext(A11yContext);
  if (!ctx) throw new Error("useAccessibility must be used within AccessibilityProvider");
  return ctx;
}
