// components/backgrounds/BackgroundLayer.jsx
"use client";

import { useEffect, useMemo, useRef, useState, memo, Suspense } from "react";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { useAccessibility } from "@/components/accessibility/AccessibilityProvider";
import dynamic from "next/dynamic";

const Space = dynamic(() => import("../Space"), { ssr: false });
const Particles = dynamic(() => import("./Particles"), { ssr: false });
const MaybeSplash = dynamic(() => import("../MaybeSplash"), { ssr: false });
const ColorBends = dynamic(() => import("./ColorBends"), { ssr: false });

const LIGHT_SPACE_PALETTE = { baseTop: "#ffffffff", baseBottom: "#cbcbcbff" };

const SpaceLayer = memo(function SpaceLayer(props) {
  return (
    <Suspense fallback={null}>
      <Space {...props} />
    </Suspense>
  );
});

/* ---------- utils ---------- */
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

/* ---------- main ---------- */
const BackgroundContent = memo(function BackgroundContent({
  reduceMotion = false,
  isLightTheme = false,
}) {
  const pathname = usePathname();
  const layerRef = useRef(null);

  const [mounted, setMounted] = useState(false);
  const [particlesReady, setParticlesReady] = useState(false);
  const [cursorReady, setCursorReady] = useState(false);
  const [colorBendsReady, setColorBendsReady] = useState(false);
  const [mobileLike, setMobileLike] = useState(false);

  const allowParticles = !reduceMotion;
  const isHome = pathname === "/";

  const bgColor = useMemo(() => {
    if (typeof document === "undefined") return isLightTheme ? "#f9f8f5" : "#050a10";
    const css = getComputedStyle(document.documentElement).getPropertyValue("--page-bg").trim();
    return css || (isLightTheme ? "#f9f8f5" : "#050a10");
  }, [isLightTheme]);

  useEffect(() => setMounted(true), []);

  // Detect “mobile-like” environments to soften parallax + skip heavier effects.
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
      cleanups.forEach((fn) => fn?.());
    };
  }, []);

  // Particles: load gently when tab is visible.
  useEffect(() => {
    if (!mounted) return;
    if (!allowParticles) {
      setParticlesReady(false);
      return;
    }
    const cancel = whenVisible(() => onIdle(() => setParticlesReady(true), 1000));
    return () => cancel?.();
  }, [mounted, allowParticles]);

  // ColorBends: desktop only.
  useEffect(() => {
    if (!mounted) return;
    if (reduceMotion || mobileLike) {
      setColorBendsReady(false);
      return;
    }
    const cancel = whenVisible(() => onIdle(() => setColorBendsReady(true), 900));
    return () => cancel?.();
  }, [mounted, reduceMotion, mobileLike]);

  // Splash cursor: desktop only.
  useEffect(() => {
    if (!mounted) return;
    if (reduceMotion || mobileLike) {
      setCursorReady(false);
      return;
    }
    const cancelCursor = whenVisible(() => onIdle(() => setCursorReady(true), 1200));
    return () => cancelCursor?.();
  }, [mounted, reduceMotion, mobileLike]);

  // Scroll-parallax: homepage only. No dimming in any theme.
  useEffect(() => {
    const el = layerRef.current;
    if (!el || typeof window === "undefined") return;

    // Defaults (also used on non-home routes)
    el.style.setProperty("--saai-parallax-space", "0px");
    el.style.setProperty("--saai-parallax-bends", "0px");
    el.style.setProperty("--saai-parallax-particles", "0px");

    // Hard-disable dimming everywhere
    el.style.setProperty("--saai-bg-dim", "0");

    const parallaxActive = !reduceMotion && isHome;
    if (!parallaxActive) return;

    let raf = 0;
    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

    const update = () => {
      raf = 0;

      const y = window.scrollY || document.documentElement.scrollTop || 0;

      // Softer on mobile-like devices
      const k = mobileLike ? 0.65 : 1;

      // Parallax strengths (tune here)
      const spaceY = -clamp(y * 0.07 * k, 0, 160 * k);
      const bendsY = -clamp(y * 0.11 * k, 0, 220 * k);
      const particlesY = -clamp(y * 0.15 * k, 0, 260 * k);

      el.style.setProperty("--saai-parallax-space", `${spaceY.toFixed(2)}px`);
      el.style.setProperty("--saai-parallax-bends", `${bendsY.toFixed(2)}px`);
      el.style.setProperty("--saai-parallax-particles", `${particlesY.toFixed(2)}px`);

      // Enforce no dim
      el.style.setProperty("--saai-bg-dim", "0");
    };

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [reduceMotion, isHome, mobileLike]);

  return (
    <>
      {/* Background layers (under content) */}
      <div
        data-bg-layer
        ref={layerRef}
        data-parallax={isHome ? "home" : "off"}
        aria-hidden="true"
        suppressHydrationWarning
      >
        {/* SPACE */}
        <div className="bg-space-layer">
          <SpaceLayer
            mode={isLightTheme ? "light" : "dark"}
            palette={isLightTheme ? LIGHT_SPACE_PALETTE : undefined}
            allowMobileCustom={isLightTheme}
            grain={!isLightTheme}
          />
        </div>

        {/* ColorBends */}
        {colorBendsReady && !reduceMotion && !mobileLike && (
          <div
            className="bg-bends-layer"
            aria-hidden="true"
          >
            <Suspense fallback={null}>
              <ColorBends bgColor={bgColor} />
            </Suspense>
          </div>
        )}

        {/* Particles */}
        {particlesReady && allowParticles && (
          <div className="bg-particles-layer">
            <Particles
              bgColor={bgColor}
            />
          </div>
        )}

        {/* Dim overlay exists for compatibility, but is always off now */}
        <div className="bg-dim-overlay" style={{ background: "transparent" }} />
      </div>

      {/* Splash cursor (portal; above everything) */}
      {mounted &&
        cursorReady &&
        typeof document !== "undefined" &&
        !reduceMotion &&
        !mobileLike &&
        createPortal(
          <div className="splash-cursor" aria-hidden="true">
            <MaybeSplash />
          </div>,
          document.body
        )}
    </>
  );
});

function BackgroundLayer() {
  const { prefs } = useAccessibility();
  const reduceMotion = !!prefs?.reduceMotion;

  // Prefer DOM class (more stable across nav); fallback to prefs.
  const isLightTheme =
    typeof document !== "undefined"
      ? document.documentElement.classList.contains("theme-light")
      : prefs?.theme === "light";

  return <BackgroundContent reduceMotion={reduceMotion} isLightTheme={isLightTheme} />;
}

export default memo(BackgroundLayer);
