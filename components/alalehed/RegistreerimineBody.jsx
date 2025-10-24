"use client";

import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";

export default function RegistreerimineBody() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams?.get("next") || "/vestlus";
  const t = useTranslations();
  const locale = useLocale();

  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "SOCIAL_WORKER",
    agree: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const errorText =
    error && typeof error === "object"
      ? error.key
        ? t(error.key, error.values)
        : error.message ?? ""
      : error || "";

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!form.agree) {
      setError({ key: "auth.register.error.agree_required" });
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
        setError({
          message: payload?.message || payload?.error || t("auth.register.error.failed"),
        });
        return;
      }

      const login = await signIn("credentials", {
        redirect: false,
        callbackUrl: nextUrl,
        email: form.email,
        password: form.password,
      });

      if (login?.error) {
        setError({ key: "auth.register.error.auto_login" });
        router.replace(`/registreerimine?next=${encodeURIComponent(nextUrl)}`);
        return;
      }

      router.replace(`/tellimus?next=${encodeURIComponent(nextUrl)}`);
      router.refresh();
    } catch (err) {
      console.error("Register error", err);
      setError({ message: t("profile.server_unreachable") });
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
            {t.rich("auth.register.agreement", {
              terms: (chunks) => (
                <Link
                  key="register-terms"
                  href="/kasutustingimused"
                  className="link-brand-inline"
                >
                  {chunks}
                </Link>
              ),
              privacy: (chunks) => (
                <Link
                  key="register-privacy"
                  href="/privaatsustingimused"
                  className="link-brand-inline"
                >
                  {chunks}
                </Link>
              ),
            })}
          </span>
        </label>

        {errorText && (
          <div role="alert" className="glass-note" style={{ marginBottom: "0.75rem" }}>
            {errorText}
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
          onClick={() => router.push("/")}
          aria-label={t("common.back_home")}
        >
          <span className="back-arrow-circle"></span>
        </button>
      </div>

      <footer className="alaleht-footer">SotsiaalAI &copy; 2025</footer>
    </div>
  );
}
