// components/backgrounds/BackgroundLayer.jsx
"use client";

import { useEffect, useState, memo, Suspense } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const Space = dynamic(() => import("../Space"), { ssr: false });
const Particles = dynamic(() => import("./Particles"), { ssr: false });
const MaybeSplash = dynamic(() => import("../MaybeSplash"), { ssr: false });
const LaserFlowOverlay = dynamic(() => import("./LaserFlowOverlay"), { ssr: false });

/* utils: idle/visibility/motion */
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
  const prefersReduced = usePrefersReducedMotion();

  const [mounted, setMounted] = useState(false);
  const [particlesReady, setParticlesReady] = useState(false);
  const [cursorReady, setCursorReady] = useState(false);
  const [animateFog, setAnimateFog] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // otsusta Space fog intro iga lehevahetuse korral
  useEffect(() => {
    if (prefersReduced) {
      setAnimateFog(false);
      return;
    }
    let isReload = false;
    try {
      const nav = performance.getEntriesByType?.("navigation")?.[0];
      isReload = nav ? nav.type === "reload" : performance?.navigation?.type === 1;
    } catch {}
    let already = false;
    try { already = sessionStorage.getItem("saai-bg-intro-done") === "1"; } catch {}

    const should = pathname === "/" && !already && !isReload;
    setAnimateFog(should);

    // märgi tehtuks, et mitte uuesti intro't mängida
    try { sessionStorage.setItem("saai-bg-intro-done", "1"); } catch {}
  }, [pathname, prefersReduced]);

  // lae Particles/MaybeSplash siis, kui tab on nähtav ja idle
  useEffect(() => {
    if (!mounted || prefersReduced) return;
    const cancelParticles = whenVisible(() => onIdle(() => setParticlesReady(true), 600));
    const cancelCursor = whenVisible(() => onIdle(() => setCursorReady(true), 1200));
    return () => { cancelParticles?.(); cancelCursor?.(); };
  }, [mounted, prefersReduced]);

  return (
    <div
      id="bg-layer"
      aria-hidden="true"
      suppressHydrationWarning
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
    >
      {/* SPACE — kõige taga (z:0) */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <Suspense fallback={null}>
          <Space
            animateFog={animateFog}
            skipIntro={!animateFog}
            fogAppearDelayMs={0}
          />
        </Suspense>
      </div>

      {/* LASERFLOW — Space'i peal (z:1), ainult avalehel ja mitte reduced-motion */}
      {pathname === "/" && !prefersReduced && (
        <LaserFlowOverlay zIndex={1} />
      )}

      {/* PARTICLES — LaserFlow'st eespool (z:2) */}
      {particlesReady && !prefersReduced && (
        <div className="particles-container">
          <Particles />
        </div>
      )}

      {/* MaybeSplash — kõige ees taustakihtidest (z:3) */}
      {cursorReady && !prefersReduced && (
        <div style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none" }}>
          <MaybeSplash />
        </div>
      )}
    </div>
  );
}

export default memo(BackgroundLayer);
