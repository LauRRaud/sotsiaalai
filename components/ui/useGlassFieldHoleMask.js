"use client";

import { useLayoutEffect } from "react";

const ROUTE_TILT_STATE_EVENT = "sotsiaalai:glass-ring-tilt-state";
const TILT_ACTIVE_FLAG_KEY = "__SOTSIAALAI_GLASS_RING_TILT_ACTIVE";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function encodeSvgMask(svg) {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

function roundedRectPath(x, y, width, height, radius) {
  const r = clamp(radius, 0, Math.min(width, height) / 2);
  const right = x + width;
  const bottom = y + height;
  return [
    `M ${x + r} ${y}`,
    `H ${right - r}`,
    `A ${r} ${r} 0 0 1 ${right} ${y + r}`,
    `V ${bottom - r}`,
    `A ${r} ${r} 0 0 1 ${right - r} ${bottom}`,
    `H ${x + r}`,
    `A ${r} ${r} 0 0 1 ${x} ${bottom - r}`,
    `V ${y + r}`,
    `A ${r} ${r} 0 0 1 ${x + r} ${y}`,
    "Z"
  ].join(" ");
}

function localHoleRect(target, root) {
  const rect = target.getBoundingClientRect();
  const rootRect = root.getBoundingClientRect();
  const width = rect.width || target.offsetWidth || 0;
  const height = rect.height || target.offsetHeight || 0;
  if (width <= 1 || height <= 1) return null;
  const rootWidth = rootRect.width || root.offsetWidth || 0;
  const rootHeight = rootRect.height || root.offsetHeight || 0;
  if (!rootWidth || !rootHeight) return null;
  const targetStyle = getComputedStyle(target);
  const insetX = Math.max(
    0,
    Number.parseFloat(targetStyle.getPropertyValue("--glass-field-hole-inset-x")) || 0
  );
  const insetY = Math.max(
    0,
    Number.parseFloat(targetStyle.getPropertyValue("--glass-field-hole-inset-y")) || 0
  );
  const x = clamp(rect.left - rootRect.left + insetX, 0, rootWidth);
  const y = clamp(rect.top - rootRect.top + insetY, 0, rootHeight);
  const w = clamp(width - insetX * 2, 0, rootWidth - x);
  const h = clamp(height - insetY * 2, 0, rootHeight - y);
  if (w <= 1 || h <= 1) return null;
  const radiusRaw = Number.parseFloat(targetStyle.borderTopLeftRadius);
  const radius = Number.isFinite(radiusRaw) ? radiusRaw : h / 2;
  return { x, y, w, h, radius };
}

function buildMask(rootWidth, rootHeight, holes) {
  if (!rootWidth || !rootHeight || !holes.length) {
    return "linear-gradient(#fff,#fff)";
  }
  const outerPath = `M 0 0 H ${rootWidth} V ${rootHeight} H 0 Z`;
  const holePaths = holes
    .map((hole) =>
      roundedRectPath(
        hole.x,
        hole.y,
        hole.w,
        hole.h,
        clamp(hole.radius, 0, Math.min(hole.w, hole.h) / 2)
      )
    )
    .join(" ");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${rootWidth} ${rootHeight}" preserveAspectRatio="none"><path fill="white" fill-rule="evenodd" d="${outerPath} ${holePaths}"/></svg>`;
  return encodeSvgMask(svg);
}

function buildClipPath(rootWidth, rootHeight, holes) {
  if (!rootWidth || !rootHeight || !holes.length) return "";
  const outerPath = `M 0 0 H ${rootWidth} V ${rootHeight} H 0 Z`;
  const holePaths = holes
    .map((hole) =>
      roundedRectPath(
        hole.x,
        hole.y,
        hole.w,
        hole.h,
        clamp(hole.radius, 0, Math.min(hole.w, hole.h) / 2)
      )
    )
    .join(" ");
  return `path(evenodd, "${outerPath} ${holePaths}")`;
}

export default function useGlassFieldHoleMask({
  rootRef,
  maskLayerRef,
  selectors,
  enabled = true
}) {
  useLayoutEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    const root = rootRef?.current;
    if (!root || !Array.isArray(selectors) || selectors.length === 0) return;

    let raf = 0;
    let lastMask = "";
    let freezeGeometryDuringTilt = false;
    let pendingAfterTilt = false;
    let retryCount = 0;

    const isTiltActive = () => Boolean(window[TILT_ACTIVE_FLAG_KEY]);

    const clearMask = () => {
      root.style.removeProperty("--glass-field-hole-mask");
      maskLayerRef?.current?.style?.removeProperty("--glass-field-hole-mask");
      maskLayerRef?.current?.style?.removeProperty("-webkit-mask-image");
      maskLayerRef?.current?.style?.removeProperty("mask-image");
      maskLayerRef?.current?.style?.removeProperty("-webkit-clip-path");
      maskLayerRef?.current?.style?.removeProperty("clip-path");
    };

    const updateMask = () => {
      if (freezeGeometryDuringTilt) {
        pendingAfterTilt = true;
        return;
      }
      const rootRect = root.getBoundingClientRect();
      const rootWidth = rootRect.width || root.offsetWidth || 0;
      const rootHeight = rootRect.height || root.offsetHeight || 0;
      if (!rootWidth || !rootHeight) {
        if (!lastMask) clearMask();
        if (retryCount < 12) {
          retryCount += 1;
          window.setTimeout(scheduleUpdate, 120);
        }
        return;
      }

      const targets = selectors.flatMap((selector) =>
        Array.from(root.querySelectorAll(selector))
      );
      const holes = targets
        .map((target) => localHoleRect(target, root))
        .filter(Boolean);
      if (!holes.length && targets.length) {
        if (lastMask) {
          pendingAfterTilt = true;
        }
        if (retryCount < 12) {
          retryCount += 1;
          window.setTimeout(scheduleUpdate, 120);
        }
        return;
      }
      if (!holes.length && lastMask && isTiltActive()) return;
      retryCount = 0;
      const mask = buildMask(rootWidth, rootHeight, holes);
      if (mask === lastMask) return;
      lastMask = mask;
      root.style.setProperty("--glass-field-hole-mask", mask);
      const maskLayer = maskLayerRef?.current;
      if (maskLayer) {
        const clipPath = buildClipPath(rootWidth, rootHeight, holes);
        maskLayer.style.setProperty("--glass-field-hole-mask", mask);
        maskLayer.style.setProperty("-webkit-mask-image", mask);
        maskLayer.style.setProperty("mask-image", mask);
        if (clipPath) {
          maskLayer.style.setProperty("-webkit-clip-path", clipPath);
          maskLayer.style.setProperty("clip-path", clipPath);
        } else {
          maskLayer.style.removeProperty("-webkit-clip-path");
          maskLayer.style.removeProperty("clip-path");
        }
      }
    };

    const scheduleUpdate = () => {
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(updateMask);
    };

    const updateBeforeTiltFreeze = () => {
      freezeGeometryDuringTilt = false;
      window.cancelAnimationFrame(raf);
      updateMask();
      freezeGeometryDuringTilt = true;
      pendingAfterTilt = false;
    };

    const onTiltState = (event) => {
      const active = Boolean(event?.detail?.active);
      if (active) {
        updateBeforeTiltFreeze();
        return;
      }
      freezeGeometryDuringTilt = false;
      if (pendingAfterTilt) {
        pendingAfterTilt = false;
        scheduleUpdate();
        return;
      }
      scheduleUpdate();
    };

    const onAnimationStart = (event) => {
      if (!String(event?.animationName || "").includes("glassRingTilt")) return;
      updateBeforeTiltFreeze();
    };

    const onAnimationEnd = (event) => {
      if (!String(event?.animationName || "").includes("glassRingTilt")) return;
      freezeGeometryDuringTilt = false;
      scheduleUpdate();
    };

    if (isTiltActive()) {
      updateBeforeTiltFreeze();
    } else {
      scheduleUpdate();
    }
    const settleTimers = [0, 60, 160, 320, 600, 900].map((delay) =>
      window.setTimeout(scheduleUpdate, delay)
    );
    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(scheduleUpdate)
        : null;
    resizeObserver?.observe(root);
    selectors.forEach((selector) => {
      root.querySelectorAll(selector).forEach((target) => resizeObserver?.observe(target));
    });

    const mutationObserver =
      typeof MutationObserver !== "undefined"
        ? new MutationObserver(scheduleUpdate)
        : null;
    mutationObserver?.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style", "hidden", "aria-hidden", "data-state"]
    });

    root.addEventListener("scroll", scheduleUpdate, true);
    root.addEventListener("animationstart", onAnimationStart);
    root.addEventListener("animationend", onAnimationEnd);
    root.addEventListener("transitionstart", scheduleUpdate);
    root.addEventListener("transitionrun", scheduleUpdate);
    root.addEventListener("transitionend", scheduleUpdate);
    window.addEventListener(ROUTE_TILT_STATE_EVENT, onTiltState);
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("scroll", scheduleUpdate, true);
    document.fonts?.ready?.then?.(scheduleUpdate).catch?.(() => {});

    return () => {
      window.cancelAnimationFrame(raf);
      settleTimers.forEach((timer) => window.clearTimeout(timer));
      resizeObserver?.disconnect?.();
      mutationObserver?.disconnect?.();
      root.removeEventListener("scroll", scheduleUpdate, true);
      root.removeEventListener("animationstart", onAnimationStart);
      root.removeEventListener("animationend", onAnimationEnd);
      root.removeEventListener("transitionstart", scheduleUpdate);
      root.removeEventListener("transitionrun", scheduleUpdate);
      root.removeEventListener("transitionend", scheduleUpdate);
      window.removeEventListener(ROUTE_TILT_STATE_EVENT, onTiltState);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("scroll", scheduleUpdate, true);
    };
  }, [enabled, maskLayerRef, rootRef, selectors]);
}
