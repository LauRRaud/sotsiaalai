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
import { localizePath } from "@/lib/localizePath";
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
  const modalClasses = ["login-modal-root", "login-modal-box", "glass-modal", "compact-modal", isOtpStep ? "login-modal--otp" : ""].filter(Boolean).join(" ");
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
  if (!open) return null;
  const isLightTheme = prefs?.theme === "light";
  const stopInside = e => e.stopPropagation();
  return createPortal(<>
      <div className="login-modal-backdrop" onClick={onClose} />
      <div ref={boxRef} id="login-modal" className={modalClasses} tabIndex={-1} role="dialog" aria-modal="true" aria-label={isOtpStep ? t("auth.login.otp_title") : t("auth.login.title")} onClick={stopInside} onMouseLeave={() => {
      if (step !== "pin") return;
      if (emailRevealed && emailInputRef.current) {
        emailInputRef.current.focus();
        return;
      }
      if (!emailRevealed && emailIconButtonRef.current) emailIconButtonRef.current.focus();
    }}>
        <button className="login-modal-close modal-close-btn" onClick={onClose} aria-label={t("buttons.close")} type="button" />

        <div className="login-modal-head">
          <div className="glass-title">
            {isOtpStep ? t("auth.login.otp_title") : t("auth.login.title")}
          </div>
          <div className={["glass-note", "glass-note--center", "login-modal-message-slot", error ? "login-error-note" : "", !error && info && !isOtpStep ? "login-info-note" : "", hasMessage ? "login-modal-message-slot--filled" : "login-modal-message-slot--empty"].filter(Boolean).join(" ")} role={error ? "alert" : hasMessage ? "status" : undefined} aria-live={error ? "assertive" : hasMessage ? "polite" : undefined} aria-atomic="true" aria-hidden={!hasMessage}>
            {hasMessage ? messageText : null}
          </div>
        </div>

        {!isOtpStep && <form className="login-modal-form compact" onSubmit={e => {
        e.preventDefault();
        submitPinStep();
      }} autoComplete="off">
            <div id={emailHintIdRef.current} className="sr-only">
              {t("auth.email_icon_hint")}
            </div>

            <div className="login-email-toggle">
              {!emailRevealed ? <button type="button" ref={emailIconButtonRef} className={`login-email-icon-btn${hasEmailValue ? " login-email-icon-btn--known" : ""}${invalidCredentials ? " login-email-icon-btn--error" : ""}`} aria-describedby={emailHintIdRef.current} aria-label={t("auth.email_placeholder")} onClick={revealEmailInput}>
                  <span className="sr-only">{t("auth.email_icon_hint")}</span>
                </button> : <label className="login-email-label">
                  <input className={`input-modern input-email-top input-email-icon compact-email${hasEmailValue ? " input-email-icon--filled" : ""}`} type="email" name="email" ref={emailInputRef} aria-label={t("auth.email_placeholder")} aria-describedby={emailHintIdRef.current} placeholder="" autoComplete="username" inputMode="email" onMouseDown={e => {
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

            {!(isMobile && useNativeKeyboard) && <div className="pin-keypad-all-wrapper" aria-hidden="false" onTouchStart={handleKeypadTouchStart} onTouchEnd={handleKeypadTouchEnd} onTouchCancel={handleKeypadTouchEnd}>
                <div className="pin-keypad-all" role="group" aria-label={t("auth.login.title")}>
                  {keypadKeys.map((key, idx) => {
              if (key === "blank") {
                return <span key={`blank-${idx}`} className="pin-keypad__blank" aria-hidden="true" />;
              }
              if (key === "help") {
                const label = t("auth.login.forgot");
                return <button key={`help-${idx}`} type="button" className="pin-keypad__button no-click-pulse pin-keypad__button--help" ref={el => {
                  keypadRefs.current[idx] = el;
                  helpButtonRef.current = el;
                }} onKeyDown={e => handleKeypadKeyDown(e, idx)} onPointerDown={e => {
                  const el = e.currentTarget;
                  el.classList.remove("pin-keypad__button--bounce");
                  el.offsetWidth;
                  el.classList.add("pin-keypad__button--bounce");
                  window.setTimeout(() => el.classList.remove("pin-keypad__button--bounce"), 650);
                }} onClick={() => setHelpOpen(p => !p)} disabled={pinLoading} aria-label={label} aria-haspopup="dialog" aria-expanded={helpOpen}>
                          ?
                        </button>;
              }
              if (key === "submit") {
                const label = t("auth.login.submit");
                const submitKeyIconSrc = isLightTheme ? "/logo/sisenehallhele.svg" : "/logo/sisenehall.svg";
                return <button key={`submit-${idx}`} type="button" className="pin-keypad__button no-click-pulse pin-keypad__button--submit" ref={el => keypadRefs.current[idx] = el} onKeyDown={e => {
                  handleKeypadKeyDown(e, idx);
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    submitPinStep();
                  }
                }} onPointerDown={e => {
                  const el = e.currentTarget;
                  el.classList.remove("pin-keypad__button--bounce");
                  el.offsetWidth;
                  el.classList.add("pin-keypad__button--bounce");
                  window.setTimeout(() => el.classList.remove("pin-keypad__button--bounce"), 650);
                }} onClick={() => submitPinStep()} disabled={pinLoading} aria-label={label}>
                          <span className="login-submit-icon-stack" aria-hidden="true">
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
              return <button key={`${key}-${idx}`} type="button" className={`pin-keypad__button no-click-pulse${isZeroKey ? " pin-keypad__button--alt" : ""}`} ref={el => keypadRefs.current[idx] = el} onKeyDown={e => handleKeypadKeyDown(e, idx)} onPointerDown={e => {
                const el = e.currentTarget;
                el.classList.remove("pin-keypad__button--bounce");
                el.offsetWidth;
                el.classList.add("pin-keypad__button--bounce");
                window.setTimeout(() => el.classList.remove("pin-keypad__button--bounce"), 650);
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
                        {isZeroKey ? <span className="pin-alt-swap" aria-hidden="true">
                            <span className="pin-alt-face pin-alt-face--zero">
                              <span className="pin-alt-main">{0}</span>
                            </span>
                            <span className="pin-alt-face pin-alt-face--clear">
                              <span className="pin-alt-sub">
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
            <div style={{
          textAlign: "center",
          marginTop: "0.35rem"
        }}>
              <button type="button" className="link-brand-inline pin-layout-toggle" onClick={toggleKeypad} aria-label={isMobile ? t("auth.login.toggle_keypad_mobile_aria") : t("auth.login.toggle_keypad_desktop_aria")} disabled={pinLoading}>
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
              <button type="submit" className="btn-base otp-submit" disabled={otpLoading}>
                <span>
                  {otpLoading ? t("auth.login.otp_submitting") : t("auth.login.otp_submit")}
                </span>
              </button>
              <div className="otp-secondary">
                <button type="button" className="btn-base otp-secondary-btn" onClick={handleResendOtp} disabled={resendLoading}>
                  {resendLoading ? t("auth.login.resending") : t("auth.login.resend")}
                </button>
                <button type="button" className="btn-base otp-secondary-btn" onClick={resetToPinStep}>
                  {t("auth.login.otp_back")}
                </button>
              </div>
            </div>
          </form>}

        {!isOtpStep && <>
            <div className="login-modal-bottom-link" style={{
          textAlign: "center",
          marginTop: "0rem"
        }}>
              <Link href={`${localizePath("/registreerimine", locale)}?next=${encodeURIComponent(nextUrl)}`} className="link-brand">
                {t("auth.login.register_link")}
              </Link>
            </div>

            {}
          </>}
      </div>
    </>, document.body);
}