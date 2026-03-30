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
function detectMobileLikeDevice() {
  if (typeof window === "undefined") return false;
  const mq = query => typeof window.matchMedia === "function" ? window.matchMedia(query)?.matches ?? false : false;
  const coarse = mq("(pointer: coarse)");
  const noHover = mq("(hover: none)");
  const small = mq("(max-width: 768px)") || window.innerWidth <= 768;
  const desktopPointer = mq("(hover: hover) and (pointer: fine)");
  const touchCapable = typeof navigator !== "undefined" && (navigator.maxTouchPoints || 0) > 0;
  const layoutMobile = document.documentElement?.getAttribute("data-layout") === "mobile" || document.body?.getAttribute("data-layout") === "mobile";
  const ua = typeof navigator !== "undefined" ? navigator.userAgent || "" : "";
  const uaMobile = typeof navigator !== "undefined" ? navigator.userAgentData?.mobile ?? /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(ua) : false;
  return coarse || noHover || small || layoutMobile || uaMobile || touchCapable && !desktopPointer;
}
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
function resolveThemeFromDom() {
  if (typeof document === "undefined") return null;
  const html = document.documentElement;
  if (!html) return null;
  if (html.getAttribute("data-contrast") === "hc") return "dark";
  if (html.classList.contains("theme-mid")) return "mid";
  if (html.classList.contains("theme-night")) return "night";
  if (html.classList.contains("theme-light")) return "light";
  return "dark";
}
const BackgroundContent = memo(function BackgroundContent({
  reduceMotion = false,
  isLightTheme = false,
  prefsHydrated = false,
  themeMode = "dark"
}) {
  const layerRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [particlesReady, setParticlesReady] = useState(false);
  const [cursorReady, setCursorReady] = useState(false);
  const [colorBendsReady, setColorBendsReady] = useState(false);
  // Keep initial server/client render identical; compute real value after mount.
  const [deviceProfileReady, setDeviceProfileReady] = useState(false);
  const [mobileLike, setMobileLike] = useState(false);
  const [wideViewport, setWideViewport] = useState(false);
  const allowParticles = deviceProfileReady;
  const allowColorBends = deviceProfileReady;
  const parallaxActive = deviceProfileReady && !reduceMotion && !mobileLike;
  const baseColorBendsProps = mobileLike
    ? {
        performanceMode: "performance",
        maxDpr: 1.1
      }
    : wideViewport
      ? {
          performanceMode: "balanced",
          maxDpr: 1.15
        }
      : {
          performanceMode: "balanced",
          maxDpr: 1.35
        };
  const themeColorBendsProps =
    themeMode === "mid"
      ? {
          colors: ["#7a4a47"]
        }
      : null;
  const colorBendsProps = {
    ...baseColorBendsProps,
    ...(themeColorBendsProps || {})
  };
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = q => typeof window.matchMedia === "function" ? window.matchMedia(q) : null;
    const coarse = mql("(pointer: coarse)");
    const noHover = mql("(hover: none)");
    const small = mql("(max-width: 768px)");
    const compute = () => {
      setMobileLike(detectMobileLikeDevice());
      setWideViewport(window.innerWidth >= 1440 || window.innerHeight >= 1100);
      setDeviceProfileReady(true);
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
    setParticlesReady(true);
  }, [mounted]);
  useEffect(() => {
    if (!mounted) return;
    if (prefsHydrated) {
      setColorBendsReady(true);
      return;
    }
    setColorBendsReady(false);
    const fallbackTimer = window.setTimeout(() => {
      setColorBendsReady(true);
    }, 1200);
    return () => window.clearTimeout(fallbackTimer);
  }, [mounted, prefsHydrated]);
  useEffect(() => {
    if (!mounted) return;
    if (!deviceProfileReady || reduceMotion || mobileLike) {
      setCursorReady(false);
      return;
    }
    const cancelCursor = whenVisible(() => onIdle(() => setCursorReady(true), 1200));
    return () => cancelCursor?.();
  }, [mounted, deviceProfileReady, reduceMotion, mobileLike]);
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

        {deviceProfileReady && colorBendsReady && allowColorBends && (
          <div className="bg-bends-layer" aria-hidden="true">
            <Suspense fallback={null}>
              <ColorBends {...colorBendsProps} freeze={reduceMotion || mobileLike} />
            </Suspense>
          </div>
        )}

        {}
        {deviceProfileReady && particlesReady && allowParticles && <div className="bg-particles-layer">
            <Particles freeze={reduceMotion} />
          </div>}

      </div>

      {}
      {mounted && deviceProfileReady && cursorReady && typeof document !== "undefined" && !reduceMotion && !mobileLike && createPortal(<div className="splash-cursor" aria-hidden="true">
            <MaybeSplash />
          </div>, document.body)}
    </>;
});
function BackgroundLayer() {
  const {
    prefs,
    hydrated
  } = useAccessibility();
  const [domTheme, setDomTheme] = useState(null);
  const reduceMotion = !!prefs?.reduceMotion;
  useEffect(() => {
    if (typeof document === "undefined") return;
    const html = document.documentElement;
    const apply = () => setDomTheme(resolveThemeFromDom());
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(html, {
      attributes: true,
      attributeFilter: ["class", "data-contrast"]
    });
    return () => observer.disconnect();
  }, []);
  const effectiveTheme = domTheme || prefs?.theme;
  const isLightTheme =
    effectiveTheme === "light" ||
    effectiveTheme === "light-mono" ||
    effectiveTheme === "mid";
  return <BackgroundContent
    reduceMotion={reduceMotion}
    isLightTheme={isLightTheme}
    prefsHydrated={!!hydrated}
    themeMode={effectiveTheme || "dark"}
  />;
}
export default memo(BackgroundLayer);
