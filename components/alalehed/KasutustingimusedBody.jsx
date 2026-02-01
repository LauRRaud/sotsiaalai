"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";
import RichText from "@/components/i18n/RichText";
import { useAccessibility } from "@/components/accessibility/AccessibilityProvider";
import BackButton from "@/components/ui/BackButton";
import GlassRing from "@/components/ui/GlassRing";
import { glassPageBackClassName, glassPageRingCenteredClassName, glassPageShellCenteredClassName, glassPageTitleClassName } from "@/components/ui/glassPageStyles";
import { cn } from "@/components/ui/cn";
import { localizePath } from "@/lib/localizePath";
import { pushWithTransition } from "@/lib/routeTransition";
const pageShellClassName = glassPageShellCenteredClassName;
const titleClassName = glassPageTitleClassName;
const contentClassName = "-mt-[clamp(0.6rem,2.2vh,1.4rem)] flex w-full flex-1 flex-col items-center";
const scrollClassName = "glass-ring-scroll relative w-full max-w-[clamp(18rem,45vw,31rem)] translate-x-[clamp(0.35rem,1vw,0.9rem)] overflow-y-auto pr-[0.1rem] pt-[0.6rem] text-left [scrollbar-width:none] [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0 [mask-image:linear-gradient(to_bottom,transparent_0%,#000_8%,#000_92%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,#000_8%,#000_92%,transparent_100%)]";
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
        <GlassRing className={cn(glassPageRingCenteredClassName, "glass-ring-expandable", expanded ? "glass-ring-expandable--open" : null, "[--glass-ring-pad-top:clamp(0.2rem,1.1vh,0.8rem)]")} role="region" aria-labelledby="terms-title">
        <BackButton
          onClick={() => typeof window !== "undefined" && window.history.length > 1 ? router.back() : pushWithTransition(router, localizePath("/", locale))}
          ariaLabel={t("buttons.back_home")}
          className={glassPageBackClassName}
        />
        <h1 id="terms-title" className={`${titleClassName} mt-[clamp(0.6rem,1.6vh,1.2rem)]`}>
          {t("terms.title")}
        </h1>
        <div className={cn(contentClassName, "glass-ring-content", expanded ? "glass-ring-content--open" : null)}>
          <div className={cn(scrollClassName, expanded ? "glass-ring-scroll--open" : null)} style={{ zIndex: 0 }}>
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
        <button type="button" className={cn("glass-ring-expand-toggle", "glass-ring-expand-toggle--overlay", expanded ? "is-expanded" : null)} onClick={() => setExpanded(prev => !prev)} aria-pressed={expanded} aria-label={toggleLabel} title={toggleLabel}>
          <Image src={expandIcon} alt="" width={56} height={56} className="glass-ring-expand-icon glass-ring-expand-icon--lg" />
        </button>
      </div>
    </section>;
}
