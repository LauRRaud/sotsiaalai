"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { flushSync } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useAccessibility } from "@/components/accessibility/AccessibilityProvider";
import { useI18n } from "@/components/i18n/I18nProvider";
import { resolveApiMessage } from "@/lib/i18n/resolveApiMessage";
import { localizePath } from "@/lib/localizePath";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import AppLink from "@/components/ui/Link";
import FancyCheckbox from "@/components/ui/FancyCheckbox";
import { glassFormInputBaseClassName } from "@/components/ui/glassPageStyles";
import { EmailEnvelopeStatusIcon, LockErrorIcon, SubmitArrowIcon } from "@/components/ui/icons/AuthIcons";
import { linkBrandInlineClass } from "@/components/ui/linkStyles";
const noteBaseClassName = "flex items-center justify-center text-center text-[1.06em] max-md:text-[1.12em]";
const noteErrorClassName = "text-[#fca5a5] light:text-[#b44a4a]";
const noteInfoClassName = "text-[color:var(--pt-120)]";
const inlineLinkClassName = `${linkBrandInlineClass} text-[1.35rem] max-md:text-[1.55rem] [--link-brand-text:#c57171] [--link-brand-border-hover:#c57171] [--link-brand-shadow-hover:rgba(197,113,113,0.35)] light:[--link-color:#7A3A38] [--link-brand-shadow-hover:transparent]`;
const homeLikeOtpLinkClassName = `${linkBrandInlineClass} home-link inline-flex w-fit flex-none items-center justify-center whitespace-nowrap text-[clamp(1.2rem,1.72vw,1.42rem)] tracking-[0.01em] leading-[1.1] text-center font-medium text-[color:var(--home-link-color,var(--brand-primary))] [--link-brand-text:var(--home-link-color,var(--brand-primary))] [--link-brand-border-hover:var(--home-link-color,var(--brand-primary))] [--link-brand-shadow-hover:rgba(197,113,113,0.35)]`;
const helpPopoverLinkClassName = `${linkBrandInlineClass} mt-[0.58rem] self-start text-[1.16rem] font-[500] no-underline whitespace-nowrap [--link-brand-shadow-hover:transparent]`;
const otpSubmitButtonClassName =
  "login-otp-submit !min-w-[clamp(8.6rem,20vw,10.6rem)] !min-h-[3.2rem] !px-[1.35rem] !py-[0.8rem] !text-[1.22rem] !leading-[1.08] " +
  "max-[768px]:!min-w-[clamp(8.4rem,36vw,10.2rem)] max-[768px]:!min-h-[3.48rem] max-[768px]:!px-[1.15rem] max-[768px]:!py-[0.9rem] max-[768px]:!text-[1.5rem]";
const otpSubmitLabelClassName = "inline-flex items-center justify-center text-center leading-[1.06] tracking-[0.01em]";
const helpPopoverClassName =
  "login-help-popover chat-tools-surface-popover absolute left-1/2 -translate-x-1/2 bottom-[calc(var(--pin-btn)+0.72rem)] " +
  "rounded-[16px] px-[0.95rem] pt-[0.72rem] pb-[0.68rem] z-30 border border-[color:var(--subpage-card-border)] [background:var(--subpage-card-bg)] text-[color:var(--subpage-card-text)] shadow-[var(--subpage-card-shadow)] backdrop-blur-[16px] backdrop-saturate-[120%]";
const modalTitleClassName = "login-modal-title !mb-0 !mt-0 !text-[clamp(1.78rem,1.18rem+1.15vw,2.18rem)] !leading-[1.05] tracking-[0.01em] translate-y-[0.04rem] max-md:!text-[clamp(2.18rem,9vw,3rem)] max-md:!leading-[1.03] max-md:translate-y-[0.26rem] text-[#c57171] light:text-[#7a3a38] [font-family:var(--font-aino-headline),var(--font-aino),Arial,sans-serif] font-[400]";
const otpModalTitleClassName =
  "!text-[clamp(1.34rem,0.95rem+0.72vw,1.72rem)] !leading-[1.08] whitespace-normal text-center max-w-[12ch] mx-auto max-md:!text-[clamp(1.36rem,5.2vw,1.72rem)] max-md:!leading-[1.06]";
const otpTextClassName = "text-[color:var(--otp-copy-text)]";
const otpInfoTextClassName = "text-[color:var(--otp-copy-strong)]";
const subpageFieldInputClassName =
  `${glassFormInputBaseClassName} text-[1.28rem] tracking-[0.02em] placeholder:text-[1.12rem] placeholder:tracking-[0.02em] ` +
  "duration-[720ms] max-[768px]:text-[1.34rem] max-[768px]:tracking-[0.024em] max-[768px]:placeholder:text-[1.2rem] max-[768px]:placeholder:tracking-[0.022em] max-[768px]:min-h-[3.2rem] max-[768px]:py-[0.84rem]";
const MODAL_FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])"
].join(", ");
function focusElementWithoutScroll(element) {
  if (!element?.focus) return;
  try {
    element.focus({ preventScroll: true });
  } catch {
    element.focus();
  }
}

function resetInputHorizontalScroll(element) {
  if (!element) return;
  const reset = () => {
    try {
      element.scrollLeft = 0;
    } catch {}
  };
  reset();
  if (typeof window !== "undefined") {
    window.requestAnimationFrame(reset);
  }
}

function renderOtpTitle(title) {
  const parts = String(title || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length < 2) return title;
  const splitIndex = Math.ceil(parts.length / 2);
  return <>
      <span className="block">{parts.slice(0, splitIndex).join(" ")}</span>
      <span className="block">{parts.slice(splitIndex).join(" ")}</span>
    </>;
}

function SubmitInnerEdgeDotsProgress({
  filled = 0,
  max = 8,
  isLightTheme = false,
  isError = false,
  className = ""
}) {
  const safeMax = Math.max(1, max);
  const clamped = Math.max(0, Math.min(safeMax, filled));
  const dotColor = isError ? "#dc2626" : isLightTheme ? "#7A3A38" : "#c57171";
  const glowColor = isError
    ? "rgba(220,38,38,0.38)"
    : isLightTheme
      ? "rgba(122,58,56,0.24)"
      : "rgba(197,113,113,0.3)";
  return <span
    aria-hidden="true"
    className={className}
    style={{
      "--submit-dot-size": "clamp(0.22rem,calc(var(--pin-btn)*0.07),0.34rem)",
      "--submit-dot-radius": "calc(var(--pin-btn)*0.4)"
    }}
  >
      {Array.from({
      length: safeMax
    }).map((_, index) => {
      const isActive = index < clamped;
      const startAngle = 0;
      const angle = startAngle + 360 / safeMax * index;
      return <span
        key={index}
        className="absolute left-1/2 top-1/2 rounded-full"
        style={{
          width: "var(--submit-dot-size)",
          height: "var(--submit-dot-size)",
          backgroundColor: dotColor,
          opacity: isActive ? 0.95 : 0,
          transform: `translate(-50%,-50%) rotate(${angle}deg) translateY(calc(var(--submit-dot-radius)*-1)) scale(${isActive ? 1 : 0.74})`,
          boxShadow: isActive ? `0 0 0.32rem ${glowColor}` : "none",
          transition: "opacity 180ms ease, transform 220ms cubic-bezier(0.22,0.61,0.36,1), background-color 180ms ease"
        }}
      />;
    })}
    </span>;
}
export default function LoginModal({
  open,
  onClose,
  suppressRedirect = false,
  onAuthSuccess,
  prefillStoredEmail = true
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    status,
    data: session
  } = useSession();
  const {
    t,
    locale
  } = useI18n();
  const resolveAuthApiMessage = useCallback((payload, fallbackKey = "auth.login.error.generic") => resolveApiMessage({
    payload,
    t,
    fallbackKey,
    fallbackText: t(fallbackKey)
  }), [t]);
  const {
    prefs
  } = useAccessibility();
  const defaultNextUrl = localizePath("/vestlus", locale);
  const toRelative = u => {
    try {
      const base = typeof window !== "undefined" ? window.location.origin : "http://local";
      const url = new URL(u, base);
      return `${url.pathname}${url.search}${url.hash}`;
    } catch {
      return typeof u === "string" ? u : defaultNextUrl;
    }
  };
  const nextUrl = toRelative(searchParams?.get("next") || defaultNextUrl);
  const resetRequestPath = useMemo(() => {
    const raw = String(t("routes.password_reset_path") || "").trim();
    const base = raw.startsWith("/") ? raw : "/taasta-parool";
    return localizePath(base || "/taasta-parool", locale);
  }, [locale, t]);
  const PIN_MIN = 4;
  const PIN_MAX = 8;
  const LOGIN_EMAIL_KEY = "sotsiaalai:lastLoginEmail";
  const LOGIN_KEYPAD_LAYOUT_KEY = "sotsiaalai:login:keypadLayout";
  const LOGIN_NATIVE_KEYBOARD_KEY = "sotsiaalai:login:useNativeKeyboard";
  const isMobile = useMemo(() => {
    if (typeof window === "undefined") return false;
    const ua = navigator.userAgent || "";
    return /Android|iPhone|iPad|iPod/i.test(ua);
  }, []);
  const isAndroidPlatform = useMemo(() => {
    if (typeof window === "undefined") return false;
    const flaggedPlatform =
      document.documentElement?.getAttribute("data-platform") ||
      document.body?.getAttribute("data-platform") ||
      "";
    if (flaggedPlatform === "android") return true;
    return /Android/i.test(navigator.userAgent || "");
  }, []);
  const [isPhoneViewport, setIsPhoneViewport] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window === "undefined" ? 1440 : window.innerWidth || 1440
  );
  const [viewportHeight, setViewportHeight] = useState(() =>
    typeof window === "undefined" ? 900 : window.innerHeight || 900
  );
  const [step, setStep] = useState("pin");
  const [pinValue, setPinValue] = useState("");
  const [_pinError, setPinError] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [tempToken, setTempToken] = useState("");
  const [emailMask, setEmailMask] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [rememberDevice, setRememberDevice] = useState(true);
  const [deviceName, setDeviceName] = useState("");
  const [otpExpiresAt, setOtpExpiresAt] = useState(null);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [submitIconState, setSubmitIconState] = useState("idle");
  const [_invalidCredentials, setInvalidCredentials] = useState(false);
  const [emailRevealed, setEmailRevealed] = useState(false);
  const [storedEmail, setStoredEmail] = useState("");
  const [emailValue, setEmailValue] = useState("");
  const [emailErrorVisual, setEmailErrorVisual] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const helpButtonRef = useRef(null);
  const helpPopoverRef = useRef(null);
  const [useNativeKeyboard, setUseNativeKeyboard] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const v = window.localStorage.getItem(LOGIN_NATIVE_KEYBOARD_KEY);
      if (v === "true") return true;
      if (v === "false") return false;
    } catch {}
    return false;
  });
  const [keypadLayout, setKeypadLayout] = useState(() => {
    if (typeof window === "undefined") return "phone";
    try {
      const v = window.localStorage.getItem(LOGIN_KEYPAD_LAYOUT_KEY);
      if (v === "numpad" || v === "phone") return v;
    } catch {}
    return "phone";
  });
  const boxRef = useRef(null);
  const shellRef = useRef(null);
  const emailInputRef = useRef(null);
  const emailIconButtonRef = useRef(null);
  const hiddenInputRef = useRef(null);
  const mobilePinInputRef = useRef(null);
  const keypadRefs = useRef([]);
  const emailHintIdRef = useRef(`login-email-hint-${Math.random().toString(36).slice(2, 10)}`);
  const pinHintIdRef = useRef(`login-pin-hint-${Math.random().toString(36).slice(2, 10)}`);
  const otpInputRef = useRef(null);
  const touchStartRef = useRef(null);
  const suppressNativeBlurSubmitRef = useRef(false);
  const zeroLongPressTimerRef = useRef(null);
  const zeroLongPressFiredRef = useRef(false);
  const timeoutIdsRef = useRef(new Set());
  const registerTimeout = useCallback((callback, delay = 0) => {
    if (typeof window === "undefined") return null;
    const timeoutId = window.setTimeout(() => {
      timeoutIdsRef.current.delete(timeoutId);
      callback();
    }, delay);
    timeoutIdsRef.current.add(timeoutId);
    return timeoutId;
  }, []);
  const clearRegisteredTimeout = useCallback(timeoutId => {
    if (timeoutId == null || typeof window === "undefined") return;
    window.clearTimeout(timeoutId);
    timeoutIdsRef.current.delete(timeoutId);
  }, []);
  const [zeroKeyMode, setZeroKeyMode] = useState("digit");
  const isOtpStep = step === "otp";
  const hasMessage = Boolean(error || info && !isOtpStep);
  const messageText = error ? error : info && !isOtpStep ? info : "";
  const showHeaderMessage = false;
  const showPinMessage = !isOtpStep && hasMessage;
  const otpInlineError = isOtpStep && error ? error : "";
  const managedByExternalAuthSuccess =
    suppressRedirect && typeof onAuthSuccess === "function";
  const isMidTheme = prefs?.theme === "mid";
  const isNightTheme = prefs?.theme === "night";
  const isMonoTheme = prefs?.theme === "mono";
  const isLightTheme = prefs?.theme === "light" || prefs?.theme === "mid";
  const pinMessageClass = [noteBaseClassName, "w-[var(--pin-grid-w)] max-w-full min-h-0 max-md:min-h-[0.38em] leading-[1.2]", "mt-[-0.08rem] max-md:mt-[0rem]", "mb-[-0.08rem] max-md:mb-[0rem]", showPinMessage ? "opacity-100" : "opacity-0", error ? noteErrorClassName : noteInfoClassName].filter(Boolean).join(" ");
  const headerWrapClass = ["flex", "flex-col", "items-center", "text-center", isAndroidPlatform ? "gap-[0.12rem] mt-[0.14rem] max-md:mt-[0.28rem]" : "gap-[0.02em] mt-[0.08rem] max-md:mt-[0.18rem]", "mb-0"].join(" ");
  const emailRowClass = [
    "flex",
    "w-full",
    "justify-center",
    "items-center",
    "min-h-[var(--login-envelope-hit)]",
    isAndroidPlatform
      ? "mt-[-0.12rem] max-md:mt-[-0.06rem] mb-[-0.06rem] max-md:mb-[0rem]"
      : "mt-[-0.34rem] max-md:mt-[-0.18rem] mb-[-0.08rem] max-md:mb-[-0.02rem]"
  ].join(" ");
  const emailIconClass = "login-email-icon-btn inline-flex items-center justify-center rounded-full bg-transparent bg-no-repeat bg-center transition-transform duration-150 ease-out cursor-pointer border-0 shadow-none outline-none appearance-none focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-none";
  const headerMessageClass = [noteBaseClassName, "min-h-[1.4em] max-md:min-h-[1.6em] max-md:mt-[0.25rem]", error ? noteErrorClassName : noteInfoClassName, showHeaderMessage ? "" : "hidden"].filter(Boolean).join(" ");
  const loginPinFormClassName = ["w-full", "max-w-full", "mx-auto", "flex", "flex-col", "items-center", isAndroidPlatform ? "gap-[0.36em] mt-[-0.04rem] max-md:gap-[0.44em] max-md:mt-[0.04rem]" : "gap-[0.18em] mt-[-0.34rem] max-md:gap-[0.24em] max-md:mt-[-0.14rem]"].join(" ");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const query = window.matchMedia("(max-width: 768px)");
    const apply = () => setIsPhoneViewport(query.matches);
    apply();
    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", apply);
      return () => query.removeEventListener("change", apply);
    }
    query.addListener(apply);
    return () => query.removeListener(apply);
  }, []);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const updateViewportSize = () => {
      const nextWidth = window.innerWidth || 0;
      const nextHeight = window.innerHeight || 0;
      setViewportWidth(prev => (prev === nextWidth ? prev : nextWidth));
      setViewportHeight(prev => (prev === nextHeight ? prev : nextHeight));
    };
    updateViewportSize();
    window.addEventListener("resize", updateViewportSize);
    return () => window.removeEventListener("resize", updateViewportSize);
  }, []);
  useEffect(() => {
    const timeoutIds = timeoutIdsRef.current;
    return () => {
      timeoutIds.forEach(timeoutId => {
        window.clearTimeout(timeoutId);
      });
      timeoutIds.clear();
    };
  }, []);
  const modalClasses = [
    "login-modal-root",
    "login-modal-box",
    "compact-modal",
    isOtpStep ? "login-modal--otp" : "",
    "[--login-modal-side-pad:1.15em]",
    "[--login-modal-min-extra:3.4rem]",
    "[--login-modal-max-extra:4rem]",
    "[--login-modal-max-vw:90vw]",
    isOtpStep
      ? "[--otp-panel-bg:rgba(10,14,24,0.58)] [--otp-panel-border:rgba(148,163,184,0.35)] [--otp-panel-shadow:0_12px_26px_rgba(0,0,0,0.28)] [--otp-input-bg:rgba(8,12,20,0.62)] [--otp-input-border:rgba(160,180,205,0.4)] [--otp-accent:rgba(225,160,160,0.92)] light:[--otp-panel-bg:rgba(255,255,255,0.76)] light:[--otp-panel-border:rgba(148,163,184,0.3)] light:[--otp-panel-shadow:0_12px_24px_rgba(15,23,42,0.12)] light:[--otp-input-bg:rgba(255,255,255,0.9)] light:[--otp-input-border:rgba(148,163,184,0.48)]"
      : "",
    "fixed",
    isPhoneViewport ? "inset-0 top-0 left-0 right-0 mx-0 my-0 translate-y-0" : "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
    "z-[100]",
    "flex",
    "flex-col",
    isPhoneViewport
      ? "w-full h-full min-h-full max-h-full items-center justify-center pt-[calc(env(safe-area-inset-top,0px)+0.4rem)] pb-[calc(env(safe-area-inset-bottom,0px)+0.4rem)]"
      : "w-auto h-auto min-h-0 max-h-[calc(100dvh-2rem)]",
    isPhoneViewport ? "overflow-hidden" : "overflow-visible max-md:max-h-[calc(100dvh-0.9rem)]",
    "gap-0",
    "!rounded-[2.2rem]",
    "pt-[0.1em]",
    "pb-[0.7em]",
    "max-md:pt-[0.02em]",
    isOtpStep ? "max-md:pb-[0.28em]" : "max-md:pb-[0.12em]",
    "px-[var(--login-modal-inner-side-pad,var(--login-modal-side-pad))]"
  ].filter(Boolean).join(" ");
  const keypadKeysPhone = useMemo(() => ["1", "2", "3", "4", "5", "6", "7", "8", "9", "help", "zero", "submit"], []);
  const keypadKeysNumpad = useMemo(() => ["7", "8", "9", "4", "5", "6", "1", "2", "3", "help", "zero", "submit"], []);
  const keypadKeys = useMemo(() => {
    if (isMobile) return keypadKeysPhone;
    return keypadLayout === "numpad" ? keypadKeysNumpad : keypadKeysPhone;
  }, [isMobile, keypadLayout, keypadKeysNumpad, keypadKeysPhone]);
  const otpDeadlineLabel = useMemo(() => {
    if (!otpExpiresAt) return "";
    try {
      return new Intl.DateTimeFormat(locale, {
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date(otpExpiresAt));
    } catch {
      return "";
    }
  }, [otpExpiresAt, locale]);
  const otpInputDescribedBy = [otpDeadlineLabel ? "otp-deadline" : null, otpInlineError ? "otp-inline-error" : null].filter(Boolean).join(" ") || undefined;
  useEffect(() => {
    if (!open) {
      setHelpOpen(false);
      return;
    }
    if (step !== "pin") setHelpOpen(false);
  }, [open, step]);
  useEffect(() => {
    const root = document.documentElement;
    document.body.classList.toggle("login-modal-open", open);
    root.classList.toggle("login-modal-open", open);
    return () => {
      document.body.classList.remove("login-modal-open");
      root.classList.remove("login-modal-open");
    };
  }, [open]);
  useEffect(() => {
    if (typeof document === "undefined" || !open) return;
    const main = document.getElementById("main");
    const bg = document.querySelector("[data-bg-layer]");
    const modal = boxRef.current;
    const prevMainAriaHidden = main?.getAttribute("aria-hidden") ?? null;
    const prevMainInert = main ? Boolean(main.inert) : false;
    const prevBgAriaHidden = bg?.getAttribute("aria-hidden") ?? null;
    if (main) {
      const active = document.activeElement;
      if (active instanceof HTMLElement && main.contains(active) && modal instanceof HTMLElement) {
        try {
          modal.focus({
            preventScroll: true
          });
        } catch {
          try {
            modal.focus();
          } catch {}
        }
        if (document.activeElement === active) {
          try {
            active.blur();
          } catch {}
        }
      }
      main.setAttribute("aria-hidden", "true");
      main.inert = true;
    }
    if (bg) {
      bg.setAttribute("aria-hidden", "true");
    }
    return () => {
      if (main) {
        if (prevMainAriaHidden == null) {
          main.removeAttribute("aria-hidden");
        } else {
          main.setAttribute("aria-hidden", prevMainAriaHidden);
        }
        main.inert = prevMainInert;
      }
      if (bg) {
        if (prevBgAriaHidden == null) {
          bg.removeAttribute("aria-hidden");
        } else {
          bg.setAttribute("aria-hidden", prevBgAriaHidden);
        }
      }
    };
  }, [open]);
  useEffect(() => {
    if (pinLoading) setHelpOpen(false);
  }, [pinLoading]);
  useEffect(() => {
    if (!helpOpen) return;
    const onPointerDown = e => {
      const pop = helpPopoverRef.current;
      const btn = helpButtonRef.current;
      if (pop && pop.contains(e.target)) return;
      if (btn && btn.contains(e.target)) return;
      setHelpOpen(false);
    };
    const onKeyDown = e => {
      if (e.key === "Escape") setHelpOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [helpOpen]);
  useEffect(() => {
    if (!open) return;
    const onKeyDown = e => {
      if (e.key !== "Escape") return;
      if (helpOpen) return;
      e.preventDefault();
      onClose?.();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [helpOpen, onClose, open]);
  const getModalFocusableElements = useCallback(() => {
    const modal = boxRef.current;
    if (!modal) return [];
    const elements = Array.from(modal.querySelectorAll(MODAL_FOCUSABLE_SELECTOR));
    return elements.filter(el => {
      if (!(el instanceof HTMLElement)) return false;
      if (el.getAttribute("aria-hidden") === "true") return false;
      if (el.hasAttribute("inert")) return false;
      const style = window.getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden") return false;
      return true;
    });
  }, []);
  useEffect(() => {
    if (!open) return;
    const onKeyDown = e => {
      if (e.key !== "Tab") return;
      const modal = boxRef.current;
      if (!modal) return;
      const focusable = getModalFocusableElements();
      if (focusable.length === 0) {
        e.preventDefault();
        modal.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (!modal.contains(active)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
        return;
      }
      if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
        return;
      }
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [getModalFocusableElements, open]);
  const resetIconState = useCallback(() => {
    setSubmitIconState("idle");
    setInvalidCredentials(false);
  }, []);
  const markPinError = useCallback(() => {
    setSubmitIconState("error");
  }, []);
  const markPinSuccess = useCallback(() => {
    setSubmitIconState("success");
  }, []);
  const rememberKnownEmail = useCallback(email => {
    if (!prefillStoredEmail) {
      setStoredEmail("");
      setEmailValue("");
      return;
    }
    try {
      window.localStorage.setItem(LOGIN_EMAIL_KEY, email);
    } catch {}
    setStoredEmail(email);
    setEmailValue(email);
  }, [prefillStoredEmail]);
  const focusKeypadIndex = idx => {
    const list = keypadRefs.current || [];
    const el = list[idx];
    if (el && typeof el.focus === "function") {
      el.focus();
      return true;
    }
    return false;
  };
  const handleKeypadKeyDown = (e, idx) => {
    const cols = 3;
    const total = keypadKeys.length;
    const rows = Math.ceil(total / cols);
    const row = Math.floor(idx / cols);
    const col = idx % cols;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const start = row * cols;
      const end = start + cols - 1;
      const next = idx === end ? start : idx + 1;
      focusKeypadIndex(Math.min(next, total - 1));
      return;
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      const start = row * cols;
      const end = start + cols - 1;
      const next = idx === start ? end : idx - 1;
      focusKeypadIndex(Math.min(next, total - 1));
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const newRow = (row + 1) % rows;
      const next = newRow * cols + col;
      focusKeypadIndex(Math.min(next, total - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const newRow = (row - 1 + rows) % rows;
      const next = newRow * cols + col;
      focusKeypadIndex(Math.min(next, total - 1));
    }
  };
  useEffect(() => {
    if (!open) return;
    if (status === "authenticated" && session) {
      if (managedByExternalAuthSuccess) return;
      onClose?.();
      if (!suppressRedirect) {
        router.replace(nextUrl);
        router.refresh();
      }
    }
  }, [
    open,
    status,
    session,
    nextUrl,
    router,
    onClose,
    suppressRedirect,
    managedByExternalAuthSuccess
  ]);
  useEffect(() => {
    if (open) return;
    setStep("pin");
    setPinValue("");
    setPinError(false);
    setTempToken("");
    setOtpValue("");
    setEmailRevealed(false);
    setStoredEmail("");
    setOtpExpiresAt(null);
    setRememberDevice(true);
    setDeviceName("");
    setEmailMask("");
    setError("");
    setInfo("");
    setPinLoading(false);
    setOtpLoading(false);
    setResendLoading(false);
    setEmailValue("");
    setEmailErrorVisual(false);
    setSubmitIconState("idle");
    setInvalidCredentials(false);
    setHelpOpen(false);
    setZeroKeyMode("digit");
  }, [open]);
  useEffect(() => {
    if (!open || isOtpStep) return;
    if (!prefillStoredEmail) {
      setStoredEmail("");
      setEmailValue("");
      setEmailRevealed(true);
      if (emailInputRef.current) emailInputRef.current.value = "";
      return;
    }
    try {
      const stored = window.localStorage.getItem(LOGIN_EMAIL_KEY) || "";
      const normalizedStored = String(stored || "").trim();
      setStoredEmail(stored);
      setEmailValue(stored);
      setEmailRevealed(!normalizedStored);
      if (emailInputRef.current) emailInputRef.current.value = stored;
    } catch {}
  }, [open, isOtpStep, prefillStoredEmail]);
  useEffect(() => {
    if (!open) return;
    if (step !== "pin") return;
    try {
      const savedLayout = window.localStorage.getItem(LOGIN_KEYPAD_LAYOUT_KEY);
      if (savedLayout === "phone" || savedLayout === "numpad") setKeypadLayout(savedLayout);
      const savedNative = window.localStorage.getItem(LOGIN_NATIVE_KEYBOARD_KEY);
      if (savedNative === "true" || savedNative === "false") {
        setUseNativeKeyboard(savedNative === "true");
      } else if (isMobile) {
        setUseNativeKeyboard(false);
      }
    } catch {
      if (isMobile) setUseNativeKeyboard(false);
    }
  }, [open, step, isMobile]);
  useEffect(() => {
    if (!open) return;
    try {
      window.localStorage.setItem(LOGIN_KEYPAD_LAYOUT_KEY, keypadLayout);
    } catch {}
  }, [open, keypadLayout]);
  useEffect(() => {
    if (!open) return;
    try {
      window.localStorage.setItem(LOGIN_NATIVE_KEYBOARD_KEY, String(useNativeKeyboard));
    } catch {}
  }, [open, useNativeKeyboard]);
  useEffect(() => {
    if (!open) return;
    if (isOtpStep) {
      registerTimeout(() => {
        focusElementWithoutScroll(boxRef.current);
        boxRef.current?.scrollTo?.({ top: 0, behavior: "auto" });
        boxRef.current
          ?.querySelector?.(".login-modal-shell")
          ?.scrollTo?.({ top: 0, behavior: "auto" });
        focusElementWithoutScroll(otpInputRef.current);
      }, 0);
      return;
    }
    if (!emailRevealed) {
      const target = emailIconButtonRef.current;
      if (target && typeof target.focus === "function") {
        registerTimeout(() => focusElementWithoutScroll(target), 0);
      }
      return;
    }
    const target = emailInputRef.current;
    if (target && typeof target.focus === "function") {
      registerTimeout(() => {
        focusElementWithoutScroll(target);
        resetInputHorizontalScroll(target);
      }, 0);
    }
  }, [open, isOtpStep, emailRevealed, registerTimeout]);
  const finishLogin = useCallback(async token => {
    if (!token) {
      markPinError();
      setError(t("auth.login.error.generic"));
      return false;
    }
    const login = await signIn("credentials", {
      temp_login_token: token,
      redirect: false,
      callbackUrl: nextUrl
    });
    if (login?.error) {
      markPinError();
      setError(t("auth.login.error.generic"));
      return false;
    }
    markPinSuccess();
    if (typeof onAuthSuccess === "function") {
      onAuthSuccess();
    }
    if (!managedByExternalAuthSuccess) {
      onClose?.();
    }
    if (!suppressRedirect) {
      router.replace(nextUrl);
      router.refresh();
    }
    return true;
  }, [
    markPinError,
    markPinSuccess,
    nextUrl,
    onAuthSuccess,
    onClose,
    router,
    suppressRedirect,
    t,
    managedByExternalAuthSuccess
  ]);
  const submitPinStep = useCallback(async () => {
    setError("");
    setInfo("");
    setPinError(false);
    setEmailErrorVisual(false);
    resetIconState();
    const emailInput = boxRef.current?.querySelector('input[name="email"]');
    const email = String(emailInput?.value || storedEmail || "").trim().toLowerCase();
    const pin = pinValue.replace(/\s+/g, "");
    if (!email) {
      markPinError();
      setPinValue("");
      setEmailErrorVisual(true);
      setError(t("auth.login.error.email_required"));
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      markPinError();
      setPinValue("");
      setEmailErrorVisual(true);
      setError(t("auth.login.error.email_invalid"));
      return;
    }
    if (!pin) {
      markPinError();
      setPinError(true);
      return;
    }
    if (!new RegExp(`^\\d{${PIN_MIN},${PIN_MAX}}$`).test(pin)) {
      markPinError();
      setError(t("auth.login.error.pin_invalid", {
        min: PIN_MIN,
        max: PIN_MAX
      }));
      return;
    }
    setPinLoading(true);
    setPinValue("");
    try {
      const res = await fetch("/api/auth/login-step1", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          pin,
          locale
        })
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        const code = String(payload?.code || "").toUpperCase();
        markPinError();
        if (code === "EMAIL_NOT_FOUND") {
          setEmailErrorVisual(true);
        }
        if (code === "PIN_INCORRECT" || code === "INVALID_CREDENTIALS") {
          rememberKnownEmail(email);
          setInvalidCredentials(true);
          setSubmitIconState("error");
        }
        setError(resolveAuthApiMessage(payload, "auth.login.error.generic"));
        return;
      }
      if (payload?.temp_login_token) setTempToken(payload.temp_login_token);
      if (payload?.status === "success" && payload?.temp_login_token) {
        rememberKnownEmail(email);
        markPinSuccess();
        await finishLogin(payload.temp_login_token);
        return;
      }
      if (payload?.status === "need_2fa" && payload?.temp_login_token) {
        rememberKnownEmail(email);
        markPinSuccess();
        setStep("otp");
        setOtpValue("");
        setEmailMask(payload.email_mask || email);
        setOtpExpiresAt(payload.otp_expires_at || null);
        setInfo(payload?.otp_reason === "trusted_device_expired" ? t("auth.login.otp_trusted_device_expired") : "");
        return;
      }
      markPinError();
      setError(resolveAuthApiMessage(payload, "auth.login.error.generic"));
    } catch (err) {
      console.error("login-step1 error", err);
      markPinError();
      setError(t("auth.login.error.generic"));
    } finally {
      setPinLoading(false);
    }
  }, [PIN_MAX, PIN_MIN, finishLogin, locale, markPinError, markPinSuccess, pinValue, rememberKnownEmail, resolveAuthApiMessage, resetIconState, storedEmail, t]);
  const handlePinInputChange = useCallback(e => {
    if (step !== "pin") return;
    const raw = typeof e?.target?.value === "string" ? e.target.value : "";
    const next = raw.replace(/\D/g, "").slice(0, PIN_MAX);
    setPinValue(next);
    resetIconState();
    setError("");
    setPinError(false);
  }, [PIN_MAX, resetIconState, step]);
  const onHiddenKeyDown = useCallback(e => {
    if (step !== "pin") return;
    const isPinFieldEvent = hiddenInputRef.current && e.target === hiddenInputRef.current;
    if (e.key === "Enter") {
      e.preventDefault();
      submitPinStep();
      return;
    }
    if (isPinFieldEvent) return;
    if (e.key === "Backspace") {
      e.preventDefault();
      setPinValue(p => p.slice(0, -1));
      resetIconState();
      setError("");
      setPinError(false);
      return;
    }
    if (/^\d$/.test(e.key)) {
      e.preventDefault();
      setPinValue(p => p.length >= PIN_MAX ? p : `${p}${e.key}`);
      resetIconState();
      setError("");
      setPinError(false);
    }
  }, [step, PIN_MAX, resetIconState, submitPinStep]);
  useEffect(() => {
    if (!open || step !== "pin") return;
    if (isMobile) return;
    const tid = registerTimeout(() => {
      if (!emailRevealed) return;
      const emailField = emailInputRef.current;
      if (emailField && document.activeElement === emailField) return;
      const hasEmail = emailField && emailField.value.trim().length > 0;
      if (hasEmail) hiddenInputRef.current?.focus?.();
    }, 0);
    const keyListener = e => {
      if (step !== "pin") return;
      const target = e.target;
      const tag = target?.tagName?.toLowerCase();
      const isEditable = tag === "input" || tag === "textarea" || target?.isContentEditable;
      const isHidden = hiddenInputRef.current && target === hiddenInputRef.current;
      if (isEditable && !isHidden) return;
      if (isHidden) return;
      onHiddenKeyDown(e);
    };
    window.addEventListener("keydown", keyListener);
    return () => {
      clearRegisteredTimeout(tid);
      window.removeEventListener("keydown", keyListener);
    };
  }, [clearRegisteredTimeout, emailRevealed, isMobile, onHiddenKeyDown, open, registerTimeout, step]);
  const appendDigit = digit => {
    if (step !== "pin") return;
    setPinValue(p => p.length >= PIN_MAX ? p : `${p}${digit}`);
    setError("");
    resetIconState();
    setPinError(false);
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(8);
      } catch {}
    }
  };
  const deleteOneDigit = useCallback((emitHaptic = false) => {
    if (step !== "pin") return;
    setPinValue(p => p.slice(0, -1));
    setError("");
    resetIconState();
    setPinError(false);
    if (emitHaptic && typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(6);
      } catch {}
    }
  }, [resetIconState, step]);
  const handleBackspace = useCallback(() => {
    deleteOneDigit(true);
  }, [deleteOneDigit]);
  const handleKeypadTouchStart = e => {
    if (step !== "pin") return;
    const t0 = e.touches && e.touches[0];
    if (!t0) return;
    touchStartRef.current = {
      x: t0.clientX,
      y: t0.clientY
    };
  };
  const handleKeypadTouchEnd = e => {
    if (step !== "pin") return;
    const start = touchStartRef.current;
    if (!start) return;
    const t1 = e.changedTouches && e.changedTouches[0] || null;
    if (!t1) return;
    const dx = t1.clientX - start.x;
    const dy = t1.clientY - start.y;
    if (dx < -30 && Math.abs(dy) < 25) {
      handleBackspace();
    }
    touchStartRef.current = null;
  };
  const stopZeroHoldActions = useCallback(() => {
    if (zeroLongPressTimerRef.current) {
      clearTimeout(zeroLongPressTimerRef.current);
      zeroLongPressTimerRef.current = null;
    }
  }, []);
  const startZeroLongPress = useCallback(() => {
    if (step !== "pin") return;
    zeroLongPressFiredRef.current = false;
    stopZeroHoldActions();
    zeroLongPressTimerRef.current = setTimeout(() => {
      zeroLongPressFiredRef.current = true;
      setZeroKeyMode("backspace");
      setPinValue("");
      setError("");
      resetIconState();
      setPinError(false);
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        try {
          navigator.vibrate(10);
        } catch {}
      }
    }, 430);
  }, [resetIconState, step, stopZeroHoldActions]);
  const cancelZeroLongPress = useCallback(() => {
    stopZeroHoldActions();
    setZeroKeyMode("digit");
  }, [stopZeroHoldActions]);
  useEffect(() => () => {
    stopZeroHoldActions();
  }, [stopZeroHoldActions]);
  const submitOtpStep = async () => {
    if (!tempToken) {
      setError(t("auth.login.error.generic"));
      return;
    }
    const rawOtp = String(otpInputRef.current?.value || otpValue || "");
    const cleanedOtp = rawOtp.replace(/\D/g, "").slice(0, 6);
    if (cleanedOtp !== otpValue) setOtpValue(cleanedOtp);
    if (!/^\d{6}$/.test(cleanedOtp)) {
      setError(t("auth.login.otp_invalid"));
      return;
    }
    setOtpLoading(true);
    setError("");
    setInfo("");
    try {
      const res = await fetch("/api/auth/login-step2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          temp_login_token: tempToken,
          otp_code: cleanedOtp,
          remember_device: rememberDevice,
          device_name: rememberDevice ? deviceName : "",
          locale
        })
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(resolveAuthApiMessage(payload, "auth.login.error.generic"));
        return;
      }
      if (payload?.status === "verified") {
        await finishLogin(payload?.temp_login_token || tempToken);
        return;
      }
      setError(resolveAuthApiMessage(payload, "auth.login.error.generic"));
    } catch (err) {
      console.error("login-step2 error", err);
      setError(t("auth.login.error.generic"));
    } finally {
      setOtpLoading(false);
    }
  };
  const handleResendOtp = async () => {
    if (!tempToken) return;
    setResendLoading(true);
    setError("");
    setInfo("");
    try {
      const res = await fetch("/api/auth/login-resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          temp_login_token: tempToken,
          locale
        })
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(resolveAuthApiMessage(payload, "auth.login.error.generic"));
        return;
      }
      setOtpExpiresAt(payload?.otp_expires_at || null);
      setInfo(t("auth.login.otp_resent", {
        email: payload?.email_mask || emailMask || ""
      }));
    } catch (err) {
      console.error("login-resend-otp error", err);
      setError(t("auth.login.error.generic"));
    } finally {
      setResendLoading(false);
    }
  };
  const resetToPinStep = () => {
    setStep("pin");
    setPinValue("");
    setOtpValue("");
    setTempToken("");
    setOtpExpiresAt(null);
    setInfo("");
    setError("");
    setRememberDevice(true);
    setZeroKeyMode("digit");
    resetIconState();
    setPinError(false);
  };
  const revealEmailInput = useCallback(() => {
    if (emailRevealed) return;
    setEmailRevealed(true);
    setError("");
    registerTimeout(() => {
      const node = emailInputRef.current;
      if (!node) return;
      if (!node.value && storedEmail) node.value = storedEmail;
      setEmailValue(node.value || "");
      node.focus();
      resetInputHorizontalScroll(node);
    }, 0);
  }, [emailRevealed, registerTimeout, storedEmail]);
  const focusMobilePinInput = useCallback(() => {
    if (!isMobile) return;
    const node = mobilePinInputRef.current;
    if (!node) return;
    const runFocus = () => {
      try {
        node.focus({
          preventScroll: true
        });
      } catch {
        try {
          node.focus();
        } catch {}
      }
      try {
        const len = (node.value || "").length;
        node.setSelectionRange?.(len, len);
      } catch {}
    };
    runFocus();
    requestAnimationFrame(runFocus);
    registerTimeout(runFocus, 80);
  }, [isMobile, registerTimeout]);
  const toggleKeypad = () => {
    if (isMobile) {
      const nextUseNativeKeyboard = !useNativeKeyboard;
      flushSync(() => setUseNativeKeyboard(nextUseNativeKeyboard));
      if (nextUseNativeKeyboard) {
        suppressNativeBlurSubmitRef.current = false;
        focusMobilePinInput();
      } else {
        try {
          suppressNativeBlurSubmitRef.current = true;
          mobilePinInputRef.current?.blur?.();
          registerTimeout(() => {
            suppressNativeBlurSubmitRef.current = false;
          }, 120);
        } catch {}
      }
      return;
    }
    setKeypadLayout(p => p === "phone" ? "numpad" : "phone");
  };
  const clearButtonFocus = useCallback(target => {
    if (!(target instanceof HTMLElement)) return;
    requestAnimationFrame(() => {
      try {
        target.blur();
      } catch {}
    });
  }, []);
  const clearPointerKeyFocus = useCallback(e => {
    clearButtonFocus(e?.currentTarget);
  }, [clearButtonFocus]);
  const triggerKeypadBounce = useCallback(target => {
    if (!(target instanceof HTMLElement)) return;
    target.classList.add("pin-keypad__button--bounce");
    target.style.animationName = "none";
    void target.offsetWidth;
    target.style.animationName = "";
  }, []);
  if (!open) return null;
  const isDarkKeypadTheme = !isLightTheme;
  const helpPopoverLinkStyle = isMidTheme
    ? {
        "--link-color": "#8a4b49",
        "--link-brand-text": "#8a4b49",
        "--link-brand-border-hover": "rgba(138,75,73,0.32)"
      }
    : isLightTheme
      ? {
          "--link-color": "#7A3A38",
          "--link-brand-text": "#7A3A38",
          "--link-brand-border-hover": "rgba(122,58,56,0.3)"
        }
      : {
          "--link-brand-text": "#c57171",
          "--link-brand-border-hover": "rgba(197,113,113,0.38)"
        };
  const pinKeyBackground = isLightTheme
    ? isMidTheme
      ? "radial-gradient(122% 122% at 26% 22%, rgba(255, 255, 255, 0.34) 0%, rgba(255, 255, 255, 0.15) 26%, rgba(255, 255, 255, 0.04) 46%, rgba(255, 255, 255, 0) 60%), radial-gradient(102% 102% at 76% 80%, rgba(164, 112, 104, 0.085) 0%, rgba(164, 112, 104, 0.03) 34%, rgba(164, 112, 104, 0) 62%), linear-gradient(155deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.11) 42%, rgba(255, 255, 255, 0.06) 100%), rgba(255, 255, 255, 0.085)"
      : "radial-gradient(120% 120% at 18% 16%, rgba(255, 255, 255, 0.995) 0%, rgba(255, 255, 255, 0.28) 62%), radial-gradient(120% 120% at 86% 90%, rgba(0, 0, 0, 0.045) 0%, rgba(0, 0, 0, 0) 64%), linear-gradient(145deg, rgba(255, 255, 255, 0.76) 0%, rgba(255, 255, 255, 0.5) 55%, rgba(255, 255, 255, 0.34) 100%)"
    : isMonoTheme
      ? "var(--forest-orbit-surface, radial-gradient(118% 102% at 50% 8%, rgba(62, 62, 62, 0.88) 0%, rgba(43, 43, 43, 0.9) 48%, rgba(25, 25, 25, 0.94) 100%), linear-gradient(180deg, rgba(52, 52, 52, 0.86) 0%, rgba(27, 27, 27, 0.96) 100%))"
    : isNightTheme
      ? "radial-gradient(138% 124% at 28% 18%, rgba(255, 255, 255, 0.095) 0%, rgba(220, 236, 255, 0.05) 20%, rgba(170, 206, 255, 0.018) 34%, rgba(170, 206, 255, 0) 56%), linear-gradient(168deg, rgba(72, 91, 118, 0.2) 0%, rgba(38, 48, 64, 0.16) 46%, rgba(16, 22, 32, 0.12) 100%), rgba(12, 18, 28, 0.18)"
      : "radial-gradient(136% 122% at 28% 18%, rgba(255, 255, 255, 0.08) 0%, rgba(232, 240, 255, 0.04) 20%, rgba(194, 214, 255, 0.014) 34%, rgba(194, 214, 255, 0) 56%), linear-gradient(168deg, rgba(68, 78, 98, 0.17) 0%, rgba(36, 42, 54, 0.135) 46%, rgba(14, 19, 26, 0.11) 100%), rgba(11, 15, 22, 0.16)";
  const pinKeyBoxShadow = isLightTheme
    ? isMidTheme
      ? "0 5px 10px rgba(42, 23, 20, 0.12), inset 0 0 0 1px rgba(255, 255, 255, 0.16)"
      : "0 5px 9px rgba(0, 0, 0, 0.09), 0 1px 1px rgba(15, 23, 42, 0.06), inset 0 0 0 var(--pin-border-w) rgba(255, 255, 255, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.7), inset 0 -1px 0 rgba(0, 0, 0, 0.09)"
    : isMonoTheme
      ? "0 5px 12px rgba(7, 7, 7, 0.26), inset 0 0 0 1px rgba(214, 214, 214, 0.13)"
    : isNightTheme
      ? "0 5px 12px rgba(4, 9, 18, 0.22), inset 0 0 0 1px rgba(198, 222, 255, 0.12)"
      : "0 5px 12px rgba(3, 8, 15, 0.2), inset 0 0 0 1px rgba(214, 228, 255, 0.1)";
  const pinGlossBackground = isLightTheme
    ? isMidTheme
      ? "linear-gradient(138deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.08) 22%, rgba(255, 255, 255, 0.018) 44%, rgba(255, 255, 255, 0) 66%, rgba(122, 58, 56, 0.045) 100%), radial-gradient(64% 58% at 32% 24%, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.04) 36%, rgba(255, 255, 255, 0) 72%)"
      : "linear-gradient(138deg, rgba(255, 255, 255, 0.38) 0%, rgba(255, 255, 255, 0.2) 22%, rgba(255, 255, 255, 0.07) 44%, rgba(255, 255, 255, 0) 66%, rgba(255, 255, 255, 0.04) 100%), radial-gradient(64% 58% at 32% 24%, rgba(255, 255, 255, 0.24) 0%, rgba(255, 255, 255, 0.1) 36%, rgba(255, 255, 255, 0) 72%)"
    : isMonoTheme
      ? "linear-gradient(145deg, rgba(230, 230, 230, 0.11) 0%, rgba(230, 230, 230, 0.042) 22%, rgba(230, 230, 230, 0.016) 38%, rgba(230, 230, 230, 0) 58%, rgba(120, 120, 120, 0.042) 100%)"
    : isNightTheme
      ? "linear-gradient(145deg, rgba(255, 255, 255, 0.14) 0%, rgba(222, 237, 255, 0.055) 22%, rgba(222, 237, 255, 0.018) 38%, rgba(222, 237, 255, 0) 58%, rgba(95, 146, 228, 0.05) 100%)"
      : "linear-gradient(145deg, rgba(255, 255, 255, 0.11) 0%, rgba(236, 244, 255, 0.042) 22%, rgba(236, 244, 255, 0.016) 38%, rgba(236, 244, 255, 0) 58%, rgba(150, 188, 244, 0.042) 100%)";
  const pinGlossOpacityBase = isLightTheme ? isMidTheme ? "0.075" : "0.13" : isNightTheme ? "0.045" : "0.04";
  const pinGlossOpacityButton = isLightTheme ? isMidTheme ? "0.06" : "0.1" : isNightTheme ? "0.05" : "0.045";
  const pinKeySheenBackground = isDarkKeypadTheme
    ? isMonoTheme
      ? "linear-gradient(180deg, rgba(230, 230, 230, 0.035) 0%, rgba(230, 230, 230, 0.012) 30%, rgba(230, 230, 230, 0) 62%)"
      : isNightTheme
      ? "linear-gradient(180deg, rgba(255, 255, 255, 0.045) 0%, rgba(255, 255, 255, 0.014) 30%, rgba(255, 255, 255, 0) 62%)"
      : "linear-gradient(180deg, rgba(255, 255, 255, 0.038) 0%, rgba(255, 255, 255, 0.012) 30%, rgba(255, 255, 255, 0) 62%)"
    : "transparent";
  const pinKeySheenOpacity = isDarkKeypadTheme ? "0.34" : "0";
  const pinKeyOutline = "transparent";
  const pinKeyOutlineHover = isDarkKeypadTheme
    ? pinKeyOutline
    : "transparent";
  const pinKeyOutlineActive = isDarkKeypadTheme
    ? pinKeyOutline
    : "transparent";
  const pinKeyRimTop = "transparent";
  const pinKeyRimBottom = "transparent";
  const pinKeyBackdropFilter = "none";
  const pinKeyHoverShadow = isDarkKeypadTheme
    ? isMonoTheme
      ? pinKeyBoxShadow
      : isNightTheme
      ? "0 5px 13px rgba(4, 9, 18, 0.24), inset 0 0 0 1px rgba(198, 222, 255, 0.14)"
      : "0 5px 13px rgba(3, 8, 15, 0.22), inset 0 0 0 1px rgba(214, 228, 255, 0.12)"
    : pinKeyBoxShadow;
  const pinKeyFocusShadow = isDarkKeypadTheme
    ? `0 0 0 3px rgba(197, 113, 113, 0.18), ${pinKeyHoverShadow}`
    : pinKeyBoxShadow;
  const pinKeyActiveShadow = pinKeyBoxShadow;
  const pinKeyHoverFilter = "none";
  const pinKeyHoverSheenOpacity = isDarkKeypadTheme ? pinKeySheenOpacity : "0";
  const pinKeyActiveSheenOpacity = isDarkKeypadTheme ? pinKeySheenOpacity : "0";
  const pinBounceVars = isDarkKeypadTheme
    ? {
        "--pin-bounce-ms": "560ms",
        "--pin-bounce-up": "1.04",
        "--pin-bounce-down": "0.993",
        "--pin-bounce-recover": "1.007"
      }
    : {
        "--pin-bounce-ms": "640ms",
        "--pin-bounce-up": "1.059",
        "--pin-bounce-down": "0.989",
        "--pin-bounce-recover": "1.011"
      };
  const loginShellShadow = isOtpStep
    ? undefined
    : isMidTheme
      ? "0 14px 30px rgba(26, 18, 18, 0.15)"
      : isLightTheme
        ? "0 16px 34px rgba(15, 23, 42, 0.1)"
        : isMonoTheme
          ? "0 0 14px rgba(230, 230, 230, 0.1), 0 0 32px rgba(230, 230, 230, 0.05)"
        : isNightTheme
          ? "0 0 18px rgba(214, 232, 255, 0.12), 0 0 38px rgba(214, 232, 255, 0.06)"
          : "0 0 14px rgba(248, 253, 255, 0.11), 0 0 32px rgba(248, 253, 255, 0.055)";
  const loginShellFilter = "none";
  const showEmailErrorIcon = emailErrorVisual;
  const isShortDesktopCandidate = !isPhoneViewport && viewportWidth <= 1280;
  const desktopCompactMode = isPhoneViewport
    ? "none"
    : viewportHeight <= 640
      ? "tight"
      : isShortDesktopCandidate && viewportHeight <= 700
        ? "tight"
        : isShortDesktopCandidate && viewportHeight <= 760
        ? "compact"
        : "none";
  const isCompactDesktop = desktopCompactMode !== "none";
  const isTightDesktop = desktopCompactMode === "tight";
  const androidPinToggleClassName = isAndroidPlatform
    ? "!text-[1.32rem] max-md:!text-[clamp(1.36rem,4.9vw,1.74rem)] leading-[1.18] whitespace-normal [text-wrap:balance]"
    : "";
  const androidRegisterLinkClassName = isAndroidPlatform
    ? "!text-[1.62rem] max-md:!text-[clamp(1.72rem,5.45vw,2.18rem)] leading-[1.14] whitespace-normal [text-wrap:balance]"
    : "";
  const androidOtpActionClassName = isAndroidPlatform
    ? "!text-[clamp(1.26rem,4.95vw,1.48rem)] max-md:!text-[clamp(1.3rem,5.3vw,1.58rem)] leading-[1.16] whitespace-normal [text-wrap:balance]"
    : "";
  const androidHelpPopoverLinkClassName = isAndroidPlatform
    ? "whitespace-normal [text-wrap:balance] leading-[1.2]"
    : "";
  const androidModalTitleClassName = isAndroidPlatform
    ? "!text-[clamp(1.94rem,1.38rem+1.24vw,2.32rem)] max-md:!text-[clamp(2.24rem,8.45vw,2.9rem)]"
    : "";
  const loginEmailFieldWrapClassName = [
    "register-input-shell register-input-shell--mid relative block mx-auto w-full",
    "!w-[min(100%,var(--login-email-w,var(--pin-grid-w)))] !max-w-[var(--login-email-w,var(--pin-grid-w))]"
  ].join(" ");
  const loginEmailInputClassName = [
    "register-input register-input-mid-shell block !my-0 !w-full !max-w-none",
    "!text-left placeholder:!text-left !font-normal !leading-[1.38] !py-[0.95rem] !min-h-[3.6rem]",
    isMonoTheme
      ? "!text-[clamp(1rem,1.75vw,1.12rem)] !tracking-[0] !px-[1rem] !py-[0.72rem] !min-h-[3.08rem] !shadow-[0_18px_24px_-18px_rgba(230,230,230,0.22)] hover:!shadow-[0_18px_24px_-18px_rgba(230,230,230,0.26)] focus:!shadow-[0_18px_24px_-18px_rgba(230,230,230,0.26)] focus-visible:!shadow-[0_18px_24px_-18px_rgba(230,230,230,0.26)]"
      : "!text-[1.25rem] !tracking-[0.01em] !px-[1.5rem]",
    "!text-[color:var(--input-text)] placeholder:opacity-100 placeholder:!text-[color:var(--input-placeholder)]",
    "max-[768px]:!text-[clamp(1.2rem,4.9vw,1.36rem)] max-[768px]:!px-[clamp(1.06rem,4.1vw,1.34rem)] max-[768px]:!py-[0.84rem] max-[768px]:!min-h-[3.2rem]",
    isAndroidPlatform ? "max-[768px]:!min-h-[3.12rem]" : ""
  ].filter(Boolean).join(" ");
  const loginShellStyle = {
    ...(isPhoneViewport
      ? {
          maxHeight: "100%",
          minHeight: 0,
          overflowY: "auto",
          overscrollBehavior: "contain",
          WebkitOverflowScrolling: "touch",
          alignSelf: "center",
          marginTop: "auto",
          marginBottom: "auto",
          marginLeft: "auto",
          marginRight: "auto"
        }
      : null),
    ...(!isPhoneViewport
      ? {
          maxHeight: "calc(100dvh - 1rem)",
          overflowY: "auto",
          overflowX: "visible",
          overscrollBehavior: "contain",
          WebkitOverflowScrolling: "touch"
        }
      : null),
    ...(isPhoneViewport && !isOtpStep
      ? {
          width: isAndroidPlatform
            ? "min(calc(100vw - 0.16rem), calc(var(--login-core-w) + 3.58rem))"
            : "min(calc(100vw - 0.14rem), calc(var(--login-core-w) + 3.48rem))",
          minWidth: isAndroidPlatform
            ? "min(calc(100vw - 0.16rem), calc(var(--login-core-w) + 3.58rem))"
            : "min(calc(100vw - 0.14rem), calc(var(--login-core-w) + 3.48rem))",
          maxWidth: isAndroidPlatform
            ? "min(calc(100vw - 0.16rem), calc(var(--login-core-w) + 3.58rem))"
            : "min(calc(100vw - 0.14rem), calc(var(--login-core-w) + 3.48rem))",
          paddingLeft: isAndroidPlatform
            ? "clamp(1.2rem, 5.25vw, 1.6rem)"
            : "clamp(1.1rem, 4.35vw, 1.3rem)",
          paddingRight: isAndroidPlatform
            ? "clamp(1.2rem, 5.25vw, 1.6rem)"
            : "clamp(1.1rem, 4.35vw, 1.3rem)"
        }
      : null)
  };
  const currentEmailValue = String(
    (emailRevealed ? emailInputRef.current?.value : "") ||
      emailValue ||
      storedEmail ||
      ""
  )
    .trim()
    .toLowerCase();
  const hasKnownEmail = Boolean(currentEmailValue);
  const emailIconStatus = showEmailErrorIcon || !hasKnownEmail ? "error" : "success";
  const stopInside = e => e.stopPropagation();
  const helpSubmitHint =
    locale === "en"
      ? "To sign in, press"
      : locale === "ru"
        ? "Чтобы войти, нажмите"
        : "Sisenemiseks vajuta";
  return createPortal(<>
      <style jsx global>{`
        @keyframes pinAltZeroFade {
          0%, 48% { opacity: 1; }
          52%, 100% { opacity: 0; }
        }
        @keyframes pinAltClearFade {
          0%, 48% { opacity: 0; }
          52%, 100% { opacity: 1; }
        }
        #login-modal .login-keypad-btn {
          transform: translateZ(0);
          backdrop-filter: var(--pin-key-backdrop-filter, none);
          -webkit-backdrop-filter: var(--pin-key-backdrop-filter, none);
        }
        #login-modal .login-keypad-btn:is(:hover, :focus-visible) {
          transform: translateZ(0) scale(0.985);
        }
        #login-modal .login-keypad-btn:active {
          transform: translateZ(0) scale(0.97);
        }
        #login-modal[data-keypad-theme="dark"] .login-keypad-btn {
          top: 0;
          transition-property: transform, box-shadow, background, color, opacity !important;
          transition-duration: 280ms !important;
          transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1) !important;
          will-change: auto;
        }
        #login-modal[data-keypad-theme="dark"] .login-keypad-btn::after {
          inset: 2px;
          border-radius: inherit;
          opacity: calc(var(--pin-gloss-op, 0) * 0.72);
          transition:
            opacity 280ms cubic-bezier(0.16, 1, 0.3, 1),
            inset 280ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        #login-modal .login-keypad-btn::before {
          content: "";
          position: absolute;
          inset: 1px;
          border-radius: inherit;
          pointer-events: none;
          background: var(--pin-key-sheen-bg, transparent);
          opacity: var(--pin-key-sheen-op, 0);
          border: 1px solid var(--pin-key-outline, transparent);
          transition:
            opacity 280ms cubic-bezier(0.16, 1, 0.3, 1),
            border-color 280ms cubic-bezier(0.16, 1, 0.3, 1),
            box-shadow 280ms cubic-bezier(0.16, 1, 0.3, 1),
            background 280ms cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow:
            inset 0 1px 0 var(--pin-key-rim-top, transparent),
            inset 0 -1px 0 var(--pin-key-rim-bottom, transparent);
        }
        #login-modal[data-keypad-theme="dark"] .login-keypad-btn:focus-visible::before {
          opacity: var(--pin-key-sheen-op-hover, var(--pin-key-sheen-op, 0));
          border-color: var(--pin-key-outline-hover, var(--pin-key-outline, transparent));
        }
        #login-modal[data-keypad-theme="dark"] .login-keypad-btn:focus-visible::after {
          opacity: calc(var(--pin-gloss-op, 0) * 0.74);
        }
        #login-modal[data-keypad-theme="dark"] .login-keypad-btn:focus-visible {
          box-shadow: var(--pin-key-focus-shadow, var(--pin-key-hover-shadow, none)) !important;
          filter: var(--pin-key-hover-filter, none);
        }
        #login-modal[data-keypad-theme="dark"] .login-keypad-btn:hover {
          top: 0;
        }
        #login-modal[data-keypad-theme="dark"] .login-keypad-btn:active {
          top: 0;
          filter: none;
        }
        #login-modal .login-modal-close.modal-close-btn:is(:hover, :focus-visible) {
          transform: scale(0.985);
        }
        #login-modal .login-modal-close.modal-close-btn:active {
          transform: scale(0.97);
        }
        #login-modal[data-compact="compact"] .login-modal-shell {
          padding-top: 0.72rem !important;
        }
        #login-modal[data-compact="tight"] .login-modal-shell {
          padding-top: 0.56rem !important;
        }
        #login-modal[data-compact="compact"]:not(.login-modal--otp) .login-modal-shell {
          padding-bottom: 0.88rem !important;
        }
        #login-modal[data-compact="tight"]:not(.login-modal--otp) .login-modal-shell {
          padding-bottom: 0.68rem !important;
        }
        #login-modal[data-compact="compact"].login-modal--otp .login-modal-shell {
          padding-bottom: 0.86rem !important;
        }
        #login-modal[data-compact="tight"].login-modal--otp .login-modal-shell {
          padding-bottom: 0.7rem !important;
        }
        #login-modal[data-compact="compact"] .login-modal-title {
          font-size: clamp(1.58rem, 1.04rem + 0.86vw, 1.94rem) !important;
          line-height: 1.02 !important;
        }
        #login-modal[data-compact="tight"] .login-modal-title {
          font-size: clamp(1.4rem, 0.96rem + 0.72vw, 1.72rem) !important;
          line-height: 1 !important;
        }
        #login-modal[data-compact="compact"] .login-keypad-toggle-link {
          font-size: 1.16rem !important;
        }
        #login-modal[data-compact="tight"] .login-keypad-toggle-link {
          font-size: 1.04rem !important;
        }
        #login-modal[data-compact="compact"] .login-register-link {
          font-size: 1.5rem !important;
        }
        #login-modal[data-compact="tight"] .login-register-link {
          font-size: 1.28rem !important;
        }
        #login-modal[data-compact="compact"] .login-register-row {
          margin-top: -0.18rem !important;
        }
        #login-modal[data-compact="tight"] .login-register-row {
          margin-top: -0.08rem !important;
          margin-bottom: 0 !important;
        }
        #login-modal[data-compact="compact"] .login-otp-copy {
          gap: 0.32rem !important;
        }
        #login-modal[data-compact="tight"] .login-otp-copy {
          gap: 0.24rem !important;
        }
        #login-modal[data-compact="compact"] .login-otp-actions {
          gap: 0.52rem !important;
          margin-top: 1.08rem !important;
        }
        #login-modal[data-compact="tight"] .login-otp-actions {
          gap: 0.42rem !important;
          margin-top: 0.84rem !important;
        }
        #login-modal[data-compact="compact"] .login-otp-action-link {
          font-size: 1.06rem !important;
        }
        #login-modal[data-compact="tight"] .login-otp-action-link {
          font-size: 0.98rem !important;
        }
      `}</style>
      <div ref={boxRef} id="login-modal" data-keypad-theme={isDarkKeypadTheme ? "dark" : "light"} data-compact={desktopCompactMode} className={modalClasses} style={{
      "--login-modal-side-pad": isPhoneViewport ? "0px" : isTightDesktop ? "0.92em" : isCompactDesktop ? "1.02em" : "1.15em",
      "--login-modal-inner-side-pad": isOtpStep
        ? isPhoneViewport
          ? "0px"
          : isTightDesktop
            ? "0.7em"
            : isCompactDesktop
              ? "0.78em"
              : "0.86em"
        : isPhoneViewport
          ? "0px"
          : isTightDesktop
            ? "0.52em"
            : isCompactDesktop
              ? "0.58em"
              : "0.64em",
      "--pin-btn": isPhoneViewport
        ? isAndroidPlatform
          ? "clamp(4.48rem, 16.8vw, 5.14rem)"
          : "clamp(4.78rem, 18.45vw, 5.46rem)"
        : isTightDesktop
          ? "3.66rem"
          : isCompactDesktop
            ? "3.94rem"
            : "4.26rem",
      "--pin-gap-x": isPhoneViewport
        ? isAndroidPlatform
          ? "clamp(1.18rem, 4.45vw, 1.48rem)"
          : "clamp(1.36rem, 5.2vw, 1.68rem)"
        : isTightDesktop
          ? "0.62rem"
          : isCompactDesktop
            ? "0.74rem"
            : "0.9rem",
      "--pin-gap-y": isPhoneViewport
        ? isAndroidPlatform
          ? "clamp(0.9rem, 2.6vh, 1.14rem)"
          : "clamp(0.76rem, 2.28vh, 0.98rem)"
        : isTightDesktop
          ? "0.52rem"
          : isCompactDesktop
            ? "0.64rem"
            : "0.82rem",
      "--pin-grid-w": "calc((3 * var(--pin-btn)) + (2 * var(--pin-gap-x)))",
      "--login-email-w": "var(--pin-grid-w)",
      "--login-core-w": "max(var(--pin-grid-w), var(--login-email-w, var(--pin-grid-w)))",
      "--login-pin-modal-min-w": isTightDesktop ? "18.4rem" : isCompactDesktop ? "19.3rem" : "20.4rem",
      "--login-modal-pad-effective": isOtpStep ? "var(--login-modal-side-pad)" : "var(--login-modal-inner-side-pad)",
      "--login-pin-modal-w": "min(90vw, max(var(--login-pin-modal-min-w,20.4rem), calc(var(--pin-grid-w) + (2 * var(--login-modal-pad-effective, var(--login-modal-side-pad))) + 0.8rem)))",
      "--login-envelope-size": isPhoneViewport
        ? isAndroidPlatform
          ? "clamp(5rem, 14.95vw, 6.08rem)"
          : "clamp(5.45rem, 15.2vw, 6.9rem)"
        : isTightDesktop
          ? "clamp(3.66rem, 5.6vw, 4.2rem)"
          : isCompactDesktop
            ? "clamp(3.92rem, 6vw, 4.56rem)"
            : "clamp(4.4rem, 7vw, 5.2rem)",
      "--login-envelope-hit": isPhoneViewport
        ? isAndroidPlatform
          ? "clamp(5.24rem, 15.55vw, 6.34rem)"
          : "clamp(5.6rem, 15.8vw, 7.1rem)"
        : isTightDesktop
          ? "clamp(3.78rem, 5.8vw, 4.34rem)"
          : isCompactDesktop
            ? "clamp(4.02rem, 6.15vw, 4.68rem)"
            : "clamp(4.4rem, 7vw, 5.2rem)",
      "--otp-copy-text": isMidTheme
        ? "#4a3833"
        : isMonoTheme
          ? "var(--forest-highlight, #c8c8c8)"
        : isNightTheme
          ? "#e6eefb"
        : isLightTheme
          ? "#1f2937"
          : "#e5e7eb",
      "--otp-copy-strong": isMidTheme
        ? "#3f2f2b"
        : isMonoTheme
          ? "var(--forest-icon, #e6e6e6)"
        : isNightTheme
          ? "#f3f7ff"
        : isLightTheme
          ? "#111827"
          : "#f3f4f6",
      "--otp-input-text": isMidTheme
        ? "#4a3833"
        : isMonoTheme
          ? "var(--forest-icon, #e6e6e6)"
        : isNightTheme
          ? "#e6eefb"
        : isLightTheme
          ? "#1f2937"
          : "#e5e7eb",
      "--otp-input-placeholder": isMidTheme
        ? "rgba(82,58,51,0.92)"
        : isMonoTheme
          ? "rgba(230,230,230,0.78)"
        : isNightTheme
          ? "rgba(208,223,243,0.9)"
        : isLightTheme
          ? "rgba(31,41,55,0.82)"
          : "rgba(229,231,235,0.82)",
      "--otp-input-caret": isMidTheme
        ? "#4a3833"
        : isMonoTheme
          ? "var(--forest-icon, #e6e6e6)"
        : isNightTheme
          ? "#e6eefb"
        : isLightTheme
          ? "#1f2937"
          : "#e5e7eb",
      "--otp-check-shape": isMidTheme
        ? "#4a3833"
        : isMonoTheme
          ? "var(--forest-icon, #e6e6e6)"
        : isNightTheme
          ? "#e6eefb"
        : isLightTheme
          ? "#1f2937"
          : "#e5e7eb",
      "--otp-check-tick": isLightTheme ? "#7A3A38" : "#c57171",
      "--otp-check-text": isMidTheme
        ? "#4a3833"
        : isMonoTheme
          ? "var(--forest-highlight, #c8c8c8)"
        : isNightTheme
          ? "#e6eefb"
        : isLightTheme
          ? "#1f2937"
          : "#e5e7eb",
      ...(isOtpStep && isMonoTheme ? {
        "--otp-panel-bg": "var(--glass-ring-surface-bg, rgba(20, 20, 20, 0.62))",
        "--otp-panel-border": "rgba(214, 214, 214, 0.11)",
        "--otp-panel-shadow": "0 12px 26px rgba(7, 7, 7, 0.24)",
        "--otp-input-bg": "var(--forest-input-surface, linear-gradient(180deg, rgba(42, 42, 42, 0.94) 0%, rgba(29, 29, 29, 0.965) 100%))",
        "--otp-input-border": "rgba(214, 214, 214, 0.16)",
        "--otp-accent": "var(--forest-title, #c57171)"
      } : {}),
      "--pin-key-backdrop-filter": pinKeyBackdropFilter,
      "--pin-key-sheen-bg": pinKeySheenBackground,
      "--pin-key-sheen-op": pinKeySheenOpacity,
      "--pin-key-sheen-op-hover": pinKeyHoverSheenOpacity,
      "--pin-key-sheen-op-active": pinKeyActiveSheenOpacity,
      "--pin-key-outline": pinKeyOutline,
      "--pin-key-outline-hover": pinKeyOutlineHover,
      "--pin-key-outline-active": pinKeyOutlineActive,
      "--pin-key-rim-top": pinKeyRimTop,
      "--pin-key-rim-bottom": pinKeyRimBottom,
      "--pin-key-hover-shadow": pinKeyHoverShadow,
      "--pin-key-focus-shadow": pinKeyFocusShadow,
      "--pin-key-active-shadow": pinKeyActiveShadow,
      "--pin-key-hover-filter": pinKeyHoverFilter,
      "--login-shell-shadow": loginShellShadow,
      "--login-shell-filter": loginShellFilter,
      width: isPhoneViewport
          ? "100%"
          : isOtpStep
            ? "min(92vw, 30rem)"
            : "var(--login-pin-modal-w)",
        minWidth: isPhoneViewport
          ? "100%"
          : isOtpStep
            ? "min(90vw, 25.8rem)"
            : "var(--login-pin-modal-w)",
        maxWidth: isPhoneViewport
          ? "100%"
          : isOtpStep
            ? "min(92vw, 30rem)"
            : "var(--login-pin-modal-w)",
        boxSizing: "border-box"
      }} tabIndex={-1} role="dialog" aria-modal="true" aria-label={isOtpStep ? t("auth.login.otp_title") : t("auth.login.title")} onClick={stopInside}>
        <div ref={shellRef} className={`login-modal-shell glass-box w-full !my-0 !px-[clamp(1.25rem,3vw,1.55rem)] max-md:!px-[clamp(1.1rem,4.4vw,1.42rem)] !pt-[clamp(1.08rem,2.18vw,1.42rem)] max-md:!pt-[clamp(1rem,3vw,1.36rem)] [--glass-ring-surface-bg:var(--glass-surface-bg,rgba(21,21,21,0.5))] [background:var(--glass-ring-surface-bg,var(--glass-surface-bg,rgba(0,0,0,0.25))))] [border:none] [box-shadow:var(--login-shell-shadow,none)] [filter:var(--login-shell-filter,none)] ${
        isOtpStep
          ? "!pb-[clamp(0.78rem,2vw,1.2rem)] max-md:!pb-[clamp(0.7rem,2vw,1rem)]"
          : "!pb-[clamp(0.84rem,2.1vw,1.18rem)] max-md:!pb-[clamp(0.7rem,2.3vw,1.05rem)]"
      }`} style={loginShellStyle}>
          <button className="login-modal-close modal-close-btn absolute z-[2] !w-[2.68rem] !h-[2.68rem] max-[768px]:!w-[2.66rem] max-[768px]:!h-[2.66rem] !rounded-[0.74rem] text-[#c57171] light:text-[#7a3a38]" onClick={onClose} aria-label={t("buttons.close")} type="button" />

          <div className={headerWrapClass}>
            <div
              className={`${modalTitleClassName} ${
                isOtpStep
                  ? otpModalTitleClassName
                  : ""
              } ${androidModalTitleClassName}`}
            >
              {isOtpStep
                ? renderOtpTitle(t("auth.login.otp_title"))
                : t("auth.login.title")}
            </div>
            <div className={headerMessageClass} role={error ? "alert" : showHeaderMessage ? "status" : undefined} aria-live={error ? "assertive" : showHeaderMessage ? "polite" : undefined} aria-atomic="true" aria-hidden={!showHeaderMessage}>
              {showHeaderMessage ? messageText : null}
            </div>
          </div>

        {!isOtpStep && <form className={loginPinFormClassName} onSubmit={e => {
        e.preventDefault();
        submitPinStep();
      }} autoComplete="off">
            <div id={emailHintIdRef.current} className="sr-only">
              {t("auth.email_icon_hint")}
            </div>
            <input aria-label={t("profile.email")} name="username" type="email" autoComplete="username" value={currentEmailValue} readOnly tabIndex={-1} className="sr-only" />

            <div className={emailRowClass}>
              {!emailRevealed ? <button type="button" ref={emailIconButtonRef} className={emailIconClass} style={{
            width: "var(--login-envelope-hit)",
            height: "var(--login-envelope-hit)"
          }} aria-describedby={emailHintIdRef.current} aria-label={t("auth.email_placeholder")} onClick={revealEmailInput}>
                  <EmailEnvelopeStatusIcon isLightTheme={isLightTheme} status={emailIconStatus} className="login-email-icon pointer-events-none h-[var(--login-envelope-size)] w-[var(--login-envelope-size)]" />
                  <span className="sr-only">{t("auth.email_icon_hint")}</span>
                </button> : <label className={loginEmailFieldWrapClassName}>
                  <Input type="email" name="email" ref={emailInputRef} size="md" aria-label={t("auth.email_placeholder")} aria-describedby={emailHintIdRef.current} aria-invalid={emailErrorVisual ? "true" : "false"} placeholder={t("auth.email_placeholder")} autoComplete="username" inputMode="email" autoCapitalize="none" autoCorrect="off" spellCheck={false} className={loginEmailInputClassName} onFocus={e => {
              resetInputHorizontalScroll(e.currentTarget);
            }} onMouseDown={e => {
              const node = emailInputRef.current;
              if (node && document.activeElement !== node) {
                e.preventDefault();
                node.focus();
                resetInputHorizontalScroll(node);
              }
            }} onKeyDown={e => {
              if (e.key === "Enter") e.preventDefault();
            }} onChange={e => {
              setEmailValue(e.target.value || "");
              setEmailErrorVisual(false);
              resetIconState();
              setError("");
            }} />
                </label>}
            </div>

            <div id={pinHintIdRef.current} className="sr-only">
              {t("auth.login.pin_hint")}
            </div>

            {}
            {!isMobile && <input aria-label={t("auth.pin_placeholder")} ref={hiddenInputRef} value={pinValue} inputMode="numeric" pattern={`\\d{${PIN_MIN},${PIN_MAX}}`} maxLength={PIN_MAX} className="fixed left-[-10000px] top-0 h-px w-px opacity-0 caret-transparent" tabIndex={-1} type="password" autoComplete="current-password" onKeyDown={onHiddenKeyDown} onInput={handlePinInputChange} onChange={handlePinInputChange} aria-describedby={pinHintIdRef.current} aria-hidden="true" />}

            {}
            {isMobile && <input ref={mobilePinInputRef} aria-label={t("auth.pin_placeholder")} value={pinValue} inputMode="numeric" pattern={`\\d{${PIN_MIN},${PIN_MAX}}`} maxLength={PIN_MAX} type="tel" autoComplete="off" enterKeyHint="go" tabIndex={-1} aria-hidden="true" onChange={handlePinInputChange} onInput={handlePinInputChange} onKeyDown={e => {
          if (e.key === "Enter") {
            e.preventDefault();
            suppressNativeBlurSubmitRef.current = true;
            registerTimeout(() => {
              suppressNativeBlurSubmitRef.current = false;
            }, 220);
            submitPinStep();
          }
        }} onBlur={() => {
          if (suppressNativeBlurSubmitRef.current) return;
          if (step !== "pin" || !isMobile || !useNativeKeyboard || pinLoading) return;
          const pin = pinValue.replace(/\s+/g, "");
          if (!new RegExp(`^\\d{${PIN_MIN},${PIN_MAX}}$`).test(pin)) return;
          registerTimeout(() => {
            if (suppressNativeBlurSubmitRef.current) return;
            if (typeof document !== "undefined" && document.activeElement === mobilePinInputRef.current) return;
            submitPinStep();
          }, 0);
        }} aria-describedby={pinHintIdRef.current} style={{
          position: "fixed",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          opacity: 0.01,
          width: 2,
          height: 2,
          zIndex: 101,
          background: "transparent",
          border: "none",
          padding: 0,
          margin: 0,
          caretColor: "transparent"
        }} />}

        {!(isMobile && useNativeKeyboard) && <div className="relative flex w-full justify-center mt-[0.05rem] mb-[-0.1rem] overflow-visible" style={{
          "--pin-a": "0.006",
          "--pin-a-alt": "0.01",
          "--pin-border-w": "1.45px",
          "--pin-shadow": "0.11",
          "--pin-gloss-bg": pinGlossBackground,
          "--pin-gloss-op": pinGlossOpacityBase
        }} aria-hidden="false" onTouchStart={handleKeypadTouchStart} onTouchEnd={handleKeypadTouchEnd} onTouchCancel={handleKeypadTouchEnd}>
                <div className="grid justify-center [grid-template-columns:repeat(3,var(--pin-btn))] [grid-auto-rows:var(--pin-btn)] gap-x-[var(--pin-gap-x)] gap-y-[var(--pin-gap-y)] w-full max-w-[calc((3*var(--pin-btn))+(2*var(--pin-gap-x)))]" role="group" aria-label={t("auth.pin_placeholder")}>
                  {keypadKeys.map((key, idx) => {
              if (key === "blank") {
                return <span key={"blank-" + String(idx)} className="inline-block w-[var(--pin-btn)] h-[var(--pin-btn)]" aria-hidden="true" />;
              }
              if (key === "help") {
                const label = t("auth.login.forgot");
                return <button key={"help-" + String(idx)} type="button" className="login-keypad-btn no-click-pulse relative grid place-items-center !w-[var(--pin-btn)] !h-[var(--pin-btn)] rounded-full overflow-hidden border-0 appearance-none [-webkit-appearance:none] text-[1.85rem] max-md:text-[2.06rem] font-[360] tracking-[0.01em] [font-variant-numeric:tabular-nums] select-none [text-rendering:geometricPrecision] [-webkit-font-smoothing:antialiased] cursor-pointer transition-[transform,background,box-shadow,filter] duration-[140ms] ease-[cubic-bezier(0.2,1,0.3,1)] focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(197,113,113,0.18),0_12px_20px_rgba(0,0,0,0.12)] disabled:shadow-none disabled:cursor-default [background:radial-gradient(120%_120%_at_18%_16%,rgba(255,255,255,0.02)_0%,rgba(255,255,255,0)_56%),radial-gradient(120%_120%_at_86%_90%,rgba(0,0,0,0.22)_0%,rgba(0,0,0,0)_64%),linear-gradient(145deg,rgba(255,255,255,0.003)_0%,rgba(255,255,255,0.002)_42%,rgba(0,0,0,0.22)_100%)] light:[background:radial-gradient(120%_120%_at_18%_16%,rgba(255,255,255,0.62)_0%,rgba(255,255,255,0)_62%),radial-gradient(120%_120%_at_86%_90%,rgba(0,0,0,0.06)_0%,rgba(0,0,0,0)_64%),linear-gradient(145deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.12)_55%,rgba(255,255,255,0.06)_100%)] text-[#c57171] light:text-[#7a3a38] after:content-[''] after:absolute after:inset-0 after:rounded-full after:pointer-events-none after:[background:var(--pin-gloss-bg)] after:opacity-[var(--pin-gloss-op)]" style={{
                  background: pinKeyBackground,
                  boxShadow: pinKeyBoxShadow,
                  "--pin-gloss-op": pinGlossOpacityButton,
                  ...pinBounceVars
                }} ref={el => {
                  keypadRefs.current[idx] = el;
                  helpButtonRef.current = el;
                }} onKeyDown={e => handleKeypadKeyDown(e, idx)} onPointerDown={e => {
                  triggerKeypadBounce(e.currentTarget);
                }} onPointerUp={clearPointerKeyFocus} onPointerCancel={clearPointerKeyFocus} onClick={e => {
                  setHelpOpen(p => !p);
                  if (e.detail !== 0) clearButtonFocus(e.currentTarget);
                }} disabled={pinLoading} aria-label={label} aria-haspopup="dialog" aria-expanded={helpOpen}>
                          {t("symbols.question")}
                        </button>;
              }
              if (key === "submit") {
                const label = t("auth.login.submit");
                const submitFilled = Math.max(0, Math.min(PIN_MAX, pinValue.length));
                const submitError = submitIconState === "error";
                const arrowScale = 1 + submitFilled / PIN_MAX * 0.08;
                return <button key={"submit-" + String(idx)} type="button" className="login-keypad-btn no-click-pulse relative grid place-items-center !w-[var(--pin-btn)] !h-[var(--pin-btn)] rounded-full overflow-hidden border-0 appearance-none [-webkit-appearance:none] text-[1.6rem] max-md:text-[1.85rem] font-[360] tracking-[0.01em] [font-variant-numeric:tabular-nums] select-none [text-rendering:geometricPrecision] [-webkit-font-smoothing:antialiased] cursor-pointer transition-[transform,background,box-shadow,filter] duration-[140ms] ease-[cubic-bezier(0.2,1,0.3,1)] focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(197,113,113,0.18),0_12px_20px_rgba(0,0,0,0.12)] disabled:shadow-none disabled:cursor-default [background:radial-gradient(120%_120%_at_18%_16%,rgba(255,255,255,0.02)_0%,rgba(255,255,255,0)_56%),radial-gradient(120%_120%_at_86%_90%,rgba(0,0,0,0.22)_0%,rgba(0,0,0,0)_64%),linear-gradient(145deg,rgba(255,255,255,0.003)_0%,rgba(255,255,255,0.002)_42%,rgba(0,0,0,0.22)_100%)] light:[background:radial-gradient(120%_120%_at_18%_16%,rgba(255,255,255,0.62)_0%,rgba(255,255,255,0)_62%),radial-gradient(120%_120%_at_86%_90%,rgba(0,0,0,0.06)_0%,rgba(0,0,0,0)_64%),linear-gradient(145deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.12)_55%,rgba(255,255,255,0.06)_100%)] after:content-[''] after:absolute after:inset-0 after:rounded-full after:pointer-events-none after:[background:var(--pin-gloss-bg)] after:opacity-[var(--pin-gloss-op)]" style={{
                  background: pinKeyBackground,
                  boxShadow: pinKeyBoxShadow,
                  "--pin-gloss-op": pinGlossOpacityButton,
                  ...pinBounceVars,
                  cursor: pinLoading ? "var(--cursor-default)" : undefined
                }} ref={el => keypadRefs.current[idx] = el} onKeyDown={e => {
                  handleKeypadKeyDown(e, idx);
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    submitPinStep();
                  }
                }} onPointerDown={e => {
                  triggerKeypadBounce(e.currentTarget);
                }} onPointerUp={clearPointerKeyFocus} onPointerCancel={clearPointerKeyFocus} onClick={e => {
                  submitPinStep();
                  if (e.detail !== 0) clearButtonFocus(e.currentTarget);
                }} disabled={pinLoading} aria-label={label}>
                          <span className="absolute inset-0 grid place-items-center" aria-hidden="true">
                            <SubmitInnerEdgeDotsProgress
                              filled={submitFilled}
                              max={PIN_MAX}
                              isLightTheme={isLightTheme}
                              isError={submitError}
                              className="login-submit-dots absolute inset-0 pointer-events-none"
                            />
                            {submitError ? <LockErrorIcon className="login-submit-icon h-[clamp(1.42rem,3.8vw,1.7rem)] w-[clamp(1.42rem,3.8vw,1.7rem)]" /> : <SubmitArrowIcon isLightTheme={isLightTheme} className="login-submit-icon h-[clamp(1.14rem,3.15vw,1.35rem)] w-[clamp(1.14rem,3.15vw,1.35rem)] max-md:h-[clamp(1.56rem,5.7vw,1.95rem)] max-md:w-[clamp(1.56rem,5.7vw,1.95rem)] translate-x-[0.08rem] max-md:translate-x-[0.11rem] transition-transform duration-200 ease-out" style={{
                            transform: `scale(${arrowScale.toFixed(3)})`
                          }} />}
                          </span>
                        </button>;
              }
              const isZeroKey = key === "zero";
              const digitToAppend = isZeroKey ? "0" : key;
              const digitLabel = isZeroKey ? zeroKeyMode === "backspace" ? t("auth.login.clear") : t("auth.login.key", {
                digit: 0
              }) : t("auth.login.key", {
                digit: key
              });
              return <button key={key + String(idx)} type="button" className={["login-keypad-btn", "no-click-pulse", "relative", "grid", "place-items-center", "!w-[var(--pin-btn)]", "!h-[var(--pin-btn)]", "rounded-full", "overflow-hidden", "border-0", "appearance-none", "[-webkit-appearance:none]", "text-[1.6rem]", "max-md:text-[2.02rem]", "font-[360]", "tracking-[0.01em]", "[font-variant-numeric:tabular-nums]", "select-none", "[text-rendering:geometricPrecision]", "[-webkit-font-smoothing:antialiased]", "cursor-pointer", "transition-[transform,background,box-shadow,filter]", "duration-[140ms]", "ease-[cubic-bezier(0.2,1,0.3,1)]", "focus-visible:outline-none", "focus-visible:shadow-[0_0_0_3px_rgba(197,113,113,0.18),0_12px_20px_rgba(0,0,0,0.12)]", "disabled:shadow-none", "disabled:cursor-default", "after:content-['']", "after:absolute", "after:inset-0", "after:rounded-full", "after:pointer-events-none", "after:[background:var(--pin-gloss-bg)]", "after:opacity-[var(--pin-gloss-op)]"].filter(Boolean).join(" ")} style={{
                color: isLightTheme ? "rgba(31, 41, 55, 0.92)" : isMonoTheme ? "var(--forest-icon, rgba(230, 230, 230, 0.96))" : "rgba(255, 255, 255, 0.95)",
                background: pinKeyBackground,
                boxShadow: pinKeyBoxShadow,
                "--pin-gloss-op": pinGlossOpacityButton,
                ...pinBounceVars
              }} ref={el => keypadRefs.current[idx] = el} onKeyDown={e => handleKeypadKeyDown(e, idx)} onPointerDown={e => {
                triggerKeypadBounce(e.currentTarget);
                if (isZeroKey) startZeroLongPress();
              }} onPointerUp={e => {
                clearPointerKeyFocus(e);
                if (isZeroKey) cancelZeroLongPress();
              }} onPointerCancel={e => {
                clearPointerKeyFocus(e);
                if (isZeroKey) cancelZeroLongPress();
              }} onPointerLeave={() => {
                if (isZeroKey) cancelZeroLongPress();
              }} onClick={e => {
                if (isZeroKey && zeroLongPressFiredRef.current) {
                  zeroLongPressFiredRef.current = false;
                  setZeroKeyMode("digit");
                  if (e.detail !== 0) clearButtonFocus(e.currentTarget);
                  return;
                }
                if (isZeroKey) {
                  appendDigit(digitToAppend);
                  if (e.detail !== 0) clearButtonFocus(e.currentTarget);
                  return;
                }
                appendDigit(digitToAppend);
                if (e.detail !== 0) clearButtonFocus(e.currentTarget);
              }} disabled={pinLoading} aria-label={digitLabel}>
                        {isZeroKey ? zeroKeyMode === "backspace" ? <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false" className="block h-[1.24em] w-[1.24em]">
                            <path d="M13.2 7.35H5.35l2.8-2.35L7.2 4.05 3.1 8l4.1 3.95L8.15 11l-2.8-2.35h7.85z" fill="currentColor" />
                          </svg> : <span className="font-inherit font-[inherit] text-[1em] tracking-[inherit]" aria-hidden="true">
                            {digitToAppend}
                          </span> : key}
                      </button>;
            })}
                </div>

                {helpOpen && <div ref={helpPopoverRef} role="dialog" aria-modal="false" aria-label={t("auth.login.forgot")} className={helpPopoverClassName} style={{
                  width: isMobile ? "min(19.4rem, calc(100vw - 2.2rem))" : "19.2rem",
                  maxWidth: "calc(100vw - 1.6rem)"
                }}>
                    <button type="button" className="login-help-close-btn absolute right-[0.08rem] top-[0.02rem] w-[2.32rem] h-[2.32rem] rounded-full border-0 bg-transparent text-[1.86rem] leading-none cursor-pointer text-[#c57171] light:text-[#7a3a38]" aria-label={t("buttons.close")} onClick={() => setHelpOpen(false)}>
                      {t("symbols.times")}
                    </button>

                    <div className="flex flex-col pr-[1.28rem] max-w-[inherit]">
                      <div className="mt-[0.02rem] mb-[0.3rem] flex items-center gap-[0.34rem] text-[1.12rem] max-md:text-[1.2rem] leading-[1.28] text-inherit opacity-95 hyphens-none">
                        <span>{helpSubmitHint}</span>
                        <span className="inline-flex h-[1.1em] w-[1.1em] items-center justify-center rounded-full" aria-hidden="true">
                          <SubmitArrowIcon
                            isLightTheme={isLightTheme}
                            className="h-[0.98em] w-[0.98em] translate-x-[0.03em]"
                          />
                        </span>
                      </div>
                      <div className="mt-[0.06rem] text-[1.12rem] max-md:text-[1.2rem] leading-[1.36] text-inherit opacity-95 hyphens-none">
                        {t("auth.login.help_hold_zero_before")}{" "}
                        <strong>{0}</strong>{" "}
                        {t("auth.login.help_hold_zero_after")}.
                      </div>
                      <div className="mt-[0.36rem] text-[1.07rem] max-md:text-[1.14rem] leading-[1.34] text-inherit opacity-95 hyphens-none">
                        {t("auth.login.help_wrong_pin_note")}
                      </div>

                      <AppLink href={resetRequestPath} variant="brand" className={`${helpPopoverLinkClassName} ${androidHelpPopoverLinkClassName}`} style={helpPopoverLinkStyle} onClick={() => setHelpOpen(false)}>
                        {t("auth.login.forgot")}
                      </AppLink>
                    </div>
                  </div>}
              </div>}

            {}
            <div className={pinMessageClass} role={error ? "alert" : showPinMessage ? "status" : undefined} aria-live={error ? "assertive" : showPinMessage ? "polite" : undefined} aria-atomic="true" aria-hidden={!showPinMessage}>
              {showPinMessage ? messageText : null}
            </div>

            <div className="login-keypad-toggle-row text-center mt-[0.08rem] max-md:mt-[0.02rem] mb-[0.08rem]">
              <button type="button" className={`${inlineLinkClassName} ${androidPinToggleClassName} login-keypad-toggle-link pin-layout-toggle`} onClick={e => {
                toggleKeypad();
                if (e.detail !== 0) clearButtonFocus(e.currentTarget);
              }} aria-label={isMobile ? t("auth.login.toggle_keypad_mobile_aria") : t("auth.login.toggle_keypad_desktop_aria")}>
                {t("auth.login.toggle_keypad")}
              </button>
            </div>
          </form>}

        {isOtpStep && <form className="login-otp-content w-full max-w-full mx-auto flex flex-col items-center px-[0.15rem] max-[768px]:px-[0.35rem]" onSubmit={e => {
        e.preventDefault();
        submitOtpStep();
      }}>
            <div className={`login-otp-copy w-full max-w-[23.6rem] max-[768px]:max-w-[min(88vw,28rem)] flex flex-col gap-[0.48rem] ${otpTextClassName}`}>
                {info && <p role="status" className={`m-0 font-semibold text-[1.04rem] ${otpInfoTextClassName}`}>
                    {info}
                  </p>}
                <p className="m-0 leading-[1.45] text-[1rem] max-md:text-[1.04rem] [overflow-wrap:normal] [word-break:normal] hyphens-none">
                  {t("auth.login.otp_description", {
                email: emailMask || ""
              })}
                </p>
                <p className="m-0 leading-[1.45] text-[0.96rem] max-md:text-[1rem] opacity-90 [overflow-wrap:normal] [word-break:normal] hyphens-none">
                  {t("auth.login.otp_spam_hint")}
                </p>
                {otpDeadlineLabel && <p className="mt-[0.22rem] translate-y-[0.32rem] w-full text-center font-medium tracking-[0.01em] text-[1.04rem]" id="otp-deadline">
                    {t("auth.login.otp_expires", {
                time: otpDeadlineLabel
              })}
                  </p>}
            </div>

            <div className="w-full mt-[0.96rem] max-[768px]:mt-[0.62rem] flex justify-center">
              <Input id="otp-code-input" ref={otpInputRef} type="text" dir="ltr" inputMode="numeric" autoComplete="one-time-code" aria-label={t("auth.login.otp_placeholder")} aria-describedby={otpInputDescribedBy} aria-invalid={otpInlineError ? "true" : undefined} maxLength={6} value={otpValue} onChange={e => setOtpValue(e.target.value.replace(/\D/g, "").slice(0, 6))} onInput={e => setOtpValue(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder={t("auth.login.otp_short_placeholder", "Kinnituskood")} className={`${subpageFieldInputClassName} !w-[min(100%,15.8rem)] !max-w-[15.8rem] max-[768px]:!w-[min(74vw,18.6rem)] max-[768px]:!max-w-[18.6rem] text-center !text-center placeholder:opacity-100 focus:placeholder:opacity-0 placeholder:text-center [font-variant-numeric:tabular-nums] font-medium text-[1.25rem] leading-[1.2] !px-[1.2rem] !py-[0.95rem] min-h-[3.6rem] placeholder:[font-size:1.02em] tracking-[0.12em]`} />
            </div>
            {otpInlineError ? <p id="otp-inline-error" role="alert" className="m-0 mt-[0.38rem] text-[1.03rem] leading-[1.35] text-center text-[#fca5a5] light:text-[#b44a4a]">
                {otpInlineError}
              </p> : null}

            <div className="w-full mt-[1rem] max-[768px]:mt-[0.48rem] flex justify-center">
              <FancyCheckbox
                id="remember-device"
                name="remember-device"
                checked={rememberDevice}
                onChange={next => setRememberDevice(next)}
                label={t("auth.login.remember_device")}
                className="login-otp-remember fancy-checkbox--otp w-full max-w-[23.6rem] max-[768px]:max-w-[min(88vw,28rem)] justify-center"
              />
            </div>
            {rememberDevice ? (
              <div className="w-full mt-[0.7rem] max-[768px]:mt-[0.48rem] flex flex-col items-center gap-[0.32rem]">
                <Input
                  id="trusted-device-name"
                  type="text"
                  name="trusted-device-name"
                  autoComplete="off"
                  maxLength={60}
                  value={deviceName}
                  onChange={e => setDeviceName(e.target.value)}
                  placeholder={t("auth.login.device_name_placeholder")}
                  aria-label={t("auth.login.device_name_label")}
                  className={`${subpageFieldInputClassName} !w-[min(100%,15.8rem)] !max-w-[15.8rem] max-[768px]:!w-[min(74vw,18.6rem)] max-[768px]:!max-w-[18.6rem] text-center !text-center placeholder:opacity-85 focus:placeholder:opacity-0 text-[1.04rem] !px-[1.08rem] !py-[0.78rem] min-h-[3.05rem]`}
                />
              </div>
            ) : null}

            <div className="w-full max-w-[23.6rem] max-[768px]:max-w-[min(88vw,28rem)] flex flex-col items-center mt-[1.28rem] max-[768px]:mt-[0.88rem]">
              <Button type="submit" variant="primary" className={otpSubmitButtonClassName} disabled={otpLoading}>
                <span className={otpSubmitLabelClassName}>
                  {t("auth.login.otp_submit")}
                </span>
              </Button>

              <div className="login-otp-actions w-full flex flex-col items-center gap-[0.74rem] max-[768px]:gap-[0.62rem] mt-[1.9rem] max-[768px]:mt-[1.45rem]">
                <button
                  type="button"
                  className={`${homeLikeOtpLinkClassName} ${androidOtpActionClassName} login-otp-action-link`}
                  onPointerUp={clearPointerKeyFocus}
                  onPointerCancel={clearPointerKeyFocus}
                  onClick={e => {
                    handleResendOtp();
                    if (e.detail !== 0) clearButtonFocus(e.currentTarget);
                  }}
                  disabled={resendLoading}
                >
                  {resendLoading ? t("auth.login.resending") : t("auth.login.resend")}
                </button>
                <button
                  type="button"
                  className={`${homeLikeOtpLinkClassName} ${androidOtpActionClassName} login-otp-action-link`}
                  onPointerUp={clearPointerKeyFocus}
                  onPointerCancel={clearPointerKeyFocus}
                  onClick={e => {
                    resetToPinStep();
                    if (e.detail !== 0) clearButtonFocus(e.currentTarget);
                  }}
                >
                  {t("auth.login.otp_back")}
                </button>
              </div>
            </div>
          </form>}

        {!isOtpStep && <>
            <div className="login-register-row text-center mt-[-0.32rem] max-md:mt-[-0.16rem] mb-[0.04rem] max-md:mb-[0.04rem]">
              <AppLink href={`${localizePath("/registreerimine", locale)}?next=${encodeURIComponent(nextUrl)}`} variant="brand" className={`${inlineLinkClassName} !text-[1.75rem] max-md:!text-[clamp(1.9rem,5.6vw,2.5rem)] ${androidRegisterLinkClassName} login-register-link`}>
                {t("auth.login.register_link")}
              </AppLink>
            </div>

            {}
          </>}
        </div>
      </div>
    </>, document.body);
  }
