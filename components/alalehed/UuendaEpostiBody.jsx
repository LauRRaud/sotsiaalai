"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";
import { localizePath } from "@/lib/localizePath";

export default function UuendaEpostiBody() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const PIN_MIN = 4;
  const PIN_MAX = 8;
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const errorId = error ? "update-email-error" : undefined;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const nextEmail = email.trim().toLowerCase();
    const pinClean = pin.replace(/\D/g, "");

    if (!nextEmail) {
      setError(
        t(
          "profile.email_update.error_email_required",
          locale === "en"
            ? "Please enter an email address."
            : locale === "ru"
            ? "Пожалуйста, укажите e-mail."
            : "Palun sisesta e-posti aadress.",
        ),
      );
      return;
    }
    if (!nextEmail.includes("@")) {
      setError(t("profile.email_update.error_email_invalid", "Palun sisesta korrektne e-posti aadress."));
      return;
    }
    if (!pinClean) {
      setError(t("profile.email_update.error_pin_required", "Palun sisesta PIN-kood."));
      return;
    }
    if (pinClean.length < PIN_MIN || pinClean.length > PIN_MAX) {
      setError(
        t("profile.email_update.error_pin_length", "PIN peab olema {min}–{max} numbrit.", {
          min: PIN_MIN,
          max: PIN_MAX,
        }),
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: nextEmail, currentPassword: pinClean }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok || payload?.ok === false) {
        setError(
          payload?.error ||
            payload?.message ||
            t("profile.email_update.error_failed", "E-posti uuendamine ebaõnnestus."),
        );
        return;
      }
      setSubmitted(true);
    } catch (err) {
      console.error("update email error", err);
      setError(t("profile.email_update.error_failed", "E-posti uuendamine ebaõnnestus."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="main-content glass-box reset-box reset-email" lang={locale}>
      <h1 className="glass-title reset-title">
        {t(
          "profile.email_update.title",
          locale === "en"
            ? "Update email"
            : locale === "ru"
            ? "Обновить e‑mail"
            : "Uuenda e-post",
        )}
      </h1>
      {submitted ? (
        <div className="reset-success">
          <p className="midtext reset-info" style={{ marginBottom: "1.5rem" }}>
            {t(
              "profile.email_update.success",
              locale === "en"
                ? "If the PIN was correct, we sent a verification email to your new address. Please open the link in that inbox."
                : locale === "ru"
                ? "Если PIN был верным, мы отправили письмо с подтверждением на ваш новый адрес. Пожалуйста, откройте ссылку в этом почтовом ящике."
                : "Kui sisestasid kehtiva PIN-koodi, saatsime sinu uuele e-posti aadressile kinnituskirja. Palun ava link uues postkastis.",
            )}
          </p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => router.push(localizePath("/profiil", locale))}
          >
            {t("buttons.back_home")}
          </button>
        </div>
      ) : (
        <form
          className="reset-form"
          onSubmit={handleSubmit}
          autoComplete="off"
          aria-busy={loading ? "true" : "false"}
        >
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
              autoComplete="email"
              disabled={loading}
              aria-invalid={error ? "true" : "false"}
              aria-describedby={errorId}
            />
          </label>
          <label htmlFor="pin" className="reset-label">
            <input
              type="password"
              id="pin"
              name="pin"
              className="reset-input"
              placeholder={t(
                "profile.email_update.pin_placeholder",
                "Praegune PIN ({min}–{max} numbrit)",
                { min: PIN_MIN, max: PIN_MAX },
              )}
              value={pin}
              onChange={(e) =>
                setPin(e.target.value.replace(/\D/g, "").slice(0, PIN_MAX))
              }
              required
              minLength={PIN_MIN}
              maxLength={PIN_MAX}
              autoComplete="current-password"
              disabled={loading}
            />
          </label>
          {error && (
            <div
              id={errorId}
              role="alert"
              className="glass-note"
              style={{ marginBottom: "0.75rem" }}
            >
              {error}
            </div>
          )}
          <button
            className="btn-primary reset-btn"
            type="submit"
            disabled={loading}
          >
            <span>
              {loading
                ? t("profile.email_update.submitting", "Saadan…")
                : t("profile.email_update.submit", "Saada kinnituskiri")}
            </span>
          </button>
        </form>
      )}
      <div className="back-btn-wrapper">
        <button
          type="button"
          className="back-arrow-btn"
          onClick={() => router.push(localizePath("/profiil", locale))}
          aria-label={t("profile.back_to_chat")}
        >
          <span className="back-arrow-circle"></span>
        </button>
      </div>
      <footer className="alaleht-footer reset-footer">
        {t("about.footer.note")}
      </footer>
    </div>
  );
}
