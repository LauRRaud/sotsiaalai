"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export default function RouteTransitionMask() {
  const pathname = usePathname();
  const [isActive, setIsActive] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [maskOpacity, setMaskOpacity] = useState(0.92);
  const prevPathRef = useRef(pathname);
  const timersRef = useRef([]);
  const fadeOutDelayMs = 90;
  const fadeOutDurationMs = 260;
  const fadeOutTotalMs = fadeOutDelayMs + fadeOutDurationMs;

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  }, []);

  const activateMask = useCallback(
    ({ delayMs = 0, opacity = 0.92 } = {}) => {
      clearTimers();
      setMaskOpacity(opacity);
      setIsFadingOut(false);
      if (delayMs > 0) {
        timersRef.current.push(
          window.setTimeout(() => {
            setIsActive(true);
          }, delayMs),
        );
        return;
      }
      setIsActive(true);
    },
    [clearTimers],
  );

  useEffect(() => {
    const onStart = (event) => {
      activateMask(event?.detail || {});
    };

    window.addEventListener("sotsiaalai:route-transition", onStart);
    return () => {
      window.removeEventListener("sotsiaalai:route-transition", onStart);
      clearTimers();
    };
  }, [activateMask, clearTimers]);

  useEffect(() => {
    const onPopState = () => {
      activateMask();
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [activateMask]);

  useEffect(() => {
    const onClick = (event) => {
      if (event.button !== 0) return;
      if (event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) return;
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;
      if (target.closest(".three-d-card")) return;
      const anchor = target.closest("a[href]");
      if (!anchor) return;
      if (anchor.closest("[data-route-mask=\"off\"]")) return;
      if (anchor.hasAttribute("download")) return;
      const targetAttr = anchor.getAttribute("target");
      if (targetAttr && targetAttr !== "_self") return;
      const href = anchor.getAttribute("href") || "";
      if (!href || href.startsWith("#")) return;
      if (href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) return;
      let url;
      try {
        url = new URL(href, window.location.origin);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      activateMask();
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [activateMask]);

  useEffect(() => {
    if (!isActive) {
      prevPathRef.current = pathname;
      return;
    }
    if (prevPathRef.current === pathname) return;
    prevPathRef.current = pathname;
    timersRef.current.push(
      window.setTimeout(() => setIsFadingOut(true), fadeOutDelayMs),
      window.setTimeout(() => {
        setIsActive(false);
        setIsFadingOut(false);
      }, fadeOutTotalMs),
    );
  }, [isActive, pathname]);

  const classes = ["route-transition-mask"];
  if (isActive) classes.push("is-active");
  if (isFadingOut) classes.push("is-fade-out");

  return <div className={classes.join(" ")} aria-hidden="true" style={{ "--route-mask-opacity": maskOpacity }} />;
}
