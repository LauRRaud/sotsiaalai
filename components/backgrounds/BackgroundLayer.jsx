"use client";

import { useEffect, useRef, useState, memo, Suspense } from "react";
import { createPortal } from "react-dom";
import { useAccessibility } from "@/components/accessibility/AccessibilityProvider";
import dynamic from "next/dynamic";
const Particles = dynamic(() => import("./Particles"), {
  ssr: false
});
const MaybeSplash = dynamic(() => import("../MaybeSplash"), {
  ssr: false
});
const ColorBends = dynamic(() => import("./ColorBends"), {
  ssr: false
});
function onIdle(cb, timeout = 800) {
  if (typeof window === "undefined") return () => {};
  if ("requestIdleCallback" in window) {
    const id = window.requestIdleCallback(cb, {
      timeout
    });
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
const BackgroundContent = memo(function BackgroundContent({
  reduceMotion = false,
  isLightTheme = false,
  prefsHydrated = false
}) {
  const layerRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [particlesReady, setParticlesReady] = useState(false);
  const [cursorReady, setCursorReady] = useState(false);
  const [colorBendsReady, setColorBendsReady] = useState(false);
  const [mobileLike, setMobileLike] = useState(false);
  const allowParticles = !reduceMotion;
  const allowColorBends = !reduceMotion;
  const parallaxActive = !reduceMotion;
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = q => typeof window.matchMedia === "function" ? window.matchMedia(q) : null;
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
    const attach = media => {
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
      cleanups.forEach(fn => fn?.());
    };
  }, []);
  useEffect(() => {
    if (!mounted) return;
    if (!allowParticles) {
      setParticlesReady(false);
      return;
    }
    const cancel = whenVisible(() => onIdle(() => setParticlesReady(true), 1000));
    return () => cancel?.();
  }, [mounted, allowParticles]);
  useEffect(() => {
    if (!mounted) return;
    if (!prefsHydrated || !allowColorBends) {
      setColorBendsReady(false);
      return;
    }
    const cancel = whenVisible(() => onIdle(() => setColorBendsReady(true), 900));
    return () => cancel?.();
  }, [mounted, prefsHydrated, allowColorBends]);
  useEffect(() => {
    if (!mounted) return;
    if (reduceMotion || mobileLike) {
      setCursorReady(false);
      return;
    }
    const cancelCursor = whenVisible(() => onIdle(() => setCursorReady(true), 1200));
    return () => cancelCursor?.();
  }, [mounted, reduceMotion, mobileLike]);
  useEffect(() => {
    const el = layerRef.current;
    if (!el || typeof window === "undefined") return;
    el.style.setProperty("--saai-parallax-space", "0px");
    el.style.setProperty("--saai-parallax-bends", "0px");
    el.style.setProperty("--saai-parallax-particles", "0px");
    el.style.setProperty("--saai-bg-dim", "0");
    if (!parallaxActive) return;
    let raf = 0;
    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
    const update = () => {
      raf = 0;
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      const spaceY = -clamp(y * 0.07, 0, 160);
      const bendsY = -clamp(y * 0.11, 0, 220);
      const particlesY = -clamp(y * 0.15, 0, 260);
      el.style.setProperty("--saai-parallax-space", `${spaceY.toFixed(2)}px`);
      el.style.setProperty("--saai-parallax-bends", `${bendsY.toFixed(2)}px`);
      el.style.setProperty("--saai-parallax-particles", `${particlesY.toFixed(2)}px`);
      el.style.setProperty("--saai-bg-dim", "0");
    };
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, {
      passive: true
    });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [reduceMotion, parallaxActive]);
  return <>
      {}
      <div data-bg-layer ref={layerRef} data-parallax={parallaxActive ? "on" : "off"} aria-hidden="true" suppressHydrationWarning>
        <div className="bg-space-layer" aria-hidden="true">
          <div
            className="space-backdrop"
            data-mode={isLightTheme ? "light" : "dark"}
          />
        </div>

        {prefsHydrated && colorBendsReady && allowColorBends && (
          <div className="bg-bends-layer" aria-hidden="true">
            <Suspense fallback={null}>
              <ColorBends />
            </Suspense>
          </div>
        )}

        {}
        {particlesReady && allowParticles && <div className="bg-particles-layer">
            <Particles />
          </div>}

        {}
        <div className="bg-dim-overlay" style={{
        background: "transparent"
      }} />
      </div>

      {}
      {mounted && cursorReady && typeof document !== "undefined" && !reduceMotion && !mobileLike && createPortal(<div className="splash-cursor" aria-hidden="true">
            <MaybeSplash />
          </div>, document.body)}
    </>;
});
function BackgroundLayer() {
  const {
    prefs,
    hydrated
  } = useAccessibility();
  const reduceMotion = !!prefs?.reduceMotion;
  const isLightTheme = typeof document !== "undefined" ? document.documentElement.classList.contains("theme-light") : prefs?.theme === "light";
  return <BackgroundContent reduceMotion={reduceMotion} isLightTheme={isLightTheme} prefsHydrated={!!hydrated} />;
}
export default memo(BackgroundLayer);
