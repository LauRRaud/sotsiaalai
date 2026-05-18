"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import styles from "./RightRail.module.css";
import { usePathname, useRouter } from "next/navigation";
import { ChatBubbleIcon, ProfileIcon, RoomsIcon, WorkspaceIcon } from "@/components/ui/icons/ChatIcons";
import { pushWithTransition } from "@/lib/routeTransition";
import { localizePath, stripLocaleFromPath } from "@/lib/localizePath";
import { cn } from "@/components/ui/cn";

const MOBILE_VIEWPORT_QUERY = "(max-width: 768px)";
const COARSE_POINTER_QUERY = "(hover: none) and (pointer: coarse)";
const ROUTE_TILT_STATE_EVENT = "sotsiaalai:glass-ring-tilt-state";
const TILT_ACTIVE_FLAG_KEY = "__SOTSIAALAI_GLASS_RING_TILT_ACTIVE";
const RAIL_TOOLTIP_DISMISS_EVENT = "sotsiaalai:chat-rail-tooltip-dismiss";
const DEFAULT_RAIL_ITEM_SIZE_PX = 48;
const DEFAULT_RAIL_STEP_FACTOR = 1.12;
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

function detectMobileViewport() {
  if (typeof window === "undefined") return false;
  const matchWidth = window.matchMedia?.(MOBILE_VIEWPORT_QUERY)?.matches;
  const matchCoarse = window.matchMedia?.(COARSE_POINTER_QUERY)?.matches;
  return Boolean(matchWidth || matchCoarse || window.innerWidth <= 768);
}

function detectRailProfileScale() {
  return 1;
}

function detectRailStepSpread() {
  if (typeof document === "undefined") return 1;
  const root = document.documentElement;
  const profile = root?.dataset?.uiProfile;
  const scale = root?.dataset?.uiScale;
  if (profile === "mac" || scale === "mac") return 1.18;
  return 1;
}

export default function RightRail({
  t,
  locale = "et",
  isLightTheme,
  inputFocused,
  onProfileToggle,
  activeWorkspaceKey = "",
  workspaceOpen = false,
  onWorkspaceToggle,
  embedded = false,
  suspendPointerEvents = false,
  suppressTooltip = false,
  mobileVisible = true
}) {
  const router = useRouter();
  const pathname = usePathname();
  const slotRef = useRef(null);
  const railRef = useRef(null);
  const tooltipHideTimerRef = useRef(0);
  const tooltipSwitchTimerRef = useRef(0);
  const tooltipRevealRafRef = useRef(0);
  const tooltipVisibleRef = useRef(false);
  const tooltipLabelIndexRef = useRef(1);
  const hoverTooltipIndexRef = useRef(null);
  const didInitDesktopActiveRef = useRef(false);
  const wheelAccumRef = useRef(0);
  const lastStepRef = useRef(0);
  const activeIndexRef = useRef(0);
  const armClearTimerRef = useRef(0);

  const [activeIndex, setActiveIndex] = useState(0);
  const [tooltipLabelIndex, setTooltipLabelIndex] = useState(1);
  const [isMounted, setIsMounted] = useState(false);
  const [railProfileScale, setRailProfileScale] = useState(() => detectRailProfileScale());
  const [railStepSpread, setRailStepSpread] = useState(1);
  const [stepPx, setStepPx] = useState(() =>
    Math.round(DEFAULT_RAIL_ITEM_SIZE_PX * DEFAULT_RAIL_STEP_FACTOR * detectRailProfileScale())
  );
  const [isMobile, setIsMobile] = useState(false);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [isRouteTilting, setIsRouteTilting] = useState(false);
  const [armedKey, setArmedKey] = useState(null);
  const normalizedPathname = useMemo(
    () => stripLocaleFromPath(pathname || "/"),
    [pathname]
  );
  const viewportIsMobile = isMounted ? isMobile : false;
  useIsomorphicLayoutEffect(() => {
    setIsMounted(true);
  }, []);
  useEffect(() => {
    return () => {
      if (tooltipHideTimerRef.current) {
        window.clearTimeout(tooltipHideTimerRef.current);
        tooltipHideTimerRef.current = 0;
      }
      if (tooltipSwitchTimerRef.current) {
        window.clearTimeout(tooltipSwitchTimerRef.current);
        tooltipSwitchTimerRef.current = 0;
      }
      if (tooltipRevealRafRef.current) {
        cancelAnimationFrame(tooltipRevealRafRef.current);
        tooltipRevealRafRef.current = 0;
      }
      if (armClearTimerRef.current) {
        window.clearTimeout(armClearTimerRef.current);
        armClearTimerRef.current = 0;
      }
      tooltipVisibleRef.current = false;
    };
  }, []);

  useIsomorphicLayoutEffect(() => {
    const update = () => {
      if (typeof window === "undefined") return;
      setIsMobile(detectMobileViewport());
    };
    update();
    if (typeof window === "undefined") return;
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useIsomorphicLayoutEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const update = () => {
      const style = window.getComputedStyle(rail);
      // Mirror LeftRail sizing: use the rail CSS var instead of a rendered node.
      // The first visible node can vary by active slot and icon composition, which
      // made the right rail step feel looser than the left rail.
      const itemSizeRaw = Number.parseFloat(
        style.getPropertyValue("--rail-item-size").trim()
      );
      const itemSize =
        Number.isFinite(itemSizeRaw) && itemSizeRaw > 0 ? itemSizeRaw : 0;
      const factorRaw = Number.parseFloat(
        style.getPropertyValue("--rail-step-factor").trim()
      );
      const factor =
        Number.isFinite(factorRaw) && factorRaw > 0 ? factorRaw : 1.22;
      const parsed =
        Number.isFinite(itemSize) && itemSize > 0 ? itemSize * factor : NaN;
      const profileScaleParsed = Number.parseFloat(style.getPropertyValue("--rail-profile-scale").trim());
      if (Number.isFinite(profileScaleParsed) && profileScaleParsed > 0) {
        setRailProfileScale(prev => (Math.abs(prev - profileScaleParsed) > 0.001 ? profileScaleParsed : prev));
      }
      const nextStepSpread = detectRailStepSpread();
      setRailStepSpread(prev => (Math.abs(prev - nextStepSpread) > 0.001 ? nextStepSpread : prev));
      if (!Number.isFinite(parsed)) return;
      setStepPx(prev => {
        const next = Math.round(parsed);
        return prev === next ? prev : next;
      });
    };
    update();
    const ro = new ResizeObserver(() => update());
    ro.observe(rail);
    window.addEventListener("resize", update);
    const html = document.documentElement;
    const mo = new MutationObserver(() => update());
    mo.observe(html, {
      attributes: true,
      attributeFilter: ["data-ui-profile", "data-ui-scale", "data-text-scale", "style"]
    });
    return () => {
      window.removeEventListener("resize", update);
      ro.disconnect();
      mo.disconnect();
    };
  }, []);

  const clearArmed = useCallback(() => {
    setArmedKey(null);
    if (armClearTimerRef.current) {
      window.clearTimeout(armClearTimerRef.current);
      armClearTimerRef.current = 0;
    }
  }, []);

  const hideTooltipImmediately = useCallback(() => {
    if (tooltipHideTimerRef.current) {
      window.clearTimeout(tooltipHideTimerRef.current);
      tooltipHideTimerRef.current = 0;
    }
    if (tooltipSwitchTimerRef.current) {
      window.clearTimeout(tooltipSwitchTimerRef.current);
      tooltipSwitchTimerRef.current = 0;
    }
    if (tooltipRevealRafRef.current) {
      cancelAnimationFrame(tooltipRevealRafRef.current);
      tooltipRevealRafRef.current = 0;
    }
    hoverTooltipIndexRef.current = null;
    tooltipVisibleRef.current = false;
    setIsTooltipVisible(false);
  }, []);

  const showTooltipPersistently = useCallback(
    index => {
      if (viewportIsMobile || suspendPointerEvents || suppressTooltip || isRouteTilting) return;
      if (!Number.isFinite(index)) return;
      hoverTooltipIndexRef.current = index;
      if (tooltipHideTimerRef.current) {
        window.clearTimeout(tooltipHideTimerRef.current);
        tooltipHideTimerRef.current = 0;
      }
      if (tooltipSwitchTimerRef.current) {
        window.clearTimeout(tooltipSwitchTimerRef.current);
        tooltipSwitchTimerRef.current = 0;
      }
      if (tooltipRevealRafRef.current) {
        cancelAnimationFrame(tooltipRevealRafRef.current);
        tooltipRevealRafRef.current = 0;
      }
      tooltipLabelIndexRef.current = index;
      setTooltipLabelIndex(index);
      tooltipVisibleRef.current = true;
      setIsTooltipVisible(true);
    },
    [viewportIsMobile, suspendPointerEvents, suppressTooltip, isRouteTilting]
  );

  const hideHoverTooltip = useCallback(
    index => {
      if (hoverTooltipIndexRef.current !== index) return;
      hoverTooltipIndexRef.current = null;
      hideTooltipImmediately();
    },
    [hideTooltipImmediately]
  );

  const dismissAllRailTooltips = useCallback(() => {
    hideTooltipImmediately();
    if (typeof window === "undefined") return;
    try {
      window.dispatchEvent(new CustomEvent(RAIL_TOOLTIP_DISMISS_EVENT));
    } catch {}
  }, [hideTooltipImmediately]);

  const showTooltipTemporarily = useCallback((index, durationMs = 1300, revealDelayMs = 0) => {
    if (viewportIsMobile || suspendPointerEvents || suppressTooltip || isRouteTilting) return;
    if (!Number.isFinite(index)) return;
    if (
      tooltipVisibleRef.current &&
      tooltipLabelIndexRef.current === index &&
      tooltipHideTimerRef.current
    ) {
      return;
    }
    if (tooltipSwitchTimerRef.current) {
      window.clearTimeout(tooltipSwitchTimerRef.current);
      tooltipSwitchTimerRef.current = 0;
    }
    if (tooltipRevealRafRef.current) {
      cancelAnimationFrame(tooltipRevealRafRef.current);
      tooltipRevealRafRef.current = 0;
    }
    tooltipLabelIndexRef.current = index;
    setTooltipLabelIndex(index);
    if (tooltipHideTimerRef.current) {
      window.clearTimeout(tooltipHideTimerRef.current);
      tooltipHideTimerRef.current = 0;
    }
    const revealTooltip = () => {
      tooltipVisibleRef.current = true;
      setIsTooltipVisible(true);
      tooltipHideTimerRef.current = window.setTimeout(() => {
        tooltipVisibleRef.current = false;
        setIsTooltipVisible(false);
        tooltipHideTimerRef.current = 0;
      }, durationMs);
    };
    if (revealDelayMs > 0) {
      if (tooltipVisibleRef.current) {
        revealTooltip();
        return;
      }
      tooltipVisibleRef.current = false;
      setIsTooltipVisible(false);
      tooltipSwitchTimerRef.current = window.setTimeout(() => {
        tooltipSwitchTimerRef.current = 0;
        revealTooltip();
      }, revealDelayMs);
      return;
    }
    revealTooltip();
  }, [viewportIsMobile, suspendPointerEvents, suppressTooltip, isRouteTilting]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onDismiss = () => hideTooltipImmediately();
    window.addEventListener(RAIL_TOOLTIP_DISMISS_EVENT, onDismiss);
    return () => window.removeEventListener(RAIL_TOOLTIP_DISMISS_EVENT, onDismiss);
  }, [hideTooltipImmediately]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsRouteTilting(Boolean(window[TILT_ACTIVE_FLAG_KEY]));
    const onTiltState = event => {
      setIsRouteTilting(Boolean(event?.detail?.active));
    };
    window.addEventListener(ROUTE_TILT_STATE_EVENT, onTiltState);
    return () => {
      window.removeEventListener(ROUTE_TILT_STATE_EVENT, onTiltState);
    };
  }, []);

  useEffect(() => {
    if (!isRouteTilting) return;
    hideTooltipImmediately();
  }, [isRouteTilting, hideTooltipImmediately]);

  useEffect(() => {
    tooltipVisibleRef.current = isTooltipVisible;
  }, [isTooltipVisible]);

  useEffect(() => {
    tooltipLabelIndexRef.current = tooltipLabelIndex;
  }, [tooltipLabelIndex]);

  const openChatsDrawer = e => {
    if (embedded || normalizedPathname.startsWith("/vestlus")) {
      e?.preventDefault?.();
      try {
        window.dispatchEvent(new CustomEvent("sotsiaalai:toggle-conversations", {
          detail: { open: true }
        }));
      } catch {}
      return;
    }
    pushWithTransition(router, localizePath("/vestlus", locale));
  };

  const openRooms = () => {
    if (isMobile) {
      pushWithTransition(router, localizePath("/ruum", locale));
      return;
    }
    pushWithTransition(router, localizePath("/ruum", locale), {
      glassRingTilt: "right",
      waitForGlassRingTilt: true,
      persistGlassRingTilt: false
    });
  };

  const desktopItems = useMemo(() => {
    return [{
      key: "profile",
      label: t("nav.profile")
    }, {
      key: "rooms",
      label: t("nav.rooms")
    }, {
      key: "workspace",
      label: t("nav.workspace", "Töölaud")
    }];
  }, [t]);

  const mobileItems = useMemo(() => {
    return [{
      key: "workspace",
      label: t("nav.workspace", "Töölaud")
    }, {
      key: "profile",
      label: t("nav.profile")
    }];
  }, [t]);
  const items = viewportIsMobile ? mobileItems : desktopItems;

  const mobileSlots = useMemo(() => {
    const order = ["workspace", "profile"];
    return order.map(key => {
      const itemIndex = mobileItems.findIndex(item => item.key === key);
      if (itemIndex < 0) return null;
      return {
        it: mobileItems[itemIndex],
        itemIndex,
        slotOffset: 0
      };
    }).filter(Boolean);
  }, [mobileItems]);

  useEffect(() => {
    if (activeWorkspaceKey) {
      const nextIndex = items.findIndex((item) => item.key === activeWorkspaceKey);
      if (nextIndex >= 0) {
        setActiveIndex(nextIndex);
        clearArmed();
        return;
      }
    }
    const idx = (() => {
      if (!viewportIsMobile) {
        if (normalizedPathname.startsWith("/profiil")) return 0;
        return 0;
      }
      if (!normalizedPathname) return 1;
      if (normalizedPathname.startsWith("/profiil")) return 1;
      if (normalizedPathname.startsWith("/vestlus")) return 1;
      return 1;
    })();
    setActiveIndex(idx);
    clearArmed();
  }, [activeWorkspaceKey, clearArmed, items, normalizedPathname, viewportIsMobile]);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);
  useEffect(() => {
    const rail = railRef.current;
    if (!rail || isMobile) return;
    const onWheel = event => {
      event.preventDefault();
      event.stopPropagation();
      const delta = event.deltaY;
      if (!Number.isFinite(delta) || delta === 0) return;
      const now = performance.now();
      if (now - lastStepRef.current < 110) return;
      wheelAccumRef.current += delta;
      // Use device-appropriate wheel thresholds so one mouse notch advances one icon.
      const threshold = event.deltaMode === 1 ? 2 : Math.max(56, Math.round(stepPx * 0.65));
      if (Math.abs(wheelAccumRef.current) < threshold) return;
      const direction = wheelAccumRef.current > 0 ? 1 : -1;
      wheelAccumRef.current = 0;
      lastStepRef.current = now;
      const prev = activeIndexRef.current;
      const maxIndex = Math.max(0, items.length - 1);
      const next = Math.max(0, Math.min(maxIndex, prev + direction));
      if (next !== prev) {
        activeIndexRef.current = next;
        setActiveIndex(next);
      }
      showTooltipTemporarily(next, 1300, 180);
    };
    rail.addEventListener("wheel", onWheel, {
      passive: false,
      capture: true
    });
    return () => rail.removeEventListener("wheel", onWheel);
  }, [isMobile, items.length, stepPx, showTooltipTemporarily]);

  useEffect(() => {
    if (isMobile) return;
    clearArmed();
  }, [isMobile, clearArmed]);

  useEffect(() => {
    if (!(isMobile && !mobileVisible)) return;
    const rail = railRef.current;
    const active = document.activeElement;
    if (rail && active instanceof HTMLElement && rail.contains(active)) {
      active.blur();
    }
    clearArmed();
  }, [isMobile, mobileVisible, clearArmed]);

  useEffect(() => {
    if (!(isMobile || suspendPointerEvents || suppressTooltip || !mobileVisible || isRouteTilting)) return;
    hideTooltipImmediately();
  }, [isMobile, suspendPointerEvents, suppressTooltip, mobileVisible, isRouteTilting, hideTooltipImmediately]);

  useEffect(() => {
    if (isMobile || suspendPointerEvents || suppressTooltip || !mobileVisible || isRouteTilting) {
      didInitDesktopActiveRef.current = false;
      hoverTooltipIndexRef.current = null;
      return;
    }
    tooltipLabelIndexRef.current = activeIndex;
    setTooltipLabelIndex(activeIndex);
    if (!didInitDesktopActiveRef.current) {
      didInitDesktopActiveRef.current = true;
      return;
    }
    if (tooltipHideTimerRef.current) {
      window.clearTimeout(tooltipHideTimerRef.current);
      tooltipHideTimerRef.current = 0;
    }
    if (tooltipSwitchTimerRef.current) {
      window.clearTimeout(tooltipSwitchTimerRef.current);
      tooltipSwitchTimerRef.current = 0;
    }
    if (tooltipRevealRafRef.current) {
      cancelAnimationFrame(tooltipRevealRafRef.current);
      tooltipRevealRafRef.current = 0;
    }
    showTooltipTemporarily(activeIndex, 1300, 180);
  }, [activeIndex, isMobile, mobileVisible, showTooltipTemporarily, suppressTooltip, suspendPointerEvents, isRouteTilting]);

  useEffect(() => {
    if (!isMobile || !armedKey) return;
    const onPointerDown = event => {
      const rail = railRef.current;
      const target = event.target;
      if (rail && target instanceof Node && rail.contains(target)) return;
      clearArmed();
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [isMobile, armedKey, clearArmed]);

  const onKeyDown = event => {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
    event.preventDefault();
    event.stopPropagation();
    const direction = event.key === "ArrowDown" ? 1 : -1;
    setActiveIndex(prev => {
      const maxIndex = Math.max(0, items.length - 1);
      return Math.max(0, Math.min(maxIndex, prev + direction));
    });
  };

  const slotClassName = cn(
    styles.slot,
    "chat-right-actions",
    styles.mobileRailTransition,
    !mobileVisible ? styles.mobileRailHidden : null,
    mobileVisible ? styles.mobileRailVisible : null,
    suspendPointerEvents ? styles.pointerBlocked : null,
    "max-[768px]:absolute max-[768px]:top-[var(--chat-mobile-rail-top)] max-[768px]:left-0 max-[768px]:right-0 max-[768px]:h-auto",
    !isMounted ? "opacity-0 pointer-events-none" : null
  );

  const railClassName = cn(
    styles.rightRail,
    "max-[768px]:relative max-[768px]:top-0 max-[768px]:right-0 max-[768px]:left-auto max-[768px]:ml-auto max-[768px]:[transform:none] max-[768px]:h-auto max-[768px]:w-auto max-[768px]:flex max-[768px]:flex-row max-[768px]:items-center max-[768px]:justify-end max-[768px]:gap-[clamp(0.3rem,1.9vw,0.52rem)] max-[768px]:pt-[0] max-[768px]:pb-[0] max-[768px]:pl-[clamp(0.25rem,1.6vw,0.5rem)] max-[768px]:pr-[clamp(0.45rem,2.4vw,0.75rem)] max-[768px]:overflow-visible max-[768px]:[mask-image:none] max-[768px]:[-webkit-mask-image:none] max-[768px]:[--rail-item-size:var(--chat-mobile-rail-size)] max-[768px]:[--rail-icon-scale:0.9]"
  );

  const mobileItemClassName =
    "max-[768px]:static max-[768px]:left-auto max-[768px]:top-auto max-[768px]:[transform:none] max-[768px]:w-[var(--rail-item-size)] max-[768px]:h-auto max-[768px]:opacity-100 max-[768px]:transition-[transform,opacity]";

  const mobileIconButtonClassName =
    "max-[768px]:grid max-[768px]:place-items-center max-[768px]:leading-none";

  const mobileLabelClassName =
    "max-[768px]:block max-[768px]:tracking-[0.035em] max-[768px]:text-[#c57171] light:max-[768px]:text-[#7a3a38] hc:max-[768px]:text-[color:var(--hc-accent)] max-[768px]:text-center max-[768px]:[text-wrap:balance] max-[768px]:opacity-0 max-[768px]:overflow-visible max-[768px]:transition-[opacity,transform] max-[768px]:duration-160 max-[768px]:ease-out";
  const showDesktopTooltip = !viewportIsMobile &&
    !suspendPointerEvents &&
    !suppressTooltip &&
    !isRouteTilting &&
    isTooltipVisible &&
    tooltipLabelIndex >= 0 &&
    tooltipLabelIndex < items.length;
  const tooltipAnchorShiftX = inputFocused ? 0 : 7.4 * railProfileScale;
  const tooltipAnchorStyle = {
    transform: `translate(-50%, -50%) translateX(${tooltipAnchorShiftX.toFixed(2)}px) translateY(0px) scale(1.240)`,
    opacity: "1",
    zIndex: 10
  };

  return <div ref={slotRef} className={slotClassName}>
      <nav className={cn(railClassName, !mobileVisible ? styles.navHiddenMobile : styles.navVisibleMobile)} ref={railRef} tabIndex={viewportIsMobile && !mobileVisible ? -1 : 0} inert={viewportIsMobile && !mobileVisible ? true : undefined} aria-label={t("chat.right_rail")} onKeyDown={onKeyDown}>
        {(viewportIsMobile ? mobileSlots : [-2, -1, 0, 1, 2].map(slotOffset => {
        const itemIndex = activeIndex + slotOffset;
        if (itemIndex < 0 || itemIndex >= items.length) return null;
        return {
          it: items[itemIndex],
          itemIndex,
          slotOffset
        };
      }).filter(Boolean)).map((slot, renderIndex) => {
        const {
          it,
          itemIndex,
          slotOffset
        } = slot;
        if (!it) return null;
        const curveOffset = slotOffset;
        const curveNorm = Math.min(Math.abs(curveOffset) / 2, 1);
        const edgeCurveBoost = !inputFocused && (activeIndex === 0 || activeIndex === items.length - 1) ? 1.35 * railProfileScale : 0;
        const edgeSafetyBoost = !inputFocused && (activeIndex === 0 || activeIndex === items.length - 1) ? 3.5 * railProfileScale : 0;
        const baseCurvePx = ((inputFocused ? 0 : 1.9) * railProfileScale) + edgeCurveBoost;
        const edgeSafetyPx = ((inputFocused ? 0 : 7.2) * railProfileScale) + edgeSafetyBoost;
        const curveSkewPx = (inputFocused ? 0 : 0.6) * railProfileScale;
        const inwardSkewPx = Math.abs(curveOffset) * curveSkewPx;
        const centerOutwardPx = !viewportIsMobile && !inputFocused && slotOffset === 0 ? 7.4 * railProfileScale : 0;
        const adjacentEdgeOutwardPx = !viewportIsMobile && !inputFocused && ((activeIndex === 0 && slotOffset === 1) || (activeIndex === items.length - 1 && slotOffset === -1)) ? 3.2 * railProfileScale : 0;
        const farEdgeOutwardPx = !viewportIsMobile && !inputFocused && ((activeIndex === 0 && slotOffset === 2) || (activeIndex === items.length - 1 && slotOffset === -2)) ? 2.2 * railProfileScale : 0;
        const outerSlotDistanceFactor = Math.abs(slotOffset) === 2 ? 0.94 : 1;
        const offsetX = -baseCurvePx * curveNorm * curveNorm - edgeSafetyPx * curveNorm * curveNorm * curveNorm * curveNorm - inwardSkewPx + centerOutwardPx + adjacentEdgeOutwardPx + farEdgeOutwardPx;
        const profileGapPx = !viewportIsMobile && it?.key === "profile"
          ? -(4.2 * railProfileScale)
          : 0;
        const offsetY = (slotOffset * stepPx * outerSlotDistanceFactor * railStepSpread) + profileGapPx;
        const norm = Math.min(Math.abs(slotOffset) / 2, 1);
        const scale = 0.88 + (1 - norm) * 0.36;
        const opacity = slotOffset === 0 ? 1 : 0.32 + (1 - norm) * 0.48;
        const zIndex = 10 - Math.abs(slotOffset);

        const mobileRevealDelay = viewportIsMobile ? (Math.max(0, mobileSlots.length - 1 - renderIndex) * 48) : 0;
        const commonProps = {
          className: cn(
            styles.item,
            viewportIsMobile && armedKey === it?.key ? styles.isArmed : null,
            !viewportIsMobile && slotOffset === 0 ? styles.isActive : null,
            viewportIsMobile && mobileVisible ? styles.mobileReveal : null,
            mobileItemClassName
          ),
          style: viewportIsMobile ? {
            "--mobile-reveal-delay": `${mobileRevealDelay}ms`
          } : {
            transform: `translate(-50%, -50%) translateX(${offsetX.toFixed(2)}px) translateY(${offsetY}px) scale(${scale.toFixed(3)})`,
            opacity: opacity.toFixed(3),
            zIndex
          }
        };

        const performActivate = event => {
          if (!it) return;
          dismissAllRailTooltips();
          if (!viewportIsMobile) {
            setActiveIndex(itemIndex);
          }

          if (it.key === "profile") {
            if (typeof onProfileToggle === "function") {
              onProfileToggle();
              return;
            }
            pushWithTransition(router, localizePath("/profiil", locale), {
              glassRingTilt: "right",
              waitForGlassRingTilt: true,
              persistGlassRingTilt: false
            });
            return;
          }
          if (it.key === "chats") {
            openChatsDrawer(event);
            return;
          }
          if (it.key === "workspace") {
            onWorkspaceToggle?.();
            return;
          }
          if (it.key === "rooms") {
            openRooms();
            return;
          }
        };

        const onActivate = event => {
          if (!it) return;
          if (!viewportIsMobile) {
            performActivate(event);
            return;
          }
          clearArmed();
          performActivate(event);
        };

        const ariaLabel = it?.label || "";
        const isDisabled = false;
        const isAriaDisabled = isDisabled;
        const displayLabel = it?.label || "";
        const workspaceIconProps = viewportIsMobile
          ? {
              outerStrokeWidth: 2.05,
              innerStrokeWidth: 1.56,
              nonScalingStroke: true,
              variant: "mobileNav"
            }
          : {
              outerStrokeWidth: 1.28,
              innerStrokeWidth: 1.16
            };

        return <button key={`slot-${it.key}`} type="button" {...commonProps} data-key={it?.key} data-item-index={itemIndex} className={cn("chat-rail-icon-btn", commonProps.className, styles.iconBtn, mobileIconButtonClassName)} onClick={onActivate} onMouseEnter={!viewportIsMobile ? () => {
        if (itemIndex !== activeIndex) return;
        showTooltipPersistently(activeIndex);
      } : undefined} onMouseLeave={!viewportIsMobile ? () => {
        if (itemIndex !== activeIndex) return;
        hideHoverTooltip(activeIndex);
      } : undefined} onFocus={!viewportIsMobile ? () => {
        if (itemIndex !== activeIndex) return;
        showTooltipPersistently(activeIndex);
      } : undefined} onBlur={!viewportIsMobile ? () => {
        if (itemIndex !== activeIndex) return;
        hideHoverTooltip(activeIndex);
      } : undefined} onDoubleClick={viewportIsMobile ? event => {
        event.preventDefault();
        event.stopPropagation();
        clearArmed();
        performActivate(event);
      } : undefined} aria-label={ariaLabel} aria-disabled={isAriaDisabled ? "true" : undefined} disabled={isDisabled}>
              {it?.key === "profile" ? <ProfileIcon isLightTheme={isLightTheme} className={`${styles.profileAvatar} ${styles.avatar}`} /> : it?.key === "chats" ? <ChatBubbleIcon isLightTheme={isLightTheme} className={cn(styles.iconSvg, styles.iconChats, isMobile ? styles.chatIconMobile : styles.chatIconDesktop)} /> : it?.key === "workspace" ? <WorkspaceIcon isLightTheme={isLightTheme} {...workspaceIconProps} className={cn(styles.iconSvg, styles.iconWorkspace, workspaceOpen ? styles.iconWorkspaceOpen : null)} /> : it?.key === "rooms" ? <RoomsIcon isLightTheme={isLightTheme} className={cn(styles.iconSvg, styles.iconRooms)} /> : null}
              <span className={cn(styles.label, mobileLabelClassName)} aria-hidden="true">
                {displayLabel}
              </span>
            </button>;
      })}
      {showDesktopTooltip ? <span className={cn(styles.item, styles.tooltipAnchor)} style={tooltipAnchorStyle} aria-hidden="true">
          <span className={cn(styles.tooltip, isTooltipVisible ? styles.tooltipVisible : styles.tooltipHidden)} role="tooltip" aria-hidden={isTooltipVisible ? undefined : "true"}>
            {items[tooltipLabelIndex]?.label || ""}
          </span>
        </span> : null}

      </nav>
    </div>;
}

