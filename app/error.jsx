"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";
import { localizePath } from "@/lib/localizePath";
import { pushWithTransition } from "@/lib/routeTransition";
import BackButton from "@/components/ui/BackButton";
import Button from "@/components/ui/Button";
import GlassRing from "@/components/ui/GlassRing";
import { glassPageBackClassName, glassPageRingCenteredClassName, glassPageShellCenteredClassName, glassPageTitleClassName } from "@/components/ui/glassPageStyles";
const pageShellClassName = glassPageShellCenteredClassName;
const ringClassName = `${glassPageRingCenteredClassName} justify-start`;
const titleClassName = glassPageTitleClassName;
const descriptionClassName = "mt-[0.75rem] text-[clamp(1.05rem,2vw,1.2rem)] text-center max-w-[clamp(18rem,50vw,30rem)]";
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
  const backLabel = t("buttons.back_previous", "Tagasi eelmisele lehele");
  const handleBack = () => {
    try {
      if (typeof window !== "undefined" && window.history.length > 1) return router.back();
    } catch {}
    return pushWithTransition(router, localizePath("/", locale));
  };
  return <section className={pageShellClassName}>
      <GlassRing className={ringClassName}>
        <BackButton onClick={handleBack} ariaLabel={backLabel} className={glassPageBackClassName} />
        <div className={textBlockClassName}>
          <h1 className={titleClassName}>{t("errors.title")}</h1>
          <p className={descriptionClassName}>
            {t("errors.description")}
          </p>
        </div>
        <div className={actionCenterClassName}>
          <Button type="button" variant="primary" onClick={() => reset()}>
            {t("errors.retry")}
          </Button>
        </div>
      </GlassRing>
    </section>;
}
