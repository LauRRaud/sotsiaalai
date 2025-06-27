// components/LoginModal.jsx

import React, { useEffect, useRef } from "react";

export default function LoginModal({ open, onClose }) {
  const boxRef = useRef(null);

  // Sulge modal ESC klahviga
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Overlay klikil sule ainult siis, kui klikiti overlayd, mitte modali enda peal
  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  if (!open) return null;

  return (
    <div className="login-modal-overlay" onClick={handleOverlayClick}>
      <div
        ref={boxRef}
        className="login-modal-box"
        tabIndex={-1}
      >
        <button
          className="login-modal-close"
          onClick={onClose}
          aria-label="Sulge"
          type="button"
        >
          ×
        </button>
        <div className="login-modal-title">Logi sisse</div>
        <form
          className="login-modal-form"
          autoComplete="off"
          onSubmit={(e) => {
            e.preventDefault();
            alert("Sisselogitud! (demo)");
            onClose();
          }}
        >
          <label>
            E-post
            <input type="email" name="email" placeholder="sinu@email.ee" required />
          </label>
          <label>
            Parool
            <input type="password" name="password" placeholder="Sisesta parool" required />
          </label>
          <button type="submit" className="login-modal-submit">Logi sisse</button>
        </form>
        <div className="login-modal-links">
          <a href="#" tabIndex={open ? 0 : -1}>Registreerun</a>
          <a href="#" tabIndex={open ? 0 : -1}>Unustasin parooli</a>
        </div>
      </div>
      <style jsx>{`
        .login-modal-overlay {
          position: fixed;
          z-index: 9998;
          left: 0; top: 0; width: 100vw; height: 100vh;
          background: rgba(24,24,24,0.62);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .login-modal-box {
          background: #f4f5f7;
          border-radius: 1.1rem;
          box-shadow: 0 8px 38px #2223;
          padding: 2.3rem 1.7rem 1.4rem 1.7rem;
          max-width: 350px;
          width: 97vw;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }
        .login-modal-close {
          position: absolute;
          right: 1rem;
          top: 1rem;
          border: none;
          background: none;
          font-size: 1.7rem;
          color: #444;
          cursor: pointer;
          padding: 0.08em 0.25em;
          line-height: 1;
        }
        .login-modal-title {
          text-align: center;
          font-size: 1.17rem;
          font-weight: 700;
          color: #181818;
          margin-bottom: 0.6rem;
        }
        .login-modal-form {
          display: flex;
          flex-direction: column;
          gap: 0.67rem;
        }
        .login-modal-form label {
          display: flex;
          flex-direction: column;
          font-size: 1rem;
          color: #222;
          gap: 0.2em;
        }
        .login-modal-form input {
          margin-top: 0.12em;
          padding: 0.58em 0.8em;
          border-radius: 0.7em;
          border: 1.1px solid #bbb;
          font-size: 1rem;
          background: #fff;
          transition: border-color 0.17s;
        }
        .login-modal-form input:focus {
          border-color: #8216c7; /* tume lilla */
          outline: none;
        }
        .login-modal-submit {
          margin-top: 0.69em;
          padding: 0.82em 2em;
          border-radius: 1.5em;
          font-size: 1.09rem;
          font-weight: 700;
          border: 2px solid #8216c7;  /* tume lilla */
          background: #8216c7;         /* tume lilla */
          color: #fff;
          cursor: pointer;
          transition: background 0.18s, color 0.18s, border-color 0.15s;
        }
        .login-modal-submit:hover, .login-modal-submit:focus {
          background: #5a118a;         /* veel tumedam lilla hoveril */
          border-color: #5a118a;
        }
        .login-modal-links {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.28em;
          margin-top: 0.5rem;
        }
        .login-modal-links a {
          color: #8216c7;
          text-decoration: none;
          font-weight: 500;
          font-size: 0.98em;
          transition: color 0.13s;
        }
        .login-modal-links a:hover {
          text-decoration: underline;
          color: #5a118a;
        }
      `}</style>
    </div>
  );
}
