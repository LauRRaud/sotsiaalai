"use client";
import Link from "next/link";
import InstallAppLink from "@/components/pwa/InstallAppLink";
import { useI18n } from "@/components/i18n/I18nProvider";
import RichText from "@/components/i18n/RichText";

export default function MeistBody({ isAdmin = false }) {
  const { t, locale } = useI18n();
  const introParagraphs = [
    { key: "p1", value: t("about.intro.paragraph1") },
    { key: "p2", value: t("about.intro.paragraph2") },
    {
      key: "p3",
      value: t("about.intro.paragraph3"),
      replacements: {
        oska: {
          open: '<a href="https://uuringud.oska.kutsekoda.ee/uuringud/sotsiaaltoo-seirearuande" class="meist-external-link" target="_blank" rel="noopener noreferrer">',
          close: "</a>",
        },
      },
    },
    { key: "p4", value: t("about.intro.paragraph4") },
    { key: "p5", value: t("about.intro.paragraph5") },
  ];
  return (
    <div className="main-content glass-box glass-left" role="main" aria-labelledby="meist-title" lang={locale}>
      <h1 id="meist-title" className="glass-title">{t("about.title")}</h1>
      <section className="glass-section">
        {introParagraphs.map(({ key, value, replacements }) => (
          <RichText key={key} as="div" value={value} replacements={replacements} />
        ))}
      </section>
      <section className="glass-section">
        <h2 className="glass-h2">{t("about.contact.title")}</h2>
        <p className="epost-row">
          <b>{t("about.contact.email_label")}</b>{" "}
          <a href="mailto:info@sotsiaal.ai" className="link-brand">
            {t("about.contact.email_value")}
          </a>
        </p>
      </section>
      <section className="glass-section">
        <p><strong>{t("about.cta.title")}</strong></p>
        <ul className="glass-list glass-list--compact">
          <li>
            <Link href="/kasutusjuhend" className="link-brand">
              {t("about.guide.jump_link")}
            </Link>
          </li>
          <li>
            <Link href="/privaatsustingimused" className="link-brand">
              {t("about.links.privacy")}
            </Link>
          </li>
          <li>
            <Link href="/kasutustingimused" className="link-brand">
              {t("about.links.terms")}
            </Link>
          </li>
          {isAdmin ? (
            <li>
              <Link href="/admin/rag" className="link-brand">
                {t("about.links.admin")}
              </Link>
            </li>
          ) : null}
        </ul>
      </section>
      <InstallAppLink variant="section" />
      <div className="back-btn-wrapper">
        <Link href="/" className="back-arrow-btn" aria-label={t("buttons.back_home")}>
          <span className="back-arrow-circle" />
        </Link>
      </div>
      <footer className="alaleht-footer">{t("about.footer.note")}</footer>
    </div>
  );
}
