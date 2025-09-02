// app/components/LoginModal.jsx
"use client";

import Link from "next/link";
import NextImage from "next/image"; // ⬅️ nimetasime ringi
import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

export default function LoginModal({ open, onClose }) {
  const boxRef = useRef(null);
  const router = useRouter();

  // Preload login-ikoonid brauseri cache'i, et modal avaneks koheselt piltidega
  useEffect(() => {
    const sources = ["/login/google1.png", "/login/smart.svg", "/login/mobiil.png"];
    sources.forEach((src) => {
      const img = new window.Image(); // ⬅️ kasuta window.Image
      img.src = src;
    });
  }, []);

  // Fookus ja <body> klass modali oleku järgi
  useEffect(() => {
    if (open && boxRef.current) boxRef.current.focus();
    if (open) document.body.classList.add("modal-open");
    else document.body.classList.remove("modal-open");
    return () => document.body.classList.remove("modal-open");
  }, [open]);

  if (!open) return null;

  // Demo-handlers — asenda päris autentimisega, kui valmis
  function handleGoogleLogin() {
    alert("Google login pole veel seadistatud.");
  }
  function handleSmartID() {
    alert("Smart-ID login pole veel seadistatud.");
  }
  function handleMobileID() {
    alert("Mobiil-ID login pole veel seadistatud.");
  }

  const modalContent = (
    <>
      {/* Backdrop (klõps sulgeb) */}
      <div className="login-modal-backdrop" onClick={onClose} />

      {/* Modal box */}
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
            <NextImage src="/login/google1.png" alt="Google" width={40} height={40} priority />
          </button>

          <button
            className="login-icon-btn"
            onClick={handleSmartID}
            type="button"
            aria-label="Smart-ID"
          >
            <NextImage src="/login/smart.svg" alt="Smart-ID" width={40} height={40} priority />
          </button>

          <button
            className="login-icon-btn"
            onClick={handleMobileID}
            type="button"
            aria-label="Mobiil-ID"
          >
            <NextImage src="/login/mobiil.png" alt="Mobiil-ID" width={40} height={40} priority />
          </button>
        </div>

        <div className="login-or-divider">
          <span>või</span>
        </div>

        {/* Demo-vorm (lihtne valideerimine) */}
        <form
          className="login-modal-form"
          autoComplete="off"
          onSubmit={(e) => {
            e.preventDefault();
            const email = e.currentTarget.email.value.trim();
            const password = e.currentTarget.password.value.trim();

            if (!email) {
              alert("Palun sisesta e-posti aadress.");
              return;
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
              alert("Palun sisesta korrektne e-posti aadress.");
              return;
            }
            if (!password) {
              alert("Palun sisesta parool.");
              return;
            }

            // Demo: suuna vestlusesse
            router.push("/vestlus");
            onClose?.();
          }}
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
            <Link href="/unustasin-parooli" className="unustasid-parooli-link">
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

  // SSR guard: portaali saab teha vaid brauseris
  if (typeof document === "undefined") return null;
  return createPortal(modalContent, document.body);
}
