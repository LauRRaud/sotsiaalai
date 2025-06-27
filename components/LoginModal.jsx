"use client";

import Link from "next/link";
import React, { useEffect, useRef } from "react";

export default function LoginModal({ open, onClose }) {
  const boxRef = useRef(null);

  useEffect(() => {
    if (open && boxRef.current) {
      boxRef.current.focus();
    }
  }, [open]);

  function handleOverlayClick(e) {
    if (e.target.classList.contains("login-modal-overlay")) {
      onClose();
    }
  }

  if (!open) return null;

  return (
    <div
      className="login-modal-overlay"
      onClick={handleOverlayClick}
      tabIndex={-1}
    >
      <div
        ref={boxRef}
        className="login-modal-box"
        tabIndex={-1}
        aria-modal="true"
        role="dialog"
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

            alert("Sisselogitud! (demo)");
            onClose();
          }}
        >
          <label>
            E-post
            <input
              type="email"
              name="email"
              placeholder="sinu@email.ee"
              // required eemaldatud
            />
          </label>
          <label>
            Parool
            <input
              type="password"
              name="password"
              placeholder="Sisesta parool"
              // required eemaldatud
            />
          </label>
          <button type="submit" className="login-modal-submit">
            Logi sisse
          </button>
        </form>
        <div className="login-modal-links">
          <Link href="/registreeru" tabIndex={open ? 0 : -1}>
            Registreeru
          </Link>
          <Link href="/unustasin-parooli" tabIndex={open ? 0 : -1}>
            Unustasid parooli?
          </Link>
        </div>
        <style jsx>{`
          .login-modal-overlay {
            position: fixed;
            inset: 0;
            z-index: 9999;
            background: rgba(22, 18, 33, 0.62);
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            min-width: 100vw;
          }
          .login-modal-box {
            position: fixed;
            left: 50vw;
            top: 50vh;
            transform: translate(-50%, -50%);
            z-index: 10000;
            background: #201c2a;
            color: #f1eefb;
            border-radius: 1.5em;
            padding: 2.5em 2em 1.7em 2em;
            box-shadow: 0 8px 32px rgba(24, 18, 40, 0.35);
            width: 100%;
            max-width: 420px;
            min-width: 300px;
            outline: none;
            animation: modalSlideIn 0.27s;
          }
          .login-modal-title {
            font-size: 2.3em;
            font-weight: 600;
            text-align: center;
            margin-bottom: 1.8em;
            color: rgba(132, 51, 180, 0.97);
          }
          .login-modal-close {
            position: absolute;
            top: 1.2em;
            right: 1.1em;
            background: none;
            border: none;
            color: #bba1d6;
            font-size: 1.8em;
            cursor: pointer;
            transition: color 0.19s;
            z-index: 10;
          }
          .login-modal-close:hover {
            color: #f6c6ff;
          }
          .login-modal-form label {
            display: block;
            font-weight: 600;
            margin-bottom: 1em;
            color:rgb(221, 212, 236);
            font-size: 1.1em;
          }
          .login-modal-form input {
            width: 100%;
            padding: 0.63em 0.9em;
            border-radius: 0.8em;
            border: 1.2px solid #7f2ab177;
            background: #292344;
            color:rgb(250, 248, 253);
            margin-top: 0.35em;
            margin-bottom: 0.8em;
            font-size: 1.1em;
            outline: none;
            transition: border 0.19s;
            box-sizing: border-box;
          }
          .login-modal-form input:focus {
            border: 1.2px solid #c48dfa;
            background: #342a50;
          }
          .login-modal-submit {
            width: 100%;
            background: linear-gradient(90deg, #7f2ab1, #482682 86%);
            color: rgb(250, 248, 253);
            font-weight: 500;
            font-size: 1.13em;
            border: none;
            border-radius: 1em;
            padding: 0.85em 0;
            margin-top: 0.4em;
            cursor: pointer;
            box-shadow: 0 2px 10px rgba(50,30,77,0.16);
            transition: background 0.18s;
          }
          .login-modal-submit:hover {
            background: linear-gradient(90deg, #8e39d6, #54308a 90%);
          }
          .login-modal-links {
            display: flex;
            justify-content: space-between;
            margin-top: 2em;
            gap: 1.2em;
          }
          .login-modal-links a {
            color: #cdb5f4;
            font-size: 1.6em;
            font-weight: 700;
            text-decoration: none;
            transition: color 0.19s;
          }
          .login-modal-links a:hover {
            color: #e3d2ff;
            text-decoration: underline;
          }
          @keyframes modalSlideIn {
            from {
              transform: translate(-50%, -62px);
              opacity: 0;
            }
            to {
              transform: translate(-50%, -50%);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
