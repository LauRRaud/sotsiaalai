"use client";
import Link from "next/link";
import InstallAppLink from "@/components/pwa/InstallAppLink";
import { useI18n } from "@/components/i18n/I18nProvider";
import RichText from "@/components/i18n/RichText";
import { localizePath } from "@/lib/localizePath";

/**
 * MeistBody
 * - Default (embedded=false): full /meist page (existing behavior)
 * - Embedded (embedded=true): lightweight section content for homepage
 */
export default function MeistBody({ isAdmin = false, embedded = false }) {
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

  // Homepage embed: no glass-box, no CTA/back button/footer
  if (embedded) {
    const embeddedParagraphs = introParagraphs
      .filter(({ key }) => key !== "p4" && key !== "p5")
      .map((paragraph) => {
        if (paragraph.key !== "p3") return paragraph;
        return {
          ...paragraph,
          replacements: {
            oska: {
              open: '<a href="https://uuringud.oska.kutsekoda.ee/uuringud/sotsiaaltoo-seirearuande" class="link-brand home-link" target="_blank" rel="noopener noreferrer">',
              close: "</a>",
            },
          },
        };
      });
    const paragraph3 = embeddedParagraphs.find(({ key }) => key === "p3");
    return (
      <div className="home-about-content" role="region" aria-labelledby="home-about-title" lang={locale}>
        <h2
          id="home-about-title"
          className="text-center text-[clamp(1.9rem,3.9vw,2.6rem)] font-[var(--font-aino-headline),var(--font-aino),Arial,sans-serif] font-medium tracking-[0.02em] mt-0 mb-[1.1rem] [color:var(--pt-100,#ecebe9)]"
        >
          {t("about.title")}
        </h2>

        <div className="text-center text-[clamp(1.1rem,1.5vw,1.22rem)] leading-[1.7] space-y-[0.95rem] [color:var(--home-prose-color)] [text-shadow:0_1px_18px_rgba(0,0,0,0.35)]">
          {embeddedParagraphs.filter(({ key }) => key !== "p3").map(({ key, value, replacements }) => (
            <RichText key={key} as="div" value={value} replacements={replacements} />
          ))}
          {paragraph3 ? <RichText key={paragraph3.key} as="div" value={paragraph3.value} replacements={paragraph3.replacements} /> : null}
        </div>
      </div>
    );
  }

  // Full page (existing)
  return (
    <div className="main-content glass-box glass-left meist-body" role="region" aria-labelledby="meist-title" lang={locale}>
      <h1 id="meist-title" className="glass-title">
        {t("about.title")}
      </h1>

      <section className="glass-section">
        {introParagraphs.map(({ key, value, replacements }) => (
          <RichText key={key} as="div" value={value} replacements={replacements} />
        ))}
      </section>

      <section className="glass-section">
        <p className="flex flex-wrap items-center gap-[0.2em] tracking-[0.03em] text-[color:var(--pt-150)]">
          <strong>{t("about.contact.title")}:</strong>{" "}
          <a href="mailto:info@sotsiaal.ai" className="link-brand">
            {t("about.contact.email_value")}
          </a>
        </p>
      </section>

      <section className="glass-section">
        <p>
          <strong>{t("about.cta.title")}</strong>
        </p>
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
            <>
              <li>
                <Link href="/admin/analytics" className="link-brand">
                  {t("about.links.analytics")}
                </Link>
              </li>
              <li>
                <Link href="/admin/rag" className="link-brand">
                  {t("about.links.admin")}
                </Link>
              </li>
            </>
          ) : null}
        </ul>
      </section>

      <InstallAppLink variant="section" />

      <div className="back-btn-wrapper back-btn-wrapper--side">
        <Link href={localizePath("/", locale)} className="back-arrow-btn" aria-label={t("buttons.back_home")}>
          <span className="back-arrow-circle" />
        </Link>
      </div>

      <footer className="alaleht-footer">{t("about.footer.note")}</footer>
    </div>
  );
}
