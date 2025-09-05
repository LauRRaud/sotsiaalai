"use client";

import { useEffect, useState, memo } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const Space = dynamic(() => import("../Space"), { ssr: false });
const SplashCursor = dynamic(() => import("../SplashCursor"), { ssr: false });
const Particles = dynamic(() => import("./Particles"), { ssr: false });

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
  if (document.visibilityState === "visible") {
    cb();
    return () => {};
  }
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

  const [bgReady, setBgReady] = useState(false);
  const [particlesReady, setParticlesReady] = useState(false);
  const [cursorReady, setCursorReady] = useState(false);

  // intro kontroll
  const [skipIntro, setSkipIntro] = useState(true);
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    setMounted(true);
    setMode(getHtmlMode());

    let isReload = false;
    try {
      const nav = performance.getEntriesByType?.("navigation")?.[0];
      isReload = nav ? nav.type === "reload" : performance?.navigation?.type === 1;
    } catch {}

    let alreadyDone = false;
    try {
      alreadyDone = sessionStorage.getItem("saai-bg-intro-done") === "1";
    } catch {}

    if (pathname === "/") {
      const shouldSkip = alreadyDone && !isReload ? true : false;
      setSkipIntro(shouldSkip ? true : false);
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
    if (!mounted) return;

    if (prefersReduced) {
      setBgReady(false);
      setParticlesReady(false);
      setCursorReady(false);
      return;
    }

    const cancelBgVis = whenVisible(() => {
      const cancelBgIdle = onIdle(() => setBgReady(true), 200);
      return () => cancelBgIdle?.();
    });

    const cancelParticlesVis = whenVisible(() => {
      const cancelParticlesIdle = onIdle(() => setParticlesReady(true), 800);
      return () => cancelParticlesIdle?.();
    });

    const cancelCurVis = whenVisible(() => {
      const cancelCurIdle = onIdle(() => setCursorReady(true), 1400);
      return () => cancelCurIdle?.();
    });

    return () => {
      cancelBgVis?.();
      cancelParticlesVis?.();
      cancelCurVis?.();
    };
  }, [mounted, prefersReduced]);

  // SSR placeholder
  if (!mounted) {
    return (
      <div
        className="space-backdrop"
        data-mode="dark"
        style={{
          background: "linear-gradient(180deg, #070b16 0%, #0d111b 100%)",
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
        aria-hidden
      />
    );
  }

  return (
    <>
      {bgReady && (
        <Space
          mode={mode}
          animateFog={true}
          skipIntro={skipIntro}
        />
      )}
      {particlesReady && <Particles mode={mode} />}
      {cursorReady && <SplashCursor />}
    </>
  );
}

export default memo(BackgroundLayer);
