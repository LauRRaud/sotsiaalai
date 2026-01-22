"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";
import RichText from "@/components/i18n/RichText";
import { localizePath } from "@/lib/localizePath";
import { pushWithTransition } from "@/lib/routeTransition";
const pageShellClassName = "mx-auto flex w-full min-h-[100dvh] flex-col items-center justify-start pt-[calc(env(safe-area-inset-top,0px)+1rem)] pb-[env(safe-area-inset-bottom,0px)] max-md:pt-[env(safe-area-inset-top,0px)] max-md:pb-[env(safe-area-inset-bottom,0px)]";
const circleClassName = "relative flex aspect-square w-[var(--profile-diameter)] h-[var(--profile-diameter)] min-w-[var(--profile-diameter)] min-h-[var(--profile-diameter)] max-w-[var(--profile-diameter)] max-h-[var(--profile-diameter)] flex-col items-center rounded-full bg-[color:var(--glass-surface-bg,rgba(0,0,0,0.25))] text-[color:var(--glass-surface-text,#f2f2f2)] shadow-none backdrop-blur-[var(--glass-blur-radius,1rem)] light:shadow-[0_18px_40px_rgba(0,0,0,0.16)] overflow-hidden px-[clamp(1.8rem,5vw,3.2rem)] pt-[clamp(1.6rem,4.2vw,2.6rem)] md:mt-[max(0px,calc((100dvh-var(--profile-diameter))/2-clamp(0.7rem,1.9vh,1.3rem)))] md:mb-0 md:mx-auto max-md:w-[100vw] max-md:h-[100dvh] max-md:max-w-[100vw] max-md:max-h-[100dvh] max-md:min-w-0 max-md:min-h-0 max-md:aspect-auto max-md:rounded-none max-md:overflow-visible max-md:pt-[clamp(0.4rem,1.4vh,1.1rem)]";
const titleClassName = "mt-[clamp(2.2rem,5.6vh,3.4rem)] text-center text-[2.15em] leading-[1.15] tracking-[0.03em] text-[color:var(--title-color,var(--brand-primary))] [text-shadow:var(--glass-modal-title-shadow)] [font-family:var(--font-aino-headline),var(--font-aino),Arial,sans-serif] font-[400]";
const contentClassName = "mt-[clamp(1.7rem,4.6vh,2.8rem)] flex w-full flex-1 flex-col items-center pb-[clamp(1rem,3vh,1.8rem)]";
const scrollClassName = "relative w-full max-w-[clamp(18rem,44vw,30rem)] max-h-[min(55vh,28.5rem)] overflow-y-auto pr-[0.1rem] text-left [scrollbar-width:none] [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0";
const sectionHeadingClassName = "mt-[1.2rem] text-[1.3rem] font-semibold tracking-[0.01em] text-[color:var(--title-color,var(--brand-primary))]";
const bodyTextClassName = "mt-[0.6rem] space-y-[0.85rem] text-[clamp(1.02rem,1.5vw,1.15rem)] leading-[1.7] text-[color:var(--glass-surface-text,#f2f2f2)] light:text-[#2b2620]";
const backButtonClassName = "absolute left-[calc(var(--hud-edge-left,0px)+clamp(0.1rem,1.2vw,0.8rem))] top-1/2 inline-flex h-[5.7rem] w-[5.7rem] -translate-y-1/2 items-center justify-center border-0 bg-transparent p-0 transition-transform duration-150 ease-out hover:scale-[1.15] focus-visible:outline-none active:scale-[0.98]";
const backIconClassName = "block h-[5.7rem] w-[5.7rem] bg-center bg-no-repeat [background-size:68%_68%] [background-image:url('/logo/tagasinupp.svg')] light:[background-image:url('/logo/tagasinupphele.svg')]";
const richLinkClassName = "inline-block text-[1.1em] font-[500] tracking-[0.03em] text-[#f2e3d4] px-[0.2em] py-[0.02em] rounded-[0.32em] border-2 border-transparent no-underline transition-[border,box-shadow] duration-150 hover:border-[#e1a0a0] hover:shadow-[0_0_0.4375rem_0_rgba(175,170,163,0.4)] focus-visible:border-[#e1a0a0] focus-visible:shadow-[0_0_0.4375rem_0_rgba(175,170,163,0.4)] light:text-[color:var(--link-color)] light:hover:border-[color:var(--link-color)] light:focus-visible:border-[color:var(--link-color)]";
const lawLinkReplacements = {
  aLawEst: {
    open: `<a href="https://www.riigiteataja.ee/akt/112072025014" target="_blank" rel="noopener noreferrer" class="${richLinkClassName}">`,
    close: "</a>"
  },
  aGdpr: {
    open: `<a href="https://eur-lex.europa.eu/legal-content/ET/TXT/HTML/?uri=CELEX:02016R0679-20160504" target="_blank" rel="noopener noreferrer" class="${richLinkClassName}">`,
    close: "</a>"
  },
  aDpa: {
    open: `<a href="https://www.aki.ee" target="_blank" rel="noopener noreferrer" class="${richLinkClassName}">`,
    close: "</a>"
  }
};
export default function PrivaatsusBody() {
  const router = useRouter();
  const {
    t,
    locale
  } = useI18n();
  const sections = [{
    heading: t("privacy.section1.heading"),
    content: [{
      value: t("privacy.section1.paragraph1")
    }, {
      value: t("privacy.section1.paragraph2"),
      replacements: lawLinkReplacements
    }]
  }, {
    heading: t("privacy.section2.heading"),
    content: [{
      value: t("privacy.section2.paragraph1")
    }, {
      value: t("privacy.section2.paragraph2")
    }, {
      value: t("privacy.section2.paragraph3")
    }]
  }, {
    heading: t("privacy.section3.heading"),
    content: [{
      value: t("privacy.section3.items"),
      type: "list"
    }]
  }, {
    heading: t("privacy.section4.heading"),
    content: [{
      value: t("privacy.section4.body")
    }]
  }, {
    heading: t("privacy.section5.heading"),
    content: [{
      value: t("privacy.section5.body")
    }]
  }, {
    heading: t("privacy.section6.heading"),
    content: [{
      value: t("privacy.section6.body")
    }]
  }, {
    heading: t("privacy.section7.heading"),
    content: [{
      value: t("privacy.section7.body")
    }]
  }, {
    heading: t("privacy.section8.heading"),
    content: [{
      value: t("privacy.section8.items"),
      type: "list",
      replacements: lawLinkReplacements
    }]
  }, {
    heading: t("privacy.section9.heading"),
    content: [{
      value: t("privacy.section9.body")
    }]
  }, {
    heading: t("privacy.section10.heading"),
    content: [{
      value: t("privacy.section10.body")
    }]
  }, {
    heading: t("privacy.section11.heading"),
    content: [{
      value: t("privacy.section11.body")
    }]
  }];
  return <section className={pageShellClassName} lang={locale}>
      <div className={circleClassName} role="region" aria-labelledby="privacy-title">
        <button type="button" className={backButtonClassName} onClick={() => {
        if (typeof window !== "undefined" && window.history.length > 1) {
          router.back();
        } else {
          pushWithTransition(router, localizePath("/", locale));
        }
      }} aria-label={t("buttons.back_home")}>
          <span className={backIconClassName} />
        </button>
        <h1 id="privacy-title" className={titleClassName}>
          {t("privacy.title")}
        </h1>
        <div className={contentClassName}>
          <div className={scrollClassName} style={{ zIndex: 0 }}>
            {sections.map(section => <div key={section.heading}>
                <h2 className={sectionHeadingClassName}>{section.heading}</h2>
                <div className={bodyTextClassName}>
                  {section.content.map((item, idx) => item.type === "list" ? <RichText key={`${section.heading}-list-${idx}`} as="ul" className="list-disc pl-[1.2rem] space-y-[0.4rem]" value={item.value} replacements={item.replacements || lawLinkReplacements} /> : <RichText key={`${section.heading}-p-${idx}`} as="div" value={item.value} replacements={item.replacements || {}} />)}
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
