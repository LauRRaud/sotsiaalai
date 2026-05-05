"use client";

import { useLayoutEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";
import { useAccessibility } from "@/components/accessibility/AccessibilityProvider";
import BackButton from "@/components/ui/BackButton";
import CloseButton from "@/components/ui/CloseButton";
import Modal from "@/components/ui/Modal";
import GlassRing from "@/components/ui/GlassRing";
import { glassPageBackMobileBottomCenterClassName, glassPageBackTopLeftClassName, glassPageCloseClassName, glassPageRingCenteredClassName, glassPageShellCenteredClassName, glassPageTitleClassName } from "@/components/ui/glassPageStyles";
import { glassPolicyBackButtonClassName, glassPolicyContentClassName, glassPolicyContentExpandedClassName, glassPolicyRingClassName, glassPolicyScrollClassName, glassPolicyScrollExpandedClassName } from "@/components/ui/glassPolicyPageStyles";
import { cn } from "@/components/ui/cn";
import { linkRichTextBase } from "@/components/ui/linkStyles";
import { localizePath } from "@/lib/localizePath";
import { localizeInternalHtmlLinks } from "@/lib/localizeHtmlLinks";
import { getFooterNote } from "@/lib/footerNote";
import { backWithTransition, pushWithTransition } from "@/lib/routeTransition";
import { policySectionBodyClassName, policySectionClassName, policySectionHeadingClassName, policySectionRichTextClassName } from "@/components/alalehed/policySectionStyles";
import { focusPolicyScrollArea, handlePolicyScrollKeyDown } from "@/components/alalehed/policyScrollKeyboard";
const pageShellClassName = glassPageShellCenteredClassName;
const titleClassName = glassPageTitleClassName;
const contentClassName = glassPolicyContentClassName;
const scrollClassName = glassPolicyScrollClassName;
const titleWrapClassName = "policy-mobile-title-wrap relative z-[4] flex w-full items-center justify-center max-[768px]:pt-[calc(env(safe-area-inset-top,0px)+2.18rem)] max-[768px]:pb-[clamp(0.18rem,0.9vh,0.42rem)]";
const guideLinkClassName = `${linkRichTextBase} guide-rich-link`;
function applyGuideLinkClass(html) {
  if (typeof html !== "string" || !html) return html;
  return html.replace(/<a\b([^>]*?)>/gi, (full, attrs = "") => {
    const classMatch = attrs.match(/\bclass=(["'])(.*?)\1/i);
    if (classMatch) {
      const classes = String(classMatch[2] || "").trim();
      if (!classes || classes.includes("guide-rich-link")) return full;
      return full.replace(classMatch[0], `class=${classMatch[1]}${classes} ${guideLinkClassName}${classMatch[1]}`);
    }
    return `<a${attrs} class="${guideLinkClassName}">`;
  });
}
const SECTION_KEYS = ["accessibility", "home", "register", "signin", "chat", "documents", "agent_mode", "profile", "about", "quickstart"];
export default function KasutusjuhendBody() {
  const [layoutReady, setLayoutReady] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const router = useRouter();
  const {
    t,
    locale
  } = useI18n();
  const {
    openModal: openA11y,
    isModalOpen
  } = useAccessibility();
  const isExpandedLayout = true;
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const readyFrame = window.requestAnimationFrame(() => setLayoutReady(true));
    return () => {
      window.cancelAnimationFrame(readyFrame);
    };
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
  const handleContactClick = e => {
    let node = e.target;
    let anchor = null;
    while (node && node !== e.currentTarget) {
      if (node.matches && node.matches("a[data-contact-open], button[data-contact-open]")) {
        anchor = node;
        break;
      }
      node = node.parentElement;
    }
    if (anchor) {
      e.preventDefault();
      setIsContactOpen(true);
    }
  };
  const guideContent = {
    intro: t("about.guide.intro"),
    sections: SECTION_KEYS.map(key => ({
      key,
      title: t(`about.guide.sections_v2.${key}.title`),
      body: applyGuideLinkClass(localizeInternalHtmlLinks(t(`about.guide.sections_v2.${key}.body`), locale))
    }))
  };
  const hideGuideBackButton = isModalOpen;
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
        <GlassRing className={cn(glassPageRingCenteredClassName, "glass-ring--desktop-stable", "[--glass-ring-surface-bg:var(--glass-surface-bg,rgba(0,0,0,0.25))]", glassPolicyRingClassName, "policy-mobile-lower", "policy-mobile-tall", "guide-policy-ring", !layoutReady ? "guide-policy-ring--layout-init" : null, isExpandedLayout ? "glass-ring-expandable--open" : null)} role="region" aria-labelledby="kasutusjuhend-title">
        <CloseButton
          onClick={handleBack}
          ariaLabel={t("buttons.close")}
          className={cn(glassPageCloseClassName, "max-[768px]:hidden")}
        />
        {!hideGuideBackButton ? (
          <BackButton
            onClick={handleBack}
            ariaLabel={t("buttons.back_home")}
            holdPressedVisualDisabled
            className={cn(glassPageBackTopLeftClassName, "z-[3] max-[768px]:hidden")}
            iconClassName="group-hover:!scale-[1.12] group-focus-visible:!scale-[1.12]"
          />
        ) : null}
        {!hideGuideBackButton ? (
          <BackButton
            onClick={handleBack}
            ariaLabel={t("buttons.back_home")}
            className={cn(glassPolicyBackButtonClassName, glassPageBackMobileBottomCenterClassName, "min-[769px]:hidden")}
            iconClassName="group-hover:!scale-[1.12] group-focus-visible:!scale-[1.12]"
          />
        ) : null}
        <div className={titleWrapClassName}>
          <h1
            id="kasutusjuhend-title"
            className={cn(
              "subpage-mobile-title policy-mobile-title policy-mobile-title--static max-[768px]:!mt-0 max-[768px]:!mb-0",
              titleClassName,
              !layoutReady ? "guide-policy-title--layout-init" : null
            )}
          >
            {t("about.guide.short_title")}
          </h1>
        </div>
        <div className={cn(contentClassName, "relative", "glass-ring-content", "guide-policy-content", !layoutReady ? "guide-policy-content--layout-init" : null, isExpandedLayout ? "glass-ring-content--open" : null, isExpandedLayout ? glassPolicyContentExpandedClassName : null)}>
          <div
            className={cn(
              scrollClassName,
              "guide-policy-scroll",
              !layoutReady ? "guide-policy-scroll--layout-init" : null,
              !isExpandedLayout ? "pb-[4.2rem] max-[768px]:pb-[4.8rem]" : null,
              isExpandedLayout ? "glass-ring-scroll--open" : null,
              isExpandedLayout ? glassPolicyScrollExpandedClassName : null
            )}
            style={{ zIndex: 0 }}
            tabIndex={0}
            aria-labelledby="kasutusjuhend-title"
            onKeyDown={handlePolicyScrollKeyDown}
            onMouseDown={focusPolicyScrollArea}
            onClick={handleContactClick}
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
                  <div className={cn(policySectionBodyClassName, policySectionRichTextClassName, "guide-rich-text", key === "quickstart" ? "guide-quickstart-rich-text" : null, "max-[768px]:text-[clamp(1.24rem,4.65vw,1.42rem)] leading-[1.68] [&_ul]:ml-5 [&_ol]:ml-5 [&_ul]:pl-0 [&_ol]:pl-0 [&_li]:my-[0.22rem]")} dangerouslySetInnerHTML={{
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
      <Modal
        open={isContactOpen}
        variant="glass"
        onClose={() => setIsContactOpen(false)}
        className="z-[140] max-[768px]:p-[1rem]"
        contentClassName="!w-[min(100%,26rem)] !max-w-[26rem] !rounded-[1.45rem] !border !border-[rgba(248,253,255,0.14)] !bg-[rgba(10,14,22,0.98)] !p-[1.2rem_1.15rem_1rem] text-center !shadow-[0_22px_52px_-28px_rgba(4,6,12,0.82)] !backdrop-blur-0 !backdrop-saturate-100 light:!border-[rgba(148,163,184,0.24)] light:!bg-[rgba(255,255,255,0.98)] light:!text-[#1f2937] hc:!border-[color:var(--hc-accent)] hc:!bg-[color:var(--hc-bg)] hc:!text-[color:var(--hc-text)]"
      >
        <div className="relative">
          <CloseButton
            onClick={() => setIsContactOpen(false)}
            ariaLabel={t("buttons.close")}
            className="absolute right-[-0.2rem] top-[-0.15rem] !h-[2.2rem] !w-[2.2rem] text-[1.8rem]"
          />
          <h2 className="mb-[0.9rem] pr-[2rem] text-[1.4rem] font-headline tracking-[0.02em] text-[color:var(--glass-modal-text)] max-[768px]:text-[1.28rem]">
            {t("about.contact.title")}
          </h2>
          <div
            className="mx-auto max-w-[20rem] text-[1rem] leading-[1.55] tracking-[0.01em] text-[color:var(--glass-modal-text-soft,var(--pt-120))] max-[768px]:max-w-none"
            dangerouslySetInnerHTML={{
              __html: t("about.contact.modal_body")
            }}
          />
        </div>
      </Modal>
      </div>
    </section>;
}
