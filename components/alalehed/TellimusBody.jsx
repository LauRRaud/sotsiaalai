"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/components/i18n/I18nProvider";
import RichText from "@/components/i18n/RichText";
import { localizePath } from "@/lib/localizePath";

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
      router.push(localizePath("/tellimus?status=demo", locale));
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
      <div className="main-content glass-box glass-left tellimus-box" role="main" lang={locale}>
        <h1 className="glass-title">{t("subscription.title")}</h1>
        <div className="content-narrow">
          <p className="glass-text" aria-live="polite">{t("subscription.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content glass-box glass-left tellimus-box" role="main" lang={locale}>
      <h1 className="glass-title">{t("subscription.title")}</h1>

      <div className="content-narrow">
        {subActive ? (
          <>
            <p className="glass-text">{t("subscription.active.summary")}</p>
            <p className="glass-text" id="cancel-note">
              <RichText value={t("subscription.active.cancel_note")} replacements={emailReplacement} />
            </p>

            <div className="tellimus-btn-center">
              <Link href="/profiil" className="btn-primary" aria-describedby="cancel-note">
                {t("subscription.button.open_profile")}
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="glass-note" id="billing-info" style={{ margin: "1rem 0" }}>
              <RichText as="div" className="glass-text" value={t("subscription.info")} replacements={emailReplacement} />
            </div>
            {error && (
              <div role="alert" aria-live="assertive" className="glass-note">
                {error}
              </div>
            )}

            <div className="tellimus-btn-center">
              <button
                type="button"
                className="btn-primary"
                disabled={processing}
                aria-disabled={processing}
                aria-busy={processing}
                aria-describedby="billing-info cancel-note"
                onClick={handleActivate}
              >
                {processing ? t("subscription.button.processing") : t("subscription.button.activate")}
              </button>
            </div>
          </>
        )}
      </div>

      <div className="back-btn-wrapper">
        <button
          type="button"
          className="back-arrow-btn"
          onClick={() =>
            typeof window !== "undefined" && window.history.length > 1
              ? router.back()
              : router.push(localizePath("/", locale))
          }
          aria-label={t("buttons.back_home")}
        >
          <span className="back-arrow-circle" />
        </button>
      </div>

      <footer className="alaleht-footer">{t("about.footer.note")}</footer>
    </div>
  );
}
