"use client";

import Link from "next/link";
import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function LoginModal({ open, onClose }) {
  const boxRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (open && boxRef.current) {
      boxRef.current.focus();
    }
    // Body scroll disable kui modal avatud (soovi korral)
    if (open) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => document.body.classList.remove("modal-open");
  }, [open]);

  if (!open) return null;

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
          E-post
          <input
            className="input-modern"
            type="email"
            name="email"
            placeholder="sinu@email.ee"
            autoComplete="username"
            tabIndex={open ? 0 : -1}
          />
        </label>
        <label>
          Parool
          <input
            className="input-modern"
            type="password"
            name="password"
            placeholder="Sisesta parool"
            autoComplete="current-password"
            tabIndex={open ? 0 : -1}
          />
        </label>
        <button type="submit" className="btn-primary" tabIndex={open ? 0 : -1}>
          Sisenen
        </button>
      </form>
      <div className="login-modal-links">
        <Link href="/registreerimine" tabIndex={open ? 0 : -1} className="link-brand">
          Registreeru
        </Link>
        <Link href="/unustasin-parooli" tabIndex={open ? 0 : -1} className="link-brand">
          Unustasid parooli?
        </Link>
      </div>
    </div>
  );
}
