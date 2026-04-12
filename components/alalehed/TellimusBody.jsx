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
import FancyCheckbox from "@/components/ui/FancyCheckbox";
import { glassPageBackTopLeftClassName, glassPageCloseClassName, glassPageShellCenteredClassName, glassPageTitleClassName, glassSubpageContentWideClassName, glassSubpageMobileReadableWidthClassName, glassSubpagePanelWideClassName } from "@/components/ui/glassPageStyles";
import { cn } from "@/components/ui/cn";
import { localizePath } from "@/lib/localizePath";
import { backWithTransition, pushWithTransition } from "@/lib/routeTransition";
import { resolveApiMessage } from "@/lib/i18n/resolveApiMessage";
const linkClassName = "font-[inherit] no-underline text-[color:var(--link-gold)] hover:text-[color:var(--link-gold-hover)] light:text-[color:var(--link-color)] light:hover:text-[color:var(--link-color)] hc:text-[color:var(--hc-accent)]";
const emailReplacement = {
  email: {
    open: `<a href="mailto:info@sotsiaal.ai" class="${linkClassName}">`,
    close: "</a>"
  }
};
const pageShellClassName =
  `${glassPageShellCenteredClassName} !flex h-[100dvh] min-h-[100dvh] items-center justify-start overflow-x-hidden overflow-y-auto overscroll-contain px-[1rem] py-[clamp(1rem,3vh,1.75rem)] ` +
  "max-[768px]:items-stretch max-[768px]:px-0 max-[768px]:py-[max(var(--mobile-glass-card-gap,0.35rem),env(safe-area-inset-top,0px))]";
const titleClassName =
  `${glassPageTitleClassName} subscription-page-title subpage-mobile-title policy-mobile-title policy-mobile-title--static ` +
  `max-[768px]:!mt-0 max-[768px]:!mb-0`;
const mobileTitleWrapClassName =
  "policy-mobile-title-wrap relative z-[4] flex w-full items-center justify-center max-[768px]:pt-[calc(env(safe-area-inset-top,0px)+2.18rem)] max-[768px]:pb-[clamp(0.18rem,0.9vh,0.42rem)]";
const subscriptionCardBaseClassName =
  `subscription-modal-content relative z-[21] my-[clamp(0.5rem,2vh,1.25rem)] flex w-full shrink-0 !max-w-[clamp(30rem,54vw,38rem)] max-h-none flex-col overflow-x-hidden overflow-y-visible rounded-[var(--glass-modal-radius)] ` +
  `[--glass-modal-border:none] [--glass-modal-shadow:var(--glass-shell-shadow,none)] ` +
  `[border:none] [background:var(--glass-ring-surface-bg,var(--glass-surface-bg,rgba(0,0,0,0.25)))] text-[color:var(--glass-surface-text,#f2f2f2)] shadow-[var(--glass-shell-shadow,none)] ` +
  `backdrop-blur-[var(--glass-modal-blur,var(--glass-blur-radius,1rem))] [-webkit-backdrop-filter:blur(var(--glass-modal-blur,var(--glass-blur-radius,1rem)))] ` +
  `px-[0.95rem] pt-[0.35rem] pb-[1rem] max-[768px]:[--glass-ring-pad-x:clamp(0.78rem,3vw,0.94rem)] max-[768px]:rounded-[1.45rem] max-[768px]:px-[0.78rem] max-[768px]:pb-[0.9rem] ` +
  `max-[768px]:mx-[max(var(--mobile-glass-card-gap,0.35rem),env(safe-area-inset-left,0px))] ` +
  `max-[768px]:w-[calc(100vw-env(safe-area-inset-left,0px)-env(safe-area-inset-right,0px)-(var(--mobile-glass-card-gap,0.35rem)*2))]`;
const contentClassName =
  `subscription-content ${glassSubpageContentWideClassName} ${glassSubpageMobileReadableWidthClassName} mt-[1.2rem] flex max-w-[32.25rem] max-[768px]:mt-[1rem] flex-col gap-[1.05rem] max-[768px]:max-w-[22.25rem]`;
const subscriptionCopyClassName =
  "subscription-copy-text text-center text-[1.06rem] leading-[1.56] text-[color:var(--pt-150)] light:text-[color:var(--input-text)] mx-auto w-full max-w-[32.25rem] max-[768px]:max-w-[20rem] max-[768px]:text-[1.12rem]";
const subscriptionInfoTextClassName =
  "subscription-info-text text-left text-[1.08rem] max-[768px]:text-[1.12rem] " +
  "tracking-[0.004em] leading-[1.58] text-[color:var(--pt-150)] light:text-[color:var(--input-text)] mx-auto w-full max-w-[32.25rem] max-[768px]:max-w-[20rem] [&_p]:m-0 [&_p:last-child]:mb-0";
const subscriptionSupplementTextClassName = `${subscriptionInfoTextClassName} m-0`;
const subscriptionUnifiedPanelClassName =
  `${glassSubpagePanelWideClassName} px-[0.5rem] py-[0.15rem] ` +
  "text-[color:var(--pt-120)] max-w-[32.25rem] max-[768px]:max-w-[21.5rem] max-[768px]:px-[0.34rem] max-[768px]:py-0";
const subscriptionCardBodyClassName =
  "grid gap-[0.68rem] text-[color:var(--pt-150)] light:text-[color:var(--input-text)] mx-auto w-full max-w-[32.25rem] max-[768px]:max-w-[20rem]";
const subscriptionCheckoutCardBodyClassName =
  "grid gap-[0.48rem] text-[color:var(--pt-150)] light:text-[color:var(--input-text)] mx-auto w-full max-w-[32.25rem] max-[768px]:max-w-[20rem]";
const subscriptionSectionTitleClassName =
  "m-0 text-center text-[1.24rem] font-[500] tracking-[0.004em] leading-[1.28] text-[color:var(--glass-modal-text)] max-[768px]:text-[1.18rem]";
const subscriptionDividerClassName =
  "my-[0.12rem] h-px w-full bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.16)_12%,rgba(255,255,255,0.16)_88%,rgba(255,255,255,0)_100%)] [.theme-light_&]:bg-[linear-gradient(90deg,rgba(122,58,56,0)_0%,rgba(122,58,56,0.12)_12%,rgba(122,58,56,0.12)_88%,rgba(122,58,56,0)_100%)]";
const subscriptionConsentTextClassName =
  "mt-[0.34rem] text-left text-[1.07rem] leading-[1.48] tracking-[0.003em] text-[color:var(--pt-130)] light:text-[color:var(--input-text)] mx-auto w-full max-w-[32.25rem] max-[768px]:max-w-[20rem]";
const subscriptionAgreementLabelClassName =
  "block [&_a]:text-[1.08em] max-[768px]:[&_a]:text-[1.1em]";
const subscriptionCheckboxRowClassName =
  "fancy-checkbox--otp fancy-checkbox--multiline w-full justify-start " +
  "[--otp-check-shape:var(--glass-modal-text,var(--pt-150))] [--otp-check-tick:var(--title-color,var(--brand-primary))] [--otp-check-text:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] " +
  "[--otp-check-box-size:1.78rem] [--otp-check-font-size:1.06rem] [--otp-check-line-height:1.52] [--otp-check-text-max-width:min(100%,32.25rem)] max-[768px]:[--otp-check-text-max-width:min(100%,20rem)] [--otp-check-box-offset:0.08rem] " +
  "[&_.box]:translate-y-[-0.08rem]";
const subscriptionCheckoutFooterClassName = "mt-[-0.1rem] flex justify-center";
const subscriptionActionClassName =
  "min-w-[10.2rem] whitespace-nowrap px-[1.45rem] py-[0.82rem] text-[1.12rem] leading-[1.2] " +
  "max-[768px]:!w-fit max-[768px]:min-w-[10.2rem] max-[768px]:whitespace-normal max-[768px]:!px-[1rem] max-[768px]:!py-[0.98rem] max-[768px]:!text-[1.32rem] max-[768px]:!min-h-[3.42rem]";
const subscriptionStatusClassName =
  "subscription-status-text m-0 text-left text-[1.04rem] leading-[1.52] font-[500] mx-auto w-full max-w-[32.25rem] max-[768px]:max-w-[20rem]";
const subscriptionActivePanelClassName =
  `subscription-active-panel ${glassSubpagePanelWideClassName} px-[0.5rem] py-[0.15rem] max-w-[32.25rem] max-[768px]:max-w-[21.5rem] max-[768px]:px-[0.34rem]`;
const subscriptionActiveSummaryClassName =
  "subscription-active-summary text-left text-[1.08rem] leading-[1.56] font-[600] tracking-[0.004em] text-[color:var(--glass-modal-text)] mx-auto w-full max-w-[32.25rem] max-[768px]:max-w-[20rem]";
const subscriptionActiveNoteClassName =
  "subscription-active-note mt-[0.52rem] text-left text-[1.05rem] leading-[1.58] tracking-[0.004em] text-[color:var(--pt-120)] mx-auto w-full max-w-[32.25rem] max-[768px]:max-w-[20rem]";
const subscriptionInfoBlockClassName = "grid gap-[0.7rem]";
const subscriptionStatusStackClassName = "grid gap-[0.2rem] pt-[0.1rem]";
const authModalBackdropClassName =
  "fixed inset-0 z-[94] bg-[rgba(6,10,18,0.74)] backdrop-blur-[2px] pointer-events-auto";

let maksekeskusScriptPromise = null;

function loadMaksekeskusCheckoutScript(scriptUrl) {
  const src = String(scriptUrl || "").trim();
  if (!src) {
    return Promise.reject(new Error("missing_script_url"));
  }
  if (typeof window === "undefined" || typeof document === "undefined") {
    return Promise.reject(new Error("browser_only"));
  }
  if (window.Maksekeskus?.Checkout) {
    return Promise.resolve(window.Maksekeskus);
  }
  if (maksekeskusScriptPromise) {
    return maksekeskusScriptPromise;
  }

  maksekeskusScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(window.Maksekeskus), {
        once: true
      });
      existing.addEventListener("error", () => reject(new Error("script_load_failed")), {
        once: true
      });
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve(window.Maksekeskus);
    script.onerror = () => {
      maksekeskusScriptPromise = null;
      reject(new Error("script_load_failed"));
    };
    document.head.appendChild(script);
  });

  return maksekeskusScriptPromise;
}

export default function TellimusBody() {
  const router = useRouter();
  const subscriptionCheckoutDisabled = true;
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
  const [closing, setClosing] = useState(false);
  const {
    t,
    locale
  } = useI18n();
  const backLabel = t("buttons.back_previous");
  const searchParams = useSearchParams();
  const paymentState = String(searchParams?.get("payment") || "").toLowerCase();
  const returnToProfile = searchParams?.get("return") === "profile";
  const returnToOrbitMenu = returnToProfile && searchParams?.get("orbit") === "1";
  const reason = String(searchParams?.get("reason") || "").toLowerCase();
  const isVerifiedEntry = reason === "email-verified";
  const isAuthed = status === "authenticated" || !!session?.user;
  const errorText = String(error || "");
  const suppressError =
    /(makseteenuse\\s+pakk|maksepakkuja\\s+ei\\s+ole\\s+seadistatud|payment provider\\s+is\\s+not\\s+configured|платежн.*не\\s+настро)/i.test(
      errorText
    );
  const providerConfigError = suppressError ? errorText : "";
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
  const recurringTitle = t("subscription.checkout.recurring_title", "SotsiaalAI kuutellimus");
  const recurringDescription = t("subscription.checkout.recurring_description", {
    role: planRoleLabel,
    amount: monthlyAmountLabel || ""
  });
  const recurringConfirmation = t(
    "subscription.checkout.recurring_confirmation",
    "Kinnitan, et nõustun korduva kuumaksega ja volitan SotsiaalAI-d võtma igakuise makse sama kaardiga kuni tellimuse tühistamiseni."
  );
  const subscriptionActiveSummary = monthlyAmountLabel
    ? t("subscription.active.summary_priced", {
        role: planRoleLabel,
        amount: monthlyAmountLabel
      })
    : t("subscription.active.summary");
  const profileReturnPath = localizePath(returnToOrbitMenu ? "/profiil?orbit=1" : "/vestlus?profile=1", locale);
  const transitionOptions = {
    glassRingTilt: "left",
    waitForGlassRingTilt: true,
    persistGlassRingTilt: false
  };
  const handleBack = () => {
    if (closing) return;
    setClosing(true);
    if (returnToProfile) {
      pushWithTransition(router, profileReturnPath, transitionOptions);
      return;
    }
    if (typeof window !== "undefined" && window.history.length > 1) {
      backWithTransition(router, transitionOptions);
      return;
    }
    pushWithTransition(router, localizePath("/", locale), transitionOptions);
  };
  const handleClose = () => {
    if (closing) return;
    setClosing(true);
    if (returnToProfile) {
      pushWithTransition(router, profileReturnPath, transitionOptions);
      return;
    }
    pushWithTransition(router, localizePath("/profiil", locale), transitionOptions);
  };
  const subscriptionCardClassName = cn(
    subscriptionCardBaseClassName,
    closing ? "pointer-events-none motion-safe:animate-[glassRingTiltFromLeft_540ms_cubic-bezier(0.42,0,0.58,1)_both]" : null
  );
  useEffect(() => {
    if (status !== "unauthenticated") return;
    if (!isVerifiedEntry) return;
    setLoginOpen(true);
  }, [isVerifiedEntry, status]);
  useEffect(() => {
    return () => {
      if (typeof window === "undefined") return;
      delete window.sotsiaalaiMaksekeskusCompleted;
      delete window.sotsiaalaiMaksekeskusCancelled;
    };
  }, []);
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
    if (subscriptionCheckoutDisabled) {
      setError(t("subscription.error.checkout_temporarily_disabled"));
      return;
    }
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
      if (payload?.checkoutMode === "iframe_recurring") {
        const publishableKey = String(payload?.publishableKey || "").trim();
        const transactionId = String(payload?.transactionId || "").trim();
        const scriptUrl = String(payload?.scriptUrl || "").trim();

        if (!publishableKey || !transactionId || !scriptUrl) {
          setError(t("subscription.error.payment_start"));
          return;
        }

        await loadMaksekeskusCheckoutScript(scriptUrl);
        if (!window.Maksekeskus?.Checkout?.initialize || !window.Maksekeskus?.Checkout?.open) {
          setError(t("subscription.error.payment_start"));
          return;
        }

        window.sotsiaalaiMaksekeskusCompleted = () => {
          setError("");
          setInfo(t("subscription.payment.confirmation_pending"));
        };
        window.sotsiaalaiMaksekeskusCancelled = () => {
          setProcessing(false);
          setInfo("");
          setError(t("subscription.error.payment_failed"));
        };

        window.Maksekeskus.Checkout.initialize({
          key: publishableKey,
          transaction: transactionId,
          email: session?.user?.email || undefined,
          clientName: session?.user?.name || undefined,
          locale,
          recurringTitle,
          recurringDescription,
          recurringConfirmation,
          recurringChecked: false,
          recurringRequired: true,
          completed: "sotsiaalaiMaksekeskusCompleted",
          cancelled: "sotsiaalaiMaksekeskusCancelled",
          backdropClose: false
        });
        window.Maksekeskus.Checkout.open();
        return;
      }
      setError(t("subscription.error.payment_start"));
    } catch (err) {
      console.error("activate", err);
      setError(t("subscription.error.payment_start"));
    } finally {
      setProcessing(false);
    }
  }
  if (loading) {
    return <section lang={locale} className={pageShellClassName}>
        <div className={subscriptionCardClassName}>
          <CloseButton onClick={handleClose} ariaLabel={t("buttons.close")} className={cn(glassPageCloseClassName, "absolute right-[0.4rem] top-[0.35rem] z-[3] max-[768px]:hidden")} />
          <BackButton onClick={handleBack} ariaLabel={backLabel} holdPressedVisualDisabled className={cn(glassPageBackTopLeftClassName, "z-[3]")} />
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
        </div>
      </section>;
  }
  if (!isAuthed) {
    const reasonText = isVerifiedEntry
      ? t(
          "subscription.login_after_email_verify",
          "E-post on kinnitatud. Logi sisse, et jätkata tellimuse aktiveerimisega."
        )
      : t("profile.login_to_manage_sub");
    return <section lang={locale} className={pageShellClassName}>
        <div className={cn(subscriptionCardClassName, loginOpen ? "opacity-0 pointer-events-none" : "opacity-100", "transition-opacity duration-200 ease-out")} aria-hidden={loginOpen ? "true" : undefined}>
          <CloseButton onClick={handleClose} ariaLabel={t("buttons.close")} className={cn(glassPageCloseClassName, "absolute right-[0.4rem] top-[0.35rem] z-[3] max-[768px]:hidden")} />
          <BackButton onClick={handleBack} ariaLabel={backLabel} holdPressedVisualDisabled className={cn(glassPageBackTopLeftClassName, "z-[3]")} />
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
        </div>
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
      <div className={subscriptionCardClassName}>
        <CloseButton onClick={handleClose} ariaLabel={t("buttons.close")} className={cn(glassPageCloseClassName, "absolute right-[0.4rem] top-[0.35rem] z-[3] max-[768px]:hidden")} />
        <BackButton onClick={handleBack} ariaLabel={backLabel} holdPressedVisualDisabled className={cn(glassPageBackTopLeftClassName, "z-[3]")} />
        <div className={mobileTitleWrapClassName}>
          <h1 className={titleClassName}>
            {t("subscription.title")}
          </h1>
        </div>
        <div className={contentClassName}>
          {subActive ? <>
              <div className={subscriptionActivePanelClassName} id="cancel-note">
                <div className={subscriptionCardBodyClassName}>
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
                <div className={subscriptionCheckoutFooterClassName}>
                  <Button type="button" variant="primary" className={subscriptionActionClassName} aria-describedby="cancel-note" onClick={() => pushWithTransition(router, returnToProfile ? profileReturnPath : localizePath("/profiil", locale), {
                glassRingTilt: "left",
                waitForGlassRingTilt: true,
                persistGlassRingTilt: false
                  })}>
                    {t("subscription.button.open_profile")}
                  </Button>
                </div>
              </div>
            </> : <>
              <div id="checkout-consent" className={subscriptionUnifiedPanelClassName}>
                <div className={subscriptionCardBodyClassName}>
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
                  <div className={subscriptionDividerClassName} />
                  <div className={subscriptionCheckoutCardBodyClassName}>
                    <p className={subscriptionSectionTitleClassName}>
                      {t("subscription.checkout.title")}
                    </p>
                    <div className="flex">
                      <FancyCheckbox
                        id="subscription-consent"
                        name="subscriptionConsent"
                        checked={checkoutAgreed}
                        disabled={processing}
                        onChange={(next) => setCheckoutAgreed(next)}
                        label={<RichText as="span" value={t("subscription.checkout.agreement")} replacements={checkoutAgreementReplacements} className={subscriptionAgreementLabelClassName} />}
                        className={subscriptionCheckboxRowClassName}
                      />
                    </div>
                    <p className={subscriptionConsentTextClassName}>
                      {t("subscription.checkout.details")}
                    </p>
                    {providerConfigError ? <p role="alert" aria-live="assertive" className={cn(subscriptionStatusClassName, "text-center text-[color:var(--title-color,var(--brand-primary)))]")}>
                        {providerConfigError}
                      </p> : null}
                    <div className={cn(subscriptionCheckoutFooterClassName, hasPaymentNotice ? "pt-[0.15rem]" : null)}>
                      <Button type="button" variant="primary" className={subscriptionActionClassName} disabled={subscriptionCheckoutDisabled || processing || !checkoutAgreed} aria-disabled={subscriptionCheckoutDisabled || processing || !checkoutAgreed} aria-busy={processing} aria-describedby="billing-info checkout-consent" onClick={handleActivate}>
                        {processing ? t("subscription.button.processing") : t("subscription.button.activate")}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>}
        </div>
      </div>
    </section>;
}
