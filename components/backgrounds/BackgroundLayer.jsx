// components/backgrounds/BackgroundLayer.jsx
"use client";

import { useEffect, useState, memo, Suspense } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const Space = dynamic(() => import("../Space"), { ssr: false });
const Particles = dynamic(() => import("./Particles"), { ssr: false });
const MaybeSplash = dynamic(() => import("../MaybeSplash"), { ssr: false });
const LaserFlowOverlay = dynamic(() => import("./LaserFlowOverlay"), { ssr: false });

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

/* --- reduced-motion + force override --- */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mql.matches);
    on();
    mql.addEventListener("change", on);
    return () => mql.removeEventListener("change", on);
  }, []);
  return reduced;
}
function useForceMotion() {
  const [force, setForce] = useState(false);
  useEffect(() => {
    const read = () => {
      try { return localStorage.getItem("saai-force-motion") === "1"; }
      catch { return false; }
    };
    const html = document.documentElement;
    const apply = (on) => html.setAttribute("data-force-motion", on ? "1" : "0");

    const initial = read();
    setForce(initial);
    apply(initial);

    // @ts-ignore mini-helper konsooli jaoks
    window.saaiForceMotion = (on = true) => {
      try { localStorage.setItem("saai-force-motion", on ? "1" : "0"); } catch {}
      apply(!!on);
      setForce(!!on);
    };
  }, []);
  return force;
}

function BackgroundLayer() {
  const pathname = usePathname();

  const prefersReduced = usePrefersReducedMotion();
  const forceMotion = useForceMotion();
  const reducedEffective = prefersReduced && !forceMotion;

  const [mounted, setMounted] = useState(false);
  const [particlesReady, setParticlesReady] = useState(false);
  const [cursorReady, setCursorReady] = useState(false);
  const [animateFog, setAnimateFog] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Space fog intro otsus
  useEffect(() => {
    if (reducedEffective) { setAnimateFog(false); return; }
    let isReload = false;
    try {
      const nav = performance.getEntriesByType?.("navigation")?.[0];
      isReload = nav ? nav.type === "reload" : performance?.navigation?.type === 1;
    } catch {}
    let already = false;
    try { already = sessionStorage.getItem("saai-bg-intro-done") === "1"; } catch {}
    const should = pathname === "/" && !already && !isReload;
    setAnimateFog(should);
    try { sessionStorage.setItem("saai-bg-intro-done", "1"); } catch {}
  }, [pathname, reducedEffective]);

  // Lae PARTICLES idle + nähtaval (järgib reducedEffective)
  useEffect(() => {
    if (!mounted || reducedEffective) return;
    const cancelParticles = whenVisible(() => onIdle(() => setParticlesReady(true), 600));
    return () => { cancelParticles?.(); };
  }, [mounted, reducedEffective]);

  // Lae MaybeSplash idle + nähtaval (EI järgi reducedEffective)
  useEffect(() => {
    if (!mounted) return;
    const cancelCursor = whenVisible(() => onIdle(() => setCursorReady(true), 1200));
    return () => { cancelCursor?.(); };
  }, [mounted]);

  return (
    <div
      id="bg-layer"
      aria-hidden="true"
      suppressHydrationWarning
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
    >
      {/* SPACE — kõige taga */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <Suspense fallback={null}>
          <Space
            animateFog={animateFog}
            skipIntro={!animateFog}
            fogAppearDelayMs={0}
          />
        </Suspense>
      </div>

      {/* LASERFLOW — ainult avalehel, järgib reducedEffective */}
      {pathname === "/" && !reducedEffective && <LaserFlowOverlay zIndex={1} />}

      {/* PARTICLES — järgib reducedEffective */}
      {particlesReady && !reducedEffective && (
        <div className="particles-container">
          <Particles />
        </div>
      )}

      {/* MaybeSplash — ALATI (idle + visible), ei sõltu reducedEffective */}
      {cursorReady && (
        <div style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none" }}>
          <MaybeSplash />
        </div>
      )}
    </div>
  );
}

export default memo(BackgroundLayer);
