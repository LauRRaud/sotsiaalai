"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";
import RichText from "@/components/i18n/RichText";
import { localizePath } from "@/lib/localizePath";
import { pushWithTransition } from "@/lib/routeTransition";
const pageShellClassName = "mx-auto flex w-full min-h-[100dvh] flex-col items-center justify-start pt-[calc(env(safe-area-inset-top,0px)+1rem)] pb-[env(safe-area-inset-bottom,0px)] max-md:pt-[env(safe-area-inset-top,0px)] max-md:pb-[env(safe-area-inset-bottom,0px)]";
const circleClassName = "relative flex aspect-square w-[var(--profile-diameter)] h-[var(--profile-diameter)] min-w-[var(--profile-diameter)] min-h-[var(--profile-diameter)] max-w-[var(--profile-diameter)] max-h-[var(--profile-diameter)] flex-col items-center rounded-full bg-[color:var(--glass-surface-bg,rgba(0,0,0,0.25))] text-[color:var(--glass-surface-text,#f2f2f2)] shadow-none backdrop-blur-[var(--glass-blur-radius,1rem)] light:shadow-[0_18px_40px_rgba(0,0,0,0.16)] overflow-hidden px-[clamp(1.8rem,5vw,3.2rem)] pt-[clamp(1.6rem,4.2vw,2.6rem)] md:mt-[max(0px,calc((100dvh-var(--profile-diameter))/2-clamp(0.7rem,1.9vh,1.3rem)))] md:mb-0 md:mx-auto max-md:w-[100vw] max-md:h-[100dvh] max-md:max-w-[100vw] max-md:max-h-[100dvh] max-md:min-w-0 max-md:min-h-0 max-md:aspect-auto max-md:rounded-none max-md:overflow-visible max-md:pt-[clamp(0.4rem,1.4vh,1.1rem)]";
const titleClassName = "mt-[clamp(2.2rem,5.6vh,3.4rem)] text-center text-[2.15em] leading-[1.15] tracking-[0.03em] text-[color:var(--title-color,var(--brand-primary))] [text-shadow:var(--glass-modal-title-shadow)]";
const contentClassName = "mt-[clamp(1.7rem,4.6vh,2.8rem)] flex w-full flex-1 flex-col items-center pb-[clamp(1rem,3vh,1.8rem)]";
const scrollClassName = "relative w-full max-w-[clamp(18rem,44vw,30rem)] max-h-[min(55vh,28.5rem)] overflow-y-auto pr-[0.1rem] text-left [scrollbar-width:none] [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0";
const sectionHeadingClassName = "mt-[1.2rem] text-[1.3rem] font-semibold tracking-[0.01em] text-[color:var(--title-color,var(--brand-primary))]";
const bodyTextClassName = "mt-[0.6rem] space-y-[0.85rem] text-[clamp(1.02rem,1.5vw,1.15rem)] leading-[1.7] text-[color:var(--glass-surface-text,#f2f2f2)] light:text-[#2b2620]";
const backButtonClassName = "absolute left-[calc(var(--hud-edge-left,0px)+clamp(0.1rem,1.2vw,0.8rem))] top-1/2 inline-flex h-[5.7rem] w-[5.7rem] -translate-y-1/2 items-center justify-center border-0 bg-transparent p-0 transition-transform duration-150 ease-out hover:scale-[1.15] focus-visible:outline-none active:scale-[0.98]";
const backIconClassName = "block h-[5.7rem] w-[5.7rem] bg-center bg-no-repeat [background-size:68%_68%] [background-image:url('/logo/tagasinupp.svg')] light:[background-image:url('/logo/tagasinupphele.svg')]";
const emailReplacement = {
  aEmail: {
    open: '<a href="mailto:info@sotsiaal.ai" class="link-brand">',
    close: "</a>"
  }
};
export default function KasutustingimusedBody() {
  const router = useRouter();
  const {
    t,
    locale
  } = useI18n();
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
      <div className={circleClassName} role="region" aria-labelledby="terms-title">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[5.5rem] bg-gradient-to-b from-[rgba(8,10,16,0.85)] to-transparent light:from-[rgba(255,255,255,0.92)]" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[5.5rem] bg-gradient-to-t from-[rgba(8,10,16,0.85)] to-transparent light:from-[rgba(255,255,255,0.92)]" aria-hidden="true" />
        <button type="button" className={backButtonClassName} onClick={() => typeof window !== "undefined" && window.history.length > 1 ? router.back() : pushWithTransition(router, localizePath("/", locale))} aria-label={t("buttons.back_home")}>
          <span className={backIconClassName} />
        </button>
        <h1 id="terms-title" className={`glass-title ${titleClassName}`}>
          {t("terms.title")}
        </h1>
        <div className={contentClassName}>
          <div className={scrollClassName} style={{ zIndex: 0 }}>
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
      </div>
    </section>;
}
