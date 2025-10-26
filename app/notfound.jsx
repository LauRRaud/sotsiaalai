// app/not-found.jsx
"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";
import { localizePath } from "@/lib/localizePath";

export default function NotFound() {
  const router = useRouter();
  const { t, locale } = useI18n();

  return (
    <div className="main-content glass-box" style={{ textAlign: "center" }}>
      <h1 className="glass-title">{t("notFound.title")}</h1>
      <p style={{ marginTop: "0.8em", marginBottom: "1.4em", fontSize: "1.2em" }}>
        {t("notFound.description")}
      </p>

      <div className="chat-back-btn-wrapper">
        <button
          type="button"
          className="back-arrow-btn"
          onClick={() => router.push(localizePath("/", locale))}
          aria-label={t("buttons.back_home")}
        >
          <span className="back-arrow-circle" />
        </button>
      </div>
    </div>
  );
}
