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
import { localizePath } from "@/lib/localizePath";
import { backWithTransition, pushWithTransition } from "@/lib/routeTransition";

const shellClassName =
  `${glassPageShellCenteredClassName} ${glassPrimaryButtonToneClassName} ` +
  "relative flex h-[100dvh] min-h-[100dvh] max-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden overscroll-none px-[1rem] py-[1rem] max-[768px]:[--mobile-glass-card-gap:clamp(0.14rem,0.8vw,0.22rem)] max-[768px]:justify-start max-[768px]:px-0 max-[768px]:py-[0.14rem]";

const panelClassName =
  `direct-scroll-surface relative z-[21] w-full !max-w-[50rem] max-h-[calc(100dvh-2rem)] overflow-x-hidden overflow-y-auto overscroll-contain rounded-[2rem] ` +
  `[--glass-modal-border:none] [--glass-modal-shadow:var(--glass-shell-shadow,none)] ` +
  `[border:none] [background:var(--glass-ring-surface-bg,var(--glass-surface-bg,rgba(0,0,0,0.25)))] text-[color:var(--glass-surface-text,#f2f2f2)] ` +
  `shadow-[var(--glass-shell-shadow,none)] backdrop-blur-[var(--glass-modal-blur,var(--glass-blur-radius,1rem))] ` +
  `[-webkit-backdrop-filter:blur(var(--glass-modal-blur,var(--glass-blur-radius,1rem)))] [scrollbar-gutter:stable_both-edges] px-[1.45rem] pt-[0.35rem] pb-[1.25rem] ` +
  `max-[768px]:[scrollbar-gutter:auto] max-[768px]:[--glass-ring-pad-x:clamp(0.38rem,1.5vw,0.54rem)] max-[768px]:rounded-[1.2rem] max-[768px]:px-[0.38rem] max-[768px]:pb-[0.76rem] ${glassPageMobileCardClassName}`;

const bodyClassName =
  "mx-auto grid w-full max-w-none gap-[0.88rem] px-[0.05rem] pt-[0.48rem] pb-[1.1rem] max-[768px]:w-full max-[768px]:max-w-none max-[768px]:gap-[0.76rem] max-[768px]:px-0 max-[768px]:pb-[0.88rem]";
const storyCardClassName =
  "grid gap-[0.82rem] px-[0.52rem] py-[0.98rem] max-[768px]:gap-[0.7rem] max-[768px]:px-[0.36rem] max-[768px]:py-[0.74rem]";
const bylineClassName =
  "m-0 mb-[0.45rem] text-[1.18rem] font-[500] leading-[1.5] tracking-[0.018em] text-[color:var(--title-color,var(--brand-primary))] max-[768px]:mb-[0.52rem] max-[768px]:text-[1.18rem]";
const paragraphClassName =
  "m-0 text-[1.14rem] leading-[1.72] tracking-[0.018em] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] max-[768px]:text-[1.16rem]";

export default function AutoriltBody() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const panelRef = useRef(null);
  const pageTitle = t("about.author.title");
  const paragraphs = t("about.author.paragraphs");
  const storyParagraphs = Array.isArray(paragraphs) ? paragraphs : [];

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
          titleId="autorilt-title"
        >
          {pageTitle}
        </GlassSubpageHeader>

        <div className={bodyClassName}>
          <article className={storyCardClassName} aria-labelledby="autorilt-title">
            <p className={bylineClassName}>{t("about.author.byline")}</p>
            {storyParagraphs.map((paragraph, index) => (
              <p key={index} className={paragraphClassName}>
                {paragraph}
              </p>
            ))}
          </article>
        </div>
      </div>
    </section>
  );
}
