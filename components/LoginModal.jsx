"use client";

import Link from "next/link";
import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

export default function LoginModal({ open, onClose }) {
  const boxRef = useRef(null);
  const router = useRouter();
  const scrollYRef = useRef(0);

  // ====== Tausta lukustus + fookuse/kerimise käitumine ======
  useEffect(() => {
    if (!open) return;

    // Lukusta body (iOS-sõbralik)
    scrollYRef.current = window.scrollY || 0;
    document.body.classList.add("modal-open");
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollYRef.current}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";

    // iOS kipub esimest inputit fokusseerima – eemaldame automaatfookuse
    setTimeout(() => {
      const ae = document.activeElement;
      if (ae && typeof ae.blur === "function") ae.blur();
    }, 0);

    // Väljaspool modali kerimist ei luba
    const stopScroll = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // ESC sulgeb
    const onKeydown = (e) => {
      if (e.key === "Escape") onClose?.();
      // Tab-fookuse lõks (lihtne wrap)
      if (e.key === "Tab" && boxRef.current) {
        const nodes = boxRef.current.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        const focusables = Array.from(nodes);
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

    document.addEventListener("touchmove", stopScroll, { passive: false });
    document.addEventListener("wheel", stopScroll, { passive: false });
    document.addEventListener("keydown", onKeydown);

    return () => {
      document.body.classList.remove("modal-open");
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollYRef.current);

      document.removeEventListener("touchmove", stopScroll);
      document.removeEventListener("wheel", stopScroll);
      document.removeEventListener("keydown", onKeydown);
    };
  }, [open, onClose]);

  if (!open) return null;

  // ====== Demo-auth handlerid ======
  const handleGoogleLogin = () => alert("Google login pole veel seadistatud.");
  const handleSmartID   = () => alert("Smart-ID login pole veel seadistatud.");
  const handleMobileID  = () => alert("Mobiil-ID login pole veel seadistatud.");

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

  const stopInside = (e) => e.stopPropagation();

  const modal = (
    <>
      {/* Backdrop */}
      <div
        className="login-modal-backdrop"
        onClick={onClose}
        role="presentation"
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={boxRef}
        className="login-modal-root login-modal-box glass-modal"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Logi sisse"
        onClick={stopInside}
        onTouchStart={stopInside}
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
          <button className="login-icon-btn" onClick={handleGoogleLogin} type="button" aria-label="Google">
            <img src="/login/google1.png" alt="Google" width="40" height="40" loading="eager" />
          </button>
          <button className="login-icon-btn" onClick={handleSmartID} type="button" aria-label="Smart-ID">
            <img src="/login/smart.svg" alt="Smart-ID" width="40" height="40" loading="eager" />
          </button>
          <button className="login-icon-btn" onClick={handleMobileID} type="button" aria-label="Mobiil-ID">
            <img src="/login/mobiil.png" alt="Mobiil-ID" width="40" height="40" loading="eager" />
          </button>
        </div>

        <div className="login-or-divider"><span>või</span></div>

        {/* Vorm */}
        <form className="login-modal-form" autoComplete="off" onSubmit={handleSubmit}>
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

          <div style={{ width: "100%", textAlign: "right", marginTop: "-0.4em", marginBottom: "0.6em" }}>
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

  if (typeof document === "undefined") return null;
  return createPortal(modal, document.body);
}
