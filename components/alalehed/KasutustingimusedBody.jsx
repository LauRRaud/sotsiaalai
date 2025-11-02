"use client";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";
import RichText from "@/components/i18n/RichText";
import { localizePath } from "@/lib/localizePath";
const emailReplacement = {
  aEmail: {
    open: '<a class="link-brand" href="mailto:info@sotsiaal.ai">',
    close: "</a>",
  },
};
export default function KasutustingimusedBody() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const sections = [
    {
      heading: t("terms.section1.heading"),
      content: [{ value: t("terms.section1.body") }],
    },
    {
      heading: t("terms.section2.heading"),
      content: [{ value: t("terms.section2.body") }],
    },
    {
      heading: t("terms.section3.heading"),
      content: [{ value: t("terms.section3.items"), type: "list" }],
    },
    {
      heading: t("terms.section4.heading"),
      content: [{ value: t("terms.section4.items"), type: "list" }],
    },
    {
      heading: t("terms.section5.heading"),
      content: [
        { value: t("terms.section5.paragraph1") },
        { value: t("terms.section5.paragraph2"), replacements: emailReplacement },
      ],
    },
    {
      heading: t("terms.section6.heading"),
      content: [{ value: t("terms.section6.body") }],
    },
    {
      heading: t("terms.section7.heading"),
      content: [{ value: t("terms.section7.body") }],
    },
    {
      heading: t("terms.section8.heading"),
      content: [{ value: t("terms.section8.body") }],
    },
    {
      heading: t("terms.section9.heading"),
      content: [
        { value: t("terms.section9.paragraph1") },
        { value: t("terms.section9.paragraph2") },
      ],
    },
  ];
  return (
    <article className="main-content glass-box" aria-labelledby="terms-title" lang={locale}>
      <h1 id="terms-title" className="glass-title">{t("terms.title")}</h1>
      <section className="glass-section">
        {sections.map((section) => (
          <div key={section.heading}>
            <h2 className="glass-h2">{section.heading}</h2>
            {section.content.map((item, idx) =>
              item.type === "list" ? (
                <RichText key={`${section.heading}-list-${idx}`} as="ul" className="glass-list" value={item.value} />
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
          onClick={() =>
            typeof window !== "undefined" && window.history.length > 1
              ? router.back()
              : router.push(localizePath("/meist", locale))
          }
          aria-label={t("buttons.back_previous")}
        >
          <span className="back-arrow-circle" />
        </button>
      </div>
      <footer className="alaleht-footer">{t("about.footer.note")}</footer>
    </article>
  );
}
