"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { localizePath } from "@/lib/localizePath";

export default function ResetPasswordForm({ token }) {
  const router = useRouter();
  const { t, locale } = useI18n();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!password || !confirm) {
      setError(t("auth.resetForm.errors.required"));
      return;
    }

    if (password !== confirm) {
      setError(t("auth.resetForm.errors.mismatch"));
      return;
    }

    if (password.length < 6) {
      setError(t("auth.resetForm.errors.minLength"));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/password/reset", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload?.error || t("auth.resetForm.errors.updateFailed"));
        return;
      }

      setSuccess(true);
      setPassword("");
      setConfirm("");
      router.refresh();
    } catch (err) {
      console.error("password reset update error", err);
      setError(t("auth.resetForm.errors.server"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="main-content glass-box reset-box" lang={locale}>
      <h1 className="glass-title reset-title">{t("auth.resetForm.title")}</h1>
      {success ? (
        <div className="reset-success">
          <p className="midtext reset-info" style={{ marginBottom: "1.5rem" }}>
            {t("auth.resetForm.success")}
          </p>
          <Link
            href={localizePath("/", locale)}
            className="btn-primary"
            style={{ textAlign: "center" }}
          >
            {t("buttons.back_home")}
          </Link>
        </div>
      ) : (
        <form className="reset-form" onSubmit={handleSubmit} autoComplete="off">
          <label htmlFor="password" className="reset-label">
            <input
              type="password"
              id="password"
              name="password"
              className="reset-input"
              placeholder={t("auth.resetForm.fields.password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              disabled={loading}
            />
          </label>

          <label htmlFor="confirm" className="reset-label">
            <input
              type="password"
              id="confirm"
              name="confirm"
              className="reset-input"
              placeholder={t("auth.resetForm.fields.confirm")}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              disabled={loading}
            />
          </label>

          {error && (
            <div role="alert" className="glass-note" style={{ marginBottom: "0.75rem" }}>
              {error}
            </div>
          )}

          <button className="btn-primary reset-btn" type="submit" disabled={loading}>
            <span>{loading ? t("auth.resetForm.submitting") : t("auth.resetForm.submit")}</span>
          </button>
        </form>
      )}
      <div className="back-btn-wrapper">
        <button
          type="button"
          className="back-arrow-btn"
          onClick={() => router.push(localizePath("/", locale))}
          aria-label={t("buttons.back_home")}
        >
          <span className="back-arrow-circle"></span>
        </button>
      </div>

      <footer className="alaleht-footer reset-footer">{t("about.footer.note")}</footer>
    </div>
  );
}
