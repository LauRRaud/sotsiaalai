// components/backgrounds/BackgroundLayer.jsx
"use client";
import { useEffect, useLayoutEffect, useState, memo, Suspense } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { useAccessibility } from "@/components/accessibility/AccessibilityProvider";
const Space = dynamic(() => import("../Space"), { ssr: false });
const Particles = dynamic(() => import("./Particles"), { ssr: false });
const MaybeSplash = dynamic(() => import("../MaybeSplash"), { ssr: false });
const ColorBends = dynamic(() => import("./ColorBends"), { ssr: false });
const ColorBendsWhite = dynamic(() => import("./ColorBendsWhite"), { ssr: false });
/* ---------- utiliidid ---------- */
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
/* ---------- põhi ---------- */
function BackgroundLayer() {
  const pathname = usePathname();
  const { prefs } = useAccessibility();
  const [mounted, setMounted] = useState(false);
  const [particlesReady, setParticlesReady] = useState(false);
  const [cursorReady, setCursorReady] = useState(false);
  const [animateFog, setAnimateFog] = useState(false);
  const [isLightBg, setIsLightBg] = useState(false);
  const [skipBgIntro, setSkipBgIntro] = useState(false);
  useEffect(() => setMounted(true), []);
  useLayoutEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;
    let ready = false;
    try {
      ready = window.sessionStorage.getItem("home-bg-ready") === "1";
    } catch {}
    if (ready) {
      setSkipBgIntro(true);
      setIsLightBg(document.documentElement.classList.contains("theme-light"));
    } else {
      try {
        window.sessionStorage.setItem("home-bg-ready", "1");
      } catch {}
    }
  }, []);
  // Space fog intro ainult avalehel (mitte reload; 1x per sessioon)
  useEffect(() => {
    if (skipBgIntro) {
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
    try { sessionStorage.setItem("saai-bg-intro-done", "1"); } catch {}
  }, [pathname, skipBgIntro]);
  // Particles lae rahulikult, kui tabu on nähtav
  useEffect(() => {
    if (!mounted) return;
    const cancelParticles = whenVisible(() => onIdle(() => setParticlesReady(true), 600));
    return () => cancelParticles?.();
  }, [mounted]);
  // Splash-cursor sama loogikaga
  useEffect(() => {
    if (!mounted) return;
    const cancelCursor = whenVisible(() => onIdle(() => setCursorReady(true), 1200));
    return () => cancelCursor?.();
  }, [mounted]);

  // Track <html> theme-light class (but do NOT set it here)
  useEffect(() => {
  if (typeof document === "undefined") return;

  const html = document.documentElement;

  const update = () => {
    setIsLightBg(html.classList.contains("theme-light"));
  };

  // Jälgime ainult muutusi (klass lisatakse tegelikult teises effectis)
  const observer = new MutationObserver(update);
  observer.observe(html, { attributes: true, attributeFilter: ["class"] });

  // Storage changes (in case multiple tabs)
  const onStorage = (e) => {
    if (e.key === "theme") {
      update();
    }
  };
  window.addEventListener("storage", onStorage);

  // Esmane staatuse loe
  update();

  return () => {
    observer.disconnect();
    window.removeEventListener("storage", onStorage);
  };
}, []);

  return (
    <>
      {/* TAUSTAKIHID (sisu all) */}
      <div
        id="bg-layer"
        aria-hidden="true"
        suppressHydrationWarning
        style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
      >
        {/* SPACE – kõige taga */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <Suspense fallback={null}>
            <Space
              animateFog={animateFog && !prefs?.reduceMotion}
              skipIntro={!animateFog || !!prefs?.reduceMotion}
              fogAppearDelayMs={0}
            />
          </Suspense>
        </div>
        {/* COLOR BENDS – ainult siis, kui reduced motion pole sees */}
        {!prefs?.reduceMotion && (
          <div className="color-bends-bg" style={{ position: "absolute", inset: 0, zIndex: 1 }}>
            <Suspense fallback={null}>
              {isLightBg ? <ColorBendsWhite /> : <ColorBends />}
            </Suspense>
          </div>
        )}
        {/* PARTICLES – tausta kohal, enne sisu */}
        {particlesReady && !prefs?.reduceMotion && (
          <div className="particles-container" style={{ position: "absolute", inset: 0, zIndex: 2 }}>
            <Particles />
          </div>
        )}
      </div>
      {/* SPLASH CURSOR – portaalina, alati sisu peal */}
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
