// components/backgrounds/BackgroundLayer.jsx
"use client";

import { useEffect, useState, memo, Suspense } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { useAccessibility } from "@/components/accessibility/AccessibilityProvider";

const Space = dynamic(() => import("../Space"), { ssr: false });
const Particles = dynamic(() => import("./Particles"), { ssr: false });
const MaybeSplash = dynamic(() => import("../MaybeSplash"), { ssr: false });
const ColorBends = dynamic(() => import("./ColorBends"), { ssr: false });

import "./ColorBends.css";

/* --- utiliidid --- */
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
  const [force, setForce] = useState(true);
  useEffect(() => {
    const html = document.documentElement;
    const apply = (on) => html.setAttribute("data-force-motion", on ? "1" : "0");
    const readLS = () => { try { return localStorage.getItem("saai-force-motion"); } catch { return null; } };
    const writeLS = (on) => { try { localStorage.setItem("saai-force-motion", on ? "1" : "0"); } catch {} };

    const existing = readLS();
    const initial = existing == null ? true : existing === "1";
    if (existing == null) writeLS(true);

    setForce(initial);
    apply(initial);

    // dev-helper: window.saaiForceMotion(true/false)
    // @ts-ignore
    window.saaiForceMotion = (on = true) => {
      writeLS(!!on);
      apply(!!on);
      setForce(!!on);
    };
  }, []);
  return force;
}

/* --- põhi --- */
function BackgroundLayer() {
  const pathname = usePathname();
  const { prefs } = useAccessibility();

  const [mounted, setMounted] = useState(false);
  const [particlesReady, setParticlesReady] = useState(false);
  const [cursorReady, setCursorReady] = useState(false);
  const [animateFog, setAnimateFog] = useState(false);

  useEffect(() => setMounted(true), []);

  // ainult avalehel udu intro
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

  useEffect(() => {
    if (!mounted) return;
    const cancelParticles = whenVisible(() => onIdle(() => setParticlesReady(true), 600));
    return () => cancelParticles?.();
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    const cancelCursor = whenVisible(() => onIdle(() => setCursorReady(true), 1200));
    return () => cancelCursor?.();
  }, [mounted]);

  return (
    <>
      {/* TAUST: kõik kihid sisu all */}
      <div
        id="bg-layer"
        aria-hidden="true"
        suppressHydrationWarning
        style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
      >
        {/* Space – kõige taga */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <Suspense fallback={null}>
            <Space
              animateFog={animateFog && !prefs?.reduceMotion}
              skipIntro={!animateFog || !!prefs?.reduceMotion}
              fogAppearDelayMs={0}
            />
          </Suspense>
        </div>

        {/* ColorBends – teine kiht (visuaal määratakse CSS-is) */}
        <div className="color-bends-bg" style={{ position: "absolute", inset: 0, zIndex: 1 }}>
          <Suspense fallback={null}>
            <ColorBends />
          </Suspense>
        </div>

        {/* Particles – kõige peal enne sisu */}
        {particlesReady && !prefs?.reduceMotion && (
          <div className="particles-container" style={{ zIndex: 2 }}>
            <Particles />
          </div>
        )}
      </div>

      {/* Splash cursor portaalina body alla */}
      {mounted && cursorReady && typeof document !== "undefined" && !prefs?.reduceMotion &&
        createPortal(
          <div className="splash-cursor" aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 30, pointerEvents: "none" }}>
            <MaybeSplash />
          </div>,
          document.body
        )
      }
    </>
  );
}

export default memo(BackgroundLayer);
