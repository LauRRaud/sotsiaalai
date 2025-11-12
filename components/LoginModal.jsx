"use client";
import React, { useEffect, useRef, useState } from "react";
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

  const [pinValue, setPinValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const boxRef = useRef(null);
  const hiddenInputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const tid = setTimeout(() => hiddenInputRef.current?.focus?.(), 0);
    return () => clearTimeout(tid);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (status === "authenticated" && session) {
      onClose?.();
      router.replace(nextUrl);
      router.refresh();
    }
  }, [open, status, session, nextUrl, router, onClose]);

  const onHiddenKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
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

  const appendDigit = (digit) => {
    setPinValue((p) => (p.length >= PIN_MAX ? p : `${p}${digit}`));
    hiddenInputRef.current?.focus();
    setError(null);
    // small haptic feedback on supported devices
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try { navigator.vibrate(8); } catch (e) { /* ignore */ }
    }
  };
  const handleBackspace = () => {
    setPinValue((p) => p.slice(0, -1));
    hiddenInputRef.current?.focus();
    setError(null);
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try { navigator.vibrate(6); } catch (e) {}
    }
  };
  const handleClear = () => {
    setPinValue("");
    hiddenInputRef.current?.focus();
    setError(null);
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try { navigator.vibrate(6); } catch (e) {}
    }
  };

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setError(null);

    const emailInput = boxRef.current?.querySelector('input[name="email"]');
    const email = String(emailInput?.value || "").trim();
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

    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        pin,
        redirect: false,
        callbackUrl: nextUrl,
      });
      if (res?.error) {
        // NextAuth returns error string sometimes; present friendly message
        setError(t("auth.login.error.credentials"));
        return;
      }
      if (res?.ok && res.url) {
        setPinValue("");
        onClose?.();
        router.replace(toRelative(res.url));
        router.refresh();
      }
    } catch (err) {
      console.error("login error", err);
      setError(t("auth.login.error.generic") || "Sisselogimine ebaõnnestus.");
    } finally {
      setLoading(false);
    }
  };

  const stopInside = (e) => e.stopPropagation();

  if (!open) return null;

  // static keypad order (1..9, back, 0, clear)
  const keys = ["1","2","3","4","5","6","7","8","9","back","0","clear"];

  return createPortal(
    <>
      <div className="login-modal-backdrop" onClick={onClose} />
      <div
        ref={boxRef}
        id="login-modal"
        className="login-modal-root login-modal-box glass-modal compact-modal"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={t("auth.login.title")}
        onClick={stopInside}
      >
        <button className="login-modal-close" onClick={onClose} aria-label={t("buttons.close")} type="button">
          ×
        </button>

        <div className="glass-title" style={{ textAlign: "center", margin: "-0.8rem 0 18px" }}>
          {t("auth.login.title")}
        </div>

        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="glass-note glass-note--center"
          >
            {error}
          </div>
        )}

        <form className="login-modal-form compact" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} autoComplete="off">
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

          <div className="pin-keypad-all-wrapper" aria-hidden="false">
            <div className="pin-keypad-all" role="group" aria-label={t("auth.login.title")}>
              {keys.map((k, idx) => {
                if (k === "back") {
                  return (
                    <button
                      key={`back-${idx}`}
                      type="button"
                      className="pin-keypad__button pin-keypad__button--alt"
                      onClick={handleBackspace}
                      aria-label={t("auth.login.back") || "Backspace"}
                      disabled={loading}
                    >
                      ⌫
                    </button>
                  );
                }
                if (k === "clear") {
                  return (
                    <button
                      key={`clear-${idx}`}
                      type="button"
                      className="pin-keypad__button pin-keypad__button--alt"
                      onClick={handleClear}
                      aria-label={t("auth.login.clear") || "Clear"}
                      disabled={loading || !pinValue}
                    >
                      C
                    </button>
                  );
                }
                return (
                  <button
                    key={`${k}-${idx}`}
                    type="button"
                    className="pin-keypad__button"
                    onClick={() => appendDigit(k)}
                    disabled={loading}
                    aria-label={t("auth.login.key", { digit: k }) || `Digit ${k}`}
                  >
                    {k}
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
            type="text"
          />

          <div className="login-submit-wrap" style={{ display: "flex", justifyContent: "center" }}>
            <button type="button" className="btn-primary" onClick={handleSubmit} disabled={loading}>
              <span>{loading ? t("auth.login.submitting") : t("auth.login.submit")}</span>
            </button>
          </div>
        </form>

        <div className="login-modal-bottom-link" style={{ textAlign: "center", marginTop: "0rem", marginBottom: "-0.2rem" }}>
          <Link
            href={`${localizePath("/registreerimine", locale)}?next=${encodeURIComponent(nextUrl)}`}
            className="link-brand"
          >
            {t("auth.login.register_link")}
          </Link>
        </div>

        <div className="unustasid-parooli-link-wrapper-bottom" style={{ textAlign: "center", marginBottom: "-1rem" }}>
          <Link href="/unustasin-pin" className="unustasid-parooli-link">
            {t("auth.login.forgot")}
          </Link>
        </div>
      </div>
    </>,
    document.body
  );
}
