"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

export default function Error({ error, reset }) {
  const router = useRouter();
  const t = useTranslations("error");
  const common = useTranslations("common");

  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="main-content glass-box" style={{ textAlign: "center" }}>
      <h1 className="glass-title">{t("title")}</h1>
      <p style={{ marginTop: "0.8em", marginBottom: "1.4em", fontSize: "1.2em" }}>
        {t("description")}
      </p>

      <div style={{ display: "flex", justifyContent: "center", gap: "1.2em" }}>
        <button type="button" className="btn-primary" onClick={() => reset()}>
          {t("retry")}
        </button>

        <div className="chat-back-btn-wrapper" style={{ margin: 0 }}>
          <button
            type="button"
            className="back-arrow-btn"
            onClick={() => router.push("/")}
            aria-label={common("back_home")}
          >
            <span className="back-arrow-circle" />
          </button>
        </div>
      </div>
    </div>
  );
}
