"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";
import { useAccessibility } from "@/components/accessibility/AccessibilityProvider";
import BackButton from "@/components/ui/BackButton";
import CloseButton from "@/components/ui/CloseButton";
import GlassRing from "@/components/ui/GlassRing";
import FocusModeToggleIcon from "@/components/ui/icons/FocusModeToggleIcon";
import { glassPageBackMobileBottomCenterClassName, glassPageCloseClassName, glassPageRingCenteredClassName, glassPageShellCenteredClassName, glassPageTitleClassName } from "@/components/ui/glassPageStyles";
import { glassPolicyBackButtonClassName, glassPolicyContentClassName, glassPolicyExpandToggleClassName, glassPolicyRingClassName, glassPolicyScrollClassName, glassPolicyTitleOffsetClassName } from "@/components/ui/glassPolicyPageStyles";
import { cn } from "@/components/ui/cn";
import { localizePath } from "@/lib/localizePath";
import { localizeInternalHtmlLinks } from "@/lib/localizeHtmlLinks";
import { getFooterNote } from "@/lib/footerNote";
import { backWithTransition, pushWithTransition } from "@/lib/routeTransition";
import { etGuideContent } from "@/components/alalehed/guideContentEt";
const pageShellClassName = glassPageShellCenteredClassName;
const titleClassName = glassPageTitleClassName;
const contentClassName = glassPolicyContentClassName;
const scrollClassName = glassPolicyScrollClassName;
const sectionHeadingClassName = "text-[clamp(1.32rem,1.75vw,1.5rem)] max-[48em]:text-[clamp(1.62rem,5.7vw,1.9rem)] font-semibold tracking-[0.013em] max-[48em]:tracking-[0.018em] text-[#cd8585] light:text-[#8a4b49]";
const bodyTextClassName = "text-[clamp(1.06rem,1.45vw,1.18rem)] max-[48em]:text-[clamp(1.22rem,4.55vw,1.38rem)] tracking-[0.013em] max-[48em]:tracking-[0.018em] leading-[1.74] text-[#e4dde0] light:text-[#3f3730]";
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
  const isLightTheme = prefs?.theme === "light" || prefs?.theme === "light-mono" || prefs?.theme === "mid";
  const toggleLabel = expanded ? t("buttons.collapse") : t("buttons.expand");
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
  const guideContent = locale === "et" ? {
    intro: etGuideContent.intro,
    sections: etGuideContent.sections.map(section => ({
      ...section,
      body: localizeInternalHtmlLinks(section.body, locale)
    }))
  } : {
    intro: t("about.guide.intro"),
    sections: SECTION_KEYS.map(key => ({
      key,
      title: t(`about.guide.sections_v2.${key}.title`),
      body: localizeInternalHtmlLinks(t(`about.guide.sections_v2.${key}.body`), locale)
    }))
  };
  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      backWithTransition(router, {
        glassRingTilt: "left",
        waitForGlassRingTilt: true,
        persistGlassRingTilt: false
      });
      return;
    }
    pushWithTransition(router, localizePath("/", locale), {
      glassRingTilt: "left",
      waitForGlassRingTilt: true,
      persistGlassRingTilt: false
    });
  };
  return <section className={pageShellClassName} lang={locale}>
      <div className="relative flex flex-col items-center">
        <GlassRing className={cn(glassPageRingCenteredClassName, "glass-ring--desktop-stable", glassPolicyRingClassName, "policy-mobile-lower", isExpandedLayout ? "glass-ring-expandable--open" : null)} role="region" aria-labelledby="kasutusjuhend-title">
        <CloseButton
          onClick={handleBack}
          ariaLabel={t("buttons.close")}
          className={cn(glassPageCloseClassName, "max-[48em]:hidden")}
        />
        <BackButton
          onClick={handleBack}
          ariaLabel={t("buttons.back_home")}
          className={cn(glassPolicyBackButtonClassName, glassPageBackMobileBottomCenterClassName)}
          iconClassName="group-hover:!scale-[1.12] group-focus-visible:!scale-[1.12]"
        />
        <h1 id="kasutusjuhend-title" className={`${titleClassName} ${glassPolicyTitleOffsetClassName}`}>
          {t("about.guide.short_title")}
        </h1>
        <div className={cn(contentClassName, "glass-ring-content", isExpandedLayout ? "glass-ring-content--open" : null)}>
          <div className={cn(
            scrollClassName,
            !isExpandedLayout ? "pb-[4.2rem] max-[48em]:pb-[4.8rem]" : null,
            isExpandedLayout ? "glass-ring-scroll--open" : null
          )} style={{ zIndex: 0 }}>
            <p className={`${bodyTextClassName} mb-[1.2rem]`}>
              {guideContent.intro}
            </p>
            <div className="flex flex-col gap-[1.6rem]">
              {guideContent.sections.map(({
              key,
              title,
              body
            }) => <article key={key} onClick={key === "accessibility" ? handleA11yClick : undefined} aria-label={title}>
                  <h2 className={`${sectionHeadingClassName} mb-2`}>{title}</h2>
                  <div className={`${bodyTextClassName} max-[48em]:text-[clamp(1.24rem,4.65vw,1.42rem)] leading-[1.68] [&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2 [&_ul]:ml-5 [&_ol]:ml-5 [&_ul]:pl-0 [&_ol]:pl-0 [&_li]:my-1`} dangerouslySetInnerHTML={{
                __html: body
              }} />
                </article>)}
            </div>
            <footer className={cn(
              "mt-[1.2rem] text-center text-[1.05rem] max-[48em]:text-[1.12rem] text-[#d7cfd3] light:text-[#4a413a]",
              isExpandedLayout
                ? "mb-[clamp(0.7rem,2.2vh,1.25rem)] max-[48em]:mb-[clamp(0.8rem,2.4vh,1.35rem)]"
                : "mb-[clamp(3.5rem,8.7vh,5.5rem)] max-[48em]:mb-[clamp(4.2rem,10.3vh,6.3rem)]"
            )}>
              {getFooterNote()}
            </footer>
          </div>
        </div>
      </GlassRing>
      {!isMobilePolicyLayout ? <button type="button" className={cn(glassPolicyExpandToggleClassName, expanded ? "is-expanded" : null)} onClick={() => setExpanded(prev => !prev)} aria-pressed={expanded} aria-label={toggleLabel} title={toggleLabel}>
          <FocusModeToggleIcon expanded={expanded} isLightTheme={isLightTheme} className="glass-ring-expand-icon glass-ring-expand-icon--lg" />
        </button> : null}
      </div>
    </section>;
}
