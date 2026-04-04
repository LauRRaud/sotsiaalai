import { useLayoutEffect } from "react";

const TILT_ACTIVE_FLAG_KEY = "__SOTSIAALAI_GLASS_RING_TILT_ACTIVE";
const ROUTE_TILT_STATE_EVENT = "sotsiaalai:glass-ring-tilt-state";
const MOBILE_VIEWPORT_QUERY = "(max-width: 768px)";
const COARSE_POINTER_QUERY = "(hover: none) and (pointer: coarse)";
const MOBILE_MASK_UPDATE_INTERVAL_MS = 120;
const DESKTOP_MASK_TRACK_MS = 760;

export function useChatInputHoleMask({
  containerRef,
  inputRowRef,
  inputBarRef,
  maskLayerRef,
  enabled,
  applyMaskImage = true,
  refreshRef
}) {
  useLayoutEffect(() => {
    const box = containerRef?.current;
    const inputRow = inputRowRef?.current;
    const inputBar = inputBarRef?.current;
    const maskLayer = maskLayerRef?.current;
    if (!box || !inputBar) return;
    const clearHoleGeometry = () => {
      const targets = [box, maskLayer].filter(Boolean);
      targets.forEach(target => {
        if (target?.dataset) {
          delete target.dataset.chatHoleReady;
        }
        target.style.removeProperty("--chat-input-hole-x");
        target.style.removeProperty("--chat-input-hole-y");
        target.style.removeProperty("--chat-input-hole-w");
        target.style.removeProperty("--chat-input-hole-h");
        target.style.removeProperty("--chat-input-hole-r");
        target.style.removeProperty("--chat-input-hole-side-h");
      });
    };
    if (!enabled) {
      box.style.removeProperty("--chat-input-hole-mask");
      clearHoleGeometry();
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
    const snapStep = isMobileViewport ? 1 : 0.25;
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
    let mobileDebounceTimer = 0;
    let pendingAfterTilt = false;
    let retryCount = 0;
    let lastMaskRunAt = 0;
    let lastGeometry = "";
    const setTiltVisualState = active => {
      const value = active ? "true" : "false";
      if (box?.dataset) box.dataset.routeTilting = value;
      if (maskLayer?.dataset) maskLayer.dataset.routeTilting = value;
    };
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
      const inputLocalBase = getLocalRect(inputBar, box);
      if (!inputLocalBase) {
        scheduleGeometryRetry();
        return;
      }
      let inputLocal = inputLocalBase;
      if (isMobileViewport) {
        const inputField = inputBar.querySelector(".chat-input-field");
        const inputFieldFocused =
          inputField instanceof HTMLElement &&
          document.activeElement === inputField;
        if (inputFieldFocused && inputField instanceof HTMLElement) {
          const inputFieldStyles = window.getComputedStyle(inputField);
          const lineHeight =
            Number.parseFloat(inputFieldStyles.lineHeight) || 22;
          const paddingTop =
            Number.parseFloat(inputFieldStyles.paddingTop) || 0;
          const paddingBottom =
            Number.parseFloat(inputFieldStyles.paddingBottom) || 0;
          const contentHeight = Math.max(
            0,
            inputField.scrollHeight - paddingTop - paddingBottom
          );
          const lineCount = Math.max(
            1,
            Math.round(contentHeight / lineHeight)
          );
          const stableLineCount = 3;
          const extraLines = Math.max(0, lineCount - 1);
          const estimatedBaseHeight = Math.max(
            inputLocalBase.h - extraLines * lineHeight,
            inputLocalBase.h * 0.6
          );
          const stableHeight = snap(
            Math.max(
              inputLocalBase.h,
              estimatedBaseHeight + lineHeight * (stableLineCount - 1)
            )
          );
          const stableDelta = Math.max(0, stableHeight - inputLocalBase.h);
          if (stableDelta > 0) {
            inputLocal = {
              ...inputLocalBase,
              y: snap(Math.max(0, inputLocalBase.y - stableDelta)),
              h: stableHeight
            };
          }
        }
      }
      retryCount = 0;
      const radiusRaw = Number.parseFloat(window.getComputedStyle(inputBar).borderTopLeftRadius);
      const unclampedRadius = Number.isFinite(radiusRaw) ? radiusRaw : inputLocal.h / 2;
      const radius = snap(clamp(unclampedRadius, 0, Math.min(inputLocal.w, inputLocal.h) / 2));
      const geometryKey = `${boxW}|${boxH}|${inputLocal.x}|${inputLocal.y}|${inputLocal.w}|${inputLocal.h}|${radius}`;
      if (geometryKey === lastGeometry && !force) {
        pendingAfterTilt = false;
        return;
      }
      lastGeometry = geometryKey;
      const sideHeight = snap(Math.max(0, inputLocal.h - radius * 2));
      const geometryTargets = [box, maskLayer].filter(Boolean);
      geometryTargets.forEach(target => {
        if (target?.dataset) {
          target.dataset.chatHoleReady = "true";
        }
        target.style.setProperty("--chat-input-hole-x", `${inputLocal.x}px`);
        target.style.setProperty("--chat-input-hole-y", `${inputLocal.y}px`);
        target.style.setProperty("--chat-input-hole-w", `${inputLocal.w}px`);
        target.style.setProperty("--chat-input-hole-h", `${inputLocal.h}px`);
        target.style.setProperty("--chat-input-hole-r", `${radius}px`);
        target.style.setProperty("--chat-input-hole-side-h", `${sideHeight}px`);
      });
      if (!applyMaskImage) {
        pendingAfterTilt = false;
        return;
      }
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
      const until = nowMs() + DESKTOP_MASK_TRACK_MS;
      loopUntil = Math.max(loopUntil, until);
      if (!rafLoop) {
        rafLoop = window.requestAnimationFrame(tick);
      }
    };
    const runScheduledUpdate = ({ force = false, loop = true } = {}) => {
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
    const scheduleUpdate = ({ force = false, loop = true, immediate = false } = {}) => {
      if (isTiltActive() && lastMask) {
        pendingAfterTilt = true;
        return;
      }
      if (isMobileViewport && !force && !immediate) {
        if (mobileDebounceTimer) {
          window.clearTimeout(mobileDebounceTimer);
        }
        mobileDebounceTimer = window.setTimeout(() => {
          mobileDebounceTimer = 0;
          runScheduledUpdate({
            force: false,
            loop: false
          });
        }, MOBILE_MASK_UPDATE_INTERVAL_MS);
        return;
      }
      if (mobileDebounceTimer) {
        window.clearTimeout(mobileDebounceTimer);
        mobileDebounceTimer = 0;
      }
      runScheduledUpdate({
        force,
        loop
      });
    };
    const onTiltState = event => {
      const active = Boolean(event?.detail?.active);
      setTiltVisualState(active);
      if (active) return;
      if (pendingAfterTilt) {
        scheduleUpdate({
          force: true
        });
      }
    };
    const refreshHandler = (options = {}) => {
      scheduleUpdate({
        force: options.force === true,
        loop: options.loop === true,
        immediate: options.immediate === true
      });
    };
    if (refreshRef) {
      refreshRef.current = refreshHandler;
    }
    const vv = window.visualViewport;
    setTiltVisualState(isTiltActive());
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
    if (!isMobileViewport) {
      box.addEventListener("transitionrun", scheduleUpdate);
      inputBar.addEventListener("transitionrun", scheduleUpdate);
      inputRow?.addEventListener("transitionrun", scheduleUpdate);
      box.addEventListener("transitionstart", scheduleUpdate);
      inputBar.addEventListener("transitionstart", scheduleUpdate);
      inputRow?.addEventListener("transitionstart", scheduleUpdate);
    }
    let ro;
    let mo;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(scheduleUpdate);
      ro.observe(inputBar);
      if (!isMobileViewport) {
        ro.observe(box);
        if (inputRow) ro.observe(inputRow);
      }
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
      if (mobileDebounceTimer) {
        window.clearTimeout(mobileDebounceTimer);
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
      if (!isMobileViewport) {
        box.removeEventListener("transitionrun", scheduleUpdate);
        inputBar.removeEventListener("transitionrun", scheduleUpdate);
        inputRow?.removeEventListener("transitionrun", scheduleUpdate);
        box.removeEventListener("transitionstart", scheduleUpdate);
        inputBar.removeEventListener("transitionstart", scheduleUpdate);
        inputRow?.removeEventListener("transitionstart", scheduleUpdate);
      }
      ro?.disconnect?.();
      mo?.disconnect?.();
      if (box?.dataset) delete box.dataset.routeTilting;
      if (maskLayer?.dataset) delete maskLayer.dataset.routeTilting;
      if (maskLayer) {
        maskLayer.style.removeProperty("--chat-input-hole-mask");
      }
      clearHoleGeometry();
      if (refreshRef?.current === refreshHandler) {
        refreshRef.current = null;
      }
    };
  }, [containerRef, inputRowRef, inputBarRef, maskLayerRef, enabled, applyMaskImage, refreshRef]);
}
