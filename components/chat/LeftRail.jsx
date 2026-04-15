"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import BackIcon from "@/components/ui/icons/BackIcon";
import { ChatBubbleIcon, HelpOfferIcon, HelpRequestIcon, RoomsIcon, SourcesIcon } from "@/components/ui/icons/ChatIcons";
import { pushWithTransition, runWithTransition } from "@/lib/routeTransition";
import { localizePath, stripLocaleFromPath } from "@/lib/localizePath";
import { cn } from "@/components/ui/cn";
import styles from "./LeftRail.module.css";

const MOBILE_VIEWPORT_QUERY = "(max-width: 768px)";
const COARSE_POINTER_QUERY = "(hover: none) and (pointer: coarse)";
const CHAT_BACK_HOVER_ARM_KEY = "sotsiaalai:chat:back-hover-arm-on-move";
const CHAT_CREATE_CONVERSATION_EVENT = "sotsiaalai:create-conversation";
const ROUTE_TILT_STATE_EVENT = "sotsiaalai:glass-ring-tilt-state";
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

function _getHelpLabels(locale = "et") {
  const normalized = String(locale || "et").trim().toLowerCase();
  if (normalized === "en") {
    return { requests: "Help requests", offers: "Help offers" };
  }
  if (normalized === "ru") {
    return { requests: "Запросы помощи", offers: "Предложения помощи" };
  }
  return { requests: "Abisoovid", offers: "Abipakkumised" };
}

function NewConversationIcon({ isLightTheme = false, className }) {
  const plusStroke = isLightTheme
    ? "var(--chat-icon-light, #7A3A38)"
    : "var(--chat-icon-dark, #c57171)";

  return (
    <span className={styles.newChatIconWrap} aria-hidden="true">
      <ChatBubbleIcon
        isLightTheme={isLightTheme}
        showDots={false}
        strokeWidth={8.2}
        className={cn(className, styles.iconChats, styles.iconNewChatBubble)}
      />
      <span className={styles.newChatPlus}>
        <svg
          viewBox="0 0 42 42"
          fill="none"
          focusable="false"
          className={styles.newChatPlusIcon}
          style={{ color: plusStroke }}
        >
          <path
            d="M21 8.75v24.5M8.75 21h24.5"
            stroke="currentColor"
            strokeWidth="5.2"
            strokeLinecap="round"
          />
        </svg>
      </span>
    </span>
  );
}

export default function LeftRail({
  t,
  locale = "et",
  isLightTheme,
  inputFocused,
  sourcesButtonRef,
  toggleSourcesPanel,
  showSourcesPanel,
  sourcesPulse,
  conversationSources,
  hasConversationSources,
  onBackHome,
  activeHelpPanelKey = "",
  onShowHelpRequests,
  onShowHelpOffers,
  embedded = false,
  suspendPointerEvents = false,
  mobileVisible = true
}) {
  const router = useRouter();
  const pathname = usePathname();
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
  const [activeIndex, setActiveIndex] = useState(0);
  const [tooltipLabelIndex, setTooltipLabelIndex] = useState(1);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [backHoverReady, setBackHoverReady] = useState(true);
  const [isRouteTilting, setIsRouteTilting] = useState(false);
  const [railProfileScale, setRailProfileScale] = useState(() => detectRailProfileScale());
  const [railStepSpread, setRailStepSpread] = useState(1);
  const [stepPx, setStepPx] = useState(() =>
    Math.round(DEFAULT_RAIL_ITEM_SIZE_PX * DEFAULT_RAIL_STEP_FACTOR * detectRailProfileScale())
  );
  const [isMobile, setIsMobile] = useState(false);
  const localizedHelpLabels = useMemo(() => _getHelpLabels(locale), [locale]);
  const normalizedPathname = useMemo(
    () => stripLocaleFromPath(pathname || "/"),
    [pathname]
  );
  const sourcesLabel = t("chat.sources.button").replace(
    "{count}",
    String(conversationSources.length)
  );
  const mobileItems = useMemo(
    () => [
      { key: "chats", label: t("nav.chats") },
      { key: "rooms", label: t("nav.rooms") },
      { key: "sources", label: sourcesLabel },
      {
        key: "help_requests",
        label: t("chat.help.helpRequests") || localizedHelpLabels.requests
      },
      {
        key: "help_offers",
        label: t("chat.help.helpOffers") || localizedHelpLabels.offers
      }
    ],
    [localizedHelpLabels.offers, localizedHelpLabels.requests, sourcesLabel, t]
  );
  const items = useMemo(
    () => [
      { key: "back", label: t("chat.back_to_home") },
      { key: "new_chat", label: t("buttons.new_conversation") },
      { key: "chats", label: t("nav.chats") },
      { key: "rooms", label: t("nav.rooms") },
      { key: "help_requests", label: t("chat.help.helpRequests") },
      { key: "help_offers", label: t("chat.help.helpOffers") }
    ],
    [t]
  );

  useIsomorphicLayoutEffect(() => {
    setIsMounted(true);
  }, []);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isMobile) return;
    let armOnMove = false;
    try {
      armOnMove = window.sessionStorage.getItem(CHAT_BACK_HOVER_ARM_KEY) === "1";
      if (armOnMove) {
        window.sessionStorage.removeItem(CHAT_BACK_HOVER_ARM_KEY);
      }
    } catch {}
    if (!armOnMove) {
      setBackHoverReady(true);
      return;
    }
    setBackHoverReady(false);
    const onMouseMove = () => setBackHoverReady(true);
    window.addEventListener("mousemove", onMouseMove, { once: true });
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [isMobile]);

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
      // Read the rail item size from CSS var instead of a rendered item node.
      // The first visible node can be the smaller "back" button variant, which
      // made the computed step unstable and caused visible re-layout on load.
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
      if (isMobile || suspendPointerEvents || isRouteTilting) return;
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
    [isMobile, isRouteTilting, suspendPointerEvents]
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

  const showTooltipTemporarily = useCallback(
    (index, durationMs = 1300, revealDelayMs = 0) => {
      if (isMobile || suspendPointerEvents || isRouteTilting) return;
      if (!Number.isFinite(index)) return;
      if (
        tooltipVisibleRef.current &&
        tooltipLabelIndexRef.current === index &&
        tooltipHideTimerRef.current
      ) {
        return;
      }
      if (items[index]?.key === "back") {
        hideTooltipImmediately();
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
    },
    [hideTooltipImmediately, isMobile, isRouteTilting, items, suspendPointerEvents]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onDismiss = () => hideTooltipImmediately();
    window.addEventListener(RAIL_TOOLTIP_DISMISS_EVENT, onDismiss);
    return () => window.removeEventListener(RAIL_TOOLTIP_DISMISS_EVENT, onDismiss);
  }, [hideTooltipImmediately]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onTiltState = event => {
      const active = Boolean(event?.detail?.active);
      setIsRouteTilting(active);
      if (active) {
        hideTooltipImmediately();
      }
    };
    window.addEventListener(ROUTE_TILT_STATE_EVENT, onTiltState);
    return () => window.removeEventListener(ROUTE_TILT_STATE_EVENT, onTiltState);
  }, [hideTooltipImmediately]);

  useEffect(() => {
    if (activeHelpPanelKey) {
      const nextIndex = items.findIndex((item) => item.key === activeHelpPanelKey);
      if (nextIndex >= 0) {
        setActiveIndex(nextIndex);
        return;
      }
    }
    if (showSourcesPanel) {
      const sourcesIndex = items.findIndex((item) => item.key === "sources");
      if (sourcesIndex >= 0) {
        setActiveIndex(sourcesIndex);
        return;
      }
    }
    setActiveIndex(0);
  }, [activeHelpPanelKey, items, showSourcesPanel]);

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
      const threshold =
        event.deltaMode === 1 ? 2 : Math.max(56, Math.round(stepPx * 0.65));
      if (Math.abs(wheelAccumRef.current) < threshold) return;
      const direction = wheelAccumRef.current > 0 ? 1 : -1;
      wheelAccumRef.current = 0;
      lastStepRef.current = now;
      const prev = activeIndexRef.current;
      const next = Math.max(0, Math.min(items.length - 1, prev + direction));
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
    if (isMobile || suspendPointerEvents) {
      didInitDesktopActiveRef.current = false;
      hoverTooltipIndexRef.current = null;
      hideTooltipImmediately();
      return;
    }
    if (items[activeIndex]?.key !== "back") {
      tooltipLabelIndexRef.current = activeIndex;
      setTooltipLabelIndex(activeIndex);
    }
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
    if (items[activeIndex]?.key === "back") {
      hideTooltipImmediately();
      return;
    }
    showTooltipTemporarily(activeIndex, 1300, 180);
  }, [activeIndex, hideTooltipImmediately, isMobile, isRouteTilting, items, showTooltipTemporarily, suspendPointerEvents]);

  const openChatsDrawer = useCallback(
    event => {
      if (embedded || normalizedPathname.startsWith("/vestlus")) {
        event?.preventDefault?.();
        try {
          window.dispatchEvent(
            new CustomEvent("sotsiaalai:toggle-conversations", {
              detail: { open: true }
            })
          );
        } catch {}
        return;
      }
      pushWithTransition(router, localizePath("/vestlus", locale));
    },
    [embedded, locale, normalizedPathname, router]
  );

  const openNewConversation = useCallback(() => {
    try {
      window.dispatchEvent(new CustomEvent(CHAT_CREATE_CONVERSATION_EVENT));
    } catch {}
  }, []);

  const openRooms = useCallback(() => {
    pushWithTransition(router, localizePath("/ruum", locale));
  }, [locale, router]);

  const openHelpRequestsPanel = useCallback(() => {
    runWithTransition(() => {
      onShowHelpRequests?.();
    }, {
      glassRingTilt: "left",
      waitForGlassRingTilt: true,
      persistGlassRingTilt: false
    });
  }, [onShowHelpRequests]);

  const openHelpOffersPanel = useCallback(() => {
    runWithTransition(() => {
      onShowHelpOffers?.();
    }, {
      glassRingTilt: "left",
      waitForGlassRingTilt: true,
      persistGlassRingTilt: false
    });
  }, [onShowHelpOffers]);

  const onKeyDown = event => {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
    event.preventDefault();
    event.stopPropagation();
    const direction = event.key === "ArrowDown" ? 1 : -1;
    setActiveIndex(prev => Math.max(0, Math.min(items.length - 1, prev + direction)));
  };

  const slotClassName = cn(
    styles.slot,
    inputFocused ? styles.slotInputFocused : null,
    "chat-left-actions",
    styles.mobileRailTransition,
    !mobileVisible ? styles.mobileRailHidden : null,
    mobileVisible ? styles.mobileRailVisible : null,
    suspendPointerEvents ? styles.pointerBlocked : null,
    !isMounted ? "opacity-0 pointer-events-none" : null
  );
  const showDesktopTooltip =
    !isMobile &&
    !suspendPointerEvents &&
    !isRouteTilting &&
    isTooltipVisible &&
    tooltipLabelIndex >= 0 &&
    tooltipLabelIndex < items.length;
  const tooltipAnchorShiftX = inputFocused ? 0 : -(7.4 * railProfileScale);
  const tooltipAnchorStyle = {
    transform: `translate(-50%, -50%) translateX(${tooltipAnchorShiftX.toFixed(2)}px) translateY(0px) scale(1.240)`,
    opacity: "1",
    zIndex: 10
  };

  if (isMobile) {
    return (
      <div className={slotClassName}>
      <nav
        ref={railRef}
        className={cn(styles.leftRail, inputFocused ? styles.leftRailInputFocused : null)}
        tabIndex={0}
        aria-label={t("chat.page_label")}
      >
          {mobileItems.map((item, itemIndex) => {
            const setMobileRailRef = el => {
              if (item.key !== "sources") return;
              if (!sourcesButtonRef) return;
              if (typeof sourcesButtonRef === "function") {
                sourcesButtonRef(el);
              } else {
                sourcesButtonRef.current = el;
              }
            };

            const onActivate = event => {
              dismissAllRailTooltips();
              event.preventDefault();
              event.stopPropagation();
              if (item.key === "chats") {
                openChatsDrawer(event);
                return;
              }
              if (item.key === "new_chat") {
                openNewConversation();
                return;
              }
              if (item.key === "sources") {
                if (!hasConversationSources) return;
                toggleSourcesPanel();
                return;
              }
              if (item.key === "rooms") {
                openRooms();
                return;
              }
              if (item.key === "help_requests") {
                openHelpRequestsPanel();
                return;
              }
              if (item.key === "help_offers") {
                openHelpOffersPanel();
                return;
              }
            };

            return (
              <button
                key={`left-mobile-${item.key}`}
                type="button"
                ref={setMobileRailRef}
                data-key={item.key}
                data-item-index={itemIndex}
                className={cn(
                  styles.item,
                  styles.iconBtn,
                  styles.mobileItem,
                  item.key === "sources" && showSourcesPanel
                    ? styles.iconBtnActive
                    : null,
                  item.key === "sources" && sourcesPulse ? styles.isPulse : null
                )}
                onClick={onActivate}
                aria-label={item.label}
                aria-haspopup={item.key === "sources" ? "dialog" : undefined}
                aria-expanded={
                  item.key === "sources"
                    ? showSourcesPanel
                      ? "true"
                      : "false"
                    : undefined
                }
                aria-controls={
                  item.key === "sources" ? "chat-sources-panel" : undefined
                }
                aria-disabled={
                  item.key === "sources" && !hasConversationSources
                    ? "true"
                    : undefined
                }
                disabled={item.key === "sources" && !hasConversationSources}
              >
                {item.key === "chats" ? (
                  <ChatBubbleIcon
                    isLightTheme={isLightTheme}
                    className={cn(styles.iconSvg, styles.iconChats)}
                  />
                ) : null}
                {item.key === "new_chat" ? (
                  <NewConversationIcon
                    isLightTheme={isLightTheme}
                    className={styles.iconSvg}
                  />
                ) : null}
                {item.key === "sources" ? (
                  <SourcesIcon
                    isLightTheme={isLightTheme}
                    className={cn(styles.iconSvg, styles.iconSvgSources)}
                  />
                ) : null}
                {item.key === "rooms" ? (
                  <RoomsIcon
                    isLightTheme={isLightTheme}
                    className={cn(styles.iconSvg, styles.iconRooms)}
                  />
                ) : null}
                {item.key === "help_requests" ? (
                  <HelpRequestIcon
                    isLightTheme={isLightTheme}
                    className={cn(styles.iconSvg, styles.iconHelp)}
                  />
                ) : null}
                {item.key === "help_offers" ? (
                  <HelpOfferIcon
                    isLightTheme={isLightTheme}
                    className={cn(styles.iconSvg, styles.iconHelp)}
                  />
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>
    );
  }

  return (
    <div className={slotClassName}>
      <nav
        ref={railRef}
        className={cn(styles.leftRail, inputFocused ? styles.leftRailInputFocused : null)}
        tabIndex={0}
        aria-label={t("chat.page_label")}
        onKeyDown={onKeyDown}
      >
        {[-2, -1, 0, 1, 2]
          .map(slotOffset => {
            const itemIndex = activeIndex + slotOffset;
            if (itemIndex < 0 || itemIndex >= items.length) return null;
            return {
              item: items[itemIndex],
              itemIndex,
              slotOffset
            };
          })
          .filter(Boolean)
          .map(slot => {
            const { item, itemIndex, slotOffset } = slot;
            const curveOffset = slotOffset;
            const outerSlotDistanceFactor = Math.abs(slotOffset) === 2 ? 0.94 : 1;
            const offsetY = slotOffset * stepPx * outerSlotDistanceFactor * railStepSpread;
            const curveNorm = Math.min(Math.abs(curveOffset) / 2, 1);
            const edgeCurveBoost =
              !inputFocused && (activeIndex === 0 || activeIndex === items.length - 1)
                ? 1.35 * railProfileScale
                : 0;
            const edgeSafetyBoost =
              !inputFocused && (activeIndex === 0 || activeIndex === items.length - 1)
                ? 3.5 * railProfileScale
                : 0;
            const baseCurvePx =
              ((inputFocused ? 0 : 1.9) * railProfileScale) + edgeCurveBoost;
            const edgeSafetyPx =
              ((inputFocused ? 0 : 7.2) * railProfileScale) + edgeSafetyBoost;
            const curveSkewPx = (inputFocused ? 0 : 0.6) * railProfileScale;
            const inwardSkewPx = Math.abs(curveOffset) * curveSkewPx;
            const centerOutwardPx =
              !inputFocused &&
              slotOffset === 0
                ? 7.4 * railProfileScale
                : 0;
            const adjacentEdgeOutwardPx =
              !inputFocused &&
              ((activeIndex === 0 && slotOffset === 1) ||
                (activeIndex === items.length - 1 && slotOffset === -1))
                ? 3.2 * railProfileScale
                : 0;
            const farEdgeOutwardPx =
              !inputFocused &&
              ((activeIndex === 0 && slotOffset === 2) ||
                (activeIndex === items.length - 1 && slotOffset === -2))
                ? 2.2 * railProfileScale
                : 0;
            const offsetX =
              baseCurvePx * curveNorm * curveNorm +
              edgeSafetyPx *
                curveNorm *
                curveNorm *
                curveNorm *
                curveNorm +
              inwardSkewPx -
              centerOutwardPx -
              adjacentEdgeOutwardPx -
              farEdgeOutwardPx;
            const norm = Math.min(Math.abs(slotOffset) / 2, 1);
            const scale = 0.88 + (1 - norm) * 0.36;
            const opacity = slotOffset === 0 ? 1 : 0.32 + (1 - norm) * 0.48;
            const zIndex = 10 - Math.abs(slotOffset);

            const onActivate = event => {
              dismissAllRailTooltips();
              setActiveIndex(itemIndex);
              if (item.key === "chats") {
                openChatsDrawer(event);
                return;
              }
              if (item.key === "new_chat") {
                openNewConversation();
                return;
              }
              if (item.key === "back") {
                onBackHome?.();
                return;
              }
              if (item.key === "sources") {
                if (!hasConversationSources) return;
                toggleSourcesPanel();
                return;
              }
              if (item.key === "rooms") {
                openRooms();
                return;
              }
              if (item.key === "help_requests") {
                openHelpRequestsPanel();
                return;
              }
              if (item.key === "help_offers") {
                openHelpOffersPanel();
                return;
              }
            };

            const ariaLabel =
              item.key === "sources" ? sourcesLabel : item.label || "";
            const isDisabled =
              item.key === "sources" ? !hasConversationSources : false;
            const setRailRef = el => {
              if (item.key !== "sources") return;
              if (!sourcesButtonRef) return;
              if (typeof sourcesButtonRef === "function") {
                sourcesButtonRef(el);
              } else {
                sourcesButtonRef.current = el;
              }
            };

            return (
              <button
                key={`left-slot-${item.key}`}
                type="button"
                ref={setRailRef}
                data-key={item.key}
                data-item-index={itemIndex}
                className={cn(
                  styles.item,
                  item.key === "back" ? styles.itemBack : null,
                  item.key === "back" && !backHoverReady
                    ? styles.backHoverSuppressed
                    : null,
                  styles.iconBtn,
                  slotOffset === 0 ? styles.isActive : null,
                  item.key === "sources" && showSourcesPanel
                    ? styles.iconBtnActive
                    : null,
                  item.key === "sources" && sourcesPulse ? styles.isPulse : null
                )}
                style={{
                  transform: `translate(-50%, -50%) translateX(${offsetX.toFixed(
                    2
                  )}px) translateY(${offsetY.toFixed(2)}px) scale(${scale.toFixed(3)})`,
                  opacity: opacity.toFixed(3),
                  zIndex
                }}
                onClick={onActivate}
                onMouseEnter={() => {
                  if (item.key === "back") return;
                  if (itemIndex !== activeIndex) return;
                  showTooltipPersistently(activeIndex);
                }}
                onMouseLeave={() => {
                  if (item.key === "back") return;
                  if (itemIndex !== activeIndex) return;
                  hideHoverTooltip(activeIndex);
                }}
                onFocus={() => {
                  if (item.key === "back") return;
                  if (itemIndex !== activeIndex) return;
                  showTooltipPersistently(activeIndex);
                }}
                onBlur={() => {
                  if (item.key === "back") return;
                  if (itemIndex !== activeIndex) return;
                  hideHoverTooltip(activeIndex);
                }}
                aria-label={ariaLabel}
                aria-haspopup={item.key === "sources" ? "dialog" : undefined}
                aria-expanded={
                  item.key === "sources"
                    ? showSourcesPanel
                      ? "true"
                      : "false"
                    : undefined
                }
                aria-controls={
                  item.key === "sources" ? "chat-sources-panel" : undefined
                }
                aria-disabled={isDisabled ? "true" : undefined}
                disabled={isDisabled}
              >
                {item.key === "chats" ? (
                  <ChatBubbleIcon
                    isLightTheme={isLightTheme}
                    className={cn(styles.iconSvg, styles.iconChats)}
                  />
                ) : null}
                {item.key === "new_chat" ? (
                  <NewConversationIcon
                    isLightTheme={isLightTheme}
                    className={styles.iconSvg}
                  />
                ) : null}
                {item.key === "sources" ? (
                  <SourcesIcon
                    isLightTheme={isLightTheme}
                    className={cn(styles.iconSvg, styles.iconSvgSources)}
                  />
                ) : null}
                {item.key === "rooms" ? (
                  <RoomsIcon
                    isLightTheme={isLightTheme}
                    className={cn(styles.iconSvg, styles.iconRooms)}
                  />
                ) : null}
                {item.key === "help_requests" ? (
                  <HelpRequestIcon
                    isLightTheme={isLightTheme}
                    className={cn(styles.iconSvg, styles.iconHelp)}
                  />
                ) : null}
                {item.key === "help_offers" ? (
                  <HelpOfferIcon
                    isLightTheme={isLightTheme}
                    className={cn(styles.iconSvg, styles.iconHelp)}
                  />
                ) : null}
                {item.key === "back" ? (
                  <BackIcon className={cn(styles.iconSvg, styles.iconBack)} />
                ) : null}
              </button>
            );
          })}
        {showDesktopTooltip ? (
          <span className={cn(styles.item, styles.tooltipAnchor)} style={tooltipAnchorStyle} aria-hidden="true">
            <span
              className={cn(
                styles.tooltip,
                isTooltipVisible ? styles.tooltipVisible : styles.tooltipHidden
              )}
              role="tooltip"
              aria-hidden={isTooltipVisible ? undefined : "true"}
            >
              {items[tooltipLabelIndex]?.label || ""}
            </span>
          </span>
        ) : null}
      </nav>
    </div>
  );
}
