import { useLayoutEffect } from "react";

const TILT_ACTIVE_FLAG_KEY = "__SOTSIAALAI_GLASS_RING_TILT_ACTIVE";
const ROUTE_TILT_STATE_EVENT = "sotsiaalai:glass-ring-tilt-state";
const MOBILE_VIEWPORT_QUERY = "(max-width: 768px)";
const COARSE_POINTER_QUERY = "(hover: none) and (pointer: coarse)";
const MOBILE_MASK_UPDATE_INTERVAL_MS = 48;

export function useChatInputHoleMask({
  containerRef,
  inputRowRef,
  inputBarRef,
  maskLayerRef,
  enabled,
  refreshRef
}) {
  useLayoutEffect(() => {
    const box = containerRef?.current;
    const inputRow = inputRowRef?.current;
    const inputBar = inputBarRef?.current;
    const maskLayer = maskLayerRef?.current;
    const clearHoleGeometryVars = () => {
      box?.style?.removeProperty("--chat-hole-x");
      box?.style?.removeProperty("--chat-hole-y");
      box?.style?.removeProperty("--chat-hole-w");
      box?.style?.removeProperty("--chat-hole-h");
    };
    if (!box || !inputBar) return;
    if (!enabled) {
      box.style.removeProperty("--chat-input-hole-mask");
      clearHoleGeometryVars();
      if (maskLayer) {
        maskLayer.style.removeProperty("--chat-input-hole-mask");
        maskLayer.style.setProperty("-webkit-mask-image", "none");
        maskLayer.style.setProperty("mask-image", "none");
      }
      return;
    }
    const isMobileViewport =
      Boolean(window.matchMedia?.(MOBILE_VIEWPORT_QUERY)?.matches) ||
      Boolean(window.matchMedia?.(COARSE_POINTER_QUERY)?.matches) ||
      window.innerWidth <= 768;
    const snapStep = isMobileViewport ? 1 : 0.5;
    const snap = value => Math.round(value / snapStep) * snapStep;
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const encodeSvgMask = svg => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
    const getLocalRect = (el, root) => {
      if (!el || !root) return null;
      const rect = el.getBoundingClientRect();
      const rootRect = root.getBoundingClientRect();
      let w = rect.width;
      let h = rect.height;
      if (!w || !h) {
        w = el.offsetWidth || 0;
        h = el.offsetHeight || 0;
      }
      if (!w || !h) return null;
      return {
        x: snap(rect.left - rootRect.left),
        y: snap(rect.top - rootRect.top),
        w: snap(w),
        h: snap(h)
      };
    };
    let lastMask = "";
    let raf = 0;
    let rafLoop = 0;
    let loopUntil = 0;
    let mobileThrottleTimer = 0;
    let pendingAfterTilt = false;
    let retryCount = 0;
    let lastMaskRunAt = 0;
    let lastGeometry = "";
    const isTiltActive = () =>
      typeof window !== "undefined" && Boolean(window[TILT_ACTIVE_FLAG_KEY]);
    const nowMs = () =>
      typeof performance !== "undefined" ? performance.now() : Date.now();
    const roundedRectPath = (x, y, width, height, radius) => {
      const r = clamp(radius, 0, Math.min(width, height) / 2);
      const right = x + width;
      const bottom = y + height;
      return [`M ${x + r} ${y}`, `H ${right - r}`, `A ${r} ${r} 0 0 1 ${right} ${y + r}`, `V ${bottom - r}`, `A ${r} ${r} 0 0 1 ${right - r} ${bottom}`, `H ${x + r}`, `A ${r} ${r} 0 0 1 ${x} ${bottom - r}`, `V ${y + r}`, `A ${r} ${r} 0 0 1 ${x + r} ${y}`, "Z"].join(" ");
    };
    const buildMask = (rootW, rootH, holeRect, radius) => {
      if (!rootW || !rootH || !holeRect?.w || !holeRect?.h) return null;
      const outerPath = `M 0 0 H ${rootW} V ${rootH} H 0 Z`;
      const holePad = 0;
      const holeX = clamp(holeRect.x - holePad, 0, rootW);
      const holeY = clamp(holeRect.y - holePad, 0, rootH);
      const holeW = clamp(holeRect.w + holePad * 2, 0, rootW - holeX);
      const holeH = clamp(holeRect.h + holePad * 2, 0, rootH - holeY);
      const holePath = roundedRectPath(holeX, holeY, holeW, holeH, radius + holePad);
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${rootW} ${rootH}" preserveAspectRatio="none"><path fill="white" fill-rule="evenodd" d="${outerPath} ${holePath}"/></svg>`;
      return encodeSvgMask(svg);
    };
    const scheduleMobileCatchup = () => {
      if (!isMobileViewport || mobileThrottleTimer) return;
      const wait = Math.max(
        0,
        MOBILE_MASK_UPDATE_INTERVAL_MS - (nowMs() - lastMaskRunAt)
      );
      mobileThrottleTimer = window.setTimeout(() => {
        mobileThrottleTimer = 0;
        scheduleUpdate({
          force: true,
          loop: false
        });
      }, wait);
    };
    const scheduleGeometryRetry = () => {
      if (retryCount >= 12) return;
      retryCount += 1;
      window.setTimeout(() => {
        scheduleUpdate({
          force: true,
          loop: false
        });
      }, 120);
    };
    const updateMask = ({ force = false } = {}) => {
      if (isTiltActive() && lastMask) {
        pendingAfterTilt = true;
        return;
      }
      const ts = nowMs();
      if (
        !force &&
        isMobileViewport &&
        ts - lastMaskRunAt < MOBILE_MASK_UPDATE_INTERVAL_MS
      ) {
        scheduleMobileCatchup();
        return;
      }
      if (mobileThrottleTimer) {
        window.clearTimeout(mobileThrottleTimer);
        mobileThrottleTimer = 0;
      }
      lastMaskRunAt = ts;
      const boxRect = box.getBoundingClientRect();
      const boxW = snap(boxRect.width);
      const boxH = snap(boxRect.height);
      if (!boxW || !boxH) {
        scheduleGeometryRetry();
        return;
      }
      const inputLocal = getLocalRect(inputBar, box);
      if (!inputLocal) {
        scheduleGeometryRetry();
        return;
      }
      box.style.setProperty("--chat-hole-x", `${inputLocal.x}px`);
      box.style.setProperty("--chat-hole-y", `${inputLocal.y}px`);
      box.style.setProperty("--chat-hole-w", `${inputLocal.w}px`);
      box.style.setProperty("--chat-hole-h", `${inputLocal.h}px`);
      retryCount = 0;
      const radiusRaw = Number.parseFloat(window.getComputedStyle(inputBar).borderTopLeftRadius);
      const radius = snap(Number.isFinite(radiusRaw) ? radiusRaw : inputLocal.h / 2);
      const geometryKey = `${boxW}|${boxH}|${inputLocal.x}|${inputLocal.y}|${inputLocal.w}|${inputLocal.h}|${radius}`;
      if (geometryKey === lastGeometry && !force) {
        pendingAfterTilt = false;
        return;
      }
      lastGeometry = geometryKey;
      const mask = buildMask(boxW, boxH, inputLocal, radius);
      if (mask && (mask !== lastMask || force)) {
        box.style.setProperty("--chat-input-hole-mask", mask);
        if (maskLayer) {
          maskLayer.style.setProperty("--chat-input-hole-mask", mask);
          maskLayer.style.setProperty("-webkit-mask-image", mask);
          maskLayer.style.setProperty("mask-image", mask);
        }
        lastMask = mask;
      }
      pendingAfterTilt = false;
    };
    const tick = (ts) => {
      if (ts > loopUntil) {
        rafLoop = 0;
        return;
      }
      updateMask();
      rafLoop = window.requestAnimationFrame(tick);
    };
    const startLoop = () => {
      if (isMobileViewport) return;
      const until = nowMs() + 760;
      loopUntil = Math.max(loopUntil, until);
      if (!rafLoop) {
        rafLoop = window.requestAnimationFrame(tick);
      }
    };
    const scheduleUpdate = ({ force = false, loop = true } = {}) => {
      if (isTiltActive() && lastMask) {
        pendingAfterTilt = true;
        return;
      }
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(() => {
        updateMask({
          force
        });
        if (loop) startLoop();
      });
    };
    const onTiltState = event => {
      if (event?.detail?.active) return;
      if (pendingAfterTilt) {
        scheduleUpdate({
          force: true
        });
      }
    };
    const refreshHandler = () => {
      scheduleUpdate({
        force: true,
        loop: false
      });
    };
    if (refreshRef) {
      refreshRef.current = refreshHandler;
    }
    const vv = window.visualViewport;
    updateMask({ force: true });
    scheduleUpdate();
    window.addEventListener(ROUTE_TILT_STATE_EVENT, onTiltState);
    window.addEventListener("resize", scheduleUpdate);
    vv?.addEventListener("resize", scheduleUpdate);
    if (!isMobileViewport) {
      vv?.addEventListener("scroll", scheduleUpdate);
      window.addEventListener("focusin", scheduleUpdate);
      window.addEventListener("focusout", scheduleUpdate);
      window.addEventListener("scroll", scheduleUpdate, true);
      box.addEventListener("scroll", scheduleUpdate);
    }
    box.addEventListener("transitionend", scheduleUpdate);
    inputBar.addEventListener("transitionend", scheduleUpdate);
    inputRow?.addEventListener("transitionend", scheduleUpdate);
    box.addEventListener("transitionrun", scheduleUpdate);
    inputBar.addEventListener("transitionrun", scheduleUpdate);
    inputRow?.addEventListener("transitionrun", scheduleUpdate);
    box.addEventListener("transitionstart", scheduleUpdate);
    inputBar.addEventListener("transitionstart", scheduleUpdate);
    inputRow?.addEventListener("transitionstart", scheduleUpdate);
    let ro;
    let mo;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(scheduleUpdate);
      ro.observe(box);
      ro.observe(inputBar);
      if (inputRow) ro.observe(inputRow);
    }
    if (!isMobileViewport && typeof MutationObserver !== "undefined") {
      mo = new MutationObserver(scheduleUpdate);
      mo.observe(box, {
        childList: true,
        subtree: true
      });
    }
    document.fonts?.ready?.then?.(scheduleUpdate).catch?.(() => {});
    return () => {
      window.cancelAnimationFrame(raf);
      if (rafLoop) window.cancelAnimationFrame(rafLoop);
      if (mobileThrottleTimer) {
        window.clearTimeout(mobileThrottleTimer);
      }
      window.removeEventListener(ROUTE_TILT_STATE_EVENT, onTiltState);
      window.removeEventListener("resize", scheduleUpdate);
      vv?.removeEventListener("resize", scheduleUpdate);
      if (!isMobileViewport) {
        vv?.removeEventListener("scroll", scheduleUpdate);
        window.removeEventListener("focusin", scheduleUpdate);
        window.removeEventListener("focusout", scheduleUpdate);
        window.removeEventListener("scroll", scheduleUpdate, true);
        box.removeEventListener("scroll", scheduleUpdate);
      }
      box.removeEventListener("transitionend", scheduleUpdate);
      inputBar.removeEventListener("transitionend", scheduleUpdate);
      inputRow?.removeEventListener("transitionend", scheduleUpdate);
      box.removeEventListener("transitionrun", scheduleUpdate);
      inputBar.removeEventListener("transitionrun", scheduleUpdate);
      inputRow?.removeEventListener("transitionrun", scheduleUpdate);
      box.removeEventListener("transitionstart", scheduleUpdate);
      inputBar.removeEventListener("transitionstart", scheduleUpdate);
      inputRow?.removeEventListener("transitionstart", scheduleUpdate);
      ro?.disconnect?.();
      mo?.disconnect?.();
      if (maskLayer) {
        maskLayer.style.removeProperty("--chat-input-hole-mask");
      }
      clearHoleGeometryVars();
      if (refreshRef?.current === refreshHandler) {
        refreshRef.current = null;
      }
    };
  }, [containerRef, inputRowRef, inputBarRef, maskLayerRef, enabled, refreshRef]);
}
