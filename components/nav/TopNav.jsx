"use client";
import Link from "next/link";
import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useAccessibility } from "@/components/accessibility/AccessibilityProvider";

export default function TopNav({ roomId = null, hideChats = false }) {
  const pathname = usePathname();
  const router = useRouter();
  const { prefs } = useAccessibility();
  const isLightTheme = prefs?.theme === "light";
  const isChatLike = pathname.startsWith("/vestlus");
  const navIconOpacity = isChatLike ? 0.9 : 1;

  const chatIcon = isLightTheme ? "/logo/vestlusedhele.svg" : "/logo/vestlusedtume.svg";
  const roomsIcon = isLightTheme ? "/logo/ruumidhele.svg" : "/logo/ruumidtume.svg";
  const addPersonIcon = isLightTheme ? "/logo/lisainimenehele.svg" : "/logo/lisainimenetume.svg";

  const openRooms = useCallback(() => {
    router.push("/ruum");
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
        router.push("/vestlus");
      }
    },
    [pathname, router]
  );

  return (
    <nav className={`top-nav${isChatLike ? " top-nav--chat" : ""}`}>
      {!hideChats && (
        <button
          type="button"
          className={`top-nav__btn${pathname.startsWith("/vestlus") ? " top-nav__btn--active" : ""}`}
          onClick={openChatsDrawer}
          aria-label="Vestlused"
        >
          <Image src={chatIcon} alt="" width={28} height={28} aria-hidden="true" style={{ opacity: navIconOpacity }} />
          <span className="top-nav__label">Vestlused</span>
        </button>
      )}

      <button
        type="button"
        onClick={openRooms}
        className={`top-nav__btn${pathname.startsWith("/ruum") ? " top-nav__btn--active" : ""}`}
        aria-label="Ruumid"
      >
        <Image src={roomsIcon} alt="" width={28} height={28} aria-hidden="true" style={{ opacity: navIconOpacity }} />
        <span className="top-nav__label">Ruumid</span>
      </button>

      <button type="button" className="top-nav__btn" onClick={openInvite} aria-label="Lisa inimene">
        <Image src={addPersonIcon} alt="" width={28} height={28} aria-hidden="true" style={{ opacity: navIconOpacity }} />
        <span className="top-nav__label">Lisa inimene</span>
      </button>
    </nav>
  );
}
