"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
const MOBILE_QUERY = "(max-width: 768px)";

function resolveDisplayMode() {
  if (typeof window === "undefined") return "browser";
  const isStandalone =
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
    window.matchMedia?.("(display-mode: fullscreen)")?.matches ||
    window.navigator?.standalone === true;
  return isStandalone ? "standalone" : "browser";
}

function resolvePlatform() {
  if (typeof window === "undefined") return "";
  const ua = window.navigator?.userAgent || "";
  const platform = window.navigator?.userAgentData?.platform || window.navigator?.platform || "";
  const normalized = `${platform} ${ua}`.toLowerCase();
  if (/android/.test(normalized)) return "android";
  if (/iphone|ipad|ipod|ios/.test(normalized)) return "ios";
  return "other";
}

function applyLayoutFlag(matches) {
  const root = document.documentElement;
  const body = document.body;
  if (!root || !body) return;
  if (matches) {
    root.setAttribute("data-layout", "mobile");
    body.setAttribute("data-layout", "mobile");
  } else {
    root.removeAttribute("data-layout");
    body.removeAttribute("data-layout");
  }
}

function applyDisplayModeFlag({ isMobile = false, pathname = "" } = {}) {
  const root = document.documentElement;
  const body = document.body;
  if (!root || !body) return;
  const mode = isMobile && pathname === "/" ? "standalone" : resolveDisplayMode();
  root.setAttribute("data-display-mode", mode);
  body.setAttribute("data-display-mode", mode);
}

function applyPlatformFlag() {
  const root = document.documentElement;
  const body = document.body;
  if (!root || !body) return;
  const platform = resolvePlatform();
  if (platform) {
    root.setAttribute("data-platform", platform);
    body.setAttribute("data-platform", platform);
    return;
  }
  root.removeAttribute("data-platform");
  body.removeAttribute("data-platform");
}

function applyVhVar() {
  if (typeof window === "undefined") return;
  const root = document.documentElement;
  if (!root) return;
  const vv = window.visualViewport;
  const height = vv ? vv.height : window.innerHeight;
  const vh = height * 0.01;
  if (vh) root.style.setProperty("--vh", `${vh}px`);
  const offsetTop = vv ? vv.offsetTop : 0;
  const rawKeyboard = vv ? window.innerHeight - vv.height - offsetTop : 0;
  const active = document.activeElement;
  const isEditable = !!active && (active.tagName === "TEXTAREA" || active.tagName === "INPUT" || active.isContentEditable);
  const keyboardOffset = isEditable ? Math.max(0, rawKeyboard) : 0;
  root.style.setProperty("--keyboard-offset", `${keyboardOffset}px`);
}
export default function ViewportLayoutSetter() {
  const pathname = usePathname();
  const lastFocusedPathRef = useRef(null);
  const hasFocusedOnceRef = useRef(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(MOBILE_QUERY);
    const standaloneMql = window.matchMedia("(display-mode: standalone)");
    const fullscreenMql = window.matchMedia("(display-mode: fullscreen)");
    applyLayoutFlag(mql.matches);
    applyDisplayModeFlag({ isMobile: mql.matches, pathname });
    applyPlatformFlag();
    applyVhVar();
    const onMqChange = e => applyLayoutFlag(e.matches);
    const onResize = () => {
      window.requestAnimationFrame(() => {
        applyDisplayModeFlag({ isMobile: mql.matches, pathname });
        applyPlatformFlag();
        applyVhVar();
      });
    };
    const onFocusChange = () => {
      window.requestAnimationFrame(() => applyVhVar());
    };
    const onPageShow = () => {
      applyLayoutFlag(mql.matches);
      applyDisplayModeFlag({ isMobile: mql.matches, pathname });
      applyPlatformFlag();
      applyVhVar();
    };
    const onDisplayModeChange = () => {
      applyDisplayModeFlag({ isMobile: mql.matches, pathname });
      applyPlatformFlag();
    };
    mql.addEventListener?.("change", onMqChange);
    standaloneMql.addEventListener?.("change", onDisplayModeChange);
    fullscreenMql.addEventListener?.("change", onDisplayModeChange);
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    window.addEventListener("pageshow", onPageShow);
    window.visualViewport?.addEventListener("resize", onResize);
    window.addEventListener("focusin", onFocusChange);
    window.addEventListener("focusout", onFocusChange);
    return () => {
      mql.removeEventListener?.("change", onMqChange);
      standaloneMql.removeEventListener?.("change", onDisplayModeChange);
      fullscreenMql.removeEventListener?.("change", onDisplayModeChange);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      window.removeEventListener("pageshow", onPageShow);
      window.visualViewport?.removeEventListener("resize", onResize);
      window.removeEventListener("focusin", onFocusChange);
      window.removeEventListener("focusout", onFocusChange);
      applyLayoutFlag(false);
      document.documentElement.removeAttribute("data-display-mode");
      document.body.removeAttribute("data-display-mode");
      document.documentElement.removeAttribute("data-platform");
      document.body.removeAttribute("data-platform");
    };
  }, [pathname]);
  useEffect(() => {
    if (typeof document === "undefined") return;
    const main = document.getElementById("main");
    if (!hasFocusedOnceRef.current) {
      hasFocusedOnceRef.current = true;
      lastFocusedPathRef.current = pathname;
      return;
    }
    const alreadyFocused = document.activeElement === main || lastFocusedPathRef.current === pathname;
    if (!main || alreadyFocused) return;
    lastFocusedPathRef.current = pathname;
    window.requestAnimationFrame(() => {
      try {
        main.focus();
      } catch {}
    });
  }, [pathname]);
  return null;
}
