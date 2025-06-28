"use client";

import Link from "next/link";
import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation"; // <-- lisa see!

export default function LoginModal({ open, onClose }) {
  const boxRef = useRef(null);
  const router = useRouter(); // <-- lisa see!

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
            router.push("/vestlus"); // <-- see viib vestluslehele!
          }}
        >
          <label>
            E-post
            <input
              type="email"
              name="email"
              placeholder="sinu@email.ee"
            />
          </label>
          <label>
            Parool
            <input
              type="password"
              name="password"
              placeholder="Sisesta parool"
            />
          </label>
          <button type="submit" className="login-modal-submit">
            Sisenen
          </button>
        </form>
        <div className="login-modal-links">
          <Link href="/registreeru" tabIndex={open ? 0 : -1}>
            <span className="login-modal-link-large">Registreeru</span>
          </Link>
          <Link href="/unustasin-parooli" tabIndex={open ? 0 : -1}>
            <span className="login-modal-link-large">Unustasid parooli?</span>
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
            left: 50vw;
            top: 50vh;
            transform: translate(-50%, -50%);
            z-index: 10000;
            background: #201c2a;
            color: #f1eefb;
            border-radius: 1.5em;
            padding: 2.2em 1.3em 1.3em 1.3em;
            box-shadow: 0 8px 32px rgba(24, 18, 40, 0.35);
            width: 100%;
            max-width: 370px;
            min-width: 230px;
            outline: none;
            animation: modalSlideIn 0.27s;
            position: fixed;
          }
          .login-modal-title {
            font-size: 2.5em;
            font-weight: 700;
            text-align: center;
            margin-bottom: 1em;
            color:rgb(145, 47, 201);
            letter-spacing: 0.01em;
          }
          .login-modal-close {
            position: absolute;
            top: 0.5em;
            right: 0.5em;
            background: none;
            border: none;
            color: #bba1d6;
            font-size: 2.2em;
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
            margin-bottom: 0.4em;
            color: #ded3f5;
            font-size: 1.4em;
            letter-spacing: 0.01em;
          }
          .login-modal-form input {
            width: 100%;
            padding: 0.68em 1em;
            border-radius: 0.8em;
            border: 1.3px solid #a786d177;
            background: #292344;
            color: #f6efff;
            margin-top: 0.28em;
            margin-bottom: 0.85em;
            font-size: 1.15em;
            outline: none;
            transition: border 0.19s, color 0.18s, background 0.18s;
            box-sizing: border-box;
          }
          .login-modal-form input:focus {
            border: 1.3px solid #c48dfa;
            background: #342a50;
            color: #fff;
          }
          .login-modal-submit {
            width: 100%;
            background: linear-gradient(90deg, #7f2ab1, #482682 86%);
            color:rgba(246, 239, 255, 0.92);
            font-weight: 500;
            font-size: 1.4em;
            border: none;
            border-radius: 1em;
            padding: 1em 0;
            margin-top: 0.5em;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(50,30,77,0.11);
            transition: background 0.18s;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            letter-spacing: 0.07em;
            text-shadow: 0 1px 1px rgba(50,30,77,0.10);
          }
          .login-modal-submit:hover {
            background: linear-gradient(90deg, #8e39d6, #54308a 90%);
          }
          .login-modal-links {
            display: flex;
            justify-content: space-between;
            margin-top: 2em;
            gap: 1.3em;
          }
          .login-modal-link-large {
            color: rgb(149, 77, 212);
            font-size: 1.25em;
            font-weight: 600;
            text-decoration: none;
            transition: color 0.19s;
            letter-spacing: 0.01em;
            line-height: 1.05;
          }
          .login-modal-link-large:hover {
            color:rgb(160, 95, 217);
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
