// app/error.jsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";
import { localizePath } from "@/lib/localizePath";

export default function Error({ error, reset }) {
  const router = useRouter();
  const { t, locale } = useI18n();

  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="main-content glass-box" style={{ textAlign: "center" }}>
      <h1 className="glass-title">{t("errors.title")}</h1>
      <p style={{ marginTop: "0.8em", marginBottom: "1.4em", fontSize: "1.2em" }}>
        {t("errors.description")}
      </p>

      <div style={{ display: "flex", justifyContent: "center", gap: "1.2em" }}>
        <button type="button" className="btn-primary" onClick={() => reset()}>
          {t("errors.retry")}
        </button>

        <div className="chat-back-btn-wrapper" style={{ margin: 0 }}>
          <button
            type="button"
            className="back-arrow-btn"
            onClick={() => {
              try {
                if (typeof window !== "undefined" && window.history.length > 1) return router.back();
              } catch {}
              return router.push(localizePath("/", locale));
            }}
            aria-label={t("buttons.back_home")}
          >
            <span className="back-arrow-circle" />
          </button>
        </div>
      </div>
    </div>
  );
}
