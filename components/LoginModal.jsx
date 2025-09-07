"use client";

import Link from "next/link";
import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

export default function LoginModal({ open, onClose }) {
  const boxRef = useRef(null);
  const router = useRouter();

  // Preload login-ikoonid ainult siis, kui modal avatakse
  useEffect(() => {
    if (!open) return;
    ["/login/google1.png", "/login/smart.svg", "/login/mobiil.png"].forEach((src) => {
      const img = new Image();
      img.decoding = "async";
      img.loading = "eager";
      img.src = src;
    });
  }, [open]);

  // Fookus + <body> klass modali oleku järgi
  useEffect(() => {
    if (open && boxRef.current) {
      boxRef.current.focus();
    }
    document.body.classList.toggle("modal-open", open);
    return () => document.body.classList.remove("modal-open");
  }, [open]);

  if (!open) return null;

  // Demo-handlers
  const handleGoogleLogin = () => alert("Google login pole veel seadistatud.");
  const handleSmartID = () => alert("Smart-ID login pole veel seadistatud.");
  const handleMobileID = () => alert("Mobiil-ID login pole veel seadistatud.");

  const handleSubmit = (e) => {
    e.preventDefault();
    const email = e.currentTarget.email.value.trim();
    const password = e.currentTarget.password.value.trim();

    if (!email) return alert("Palun sisesta e-posti aadress.");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return alert("Palun sisesta korrektne e-posti aadress.");
    if (!password) return alert("Palun sisesta parool.");

    router.push("/vestlus");
    onClose?.();
  };

  const modalContent = (
    <>
      {/* Backdrop */}
      <div className="login-modal-backdrop" onClick={onClose} />

      {/* Modal */}
      <div
        ref={boxRef}
        className="login-modal-root login-modal-box glass-modal"
        tabIndex={-1}
        aria-modal="true"
        role="dialog"
        style={{ outline: "none" }}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose?.();
        }}
        aria-label="Logi sisse"
      >
        {/* Close button */}
        <button
          className="login-modal-close"
          onClick={onClose}
          aria-label="Sulge"
          type="button"
        >
          ×
        </button>

        <div className="glass-title">Logi sisse</div>

        {/* SSO ikoonid */}
        <div className="login-social-icons-row">
          <button
            className="login-icon-btn"
            onClick={handleGoogleLogin}
            type="button"
            aria-label="Google"
          >
            <img
              src="/login/google1.png"
              alt="Google"
              width="40"
              height="40"
              loading="lazy"
              decoding="async"
              fetchPriority="low"
            />
          </button>

          <button
            className="login-icon-btn"
            onClick={handleSmartID}
            type="button"
            aria-label="Smart-ID"
          >
            <img
              src="/login/smart.svg"
              alt="Smart-ID"
              width="40"
              height="40"
              loading="lazy"
              decoding="async"
              fetchPriority="low"
            />
          </button>

          <button
            className="login-icon-btn"
            onClick={handleMobileID}
            type="button"
            aria-label="Mobiil-ID"
          >
            <img
              src="/login/mobiil.png"
              alt="Mobiil-ID"
              width="40"
              height="40"
              loading="lazy"
              decoding="async"
              fetchPriority="low"
            />
          </button>
        </div>

        <div className="login-or-divider"><span>või</span></div>

        {/* Email + password form */}
        <form
          className="login-modal-form"
          autoComplete="off"
          onSubmit={handleSubmit}
        >
          <label style={{ width: "100%", display: "block" }}>
            <input
              className="input-modern"
              type="email"
              name="email"
              placeholder="Sinu@email.ee"
              autoComplete="username"
              inputMode="email"
            />
          </label>

          <label style={{ width: "100%", display: "block" }}>
            <input
              className="input-modern"
              type="password"
              name="password"
              placeholder="Parool"
              autoComplete="current-password"
            />
          </label>

          <div
            style={{
              width: "100%",
              textAlign: "right",
              marginTop: "-0.4em",
              marginBottom: "0.6em",
            }}
          >
            <Link
              href="/unustasin-parooli"
              className="unustasid-parooli-link"
            >
              Unustasid parooli?
            </Link>
          </div>

          <button type="submit" className="btn-primary">
            <span>Sisenen</span>
          </button>
        </form>

        <div className="login-modal-bottom-link">
          <Link href="/registreerimine" className="link-brand">
            Registreeru
          </Link>
        </div>
      </div>
    </>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modalContent, document.body);
}
