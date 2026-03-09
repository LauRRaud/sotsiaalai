"use client";

import { useLayoutEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";
import { useAccessibility } from "@/components/accessibility/AccessibilityProvider";
import BackButton from "@/components/ui/BackButton";
import CloseButton from "@/components/ui/CloseButton";
import GlassRing from "@/components/ui/GlassRing";
import FocusModeToggleIcon from "@/components/ui/icons/FocusModeToggleIcon";
import { glassPageBackMobileBottomCenterClassName, glassPageCloseClassName, glassPageRingCenteredClassName, glassPageShellCenteredClassName, glassPageTitleClassName } from "@/components/ui/glassPageStyles";
import { glassPolicyBackButtonClassName, glassPolicyContentClassName, glassPolicyContentExpandedClassName, glassPolicyExpandToggleClassName, glassPolicyRingClassName, glassPolicyScrollClassName, glassPolicyScrollExpandedClassName, glassPolicyTitleExpandedClassName, glassPolicyTitleOffsetClassName } from "@/components/ui/glassPolicyPageStyles";
import { cn } from "@/components/ui/cn";
import { localizePath } from "@/lib/localizePath";
import { localizeInternalHtmlLinks } from "@/lib/localizeHtmlLinks";
import { getFooterNote } from "@/lib/footerNote";
import { backWithTransition, pushWithTransition } from "@/lib/routeTransition";
import { policySectionBodyClassName, policySectionClassName, policySectionHeadingClassName, policySectionRichTextClassName } from "@/components/alalehed/policySectionStyles";
import { policyDesktopBottomFadeOverlayClassName, policyDesktopBottomFadeOverlayStyle, shouldShowPolicyDesktopBottomFade } from "@/components/alalehed/policyBottomFadeOverlay";
import { focusPolicyScrollArea, handlePolicyScrollKeyDown } from "@/components/alalehed/policyScrollKeyboard";
const pageShellClassName = glassPageShellCenteredClassName;
const titleClassName = glassPageTitleClassName;
const contentClassName = glassPolicyContentClassName;
const scrollClassName = glassPolicyScrollClassName;
const SECTION_KEYS = ["accessibility", "home", "register", "signin", "chat", "documents", "agent_mode", "profile", "about", "before_use", "quickstart"];
export default function KasutusjuhendBody() {
  const [expanded, setExpanded] = useState(false);
  const [isMobilePolicyLayout, setIsMobilePolicyLayout] = useState(true);
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
  const showDesktopBottomFade = shouldShowPolicyDesktopBottomFade({
    isExpandedLayout,
    isMobilePolicyLayout
  });
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(max-width: 768px), (pointer: coarse)");
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
  const guideContent = {
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
        <GlassRing className={cn(glassPageRingCenteredClassName, "glass-ring--desktop-stable", glassPolicyRingClassName, "policy-mobile-lower", "guide-policy-ring", isExpandedLayout ? "glass-ring-expandable--open" : null)} role="region" aria-labelledby="kasutusjuhend-title">
        <CloseButton
          onClick={handleBack}
          ariaLabel={t("buttons.close")}
          className={cn(glassPageCloseClassName, "max-[768px]:hidden")}
        />
        <BackButton
          onClick={handleBack}
          ariaLabel={t("buttons.back_home")}
          className={cn(glassPolicyBackButtonClassName, glassPageBackMobileBottomCenterClassName)}
          iconClassName="group-hover:!scale-[1.12] group-focus-visible:!scale-[1.12]"
        />
        <h1
          id="kasutusjuhend-title"
          className={cn(
            titleClassName,
            glassPolicyTitleOffsetClassName,
            "guide-page-title",
            isExpandedLayout ? glassPolicyTitleExpandedClassName : null
          )}
        >
          {t("about.guide.short_title")}
        </h1>
        <div className={cn(contentClassName, "relative", "glass-ring-content", "guide-policy-content", isExpandedLayout ? "glass-ring-content--open" : null, isExpandedLayout ? glassPolicyContentExpandedClassName : null)}>
          {showDesktopBottomFade ? <div aria-hidden className={policyDesktopBottomFadeOverlayClassName} style={policyDesktopBottomFadeOverlayStyle} /> : null}
          <div
            className={cn(
              scrollClassName,
              "guide-policy-scroll",
              !isExpandedLayout ? "pb-[4.2rem] max-[768px]:pb-[4.8rem]" : null,
              isExpandedLayout ? "glass-ring-scroll--open" : null,
              isExpandedLayout ? glassPolicyScrollExpandedClassName : null
            )}
            style={{ zIndex: 0 }}
            tabIndex={0}
            aria-labelledby="kasutusjuhend-title"
            onKeyDown={handlePolicyScrollKeyDown}
            onMouseDown={focusPolicyScrollArea}
          >
            <p className={cn(policySectionBodyClassName, "mb-[0.58rem] max-[768px]:mb-[0.54rem]")}>
              {guideContent.intro}
            </p>
            <div className="flex flex-col gap-0">
              {guideContent.sections.map(({
              key,
              title,
              body
            }, idx) => <article key={key} onClick={key === "accessibility" ? handleA11yClick : undefined} aria-label={title} className={cn(policySectionClassName, idx === 0 ? "mt-0" : null, key === "quickstart" ? "guide-quickstart-section" : null)}>
                  <h2 className={policySectionHeadingClassName}>{title}</h2>
                  <div className={cn(policySectionBodyClassName, policySectionRichTextClassName, "guide-rich-text", key === "quickstart" ? "guide-quickstart-rich-text" : null, "max-[768px]:text-[clamp(1.06rem,4.1vw,1.2rem)] leading-[1.64] [&_ul]:ml-5 [&_ol]:ml-5 [&_ul]:pl-0 [&_ol]:pl-0 [&_li]:my-[0.22rem]")} dangerouslySetInnerHTML={{
                __html: body
              }} />
                </article>)}
            </div>
            <footer className={cn(
              "text-center text-[1.32rem] max-[768px]:text-[1.38rem] text-[#d7cfd3] light:text-[#4a413a]",
              isExpandedLayout
                ? "mt-[clamp(1.2rem,2.8vh,1.9rem)] mb-[clamp(0.85rem,2vh,1.3rem)] max-[768px]:mt-[clamp(1rem,2.5vh,1.6rem)] max-[768px]:mb-[clamp(0.75rem,1.9vh,1.2rem)]"
                : "mt-[clamp(0.18rem,0.55vh,0.42rem)] mb-[clamp(0.32rem,0.95vh,0.68rem)] max-[768px]:mt-[clamp(0.3rem,0.9vh,0.56rem)] max-[768px]:mb-[clamp(0.26rem,0.85vh,0.6rem)]"
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
