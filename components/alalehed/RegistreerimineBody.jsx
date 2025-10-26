"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import RichText from "@/components/i18n/RichText";
import { localizePath } from "@/lib/localizePath";

export default function RegistreerimineBody() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, locale } = useI18n();
  const toRelative = (u) => {
    try {
      const base = typeof window !== "undefined" ? window.location.origin : "http://local";
      const url = new URL(u, base);
      return `${url.pathname}${url.search}${url.hash}`;
    } catch { return String(u || "/"); }
  };
  const nextUrl = toRelative(searchParams?.get("next") || localizePath("/vestlus", locale));

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
      setError(t("auth.register.error.agree_required"));
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
          role: form.role,
        }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        // /api/register/route.js tagastab 'message'
        setError(payload?.message || payload?.error || t("auth.register.error.failed"));
        return;
      }

      const login = await signIn("credentials", {
        redirect: false,
        callbackUrl: nextUrl,
        email: form.email,
        password: form.password,
      });

      if (login?.error) {
        setError(t("auth.register.error.auto_login"));
        router.replace(`${localizePath("/registreerimine", locale)}?next=${encodeURIComponent(nextUrl)}`);
        return;
      }

      router.replace(`${localizePath("/tellimus", locale)}?next=${encodeURIComponent(nextUrl)}`);
      router.refresh();
    } catch (err) {
      console.error("Register error", err);
      setError(t("profile.server_unreachable"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="main-content glass-box" lang={locale}>
      <h1 className="glass-title">{t("auth.register.title")}</h1>

      <form className="glass-form" onSubmit={handleSubmit} autoComplete="off">
        <input
          type="email"
          id="email"
          name="email"
          className="input-modern input-email-top"
          placeholder={t("auth.email_placeholder")}
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
          placeholder={t("auth.password_placeholder")}
          value={form.password}
          onChange={handleChange}
          required
          minLength={6}
          autoComplete="new-password"
        />

        <div className="glass-label glass-label-radio">{t("auth.register.role_label")}</div>
        <div className="glass-radio-group" role="radiogroup">
          <label>
            <input
              type="radio"
              name="role"
              value="SOCIAL_WORKER"
              checked={form.role === "SOCIAL_WORKER"}
              onChange={handleChange}
            />
            {t("role.worker")}
          </label>
          <label>
            <input
              type="radio"
              name="role"
              value="CLIENT"
              checked={form.role === "CLIENT"}
              onChange={handleChange}
            />
            {t("role.client")}
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
            <RichText
              value={t("auth.register.agreement")}
              replacements={{
                terms: {
                  open: `<a class="link-brand-inline" href="${localizePath("/kasutustingimused", locale)}">`,
                  close: "</a>",
                },
                privacy: {
                  open: `<a class="link-brand-inline" href="${localizePath("/privaatsustingimused", locale)}">`,
                  close: "</a>",
                },
              }}
            />
          </span>
        </label>

        {error && (
          <div role="alert" className="glass-note" style={{ marginBottom: "0.75rem" }}>
            {error}
          </div>
        )}

        <button className="btn-primary" type="submit" disabled={submitting}>
          <span>{submitting ? t("auth.register.submitting") : t("auth.register.submit")}</span>
        </button>
      </form>

      <div className="back-btn-wrapper">
        <button
          type="button"
          className="back-arrow-btn"
          onClick={() =>
            typeof window !== "undefined" && window.history.length > 1
              ? router.back()
              : router.push(localizePath("/", locale))
          }
          aria-label={t("buttons.back_home")}
        >
          <span className="back-arrow-circle"></span>
        </button>
      </div>

      <footer className="alaleht-footer">{t("about.footer.note")}</footer>
    </div>
  );
}
