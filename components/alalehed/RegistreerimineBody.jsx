"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function RegistreerimineBody({ openLoginModal }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams?.get("next") || "/vestlus";

  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "SOCIAL_WORKER",
    agree: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.agree) {
      setError("Pead nõustuma kasutajatingimustega ja privaatsuspoliitikaga.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          role: form.role,
        }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        // NB! route.js tagastab 'message', mitte 'error'
        setError(payload?.message || payload?.error || "Registreerimine ebaõnnestus.");
        return;
      }

      const login = await signIn("credentials", {
        redirect: false,
        callbackUrl: nextUrl,
        email: form.email,
        password: form.password,
      });

      if (login?.error) {
        setError("Automaatne sisselogimine ebaõnnestus. Proovi eraldi sisse logida.");
        router.replace(`/registreerimine?next=${encodeURIComponent(nextUrl)}`);
        return;
      }

      router.replace(`/tellimus?next=${encodeURIComponent(nextUrl)}`);
      router.refresh();
    } catch (err) {
      console.error("Register error", err);
      setError("Server ei vasta. Palun proovi uuesti.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="main-content glass-box">
      <h1 className="glass-title">Loo konto</h1>

      <form className="glass-form" onSubmit={handleSubmit} autoComplete="off">
        <input
          type="email"
          id="email"
          name="email"
          className="input-modern input-email-top"
          placeholder="Sinu@email.ee"
          value={form.email}
          onChange={handleChange}
          required
          autoComplete="username"
        />

        <input
          type="password"
          id="password"
          name="password"
          className="input-modern"
          placeholder="Parool"
          value={form.password}
          onChange={handleChange}
          required
          minLength={6}
          autoComplete="new-password"
        />

        <div className="glass-label glass-label-radio">Roll:</div>
        <div className="glass-radio-group" role="radiogroup">
          <label>
            <input
              type="radio"
              name="role"
              value="SOCIAL_WORKER"
              checked={form.role === "SOCIAL_WORKER"}
              onChange={handleChange}
            />
            Sotsiaaltöö spetsialist
          </label>
          <label>
            <input
              type="radio"
              name="role"
              value="CLIENT"
              checked={form.role === "CLIENT"}
              onChange={handleChange}
            />
            Eluküsimusega pöörduja
          </label>
        </div>

        <label className="glass-checkbox">
          <input
            type="checkbox"
            name="agree"
            checked={form.agree}
            onChange={handleChange}
            required
          />
          <span className="checkbox-text">
            Nõustun{" "}
            <Link href="/kasutustingimused" className="link-brand-inline">
              kasutajatingimustega
            </Link>{" "}
            ja{" "}
            <Link href="/privaatsustingimused" className="link-brand-inline">
              privaatsuspoliitikaga
            </Link>
          </span>
        </label>

        {error && (
          <div role="alert" className="glass-note" style={{ marginBottom: "0.75rem" }}>
            {error}
          </div>
        )}

        <button className="btn-primary" type="submit" disabled={submitting}>
          <span>{submitting ? "Loome kontot…" : "Registreeru"}</span>
        </button>
      </form>

      <div className="glass-bottom-link">
        <span className="midtext" style={{ marginRight: "0.17em" }}>
          Mul on juba konto?
        </span>
        <a
          href="#"
          className="link-brand"
          onClick={(e) => {
            e.preventDefault();
            // Ava lihtsalt modal, ära muuda URL-i:
            openLoginModal?.();
          }}
        >
          Logi sisse
        </a>
      </div>

      <div className="back-btn-wrapper">
        <button
          type="button"
          className="back-arrow-btn"
          onClick={() => router.push("/")}
          aria-label="Tagasi avalehele"
        >
          <span className="back-arrow-circle"></span>
        </button>
      </div>

      <footer className="alaleht-footer">SotsiaalAI &copy; 2025</footer>
    </div>
  );
}
