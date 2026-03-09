"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";
import RichText from "@/components/i18n/RichText";
import BackButton from "@/components/ui/BackButton";
import CloseButton from "@/components/ui/CloseButton";
import Button from "@/components/ui/Button";
import GlassRing from "@/components/ui/GlassRing";
import { glassPageBackMobileBottomCenterClassName, glassPageCloseClassName, glassPageRingCenteredClassName, glassPageShellCenteredClassName, glassPageTitleClassName, glassPageTitleMobileHeaderClassName } from "@/components/ui/glassPageStyles";
import { cn } from "@/components/ui/cn";
import { localizePath } from "@/lib/localizePath";
import { backWithTransition, pushWithTransition } from "@/lib/routeTransition";
import { resolveApiMessage } from "@/lib/i18n/resolveApiMessage";
const pageShellClassName = glassPageShellCenteredClassName;
const titleClassName =
  `${glassPageTitleClassName} ${glassPageTitleMobileHeaderClassName} max-[768px]:!text-[clamp(1.9rem,7.2vw,2.32rem)]`;
const ringClassName = cn(glassPageRingCenteredClassName, "glass-ring--desktop-stable");
const contentClassName = "mt-[clamp(2.8rem,6.2vh,3.8rem)] flex w-full max-w-[clamp(18rem,48vw,28rem)] flex-col items-center gap-5 text-center";
const inputClassName = "w-full max-w-[22rem]";
const inputBaseClassName = "w-full rounded-full [border:var(--input-border)] [background:var(--input-bg)] px-[1rem] py-[0.78rem] text-[1.05rem] text-[color:var(--input-text)] caret-[color:var(--input-caret)] shadow-[var(--input-shadow)] min-h-[3.05rem] transition-[background,border-color,box-shadow,color] duration-150 ease-out placeholder:text-[color:var(--input-placeholder)] placeholder:[font-size:1.02em] placeholder:opacity-100 focus-visible:outline-none focus-visible:[background:var(--input-bg-focus)] focus-visible:shadow-[var(--input-shadow-hover,var(--input-shadow))] hover:[background:var(--input-bg-hover)] hover:shadow-[var(--input-shadow-hover,var(--input-shadow))] disabled:opacity-[var(--input-disabled-opacity)] disabled:cursor-not-allowed aria-disabled:opacity-[var(--input-disabled-opacity)] aria-disabled:cursor-not-allowed text-[1.25rem] py-[0.95rem] px-[1.5rem] min-h-[3.6rem]";
const primaryActionButtonClassName =
  "!min-h-[3.05rem] !px-[1.2rem] !py-[0.78rem] !text-[1.1rem] !leading-[1.2] " +
  "max-[768px]:!min-h-[3.42rem] max-[768px]:!px-[1.7rem] max-[768px]:!py-[0.98rem] max-[768px]:!text-[1.32rem]";
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
  const title = t("auth.reset.title");
  const backLabel = t("buttons.back_previous");
  const searchParams = useSearchParams();
  const returnToProfile = searchParams?.get("return") === "profile";
  const profileReturnPath = localizePath("/vestlus?profile=1", locale);
  const handleBack = () => returnToProfile ? pushWithTransition(router, profileReturnPath, {
    glassRingTilt: "left",
    waitForGlassRingTilt: true,
    persistGlassRingTilt: false
  }) : typeof window !== "undefined" && window.history.length > 1 ? backWithTransition(router, {
    glassRingTilt: "left",
    waitForGlassRingTilt: true,
    persistGlassRingTilt: false
  }) : pushWithTransition(router, localizePath("/", locale), {
    glassRingTilt: "left",
    waitForGlassRingTilt: true,
    persistGlassRingTilt: false
  });
  const handleClose = () => returnToProfile ? pushWithTransition(router, profileReturnPath, {
    glassRingTilt: "left",
    waitForGlassRingTilt: true,
    persistGlassRingTilt: false
  }) : pushWithTransition(router, localizePath("/profiil", locale), {
    glassRingTilt: "left",
    waitForGlassRingTilt: true,
    persistGlassRingTilt: false
  });
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
          email,
          locale
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(resolveApiMessage({
          payload,
          t,
          fallbackKey: "auth.reset.error.failed"
        }));
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
      <GlassRing className={ringClassName}>
        <CloseButton onClick={handleClose} ariaLabel={t("buttons.close")} className={cn(glassPageCloseClassName, "max-[768px]:hidden")} />
        <BackButton onClick={handleBack} ariaLabel={backLabel} className={glassPageBackMobileBottomCenterClassName} />
        <h1 className={titleClassName}>
          {title}
        </h1>
        <div className={contentClassName}>
          {submitted ? <RichText className="auth-success-text text-center" as="div" value={t("auth.reset.success")} /> : <form className="flex w-full flex-col items-center gap-6 text-center" onSubmit={handleSubmit} autoComplete="off" aria-busy={loading ? "true" : "false"}>
              <label htmlFor="email" className="sr-only">
                {t("profile.email")}
              </label>
              <input type="email" id="email" name="email" className={`${inputBaseClassName} ${inputClassName}`.trim()} placeholder={t("auth.email_placeholder")} value={email} onChange={e => setEmail(e.target.value)} required autoComplete="username" disabled={loading} aria-invalid={error ? "true" : "false"} aria-describedby={errorId} />
              {error && <p id={errorId} role="alert" className="text-center text-[color:#fca5a5]">
                  {error}
                </p>}
              <div className="mt-[clamp(1.8rem,4.6vh,3rem)] flex justify-center">
                <Button type="submit" variant="primary" className={primaryActionButtonClassName} disabled={loading}>
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
