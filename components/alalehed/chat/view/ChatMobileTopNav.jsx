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
  const defaultFocusedKey = "profile";
  const router = useRouter();
  const pathname = usePathname();
  const railViewportRef = useRef(null);
  const itemButtonRefs = useRef({});
  const focusUpdateFrameRef = useRef(0);
  const railDidAutoCenterRef = useRef(false);
  const focusedKeyRef = useRef(defaultFocusedKey);
  const [focusedKey, setFocusedKey] = useState(defaultFocusedKey);
  const railVisible = true;

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
    return () => {
      if (typeof window !== "undefined" && focusUpdateFrameRef.current) {
        window.cancelAnimationFrame(focusUpdateFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    focusedKeyRef.current = focusedKey;
  }, [focusedKey]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const body = document.body;
    const html = document.documentElement;
    body?.setAttribute("data-chat-mobile-rail-active", "true");
    html?.setAttribute("data-chat-mobile-rail-active", "true");
    return () => {
      body?.removeAttribute("data-chat-mobile-rail-active");
      html?.removeAttribute("data-chat-mobile-rail-active");
    };
  }, []);

  const scrollItemIntoCenter = useCallback((key, behavior = "smooth") => {
    const viewport = railViewportRef.current;
    const button = itemButtonRefs.current[key];
    if (!viewport || !button) return;

    const viewportRect = viewport.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    const nextLeft =
      viewport.scrollLeft +
      (buttonRect.left - viewportRect.left) -
      (viewportRect.width / 2 - buttonRect.width / 2);

    viewport.scrollTo({
      left: nextLeft,
      behavior
    });
  }, []);

  const updateFocusedItem = useCallback(() => {
    const viewport = railViewportRef.current;
    if (!viewport) return;

    const viewportRect = viewport.getBoundingClientRect();
    const viewportCenter = viewportRect.left + viewportRect.width / 2;
    let nextKey = focusedKeyRef.current || defaultFocusedKey;
    let closestDistance = Number.POSITIVE_INFINITY;

    MOBILE_NAV_ITEMS.forEach(item => {
      const button = itemButtonRefs.current[item.key];
      if (!button) return;
      const rect = button.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const distance = Math.abs(center - viewportCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        nextKey = item.key;
      }
    });

    setFocusedKey(current => (current === nextKey ? current : nextKey));
  }, [defaultFocusedKey]);

  useEffect(() => {
    if (!railVisible) {
      railDidAutoCenterRef.current = false;
      return;
    }
    if (typeof window === "undefined") return;

    const nextKey = railDidAutoCenterRef.current
      ? activeKey || focusedKeyRef.current || defaultFocusedKey
      : defaultFocusedKey;
    const behavior = railDidAutoCenterRef.current ? "smooth" : "auto";
    railDidAutoCenterRef.current = true;

    setFocusedKey(nextKey);
    const frameId = window.requestAnimationFrame(() => {
      scrollItemIntoCenter(nextKey, behavior);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [activeKey, defaultFocusedKey, railVisible, scrollItemIntoCenter]);

  useEffect(() => {
    if (!railVisible || typeof window === "undefined") return;
    const viewport = railViewportRef.current;
    if (!viewport) return;

    const scheduleFocusUpdate = () => {
      if (focusUpdateFrameRef.current) {
        window.cancelAnimationFrame(focusUpdateFrameRef.current);
      }
      focusUpdateFrameRef.current = window.requestAnimationFrame(() => {
        focusUpdateFrameRef.current = 0;
        updateFocusedItem();
      });
    };

    scheduleFocusUpdate();
    viewport.addEventListener("scroll", scheduleFocusUpdate, { passive: true });
    window.addEventListener("resize", scheduleFocusUpdate);

    let resizeObserver;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(scheduleFocusUpdate);
      resizeObserver.observe(viewport);
      MOBILE_NAV_ITEMS.forEach(item => {
        const button = itemButtonRefs.current[item.key];
        if (button) {
          resizeObserver.observe(button);
        }
      });
    }

    return () => {
      viewport.removeEventListener("scroll", scheduleFocusUpdate);
      window.removeEventListener("resize", scheduleFocusUpdate);
      resizeObserver?.disconnect?.();
      if (focusUpdateFrameRef.current) {
        window.cancelAnimationFrame(focusUpdateFrameRef.current);
        focusUpdateFrameRef.current = 0;
      }
    };
  }, [railVisible, updateFocusedItem]);

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

  const renderIcon = item => {
    const iconClassName = "h-full w-full";
    if (item.key === "chats") {
      return (
        <MobileIconFrame scale={item.scale} xNudge={-0.34}>
          <ChatBubbleIcon
            isLightTheme={isLightTheme}
            className={iconClassName}
          />
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
          <HelpRequestIcon
            isLightTheme={isLightTheme}
            className={iconClassName}
          />
        </MobileIconFrame>
      );
    }
    if (item.key === "help_offers") {
      return (
        <MobileIconFrame scale={item.scale}>
          <HelpOfferIcon
            isLightTheme={isLightTheme}
            className={iconClassName}
          />
        </MobileIconFrame>
      );
    }
    if (item.key === "profile") {
      return (
        <MobileIconFrame scale={item.scale}>
          <ProfileIcon
            isLightTheme={isLightTheme}
            className={iconClassName}
          />
        </MobileIconFrame>
      );
    }
    if (item.key === "rooms") {
      return (
        <MobileIconFrame scale={item.scale}>
          <RoomsIcon
            isLightTheme={isLightTheme}
            className={iconClassName}
          />
        </MobileIconFrame>
      );
    }
    return (
      <MobileIconFrame scale={item.scale}>
        <AddPersonIcon
          isLightTheme={isLightTheme}
          className={iconClassName}
        />
      </MobileIconFrame>
    );
  };

  const handleItemActivation = useCallback(
    (key, event) => {
      event?.preventDefault?.();
      event?.stopPropagation?.();
      setFocusedKey(key);
      scrollItemIntoCenter(key);
      handleActivate(key, event);
    },
    [handleActivate, scrollItemIntoCenter]
  );

  const renderNavButton = (item, index) => {
    const isDisabled =
      item.key === "sources" ? !hasConversationSources : false;
    const isFocused = focusedKey === item.key;
    const isActive = activeKey === item.key;
    const setSourcesRef = element => {
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
        ref={setSourcesRef}
        type="button"
        data-key={item.key}
        data-index={index}
        aria-label={labels[item.key]}
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
        onClick={event => {
          if (isDisabled) {
            event.preventDefault();
            event.stopPropagation();
            setFocusedKey(item.key);
            scrollItemIntoCenter(item.key);
            return;
          }
          handleItemActivation(item.key, event);
        }}
        onFocus={() => {
          setFocusedKey(item.key);
          scrollItemIntoCenter(item.key);
        }}
        onKeyDown={event => {
          if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            event.preventDefault();
            event.stopPropagation();
            const direction = event.key === "ArrowRight" ? 1 : -1;
            const nextItem =
              MOBILE_NAV_ITEMS[
                (index + direction + MOBILE_NAV_ITEMS.length) %
                  MOBILE_NAV_ITEMS.length
              ];
            setFocusedKey(nextItem.key);
            scrollItemIntoCenter(nextItem.key);
            itemButtonRefs.current[nextItem.key]?.focus?.();
            return;
          }
          if (event.key === "Enter" || event.key === " ") {
            handleItemActivation(item.key, event);
          }
        }}
        className={cn(
          "chat-mobile-topnav__rail-button group relative snap-center shrink-0 inline-flex h-[clamp(3.2rem,13.2vw,3.82rem)] w-[clamp(3.2rem,13.2vw,3.82rem)] items-center justify-center rounded-[1.45rem] border-0 bg-transparent p-0 [touch-action:pan-x] transition-[transform,opacity,color] duration-200 ease-out focus-visible:outline-none",
          isFocused
            ? "opacity-100"
            : isActive
              ? "opacity-[0.78]"
              : "opacity-[0.52]",
          isDisabled ? "cursor-default" : "cursor-pointer"
        )}
        style={{
          transform: `translateZ(0) scale(${isFocused ? 1.12 : isActive ? 0.98 : 0.9})`,
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

      {railVisible ? (
        <div className="absolute left-[calc(env(safe-area-inset-left,0px)+4.9rem)] right-[calc(env(safe-area-inset-right,0px)+0.28rem)] top-[calc(env(safe-area-inset-top,0px)+0.84rem)] pointer-events-auto">
          <div className="relative">
            <div
              ref={railViewportRef}
              className="chat-mobile-topnav__rail relative z-[1] flex items-center gap-[clamp(0.18rem,0.9vw,0.42rem)] overflow-x-auto overscroll-x-contain pb-[0.18rem] pt-[0.18rem] snap-x snap-proximity [scrollbar-width:none] [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0"
              style={{
                paddingInline: "max(0px, calc(50% - 2.05rem))",
                touchAction: "pan-x",
                WebkitMaskImage:
                  "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.82) 8%, #000 18%, #000 82%, rgba(0,0,0,0.82) 92%, transparent 100%)",
                maskImage:
                  "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.82) 8%, #000 18%, #000 82%, rgba(0,0,0,0.82) 92%, transparent 100%)"
              }}
            >
              {MOBILE_NAV_ITEMS.map(renderNavButton)}
            </div>
            <div className="pointer-events-none mt-[0.22rem] flex min-h-[2.18rem] items-start justify-center px-[0.5rem] text-center">
              <span className="max-w-[12.4rem] whitespace-normal break-words [text-wrap:balance] text-[clamp(1.36rem,5.5vw,1.56rem)] font-medium leading-[1.02] tracking-[0.01em] text-[#c57171] light:text-[#7a3a38]">
                {labels[focusedKey]}
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
