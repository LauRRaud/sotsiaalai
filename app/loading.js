"use client";

import { useI18n } from "@/components/i18n/I18nProvider";

export default function Loading() {
  const { t } = useI18n();
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      style={{
        minHeight: "100dvh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--page-bg)",
        backgroundImage: "linear-gradient(180deg, var(--page-bg-top) 0%, var(--page-bg-bottom) 100%)",
      }}
    >
      <span style={{ opacity: 0.75, color: "var(--text-main, #e5e7eb)" }}>
        {t("invite.loading")}
      </span>
    </div>
  );
}
