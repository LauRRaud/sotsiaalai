// components/backgrounds/BackgroundLayer.jsx
"use client";

import { useEffect, useState, memo, Suspense } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const Space = dynamic(() => import("../Space"), { ssr: false });
const Particles = dynamic(() => import("./Particles"), { ssr: false });
const MaybeSplash = dynamic(() => import("../MaybeSplash"), { ssr: false });

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

/* --- (JÄETUD ALLES, AGA ÜLEKIRJUTAME) reduced-motion + force override --- */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    // loe küll eelistus, aga me ei kasuta seda efektiivses otsuses
    try {
      const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
      const on = () => setReduced(mql.matches);
      on();
      mql.addEventListener("change", on);
      return () => mql.removeEventListener("change", on);
    } catch {}
  }, []);
  return reduced;
}
function useForceMotionDefaultOn() {
  // vaikimisi "sisse lülitatud" – kõigil külalistel kohe efektid sees
  const [force, setForce] = useState(true);
  useEffect(() => {
    const html = document.documentElement;
    const apply = (on) => html.setAttribute("data-force-motion", on ? "1" : "0");

    const readLS = () => {
      try { return localStorage.getItem("saai-force-motion"); } catch { return null; }
    };
    const writeLS = (on) => {
      try { localStorage.setItem("saai-force-motion", on ? "1" : "0"); } catch {}
    };

    // kui LS on tühi, kirjuta "1"; kui olemas, kasuta seda
    const existing = readLS();
    const initial = existing == null ? true : existing === "1";
    if (existing == null) writeLS(true);

    setForce(initial);
    apply(initial);

    // dev-helper konsooli jaoks (saad käsitsi välja/välja lülitada)
    // nt: saaiForceMotion(false)
    // @ts-ignore
    window.saaiForceMotion = (on = true) => {
      writeLS(!!on);
      apply(!!on);
      setForce(!!on);
    };
  }, []);
  return force;
}

function BackgroundLayer() {
  const pathname = usePathname();

  // loe küll, kuid ignoreerime: tahame, et kõik efektid töötaksid
  const _prefersReduced = usePrefersReducedMotion();
  const _forceMotion = useForceMotionDefaultOn();

  // kriitiline rida: EFEKTID ALATI LUBATUD
  const reducedEffective = false;

  const [mounted, setMounted] = useState(false);
  const [particlesReady, setParticlesReady] = useState(false);
  const [cursorReady, setCursorReady] = useState(false);
  const [animateFog, setAnimateFog] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Space fog intro otsus — jätame loogika alles (esilehel, mitte reload, mitte juba tehtud)
  // NB! enam ei peata reducedEffective seda
  useEffect(() => {
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
  }, [pathname]);

  // Lae PARTICLES idle + nähtaval (ALATI, enam mitte reducedEffective põhine)
  useEffect(() => {
    if (!mounted) return;
    const cancelParticles = whenVisible(() => onIdle(() => setParticlesReady(true), 600));
    return () => { cancelParticles?.(); };
  }, [mounted]);

  // Lae MaybeSplash idle + nähtaval (nagu varemki – ALATI)
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
            animateFog={animateFog}   // intro animatsioon lubatud vastavalt esmakülastuse loogikale
            skipIntro={!animateFog}
            fogAppearDelayMs={0}
          />
        </Suspense>
      </div>

      {/* PARTICLES — ALATI (idle + visible) */}
      {particlesReady && (
        <div className="particles-container">
          <Particles />
        </div>
      )}

      {/* MaybeSplash — ALATI (idle + visible) */}
      {cursorReady && (
        <div style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none" }}>
          <MaybeSplash />
        </div>
      )}
    </div>
  );
}

export default memo(BackgroundLayer);
