"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { useI18n } from "@/components/i18n/I18nProvider";
import RichText from "@/components/i18n/RichText";
import { localizePath } from "@/lib/localizePath";
import { pushWithTransition } from "@/lib/routeTransition";
const linkClassName = "inline-flex items-center gap-[0.35rem] underline underline-offset-4 decoration-[color:currentColor] text-[color:var(--link-gold)] hover:text-[color:var(--link-gold-hover)] light:text-[color:var(--link-color)] light:hover:text-[color:var(--link-color)] hc:text-[color:var(--hc-accent)]";
const emailReplacement = {
  email: {
    open: `<a href="mailto:info@sotsiaal.ai" class="${linkClassName}">`,
    close: "</a>"
  }
};
const pageShellClassName = "mx-auto flex w-full min-h-[100dvh] flex-col items-center justify-start pt-[calc(env(safe-area-inset-top,0px)+1rem)] pb-[env(safe-area-inset-bottom,0px)] max-md:pt-[env(safe-area-inset-top,0px)] max-md:pb-[env(safe-area-inset-bottom,0px)]";
const circleClassName = "relative flex aspect-square w-[var(--profile-diameter)] h-[var(--profile-diameter)] min-w-[var(--profile-diameter)] min-h-[var(--profile-diameter)] max-w-[var(--profile-diameter)] max-h-[var(--profile-diameter)] flex-col items-center rounded-full bg-[color:var(--glass-surface-bg,rgba(0,0,0,0.25))] text-[color:var(--glass-surface-text,#f2f2f2)] shadow-none backdrop-blur-[var(--glass-blur-radius,1rem)] light:shadow-[0_18px_40px_rgba(0,0,0,0.16)] overflow-hidden px-[clamp(1.8rem,5vw,3.2rem)] pt-[clamp(1.6rem,4.2vw,2.6rem)] md:mt-[max(0px,calc((100dvh-var(--profile-diameter))/2-clamp(0.7rem,1.9vh,1.3rem)))] md:mb-0 md:mx-auto max-md:w-[100vw] max-md:h-[100dvh] max-md:max-w-[100vw] max-md:max-h-[100dvh] max-md:min-w-0 max-md:min-h-0 max-md:aspect-auto max-md:rounded-none max-md:overflow-visible max-md:pt-[clamp(0.4rem,1.4vh,1.1rem)]";
const titleClassName = "mt-[clamp(2.2rem,5.6vh,3.4rem)] text-center text-[2.15em] leading-[1.15] tracking-[0.03em] text-[color:var(--title-color,var(--brand-primary))] [text-shadow:var(--glass-modal-title-shadow)] [font-family:var(--font-aino-headline),var(--font-aino),Arial,sans-serif] font-[400]";
const contentClassName = "mt-[clamp(1.6rem,4.4vh,2.6rem)] flex w-full max-w-[clamp(18rem,48vw,28rem)] flex-col gap-4 text-center";
const backButtonClassName = "absolute left-[calc(var(--hud-edge-left,0px)+clamp(0.1rem,1.2vw,0.8rem))] top-1/2 inline-flex h-[5.7rem] w-[5.7rem] -translate-y-1/2 items-center justify-center border-0 bg-transparent p-0 transition-transform duration-150 ease-out hover:scale-[1.15] focus-visible:outline-none active:scale-[0.98]";
const backIconClassName = "block h-[5.7rem] w-[5.7rem] bg-center bg-no-repeat [background-size:68%_68%] [background-image:url('/logo/tagasinupp.svg')] light:[background-image:url('/logo/tagasinupphele.svg')]";
export default function TellimusBody() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subActive, setSubActive] = useState(false);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const {
    t,
    locale
  } = useI18n();
  const backLabel = t("buttons.back_previous", "Tagasi eelmisele lehele");
  const searchParams = useSearchParams();
  const returnToProfile = searchParams?.get("return") === "profile";
  const profileReturnPath = localizePath("/vestlus?profile=1", locale);
  const handleBack = () => returnToProfile ? pushWithTransition(router, profileReturnPath) : typeof window !== "undefined" && window.history.length > 1 ? router.back() : pushWithTransition(router, localizePath("/", locale));
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/subscription", {
          cache: "no-store"
        });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(payload?.error || t("subscription.error.load_failed"));
          return;
        }
        setSubActive(payload?.subscription?.status === "active");
      } catch (err) {
        console.error("subscription GET", err);
        setError(t("profile.server_unreachable"));
      } finally {
        setLoading(false);
      }
    })();
  }, [t]);
  async function handleActivate() {
    try {
      setProcessing(true);
      setError("");
      alert(t("subscription.payment.redirect_demo"));
      pushWithTransition(router, localizePath("/tellimus?status=demo", locale));
      router.refresh();
    } catch (err) {
      console.error("activate", err);
      setError(t("subscription.error.payment_start"));
    } finally {
      setProcessing(false);
    }
  }
  if (loading) {
    return <section lang={locale} className={pageShellClassName}>
        <div className={circleClassName}>
          <button type="button" className={backButtonClassName} onClick={handleBack} aria-label={backLabel}>
            <span className={backIconClassName} aria-hidden="true" />
            <span className="sr-only">{backLabel}</span>
          </button>
          <h1 className={titleClassName}>
            {t("subscription.title")}
          </h1>
          <div className={contentClassName}>
            <p className="text-center text-[0.98rem] opacity-80" aria-live="polite">
              {t("subscription.loading")}
            </p>
          </div>
        </div>
      </section>;
  }
  return <section lang={locale} className={pageShellClassName}>
      <div className={circleClassName}>
        <button type="button" className={backButtonClassName} onClick={handleBack} aria-label={backLabel}>
          <span className={backIconClassName} aria-hidden="true" />
          <span className="sr-only">{backLabel}</span>
        </button>
        <h1 className={titleClassName}>
          {t("subscription.title")}
        </h1>
        <div className={contentClassName}>
          {subActive ? <>
              <p className="text-center text-[0.98rem] opacity-80">
                {t("subscription.active.summary")}
              </p>
              <p className="text-center text-[0.98rem] opacity-80" id="cancel-note">
                <RichText value={t("subscription.active.cancel_note")} replacements={emailReplacement} />
              </p>
              <div className="mt-[clamp(1.6rem,4vh,2.6rem)] flex justify-center">
                <Link href={localizePath(returnToProfile ? "/vestlus?profile=1" : "/profiil", locale)}>
                  <Button as="a" variant="primary" size="lg" className="min-w-[9.5rem]" aria-describedby="cancel-note">
                    {t("subscription.button.open_profile")}
                  </Button>
                </Link>
              </div>
            </> : <>
              <div id="billing-info">
                <RichText as="div" className="text-center text-[clamp(1.02rem,1.7vw,1.22rem)] leading-[1.5] opacity-80" value={t("subscription.info")} replacements={emailReplacement} />
              </div>
              {error && <p role="alert" aria-live="assertive" className="text-center text-[color:#fca5a5]">
                  {error}
                </p>}
              <div className="mt-[clamp(1.6rem,4vh,2.6rem)] flex justify-center">
                <Button type="button" variant="primary" size="lg" className="min-w-[9.5rem]" disabled={processing} aria-disabled={processing} aria-busy={processing} aria-describedby="billing-info cancel-note" onClick={handleActivate}>
                  {processing ? t("subscription.button.processing") : t("subscription.button.activate")}
                </Button>
              </div>
            </>}
        </div>
      </div>
    </section>;
}
