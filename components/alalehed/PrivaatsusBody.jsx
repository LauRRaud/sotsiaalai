"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";
import RichText from "@/components/i18n/RichText";
import { useAccessibility } from "@/components/accessibility/AccessibilityProvider";
import BackButton from "@/components/ui/BackButton";
import CloseButton from "@/components/ui/CloseButton";
import GlassRing from "@/components/ui/GlassRing";
import { glassPageBackClassName, glassPageRingCenteredClassName, glassPageShellCenteredClassName, glassPageTitleClassName } from "@/components/ui/glassPageStyles";
import { cn } from "@/components/ui/cn";
import { localizePath } from "@/lib/localizePath";
import { pushWithTransition } from "@/lib/routeTransition";
const pageShellClassName = glassPageShellCenteredClassName;
const titleClassName = glassPageTitleClassName;
const mobileCloseClassName = "!hidden !max-[48em]:!inline-flex !max-[48em]:!fixed !max-[48em]:!top-[calc(env(safe-area-inset-top,0px)+0.5rem)] !max-[48em]:!right-[calc(env(safe-area-inset-right,0px)+0.6rem)] !max-[48em]:!z-[90] !max-[48em]:!text-[#c57171] !max-[48em]:!opacity-90 light:!max-[48em]:!text-[#7a3a38]";
const contentClassName = "mt-[clamp(0.4rem,1.6vh,1.1rem)] flex w-full flex-1 flex-col items-center max-[48em]:w-full max-[48em]:max-w-full max-[48em]:px-[clamp(0rem,1vw,0.25rem)] max-[48em]:pt-[clamp(0.4rem,1.8vh,1rem)] max-[48em]:pb-[clamp(0.2rem,1vh,0.5rem)]";
const scrollClassName = "glass-ring-scroll relative w-full max-w-[clamp(18.8rem,48.5vw,33rem)] translate-x-[clamp(0.35rem,1vw,0.9rem)] overflow-y-auto pr-[0.1rem] pt-[clamp(1rem,2.4vh,1.6rem)] text-left [scrollbar-width:none] [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0 [mask-image:linear-gradient(to_bottom,transparent_0%,#000_8%,#000_92%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,#000_8%,#000_92%,transparent_100%)] max-[48em]:max-h-[calc(100%-1.2rem)] max-[48em]:translate-x-0 max-[48em]:w-full max-[48em]:max-w-full max-[48em]:px-[clamp(0rem,1vw,0.25rem)] max-[48em]:pt-[clamp(0.8rem,2.6vh,1.4rem)] max-[48em]:pb-[clamp(0.2rem,1vh,0.5rem)]";
const sectionHeadingClassName = "mt-[1.2rem] text-[1.3rem] font-semibold tracking-[0.01em] text-[#c57171] light:text-[#7A3A38]";
const bodyTextClassName = "mt-[0.6rem] space-y-[0.85rem] text-[clamp(1.02rem,1.5vw,1.15rem)] leading-[1.7] text-[color:var(--glass-surface-text,#f2f2f2)] light:text-[#2b2620]";
const richLinkClassName = "inline-block text-[1.1em] font-[500] tracking-[0.03em] px-[0.2em] py-[0.02em] rounded-[0.32em] border-2 border-transparent no-underline transition-[border,box-shadow,color] duration-150 text-[#c57171] hover:border-[#c57171] hover:shadow-[0_0_0.4375rem_0_rgba(197,113,113,0.35)] focus-visible:border-[#c57171] focus-visible:shadow-[0_0_0.4375rem_0_rgba(197,113,113,0.35)] light:text-[#7A3A38] light:hover:border-[#7A3A38] light:focus-visible:border-[#7A3A38]";
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
  const expandIcon = isLightTheme ? "/logo/laienebhele.svg" : "/logo/laienebtume.svg";
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
  return <section className={pageShellClassName} lang={locale}>
      <div className="relative flex flex-col items-center">
        <GlassRing className={cn(glassPageRingCenteredClassName, "glass-ring-expandable", expanded ? "glass-ring-expandable--open" : null, "[--glass-ring-pad-top:clamp(0.2rem,1.1vh,0.8rem)]", "[--ring-diameter:var(--chat-diameter)]")} role="region" aria-labelledby="privacy-title">
        <CloseButton
          onClick={() => {
            if (typeof window !== "undefined" && window.history.length > 1) {
              router.back();
            } else {
              pushWithTransition(router, localizePath("/", locale));
            }
          }}
          ariaLabel={t("buttons.close")}
          className={mobileCloseClassName}
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
          className={cn(glassPageBackClassName, "page-back-bottom")}
        />
        <h1 id="privacy-title" className={`${titleClassName} mt-[clamp(0.6rem,1.6vh,1.2rem)] max-[48em]:mt-[clamp(0.1rem,0.8vh,0.5rem)] max-[48em]:mb-[clamp(0.25rem,1vh,0.6rem)]`}>
          {t("privacy.title")}
        </h1>
        <div className={cn(contentClassName, "glass-ring-content", expanded ? "glass-ring-content--open" : null)}>
          <div className={cn(scrollClassName, expanded ? "glass-ring-scroll--open" : null)} style={{ zIndex: 0 }}>
            {sections.map(section => <div key={section.heading}>
                <h2 className={sectionHeadingClassName}>{section.heading}</h2>
                <div className={bodyTextClassName}>
                  {section.content.map((item, idx) => item.type === "list" ? <RichText key={`${section.heading}-list-${idx}`} as="ul" className="list-disc pl-[1.2rem] space-y-[0.4rem]" value={item.value} replacements={item.replacements || lawLinkReplacements} /> : <RichText key={`${section.heading}-p-${idx}`} as="div" value={item.value} replacements={item.replacements || {}} />)}
                </div>
              </div>)}
            <footer className="mt-[1.6rem] text-center text-[1.05rem] text-[color:var(--glass-surface-text,#f2f2f2)] light:text-[#2b2620]">
              {t("about.footer.note")}
            </footer>
          </div>
        </div>
      </GlassRing>
        <button type="button" className={cn("glass-ring-expand-toggle", "glass-ring-expand-toggle--overlay", "max-[48em]:hidden", expanded ? "is-expanded" : null)} onClick={() => setExpanded(prev => !prev)} aria-pressed={expanded} aria-label={toggleLabel} title={toggleLabel}>
          <Image src={expandIcon} alt="" width={56} height={56} className="glass-ring-expand-icon glass-ring-expand-icon--lg" />
        </button>
      </div>
    </section>;
}
