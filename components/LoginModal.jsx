"use client";

import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { localizePath } from "@/lib/localizePath";

export default function LoginModal({ open, onClose }) {
  const boxRef = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, locale } = useI18n();
  const defaultNextUrl = localizePath("/vestlus", locale);
  const nextUrl = searchParams?.get("next") || defaultNextUrl;

  const [loading, setLoading] = useState(null); // "credentials" | "google" | "smart_id" | "mobiil_id"
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;

    const body = document.body;
    const previousStyles = {
      overflow: body.style.overflow,
      position: body.style.position,
      width: body.style.width,
      top: body.style.top,
      touchAction: body.style.touchAction,
    };
    const scrollY = typeof window !== "undefined" ? window.scrollY || 0 : 0;

    body.classList.add("modal-open");
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    body.style.touchAction = "none";

    // Klahvikäsitleja: Escape sulgemiseks ja Tab-tsükli hoidmiseks
    const onKeydown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
      if (e.key === "Tab" && boxRef.current) {
        const nodes = boxRef.current.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        const focusables = Array.from(nodes).filter((n) => {
          // ignore elements that are hidden or not focusable
          return (n.offsetWidth > 0 || n.offsetHeight > 0) && !n.hasAttribute("disabled");
        });
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;

        if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeydown);

    return () => {
      body.classList.remove("modal-open");
      document.removeEventListener("keydown", onKeydown);
      body.style.overflow = previousStyles.overflow;
      body.style.position = previousStyles.position;
      body.style.width = previousStyles.width;
      body.style.top = previousStyles.top;
      body.style.touchAction = previousStyles.touchAction;
      window.scrollTo(0, scrollY);
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading("google");
    try {
      await signIn("google", { callbackUrl: nextUrl });
    } finally {
      setLoading(null);
    }
  };

  const handleSmartID = async () => {
    setError(null);
    setLoading("smart_id");
    try {
      const personalCode = window.prompt(t("auth.login.prompt.smart_id")) ?? "";
      const res = await signIn("estonian_eid", {
        method: "smart_id",
        personalCode,
        redirect: false,
        callbackUrl: nextUrl,
      });
      if (res?.error) setError(t("auth.login.error.smart_id"));
      if (res?.ok && res.url) {
        onClose?.();
        router.replace(res.url);
        router.refresh();
      }
    } finally {
      setLoading(null);
    }
  };

  const handleMobileID = async () => {
    setError(null);
    setLoading("mobiil_id");
    try {
      const personalCode = window.prompt(t("auth.login.prompt.mobile_id_code")) ?? "";
      const phone = window.prompt(t("auth.login.prompt.mobile_id_phone")) ?? "";
      const res = await signIn("estonian_eid", {
        method: "mobiil_id",
        personalCode,
        phone,
        redirect: false,
        callbackUrl: nextUrl,
      });
      if (res?.error) setError(t("auth.login.error.mobile_id"));
      if (res?.ok && res.url) {
        onClose?.();
        router.replace(res.url);
        router.refresh();
      }
    } finally {
      setLoading(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading("credentials");

    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "").trim();

    if (!email) {
      setLoading(null);
      setError(t("auth.login.error.email_required"));
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLoading(null);
      setError(t("auth.login.error.email_invalid"));
      return;
    }
    if (!password) {
      setLoading(null);
      setError(t("auth.login.error.password_required"));
      return;
    }

    const res = await signIn("credentials", {
      email,
      password,
      callbackUrl: nextUrl,
      redirect: false,
    });
    setLoading(null);

    if (res?.error) {
      setError(t("auth.login.error.credentials"));
      return;
    }
    if (res?.ok && res.url) {
      onClose?.();
      router.replace(res.url);
      router.refresh();
    }
  };

  const stopInside = (e) => e.stopPropagation();

  const modal = (
    <>
      <div
        className="login-modal-backdrop login-modal-backdrop--mobile u-mobile-modal-backdrop"
        onClick={onClose}
        role="presentation"
        aria-hidden="true"
      />

      <div
        ref={boxRef}
        id="login-modal"
        className="login-modal-root login-modal-box glass-modal login-modal--mobile u-mobile-modal"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={t("auth.login.title")}
        onClick={stopInside}
        onMouseDown={stopInside}   // aitab vältida fookuse kaotust mousedown'il
        onTouchStart={stopInside}
      >
        <button className="login-modal-close" onClick={onClose} aria-label={t("buttons.close")} type="button">
          ×
        </button>

        <div className="glass-title">{t("auth.login.title")}</div>

        <div className="login-social-icons-row" style={{ display: "flex", gap: "0.6rem" }}>
          <button
            className="login-icon-btn"
            onClick={handleGoogleLogin}
            type="button"
            aria-label={t("auth.login.google")}
            disabled={loading === "google"}
          >
            <img src="/login/google1.png" alt={t("auth.login.google")} width="40" height="40" loading="eager" />
          </button>
          <button
            className="login-icon-btn"
            onClick={handleSmartID}
            type="button"
            aria-label={t("auth.login.smart_id")}
            disabled={loading === "smart_id"}
          >
            <img src="/login/smart.svg" alt={t("auth.login.smart_id")} width="40" height="40" loading="eager" />
          </button>
          <button
            className="login-icon-btn"
            onClick={handleMobileID}
            type="button"
            aria-label={t("auth.login.mobile_id")}
            disabled={loading === "mobiil_id"}
          >
            <img src="/login/mobiil.png" alt={t("auth.login.mobile_id")} width="40" height="40" loading="eager" />
          </button>
        </div>

        <div className="login-or-divider" style={{ textAlign: "center" }}>
          <span>{t("auth.login.or")}</span>
        </div>

        {error && (
          <div role="alert" aria-live="assertive" className="glass-note" style={{ width: "100%", marginBottom: "0.6rem" }}>
            {error}
          </div>
        )}

        <form className="login-modal-form" autoComplete="off" onSubmit={handleSubmit}>
          <label style={{ width: "100%", display: "block" }}>
            <input
              className="input-modern"
              type="email"
              name="email"
              placeholder={t("auth.email_placeholder")}
              autoComplete="username"
              inputMode="email"
              // autoFocus removed to avoid forcing immediate typing/focus
            />
          </label>

          <label style={{ width: "100%", display: "block" }}>
            <input
              className="input-modern"
              type="password"
              name="password"
              placeholder={t("auth.password_placeholder")}
              autoComplete="current-password"
            />
          </label>

          <div style={{ width: "100%", textAlign: "right", marginTop: "-0.4em", marginBottom: "0.6em" }}>
            <Link href="/unustasin-parooli" className="unustasid-parooli-link">{t("auth.login.forgot")}</Link>
          </div>

          <button type="submit" className="btn-primary" disabled={loading === "credentials"}>
            <span>{loading === "credentials" ? t("auth.login.submitting") : t("auth.login.submit")}</span>
          </button>
        </form>

        <div className="login-modal-bottom-link">
          <Link href={`${localizePath("/registreerimine", locale)}?next=${encodeURIComponent(nextUrl)}`} className="link-brand">
            {t("auth.login.register_link")}
          </Link>
        </div>
      </div>
    </>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modal, document.body);
}
