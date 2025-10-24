"use client";

import { useEffect, useState } from "react";
import { useRouter, Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";

export default function TellimusBody() {
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();

  const [loading, setLoading] = useState(true);
  const [subActive, setSubActive] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [processing, setProcessing] = useState(false);

  const errorText =
    error && typeof error === "object"
      ? error.key
        ? t(error.key, error.values)
        : error.message ?? ""
      : error || "";
  const successText =
    success && typeof success === "object"
      ? success.key
        ? t(success.key, success.values)
        : success.message ?? ""
      : success || "";

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/subscription", { cache: "no-store" });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError({
            message: payload?.error || t("subscription.error.load_failed"),
          });
          return;
        }
        setSubActive(payload?.subscription?.status === "active");
      } catch (err) {
        console.error("subscription GET", err);
        setError({ message: t("profile.server_unreachable") });
      } finally {
        setLoading(false);
      }
    })();
  }, [t]);

  async function handleActivate() {
    try {
      setProcessing(true);
      setError(null);
      setSuccess(null);
      window.alert(t("subscription.payment.redirect_demo"));
      router.push("/tellimus?status=demo");
      router.refresh();
    } catch (err) {
      console.error("activate", err);
      setError({ key: "subscription.error.payment_start" });
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <div className="main-content glass-box glass-left tellimus-box" role="main" lang={locale}>
        <h1 className="glass-title">{t("subscription.title")}</h1>
        <div className="content-narrow">
          <p className="glass-text" aria-live="polite">
            {t("subscription.loading")}
          </p>
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
              {t.rich("subscription.active.cancel_note", {
                email: (chunks) => (
                  <a
                    key="subscription-email"
                    href="mailto:info@sotsiaal.ai"
                    className="link-brand"
                  >
                    {chunks}
                  </a>
                ),
              })}
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
              <p className="glass-text" style={{ margin: 0 }}>
                {t("subscription.info")}
              </p>
            </div>
            {errorText && (
              <div role="alert" aria-live="assertive" className="glass-note">
                {errorText}
              </div>
            )}
            {successText && !errorText && (
              <div role="status" aria-live="polite" className="glass-note glass-note--success">
                {successText}
              </div>
            )}

            <div className="tellimus-btn-center">
              <button
                type="button"
                className="btn-primary"
                disabled={processing}
                aria-disabled={processing}
                aria-busy={processing}
                aria-describedby="billing-info"
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
          onClick={() => router.push("/")}
          aria-label={t("common.back_home")}
        >
          <span className="back-arrow-circle" />
        </button>
      </div>

      <footer className="alaleht-footer">SotsiaalAI © 2025</footer>
    </div>
  );
}
