"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import BackButton from "@/components/ui/BackButton";
import {
  AddPersonIcon,
  ChatBubbleIcon,
  HelpOfferIcon,
  HelpRequestIcon,
  ProfileIcon,
  RoomsIcon,
  ShowRailIcon,
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
  { key: "rooms", scale: 1.1 },
  { key: "invite", scale: 1.1 },
  { key: "profile", scale: 1.08 }
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
  mobileRailVisible,
  mobileRailInteractionLocked,
  showMobileRail,
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
  const backButtonRef = useRef(null);
  const showButtonRef = useRef(null);
  const itemButtonRefs = useRef({});
  const tooltipHideTimerRef = useRef(0);
  const [armedKey, setArmedKey] = useState("");

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
      show: t("chat.mobile.show_navigation", "Show navigation"),
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

  const clearTooltip = useCallback(() => {
    if (typeof window !== "undefined" && tooltipHideTimerRef.current) {
      window.clearTimeout(tooltipHideTimerRef.current);
    }
    tooltipHideTimerRef.current = 0;
    setArmedKey("");
  }, []);

  const showTooltip = useCallback(
    (key, _label, _element, durationMs = 1650) => {
      if (typeof window === "undefined") {
        return;
      }
      if (tooltipHideTimerRef.current) {
        window.clearTimeout(tooltipHideTimerRef.current);
      }
      setArmedKey(key);
      tooltipHideTimerRef.current = window.setTimeout(() => {
        tooltipHideTimerRef.current = 0;
        setArmedKey("");
      }, durationMs);
    },
    []
  );

  const armOrActivate = useCallback(
    (key, label, element, event, action) => {
      event?.preventDefault?.();
      event?.stopPropagation?.();
      if (armedKey === key) {
        clearTooltip();
        action?.(event);
        return;
      }
      showTooltip(key, label, element);
    },
    [armedKey, clearTooltip, showTooltip]
  );

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && tooltipHideTimerRef.current) {
        window.clearTimeout(tooltipHideTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!armedKey || typeof document === "undefined") return;
    const handlePointerDown = event => {
      const target = event.target;
      if (!(target instanceof Node)) {
        clearTooltip();
        return;
      }
      const buttons = [
        backButtonRef.current,
        showButtonRef.current,
        ...Object.values(itemButtonRefs.current)
      ].filter(Boolean);
      const pressedInside = buttons.some(button => button?.contains?.(target));
      if (!pressedInside) {
        clearTooltip();
      }
    };
    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
    };
  }, [armedKey, clearTooltip]);

  useEffect(() => {
    clearTooltip();
  }, [clearTooltip, mobileRailVisible]);

  const activeKey = showSourcesPanel
    ? "sources"
    : leftRailActiveKey || rightRailActiveKey || "";

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

  const renderNavButton = item => {
    const isDisabled =
      item.key === "sources" ? !hasConversationSources : false;
    const isActive = activeKey === item.key;
    const mobileLabelPositionClass =
      item.key === "chats" || item.key === "sources"
        ? "left-0 translate-x-0 text-left"
        : item.key === "rooms" || item.key === "invite" || item.key === "profile"
          ? "left-auto right-0 translate-x-0 text-right"
          : "left-1/2 -translate-x-1/2 text-center";
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
        onClick={event =>
          armOrActivate(
            item.key,
            labels[item.key],
            event.currentTarget,
            event,
            evt => handleActivate(item.key, evt)
          )
        }
        onKeyDown={event => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.stopPropagation();
            clearTooltip();
            handleActivate(item.key, event);
          }
        }}
        className={cn(
          "relative shrink-0 inline-flex h-[clamp(2.62rem,10.8vw,3.02rem)] w-[clamp(2.62rem,10.8vw,3.02rem)] items-center justify-center rounded-full border-0 bg-transparent p-0 touch-manipulation transition-[transform,opacity] duration-150 focus-visible:scale-[1.03] active:scale-[0.97]",
          item.key === "chats" ? "-translate-x-[0.18rem]" : null,
          isActive ? "opacity-100" : null,
          "opacity-100"
        )}
      >
        {renderIcon(item)}
        {armedKey === item.key ? (
          <span
            className={cn(
              "pointer-events-none absolute top-[calc(100%+0.18rem)] z-[160] w-max max-w-[min(52vw,10.5rem)] whitespace-normal break-words [text-wrap:balance] text-[clamp(1.08rem,4.3vw,1.28rem)] leading-[1.14] font-medium tracking-[0.01em] text-[#c57171] opacity-[0.96] light:text-[#7a3a38]",
              mobileLabelPositionClass
            )}
            aria-hidden="true"
          >
            {labels[item.key]}
          </span>
        ) : null}
      </button>
    );
  };

  return (
    <div
      className={cn(
        "chat-mobile-topnav absolute z-[121] left-[calc(env(safe-area-inset-left,0px)+0.08rem)] right-[calc(env(safe-area-inset-right,0px)+0.16rem)] top-[calc(env(safe-area-inset-top,0px)+0.18rem)] flex items-center gap-[clamp(0.04rem,0.45vw,0.16rem)] min-[769px]:hidden",
        mobileRailInteractionLocked ? "pointer-events-none opacity-70" : null
      )}
    >
      <BackButton
        ref={backButtonRef}
        onClick={event => {
          clearTooltip();
          handleBackHome?.(event);
        }}
        onKeyDown={event => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.stopPropagation();
            clearTooltip();
            handleBackHome?.(event);
          }
        }}
        ariaLabel={labels.back}
        className="shrink-0 !h-[clamp(3.82rem,15.7vw,4.32rem)] !w-[clamp(3.82rem,15.7vw,4.32rem)] rounded-full"
        iconClassName="!h-[132%] !w-[132%]"
      />

      {!mobileRailVisible ? (
        <div className="min-w-0 flex-1 flex justify-end">
          <button
            type="button"
            ref={showButtonRef}
            onClick={() => {
              clearTooltip();
              showMobileRail?.();
            }}
            onKeyDown={event => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                event.stopPropagation();
                clearTooltip();
                showMobileRail?.();
              }
            }}
            disabled={mobileRailInteractionLocked}
            aria-label={labels.show}
            className="inline-flex h-[clamp(3.34rem,13.9vw,3.78rem)] w-[clamp(3.34rem,13.9vw,3.78rem)] items-center justify-center rounded-full border-0 bg-transparent p-0 text-[#c57171] light:text-[#7a3a38] opacity-95 touch-manipulation transition-[transform,opacity] duration-150 focus-visible:scale-[1.03] active:scale-[0.97] disabled:opacity-55"
          >
            <ShowRailIcon
              isLightTheme={isLightTheme}
              className="h-[96%] w-[96%]"
            />
          </button>
        </div>
      ) : (
        <div className="min-w-0 flex-1 flex items-center overflow-visible">
          <div className="flex min-w-0 items-center gap-[clamp(0.1rem,0.72vw,0.28rem)] overflow-visible">
            {MOBILE_NAV_ITEMS.map(renderNavButton)}
          </div>
        </div>
      )}
    </div>
  );
}
