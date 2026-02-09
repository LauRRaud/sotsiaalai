"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";
import { useAccessibility } from "@/components/accessibility/AccessibilityProvider";
import BackButton from "@/components/ui/BackButton";
import CloseButton from "@/components/ui/CloseButton";
import GlassRing from "@/components/ui/GlassRing";
import { glassPageBackClassName, glassPageCloseClassName, glassPageRingCenteredClassName, glassPageShellCenteredClassName, glassPageTitleClassName } from "@/components/ui/glassPageStyles";
import { glassPolicyBackButtonClassName, glassPolicyContentClassName, glassPolicyExpandToggleClassName, glassPolicyRingClassName, glassPolicyScrollClassName, glassPolicyTitleOffsetClassName } from "@/components/ui/glassPolicyPageStyles";
import { cn } from "@/components/ui/cn";
import { localizePath } from "@/lib/localizePath";
import { pushWithTransition } from "@/lib/routeTransition";
const pageShellClassName = glassPageShellCenteredClassName;
const titleClassName = glassPageTitleClassName;
const contentClassName = glassPolicyContentClassName;
const scrollClassName = glassPolicyScrollClassName;
const sectionHeadingClassName = "text-[1.3rem] font-semibold tracking-[0.01em] text-[#c57171] light:text-[#7A3A38]";
const bodyTextClassName = "text-[clamp(1.02rem,1.5vw,1.15rem)] leading-[1.7] text-[color:var(--glass-surface-text,#f2f2f2)] light:text-[#2b2620]";
const SECTION_KEYS = ["accessibility", "home", "register", "signin", "chat", "profile", "about", "quickstart"];
export default function KasutusjuhendBody() {
  const [expanded, setExpanded] = useState(false);
  const [isMobilePolicyLayout, setIsMobilePolicyLayout] = useState(false);
  const router = useRouter();
  const {
    t,
    locale
  } = useI18n();
  const {
    prefs,
    openModal: openA11y
  } = useAccessibility();
  const isLightTheme = prefs?.theme === "light";
  const toggleLabel = expanded ? t("buttons.collapse", "Ahenda") : t("buttons.expand", "Laienda");
  const expandIcon = isLightTheme ? "/logo/laienebhele.svg" : "/logo/laienebtume.svg";
  const isExpandedLayout = expanded || isMobilePolicyLayout;
  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(max-width: 48em), (pointer: coarse)");
    const updateLayout = () => setIsMobilePolicyLayout(media.matches);
    updateLayout();
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", updateLayout);
      return () => media.removeEventListener("change", updateLayout);
    }
    media.addListener(updateLayout);
    return () => media.removeListener(updateLayout);
  }, []);
  const handleA11yClick = e => {
    let node = e.target;
    let anchor = null;
    while (node && node !== e.currentTarget) {
      if (node.matches && node.matches("a[data-a11y-open]")) {
        anchor = node;
        break;
      }
      node = node.parentElement;
    }
    if (anchor) {
      e.preventDefault();
      openA11y();
    }
  };
  const guideSections = SECTION_KEYS.map(key => ({
    key,
    title: t(`about.guide.sections_v2.${key}.title`),
    body: t(`about.guide.sections_v2.${key}.body`)
  }));
  return <section className={pageShellClassName} lang={locale}>
      <div className="relative flex flex-col items-center">
        <GlassRing className={cn(glassPageRingCenteredClassName, glassPolicyRingClassName, "policy-mobile-lower", isExpandedLayout ? "glass-ring-expandable--open" : null)} role="region" aria-labelledby="kasutusjuhend-title">
        <CloseButton
          onClick={() => {
            if (typeof window !== "undefined" && window.history.length > 1) {
              router.back();
            } else {
              pushWithTransition(router, localizePath("/", locale));
            }
          }}
          ariaLabel={t("buttons.close")}
          className={glassPageCloseClassName}
        />
        <BackButton
          onClick={() => {
            if (typeof window !== "undefined" && window.history.length > 1) {
              router.back();
            } else {
              pushWithTransition(router, localizePath("/", locale));
            }
          }}
          ariaLabel={t("buttons.back_home")}
          className={cn(glassPageBackClassName, glassPolicyBackButtonClassName)}
        />
        <h1 id="kasutusjuhend-title" className={`${titleClassName} ${glassPolicyTitleOffsetClassName}`}>
          {t("about.guide.short_title", "Kasutusjuhend")}
        </h1>
        <div className={cn(contentClassName, "glass-ring-content", isExpandedLayout ? "glass-ring-content--open" : null)}>
          <div className={cn(scrollClassName, isExpandedLayout ? "glass-ring-scroll--open" : null)} style={{ zIndex: 0 }}>
            <p className={`${bodyTextClassName} mb-[1.2rem]`}>
              {t("about.guide.intro")}
            </p>
            <div className="flex flex-col gap-[1.6rem]">
              {guideSections.map(({
              key,
              title,
              body
            }) => <article key={key} onClick={key === "accessibility" ? handleA11yClick : undefined} aria-label={title}>
                  <h2 className={`${sectionHeadingClassName} mb-2`}>{title}</h2>
                  <div className={`${bodyTextClassName} text-[1.12rem] leading-[1.62] [&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2 [&_ul]:ml-5 [&_ol]:ml-5 [&_ul]:pl-0 [&_ol]:pl-0 [&_li]:my-1`} dangerouslySetInnerHTML={{
                __html: body
              }} />
                </article>)}
            </div>
            <footer className="mt-[1.2rem] text-center text-[1.05rem] text-[color:var(--glass-surface-text,#f2f2f2)] light:text-[#2b2620]">
              {t("about.footer.note")}
            </footer>
          </div>
        </div>
      </GlassRing>
      {!isMobilePolicyLayout ? <button type="button" className={cn(glassPolicyExpandToggleClassName, expanded ? "is-expanded" : null)} onClick={() => setExpanded(prev => !prev)} aria-pressed={expanded} aria-label={toggleLabel} title={toggleLabel}>
          <Image src={expandIcon} alt="" width={56} height={56} className="glass-ring-expand-icon glass-ring-expand-icon--lg" />
        </button> : null}
      </div>
    </section>;
}
