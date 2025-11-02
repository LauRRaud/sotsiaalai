"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";
import RichText from "@/components/i18n/RichText";
import { localizePath } from "@/lib/localizePath";
export default function UnustasinParooliBody() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { t, locale } = useI18n();
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email) {
      setError(t("auth.reset.error.required"));
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/auth/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload?.error || t("auth.reset.error.failed"));
        return;
      }
      setSubmitted(true);
    } catch (err) {
      console.error("password reset request error", err);
      setError(t("auth.reset.error.server"));
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="main-content glass-box reset-box" lang={locale}>
      <h1 className="glass-title reset-title">{t("auth.reset.title")}</h1>
      {submitted ? (
        <RichText className="midtext reset-info" as="div" value={t("auth.reset.success")} />
      ) : (
        <form className="reset-form" onSubmit={handleSubmit} autoComplete="off">
          <label htmlFor="email" className="reset-label">
            <input
              type="email"
              id="email"
              name="email"
              className="reset-input"
              placeholder={t("auth.email_placeholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              disabled={loading}
            />
          </label>
        {error && (
          <div role="alert" className="glass-note" style={{ marginBottom: "0.75rem" }}>
            {error}
          </div>
        )}
        <button className="btn-primary reset-btn" type="submit" disabled={loading}>
          <span>{loading ? t("auth.reset.submitting") : t("auth.reset.submit")}</span>
        </button>
        </form>
      )}
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
      <footer className="alaleht-footer reset-footer">{t("about.footer.note")}</footer>
    </div>
  );
}
