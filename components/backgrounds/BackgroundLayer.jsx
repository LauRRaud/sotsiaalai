"use client";

import { useEffect, useLayoutEffect, useRef, useState, memo } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { useAccessibility } from "@/components/accessibility/AccessibilityProvider";
import dynamic from "next/dynamic";
import ColorBends from "./ColorBends";
const Particles = dynamic(() => import("./Particles"), {
  ssr: false
});
const MaybeSplash = dynamic(() => import("../MaybeSplash"), {
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
function resolveDisplayModeFromDom() {
  if (typeof document === "undefined") return "browser";
  return (
    document.documentElement?.getAttribute("data-display-mode") ||
    document.body?.getAttribute("data-display-mode") ||
    "browser"
  );
}
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
  colorBendsColors = ["#7e4442"]
}) {
  const layerRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [particlesReady, setParticlesReady] = useState(false);
  const [cursorReady, setCursorReady] = useState(false);
  // Keep initial server/client render identical; compute real value after mount.
  const [deviceProfileReady, setDeviceProfileReady] = useState(false);
  const [mobileLike, setMobileLike] = useState(false);
  const [displayMode, setDisplayMode] = useState("browser");
  const [platform, setPlatform] = useState("");
  const browserMobileMode =
    displayMode === "browser" && (mobileLike || platform === "android" || platform === "ios");
  const mobileBackgroundMode = mobileLike || browserMobileMode;
  const mobileColorBendsPhase = 14;
  const allowParticles = deviceProfileReady;
  const baseParallaxActive = deviceProfileReady && !reduceMotion && !mobileBackgroundMode;
  const particlesParallaxActive =
    deviceProfileReady && !reduceMotion && isHomepage && browserMobileMode;
  useEffect(() => setMounted(true), []);
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const mql = q => typeof window.matchMedia === "function" ? window.matchMedia(q) : null;
    const coarse = mql("(pointer: coarse)");
    const noHover = mql("(hover: none)");
    const small = mql("(max-width: 768px)");
    const html = document.documentElement;
    const body = document.body;
    const compute = () => {
      setMobileLike(detectMobileLikeDevice());
      setDisplayMode(resolveDisplayModeFromDom());
      setPlatform(resolvePlatformFromDom());
      setDeviceProfileReady(true);
    };
    const layoutObserver = new MutationObserver(() => compute());
    if (html) {
      layoutObserver.observe(html, {
        attributes: true,
        attributeFilter: ["data-layout", "data-display-mode", "data-platform"]
      });
    }
    if (body) {
      layoutObserver.observe(body, {
        attributes: true,
        attributeFilter: ["data-layout", "data-display-mode", "data-platform"]
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
    const cleanups = [attach(coarse), attach(noHover), attach(small)];
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
    el.style.setProperty("--saai-parallax-particles", "0px");
    el.style.setProperty("--saai-bg-dim", "0");
    if (!baseParallaxActive) return;
    let raf = 0;
    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
    const update = () => {
      raf = 0;
      const y = window.scrollY || document.documentElement.scrollTop || 0;
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
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [reduceMotion, baseParallaxActive]);
  useEffect(() => {
    const el = layerRef.current;
    if (!el || typeof window === "undefined") return;
    el.style.setProperty("--saai-parallax-particles", "0px");
    if (!particlesParallaxActive) return;
    let raf = 0;
    let bindRetry = 0;
    let scrollHost = null;
    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
    const isUsableElement = value => value instanceof HTMLElement;
    const resolveScrollBinding = () => {
      const homepageRoot = document.querySelector(".homepage-root");
      const rootIsScrollable =
        isUsableElement(homepageRoot) &&
        homepageRoot.scrollHeight > homepageRoot.clientHeight + 1;
      if (
        resolveDisplayModeFromDom() === "browser" &&
        rootIsScrollable
      ) {
        return homepageRoot;
      }
      return document.scrollingElement || document.documentElement;
    };
    const getScrollY = () => {
      const activeHost = resolveScrollBinding();
      scrollHost = activeHost;
      if (isUsableElement(activeHost) && typeof activeHost.scrollTop === "number") {
        return activeHost.scrollTop;
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
      const y = getScrollY();
      const particlesY = -clamp(y * 0.15, 0, 260);
      el.style.setProperty("--saai-parallax-particles", `${particlesY.toFixed(2)}px`);
    };
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(update);
    };
    const attach = () => {
      scrollHost = resolveScrollBinding();
      if (!scrollHost) {
        bindRetry = window.requestAnimationFrame(attach);
        return;
      }
      window.addEventListener("scroll", onScroll, { passive: true });
      if (isUsableElement(scrollHost)) {
        scrollHost.addEventListener("scroll", onScroll, { passive: true });
      }
      window.addEventListener("resize", onScroll);
      window.visualViewport?.addEventListener("resize", onScroll);
      update();
    };
    attach();
    return () => {
      if (bindRetry) window.cancelAnimationFrame(bindRetry);
      if (isUsableElement(scrollHost)) {
        scrollHost.removeEventListener("scroll", onScroll);
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
        aria-hidden="true"
        suppressHydrationWarning
      >
        <div className="bg-space-layer" aria-hidden="true">
          <div
            className="space-backdrop"
            data-mode={isLightTheme ? "light" : "dark"}
          />
        </div>

        <div className="bg-bends-layer" aria-hidden="true">
            <ColorBends
              colors={colorBendsColors}
              rotation={-58}
              speed={mobileBackgroundMode ? 0 : 0.15}
              phase={mobileBackgroundMode ? mobileColorBendsPhase : 0}
              scale={1}
              frequency={1}
              warpStrength={1}
              mouseInfluence={0}
              parallax={0}
              noise={0}
              transparent
              autoRotate={0}
            />
          </div>

        {}
        {deviceProfileReady && particlesReady && allowParticles && <div className="bg-particles-layer">
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
  const [domTheme, setDomTheme] = useState(null);
  const reduceMotion = !!prefs?.reduceMotion;
  const isHomepage = pathname === "/";
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
    effectiveTheme === "mid";
  const colorBendsColors =
    effectiveTheme === "mid" || effectiveTheme === "light"
      ? ["#794f4c"]
      : ["#7e4442"];
  return <BackgroundContent
    reduceMotion={reduceMotion}
    isLightTheme={isLightTheme}
    isHomepage={isHomepage}
    colorBendsColors={colorBendsColors}
  />;
}
export default memo(BackgroundLayer);
