// components/backgrounds/BackgroundLayer.jsx
"use client";

import { useEffect, useState, memo, useRef } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const Space = dynamic(() => import("../Space"), { ssr: false });
const Particles = dynamic(() => import("./Particles"), { ssr: false });
const MaybeSplash = dynamic(() => import("../MaybeSplash"), { ssr: false });

/* --- utiliidid --- */
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
function useIsMobile() {
  const [m, setM] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 768px)");
    const onChange = () => setM(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return m;
}

/* --- komponent --- */
function BackgroundLayer() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState("dark");
  const modeObsRef = useRef(null);

  // Efektide laisk laadimine
  const [particlesReady, setParticlesReady] = useState(false);
  const [cursorReady, setCursorReady] = useState(false);

  // Avalehe „intro” animatsiooni vahelejätmine korduvkülastusel
  const [skipIntro, setSkipIntro] = useState(true);

  const prefersReduced = usePrefersReducedMotion();
  const isMobile = useIsMobile();

  useEffect(() => {
    setMounted(true);
    setMode(getHtmlMode());

    // Intro/skip loogika
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

    // teema muutus – kuula custom event’i ja className muutust
    const onThemeChange = () => setMode(getHtmlMode());
    const onStorage = () => setMode(getHtmlMode());
    window.addEventListener("themechange", onThemeChange);
    window.addEventListener("storage", onStorage);

    // jälgi <html class="..."> muutusi (nt toggle nupp)
    if (typeof MutationObserver !== "undefined") {
      modeObsRef.current = new MutationObserver(() => setMode(getHtmlMode()));
      modeObsRef.current.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    }

    return () => {
      window.removeEventListener("themechange", onThemeChange);
      window.removeEventListener("storage", onStorage);
      modeObsRef.current?.disconnect?.();
    };
  }, [pathname]);

  // Lae taustaefektid alles siis, kui leht on nähtav + idle
  useEffect(() => {
    if (!mounted || prefersReduced || isMobile) return; // mobiilis ei lae rasked efektid
    const cancelParticles = whenVisible(() => onIdle(() => setParticlesReady(true), 600));
    const cancelCursor    = whenVisible(() => onIdle(() => setCursorReady(true), 1200));
    return () => {
      typeof cancelParticles === "function" && cancelParticles();
      typeof cancelCursor === "function" && cancelCursor();
    };
  }, [mounted, prefersReduced, isMobile]);

  if (!mounted) return null;

  const desktop = !isMobile && !prefersReduced;

  return (
    <>
      {/* Space:
          - desktop: fog/grain sees, anim ainult avalehe esmakülastusel
          - mobile või reduced-motion: fog/grain välja, anim välja */}
      <Space
        key={mode} // forceeri gradienti uuesti arvutamist teema vahetusel
        mode={mode}
        fog={desktop}
        grain={desktop}
        animateFog={desktop && !skipIntro}
        skipIntro={!desktop || skipIntro}
        fogAppearDelayMs={0}
      />

      {/* Osakesed ainult desktopil ja kui reduced-motion pole */}
      {desktop && particlesReady && <Particles mode={mode} />}

      {/* SplashCursor ainult desktopil */}
      {desktop && cursorReady && <MaybeSplash />}
    </>
  );
}

export default memo(BackgroundLayer);
