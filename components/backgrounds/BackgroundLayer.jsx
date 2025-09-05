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
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState("dark");

  // kihid
  const [bgReady, setBgReady] = useState(false);
  const [particlesReady, setParticlesReady] = useState(false);
  const [cursorReady, setCursorReady] = useState(false);

  // 🔑 kriitiline: algväärtus = false → SSR ja 1. kliendirender täpselt samad
  const [animateFog, setAnimateFog] = useState(false);

  const prefersReduced = usePrefersReducedMotion();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    setMode(getHtmlMode());

    // otsusta, kas mängida udu intro vaid esimesel avalehe laadimisel
    try {
      const already = sessionStorage.getItem("saai-bg-intro-done") === "1";
      const onHome = pathname === "/";
      const shouldAnimate = onHome && !already && !prefersReduced;

      // Sel hetkel on esimene kliendirender juba toimunud (false),
      // nüüd tohib turvaliselt muuta → ei teki hydration mismatch’i.
      setAnimateFog(shouldAnimate);

      if (shouldAnimate) {
        sessionStorage.setItem("saai-bg-intro-done", "1");
      }
    } catch {
      // kui sessionStorage puudub, ärme animatsiooni esimesel korral käivita
      setAnimateFog(false);
    }

    const onThemeChange = () => setMode(getHtmlMode());
    const onStorage = () => setMode(getHtmlMode());
    window.addEventListener("themechange", onThemeChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("themechange", onThemeChange);
      window.removeEventListener("storage", onStorage);
    };
  }, [pathname, prefersReduced]);

  useEffect(() => {
    if (!mounted || prefersReduced) return;

    const cancelBgVis = whenVisible(() => {
      const cancelBgIdle = onIdle(() => setBgReady(true), 200); // laadime kiiremini
      return () => cancelBgIdle?.();
    });

    const cancelParticlesVis = whenVisible(() => {
      const cancelParticlesIdle = onIdle(() => setParticlesReady(true), 900);
      return () => cancelParticlesIdle?.();
    });

    const cancelCurVis = whenVisible(() => {
      const cancelCurIdle = onIdle(() => setCursorReady(true), 1300);
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
      {bgReady && <Space key={`space-${mode}`} mode={mode} animateFog={animateFog} />}
      {particlesReady && <Particles key={`particles-${mode}`} mode={mode} />}
      {cursorReady && <SplashCursor key={`cursor-${mode}`} />}
    </>
  );
}

export default memo(BackgroundLayer);
