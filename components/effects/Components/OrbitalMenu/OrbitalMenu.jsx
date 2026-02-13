"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import SmustCenterLogo from "@/public/logo/smust-center.svg";
import { cn } from "@/components/ui/cn";
import "./OrbitalMenu.css";
function useMatchMedia(query, defaultValue = false) {
  const [matches, setMatches] = useState(defaultValue);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(!!mq.matches);
    onChange();
    if (mq.addEventListener) {
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    }
    mq.addListener(onChange);
    return () => mq.removeListener(onChange);
  }, [query]);
  return matches;
}
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
const MOBILE_SETTLE_MS = 180;
export default function OrbitalMenu({
  items = [],
  ariaLabel = "Actions",
  toggleLabelOpen = "Open menu",
  toggleLabelClose = "Close menu",
  mobileBackItem,
  className = "",
  mobileVariant = "list",
  onOpenChange
}) {
  const menuId = useId();
  const rootRef = useRef(null);
  const hubBtnRef = useRef(null);
  const isCoarsePointer = useMatchMedia("(hover: none) and (pointer: coarse)", false);
  const prefersReducedMotion = useMatchMedia("(prefers-reduced-motion: reduce)", false);
  const useMobileOverlay = isCoarsePointer && mobileVariant === "list";
  const useMobileStack = isCoarsePointer && mobileVariant === "stack";
  const useMobileDialog = useMobileOverlay || useMobileStack;
  const useOrbitLayout = !useMobileDialog;
  const [isPinnedOpen, setIsPinnedOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const isOpen = isPinnedOpen;
  const isExpanded = isOpen || isClosing;
  const closeTimerRef = useRef(0);
  const prevOpenRef = useRef(false);
  const [orbitRadius, setOrbitRadius] = useState(0);
  const [orbitHideScale, setOrbitHideScale] = useState(0.9);
  const overlayCloseBtnRef = useRef(null);
  const scrollRef = useRef(null);
  const slotRefs = useRef([]);
  const stackListRef = useRef(null);
  const stackItemRefs = useRef([]);
  const rafRef = useRef(0);
  const settleTimerRef = useRef(0);
  const stackSettleTimerRef = useRef(0);
  const listTouchingRef = useRef(false);
  const stackTouchingRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const [listPad, setListPad] = useState(0);
  const [stackPad, setStackPad] = useState(0);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [stackFocusIndex, setStackFocusIndex] = useState(null);
  const closeMenu = useCallback(() => {
    setIsPinnedOpen(false);
    requestAnimationFrame(() => {
      hubBtnRef.current?.focus?.();
    });
  }, []);
  const stackItems = useMemo(() => {
    if (!useMobileStack) return items;
    if (!mobileBackItem) return items;
    return [...items, mobileBackItem];
  }, [items, mobileBackItem, useMobileStack]);
  const [visuals, setVisuals] = useState(() => Array.from({
    length: items.length
  }, () => ({
    scale: 0.62,
    opacity: 0,
    blur: 2,
    hide: true
  })));
  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);
  useEffect(() => {
    const wasOpen = prevOpenRef.current;
    prevOpenRef.current = isOpen;
    if (isOpen) {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = 0;
      }
      if (isClosing) setIsClosing(false);
      return;
    }
    if (wasOpen) {
      setIsClosing(true);
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
      const delay = prefersReducedMotion ? 0 : 380;
      closeTimerRef.current = window.setTimeout(() => {
        setIsClosing(false);
        closeTimerRef.current = 0;
      }, delay);
    }
  }, [isOpen, prefersReducedMotion, isClosing]);
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = 0;
    };
  }, []);
  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);
  useEffect(() => {
    slotRefs.current = new Array(items.length);
    setVisuals(Array.from({
      length: items.length
    }, (_, i) => {
      const d = Math.abs(i - activeIndexRef.current);
      if (d === 0) return {
        scale: 1.0,
        opacity: 1,
        blur: 0,
        hide: false
      };
      if (d === 1) return {
        scale: 0.92,
        opacity: 0.32,
        blur: 0.8,
        hide: false
      };
      return {
        scale: 0.86,
        opacity: 0,
        blur: 1.4,
        hide: true
      };
    }));
  }, [items.length]);
  useEffect(() => {
    stackItemRefs.current = new Array(stackItems.length);
  }, [stackItems.length]);
  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = event => {
      const root = rootRef.current;
      if (!root) return;
      if (!root.contains(event.target)) closeMenu();
    };
    const handleKeyDown = event => {
      if (event.key === "Escape") closeMenu();
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeMenu, isOpen]);
  useEffect(() => {
    if (typeof document === "undefined") return;
    const html = document.documentElement;
    if (isOpen) html.classList.add("profile-orbit-open");else html.classList.remove("profile-orbit-open");
    return () => html.classList.remove("profile-orbit-open");
  }, [isOpen]);
  useEffect(() => {
    if (!isOpen || !useMobileDialog) return;
    if (typeof window === "undefined" || typeof document === "undefined") return;
    const body = document.body;
    const scrollY = window.scrollY || 0;
    const prev = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width
    };
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    return () => {
      body.style.overflow = prev.overflow;
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.left = prev.left;
      body.style.right = prev.right;
      body.style.width = prev.width;
      window.scrollTo(0, scrollY);
    };
  }, [isOpen, useMobileDialog]);
  useEffect(() => {
    if (!isOpen || !useMobileDialog) return;
    const prevActive = typeof document !== "undefined" ? document.activeElement : null;
    const hubEl = hubBtnRef.current;
    const closeEl = overlayCloseBtnRef.current;
    const raf = requestAnimationFrame(() => {
      if (useMobileStack) {
        stackItemRefs.current?.[0]?.focus?.();
      } else {
        closeEl?.focus?.();
      }
    });
    return () => {
      cancelAnimationFrame(raf);
      if (hubEl?.focus) {
        hubEl.focus();
        return;
      }
      if (prevActive && prevActive instanceof HTMLElement) prevActive.focus();
    };
  }, [isOpen, useMobileDialog, useMobileStack]);
  useLayoutEffect(() => {
    if (!useOrbitLayout) return;
    const root = rootRef.current;
    if (!root) return;
    let raf = 0;
    const measure = () => {
      const rect = root.getBoundingClientRect();
      const itemEl = root.querySelector(".profile-orbit-menu__item");
      if (!rect.width || !itemEl) return;
      const itemSize = itemEl.offsetWidth || 0;
      if (!itemSize) return;
      const nextRadius = Math.max(0, (rect.width - itemSize) / 2);
      setOrbitRadius(prev => Math.abs(prev - nextRadius) > 0.25 ? nextRadius : prev);
      const hubSize = hubBtnRef.current?.offsetWidth || 0;
      if (hubSize && nextRadius) {
        const hideRadius = Math.min(nextRadius, (hubSize + itemSize) / 2);
        const inwardRadius = hideRadius * 0.4;
        const nextScale = clamp(inwardRadius / nextRadius, 0, 1);
        setOrbitHideScale(prev => Math.abs(prev - nextScale) > 0.02 ? nextScale : prev);
      }
    };
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    schedule();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(schedule) : null;
    ro?.observe(root);
    window.addEventListener("resize", schedule);
    if (document?.fonts?.ready && typeof document.fonts.ready.then === "function") {
      document.fonts.ready.then(schedule).catch(() => {});
    }
    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect?.();
      window.removeEventListener("resize", schedule);
    };
  }, [items.length, useOrbitLayout]);
  const handleToggle = () => setIsPinnedOpen(prev => !prev);
  const buildVisualsFromActive = useCallback(activeIdx => {
    const next = new Array(items.length);
    for (let i = 0; i < items.length; i += 1) {
      const d = Math.abs(i - activeIdx);
      if (d === 0) next[i] = {
        scale: 1.0,
        opacity: 1,
        blur: 0,
        hide: false
      };else if (d === 1) next[i] = {
        scale: 0.92,
        opacity: 0.32,
        blur: 0.8,
        hide: false
      };else next[i] = {
        scale: 0.86,
        opacity: 0,
        blur: 1.4,
        hide: true
      };
    }
    return next;
  }, [items.length]);
  const computeListPadding = useCallback(() => {
    const listEl = scrollRef.current;
    const firstSlot = slotRefs.current?.[0];
    if (!listEl || !firstSlot) return;
    const listH = listEl.clientHeight || 0;
    const slotH = firstSlot.offsetHeight || 0;
    if (!listH || !slotH) return;
    const pad = Math.max(0, Math.floor((listH - slotH) / 2));
    setListPad(pad);
  }, []);
  const updateScrollHints = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const {
      scrollTop,
      scrollHeight,
      clientHeight
    } = el;
    setCanScrollUp(scrollTop > 2);
    setCanScrollDown(scrollTop + clientHeight < scrollHeight - 2);
  }, []);
  const computeActiveIndexFromScroll = useCallback(() => {
    const listEl = scrollRef.current;
    if (!listEl) return 0;
    const listRect = listEl.getBoundingClientRect();
    const centerY = listRect.top + listRect.height / 2;
    const slots = slotRefs.current || [];
    if (!slots.length) return 0;
    let bestIdx = 0;
    let bestDist = Number.POSITIVE_INFINITY;
    for (let i = 0; i < slots.length; i += 1) {
      const slot = slots[i];
      if (!slot) continue;
      const r = slot.getBoundingClientRect();
      const slotCenter = r.top + r.height / 2;
      const dist = Math.abs(slotCenter - centerY);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    }
    return bestIdx;
  }, []);
  const snapToIndex = useCallback(idx => {
    const clampedIdx = clamp(idx, 0, Math.max(0, items.length - 1));
    const slot = slotRefs.current?.[clampedIdx];
    if (!slot) return;
    const behavior = prefersReducedMotion ? "auto" : "smooth";
    slot.scrollIntoView?.({
      block: "center",
      behavior
    });
  }, [items.length, prefersReducedMotion]);
  const applyActive = useCallback(idx => {
    const clampedIdx = clamp(idx, 0, Math.max(0, items.length - 1));
    if (activeIndexRef.current !== clampedIdx) {
      activeIndexRef.current = clampedIdx;
      setActiveIndex(clampedIdx);
    }
    setVisuals(buildVisualsFromActive(clampedIdx));
    updateScrollHints();
  }, [buildVisualsFromActive, items.length, updateScrollHints]);
  const scheduleMobileUpdate = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      const idx = computeActiveIndexFromScroll();
      applyActive(idx);
    });
  }, [applyActive, computeActiveIndexFromScroll]);
  const scheduleSettleSnap = useCallback(() => {
    if (settleTimerRef.current) window.clearTimeout(settleTimerRef.current);
    settleTimerRef.current = window.setTimeout(() => {
      if (listTouchingRef.current) return;
      snapToIndex(activeIndexRef.current);
    }, prefersReducedMotion ? 0 : MOBILE_SETTLE_MS);
  }, [prefersReducedMotion, snapToIndex]);
  useLayoutEffect(() => {
    if (!isOpen || !useMobileOverlay) return;
    computeListPadding();
    const initialIdx = clamp(activeIndexRef.current || 0, 0, Math.max(0, items.length - 1));
    applyActive(initialIdx);
    const slot = slotRefs.current?.[initialIdx];
    slot?.scrollIntoView?.({
      block: "center",
      behavior: "auto"
    });
    const listEl = scrollRef.current;
    if (!listEl) return;
    const onTouchStart = () => {
      listTouchingRef.current = true;
      if (settleTimerRef.current) {
        window.clearTimeout(settleTimerRef.current);
        settleTimerRef.current = 0;
      }
    };
    const onTouchEnd = () => {
      if (!listTouchingRef.current) return;
      listTouchingRef.current = false;
      scheduleSettleSnap();
    };
    const onScroll = () => {
      scheduleMobileUpdate();
      if (!listTouchingRef.current) scheduleSettleSnap();
    };
    listEl.addEventListener("scroll", onScroll, {
      passive: true
    });
    listEl.addEventListener("touchstart", onTouchStart, {
      passive: true
    });
    listEl.addEventListener("touchend", onTouchEnd, {
      passive: true
    });
    listEl.addEventListener("touchcancel", onTouchEnd, {
      passive: true
    });
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => {
      computeListPadding();
      scheduleMobileUpdate();
      scheduleSettleSnap();
    }) : null;
    ro?.observe(listEl);
    const onResize = () => {
      computeListPadding();
      scheduleMobileUpdate();
      scheduleSettleSnap();
    };
    window.addEventListener("resize", onResize);
    return () => {
      listTouchingRef.current = false;
      listEl.removeEventListener("scroll", onScroll);
      listEl.removeEventListener("touchstart", onTouchStart);
      listEl.removeEventListener("touchend", onTouchEnd);
      listEl.removeEventListener("touchcancel", onTouchEnd);
      ro?.disconnect?.();
      window.removeEventListener("resize", onResize);
    };
  }, [applyActive, computeListPadding, useMobileOverlay, isOpen, items.length, scheduleMobileUpdate, scheduleSettleSnap]);
  useLayoutEffect(() => {
    if (!isOpen || !useMobileStack) return;
    const listEl = stackListRef.current;
    if (!listEl) return;
    const snapToStackIndex = (idx, smooth = true) => {
      const refs = stackItemRefs.current || [];
      const maxIdx = Math.max(0, refs.length - 1);
      const clampedIdx = clamp(idx, 0, maxIdx);
      const target = refs[clampedIdx];
      if (!target) return;
      target.scrollIntoView?.({
        block: "center",
        behavior: smooth && !prefersReducedMotion ? "smooth" : "auto"
      });
    };
    const computeActive = () => {
      const listRect = listEl.getBoundingClientRect();
      const centerY = listRect.top + listRect.height / 2;
      const refs = stackItemRefs.current || [];
      let bestIdx = null;
      let bestDist = Number.POSITIVE_INFINITY;
      for (let i = 0; i < refs.length; i += 1) {
        const el = refs[i];
        if (!el) continue;
        const r = el.getBoundingClientRect();
        const cy = r.top + r.height / 2;
        const dist = Math.abs(cy - centerY);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = i;
        }
      }
      setStackFocusIndex(bestIdx);
      return bestIdx;
    };
    const scheduleStackSettle = () => {
      if (stackSettleTimerRef.current) {
        window.clearTimeout(stackSettleTimerRef.current);
      }
      stackSettleTimerRef.current = window.setTimeout(() => {
        if (stackTouchingRef.current) return;
        const idx = computeActive();
        if (idx == null) return;
        snapToStackIndex(idx, true);
      }, prefersReducedMotion ? 0 : MOBILE_SETTLE_MS);
    };
    const computePad = () => {
      const first = stackItemRefs.current?.[0];
      if (!first) return;
      const listH = listEl.clientHeight || 0;
      const itemH = first.offsetHeight || 0;
      if (!listH || !itemH) return;
      const pad = Math.max(0, Math.floor((listH - itemH) / 2) + 8);
      setStackPad(pad);
    };
    computePad();
    setStackFocusIndex(0);
    snapToStackIndex(0, false);
    const onTouchStart = () => {
      stackTouchingRef.current = true;
      if (stackSettleTimerRef.current) {
        window.clearTimeout(stackSettleTimerRef.current);
        stackSettleTimerRef.current = 0;
      }
    };
    const onTouchEnd = () => {
      if (!stackTouchingRef.current) return;
      stackTouchingRef.current = false;
      scheduleStackSettle();
    };
    const onScroll = () => {
      computeActive();
      if (!stackTouchingRef.current) scheduleStackSettle();
    };
    listEl.addEventListener("scroll", onScroll, { passive: true });
    listEl.addEventListener("touchstart", onTouchStart, { passive: true });
    listEl.addEventListener("touchend", onTouchEnd, { passive: true });
    listEl.addEventListener("touchcancel", onTouchEnd, { passive: true });
    const onResize = () => {
      computeActive();
      scheduleStackSettle();
    };
    window.addEventListener("resize", onResize);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => {
      computeActive();
      computePad();
      scheduleStackSettle();
    }) : null;
    ro?.observe(listEl);
    scheduleStackSettle();
    return () => {
      stackTouchingRef.current = false;
      listEl.removeEventListener("scroll", onScroll);
      listEl.removeEventListener("touchstart", onTouchStart);
      listEl.removeEventListener("touchend", onTouchEnd);
      listEl.removeEventListener("touchcancel", onTouchEnd);
      window.removeEventListener("resize", onResize);
      if (stackSettleTimerRef.current) {
        window.clearTimeout(stackSettleTimerRef.current);
        stackSettleTimerRef.current = 0;
      }
      ro?.disconnect?.();
    };
  }, [isOpen, prefersReducedMotion, useMobileStack]);
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      if (settleTimerRef.current) window.clearTimeout(settleTimerRef.current);
      settleTimerRef.current = 0;
      if (stackSettleTimerRef.current) window.clearTimeout(stackSettleTimerRef.current);
      stackSettleTimerRef.current = 0;
    };
  }, []);
  const onMobileAction = item => {
    item?.onClick?.();
    if (!item?.keepOpen) closeMenu();
  };
  const desktopAngleStep = useMemo(() => items.length ? 360 / items.length : 0, [items.length]);
  const desktopStartAngle = -90;
  const orbitRadiusBoost = isExpanded ? 1.14 : 1;
  return <div
      ref={rootRef}
      data-mobile-variant={useMobileStack ? "stack" : useMobileOverlay ? "list" : "orbit"}
      className={cn(
      "profile-orbit-menu relative grid place-items-center w-[var(--orbit-size)] h-[var(--orbit-size)] " +
        "[--item-opacity:0] [--item-scale:0.9] [--item-scale-hover:0.885] " +
        "[--label-gap:0.5rem] [--label-gap-side:0.01rem] [--label-nudge:0.3rem]",
      isOpen && "is-open [--item-opacity:1]",
      isClosing && "is-closing",
      isExpanded && "is-expanded [--item-scale:1.06] [--item-scale-hover:1.03] [--orbit-item-size:var(--orbit-item-size-open)]",
      isCoarsePointer && "is-mobile",
      useMobileStack && "is-stack",
      className
    )}
    >
      {}
      {useOrbitLayout && <div className={cn("profile-orbit-menu__items absolute inset-0", isOpen ? "pointer-events-auto" : "pointer-events-none")} role="group" aria-label={ariaLabel} id={menuId} inert={isOpen ? undefined : true}>
          {items.map((item, index) => {
        const angle = desktopStartAngle + index * desktopAngleStep;
        const angleRad = angle * Math.PI / 180;
        const orbitX = Math.round(Math.sin(angleRad) * orbitRadius * orbitRadiusBoost);
        const orbitY = Math.round(-Math.cos(angleRad) * orbitRadius * orbitRadiusBoost);
        const labelPos = item.labelPos || "up";
        const labelPositionClass = labelPos === "down" ? "left-1/2 top-[calc(100%+var(--label-gap))] -translate-x-1/2" : labelPos === "left" ? "right-[calc(100%+var(--label-gap-side))] top-1/2 -translate-y-1/2" : labelPos === "right" ? "left-[calc(100%+var(--label-gap-side))] top-1/2 -translate-y-1/2" : "left-1/2 bottom-[calc(100%+var(--label-gap))] -translate-x-1/2";
        const labelWidthClass = item.key === "theme" || item.key === "subscription" ? "max-w-[5.8rem]" : labelPos === "left" || labelPos === "right" ? "max-w-[7rem] [overflow-wrap:break-word]" : "max-w-[12rem]";
        return <div key={item.key || index} className={cn("profile-orbit-menu__slot group absolute top-1/2 left-1/2 w-[var(--orbit-item-size)] h-[var(--orbit-item-size)] [transform:translate3d(var(--orbit-x,0px),var(--orbit-y,0px),0)_translate(-50%,-50%)] opacity-[var(--item-opacity)] transition-opacity [transition-duration:200ms] [transition-timing-function:ease] z-[1]", isOpen && "animate-[orbit-item-reveal_0.38s_cubic-bezier(0.2,0.8,0.2,1)_both]", !isOpen && isClosing && "animate-[orbit-item-hide_0.38s_cubic-bezier(0.2,0.8,0.2,1)_both]")} data-key={item.key || index} data-label-pos={labelPos} style={{
          "--orbit-x": `${orbitX}px`,
          "--orbit-y": `${orbitY}px`,
          "--orbit-hide-x": `${Math.round(orbitX * orbitHideScale)}px`,
          "--orbit-hide-y": `${Math.round(orbitY * orbitHideScale)}px`,
          "--label-gap-side": item.key === "theme" || item.key === "delete" ? "0.08rem" : undefined
        }}>
                <button type="button" className="profile-orbit-menu__item dock-item absolute inset-0 w-[var(--orbit-item-size)] h-[var(--orbit-item-size)] rounded-full p-0 block cursor-inherit [transform:scale(var(--item-scale))] [transform-origin:center] [transition:transform_0.22s_ease,box-shadow_0.28s_ease,border-color_0.18s_ease,background_0.18s_ease]" onClick={() => {
            item.onClick?.();
            if (!item.keepOpen) closeMenu();
          }} aria-label={item.label} tabIndex={isOpen ? 0 : -1}>
                  <span className="dock-icon profile-orbit-item-icon w-full h-full grid place-items-center leading-[0] [&>svg]:w-[clamp(2.5rem,2.9vw,3.1rem)] [&>svg]:h-[clamp(2.5rem,2.9vw,3.1rem)] [&>svg]:max-w-none [&>svg]:max-h-none [&>svg]:block [&>svg]:stroke-current" aria-hidden="true">
                    {item.icon}
                  </span>
                </button>
                <span className={cn(
            "dock-label profile-orbit-item-label absolute opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none w-max whitespace-normal leading-[1.05] text-[clamp(1.05rem,2.4vw,1.3rem)] tracking-[0.02em] text-center [text-align-last:center] antialiased z-[20] transition-opacity duration-[260ms] ease-out max-[640px]:!opacity-100 max-[640px]:!left-1/2 max-[640px]:!bottom-[0.8rem] max-[640px]:!right-auto max-[640px]:!top-auto max-[640px]:!translate-x-1/2 max-[640px]:!translate-y-0 max-[640px]:!w-[calc(var(--orbit-item-size)-0.9rem)] max-[640px]:!max-w-none max-[640px]:!text-[clamp(0.72rem,2.8vw,0.9rem)] max-[640px]:!bg-transparent max-[640px]:!border-0 max-[640px]:!shadow-none max-[640px]:!p-0",
            labelPositionClass,
            labelWidthClass
          )}>{item.label}</span>
              </div>;
      })}
        </div>}

      {}
      <button ref={hubBtnRef} type="button" className="profile-orbit-menu__center dock-item w-[var(--orbit-center-size)] h-[var(--orbit-center-size)] rounded-full p-0 grid place-items-center z-[5] cursor-inherit [transform:translateZ(0)_scale(1)] [transform-origin:center] [-webkit-backface-visibility:hidden] [backface-visibility:hidden] [transform-style:preserve-3d] outline outline-1 outline-transparent [transition:box-shadow_0.28s_ease] [animation:profile-orbit-hub-pulse_4.4s_ease-in-out_infinite] [will-change:transform] before:content-none after:content-none" onClick={handleToggle} aria-expanded={isOpen} aria-controls={menuId} aria-label={isOpen ? toggleLabelClose : toggleLabelOpen}>
        <span className="profile-orbit-menu__hub-icon relative z-[1] grid place-items-center w-full h-full" aria-hidden="true">
          <SmustCenterLogo className="profile-orbit-menu__hub-svg w-[var(--orbit-center-icon-size)] h-auto block overflow-visible stroke-none" aria-hidden="true" focusable="false" />
        </span>
      </button>

      {}
      {useMobileOverlay && isOpen && <div className="invite-modal-backdrop profile-orbit-mobile-backdrop fixed inset-0 z-[9999] flex items-stretch justify-center p-0" role="dialog" aria-modal="true" aria-label={ariaLabel} onPointerDown={e => {
      if (e.target === e.currentTarget) closeMenu();
    }}>
          <div className="invite-modal profile-orbit-mobile-panel relative isolate overflow-hidden w-screen max-w-screen h-[100dvh] max-h-[100dvh] rounded-none flex flex-col p-0 pt-[calc(env(safe-area-inset-top,0px)+0.95rem)] pb-[calc(env(safe-area-inset-bottom,0px)+0.95rem)]" onPointerDown={e => e.stopPropagation()}>
            <button ref={overlayCloseBtnRef} type="button" onClick={closeMenu} aria-label={toggleLabelClose} className="invite-modal__close modal-close-btn profile-orbit-mobile-close absolute top-[0.55rem] right-[0.65rem] z-[6] grid place-items-center w-[2.85rem] h-[2.85rem] p-0 m-0 !bg-transparent !border-0 !shadow-none leading-none text-[2.2rem] opacity-90 transition-[opacity,transform] duration-[160ms] ease-out [transform:translateZ(0)]">
              &times;
            </button>

            {}
            <div className={cn("profile-orbit-mobile-scrim profile-orbit-mobile-scrim--top absolute left-0 right-0 top-0 h-[4.6rem] z-[4] pointer-events-none transition-opacity duration-[220ms]", canScrollUp ? "opacity-100" : "opacity-0")} aria-hidden="true">
              <div className="profile-orbit-mobile-chevron absolute left-1/2 top-[1.35rem] h-[1.65rem] w-[1.65rem] -translate-x-1/2 rotate-45 border-l-[3px] border-t-[3px] border-current opacity-70 drop-shadow-[0_8px_12px_rgba(0,0,0,0.2)] animate-[orbitChevronBlink_1.15s_ease-in-out_infinite]" />
            </div>

            <div ref={scrollRef} className="profile-orbit-mobile-list relative z-[2] flex-1 overflow-auto overscroll-contain snap-y snap-proximity px-[0.85rem] [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0" style={{
          paddingTop: listPad,
          paddingBottom: listPad
        }}>
              {items.map((item, index) => {
            const v = visuals[index] || {
              scale: 0.62,
              opacity: 0,
              blur: 2,
              hide: true
            };
            const isActive = index === activeIndex;
            return <div key={item.key || index} ref={el => {
              slotRefs.current[index] = el;
            }} data-key={item.key || undefined} className={cn("profile-orbit-mobile-row grid place-items-center snap-center h-[clamp(15.5rem,30vh,19rem)] py-[0.95rem]", isActive && "is-active", v.hide && "is-hidden pointer-events-none")}>
                    <div className="profile-orbit-mobile-visual w-full grid place-items-center transition-[opacity,filter] duration-[180ms] ease-out [will-change:opacity,filter]" style={{
                transform: `scale(${v.scale})`,
                opacity: v.opacity,
                filter: v.blur ? `blur(${v.blur}px)` : "none"
              }}>
                      <button type="button" className="profile-orbit-mobile-action dock-item relative flex flex-col items-center justify-start gap-[clamp(0.2rem,1vw,0.45rem)] w-[clamp(9rem,58vw,12.8rem)] min-h-[clamp(9rem,58vw,12.8rem)] h-auto rounded-full px-[1rem] pt-[0.9rem] pb-[0.7rem] [transform:translateZ(0)] text-[var(--orbit-mobile-accent,#c57171)]" onClick={() => onMobileAction(item)} aria-label={item.label} tabIndex={v.hide ? -1 : 0}>
                        <span className="dock-icon w-full h-auto flex-shrink-0 grid place-items-center leading-none min-h-[clamp(2.6rem,14vw,3.8rem)]" aria-hidden="true">
                          {item.icon}
                        </span>

                        {}
                        <span className={cn("profile-orbit-mobile-action__label block w-full shrink-0 order-[-1] text-center leading-[1.1] font-semibold tracking-[0.025em] text-[clamp(1.1rem,3.9vw,1.5rem)] mt-0 mb-[clamp(0.25rem,1.1vw,0.55rem)] p-0 rounded-none transition-opacity duration-[180ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] overflow-visible break-words max-w-[95%] break-normal [hyphens:auto] [text-wrap:balance] max-h-none bg-transparent border-0", isActive ? "opacity-100" : "opacity-0")} aria-hidden={!isActive}>
                          {item.label}
                        </span>
                      </button>
                    </div>
                  </div>;
          })}
            </div>

            <div className={cn("profile-orbit-mobile-scrim profile-orbit-mobile-scrim--bottom absolute left-0 right-0 bottom-0 h-[4.6rem] z-[4] pointer-events-none transition-opacity duration-[220ms]", canScrollDown ? "opacity-100" : "opacity-0")} aria-hidden="true">
              <div className="profile-orbit-mobile-chevron profile-orbit-mobile-chevron--down absolute left-1/2 bottom-[1.35rem] h-[1.65rem] w-[1.65rem] -translate-x-1/2 rotate-[225deg] border-l-[3px] border-t-[3px] border-current opacity-70 drop-shadow-[0_8px_12px_rgba(0,0,0,0.2)] animate-[orbitChevronBlink_1.15s_ease-in-out_infinite]" />
            </div>
          </div>
        </div>}

      {}
      {useMobileStack && isOpen && <div className="profile-orbit-stack-backdrop fixed inset-0 z-[9999] flex items-stretch justify-center p-0" role="dialog" aria-modal="true" aria-label={ariaLabel} onPointerDown={e => {
      if (e.target === e.currentTarget) closeMenu();
    }}>
          <div className="profile-orbit-stack-panel relative w-screen max-w-screen h-[100svh] max-h-[100svh] flex flex-col items-center justify-between gap-[clamp(1.1rem,2.6vh,2rem)]" onPointerDown={e => e.stopPropagation()}>
            <div className="profile-orbit-stack-fade profile-orbit-stack-fade--top" aria-hidden="true" />
            <div className="profile-orbit-stack-fade profile-orbit-stack-fade--bottom" aria-hidden="true" />

            <div ref={stackListRef} className="profile-orbit-stack-list w-full flex flex-col items-center gap-[clamp(1rem,2.6vh,1.6rem)]" style={{
          paddingTop: stackPad,
          paddingBottom: stackPad,
          "--stack-pad": `${stackPad}px`
        }}>
              {stackItems.map((item, index) => {
            const isFocus = stackFocusIndex === index;
            return <button key={item.key || index} ref={el => {
              stackItemRefs.current[index] = el;
            }} type="button" data-key={item.key || undefined} className={`profile-orbit-stack-item${isFocus ? " is-focus" : ""}`} onClick={() => onMobileAction(item)} aria-label={item.label}>
                  <span className="profile-orbit-stack-bubble dock-item" aria-hidden="true">
                    <span className="dock-icon">
                      {item.icon}
                    </span>
                  </span>
                  <span className="profile-orbit-stack-label">{item.label}</span>
                </button>;
          })}
            </div>
          </div>
        </div>}
    </div>;
}
