"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";

export default function ResetPasswordForm({ token }) {
  const router = useRouter();
  const t = useTranslations("auth.resetForm");
  const common = useTranslations("common");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!password || !confirm) {
      setError(t("errors.required"));
      return;
    }

    if (password !== confirm) {
      setError(t("errors.mismatch"));
      return;
    }

    if (password.length < 6) {
      setError(t("errors.minLength"));
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
        setError(payload?.error || t("errors.updateFailed"));
        return;
      }

      setSuccess(true);
      setPassword("");
      setConfirm("");
      router.refresh();
    } catch (err) {
      console.error("password reset update error", err);
      setError(t("errors.server"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="main-content glass-box reset-box">
      <h1 className="glass-title reset-title">{t("title")}</h1>
      {success ? (
        <div className="reset-success">
          <p className="midtext reset-info" style={{ marginBottom: "1.5rem" }}>
            {t("success")}
          </p>
          <Link href="/" className="btn-primary" style={{ textAlign: "center" }}>
            {common("back_home")}
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
              placeholder={t("fields.password")}
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
              placeholder={t("fields.confirm")}
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
            <span>{loading ? t("submitting") : t("submit")}</span>
          </button>
        </form>
      )}
      <div className="back-btn-wrapper">
        <button
          type="button"
          className="back-arrow-btn"
          onClick={() => router.push("/")}
          aria-label={common("back_home")}
        >
          <span className="back-arrow-circle"></span>
        </button>
      </div>

      <footer className="alaleht-footer reset-footer">SotsiaalAI &copy; 2025</footer>
    </div>
  );
}
