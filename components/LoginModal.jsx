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
        <label>
          <input
            className="input-modern"
            type="email"
            name="email"
            placeholder="sinu@email.ee"
            autoComplete="username"
            tabIndex={open ? 0 : -1}
          />
        </label>
        <div className="login-password-field">
          <label>
            <input
              className="input-modern"
              type="password"
              name="password"
              placeholder="Sisesta parool"
              autoComplete="current-password"
              tabIndex={open ? 0 : -1}
            />
          </label>
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

      {/* VÕI lahutaja */}
      <div className="login-or-divider"><span>või</span></div>

      {/* Sotsiaalse sisselogimise nupud: Google üleval, kaks kõrvuti all */}
      <div className="login-social-rows">
        <div className="login-social-row login-social-row-google">
          <button className="btn-social-google" onClick={handleGoogleLogin} type="button">
            <svg width="20" height="20" viewBox="0 0 20 20" style={{marginRight: "0.4em"}}><g><path fill="#EA4335" d="M19.6 10.2c0-.6 0-1-.1-1.4H10v2.7h5.5c-.1.7-.6 1.7-1.7 2.2v1.8h2.7c1.5-1.4 2.3-3.5 2.3-5.3z"/><path fill="#34A853" d="M10 20c2.4 0 4.3-.8 5.7-2.2l-2.7-2.1c-.7.5-1.6.9-3 .9-2.3 0-4.2-1.5-4.9-3.5H2.4v2.2C3.8 18.8 6.7 20 10 20z"/><path fill="#4A90E2" d="M5.1 12.9c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9V6.9H2.4A9.9 9.9 0 0 0 0 10c0 1.6.4 3.1 1.2 4.3l2.7-2.1z"/><path fill="#FBBC05" d="M10 3.9c1.3 0 2.2.4 2.7.7l2-2C14.3 1.1 12.4 0 10 0 6.7 0 3.8 1.2 2.4 3.1l2.7 2.2C5.8 5.5 7.7 3.9 10 3.9z"/></g></svg>
            Google
          </button>
        </div>
        <div className="login-social-row login-social-row-id">
          <button className="btn-social-smartid" onClick={handleSmartID} type="button">
            Smart-ID
          </button>
          <button className="btn-social-mobileid" onClick={handleMobileID} type="button">
            Mobiil-ID
          </button>
        </div>
      </div>

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
