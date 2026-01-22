"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createPortal } from "react-dom";
import { flushSync } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useAccessibility } from "@/components/accessibility/AccessibilityProvider";
import { useI18n } from "@/components/i18n/I18nProvider";
import Button from "@/components/ui/Button";
import { localizePath } from "@/lib/localizePath";
const noteBaseClassName = "flex items-center justify-center text-center text-[1.06em] max-md:text-[1.12em]";
const noteErrorClassName = "text-[#fca5a5]";
const noteInfoClassName = "text-[color:var(--pt-120)]";
const inlineLinkClassName = "inline-block font-[500] tracking-[0.02em] text-[#f2e3d4] px-[0.18em] py-[0.02em] rounded-[0.32em] border-2 border-transparent transition-[border,box-shadow] duration-150 hover:border-[#e1a0a0] hover:shadow-[0_0_0.4375rem_0_rgba(175,170,163,0.4)] focus-visible:border-[#e1a0a0] focus-visible:shadow-[0_0_0.4375rem_0_rgba(175,170,163,0.4)] light:text-[color:var(--link-color)] light:hover:border-[color:var(--link-color)] light:focus-visible:border-[color:var(--link-color)]";
const modalTitleClassName = "!mb-0 !mt-0 !text-[clamp(2.05rem,1.5rem+1.6vw,2.6rem)] !leading-[1.05] tracking-[0.01em] max-md:!text-[clamp(3rem,8.8vw,4.4rem)] max-md:!leading-[1.02] [font-family:var(--font-aino-headline),var(--font-aino),Arial,sans-serif] font-[400]";
function SubmitArrowOverlayWhite({
  filled = 0,
  max = 8
}) {
  if (filled <= 0) return null;
  const VIEWBOX = "0 0 24 24";
  const ARROW_D = "M11.2 8.3 L14.8 12 L11.2 15.7";
  const STROKE_W = 1.2;
  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
  const TOTAL = 100;
  const clamped = Math.max(0, Math.min(max, filled));
  const eased = easeOutCubic(clamped / max);
  const seg = Math.max(0, Math.min(TOTAL, eased * TOTAL));
  return <svg width="100%" height="100%" viewBox={VIEWBOX} preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false" style={{
    display: "block"
  }}>
      <path d={ARROW_D} pathLength={TOTAL} fill="none" stroke="#ffffffef" strokeWidth={STROKE_W} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${seg} ${TOTAL}`} strokeDashoffset="0" style={{
      transition: "stroke-dasharray 260ms cubic-bezier(0.16, 1, 0.3, 1)"
    }} />
    </svg>;
}
export default function LoginModal({
  open,
  onClose
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
  const [step, setStep] = useState("pin");
  const [pinValue, setPinValue] = useState("");
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
  const [_submitIconState, _setSubmitIconState] = useState("idle");
  const [invalidCredentials, setInvalidCredentials] = useState(false);
  const [emailRevealed, setEmailRevealed] = useState(false);
  const [storedEmail, setStoredEmail] = useState("");
  const [emailValue, setEmailValue] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);
  const helpButtonRef = useRef(null);
  const helpPopoverRef = useRef(null);
  const hasEmailValue = (emailValue || "").trim().length > 0;
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
  const zeroLongPressTimerRef = useRef(null);
  const zeroLongPressFiredRef = useRef(false);
  const isOtpStep = step === "otp";
  const hasMessage = Boolean(error || info && !isOtpStep);
  const messageText = error ? error : info && !isOtpStep ? info : "";
  const showHeaderMessage = isOtpStep && hasMessage;
  const showPinMessage = !isOtpStep && hasMessage;
  const pinMessageClass = showPinMessage ? [noteBaseClassName, "mt-[0.65rem]", "mb-[0.02rem]", error ? noteErrorClassName : noteInfoClassName].filter(Boolean).join(" ") : "hidden";
  const headerWrapClass = ["flex", "flex-col", "items-center", "text-center", "gap-[0.3em]", "mt-0", "max-md:mt-[0.4rem]", emailRevealed ? "mb-[0.6rem]" : "mb-0"].join(" ");
  const emailRowClass = ["flex", "justify-center", emailRevealed ? "mt-[0.8rem] mb-[0.6rem]" : "-mt-3 mb-0"].join(" ");
  const emailIconClass = "login-email-icon-btn inline-flex items-center justify-center rounded-full bg-transparent bg-no-repeat bg-center transition-transform duration-150 ease-out cursor-pointer border-0 shadow-none outline-none appearance-none focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-none";
  const headerMessageClass = [noteBaseClassName, "min-h-[1.4em] max-md:min-h-[1.6em] max-md:mt-[0.25rem]", error ? noteErrorClassName : noteInfoClassName, showHeaderMessage ? "" : "hidden"].filter(Boolean).join(" ");
  const modalClasses = [
    "login-modal-root",
    "login-modal-box",
    "compact-modal",
    isOtpStep ? "login-modal--otp" : "",
    "fixed",
    "left-1/2",
    "top-1/2",
    "-translate-x-1/2",
    "-translate-y-1/2",
    "z-[100]",
    "flex",
    "flex-col",
    "w-auto",
    "h-auto",
    "min-h-0",
    "max-h-[calc(100dvh-2rem)]",
    "overflow-x-hidden",
    "gap-0",
    "!rounded-[2.2rem]",
    "pt-[0.1em]",
    "pb-[0.7em]",
    "px-[var(--login-modal-side-pad)]",
    "max-md:!left-0",
    "max-md:!top-0",
    "max-md:!translate-x-0",
    "max-md:!translate-y-0",
    "max-md:!w-screen",
    "max-md:!h-[100dvh]",
    "max-md:!max-h-[100dvh]",
    "max-md:!rounded-none",
    "max-md:!px-[1.2rem]",
    "max-md:!pt-[calc(env(safe-area-inset-top,0px)+0.2rem)]",
    "max-md:!pb-[calc(env(safe-area-inset-bottom,0px)+0.8rem)]",
    "max-md:!bg-[rgba(0,0,0,0.55)]",
    "max-md:!backdrop-blur-[1.4rem]",
    "max-md:!backdrop-saturate-[125%]",
    "max-md:gap-[0.4em]"
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
  useEffect(() => {
    if (!open) {
      setHelpOpen(false);
      return;
    }
    if (step !== "pin") setHelpOpen(false);
  }, [open, step]);
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
      onClose?.();
      router.replace(nextUrl);
      router.refresh();
    }
  }, [open, status, session, nextUrl, router, onClose]);
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
    setSubmitIconState("idle");
    setInvalidCredentials(false);
    setHelpOpen(false);
  }, [open]);
  useEffect(() => {
    if (!open || isOtpStep) return;
    try {
      const stored = window.localStorage.getItem(LOGIN_EMAIL_KEY) || "";
      setStoredEmail(stored);
      setEmailValue(stored);
      if (emailInputRef.current) emailInputRef.current.value = stored;
    } catch {}
  }, [open, isOtpStep]);
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
      if (target && typeof target.focus === "function") setTimeout(() => target.focus(), 0);
      return;
    }
    if (!emailRevealed) {
      const target = emailIconButtonRef.current;
      if (target && typeof target.focus === "function") setTimeout(() => target.focus(), 0);
      return;
    }
    const target = emailInputRef.current;
    if (target && typeof target.focus === "function") setTimeout(() => target.focus(), 0);
  }, [open, isOtpStep, emailRevealed]);
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
    onClose?.();
    router.replace(nextUrl);
    router.refresh();
    return true;
  }, [markPinError, markPinSuccess, nextUrl, onClose, router, t]);
  const submitPinStep = useCallback(async () => {
    setError("");
    setInfo("");
    setPinError(false);
    resetIconState();
    const emailInput = boxRef.current?.querySelector('input[name="email"]');
    const email = String(emailInput?.value || storedEmail || "").trim().toLowerCase();
    const pin = pinValue.replace(/\s+/g, "");
    if (!email) {
      markPinError();
      setError(t("auth.login.error.email_required"));
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      markPinError();
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
      try {
        window.localStorage.setItem(LOGIN_EMAIL_KEY, email);
        setStoredEmail(email);
        setEmailValue(email);
      } catch {}
      const res = await fetch("/api/auth/login-step1", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          pin
        })
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        markPinError();
        if ((payload?.code || "").toUpperCase() === "INVALID_CREDENTIALS") {
          setInvalidCredentials(true);
          setSubmitIconState("error");
        }
        setError(payload?.message || t("auth.login.error.generic"));
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
        return;
      }
      markPinError();
      setError(payload?.message || t("auth.login.error.generic"));
    } catch (err) {
      console.error("login-step1 error", err);
      markPinError();
      setError(t("auth.login.error.generic"));
    } finally {
      setPinLoading(false);
    }
  }, [PIN_MAX, PIN_MIN, finishLogin, markPinError, markPinSuccess, pinValue, resetIconState, storedEmail, t]);
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
    const tid = setTimeout(() => {
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
      clearTimeout(tid);
      window.removeEventListener("keydown", keyListener);
    };
  }, [open, step, emailRevealed, onHiddenKeyDown, isMobile]);
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
  const handleBackspace = useCallback(() => {
    if (step !== "pin") return;
    setPinValue(p => p.slice(0, -1));
    setError("");
    resetIconState();
    setPinError(false);
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(6);
      } catch {}
    }
  }, [resetIconState, step]);
  const handleClear = useCallback(() => {
    if (step !== "pin") return;
    setPinValue("");
    setError("");
    resetIconState();
    setPinError(false);
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(6);
      } catch {}
    }
  }, [resetIconState, step]);
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
  const startZeroLongPress = useCallback(() => {
    if (step !== "pin") return;
    zeroLongPressFiredRef.current = false;
    if (zeroLongPressTimerRef.current) clearTimeout(zeroLongPressTimerRef.current);
    zeroLongPressTimerRef.current = setTimeout(() => {
      zeroLongPressFiredRef.current = true;
      handleClear();
    }, 450);
  }, [handleClear, step]);
  const cancelZeroLongPress = useCallback(() => {
    if (zeroLongPressTimerRef.current) {
      clearTimeout(zeroLongPressTimerRef.current);
      zeroLongPressTimerRef.current = null;
    }
  }, []);
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
          remember_device: rememberDevice
        })
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(payload?.message || t("auth.login.error.generic"));
        return;
      }
      if (payload?.status === "verified") {
        await finishLogin(payload?.temp_login_token || tempToken);
        return;
      }
      setError(payload?.message || t("auth.login.error.generic"));
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
          temp_login_token: tempToken
        })
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(payload?.message || t("auth.login.error.generic"));
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
    resetIconState();
    setPinError(false);
  };
  const revealEmailInput = useCallback(() => {
    if (emailRevealed) return;
    setEmailRevealed(true);
    setError("");
    setTimeout(() => {
      const node = emailInputRef.current;
      if (!node) return;
      if (!node.value && storedEmail) node.value = storedEmail;
      setEmailValue(node.value || "");
      node.focus();
    }, 0);
  }, [emailRevealed, storedEmail]);
  const toggleKeypad = () => {
    if (isMobile) {
      if (!useNativeKeyboard) {
        flushSync(() => setUseNativeKeyboard(true));
        try {
          mobilePinInputRef.current?.focus?.({
            preventScroll: true
          });
        } catch {
          mobilePinInputRef.current?.focus?.();
        }
      } else {
        setUseNativeKeyboard(false);
        try {
          mobilePinInputRef.current?.blur?.();
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
        transform: "scale(1.095)"
      }, {
        transform: "scale(0.985)"
      }, {
        transform: "scale(1)"
      }], {
        duration: 560,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)"
      });
    } catch {}
  }, [prefs?.reduceMotion]);
  if (!open) return null;
  const isLightTheme = prefs?.theme === "light";
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
      <div className="login-modal-backdrop" onClick={onClose} />
      <div ref={boxRef} id="login-modal" className={modalClasses} style={{
      "--login-envelope-size": "clamp(4.4rem, 7vw, 5.2rem)",
      "--login-envelope-hit": "clamp(4.4rem, 7vw, 5.2rem)",
      minWidth: "calc(var(--pin-grid-w) + (2 * var(--login-modal-side-pad)) + var(--login-modal-min-extra))",
      maxWidth: "min(var(--login-modal-max-vw), calc(var(--pin-grid-w) + (2 * var(--login-modal-side-pad)) + var(--login-modal-max-extra)))"
    }} tabIndex={-1} role="dialog" aria-modal="true" aria-label={isOtpStep ? t("auth.login.otp_title") : t("auth.login.title")} onClick={stopInside} onMouseLeave={() => {
      if (step !== "pin") return;
      if (emailRevealed && emailInputRef.current) {
        emailInputRef.current.focus();
        return;
      }
      if (!emailRevealed && emailIconButtonRef.current) emailIconButtonRef.current.focus();
    }}>
        <button className="login-modal-close modal-close-btn" onClick={onClose} aria-label={t("buttons.close")} type="button" />

        <div className={headerWrapClass}>
          <div className={modalTitleClassName}>
            {isOtpStep ? t("auth.login.otp_title") : t("auth.login.title")}
          </div>
          <div className={headerMessageClass} role={error ? "alert" : showHeaderMessage ? "status" : undefined} aria-live={error ? "assertive" : showHeaderMessage ? "polite" : undefined} aria-atomic="true" aria-hidden={!showHeaderMessage}>
            {showHeaderMessage ? messageText : null}
          </div>
        </div>

        {!isOtpStep && <form className="login-modal-form compact" onSubmit={e => {
        e.preventDefault();
        submitPinStep();
      }} autoComplete="off">
            <div id={emailHintIdRef.current} className="sr-only">
              {t("auth.email_icon_hint")}
            </div>

            <div className={emailRowClass}>
              {!emailRevealed ? <button type="button" ref={emailIconButtonRef} className={`${emailIconClass}${hasEmailValue ? " login-email-icon-btn--known" : ""}${invalidCredentials ? " login-email-icon-btn--error" : ""}`} aria-describedby={emailHintIdRef.current} aria-label={t("auth.email_placeholder")} onClick={revealEmailInput}>
                  <span className="sr-only">{t("auth.email_icon_hint")}</span>
                </button> : <label className="login-email-label">
                  <input className={`input-modern input-email-top input-email-icon compact-email block mx-auto text-[1.2rem] py-[0.8rem] px-[1.2rem] !mt-[0.8rem] !mb-[0.9rem] w-[clamp(16.5rem,19vw,18rem)] max-md:w-[min(100%,var(--pin-grid-w))] max-md:max-w-[var(--pin-grid-w)]${hasEmailValue ? " input-email-icon--filled" : ""}`} type="email" name="email" ref={emailInputRef} aria-label={t("auth.email_placeholder")} aria-describedby={emailHintIdRef.current} placeholder="" autoComplete="username" inputMode="email" onMouseDown={e => {
              const node = emailInputRef.current;
              if (node && document.activeElement !== node) {
                e.preventDefault();
                node.focus();
              }
            }} onKeyDown={e => {
              if (e.key === "Enter") e.preventDefault();
            }} onChange={e => {
              setEmailValue(e.target.value || "");
              resetIconState();
              setError("");
            }} />
                </label>}
            </div>

            <div id={pinHintIdRef.current} className="sr-only">
              {t("auth.login.pin_hint")}
            </div>

            {}
            {!isMobile && <input aria-label={t("auth.pin_placeholder", {
          min: PIN_MIN,
          max: PIN_MAX
        })} ref={hiddenInputRef} value={pinValue} inputMode="numeric" pattern={`\\d{${PIN_MIN},${PIN_MAX}}`} maxLength={PIN_MAX} className="sr-only pin-hidden-input" tabIndex={0} type="password" onKeyDown={onHiddenKeyDown} onInput={handlePinInputChange} onChange={handlePinInputChange} aria-describedby={pinHintIdRef.current} aria-live="off" />}

            {}
            {isMobile && <input ref={mobilePinInputRef} aria-label={t("auth.pin_placeholder", {
          min: PIN_MIN,
          max: PIN_MAX
        })} value={pinValue} inputMode="numeric" pattern={`\\d{${PIN_MIN},${PIN_MAX}}`} maxLength={PIN_MAX} type="tel" autoComplete="current-password" onChange={handlePinInputChange} onKeyDown={e => {
          if (e.key === "Enter") {
            e.preventDefault();
            submitPinStep();
          }
        }} aria-describedby={pinHintIdRef.current} style={{
          position: "fixed",
          left: 0,
          bottom: 0,
          opacity: 0,
          width: 1,
          height: 1,
          zIndex: -1,
          background: "transparent",
          border: "none",
          padding: 0,
          margin: 0
        }} />}

            {!(isMobile && useNativeKeyboard) && <div className="relative flex w-full justify-center mt-[0.05rem] mb-[-0.1rem] overflow-visible" style={{
          "--pin-btn": "4.35rem",
          "--pin-gap-x": "0.92rem",
          "--pin-gap-y": "0.78rem",
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
                return <span key={`blank-${idx}`} className="inline-block w-[var(--pin-btn)] h-[var(--pin-btn)]" aria-hidden="true" />;
              }
              if (key === "help") {
                const label = t("auth.login.forgot");
                return <button key={`help-${idx}`} type="button" className="no-click-pulse relative grid place-items-center !w-[var(--pin-btn)] !h-[var(--pin-btn)] rounded-full overflow-hidden border-0 text-[1.85rem] font-[360] tracking-[0.01em] [font-variant-numeric:tabular-nums] select-none [text-rendering:geometricPrecision] [-webkit-font-smoothing:antialiased] cursor-pointer transition-[transform,background,box-shadow,filter] duration-150 ease-out focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(197,113,113,0.18),0_12px_20px_rgba(0,0,0,0.12)] disabled:shadow-none disabled:cursor-default [background:radial-gradient(120%_120%_at_18%_16%,rgba(255,255,255,0.02)_0%,rgba(255,255,255,0)_56%),radial-gradient(120%_120%_at_86%_90%,rgba(0,0,0,0.22)_0%,rgba(0,0,0,0)_64%),linear-gradient(145deg,rgba(255,255,255,0.003)_0%,rgba(255,255,255,0.002)_42%,rgba(0,0,0,0.22)_100%)] light:[background:radial-gradient(120%_120%_at_18%_16%,rgba(255,255,255,0.62)_0%,rgba(255,255,255,0)_62%),radial-gradient(120%_120%_at_86%_90%,rgba(0,0,0,0.06)_0%,rgba(0,0,0,0)_64%),linear-gradient(145deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.12)_55%,rgba(255,255,255,0.06)_100%)] text-[#c57171] light:text-[#7a3a38] after:content-[''] after:absolute after:inset-0 after:rounded-full after:pointer-events-none after:[background:var(--pin-gloss-bg)] after:opacity-[var(--pin-gloss-op)]" style={{
                  boxShadow: isLightTheme ? "0 10px 18px rgba(0, 0, 0, 0.1), inset 0 0 0 var(--pin-border-w) rgba(17, 24, 39, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.78), inset 0 -1px 0 rgba(0, 0, 0, 0.12)" : "0 10px 18px rgba(0, 0, 0, var(--pin-shadow)), inset 0 0 0 var(--pin-border-w) rgba(255, 255, 255, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.06), inset 0 -1px 0 rgba(0, 0, 0, 0.46)",
                  "--pin-gloss-op": isLightTheme ? "0.26" : "0.18"
                }} ref={el => {
                  keypadRefs.current[idx] = el;
                  helpButtonRef.current = el;
                }} onKeyDown={e => handleKeypadKeyDown(e, idx)} onPointerDown={e => {
                  const el = e.currentTarget;
                  bounceKey(el);
                }} onClick={() => setHelpOpen(p => !p)} disabled={pinLoading} aria-label={label} aria-haspopup="dialog" aria-expanded={helpOpen}>
                          ?
                        </button>;
              }
              if (key === "submit") {
                const label = t("auth.login.submit");
                const submitKeyIconSrc = isLightTheme ? "/logo/sisenehallhele.svg" : "/logo/sisenehall.svg";
                return <button key={`submit-${idx}`} type="button" className="no-click-pulse relative grid place-items-center !w-[var(--pin-btn)] !h-[var(--pin-btn)] rounded-full overflow-hidden border-0 text-[1.6rem] font-[360] tracking-[0.01em] [font-variant-numeric:tabular-nums] select-none [text-rendering:geometricPrecision] [-webkit-font-smoothing:antialiased] cursor-pointer transition-[transform,background,box-shadow,filter] duration-150 ease-out focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(197,113,113,0.18),0_12px_20px_rgba(0,0,0,0.12)] disabled:shadow-none disabled:cursor-default [background:radial-gradient(120%_120%_at_18%_16%,rgba(255,255,255,0.02)_0%,rgba(255,255,255,0)_56%),radial-gradient(120%_120%_at_86%_90%,rgba(0,0,0,0.22)_0%,rgba(0,0,0,0)_64%),linear-gradient(145deg,rgba(255,255,255,0.003)_0%,rgba(255,255,255,0.002)_42%,rgba(0,0,0,0.22)_100%)] light:[background:radial-gradient(120%_120%_at_18%_16%,rgba(255,255,255,0.62)_0%,rgba(255,255,255,0)_62%),radial-gradient(120%_120%_at_86%_90%,rgba(0,0,0,0.06)_0%,rgba(0,0,0,0)_64%),linear-gradient(145deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.12)_55%,rgba(255,255,255,0.06)_100%)] after:content-[''] after:absolute after:inset-0 after:rounded-full after:pointer-events-none after:[background:var(--pin-gloss-bg)] after:opacity-[var(--pin-gloss-op)]" style={{
                  boxShadow: isLightTheme ? "0 10px 18px rgba(0, 0, 0, 0.1), inset 0 0 0 var(--pin-border-w) rgba(17, 24, 39, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.78), inset 0 -1px 0 rgba(0, 0, 0, 0.12)" : "0 10px 18px rgba(0, 0, 0, var(--pin-shadow)), inset 0 0 0 var(--pin-border-w) rgba(255, 255, 255, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.06), inset 0 -1px 0 rgba(0, 0, 0, 0.46)",
                  "--pin-gloss-op": isLightTheme ? "0.26" : "0.18"
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
                            <Image src={submitKeyIconSrc} className="login-submit-icon" alt="" fill priority={false} aria-hidden="true" style={{
                      objectFit: "contain",
                      objectPosition: "center"
                    }} />
                            {pinValue.length > 0 && <span className="login-submit-icon-overlay" aria-hidden="true">
                                <SubmitArrowOverlayWhite filled={pinValue.length} max={PIN_MAX} />
                              </span>}
                          </span>
                        </button>;
              }
              const isZeroKey = key === "zero";
              const digitToAppend = isZeroKey ? "0" : key;
              const digitLabel = t("auth.login.key", {
                digit: isZeroKey ? 0 : key
              });
              return <button key={`${key}-${idx}`} type="button" className="no-click-pulse relative grid place-items-center !w-[var(--pin-btn)] !h-[var(--pin-btn)] rounded-full overflow-hidden border-0 text-[1.6rem] font-[360] tracking-[0.01em] [font-variant-numeric:tabular-nums] select-none [text-rendering:geometricPrecision] [-webkit-font-smoothing:antialiased] cursor-pointer transition-[transform,background,box-shadow,filter] duration-150 ease-out focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(197,113,113,0.18),0_12px_20px_rgba(0,0,0,0.12)] disabled:shadow-none disabled:cursor-default after:content-[''] after:absolute after:inset-0 after:rounded-full after:pointer-events-none after:[background:var(--pin-gloss-bg)] after:opacity-[var(--pin-gloss-op)]" style={{
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
                  return;
                }
                appendDigit(digitToAppend);
              }} disabled={pinLoading} aria-label={digitLabel}>
                        {isZeroKey ? <span className="relative w-[2.2em] h-[1.2em]" aria-hidden="true">
                            <span className="absolute inset-0 grid place-items-center will-change-[opacity]" style={{
                      animation: "pinAltZeroFade 6.5s ease-in-out infinite"
                    }}>
                              <span className="font-inherit font-[inherit] text-[1em] tracking-[inherit]">{0}</span>
                            </span>
                            <span className="absolute inset-0 grid place-items-center will-change-[opacity]" style={{
                      animation: "pinAltClearFade 6.5s ease-in-out infinite"
                    }}>
                              <span className="font-inherit font-[inherit] text-[1em] tracking-[inherit]">
                                {t("auth.login.clear_short")}
                              </span>
                            </span>
                          </span> : key}
                      </button>;
            })}
                </div>

                {helpOpen && <div ref={helpPopoverRef} role="dialog" aria-modal="false" aria-label={t("auth.login.forgot")} className="pin-help-popover" data-theme={isLightTheme ? "light" : "dark"}>
                    <button type="button" className="pin-help-close" aria-label={t("buttons.close")} onClick={() => setHelpOpen(false)}>
                      ×
                    </button>

                    <div className="pin-help-body">
                      <div className="pin-help-text">
                        {t("auth.login.help_hold_zero_before")}{" "}
                        <strong>{0}</strong>{" "}
                        {t("auth.login.help_hold_zero_after")}
                      </div>

                      <Link href="/uuenda-pin" className="unustasid-parooli-link" onClick={() => setHelpOpen(false)}>
                        {t("auth.login.forgot")}
                      </Link>
                    </div>
                  </div>}
              </div>}

            {}
            <div className={pinMessageClass} role={error ? "alert" : showPinMessage ? "status" : undefined} aria-live={error ? "assertive" : showPinMessage ? "polite" : undefined} aria-atomic="true" aria-hidden={!showPinMessage}>
              {showPinMessage ? messageText : null}
            </div>

            <div className="text-center mt-[0.7rem] mb-[0.9rem]">
              <button type="button" className={`${inlineLinkClassName} pin-layout-toggle text-[1.65rem] max-md:text-[1.85rem]`} onClick={toggleKeypad} aria-label={isMobile ? t("auth.login.toggle_keypad_mobile_aria") : t("auth.login.toggle_keypad_desktop_aria")} disabled={pinLoading}>
                {t("auth.login.toggle_keypad")}
              </button>
            </div>
          </form>}

        {isOtpStep && <form className="login-modal-form compact otp-form" onSubmit={e => {
        e.preventDefault();
        submitOtpStep();
      }}>
            <div className="otp-panel">
              <div className="otp-summary">
                {info && <p role="status" className="otp-summary__lead">
                    {info}
                  </p>}
                <p className="otp-summary__body">
                  {t("auth.login.otp_description", {
                email: emailMask || ""
              })}
                </p>
                {otpDeadlineLabel && <p className="otp-summary__meta" id="otp-deadline">
                    {t("auth.login.otp_expires", {
                time: otpDeadlineLabel
              })}
                  </p>}
              </div>

              <div className="otp-input-stack">
                <input id="otp-code-input" className="input-modern otp-input" ref={otpInputRef} type="text" inputMode="numeric" autoComplete="one-time-code" aria-label={t("auth.login.otp_placeholder")} aria-describedby={otpDeadlineLabel ? "otp-deadline" : undefined} maxLength={6} value={otpValue} onChange={e => setOtpValue(e.target.value.replace(/\\D/g, "").slice(0, 6))} onInput={e => setOtpValue(e.target.value.replace(/\\D/g, "").slice(0, 6))} placeholder={t("auth.login.otp_placeholder")} />
              </div>
            </div>

            <label className="otp-remember">
              <input type="checkbox" checked={rememberDevice} onChange={e => setRememberDevice(e.target.checked)} />
              <span className="otp-remember-text">
                {t("auth.login.remember_device")}
              </span>
            </label>

            <div className="otp-actions">
              <Button type="submit" variant="primary" className="w-full text-[1.05rem] tracking-[0.04em] rounded-[1rem] py-[0.7rem] px-[1.1rem]" disabled={otpLoading}>
                {otpLoading ? t("auth.login.otp_submitting") : t("auth.login.otp_submit")}
              </Button>
              <div className="otp-secondary">
                <Button type="button" variant="ghost" className="min-h-[2.25rem] py-[0.45rem] px-[0.7rem] text-[0.92rem] font-semibold tracking-[0.02em] rounded-[0.9rem] bg-[rgba(12,16,26,0.36)] border border-[rgba(148,163,184,0.25)] shadow-none hover:bg-[rgba(16,22,34,0.48)] hover:border-[rgba(170,190,215,0.38)] hover:shadow-none hover:-translate-y-[1px] active:translate-y-0 light:bg-[rgba(255,255,255,0.8)] light:border-[rgba(148,163,184,0.35)] light:hover:bg-[rgba(255,255,255,0.95)] light:hover:border-[rgba(148,163,184,0.45)]" onClick={handleResendOtp} disabled={resendLoading}>
                  {resendLoading ? t("auth.login.resending") : t("auth.login.resend")}
                </Button>
                <Button type="button" variant="ghost" className="min-h-[2.25rem] py-[0.45rem] px-[0.7rem] text-[0.92rem] font-semibold tracking-[0.02em] rounded-[0.9rem] bg-[rgba(12,16,26,0.36)] border border-[rgba(148,163,184,0.25)] shadow-none hover:bg-[rgba(16,22,34,0.48)] hover:border-[rgba(170,190,215,0.38)] hover:shadow-none hover:-translate-y-[1px] active:translate-y-0 light:bg-[rgba(255,255,255,0.8)] light:border-[rgba(148,163,184,0.35)] light:hover:bg-[rgba(255,255,255,0.95)] light:hover:border-[rgba(148,163,184,0.45)]" onClick={resetToPinStep}>
                  {t("auth.login.otp_back")}
                </Button>
              </div>
            </div>
          </form>}

        {!isOtpStep && <>
            <div className="login-modal-bottom-link text-center mt-0">
              <Link href={`${localizePath("/registreerimine", locale)}?next=${encodeURIComponent(nextUrl)}`} className="link-brand text-[2.25rem] leading-[1.05] font-[650] max-md:text-[clamp(2.45rem,6.5vw,3.2rem)]">
                {t("auth.login.register_link")}
              </Link>
            </div>

            {}
          </>}
      </div>
    </>, document.body);
}
