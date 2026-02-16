"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useI18n } from "@/components/i18n/I18nProvider";
import RichText from "@/components/i18n/RichText";
import LoginModal from "@/components/LoginModal";
import BackButton from "@/components/ui/BackButton";
import CloseButton from "@/components/ui/CloseButton";
import Button from "@/components/ui/Button";
import GlassRing from "@/components/ui/GlassRing";
import { glassPageBackMobileBottomCenterClassName, glassPageCloseClassName, glassPageRingCenteredClassName, glassPageShellCenteredClassName, glassPageTitleClassName } from "@/components/ui/glassPageStyles";
import { cn } from "@/components/ui/cn";
import { localizePath } from "@/lib/localizePath";
import { pushWithTransition } from "@/lib/routeTransition";
import { resolveApiMessage } from "@/lib/i18n/resolveApiMessage";
const linkClassName = "inline-flex items-center gap-[0.35rem] underline underline-offset-4 decoration-[color:currentColor] text-[color:var(--link-gold)] hover:text-[color:var(--link-gold-hover)] light:text-[color:var(--link-color)] light:hover:text-[color:var(--link-color)] hc:text-[color:var(--hc-accent)]";
const emailReplacement = {
  email: {
    open: `<a href="mailto:info@sotsiaal.ai" class="${linkClassName}">`,
    close: "</a>"
  }
};
const pageShellClassName = glassPageShellCenteredClassName;
const titleClassName =
  `${glassPageTitleClassName} max-[48em]:!text-[clamp(2.24rem,8.8vw,2.9rem)]`;
const ringClassName = cn(glassPageRingCenteredClassName, "glass-ring--desktop-stable");
const contentClassName =
  "mt-[clamp(1.2rem,3.2vh,2rem)] flex w-full max-w-[clamp(17rem,42vw,27rem)] max-[48em]:max-w-none flex-col gap-4 text-center max-[48em]:text-left";
const subscriptionCopyClassName =
  "text-center max-[48em]:text-left text-[0.98rem] leading-[1.45] opacity-80 max-[48em]:text-[1.08rem]";
const subscriptionInfoTextClassName =
  "text-center max-[48em]:text-left text-[clamp(1.06rem,1.45vw,1.18rem)] max-[48em]:text-[clamp(1.24rem,4.65vw,1.42rem)] " +
  "tracking-[0.013em] max-[48em]:tracking-[0.018em] leading-[1.68] opacity-80";
const subscriptionActionClassName =
  "min-w-[9.5rem] whitespace-nowrap px-[1.35rem] py-[0.8rem] text-[1.2rem] leading-[1.2] " +
  "max-[48em]:w-full max-[48em]:min-w-0 max-[48em]:whitespace-normal max-[48em]:!px-[1rem] max-[48em]:!py-[0.98rem] max-[48em]:!text-[1.32rem] max-[48em]:!min-h-[3.42rem]";
const subscriptionStatusClassName =
  "text-center max-[48em]:text-left text-[clamp(1.08rem,1.55vw,1.24rem)] leading-[1.36] font-[500]";
const authModalBackdropClassName =
  "fixed inset-0 z-[94] bg-[rgba(6,10,18,0.74)] backdrop-blur-[2px] pointer-events-auto";
export default function TellimusBody() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [subActive, setSubActive] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [processing, setProcessing] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const {
    t,
    locale
  } = useI18n();
  const backLabel = t("buttons.back_previous");
  const searchParams = useSearchParams();
  const paymentState = String(searchParams?.get("payment") || "").toLowerCase();
  const returnToProfile = searchParams?.get("return") === "profile";
  const reason = String(searchParams?.get("reason") || "").toLowerCase();
  const isVerifiedEntry = reason === "email-verified";
  const isAuthed = status === "authenticated" || !!session?.user;
  const hasPaymentNotice = Boolean(info || error);
  const profileReturnPath = localizePath("/vestlus?profile=1", locale);
  const handleBack = () => returnToProfile ? pushWithTransition(router, profileReturnPath) : typeof window !== "undefined" && window.history.length > 1 ? router.back() : pushWithTransition(router, localizePath("/", locale));
  const handleClose = () => returnToProfile ? pushWithTransition(router, profileReturnPath) : pushWithTransition(router, localizePath("/profiil", locale));
  useEffect(() => {
    if (status !== "unauthenticated") return;
    if (!isVerifiedEntry) return;
    setLoginOpen(true);
  }, [isVerifiedEntry, status]);
  useEffect(() => {
    if (paymentState === "success") {
      setError("");
      setInfo(t("subscription.payment.confirmation_pending"));
      return;
    }
    if (paymentState === "pending") {
      setError("");
      setInfo(t("subscription.payment.pending"));
      return;
    }
    if (paymentState === "failed" || paymentState === "canceled") {
      setInfo("");
      setError(t("subscription.error.payment_failed"));
      return;
    }
    setInfo("");
  }, [paymentState, t]);
  useEffect(() => {
    if (status === "loading") return;
    if (!isAuthed) {
      setLoading(false);
      setSubActive(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch("/api/subscription", {
          cache: "no-store"
        });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(resolveApiMessage({
            payload,
            t,
            fallbackKey: "subscription.error.load_failed"
          }));
          return;
        }
        const status = String(payload?.subscription?.status || "").toUpperCase();
        setSubActive(Boolean(payload?.subscription?.isActive) || status === "ACTIVE");
      } catch (err) {
        console.error("subscription GET", err);
        setError(t("profile.server_unreachable"));
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthed, status, t]);
  async function handleActivate() {
    try {
      setProcessing(true);
      setError("");
      setInfo("");
      const res = await fetch("/api/subscription/init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          locale
        })
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(resolveApiMessage({
          payload,
          t,
          fallbackKey: "subscription.error.payment_start"
        }));
        return;
      }
      const checkoutUrl = typeof payload?.checkoutUrl === "string" ? payload.checkoutUrl.trim() : "";
      if (!checkoutUrl) {
        setError(t("subscription.error.payment_start"));
        return;
      }
      setInfo(t("subscription.payment.redirect_demo"));
      if (typeof window !== "undefined") {
        window.location.assign(checkoutUrl);
      }
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
            <p className={subscriptionCopyClassName} aria-live="polite">
              {t("subscription.loading")}
            </p>
          </div>
        </GlassRing>
      </section>;
  }
  if (!isAuthed) {
    const reasonText = isVerifiedEntry
      ? t(
          "subscription.login_after_email_verify",
          "E-post on kinnitatud. Logi sisse, et jatkata tellimuse aktiveerimisega."
        )
      : t("profile.login_to_manage_sub");
    return <section lang={locale} className={pageShellClassName}>
        <GlassRing className={cn(ringClassName, loginOpen ? "opacity-0 pointer-events-none" : "opacity-100", "transition-opacity duration-200 ease-out")} aria-hidden={loginOpen ? "true" : undefined}>
          <CloseButton onClick={handleClose} ariaLabel={t("buttons.close")} className={cn(glassPageCloseClassName, "max-[48em]:hidden")} />
          <BackButton onClick={handleBack} ariaLabel={backLabel} className={glassPageBackMobileBottomCenterClassName} />
          <h1 className={titleClassName}>
            {t("subscription.title")}
          </h1>
          <div className={contentClassName}>
            <p className={subscriptionCopyClassName}>
              {reasonText}
            </p>
            <div className="mt-[clamp(1.6rem,4vh,2.6rem)] flex justify-center max-[48em]:w-full">
              <Button type="button" variant="primary" className={subscriptionActionClassName} onClick={() => setLoginOpen(true)}>
                {t("auth.login.title")}
              </Button>
            </div>
          </div>
        </GlassRing>
        {loginOpen ? <div className={authModalBackdropClassName} aria-hidden="true" /> : null}

        <LoginModal
          open={loginOpen}
          onClose={() => setLoginOpen(false)}
          suppressRedirect
          onAuthSuccess={() => {
            setLoginOpen(false);
            router.refresh();
          }}
          prefillStoredEmail={!isVerifiedEntry}
        />
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
              <p className={subscriptionCopyClassName}>
                {t("subscription.active.summary")}
              </p>
              <p className={subscriptionCopyClassName} id="cancel-note">
                <RichText value={t("subscription.active.cancel_note")} replacements={emailReplacement} />
              </p>
              <div className="mt-[clamp(1.6rem,4vh,2.6rem)] flex justify-center max-[48em]:w-full">
                <Button as="a" href={localizePath(returnToProfile ? "/vestlus?profile=1" : "/profiil", locale)} variant="primary" className={subscriptionActionClassName} aria-describedby="cancel-note">
                  {t("subscription.button.open_profile")}
                </Button>
              </div>
            </> : <>
              <div id="billing-info">
                <RichText as="div" className={subscriptionInfoTextClassName} value={t("subscription.info")} replacements={emailReplacement} />
              </div>
              {info && <p aria-live="polite" className={cn(subscriptionStatusClassName, "text-[color:#a7f3d0]")}>
                  {info}
                </p>}
              {error && <p role="alert" aria-live="assertive" className={cn(subscriptionStatusClassName, "text-[color:#fca5a5]")}>
                  {error}
                </p>}
              <div className={cn("flex justify-center max-[48em]:w-full", hasPaymentNotice ? "mt-[clamp(0.9rem,2.2vh,1.4rem)]" : "mt-[clamp(1.6rem,4vh,2.6rem)]")}>
                <Button type="button" variant="primary" className={subscriptionActionClassName} disabled={processing} aria-disabled={processing} aria-busy={processing} aria-describedby="billing-info cancel-note" onClick={handleActivate}>
                  {processing ? t("subscription.button.processing") : t("subscription.button.activate")}
                </Button>
              </div>
            </>}
        </div>
      </GlassRing>
    </section>;
}
