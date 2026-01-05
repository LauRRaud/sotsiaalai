// components/backgrounds/BackgroundLayer.jsx
"use client";
import { useEffect, useLayoutEffect, useState, memo, Suspense } from "react";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { useAccessibility } from "@/components/accessibility/AccessibilityProvider";
import dynamic from "next/dynamic";
const Space = dynamic(() => import("../Space"), { ssr: false });
const Particles = dynamic(() => import("./Particles"), { ssr: false });
const MaybeSplash = dynamic(() => import("../MaybeSplash"), { ssr: false });
const ColorBends = dynamic(() => import("./ColorBends"), { ssr: false });
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
const BackgroundContent = memo(function BackgroundContent({ reduceMotion = false, isLightTheme = false }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [particlesReady, setParticlesReady] = useState(false);
  const [cursorReady, setCursorReady] = useState(false);
  const [animateFog, setAnimateFog] = useState(false);
  const [skipBgIntro, setSkipBgIntro] = useState(false);
  const [colorBendsReady, setColorBendsReady] = useState(false);
  const [mobileLike, setMobileLike] = useState(false);
  const allowParticles = !reduceMotion && (!mobileLike || pathname === "/");
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = (q) => (typeof window.matchMedia === "function" ? window.matchMedia(q) : null);
    const coarse = mql("(pointer: coarse)");
    const noHover = mql("(hover: none)");
    const small = mql("(max-width: 768px)");
    const compute = () => {
      const coarseOk = coarse?.matches ?? false;
      const noHoverOk = noHover?.matches ?? false;
      const smallOk = small?.matches ?? false;
      setMobileLike(coarseOk || noHoverOk || smallOk);
    };
    compute();
    const attach = (media) => {
      if (!media) return () => {};
      const handler = () => compute();
      if (typeof media.addEventListener === "function") {
        media.addEventListener("change", handler);
        return () => media.removeEventListener("change", handler);
      }
      if (typeof media.addListener === "function") {
        media.addListener(handler);
        return () => media.removeListener(handler);
      }
      return () => {};
    };
    const cleanups = [attach(coarse), attach(noHover), attach(small)];
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("resize", compute);
      cleanups.forEach((c) => c?.());
    };
  }, []);
  useLayoutEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;
    let ready = false;
    try {
      ready = window.sessionStorage.getItem("home-bg-ready") === "1";
    } catch {}
    if (ready) {
      setSkipBgIntro(true);
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
    if (!allowParticles) {
      setParticlesReady(false);
      return;
    }
    const timeout = mobileLike ? 900 : 600;
    const cancelParticles = whenVisible(() => onIdle(() => setParticlesReady(true), timeout));
    return () => cancelParticles?.();
  }, [mounted, allowParticles, mobileLike]);
  // ColorBends lae rahulikult
  useEffect(() => {
    if (!mounted || reduceMotion || mobileLike) {
      setColorBendsReady(false);
      return;
    }
    const cancel = whenVisible(() => onIdle(() => setColorBendsReady(true), 400));
    return () => cancel?.();
  }, [mounted, reduceMotion, mobileLike]);
  // Splash-cursor sama loogikaga
  useEffect(() => {
    if (!mounted) return;
    if (reduceMotion || mobileLike) {
      setCursorReady(false);
      return;
    }
    const cancelCursor = whenVisible(() => onIdle(() => setCursorReady(true), 1200));
    return () => cancelCursor?.();
  }, [mounted, reduceMotion, mobileLike]);

  return (
    <>
      {/* TAUSTAKIHID (sisu all) */}
      <div
        data-bg-layer
        aria-hidden="true"
        suppressHydrationWarning
        style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
      >
        {/* SPACE – kõige taga */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <Suspense fallback={null}>
            <Space
              animateFog={animateFog && !reduceMotion && !mobileLike}
              skipIntro={!animateFog || !!reduceMotion || mobileLike}
              fogAppearDelayMs={0}
              mode={isLightTheme ? "light" : "dark"}
              palette={isLightTheme ? { baseTop: "#ffffff", baseBottom: "#94979c" } : undefined}
              allowMobileCustom={isLightTheme}
              grain={!isLightTheme}
              fog={!isLightTheme}
            />
          </Suspense>
        </div>
        {colorBendsReady && !reduceMotion && !mobileLike && (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 2,
              pointerEvents: "none",
            }}
          >
            <Suspense fallback={null}>
              <ColorBends />
            </Suspense>
          </div>
        )}
        {particlesReady && allowParticles && (
          <div className="particles-container" style={{ position: "absolute", inset: 0, zIndex: 3 }}>
            <Particles />
          </div>
        )}
      </div>
      {/* SPLASH CURSOR – portaalina, alati sisu peal */}
      {mounted && cursorReady && typeof document !== "undefined" && !reduceMotion && !mobileLike &&
        createPortal(
           <div className="splash-cursor" aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 9999, pointerEvents: "none" }}>
             <MaybeSplash />
            </div>,
            document.body
         )
      }
    </>
  );
});

function BackgroundLayer() {
  const { prefs } = useAccessibility();
  const reduceMotion = !!prefs?.reduceMotion;
  // DOM klass on varajase inline scripti tõttu stabiilsem kui React state navigeerimisel.
  // Fallback: prefs.theme (SSR/hydration kontekstis).
  const isLightTheme =
    typeof document !== "undefined"
      ? document.documentElement.classList.contains("theme-light")
      : prefs?.theme === "light";
  return <BackgroundContent reduceMotion={reduceMotion} isLightTheme={isLightTheme} />;
}

export default memo(BackgroundLayer);
