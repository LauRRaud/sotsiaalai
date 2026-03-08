"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import BackButton from "@/components/ui/BackButton";
import { glassPageBackMobileBottomCenterClassName } from "@/components/ui/glassPageStyles";
import {
  AddPersonIcon,
  ChatBubbleIcon,
  HelpOfferIcon,
  HelpRequestIcon,
  ProfileIcon,
  RoomsIcon,
  SourcesIcon
} from "@/components/ui/icons/ChatIcons";
import { cn } from "@/components/ui/cn";
import { pushWithTransition } from "@/lib/routeTransition";
import { localizePath, stripLocaleFromPath } from "@/lib/localizePath";

const MOBILE_NAV_ITEMS = [
  { key: "chats", scale: 1.05 },
  { key: "sources", scale: 1.01 },
  { key: "help_requests", scale: 1.2 },
  { key: "help_offers", scale: 1.2 },
  { key: "invite", scale: 1.1 },
  { key: "profile", scale: 1.08 },
  { key: "rooms", scale: 1.1 }
];

const DEFAULT_FOCUSED_KEY = "profile";
function MobileIconFrame({ scale = 1, xNudge = 0, children }) {
  return (
    <span
      className="flex h-[92%] w-[92%] items-center justify-center"
      style={{ transform: `translateX(${xNudge}rem) scale(${scale})` }}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

function getItemIndex(key) {
  const index = MOBILE_NAV_ITEMS.findIndex(item => item.key === key);
  return index >= 0 ? index : 0;
}

export default function ChatMobileTopNav({
  t,
  locale,
  isLightTheme,
  roomId,
  embedded = false,
  handleBackHome,
  mobileRailInteractionLocked,
  sourcesButtonRef,
  toggleSourcesPanel,
  showSourcesPanel,
  sourcesPulse,
  conversationSources,
  hasConversationSources,
  leftRailActiveKey,
  rightRailActiveKey,
  onShowHelpRequests,
  onShowHelpOffers,
  toggleProfile
}) {
  const router = useRouter();
  const pathname = usePathname();
  const overlayRef = useRef(null);
  const trackViewportRef = useRef(null);
  const itemButtonRefs = useRef({});
  const dragStateRef = useRef({
    pointerId: null,
    startX: 0,
    currentX: 0,
    moved: false
  });

  const [focusedIndex, setFocusedIndex] = useState(getItemIndex(DEFAULT_FOCUSED_KEY));
  const [dragOffset, setDragOffset] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [itemWidth, setItemWidth] = useState(58);
  const [itemGap, setItemGap] = useState(10);

  const normalizedPathname = useMemo(
    () => stripLocaleFromPath(pathname || "/"),
    [pathname]
  );

  const sourcesLabel = t("chat.sources.button").replace(
    "{count}",
    String(conversationSources.length)
  );

  const labels = useMemo(
    () => ({
      back: t("chat.back_to_home"),
      chats: t("nav.chats"),
      sources: sourcesLabel,
      help_requests: t("chat.help.helpRequests"),
      help_offers: t("chat.help.helpOffers"),
      profile: t("nav.profile"),
      rooms: t("nav.rooms"),
      invite: t("nav.add_person")
    }),
    [sourcesLabel, t]
  );

  const activeKey = showSourcesPanel
    ? "sources"
    : leftRailActiveKey || rightRailActiveKey || "";

  useEffect(() => {
    const viewport = trackViewportRef.current;
    const profileButton = itemButtonRefs.current.profile;
    if (!viewport || !profileButton) return;

    const updateMetrics = () => {
      const viewportRect = viewport.getBoundingClientRect();
      const buttonRect = profileButton.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(viewport);
      const gapRaw = Number.parseFloat(computedStyle.columnGap || computedStyle.gap || "10");
      setViewportWidth(viewportRect.width);
      setItemWidth(buttonRect.width);
      setItemGap(Number.isFinite(gapRaw) ? gapRaw : 10);
    };

    updateMetrics();
    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(updateMetrics)
        : null;
    resizeObserver?.observe(viewport);
    resizeObserver?.observe(profileButton);
    window.addEventListener("resize", updateMetrics);
    return () => {
      resizeObserver?.disconnect?.();
      window.removeEventListener("resize", updateMetrics);
    };
  }, []);

  useEffect(() => {
    if (!activeKey) return;
    setFocusedIndex(getItemIndex(activeKey));
  }, [activeKey]);

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

  const openRooms = useCallback(() => {
    pushWithTransition(router, localizePath("/ruum", locale), {
      glassRingTilt: "right",
      waitForGlassRingTilt: true,
      persistGlassRingTilt: false
    });
  }, [locale, router]);

  const openInvite = useCallback(() => {
    try {
      window.dispatchEvent(
        new CustomEvent("sotsiaalai:open-invite", {
          detail: { roomId }
        })
      );
    } catch {}
  }, [roomId]);

  const handleActivate = useCallback(
    (key, event) => {
      if (key === "chats") {
        openChatsDrawer(event);
        return;
      }
      if (key === "sources") {
        if (!hasConversationSources) return;
        toggleSourcesPanel();
        return;
      }
      if (key === "help_requests") {
        onShowHelpRequests?.();
        return;
      }
      if (key === "help_offers") {
        onShowHelpOffers?.();
        return;
      }
      if (key === "profile") {
        if (typeof toggleProfile === "function") {
          toggleProfile();
          return;
        }
        pushWithTransition(router, localizePath("/profiil", locale), {
          glassRingTilt: "right",
          waitForGlassRingTilt: true,
          persistGlassRingTilt: false
        });
        return;
      }
      if (key === "rooms") {
        openRooms();
        return;
      }
      if (key === "invite") {
        openInvite();
      }
    },
    [
      hasConversationSources,
      locale,
      onShowHelpOffers,
      onShowHelpRequests,
      openChatsDrawer,
      openInvite,
      openRooms,
      router,
      toggleProfile,
      toggleSourcesPanel
    ]
  );

  const handleItemActivation = useCallback(
    (key, event) => {
      setFocusedIndex(getItemIndex(key));
      handleActivate(key, event);
    },
    [handleActivate]
  );

  const renderIcon = item => {
    const iconClassName = "h-full w-full";
    if (item.key === "chats") {
      return (
        <MobileIconFrame scale={item.scale} xNudge={-0.34}>
          <ChatBubbleIcon isLightTheme={isLightTheme} className={iconClassName} />
        </MobileIconFrame>
      );
    }
    if (item.key === "sources") {
      return (
        <MobileIconFrame scale={item.scale}>
          <SourcesIcon
            isLightTheme={isLightTheme}
            className={cn(iconClassName, sourcesPulse ? "animate-[chat-sources-pulse_1s_ease]" : null)}
          />
        </MobileIconFrame>
      );
    }
    if (item.key === "help_requests") {
      return (
        <MobileIconFrame scale={item.scale}>
          <HelpRequestIcon isLightTheme={isLightTheme} className={iconClassName} />
        </MobileIconFrame>
      );
    }
    if (item.key === "help_offers") {
      return (
        <MobileIconFrame scale={item.scale}>
          <HelpOfferIcon isLightTheme={isLightTheme} className={iconClassName} />
        </MobileIconFrame>
      );
    }
    if (item.key === "profile") {
      return (
        <MobileIconFrame scale={item.scale}>
          <ProfileIcon isLightTheme={isLightTheme} className={iconClassName} />
        </MobileIconFrame>
      );
    }
    if (item.key === "rooms") {
      return (
        <MobileIconFrame scale={item.scale}>
          <RoomsIcon isLightTheme={isLightTheme} className={iconClassName} />
        </MobileIconFrame>
      );
    }
    return (
      <MobileIconFrame scale={item.scale}>
        <AddPersonIcon isLightTheme={isLightTheme} className={iconClassName} />
      </MobileIconFrame>
    );
  };

  const handleTrackPointerEnd = useCallback(() => {
    const deltaX = dragStateRef.current.currentX - dragStateRef.current.startX;
    const swipeThreshold = Math.max(18, Math.min(28, itemWidth * 0.24));
    if (Math.abs(deltaX) >= swipeThreshold) {
      setFocusedIndex(current => {
        if (deltaX < 0) {
          return Math.min(MOBILE_NAV_ITEMS.length - 1, current + 1);
        }
        return Math.max(0, current - 1);
      });
    }
    setDragOffset(0);
    dragStateRef.current.pointerId = null;
    dragStateRef.current.moved = false;
  }, [itemWidth]);

  const baseTranslateX = useMemo(() => {
    const step = itemWidth + itemGap;
    return viewportWidth / 2 - itemWidth / 2 - focusedIndex * step;
  }, [focusedIndex, itemGap, itemWidth, viewportWidth]);

  const getClosestItemIndex = useCallback(
    clientX => {
      const viewport = trackViewportRef.current;
      if (!viewport) return focusedIndex;
      const viewportRect = viewport.getBoundingClientRect();
      const step = itemWidth + itemGap;
      let nearestIndex = focusedIndex;
      let nearestDistance = Number.POSITIVE_INFINITY;

      MOBILE_NAV_ITEMS.forEach((item, index) => {
        const centerX =
          viewportRect.left + baseTranslateX + dragOffset + index * step + itemWidth / 2;
        const distance = Math.abs(clientX - centerX);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });

      return nearestIndex;
    },
    [baseTranslateX, dragOffset, focusedIndex, itemGap, itemWidth]
  );

  const focusedItem = MOBILE_NAV_ITEMS[focusedIndex] || MOBILE_NAV_ITEMS[0];

  const renderNavButton = (item, index) => {
    const isDisabled =
      item.key === "sources" ? !hasConversationSources : false;
    const isFocused = focusedIndex === index;
    const isActive = activeKey === item.key;

    const setButtonRef = element => {
      itemButtonRefs.current[item.key] = element;
      if (item.key !== "sources") return;
      if (!sourcesButtonRef) return;
      if (typeof sourcesButtonRef === "function") {
        sourcesButtonRef(element);
      } else {
        sourcesButtonRef.current = element;
      }
    };

    return (
      <button
        key={item.key}
        ref={setButtonRef}
        type="button"
        data-key={item.key}
        aria-label={labels[item.key]}
        aria-disabled={isDisabled ? "true" : undefined}
        aria-haspopup={item.key === "sources" ? "dialog" : undefined}
        aria-expanded={
          item.key === "sources" ? (showSourcesPanel ? "true" : "false") : undefined
        }
        aria-controls={item.key === "sources" ? "chat-sources-panel" : undefined}
        onClick={event => {
          if (isDisabled) {
            event.preventDefault();
            event.stopPropagation();
            setFocusedIndex(index);
            return;
          }
          handleItemActivation(item.key, event);
        }}
        onFocus={() => setFocusedIndex(index)}
        onKeyDown={event => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            setFocusedIndex(current => Math.min(MOBILE_NAV_ITEMS.length - 1, current + 1));
            return;
          }
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            setFocusedIndex(current => Math.max(0, current - 1));
            return;
          }
          if (event.key === "Enter" || event.key === " ") {
            handleItemActivation(item.key, event);
          }
        }}
        className={cn(
          "pointer-events-none relative shrink-0 inline-flex h-[clamp(3.25rem,13vw,3.9rem)] w-[clamp(3.25rem,13vw,3.9rem)] items-center justify-center rounded-[1.45rem] border-0 bg-transparent p-0 transition-[transform,opacity,color] duration-200 ease-out focus-visible:outline-none",
          isFocused ? "opacity-100" : isActive ? "opacity-[0.78]" : "opacity-[0.46]",
          isDisabled ? "cursor-default" : "cursor-pointer"
        )}
        style={{
          transform: `scale(${isFocused ? 1.12 : 0.92})`,
          color: isFocused
            ? isLightTheme
              ? "#9d4e49"
              : "#e6a4a3"
            : undefined
        }}
      >
        {renderIcon(item)}
      </button>
    );
  };

  return (
    <div
      className={cn(
        "chat-mobile-topnav pointer-events-none absolute inset-x-0 top-0 z-[121] min-[769px]:hidden",
        mobileRailInteractionLocked ? "pointer-events-none opacity-70" : null
      )}
    >
      <BackButton
        onClick={event => {
          handleBackHome?.(event);
        }}
        onKeyDown={event => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.stopPropagation();
            handleBackHome?.(event);
          }
        }}
        ariaLabel={labels.back}
        className={cn(
          glassPageBackMobileBottomCenterClassName,
          "pointer-events-auto !z-[123] rounded-full"
        )}
        iconClassName="!h-[100%] !w-[100%]"
      />

      <div className="absolute left-[calc(env(safe-area-inset-left,0px)+4.9rem)] right-[calc(env(safe-area-inset-right,0px)+0.28rem)] top-[calc(env(safe-area-inset-top,0px)+0.44rem)] pointer-events-auto">
        <div className="relative h-[7.15rem] overflow-hidden">
          <div
            ref={overlayRef}
            className="absolute inset-0 z-[3]"
            style={{ touchAction: "none" }}
            onPointerDown={event => {
              if (event.pointerType === "mouse" && event.button !== 0) {
                return;
              }
              overlayRef.current?.setPointerCapture?.(event.pointerId);
              dragStateRef.current.pointerId = event.pointerId;
              dragStateRef.current.startX = event.clientX;
              dragStateRef.current.currentX = event.clientX;
              dragStateRef.current.moved = false;
            }}
            onPointerMove={event => {
              const pointerId = dragStateRef.current.pointerId;
              if (pointerId == null || event.pointerId !== pointerId) return;
              const deltaX = event.clientX - dragStateRef.current.startX;
              dragStateRef.current.currentX = event.clientX;
              if (Math.abs(deltaX) > 3) {
                dragStateRef.current.moved = true;
              }
              setDragOffset(deltaX);
              if (event.cancelable) {
                event.preventDefault();
              }
            }}
            onPointerUp={event => {
              const pointerId = dragStateRef.current.pointerId;
              if (pointerId == null || event.pointerId !== pointerId) return;
              overlayRef.current?.releasePointerCapture?.(event.pointerId);

              if (!dragStateRef.current.moved) {
                const tappedIndex = getClosestItemIndex(event.clientX);
                const tappedItem = MOBILE_NAV_ITEMS[tappedIndex];
                if (tappedItem) {
                  if (tappedItem.key === "sources" && !hasConversationSources) {
                    setFocusedIndex(tappedIndex);
                  } else {
                    handleItemActivation(tappedItem.key, event);
                  }
                }
                dragStateRef.current.pointerId = null;
                setDragOffset(0);
                return;
              }

              handleTrackPointerEnd();
            }}
            onPointerCancel={event => {
              const pointerId = dragStateRef.current.pointerId;
              if (pointerId != null && event.pointerId === pointerId) {
                overlayRef.current?.releasePointerCapture?.(event.pointerId);
              }
              dragStateRef.current.pointerId = null;
              dragStateRef.current.moved = false;
              setDragOffset(0);
            }}
          />

          <div
            ref={trackViewportRef}
            className="pointer-events-none relative h-[5.55rem] overflow-hidden"
          >
            <div
              className="absolute left-0 top-[0.68rem] z-[1] flex items-center gap-[clamp(0.22rem,0.95vw,0.48rem)]"
              style={{
                transform: `translate3d(${baseTranslateX + dragOffset}px, 0, 0)`,
                transition:
                  dragOffset === 0
                    ? "transform 220ms cubic-bezier(0.22, 0.61, 0.36, 1)"
                    : "none"
              }}
            >
              {MOBILE_NAV_ITEMS.map(renderNavButton)}
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 top-[4.68rem] flex justify-center px-[0.65rem] text-center">
            <span className="max-w-[13.4rem] whitespace-normal break-words [text-wrap:balance] text-[clamp(1.34rem,5.45vw,1.54rem)] font-medium leading-[1.06] tracking-[0.012em] text-[#c57171] light:text-[#7a3a38]">
              {labels[focusedItem.key]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
