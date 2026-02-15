"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import LoginModal from "@/components/LoginModal";
import { useAccessibility } from "@/components/accessibility/AccessibilityProvider";
import ModalConfirm from "@/components/ui/ModalConfirm";
import { useI18n } from "@/components/i18n/I18nProvider";
import OrbitalMenu from "@/components/effects/Components/OrbitalMenu/OrbitalMenu";
import { localizePath } from "@/lib/localizePath";
import { pushWithTransition } from "@/lib/routeTransition";
import { cn } from "@/components/ui/cn";
import GlassRing from "@/components/ui/GlassRing";
import { clearStaleScrollLock } from "@/lib/scrollLock";
import BackButton from "@/components/ui/BackButton";
import BackIcon from "@/components/ui/icons/BackIcon";
import { PowerExitIcon } from "@/components/ui/icons/AuthIcons";
import { glassPageBackMobileBottomCenterClassName, glassPageBackRightClassName, glassPageShellCenteredClassName, glassPageTitleClassName } from "@/components/ui/glassPageStyles";
const ROLE_KEYS = {
  ADMIN: "role.admin",
  SOCIAL_WORKER: "role.worker",
  CLIENT: "role.client"
};
const pageShellClassName =
  `${glassPageShellCenteredClassName} max-md:py-0`;
const containerBaseClassName =
  "relative z-[21] flex flex-col items-stretch justify-start gap-[clamp(1.4rem,3.2vh,2.3rem)] " +
  "box-border text-[color:var(--glass-surface-text,#f2f2f2)] " +
  "[&>*:not(.profile-mask-layer):not(.profile-orbit-layer):not(.profile-nav-overlay)]:relative " +
  "[&>*:not(.profile-mask-layer):not(.profile-orbit-layer):not(.profile-nav-overlay)]:z-[1]";
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
  "min-[48.0625em]:[--orbit-item-size:clamp(4.35rem,8.4vw,5.4rem)] min-[48.0625em]:[--orbit-item-size-open:clamp(4.6rem,8.9vw,5.75rem)] " +
  "min-[48.0625em]:[--label-gap:0.95rem] min-[48.0625em]:[--label-gap-side:0.18rem] " +
  "[--orbit-size:clamp(17.4rem,35vw,23.8rem)] min-[48.0625em]:[--orbit-size:clamp(16.6rem,33vw,22.8rem)] [--orbit-center-size:clamp(9.4rem,17vw,11.8rem)] " +
  "min-[48.0625em]:[--orbit-center-size:clamp(8.2rem,15vw,10.4rem)] " +
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
const logoutButtonClassName =
  "group relative grid place-items-center h-[5.2rem] w-[5.2rem] max-[48em]:h-[5.7rem] max-[48em]:w-[5.7rem] rounded-full border-0 bg-transparent cursor-[var(--cursor-pointer)] pointer-events-auto focus-visible:outline-none";
const logoutIconClassName = "h-[4.2rem] w-[4.2rem] max-[48em]:h-[3.85rem] max-[48em]:w-[3.85rem] transform-gpu will-change-transform transition-transform duration-[260ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-[1.08] group-focus-visible:scale-[1.08] group-active:scale-[0.98]";
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
  "max-[48em]:z-[95]";
const noteClassName =
  "bg-transparent border-0 shadow-none text-[color:var(--glass-surface-text,#f2f2f2)] " +
  "px-[0.6rem] py-[0.2rem] text-center";
const noteRowClassName = "mt-[0.75rem]";
const noteCenterClassName = "w-[min(32rem,100%)] mx-auto";
const errorStateClassName = "flex-1 w-full flex items-center justify-center";
function ProfileShell({
  locale,
  children,
  role = "region",
  ariaLabelledby,
  innerRef,
  embedded = false,
  theme = "dark",
  orbitOpen = false,
  maskLayerRef
}) {
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
  ...props
}) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}>
      <path d="M15.8 3.7a8.7 8.7 0 1 0 4.5 14.6A7.9 7.9 0 0 1 15.8 3.7z" />
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
  const [_hasPassword, setHasPassword] = useState(!!initialProfile?.hasPassword);
  const [showDelete, setShowDelete] = useState(false);
  const [loading, setLoading] = useState(!initialProfile);
  const [loadFailed, setLoadFailed] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [orbitOpen, setOrbitOpen] = useState(false);
  useEffect(() => {
    clearStaleScrollLock();
  }, []);
  const searchParams = useSearchParams();
  const registrationReason = searchParams?.get("reason");
  const isAuthed = status === "authenticated" || !!session?.user;
  const isLightTheme = prefs?.theme === "light";
  const titleClassName = cn(
    embedded ? titleBaseClassName : glassPageTitleClassName,
    !embedded && "min-[48.0625em]:sr-only",
    "max-[48em]:!text-[clamp(2.24rem,8.8vw,2.9rem)]"
  );
  const headerCenterClassName = cn(
    headerCenterBaseClassName,
    !embedded && headerCenterPageClassName
  );
  const isLongRoleLabel = session?.user?.role === "SOCIAL_WORKER" || session?.user?.role === "CLIENT";
  const roleLabel = t(ROLE_KEYS[session?.user?.role] || "role.unknown");
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
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(() => {
        updateMask();
        startLoop();
      });
    };
    maskRefreshRef.current = scheduleUpdate;
    scheduleUpdate();
    const settleTimers = [0, 60, 160, 320, 600, 900, 1400].map(delay =>
      window.setTimeout(scheduleUpdate, delay)
    );
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
  const themeActionLabel = isLightTheme ? t("accessibility.options.theme.dark") : t("accessibility.options.theme.light");
  const orbitItems = [{
    key: "theme",
    icon: isLightTheme ? <ThemeMoonDockIcon width={26} height={26} /> : <ThemeSunDockIcon width={26} height={26} />,
    label: themeActionLabel,
    labelPos: "left",
    keepOpen: true,
    onClick: () => {
      const nextTheme = isLightTheme ? "dark" : "light";
      setPrefs?.({
        theme: nextTheme
      });
    }
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
    key: "delete",
    icon: <DeleteDockIcon />,
    label: t("profile.delete_account"),
    labelPos: "right",
    onClick: () => {
      setError("");
      setSuccess("");
      setDeleting(false);
      setShowDelete(true);
    }
  }, {
    key: "subscription",
    icon: <SubscriptionDockIcon />,
    label: t("profile.manage_subscription"),
    labelPos: "down",
    onClick: () => pushWithTransition(router, localizePath(`/tellimus${embedded ? "?return=profile" : ""}`, locale))
  }, {
    key: "preferences",
    icon: <PreferencesDockIcon />,
    label: t("profile.preferences.title"),
    labelPos: "down",
    onClick: () => openA11y?.()
  }];
  const handleBack = useCallback(() => {
    if (typeof onBack === "function") {
      onBack();
      return;
    }
    pushWithTransition(router, "/vestlus");
  }, [onBack, router]);
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
    setSuccess("");
    setLoggingOut(true);
    try {
      await signOut({
        callbackUrl: localizePath("/", locale)
      });
    } catch (err) {
      console.error("profile logout", err);
      setError(t("profile.server_unreachable"));
    } finally {
      setLoggingOut(false);
    }
  };
  useEffect(() => {
    if (embedded && !isActive) return;
    if (status === "loading") return;
    if (status !== "authenticated") {
      setLoading(false);
      setLoadFailed(false);
      return;
    }
    if (initialProfile) {
      setHasPassword(!!initialProfile.hasPassword);
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
        setHasPassword(!!payload?.user?.hasPassword);
      } catch (err) {
        console.error("profile GET", err);
        setError(t("profile.server_unreachable"));
        setLoadFailed(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [embedded, initialProfile, isActive, status, t]);
  if (isAuthed && (status === "loading" && !initialProfile || loading)) {
    return <ProfileShell locale={locale} embedded={embedded} theme={isLightTheme ? "light" : "dark"}>
        <h1 className={titleClassName}>{t("profile.title")}</h1>
      </ProfileShell>;
  }
  if (!isAuthed) {
    const reason = registrationReason || "not-logged-in";
    const reasonText = reason === "no-sub" ? t("profile.login_to_manage_sub") : t("profile.login_to_view");
    return <>
        <ProfileShell locale={locale} embedded={embedded} theme={isLightTheme ? "light" : "dark"}>
          <h1 className={titleClassName}>{t("profile.title")}</h1>
          <p className={noteClassName}>{reasonText}</p>
          <BackButton onClick={embedded ? handleBack : () => setLoginOpen(true)} ariaLabel={embedded ? t("profile.back_to_chat") : t("auth.login.title")} className={profileBackButtonClassName} />
        </ProfileShell>

        <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      </>;
  }
  if (loadFailed) {
    return <ProfileShell locale={locale} ariaLabelledby="profile-title" embedded={embedded} theme={isLightTheme ? "light" : "dark"}>
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
  return <ProfileShell locale={locale} ariaLabelledby="profile-title" innerRef={profileContainerRef} embedded={embedded} theme={isLightTheme ? "light" : "dark"} orbitOpen={orbitOpen} maskLayerRef={maskLayerRef}>
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
      </div>

      {!orbitOpen && (
        <div className={profileNavOverlayClassName}>
          <BackButton onClick={handleBack} ariaLabel={t("profile.back_to_chat")} className={cn(profileBackButtonClassName, "pointer-events-auto")} />
          <div className={profileLogoutWrapClassName}>
            <button type="button" className={logoutButtonClassName} onClick={handleLogout} disabled={loggingOut} aria-label={t("profile.logout")}>
              <PowerExitIcon isLightTheme={isLightTheme} className={logoutIconClassName} />
              <span className={logoutLabelClassName}>{t("profile.logout_short")}</span>
              <span className="sr-only">{t("profile.logout")}</span>
            </button>
          </div>
        </div>
      )}

      <div ref={profileFormRef}>

        {error && <div role="alert" className={cn(noteClassName, noteRowClassName)}>
            {error}
          </div>}

        {success && !error && <div role="status" className={cn(noteClassName, noteRowClassName)}>
            {success}
          </div>}
      </div>

      {showDelete && <ModalConfirm message={t("profile.delete_confirm")} confirmLabel={deleting ? t("profile.deleting") : t("profile.delete_account")} cancelLabel={t("buttons.cancel")} onConfirm={async () => {
      if (deleting) return;
      setError("");
      setSuccess("");
      setDeleting(true);
      try {
        const res = await fetch("/api/profile", {
          method: "DELETE"
        });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(payload?.error || payload?.message || t("profile.delete_failed"));
          setDeleting(false);
          return;
        }
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
      setShowDelete(false);
    }} disabled={deleting} />}
    </ProfileShell>;
}
