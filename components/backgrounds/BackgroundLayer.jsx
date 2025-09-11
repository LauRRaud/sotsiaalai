// components/backgrounds/BackgroundLayer.jsx
"use client";

import { useEffect, useState, useRef, memo, Suspense } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const Space = dynamic(() => import("../Space"), { ssr: false });
const Particles = dynamic(() => import("./Particles"), { ssr: false });
const MaybeSplash = dynamic(() => import("../MaybeSplash"), { ssr: false });

/* utils */
function getDomTheme() {
  if (typeof document === "undefined") return "dark";
  const el = document.documentElement;
  return el.dataset?.theme === "light" ? "light" : "dark";
}
function onIdle(cb, timeout = 800) {
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

  // SSR-safe wrapper: me EI tagasta enam nulli – struktuur on püsiv
  const [mounted, setMounted] = useState(false);

  // teema võetakse <html data-theme> pealt; default "dark"
  const [mode, setMode] = useState("dark");

  // sekundaar-efektid (laeme hiljem)
  const [particlesReady, setParticlesReady] = useState(false);
  const [cursorReady, setCursorReady] = useState(false);

  // udu animatsiooni lipp – arvutame KORRA ja ei toggelda
  const [animateFog, setAnimateFog] = useState(false);
  const hasDecidedRef = useRef(false);

  const prefersReduced = usePrefersReducedMotion();

  // 1) mount + esialgne teema
  useEffect(() => {
    setMounted(true);
    setMode(getDomTheme());
    const onThemeChange = () => setMode(getDomTheme());
    window.addEventListener("themechange", onThemeChange);
    window.addEventListener("storage", onThemeChange);
    return () => {
      window.removeEventListener("themechange", onThemeChange);
      window.removeEventListener("storage", onThemeChange);
    };
  }, []);

  // 2) otsusta üks kord, kas udu animatsioon käivitub (ainult avalehel esmakülastusel)
  useEffect(() => {
    if (hasDecidedRef.current) return;

    let isReload = false;
    try {
      const nav = performance.getEntriesByType?.("navigation")?.[0];
      isReload = nav ? nav.type === "reload" : performance?.navigation?.type === 1;
    } catch {}

    let already = false;
    try { already = sessionStorage.getItem("saai-bg-intro-done") === "1"; } catch {}

    const shouldAnimate = pathname === "/" && !already && !isReload && !prefersReduced;
    setAnimateFog(shouldAnimate);

    // märgi intro tehtuks, et mitte restartida järgmistel kordadel
    try { sessionStorage.setItem("saai-bg-intro-done", "1"); } catch {}
    hasDecidedRef.current = true;
  }, [pathname, prefersReduced]);

  // 3) lae Particles / Splash alles siis, kui leht nähtav ja idle
  useEffect(() => {
    if (!mounted || prefersReduced) return;
    const cancelParticles = whenVisible(() => onIdle(() => setParticlesReady(true), 600));
    const cancelCursor = whenVisible(() => onIdle(() => setCursorReady(true), 1200));
    return () => {
      cancelParticles?.();
      cancelCursor?.();
    };
  }, [mounted, prefersReduced]);

  // ——— RENDER ———
  // NB! Jätame alati maha püsiva konteineri, et SSR/CSR struktuur oleks sama.
  return (
    <div id="bg-layer" aria-hidden="true" suppressHydrationWarning>
      {/* Space: SSR-is null (ssr:false), aga <Suspense> on mõlemal poolel olemas */}
      <Suspense fallback={null}>
        <Space
          mode={mode}
          animateFog={animateFog}
          skipIntro={!animateFog}
          fogAppearDelayMs={0}
        />
      </Suspense>

      {/* kerged efektid, alles pärast idle+visible ja kui pole reduced-motion */}
      {particlesReady && !prefersReduced && <Particles mode={mode} />}
      {cursorReady && !prefersReduced && <MaybeSplash />}
    </div>
  );
}

export default memo(BackgroundLayer);
