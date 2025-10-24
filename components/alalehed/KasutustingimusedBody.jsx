"use client";
import { Fragment } from "react";
import { useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";

export default function KasutustingimusedBody() {
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();

  const renderRich = (key, overrides = {}) => {
    let pIndex = 0;
    let liIndex = 0;
    return t.rich(key, {
      p: (chunks) => {
        const idx = pIndex++;
        return (
          <p key={`${key}-p-${idx}`} className="mb-4">
            {chunks}
          </p>
        );
      },
      strong: (chunks) => <strong>{chunks}</strong>,
      li: (chunks) => {
        const idx = liIndex++;
        return (
          <li key={`${key}-li-${idx}`}>
            {chunks}
          </li>
        );
      },
      aEmail: (chunks) => (
        <a
          key={`${key}-email`}
          href="mailto:info@sotsiaal.ai"
          className="link-brand"
        >
          {chunks}
        </a>
      ),
      ...overrides,
    });
  };

  const renderRichBlock = (key) => (
    <Fragment key={key}>{renderRich(key)}</Fragment>
  );

  return (
    <div className="main-content glass-box" lang={locale}>
      <h1 className="glass-title">{t("legal.terms.title")}</h1>

      <section className="glass-section">
        <h2 className="glass-h2">{t("legal.terms.section1.heading")}</h2>
        {renderRichBlock("legal.terms.section1.body")}

        <h2 className="glass-h2">{t("legal.terms.section2.heading")}</h2>
        {renderRichBlock("legal.terms.section2.body")}

        <h2 className="glass-h2">{t("legal.terms.section3.heading")}</h2>
        <ul className="glass-list">{renderRich("legal.terms.section3.items")}</ul>

        <h2 className="glass-h2">{t("legal.terms.section4.heading")}</h2>
        <ul className="glass-list">{renderRich("legal.terms.section4.items")}</ul>

        <h2 className="glass-h2">{t("legal.terms.section5.heading")}</h2>
        {renderRichBlock("legal.terms.section5.paragraph1")}
        {renderRichBlock("legal.terms.section5.paragraph2")}

        <h2 className="glass-h2">{t("legal.terms.section6.heading")}</h2>
        {renderRichBlock("legal.terms.section6.body")}

        <h2 className="glass-h2">{t("legal.terms.section7.heading")}</h2>
        {renderRichBlock("legal.terms.section7.body")}

        <h2 className="glass-h2">{t("legal.terms.section8.heading")}</h2>
        {renderRichBlock("legal.terms.section8.body")}

        <h2 className="glass-h2">{t("legal.terms.section9.heading")}</h2>
        {renderRichBlock("legal.terms.section9.paragraph1")}
        {renderRichBlock("legal.terms.section9.paragraph2")}
      </section>

      <div className="back-btn-wrapper">
        <button
          type="button"
          className="back-arrow-btn"
          onClick={() =>
            window.history.length > 1 ? router.back() : router.push("/meist")
          }
          aria-label={t("legal.common.back")}
        >
          <span className="back-arrow-circle" />
        </button>
      </div>

      <footer className="alaleht-footer">SotsiaalAI &copy; 2025</footer>
    </div>
  );
}
