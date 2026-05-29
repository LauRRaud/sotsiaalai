"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { resolveStableMobileAppHeight } from "@/components/alalehed/chat/mobileViewportUtils";
const MOBILE_QUERY = "(max-width: 768px)";

function detectDisplayMode() {
  if (typeof window === "undefined") return "browser";
  if (window.matchMedia?.("(display-mode: fullscreen)")?.matches) return "fullscreen";
  const isStandalone =
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
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

function applyDisplayModeFlag() {
  const root = document.documentElement;
  const body = document.body;
  if (!root || !body) return "browser";
  const mode = detectDisplayMode();
  root.setAttribute("data-display-mode", mode);
  body.setAttribute("data-display-mode", mode);
  return mode;
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

function applyVhVar(previousStableLayoutHeight = 0) {
  if (typeof window === "undefined") return;
  const root = document.documentElement;
  if (!root) return previousStableLayoutHeight || 0;
  const vv = window.visualViewport;
  const offsetTop = vv ? vv.offsetTop : 0;
  const rawKeyboard = vv ? window.innerHeight - vv.height - offsetTop : 0;
  const active = document.activeElement;
  const isEditable = !!active && (active.tagName === "TEXTAREA" || active.tagName === "INPUT" || active.isContentEditable);
  const layoutHeight = resolveStableMobileAppHeight({
    windowInnerHeight: window.innerHeight || 0,
    documentElementClientHeight: document.documentElement?.clientHeight || 0,
    visualViewportHeight: vv?.height,
    visualViewportOffsetTop: vv?.offsetTop,
    rawKeyboardOffset: rawKeyboard,
    isEditable,
    stabilizeForKeyboard: true,
    previousStableLayoutHeight
  });
  const height = vv ? vv.height : layoutHeight;
  const vh = height * 0.01;
  if (vh) root.style.setProperty("--vh", `${vh}px`);
  const appVh = layoutHeight * 0.01;
  if (appVh) {
    root.style.setProperty("--app-vh", `${appVh}px`);
    root.style.setProperty("--app-height", `${layoutHeight}px`);
    root.style.setProperty("--glass-mobile-root-vh", `${layoutHeight}px`);
    root.style.setProperty("--glass-mobile-vh", `${layoutHeight}px`);
  }
  const keyboardOffset = isEditable ? Math.max(0, rawKeyboard) : 0;
  root.style.setProperty("--keyboard-offset", `${keyboardOffset}px`);
  return layoutHeight || previousStableLayoutHeight || 0;
}
export default function ViewportLayoutSetter() {
  const pathname = usePathname();
  const lastFocusedPathRef = useRef(null);
  const hasFocusedOnceRef = useRef(false);
  const stableLayoutHeightRef = useRef(0);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(MOBILE_QUERY);
    const standaloneMql = window.matchMedia("(display-mode: standalone)");
    const fullscreenMql = window.matchMedia("(display-mode: fullscreen)");
    applyLayoutFlag(mql.matches);
    applyDisplayModeFlag();
    applyPlatformFlag();
    stableLayoutHeightRef.current = applyVhVar(stableLayoutHeightRef.current);
    const onMqChange = e => applyLayoutFlag(e.matches);
    const onResize = () => {
      window.requestAnimationFrame(() => {
        applyDisplayModeFlag();
        applyPlatformFlag();
        stableLayoutHeightRef.current = applyVhVar(stableLayoutHeightRef.current);
      });
    };
    const onFocusChange = () => {
      window.requestAnimationFrame(() => {
        stableLayoutHeightRef.current = applyVhVar(stableLayoutHeightRef.current);
      });
    };
    const onPageShow = () => {
      applyLayoutFlag(mql.matches);
      applyDisplayModeFlag();
      applyPlatformFlag();
      stableLayoutHeightRef.current = applyVhVar(stableLayoutHeightRef.current);
    };
    const onDisplayModeChange = () => {
      applyDisplayModeFlag();
      applyPlatformFlag();
      stableLayoutHeightRef.current = applyVhVar(stableLayoutHeightRef.current);
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
    };
  }, []);
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
