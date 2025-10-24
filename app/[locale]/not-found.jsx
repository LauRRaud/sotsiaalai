// app/[locale]/not-found.jsx
"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

export default function NotFound() {
  const router = useRouter();
  const t = useTranslations("notFound");
  const common = useTranslations("common");

  return (
    <div className="main-content glass-box" style={{ textAlign: "center" }}>
      <h1 className="glass-title">{t("title")}</h1>
      <p style={{ marginTop: "0.8em", marginBottom: "1.4em", fontSize: "1.2em" }}>
        {t("description")}
      </p>

      <div className="chat-back-btn-wrapper">
        <button
          type="button"
          className="back-arrow-btn"
          onClick={() => router.push(`/${router.locale}`)}
          aria-label={common("back_home")}
        >
          <span className="back-arrow-circle" />
        </button>
      </div>
    </div>
  );
}
