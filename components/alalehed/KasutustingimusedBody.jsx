"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";
import RichText from "@/components/i18n/RichText";
import { useAccessibility } from "@/components/accessibility/AccessibilityProvider";
import BackButton from "@/components/ui/BackButton";
import CloseButton from "@/components/ui/CloseButton";
import GlassRing from "@/components/ui/GlassRing";
import FocusModeToggleIcon from "@/components/ui/icons/FocusModeToggleIcon";
import { glassPageBackMobileBottomCenterClassName, glassPageCloseClassName, glassPageRingCenteredClassName, glassPageShellCenteredClassName, glassPageTitleClassName } from "@/components/ui/glassPageStyles";
import { glassPolicyBackButtonClassName, glassPolicyContentClassName, glassPolicyExpandToggleClassName, glassPolicyRingClassName, glassPolicyScrollClassName, glassPolicyTitleOffsetClassName } from "@/components/ui/glassPolicyPageStyles";
import { cn } from "@/components/ui/cn";
import { localizePath } from "@/lib/localizePath";
import { pushWithTransition } from "@/lib/routeTransition";
const pageShellClassName = glassPageShellCenteredClassName;
const titleClassName = glassPageTitleClassName;
const contentClassName = glassPolicyContentClassName;
const scrollClassName = glassPolicyScrollClassName;
const sectionHeadingClassName = "mt-[1.2rem] text-[1.3rem] font-semibold tracking-[0.01em] text-[#c57171] light:text-[#7A3A38]";
const bodyTextClassName = "mt-[0.6rem] space-y-[0.85rem] text-[clamp(1.02rem,1.5vw,1.15rem)] leading-[1.7] text-[color:var(--glass-surface-text,#f2f2f2)] light:text-[#2b2620]";
const richLinkClassName = "inline-block text-[1.1em] font-[500] tracking-[0.03em] px-[0.2em] py-[0.02em] rounded-[0.32em] border-2 border-transparent no-underline transition-[border,box-shadow,color] duration-150 text-[#c57171] hover:border-[#c57171] hover:shadow-[0_0_0.4375rem_0_rgba(197,113,113,0.35)] focus-visible:border-[#c57171] focus-visible:shadow-[0_0_0.4375rem_0_rgba(197,113,113,0.35)] light:text-[#7A3A38] light:hover:border-[#7A3A38] light:focus-visible:border-[#7A3A38]";
const emailReplacement = {
  aEmail: {
    open: `<a href="mailto:info@sotsiaal.ai" class="${richLinkClassName}">`,
    close: "</a>"
  }
};
export default function KasutustingimusedBody() {
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
  const isLightTheme = prefs?.theme === "light";
  const toggleLabel = expanded ? t("buttons.collapse", "Ahenda") : t("buttons.expand", "Laienda");
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
  const sections = [{
    heading: t("terms.section1.heading"),
    content: [{
      value: t("terms.section1.body")
    }]
  }, {
    heading: t("terms.section2.heading"),
    content: [{
      value: t("terms.section2.body")
    }]
  }, {
    heading: t("terms.section3.heading"),
    content: [{
      value: t("terms.section3.items"),
      type: "list"
    }]
  }, {
    heading: t("terms.section4.heading"),
    content: [{
      value: t("terms.section4.items"),
      type: "list"
    }]
  }, {
    heading: t("terms.section5.heading"),
    content: [{
      value: t("terms.section5.paragraph1")
    }, {
      value: t("terms.section5.paragraph2"),
      replacements: emailReplacement
    }]
  }, {
    heading: t("terms.section6.heading"),
    content: [{
      value: t("terms.section6.body")
    }]
  }, {
    heading: t("terms.section7.heading"),
    content: [{
      value: t("terms.section7.body")
    }]
  }, {
    heading: t("terms.section8.heading"),
    content: [{
      value: t("terms.section8.body")
    }]
  }, {
    heading: t("terms.section9.heading"),
    content: [{
      value: t("terms.section9.paragraph1")
    }, {
      value: t("terms.section9.paragraph2")
    }]
  }, {
    heading: t("terms.section10.heading"),
    content: [{
      value: t("terms.section10.paragraph1")
    }, {
      value: t("terms.section10.items"),
      type: "list"
    }, {
      value: t("terms.section10.paragraph2")
    }]
  }, {
    heading: t("terms.section11.heading"),
    content: [{
      value: t("terms.section11.body")
    }]
  }, {
    heading: t("terms.section12.heading"),
    content: [{
      value: t("terms.section12.body")
    }]
  }, {
    heading: t("terms.section13.heading"),
    content: [{
      value: t("terms.section13.body")
    }]
  }];
  return <section className={pageShellClassName} lang={locale}>
      <div className="relative flex flex-col items-center">
        <GlassRing className={cn(glassPageRingCenteredClassName, glassPolicyRingClassName, "policy-mobile-lower", isExpandedLayout ? "glass-ring-expandable--open" : null)} role="region" aria-labelledby="terms-title">
        <CloseButton
          onClick={() => typeof window !== "undefined" && window.history.length > 1 ? router.back() : pushWithTransition(router, localizePath("/", locale))}
          ariaLabel={t("buttons.close")}
          className={cn(glassPageCloseClassName, "max-[48em]:hidden")}
        />
        <BackButton
          onClick={() => typeof window !== "undefined" && window.history.length > 1 ? router.back() : pushWithTransition(router, localizePath("/", locale))}
          ariaLabel={t("buttons.back_home")}
          className={cn(glassPolicyBackButtonClassName, glassPageBackMobileBottomCenterClassName)}
        />
        <h1 id="terms-title" className={`${titleClassName} ${glassPolicyTitleOffsetClassName}`}>
          {t("terms.title")}
        </h1>
        <div className={cn(contentClassName, "glass-ring-content", isExpandedLayout ? "glass-ring-content--open" : null)}>
          <div className={cn(scrollClassName, isExpandedLayout ? "glass-ring-scroll--open" : null)} style={{ zIndex: 0 }}>
            {sections.map(section => <div key={section.heading}>
                <h2 className={sectionHeadingClassName}>{section.heading}</h2>
                <div className={bodyTextClassName}>
                  {section.content.map((item, idx) => item.type === "list" ? <RichText key={`${section.heading}-list-${idx}`} as="ul" className="list-disc pl-[1.2rem] space-y-[0.4rem]" value={item.value} /> : <RichText key={`${section.heading}-p-${idx}`} as="div" value={item.value} replacements={item.replacements || {}} />)}
                </div>
              </div>)}
            <footer className="mt-[1.6rem] text-center text-[1.05rem] text-[color:var(--glass-surface-text,#f2f2f2)] light:text-[#2b2620]">
              {t("about.footer.note")}
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
