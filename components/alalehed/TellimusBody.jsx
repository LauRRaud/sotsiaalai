"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/components/i18n/I18nProvider";
import RichText from "@/components/i18n/RichText";
import BackButton from "@/components/ui/BackButton";
import GlassRing from "@/components/ui/GlassRing";
import { glassPageBackClassName, glassPageTitleClassName } from "@/components/ui/glassPageStyles";
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
const titleClassName = glassPageTitleClassName;
const contentClassName = "mt-[clamp(1.6rem,4.4vh,2.6rem)] flex w-full max-w-[clamp(18rem,48vw,28rem)] flex-col gap-4 text-center";
const buttonBaseClassName = "inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-[1.35rem] py-[0.8rem] text-[1.2rem] font-[500] tracking-[0.02em] min-h-[2.85rem] select-none relative transition-[transform,background,border-color,box-shadow,color] duration-150 ease-out cursor-pointer backdrop-blur-[10px] backdrop-saturate-[120%] focus-visible:outline-none disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 aria-disabled:opacity-60 aria-disabled:cursor-not-allowed";
const buttonPrimaryClassName = "text-[color:var(--btn-primary-text,rgba(248,252,255,0.92))] [background:var(--btn-primary-bg)] [border:var(--btn-primary-border)] shadow-[var(--btn-primary-shadow)] hover:[background:var(--btn-primary-bg-hover)] hover:[border:var(--btn-primary-border-hover)] hover:-translate-y-[1px] focus-visible:[background:var(--btn-primary-bg-hover)] focus-visible:[border:var(--btn-primary-border-hover)] focus-visible:shadow-[var(--btn-primary-shadow-focus)] active:translate-y-[1px] active:[background:var(--btn-primary-bg-active)] active:[border:var(--btn-primary-border-active)] active:shadow-[var(--btn-primary-shadow-active)]";
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
        <GlassRing>
          <BackButton onClick={handleBack} ariaLabel={backLabel} className={glassPageBackClassName} />
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
      <GlassRing>
        <BackButton onClick={handleBack} ariaLabel={backLabel} className={glassPageBackClassName} />
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
                <Link href={localizePath(returnToProfile ? "/vestlus?profile=1" : "/profiil", locale)} className={`${buttonBaseClassName} ${buttonPrimaryClassName} min-w-[9.5rem]`.trim()} aria-describedby="cancel-note">
                  {t("subscription.button.open_profile")}
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
                <button type="button" className={`${buttonBaseClassName} ${buttonPrimaryClassName} min-w-[9.5rem]`.trim()} disabled={processing} aria-disabled={processing} aria-busy={processing} aria-describedby="billing-info cancel-note" onClick={handleActivate}>
                  {processing ? t("subscription.button.processing") : t("subscription.button.activate")}
                </button>
              </div>
            </>}
        </div>
      </GlassRing>
    </section>;
}
