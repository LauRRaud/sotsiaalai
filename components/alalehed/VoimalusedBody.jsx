"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";
import { GlassSubpageHeader } from "@/components/ui/GlassSubpageHeader";
import {
  glassPageMobileCardClassName,
  glassPageShellCenteredClassName,
  glassPrimaryButtonToneClassName
} from "@/components/ui/glassPageStyles";
import { policySectionHeadingClassName } from "@/components/alalehed/policySectionStyles";
import { localizePath } from "@/lib/localizePath";
import { backWithTransition, pushWithTransition } from "@/lib/routeTransition";

const shellClassName =
  `${glassPageShellCenteredClassName} ${glassPrimaryButtonToneClassName} ` +
  "relative flex h-[100dvh] min-h-[100dvh] max-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden overscroll-none px-[1rem] py-[1rem] max-[768px]:[--mobile-glass-card-gap:clamp(0.14rem,0.8vw,0.22rem)] max-[768px]:justify-start max-[768px]:px-0 max-[768px]:py-[0.14rem]";

const panelClassName =
  `relative z-[21] w-full !max-w-[62rem] max-h-[calc(100dvh-2rem)] overflow-x-hidden overflow-y-auto overscroll-contain rounded-[2rem] ` +
  `[--glass-modal-border:none] [--glass-modal-shadow:var(--glass-shell-shadow,none)] ` +
  `[border:none] [background:var(--glass-ring-surface-bg,var(--glass-surface-bg,rgba(0,0,0,0.25)))] text-[color:var(--glass-surface-text,#f2f2f2)] ` +
  `shadow-[var(--glass-shell-shadow,none)] backdrop-blur-[var(--glass-modal-blur,var(--glass-blur-radius,1rem))] ` +
  `[-webkit-backdrop-filter:blur(var(--glass-modal-blur,var(--glass-blur-radius,1rem)))] [scrollbar-gutter:stable_both-edges] px-[1.35rem] pt-[0.35rem] pb-[1.25rem] ` +
  `max-[768px]:[scrollbar-gutter:auto] max-[768px]:[--glass-ring-pad-x:clamp(0.38rem,1.5vw,0.54rem)] max-[768px]:rounded-[1.2rem] max-[768px]:px-[0.38rem] max-[768px]:pb-[0.76rem] ${glassPageMobileCardClassName}`;

const bodyClassName =
  "mx-auto grid w-full gap-[1.05rem] px-[0.05rem] pt-[0.48rem] pb-[1.1rem] max-[768px]:gap-[0.82rem] max-[768px]:px-0 max-[768px]:pb-[0.88rem]";
const introClassName =
  "mx-auto m-0 max-w-[54rem] text-left text-[1.2rem] leading-[1.66] tracking-[0] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] max-[768px]:px-[0.5rem] max-[768px]:text-[1.16rem] max-[768px]:leading-[1.58]";
const gridClassName =
  "mx-auto grid w-full max-w-[54rem] grid-cols-1 gap-[1rem] max-[768px]:gap-[0.82rem]";
const cardClassName =
  "rounded-[1.05rem] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.035)] px-[1rem] pt-[0.76rem] pb-[0.86rem] light:border-[rgba(122,58,56,0.11)] light:bg-[rgba(255,255,255,0.32)] max-[768px]:rounded-[0.9rem] max-[768px]:px-[0.78rem] max-[768px]:pt-[0.62rem] max-[768px]:pb-[0.72rem]";
const cardBodyClassName =
  "m-0 text-[1.12rem] leading-[1.66] tracking-[0] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] max-[768px]:text-[1.08rem] max-[768px]:leading-[1.58]";

const featureKeys = [
  "workspace",
  "knowledge_base",
  "assistants_agents",
  "privacy_safety",
  "crisis_routing",
  "youth_child_safety",
  "trusted_access_security",
  "workflow_orchestration",
  "domain_knowledge",
  "sources",
  "help",
  "service_card",
  "rooms",
  "drafting",
  "analysis",
  "research",
  "documents",
  "pre_inquiry",
  "intake",
  "kovisioon",
  "materials_adding",
  "service_card_listing",
  "service_profile"
];

export default function VoimalusedBody() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const panelRef = useRef(null);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const root = document.documentElement;
    const body = document.body;

    root?.classList.add("framework-page-scroll-lock");
    body?.classList.add("framework-page-scroll-lock");

    return () => {
      root?.classList.remove("framework-page-scroll-lock");
      body?.classList.remove("framework-page-scroll-lock");
    };
  }, []);

  const transitionOptions = {
    glassRingTilt: "left",
    waitForGlassRingTilt: true,
    persistGlassRingTilt: false
  };

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      backWithTransition(router, transitionOptions);
      return;
    }

    pushWithTransition(router, localizePath("/", locale), transitionOptions);
  };

  const handleShellWheel = useCallback((event) => {
    const panel = panelRef.current;
    const target = event.target;
    if (!panel || panel.contains(target)) return;

    const maxScrollTop = panel.scrollHeight - panel.clientHeight;
    if (maxScrollTop <= 0) return;

    event.preventDefault();
    panel.scrollTop = Math.max(0, Math.min(maxScrollTop, panel.scrollTop + event.deltaY));
  }, []);

  return (
    <section className={shellClassName} lang={locale} onWheel={handleShellWheel}>
      <div ref={panelRef} className={panelClassName}>
        <GlassSubpageHeader
          onBack={handleBack}
          backAriaLabel={t("buttons.back_previous")}
          titleId="voimalused-title"
        >
          {t("about.features_page.title")}
        </GlassSubpageHeader>

        <div className={bodyClassName}>
          <p className={introClassName}>{t("about.features_page.intro")}</p>

          <div className={gridClassName} aria-labelledby="voimalused-title">
            {featureKeys.map((key) => (
              <article key={key} className={cardClassName}>
                <h2 className={`${policySectionHeadingClassName} !mt-0 mb-[0.8rem] max-[768px]:!mt-0 max-[768px]:mb-[0.68rem]`}>
                  {t(`about.features_page.items.${key}.title`)}
                </h2>
                <p className={cardBodyClassName}>
                  {t(`about.features_page.items.${key}.body`)}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
