"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";
import { localizePath } from "@/lib/localizePath";
import { pushWithTransition } from "@/lib/routeTransition";
import BackButton from "@/components/ui/BackButton";
import GlassRing from "@/components/ui/GlassRing";
import { glassPageBackClassName, glassPageRingCenteredClassName, glassPageShellCenteredClassName, glassPageTitleClassName } from "@/components/ui/glassPageStyles";
import { cn } from "@/components/ui/cn";
const pageShellClassName = glassPageShellCenteredClassName;
const ringClassName = cn(glassPageRingCenteredClassName, "justify-start", "glass-ring--desktop-stable");
const titleClassName = glassPageTitleClassName;
const descriptionClassName = "error-page-description mt-[0.75rem] text-[clamp(1.05rem,2vw,1.2rem)] text-center max-w-[clamp(18rem,50vw,30rem)]";
const actionCenterClassName = "flex w-full flex-1 items-center justify-center pb-[clamp(1.2rem,3vh,1.8rem)]";
const textBlockClassName = "mt-[clamp(2.2rem,5.8vh,3.4rem)] flex w-full flex-col items-center";
const retryButtonClassName =
  "button inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-[1.15rem] py-[0.78rem] text-[1.12rem] font-[500] tracking-[0.03rem] min-h-[3.05rem] select-none relative overflow-hidden transition-[filter,border-color,box-shadow,opacity] duration-[560ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] cursor-pointer appearance-none [-webkit-appearance:none] backdrop-blur-[10px] backdrop-saturate-[120%] focus-visible:outline-none [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [-webkit-font-smoothing:antialiased] [text-rendering:geometricPrecision] " +
  "[border:var(--btn-primary-border)] text-[color:var(--btn-primary-text,rgba(248,252,255,0.92))] [background:var(--btn-primary-bg)] shadow-[var(--btn-primary-shadow)] before:content-[''] before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:[background:var(--btn-primary-bg-hover)] before:opacity-0 before:transition-opacity before:duration-[560ms] before:ease-[cubic-bezier(0.22,0.61,0.36,1)] [@media(hover:hover)]:hover:before:opacity-100 [@media(hover:hover)]:hover:shadow-[var(--btn-primary-shadow-hover)] focus-visible:before:opacity-100 focus-visible:shadow-[var(--btn-primary-shadow-focus)] active:[border:var(--btn-primary-border-active,var(--btn-primary-border))] active:[background:var(--btn-primary-bg-active)] active:before:opacity-0 active:shadow-[var(--btn-primary-shadow-active)] " +
  "max-[768px]:!min-h-[3.2rem] max-[768px]:!text-[1.18rem]";
export default function Error({
  error,
  reset
}) {
  const router = useRouter();
  const {
    t,
    locale
  } = useI18n();
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);
  const backLabel = t("buttons.back_previous");
  const handleBack = () => {
    try {
      if (typeof window !== "undefined" && window.history.length > 1) return router.back();
    } catch {}
    return pushWithTransition(router, localizePath("/", locale));
  };
  return <section className={`${pageShellClassName} error-page-shell`}>
      <GlassRing className={ringClassName}>
        <BackButton onClick={handleBack} ariaLabel={backLabel} className={glassPageBackClassName} />
        <div className={textBlockClassName}>
          <h1 className={titleClassName}>{t("errors.title")}</h1>
          <p className={descriptionClassName}>
            {t("errors.description")}
          </p>
        </div>
        <div className={actionCenterClassName}>
          <button type="button" className={retryButtonClassName} onClick={() => reset()}>
            <span className="relative z-[1] inline-flex items-center justify-center gap-[inherit]">
              {t("errors.retry")}
            </span>
          </button>
        </div>
      </GlassRing>
    </section>;
}
