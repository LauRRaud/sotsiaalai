"use client";
import { Fragment } from "react";
import { useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";

export default function PrivaatsusBody() {
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();

  const createRichRenderer = (key) => {
    let pIndex = 0;
    let liIndex = 0;
    return {
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
      aLawEst: (chunks) => (
        <a
          key={`${key}-law`}
          href="https://www.riigiteataja.ee/akt/112072025014"
          className="link-brand"
          target="_blank"
          rel="noopener noreferrer"
        >
          {chunks}
        </a>
      ),
      aGdpr: (chunks) => (
        <a
          key={`${key}-gdpr`}
          href="https://eur-lex.europa.eu/legal-content/ET/TXT/HTML/?uri=CELEX:02016R0679-20160504"
          className="link-brand"
          target="_blank"
          rel="noopener noreferrer"
        >
          {chunks}
        </a>
      ),
      aDpa: (chunks) => (
        <a
          key={`${key}-dpa`}
          href="https://www.aki.ee"
          className="link-brand"
          target="_blank"
          rel="noopener noreferrer"
        >
          {chunks}
        </a>
      ),
    };
  };

  const renderRich = (key) => t.rich(key, createRichRenderer(key));
  const renderRichBlock = (key) => <Fragment key={key}>{renderRich(key)}</Fragment>;

  return (
    <div
      className="main-content glass-box"
      role="main"
      aria-labelledby="privacy-title"
      lang={locale}
    >
      <h1 id="privacy-title" className="glass-title">
        {t("legal.privacy.title")}
      </h1>

      <section className="glass-section">
        <h2 className="glass-h2">{t("legal.privacy.section1.heading")}</h2>
        {renderRichBlock("legal.privacy.section1.paragraph1")}
        {renderRichBlock("legal.privacy.section1.paragraph2")}

        <h2 className="glass-h2">{t("legal.privacy.section2.heading")}</h2>
        {renderRichBlock("legal.privacy.section2.paragraph1")}
        {renderRichBlock("legal.privacy.section2.paragraph2")}
        {renderRichBlock("legal.privacy.section2.paragraph3")}

        <h2 className="glass-h2">{t("legal.privacy.section3.heading")}</h2>
        <ul className="glass-list">{renderRich("legal.privacy.section3.items")}</ul>

        <h2 className="glass-h2">{t("legal.privacy.section4.heading")}</h2>
        {renderRichBlock("legal.privacy.section4.body")}

        <h2 className="glass-h2">{t("legal.privacy.section5.heading")}</h2>
        {renderRichBlock("legal.privacy.section5.body")}

        <h2 className="glass-h2">{t("legal.privacy.section6.heading")}</h2>
        {renderRichBlock("legal.privacy.section6.body")}

        <h2 className="glass-h2">{t("legal.privacy.section7.heading")}</h2>
        {renderRichBlock("legal.privacy.section7.body")}

        <h2 className="glass-h2">{t("legal.privacy.section8.heading")}</h2>
        <ul className="glass-list">{renderRich("legal.privacy.section8.items")}</ul>

        <h2 className="glass-h2">{t("legal.privacy.section9.heading")}</h2>
        {renderRichBlock("legal.privacy.section9.body")}

        <h2 className="glass-h2">{t("legal.privacy.section10.heading")}</h2>
        {renderRichBlock("legal.privacy.section10.body")}

        <h2 className="glass-h2">{t("legal.privacy.section11.heading")}</h2>
        {renderRichBlock("legal.privacy.section11.body")}
      </section>

      <div className="back-btn-wrapper">
        <button
          type="button"
          className="back-arrow-btn"
          onClick={() => {
            if (typeof window !== "undefined" && window.history.length > 1) {
              router.back();
            } else {
              router.push("/meist");
            }
          }}
          aria-label={t("legal.common.back_to_previous")}
        >
          <span className="back-arrow-circle"></span>
        </button>
      </div>

      <footer className="alaleht-footer">SotsiaalAI &copy; 2025</footer>
    </div>
  );
}
