"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";
import { localizePath } from "@/lib/localizePath";
import { pushWithTransition } from "@/lib/routeTransition";
const shellClassName = "mx-auto my-[clamp(1.4rem,3vw,2.4rem)] flex w-[min(100%,92vw)] max-w-[clamp(26rem,70vw,40rem)] flex-col items-center rounded-[1.5em] bg-[color:var(--glass-surface-bg)] px-[clamp(1.6rem,3.4vw,2.4rem)] pt-[clamp(1.4rem,3.4vw,2.2rem)] pb-[clamp(1.6rem,3.4vw,2.4rem)] text-center text-[color:var(--glass-surface-text,#f2f2f2)] backdrop-blur-[var(--glass-blur-radius)] light:text-[#2b2620] max-md:w-full max-md:max-w-none max-md:rounded-none max-md:my-0 max-md:px-[clamp(1rem,4vw,1.5rem)] max-md:pt-[calc(env(safe-area-inset-top,0px)+2.2rem)] max-md:pb-[clamp(2rem,8vw,2.6rem)]";
const titleClassName = "text-[2.05em] leading-[1.15] tracking-[0.03em] text-[color:var(--title-color,var(--brand-primary))] [text-shadow:var(--glass-modal-title-shadow)] [font-family:var(--font-aino-headline),var(--font-aino),Arial,sans-serif] font-[400]";
const descriptionClassName = "mt-[0.8em] mb-[1.4em] text-[1.2em]";
const backButtonWrapClassName = "flex items-center justify-center";
const backButtonClassName = "inline-flex h-[5.7rem] w-[5.7rem] items-center justify-center bg-transparent p-0 transition-transform duration-150 ease-out hover:scale-[1.12] focus-visible:outline-none active:scale-[0.98]";
const backIconClassName = "block h-[5.7rem] w-[5.7rem] bg-center bg-no-repeat [background-size:68%_68%] [background-image:url('/logo/tagasinupp.svg')] light:[background-image:url('/logo/tagasinupphele.svg')]";
export default function NotFound() {
  const router = useRouter();
  const {
    t,
    locale
  } = useI18n();
  return <div className={shellClassName}>
      <h1 className={titleClassName}>{t("notFound.title")}</h1>
      <p className={descriptionClassName}>
        {t("notFound.description")}
      </p>
      <div className={backButtonWrapClassName}>
        <button type="button" className={backButtonClassName} onClick={() => pushWithTransition(router, localizePath("/", locale))} aria-label={t("buttons.back_home")}>
          <span className={backIconClassName} />
        </button>
      </div>
    </div>;
}
