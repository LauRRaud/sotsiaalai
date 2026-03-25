"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AppLink from "@/components/ui/Link";
import InstallAppLink from "@/components/pwa/InstallAppLink";
import { linkBrandInlineClass, linkRichTextBase } from "@/components/ui/linkStyles";
import { cn } from "@/components/ui/cn";
import useT from "@/components/i18n/useT";
import { useI18n } from "@/components/i18n/I18nProvider";
import RichText from "@/components/i18n/RichText";
import BackButton from "@/components/ui/BackButton";
import { localizePath } from "@/lib/localizePath";
import { pushWithTransition } from "@/lib/routeTransition";

const homeCircleLinkClassName =
  "home-link inline-block align-top w-auto max-w-full text-[clamp(1.28rem,1.95vw,1.5rem)] tracking-[0.01em] leading-[1.1] text-center font-medium text-[color:var(--home-link-color,var(--brand-primary))] [--link-brand-text:var(--home-link-color,var(--brand-primary))] [--link-brand-border-hover:var(--home-link-color,var(--brand-primary))] [--link-brand-shadow-hover:rgba(197,113,113,0.35)]";
const HOME_BEFORE_DIAMETER_KEY_PREFIX = "sotsiaalai:home-before-diameter";

function getHomeBeforeDiameterKey(locale, showAdminLinks, view) {
  return `${HOME_BEFORE_DIAMETER_KEY_PREFIX}:${locale || "et"}:${showAdminLinks ? "1" : "0"}:${view}`;
}

function readHomeBeforeDiameter(key) {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(key);
    const value = Number(raw);
    return Number.isFinite(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

function writeHomeBeforeDiameter(key, value) {
  if (typeof window === "undefined") return;
  if (!Number.isFinite(value) || value <= 0) return;
  try {
    window.sessionStorage.setItem(key, String(Math.round(value)));
  } catch {}
}

export default function HomeAboutSection({ id = "meist", className, showAdminLinks = false }) {
  const router = useRouter();
  const t = useT();
  const { locale } = useI18n();
  const aboutHeadingId = `${id}-title`;
  const aboutTextId = `${id}-text`;
  const beforeHeadingId = `${id}-before-title`;
  const ctaTitle = t("about.cta.title");
  const aboutParagraphKeys = [
    "paragraph1",
    "paragraph2",
    "paragraph3",
    "paragraph4",
    "paragraph5"
  ];
  const aboutParagraphs = aboutParagraphKeys
    .map((key) => ({
      key,
      value: t(`about.intro.${key}`)
    }))
    .filter(({ key, value }) => value && value !== `about.intro.${key}`);
  const aboutA11yText = aboutParagraphs
    .map(({ value }) =>
      String(value || "")
        .replace(/<br\s*\/?>/gi, " ")
        .replace(/<\/p>\s*<p>/gi, " ")
        .replace(/<li>/gi, " ")
        .replace(/<\/li>/gi, " ")
        .replace(/<[^>]+>/g, "")
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter(Boolean)
    .join(" ");
  const beforeCardRef = useRef(null);
  const beforeContentRef = useRef(null);
  const aboutScrollRef = useRef(null);
  const [beforeDiameter, setBeforeDiameter] = useState(() =>
    readHomeBeforeDiameter(getHomeBeforeDiameterKey(locale, showAdminLinks, "links"))
  );
  const [aboutFade, setAboutFade] = useState({ top: false, bottom: false });
  const [beforeView, setBeforeView] = useState("links");
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
  const homeCircleItemClassName = cn(
    "max-w-full"
  );
  const homeCircleLinkResponsiveClassName = cn(
    homeCircleLinkClassName,
    "w-auto max-w-full whitespace-normal break-words [text-wrap:balance] px-[0.16em] py-[0.03em]",
    "max-[768px]:max-w-[min(72vw,19.5rem)]",
    isRussianLocale &&
      "max-[768px]:max-w-[min(80vw,23rem)] max-[768px]:text-[clamp(1.12rem,4.45vw,1.32rem)] max-[768px]:leading-[1.12] max-[768px]:tracking-[0.005em]"
  );
  const beforeListClassName = cn(
    "flex w-fit max-w-full flex-col items-center justify-center list-none p-0 m-0 gap-y-[0.45rem] max-[768px]:gap-y-[0.52rem]",
    isRussianLocale &&
      "max-w-full"
  );
  const contactCompany = t("about.contact.company");
  const contactRegistryValue = t("about.contact.registry_value");
  const contactAddressValue = t("about.contact.address_value");
  const contactEmailValue = t("about.contact.email_value");
  const contactEmailLinkClassName = cn(
    "inline-block bg-transparent border-0 shadow-none rounded-none no-underline cursor-default",
    "text-[clamp(1.12rem,1.58vw,1.26rem)] max-[768px]:text-[clamp(1.08rem,4.65vw,1.2rem)] leading-[1.22] tracking-[0.01em]",
    "text-[color:var(--home-link-color,var(--brand-primary))]",
    "transition-colors duration-150",
    "light:!text-[color:var(--home-link-color,var(--brand-primary))]",
    "hc:!text-[color:var(--hc-accent)]"
  );

  useLayoutEffect(() => {
    const cardEl = beforeCardRef.current;
    const contentEl = beforeContentRef.current;
    if (!cardEl || !contentEl || typeof window === "undefined") return;
    const isContactView = beforeView === "contact";
    const diameterKey = getHomeBeforeDiameterKey(
      locale,
      showAdminLinks,
      isContactView ? "contact" : "links"
    );
    let rafId = 0;
    let rafId2 = 0;

    const updateSize = () => {
      const contentRect = contentEl.getBoundingClientRect();
      if (!contentRect.width || !contentRect.height) return;

      const computed = window.getComputedStyle(cardEl);
      const padX =
        (parseFloat(computed.paddingLeft) || 0) +
        (parseFloat(computed.paddingRight) || 0);
      const padY =
        (parseFloat(computed.paddingTop) || 0) +
        (parseFloat(computed.paddingBottom) || 0);

      const contentWidth = Math.max(
        contentRect.width,
        contentEl.scrollWidth,
        contentEl.offsetWidth
      );
      const contentHeight = Math.max(
        contentRect.height,
        contentEl.scrollHeight,
        contentEl.offsetHeight
      );
      const isMobileViewport = window.innerWidth <= 768;
      const extraBuffer = isMobileViewport
        ? (isContactView ? 14 : 48)
        : (isContactView ? 22 : 66);
      const neededWidth = contentWidth + padX + extraBuffer;
      const neededHeight = contentHeight + padY + extraBuffer;
      const neededSize = Math.ceil(
        Math.max(neededWidth, neededHeight) * (isContactView ? 0.95 : 1)
      );
      const minSize = isMobileViewport ? (isContactView ? 240 : 292) : (isContactView ? 260 : 350);
      const maxSize = Math.floor(
        isMobileViewport
          ? Math.min(
              window.innerWidth * (isRussianLocale ? 0.96 : 0.93),
              window.innerHeight * (isContactView ? 0.8 : 0.88)
            )
          : Math.min(
              window.innerWidth * (isRussianLocale ? 0.99 : 0.97),
              window.innerHeight * (isContactView ? 0.82 : 0.94)
            )
      );
      const nextSize = Math.max(minSize, Math.min(maxSize, neededSize));
      writeHomeBeforeDiameter(diameterKey, nextSize);
      setBeforeDiameter((prev) => (prev === nextSize ? prev : nextSize));
    };

    const scheduleUpdate = () => {
      window.cancelAnimationFrame(rafId);
      window.cancelAnimationFrame(rafId2);
      rafId = window.requestAnimationFrame(() => {
        rafId2 = window.requestAnimationFrame(updateSize);
      });
    };

    scheduleUpdate();
    // When the contact ring animates, observing its content creates a feedback loop:
    // the ring resizes, the content reflows, and the observer fires again.
    const ro =
      !isContactView && typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(scheduleUpdate)
        : null;
    ro?.observe(contentEl);
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("pageshow", scheduleUpdate);
    window.document?.fonts?.ready?.then?.(scheduleUpdate).catch?.(() => {});

    return () => {
      window.cancelAnimationFrame(rafId);
      window.cancelAnimationFrame(rafId2);
      ro?.disconnect?.();
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("pageshow", scheduleUpdate);
    };
  }, [beforeView, isRussianLocale, locale, showAdminLinks]);

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

  const renderCircleTitle = (title) => {
    const normalized = String(title || "").trim().replace(/\s+/g, " ");
    const words = normalized.split(" ");
    if (words.length === 2) {
      return (
        <>
          {words[0]}
          <br />
          {words[1]}
        </>
      );
    }
    return normalized;
  };
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
  const aboutMaskImage = `linear-gradient(to bottom, rgba(0,0,0,0) 0, rgba(0,0,0,0.08) calc(${aboutTopFade} * 0.14), rgba(0,0,0,0.28) calc(${aboutTopFade} * 0.34), rgba(0,0,0,0.56) calc(${aboutTopFade} * 0.58), rgba(0,0,0,0.82) calc(${aboutTopFade} * 0.82), #000 ${aboutTopFade}, #000 calc(100% - ${aboutBottomFade}), rgba(0,0,0,1) calc(100% - calc(${aboutBottomFade} * 0.9)), rgba(0,0,0,0.96) calc(100% - calc(${aboutBottomFade} * 0.72)), rgba(0,0,0,0.82) calc(100% - calc(${aboutBottomFade} * 0.5)), rgba(0,0,0,0.58) calc(100% - calc(${aboutBottomFade} * 0.32)), rgba(0,0,0,0.3) calc(100% - calc(${aboutBottomFade} * 0.16)), rgba(0,0,0,0) 100%)`;
  const openBeforeContact = (event) => {
    event.preventDefault();
    setBeforeView("contact");
  };
  const closeBeforeContact = () => {
    setBeforeView("links");
  };
  return (
    <section
      id={id}
      aria-labelledby={aboutHeadingId}
      aria-describedby={aboutTextId}
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
          className="home-about-panel relative [background:var(--home-about-surface-bg,var(--glass-surface-bg,rgba(0,0,0,0.25)))] backdrop-blur-[var(--glass-blur-radius,1rem)] [-webkit-backdrop-filter:blur(var(--glass-blur-radius,1rem))] rounded-t-[clamp(1.25rem,2.6vw,2.4rem)] rounded-b-[clamp(0.9rem,1.7vw,1.35rem)] shadow-[var(--home-about-surface-shadow,var(--glass-shell-shadow))] [border:none] px-[clamp(0.86rem,2.05vw,1.72rem)] pt-[clamp(1.4rem,2.4vw,2.15rem)] pb-[clamp(0.2rem,0.5vw,0.5rem)] max-[768px]:px-[clamp(1rem,4.8vw,1.35rem)] isolation-isolate"
        >
          <h2
            id={aboutHeadingId}
            className={cn(
              "home-about-title text-center text-[clamp(1.9rem,3.9vw,2.6rem)] font-headline tracking-[0.02em] mt-0 mb-[0.45rem] max-[768px]:mb-[0.3rem] text-[color:var(--home-title-color)]"
            )}
          >
            {t("about.title")}
          </h2>
          <p id={aboutTextId} className="sr-only">
            {aboutA11yText}
          </p>
          <div className="relative mx-auto w-full max-w-[54.5rem] max-[768px]:max-w-[52rem]">
            <div
              ref={aboutScrollRef}
              className="home-about-scrollbox relative overflow-y-auto px-[clamp(0.14rem,0.38vw,0.34rem)] pt-[0.05rem] pb-[0.3rem] max-[768px]:px-[0.1rem] max-[768px]:pt-[0rem] max-[768px]:pb-[0.45rem] text-center text-[clamp(1.1rem,1.6vw,1.28rem)] max-[768px]:text-[clamp(1.2rem,4.7vw,1.42rem)] leading-[1.7] max-[768px]:leading-[1.62] tracking-[0.03em] max-[768px]:tracking-[0.018em] space-y-[0.95rem] [color:var(--home-prose-color)]"
              style={{
                maxHeight: "min(71vh, 41rem)",
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
            </div>
          </div>
        </div>
        <section
          aria-labelledby={beforeHeadingId}
          ref={beforeCardRef}
          className="home-before-panel relative [background:var(--home-before-surface-bg,var(--glass-ring-surface-bg,var(--glass-surface-bg,rgba(0,0,0,0.25))))] backdrop-blur-[var(--glass-blur-radius,1rem)] [-webkit-backdrop-filter:blur(var(--glass-blur-radius,1rem))] rounded-full shadow-[var(--home-before-surface-shadow,var(--glass-shell-shadow))] [border:none] mx-auto mt-[clamp(0.8rem,2.2vw,1.8rem)] flex items-center justify-center px-[clamp(0.4rem,1.05vw,0.78rem)] py-[clamp(0.34rem,0.92vw,0.66rem)] max-[768px]:px-[clamp(0.24rem,0.85vw,0.42rem)] max-[768px]:py-[clamp(0.18rem,0.65vw,0.34rem)] box-border transition-[width,height,box-shadow,background-color] duration-[320ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] motion-reduce:transition-none will-change-[width,height]"
          style={
            beforeDiameter
              ? { width: `${beforeDiameter}px`, height: `${beforeDiameter}px` }
              : { width: "min(82vw, 22rem)", height: "min(82vw, 22rem)" }
          }
        >
          <div
            ref={beforeContentRef}
            className={cn(
              "relative z-[1] w-fit max-w-[min(88vw,26rem)] text-center text-[clamp(1.05rem,1.5vw,1.2rem)] leading-[1.7] flex flex-col gap-[clamp(0.44rem,0.92vw,0.68rem)] max-[768px]:gap-[clamp(0.3rem,0.74vw,0.44rem)] max-[768px]:max-w-[min(88vw,24rem)] items-center",
              beforeView === "contact"
                ? "justify-center w-full max-w-[min(84vw,24.5rem)] pl-[clamp(3.2rem,5.2vw,3.9rem)] pr-[clamp(2.45rem,4.2vw,3rem)] pt-[clamp(1.1rem,1.9vw,1.45rem)] pb-[clamp(0.4rem,0.8vw,0.65rem)] max-[768px]:max-w-[min(84vw,19.5rem)] max-[768px]:pl-[clamp(2.7rem,6.5vw,3.1rem)] max-[768px]:pr-[clamp(2.15rem,5.9vw,2.55rem)] max-[768px]:pt-[clamp(0.95rem,2.5vw,1.2rem)] max-[768px]:pb-[clamp(0.28rem,0.85vw,0.5rem)]"
                : null
            )}
          >
            {beforeView === "contact" ? (
              <>
                <BackButton
                  type="button"
                  onClick={closeBeforeContact}
                  ariaLabel={t("buttons.back")}
                  className="absolute left-[clamp(-1.25rem,-1.95vw,-0.85rem)] top-[50%] z-[2] !h-[5.1rem] !w-[5.1rem] -translate-y-1/2 min-[769px]:!h-[5.6rem] min-[769px]:!w-[5.6rem] max-[768px]:left-[clamp(-0.9rem,-2.2vw,-0.4rem)] max-[768px]:!h-[4.75rem] max-[768px]:!w-[4.75rem]"
                  iconClassName="!h-[5.1rem] !w-[5.1rem] min-[769px]:!h-[5.6rem] min-[769px]:!w-[5.6rem] max-[768px]:!h-[4.75rem] max-[768px]:!w-[4.75rem]"
                />
                <h3 id={beforeHeadingId} className="home-before-title m-0 mb-[clamp(0.82rem,1.3vw,1.05rem)] max-[768px]:mb-[clamp(0.72rem,1.8vw,0.92rem)] max-[768px]:-mt-[clamp(0.18rem,0.7vw,0.3rem)] text-[clamp(1.62rem,2.55vw,2.06rem)] max-[768px]:text-[clamp(1.54rem,6vw,1.88rem)] font-headline tracking-[0.02em] leading-[1.14] text-[color:var(--home-prose-color)]">
                  {t("about.contact.title")}
                </h3>
                <div className="home-before-contact-copy mx-auto flex w-full max-w-[min(78vw,23rem)] flex-col items-center gap-[clamp(0.55rem,0.9vw,0.72rem)] text-center max-[768px]:max-w-[min(78vw,18rem)]">
                  <p className="m-0 text-[clamp(1.26rem,1.9vw,1.5rem)] max-[768px]:text-[clamp(1.18rem,5.2vw,1.38rem)] font-semibold leading-[1.18] tracking-[0.015em] text-[color:var(--home-prose-color)]">
                    {contactCompany}
                  </p>
                  <div className="m-0 flex w-full flex-col gap-[clamp(0.45rem,0.72vw,0.62rem)] text-[color:var(--home-prose-color)]">
                    <p className="m-0 text-[clamp(1.16rem,1.55vw,1.28rem)] max-[768px]:text-[clamp(1.06rem,4.55vw,1.18rem)] leading-[1.3] tracking-[0.01em]">
                      {contactRegistryValue}
                    </p>
                    <p className="m-0 text-[clamp(1.16rem,1.55vw,1.28rem)] max-[768px]:text-[clamp(1.06rem,4.55vw,1.18rem)] leading-[1.34] tracking-[0.01em] [text-wrap:balance]">
                      {contactAddressValue}
                    </p>
                    <p className="m-0">
                      <span className={contactEmailLinkClassName}>
                        {contactEmailValue}
                      </span>
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h3 id={beforeHeadingId} className="home-before-title m-0 mb-[clamp(0.66rem,1.15vw,0.9rem)] max-[768px]:mb-[clamp(0.78rem,1.8vw,1rem)] mt-[clamp(-0.52rem,-1.18vw,-0.8rem)] max-[768px]:mt-[clamp(-0.34rem,-0.82vw,-0.56rem)] text-[clamp(1.48rem,2.45vw,2.05rem)] font-headline tracking-[0.02em] leading-[1.16] text-[color:var(--home-prose-color)]">
                  {renderCircleTitle(ctaTitle)}
                </h3>
                <ul className={beforeListClassName}>
                  <li className={homeCircleItemClassName}>
                    <AppLink
                      href="/kasutusjuhend"
                      onClick={(event) => openGlassPage(event, "/kasutusjuhend")}
                      className={cn(homeCircleLinkResponsiveClassName, linkBrandInlineClass)}
                    >
                      {t("about.guide.jump_link")}
                    </AppLink>
                  </li>
                  <li className={homeCircleItemClassName}>
                    <AppLink
                      href="/kasutustingimused"
                      onClick={(event) => openGlassPage(event, "/kasutustingimused")}
                      className={cn(homeCircleLinkResponsiveClassName, linkBrandInlineClass)}
                    >
                      {t("about.links.terms")}
                    </AppLink>
                  </li>
                  <li className={homeCircleItemClassName}>
                    <AppLink
                      href="/privaatsustingimused"
                      onClick={(event) => openGlassPage(event, "/privaatsustingimused")}
                      className={cn(homeCircleLinkResponsiveClassName, linkBrandInlineClass)}
                    >
                      {t("about.links.privacy")}
                    </AppLink>
                  </li>
                  <li className={homeCircleItemClassName}>
                    <InstallAppLink
                      variant="row"
                      className={cn(homeCircleLinkResponsiveClassName, linkBrandInlineClass)}
                    />
                  </li>
                  {showAdminLinks ? (
                    <>
                      <li className={homeCircleItemClassName}>
                        <AppLink
                          href="/admin/analytics"
                          className={cn(homeCircleLinkResponsiveClassName, linkBrandInlineClass)}
                        >
                          {t("about.links.analytics")}
                        </AppLink>
                      </li>
                      <li className={homeCircleItemClassName}>
                        <AppLink
                          href="/admin/rag"
                          className={cn(homeCircleLinkResponsiveClassName, linkBrandInlineClass)}
                        >
                          {t("about.links.admin")}
                        </AppLink>
                      </li>
                      <li className={homeCircleItemClassName}>
                        <AppLink
                          href="/admin/framework-acceptances"
                          className={cn(homeCircleLinkResponsiveClassName, linkBrandInlineClass)}
                        >
                          {adminFrameworkLinkLabel}
                        </AppLink>
                      </li>
                    </>
                  ) : null}
                </ul>
                <p className="m-0 max-[768px]:mt-[clamp(0.35rem,1.1vw,0.6rem)]">
                  <button
                    type="button"
                    onClick={openBeforeContact}
                    className={cn(
                      "home-before-contact-button",
                      homeCircleLinkResponsiveClassName,
                      linkBrandInlineClass
                    )}
                  >
                    {t("about.contact.title")}
                  </button>
                </p>
              </>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}



