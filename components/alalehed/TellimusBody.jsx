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
import { backWithTransition, pushWithTransition } from "@/lib/routeTransition";
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
  `${glassPageTitleClassName} subscription-page-title subpage-mobile-title policy-mobile-title policy-mobile-title--static ` +
  `!text-[#c57171] light:!text-[color:var(--glass-modal-title-color,var(--title-color,var(--brand-primary)))] ` +
  `max-[768px]:!mt-0 max-[768px]:!mb-0`;
const mobileTitleWrapClassName =
  "policy-mobile-title-wrap relative z-[4] flex w-full items-center justify-center max-[768px]:pt-[calc(env(safe-area-inset-top,0px)+2.18rem)] max-[768px]:pb-[clamp(0.18rem,0.9vh,0.42rem)]";
const ringClassName = cn(glassPageRingCenteredClassName, "glass-ring--desktop-stable");
const contentClassName =
  "subscription-content mt-0 flex w-full max-w-[clamp(18.5rem,42vw,28rem)] max-[768px]:max-w-none flex-col gap-[clamp(0.6rem,1.4vh,0.95rem)] text-center max-[768px]:text-left";
const subscriptionCopyClassName =
  "subscription-copy-text text-center max-[768px]:text-left text-[0.98rem] leading-[1.45] text-[color:var(--pt-150)] light:text-[color:var(--input-text)] max-[768px]:text-[1.08rem]";
const subscriptionInfoTextClassName =
  "subscription-info-text text-left text-[clamp(1.06rem,1.45vw,1.18rem)] max-[768px]:text-[clamp(1.24rem,4.65vw,1.42rem)] " +
  "tracking-[0.013em] max-[768px]:tracking-[0.018em] leading-[1.68] text-[color:var(--pt-150)] light:text-[color:var(--input-text)] [&_p]:m-0 [&_p:last-child]:mb-0";
const subscriptionSupplementTextClassName = `${subscriptionInfoTextClassName} m-0`;
const subscriptionInfoPanelClassName =
  "mx-auto w-full max-w-[min(28rem,100%)] rounded-[1.15rem] border-0 bg-[rgba(30,32,38,0.3)] px-[1rem] pt-[0.72rem] pb-[0.42rem] " +
  "text-[color:var(--pt-120)] shadow-[var(--chat-invite-shadow,var(--input-shadow))] " +
  "[.theme-night_&]:bg-[rgba(16,22,34,0.3)] [.theme-light_&]:bg-[rgba(255,255,255,0.3)] [.theme-light_&]:text-[#1f2937] " +
  "max-[768px]:max-w-[min(27rem,100%)] max-[768px]:px-[0.92rem] max-[768px]:pt-[0.68rem] max-[768px]:pb-[0.42rem]";
const subscriptionActionClassName =
  "min-w-[9.5rem] whitespace-nowrap px-[1.35rem] py-[0.8rem] text-[1.2rem] leading-[1.2] " +
  "max-[768px]:w-full max-[768px]:min-w-0 max-[768px]:whitespace-normal max-[768px]:!px-[1rem] max-[768px]:!py-[0.98rem] max-[768px]:!text-[1.32rem] max-[768px]:!min-h-[3.42rem]";
const subscriptionStatusClassName =
  "subscription-status-text m-0 text-center max-[768px]:text-left text-[clamp(1.08rem,1.55vw,1.24rem)] leading-[1.36] font-[500]";
const subscriptionActivePanelClassName =
  "subscription-active-panel mx-auto w-full max-w-[min(30rem,100%)] rounded-[1.1rem] border border-[rgba(125,211,252,0.22)] " +
  "bg-[linear-gradient(170deg,rgba(16,30,56,0.7),rgba(6,12,26,0.56))] " +
  "px-[1.05rem] py-[0.95rem] shadow-[0_10px_30px_rgba(7,15,35,0.35)]";
const subscriptionActiveSummaryClassName =
  "subscription-active-summary text-center max-[768px]:text-left text-[clamp(1.08rem,1.48vw,1.2rem)] leading-[1.42] font-[600] text-[color:#d7f8ea]";
const subscriptionActiveNoteClassName =
  "subscription-active-note mt-[0.52rem] text-center max-[768px]:text-left text-[clamp(0.96rem,1.2vw,1.06rem)] leading-[1.4] opacity-85";
const subscriptionInfoBlockClassName = "grid gap-[0.18rem]";
const subscriptionStatusStackClassName = "grid gap-[0.2rem] -mt-[0.15rem]";
const authModalBackdropClassName =
  "fixed inset-0 z-[94] bg-[rgba(6,10,18,0.74)] backdrop-blur-[2px] pointer-events-auto";
export default function TellimusBody() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [subActive, setSubActive] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [planRole, setPlanRole] = useState("CLIENT");
  const [monthlyAmountLabel, setMonthlyAmountLabel] = useState("");
  const [subscriptionMeta, setSubscriptionMeta] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [checkoutAgreed, setCheckoutAgreed] = useState(false);
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
  const errorText = String(error || "");
  const suppressError =
    /(makseteenuse\\s+pakk|maksepakkuja\\s+ei\\s+ole\\s+seadistatud|payment provider\\s+is\\s+not\\s+configured|платежн.*не\\s+настро)/i.test(
      errorText
    );
  const visibleError = errorText && !suppressError ? errorText : "";
  const hasPaymentNotice = Boolean(info || visibleError);
  const sponsoredEndsSoon = Boolean(subscriptionMeta?.isSponsored && subscriptionMeta?.sponsorEndsSoon);
  const sponsoredExpired = Boolean(subscriptionMeta?.isSponsored && subscriptionMeta?.sponsorExpired);
  const sponsorDaysLeft = Number(subscriptionMeta?.daysLeft || 0);
  const sponsorValidUntil = subscriptionMeta?.validUntil
    ? new Date(subscriptionMeta.validUntil).toLocaleDateString(locale === "ru" ? "ru-RU" : locale === "en" ? "en-GB" : "et-EE")
    : "";
  const hasStatusNotice = Boolean(sponsoredExpired || info || visibleError);
  const checkoutAgreementReplacements = {
    terms: {
      open: `<a href="${localizePath("/kasutustingimused", locale)}" class="${linkClassName}">`,
      close: "</a>"
    },
    privacy: {
      open: `<a href="${localizePath("/privaatsustingimused", locale)}" class="${linkClassName}">`,
      close: "</a>"
    }
  };
  const planRoleLabel =
    planRole === "SOCIAL_WORKER" ? t("role.worker") : t("role.client");
  const subscriptionInfoText = monthlyAmountLabel
    ? t("subscription.info_priced", {
        role: planRoleLabel,
        amount: monthlyAmountLabel
      })
    : t("subscription.info");
  const sponsoredInfoText = t("subscription.sponsored_info");
  const subscriptionActiveSummary = monthlyAmountLabel
    ? t("subscription.active.summary_priced", {
        role: planRoleLabel,
        amount: monthlyAmountLabel
      })
    : t("subscription.active.summary");
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
        setPlanRole(String(payload?.user?.planRole || payload?.user?.role || "CLIENT").toUpperCase());
        setMonthlyAmountLabel(String(payload?.user?.monthlyAmountLabel || "").trim());
        setSubscriptionMeta(payload?.subscription || null);
      } catch (err) {
        console.error("subscription GET", err);
        setError(t("profile.server_unreachable"));
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthed, status, t]);
  async function handleActivate() {
    if (!checkoutAgreed) {
      setError(t("subscription.checkout.error_required"));
      return;
    }
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
          locale,
          acceptedTerms: checkoutAgreed
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
          <CloseButton onClick={handleClose} ariaLabel={t("buttons.close")} className={cn(glassPageCloseClassName, "max-[768px]:hidden")} />
          <BackButton onClick={handleBack} ariaLabel={backLabel} holdPressedVisualDisabled className={glassPageBackMobileBottomCenterClassName} />
          <div className={mobileTitleWrapClassName}>
            <h1 className={titleClassName}>
              {t("subscription.title")}
            </h1>
          </div>
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
          <CloseButton onClick={handleClose} ariaLabel={t("buttons.close")} className={cn(glassPageCloseClassName, "max-[768px]:hidden")} />
          <BackButton onClick={handleBack} ariaLabel={backLabel} holdPressedVisualDisabled className={glassPageBackMobileBottomCenterClassName} />
          <div className={mobileTitleWrapClassName}>
            <h1 className={titleClassName}>
              {t("subscription.title")}
            </h1>
          </div>
          <div className={contentClassName}>
            <p className={subscriptionCopyClassName}>
              {reasonText}
            </p>
            <div className="mt-[clamp(1.6rem,4vh,2.6rem)] flex justify-center max-[768px]:w-full">
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
        <CloseButton onClick={handleClose} ariaLabel={t("buttons.close")} className={cn(glassPageCloseClassName, "max-[768px]:hidden")} />
        <BackButton onClick={handleBack} ariaLabel={backLabel} holdPressedVisualDisabled className={glassPageBackMobileBottomCenterClassName} />
        <div className={mobileTitleWrapClassName}>
          <h1 className={titleClassName}>
            {t("subscription.title")}
          </h1>
        </div>
        <div className={contentClassName}>
          {subActive ? <>
              <div className={subscriptionActivePanelClassName} id="cancel-note">
                <p className={subscriptionActiveSummaryClassName}>
                  {subscriptionActiveSummary}
                </p>
                <p className={subscriptionActiveNoteClassName}>
                  {sponsoredEndsSoon
                    ? t("subscription.active.sponsored_ending_soon", {
                        days: sponsorDaysLeft,
                        date: sponsorValidUntil
                      })
                    : subscriptionMeta?.isSponsored
                      ? t("subscription.active.sponsored_note", {
                          date: sponsorValidUntil
                        })
                      : t("subscription.active.cancel_note")}
                </p>
              </div>
              <div className="mt-[clamp(1rem,2.5vh,1.6rem)] flex justify-center max-[768px]:w-full">
                <Button type="button" variant="primary" className={subscriptionActionClassName} aria-describedby="cancel-note" onClick={() => pushWithTransition(router, localizePath(returnToProfile ? "/vestlus?profile=1" : "/profiil", locale), {
                glassRingTilt: "left",
                waitForGlassRingTilt: true,
                persistGlassRingTilt: false
              })}>
                  {t("subscription.button.open_profile")}
                </Button>
              </div>
            </> : <>
              <div className={subscriptionInfoPanelClassName}>
                <div id="billing-info" className={subscriptionInfoBlockClassName}>
                  <RichText as="div" className={subscriptionInfoTextClassName} value={subscriptionInfoText} replacements={emailReplacement} />
                  <p className={subscriptionSupplementTextClassName}>
                    {sponsoredInfoText}
                  </p>
                  {hasStatusNotice ? (
                    <div className={subscriptionStatusStackClassName}>
                      {sponsoredExpired ? <p aria-live="polite" className={cn(subscriptionStatusClassName, "text-[color:#fde68a]")}>
                          {t("subscription.active.sponsored_expired")}
                        </p> : null}
                      {info && <p aria-live="polite" className={cn(subscriptionStatusClassName, "text-[color:#a7f3d0]")}>
                          {info}
                        </p>}
                      {visibleError && <p role="alert" aria-live="assertive" className={cn(subscriptionStatusClassName, "text-[color:var(--subscription-error-color,#fca5a5)]")}>
                          {visibleError}
                        </p>}
                    </div>
                  ) : null}
                </div>
              </div>
              <div
                id="checkout-consent"
                className="mx-auto w-full max-w-[min(30rem,100%)] rounded-[1rem] border border-[rgba(255,255,255,0.12)] bg-[rgba(12,16,26,0.22)] px-[1rem] py-[0.9rem] text-left shadow-[var(--chat-invite-shadow,var(--input-shadow))] [.theme-light_&]:border-[rgba(148,163,184,0.18)] [.theme-light_&]:bg-[rgba(255,255,255,0.38)]"
              >
                <p className="m-0 mb-[0.5rem] text-[1rem] font-[650] tracking-[0.02em] text-[color:var(--pt-120)] light:text-[#1f2937]">
                  {t("subscription.checkout.title")}
                </p>
                <label className="flex cursor-pointer items-start gap-[0.7rem] text-[0.98rem] leading-[1.45] text-[color:var(--pt-150)] light:text-[color:var(--input-text)]">
                  <input
                    type="checkbox"
                    checked={checkoutAgreed}
                    onChange={(event) => setCheckoutAgreed(event.target.checked)}
                    disabled={processing}
                    className="mt-[0.2rem] h-[1.05rem] w-[1.05rem] rounded-[0.3rem] border-[rgba(148,163,184,0.4)] bg-transparent text-[color:var(--brand-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand-primary)]"
                  />
                  <RichText
                    as="span"
                    value={t("subscription.checkout.agreement")}
                    replacements={checkoutAgreementReplacements}
                    className="block"
                  />
                </label>
                <p className="mt-[0.5rem] m-0 text-[0.92rem] leading-[1.42] text-[color:var(--pt-130)] light:text-[color:#4b5563]">
                  {t("subscription.checkout.details")}
                </p>
              </div>
              <div className={cn("flex justify-center max-[768px]:w-full -translate-y-[0.3rem]", hasPaymentNotice ? "mt-[clamp(1rem,2.4vh,1.4rem)]" : "mt-[clamp(1.15rem,2.8vh,1.65rem)]")}>
                <Button type="button" variant="primary" className={subscriptionActionClassName} disabled={processing || !checkoutAgreed} aria-disabled={processing || !checkoutAgreed} aria-busy={processing} aria-describedby="billing-info checkout-consent" onClick={handleActivate}>
                  {processing ? t("subscription.button.processing") : t("subscription.button.activate")}
                </Button>
              </div>
            </>}
        </div>
      </GlassRing>
    </section>;
}
