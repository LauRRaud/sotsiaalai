"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";
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
const sectionHeadingClassName = "text-[1.3rem] font-semibold tracking-[0.01em] text-[#c57171] light:text-[#7A3A38]";
const bodyTextClassName = "text-[clamp(1.02rem,1.5vw,1.15rem)] leading-[1.7] text-[color:var(--glass-surface-text,#f2f2f2)] light:text-[#2b2620]";
const SECTION_KEYS = ["accessibility", "home", "register", "signin", "chat", "profile", "about", "quickstart"];
export default function KasutusjuhendBody() {
  const [expanded, setExpanded] = useState(false);
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
        <GlassRing className={cn(glassPageRingCenteredClassName, "glass-ring-expandable", expanded ? "glass-ring-expandable--open" : null, "[--glass-ring-pad-top:clamp(0.2rem,1.1vh,0.8rem)]", "[--ring-diameter:var(--chat-diameter)]")} role="region" aria-labelledby="kasutusjuhend-title">
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
        <h1 id="kasutusjuhend-title" className={`${titleClassName} mt-[clamp(0.6rem,1.6vh,1.2rem)] max-[48em]:mt-[clamp(0.1rem,0.8vh,0.5rem)] max-[48em]:mb-[clamp(0.25rem,1vh,0.6rem)]`}>
          {t("about.guide.short_title", "Kasutusjuhend")}
        </h1>
        <div className={cn(contentClassName, "glass-ring-content", expanded ? "glass-ring-content--open" : null)}>
          <div className={cn(scrollClassName, expanded ? "glass-ring-scroll--open" : null)} style={{ zIndex: 0 }}>
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
        <button type="button" className={cn("glass-ring-expand-toggle", "glass-ring-expand-toggle--overlay", "max-[48em]:hidden", expanded ? "is-expanded" : null)} onClick={() => setExpanded(prev => !prev)} aria-pressed={expanded} aria-label={toggleLabel} title={toggleLabel}>
          <Image src={expandIcon} alt="" width={56} height={56} className="glass-ring-expand-icon glass-ring-expand-icon--lg" />
        </button>
      </div>
    </section>;
}
