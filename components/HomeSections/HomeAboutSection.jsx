"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AppLink from "@/components/ui/Link";
import { linkBrandInlineClass, linkRichTextBase } from "@/components/ui/linkStyles";
import { cn } from "@/components/ui/cn";
import useT from "@/components/i18n/useT";
import { useI18n } from "@/components/i18n/I18nProvider";
import RichText from "@/components/i18n/RichText";
import { localizePath } from "@/lib/localizePath";
import { pushWithTransition } from "@/lib/routeTransition";

const homeCircleLinkClassName =
  "home-link inline-block align-top w-auto max-w-full text-[clamp(1.28rem,1.95vw,1.5rem)] tracking-[0.01em] leading-[1.1] text-center font-medium text-[color:var(--home-link-color,var(--brand-primary))] [--link-brand-text:var(--home-link-color,var(--brand-primary))] [--link-brand-border-hover:var(--home-link-color,var(--brand-primary))] [--link-brand-shadow-hover:rgba(197,113,113,0.35)]";
const HOME_PANEL_FADE_DURATION_MS = 900;
const HOME_PANEL_BLUR_REVEAL_MS = 780;
const HOME_PANEL_STAGGER_MS = 120;
const homeQuickLinkClassName =
  "home-quick-link peer group home-link pointer-events-auto !inline-flex !h-auto !min-h-0 appearance-none items-center justify-center !bg-transparent !p-0 text-center !leading-none [line-height:0] !no-underline !rounded-none !border-0 !shadow-none !text-[color:var(--brand-primary,#c57171)] transition-transform duration-200 ease-out hover:!border-transparent hover:!shadow-none hover:!text-[color:var(--brand-primary,#c57171)] focus-visible:!border-transparent focus-visible:!shadow-none focus-visible:!text-[color:var(--brand-primary,#c57171)] focus-visible:outline-none active:scale-[0.985] active:!border-transparent active:!shadow-none light:!text-[#7a3a38] hc:!text-[color:var(--hc-accent)]";
const homeQuickIconClassName =
  "block h-[clamp(3.12rem,4.25vw,3.72rem)] w-[clamp(3.12rem,4.25vw,3.72rem)] shrink-0 text-[#c57171] stroke-current opacity-95 transform-gpu will-change-transform transition-transform duration-[340ms] ease-out group-hover:scale-[1.1] group-focus-visible:scale-[1.1] light:text-[#7a3a38] hc:text-[color:var(--hc-accent)] [vertical-align:top]";
const homeQuickLabelClassName =
  "home-quick-label mt-[0.58rem] block w-[max-content] max-w-none translate-y-0 whitespace-nowrap text-center text-[clamp(1.18rem,1.52vw,1.36rem)] font-medium leading-[1.18] tracking-[0.04em] text-[#c57171] opacity-0 pointer-events-none transform-gpu will-change-opacity peer-hover:opacity-100 peer-focus-visible:opacity-100 light:text-[#7a3a38] hc:text-[color:var(--hc-accent)] max-[768px]:mt-[0.48rem] max-[768px]:min-h-[2.25em] max-[768px]:w-auto max-[768px]:max-w-[9.8rem] max-[768px]:whitespace-normal max-[768px]:text-center max-[768px]:text-[clamp(1.08rem,4.45vw,1.26rem)] max-[768px]:tracking-[0.03em] max-[768px]:[text-wrap:balance]";
const homeQuickLabelStyle = {
  transition: "opacity 640ms cubic-bezier(0.16, 1, 0.3, 1)"
};

function HomeQuickLinkIcon({ name, className }) {
  const commonProps = {
    viewBox: "3 3 18 18",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 0.86,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
    focusable: "false",
    className
  };

  if (name === "book") {
    return (
      <svg {...commonProps}>
        <path d="M12 6.65v12.7" />
        <path d="M4.65 6.05c2.18-.56 4.6-.08 7.35 1.43v11.87c-2.75-1.51-5.17-1.99-7.35-1.43V6.05Z" />
        <path d="M19.35 6.05c-2.18-.56-4.6-.08-7.35 1.43v11.87c2.75-1.51 5.17-1.99 7.35-1.43V6.05Z" />
      </svg>
    );
  }

  if (name === "file") {
    return (
      <svg {...commonProps}>
        <path d="M7.25 4.05h5.92c.32 0 .62.13.85.35l3.43 3.43c.22.23.35.53.35.85V19.2c0 .47-.38.85-.85.85h-9.7a.85.85 0 0 1-.85-.85V4.9c0-.47.38-.85.85-.85Z" />
        <path d="M13.35 4.25v3.72c0 .32.26.58.58.58h3.68" />
        <path d="M9.65 12.1h4.65" />
        <path d="M9.65 15.2h4.65" />
        <path d="M9.65 9h1.55" />
      </svg>
    );
  }

  if (name === "shield") {
    return (
      <svg {...commonProps}>
        <path d="M12 3.92 6.1 6.17v5.05c0 3.9 2.42 7.12 5.9 8.48 3.48-1.36 5.9-4.58 5.9-8.48V6.17L12 3.92Z" />
        <circle cx="12" cy="10.15" r="1.62" />
        <path d="M8.95 15.55c.7-1.62 1.72-2.42 3.05-2.42s2.35.8 3.05 2.42" />
      </svg>
    );
  }

  if (name === "tag") {
    return (
      <svg {...commonProps}>
        <path d="M5.45 5.35h5.28c.42 0 .82.17 1.12.47l7 7c.4.4.4 1.06 0 1.46l-4.57 4.57c-.4.4-1.06.4-1.46 0l-7-7a1.58 1.58 0 0 1-.47-1.12V5.98c0-.35.28-.63.63-.63Z" />
        <circle cx="8.85" cy="8.78" r="0.42" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (name === "chart") {
    return (
      <svg {...commonProps}>
        <path d="M5.2 19.2V5.4" />
        <path d="M5.2 19.2h13.6" />
        <path d="M8.15 15.6v-4.2" />
        <path d="M12 15.6V8.2" />
        <path d="M15.85 15.6v-6" />
      </svg>
    );
  }

  if (name === "database") {
    return (
      <svg {...commonProps}>
        <ellipse cx="12" cy="5.7" rx="6.4" ry="2.55" />
        <path d="M5.6 5.7v5.05c0 1.4 2.86 2.55 6.4 2.55s6.4-1.15 6.4-2.55V5.7" />
        <path d="M5.6 10.75v5.05c0 1.4 2.86 2.55 6.4 2.55s6.4-1.15 6.4-2.55v-5.05" />
      </svg>
    );
  }

  if (name === "audit") {
    return (
      <svg {...commonProps}>
        <path d="M12 3.65 5.55 6.1v5.1c0 4.18 2.7 7.65 6.45 8.95 3.75-1.3 6.45-4.77 6.45-8.95V6.1L12 3.65Z" />
        <path d="m9.2 12.2 1.9 1.9 3.95-4.35" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <rect x="4.35" y="6.35" width="15.3" height="11.3" rx="1.15" />
      <path d="m5.25 7.25 6.75 5.52 6.75-5.52" />
    </svg>
  );
}

export default function HomeAboutSection({
  id = "meist",
  className,
  showAdminLinks = false,
  animateIntro = true
}) {
  const router = useRouter();
  const t = useT();
  const { locale } = useI18n();
  const aboutHeadingId = `${id}-title`;
  const beforeHeadingId = `${id}-before-title`;
  const ctaTitle = t("about.cta.title");
  const aboutParagraphKeys = [
    "paragraph1",
    "paragraph2",
    "paragraph3",
    "paragraph4",
    "paragraph5",
    "paragraph6",
    "paragraph7",
    "paragraph8"
  ];
  const aboutParagraphs = aboutParagraphKeys
    .map((key) => ({
      key,
      value: t(`about.intro.${key}`)
    }))
    .filter(({ key, value }) => value && value !== `about.intro.${key}`);
  const aboutScrollRef = useRef(null);
  const [aboutFade, setAboutFade] = useState({ top: false, bottom: false });
  const [beforeView, setBeforeView] = useState("links");
  const [mobileQuickLabelKey, setMobileQuickLabelKey] = useState(null);
  const [aboutIntroDone, setAboutIntroDone] = useState(() => !animateIntro);
  const [beforeIntroDone, setBeforeIntroDone] = useState(() => !animateIntro);
  const [aboutBlurReady, setAboutBlurReady] = useState(() => !animateIntro);
  const [beforeBlurReady, setBeforeBlurReady] = useState(() => !animateIntro);
  const oskaLinkClassName = cn(
    linkRichTextBase,
    "home-link text-[clamp(1.08rem,1.5vw,1.25rem)] leading-[1.1] text-[color:var(--home-link-color,var(--brand-primary))] [--link-brand-text:var(--home-link-color,var(--brand-primary))] [--link-color:var(--home-link-color,var(--brand-primary))] [--link-brand-border-hover:transparent] [--link-brand-shadow-hover:transparent] hover:border-transparent hover:shadow-none active:border-transparent active:shadow-none focus-visible:border-transparent focus-visible:shadow-none"
  );
  const isRussianLocale = locale === "ru";
  const adminFrameworkLinkLabel =
    locale === "et"
      ? "Kinnituste audit"
      : locale === "ru"
        ? "Аудит подтверждений"
        : "Acceptances audit";
  const homeCircleLinkResponsiveClassName = cn(
    homeCircleLinkClassName,
    "w-auto max-w-full whitespace-normal break-words [text-wrap:balance] px-[0.16em] py-[0.03em]",
    "max-[768px]:max-w-[min(72vw,19.5rem)]",
    isRussianLocale &&
      "max-[768px]:max-w-[min(80vw,23rem)] max-[768px]:text-[clamp(1.12rem,4.45vw,1.32rem)] max-[768px]:leading-[1.12] max-[768px]:tracking-[0.005em]"
  );
  const contactCompany = t("about.contact.company");
  const contactRegistryValue = t("about.contact.registry_value");
  const contactAddressValue = t("about.contact.address_value");
  const contactEmailValue = t("about.contact.email_value");
  const contactEmailLinkClassName = cn(
    "inline-block bg-transparent border-0 shadow-none rounded-none no-underline cursor-default",
    "text-[clamp(1.22rem,1.74vw,1.38rem)] max-[768px]:text-[clamp(1.14rem,5vw,1.3rem)] leading-[1.22] max-[768px]:leading-[1.34] tracking-[0.01em]",
    "text-[color:var(--home-link-color,var(--brand-primary))]",
    "transition-colors duration-150",
    "light:!text-[color:var(--home-link-color,var(--brand-primary))]",
    "hc:!text-[color:var(--hc-accent)]"
  );

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const prefersReducedMotion =
      window.document?.documentElement?.dataset?.reduceMotion === "1" ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    if (!animateIntro || prefersReducedMotion) {
      setAboutIntroDone(true);
      setBeforeIntroDone(true);
      setAboutBlurReady(true);
      setBeforeBlurReady(true);
      return undefined;
    }

    setAboutIntroDone(false);
    setBeforeIntroDone(false);
    setAboutBlurReady(false);
    setBeforeBlurReady(false);

    const aboutBlurTimer = window.setTimeout(() => {
      setAboutBlurReady(true);
    }, HOME_PANEL_BLUR_REVEAL_MS);
    const beforeBlurTimer = window.setTimeout(() => {
      setBeforeBlurReady(true);
    }, HOME_PANEL_BLUR_REVEAL_MS + HOME_PANEL_STAGGER_MS);
    const aboutDoneTimer = window.setTimeout(() => {
      setAboutIntroDone(true);
    }, HOME_PANEL_FADE_DURATION_MS);
    const beforeDoneTimer = window.setTimeout(() => {
      setBeforeIntroDone(true);
    }, HOME_PANEL_FADE_DURATION_MS + HOME_PANEL_STAGGER_MS);

    return () => {
      window.clearTimeout(aboutBlurTimer);
      window.clearTimeout(beforeBlurTimer);
      window.clearTimeout(aboutDoneTimer);
      window.clearTimeout(beforeDoneTimer);
    };
  }, [animateIntro]);

  useEffect(() => {
    const scrollEl = aboutScrollRef.current;
    if (!scrollEl || typeof window === "undefined") return;

    const updateFade = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollEl;
      const maxScrollTop = scrollHeight - clientHeight;
      setAboutFade({
        top: scrollTop > 6,
        bottom: maxScrollTop - scrollTop > 6
      });
    };

    updateFade();
    scrollEl.addEventListener("scroll", updateFade, { passive: true });
    window.addEventListener("resize", updateFade);

    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateFade) : null;
    ro?.observe(scrollEl);

    return () => {
      scrollEl.removeEventListener("scroll", updateFade);
      window.removeEventListener("resize", updateFade);
      ro?.disconnect?.();
    };
  }, [aboutParagraphs.length]);

  const openGlassPage = (event, pathname) => {
    if (event.defaultPrevented) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (event.button !== 0) return;
    event.preventDefault();
    pushWithTransition(router, localizePath(pathname, locale), {
      glassRingTilt: "right",
      waitForGlassRingTilt: true,
      persistGlassRingTilt: false
    });
  };
  const aboutTopFade = aboutFade.top ? "2.2rem" : "0px";
  const aboutBottomFade = aboutFade.bottom ? "5rem" : "0px";
  const shouldFadeAbout = animateIntro && !aboutIntroDone;
  const shouldFadeBefore = animateIntro && !beforeIntroDone;
  const aboutMaskImage = `linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.08) calc(${aboutTopFade} * 0.16), rgba(0,0,0,0.28) calc(${aboutTopFade} * 0.38), rgba(0,0,0,0.62) calc(${aboutTopFade} * 0.68), rgba(0,0,0,0.9) calc(${aboutTopFade} * 0.9), #000 ${aboutTopFade}, #000 calc(100% - ${aboutBottomFade}), rgba(0,0,0,0.92) calc(100% - calc(${aboutBottomFade} * 0.86)), rgba(0,0,0,0.68) calc(100% - calc(${aboutBottomFade} * 0.62)), rgba(0,0,0,0.34) calc(100% - calc(${aboutBottomFade} * 0.34)), rgba(0,0,0,0.1) calc(100% - calc(${aboutBottomFade} * 0.12)), rgba(0,0,0,0) 100%)`;
  const openBeforeContact = (event) => {
    event.preventDefault();
    setBeforeView((currentView) => (currentView === "contact" ? "links" : "contact"));
  };
  const quickLinks = [
    {
      key: "guide",
      href: "/kasutusjuhend",
      label: t("about.guide.jump_link"),
      icon: "book",
      onClick: (event) => openGlassPage(event, "/kasutusjuhend")
    },
    {
      key: "terms",
      href: "/kasutustingimused",
      label: t("about.links.terms"),
      icon: "file",
      onClick: (event) => openGlassPage(event, "/kasutustingimused")
    },
    {
      key: "privacy",
      href: "/privaatsustingimused",
      label: t("about.links.privacy"),
      icon: "shield",
      onClick: (event) => openGlassPage(event, "/privaatsustingimused")
    },
    ...(showAdminLinks
      ? [
          {
            key: "analytics",
            href: "/admin/analytics",
            label: t("about.links.analytics"),
            icon: "chart"
          },
          {
            key: "admin",
            href: "/admin/rag",
            label: t("about.links.admin"),
            icon: "database"
          },
          {
            key: "framework-acceptances",
            href: "/admin/framework-acceptances",
            label: adminFrameworkLinkLabel,
            icon: "audit"
          }
        ]
      : []),
    {
      key: "pricing",
      href: "/hinnastus",
      label: t("about.links.pricing"),
      icon: "tag",
      onClick: (event) => openGlassPage(event, "/hinnastus")
    },
    {
      key: "contact",
      label: t("about.contact.title"),
      icon: "mail",
      type: "button",
      onClick: openBeforeContact
    }
  ];
  const handleQuickLinkClick = (event, item) => {
    const isMobileQuickGrid =
      typeof window !== "undefined" &&
      window.matchMedia?.("(max-width: 768px)")?.matches;

    if (isMobileQuickGrid && mobileQuickLabelKey !== item.key) {
      event.preventDefault();
      setMobileQuickLabelKey(item.key);
      return;
    }

    item.onClick?.(event);
  };
  return (
    <section
      id={id}
      role="region"
      aria-labelledby={aboutHeadingId}
      className={cn(
        "home-section",
        "relative z-30 w-full overflow-visible py-[clamp(2.8rem,7vw,5rem)] pb-[clamp(0.6rem,1.6vw,1rem)] max-[768px]:pt-[clamp(1.2rem,4.2vw,2rem)] max-[768px]:pb-[clamp(0.4rem,1.2vw,0.8rem)] touch-pan-y",
        className
      )}
    >
      <div
        className={cn(
          "relative z-[1] mx-auto w-[min(92vw,58rem)] flex flex-col gap-[1.5rem]"
        )}
      >
        <div
          data-blur-ready={aboutBlurReady ? "true" : "false"}
          className={cn(
            "home-glass-panel home-about-panel relative [background:var(--glass-ring-surface-bg,var(--glass-surface-bg,rgba(0,0,0,0.25)))] backdrop-blur-[var(--glass-blur-radius,1rem)] [-webkit-backdrop-filter:blur(var(--glass-blur-radius,1rem))] rounded-t-[clamp(1.25rem,2.6vw,2.4rem)] rounded-b-[clamp(0.9rem,1.7vw,1.35rem)] shadow-[var(--glass-shell-shadow,none)] [border:none] px-[clamp(0.86rem,2.05vw,1.72rem)] pt-[clamp(1.4rem,2.4vw,2.15rem)] pb-[clamp(0.2rem,0.5vw,0.5rem)] max-[768px]:px-[clamp(1rem,4.8vw,1.35rem)]",
            shouldFadeAbout ? "is-intro-fading" : null
          )}
          style={
            shouldFadeAbout
              ? {
                  animationDuration: `${HOME_PANEL_FADE_DURATION_MS}ms`,
                  animationTimingFunction: "cubic-bezier(0.61,0,0.19,1)",
                  animationFillMode: "forwards"
                }
              : undefined
          }
        >
          <h2
            id={aboutHeadingId}
            tabIndex={0}
            className={cn(
              "home-about-title text-center text-[clamp(1.9rem,3.9vw,2.6rem)] font-headline tracking-[0.02em] mt-0 mb-[0.45rem] max-[768px]:mb-[0.3rem] text-[color:var(--home-title-color)]"
            )}
          >
            {t("about.title")}
          </h2>
          <div className="relative mx-auto w-full max-w-[54.5rem] max-[768px]:max-w-[52rem]">
            <div
              ref={aboutScrollRef}
              lang={locale}
              className="home-about-scrollbox relative overflow-y-auto px-[clamp(0.14rem,0.38vw,0.34rem)] pt-[0.05rem] pb-[0.3rem] max-[768px]:px-[0.1rem] max-[768px]:pt-[0rem] max-[768px]:pb-[0.45rem] text-left text-[clamp(1.1rem,1.6vw,1.28rem)] max-[768px]:text-[clamp(1.12rem,4.25vw,1.32rem)] leading-[1.7] max-[768px]:leading-[1.58] tracking-[0.03em] max-[768px]:tracking-[0.006em] space-y-[0.95rem] [color:var(--home-prose-color)] break-words hyphens-auto max-[768px]:hyphens-none max-[768px]:[--about-scroll-max-height:min(76vh,44.5rem)]"
              style={{
                maxHeight: "var(--about-scroll-max-height, min(71vh, 41rem))",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                WebkitMaskImage: aboutMaskImage,
                maskImage: aboutMaskImage
              }}
            >
              {aboutParagraphs.map(({ key, value }) => (
                <div key={key}>
                  <RichText
                    as="div"
                    className="[&>p]:m-0"
                    value={value}
                    replacements={{
                      oska: {
                        open: `<a href="https://uuringud.oska.kutsekoda.ee/uuringud/sotsiaaltoo-seirearuande" target="_blank" rel="noreferrer" class="${oskaLinkClassName}">`,
                        close: "</a>"
                      }
                    }}
                  />
                </div>
              ))}
              <p className="home-about-features-link-row m-0 !mt-[0.42rem] pb-[clamp(0.82rem,1.8vw,1.2rem)] text-center max-[768px]:!mt-[0.36rem] max-[768px]:flex max-[768px]:justify-center max-[768px]:pb-[clamp(1rem,4vw,1.35rem)] max-[768px]:text-center">
                <AppLink
                  href="/voimalused"
                  onClick={(event) => openGlassPage(event, "/voimalused")}
                  className={cn(homeCircleLinkResponsiveClassName, linkBrandInlineClass)}
                >
                  {t("about.links.features")}
                </AppLink>
              </p>
            </div>
          </div>
        </div>
        <section
          aria-labelledby={beforeHeadingId}
          data-blur-ready={beforeBlurReady ? "true" : "false"}
          className={cn(
            "home-before-links relative mx-auto mt-[clamp(2.15rem,4.5vw,3.55rem)] w-[min(92vw,58rem)] overflow-visible bg-transparent px-[clamp(0.3rem,1vw,0.75rem)] pt-[clamp(0.72rem,1.65vw,1.25rem)] pb-[clamp(0.55rem,1.6vw,1.25rem)] text-center",
            shouldFadeBefore ? "is-intro-fading" : null
          )}
          style={
            shouldFadeBefore
              ? {
                  animationDuration: `${HOME_PANEL_FADE_DURATION_MS}ms`,
                  animationTimingFunction: "cubic-bezier(0.61,0,0.19,1)",
                  animationDelay: `${HOME_PANEL_STAGGER_MS}ms`,
                  animationFillMode: "forwards"
                }
              : undefined
          }
        >
          <h3 id={beforeHeadingId} className="sr-only">
            {ctaTitle}
          </h3>
          <ul className="m-0 flex w-full flex-wrap list-none items-start justify-center gap-x-[clamp(0.55rem,1.55vw,1.35rem)] gap-y-[clamp(0.45rem,1.25vw,0.95rem)] overflow-visible p-0 max-[768px]:grid max-[768px]:grid-cols-2 max-[768px]:gap-x-[clamp(0.65rem,4vw,1rem)] max-[768px]:gap-y-[clamp(0.95rem,4.8vw,1.45rem)] max-[768px]:[grid-auto-rows:auto] min-[430px]:max-[768px]:grid-cols-3">
            {quickLinks.map((item) => {
              const isContactItem = item.key === "contact";

              return (
                <li
                  key={item.key}
                  className={cn(
                    "pointer-events-none relative flex min-h-[clamp(5.7rem,7.3vw,6.45rem)] min-w-[clamp(7.2rem,10.6vw,9.55rem)] flex-[0_1_clamp(7.2rem,10.6vw,9.55rem)] flex-col items-center justify-start max-[768px]:min-h-0 max-[768px]:min-w-0 max-[768px]:flex-none max-[768px]:justify-start",
                    isContactItem && "max-[768px]:col-span-full max-[768px]:justify-self-center",
                    isContactItem && beforeView === "contact" && "max-[768px]:hidden"
                  )}
                >
                  {item.type === "button" ? (
                    <button
                      type="button"
                      onClick={(event) => handleQuickLinkClick(event, item)}
                      aria-label={item.label}
                      aria-expanded={beforeView === "contact"}
                      aria-controls={`${beforeHeadingId}-contact`}
                      className={cn("home-before-contact-button", homeQuickLinkClassName)}
                    >
                      <HomeQuickLinkIcon name={item.icon} className={homeQuickIconClassName} />
                    </button>
                  ) : (
                    <AppLink
                      href={item.href}
                      onClick={(event) => handleQuickLinkClick(event, item)}
                      aria-label={item.label}
                      className={homeQuickLinkClassName}
                    >
                      <HomeQuickLinkIcon name={item.icon} className={homeQuickIconClassName} />
                    </AppLink>
                  )}
                  <span
                    aria-hidden="true"
                    className={cn(
                      homeQuickLabelClassName,
                      mobileQuickLabelKey === item.key && "max-[768px]:opacity-100"
                    )}
                    style={homeQuickLabelStyle}
                  >
                    {item.label}
                  </span>
                </li>
              );
            })}
          </ul>
          {beforeView === "contact" ? (
            <div
              id={`${beforeHeadingId}-contact`}
              className="home-before-contact-copy mx-auto mt-[clamp(0.8rem,1.8vw,1.2rem)] flex w-[min(92vw,38rem)] flex-col items-center gap-[clamp(0.48rem,0.95vw,0.72rem)] border-t border-[color:var(--home-link-color,var(--brand-primary))] border-opacity-25 px-[clamp(0.8rem,2.2vw,1.4rem)] pt-[clamp(0.9rem,1.9vw,1.25rem)] text-center"
            >
              <p className="m-0 text-[clamp(1.08rem,1.48vw,1.26rem)] font-normal leading-[1.2] tracking-[0.015em] text-[color:var(--home-prose-color)]">
                {contactCompany}
              </p>
              <div className="m-0 flex w-full flex-col gap-[clamp(0.4rem,0.8vw,0.62rem)] text-[color:var(--home-prose-color)]">
                <p className="m-0 text-[clamp(1rem,1.3vw,1.14rem)] leading-[1.32] tracking-[0.01em]">
                  {contactRegistryValue}
                </p>
                <p className="m-0 text-[clamp(1rem,1.3vw,1.14rem)] leading-[1.36] tracking-[0.01em] [text-wrap:balance]">
                  {contactAddressValue}
                </p>
                <p className="m-0">
                  <span className={contactEmailLinkClassName}>
                    {contactEmailValue}
                  </span>
                </p>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </section>
  );
}
