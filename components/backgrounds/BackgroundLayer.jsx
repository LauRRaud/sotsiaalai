// components/backgrounds/BackgroundLayer.jsx
"use client";

import { useEffect, useState, memo } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const Space = dynamic(() => import("../Space"), { ssr: false });
const Particles = dynamic(() => import("./Particles"), { ssr: false });
const SplashCursor = dynamic(() => import("../SplashCursor"), { ssr: false });

function getHtmlMode() {
  return document.documentElement.classList.contains("dark-mode") ? "dark" : "light";
}
function onIdle(cb, timeout = 1200) {
  if (typeof window === "undefined") return () => {};
  if ("requestIdleCallback" in window) {
    const id = window.requestIdleCallback(cb, { timeout });
    return () => window.cancelIdleCallback?.(id);
  }
  const t = window.setTimeout(cb, timeout);
  return () => window.clearTimeout(t);
}
function whenVisible(cb) {
  if (typeof document === "undefined") return () => {};
  if (document.visibilityState === "visible") { cb(); return () => {}; }
  const onVis = () => {
    if (document.visibilityState === "visible") {
      document.removeEventListener("visibilitychange", onVis);
      cb();
    }
  };
  document.addEventListener("visibilitychange", onVis);
  return () => document.removeEventListener("visibilitychange", onVis);
}
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setReduced(mql.matches);
    handler();
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);
  return reduced;
}

function BackgroundLayer() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState("dark");

  // NB: Space ei ole enam gated – ainult efektid on
  const [particlesReady, setParticlesReady] = useState(false);
  const [cursorReady, setCursorReady] = useState(false);

  const [skipIntro, setSkipIntro] = useState(true);
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    setMounted(true);
    setMode(getHtmlMode());

    // intro reegel
    let isReload = false;
    try {
      const nav = performance.getEntriesByType?.("navigation")?.[0];
      isReload = nav ? nav.type === "reload" : performance?.navigation?.type === 1;
    } catch {}

    let alreadyDone = false;
    try { alreadyDone = sessionStorage.getItem("saai-bg-intro-done") === "1"; } catch {}

    if (pathname === "/") {
      const shouldSkip = alreadyDone && !isReload;
      setSkipIntro(!!shouldSkip);
      try { sessionStorage.setItem("saai-bg-intro-done", "1"); } catch {}
    } else {
      setSkipIntro(true);
    }

    const onThemeChange = () => setMode(getHtmlMode());
    const onStorage = () => setMode(getHtmlMode());
    window.addEventListener("themechange", onThemeChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("themechange", onThemeChange);
      window.removeEventListener("storage", onStorage);
    };
  }, [pathname]);

  useEffect(() => {
    if (!mounted || prefersReduced) return;
    const cancelParticles = whenVisible(() => onIdle(() => setParticlesReady(true), 600));
    const cancelCursor    = whenVisible(() => onIdle(() => setCursorReady(true), 1200));
    return () => {
      typeof cancelParticles === "function" && cancelParticles();
      typeof cancelCursor === "function" && cancelCursor();
    };
  }, [mounted, prefersReduced]);

  if (!mounted) return null;

  return (
    <>
      {/* Fog animeeri ainult avalehe esmasel külastusel — ja viivitus 0, vt #2 */}
      <Space
        mode={mode}
        animateFog={!skipIntro}
        skipIntro={skipIntro}
        fogAppearDelayMs={0}
      />
      {particlesReady && <Particles mode={mode} />}
      {cursorReady && <SplashCursor />}
    </>
  );
}

export default memo(BackgroundLayer);
