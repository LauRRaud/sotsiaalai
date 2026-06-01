"use client";

import { useEffect, useLayoutEffect, useRef, useState, memo } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { useAccessibility } from "@/components/accessibility/AccessibilityProvider";
import { WORKSPACE_PANEL_MORPH_MS } from "@/lib/workspacePanelMorph";
import dynamic from "next/dynamic";
import ColorBends from "./ColorBends";
const Particles = dynamic(() => import("./Particles"), {
  ssr: false
});
const MaybeSplash = dynamic(() => import("../MaybeSplash"), {
  ssr: false
});
const COLOR_BENDS_EXCLUDED_PATHS = new Set([
  "/kasutusjuhend",
  "/kasutustingimused",
  "/privaatsustingimused",
  "/hinnastus",
  "/voimalused"
]);
const BACKGROUND_LAYER_EXCLUDED_PATHS = new Set([]);
const PARTICLES_EXCLUDED_PATHS = new Set([
  "/teenusekaart"
]);
const MOBILE_COLOR_BENDS_READY_PATHS = new Set([]);
const COLOR_BENDS_OPACITY_DEFAULT = 0.78;
const COLOR_BENDS_OPACITY_LIGHT = 0.77;
const COLOR_BENDS_OPACITY_MONO = 0.78;
const COLOR_BENDS_OPACITY_HC = 0.18;
const COLOR_BENDS_OPACITY_FULL = 1;
const COLOR_BENDS_SPEED_DESKTOP = 0.15;
const COLOR_BENDS_SPEED_MOBILE = 0;
const COLOR_BENDS_ROTATION_SPEED_DESKTOP = 0;
const COLOR_BENDS_ROTATION_SPEED_MOBILE = 0;
const WORKSPACE_MORPH_BACKGROUND_PAUSE_MS = WORKSPACE_PANEL_MORPH_MS + 240;
const MOBILE_HOME_BENDS_OPACITY_FLOOR_RATIO = 0.22;
const INITIAL_PREPAINT_MAX_MS = 2400;
function stripLocaleFromPathname(pathname = "/") {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return normalized.replace(/^\/(et|ru|en)(?=\/|$)/, "") || "/";
}

function detectMobileLikeDevice() {
  if (typeof window === "undefined") return false;
  const mq = query => typeof window.matchMedia === "function" ? window.matchMedia(query)?.matches ?? false : false;
  const small = mq("(max-width: 768px)") || window.innerWidth <= 768;
  const layoutMobile = document.documentElement?.getAttribute("data-layout") === "mobile" || document.body?.getAttribute("data-layout") === "mobile";
  const ua = typeof navigator !== "undefined" ? navigator.userAgent || "" : "";
  const uaMobile = typeof navigator !== "undefined" ? navigator.userAgentData?.mobile ?? /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(ua) : false;
  return small || layoutMobile || uaMobile;
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
  const attrTheme = html.getAttribute("data-theme-mode");
  if (attrTheme === "light" || attrTheme === "mid" || attrTheme === "dark" || attrTheme === "night" || attrTheme === "mono") return attrTheme;
  if (html.classList.contains("theme-mid")) return "mid";
  if (html.classList.contains("theme-night")) return "night";
  if (html.classList.contains("theme-mono")) return "mono";
  if (html.classList.contains("theme-light")) return "light";
  return null;
}
const readDomContrast = () => {
  if (typeof document === "undefined") return null;
  return document.documentElement?.getAttribute("data-contrast") || "normal";
};
function resolvePlatformFromDom() {
  if (typeof document === "undefined") return "";
  return (
    document.documentElement?.getAttribute("data-platform") ||
    document.body?.getAttribute("data-platform") ||
    ""
  );
}
const BackgroundContent = memo(function BackgroundContent({
  reduceMotion = false,
  isLightTheme = false,
  isHomepage = false,
  showColorBends = true,
  showParticles = true,
  forceMobileBendsVisible = false,
  colorBendsColors = ["#7e4442"],
  colorBendsOpacity = COLOR_BENDS_OPACITY_DEFAULT
}) {
  const layerRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [particlesReady, setParticlesReady] = useState(false);
  const [cursorReady, setCursorReady] = useState(false);
  const [mobileBendsVisible, setMobileBendsVisible] = useState(false);
  const [mobileParticlesVisible, setMobileParticlesVisible] = useState(false);
  const [colorBendsPaused, setColorBendsPaused] = useState(false);
  // Keep initial server/client render identical; compute real value after mount.
  const [deviceProfileReady, setDeviceProfileReady] = useState(false);
  const [mobileLike, setMobileLike] = useState(false);
  const [platform, setPlatform] = useState("");
  const mobileBackgroundMode = mobileLike || platform === "android" || platform === "ios";
  const mobileColorBendsPhase = 14;
  const allowParticles = showParticles && deviceProfileReady;
  const backgroundReadyForInitialReveal =
    mounted &&
    deviceProfileReady &&
    (!showColorBends || forceMobileBendsVisible || mobileBendsVisible) &&
    (!showParticles ||
      (particlesReady && (!allowParticles || !mobileBackgroundMode || mobileParticlesVisible)));
  const baseParallaxActive = deviceProfileReady && !reduceMotion && !mobileBackgroundMode;
  // Mobile browser chrome and the homepage's inner scroll container make this
  // parallax feel unstable, so keep particles static there.
  const particlesParallaxActive = false;
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!mounted || typeof document === "undefined" || typeof window === "undefined") return;
    const root = document.documentElement;
    if (!root?.hasAttribute("data-app-prepaint")) return;
    const timeoutId = window.setTimeout(() => {
      root.removeAttribute("data-app-prepaint");
    }, INITIAL_PREPAINT_MAX_MS);
    return () => window.clearTimeout(timeoutId);
  }, [mounted]);
  useLayoutEffect(() => {
    if (
      !backgroundReadyForInitialReveal ||
      typeof document === "undefined" ||
      typeof window === "undefined"
    ) {
      return;
    }
    const root = document.documentElement;
    if (!root?.hasAttribute("data-app-prepaint")) return;
    let rafOne = 0;
    let rafTwo = 0;
    rafOne = window.requestAnimationFrame(() => {
      rafTwo = window.requestAnimationFrame(() => {
        if (!root.hasAttribute("data-app-prepaint")) return;
        root.removeAttribute("data-app-prepaint");
      });
    });
    return () => {
      if (rafOne) window.cancelAnimationFrame(rafOne);
      if (rafTwo) window.cancelAnimationFrame(rafTwo);
    };
  }, [backgroundReadyForInitialReveal]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    let timer = 0;
    const release = () => {
      timer = 0;
      setColorBendsPaused(false);
    };
    const handleRouteTransition = event => {
      if (!event?.detail?.workspacePanelMorph) return;
      setColorBendsPaused(true);
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(release, WORKSPACE_MORPH_BACKGROUND_PAUSE_MS);
    };
    window.addEventListener("sotsiaalai:route-transition", handleRouteTransition);
    return () => {
      window.removeEventListener("sotsiaalai:route-transition", handleRouteTransition);
      if (timer) window.clearTimeout(timer);
    };
  }, []);
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const mql = q => typeof window.matchMedia === "function" ? window.matchMedia(q) : null;
    const small = mql("(max-width: 768px)");
    const html = document.documentElement;
    const body = document.body;
    const compute = () => {
      setMobileLike(detectMobileLikeDevice());
      setPlatform(resolvePlatformFromDom());
      setDeviceProfileReady(true);
    };
    const layoutObserver = new MutationObserver(() => compute());
    if (html) {
      layoutObserver.observe(html, {
        attributes: true,
        attributeFilter: ["data-layout", "data-platform"]
      });
    }
    if (body) {
      layoutObserver.observe(body, {
        attributes: true,
        attributeFilter: ["data-layout", "data-platform"]
      });
    }
    compute();
    const rafId = window.requestAnimationFrame(() => compute());
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
    const cleanups = [attach(small)];
    window.addEventListener("resize", compute);
    return () => {
      layoutObserver.disconnect();
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", compute);
      cleanups.forEach(fn => fn?.());
    };
  }, []);
  useEffect(() => {
    if (!mounted) return;
    setParticlesReady(true);
  }, [mounted]);
  useEffect(() => {
    if (!mounted || !deviceProfileReady) return;
    setMobileBendsVisible(true);
  }, [mounted, deviceProfileReady, mobileBackgroundMode]);
  useEffect(() => {
    if (
      !mounted ||
      !deviceProfileReady ||
      !particlesReady ||
      !allowParticles
    ) {
      setMobileParticlesVisible(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setMobileParticlesVisible(true);
    }, mobileBackgroundMode ? 0 : 120);

    return () => window.clearTimeout(timeoutId);
  }, [
    mounted,
    deviceProfileReady,
    particlesReady,
    allowParticles,
    mobileBackgroundMode
  ]);
  useEffect(() => {
    if (!mounted) return;
    if (!deviceProfileReady || reduceMotion || mobileBackgroundMode) {
      setCursorReady(false);
      return;
    }
    const cancelCursor = whenVisible(() => onIdle(() => setCursorReady(true), 1200));
    return () => cancelCursor?.();
  }, [mounted, deviceProfileReady, reduceMotion, mobileBackgroundMode]);
  useEffect(() => {
    const el = layerRef.current;
    if (!el || typeof window === "undefined") return;
    el.style.setProperty("--saai-parallax-space", "0px");
    el.style.setProperty("--saai-bends-opacity", String(colorBendsOpacity));
    el.style.setProperty("--saai-parallax-particles", "0px");
    el.style.setProperty("--saai-bg-dim", "0");
    if (!baseParallaxActive) return;
    let raf = 0;
    let homepageRoot = null;
    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
    const isUsableElement = value => value instanceof HTMLElement;
    const getHomepageRoot = () => {
      if (!isHomepage) return null;
      const root = document.querySelector(".homepage-root");
      return isUsableElement(root) ? root : null;
    };
    const resolveScrollY = () => {
      homepageRoot = getHomepageRoot();
      const rootIsScrollable =
        isUsableElement(homepageRoot) &&
        homepageRoot.scrollHeight > homepageRoot.clientHeight + 1;
      if (rootIsScrollable) {
        return homepageRoot.scrollTop;
      }
      return (
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body?.scrollTop ||
        0
      );
    };
    const update = () => {
      raf = 0;
      const y = resolveScrollY();
      const spaceY = -clamp(y * 0.07, 0, 160);
      const particlesY = -clamp(y * 0.15, 0, 260);
      el.style.setProperty("--saai-parallax-space", `${spaceY.toFixed(2)}px`);
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
    homepageRoot = getHomepageRoot();
    if (homepageRoot) {
      homepageRoot.addEventListener("scroll", onScroll, {
        passive: true
      });
    }
    window.addEventListener("resize", onScroll);
    window.visualViewport?.addEventListener("resize", onScroll);
    return () => {
      if (homepageRoot) {
        homepageRoot.removeEventListener("scroll", onScroll);
      }
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.visualViewport?.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [reduceMotion, baseParallaxActive, isHomepage, colorBendsOpacity]);
  useEffect(() => {
    const el = layerRef.current;
    if (!el || typeof window === "undefined") return;
    el.style.setProperty("--saai-bends-opacity", String(colorBendsOpacity));
    if (!isHomepage) return;
    let raf = 0;
    let homepageRoot = null;
    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
    const isUsableElement = value => value instanceof HTMLElement;
    const getHomepageRoot = () => {
      const root = document.querySelector(".homepage-root");
      return isUsableElement(root) ? root : null;
    };
    const resolveScrollY = () => {
      homepageRoot = getHomepageRoot();
      const rootIsScrollable =
        isUsableElement(homepageRoot) &&
        homepageRoot.scrollHeight > homepageRoot.clientHeight + 1;
      if (rootIsScrollable) {
        return homepageRoot.scrollTop;
      }
      return (
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body?.scrollTop ||
        0
      );
    };
    const update = () => {
      raf = 0;
      const y = resolveScrollY();
      const viewportHeight =
        window.visualViewport?.height ||
        window.innerHeight ||
        document.documentElement.clientHeight ||
        1;
      const bendsOpacity = mobileBackgroundMode
        ? (() => {
            const fadeStart = Math.min(120, viewportHeight * 0.16);
            const fadeDistance = Math.max(220, viewportHeight * 0.48);
            const progress = clamp((y - fadeStart) / fadeDistance, 0, 1);
            const floorOpacity = colorBendsOpacity * MOBILE_HOME_BENDS_OPACITY_FLOOR_RATIO;
            return colorBendsOpacity - progress * (colorBendsOpacity - floorOpacity);
          })()
        : (1 - clamp((y - 240) / 220, 0, 1)) * colorBendsOpacity;
      el.style.setProperty("--saai-bends-opacity", bendsOpacity.toFixed(3));
    };
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    homepageRoot = getHomepageRoot();
    if (homepageRoot) {
      homepageRoot.addEventListener("scroll", onScroll, { passive: true });
    }
    window.addEventListener("resize", onScroll);
    window.visualViewport?.addEventListener("resize", onScroll);
    return () => {
      if (homepageRoot) {
        homepageRoot.removeEventListener("scroll", onScroll);
      }
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.visualViewport?.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [isHomepage, mobileBackgroundMode, colorBendsOpacity]);
  useEffect(() => {
    const el = layerRef.current;
    if (!el || typeof window === "undefined") return;
    el.style.setProperty("--saai-parallax-particles", "0px");
    if (!particlesParallaxActive) return;
    let raf = 0;
    let bindRetry = 0;
    let homepageRoot = null;
    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
    const isUsableElement = value => value instanceof HTMLElement;
    const getHomepageRoot = () => {
      const root = document.querySelector(".homepage-root");
      return isUsableElement(root) ? root : null;
    };
    const resolveScrollY = () => {
      homepageRoot = getHomepageRoot();
      const rootIsScrollable =
        isUsableElement(homepageRoot) &&
        homepageRoot.scrollHeight > homepageRoot.clientHeight + 1;
      if (rootIsScrollable) {
        return homepageRoot.scrollTop;
      }
      return (
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body?.scrollTop ||
        0
      );
    };
    const update = () => {
      raf = 0;
      const y = resolveScrollY();
      const particlesY = -clamp(y * 0.15, 0, 260);
      el.style.setProperty("--saai-parallax-particles", `${particlesY.toFixed(2)}px`);
    };
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(update);
    };
    const attach = () => {
      homepageRoot = getHomepageRoot();
      if (!homepageRoot && !document.scrollingElement && !document.documentElement) {
        bindRetry = window.requestAnimationFrame(attach);
        return;
      }
      window.addEventListener("scroll", onScroll, { passive: true });
      if (homepageRoot) {
        homepageRoot.addEventListener("scroll", onScroll, { passive: true });
      }
      window.addEventListener("resize", onScroll);
      window.visualViewport?.addEventListener("resize", onScroll);
      update();
    };
    attach();
    return () => {
      if (bindRetry) window.cancelAnimationFrame(bindRetry);
      if (homepageRoot) {
        homepageRoot.removeEventListener("scroll", onScroll);
      }
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.visualViewport?.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [particlesParallaxActive]);
  return <>
      {}
      <div
        data-bg-layer
        ref={layerRef}
        data-page={isHomepage ? "home" : "subpage"}
        data-parallax={baseParallaxActive ? "on" : "off"}
        data-particles-parallax={particlesParallaxActive ? "on" : "off"}
        data-mobile-bends={forceMobileBendsVisible || mobileBendsVisible ? "ready" : "pending"}
        style={{ "--saai-bends-opacity": colorBendsOpacity }}
        aria-hidden="true"
        suppressHydrationWarning
      >
        <div className="bg-space-layer" aria-hidden="true">
          <div
            className="space-backdrop"
            data-mode={isLightTheme ? "light" : "dark"}
          />
        </div>

        {showColorBends && <div className="bg-bends-layer" aria-hidden="true">
            <ColorBends
              colors={colorBendsColors}
              rotation={-58}
              speed={reduceMotion ? 0 : mobileBackgroundMode ? COLOR_BENDS_SPEED_MOBILE : COLOR_BENDS_SPEED_DESKTOP}
              phase={mobileBackgroundMode ? mobileColorBendsPhase : 0}
              scale={1}
              frequency={1}
              warpStrength={1}
              mouseInfluence={reduceMotion ? 0 : 0}
              parallax={reduceMotion ? 0 : 0}
              scrollParallax={baseParallaxActive ? isHomepage ? 0.46 : 0.16 : 0}
              scrollParallaxMax={isHomepage ? 0.56 : 0.28}
              scrollContainerSelector={isHomepage ? ".homepage-root" : ""}
              noise={0}
              transparent
              autoRotate={reduceMotion ? 0 : mobileBackgroundMode ? COLOR_BENDS_ROTATION_SPEED_MOBILE : COLOR_BENDS_ROTATION_SPEED_DESKTOP}
              paused={colorBendsPaused}
            />
          </div>}

        {}
        {deviceProfileReady && particlesReady && allowParticles && <div
            className="bg-particles-layer"
            data-mobile-visible={mobileParticlesVisible ? "ready" : "pending"}
          >
            <Particles freeze={reduceMotion} />
          </div>}

      </div>

      {}
      {mounted && deviceProfileReady && cursorReady && typeof document !== "undefined" && !reduceMotion && !mobileBackgroundMode && createPortal(<div className="splash-cursor" aria-hidden="true">
            <MaybeSplash />
          </div>, document.body)}
    </>;
});
function BackgroundLayer() {
  const {
    prefs
  } = useAccessibility();
  const pathname = usePathname();
  const [domTheme, setDomTheme] = useState(resolveThemeFromDom);
  const [domContrast, setDomContrast] = useState(readDomContrast);
  const [domReduceMotion, setDomReduceMotion] = useState(null);
  const isHomepage = pathname === "/";
  useEffect(() => {
    if (typeof document === "undefined") return;
    const html = document.documentElement;
    const apply = () => {
      setDomTheme(resolveThemeFromDom());
      setDomContrast(html.getAttribute("data-contrast") || "normal");
      setDomReduceMotion(html.getAttribute("data-reduce-motion") === "1");
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(html, {
      attributes: true,
      attributeFilter: ["class", "data-theme-mode", "data-contrast", "data-reduce-motion"]
    });
    return () => observer.disconnect();
  }, []);
  const liveDomContrast = readDomContrast();
  const effectiveTheme = domTheme || prefs?.theme;
  const effectiveContrast = liveDomContrast ?? domContrast ?? prefs?.contrast ?? "normal";
  const isHighContrast = effectiveContrast === "hc";
  const effectiveReduceMotion = domReduceMotion ?? !!prefs?.reduceMotion;
  const normalizedPathname = stripLocaleFromPathname(pathname || "/");
  if (BACKGROUND_LAYER_EXCLUDED_PATHS.has(normalizedPathname)) return null;

  const showColorBends = !COLOR_BENDS_EXCLUDED_PATHS.has(normalizedPathname);
  const showParticles = !PARTICLES_EXCLUDED_PATHS.has(normalizedPathname);
  const forceMobileBendsVisible = MOBILE_COLOR_BENDS_READY_PATHS.has(normalizedPathname);
  const isLightTheme =
    effectiveTheme === "light" ||
    effectiveTheme === "mid";
  const colorBendsColors =
    isHighContrast
      ? ["#ffea00"]
      : effectiveTheme === "mono"
      ? ["#3d3d3d"]
      : effectiveTheme === "mid"
      ? ["#794f4c"]
      : ["#7e4442"];
  const colorBendsOpacity =
    isHighContrast
      ? COLOR_BENDS_OPACITY_HC
      : effectiveTheme === "light"
      ? COLOR_BENDS_OPACITY_LIGHT
      : effectiveTheme === "mono"
      ? COLOR_BENDS_OPACITY_MONO
      : effectiveTheme === "mid"
      ? COLOR_BENDS_OPACITY_FULL
      : COLOR_BENDS_OPACITY_DEFAULT;
  return <BackgroundContent
    reduceMotion={effectiveReduceMotion}
    isLightTheme={isLightTheme}
    isHomepage={isHomepage}
    showColorBends={showColorBends}
    showParticles={showParticles}
    forceMobileBendsVisible={forceMobileBendsVisible}
    colorBendsColors={colorBendsColors}
    colorBendsOpacity={colorBendsOpacity}
  />;
}
export default memo(BackgroundLayer);
