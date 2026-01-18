"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";
import RichText from "@/components/i18n/RichText";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { localizePath } from "@/lib/localizePath";
import { pushWithTransition } from "@/lib/routeTransition";
const pageShellClassName = "mx-auto flex w-full min-h-[100dvh] flex-col items-center justify-start pt-[calc(env(safe-area-inset-top,0px)+1rem)] pb-[env(safe-area-inset-bottom,0px)] max-md:pt-[env(safe-area-inset-top,0px)] max-md:pb-[env(safe-area-inset-bottom,0px)]";
const circleClassName = "relative flex aspect-square w-[var(--profile-diameter)] h-[var(--profile-diameter)] min-w-[var(--profile-diameter)] min-h-[var(--profile-diameter)] max-w-[var(--profile-diameter)] max-h-[var(--profile-diameter)] flex-col items-center rounded-full bg-[color:var(--glass-surface-bg,rgba(0,0,0,0.25))] text-[color:var(--glass-surface-text,#f2f2f2)] shadow-none backdrop-blur-[var(--glass-blur-radius,1rem)] light:shadow-[0_18px_40px_rgba(0,0,0,0.16)] overflow-hidden px-[clamp(1.8rem,5vw,3.2rem)] pt-[clamp(1.6rem,4.2vw,2.6rem)] md:mt-[max(0px,calc((100dvh-var(--profile-diameter))/2-clamp(0.7rem,1.9vh,1.3rem)))] md:mb-0 md:mx-auto max-md:w-[100vw] max-md:h-[100dvh] max-md:max-w-[100vw] max-md:max-h-[100dvh] max-md:min-w-0 max-md:min-h-0 max-md:aspect-auto max-md:rounded-none max-md:overflow-visible max-md:pt-[clamp(0.4rem,1.4vh,1.1rem)]";
const titleClassName = "mt-[clamp(2.2rem,5.6vh,3.4rem)] text-center text-[2.15em] leading-[1.15] tracking-[0.03em] text-[color:var(--title-color,var(--brand-primary))] [text-shadow:var(--glass-modal-title-shadow)]";
const contentClassName = "mt-[clamp(2.8rem,6.2vh,3.8rem)] flex w-full max-w-[clamp(18rem,48vw,28rem)] flex-col items-center gap-5 text-center";
const backButtonClassName = "absolute left-[calc(var(--hud-edge-left,0px)+clamp(0.1rem,1.2vw,0.8rem))] top-1/2 inline-flex h-[5.7rem] w-[5.7rem] -translate-y-1/2 items-center justify-center border-0 bg-transparent p-0 transition-transform duration-150 ease-out hover:scale-[1.15] focus-visible:outline-none active:scale-[0.98]";
const backIconClassName = "block h-[5.7rem] w-[5.7rem] bg-center bg-no-repeat [background-size:68%_68%] [background-image:url('/logo/tagasinupp.svg')] light:[background-image:url('/logo/tagasinupphele.svg')]";
const inputClassName = "w-full max-w-[22rem]";
export default function UnustasinParooliBody() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const {
    t,
    locale
  } = useI18n();
  const errorId = error ? "reset-error" : undefined;
  const title = t("auth.reset.title", "Uuenda PIN");
  const backLabel = t("buttons.back_previous", "Tagasi eelmisele lehele");
  const searchParams = useSearchParams();
  const returnToProfile = searchParams?.get("return") === "profile";
  const profileReturnPath = localizePath("/vestlus?profile=1", locale);
  const handleBack = () => returnToProfile ? pushWithTransition(router, profileReturnPath) : typeof window !== "undefined" && window.history.length > 1 ? router.back() : pushWithTransition(router, localizePath("/", locale));
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
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email
        })
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
  return <section lang={locale} className={pageShellClassName}>
      <div className={circleClassName}>
        <button type="button" className={backButtonClassName} onClick={handleBack} aria-label={backLabel}>
          <span className={backIconClassName} aria-hidden="true" />
          <span className="sr-only">{backLabel}</span>
        </button>
        <h1 className={`glass-title ${titleClassName}`}>
          {title}
        </h1>
        <div className={contentClassName}>
          {submitted ? <RichText className="text-center text-[color:#a7f3d0]" as="div" value={t("auth.reset.success")} /> : <form className="flex w-full flex-col items-center gap-6 text-center" onSubmit={handleSubmit} autoComplete="off" aria-busy={loading ? "true" : "false"}>
              <label htmlFor="email" className="sr-only">
                {t("profile.email", "E-post")}
              </label>
              <Input type="email" id="email" name="email" size="lg" className={inputClassName} placeholder={t("auth.email_placeholder")} value={email} onChange={e => setEmail(e.target.value)} required autoComplete="username" disabled={loading} aria-invalid={error ? "true" : "false"} aria-describedby={errorId} />
              {error && <p id={errorId} role="alert" className="text-center text-[color:#fca5a5]">
                  {error}
                </p>}
              <div className="mt-[clamp(1.8rem,4.6vh,3rem)] flex justify-center">
                <Button type="submit" size="lg" disabled={loading}>
                  <span>
                    {loading ? t("auth.reset.submitting") : t("auth.reset.submit")}
                  </span>
                </Button>
              </div>
            </form>}
        </div>
      </div>
    </section>;
}
