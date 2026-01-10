"use client";
import { useRouter } from "next/navigation";
import InstallAppLink from "@/components/pwa/InstallAppLink";
import { useI18n } from "@/components/i18n/I18nProvider";
import { useAccessibility } from "@/components/accessibility/AccessibilityProvider";
import { localizePath } from "@/lib/localizePath";
import { pushWithTransition } from "@/lib/routeTransition";

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
  const router = useRouter();
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
   <div className="main-content glass-box glass-left doc-page" role="region" aria-labelledby="kasutusjuhend-title" lang={locale}>
      <h1 id="kasutusjuhend-title" className="glass-title">{t("about.guide.title")}</h1>
      <section className="glass-section doc-body">
        <p className="glass-lead" style={{ marginBottom: "1.5rem" }}>
          {t("about.guide.intro")}
        </p>
      </section>
      <section className="glass-section doc-body">
        <div className="guide-list flex flex-col gap-4">
          {guideSections.map(({ key, title, body }) => (
            <article
              key={key}
              onClick={key === "accessibility" ? handleA11yClick : undefined}
              className="guide-card rounded-[14px] border border-solid border-[rgba(255,255,255,0.08)] bg-[rgba(12,19,35,0.5)] px-[1rem] py-[0.9rem] text-[rgba(235,238,248,0.9)] shadow-[0_8px_20px_rgba(4,7,15,0.25)] light:border-[var(--glass-border-width)] light:border-[var(--glass-border-color)] light:bg-[color-mix(in_srgb,var(--glass-surface-bg)_92%,rgba(122,58,56,0.08)_8%)] light:text-[var(--glass-surface-text)] light:shadow-[0_0_0_1px_rgba(201,199,194,0.16),0_0.625rem_1.25rem_rgba(5,8,15,0.18)]"
              aria-label={title}
            >
              <h2
                className="glass-h3 doc-section-heading mb-2"
              >
                {title}
              </h2>
              <div
                className="guide-content text-[1.18rem] leading-[1.62] [&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2 [&_ul]:ml-5 [&_ol]:ml-5 [&_ul]:pl-0 [&_ol]:pl-0 [&_li]:my-1"
                dangerouslySetInnerHTML={{ __html: body }}
              />
            </article>
          ))}
        </div>
      </section>
      <InstallAppLink variant="section" />
      <div className="back-btn-wrapper">
        <button
          type="button"
          className="back-arrow-btn"
          onClick={() => {
            if (typeof window !== "undefined" && window.history.length > 1) {
              router.back();
            } else {
              pushWithTransition(router, localizePath("/", locale));
            }
          }}
          aria-label={t("buttons.back_home")}
        >
          <span className="back-arrow-circle" />
        </button>
      </div>
      <footer className="alaleht-footer">{t("about.footer.note")}</footer>
    </div>
  );
}


