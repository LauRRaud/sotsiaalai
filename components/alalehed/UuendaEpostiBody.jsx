"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";
import { localizePath } from "@/lib/localizePath";
import { pushWithTransition } from "@/lib/routeTransition";
import BackButton from "@/components/ui/BackButton";
import CloseButton from "@/components/ui/CloseButton";
import Button from "@/components/ui/Button";
import GlassRing from "@/components/ui/GlassRing";
import { glassPageBackClassName, glassPageRingCenteredClassName, glassPageShellCenteredClassName, glassPageTitleClassName } from "@/components/ui/glassPageStyles";
const pageShellClassName = glassPageShellCenteredClassName;
const titleClassName = glassPageTitleClassName;
const contentClassName = "mt-[clamp(2.8rem,6.2vh,3.8rem)] flex w-full max-w-[clamp(18rem,48vw,28rem)] flex-col gap-4";
const inputClassName = "w-full max-w-[22rem]";
const inputBaseClassName = "w-full rounded-full [border:var(--input-border)] [background:var(--input-bg)] px-[1rem] py-[0.78rem] text-[1.05rem] text-[color:var(--input-text)] caret-[color:var(--input-caret)] shadow-[var(--input-shadow)] min-h-[3.05rem] transition-[background,border-color,box-shadow,color] duration-150 ease-out placeholder:text-[color:var(--input-placeholder)] placeholder:[font-size:1.02em] placeholder:opacity-100 focus-visible:outline-none focus-visible:[background:var(--input-bg-focus)] focus-visible:shadow-[var(--input-shadow-hover,var(--input-shadow))] hover:[background:var(--input-bg-hover)] hover:shadow-[var(--input-shadow-hover,var(--input-shadow))] disabled:opacity-[var(--input-disabled-opacity)] disabled:cursor-not-allowed aria-disabled:opacity-[var(--input-disabled-opacity)] aria-disabled:cursor-not-allowed text-[1.25rem] py-[0.95rem] px-[1.5rem] min-h-[3.6rem]";
export default function UuendaEpostiBody() {
  const router = useRouter();
  const {
    t,
    locale
  } = useI18n();
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
  const pinPlaceholder = locale === "et" ? "Praegune PIN" : t("profile.email_update.pin_placeholder", "Current PIN");
  const searchParams = useSearchParams();
  const returnToProfile = searchParams?.get("return") === "profile";
  const profileReturnPath = localizePath("/vestlus?profile=1", locale);
  const handleBack = () => returnToProfile ? pushWithTransition(router, profileReturnPath) : typeof window !== "undefined" && window.history.length > 1 ? router.back() : pushWithTransition(router, localizePath("/profiil", locale));
  const handleClose = () => returnToProfile ? pushWithTransition(router, profileReturnPath) : pushWithTransition(router, localizePath("/profiil", locale));
  useEffect(() => {
    let isActive = true;
    const loadCurrentEmail = async () => {
      try {
        const res = await fetch("/api/profile", {
          cache: "no-store"
        });
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
        max: PIN_MAX
      }));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: nextEmail,
          currentPassword: pinClean
        })
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok || payload?.ok === false) {
        setError(payload?.error || payload?.message || t("profile.email_update.error_failed", "E-posti uuendamine ebaõnnestus."));
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
  return <section lang={locale} className={pageShellClassName}>
      <GlassRing className={glassPageRingCenteredClassName}>
        <CloseButton onClick={handleClose} ariaLabel={t("buttons.close")} className="page-close-button" />
        <BackButton onClick={handleBack} ariaLabel={backLabel} className={`${glassPageBackClassName} page-back-bottom`} />
        <h1 className={titleClassName}>
          {t("profile.email_update.title", "Uuenda e-post")}
        </h1>
        <div className={contentClassName}>
          {submitted ? <div className="flex flex-col gap-4 text-center">
              <p className="text-[color:#a7f3d0]">
                {t("profile.email_update.success", "Kui sisestasid kehtiva PIN-koodi, saatsime sinu uuele e-posti aadressile kinnituskirja. Palun ava link uues postkastis.")}
              </p>
            </div> : <form className="flex w-full flex-col items-center gap-7 text-center" onSubmit={handleSubmit} autoComplete="off" aria-busy={loading ? "true" : "false"}>
              <label htmlFor="current-email" className="sr-only">
                {t("profile.email_update.current_placeholder", "Sinu e-post")}
              </label>
              <input type="email" id="current-email" name="current-email" className={`${inputBaseClassName} ${inputClassName}`.trim()} placeholder={t("profile.email_update.current_placeholder", "Sinu e-post")} value={currentEmail} readOnly aria-readonly="true" autoComplete="email" inputMode="email" />
              <label htmlFor="email" className="sr-only">
                {t("profile.email_update.new_placeholder", "Uus e-post")}
              </label>
              <input type="email" id="email" name="email" className={`${inputBaseClassName} ${inputClassName}`.trim()} placeholder={t("profile.email_update.new_placeholder", "Uus e-post")} value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" inputMode="email" disabled={loading} aria-invalid={error ? "true" : "false"} aria-describedby={errorId} />
              <label htmlFor="pin" className="sr-only">
                {t("profile.email_update.pin_placeholder", "Praegune PIN ({min}-{max} numbrit)", {
              min: PIN_MIN,
              max: PIN_MAX
            })}
              </label>
              <input type="password" id="pin" name="pin" className={`${inputBaseClassName} ${inputClassName}`.trim()} placeholder={pinPlaceholder} value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, "").slice(0, PIN_MAX))} required minLength={PIN_MIN} maxLength={PIN_MAX} autoComplete="current-password" disabled={loading} />
              {error && <p id={errorId} role="alert" className="text-[color:#fca5a5]">
                  {error}
                </p>}
              <div className="mt-[clamp(1.8rem,4.6vh,3rem)] flex justify-center">
                <Button type="submit" variant="primary" className="px-[1.6rem] py-[1.05rem] text-[1.18rem]" disabled={loading}>
                  <span>
                    {loading ? t("profile.email_update.submitting", "Saadan...") : t("profile.email_update.submit", "Saada kinnituskiri")}
                  </span>
                </Button>
              </div>
            </form>}
        </div>
      </GlassRing>
    </section>;
}
