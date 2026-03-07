"use client";

import { useCallback, useMemo } from "react";
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
  { key: "chats", scale: 0.98 },
  { key: "sources", scale: 0.92 },
  { key: "help_requests", scale: 1.16 },
  { key: "help_offers", scale: 1.16 },
  { key: "profile", scale: 1.02 },
  { key: "rooms", scale: 1.04 },
  { key: "invite", scale: 1.04 }
];

function MobileIconFrame({ scale = 1, children }) {
  return (
    <span
      className="flex h-full w-full items-center justify-center"
      style={{ transform: `scale(${scale})` }}
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
    const iconClassName = "h-[96%] w-[96%]";
    if (item.key === "chats") {
      return (
        <MobileIconFrame scale={item.scale}>
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

  return (
    <div
      className={cn(
        "chat-mobile-topnav absolute z-[121] left-[calc(env(safe-area-inset-left,0px)+0.22rem)] right-[calc(env(safe-area-inset-right,0px)+0.22rem)] top-[calc(env(safe-area-inset-top,0px)+0.22rem)] flex items-center gap-[clamp(0.02rem,0.3vw,0.08rem)] min-[769px]:hidden",
        mobileRailInteractionLocked ? "pointer-events-none opacity-70" : null
      )}
    >
      <BackButton
        onClick={handleBackHome}
        ariaLabel={t("chat.back_to_home")}
        className="shrink-0 !h-[clamp(2.6rem,10.8vw,2.95rem)] !w-[clamp(2.6rem,10.8vw,2.95rem)]"
        iconClassName="!h-full !w-full"
      />

      {!mobileRailVisible ? (
        <div className="min-w-0 flex-1 flex justify-end">
          <button
            type="button"
            onClick={event => {
              event.preventDefault();
              event.stopPropagation();
              showMobileRail();
            }}
            disabled={mobileRailInteractionLocked}
            aria-label={t("chat.mobile.show_navigation", "Show navigation")}
            className="inline-flex h-[clamp(2.9rem,12.4vw,3.35rem)] w-[clamp(2.9rem,12.4vw,3.35rem)] items-center justify-center rounded-full border-0 bg-transparent p-0 text-[#c57171] light:text-[#7a3a38] opacity-95 touch-manipulation transition-[transform,background-color,box-shadow,opacity] duration-150 focus-visible:bg-white/6 active:bg-white/10 focus-visible:scale-[1.03] active:scale-[0.97] disabled:opacity-55"
          >
            <ShowRailIcon
              isLightTheme={isLightTheme}
              className="h-[82%] w-[82%]"
            />
          </button>
        </div>
      ) : (
        <div className="min-w-0 flex-1 flex w-full items-center justify-between gap-0 overflow-hidden">
          {MOBILE_NAV_ITEMS.map(item => {
            const isDisabled =
              item.key === "sources" ? !hasConversationSources : false;
            const isActive = activeKey === item.key;
            const setSourcesRef = element => {
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
                onClick={event => handleActivate(item.key, event)}
                className={cn(
                  "shrink-0 inline-flex h-[clamp(2.38rem,9.7vw,2.76rem)] w-[clamp(2.38rem,9.7vw,2.76rem)] items-center justify-center rounded-full border-0 bg-transparent p-0 touch-manipulation transition-[transform,background-color,box-shadow,opacity] duration-150 focus-visible:bg-white/6 active:bg-white/10 focus-visible:scale-[1.03] active:scale-[0.97]",
                  isActive
                    ? "bg-white/8 shadow-[0_0_0_1px_rgba(255,255,255,0.16)]"
                    : null,
                  "opacity-100"
                )}
              >
                {renderIcon(item)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
