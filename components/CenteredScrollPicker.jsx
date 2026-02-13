"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';
function isHTMLElement(x) {
  return typeof HTMLElement !== "undefined" && x instanceof HTMLElement;
}
function getCenterY(rect) {
  return rect.top + rect.height / 2;
}
function getCssPx(el, varName) {
  if (!el || typeof window === "undefined") return 0;
  const raw = window.getComputedStyle(el).getPropertyValue(varName).trim();
  if (!raw) return 0;
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? value : 0;
}
function supportsInert() {
  return typeof HTMLElement !== "undefined" && "inert" in HTMLElement.prototype;
}
function isEditableElement(node) {
  if (!isHTMLElement(node)) return false;
  const tag = node.tagName;
  return node.isContentEditable || tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}
export default function CenteredScrollPicker({
  containerRef,
  itemSelector = null,
  reduceMotion = false,
  disabled = false,
  settleMs = 220,
  maxStepPerSettle = 1,
  neighborDistance = 1,
  settleOnScroll = true,
  enableArrowKeys = false,
  allowArrowKeysInInputs = false,
  captureArrowKeys = false,
  lockWheelToSteps = false,
  wheelCooldownMs = 220,
  minWheelDelta = 10,
  manageHiddenFocus = true,
  pauseSettleOnInputFocus = false,
  pauseSettleWhileTouch = false,
  onActiveIndexChange
} = {}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [scrollDirection, setScrollDirection] = useState("idle");
  const itemRefs = useRef([]);
  const rafRef = useRef(0);
  const settleTimerRef = useRef(0);
  const lastScrollTopRef = useRef(0);
  const lastSettledIndexRef = useRef(0);
  const tabIndexStoreRef = useRef(new WeakMap());
  const isTouchingRef = useRef(false);
  const inertOk = useMemo(() => supportsInert(), []);
  const bindItemRef = useCallback(index => {
    return node => {
      itemRefs.current[index] = node || null;
    };
  }, []);
  const getItems = useCallback(() => {
    const container = containerRef?.current;
    if (!container) return [];
    const hasAnyRef = itemRefs.current.some(Boolean);
    if (hasAnyRef) return itemRefs.current.filter(Boolean);
    if (itemSelector) {
      return Array.from(container.querySelectorAll(itemSelector)).filter(isHTMLElement);
    }
    return [];
  }, [containerRef, itemSelector]);
  const updateScrollHints = useCallback(() => {
    const el = containerRef?.current;
    if (!el) return;
    const {
      scrollTop,
      scrollHeight,
      clientHeight
    } = el;
    setCanScrollUp(scrollTop > 2);
    setCanScrollDown(scrollTop + clientHeight < scrollHeight - 2);
  }, [containerRef]);
  const updateScrollDirection = useCallback(() => {
    const el = containerRef?.current;
    if (!el) return;
    const nextTop = el.scrollTop || 0;
    const delta = nextTop - lastScrollTopRef.current;
    lastScrollTopRef.current = nextTop;
    if (Math.abs(delta) < 1) return;
    const nextDir = delta > 0 ? "down" : "up";
    setScrollDirection(prev => prev === nextDir ? prev : nextDir);
  }, [containerRef]);
  const computeActiveIndex = useCallback(() => {
    const el = containerRef?.current;
    if (!el) return 0;
    const items = getItems();
    if (!items.length) return 0;
    const containerRect = el.getBoundingClientRect();
    const centerOffset = getCssPx(el, "--csp-center-offset");
    const centerY = getCenterY(containerRect) + centerOffset;
    let bestIdx = 0;
    let bestDist = Number.POSITIVE_INFINITY;
    for (let i = 0; i < items.length; i += 1) {
      const r = items[i].getBoundingClientRect();
      const d = Math.abs(getCenterY(r) - centerY);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    return bestIdx;
  }, [containerRef, getItems]);
  const scrollToIndex = useCallback((idx, behaviorOverride) => {
    const items = getItems();
    if (!items.length) return;
    const i = clamp(idx, 0, items.length - 1);
    const target = items[i];
    if (!target) return;
    const el = containerRef?.current;
    if (!el) return;
    const behavior = behaviorOverride || (reduceMotion ? "auto" : "smooth");
    const containerRect = el.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const centerOffset = getCssPx(el, "--csp-center-offset");
    const desiredCenter = getCenterY(containerRect) + centerOffset;
    const targetCenter = getCenterY(targetRect);
    const delta = targetCenter - desiredCenter;
    const nextTop = (el.scrollTop || 0) + delta;
    if (typeof el.scrollTo === "function") {
      el.scrollTo({
        top: nextTop,
        behavior
      });
    } else {
      el.scrollTop = nextTop;
    }
  }, [getItems, reduceMotion, containerRef]);
  const getItemState = useCallback(index => {
    const d = Math.abs(index - activeIndexRef.current);
    if (d === 0) return "active";
    if (d <= neighborDistance) return "neighbor";
    return "hidden";
  }, [neighborDistance]);
  const getItemClassName = useCallback(index => {
    const state = getItemState(index);
    if (state === "active") return "csp-item csp-active";
    if (state === "neighbor") return "csp-item csp-neighbor";
    return "csp-item csp-hidden";
  }, [getItemState]);
  const setHiddenStateForItem = useCallback((itemEl, hidden) => {
    if (!isHTMLElement(itemEl)) return;
    if (hidden) itemEl.setAttribute("aria-hidden", "true");else itemEl.removeAttribute("aria-hidden");
    if (!manageHiddenFocus) return;
    if (hidden) {
      if (inertOk) {
        itemEl.inert = true;
        return;
      }
      const focusables = Array.from(itemEl.querySelectorAll(FOCUSABLE_SELECTOR));
      for (const node of focusables) {
        if (!isHTMLElement(node)) continue;
        const store = tabIndexStoreRef.current;
        if (!store.has(node)) store.set(node, node.getAttribute("tabindex"));
        node.setAttribute("tabindex", "-1");
      }
    } else {
      if (inertOk) {
        itemEl.inert = false;
        return;
      }
      const focusables = Array.from(itemEl.querySelectorAll(FOCUSABLE_SELECTOR));
      for (const node of focusables) {
        if (!isHTMLElement(node)) continue;
        const store = tabIndexStoreRef.current;
        if (!store.has(node)) continue;
        const prev = store.get(node);
        if (prev === null || prev === undefined) node.removeAttribute("tabindex");else node.setAttribute("tabindex", prev);
        store.delete(node);
      }
    }
  }, [manageHiddenFocus, inertOk]);
  const applyHiddenFocusGuards = useCallback(newActiveIdx => {
    const items = getItems();
    if (!items.length) return;
    for (let i = 0; i < items.length; i += 1) {
      const hidden = Math.abs(i - newActiveIdx) > neighborDistance;
      setHiddenStateForItem(items[i], hidden);
    }
    if (typeof document !== "undefined") {
      const activeEl = document.activeElement;
      if (isHTMLElement(activeEl)) {
        const hiddenAncestor = activeEl.closest?.(".csp-hidden");
        if (hiddenAncestor && isHTMLElement(hiddenAncestor)) {
          const activeItem = items[newActiveIdx];
          const focusables = activeItem ? Array.from(activeItem.querySelectorAll(FOCUSABLE_SELECTOR)).filter(isHTMLElement) : [];
          (focusables[0] || containerRef?.current)?.focus?.();
        }
      }
    }
  }, [getItems, neighborDistance, setHiddenStateForItem, containerRef]);
  const commitActiveIndex = useCallback((idx, {
    silent = false
  } = {}) => {
    activeIndexRef.current = idx;
    setActiveIndex(idx);
    if (!silent && typeof onActiveIndexChange === "function") onActiveIndexChange(idx);
    applyHiddenFocusGuards(idx);
  }, [applyHiddenFocusGuards, onActiveIndexChange]);
  const scheduleRafUpdate = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      if (disabled) return;
      const idx = computeActiveIndex();
      if (idx !== activeIndexRef.current) commitActiveIndex(idx);
      updateScrollHints();
    });
  }, [computeActiveIndex, commitActiveIndex, updateScrollHints, disabled]);
  const scheduleSettle = useCallback(() => {
    if (settleTimerRef.current) window.clearTimeout(settleTimerRef.current);
    settleTimerRef.current = window.setTimeout(() => {
      if (disabled) return;
      if (pauseSettleWhileTouch && isTouchingRef.current) return;
      if (pauseSettleOnInputFocus) {
        const el = containerRef?.current;
        const active = typeof document !== "undefined" ? document.activeElement : null;
        if (el && isEditableElement(active) && el.contains(active)) {
          updateScrollHints();
          return;
        }
      }
      const items = getItems();
      if (!items.length) return;
      const current = activeIndexRef.current;
      const prev = lastSettledIndexRef.current;
      let target = current;
      const delta = current - prev;
      if (Math.abs(delta) > maxStepPerSettle) {
        target = prev + Math.sign(delta) * maxStepPerSettle;
        target = clamp(target, 0, items.length - 1);
        commitActiveIndex(target, {
          silent: true
        });
      }
      lastSettledIndexRef.current = target;
      scrollToIndex(target);
      updateScrollHints();
    }, reduceMotion ? 0 : settleMs);
  }, [disabled, pauseSettleWhileTouch, pauseSettleOnInputFocus, containerRef, getItems, maxStepPerSettle, commitActiveIndex, scrollToIndex, updateScrollHints, reduceMotion, settleMs]);
  const recompute = useCallback((behaviorOverride = "auto") => {
    if (disabled) return;
    const items = getItems();
    if (!items.length) return;
    const idx = computeActiveIndex();
    commitActiveIndex(idx);
    lastSettledIndexRef.current = idx;
    scrollToIndex(idx, behaviorOverride);
    updateScrollHints();
  }, [disabled, getItems, computeActiveIndex, commitActiveIndex, scrollToIndex, updateScrollHints]);
  useEffect(() => {
    const el = containerRef?.current;
    if (!el || disabled) return;
    updateScrollHints();
    lastScrollTopRef.current = el.scrollTop || 0;
    const onScroll = () => {
      updateScrollDirection();
      scheduleRafUpdate();
      if (settleOnScroll) scheduleSettle();
    };
    el.addEventListener("scroll", onScroll, {
      passive: true
    });
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => {
      scheduleRafUpdate();
      updateScrollHints();
    }) : null;
    ro?.observe(el);
    const onResize = () => {
      scheduleRafUpdate();
      updateScrollHints();
    };
    window.addEventListener("resize", onResize);
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro?.disconnect?.();
      window.removeEventListener("resize", onResize);
    };
  }, [containerRef, disabled, scheduleRafUpdate, scheduleSettle, updateScrollHints, updateScrollDirection, lockWheelToSteps, settleOnScroll]);
  useEffect(() => {
    const el = containerRef?.current;
    if (!el || disabled || !lockWheelToSteps) return;
    let wheelLock = false;
    const onWheel = e => {
      const dy = e?.deltaY;
      if (!Number.isFinite(dy) || Math.abs(dy) < minWheelDelta) return;
      e.preventDefault();
      if (wheelLock) return;
      wheelLock = true;
      const items = getItems();
      if (!items.length) {
        wheelLock = false;
        return;
      }
      const dir = dy > 0 ? 1 : -1;
      const next = clamp(activeIndexRef.current + dir, 0, items.length - 1);
      commitActiveIndex(next);
      lastSettledIndexRef.current = next;
      scrollToIndex(next);
      updateScrollHints();
      window.setTimeout(() => {
        wheelLock = false;
      }, reduceMotion ? 0 : wheelCooldownMs);
    };
    el.addEventListener("wheel", onWheel, {
      passive: false
    });
    return () => el.removeEventListener("wheel", onWheel);
  }, [containerRef, disabled, lockWheelToSteps, getItems, commitActiveIndex, scrollToIndex, updateScrollHints, reduceMotion, wheelCooldownMs, minWheelDelta]);
  useEffect(() => {
    const el = containerRef?.current;
    if (!el || disabled || !enableArrowKeys) return;
    const onKeyDown = e => {
      const key = e?.key;
      if (key !== "ArrowDown" && key !== "ArrowUp") return;
      const target = e.target;
      const isInputTarget = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable);
      if (!allowArrowKeysInInputs && isInputTarget) {
        return;
      }
      if (!captureArrowKeys) {
        const active = typeof document !== "undefined" ? document.activeElement : null;
        const activeInContainer = active && el.contains(active);
        if (!activeInContainer && active !== el) return;
      }
      e.preventDefault();
      const items = getItems();
      if (!items.length) return;
      const dir = key === "ArrowDown" ? 1 : -1;
      const next = clamp(activeIndexRef.current + dir, 0, items.length - 1);
      commitActiveIndex(next);
      lastSettledIndexRef.current = next;
      scrollToIndex(next);
      updateScrollHints();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [containerRef, disabled, enableArrowKeys, allowArrowKeysInInputs, captureArrowKeys, getItems, commitActiveIndex, scrollToIndex, updateScrollHints]);
  useEffect(() => {
    const el = containerRef?.current;
    if (!el || disabled || !pauseSettleWhileTouch) return;
    const onTouchStart = () => {
      isTouchingRef.current = true;
      if (settleTimerRef.current) {
        window.clearTimeout(settleTimerRef.current);
        settleTimerRef.current = 0;
      }
    };
    const onTouchEnd = () => {
      if (!isTouchingRef.current) return;
      isTouchingRef.current = false;
      if (settleOnScroll) scheduleSettle();
    };
    el.addEventListener("touchstart", onTouchStart, {
      passive: true
    });
    el.addEventListener("touchend", onTouchEnd, {
      passive: true
    });
    el.addEventListener("touchcancel", onTouchEnd, {
      passive: true
    });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [containerRef, disabled, pauseSettleWhileTouch, settleOnScroll, scheduleSettle]);
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      if (settleTimerRef.current) window.clearTimeout(settleTimerRef.current);
      settleTimerRef.current = 0;
    };
  }, []);
  return {
    activeIndex,
    canScrollUp,
    canScrollDown,
    scrollDirection,
    bindItemRef,
    getItemState,
    getItemClassName,
    scrollToIndex,
    recompute,
    lastSettledIndexRef
  };
}
