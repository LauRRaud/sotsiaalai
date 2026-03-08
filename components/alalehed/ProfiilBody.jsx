"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import LoginModal from "@/components/LoginModal";
import { useAccessibility } from "@/components/accessibility/AccessibilityProvider";
import ModalConfirm from "@/components/ui/ModalConfirm";
import Modal from "@/components/ui/Modal";
import { useI18n } from "@/components/i18n/I18nProvider";
import OrbitalMenu from "@/components/effects/Components/OrbitalMenu/OrbitalMenu";
import { localizePath } from "@/lib/localizePath";
import { pushWithTransition, runWithTransition } from "@/lib/routeTransition";
import { cn } from "@/components/ui/cn";
import GlassRing from "@/components/ui/GlassRing";
import { clearStaleScrollLock } from "@/lib/scrollLock";
import { getFooterNote } from "@/lib/footerNote";
import BackButton from "@/components/ui/BackButton";
import Button from "@/components/ui/Button";
import BackIcon from "@/components/ui/icons/BackIcon";
import { PowerExitIcon } from "@/components/ui/icons/AuthIcons";
import { HelpOfferIcon, HelpRequestIcon } from "@/components/ui/icons/ChatIcons";
import { resolveApiMessage } from "@/lib/i18n/resolveApiMessage";
import { glassPageBackMobileBottomCenterClassName, glassPageBackRightClassName, glassPageShellCenteredClassName, glassPageTitleClassName } from "@/components/ui/glassPageStyles";
const TILT_ACTIVE_FLAG_KEY = "__SOTSIAALAI_GLASS_RING_TILT_ACTIVE";
const ROUTE_TILT_STATE_EVENT = "sotsiaalai:glass-ring-tilt-state";
const CHAT_HELP_PANEL_STORAGE_KEY = "__SOTSIAALAI_CHAT_HELP_PANEL__";
const CHAT_SKIP_ENTRY_SETTLE_KEY = "sotsiaalai:chat:skip-entry-settle";
const CHAT_BACK_HOVER_ARM_KEY = "sotsiaalai:chat:back-hover-arm-on-move";
const MOBILE_VIEWPORT_QUERY = "(max-width: 768px)";
const COARSE_POINTER_QUERY = "(hover: none) and (pointer: coarse)";
const ROLE_KEYS = {
  ADMIN: "role.admin",
  SOCIAL_WORKER: "role.worker",
  CLIENT: "role.client"
};
function normalizeProfileRole(value, fallback = "CLIENT") {
  const normalized = String(value || "").trim().toUpperCase();
  if (normalized === "ADMIN") return "ADMIN";
  if (normalized === "SOCIAL_WORKER") return "SOCIAL_WORKER";
  if (normalized === "CLIENT") return "CLIENT";
  return fallback;
}
const pageShellClassName =
  `${glassPageShellCenteredClassName} max-md:py-0`;
const containerBaseClassName =
  "relative z-[21] flex flex-col items-stretch justify-start gap-[clamp(1.4rem,3.2vh,2.3rem)] " +
  "box-border text-[color:var(--glass-surface-text,#f2f2f2)] " +
  "[&>*:not(.profile-mask-layer):not(.profile-orbit-layer):not(.profile-nav-overlay):not(.profile-footer-note)]:relative " +
  "[&>*:not(.profile-mask-layer):not(.profile-orbit-layer):not(.profile-nav-overlay):not(.profile-footer-note)]:z-[1]";
const titleBaseClassName =
  "text-center text-[clamp(1.9rem,1.5rem+1.7vw,2.5rem)] leading-[1.15] tracking-[0.03em] " +
  "mt-[clamp(1.6rem,3.6vh,2.6rem)] mb-[clamp(1.1rem,3.2vh,2rem)] " +
  "max-[48em]:text-[clamp(2.3rem,9.1vw,3rem)] " +
  "text-[#c57171] light:text-[#7A3A38] [font-family:var(--font-aino-headline),var(--font-aino),Arial,sans-serif] font-[400]";
const headerCenterBaseClassName =
  "flex flex-col items-center mb-[clamp(0.6rem,1.4vh,1.1rem)] max-[48em]:mb-[clamp(0.4rem,2vw,0.72rem)]";
const headerCenterPageClassName =
  "mt-[clamp(0rem,0.8vh,0.4rem)] translate-y-[clamp(2.4rem,5.6vh,4.2rem)] " +
  "max-[48em]:mt-[clamp(0.72rem,3.2vw,1.02rem)] max-[48em]:translate-y-[clamp(0.02rem,0.25vw,0.16rem)]";
const rolePillClassName =
  "inline-flex items-center justify-center rounded-full px-[0.75em] " +
  "text-[1.2rem] font-[600] uppercase tracking-[0.06em] " +
  "text-[color:var(--profile-role-text-color,rgba(232,232,232,0.8))] " +
  "bg-transparent border-none " +
  "leading-[3.2rem] h-[3.2rem] whitespace-nowrap";
const rolePillMultiLineClassName =
  "h-auto min-h-[4.5rem] max-w-[19.5rem] px-[1.05em] py-[0.5rem] " +
  "leading-[1.24] whitespace-normal text-center [text-wrap:balance] " +
  "max-[48em]:max-w-[min(84vw,16.2rem)] " +
  "min-[48.0625em]:-translate-y-[0.34rem] max-[48em]:-translate-y-[0.14rem]";
const orbitLayerClassName =
  "profile-orbit-layer absolute inset-0 z-[2] flex items-center justify-center pointer-events-none";
const orbitWrapperClassName =
  "profile-email-dock-wrapper profile-orbit-menu-wrapper pointer-events-auto " +
  "[--orbit-item-size:clamp(4.6rem,9.2vw,5.8rem)] [--orbit-item-size-open:clamp(4.9rem,9.8vw,6.2rem)] " +
  "min-[48.0625em]:[--orbit-item-size:clamp(4.35rem,max(8.4vw,calc(var(--profile-diameter,34rem)*0.14)),5.4rem)] min-[48.0625em]:[--orbit-item-size-open:clamp(4.6rem,max(8.9vw,calc(var(--profile-diameter,34rem)*0.148)),5.75rem)] " +
  "min-[48.0625em]:[--label-gap:0.95rem] min-[48.0625em]:[--label-gap-side:0.18rem] " +
  "[--orbit-size:clamp(17.4rem,35vw,23.8rem)] min-[48.0625em]:[--orbit-size:clamp(16.6rem,max(33vw,calc(var(--profile-diameter,34rem)*0.55)),22.8rem)] [--orbit-center-size:clamp(9.4rem,17vw,11.8rem)] " +
  "min-[48.0625em]:[--orbit-center-size:clamp(8.2rem,max(15vw,calc(var(--profile-diameter,34rem)*0.26)),10.4rem)] " +
  "[--orbit-center-icon-size:calc(var(--orbit-center-size)*0.46)] [--pin-border-w:1.45px] [--pin-shadow:0.11] " +
  "mx-auto mt-[clamp(0.8rem,2.4vh,1.8rem)] mb-[clamp(0.2rem,0.6vh,0.5rem)] " +
  "max-[48em]:[--orbit-item-size:clamp(3.9rem,16.8vw,4.9rem)] max-[48em]:[--orbit-item-size-open:clamp(4.2rem,17.8vw,5.2rem)] " +
  "max-[48em]:[--orbit-size:clamp(14.8rem,70vw,18.8rem)] max-[48em]:[--orbit-center-size:clamp(7.6rem,36vw,9.6rem)] " +
  "max-[48em]:[--orbit-center-icon-size:calc(var(--orbit-center-size)*0.44)] max-[48em]:mt-[clamp(0.9rem,4.1vw,1.25rem)] max-[48em]:mb-[clamp(0.15rem,0.9vw,0.3rem)] " +
  "max-w-[min(100%,32rem)] min-h-[var(--orbit-size)] w-full flex items-center justify-center " +
  "cursor-[var(--cursor-default)] " +
  "min-[48.0625em]:absolute min-[48.0625em]:top-1/2 min-[48.0625em]:left-1/2 " +
  "min-[48.0625em]:w-[var(--orbit-size)] min-[48.0625em]:min-h-[var(--orbit-size)] " +
  "min-[48.0625em]:m-0 min-[48.0625em]:-translate-x-1/2 min-[48.0625em]:-translate-y-1/2";
const orbitRoleToggleWrapClassName =
  "absolute left-1/2 top-[calc(50%+clamp(6.15rem,24vw,7.45rem))] min-[48.0625em]:top-[calc(50%+7rem)] " +
  "-translate-x-1/2 z-[6] pointer-events-auto max-[48em]:hidden";
const orbitRoleToggleButtonClassName =
  "whitespace-normal text-center leading-[1.16] px-[1.22rem] py-[0.76rem] text-[1.02rem] min-h-[2.7rem] " +
  "max-[48em]:!min-h-[3rem] max-[48em]:!px-[1.35rem] max-[48em]:!py-[0.8rem] max-[48em]:!text-[1.14rem]";
const profileMobileActionStackClassName =
  "profile-mobile-action-stack absolute left-1/2 z-[95] flex w-auto max-w-[calc(100vw-2rem)] -translate-x-1/2 flex-col items-center justify-center gap-[clamp(0.28rem,1.8vw,0.58rem)] pointer-events-auto min-[48.0625em]:hidden " +
  "max-[48em]:!fixed max-[48em]:!left-[50vw] max-[48em]:!right-auto max-[48em]:!top-auto " +
  "max-[48em]:!bottom-[calc(env(safe-area-inset-bottom,0px)+5.2rem)] max-[48em]:!translate-x-[-50%] max-[48em]:!translate-y-0 " +
  "max-[48em]:!w-max max-[48em]:!max-w-[calc(100vw-2rem)] max-[48em]:!m-0";
const profileMobileRoleToggleLinkClassName =
  "profile-mobile-role-toggle-link !inline-flex w-auto items-center justify-center gap-[0.34rem] self-center max-[48em]:!self-center " +
  "!p-0 !text-[0.98rem] leading-[1.16] tracking-[0.02em] " +
  "max-w-[min(15.5rem,76vw)] text-center [text-wrap:balance] mt-0 mx-auto max-[48em]:!mx-auto " +
  "!rounded-none !border-transparent !shadow-none !no-underline " +
  "hover:!border-transparent hover:!shadow-none hover:!no-underline " +
  "focus-visible:!border-transparent focus-visible:!shadow-none focus-visible:!no-underline " +
  "active:!border-transparent active:!shadow-none active:!no-underline";
const logoutButtonClassName =
  "group relative grid place-items-center self-center max-[48em]:!self-center h-[4.9rem] w-[4.9rem] max-[48em]:h-[6rem] max-[48em]:w-[6rem] rounded-full border-0 bg-transparent cursor-[var(--cursor-pointer)] pointer-events-auto focus-visible:outline-none";
const logoutIconClassName = "h-[4.2rem] w-[4.2rem] max-[48em]:h-[4.35rem] max-[48em]:w-[4.35rem] transform-gpu will-change-transform transition-transform duration-[260ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-[1.08] group-focus-visible:scale-[1.08] group-active:scale-[0.98]";
const logoutLabelClassName =
  "absolute left-1/2 top-[calc(100%+0.28rem)] -translate-x-1/2 text-center " +
  "text-[1.2rem] max-[48em]:text-[1.08rem] font-[500] tracking-[0.06em] leading-[1.1] " +
  "text-[#c57171] light:text-[#7A3A38] opacity-0 -translate-y-[0.38rem] pointer-events-none transform-gpu will-change-transform " +
  "transition-all duration-[520ms] ease-out " +
  "group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100 group-focus-visible:translate-y-0";
const profileBackButtonClassName =
  `${glassPageBackMobileBottomCenterClassName} ` +
  "max-[48em]:!z-[95]";
const profileNavOverlayClassName =
  "profile-nav-overlay absolute inset-0 z-[3] pointer-events-none";
const profileLogoutWrapClassName =
  `${glassPageBackRightClassName} profile-logout-wrap pointer-events-auto translate-x-[-0.68rem] ` +
  "max-[48em]:!hidden max-[48em]:z-[95]";
const noteClassName =
  "bg-transparent border-0 shadow-none text-[color:var(--glass-surface-text,#f2f2f2)] " +
  "px-[0.6rem] py-[0.2rem] text-center";
const noteRowClassName = "mt-[0.75rem]";
const noteCenterClassName = "w-[min(32rem,100%)] mx-auto";
const errorStateClassName = "flex-1 w-full flex items-center justify-center";
const modalInputWrapClassName = "flex w-full justify-center";
const modalInputClassName =
  "w-full max-w-[22rem] rounded-full [border:var(--input-border)] [background:var(--input-bg)] px-[1rem] py-[0.78rem] text-[1.05rem] text-[color:var(--input-text)] caret-[color:var(--input-caret)] shadow-[var(--input-shadow)] min-h-[3.05rem] transition-[background,border-color,box-shadow,color] duration-150 ease-out placeholder:text-[color:var(--input-placeholder)] placeholder:[font-size:1.02em] placeholder:opacity-100 focus-visible:outline-none focus-visible:[background:var(--input-bg-focus)] focus-visible:shadow-[var(--input-shadow-hover,var(--input-shadow))] hover:[background:var(--input-bg-hover)] hover:shadow-[var(--input-shadow-hover,var(--input-shadow))] disabled:opacity-[var(--input-disabled-opacity)] disabled:cursor-not-allowed aria-disabled:opacity-[var(--input-disabled-opacity)] aria-disabled:cursor-not-allowed text-[1.15rem] py-[0.9rem] px-[1.35rem] min-h-[3.45rem]";
const accountModalOverlayClassName =
  "invite-modal-overlay account-settings-modal-overlay z-[140] max-[768px]:p-0 max-[768px]:items-stretch";
const accountModalContentClassName =
  "invite-modal-content account-settings-modal-content !w-[min(100%,62vw)] !max-w-[clamp(30rem,54vw,38rem)] relative overflow-x-hidden overflow-y-auto overscroll-contain " +
  "pt-[0.35rem] !pb-[1rem] text-[1.12rem] leading-[1.35] tracking-[0.03rem] " +
  "max-[768px]:text-[1.18rem] max-[768px]:leading-[1.4] [--input-text:var(--glass-modal-text)]";
const accountModalHeadClassName =
  "mb-[0.35rem] flex items-start justify-center gap-[0.75rem]";
const accountModalBackButtonClassName =
  "absolute top-[0.15rem] left-[0.2rem] translate-x-0 translate-y-0 bottom-auto z-[92] " +
  "!h-[4.85rem] !w-[4.85rem] min-[769px]:!h-[5.3rem] min-[769px]:!w-[5.3rem] " +
  "[&>svg]:!h-[4.35rem] [&>svg]:!w-[4.35rem] min-[769px]:[&>svg]:!h-[4.75rem] min-[769px]:[&>svg]:!w-[4.75rem] " +
  "max-[768px]:top-[calc(env(safe-area-inset-top,0px)+0.2rem)] max-[768px]:left-[calc(env(safe-area-inset-left,0px)+0.04rem)]";
const accountModalTitleWrapClassName =
  "grid max-w-[30rem] gap-[0.5rem] px-[2.6rem] text-center max-[768px]:w-full max-[768px]:max-w-none max-[768px]:px-[clamp(4.2rem,17vw,5.4rem)]";
const accountModalTitleClassName =
  `${glassPageTitleClassName} !mb-0 max-[768px]:!mt-[calc(env(safe-area-inset-top,0px)+2.55rem)]`;
const accountModalDescriptionClassName =
  "mx-auto max-w-[28rem] text-[1.04rem] leading-[1.4] tracking-[0.02em] text-[color:var(--glass-modal-text-soft,var(--pt-120))] max-[768px]:text-[1.08rem]";
const accountModalActionStackClassName =
  "invite-modal-scroll grid gap-[0.82rem] px-[1.15rem] pt-[0.35rem] pb-[0.4rem] max-[768px]:px-[0.2rem]";
const accountModalCardClassName =
  "rounded-[1rem] border border-[var(--chat-invite-list-border,rgba(248,253,255,0.16))] bg-[rgba(30,32,38,0.42)] " +
  "p-[0.95rem_1rem] text-[color:var(--glass-modal-text)] shadow-none " +
  "[.theme-dark_&]:bg-[rgba(30,32,38,0.42)] " +
  "[.theme-night_&]:bg-[rgba(16,22,34,0.4)] " +
  "[.theme-mid_&]:border-[rgba(132,72,68,0.18)] [.theme-mid_&]:bg-[rgba(251,242,239,0.9)] [.theme-mid_&]:text-[#3f4756] " +
  "[.theme-light_&]:border-transparent [.theme-light_&]:bg-[rgba(255,255,255,0.58)] [.theme-light_&]:text-[#1f2937] [.theme-light_&]:shadow-[var(--input-shadow)]";
const accountModalActionRowClassName = "flex items-center justify-between gap-3 max-[560px]:flex-col max-[560px]:items-start";
const accountModalActionLabelClassName = "text-[1.16rem] font-medium leading-[1.28]";
const accountModalNoteClassName =
  "mt-[0.82rem] text-[1.01rem] leading-[1.32] text-[color:var(--glass-modal-text-soft,var(--pt-120))]";
const accountModalButtonClassName =
  "!min-h-[2.8rem] !px-[1.08rem] !py-[0.48rem] !text-[1.06rem] !tracking-[0.02em] shrink-0";
const PROFILE_FOOTER_SHINE_VARIANT = "wide";
const PROFILE_FOOTER_SHINE_GRADIENTS = {
  soft:
    "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0.92) 50%, rgba(255,255,255,0) 60%, rgba(255,255,255,0) 100%)",
  narrow:
    "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 45%, rgba(255,255,255,1) 50%, rgba(255,255,255,0) 55%, rgba(255,255,255,0) 100%)",
  medium:
    "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 42%, rgba(255,255,255,0.98) 50%, rgba(255,255,255,0) 58%, rgba(255,255,255,0) 100%)",
  wide:
    "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 32%, rgba(255,255,255,0.98) 50%, rgba(255,255,255,0.2) 68%, rgba(255,255,255,0) 100%)",
  dual:
    "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.68) 33%, rgba(255,255,255,0) 44%, rgba(255,255,255,0.96) 50%, rgba(255,255,255,0) 56%, rgba(255,255,255,0.68) 67%, rgba(255,255,255,0) 100%)"
};
const PROFILE_FOOTER_SHINE_GRADIENTS_LIGHT = {
  soft:
    "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 40%, rgba(58,38,30,0.9) 50%, rgba(0,0,0,0) 60%, rgba(0,0,0,0) 100%)",
  narrow:
    "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 45%, rgba(48,30,24,0.96) 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0) 100%)",
  medium:
    "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 42%, rgba(56,36,28,0.94) 50%, rgba(0,0,0,0) 58%, rgba(0,0,0,0) 100%)",
  wide:
    "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(72,46,36,0.18) 32%, rgba(56,36,28,0.92) 50%, rgba(72,46,36,0.18) 68%, rgba(0,0,0,0) 100%)",
  dual:
    "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(72,46,36,0.56) 33%, rgba(0,0,0,0) 44%, rgba(56,36,28,0.92) 50%, rgba(0,0,0,0) 56%, rgba(72,46,36,0.56) 67%, rgba(0,0,0,0) 100%)"
};
function ProfileShell({
  locale,
  children,
  role = "region",
  ariaLabelledby,
  innerRef,
  embedded = false,
  theme = "dark",
  orbitOpen = false,
  hidden = false,
  maskLayerRef,
  footerNote
}) {
  const footerShineBackgroundImage =
    (theme === "light"
      ? PROFILE_FOOTER_SHINE_GRADIENTS_LIGHT[PROFILE_FOOTER_SHINE_VARIANT]
      : PROFILE_FOOTER_SHINE_GRADIENTS[PROFILE_FOOTER_SHINE_VARIANT]) ||
    (theme === "light" ? PROFILE_FOOTER_SHINE_GRADIENTS_LIGHT.soft : PROFILE_FOOTER_SHINE_GRADIENTS.soft);
  const containerClass = cn(
    containerBaseClassName,
    embedded ? "profile-container glass-ring glass-ring--desktop-stable" : "profile-container glass-ring glass-ring--desktop-stable",
    "[--ring-ui-reserve:var(--ring-ui-reserve-page)] [--ring-pad-top:var(--glass-ring-pad-top)] [--ring-pad-x:var(--glass-ring-pad-x)] " +
      "[--profile-role-hole-mask:linear-gradient(#fff,#fff)] " +
      "[--profile-role-text-color:rgba(232,232,232,0.78)] " +
      "[--profile-role-hole-shadow:none] " +
      "data-[theme=dark]:[--profile-role-text-color:rgba(248,250,252,0.9)] " +
      "data-[theme=dark]:[--profile-role-hole-shadow:0_6px_16px_rgba(0,0,0,0.26),0_8px_14px_-12px_rgba(248,253,255,0.52),0_18px_24px_-18px_rgba(248,253,255,0.26)] " +
      "data-[theme=light]:[--profile-role-text-color:#2b2620] " +
      "data-[theme=light]:[--profile-role-hole-shadow:0_4px_12px_rgba(0,0,0,0.12)] " +
      "max-[48em]:border max-[48em]:border-[var(--glass-border-color)] max-[48em]:shadow-[var(--glass-shell-shadow,var(--glass-shadow-glow,none))]",
    hidden && "opacity-0 pointer-events-none",
    !embedded && "max-md:[--glass-ring-pad-top:clamp(1.1rem,4.4vw,1.7rem)]"
  );
  const ringSurfaceStyle = {
    background: "transparent",
    backdropFilter: "none",
    WebkitBackdropFilter: "none"
  };
  const container = <GlassRing className={containerClass} role={role} aria-labelledby={ariaLabelledby} ref={innerRef} lang={embedded ? locale : undefined} data-theme={theme} data-orbit-open={orbitOpen ? "true" : "false"} style={ringSurfaceStyle}>
      <div
        ref={maskLayerRef}
        className="profile-mask-layer absolute inset-0 z-0 rounded-[inherit] pointer-events-none bg-[color:var(--glass-surface-bg,rgba(0,0,0,0.25))] backdrop-blur-[var(--glass-blur-radius,1rem)] [-webkit-backdrop-filter:blur(var(--glass-blur-radius,1rem))] [mask-image:var(--profile-role-hole-mask,none)] [-webkit-mask-image:var(--profile-role-hole-mask,none)] [mask-size:100%_100%] [-webkit-mask-size:100%_100%] [mask-repeat:no-repeat] [-webkit-mask-repeat:no-repeat] data-[orbit-open=true]:[mask-image:none] data-[orbit-open=true]:[-webkit-mask-image:none]"
        aria-hidden="true"
        data-orbit-open={orbitOpen ? "true" : "false"}
      />
      {children}
      {footerNote ? (
        <footer
          aria-hidden={orbitOpen ? "true" : undefined}
          className={cn(
            "profile-footer-note pointer-events-none absolute inset-x-0 top-[82%] -translate-y-1/2 z-[1] text-center text-[1.52rem] leading-[1.25] tracking-[0.012em] text-[#d08963] light:text-[#7A3A38] transition-opacity duration-200 max-[48em]:top-auto max-[48em]:bottom-[calc(env(safe-area-inset-bottom,0px)+clamp(0.35rem,1.8vw,0.7rem))] max-[48em]:translate-y-0 max-[48em]:text-[1.62rem]",
            orbitOpen ? "opacity-0" : "opacity-[0.65]"
          )}
        >
          <span
            aria-hidden="true"
            className="inline-block whitespace-pre [font:inherit] tracking-[0.012em] text-transparent [background-repeat:no-repeat] [background-size:220%_100%] [background-position:200%_center] [-webkit-background-clip:text] [background-clip:text] [-webkit-text-fill-color:transparent] [animation:profile-footer-shine_12000ms_linear_infinite] [animation-delay:100ms] [animation-fill-mode:both]"
            style={{
              backgroundImage: footerShineBackgroundImage
            }}
          >
            {footerNote}
          </span>
          <span className="sr-only">{footerNote}</span>
        </footer>
      ) : null}
    </GlassRing>;
  if (embedded) {
    return container;
  }
  return <div className={pageShellClassName} lang={locale}>
      {container}
    </div>;
}
function EmailDockIcon({
  isHovered: _isHovered,
  ...props
}) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.2" />
      <path d="M4.5 7.25 12 12.25 19.5 7.25" />
    </svg>;
}
function PinDockIcon({
  isHovered: _isHovered,
  ...props
}) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}>
      <g transform="translate(12 12) scale(1.05) translate(-12 -12) translate(0 0.35)">
        <rect x="4.5" y="8.5" width="15" height="9" rx="2.2" ry="2.2" />
        <path d="M7.5 8.5V6.5a4.5 4.5 0 0 1 9 0v2" />
        <circle cx="12" cy="13" r="0.9" fill="currentColor" />
        <path d="M12 13.7v1.2" stroke="currentColor" />
      </g>
    </svg>;
}
function PreferencesDockIcon({
  isHovered: _isHovered,
  ...props
}) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>;
}
function SubscriptionDockIcon({
  isHovered: _isHovered,
  ...props
}) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props} shapeRendering="geometricPrecision">
      <rect x="4.3" y="4.8" width="15.4" height="14.4" rx="2.6" />
      <path d="M6.7 9.5h10.6" />
      <path d="M9 14.2l2.1 2.4 4.1-4.6" />
    </svg>;
}
function DeleteDockIcon({
  isHovered: _isHovered,
  ...props
}) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}>
      <path d="M4 6h16M10 10v6M14 10v6" />
      <path d="M9 6l.6-1.4A1.5 1.5 0 0 1 11 4h2a1.5 1.5 0 0 1 1.4.6L15 6m3 0-.8 11.6a2 2 0 0 1-2 1.9H8.8a2 2 0 0 1-2-1.9L6 6" />
    </svg>;
}
function AccountSettingsDockIcon({
  isHovered: _isHovered,
  ...props
}) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}>
      <g transform="translate(12 12) scale(0.82) translate(-12 -12)">
        <circle cx="12" cy="12" r="3.1" />
        <path d="M19.4 15a1.6 1.6 0 0 0 .35 1.77l.08.08a2 2 0 1 1-2.83 2.83l-.08-.08a1.6 1.6 0 0 0-1.77-.35 1.6 1.6 0 0 0-.97 1.47V21a2 2 0 1 1-4 0v-.11a1.6 1.6 0 0 0-.97-1.47 1.6 1.6 0 0 0-1.77.35l-.08.08a2 2 0 1 1-2.83-2.83l.08-.08A1.6 1.6 0 0 0 4.6 15a1.6 1.6 0 0 0-1.47-.97H3a2 2 0 1 1 0-4h.11A1.6 1.6 0 0 0 4.58 9a1.6 1.6 0 0 0-.35-1.77l-.08-.08a2 2 0 1 1 2.83-2.83l.08.08A1.6 1.6 0 0 0 8.83 4a1.6 1.6 0 0 0 .97-1.47V2.5a2 2 0 1 1 4 0v.11A1.6 1.6 0 0 0 14.77 4a1.6 1.6 0 0 0 1.77-.35l.08-.08a2 2 0 1 1 2.83 2.83l-.08.08A1.6 1.6 0 0 0 19.02 9c.22.6.8 1 1.43 1H20.5a2 2 0 1 1 0 4h-.11a1.6 1.6 0 0 0-1.47 1Z" />
      </g>
    </svg>;
}
function RoleToggleDockIcon({
  isHovered: _isHovered,
  ...props
}) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}>
      <path d="M7 7h10" />
      <path d="m13.5 4.5 3 2.5-3 2.5" />
      <path d="M17 17H7" />
      <path d="m10.5 14.5-3 2.5 3 2.5" />
    </svg>;
}
function ThemeSunDockIcon({
  isHovered: _isHovered,
  ...props
}) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}>
      <circle cx="12" cy="12" r="3.7" />
      <path d="M12 2.6v2.1M12 19.3v2.1M4.7 12h2.1M17.2 12h2.1M5.8 5.8l1.5 1.5M16.7 16.7l1.5 1.5M18.2 5.8l-1.5 1.5M7.3 16.7l-1.5 1.5" />
    </svg>;
}
function ThemeMoonDockIcon({
  isHovered: _isHovered,
  showStars = false,
  ...props
}) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}>
      <path d="M15.8 3.7a8.7 8.7 0 1 0 4.5 14.6A7.9 7.9 0 0 1 15.8 3.7z" />
      {showStars ? <>
          <circle cx="18.2" cy="7.3" r="1.0" fill="currentColor" stroke="none" opacity="0.94" />
          <circle cx="21.4" cy="10.1" r="0.84" fill="currentColor" stroke="none" opacity="0.86" />
          <circle cx="18.7" cy="12.8" r="0.74" fill="currentColor" stroke="none" opacity="0.8" />
        </> : null}
    </svg>;
}
function ThemeMidDockIcon({
  isHovered: _isHovered,
  ...props
}) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}>
      <defs>
        <clipPath id="mid-sun-disc-clip">
          <circle cx="12" cy="12" r="3.7" />
        </clipPath>
        <clipPath id="mid-sun-lower-clip">
          <circle cx="12" cy="12" r="3.7" />
          <rect x="8.3" y="12.5" width="7.4" height="3.3" />
        </clipPath>
      </defs>
      <circle cx="12" cy="12" r="3.7" />
      <rect x="8.3" y="12.5" width="7.4" height="3.3" fill="currentColor" stroke="none" clipPath="url(#mid-sun-disc-clip)" />
      <path d="M10.45 14.08h3.1" stroke="rgba(255,255,255,0.78)" strokeWidth="0.72" clipPath="url(#mid-sun-lower-clip)" />
      <path d="M12 2.6v2.1M4.7 12h2.1M17.2 12h2.1M5.8 5.8l1.5 1.5M18.2 5.8l-1.5 1.5" />
    </svg>;
}
export default function ProfiilBody({
  initialProfile = null,
  embedded = false,
  isActive = true,
  onBack
}) {
  const router = useRouter();
  const {
    data: session,
    status
  } = useSession();
  const {
    prefs,
    setPrefs,
    openModal: openA11y
  } = useAccessibility();
  const {
    t,
    locale
  } = useI18n();
  const footerNote = getFooterNote();
  const initialProfileUser = initialProfile?.user && typeof initialProfile.user === "object"
    ? initialProfile.user
    : initialProfile && typeof initialProfile === "object"
      ? initialProfile
      : null;
  const [profileUser, setProfileUser] = useState(initialProfileUser);
  const [_hasPassword, setHasPassword] = useState(!!initialProfileUser?.hasPassword);
  const [showDelete, setShowDelete] = useState(false);
  const [deletePin, setDeletePin] = useState("");
  const [loading, setLoading] = useState(!initialProfile);
  const [loadFailed, setLoadFailed] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [loggingOutEverywhere, setLoggingOutEverywhere] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [showLogoutAll, setShowLogoutAll] = useState(false);
  const [roleSwitching, setRoleSwitching] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [orbitOpen, setOrbitOpen] = useState(false);
  const [isMobileProfileMenu, setIsMobileProfileMenu] = useState(false);
  useEffect(() => {
    clearStaleScrollLock();
  }, []);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const updateViewport = () => {
      const ua = typeof navigator !== "undefined" ? navigator.userAgent || "" : "";
      const uaMobile =
        Boolean(typeof navigator !== "undefined" && "userAgentData" in navigator && navigator.userAgentData?.mobile) ||
        /Android|iPhone|iPad|iPod|Windows Phone|IEMobile|Opera Mini|Mobile/i.test(ua);
      const matchWidth = window.matchMedia?.(MOBILE_VIEWPORT_QUERY)?.matches;
      const matchCoarse = window.matchMedia?.(COARSE_POINTER_QUERY)?.matches;
      setIsMobileProfileMenu(Boolean(uaMobile || matchWidth || matchCoarse || window.innerWidth <= 768));
    };
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);
  const searchParams = useSearchParams();
  const registrationReason = searchParams?.get("reason");
  const isAuthed = status === "authenticated" || !!session?.user;
  const currentTheme =
    prefs?.theme === "light" ||
    prefs?.theme === "mid" ||
    prefs?.theme === "night" ||
    prefs?.theme === "dark"
      ? prefs.theme
      : "dark";
  const isLightTheme =
    currentTheme === "light" || currentTheme === "mid";
  const profileShellTheme = isLightTheme ? "light" : "dark";
  const titleClassName = cn(
    embedded ? titleBaseClassName : glassPageTitleClassName,
    !embedded && "min-[48.0625em]:sr-only",
    "max-[48em]:!text-[clamp(2.24rem,8.8vw,2.9rem)] max-[48em]:!px-[clamp(4.2rem,17vw,5.4rem)]"
  );
  const headerCenterClassName = cn(
    headerCenterBaseClassName,
    !embedded && headerCenterPageClassName
  );
  const actualRole = normalizeProfileRole(
    profileUser?.role || session?.user?.role || (session?.user?.isAdmin ? "ADMIN" : "CLIENT"),
    session?.user?.isAdmin ? "ADMIN" : "CLIENT"
  );
  const isAdminUser = actualRole === "ADMIN" || profileUser?.isAdmin === true || session?.user?.isAdmin === true;
  const activePreviewRole = normalizeProfileRole(
    profileUser?.adminViewRole || (isAdminUser ? profileUser?.effectiveRole || "SOCIAL_WORKER" : actualRole),
    isAdminUser ? "SOCIAL_WORKER" : actualRole
  );
  const nextPreviewRole = activePreviewRole === "SOCIAL_WORKER" ? "CLIENT" : "SOCIAL_WORKER";
  const nextPreviewRoleLabel = t(nextPreviewRole === "SOCIAL_WORKER" ? "profile.view_mode.worker" : "profile.view_mode.client");
  const isLongRoleLabel = actualRole === "SOCIAL_WORKER" || actualRole === "CLIENT";
  const roleLabel = t(ROLE_KEYS[actualRole] || "role.unknown");
  const profileContainerRef = useRef(null);
  const profileFormRef = useRef(null);
  const rolePillRef = useRef(null);
  const maskLayerRef = useRef(null);
  const maskRefreshRef = useRef(null);
  useLayoutEffect(() => {
    const box = profileContainerRef.current;
    const pill = rolePillRef.current;
    const form = profileFormRef.current;
    if (!box || !pill) return;
    const maskLayer = maskLayerRef.current;
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const encodeSvgMask = svg => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
    const getLocalRect = (el, root) => {
      if (!el || !root) return null;
      const rect = el.getBoundingClientRect();
      const rootRect = root.getBoundingClientRect();
      let w = rect.width;
      let h = rect.height;
      if (!w || !h) {
        w = el.offsetWidth || 0;
        h = el.offsetHeight || 0;
      }
      if (!w || !h) return null;
      return {
        x: rect.left - rootRect.left,
        y: rect.top - rootRect.top,
        w,
        h
      };
    };
    let lastMask = "";
    let retryCount = 0;
    let raf = 0;
    let rafLoop = 0;
    let loopUntil = 0;
    let pendingAfterTilt = false;
    const isTiltActive = () =>
      typeof window !== "undefined" && Boolean(window[TILT_ACTIVE_FLAG_KEY]);
    const roundedRectPath = (x, y, width, height, radius) => {
      const r = clamp(radius, 0, Math.min(width, height) / 2);
      const right = x + width;
      const bottom = y + height;
      return [`M ${x + r} ${y}`, `H ${right - r}`, `A ${r} ${r} 0 0 1 ${right} ${y + r}`, `V ${bottom - r}`, `A ${r} ${r} 0 0 1 ${right - r} ${bottom}`, `H ${x + r}`, `A ${r} ${r} 0 0 1 ${x} ${bottom - r}`, `V ${y + r}`, `A ${r} ${r} 0 0 1 ${x + r} ${y}`, "Z"].join(" ");
    };
    const buildMask = (rootW, rootH, holeRect, radius) => {
      if (!rootW || !rootH || !holeRect?.w || !holeRect?.h) return null;
      const outerPath = `M 0 0 H ${rootW} V ${rootH} H 0 Z`;
      const holePath = roundedRectPath(clamp(holeRect.x, 0, rootW), clamp(holeRect.y, 0, rootH), clamp(holeRect.w, 0, rootW - holeRect.x), clamp(holeRect.h, 0, rootH - holeRect.y), radius);
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${rootW} ${rootH}" preserveAspectRatio="none"><path fill="white" fill-rule="evenodd" d="${outerPath} ${holePath}"/></svg>`;
      return encodeSvgMask(svg);
    };
    const updateMask = () => {
      if (isTiltActive() && lastMask) {
        pendingAfterTilt = true;
        return;
      }
      if (box.dataset?.orbitOpen === "true") {
        if (maskLayer) {
          maskLayer.style.setProperty("-webkit-mask-image", "none");
          maskLayer.style.setProperty("mask-image", "none");
        }
        return;
      }
      const boxRect = box.getBoundingClientRect();
      const boxW = boxRect.width;
      const boxH = boxRect.height;
      if (!boxW || !boxH) {
        if (retryCount < 12) {
          retryCount += 1;
          window.setTimeout(scheduleUpdate, 120);
        }
        return;
      }
      const pillLocal = getLocalRect(pill, box);
      if (!pillLocal) {
        if (retryCount < 12) {
          retryCount += 1;
          window.setTimeout(scheduleUpdate, 120);
        }
        return;
      }
      retryCount = 0;
      const pillRadiusRaw = Number.parseFloat(window.getComputedStyle(pill).borderTopLeftRadius);
      const pillRadius = Number.isFinite(pillRadiusRaw) ? pillRadiusRaw : pillLocal.h / 2;
      const mask = buildMask(boxW, boxH, pillLocal, pillRadius);
      if (mask && mask !== lastMask) {
        box.style.setProperty("--profile-role-hole-mask", mask);
        if (maskLayer) {
          maskLayer.style.setProperty("--profile-role-hole-mask", mask);
          maskLayer.style.setProperty("-webkit-mask-image", mask);
          maskLayer.style.setProperty("mask-image", mask);
        }
        lastMask = mask;
      }
      pendingAfterTilt = false;
    };
    const nowMs = () => typeof performance !== "undefined" ? performance.now() : Date.now();
    const tick = (ts) => {
      if (ts > loopUntil) {
        rafLoop = 0;
        return;
      }
      updateMask();
      rafLoop = window.requestAnimationFrame(tick);
    };
    const startLoop = () => {
      const until = nowMs() + 760;
      loopUntil = Math.max(loopUntil, until);
      if (!rafLoop) {
        rafLoop = window.requestAnimationFrame(tick);
      }
    };
    const scheduleUpdate = () => {
      if (isTiltActive() && lastMask) {
        pendingAfterTilt = true;
        return;
      }
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(() => {
        updateMask();
        startLoop();
      });
    };
    const onTiltState = event => {
      if (event?.detail?.active) return;
      if (pendingAfterTilt) {
        scheduleUpdate();
      }
    };
    maskRefreshRef.current = scheduleUpdate;
    scheduleUpdate();
    const settleTimers = [0, 60, 160, 320, 600, 900, 1400].map(delay =>
      window.setTimeout(scheduleUpdate, delay)
    );
    window.addEventListener(ROUTE_TILT_STATE_EVENT, onTiltState);
    window.addEventListener("resize", scheduleUpdate);
    box.addEventListener("scroll", scheduleUpdate);
    box.addEventListener("transitionend", scheduleUpdate);
    box.addEventListener("transitionrun", scheduleUpdate);
    box.addEventListener("transitionstart", scheduleUpdate);
    let ro;
    let mo;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(scheduleUpdate);
      ro.observe(box);
      ro.observe(pill);
      if (form) ro.observe(form);
    }
    if (typeof MutationObserver !== "undefined") {
      mo = new MutationObserver(scheduleUpdate);
      mo.observe(box, {
        childList: true,
        subtree: true
      });
    }
    document.fonts?.ready?.then?.(scheduleUpdate).catch?.(() => {});
    return () => {
      window.cancelAnimationFrame(raf);
      if (rafLoop) window.cancelAnimationFrame(rafLoop);
      settleTimers.forEach(timer => window.clearTimeout(timer));
      window.removeEventListener(ROUTE_TILT_STATE_EVENT, onTiltState);
      window.removeEventListener("resize", scheduleUpdate);
      box.removeEventListener("scroll", scheduleUpdate);
      box.removeEventListener("transitionend", scheduleUpdate);
      box.removeEventListener("transitionrun", scheduleUpdate);
      box.removeEventListener("transitionstart", scheduleUpdate);
      ro?.disconnect?.();
      mo?.disconnect?.();
      if (maskRefreshRef.current === scheduleUpdate) {
        maskRefreshRef.current = null;
      }
    };
  }, [embedded, isActive, prefs?.theme, roleLabel, loading, loadFailed, isAuthed]);
  useEffect(() => {
    const refresh = () => maskRefreshRef.current?.();
    const timers = [0, 60, 140, 260, 420, 700, 1100].map(delay =>
      window.setTimeout(refresh, delay)
    );
    return () => timers.forEach(timer => window.clearTimeout(timer));
  }, [prefs?.theme, roleLabel, orbitOpen, isActive, embedded]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const maskLayer = maskLayerRef.current;
    if (orbitOpen) {
      if (maskLayer) {
        maskLayer.style.setProperty("-webkit-mask-image", "none");
        maskLayer.style.setProperty("mask-image", "none");
      }
      return;
    }
    if (maskLayer) {
      maskLayer.style.removeProperty("-webkit-mask-image");
      maskLayer.style.removeProperty("mask-image");
    }
    const refresh = () => maskRefreshRef.current?.();
    const timers = [0, 80, 180, 360].map(delay => window.setTimeout(refresh, delay));
    return () => timers.forEach(timer => window.clearTimeout(timer));
  }, [orbitOpen]);
  useEffect(() => {
    if (!isActive) return;
    const refresh = () => maskRefreshRef.current?.();
    const raf1 = window.requestAnimationFrame(() => {
      const raf2 = window.requestAnimationFrame(refresh);
      window.setTimeout(refresh, 140);
      window.setTimeout(refresh, 320);
      window.setTimeout(refresh, 700);
      return () => window.cancelAnimationFrame(raf2);
    });
    return () => window.cancelAnimationFrame(raf1);
  }, [isActive]);
  useEffect(() => {
    if (status !== "unauthenticated") return;
    if (embedded && !isActive) return;
    setLoginOpen(true);
  }, [embedded, isActive, status]);
  useEffect(() => {
    if (embedded && !isActive) setLoginOpen(false);
  }, [embedded, isActive]);
  const modeSequence = ["light", "mid", "dark", "night"];
  const currentModeIndex = modeSequence.indexOf(currentTheme);
  const nextMode = modeSequence[(currentModeIndex + 1 + modeSequence.length) % modeSequence.length];
  const nextModeLabel = t(`profile.theme_mode.${nextMode}`);
  const nextModeIcon = useMemo(() =>
    nextMode === "mid"
      ? <ThemeMidDockIcon width={30} height={30} className="scale-[1.12]" />
      : nextMode === "light"
        ? <ThemeSunDockIcon width={26} height={26} />
        : <ThemeMoonDockIcon width={26} height={26} showStars={nextMode === "night"} />, [nextMode]);
  const handleModeSwitch = useCallback(() => {
    setPrefs?.({
      theme: nextMode,
      colorTheme: "default"
    });
  }, [nextMode, setPrefs]);
  const openChatHelpPanel = useCallback((panelKey) => {
    if (!panelKey) return;
    if (typeof window !== "undefined") {
      if (embedded) {
        try {
          window.dispatchEvent(new CustomEvent("sotsiaalai:open-help-listings", {
            detail: { panelKey }
          }));
          return;
        } catch {}
      }
      try {
        window.sessionStorage.setItem(CHAT_HELP_PANEL_STORAGE_KEY, panelKey);
      } catch {}
    }
    pushWithTransition(router, localizePath("/vestlus", locale));
  }, [embedded, locale, router]);
  const orbitItems = useMemo(() => [{
    key: "theme",
    icon: nextModeIcon,
    label: nextModeLabel,
    labelPos: "left",
    keepOpen: true,
    onClick: handleModeSwitch
  }, {
    key: "pin",
    icon: <PinDockIcon />,
    label: t("profile.change_password_cta"),
    labelPos: "up",
    onClick: () => pushWithTransition(router, localizePath(`/uuenda-pin${embedded ? "?return=profile" : ""}`, locale))
  }, {
    key: "email",
    icon: <EmailDockIcon />,
    label: t("profile.update_email_cta"),
    labelPos: "up",
    onClick: () => pushWithTransition(router, localizePath(`/uuenda-epost${embedded ? "?return=profile" : ""}`, locale))
  }, {
    key: "account",
    icon: <AccountSettingsDockIcon />,
    label: t("profile.account_settings"),
    labelPos: "right",
    onClick: () => {
      setError("");
      setShowAccountSettings(true);
    }
  }, {
    key: "subscription",
    icon: <SubscriptionDockIcon />,
    label: t("profile.manage_subscription"),
    labelPos: "down",
    onClick: () => pushWithTransition(router, localizePath(`/tellimus${embedded ? "?return=profile" : ""}`, locale))
  }, ...(isMobileProfileMenu ? [{
    key: "my_help_requests",
    icon: <HelpRequestIcon isLightTheme={isLightTheme} />,
    label: t("chat.help.myHelpRequests"),
    labelPos: "down",
    onClick: () => openChatHelpPanel("my_help_requests")
  }, {
    key: "my_help_offers",
    icon: <HelpOfferIcon isLightTheme={isLightTheme} />,
    label: t("chat.help.myHelpOffers"),
    labelPos: "down",
    onClick: () => openChatHelpPanel("my_help_offers")
  }] : []), {
    key: "preferences",
    icon: <PreferencesDockIcon />,
    label: t("profile.preferences.title"),
    labelPos: "down",
    onClick: () => openA11y?.()
  }], [embedded, handleModeSwitch, isLightTheme, isMobileProfileMenu, locale, nextModeIcon, nextModeLabel, openA11y, openChatHelpPanel, router, t]);
  const handleBack = useCallback(() => {
    if (typeof onBack === "function") {
      onBack();
      return;
    }
    try {
      window.sessionStorage.setItem(CHAT_SKIP_ENTRY_SETTLE_KEY, "1");
      window.sessionStorage.setItem(CHAT_BACK_HOVER_ARM_KEY, "1");
    } catch {}
    pushWithTransition(router, localizePath("/vestlus", locale), {
      glassRingTilt: "left",
      waitForGlassRingTilt: true,
      persistGlassRingTilt: false
    });
  }, [locale, onBack, router]);
  const handleMobileOrbitBack = useCallback(() => {
    pushWithTransition(router, localizePath("/profiil", locale));
  }, [locale, router]);
  const mobileBackItem = {
    key: "back",
    icon: <BackIcon className="profile-orbit-back-icon h-full w-full" />,
    label: t("buttons.back"),
    onClick: handleMobileOrbitBack
  };
  const handleLogout = async () => {
    if (loggingOut) return;
    setError("");
    setLoggingOut(true);
    try {
      await new Promise((resolve, reject) => {
        runWithTransition(
          () => {
            signOut({
              callbackUrl: localizePath("/", locale)
            })
              .then(resolve)
              .catch(reject);
          },
          {
            glassRingTilt: "left",
            waitForGlassRingTilt: true,
            persistGlassRingTilt: false
          }
        );
      });
    } catch (err) {
      console.error("profile logout", err);
      setError(t("profile.server_unreachable"));
    } finally {
      setLoggingOut(false);
    }
  };
  const handleLogoutAll = async () => {
    if (loggingOutEverywhere) return;
    setError("");
    setLoggingOutEverywhere(true);
    try {
      const res = await fetch("/api/profile/logout-all", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": locale
        },
        body: JSON.stringify({ locale })
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(resolveApiMessage({
          payload,
          t,
          fallbackKey: "profile.logout_all_failed"
        }));
        return;
      }
      setShowLogoutAll(false);
      await signOut({
        callbackUrl: localizePath("/", locale)
      });
    } catch (err) {
      console.error("profile logout-all", err);
      setError(t("profile.logout_all_failed"));
    } finally {
      setLoggingOutEverywhere(false);
    }
  };
  const handleAdminViewRoleChange = useCallback(async nextRole => {
    if (!isAdminUser || roleSwitching) return;
    setError("");
    setRoleSwitching(true);
    try {
      const res = await fetch("/api/profile/view-role", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": locale
        },
        body: JSON.stringify({ viewRole: nextRole })
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(payload?.error || payload?.message || t("profile.view_mode.save_failed"));
        return;
      }
      setProfileUser(current => ({
        ...(current || {}),
        ...(payload?.user || {})
      }));
    } catch (err) {
      console.error("profile view role PUT", err);
      setError(t("profile.view_mode.save_failed"));
    } finally {
      setRoleSwitching(false);
    }
  }, [isAdminUser, locale, roleSwitching, t]);
  useEffect(() => {
    if (embedded && !isActive) return;
    if (status === "loading") return;
    if (status !== "authenticated") {
      setProfileUser(null);
      setLoading(false);
      setLoadFailed(false);
      return;
    }
    if (initialProfile) {
      setProfileUser(initialProfileUser);
      setHasPassword(!!initialProfileUser?.hasPassword);
      setLoadFailed(false);
      setLoading(false);
      return;
    }
    (async () => {
      try {
        setLoadFailed(false);
        const res = await fetch("/api/profile", {
          cache: "no-store"
        });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(payload?.error || payload?.message || t("profile.load_failed"));
          setLoadFailed(true);
          return;
        }
        setProfileUser(payload?.user || null);
        setHasPassword(!!payload?.user?.hasPassword);
      } catch (err) {
        console.error("profile GET", err);
        setError(t("profile.server_unreachable"));
        setLoadFailed(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [embedded, initialProfile, initialProfileUser, isActive, status, t]);
  if (isAuthed && (status === "loading" && !initialProfile || loading)) {
    return <ProfileShell locale={locale} embedded={embedded} theme={profileShellTheme} footerNote={footerNote}>
        <h1 className={titleClassName}>{t("profile.title")}</h1>
      </ProfileShell>;
  }
  if (!isAuthed) {
    const reason = registrationReason || "not-logged-in";
    const reasonText = reason === "no-sub" ? t("profile.login_to_manage_sub") : t("profile.login_to_view");
    return <>
        <ProfileShell locale={locale} embedded={embedded} theme={profileShellTheme} footerNote={footerNote}>
          <h1 className={titleClassName}>{t("profile.title")}</h1>
          <p className={noteClassName}>{reasonText}</p>
          <BackButton onClick={embedded ? handleBack : () => setLoginOpen(true)} ariaLabel={embedded ? t("profile.back_to_chat") : t("auth.login.title")} className={profileBackButtonClassName} />
        </ProfileShell>

        <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      </>;
  }
  if (loadFailed) {
    return <ProfileShell locale={locale} ariaLabelledby="profile-title" embedded={embedded} theme={profileShellTheme} footerNote={footerNote}>
        <h1 id="profile-title" className={titleClassName}>
          {t("profile.title")}
        </h1>
        <div className={errorStateClassName}>
          <div role="alert" className={cn(noteClassName, noteCenterClassName)}>
            {error || t("profile.load_failed")}
          </div>
        </div>
      </ProfileShell>;
  }
  return <ProfileShell locale={locale} ariaLabelledby="profile-title" innerRef={profileContainerRef} embedded={embedded} theme={profileShellTheme} orbitOpen={orbitOpen} hidden={showAccountSettings} maskLayerRef={maskLayerRef} footerNote={footerNote}>
      <h1 id="profile-title" className={cn(titleClassName, "profile-title", orbitOpen ? "opacity-0 pointer-events-none" : null)}>
        {t("profile.title")}
      </h1>

      <div className={cn(headerCenterClassName, "profile-role-row")}>
        <span
          ref={rolePillRef}
          className={cn(rolePillClassName, isLongRoleLabel ? rolePillMultiLineClassName : null, "shadow-[var(--profile-role-hole-shadow,none)]", orbitOpen ? "opacity-0 pointer-events-none" : null)}
          aria-hidden={orbitOpen ? "true" : undefined}
        >
          {roleLabel}
        </span>
      </div>

      <div className={orbitLayerClassName}>
        <div className={orbitWrapperClassName} style={{ marginTop: 0, marginBottom: 0 }}>
          <OrbitalMenu
            items={orbitItems}
            ariaLabel={t("profile.actions_label")}
            toggleLabelOpen={t("profile.actions_label")}
            toggleLabelClose={t("buttons.close")}
            mobileVariant="stack"
            mobileBackItem={mobileBackItem}
            className="min-[48.0625em]:[--label-gap:0.95rem] min-[48.0625em]:[--label-gap-side:0.18rem]"
            onOpenChange={setOrbitOpen}
          />
        </div>
        {isAdminUser && !orbitOpen ? (
          <div className={orbitRoleToggleWrapClassName}>
            <Button
              variant="primary"
              className={orbitRoleToggleButtonClassName}
              onClick={() => {
                void handleAdminViewRoleChange(nextPreviewRole);
              }}
              disabled={roleSwitching}
              aria-label={nextPreviewRoleLabel}
            >
              <RoleToggleDockIcon className="h-[1.42rem] w-[1.42rem] shrink-0" />
              <span>{nextPreviewRoleLabel}</span>
            </Button>
          </div>
        ) : null}
      </div>

      {!orbitOpen && (
        <div className={profileNavOverlayClassName}>
          <BackButton onClick={handleBack} ariaLabel={t("profile.back_to_chat")} className={cn(profileBackButtonClassName, "pointer-events-auto")} />
          <div className={cn(profileLogoutWrapClassName, "max-[48em]:hidden")}>
            <button type="button" className={logoutButtonClassName} onClick={handleLogout} disabled={loggingOut} aria-label={t("profile.logout")}>
              <PowerExitIcon isLightTheme={isLightTheme} className={logoutIconClassName} />
              <span className={logoutLabelClassName}>{t("profile.logout_short")}</span>
              <span className="sr-only">{t("profile.logout")}</span>
            </button>
          </div>
          <div className={profileMobileActionStackClassName}>
            {isAdminUser ? (
              <Button
                variant="linkBrand"
                className={profileMobileRoleToggleLinkClassName}
                onClick={() => {
                  void handleAdminViewRoleChange(nextPreviewRole);
                }}
                disabled={roleSwitching}
                aria-label={nextPreviewRoleLabel}
              >
                <RoleToggleDockIcon className="h-[1.04rem] w-[1.04rem] shrink-0" />
                <span>{nextPreviewRoleLabel}</span>
              </Button>
            ) : null}
            <button type="button" className={logoutButtonClassName} onClick={handleLogout} disabled={loggingOut} aria-label={t("profile.logout")}>
              <PowerExitIcon isLightTheme={isLightTheme} className={logoutIconClassName} />
              <span className={logoutLabelClassName}>{t("profile.logout_short")}</span>
              <span className="sr-only">{t("profile.logout")}</span>
            </button>
          </div>
        </div>
      )}

      <div ref={profileFormRef}>

        {error && !showDelete && <div role="alert" className={cn(noteClassName, noteRowClassName)}>
            {error}
          </div>}
      </div>

      {showAccountSettings ? (
        <Modal
          open
          variant="glass"
          onClose={() => {
            if (loggingOut || loggingOutEverywhere || deleting) return;
            setShowAccountSettings(false);
          }}
          closeOnOverlayClick={!loggingOut && !loggingOutEverywhere && !deleting}
          aria-label={t("profile.account_settings")}
          className={accountModalOverlayClassName}
          contentClassName={accountModalContentClassName}
        >
          <div className={accountModalHeadClassName}>
            <BackButton
              onClick={() => {
                if (loggingOut || loggingOutEverywhere || deleting) return;
                setShowAccountSettings(false);
              }}
              ariaLabel={t("buttons.back")}
              holdPressedVisualDisabled
              className={accountModalBackButtonClassName}
            />
            <div className={accountModalTitleWrapClassName}>
              <h2 className={accountModalTitleClassName}>{t("profile.account_settings")}</h2>
              <p className={accountModalDescriptionClassName}>{t("profile.account_settings_hint")}</p>
            </div>
          </div>
          <div className={accountModalActionStackClassName}>
            <section className={accountModalCardClassName}>
              <div className={accountModalActionRowClassName}>
                <div className={accountModalActionLabelClassName}>{t("profile.logout")}</div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className={accountModalButtonClassName}
                  onClick={async () => {
                    setShowAccountSettings(false);
                    await handleLogout();
                  }}
                  disabled={loggingOut || loggingOutEverywhere || deleting}
                >
                  {t("profile.logout")}
                </Button>
              </div>
              <p className={accountModalNoteClassName}>{t("profile.logout_hint")}</p>
            </section>
            <section className={accountModalCardClassName}>
              <div className={accountModalActionRowClassName}>
                <div className={accountModalActionLabelClassName}>{t("profile.logout_all_devices")}</div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className={accountModalButtonClassName}
                  onClick={() => {
                    setShowAccountSettings(false);
                    setError("");
                    setShowLogoutAll(true);
                  }}
                  disabled={loggingOut || loggingOutEverywhere || deleting}
                >
                  {t("profile.logout_all_devices")}
                </Button>
              </div>
              <p className={accountModalNoteClassName}>{t("profile.logout_all_hint")}</p>
            </section>
            <section className={accountModalCardClassName}>
              <div className={accountModalActionRowClassName}>
                <div className={accountModalActionLabelClassName}>{t("profile.delete_account")}</div>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  className={accountModalButtonClassName}
                  onClick={() => {
                    setShowAccountSettings(false);
                    setError("");
                    setDeleting(false);
                    setDeletePin("");
                    setShowDelete(true);
                  }}
                  disabled={loggingOut || loggingOutEverywhere || deleting}
                >
                  <span>{t("profile.delete_account")}</span>
                </Button>
              </div>
              <p className={accountModalNoteClassName}>{t("profile.delete_account_hint")}</p>
            </section>
          </div>
        </Modal>
      ) : null}

      {showDelete && <ModalConfirm message={t("profile.delete_confirm")} confirmVariant="danger" confirmLabel={deleting ? t("profile.deleting") : t("profile.delete_account")} cancelLabel={t("buttons.cancel")} onConfirm={async () => {
      if (deleting) return;
      setError("");
      const normalizedDeletePin = deletePin.replace(/\D/g, "");
      if (!normalizedDeletePin) {
        setError(t("profile.errors.current_pin_required"));
        return;
      }
      setDeleting(true);
      try {
        const res = await fetch("/api/profile", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            currentPassword: normalizedDeletePin,
            locale
          })
        });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(resolveApiMessage({
            payload,
            t,
            fallbackKey: "profile.delete_failed"
          }));
          setDeleting(false);
          return;
        }
        setDeletePin("");
        setShowDelete(false);
        const signOutResult = await signOut({
          redirect: false,
          callbackUrl: localizePath("/", locale)
        });
        const redirectUrl = signOutResult?.url || localizePath("/", locale);
        window.location.href = redirectUrl;
      } catch (err) {
        console.error("profile DELETE", err);
        setError(t("profile.server_unreachable"));
        setDeleting(false);
      }
    }} onCancel={() => {
      if (deleting) return;
      setDeletePin("");
      setShowDelete(false);
    }} disabled={deleting}>
        <div className={modalInputWrapClassName}>
          <label htmlFor="delete-current-pin" className="sr-only">
            {t("profile.current_pin_label")}
          </label>
          <input
            id="delete-current-pin"
            name="delete-current-pin"
            type="password"
            autoComplete="current-password"
            inputMode="numeric"
            className={modalInputClassName}
            placeholder={t("profile.current_pin_label")}
            value={deletePin}
            onChange={(e) => setDeletePin(e.target.value.replace(/\D/g, "").slice(0, 8))}
            disabled={deleting}
            aria-describedby={error ? "profile-delete-error" : undefined}
          />
        </div>
        {error ? (
          <p id="profile-delete-error" role="alert" className={cn(noteClassName, "mt-1 text-center")}>
            {error}
          </p>
        ) : null}
    </ModalConfirm>}
      {showLogoutAll ? (
        <ModalConfirm
          message={t("profile.logout_all_confirm")}
          confirmLabel={loggingOutEverywhere ? t("profile.logging_out_all") : t("profile.logout_all_devices")}
          cancelLabel={t("buttons.cancel")}
          onConfirm={handleLogoutAll}
          onCancel={() => {
            if (loggingOutEverywhere) return;
            setShowLogoutAll(false);
          }}
          disabled={loggingOutEverywhere}
        />
      ) : null}
    </ProfileShell>;
}
