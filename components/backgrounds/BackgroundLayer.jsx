// components/backgrounds/BackgroundLayer.jsx
"use client";

import { useEffect, useState, memo } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const Space = dynamic(() => import("../Space"), { ssr: false, loading: () => null });
const SplashCursor = dynamic(() => import("../SplashCursor"), { ssr: false, loading: () => null });
const Particles = dynamic(() => import("./Particles"), { ssr: false, loading: () => null });

function detectMode() {
  try {
    const ls = (localStorage.getItem("theme") || "").toLowerCase();
    if (ls === "dark" || ls === "light") return ls;

    const ds = (document.documentElement.dataset.theme || "").toLowerCase();
    if (ds === "dark" || ds === "light") return ds;

    if (document.documentElement.classList.contains("dark-mode")) return "dark";

    if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
  } catch {}
  return "light";
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

/** whenVisible: käivitab cb alles siis, kui sakk on nähtav; toetab ka cleanup'i */
function whenVisible(cb) {
  if (typeof document === "undefined") return () => {};
  let innerCleanup = null;

  if (document.visibilityState === "visible") {
    innerCleanup = cb() || null;
    return () => { if (typeof innerCleanup === "function") innerCleanup(); };
  }
  const onVis = () => {
    if (document.visibilityState === "visible") {
      document.removeEventListener("visibilitychange", onVis);
      innerCleanup = cb() || null;
    }
  };
  document.addEventListener("visibilitychange", onVis);
  return () => {
    document.removeEventListener("visibilitychange", onVis);
    if (typeof innerCleanup === "function") innerCleanup();
  };
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

  const [skipIntro, setSkipIntro] = useState(true);
  const prefersReduced = usePrefersReducedMotion();

  // Mount + intro reegel
  useEffect(() => {
    setMounted(true);
    setMode(detectMode());

    let isReload = false;
    try {
      const nav = performance.getEntriesByType?.("navigation")?.[0];
      isReload = nav ? nav.type === "reload" : performance?.navigation?.type === 1;
    } catch {}

    let alreadyDone = false;
    try { alreadyDone = sessionStorage.getItem("saai-bg-intro-done") === "1"; } catch {}

    if (pathname === "/") {
      setSkipIntro(!!(alreadyDone && !isReload));
      try { sessionStorage.setItem("saai-bg-intro-done", "1"); } catch {}
    } else {
      setSkipIntro(true);
    }
  }, [pathname]);

  // Teema muutuse kindel jälgimine
  useEffect(() => {
    if (!mounted) return;

    let rafId = 0;
    const updateFromDom = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const next = detectMode();
        setMode((curr) => (curr === next ? curr : next));
      });
    };

    // 1) <html> klassid / data-theme
    const mo = new MutationObserver((muts) => {
      for (const m of muts) {
        if (m.type === "attributes") { updateFromDom(); break; }
      }
    });
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    // 2) OS teema
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onMql = () => updateFromDom();
    try { mql.addEventListener("change", onMql); } catch { mql.addListener?.(onMql); }

    // 3) custom event (kui sinu toggle seda saadab)
    const onThemeEvt = () => updateFromDom();
    window.addEventListener("themechange", onThemeEvt);

    // 4) esmaseks sünkroniseerimiseks
    updateFromDom();

    return () => {
      cancelAnimationFrame(rafId);
      mo.disconnect();
      try { mql.removeEventListener("change", onMql); } catch { mql.removeListener?.(onMql); }
      window.removeEventListener("themechange", onThemeEvt);
    };
  }, [mounted]);

  // Lazy-init efektid (ja korrektne cleanup)
  useEffect(() => {
    if (!mounted) return;

    if (prefersReduced) {
      setBgReady(false);
      setParticlesReady(false);
      setCursorReady(false);
      return;
    }

    const cancelBgVis = whenVisible(() => onIdle(() => setBgReady(true), 200));
    const cancelParticlesVis = whenVisible(() => onIdle(() => setParticlesReady(true), 800));
    const cancelCurVis = whenVisible(() => onIdle(() => setCursorReady(true), 1400));

    return () => {
      cancelBgVis?.();
      cancelParticlesVis?.();
      cancelCurVis?.();
    };
  }, [mounted, prefersReduced]);

  // SSR placeholder (pole ühtegi hook’i allpool)
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
          key={`space-${mode}`}
          mode={mode}
          animateFog={true}
          skipIntro={skipIntro}
        />
      )}
      {particlesReady && <Particles key={`particles-${mode}`} mode={mode} />}
      {cursorReady && <SplashCursor key={`cursor-${mode}`} />}
    </>
  );
}

export default memo(BackgroundLayer);
