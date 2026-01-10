"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";
import RichText from "@/components/i18n/RichText";
import Button from "@/components/ui/Button";
import InvitePageShell from "@/components/ui/InvitePageShell";
import { localizePath } from "@/lib/localizePath";
import { pushWithTransition } from "@/lib/routeTransition";
export default function UnustasinParooliBody() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { t, locale } = useI18n();
  const errorId = error ? "reset-error" : undefined;
  const title = t("auth.reset.title", "Uuenda PIN");
  const backLabel = t("buttons.back_previous", "Tagasi eelmisele lehele");
  const handleBack = () =>
    typeof window !== "undefined" && window.history.length > 1
      ? router.back()
      : pushWithTransition(router, localizePath("/", locale));

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
    <InvitePageShell
      title={title}
      lang={locale}
      contentClassName="invite-page-content--lower invite-page-content--wide"
      actionsClassName="invite-page-actions--low invite-page-actions--side"
      actions={
        <button type="button" className="back-arrow-btn" onClick={handleBack} aria-label={backLabel}>
          <span className="back-arrow-circle" />
          <span className="sr-only">{backLabel}</span>
        </button>
      }
    >
      {submitted ? (
        <RichText
          className="text-center text-[color:#a7f3d0]"
          as="div"
          value={t("auth.reset.success")}
        />
      ) : (
        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit}
          autoComplete="off"
          aria-busy={loading ? "true" : "false"}
        >
          <label htmlFor="email" className="sr-only">
            {t("profile.email", "E-post")}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="invite-classic__input"
            placeholder={t("auth.email_placeholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
            disabled={loading}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={errorId}
          />
          {error && (
            <p id={errorId} role="alert" className="text-center text-[color:#fca5a5]">
              {error}
            </p>
          )}
          <div className="mt-4 flex justify-center">
            <Button type="submit" disabled={loading}>
              <span>{loading ? t("auth.reset.submitting") : t("auth.reset.submit")}</span>
            </Button>
          </div>
        </form>
      )}
    </InvitePageShell>
  );
}
