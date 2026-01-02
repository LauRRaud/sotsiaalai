"use client";
import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useAccessibility } from "@/components/accessibility/AccessibilityProvider";
import { useI18n } from "@/components/i18n/I18nProvider";
import { pushWithTransition } from "@/lib/routeTransition";

export default function TopNav({
  roomId = null,
  hideChats = false,
  forceChat = false,
  className = "",
  style,
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { prefs } = useAccessibility();
  const { t } = useI18n();
  const isLightTheme = prefs?.theme === "light";
  const isChatLike = forceChat || pathname.startsWith("/vestlus");
  const navIconOpacity = isLightTheme ? 0.85 : 1;
  const iconSize = isChatLike ? 36 : 28;

  const chatIcon = isLightTheme ? "/logo/vestlusedhele.svg" : "/logo/vestlusedtume.svg";
  const roomsIcon = isLightTheme ? "/logo/ruumidhele.svg" : "/logo/ruumidtume.svg";
  const addPersonIcon = isLightTheme ? "/logo/lisainimenehele.svg" : "/logo/lisainimenetume.svg";

  const openRooms = useCallback(() => {
    pushWithTransition(router, "/ruum");
  }, [router]);

  const openInvite = useCallback(() => {
    try {
      window.dispatchEvent(new CustomEvent("sotsiaalai:open-invite", { detail: { roomId } }));
    } catch {}
  }, [roomId]);

  const openChatsDrawer = useCallback(
    (e) => {
      if (pathname && pathname.startsWith("/vestlus")) {
        e?.preventDefault?.();
        try {
          window.dispatchEvent(new CustomEvent("sotsiaalai:toggle-conversations", { detail: { open: true } }));
        } catch {}
      } else {
        pushWithTransition(router, "/vestlus");
      }
    },
    [pathname, router]
  );

  return (
    <nav className={`top-nav${isChatLike ? " top-nav--chat" : ""}${className ? ` ${className}` : ""}`} style={style}>
      {!hideChats && (
        <button
          type="button"
          className={`top-nav__btn${pathname.startsWith("/vestlus") ? " top-nav__btn--active" : ""}`}
          onClick={openChatsDrawer}
          aria-label={t("nav.chats", "Vestlused")}
        >
          <Image src={chatIcon} alt="" width={iconSize} height={iconSize} aria-hidden="true" style={{ opacity: navIconOpacity }} />
          <span className="top-nav__label">{t("nav.chats", "Vestlused")}</span>
        </button>
      )}

      <button
        type="button"
        onClick={openRooms}
        className={`top-nav__btn${pathname.startsWith("/ruum") ? " top-nav__btn--active" : ""}`}
        aria-label={t("nav.rooms", "Ruumid")}
      >
        <Image src={roomsIcon} alt="" width={iconSize} height={iconSize} aria-hidden="true" style={{ opacity: navIconOpacity }} />
        <span className="top-nav__label">{t("nav.rooms", "Ruumid")}</span>
      </button>

      <button type="button" className="top-nav__btn" onClick={openInvite} aria-label={t("nav.add_person", "Lisa inimene")}>
        <Image src={addPersonIcon} alt="" width={iconSize} height={iconSize} aria-hidden="true" style={{ opacity: navIconOpacity }} />
        <span className="top-nav__label">{t("nav.add_person", "Lisa inimene")}</span>
      </button>
    </nav>
  );
}
