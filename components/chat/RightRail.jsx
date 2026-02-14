"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./RightRail.module.css";
import { usePathname, useRouter } from "next/navigation";
import { AddPersonIcon, ChatBubbleIcon, ProfileIcon, RoomsIcon, SourcesIcon } from "@/components/ui/icons/ChatIcons";
import { pushWithTransition } from "@/lib/routeTransition";
import { createPortal } from "react-dom";
import { cn } from "@/components/ui/cn";

const MOBILE_VIEWPORT_QUERY = "(max-width: 48em)";

function detectMobileViewport() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.(MOBILE_VIEWPORT_QUERY)?.matches ?? window.innerWidth <= 768;
}

export default function RightRail({
  t,
  roomId,
  isLightTheme,
  inputFocused,
  sourcesButtonRef,
  toggleSourcesPanel,
  showSourcesPanel,
  sourcesPulse,
  conversationSources,
  hasConversationSources,
  onProfileToggle,
  embedded = false,
  suspendPointerEvents = false,
  suppressTooltip = false,
  mobileVisible = true
}) {
  const router = useRouter();
  const pathname = usePathname();
  const railRef = useRef(null);
  const itemRefs = useRef([]);
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
  const armClearTimerRef = useRef(0);
  const lastTapRef = useRef({
    key: "",
    at: 0
  });

  const [activeIndex, setActiveIndex] = useState(1);
  const [tooltipLabelIndex, setTooltipLabelIndex] = useState(1);
  const [tooltipRect, setTooltipRect] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [stepPx, setStepPx] = useState(56);
  const [isMobile, setIsMobile] = useState(false);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [armedKey, setArmedKey] = useState(null);
  const setTooltipFromRail = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const rect = rail.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const style = window.getComputedStyle(rail);
    const itemSizeRaw = Number.parseFloat(style.getPropertyValue("--rail-item-size"));
    const edgeOffsetRaw = Number.parseFloat(style.getPropertyValue("--rail-edge-offset"));
    const itemSize = Number.isFinite(itemSizeRaw) && itemSizeRaw > 0 ? itemSizeRaw : 48;
    const edgeOffset = Number.isFinite(edgeOffsetRaw) && edgeOffsetRaw > 0 ? edgeOffsetRaw : itemSize * 0.5;
    // Keep tooltip anchored to the rail center slot so it does not track moving icons during scroll transitions.
    const anchorLeft = rect.left + rect.width - edgeOffset - itemSize * 0.5;
    const anchorTop = rect.top + rect.height * 0.5;
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
      if (armClearTimerRef.current) {
        window.clearTimeout(armClearTimerRef.current);
        armClearTimerRef.current = 0;
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

  const clearArmed = useCallback(() => {
    setArmedKey(null);
    if (armClearTimerRef.current) {
      window.clearTimeout(armClearTimerRef.current);
      armClearTimerRef.current = 0;
    }
  }, []);

  const showTooltipTemporarily = useCallback((index, durationMs = 980) => {
    if (isMobile || suspendPointerEvents || suppressTooltip) return;
    if (!Number.isFinite(index)) return;
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
  }, [isMobile, suspendPointerEvents, suppressTooltip]);

  useEffect(() => {
    tooltipVisibleRef.current = isTooltipVisible;
  }, [isTooltipVisible]);

  useEffect(() => {
    tooltipLabelIndexRef.current = tooltipLabelIndex;
  }, [tooltipLabelIndex]);

  const armItem = useCallback(key => {
    setArmedKey(key);
    if (armClearTimerRef.current) {
      window.clearTimeout(armClearTimerRef.current);
    }
    armClearTimerRef.current = window.setTimeout(() => {
      setArmedKey(prev => (prev === key ? null : prev));
      armClearTimerRef.current = 0;
    }, 1800);
  }, []);

  const openChatsDrawer = e => {
    if (embedded || pathname && pathname.startsWith("/vestlus")) {
      e?.preventDefault?.();
      try {
        window.dispatchEvent(new CustomEvent("sotsiaalai:toggle-conversations", {
          detail: { open: true }
        }));
      } catch {}
      return;
    }
    pushWithTransition(router, "/vestlus");
  };

  const openRooms = () => {
    pushWithTransition(router, "/ruum");
  };

  const openInvite = () => {
    try {
      window.dispatchEvent(new CustomEvent("sotsiaalai:open-invite", {
        detail: { roomId }
      }));
    } catch {}
  };

  const sourcesLabel = t("chat.sources.button").replace("{count}", String(conversationSources.length));

  const items = useMemo(() => {
    return [{
      key: "profile",
      label: t("nav.profile")
    }, {
      key: "chats",
      label: t("nav.chats")
    }, {
      key: "rooms",
      label: t("nav.rooms")
    }, {
      key: "invite",
      label: t("nav.add_person")
    }, {
      key: "sources",
      label: t("nav.sources")
    }];
  }, [t]);

  const mobileSlots = useMemo(() => {
    const order = ["chats", "sources", "rooms", "invite", "profile"];
    return order.map(key => {
      const itemIndex = items.findIndex(item => item.key === key);
      if (itemIndex < 0) return null;
      return {
        it: items[itemIndex],
        itemIndex,
        slotOffset: 0
      };
    }).filter(Boolean);
  }, [items]);

  useEffect(() => {
    const idx = (() => {
      if (!pathname) return 1;
      if (pathname.startsWith("/profiil")) return 0;
      if (pathname.startsWith("/ruum")) return 2;
      if (pathname.startsWith("/vestlus")) return 1;
      return 1;
    })();
    setActiveIndex(idx);
    clearArmed();
  }, [pathname, clearArmed]);

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
      // Use device-appropriate wheel thresholds so one mouse notch advances one icon.
      const threshold = event.deltaMode === 1 ? 2 : Math.max(56, Math.round(stepPx * 0.65));
      if (Math.abs(wheelAccumRef.current) < threshold) return;
      const direction = wheelAccumRef.current > 0 ? 1 : -1;
      wheelAccumRef.current = 0;
      lastStepRef.current = now;
      setActiveIndex(prev => {
        const maxIndex = Math.max(0, items.length - 1);
        const next = Math.max(0, Math.min(maxIndex, prev + direction));
        return Number.isFinite(next) ? next : prev;
      });
    };
    rail.addEventListener("wheel", onWheel, {
      passive: false,
      capture: true
    });
    return () => rail.removeEventListener("wheel", onWheel);
  }, [isMobile, items.length, stepPx]);

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
    if (!(isMobile || suspendPointerEvents || suppressTooltip || !mobileVisible)) return;
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
  }, [isMobile, suspendPointerEvents, suppressTooltip, mobileVisible]);

  useEffect(() => {
    if (isMobile || suspendPointerEvents || suppressTooltip || !mobileVisible) {
      didInitDesktopActiveRef.current = false;
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
    if (tooltipVisibleRef.current && tooltipLabelIndexRef.current !== activeIndex) {
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
    showTooltipTemporarily(activeIndex, 900);
  }, [activeIndex, isMobile, mobileVisible, showTooltipTemporarily, suppressTooltip, suspendPointerEvents]);

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
    "max-[48em]:absolute max-[48em]:top-[calc(var(--hud-edge-safe,env(safe-area-inset-top,0px))+1.08rem)] max-[48em]:left-0 max-[48em]:right-0 max-[48em]:h-auto"
  );

  const railClassName = cn(
    styles.rightRail,
    "max-[48em]:relative max-[48em]:top-0 max-[48em]:right-0 max-[48em]:left-auto max-[48em]:ml-auto max-[48em]:[transform:none] max-[48em]:h-auto max-[48em]:w-auto max-[48em]:flex max-[48em]:flex-row max-[48em]:items-center max-[48em]:justify-end max-[48em]:gap-[clamp(0.3rem,1.9vw,0.52rem)] max-[48em]:pt-[0] max-[48em]:pb-[0] max-[48em]:pl-[clamp(0.25rem,1.6vw,0.5rem)] max-[48em]:pr-[clamp(0.45rem,2.4vw,0.75rem)] max-[48em]:overflow-visible max-[48em]:[mask-image:none] max-[48em]:[-webkit-mask-image:none] max-[48em]:[--rail-item-size:clamp(3.15rem,10.5vw,3.65rem)] max-[48em]:[--rail-icon-scale:0.92]"
  );

  const mobileItemClassName =
    "max-[48em]:static max-[48em]:left-auto max-[48em]:top-auto max-[48em]:[transform:none] max-[48em]:w-[var(--rail-item-size)] max-[48em]:h-auto max-[48em]:opacity-100 max-[48em]:transition-[transform,opacity]";

  const mobileIconButtonClassName =
    "max-[48em]:flex max-[48em]:flex-col max-[48em]:items-center max-[48em]:justify-center max-[48em]:gap-[0.22rem] max-[48em]:leading-[1]";

  const mobileLabelClassName =
    "max-[48em]:block max-[48em]:tracking-[0.035em] max-[48em]:text-[#c57171] light:max-[48em]:text-[#7a3a38] max-[48em]:text-center max-[48em]:[text-wrap:balance] max-[48em]:opacity-0 max-[48em]:overflow-visible max-[48em]:transition-[opacity,transform] max-[48em]:duration-160 max-[48em]:ease-out";
  const shouldShowDesktopTooltip = !isMobile &&
    !suspendPointerEvents &&
    !suppressTooltip &&
    !!tooltipRect &&
    tooltipLabelIndex >= 0 &&
    tooltipLabelIndex < items.length;

  return <div className={slotClassName}>
      <nav className={cn(railClassName, isMobile && !mobileVisible ? styles.navHiddenMobile : styles.navVisibleMobile)} ref={railRef} tabIndex={isMobile && !mobileVisible ? -1 : 0} inert={isMobile && !mobileVisible ? true : undefined} aria-label={t("chat.right_rail")} onKeyDown={onKeyDown}>
        {(isMobile ? mobileSlots : [-2, -1, 0, 1, 2].map(slotOffset => {
        const itemIndex = activeIndex + slotOffset;
        if (itemIndex < 0 || itemIndex >= items.length) return null;
        return {
          it: items[itemIndex],
          itemIndex,
          slotOffset
        };
      }).filter(Boolean)).map(slot => {
        const {
          it,
          itemIndex,
          slotOffset
        } = slot;
        if (!it) return null;
        const outerFactor = 1.78;
        const offsetY = slotOffset === 0 ? 0 : Math.sign(slotOffset) * (Math.abs(slotOffset) === 2 ? Math.round(stepPx * outerFactor) : stepPx);
        const curveNorm = Math.min(Math.abs(slotOffset) / 2, 1);
        const baseCurvePx = inputFocused ? 0 : 4;
        const edgeSafetyPx = inputFocused ? 0 : 12;
        const curveSkewPx = inputFocused ? 0 : 1.5;
        const offsetX = -baseCurvePx * curveNorm * curveNorm - edgeSafetyPx * curveNorm * curveNorm * curveNorm * curveNorm - slotOffset * curveSkewPx;
        const norm = Math.min(Math.abs(slotOffset) / 2, 1);
        const scale = 0.78 + (1 - norm) * 0.46;
        const opacity = 0.12 + (1 - norm) * 0.78;
        const zIndex = 10 - Math.abs(slotOffset);

        const setRailRef = el => {
          itemRefs.current[itemIndex] = el;
          if (it?.key !== "sources") return;
          if (!sourcesButtonRef) return;
          if (typeof sourcesButtonRef === "function") {
            sourcesButtonRef(el);
          } else {
            sourcesButtonRef.current = el;
          }
        };

        const commonProps = {
          ref: setRailRef,
          className: cn(
            styles.item,
            isMobile && armedKey === it?.key ? styles.isArmed : null,
            !isMobile && slotOffset === 0 ? styles.isActive : null,
            it?.key === "sources" && showSourcesPanel ? styles.iconBtnActive : null,
            it?.key === "sources" && sourcesPulse ? styles.isPulse : null,
            mobileItemClassName
          ),
          style: isMobile ? undefined : {
            transform: `translate(-50%, -50%) translateX(${offsetX.toFixed(2)}px) translateY(${offsetY}px) scale(${scale.toFixed(3)})`,
            opacity: opacity.toFixed(3),
            zIndex
          }
        };

        const performActivate = event => {
          if (!it) return;
          if (!isMobile) {
            setActiveIndex(itemIndex);
          }

          if (it.key === "profile") {
            if (typeof onProfileToggle === "function") {
              onProfileToggle();
              return;
            }
            pushWithTransition(router, "/profiil");
            return;
          }
          if (it.key === "chats") {
            openChatsDrawer(event);
            return;
          }
          if (it.key === "rooms") {
            openRooms();
            return;
          }
          if (it.key === "invite") {
            openInvite();
            return;
          }
          if (it.key === "sources") {
            if (!hasConversationSources) return;
            toggleSourcesPanel();
          }
        };

        const onActivate = event => {
          if (!it) return;
          if (!isMobile) {
            performActivate(event);
            return;
          }
          event.preventDefault();
          event.stopPropagation();
          const now = performance.now();
          const lastTap = lastTapRef.current;
          const isRapidDoubleTap = lastTap.key === it.key && now - lastTap.at < 360;
          lastTapRef.current = {
            key: it.key,
            at: now
          };
          if (isRapidDoubleTap || armedKey === it.key) {
            clearArmed();
            performActivate(event);
            return;
          }
          armItem(it.key);
        };

        const ariaLabel = it?.key === "sources" ? sourcesLabel : it?.label || "";
        const isDisabled = false;
        const isAriaDisabled = it?.key === "sources" ? !hasConversationSources : false;
        const displayLabel = it?.label || "";

        return <button key={`slot-${it.key}`} type="button" {...commonProps} data-key={it?.key} data-item-index={itemIndex} className={cn(commonProps.className, styles.iconBtn, mobileIconButtonClassName)} onClick={onActivate} onMouseEnter={!isMobile ? () => {
        if (itemIndex !== activeIndex) return;
        showTooltipTemporarily(activeIndex, 1800);
      } : undefined} onFocus={!isMobile ? () => {
        if (itemIndex !== activeIndex) return;
        showTooltipTemporarily(activeIndex, 1800);
      } : undefined} onDoubleClick={isMobile ? event => {
        event.preventDefault();
        event.stopPropagation();
        clearArmed();
        performActivate(event);
      } : undefined} aria-label={ariaLabel} aria-haspopup={it?.key === "sources" ? "dialog" : undefined} aria-expanded={it?.key === "sources" ? showSourcesPanel ? "true" : "false" : undefined} aria-controls={it?.key === "sources" ? "chat-sources-panel" : undefined} aria-disabled={isAriaDisabled ? "true" : undefined} disabled={isDisabled}>
              {it?.key === "profile" ? <ProfileIcon isLightTheme={isLightTheme} className={`${styles.profileAvatar} ${styles.avatar}`} /> : it?.key === "sources" ? <SourcesIcon isLightTheme={isLightTheme} className={cn(styles.iconSvg, styles.iconSvgSources)} /> : it?.key === "chats" ? <ChatBubbleIcon isLightTheme={isLightTheme} className={cn(styles.iconSvg, styles.iconChats, isMobile ? styles.chatIconMobile : styles.chatIconDesktop)} /> : it?.key === "rooms" ? <RoomsIcon isLightTheme={isLightTheme} className={cn(styles.iconSvg, styles.iconRooms)} /> : it?.key === "invite" ? <AddPersonIcon isLightTheme={isLightTheme} className={cn(styles.iconSvg, styles.iconInvite)} /> : null}
              <span className={cn(styles.label, mobileLabelClassName)} aria-hidden="true">
                {displayLabel}
              </span>
            </button>;
      })}

        {isMounted && shouldShowDesktopTooltip ? createPortal(<div className={cn(styles.tooltip, isTooltipVisible ? styles.tooltipVisible : styles.tooltipHidden)} style={{
        top: tooltipRect.top + tooltipRect.height / 2,
        left: tooltipRect.left - 2
      }} role="tooltip">
                {items[tooltipLabelIndex]?.label || ""}
              </div>, document.body) : null}
      </nav>
    </div>;
}
