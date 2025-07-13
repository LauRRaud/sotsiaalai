import Link from "next/link";
import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function LoginModal({ open, onClose }) {
  const boxRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (open && boxRef.current) boxRef.current.focus();
    if (open) document.body.classList.add("modal-open");
    else document.body.classList.remove("modal-open");
    return () => document.body.classList.remove("modal-open");
  }, [open]);

  if (!open) return null;

  // Demo funktsioonid
  function handleGoogleLogin() { alert("Google login pole veel seadistatud."); }
  function handleSmartID() { alert("Smart-ID login pole veel seadistatud."); }
  function handleMobileID() { alert("Mobiil-ID login pole veel seadistatud."); }

  return (
    <div
      ref={boxRef}
      className="login-modal-box glass-modal"
      tabIndex={-1}
      aria-modal="true"
      role="dialog"
      style={{ outline: "none" }}
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

      {/* Ikonoloogiline sisselogimine */}
      <div className="login-social-icons-row">
        <button className="login-icon-btn" onClick={handleGoogleLogin} type="button" aria-label="Google">
          <img src="/google1.png" alt="Google" />
        </button>
        <button className="login-icon-btn" onClick={handleSmartID} type="button" aria-label="Smart-ID">
          <img src="/smart.svg" alt="Smart-ID" />
        </button>
        <button className="login-icon-btn" onClick={handleMobileID} type="button" aria-label="Mobiil-ID">
          <img src="/mobiil.png" alt="Mobiil-ID" />
        </button>
      </div>

      {/* Separator */}
      <div className="login-or-divider"><span>või</span></div>

      {/* Email/parool vorm */}
      <form
        className="login-modal-form"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          const email = e.target.email.value.trim();
          const password = e.target.password.value.trim();
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
          router.push("/vestlus");
        }}
      >
        <label style={{ width: "100%", display: "block" }}>
          <input
            className="input-modern"
            type="email"
            name="email"
            placeholder="Sinu@email.ee"
            autoComplete="username"
            tabIndex={open ? 0 : -1}
          />
        </label>
        <label style={{ width: "100%", display: "block" }}>
          <input
            className="input-modern"
            type="password"
            name="password"
            placeholder="Parool"
            autoComplete="current-password"
            tabIndex={open ? 0 : -1}
          />
        </label>
        <div style={{ width: "100%", textAlign: "right", marginTop: "-0.4em", marginBottom: "0.6em" }}>
          <Link
            href="/unustasin-parooli"
            tabIndex={open ? 0 : -1}
            className="unustasid-parooli-link"
          >
            Unustasid parooli?
          </Link>
        </div>
        <button type="submit" className="btn-primary" tabIndex={open ? 0 : -1}>
          <span>Sisenen</span>
        </button>
      </form>

      {/* Registreeru link kõige lõpus */}
      <div className="login-modal-bottom-link">
        <Link
          href="/registreerimine"
          tabIndex={open ? 0 : -1}
          className="link-brand"
        >
          Registreeru
        </Link>
      </div>
    </div>
  );
}
