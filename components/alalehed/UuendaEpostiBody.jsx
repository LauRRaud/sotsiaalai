"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";
import Button from "@/components/ui/Button";
import InvitePageShell from "@/components/ui/InvitePageShell";
import { localizePath } from "@/lib/localizePath";
import { pushWithTransition } from "@/lib/routeTransition";

export default function UuendaEpostiBody() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const PIN_MIN = 4;
  const PIN_MAX = 8;
  const [currentEmail, setCurrentEmail] = useState("");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const errorId = error ? "update-email-error" : undefined;
  const backLabel = t("buttons.back_previous", "Tagasi eelmisele lehele");
  const handleBack = () =>
    typeof window !== "undefined" && window.history.length > 1
      ? router.back()
      : pushWithTransition(router, localizePath("/profiil", locale));

  useEffect(() => {
    let isActive = true;

    const loadCurrentEmail = async () => {
      try {
        const res = await fetch("/api/profile", { cache: "no-store" });
        const payload = await res.json().catch(() => ({}));
        if (!isActive) return;
        if (res.ok) {
          setCurrentEmail(payload?.user?.email || "");
        }
      } catch (err) {
        console.error("update email profile load", err);
      }
    };

    loadCurrentEmail();

    return () => {
      isActive = false;
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const nextEmail = email.trim().toLowerCase();
    const pinClean = pin.replace(/\D/g, "");

    if (!nextEmail) {
      setError(t("profile.email_update.error_email_required", "Palun sisesta e-posti aadress."));
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
      setError(t("profile.email_update.error_pin_length", "PIN peab olema {min}-{max} numbrit.", {
        min: PIN_MIN,
        max: PIN_MAX,
      }));
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
    <InvitePageShell
      title={t("profile.email_update.title", "Uuenda e-post")}
      lang={locale}
      contentClassName="invite-page-content--wide"
      actionsClassName="invite-page-actions--side"
      actions={
        <button type="button" className="back-arrow-btn" onClick={handleBack} aria-label={backLabel}>
          <span className="back-arrow-circle" />
          <span className="sr-only">{backLabel}</span>
        </button>
      }
    >
      {submitted ? (
        <div className="flex flex-col gap-4">
          <p className="text-center text-[color:#a7f3d0]">
            {t(
              "profile.email_update.success",
              "Kui sisestasid kehtiva PIN-koodi, saatsime sinu uuele e-posti aadressile kinnituskirja. Palun ava link uues postkastis.",
            )}
          </p>
        </div>
      ) : (
        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit}
          autoComplete="off"
          aria-busy={loading ? "true" : "false"}
        >
          <label htmlFor="current-email" className="sr-only">
            {t("profile.email_update.current_placeholder", "Sinu e-post")}
          </label>
          <input
            type="email"
            id="current-email"
            name="current-email"
            className="invite-classic__input"
            placeholder={t("profile.email_update.current_placeholder", "Sinu e-post")}
            value={currentEmail}
            readOnly
            aria-readonly="true"
            autoComplete="email"
            inputMode="email"
          />
          <label htmlFor="email" className="sr-only">
            {t("profile.email_update.new_placeholder", "Uus e-post")}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="invite-classic__input"
            placeholder={t("profile.email_update.new_placeholder", "Uus e-post")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            inputMode="email"
            disabled={loading}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={errorId}
          />
          <label htmlFor="pin" className="sr-only">
            {t("profile.email_update.pin_placeholder", "Praegune PIN ({min}-{max} numbrit)", {
              min: PIN_MIN,
              max: PIN_MAX,
            })}
          </label>
          <input
            type="password"
            id="pin"
            name="pin"
            className="invite-classic__input"
            placeholder={t("profile.email_update.pin_placeholder", "Praegune PIN ({min}-{max} numbrit)", {
              min: PIN_MIN,
              max: PIN_MAX,
            })}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, PIN_MAX))}
            required
            minLength={PIN_MIN}
            maxLength={PIN_MAX}
            autoComplete="current-password"
            disabled={loading}
          />
          {error && (
            <p id={errorId} role="alert" className="text-center text-[color:#fca5a5]">
              {error}
            </p>
          )}
          <div className="mt-4 flex justify-center">
            <Button type="submit" disabled={loading}>
              <span>
                {loading
                  ? t("profile.email_update.submitting", "Saadan...")
                  : t("profile.email_update.submit", "Saada kinnituskiri")}
              </span>
            </Button>
          </div>
        </form>
      )}
    </InvitePageShell>
  );
}
