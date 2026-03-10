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
  { key: "chats", scale: 0.96 },
  { key: "sources", scale: 0.94 },
  { key: "help_requests", scale: 1.28 },
  { key: "help_offers", scale: 1.28 },
  { key: "profile", scale: 1.08 },
  { key: "invite", scale: 1.1 },
  { key: "rooms", scale: 1.1 }
];

const DEFAULT_FOCUSED_KEY = "profile";
const FOCUS_CENTER_OFFSET_REM = -0.34;
const CHAT_SKIP_ENTRY_SETTLE_KEY = "sotsiaalai:chat:skip-entry-settle";
const DEFAULT_SLOT_PROFILE = Object.freeze({
  step1: 3.82,
  step2: 7.28,
  step3: 10.05,
  tailStep: 2.54,
  centerOffsetRem: FOCUS_CENTER_OFFSET_REM
});
const ANDROID_SLOT_PROFILE = Object.freeze({
  step1: 3.28,
  step2: 6.18,
  step3: 8.66,
  tailStep: 2.18,
  centerOffsetRem: -0.18
});

function getSlotOffsetRem(slot, profile = DEFAULT_SLOT_PROFILE) {
  const direction = Math.sign(slot);
  const distance = Math.abs(slot);
  const { step1, step2, step3, tailStep } = profile;
  if (distance === 0) {
    return 0;
  }
  if (distance === 1) {
    return direction * step1;
  }
  if (distance < 1) {
    return direction * (step1 * distance);
  }
  if (distance < 2) {
    return direction * (step1 + (distance - 1) * (step2 - step1));
  }
  if (distance < 3) {
    return direction * (step2 + (distance - 2) * (step3 - step2));
  }
  return direction * (step3 + (distance - 3) * tailStep);
}

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

function getVisualScale(distance) {
  if (distance <= 1) {
    return 1.22 - distance * 0.34;
  }
  if (distance <= 2) {
    return 0.88 - (distance - 1) * 0.12;
  }
  return 0.76;
}

function getVisualOpacity(distance) {
  if (distance <= 1) {
    return 1 - distance * 0.14;
  }
  if (distance <= 2) {
    return 0.94 - (distance - 1) * 0.28;
  }
  return 0.66;
}

function getEdgeFadeOpacity(distance) {
  if (distance <= 2.25) {
    return 1;
  }
  if (distance >= 2.9) {
    return 0;
  }
  return 1 - (distance - 2.25) / 0.65;
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
  toggleProfile,
  openProfileDirect
}) {
  const router = useRouter();
  const pathname = usePathname();
  const itemButtonRefs = useRef({});
  const suppressClickUntilRef = useRef(0);
  const swipeSurfaceRef = useRef(null);
  const focusedIndexRef = useRef(getItemIndex(DEFAULT_FOCUSED_KEY));
  const previousActiveKeyRef = useRef(null);
  const dragStateRef = useRef({
    pointerId: null,
    touchId: null,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    moved: false,
    gestureAxis: null,
    cancelTap: false
  });

  const [focusedIndex, setFocusedIndex] = useState(getItemIndex(DEFAULT_FOCUSED_KEY));
  const [dragOffsetPx, setDragOffsetPx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAndroidPlatform, setIsAndroidPlatform] = useState(false);
  const [rootRemPx, setRootRemPx] = useState(16);

  const setFocusedIndexImmediate = useCallback(nextValue => {
    if (typeof nextValue === "function") {
      setFocusedIndex(current => {
        const resolvedValue = nextValue(current);
        focusedIndexRef.current = resolvedValue;
        return resolvedValue;
      });
      return;
    }

    focusedIndexRef.current = nextValue;
    setFocusedIndex(nextValue);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let suppressOnEntry = false;
    try {
      suppressOnEntry =
        window.sessionStorage.getItem(CHAT_SKIP_ENTRY_SETTLE_KEY) === "1";
      if (suppressOnEntry) {
        window.sessionStorage.removeItem(CHAT_SKIP_ENTRY_SETTLE_KEY);
      }
    } catch {}
    if (!suppressOnEntry) return;
    const now =
      typeof performance !== "undefined" ? performance.now() : Date.now();
    suppressClickUntilRef.current = now + 700;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const updatePlatformMetrics = () => {
      const platformFlag =
        document.documentElement?.getAttribute("data-platform") ||
        document.body?.getAttribute("data-platform") ||
        "";
      const ua = window.navigator?.userAgent || "";
      setIsAndroidPlatform(platformFlag === "android" || /android/i.test(ua));
      const nextRootRem = parseFloat(
        window.getComputedStyle(document.documentElement).fontSize || "16"
      );
      setRootRemPx(Number.isFinite(nextRootRem) && nextRootRem > 0 ? nextRootRem : 16);
    };
    updatePlatformMetrics();
    window.addEventListener("resize", updatePlatformMetrics);
    window.visualViewport?.addEventListener("resize", updatePlatformMetrics);
    return () => {
      window.removeEventListener("resize", updatePlatformMetrics);
      window.visualViewport?.removeEventListener("resize", updatePlatformMetrics);
    };
  }, []);

  const normalizedPathname = useMemo(
    () => stripLocaleFromPath(pathname || "/"),
    [pathname]
  );

  const slotProfile = isAndroidPlatform ? ANDROID_SLOT_PROFILE : DEFAULT_SLOT_PROFILE;
  const slotStepPx = Math.max(1, slotProfile.step1 * rootRemPx);
  const centerOffsetRem = slotProfile.centerOffsetRem ?? FOCUS_CENTER_OFFSET_REM;
  const dragEngageThreshold = isAndroidPlatform ? 12 : 8;
  const swipeThresholdPx = isAndroidPlatform ? 44 : 24;
  const maxSwipeSteps = isAndroidPlatform ? 1 : Number.POSITIVE_INFINITY;
  const dragDamping = isAndroidPlatform ? 0.72 : 1;
  const dragClampPx = isAndroidPlatform ? 156 : 192;
  const navRailStyle = isAndroidPlatform
    ? {
        left: "calc(env(safe-area-inset-left,0px) + 3.26rem)",
        right: "calc(env(safe-area-inset-right,0px) + 0.16rem)",
        top: "calc(env(safe-area-inset-top,0px) - 0.08rem)"
      }
    : {
        left: "calc(env(safe-area-inset-left,0px) + 3.68rem)",
        right: "calc(env(safe-area-inset-right,0px) + 0.34rem)",
        top: "calc(env(safe-area-inset-top,0px) + 0.06rem)"
      };

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
    const previousActiveKey = previousActiveKeyRef.current;
    previousActiveKeyRef.current = activeKey || "";
    if (previousActiveKey === null) {
      return;
    }
    if (!activeKey) return;
    setFocusedIndexImmediate(getItemIndex(activeKey));
  }, [activeKey, setFocusedIndexImmediate]);

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
    pushWithTransition(router, localizePath("/ruum", locale));
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
        if (typeof openProfileDirect === "function") {
          openProfileDirect({ withTilt: false });
          return;
        }
        if (typeof toggleProfile === "function") {
          toggleProfile();
          return;
        }
        pushWithTransition(router, localizePath("/profiil", locale));
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
      openProfileDirect,
      openRooms,
      router,
      toggleProfile,
      toggleSourcesPanel
    ]
  );

  const handleItemActivation = useCallback(
    (key, event) => {
      setFocusedIndexImmediate(getItemIndex(key));
      handleActivate(key, event);
    },
    [handleActivate, setFocusedIndexImmediate]
  );

  const activateIndex = useCallback(
    (index, event) => {
      const item = MOBILE_NAV_ITEMS[index];
      if (!item) return;
      if (item.key === "sources" && !hasConversationSources) {
        setFocusedIndexImmediate(index);
        return;
      }
      handleItemActivation(item.key, event);
    },
    [handleItemActivation, hasConversationSources, setFocusedIndexImmediate]
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
    if (Math.abs(deltaX) >= swipeThresholdPx) {
      const steps = Math.min(
        maxSwipeSteps,
        Math.max(1, Math.floor((Math.abs(deltaX) - swipeThresholdPx) / slotStepPx) + 1)
      );
      setFocusedIndexImmediate(current => {
        if (deltaX < 0) {
          return Math.min(MOBILE_NAV_ITEMS.length - 1, current + steps);
        }
        return Math.max(0, current - steps);
      });
    }
    dragStateRef.current.pointerId = null;
    dragStateRef.current.touchId = null;
    dragStateRef.current.moved = false;
    setDragOffsetPx(0);
    setIsDragging(false);
  }, [maxSwipeSteps, setFocusedIndexImmediate, slotStepPx, swipeThresholdPx]);

  const resetSwipeState = useCallback(() => {
    dragStateRef.current.pointerId = null;
    dragStateRef.current.touchId = null;
    dragStateRef.current.moved = false;
    dragStateRef.current.gestureAxis = null;
    dragStateRef.current.cancelTap = false;
    setDragOffsetPx(0);
    setIsDragging(false);
  }, []);

  const beginSwipe = useCallback((clientX, clientY) => {
    dragStateRef.current.startX = clientX;
    dragStateRef.current.startY = clientY;
    dragStateRef.current.currentX = clientX;
    dragStateRef.current.currentY = clientY;
    dragStateRef.current.moved = false;
    dragStateRef.current.gestureAxis = null;
    dragStateRef.current.cancelTap = false;
    setDragOffsetPx(0);
    setIsDragging(false);
  }, []);

  const moveSwipe = useCallback((clientX, clientY, event) => {
    const deltaX = clientX - dragStateRef.current.startX;
    const deltaY = clientY - dragStateRef.current.startY;
    dragStateRef.current.currentX = clientX;
    dragStateRef.current.currentY = clientY;

    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    if (!dragStateRef.current.gestureAxis) {
      const crossedX = absDeltaX > dragEngageThreshold;
      const crossedY = absDeltaY > dragEngageThreshold;

      if (!crossedX && !crossedY) {
        return;
      }

      if (crossedY && absDeltaY > absDeltaX * 1.12) {
        dragStateRef.current.gestureAxis = "y";
        dragStateRef.current.cancelTap = true;
        setDragOffsetPx(0);
        setIsDragging(false);
        return;
      }

      dragStateRef.current.gestureAxis = "x";
    }

    if (dragStateRef.current.gestureAxis !== "x") {
      return;
    }

    dragStateRef.current.moved = true;
    setIsDragging(true);
    setDragOffsetPx(
      Math.max(-dragClampPx, Math.min(dragClampPx, deltaX * dragDamping))
    );

    if (event?.cancelable) {
      event.preventDefault();
    }
  }, [dragClampPx, dragDamping, dragEngageThreshold]);

  const finishSwipe = useCallback(
    (clientX, event) => {
      dragStateRef.current.currentX = clientX;
      if (dragStateRef.current.cancelTap || dragStateRef.current.gestureAxis === "y") {
        resetSwipeState();
        return;
      }
      if (dragStateRef.current.moved) {
        suppressClickUntilRef.current =
          typeof performance !== "undefined" ? performance.now() + 260 : Date.now() + 260;
        handleTrackPointerEnd();
        return;
      }
      resetSwipeState();
      activateIndex(getClosestVisibleIndex(clientX), event);
    },
    [activateIndex, getClosestVisibleIndex, handleTrackPointerEnd, resetSwipeState]
  );

  const focusedItem = MOBILE_NAV_ITEMS[focusedIndex] || MOBILE_NAV_ITEMS[0];
  const dragProgress = dragOffsetPx / slotStepPx;
  const visibleItems = useMemo(() => {
    return MOBILE_NAV_ITEMS.map((item, index) => ({
      item,
      index,
      slot: index - focusedIndex
    }));
  }, [focusedIndex]);

  const previewFocusedItem = useMemo(() => {
    if (!visibleItems.length) return focusedItem;
    let nearestItem = visibleItems[0].item;
    let nearestDistance = Number.POSITIVE_INFINITY;

    visibleItems.forEach(({ item, slot }) => {
      const distance = Math.abs(slot + dragProgress);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestItem = item;
      }
    });

    return nearestItem;
  }, [dragProgress, focusedItem, visibleItems]);

  const visualFocusedKey = previewFocusedItem.key;

  const getClosestVisibleIndex = useCallback(
    clientX => {
      const baseFocusedIndex = focusedIndexRef.current;
      if (visibleItems.length === 0) return baseFocusedIndex;
      let nearestIndex = baseFocusedIndex;
      let nearestDistance = Number.POSITIVE_INFINITY;

      visibleItems.forEach(({ item, index }) => {
        const button = itemButtonRefs.current[item.key];
        const rect = button?.getBoundingClientRect?.();
        if (!rect) return;
        const buttonCenterX = rect.left + rect.width / 2;
        const distance = Math.abs(clientX - buttonCenterX);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });

      return nearestIndex;
    },
    [visibleItems]
  );

  const renderNavButton = (item, index) => {
    const isDisabled =
      item.key === "sources" ? !hasConversationSources : false;
    const isFocused = visualFocusedKey === item.key;

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
          if (
            typeof performance !== "undefined" &&
            performance.now() < suppressClickUntilRef.current
          ) {
            event.preventDefault();
            event.stopPropagation();
            return;
          }
          if (isDisabled) {
            event.preventDefault();
            event.stopPropagation();
            setFocusedIndexImmediate(index);
            return;
          }
          handleItemActivation(item.key, event);
        }}
        onFocus={() => setFocusedIndexImmediate(index)}
        onKeyDown={event => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            setFocusedIndexImmediate(current => Math.min(MOBILE_NAV_ITEMS.length - 1, current + 1));
            return;
          }
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            setFocusedIndexImmediate(current => Math.max(0, current - 1));
            return;
          }
          if (event.key === "Enter" || event.key === " ") {
            handleItemActivation(item.key, event);
          }
        }}
        className={cn(
          "pointer-events-none relative inline-flex h-[clamp(2.96rem,11.9vw,3.42rem)] w-[clamp(2.96rem,11.9vw,3.42rem)] items-center justify-center rounded-[1.45rem] border-0 bg-transparent p-0 transition-[transform,opacity,color] duration-200 ease-out focus-visible:outline-none",
          "opacity-100",
          isDisabled ? "cursor-default" : "cursor-pointer"
        )}
        style={{
          transform: "scale(1)",
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
        "chat-mobile-topnav top-nav--chat absolute inset-x-0 top-0 z-[121] h-[8.95rem] min-[769px]:hidden",
        mobileRailInteractionLocked ? "pointer-events-none opacity-70" : "pointer-events-auto"
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

      <div className="absolute" style={navRailStyle}>
        <div
          ref={swipeSurfaceRef}
          className="relative h-[8.6rem] overflow-visible"
        >
          <div
            className="absolute inset-x-[-0.8rem] top-0 bottom-0 z-[20]"
            style={{ touchAction: "pan-y" }}
            onPointerDown={event => {
              if (event.pointerType === "touch") {
                return;
              }
              if (event.pointerType === "mouse" && event.button !== 0) {
                return;
              }
              swipeSurfaceRef.current?.setPointerCapture?.(event.pointerId);
              dragStateRef.current.pointerId = event.pointerId;
              beginSwipe(event.clientX, event.clientY);
            }}
            onPointerMove={event => {
              if (event.pointerType === "touch") {
                return;
              }
              const pointerId = dragStateRef.current.pointerId;
              if (pointerId == null || event.pointerId !== pointerId) return;
              moveSwipe(event.clientX, event.clientY, event);
            }}
            onPointerUp={event => {
              if (event.pointerType === "touch") {
                return;
              }
              const pointerId = dragStateRef.current.pointerId;
              if (pointerId == null || event.pointerId !== pointerId) return;
              swipeSurfaceRef.current?.releasePointerCapture?.(event.pointerId);
              finishSwipe(event.clientX, event);
            }}
            onPointerCancel={event => {
              if (event.pointerType === "touch") {
                return;
              }
              const pointerId = dragStateRef.current.pointerId;
              if (pointerId == null || event.pointerId !== pointerId) return;
              swipeSurfaceRef.current?.releasePointerCapture?.(event.pointerId);
              resetSwipeState();
            }}
            onTouchStart={event => {
              const touch = event.changedTouches?.[0];
              if (!touch) return;
              dragStateRef.current.touchId = touch.identifier;
              beginSwipe(touch.clientX, touch.clientY);
            }}
            onTouchMove={event => {
              const touchId = dragStateRef.current.touchId;
              if (touchId == null) return;
              const touch = Array.from(event.touches).find(currentTouch => currentTouch.identifier === touchId);
              if (!touch) return;
              moveSwipe(touch.clientX, touch.clientY, event);
            }}
            onTouchEnd={event => {
              const touchId = dragStateRef.current.touchId;
              if (touchId == null) return;
              const touch = Array.from(event.changedTouches).find(
                currentTouch => currentTouch.identifier === touchId
              );
              if (!touch) return;
              finishSwipe(touch.clientX, event);
            }}
            onTouchCancel={() => {
              resetSwipeState();
            }}
          />

          <div className="relative h-[4.86rem] overflow-hidden">
            {visibleItems.map(({ item, index, slot }) => {
              const visualSlot = slot + dragProgress;
              const visualDistance = Math.abs(visualSlot);
              const xOffsetRem = getSlotOffsetRem(visualSlot, slotProfile);
              const combinedOpacity =
                getVisualOpacity(visualDistance) * getEdgeFadeOpacity(visualDistance);
              return (
                <div
                  key={item.key}
                  className={cn(
                    "absolute left-1/2 top-[0.72rem] z-[1] -translate-x-1/2 transition-[transform,opacity] duration-200 ease-out",
                    isDragging ? "duration-0" : null
                  )}
                  style={{
                    transform: `translateX(${centerOffsetRem + xOffsetRem}rem) scale(${getVisualScale(visualDistance)})`,
                    opacity: combinedOpacity,
                    transition: isDragging ? "none" : undefined
                  }}
                >
                  {renderNavButton(item, index)}
                </div>
              );
            })}
          </div>

          <div
            className="pointer-events-none absolute inset-x-0 top-[4.16rem] flex justify-center px-[0.45rem] text-center"
            style={{ transform: `translateX(${centerOffsetRem}rem)` }}
          >
            <span className="max-w-[14rem] whitespace-normal break-words [text-wrap:balance] text-[clamp(1.42rem,5.9vw,1.68rem)] font-medium leading-[1.04] tracking-[0.012em] text-[#c57171] light:text-[#7a3a38]">
              {labels[previewFocusedItem.key]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
