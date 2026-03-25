"use client";

import { useLayoutEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";
import RichText from "@/components/i18n/RichText";
import { useAccessibility } from "@/components/accessibility/AccessibilityProvider";
import BackButton from "@/components/ui/BackButton";
import CloseButton from "@/components/ui/CloseButton";
import GlassRing from "@/components/ui/GlassRing";
import FocusModeToggleIcon from "@/components/ui/icons/FocusModeToggleIcon";
import { glassPageBackMobileBottomCenterClassName, glassPageCloseClassName, glassPageRingCenteredClassName, glassPageShellCenteredClassName, glassPageTitleClassName } from "@/components/ui/glassPageStyles";
import { glassPolicyBackButtonClassName, glassPolicyContentClassName, glassPolicyContentExpandedClassName, glassPolicyExpandToggleClassName, glassPolicyRingClassName, glassPolicyScrollClassName, glassPolicyScrollExpandedClassName, glassPolicyTitleExpandedClassName, glassPolicyTitleOffsetClassName } from "@/components/ui/glassPolicyPageStyles";
import { cn } from "@/components/ui/cn";
import { linkRichTextBase } from "@/components/ui/linkStyles";
import { localizePath } from "@/lib/localizePath";
import { getFooterNote } from "@/lib/footerNote";
import { backWithTransition, pushWithTransition } from "@/lib/routeTransition";
import { policySectionBodyClassName, policySectionClassName, policySectionHeadingClassName, policySectionListClassName, policySectionRichTextClassName } from "@/components/alalehed/policySectionStyles";
import { focusPolicyScrollArea, handlePolicyScrollKeyDown } from "@/components/alalehed/policyScrollKeyboard";
const pageShellClassName = glassPageShellCenteredClassName;
const titleClassName = glassPageTitleClassName;
const contentClassName = glassPolicyContentClassName;
const scrollClassName = glassPolicyScrollClassName;
const richLinkClassName = `${linkRichTextBase} privacy-rich-link`;
const lawLinkReplacements = {
  aLawEst: {
    open: `<a href="https://www.riigiteataja.ee/akt/112072025014" target="_blank" rel="noopener noreferrer" class="${richLinkClassName}">`,
    close: "</a>"
  },
  aGdpr: {
    open: `<a href="https://eur-lex.europa.eu/legal-content/ET/TXT/HTML/?uri=CELEX:02016R0679-20160504" target="_blank" rel="noopener noreferrer" class="${richLinkClassName}">`,
    close: "</a>"
  },
  aDpa: {
    open: `<a href="https://www.aki.ee" target="_blank" rel="noopener noreferrer" class="${richLinkClassName}">`,
    close: "</a>"
  }
};
export default function PrivaatsusBody() {
  const [expanded, setExpanded] = useState(false);
  const [isMobilePolicyLayout, setIsMobilePolicyLayout] = useState(false);
  const router = useRouter();
  const {
    t,
    locale
  } = useI18n();
  const {
    prefs
  } = useAccessibility();
  const isLightTheme = prefs?.theme === "light" || prefs?.theme === "light-mono" || prefs?.theme === "mid";
  const toggleLabel = expanded ? t("buttons.collapse") : t("buttons.expand");
  const isExpandedLayout = expanded || isMobilePolicyLayout;
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
  const sections = [{
    heading: t("privacy.section1.heading"),
    content: [{
      value: t("privacy.section1.paragraph1")
    }, {
      value: t("privacy.section1.paragraph2"),
      replacements: lawLinkReplacements
    }]
  }, {
    heading: t("privacy.section2.heading"),
    content: [{
      value: t("privacy.section2.paragraph1")
    }, {
      value: t("privacy.section2.paragraph2")
    }, {
      value: t("privacy.section2.paragraph3")
    }]
  }, {
    heading: t("privacy.section3.heading"),
    content: [{
      value: t("privacy.section3.items"),
      type: "list"
    }]
  }, {
    heading: t("privacy.section4.heading"),
    content: [{
      value: t("privacy.section4.body")
    }]
  }, {
    heading: t("privacy.section5.heading"),
    content: [{
      value: t("privacy.section5.body")
    }]
  }, {
    heading: t("privacy.section6.heading"),
    content: [{
      value: t("privacy.section6.body")
    }]
  }, {
    heading: t("privacy.section7.heading"),
    content: [{
      value: t("privacy.section7.body")
    }]
  }, {
    heading: t("privacy.section8.heading"),
    content: [{
      value: t("privacy.section8.items"),
      type: "list",
      replacements: lawLinkReplacements
    }]
  }, {
    heading: t("privacy.section9.heading"),
    content: [{
      value: t("privacy.section9.body")
    }]
  }, {
    heading: t("privacy.section10.heading"),
    content: [{
      value: t("privacy.section10.body")
    }]
  }, {
    heading: t("privacy.section11.heading"),
    content: [{
      value: t("privacy.section11.body")
    }]
  }];
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
        <GlassRing className={cn(glassPageRingCenteredClassName, "glass-ring--desktop-stable", glassPolicyRingClassName, "policy-mobile-lower", isExpandedLayout ? "glass-ring-expandable--open" : null)} role="region" aria-labelledby="privacy-title">
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
        <div className="policy-mobile-title-wrap relative z-[4] flex w-full items-center justify-center max-[768px]:pt-[calc(env(safe-area-inset-top,0px)+2.18rem)] max-[768px]:pb-[clamp(0.18rem,0.9vh,0.42rem)]">
          <h1
            id="privacy-title"
            className={cn(
              "subpage-mobile-title policy-mobile-title policy-mobile-title--static max-[768px]:!mt-0 max-[768px]:!mb-0",
              titleClassName,
              glassPolicyTitleOffsetClassName,
              isExpandedLayout ? glassPolicyTitleExpandedClassName : null
            )}
          >
            {t("privacy.title")}
          </h1>
        </div>
        <div className={cn(contentClassName, "relative", "glass-ring-content", "policy-page-content", "privacy-page-content", isExpandedLayout ? "glass-ring-content--open" : null, isExpandedLayout ? glassPolicyContentExpandedClassName : null)}>
          <div
            className={cn(scrollClassName, "policy-page-scroll", isExpandedLayout ? "glass-ring-scroll--open" : null, isExpandedLayout ? glassPolicyScrollExpandedClassName : null)}
            style={{ zIndex: 0 }}
            tabIndex={0}
            aria-labelledby="privacy-title"
            onKeyDown={handlePolicyScrollKeyDown}
            onMouseDown={focusPolicyScrollArea}
          >
            {sections.map(section => <div key={section.heading} className={policySectionClassName}>
                <h2 className={policySectionHeadingClassName}>{section.heading}</h2>
                <div className={cn(policySectionBodyClassName, "space-y-[0.9rem]")}>
                  {section.content.map((item, idx) => item.type === "list" ? <RichText key={`${section.heading}-list-${idx}`} as="ul" className={cn(policySectionListClassName, policySectionRichTextClassName)} value={item.value} replacements={item.replacements || lawLinkReplacements} /> : <RichText key={`${section.heading}-p-${idx}`} as="div" className={policySectionRichTextClassName} value={item.value} replacements={item.replacements || {}} />)}
                </div>
              </div>)}
            <footer className={cn(
              "policy-page-footer privacy-page-footer text-center text-[1.32rem] max-[768px]:text-[1.38rem] text-[#d7cfd3] light:text-[#4a413a]",
              isExpandedLayout
                ? "mt-[clamp(1.2rem,2.8vh,1.9rem)] mb-[clamp(0.85rem,2vh,1.3rem)] max-[768px]:mt-[clamp(1rem,2.5vh,1.6rem)] max-[768px]:mb-[clamp(0.75rem,1.9vh,1.2rem)]"
                : "mt-[clamp(0.18rem,0.55vh,0.42rem)] mb-[clamp(0.35rem,1vh,0.7rem)] max-[768px]:mt-[clamp(0.3rem,0.9vh,0.56rem)] max-[768px]:mb-[clamp(0.28rem,0.9vh,0.62rem)]"
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
