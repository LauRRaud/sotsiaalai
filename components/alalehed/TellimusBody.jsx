"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { useI18n } from "@/components/i18n/I18nProvider";
import RichText from "@/components/i18n/RichText";
import InvitePageShell from "@/components/ui/InvitePageShell";
import { localizePath } from "@/lib/localizePath";
import { pushWithTransition } from "@/lib/routeTransition";
const emailReplacement = {
  email: {
    open: '<a href="mailto:info@sotsiaal.ai" class="link-brand">',
    close: "</a>",
  },
};
export default function TellimusBody() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subActive, setSubActive] = useState(false);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const { t, locale } = useI18n();
  const backLabel = t("buttons.back_previous", "Tagasi eelmisele lehele");
  const searchParams = useSearchParams();
  const returnToProfile = searchParams?.get("return") === "profile";
  const profileReturnPath = localizePath("/vestlus?profile=1", locale);
  const handleBack = () =>
    returnToProfile
      ? pushWithTransition(router, profileReturnPath)
      : typeof window !== "undefined" && window.history.length > 1
      ? router.back()
      : pushWithTransition(router, localizePath("/", locale));
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/subscription", { cache: "no-store" });
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
    return (
      <InvitePageShell
        title={t("subscription.title")}
        lang={locale}
        actionsClassName="invite-page-actions--raise invite-page-actions--side"
        contentClassName="invite-page-content--subscription invite-page-content--lower"
        actions={
          <button type="button" className="back-arrow-btn" onClick={handleBack} aria-label={backLabel}>
            <span className="back-arrow-circle" />
            <span className="sr-only">{backLabel}</span>
          </button>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-left text-[0.98rem] opacity-80" aria-live="polite">
            {t("subscription.loading")}
          </p>
        </div>
      </InvitePageShell>
    );
  }
  return (
    <InvitePageShell
      title={t("subscription.title")}
      lang={locale}
      actionsClassName="invite-page-actions--raise invite-page-actions--side"
      contentClassName="invite-page-content--subscription invite-page-content--lower"
      actions={
        <button type="button" className="back-arrow-btn" onClick={handleBack} aria-label={backLabel}>
          <span className="back-arrow-circle" />
          <span className="sr-only">{backLabel}</span>
        </button>
      }
    >
      <div className="flex flex-col gap-4">
        {subActive ? (
          <>
            <p className="text-left text-[0.98rem] opacity-80">{t("subscription.active.summary")}</p>
            <p className="text-left text-[0.98rem] opacity-80" id="cancel-note">
              <RichText value={t("subscription.active.cancel_note")} replacements={emailReplacement} />
            </p>
            <div className="mt-[0.65rem] flex justify-center">
              <Link href={localizePath(returnToProfile ? "/vestlus?profile=1" : "/profiil", locale)}>
                <Button as="a" variant="primary" className="min-w-[9.5rem]" aria-describedby="cancel-note">
                  {t("subscription.button.open_profile")}
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <>
            <div id="billing-info">
              <RichText
                as="div"
                className="text-left text-[clamp(1.02rem,1.7vw,1.22rem)] leading-[1.5] opacity-80"
                value={t("subscription.info")}
                replacements={emailReplacement}
              />
            </div>
            {error && (
              <p role="alert" aria-live="assertive" className="text-left text-[color:#fca5a5]">
                {error}
              </p>
            )}
            <div className="mt-[0.65rem] flex justify-center">
              <Button
                type="button"
                variant="primary"
                className="min-w-[9.5rem]"
                disabled={processing}
                aria-disabled={processing}
                aria-busy={processing}
                aria-describedby="billing-info cancel-note"
                onClick={handleActivate}
              >
                {processing ? t("subscription.button.processing") : t("subscription.button.activate")}
              </Button>
            </div>
          </>
        )}
      </div>
    </InvitePageShell>
  );
}
