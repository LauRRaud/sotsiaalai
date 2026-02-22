"use client";

import { createPortal } from "react-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import BackIcon from "@/components/ui/icons/BackIcon";
import { ChatBubbleIcon, SourcesIcon } from "@/components/ui/icons/ChatIcons";
import { pushWithTransition } from "@/lib/routeTransition";
import { localizePath, stripLocaleFromPath } from "@/lib/localizePath";
import { cn } from "@/components/ui/cn";
import styles from "./LeftRail.module.css";

const MOBILE_VIEWPORT_QUERY = "(max-width: 48em)";
const COARSE_POINTER_QUERY = "(hover: none) and (pointer: coarse)";

function detectMobileViewport() {
  if (typeof window === "undefined") return false;
  const matchWidth = window.matchMedia?.(MOBILE_VIEWPORT_QUERY)?.matches;
  const matchCoarse = window.matchMedia?.(COARSE_POINTER_QUERY)?.matches;
  return Boolean(matchWidth || matchCoarse || window.innerWidth <= 768);
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
  const [activeIndex, setActiveIndex] = useState(0);
  const [tooltipLabelIndex, setTooltipLabelIndex] = useState(1);
  const [tooltipRect, setTooltipRect] = useState(null);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [stepPx, setStepPx] = useState(56);
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
      { key: "sources", label: t("nav.sources") }
    ],
    [t]
  );

  const setTooltipFromRail = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const railRect = rail.getBoundingClientRect();
    if (!railRect.width || !railRect.height) return;
    const style = window.getComputedStyle(rail);
    const itemSizeRaw = Number.parseFloat(
      style.getPropertyValue("--rail-item-size")
    );
    const edgeOffsetRaw = Number.parseFloat(
      style.getPropertyValue("--rail-edge-offset")
    );
    const itemSize =
      Number.isFinite(itemSizeRaw) && itemSizeRaw > 0 ? itemSizeRaw : 48;
    const edgeOffset =
      Number.isFinite(edgeOffsetRaw) && edgeOffsetRaw > 0
        ? edgeOffsetRaw
        : itemSize * 0.5;
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
      const raw = style.getPropertyValue("--rail-step").trim();
      const parsed = Number.parseFloat(raw);
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
    return () => {
      window.removeEventListener("resize", update);
      ro.disconnect();
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
    (index, durationMs = 980) => {
      if (isMobile || suspendPointerEvents) return;
      if (!Number.isFinite(index)) return;
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
    [hideTooltipImmediately, isMobile, items, suspendPointerEvents]
  );

  useEffect(() => {
    if (showSourcesPanel) {
      setActiveIndex(2);
      return;
    }
    setActiveIndex(0);
  }, [showSourcesPanel]);

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
      if (performance.now() < tooltipTrackUntilRef.current) {
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
  }, [isMobile, setTooltipFromRail]);

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
      setActiveIndex(prev =>
        Math.max(0, Math.min(items.length - 1, prev + direction))
      );
    };
    rail.addEventListener("wheel", onWheel, {
      passive: false,
      capture: true
    });
    return () => rail.removeEventListener("wheel", onWheel);
  }, [isMobile, items.length, stepPx]);

  useEffect(() => {
    if (isMobile || suspendPointerEvents) {
      didInitDesktopActiveRef.current = false;
      hideTooltipImmediately();
      return;
    }
    if (!didInitDesktopActiveRef.current) {
      didInitDesktopActiveRef.current = true;
      tooltipLabelIndexRef.current = activeIndex;
      setTooltipLabelIndex(activeIndex);
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
    if (
      tooltipVisibleRef.current &&
      tooltipLabelIndexRef.current !== activeIndex
    ) {
      tooltipVisibleRef.current = false;
      setIsTooltipVisible(false);
      tooltipSwitchTimerRef.current = window.setTimeout(() => {
        tooltipLabelIndexRef.current = activeIndex;
        setTooltipLabelIndex(activeIndex);
        tooltipRevealRafRef.current = requestAnimationFrame(() => {
          tooltipRevealRafRef.current = 0;
          showTooltipTemporarily(activeIndex, 900);
        });
        tooltipSwitchTimerRef.current = 0;
      }, 120);
      return;
    }
    if (items[activeIndex]?.key === "back") {
      hideTooltipImmediately();
      return;
    }
    showTooltipTemporarily(activeIndex, 900);
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
            const outerFactor = 1.78;
            const offsetY =
              slotOffset === 0
                ? 0
                : Math.sign(slotOffset) *
                  (Math.abs(slotOffset) === 2
                    ? Math.round(stepPx * outerFactor)
                    : stepPx);
            const curveNorm = Math.min(Math.abs(slotOffset) / 2, 1);
            const baseCurvePx = inputFocused ? 0 : 4;
            const edgeSafetyPx = inputFocused ? 0 : 12;
            const curveSkewPx = inputFocused ? 0 : 1.5;
            const offsetX =
              baseCurvePx * curveNorm * curveNorm +
              edgeSafetyPx *
                curveNorm *
                curveNorm *
                curveNorm *
                curveNorm +
              slotOffset * curveSkewPx;
            const norm = Math.min(Math.abs(slotOffset) / 2, 1);
            const scale = 0.78 + (1 - norm) * 0.46;
            const opacity = 0.12 + (1 - norm) * 0.78;
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
              className={styles.tooltip}
              style={{
                position: "fixed",
                top: tooltipRect.top + tooltipRect.height / 2,
                left: tooltipRect.left + tooltipRect.width + 2
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
