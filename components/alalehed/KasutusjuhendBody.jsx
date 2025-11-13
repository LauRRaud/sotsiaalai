"use client";
import Link from "next/link";
import InstallAppLink from "@/components/pwa/InstallAppLink";
import { useI18n } from "@/components/i18n/I18nProvider";
import { useAccessibility } from "@/components/accessibility/AccessibilityProvider";

const SECTION_KEYS = [
  "accessibility",
  "home",
  "register",
  "signin",
  "chat",
  "profile",
  "about",
  "quickstart",
];

export default function KasutusjuhendBody() {
  const { t, locale } = useI18n();
  const { openModal: openA11y } = useAccessibility();
  const handleA11yClick = (e) => {
    let node = e.target;
    let anchor = null;
    while (node && node !== e.currentTarget) {
      if (node.matches && node.matches('a[data-a11y-open]')) { anchor = node; break; }
      node = node.parentElement;
    }
    if (anchor) { e.preventDefault(); openA11y(); }
  };
  const guideSections = SECTION_KEYS.map((key) => ({
    key,
    title: t(`about.guide.sections_v2.${key}.title`),
    body: t(`about.guide.sections_v2.${key}.body`),
  }));
  return (
   <div className="main-content glass-box glass-left" role="main" aria-labelledby="kasutusjuhend-title" lang={locale}>
      <h1 id="kasutusjuhend-title" className="glass-title">{t("about.guide.title")}</h1>
      <section className="glass-section">
        <p className="glass-lead" style={{ marginBottom: "1.5rem" }}>
          {t("about.guide.intro")}
        </p>
      </section>
      <section className="glass-section">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            color: "rgba(235, 238, 248, 0.85)",
          }}
        >
          {guideSections.map(({ key, title, body }) => (
            <article
              key={key}
              onClick={key === "accessibility" ? handleA11yClick : undefined}
              className="guide-card"
              aria-label={title}
              style={{
                background: "rgba(12, 19, 35, 0.5)",
                borderRadius: 14,
                border: "1px solid rgba(255, 255, 255, 0.08)",
                padding: "0.9rem 1rem",
                boxShadow: "0 8px 20px rgba(4, 7, 15, 0.25)",
                color: "rgba(235, 238, 248, 0.9)",
              }}
            >
              <h2
                className="glass-h3"
                style={{
                  marginBottom: "0.5rem",
                  color: "var(--link-gold)",
                  fontSize: "1.25rem",
                  fontFamily: "var(--font-inter, Arial, sans-serif)",
                  fontWeight: 500,
                }}
              >
                {title}
              </h2>
              <div className="guide-content" dangerouslySetInnerHTML={{ __html: body }} />
            </article>
          ))}
        </div>
      </section>
      <InstallAppLink variant="section" />
      <div className="back-btn-wrapper">
        <Link href="/meist" className="back-arrow-btn" aria-label={t("buttons.back_previous")}>
          <span className="back-arrow-circle" />
        </Link>
      </div>
      <footer className="alaleht-footer">{t("about.footer.note")}</footer>
    </div>
  );
}



