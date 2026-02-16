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
import FancyCheckbox from "@/components/ui/FancyCheckbox";
import AppLink from "@/components/ui/Link";
import { EmailEnvelopeStatusIcon, LockErrorIcon, SubmitArrowIcon } from "@/components/ui/icons/AuthIcons";
import { linkBrandInlineClass } from "@/components/ui/linkStyles";
const noteBaseClassName = "flex items-center justify-center text-center text-[1.06em] max-md:text-[1.12em]";
const noteErrorClassName = "text-[#fca5a5] light:text-[#b44a4a]";
const noteInfoClassName = "text-[color:var(--pt-120)]";
const inlineLinkClassName = `${linkBrandInlineClass} text-[1.35rem] max-md:text-[1.55rem] [--link-brand-text:#c57171] [--link-brand-border-hover:#c57171] [--link-brand-shadow-hover:rgba(197,113,113,0.35)] light:[--link-color:#7A3A38] [--link-brand-shadow-hover:transparent]`;
const modalTitleClassName = "!mb-0 !mt-0 !text-[clamp(2.05rem,1.5rem+1.6vw,2.6rem)] !leading-[1.05] tracking-[0.01em] max-md:!text-[clamp(2.5rem,10.5vw,3.55rem)] max-md:!leading-[1.03] max-md:translate-y-[0.28rem] text-[#c57171] light:text-[#7a3a38] [font-family:var(--font-aino-headline),var(--font-aino),Arial,sans-serif] font-[400]";
const MODAL_FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])"
].join(", ");
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
  const [isPhoneViewport, setIsPhoneViewport] = useState(false);
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
  const [otpExpiresAt, setOtpExpiresAt] = useState(null);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [submitIconState, setSubmitIconState] = useState("idle");
  const [_invalidCredentials, setInvalidCredentials] = useState(false);
  const [emailRevealed, setEmailRevealed] = useState(false);
  const [storedEmail, setStoredEmail] = useState("");
  const [_emailValue, setEmailValue] = useState("");
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
  const zeroRepeatTimerRef = useRef(null);
  const zeroRepeatIntervalRef = useRef(null);
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
  const pinMessageClass = [noteBaseClassName, "w-[var(--pin-grid-w)] max-w-full min-h-[0.38em] leading-[1.24]", "mt-[0.02rem] max-md:mt-[0rem]", "mb-[0.0rem]", showPinMessage ? "opacity-100" : "opacity-0", error ? noteErrorClassName : noteInfoClassName].filter(Boolean).join(" ");
  const headerWrapClass = ["flex", "flex-col", "items-center", "text-center", "gap-[0.02em]", "mt-[-0.04rem]", "max-md:mt-[0.08rem]", "mb-0"].join(" ");
  const emailRowClass = ["flex", "w-full", "justify-center", "items-center", "h-[var(--login-envelope-hit)]", "mt-[-0.52rem]", "max-md:mt-[-0.3rem]", "mb-[-0.18rem]", "max-md:mb-[-0.04rem]"].join(" ");
  const emailIconClass = "inline-flex items-center justify-center rounded-full bg-transparent bg-no-repeat bg-center transition-transform duration-150 ease-out cursor-pointer border-0 shadow-none outline-none appearance-none focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-none";
  const headerMessageClass = [noteBaseClassName, "min-h-[1.4em] max-md:min-h-[1.6em] max-md:mt-[0.25rem]", error ? noteErrorClassName : noteInfoClassName, showHeaderMessage ? "" : "hidden"].filter(Boolean).join(" ");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const query = window.matchMedia("(max-width: 48em)");
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
    isPhoneViewport ? "w-full h-[100dvh] min-h-[100dvh] max-h-[100dvh] items-center justify-center" : "w-auto h-auto min-h-0 max-h-[calc(100dvh-2rem)]",
    isPhoneViewport ? "overflow-y-auto" : "max-md:max-h-[calc(100dvh-0.9rem)]",
    "overflow-x-hidden",
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
      if (emailInputRef.current) emailInputRef.current.value = "";
      return;
    }
    try {
      const stored = window.localStorage.getItem(LOGIN_EMAIL_KEY) || "";
      setStoredEmail(stored);
      setEmailValue(stored);
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
      const target = otpInputRef.current;
      if (target && typeof target.focus === "function") registerTimeout(() => target.focus(), 0);
      return;
    }
    if (!emailRevealed) {
      const target = emailIconButtonRef.current;
      if (target && typeof target.focus === "function") registerTimeout(() => target.focus(), 0);
      return;
    }
    const target = emailInputRef.current;
    if (target && typeof target.focus === "function") registerTimeout(() => target.focus(), 0);
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
      if (prefillStoredEmail) {
        try {
          window.localStorage.setItem(LOGIN_EMAIL_KEY, email);
          setStoredEmail(email);
          setEmailValue(email);
        } catch {}
      } else {
        setStoredEmail("");
        setEmailValue("");
      }
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
        markPinError();
        if ((payload?.code || "").toUpperCase() === "INVALID_CREDENTIALS") {
          setInvalidCredentials(true);
          setSubmitIconState("error");
        }
        setError(resolveAuthApiMessage(payload, "auth.login.error.generic"));
        return;
      }
      if (payload?.temp_login_token) setTempToken(payload.temp_login_token);
      if (payload?.status === "success" && payload?.temp_login_token) {
        markPinSuccess();
        await finishLogin(payload.temp_login_token);
        return;
      }
      if (payload?.status === "need_2fa" && payload?.temp_login_token) {
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
  }, [PIN_MAX, PIN_MIN, finishLogin, locale, markPinError, markPinSuccess, pinValue, prefillStoredEmail, resolveAuthApiMessage, resetIconState, storedEmail, t]);
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
    if (zeroRepeatTimerRef.current) {
      clearTimeout(zeroRepeatTimerRef.current);
      zeroRepeatTimerRef.current = null;
    }
    if (zeroRepeatIntervalRef.current) {
      clearInterval(zeroRepeatIntervalRef.current);
      zeroRepeatIntervalRef.current = null;
    }
  }, []);
  const startZeroRepeat = useCallback(() => {
    if (zeroRepeatIntervalRef.current) return;
    zeroRepeatIntervalRef.current = setInterval(() => {
      deleteOneDigit(false);
    }, 130);
  }, [deleteOneDigit]);
  const startZeroLongPress = useCallback(() => {
    if (step !== "pin") return;
    zeroLongPressFiredRef.current = false;
    stopZeroHoldActions();
    if (zeroKeyMode === "backspace") {
      zeroRepeatTimerRef.current = setTimeout(() => {
        zeroLongPressFiredRef.current = true;
        startZeroRepeat();
      }, 420);
      return;
    }
    zeroLongPressTimerRef.current = setTimeout(() => {
      setZeroKeyMode("backspace");
      zeroLongPressFiredRef.current = true;
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        try {
          navigator.vibrate(10);
        } catch {}
      }
    }, 430);
  }, [startZeroRepeat, step, stopZeroHoldActions, zeroKeyMode]);
  const cancelZeroLongPress = useCallback(() => {
    stopZeroHoldActions();
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
  const bounceKey = useCallback(el => {
    if (!el || prefs?.reduceMotion) return;
    try {
      el.animate([{
        transform: "scale(1)"
      }, {
        transform: "scale(1.075)"
      }, {
        transform: "scale(0.965)"
      }, {
        transform: "scale(1)"
      }], {
        duration: 920,
        easing: "cubic-bezier(0.25, 0.9, 0.35, 1)"
      });
    } catch {}
  }, [prefs?.reduceMotion]);
  if (!open) return null;
  const isLightTheme = prefs?.theme === "light";
  const showEmailErrorIcon = Boolean(error) || emailErrorVisual;
  const emailIconStatus = showEmailErrorIcon ? "error" : "success";
  const stopInside = e => e.stopPropagation();
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
      `}</style>
      <div ref={boxRef} id="login-modal" className={modalClasses} style={{
      "--login-modal-side-pad": isPhoneViewport ? "0px" : "1.15em",
      "--login-modal-inner-side-pad": isOtpStep
        ? isPhoneViewport
          ? "0px"
          : "1.15em"
        : isPhoneViewport
          ? "0px"
          : "0.64em",
      "--pin-btn": isPhoneViewport ? "clamp(5.15rem, 19.8vw, 5.85rem)" : "4.58rem",
      "--pin-gap-x": isPhoneViewport ? "clamp(1.26rem, 4.9vw, 1.56rem)" : "0.9rem",
      "--pin-gap-y": isPhoneViewport ? "clamp(0.68rem, 2.1vh, 0.9rem)" : "0.82rem",
      "--pin-grid-w": "calc((3 * var(--pin-btn)) + (2 * var(--pin-gap-x)))",
      "--login-email-w": isPhoneViewport ? "var(--pin-grid-w)" : "calc(var(--pin-grid-w) + 0.72rem)",
      "--login-core-w": "max(var(--pin-grid-w), var(--login-email-w, var(--pin-grid-w)))",
      "--login-modal-pad-effective": isOtpStep ? "var(--login-modal-side-pad)" : "var(--login-modal-inner-side-pad)",
      "--login-pin-modal-w": "min(90vw, max(22rem, calc(var(--pin-grid-w) + (2 * var(--login-modal-pad-effective, var(--login-modal-side-pad))) + 1.5rem)))",
      "--login-envelope-size": isPhoneViewport ? "clamp(5.45rem, 15.2vw, 6.9rem)" : "clamp(4.4rem, 7vw, 5.2rem)",
      "--login-envelope-hit": isPhoneViewport ? "clamp(5.6rem, 15.8vw, 7.1rem)" : "clamp(4.4rem, 7vw, 5.2rem)"
      ,
        width: isPhoneViewport
          ? "100%"
          : isOtpStep
            ? "min(94vw, 36rem)"
            : "var(--login-pin-modal-w)",
        minWidth: isPhoneViewport
          ? "100%"
          : isOtpStep
            ? "min(92vw, 32rem)"
            : "var(--login-pin-modal-w)",
        maxWidth: isPhoneViewport
          ? "100%"
          : isOtpStep
            ? "min(94vw, 36rem)"
            : "var(--login-pin-modal-w)",
        boxSizing: "border-box"
      }} tabIndex={-1} role="dialog" aria-modal="true" aria-label={isOtpStep ? t("auth.login.otp_title") : t("auth.login.title")} onClick={stopInside} onMouseLeave={() => {
      if (step !== "pin") return;
      if (emailRevealed && emailInputRef.current) {
        emailInputRef.current.focus();
        return;
      }
      if (!emailRevealed && emailIconButtonRef.current) emailIconButtonRef.current.focus();
    }}>
        <div className={`login-modal-shell glass-box w-full !my-0 !pt-[clamp(0.58rem,1.75vw,1.02rem)] max-md:!pt-[clamp(0.66rem,2.35vw,1.06rem)] ${
        isOtpStep
          ? "!pb-[clamp(1.55rem,3.6vw,2.35rem)] max-md:!pb-[clamp(1.18rem,3.2vw,1.62rem)]"
          : "!pb-[clamp(0.84rem,2.1vw,1.18rem)] max-md:!pb-[clamp(0.7rem,2.3vw,1.05rem)]"
      }`}>
          <button className="login-modal-close modal-close-btn absolute z-[2] !w-[2.68rem] !h-[2.68rem] max-[48em]:!w-[2.66rem] max-[48em]:!h-[2.66rem] !rounded-[0.74rem] text-[#c57171] light:text-[#7a3a38]" onClick={onClose} aria-label={t("buttons.close")} type="button" />

          <div className={headerWrapClass}>
            <div className={modalTitleClassName}>
              {isOtpStep ? t("auth.login.otp_title") : t("auth.login.title")}
            </div>
            <div className={headerMessageClass} role={error ? "alert" : showHeaderMessage ? "status" : undefined} aria-live={error ? "assertive" : showHeaderMessage ? "polite" : undefined} aria-atomic="true" aria-hidden={!showHeaderMessage}>
              {showHeaderMessage ? messageText : null}
            </div>
          </div>

        {!isOtpStep && <form className="w-full max-w-full mx-auto flex flex-col items-center gap-[0.35em] mt-[-0.24rem] max-md:mt-[-0.04rem]" onSubmit={e => {
        e.preventDefault();
        submitPinStep();
      }} autoComplete="off">
            <div id={emailHintIdRef.current} className="sr-only">
              {t("auth.email_icon_hint")}
            </div>

            <div className={emailRowClass}>
              {!emailRevealed ? <button type="button" ref={emailIconButtonRef} className={emailIconClass} style={{
            width: "var(--login-envelope-hit)",
            height: "var(--login-envelope-hit)"
          }} aria-describedby={emailHintIdRef.current} aria-label={t("auth.email_placeholder")} onClick={revealEmailInput}>
                  <EmailEnvelopeStatusIcon isLightTheme={isLightTheme} status={emailIconStatus} className="pointer-events-none h-[var(--login-envelope-size)] w-[var(--login-envelope-size)]" />
                  <span className="sr-only">{t("auth.email_icon_hint")}</span>
                </button> : <label className="block w-full">
                  <Input type="email" name="email" ref={emailInputRef} size="md" aria-label={t("auth.email_placeholder")} aria-describedby={emailHintIdRef.current} placeholder="" autoComplete="username" inputMode="email" className="block mx-auto !my-0 !w-[min(100%,var(--login-email-w,var(--pin-grid-w)))] !max-w-[var(--login-email-w,var(--pin-grid-w))] text-[1.16rem]" onMouseDown={e => {
              const node = emailInputRef.current;
              if (node && document.activeElement !== node) {
                e.preventDefault();
                node.focus();
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
            {!isMobile && <input aria-label={t("auth.pin_placeholder")} ref={hiddenInputRef} value={pinValue} inputMode="numeric" pattern={`\\d{${PIN_MIN},${PIN_MAX}}`} maxLength={PIN_MAX} className="fixed left-[-10000px] top-0 h-px w-px opacity-0 caret-transparent" tabIndex={-1} type="password" onKeyDown={onHiddenKeyDown} onInput={handlePinInputChange} onChange={handlePinInputChange} aria-describedby={pinHintIdRef.current} aria-live="off" />}

            {}
            {isMobile && <input ref={mobilePinInputRef} aria-label={t("auth.pin_placeholder")} value={pinValue} inputMode="numeric" pattern={`\\d{${PIN_MIN},${PIN_MAX}}`} maxLength={PIN_MAX} type="tel" autoComplete="off" enterKeyHint="go" onChange={handlePinInputChange} onInput={handlePinInputChange} onKeyDown={e => {
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
          "--pin-gloss-bg": isLightTheme ? "linear-gradient(135deg, rgba(255, 255, 255, 0.55) 0%, rgba(255, 255, 255, 0.22) 32%, rgba(255, 255, 255, 0) 58%, rgba(255, 255, 255, 0.14) 74%, rgba(0, 0, 0, 0.1) 100%), radial-gradient(120% 110% at 18% 16%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 64%), radial-gradient(120% 120% at 84% 90%, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0) 56%)" : "linear-gradient(135deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.06) 34%, rgba(255, 255, 255, 0) 58%, rgba(255, 255, 255, 0.05) 74%, rgba(0, 0, 0, 0.16) 100%)",
          "--pin-gloss-op": isLightTheme ? "0.42" : "0.2"
        }} aria-hidden="false" onTouchStart={handleKeypadTouchStart} onTouchEnd={handleKeypadTouchEnd} onTouchCancel={handleKeypadTouchEnd}>
                <div className="grid justify-center [grid-template-columns:repeat(3,var(--pin-btn))] [grid-auto-rows:var(--pin-btn)] gap-x-[var(--pin-gap-x)] gap-y-[var(--pin-gap-y)] w-full max-w-[calc((3*var(--pin-btn))+(2*var(--pin-gap-x)))]" role="group" aria-label={t("auth.login.title")}>
                  {keypadKeys.map((key, idx) => {
              if (key === "blank") {
                return <span key={"blank-" + String(idx)} className="inline-block w-[var(--pin-btn)] h-[var(--pin-btn)]" aria-hidden="true" />;
              }
              if (key === "help") {
                const label = t("auth.login.forgot");
                return <button key={"help-" + String(idx)} type="button" className="no-click-pulse relative grid place-items-center !w-[var(--pin-btn)] !h-[var(--pin-btn)] rounded-full overflow-hidden border-0 text-[1.85rem] max-md:text-[2.06rem] font-[360] tracking-[0.01em] [font-variant-numeric:tabular-nums] select-none [text-rendering:geometricPrecision] [-webkit-font-smoothing:antialiased] cursor-pointer transition-[transform,background,box-shadow,filter] duration-[320ms] ease-[cubic-bezier(0.25,0.9,0.35,1)] focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(197,113,113,0.18),0_12px_20px_rgba(0,0,0,0.12)] disabled:shadow-none disabled:cursor-default [background:radial-gradient(120%_120%_at_18%_16%,rgba(255,255,255,0.02)_0%,rgba(255,255,255,0)_56%),radial-gradient(120%_120%_at_86%_90%,rgba(0,0,0,0.22)_0%,rgba(0,0,0,0)_64%),linear-gradient(145deg,rgba(255,255,255,0.003)_0%,rgba(255,255,255,0.002)_42%,rgba(0,0,0,0.22)_100%)] light:[background:radial-gradient(120%_120%_at_18%_16%,rgba(255,255,255,0.62)_0%,rgba(255,255,255,0)_62%),radial-gradient(120%_120%_at_86%_90%,rgba(0,0,0,0.06)_0%,rgba(0,0,0,0)_64%),linear-gradient(145deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.12)_55%,rgba(255,255,255,0.06)_100%)] text-[#c57171] light:text-[#7a3a38] after:content-[''] after:absolute after:inset-0 after:rounded-full after:pointer-events-none after:[background:var(--pin-gloss-bg)] after:opacity-[var(--pin-gloss-op)]" style={{
                  boxShadow: isLightTheme ? "0 10px 18px rgba(0, 0, 0, 0.1), inset 0 0 0 var(--pin-border-w) rgba(17, 24, 39, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.78), inset 0 -1px 0 rgba(0, 0, 0, 0.12)" : "0 10px 18px rgba(0, 0, 0, var(--pin-shadow)), inset 0 0 0 var(--pin-border-w) rgba(255, 255, 255, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.06), inset 0 -1px 0 rgba(0, 0, 0, 0.46)",
                  "--pin-gloss-op": isLightTheme ? "0.26" : "0.18"
                }} ref={el => {
                  keypadRefs.current[idx] = el;
                  helpButtonRef.current = el;
                }} onKeyDown={e => handleKeypadKeyDown(e, idx)} onPointerDown={e => {
                  const el = e.currentTarget;
                  bounceKey(el);
                }} onClick={() => setHelpOpen(p => !p)} disabled={pinLoading} aria-label={label} aria-haspopup="dialog" aria-expanded={helpOpen}>
                          {t("symbols.question")}
                        </button>;
              }
              if (key === "submit") {
                const label = t("auth.login.submit");
                const submitFilled = Math.max(0, Math.min(PIN_MAX, pinValue.length));
                const submitError = submitIconState === "error";
                const arrowScale = 1 + submitFilled / PIN_MAX * 0.08;
                return <button key={"submit-" + String(idx)} type="button" className="no-click-pulse relative grid place-items-center !w-[var(--pin-btn)] !h-[var(--pin-btn)] rounded-full overflow-hidden border-0 text-[1.6rem] max-md:text-[1.85rem] font-[360] tracking-[0.01em] [font-variant-numeric:tabular-nums] select-none [text-rendering:geometricPrecision] [-webkit-font-smoothing:antialiased] cursor-pointer transition-[transform,background,box-shadow,filter] duration-[320ms] ease-[cubic-bezier(0.25,0.9,0.35,1)] focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(197,113,113,0.18),0_12px_20px_rgba(0,0,0,0.12)] disabled:shadow-none disabled:cursor-default [background:radial-gradient(120%_120%_at_18%_16%,rgba(255,255,255,0.02)_0%,rgba(255,255,255,0)_56%),radial-gradient(120%_120%_at_86%_90%,rgba(0,0,0,0.22)_0%,rgba(0,0,0,0)_64%),linear-gradient(145deg,rgba(255,255,255,0.003)_0%,rgba(255,255,255,0.002)_42%,rgba(0,0,0,0.22)_100%)] light:[background:radial-gradient(120%_120%_at_18%_16%,rgba(255,255,255,0.62)_0%,rgba(255,255,255,0)_62%),radial-gradient(120%_120%_at_86%_90%,rgba(0,0,0,0.06)_0%,rgba(0,0,0,0)_64%),linear-gradient(145deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.12)_55%,rgba(255,255,255,0.06)_100%)] after:content-[''] after:absolute after:inset-0 after:rounded-full after:pointer-events-none after:[background:var(--pin-gloss-bg)] after:opacity-[var(--pin-gloss-op)]" style={{
                  boxShadow: isLightTheme ? "0 10px 18px rgba(0, 0, 0, 0.1), inset 0 0 0 var(--pin-border-w) rgba(17, 24, 39, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.78), inset 0 -1px 0 rgba(0, 0, 0, 0.12)" : "0 10px 18px rgba(0, 0, 0, var(--pin-shadow)), inset 0 0 0 var(--pin-border-w) rgba(255, 255, 255, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.06), inset 0 -1px 0 rgba(0, 0, 0, 0.46)",
                  "--pin-gloss-op": isLightTheme ? "0.26" : "0.18",
                  cursor: pinLoading ? "var(--cursor-default)" : undefined
                }} ref={el => keypadRefs.current[idx] = el} onKeyDown={e => {
                  handleKeypadKeyDown(e, idx);
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    submitPinStep();
                  }
                }} onPointerDown={e => {
                  const el = e.currentTarget;
                  bounceKey(el);
                }} onClick={() => submitPinStep()} disabled={pinLoading} aria-label={label}>
                          <span className="absolute inset-0 grid place-items-center" aria-hidden="true">
                            <SubmitInnerEdgeDotsProgress
                              filled={submitFilled}
                              max={PIN_MAX}
                              isLightTheme={isLightTheme}
                              isError={submitError}
                              className="absolute inset-0 pointer-events-none"
                            />
                            {submitError ? <LockErrorIcon className="login-submit-icon h-[clamp(1.42rem,3.8vw,1.7rem)] w-[clamp(1.42rem,3.8vw,1.7rem)]" /> : <SubmitArrowIcon isLightTheme={isLightTheme} className="login-submit-icon h-[clamp(1.14rem,3.15vw,1.35rem)] w-[clamp(1.14rem,3.15vw,1.35rem)] max-md:h-[clamp(1.56rem,5.7vw,1.95rem)] max-md:w-[clamp(1.56rem,5.7vw,1.95rem)] translate-x-[0.08rem] max-md:translate-x-[0.11rem] transition-transform duration-200 ease-out" style={{
                            transform: `scale(${arrowScale.toFixed(3)})`
                          }} />}
                          </span>
                        </button>;
              }
              const isZeroKey = key === "zero";
              const digitToAppend = isZeroKey ? "0" : key;
              const digitLabel = isZeroKey ? zeroKeyMode === "backspace" ? t("auth.login.clear_short") : t("auth.login.key", {
                digit: 0
              }) : t("auth.login.key", {
                digit: key
              });
              return <button key={key + String(idx)} type="button" className={["no-click-pulse", "relative", "grid", "place-items-center", "!w-[var(--pin-btn)]", "!h-[var(--pin-btn)]", "rounded-full", "overflow-hidden", "border-0", "text-[1.6rem]", "max-md:text-[2.02rem]", "font-[360]", "tracking-[0.01em]", "[font-variant-numeric:tabular-nums]", "select-none", "[text-rendering:geometricPrecision]", "[-webkit-font-smoothing:antialiased]", "cursor-pointer", "transition-[transform,background,box-shadow,filter]", "duration-[320ms]", "ease-[cubic-bezier(0.25,0.9,0.35,1)]", "focus-visible:outline-none", "focus-visible:shadow-[0_0_0_3px_rgba(197,113,113,0.18),0_12px_20px_rgba(0,0,0,0.12)]", "disabled:shadow-none", "disabled:cursor-default", "after:content-['']", "after:absolute", "after:inset-0", "after:rounded-full", "after:pointer-events-none", "after:[background:var(--pin-gloss-bg)]", "after:opacity-[var(--pin-gloss-op)]"].filter(Boolean).join(" ")} style={{
                color: isLightTheme ? "rgba(31, 41, 55, 0.92)" : "rgba(255, 255, 255, 0.92)",
                background: isLightTheme ? "radial-gradient(120% 120% at 18% 16%, rgba(255, 255, 255, 0.92) 0%, rgba(255, 255, 255, 0) 62%), radial-gradient(120% 120% at 86% 90%, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0) 64%), linear-gradient(145deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.22) 55%, rgba(255, 255, 255, 0.14) 100%)" : "radial-gradient(120% 120% at 18% 16%, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0) 56%), radial-gradient(120% 120% at 86% 90%, rgba(0, 0, 0, 0.48) 0%, rgba(0, 0, 0, 0) 64%), linear-gradient(145deg, rgba(255, 255, 255, var(--pin-a)) 0%, rgba(255, 255, 255, 0.004) 42%, rgba(0, 0, 0, 0.4) 100%)",
                boxShadow: isLightTheme ? "0 10px 18px rgba(0, 0, 0, 0.1), inset 0 0 0 var(--pin-border-w) rgba(17, 24, 39, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.78), inset 0 -1px 0 rgba(0, 0, 0, 0.12)" : "0 10px 18px rgba(0, 0, 0, var(--pin-shadow)), inset 0 0 0 var(--pin-border-w) rgba(255, 255, 255, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.06), inset 0 -1px 0 rgba(0, 0, 0, 0.46)"
              }} ref={el => keypadRefs.current[idx] = el} onKeyDown={e => handleKeypadKeyDown(e, idx)} onPointerDown={e => {
                const el = e.currentTarget;
                bounceKey(el);
                if (isZeroKey) startZeroLongPress();
              }} onPointerUp={() => {
                if (isZeroKey) cancelZeroLongPress();
              }} onPointerCancel={() => {
                if (isZeroKey) cancelZeroLongPress();
              }} onPointerLeave={() => {
                if (isZeroKey) cancelZeroLongPress();
              }} onClick={() => {
                if (isZeroKey && zeroLongPressFiredRef.current) {
                  zeroLongPressFiredRef.current = false;
                  if (zeroKeyMode === "backspace" && !pinValue) {
                    setZeroKeyMode("digit");
                  }
                  return;
                }
                if (isZeroKey) {
                  if (zeroKeyMode === "backspace") {
                    if (!pinValue) {
                      setZeroKeyMode("digit");
                      if (typeof navigator !== "undefined" && navigator.vibrate) {
                        try {
                          navigator.vibrate(8);
                        } catch {}
                      }
                      return;
                    }
                    handleBackspace();
                    setZeroKeyMode("digit");
                    return;
                  }
                  appendDigit(digitToAppend);
                  return;
                }
                appendDigit(digitToAppend);
              }} disabled={pinLoading} aria-label={digitLabel}>
                        {isZeroKey ? zeroKeyMode === "backspace" ? <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false" className="block h-[1.24em] w-[1.24em]">
                            <path d="M13.2 7.35H5.35l2.8-2.35L7.2 4.05 3.1 8l4.1 3.95L8.15 11l-2.8-2.35h7.85z" fill="currentColor" />
                          </svg> : <span className="font-inherit font-[inherit] text-[1em] tracking-[inherit]" aria-hidden="true">
                            {digitToAppend}
                          </span> : key}
                      </button>;
            })}
                </div>

                {helpOpen && <div ref={helpPopoverRef} role="dialog" aria-modal="false" aria-label={t("auth.login.forgot")} className="login-help-popover absolute left-1/2 -translate-x-1/2 bottom-[calc(var(--pin-btn)+0.72rem)] rounded-[16px] bg-[rgba(0,0,0,0.86)] text-[rgba(255,255,255,0.92)] px-[0.95rem] pt-[0.72rem] pb-[0.68rem] z-30 light:bg-[rgba(255,255,255,0.94)] light:text-[#111827]" style={{
                  width: isMobile ? "min(19.4rem, calc(100vw - 2.2rem))" : "19.2rem",
                  maxWidth: "calc(100vw - 1.6rem)"
                }}>
                    <button type="button" className="absolute right-[0.12rem] top-[0.04rem] w-[2.05rem] h-[2.05rem] rounded-full border-0 bg-transparent text-[1.56rem] leading-none cursor-pointer text-[#c57171] light:text-[#7a3a38]" aria-label={t("buttons.close")} onClick={() => setHelpOpen(false)}>
                      {t("symbols.times")}
                    </button>

                    <div className="flex flex-col pr-[1.28rem] max-w-[inherit]">
                      <div className="text-[1.12rem] max-md:text-[1.2rem] leading-[1.36] mt-[0.06rem] opacity-90 light:text-[#1f2937] light:opacity-100 hyphens-none">
                        {t("auth.login.help_hold_zero_before")}{" "}
                        <strong>{0}</strong>{" "}
                        {t("auth.login.help_hold_zero_after")}{" "}
                        <span className="inline-flex items-center align-[-0.06em] leading-none" aria-hidden="true">
                          {"("}
                          <svg viewBox="0 0 16 16" fill="none" focusable="false" className="h-[1.04em] w-[1.04em]">
                            <path d="M13.2 7.35H5.35l2.8-2.35L7.2 4.05 3.1 8l4.1 3.95L8.15 11l-2.8-2.35h7.85z" fill="currentColor" />
                          </svg>
                          {")"}
                        </span>
                        .
                      </div>
                      <div className="mt-[0.36rem] text-[1.07rem] max-md:text-[1.14rem] leading-[1.34] opacity-90 light:text-[#1f2937] light:opacity-100 hyphens-none">
                        {t("auth.login.help_wrong_pin_note")}
                      </div>

                      <AppLink href="/uuenda-pin" variant="brand" className="mt-[0.58rem] self-start text-[1.16rem] font-[500] no-underline whitespace-nowrap" onClick={() => setHelpOpen(false)}>
                        {t("auth.login.forgot")}
                      </AppLink>
                    </div>
                  </div>}
              </div>}

            {}
            <div className={pinMessageClass} role={error ? "alert" : showPinMessage ? "status" : undefined} aria-live={error ? "assertive" : showPinMessage ? "polite" : undefined} aria-atomic="true" aria-hidden={!showPinMessage}>
              {showPinMessage ? messageText : null}
            </div>

            <div className="text-center mt-[-0.2rem] mb-[0.08rem]">
              <button type="button" className={`${inlineLinkClassName} pin-layout-toggle`} onClick={toggleKeypad} aria-label={isMobile ? t("auth.login.toggle_keypad_mobile_aria") : t("auth.login.toggle_keypad_desktop_aria")}>
                {t("auth.login.toggle_keypad")}
              </button>
            </div>
          </form>}

        {isOtpStep && <form className="w-full max-w-full mx-auto flex flex-col items-center" onSubmit={e => {
        e.preventDefault();
        submitOtpStep();
      }}>
            <div className="w-full max-w-[30rem] flex flex-col gap-[0.48rem] text-[color:var(--pt-150)] light:text-[rgba(31,41,55,0.86)]">
                {info && <p role="status" className="m-0 font-semibold text-[color:var(--pt-30)] light:text-[rgba(31,41,55,0.92)] text-[1.04rem]">
                    {info}
                  </p>}
                <p className="m-0 leading-[1.45] text-[1.02rem] max-md:text-[1.09rem]">
                  {t("auth.login.otp_description", {
                email: emailMask || ""
              })}
                </p>
                {otpDeadlineLabel && <p className="mt-[0.25rem] inline-flex items-center self-start rounded-full border border-solid border-[color:color-mix(in_srgb,var(--otp-accent)_45%,transparent)] bg-[color:color-mix(in_srgb,var(--otp-accent)_18%,transparent)] px-[0.6rem] py-[0.22rem] font-semibold tracking-[0.015em] text-[0.98rem] text-[color:var(--pt-30)] light:border-[rgba(197,113,113,0.32)] light:bg-[rgba(197,113,113,0.14)] light:text-[rgba(31,41,55,0.92)]" id="otp-deadline">
                    {t("auth.login.otp_expires", {
                time: otpDeadlineLabel
              })}
                  </p>}
            </div>

            <div className="w-full mt-[0.96rem] flex justify-center">
              <Input id="otp-code-input" ref={otpInputRef} type="text" dir="ltr" inputMode="numeric" autoComplete="one-time-code" aria-label={t("auth.login.otp_placeholder")} aria-describedby={otpInputDescribedBy} aria-invalid={otpInlineError ? "true" : undefined} maxLength={6} value={otpValue} onChange={e => setOtpValue(e.target.value.replace(/\D/g, "").slice(0, 6))} onInput={e => setOtpValue(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder={t("auth.login.otp_short_placeholder", "Kinnituskood")} className="!w-[min(100%,17.4rem)] !max-w-[17.4rem] text-left placeholder:text-center [font-variant-numeric:tabular-nums] tracking-[0.06em] font-semibold text-[1.1rem] py-[0.75rem] px-[1.15rem] min-h-[3.15rem] rounded-full" />
            </div>
            {otpInlineError ? <p id="otp-inline-error" role="alert" className="mt-[0.38rem] text-[1.03rem] leading-[1.35] text-center text-[#fca5a5] light:text-[#b44a4a]">
                {otpInlineError}
              </p> : null}

            <div className="w-full mt-[0.95rem] flex justify-center">
              <div className="w-full max-w-[21.8rem]">
                <FancyCheckbox id="remember-device" checked={rememberDevice} onChange={checked => setRememberDevice(checked)} label={t("auth.login.remember_device")} />
              </div>
            </div>

            <div className="w-full max-w-[30rem] flex flex-col items-center mt-[1.1rem]">
              <Button type="submit" variant="primary" className="w-auto min-w-[12.1rem] text-[1.22rem] normal-case tracking-[0.02em] rounded-[1rem] py-[0.82rem] px-[2.1rem] [--glow-rgb:225,160,160]" disabled={otpLoading}>
                {otpLoading ? t("auth.login.otp_submitting") : t("auth.login.otp_submit")}
              </Button>

              <div className="w-full flex flex-col items-center gap-[0.62rem] mt-[0.84rem]">
                <Button type="button" variant="linkBrand" className="text-[1.14rem] tracking-[0.02em] !py-[0.14rem]" onClick={handleResendOtp} disabled={resendLoading}>
                  {resendLoading ? t("auth.login.resending") : t("auth.login.resend")}
                </Button>
                <Button type="button" variant="linkBrand" className="text-[1.14rem] tracking-[0.02em] !py-[0.14rem]" onClick={resetToPinStep}>
                  {t("auth.login.otp_back")}
                </Button>
              </div>
            </div>
          </form>}

        {!isOtpStep && <>
            <div className="text-center mt-[-0.2rem] max-md:mt-[-0.08rem] mb-[0.04rem] max-md:mb-[0.04rem]">
              <AppLink href={`${localizePath("/registreerimine", locale)}?next=${encodeURIComponent(nextUrl)}`} variant="brand" className={`${inlineLinkClassName} !text-[1.75rem] max-md:!text-[clamp(1.9rem,5.6vw,2.5rem)]`}>
                {t("auth.login.register_link")}
              </AppLink>
            </div>

            {}
          </>}
        </div>
      </div>
    </>, document.body);
  }

