"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { localizePath } from "@/lib/localizePath";

export default function LoginModal({ open, onClose }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status, data: session } = useSession();
  const { t, locale } = useI18n();

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

  const boxRef = useRef(null);
  const hiddenInputRef = useRef(null);
  const keypadRefs = useRef([]);

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
  const keypadKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "back", "0", "clear"];
  const focusHiddenInput = (event) => {
    const detail =
      typeof event?.detail === "number"
        ? event.detail
        : typeof event?.nativeEvent?.detail === "number"
        ? event.nativeEvent.detail
        : null;
    if (detail === 0) return;
    hiddenInputRef.current?.focus?.();
  };

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
    // Arrow navigation inside the 3x4 keypad grid
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

  useEffect(() => {
    if (!open || step !== "pin") return;
    const tid = setTimeout(() => hiddenInputRef.current?.focus?.(), 0);
    const keyListener = (e) => {
      if (step !== "pin") return;
      const target = e.target;
      const tag = target?.tagName?.toLowerCase();
      const isEditable = tag === "input" || tag === "textarea" || target?.isContentEditable;
      const isHidden = hiddenInputRef.current && target === hiddenInputRef.current;
      // If focused in an editable field that is not our hidden PIN input, do not hijack keys
      if (isEditable && !isHidden) return;
      onHiddenKeyDown(e);
    };
    window.addEventListener("keydown", keyListener);
    return () => {
      clearTimeout(tid);
      window.removeEventListener("keydown", keyListener);
    };
  }, [open, step]);

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
    setTempToken("");
    setOtpValue("");
    setOtpExpiresAt(null);
    setRememberDevice(true);
    setEmailMask("");
    setError("");
    setInfo("");
    setPinLoading(false);
    setOtpLoading(false);
    setResendLoading(false);
  }, [open]);

  const finishLogin = async (token) => {
    if (!token) {
      setError(t("auth.login.error.generic"));
      return false;
    }
    const login = await signIn("credentials", {
      temp_login_token: token,
      redirect: false,
      callbackUrl: nextUrl,
    });
    if (login?.error) {
      setError(t("auth.login.error.generic"));
      return false;
    }
    onClose?.();
    router.replace(nextUrl);
    router.refresh();
    return true;
  };

  const submitPinStep = async () => {
    setError("");
    setInfo("");
    const emailInput = boxRef.current?.querySelector('input[name="email"]');
    const email = String(emailInput?.value || "").trim().toLowerCase();
    const pin = pinValue.replace(/\s+/g, "");

    if (!email) {
      setError(t("auth.login.error.email_required"));
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t("auth.login.error.email_invalid"));
      return;
    }
    if (!pin) {
      setError(t("auth.login.error.pin_required"));
      return;
    }
    if (!new RegExp(`^\\d{${PIN_MIN},${PIN_MAX}}$`).test(pin)) {
      setError(t("auth.login.error.pin_invalid", { min: PIN_MIN, max: PIN_MAX }));
      return;
    }

    setPinLoading(true);
    try {
      const res = await fetch("/api/auth/login-step1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pin }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(payload?.message || t("auth.login.error.generic"));
        return;
      }
      if (payload?.temp_login_token) {
        setTempToken(payload.temp_login_token);
      }
      if (payload?.status === "success" && payload?.temp_login_token) {
        await finishLogin(payload.temp_login_token);
        return;
      }
      if (payload?.status === "need_2fa" && payload?.temp_login_token) {
        setStep("otp");
        setOtpValue("");
        setEmailMask(payload.email_mask || email);
        setOtpExpiresAt(payload.otp_expires_at || null);
        return;
      }
      setError(payload?.message || t("auth.login.error.generic"));
    } catch (err) {
      console.error("login-step1 error", err);
      setError(t("auth.login.error.generic"));
    } finally {
      setPinLoading(false);
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
  };

  const onHiddenKeyDown = (e) => {
    if (step !== "pin") return;
    if (e.key === "Enter") {
      e.preventDefault();
      submitPinStep();
      return;
    }
    if (e.key === "Backspace") {
      e.preventDefault();
      setPinValue((p) => p.slice(0, -1));
      return;
    }
    if (/^\d$/.test(e.key)) {
      e.preventDefault();
      setPinValue((p) => (p.length >= PIN_MAX ? p : `${p}${e.key}`));
    }
  };

  const appendDigit = (digit, event) => {
    if (step !== "pin") return;
    setPinValue((p) => (p.length >= PIN_MAX ? p : `${p}${digit}`));
    focusHiddenInput(event);
    setError("");
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(8);
      } catch {}
    }
  };

  const handleBackspace = (event) => {
    if (step !== "pin") return;
    setPinValue((p) => p.slice(0, -1));
    focusHiddenInput(event);
    setError("");
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(6);
      } catch {}
    }
  };

  const handleClear = (event) => {
    if (step !== "pin") return;
    setPinValue("");
    focusHiddenInput(event);
    setError("");
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(6);
      } catch {}
    }
  };

  const stopInside = (e) => e.stopPropagation();

  if (!open) return null;

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
      >
        <button className="login-modal-close" onClick={onClose} aria-label={t("buttons.close")} type="button">
          {"\u00d7"}
        </button>

        <div className="glass-title" style={{ textAlign: "center", margin: "-0.8rem 0 18px" }}>
          {isOtpStep ? t("auth.login.otp_title") : t("auth.login.title")}
        </div>

        {info && !isOtpStep && (
          <div role="status" className="glass-note glass-note--center" style={{ marginBottom: "0.5rem" }}>
            {info}
          </div>
        )}

        {error && (
          <div role="alert" aria-live="assertive" className="glass-note glass-note--center">
            {error}
          </div>
        )}

        {!isOtpStep && (
          <form className="login-modal-form compact" onSubmit={(e) => { e.preventDefault(); submitPinStep(); }} autoComplete="off">
            <label style={{ width: "100%", display: "block", textAlign: "center", marginBottom: 6 }}>
              <input
                className="input-modern input-email-top compact-email"
                type="email"
                name="email"
                placeholder={t("auth.email_placeholder")}
                autoComplete="username"
                inputMode="email"
                style={{ margin: "0 auto", maxWidth: 380 }}
              />
            </label>

            <input
              aria-label={t("auth.pin_placeholder", { min: PIN_MIN, max: PIN_MAX })}
              ref={hiddenInputRef}
              value={pinValue}
              onChange={(e) => {
                const raw = String(e.target.value || "").replace(/\D/g, "");
                setPinValue(raw.slice(0, PIN_MAX));
              }}
              onKeyDown={onHiddenKeyDown}
              inputMode="numeric"
              pattern={`\\d{${PIN_MIN},${PIN_MAX}}`}
              maxLength={PIN_MAX}
              className="sr-only"
              tabIndex={-1}
              type="text"
            />

            <div className="pin-keypad-all-wrapper" aria-hidden="false">
              <div className="pin-keypad-all" role="group" aria-label={t("auth.login.title")}>
                {keypadKeys.map((key, idx) => {
                  if (key === "back") {
                    return (
                      <button
                        key={`back-${idx}`}
                        type="button"
                        className="pin-keypad__button pin-keypad__button--alt"
                        ref={(el) => (keypadRefs.current[idx] = el)}
                        onKeyDown={(e) => handleKeypadKeyDown(e, idx)}
                        onClick={handleBackspace}
                        aria-label={t("auth.login.back") || "Backspace"}
                        disabled={pinLoading}
                      >
                        {"\u2190"}
                      </button>
                    );
                  }
                  if (key === "clear") {
                    return (
                      <button
                        key={`clear-${idx}`}
                        type="button"
                        className="pin-keypad__button pin-keypad__button--alt"
                        ref={(el) => (keypadRefs.current[idx] = el)}
                        onKeyDown={(e) => handleKeypadKeyDown(e, idx)}
                        onClick={handleClear}
                        aria-label={t("auth.login.clear") || "Clear"}
                        disabled={pinLoading || !pinValue}
                      >
                        {"C"}
                      </button>
                    );
                  }
                  return (
                    <button
                      key={`${key}-${idx}`}
                      type="button"
                      className="pin-keypad__button"
                      ref={(el) => (keypadRefs.current[idx] = el)}
                      onKeyDown={(e) => handleKeypadKeyDown(e, idx)}
                      onClick={(event) => appendDigit(key, event)}
                      disabled={pinLoading}
                      aria-label={t("auth.login.key", { digit: key }) || `Digit ${key}`}
                    >
                      {key}
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              className="pin-indicator moved-below tightened-gap"
              role="status"
              aria-live="polite"
              aria-label={t("auth.pin_placeholder", { min: PIN_MIN, max: PIN_MAX })}
            >
              {Array.from({ length: PIN_MAX }).map((_, i) => (
                <span key={i} className={`pin-dot ${i < pinValue.length ? "filled" : ""}`} />
              ))}
            </div>

            <div className="login-submit-wrap" style={{ display: "flex", justifyContent: "center" }}>
              <button type="submit" className="btn-primary" disabled={pinLoading}>
                <span>{pinLoading ? t("auth.login.submitting") : t("auth.login.submit")}</span>
              </button>
            </div>
          </form>
        )}

        {isOtpStep && (
          <form className="login-modal-form compact otp-form" onSubmit={(e) => { e.preventDefault(); submitOtpStep(); }}>
            <div className="otp-summary">
              {info && (
                <p role="status" className="otp-summary__lead">
                  {info}
                </p>
              )}
              <p className="otp-summary__body">
                {t("auth.login.otp_description", { email: emailMask || "" })}
              </p>
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
              <input
                type="checkbox"
                checked={rememberDevice}
                onChange={(e) => setRememberDevice(e.target.checked)}
              />
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

            <div className="unustasid-parooli-link-wrapper-bottom" style={{ textAlign: "center", marginBottom: "-0.8rem", marginTop: "-0.5rem"  }}>
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
