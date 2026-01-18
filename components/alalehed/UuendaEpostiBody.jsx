"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { localizePath } from "@/lib/localizePath";
import { pushWithTransition } from "@/lib/routeTransition";
const pageShellClassName = "mx-auto flex w-full min-h-[100dvh] flex-col items-center justify-start pt-[calc(env(safe-area-inset-top,0px)+1rem)] pb-[env(safe-area-inset-bottom,0px)] max-md:pt-[env(safe-area-inset-top,0px)] max-md:pb-[env(safe-area-inset-bottom,0px)]";
const circleClassName = "relative flex aspect-square w-[var(--profile-diameter)] h-[var(--profile-diameter)] min-w-[var(--profile-diameter)] min-h-[var(--profile-diameter)] max-w-[var(--profile-diameter)] max-h-[var(--profile-diameter)] flex-col items-center rounded-full bg-[color:var(--glass-surface-bg,rgba(0,0,0,0.25))] text-[color:var(--glass-surface-text,#f2f2f2)] shadow-none backdrop-blur-[var(--glass-blur-radius,1rem)] light:shadow-[0_18px_40px_rgba(0,0,0,0.16)] overflow-hidden px-[clamp(1.8rem,5vw,3.2rem)] pt-[clamp(1.6rem,4.2vw,2.6rem)] md:mt-[max(0px,calc((100dvh-var(--profile-diameter))/2-clamp(0.7rem,1.9vh,1.3rem)))] md:mb-0 md:mx-auto max-md:w-[100vw] max-md:h-[100dvh] max-md:max-w-[100vw] max-md:max-h-[100dvh] max-md:min-w-0 max-md:min-h-0 max-md:aspect-auto max-md:rounded-none max-md:overflow-visible max-md:pt-[clamp(0.4rem,1.4vh,1.1rem)]";
const titleClassName = "mt-[clamp(2.2rem,5.6vh,3.4rem)] text-center text-[2.15em] leading-[1.15] tracking-[0.03em] text-[color:var(--title-color,var(--brand-primary))] [text-shadow:var(--glass-modal-title-shadow)]";
const contentClassName = "mt-[clamp(2.8rem,6.2vh,3.8rem)] flex w-full max-w-[clamp(18rem,48vw,28rem)] flex-col gap-4";
const backButtonClassName = "absolute left-[calc(var(--hud-edge-left,0px)+clamp(0.1rem,1.2vw,0.8rem))] top-1/2 inline-flex h-[5.7rem] w-[5.7rem] -translate-y-1/2 items-center justify-center border-0 bg-transparent p-0 transition-transform duration-150 ease-out hover:scale-[1.15] focus-visible:outline-none active:scale-[0.98]";
const backIconClassName = "block h-[5.7rem] w-[5.7rem] bg-center bg-no-repeat [background-size:68%_68%] [background-image:url('/logo/tagasinupp.svg')] light:[background-image:url('/logo/tagasinupphele.svg')]";
const inputClassName = "w-full max-w-[22rem]";
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
      <div className={circleClassName}>
        <button type="button" className={backButtonClassName} onClick={handleBack} aria-label={backLabel}>
          <span className={backIconClassName} aria-hidden="true" />
          <span className="sr-only">{backLabel}</span>
        </button>
        <h1 className={`glass-title ${titleClassName}`}>
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
              <Input type="email" id="current-email" name="current-email" size="lg" className={inputClassName} placeholder={t("profile.email_update.current_placeholder", "Sinu e-post")} value={currentEmail} readOnly aria-readonly="true" autoComplete="email" inputMode="email" />
              <label htmlFor="email" className="sr-only">
                {t("profile.email_update.new_placeholder", "Uus e-post")}
              </label>
              <Input type="email" id="email" name="email" size="lg" className={inputClassName} placeholder={t("profile.email_update.new_placeholder", "Uus e-post")} value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" inputMode="email" disabled={loading} aria-invalid={error ? "true" : "false"} aria-describedby={errorId} />
              <label htmlFor="pin" className="sr-only">
                {t("profile.email_update.pin_placeholder", "Praegune PIN ({min}-{max} numbrit)", {
              min: PIN_MIN,
              max: PIN_MAX
            })}
              </label>
              <Input type="password" id="pin" name="pin" size="lg" className={inputClassName} placeholder={pinPlaceholder} value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, "").slice(0, PIN_MAX))} required minLength={PIN_MIN} maxLength={PIN_MAX} autoComplete="current-password" disabled={loading} />
              {error && <p id={errorId} role="alert" className="text-[color:#fca5a5]">
                  {error}
                </p>}
              <div className="mt-[clamp(1.8rem,4.6vh,3rem)] flex justify-center">
                <Button type="submit" size="lg" className="px-[1.6rem] py-[1.05rem] text-[1.18rem]" disabled={loading}>
                  <span>
                    {loading ? t("profile.email_update.submitting", "Saadan...") : t("profile.email_update.submit", "Saada kinnituskiri")}
                  </span>
                </Button>
              </div>
            </form>}
        </div>
      </div>
    </section>;
}
