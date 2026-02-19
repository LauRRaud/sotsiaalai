import { useLayoutEffect } from "react";

const TILT_ACTIVE_FLAG_KEY = "__SOTSIAALAI_GLASS_RING_TILT_ACTIVE";
const ROUTE_TILT_STATE_EVENT = "sotsiaalai:glass-ring-tilt-state";
const MOBILE_VIEWPORT_QUERY = "(max-width: 48em)";
const COARSE_POINTER_QUERY = "(hover: none) and (pointer: coarse)";

export function useChatInputHoleMask({
  containerRef,
  inputBarRef,
  enabled,
  refreshRef
}) {
  useLayoutEffect(() => {
    const box = containerRef?.current;
    const inputBar = inputBarRef?.current;
    if (!box || !inputBar) return;
    if (!enabled) {
      box.style.removeProperty("--chat-input-hole-mask");
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
    let pendingAfterTilt = false;
    const isTiltActive = () =>
      typeof window !== "undefined" && Boolean(window[TILT_ACTIVE_FLAG_KEY]);
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
    const updateMask = () => {
      if (isTiltActive()) {
        pendingAfterTilt = true;
        return;
      }
      const boxRect = box.getBoundingClientRect();
      const boxW = snap(boxRect.width);
      const boxH = snap(boxRect.height);
      if (!boxW || !boxH) return;
      const inputLocal = getLocalRect(inputBar, box);
      if (!inputLocal) return;
      const radiusRaw = Number.parseFloat(window.getComputedStyle(inputBar).borderTopLeftRadius);
      const radius = snap(Number.isFinite(radiusRaw) ? radiusRaw : inputLocal.h / 2);
      const mask = buildMask(boxW, boxH, inputLocal, radius);
      if (mask && mask !== lastMask) {
        box.style.setProperty("--chat-input-hole-mask", mask);
        lastMask = mask;
      }
      pendingAfterTilt = false;
    };
    const nowMs = () => typeof performance !== "undefined" ? performance.now() : Date.now();
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
    const scheduleUpdate = () => {
      if (isTiltActive()) {
        pendingAfterTilt = true;
        return;
      }
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(() => {
        updateMask();
        startLoop();
      });
    };
    const onTiltState = event => {
      if (event?.detail?.active) return;
      if (pendingAfterTilt) scheduleUpdate();
    };
    if (refreshRef) {
      refreshRef.current = scheduleUpdate;
    }
    const vv = window.visualViewport;
    scheduleUpdate();
    window.addEventListener(ROUTE_TILT_STATE_EVENT, onTiltState);
    window.addEventListener("resize", scheduleUpdate);
    vv?.addEventListener("resize", scheduleUpdate);
    vv?.addEventListener("scroll", scheduleUpdate);
    window.addEventListener("focusin", scheduleUpdate);
    window.addEventListener("focusout", scheduleUpdate);
    if (!isMobileViewport) {
      window.addEventListener("scroll", scheduleUpdate, true);
      box.addEventListener("scroll", scheduleUpdate);
    }
    box.addEventListener("transitionend", scheduleUpdate);
    inputBar.addEventListener("transitionend", scheduleUpdate);
    box.addEventListener("transitionrun", scheduleUpdate);
    inputBar.addEventListener("transitionrun", scheduleUpdate);
    box.addEventListener("transitionstart", scheduleUpdate);
    inputBar.addEventListener("transitionstart", scheduleUpdate);
    let ro;
    let mo;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(scheduleUpdate);
      ro.observe(box);
      ro.observe(inputBar);
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
      window.removeEventListener(ROUTE_TILT_STATE_EVENT, onTiltState);
      window.removeEventListener("resize", scheduleUpdate);
      vv?.removeEventListener("resize", scheduleUpdate);
      vv?.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("focusin", scheduleUpdate);
      window.removeEventListener("focusout", scheduleUpdate);
      if (!isMobileViewport) {
        window.removeEventListener("scroll", scheduleUpdate, true);
        box.removeEventListener("scroll", scheduleUpdate);
      }
      box.removeEventListener("transitionend", scheduleUpdate);
      inputBar.removeEventListener("transitionend", scheduleUpdate);
      box.removeEventListener("transitionrun", scheduleUpdate);
      inputBar.removeEventListener("transitionrun", scheduleUpdate);
      box.removeEventListener("transitionstart", scheduleUpdate);
      inputBar.removeEventListener("transitionstart", scheduleUpdate);
      ro?.disconnect?.();
      mo?.disconnect?.();
      if (refreshRef?.current === scheduleUpdate) {
        refreshRef.current = null;
      }
    };
  }, [containerRef, inputBarRef, enabled, refreshRef]);
}
