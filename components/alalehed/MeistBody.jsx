import { Fragment } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import InstallPromptGlass from "@/components/InstallPromptGlass";

const INTRO_KEYS = [
  "intro.paragraph1",
  "intro.paragraph2",
  "intro.paragraph3",
  "intro.paragraph4",
  "intro.paragraph5",
];

export default function MeistBody({ isAdmin = false }) {
  const t = useTranslations("about");
  const locale = useLocale();

  let pIndex = 0;
  const richMap = {
    p: (chunks) => {
      const idx = pIndex++;
      return (
        <p key={`intro-${idx}`} className="mb-4">
          {chunks}
        </p>
      );
    },
    strong: (chunks) => <strong>{chunks}</strong>,
    oska: (chunks) => (
      <a
        href="https://uuringud.oska.kutsekoda.ee/uuringud/sotsiaaltoo-seirearuande"
        className="meist-external-link"
        target="_blank"
        rel="noopener noreferrer"
      >
        {chunks}
      </a>
    ),
  };

  return (
    <div
      className="main-content glass-box glass-left"
      role="main"
      aria-labelledby="about-title"
      lang={locale}
    >
      <h1 id="about-title" className="glass-title">
        {t("title")}
      </h1>

      <section className="glass-section">
        {INTRO_KEYS.map((key) => (
          <Fragment key={key}>{t.rich(key, richMap)}</Fragment>
        ))}
      </section>

      <section className="glass-section">
        <h2 className="glass-h2">{t("contact.title")}</h2>
        <p className="epost-row">
          <b>{t("contact.email_label")}:</b>{" "}
          <a href="mailto:info@sotsiaal.ai" className="link-brand">
            info@sotsiaal.ai
          </a>
        </p>
      </section>

      <section className="glass-section">
        <p>
          <strong>{t("cta.title")}</strong>
        </p>
        <ul className="glass-list">
          <li>
            <Link href="/privaatsustingimused" className="link-brand">
              {t("links.privacy")}
            </Link>
          </li>
          <li>
            <Link href="/kasutustingimused" className="link-brand">
              {t("links.terms")}
            </Link>
          </li>
          <InstallPromptGlass
            linkLabel={t("links.install")}
            title={t("install_prompt.title")}
            body={t("install_prompt.body")}
            yes={t("install_prompt.yes")}
            no={t("install_prompt.no")}
            help={t("install_prompt.help")}
          />
          {isAdmin ? (
            <li>
              <Link href="/admin/rag" className="link-brand">
                {t("links.admin")}
              </Link>
            </li>
          ) : null}
        </ul>
      </section>

      <div className="back-btn-wrapper">
        <Link
          href="/"
          className="back-arrow-btn"
          aria-label={t("links.back_home")}
        >
          <span className="back-arrow-circle" />
        </Link>
      </div>

      <footer className="alaleht-footer">{t("footer.note")}</footer>
    </div>
  );
}
