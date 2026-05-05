"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";
import RichText from "@/components/i18n/RichText";
import BackButton from "@/components/ui/BackButton";
import CloseButton from "@/components/ui/CloseButton";
import GlassRing from "@/components/ui/GlassRing";
import { glassPageCloseClassName, glassPageRingCenteredClassName, glassPageShellCenteredClassName, glassPageTitleClassName } from "@/components/ui/glassPageStyles";
import { glassPolicyBackButtonClassName, glassPolicyContentClassName, glassPolicyContentExpandedClassName, glassPolicyRingClassName, glassPolicyScrollClassName, glassPolicyScrollExpandedClassName, glassPolicyTitleExpandedClassName, glassPolicyTitleOffsetClassName } from "@/components/ui/glassPolicyPageStyles";
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
const headerRowClassName = "policy-mobile-title-wrap relative z-[4] grid w-full grid-cols-[auto_1fr_auto] items-center max-[768px]:pt-[calc(env(safe-area-inset-top,0px)+1.4rem)] max-[768px]:pb-[clamp(0.18rem,0.9vh,0.42rem)]";
const titleBackButtonClassName = "glass-policy-back glass-policy-back--compact relative left-auto top-auto z-[5] !inline-flex !h-[4.2rem] !w-[4.2rem] min-[769px]:!h-[4.6rem] min-[769px]:!w-[4.6rem] min-[769px]:!ml-0";
const titleBackSpacerClassName = "block h-[4.2rem] w-[4.2rem] min-[769px]:h-[4.6rem] min-[769px]:w-[4.6rem]";
const richLinkClassName = `${linkRichTextBase} policy-rich-link`;
const emailReplacement = {
  aEmail: {
    open: `<a href="mailto:info@sotsiaal.ai" class="${richLinkClassName}">`,
    close: "</a>"
  }
};
export default function KasutustingimusedBody() {
  const router = useRouter();
  const {
    t,
    locale
  } = useI18n();
  const termsTitle = t("terms.title");
  const isExpandedLayout = true;
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
    }, {
      value: t("terms.section5.paragraph3")
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
  }, {
    heading: t("terms.section14.heading"),
    content: [{
      value: t("terms.section14.body")
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
        <GlassRing className={cn(glassPageRingCenteredClassName, "glass-ring--desktop-stable", "[--glass-ring-surface-bg:var(--glass-surface-bg,rgba(0,0,0,0.25))]", glassPolicyRingClassName, "policy-mobile-lower", "policy-mobile-tall", isExpandedLayout ? "glass-ring-expandable--open" : null)} role="region" aria-labelledby="terms-title">
        <CloseButton
          onClick={handleBack}
          ariaLabel={t("buttons.close")}
          className={cn(glassPageCloseClassName, "max-[768px]:hidden")}
        />
        <div className={headerRowClassName}>
          <BackButton
            onClick={handleBack}
            ariaLabel={t("buttons.back_home")}
            className={cn(glassPolicyBackButtonClassName, titleBackButtonClassName)}
            iconClassName="group-hover:!scale-[1.12] group-focus-visible:!scale-[1.12]"
          />
          <h1
            id="terms-title"
            className={cn(
              "subpage-mobile-title policy-mobile-title policy-mobile-title--static col-start-2 max-[768px]:!mt-0 max-[768px]:!mb-0",
              titleClassName,
              glassPolicyTitleOffsetClassName,
              isExpandedLayout ? glassPolicyTitleExpandedClassName : null
            )}
          >
            {termsTitle}
          </h1>
          <span aria-hidden="true" className={titleBackSpacerClassName} />
        </div>
        <div className={cn(contentClassName, "relative", "glass-ring-content", "policy-page-content", isExpandedLayout ? "glass-ring-content--open" : null, isExpandedLayout ? glassPolicyContentExpandedClassName : null)}>
          <div
            className={cn(scrollClassName, "policy-page-scroll", isExpandedLayout ? "glass-ring-scroll--open" : null, isExpandedLayout ? glassPolicyScrollExpandedClassName : null)}
            style={{ zIndex: 0 }}
            tabIndex={0}
            aria-labelledby="terms-title"
            onKeyDown={handlePolicyScrollKeyDown}
            onMouseDown={focusPolicyScrollArea}
          >
            {sections.map(section => <div key={section.heading} className={policySectionClassName}>
                <h2 className={policySectionHeadingClassName}>{section.heading}</h2>
                <div className={cn(policySectionBodyClassName, "space-y-[0.9rem]")}>
                  {section.content.map((item, idx) => item.type === "list" ? <RichText key={`${section.heading}-list-${idx}`} as="ul" className={cn(policySectionListClassName, policySectionRichTextClassName)} value={item.value} /> : <RichText key={`${section.heading}-p-${idx}`} as="div" className={policySectionRichTextClassName} value={item.value} replacements={item.replacements || {}} />)}
                </div>
              </div>)}
            <footer className={cn(
              "policy-page-footer text-center text-[1.32rem] max-[768px]:text-[1.38rem] text-[#d7cfd3] light:text-[#4a413a]",
              isExpandedLayout
                ? "mt-[clamp(1.2rem,2.8vh,1.9rem)] mb-[clamp(0.85rem,2vh,1.3rem)] max-[768px]:mt-[clamp(1rem,2.5vh,1.6rem)] max-[768px]:mb-[clamp(0.75rem,1.9vh,1.2rem)]"
                : "mt-[clamp(0.18rem,0.55vh,0.42rem)] mb-[clamp(0.35rem,1vh,0.7rem)] max-[768px]:mt-[clamp(0.3rem,0.9vh,0.56rem)] max-[768px]:mb-[clamp(0.28rem,0.9vh,0.62rem)]"
            )}>
              {getFooterNote()}
            </footer>
          </div>
        </div>
      </GlassRing>
      </div>
    </section>;
}
