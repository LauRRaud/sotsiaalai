"use client";

import { createElement, useLayoutEffect, useRef } from "react";
import { cn } from "@/components/ui/cn";

const MOBILE_MEDIA_QUERY = "(max-width: 768px)";

export default function AutoFitPageTitle({
  as = "h1",
  className,
  children,
  minFontPx = 16,
  mobileOnly = true,
  ...props
}) {
  const titleRef = useRef(null);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return undefined;
    const node = titleRef.current;
    if (!(node instanceof HTMLElement)) return undefined;

    let rafId = 0;
    let resizeObserver = null;

    const fit = () => {
      const isMobileViewport =
        !mobileOnly || window.matchMedia(MOBILE_MEDIA_QUERY).matches;

      node.style.removeProperty("font-size");
      node.style.removeProperty("--fit-title-font-size");

      if (!isMobileViewport) return;

      const availableWidth = node.clientWidth;
      if (!availableWidth) return;

      const computedStyle = window.getComputedStyle(node);
      const baseFontPx = Number.parseFloat(computedStyle.fontSize) || 16;
      const minFont = Math.min(baseFontPx, minFontPx);

      if (node.scrollWidth <= availableWidth + 1) return;

      let low = minFont;
      let high = baseFontPx;
      let best = minFont;

      for (let index = 0; index < 12; index += 1) {
        const mid = (low + high) / 2;
        node.style.fontSize = `${mid}px`;

        if (node.scrollWidth <= availableWidth + 1) {
          best = mid;
          low = mid;
        } else {
          high = mid;
        }
      }

      node.style.fontSize = `${best}px`;
      node.style.setProperty("--fit-title-font-size", `${best}px`);
    };

    const scheduleFit = () => {
      window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(fit);
    };

    scheduleFit();

    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(scheduleFit);
      resizeObserver.observe(node);
      if (node.parentElement instanceof HTMLElement) {
        resizeObserver.observe(node.parentElement);
      }
    }

    window.addEventListener("resize", scheduleFit);
    document.fonts?.ready?.then?.(scheduleFit).catch?.(() => {});

    return () => {
      window.cancelAnimationFrame(rafId);
      resizeObserver?.disconnect?.();
      window.removeEventListener("resize", scheduleFit);
    };
  }, [children, minFontPx, mobileOnly]);

  return createElement(
    as,
    {
      ...props,
      ref: titleRef,
      className: cn(className)
    },
    children
  );
}
