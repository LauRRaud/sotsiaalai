"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useAccessibility } from "@/components/accessibility/AccessibilityProvider";
import { useI18n } from "@/components/i18n/I18nProvider";
import { localizePath } from "@/lib/localizePath";
function SubmitArcOverlayWhite({ size = 80, filled = 0, max = 8 }) {
  const arcD = "M6 7.5A8 8 0 1 1 6 16.5";
  const clamped = Math.max(0, Math.min(max, filled));
  if (clamped <= 0) return null;

  const step = 100 / max;
  const filledLen = clamped * step;
  const isFull = clamped === max;

  const solidStroke = "rgba(255,255,255,0.95)";

  // Tee tail veidi pikemaks kui enne (nt 60% sektorist)
  const tailLen = Math.max(4, step * 0.6);

  // Tail algab täpselt täite lõpust ja ulatub edasi (pushib fade'i edasi)
  const tailStart = filledLen; // IMPORTANT: algus on täite lõpp

  // Kui tahad “sujuvamat”, tõsta layers 4 -> 6
  const layers = 5;
  const seg = tailLen / layers;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      style={{ display: "block" }}
    >
      {/* Solid fill (ei tohi wrap'ida => teine number väga suur, et ei tekiks täppe) */}
      {isFull ? (
        <path
          d={arcD}
          fill="none"
          stroke={solidStroke}
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d={arcD}
          fill="none"
          stroke={solidStroke}
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength="100"
          strokeDasharray={`${filledLen} 1000`}
          strokeDashoffset="0"
        />
      )}

      {/* Tail fade (mitu väikest dash'i, decreasing opacity; NO blur; NO dot) */}
      {!isFull &&
        Array.from({ length: layers }).map((_, i) => {
          // i=0 kõige tugevam, i=layers-1 kõige nõrgem (peaaegu 0)
          const t = i / (layers - 1);
          const alpha = 0.75 * (1 - t) * (1 - t); // kiire kukkumine lõpu poole

          // iga segment nihkub edasi, nii et tekib fade-out “saba”
          const start = tailStart + i * seg;

          return (
            <path
              key={i}
              d={arcD}
              fill="none"
              stroke={`rgba(255,255,255,${alpha.toFixed(3)})`}
              strokeWidth="1"
              strokeLinecap="butt"   // oluline: ei teki “täppi” lõppu
              strokeLinejoin="round"
              pathLength="100"
              strokeDasharray={`${seg} 1000`}
              strokeDashoffset={-start}
            />
          );
        })}
    </svg>
  );
}


export default function LoginModal({ open, onClose }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status, data: session } = useSession();
  const { t, locale } = useI18n();
  const { prefs } = useAccessibility();

  const defaultNextUrl = localizePath("/vestlus", locale);
  const toRelative = (u) => {
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
  const LOGIN_KEYPAD_LAYOUT_KEY = "sotsiaalai:login:keypadLayout"; // desktop: phone|numpad
  const LOGIN_NATIVE_KEYBOARD_KEY = "sotsiaalai:login:useNativeKeyboard"; // mobile: true|false

  const isMobile = useMemo(() => {
    if (typeof window === "undefined") return false;
    const ua = navigator.userAgent || "";
    return /Android|iPhone|iPad|iPod/i.test(ua);
  }, []);

  const [step, setStep] = useState("pin");
  const [pinValue, setPinValue] = useState("");
  const [pinError, setPinError] = useState(false);
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
  const [submitIconState, setSubmitIconState] = useState("idle"); // idle | success | error
  const [invalidCredentials, setInvalidCredentials] = useState(false);

  const [emailRevealed, setEmailRevealed] = useState(false);
  const [storedEmail, setStoredEmail] = useState("");
  const [emailValue, setEmailValue] = useState("");
  const hasEmailValue = (emailValue || "").trim().length > 0;

  // Mobile: custom keypad (default false) vs native keyboard (true)
  const [useNativeKeyboard, setUseNativeKeyboard] = useState(false);

  // Desktop: keypad layout toggler
  const [keypadLayout, setKeypadLayout] = useState("phone"); // phone | numpad

  const boxRef = useRef(null);
  const emailInputRef = useRef(null);
  const emailIconButtonRef = useRef(null);
  const hiddenInputRef = useRef(null);
  const mobilePinInputRef = useRef(null);
  const keypadRefs = useRef([]);
  const emailHintIdRef = useRef(`login-email-hint-${Math.random().toString(36).slice(2, 10)}`);
  const pinHintIdRef = useRef(`login-pin-hint-${Math.random().toString(36).slice(2, 10)}`);
  const otpInputRef = useRef(null);

  const isOtpStep = step === "otp";

  const modalClasses = [
    "login-modal-root",
    "login-modal-box",
    "glass-modal",
    "compact-modal",
    isOtpStep ? "login-modal--otp" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const keypadKeysPhone = useMemo(
    () => ["1", "2", "3", "4", "5", "6", "7", "8", "9", "back", "0", "clear"],
    []
  );
  const keypadKeysNumpad = useMemo(
    () => ["7", "8", "9", "4", "5", "6", "1", "2", "3", "back", "0", "clear"],
    []
  );

  const keypadKeys = useMemo(() => {
    if (isMobile) return keypadKeysPhone;
    return keypadLayout === "numpad" ? keypadKeysNumpad : keypadKeysPhone;
  }, [isMobile, keypadLayout, keypadKeysNumpad, keypadKeysPhone]);

  const otpDeadlineLabel = useMemo(() => {
    if (!otpExpiresAt) return "";
    try {
      return new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(
        new Date(otpExpiresAt)
      );
    } catch {
      return "";
    }
  }, [otpExpiresAt, locale]);

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

  const focusKeypadIndex = (idx) => {
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
    let row = Math.floor(idx / cols);
    let col = idx % cols;

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
      return;
    }
  };

  // Close + redirect on authenticated
  useEffect(() => {
    if (!open) return;
    if (status === "authenticated" && session) {
      onClose?.();
      router.replace(nextUrl);
      router.refresh();
    }
  }, [open, status, session, nextUrl, router, onClose]);

  // Reset on close
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
    // toggles + layout are loaded on open from storage
  }, [open]);

  // Load saved email (keep existing behavior)
  useEffect(() => {
    if (!open || isOtpStep) return;
    try {
      const stored = window.localStorage.getItem(LOGIN_EMAIL_KEY) || "";
      setStoredEmail(stored);
      setEmailValue(stored);
      if (emailInputRef.current) {
        emailInputRef.current.value = stored;
      }
    } catch {}
  }, [open, isOtpStep]);

  // Load preferences on open (PIN step)
  useEffect(() => {
    if (!open) return;
    if (step !== "pin") return;

    try {
      const savedLayout = window.localStorage.getItem(LOGIN_KEYPAD_LAYOUT_KEY);
      if (savedLayout === "phone" || savedLayout === "numpad") {
        setKeypadLayout(savedLayout);
      }

      const savedNative = window.localStorage.getItem(LOGIN_NATIVE_KEYBOARD_KEY);
      if (savedNative === "true" || savedNative === "false") {
        setUseNativeKeyboard(savedNative === "true");
      } else {
        // requirement: default mobile = custom keypad
        if (isMobile) setUseNativeKeyboard(false);
      }
    } catch {
      if (isMobile) setUseNativeKeyboard(false);
    }
  }, [open, step, isMobile]);

  // Persist preferences when changed (while open)
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

  // Focus rules: envelope first; then email input; OTP input for OTP step
  useEffect(() => {
    if (!open) return;
    if (isOtpStep) {
      const target = otpInputRef.current;
      if (target && typeof target.focus === "function") {
        setTimeout(() => target.focus(), 0);
      }
      return;
    }
    if (!emailRevealed) {
      const target = emailIconButtonRef.current;
      if (target && typeof target.focus === "function") {
        setTimeout(() => target.focus(), 0);
      }
      return;
    }
    const target = emailInputRef.current;
    if (target && typeof target.focus === "function") {
      setTimeout(() => target.focus(), 0);
    }
  }, [open, isOtpStep, emailRevealed]);

  // When mobile switches to native keyboard, focus the invisible PIN input to open OS keyboard
  useEffect(() => {
    if (!open) return;
    if (step !== "pin") return;
    if (!isMobile) return;

    if (useNativeKeyboard) {
      setTimeout(() => {
        mobilePinInputRef.current?.focus?.();
      }, 0);
    }
  }, [open, step, isMobile, useNativeKeyboard]);

  const finishLogin = useCallback(
    async (token) => {
      if (!token) {
        markPinError();
        setError(t("auth.login.error.generic"));
        return false;
      }
      const login = await signIn("credentials", {
        temp_login_token: token,
        redirect: false,
        callbackUrl: nextUrl,
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
    },
    [markPinError, markPinSuccess, nextUrl, onClose, router, t]
  );

  const submitPinStep = useCallback(async () => {
    setError("");
    setInfo("");
    setPinError(false);
    resetIconState();

    const emailInput = boxRef.current?.querySelector('input[name="email"]');
    const email = String(emailInput?.value || storedEmail || "")
      .trim()
      .toLowerCase();
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
      setError(t("auth.login.error.pin_invalid", { min: PIN_MIN, max: PIN_MAX }));
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pin }),
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
      if (payload?.temp_login_token) {
        setTempToken(payload.temp_login_token);
      }
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
  }, [
    PIN_MAX,
    PIN_MIN,
    finishLogin,
    markPinError,
    markPinSuccess,
    pinValue,
    resetIconState,
    storedEmail,
    t,
  ]);

  const handlePinInputChange = useCallback(
    (e) => {
      if (step !== "pin") return;
      const raw = typeof e?.target?.value === "string" ? e.target.value : "";
      const next = raw.replace(/\D/g, "").slice(0, PIN_MAX);
      setPinValue(next);
      resetIconState();
      setError("");
      setPinError(false);
    },
    [PIN_MAX, resetIconState, step]
  );

  const onHiddenKeyDown = useCallback(
    (e) => {
      if (step !== "pin") return;

      const isPinFieldEvent = hiddenInputRef.current && e.target === hiddenInputRef.current;

      if (e.key === "Enter") {
        e.preventDefault();
        submitPinStep();
        return;
      }
      // Let the hidden input itself handle updates via onInput/onChange.
      if (isPinFieldEvent) return;

      if (e.key === "Backspace") {
        e.preventDefault();
        setPinValue((p) => p.slice(0, -1));
        resetIconState();
        setError("");
        setPinError(false);
        return;
      }
      if (/^\d$/.test(e.key)) {
        e.preventDefault();
        setPinValue((p) => (p.length >= PIN_MAX ? p : `${p}${e.key}`));
        resetIconState();
        setError("");
        setPinError(false);
      }
    },
    [step, PIN_MAX, resetIconState, submitPinStep]
  );

  // Desktop typing support only (avoid mobile oddities)
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

    const keyListener = (e) => {
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

  const appendDigit = (digit) => {
    if (step !== "pin") return;
    setPinValue((p) => (p.length >= PIN_MAX ? p : `${p}${digit}`));
    setError("");
    resetIconState();
    setPinError(false);
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(8);
      } catch {}
    }
  };

  const handleBackspace = () => {
    if (step !== "pin") return;
    setPinValue((p) => p.slice(0, -1));
    setError("");
    resetIconState();
    setPinError(false);
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(6);
      } catch {}
    }
  };

  const handleClear = () => {
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
  };

  const submitOtpStep = async () => {
    if (!tempToken) {
      setError(t("auth.login.error.generic"));
      return;
    }
    if (!/^\d{6}$/.test(otpValue)) {
      setError(t("auth.login.otp_invalid"));
      return;
    }
    setOtpLoading(true);
    setError("");
    setInfo("");
    try {
      const res = await fetch("/api/auth/login-step2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          temp_login_token: tempToken,
          otp_code: otpValue,
          remember_device: rememberDevice,
        }),
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ temp_login_token: tempToken }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(payload?.message || t("auth.login.error.generic"));
        return;
      }
      setOtpExpiresAt(payload?.otp_expires_at || null);
      setInfo(
        t("auth.login.otp_resent", {
          email: payload?.email_mask || emailMask || "",
        })
      );
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
      if (!node.value && storedEmail) {
        node.value = storedEmail;
      }
      setEmailValue(node.value || "");
      node.focus();
    }, 0);
  }, [emailRevealed, storedEmail]);

  const toggleKeypad = () => {
    if (isMobile) {
      setUseNativeKeyboard((v) => !v);
      return;
    }
    setKeypadLayout((p) => (p === "phone" ? "numpad" : "phone"));
  };

  if (!open) return null;

  const isLightTheme = prefs?.theme === "light";

  const submitIconSrc = (() => {
    const successIcon = isLightTheme ? "/logo/sisenerohelinehele.svg" : "/logo/siseneroheline.svg";
    const errorIcon = isLightTheme ? "/logo/sisenepunanetume.svg" : "/logo/sisenepunanehele.svg";
    if (pinLoading || submitIconState === "success") return successIcon;
    if (submitIconState === "error") return errorIcon;
    return isLightTheme ? "/logo/sisenehallhele.svg" : "/logo/sisenehall.svg";
  })();

  const stopInside = (e) => e.stopPropagation();

  const filledSegments = Math.min(PIN_MAX, pinValue.length);

  return createPortal(
    <>
      <div className="login-modal-backdrop" onClick={onClose} />
      <div
        ref={boxRef}
        id="login-modal"
        className={modalClasses}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={isOtpStep ? t("auth.login.otp_title") : t("auth.login.title")}
        onClick={stopInside}
        onMouseLeave={() => {
          if (step !== "pin") return;
          if (emailRevealed && emailInputRef.current) {
            emailInputRef.current.focus();
            return;
          }
          if (!emailRevealed && emailIconButtonRef.current) {
            emailIconButtonRef.current.focus();
          }
        }}
      >
        <button
          className="login-modal-close modal-close-btn"
          onClick={onClose}
          aria-label={t("buttons.close")}
          type="button"
        />

        <div className="login-modal-head">
          <div className="glass-title">{isOtpStep ? t("auth.login.otp_title") : t("auth.login.title")}</div>
          <div
            className={[
              "glass-note",
              "glass-note--center",
              "login-modal-message-slot",
              error ? "login-error-note" : "",
              !error && info && !isOtpStep ? "login-info-note" : "",
              !error && !(info && !isOtpStep) ? "login-modal-message-slot--empty" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            role={error ? "alert" : info && !isOtpStep ? "status" : undefined}
            aria-live={error ? "assertive" : info && !isOtpStep ? "polite" : undefined}
            aria-atomic="true"
            aria-hidden={!error && !(info && !isOtpStep)}
          >
            {error || (info && !isOtpStep ? info : "\u00a0")}
          </div>
        </div>

        {!isOtpStep && (
          <form
            className="login-modal-form compact"
            onSubmit={(e) => {
              e.preventDefault();
              submitPinStep();
            }}
            autoComplete="off"
          >
            <div id={emailHintIdRef.current} className="sr-only">
              {t(
                "auth.email_icon_hint",
                "Vajuta ümbriku väljale, et avada e-posti sisestuse lahter ja sisesta oma e-post."
              )}
            </div>

            <div className="login-email-toggle">
              {!emailRevealed ? (
                <button
                  type="button"
                  ref={emailIconButtonRef}
                  className={`login-email-icon-btn${hasEmailValue ? " login-email-icon-btn--known" : ""}${
                    invalidCredentials ? " login-email-icon-btn--error" : ""
                  }`}
                  aria-describedby={emailHintIdRef.current}
                  aria-label={t("auth.email_placeholder")}
                  onClick={revealEmailInput}
                >
                  <span className="sr-only">
                    {t(
                      "auth.email_icon_hint",
                      "Vajuta ümbriku väljale, et avada e-posti sisestuse lahter ja sisesta oma e-post."
                    )}
                  </span>
                </button>
              ) : (
                <label style={{ width: "100%", display: "block", textAlign: "center" }}>
                  <input
                    className={`input-modern input-email-top input-email-icon compact-email${
                      hasEmailValue ? " input-email-icon--filled" : ""
                    }`}
                    type="email"
                    name="email"
                    ref={emailInputRef}
                    aria-label={t("auth.email_placeholder")}
                    aria-describedby={emailHintIdRef.current}
                    placeholder=""
                    autoComplete="username"
                    inputMode="email"
                    onMouseDown={(e) => {
                      const node = emailInputRef.current;
                      if (node && document.activeElement !== node) {
                        e.preventDefault();
                        node.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => {
                      setEmailValue(e.target.value || "");
                      resetIconState();
                      setError("");
                    }}
                    style={{ margin: "0 auto" }}
                  />
                </label>
              )}
            </div>

            <div id={pinHintIdRef.current} className="sr-only">
              {t(
                "auth.login.pin_hint",
                "Sisesta PIN; sisestus on peidetud ja tähemärke ei loeta ette turvalisuse huvides."
              )}
            </div>

            {/* Inputs:
                - Desktop: keep sr-only input for physical keyboard typing.
                - Mobile native mode: keep an invisible input for OS keyboard (no visible box).
                - Mobile custom mode: no focusable PIN input needed. */}
            {!isMobile && (
              <input
                aria-label={t("auth.pin_placeholder", { min: PIN_MIN, max: PIN_MAX })}
                ref={hiddenInputRef}
                value={pinValue}
                inputMode="numeric"
                pattern={`\\d{${PIN_MIN},${PIN_MAX}}`}
                maxLength={PIN_MAX}
                className="sr-only pin-hidden-input"
                tabIndex={0}
                type="password"
                onKeyDown={onHiddenKeyDown}
                onInput={handlePinInputChange}
                onChange={handlePinInputChange}
                aria-describedby={pinHintIdRef.current}
                aria-live="off"
              />
            )}

            {isMobile && useNativeKeyboard && (
              <input
                ref={mobilePinInputRef}
                aria-label={t("auth.pin_placeholder", { min: PIN_MIN, max: PIN_MAX })}
                value={pinValue}
                inputMode="numeric"
                pattern={`\\d{${PIN_MIN},${PIN_MAX}}`}
                maxLength={PIN_MAX}
                type="password"
                autoComplete="current-password"
                onChange={handlePinInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    submitPinStep();
                  }
                }}
                aria-describedby={pinHintIdRef.current}
                // Visually hidden, but focusable to open OS keyboard.
                style={{
                  position: "absolute",
                  opacity: 0,
                  width: 1,
                  height: 1,
                  pointerEvents: "none",
                }}
              />
            )}

            {/* Custom keypad:
                - hidden when mobile uses native keyboard
                - always shown on desktop */}
            {!(isMobile && useNativeKeyboard) && (
              <div className="pin-keypad-all-wrapper" aria-hidden="false">
                <div className="pin-keypad-all" role="group" aria-label={t("auth.login.title")}>
                  {keypadKeys.map((key, idx) => {
                    if (key === "back") {
                      const label =
                        t("auth.login.back", "Kustuta viimane number") || "Kustuta viimane number";
                      return (
                        <button
                          key={`back-${idx}`}
                          type="button"
                          className="pin-keypad__button pin-keypad__button--alt"
                          ref={(el) => (keypadRefs.current[idx] = el)}
                          onKeyDown={(e) => handleKeypadKeyDown(e, idx)}
                          onClick={handleBackspace}
                          aria-label={label}
                          disabled={pinLoading}
                        >
                          {"\u2190"}
                        </button>
                      );
                    }
                    if (key === "clear") {
                      const label = t("auth.login.clear", "Puhasta PIN") || "Puhasta PIN";
                      return (
                        <button
                          key={`clear-${idx}`}
                          type="button"
                          className="pin-keypad__button pin-keypad__button--alt"
                          ref={(el) => (keypadRefs.current[idx] = el)}
                          onKeyDown={(e) => handleKeypadKeyDown(e, idx)}
                          onClick={handleClear}
                          aria-label={label}
                          disabled={pinLoading || !pinValue}
                        >
                          {"C"}
                        </button>
                      );
                    }
                    const digitLabel = t("auth.login.key", "Number {digit}").replace("{digit}", key);
                    return (
                      <button
                        key={`${key}-${idx}`}
                        type="button"
                        className="pin-keypad__button"
                        ref={(el) => (keypadRefs.current[idx] = el)}
                        onKeyDown={(e) => handleKeypadKeyDown(e, idx)}
                        onClick={() => appendDigit(key)}
                        disabled={pinLoading}
                        aria-label={digitLabel || `Number ${key}`}
                      >
                        {key}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Toggle under keypad */}
            <div style={{ textAlign: "center", marginTop: "0.35rem" }}>
              <button
                type="button"
                className="link-brand-inline pin-layout-toggle"
                onClick={toggleKeypad}
                aria-label={
                  isMobile
                    ? "Vaheta PIN-i sisestusviisi klaviatuuri ja ekraaniklahvistiku vahel"
                    : "Vaheta PIN-i klahvistiku paigutust"
                }
                disabled={pinLoading}
              >
                Vaheta klahvistik
              </button>
            </div>

<div className="login-submit-wrap" style={{ display: "flex", justifyContent: "center" }}>
  <button
    type="submit"
    className={`login-submit-icon-btn login-submit-icon-only login-submit-icon-btn--${submitIconState}`}
    disabled={pinLoading}
    aria-label={pinLoading ? t("auth.login.submitting") : t("auth.login.submit")}
  >
    <span className="login-submit-icon-stack" aria-hidden="true">
      <Image
        src={submitIconSrc}
        className="login-submit-icon"
        alt=""
        width={80}
        height={80}
        aria-hidden="true"
      />

      {submitIconState === "idle" && !pinLoading && pinValue.length > 0 && (
        <span className="login-submit-icon-overlay">
          <SubmitArcOverlayWhite
            size={80}
            filled={Math.min(PIN_MAX, pinValue.length)}
            max={PIN_MAX}
          />
        </span>
      )}
    </span>

    <span className="sr-only">
      {pinLoading ? t("auth.login.submitting") : t("auth.login.submit")}
    </span>
  </button>
</div>
</form>
)}

        {isOtpStep && (
          <form
            className="login-modal-form compact otp-form"
            onSubmit={(e) => {
              e.preventDefault();
              submitOtpStep();
            }}
          >
            <div className="otp-summary">
              {info && (
                <p role="status" className="otp-summary__lead">
                  {info}
                </p>
              )}
              <p className="otp-summary__body">{t("auth.login.otp_description", { email: emailMask || "" })}</p>
              {otpDeadlineLabel && (
                <p className="otp-summary__meta" id="otp-deadline">
                  {t("auth.login.otp_expires", { time: otpDeadlineLabel })}
                </p>
              )}
            </div>
            <div className="otp-input-stack">
              <input
                id="otp-code-input"
                className="input-modern otp-input"
                ref={otpInputRef}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                aria-label={t("auth.login.otp_placeholder")}
                aria-describedby={otpDeadlineLabel ? "otp-deadline" : undefined}
                maxLength={6}
                pattern="\\d{6}"
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder={t("auth.login.otp_placeholder")}
              />
            </div>
            <label className="glass-checkbox otp-checkbox">
              <input type="checkbox" checked={rememberDevice} onChange={(e) => setRememberDevice(e.target.checked)} />
              <span className="checkbox-text">{t("auth.login.remember_device")}</span>
            </label>
            <div className="otp-actions">
              <button type="submit" className="btn-primary otp-submit" disabled={otpLoading}>
                <span>{otpLoading ? t("auth.login.otp_submitting") : t("auth.login.otp_submit")}</span>
              </button>
              <div className="otp-secondary">
                <button
                  type="button"
                  className="link-brand-inline"
                  onClick={handleResendOtp}
                  disabled={resendLoading}
                >
                  {resendLoading ? t("auth.login.resending") : t("auth.login.resend")}
                </button>
                <button type="button" className="link-brand-inline" onClick={resetToPinStep}>
                  {t("auth.login.otp_back")}
                </button>
              </div>
            </div>
          </form>
        )}

        {!isOtpStep && (
          <>
            <div className="login-modal-bottom-link" style={{ textAlign: "center", marginTop: "0rem" }}>
              <Link
                href={`${localizePath("/registreerimine", locale)}?next=${encodeURIComponent(nextUrl)}`}
                className="link-brand"
              >
                {t("auth.login.register_link")}
              </Link>
            </div>

            <div
              className="unustasid-parooli-link-wrapper-bottom"
              style={{ textAlign: "center", marginBottom: "-0.8rem", marginTop: "-0.5rem" }}
            >
              <Link href="/uuenda-pin" className="unustasid-parooli-link">
                {t("auth.login.forgot")}
              </Link>
            </div>
          </>
        )}
      </div>
    </>,
    document.body
  );
}
