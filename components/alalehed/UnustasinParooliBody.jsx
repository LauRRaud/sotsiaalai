"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";
import RichText from "@/components/i18n/RichText";
import BackButton from "@/components/ui/BackButton";
import CloseButton from "@/components/ui/CloseButton";
import Button from "@/components/ui/Button";
import GlassRing from "@/components/ui/GlassRing";
import { glassPageBackClassName, glassPageRingCenteredClassName, glassPageShellCenteredClassName, glassPageTitleClassName } from "@/components/ui/glassPageStyles";
import { localizePath } from "@/lib/localizePath";
import { pushWithTransition } from "@/lib/routeTransition";
const pageShellClassName = glassPageShellCenteredClassName;
const titleClassName = glassPageTitleClassName;
const mobileCloseClassName = "!hidden !max-[48em]:!inline-flex !max-[48em]:!fixed !max-[48em]:!top-[calc(env(safe-area-inset-top,0px)+0.5rem)] !max-[48em]:!right-[calc(env(safe-area-inset-right,0px)+0.6rem)] !max-[48em]:!z-[90] !max-[48em]:!text-[#c57171] !max-[48em]:!opacity-90 light:!max-[48em]:!text-[#7a3a38]";
const contentClassName = "mt-[clamp(2.8rem,6.2vh,3.8rem)] flex w-full max-w-[clamp(18rem,48vw,28rem)] flex-col items-center gap-5 text-center";
const inputClassName = "w-full max-w-[22rem]";
const inputBaseClassName = "w-full rounded-full [border:var(--input-border)] [background:var(--input-bg)] px-[1rem] py-[0.78rem] text-[1.05rem] text-[color:var(--input-text)] caret-[color:var(--input-caret)] shadow-[var(--input-shadow)] min-h-[3.05rem] transition-[background,border-color,box-shadow,color] duration-150 ease-out placeholder:text-[color:var(--input-placeholder)] placeholder:[font-size:1.02em] placeholder:opacity-100 focus-visible:outline-none focus-visible:[background:var(--input-bg-focus)] focus-visible:shadow-[var(--input-shadow-hover,var(--input-shadow))] hover:[background:var(--input-bg-hover)] hover:shadow-[var(--input-shadow-hover,var(--input-shadow))] disabled:opacity-[var(--input-disabled-opacity)] disabled:cursor-not-allowed aria-disabled:opacity-[var(--input-disabled-opacity)] aria-disabled:cursor-not-allowed text-[1.25rem] py-[0.95rem] px-[1.5rem] min-h-[3.6rem]";
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
  const handleClose = () => returnToProfile ? pushWithTransition(router, profileReturnPath) : pushWithTransition(router, localizePath("/profiil", locale));
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
      <GlassRing className={`${glassPageRingCenteredClassName} glass-ring--desktop-stable`}>
        <CloseButton onClick={handleClose} ariaLabel={t("buttons.close")} className={mobileCloseClassName} />
        <BackButton onClick={handleBack} ariaLabel={backLabel} className={`${glassPageBackClassName} page-back-bottom`} />
        <h1 className={titleClassName}>
          {title}
        </h1>
        <div className={contentClassName}>
          {submitted ? <RichText className="text-center text-[color:#a7f3d0]" as="div" value={t("auth.reset.success")} /> : <form className="flex w-full flex-col items-center gap-6 text-center" onSubmit={handleSubmit} autoComplete="off" aria-busy={loading ? "true" : "false"}>
              <label htmlFor="email" className="sr-only">
                {t("profile.email", "E-post")}
              </label>
              <input type="email" id="email" name="email" className={`${inputBaseClassName} ${inputClassName}`.trim()} placeholder={t("auth.email_placeholder")} value={email} onChange={e => setEmail(e.target.value)} required autoComplete="username" disabled={loading} aria-invalid={error ? "true" : "false"} aria-describedby={errorId} />
              {error && <p id={errorId} role="alert" className="text-center text-[color:#fca5a5]">
                  {error}
                </p>}
              <div className="mt-[clamp(1.8rem,4.6vh,3rem)] flex justify-center">
                <Button type="submit" variant="primary" disabled={loading}>
                  <span>
                    {loading ? t("auth.reset.submitting") : t("auth.reset.submit")}
                  </span>
                </Button>
              </div>
            </form>}
        </div>
      </GlassRing>
    </section>;
}
