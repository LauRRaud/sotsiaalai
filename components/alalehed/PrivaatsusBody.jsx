"use client";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";
import RichText from "@/components/i18n/RichText";
import { localizePath } from "@/lib/localizePath";

const lawLinkReplacements = {
  aLawEst: {
    open: '<a class="link-brand" href="https://www.riigiteataja.ee/akt/112072025014" target="_blank" rel="noopener noreferrer">',
    close: "</a>",
  },
  aGdpr: {
    open: '<a class="link-brand" href="https://eur-lex.europa.eu/legal-content/ET/TXT/HTML/?uri=CELEX:02016R0679-20160504" target="_blank" rel="noopener noreferrer">',
    close: "</a>",
  },
  aDpa: {
    open: '<a class="link-brand" href="https://www.aki.ee" target="_blank" rel="noopener noreferrer">',
    close: "</a>",
  },
};

export default function PrivaatsusBody() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const sections = [
    {
      heading: t("privacy.section1.heading"),
      content: [
        { value: t("privacy.section1.paragraph1") },
        { value: t("privacy.section1.paragraph2"), replacements: lawLinkReplacements },
      ],
    },
    {
      heading: t("privacy.section2.heading"),
      content: [
        { value: t("privacy.section2.paragraph1") },
        { value: t("privacy.section2.paragraph2") },
        { value: t("privacy.section2.paragraph3") },
      ],
    },
    {
      heading: t("privacy.section3.heading"),
      content: [{ value: t("privacy.section3.items"), type: "list" }],
    },
    {
      heading: t("privacy.section4.heading"),
      content: [{ value: t("privacy.section4.body") }],
    },
    {
      heading: t("privacy.section5.heading"),
      content: [{ value: t("privacy.section5.body") }],
    },
    {
      heading: t("privacy.section6.heading"),
      content: [{ value: t("privacy.section6.body") }],
    },
    {
      heading: t("privacy.section7.heading"),
      content: [{ value: t("privacy.section7.body") }],
    },
    {
      heading: t("privacy.section8.heading"),
      content: [{ value: t("privacy.section8.items"), type: "list", replacements: lawLinkReplacements }],
    },
    {
      heading: t("privacy.section9.heading"),
      content: [{ value: t("privacy.section9.body") }],
    },
    {
      heading: t("privacy.section10.heading"),
      content: [{ value: t("privacy.section10.body") }],
    },
    {
      heading: t("privacy.section11.heading"),
      content: [{ value: t("privacy.section11.body") }],
    },
  ];

  return (
    <article className="main-content glass-box" aria-labelledby="privacy-title" lang={locale}>
      <h1 id="privacy-title" className="glass-title">
        {t("privacy.title")}
      </h1>

      <section className="glass-section">
        {sections.map((section) => (
          <div key={section.heading}>
            <h2 className="glass-h2">{section.heading}</h2>
            {section.content.map((item, idx) =>
              item.type === "list" ? (
                <RichText
                  key={`${section.heading}-list-${idx}`}
                  as="ul"
                  className="glass-list"
                  value={item.value}
                  replacements={item.replacements || lawLinkReplacements}
                />
              ) : (
                <RichText
                  key={`${section.heading}-p-${idx}`}
                  as="div"
                  value={item.value}
                  replacements={item.replacements || {}}
                />
              ),
            )}
          </div>
        ))}
      </section>

      <div className="back-btn-wrapper">
        <button
          type="button"
          className="back-arrow-btn"
          onClick={() => {
            if (typeof window !== "undefined" && window.history.length > 1) {
              router.back();
            } else {
              router.push(localizePath("/meist", locale));
            }
          }}
          aria-label={t("buttons.back_previous")}
        >
          <span className="back-arrow-circle"></span>
        </button>
      </div>

      <footer className="alaleht-footer">{t("about.footer.note")}</footer>
    </article>
  );
}
