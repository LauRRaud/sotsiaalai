"use client";

import { createPortal } from "react-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import BackIcon from "@/components/ui/icons/BackIcon";
import { ChatBubbleIcon, HelpOfferIcon, HelpRequestIcon, SourcesIcon } from "@/components/ui/icons/ChatIcons";
import { pushWithTransition } from "@/lib/routeTransition";
import { localizePath, stripLocaleFromPath } from "@/lib/localizePath";
import { cn } from "@/components/ui/cn";
import styles from "./LeftRail.module.css";

const MOBILE_VIEWPORT_QUERY = "(max-width: 768px)";
const COARSE_POINTER_QUERY = "(hover: none) and (pointer: coarse)";

function detectMobileViewport() {
  if (typeof window === "undefined") return false;
  const matchWidth = window.matchMedia?.(MOBILE_VIEWPORT_QUERY)?.matches;
  const matchCoarse = window.matchMedia?.(COARSE_POINTER_QUERY)?.matches;
  return Boolean(matchWidth || matchCoarse || window.innerWidth <= 768);
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
  suspendPointerEvents = false
}) {
  const router = useRouter();
  const pathname = usePathname();
  const railRef = useRef(null);
  const tooltipRafRef = useRef(0);
  const tooltipTrackUntilRef = useRef(0);
  const tooltipHideTimerRef = useRef(0);
  const tooltipSwitchTimerRef = useRef(0);
  const tooltipRevealRafRef = useRef(0);
  const tooltipVisibleRef = useRef(false);
  const tooltipLabelIndexRef = useRef(1);
  const didInitDesktopActiveRef = useRef(false);
  const wheelAccumRef = useRef(0);
  const lastStepRef = useRef(0);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [tooltipLabelIndex, setTooltipLabelIndex] = useState(1);
  const [tooltipRect, setTooltipRect] = useState(null);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [stepPx, setStepPx] = useState(56);
  const [railProfileScale, setRailProfileScale] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const normalizedPathname = useMemo(
    () => stripLocaleFromPath(pathname || "/"),
    [pathname]
  );
  const sourcesLabel = t("chat.sources.button").replace(
    "{count}",
    String(conversationSources.length)
  );
  const items = useMemo(
    () => [
      { key: "back", label: t("chat.back_to_home") },
      { key: "chats", label: t("nav.chats") },
      { key: "help_requests", label: t("chat.help.helpRequests") },
      { key: "help_offers", label: t("chat.help.helpOffers") },
      { key: "sources", label: t("nav.sources") }
    ],
    [t]
  );

  const setTooltipFromRail = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const railRect = rail.getBoundingClientRect();
    if (!railRect.width || !railRect.height) return;
    const itemEl = rail.querySelector("[data-item-index]");
    const itemSize = itemEl instanceof HTMLElement ? itemEl.offsetHeight : 48;
    const edgeOffset = itemSize * 0.5;
    const anchorLeft = railRect.left + edgeOffset - itemSize * 0.5;
    const anchorTop = railRect.top + railRect.height * 0.5;
    setTooltipRect({
      top: anchorTop - itemSize * 0.5,
      left: anchorLeft,
      width: itemSize,
      height: itemSize
    });
  }, []);

  useEffect(() => {
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
    };
  }, []);

  useEffect(() => {
    const update = () => {
      if (typeof window === "undefined") return;
      setIsMobile(detectMobileViewport());
    };
    update();
    if (typeof window === "undefined") return;
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const update = () => {
      const style = window.getComputedStyle(rail);
      const itemEl = rail.querySelector("[data-item-index]");
      const itemSize = itemEl instanceof HTMLElement ? itemEl.offsetHeight : 0;
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
    tooltipVisibleRef.current = false;
    setIsTooltipVisible(false);
  }, []);

  const showTooltipTemporarily = useCallback(
    (index, durationMs = 1300) => {
      if (isMobile || suspendPointerEvents) return;
      if (!Number.isFinite(index)) return;
      if (items[index]?.key === "back") {
        hideTooltipImmediately();
        return;
      }
      setTooltipFromRail();
      if (tooltipSwitchTimerRef.current) {
        window.clearTimeout(tooltipSwitchTimerRef.current);
        tooltipSwitchTimerRef.current = 0;
      }
      if (tooltipRevealRafRef.current) {
        cancelAnimationFrame(tooltipRevealRafRef.current);
        tooltipRevealRafRef.current = 0;
      }
      tooltipLabelIndexRef.current = index;
      tooltipVisibleRef.current = true;
      setTooltipLabelIndex(index);
      setIsTooltipVisible(true);
      if (tooltipHideTimerRef.current) {
        window.clearTimeout(tooltipHideTimerRef.current);
      }
      tooltipHideTimerRef.current = window.setTimeout(() => {
        tooltipVisibleRef.current = false;
        setIsTooltipVisible(false);
        tooltipHideTimerRef.current = 0;
      }, durationMs);
    },
    [hideTooltipImmediately, isMobile, items, setTooltipFromRail, suspendPointerEvents]
  );

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
      setActiveIndex(sourcesIndex >= 0 ? sourcesIndex : 0);
      return;
    }
    setActiveIndex(0);
  }, [activeHelpPanelKey, items, showSourcesPanel]);

  useEffect(() => {
    const shouldTrackTooltip = !isMobile;
    if (!shouldTrackTooltip) {
      setTooltipRect(null);
      if (tooltipRafRef.current) {
        cancelAnimationFrame(tooltipRafRef.current);
        tooltipRafRef.current = 0;
      }
      return;
    }
    const update = () => {
      setTooltipFromRail();
    };
    const tick = () => {
      update();
      if (isTooltipVisible || performance.now() < tooltipTrackUntilRef.current) {
        tooltipRafRef.current = requestAnimationFrame(tick);
      } else {
        tooltipRafRef.current = 0;
      }
    };
    tooltipTrackUntilRef.current = performance.now() + 320;
    update();
    if (tooltipRafRef.current) cancelAnimationFrame(tooltipRafRef.current);
    tooltipRafRef.current = requestAnimationFrame(tick);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
      if (tooltipRafRef.current) {
        cancelAnimationFrame(tooltipRafRef.current);
        tooltipRafRef.current = 0;
      }
    };
  }, [isMobile, isTooltipVisible, setTooltipFromRail]);

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
      showTooltipTemporarily(next, 1300);
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
    showTooltipTemporarily(activeIndex, 1300);
  }, [activeIndex, hideTooltipImmediately, isMobile, items, showTooltipTemporarily, suspendPointerEvents]);

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

  const onKeyDown = event => {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
    event.preventDefault();
    event.stopPropagation();
    const direction = event.key === "ArrowDown" ? 1 : -1;
    setActiveIndex(prev => Math.max(0, Math.min(items.length - 1, prev + direction)));
  };

  const slotClassName = cn(
    styles.slot,
    "chat-left-actions",
    suspendPointerEvents ? styles.pointerBlocked : null
  );
  const showDesktopTooltip =
    !isMobile &&
    !suspendPointerEvents &&
    !!tooltipRect &&
    isTooltipVisible &&
    tooltipLabelIndex >= 0 &&
    tooltipLabelIndex < items.length;

  if (isMobile) return null;

  return (
    <div className={slotClassName}>
      <nav
        ref={railRef}
        className={styles.leftRail}
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
            const offsetY = slotOffset * stepPx;
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
            const edgeOuterYFactor = (() => {
              const atTopEdge = activeIndex === 0 && slotOffset === 2;
              const atBottomEdge = activeIndex === items.length - 1 && slotOffset === -2;
              return atTopEdge || atBottomEdge ? 0.9 : 1;
            })();
            const norm = Math.min(Math.abs(slotOffset) / 2, 1);
            const scale = 0.88 + (1 - norm) * 0.36;
            const opacity = slotOffset === 0 ? 1 : 0.32 + (1 - norm) * 0.48;
            const zIndex = 10 - Math.abs(slotOffset);

            const onActivate = event => {
              setActiveIndex(itemIndex);
              if (item.key === "chats") {
                openChatsDrawer(event);
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
              if (item.key === "help_requests") {
                onShowHelpRequests?.();
                return;
              }
              if (item.key === "help_offers") {
                onShowHelpOffers?.();
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
                  )}px) translateY(${(offsetY * edgeOuterYFactor).toFixed(2)}px) scale(${scale.toFixed(3)})`,
                  opacity: opacity.toFixed(3),
                  zIndex
                }}
                onClick={onActivate}
                onMouseEnter={() => {
                  if (item.key === "back") return;
                  if (itemIndex !== activeIndex) return;
                  showTooltipTemporarily(activeIndex, 1800);
                }}
                onFocus={() => {
                  if (item.key === "back") return;
                  if (itemIndex !== activeIndex) return;
                  showTooltipTemporarily(activeIndex, 1800);
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
                {item.key === "sources" ? (
                  <SourcesIcon
                    isLightTheme={isLightTheme}
                    className={cn(styles.iconSvg, styles.iconSvgSources)}
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
      </nav>
      {isMounted && showDesktopTooltip && typeof document !== "undefined"
        ? createPortal(
            <div
              className={cn(
                styles.tooltip,
                isTooltipVisible ? styles.tooltipVisible : styles.tooltipHidden
              )}
              style={{
                position: "fixed",
                top: tooltipRect.top + tooltipRect.height / 2,
                left: tooltipRect.left + tooltipRect.width
              }}
              role="tooltip"
            >
              {items[tooltipLabelIndex]?.label || ""}
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
