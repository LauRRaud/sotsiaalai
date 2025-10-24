"use client";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";

export default function UnustasinParooliBody() {
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const errorText =
    error && typeof error === "object"
      ? error.key
        ? t(error.key, error.values)
        : error.message ?? ""
      : error || "";

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError({ key: "auth.reset.error.required" });
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
        setError({
          message: payload?.error || t("auth.reset.error.failed"),
        });
        return;
      }

      setSubmitted(true);
    } catch (err) {
      console.error("password reset request error", err);
      setError({ message: t("auth.reset.error.server") });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="main-content glass-box reset-box" lang={locale}>
      <h1 className="glass-title reset-title">{t("auth.reset.title")}</h1>
        {submitted ? (
          <div className="midtext reset-info">
            {(() => {
              let pIndex = 0;
              return t.rich("auth.reset.success", {
                p: (chunks) => {
                  const idx = pIndex++;
                  return (
                    <p key={`reset-success-${idx}`}>
                      {chunks}
                    </p>
                  );
                },
              });
            })()}
          </div>
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
          {errorText && (
            <div role="alert" className="glass-note" style={{ marginBottom: "0.75rem" }}>
              {errorText}
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
          onClick={() => router.push("/")}
          aria-label={t("common.back_home")}
        >
          <span className="back-arrow-circle"></span>
        </button>
      </div>

      <footer className="alaleht-footer reset-footer">SotsiaalAI &copy; 2025</footer>
    </div>
  );
}
