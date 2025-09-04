"use client";

import { useEffect, useState, memo } from "react";
import dynamic from "next/dynamic";

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
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState("dark");

  const [bgReady, setBgReady] = useState(false);
  const [particlesReady, setParticlesReady] = useState(false);
  const [cursorReady, setCursorReady] = useState(false);

  // ✅ mälu: ära enam intro’t mängi samas TAB-is
  const [skipIntro, setSkipIntro] = useState(false);

  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    setMounted(true);
    setMode(getHtmlMode());

    // üks kord per tab
    try {
      const done = sessionStorage.getItem("saai-bg-intro-done") === "1";
      setSkipIntro(done);
      if (!done) sessionStorage.setItem("saai-bg-intro-done", "1");
    } catch {}

    const onThemeChange = () => setMode(getHtmlMode());
    const onStorage = () => setMode(getHtmlMode());

    window.addEventListener("themechange", onThemeChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("themechange", onThemeChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (prefersReduced) {
      setBgReady(false);
      setParticlesReady(false);
      setCursorReady(false);
      return;
    }

    const cancelBgVis = whenVisible(() => {
      const cancelBgIdle = onIdle(() => setBgReady(true), 600);
      return () => cancelBgIdle?.();
    });

    const cancelParticlesVis = whenVisible(() => {
      const cancelParticlesIdle = onIdle(() => setParticlesReady(true), 1200);
      return () => cancelParticlesIdle?.();
    });

    const cancelCurVis = whenVisible(() => {
      const cancelCurIdle = onIdle(() => setCursorReady(true), 1800);
      return () => cancelCurIdle?.();
    });

    return () => {
      cancelBgVis?.();
      cancelParticlesVis?.();
      cancelCurVis?.();
    };
  }, [mounted, prefersReduced]);

  if (!mounted) return null;

  return (
    <>
      {bgReady && <Space key={`space-${mode}`} mode={mode} skipIntro={skipIntro} />}
      {particlesReady && <Particles key={`particles-${mode}`} mode={mode} />}
      {cursorReady && <SplashCursor key={`cursor-${mode}`} />}
    </>
  );
}

export default memo(BackgroundLayer);
