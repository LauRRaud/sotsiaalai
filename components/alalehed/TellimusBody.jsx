"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";
import RichText from "@/components/i18n/RichText";
import BackButton from "@/components/ui/BackButton";
import CloseButton from "@/components/ui/CloseButton";
import Button from "@/components/ui/Button";
import GlassRing from "@/components/ui/GlassRing";
import { glassPageBackMobileBottomCenterClassName, glassPageCloseClassName, glassPageRingCenteredClassName, glassPageShellCenteredClassName, glassPageTitleClassName } from "@/components/ui/glassPageStyles";
import { cn } from "@/components/ui/cn";
import { localizePath } from "@/lib/localizePath";
import { pushWithTransition } from "@/lib/routeTransition";
const linkClassName = "inline-flex items-center gap-[0.35rem] underline underline-offset-4 decoration-[color:currentColor] text-[color:var(--link-gold)] hover:text-[color:var(--link-gold-hover)] light:text-[color:var(--link-color)] light:hover:text-[color:var(--link-color)] hc:text-[color:var(--hc-accent)]";
const emailReplacement = {
  email: {
    open: `<a href="mailto:info@sotsiaal.ai" class="${linkClassName}">`,
    close: "</a>"
  }
};
const pageShellClassName = glassPageShellCenteredClassName;
const titleClassName = glassPageTitleClassName;
const ringClassName = cn(glassPageRingCenteredClassName, "glass-ring--desktop-stable");
const contentClassName = "mt-[clamp(1.2rem,3.2vh,2rem)] flex w-full max-w-[clamp(17rem,42vw,27rem)] flex-col gap-4 text-center";
const subscriptionActionClassName =
  "min-w-[9.5rem] whitespace-nowrap px-[1.35rem] py-[0.8rem] text-[1.2rem] leading-[1.2] " +
  "max-[48em]:min-w-0 max-[48em]:px-[1.2rem] max-[48em]:py-[0.74rem] max-[48em]:text-[1.08rem]";
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
  const handleClose = () => returnToProfile ? pushWithTransition(router, profileReturnPath) : pushWithTransition(router, localizePath("/profiil", locale));
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
        <GlassRing className={ringClassName}>
          <CloseButton onClick={handleClose} ariaLabel={t("buttons.close")} className={cn(glassPageCloseClassName, "max-[48em]:hidden")} />
          <BackButton onClick={handleBack} ariaLabel={backLabel} className={glassPageBackMobileBottomCenterClassName} />
          <h1 className={titleClassName}>
            {t("subscription.title")}
          </h1>
          <div className={contentClassName}>
            <p className="text-center text-[0.98rem] opacity-80" aria-live="polite">
              {t("subscription.loading")}
            </p>
          </div>
        </GlassRing>
      </section>;
  }
  return <section lang={locale} className={pageShellClassName}>
      <GlassRing className={ringClassName}>
        <CloseButton onClick={handleClose} ariaLabel={t("buttons.close")} className={cn(glassPageCloseClassName, "max-[48em]:hidden")} />
        <BackButton onClick={handleBack} ariaLabel={backLabel} className={glassPageBackMobileBottomCenterClassName} />
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
                <Button as="a" href={localizePath(returnToProfile ? "/vestlus?profile=1" : "/profiil", locale)} variant="primary" className={subscriptionActionClassName} aria-describedby="cancel-note">
                  {t("subscription.button.open_profile")}
                </Button>
              </div>
            </> : <>
              <div id="billing-info">
                <RichText as="div" className="text-center text-[clamp(1.02rem,1.7vw,1.22rem)] leading-[1.5] opacity-80" value={t("subscription.info")} replacements={emailReplacement} />
              </div>
              {error && <p role="alert" aria-live="assertive" className="text-center text-[color:#fca5a5]">
                  {error}
                </p>}
              <div className="mt-[clamp(1.6rem,4vh,2.6rem)] flex justify-center">
                <Button type="button" variant="primary" className={subscriptionActionClassName} disabled={processing} aria-disabled={processing} aria-busy={processing} aria-describedby="billing-info cancel-note" onClick={handleActivate}>
                  {processing ? t("subscription.button.processing") : t("subscription.button.activate")}
                </Button>
              </div>
            </>}
        </div>
      </GlassRing>
    </section>;
}
