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
import Button from "@/components/ui/Button";
const pageShellClassName = glassPageShellCenteredClassName;
const ringClassName = cn(glassPageRingCenteredClassName, "justify-start", "glass-ring--desktop-stable");
const titleClassName = glassPageTitleClassName;
const descriptionClassName = "error-page-description mt-[0.75rem] text-[clamp(1.05rem,2vw,1.2rem)] text-center max-w-[clamp(18rem,50vw,30rem)]";
const actionCenterClassName = "flex w-full flex-1 items-center justify-center pb-[clamp(1.2rem,3vh,1.8rem)]";
const textBlockClassName = "mt-[clamp(2.2rem,5.8vh,3.4rem)] flex w-full flex-col items-center";
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
          <Button type="button" onClick={() => reset()} className="max-[768px]:!min-h-[3.2rem] max-[768px]:!text-[1.18rem]">
            {t("errors.retry")}
          </Button>
        </div>
      </GlassRing>
    </section>;
}
