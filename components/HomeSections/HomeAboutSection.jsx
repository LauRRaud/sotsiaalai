"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AppLink from "@/components/ui/Link";
import InstallAppLink from "@/components/pwa/InstallAppLink";
import { linkBrandInlineClass } from "@/components/ui/linkStyles";
import { cn } from "@/components/ui/cn";
import useT from "@/components/i18n/useT";
import { useI18n } from "@/components/i18n/I18nProvider";
import RichText from "@/components/i18n/RichText";
import { localizePath } from "@/lib/localizePath";
import { pushWithTransition } from "@/lib/routeTransition";

const homeCircleLinkClassName =
  "home-link inline-block align-top w-auto max-w-full text-[clamp(1.28rem,1.95vw,1.5rem)] tracking-[0.01em] leading-[1.1] text-center font-medium text-[color:var(--home-link-color,var(--brand-primary))] [--link-brand-text:var(--home-link-color,var(--brand-primary))] [--link-brand-border-hover:var(--home-link-color,var(--brand-primary))] [--link-brand-shadow-hover:rgba(197,113,113,0.35)]";

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
  const [beforeDiameter, setBeforeDiameter] = useState(null);
  const [aboutFade, setAboutFade] = useState({ top: false, bottom: false });
  const oskaLinkClassName = cn(
    "home-link inline-block align-top text-[clamp(1.08rem,1.5vw,1.25rem)] tracking-[0.01em] leading-[1.1] text-center font-medium text-[color:var(--home-link-color,var(--brand-primary))] [--link-brand-text:var(--home-link-color,var(--brand-primary))] [--link-brand-border-hover:var(--home-link-color,var(--brand-primary))] [--link-brand-shadow-hover:rgba(197,113,113,0.35)]",
    linkBrandInlineClass
  );
  const isRussianLocale = locale === "ru";
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

  useEffect(() => {
    const cardEl = beforeCardRef.current;
    const contentEl = beforeContentRef.current;
    if (!cardEl || !contentEl || typeof window === "undefined") return;

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
      const extraBuffer = isMobileViewport ? 48 : 66;
      const neededWidth = contentWidth + padX + extraBuffer;
      const neededHeight = contentHeight + padY + extraBuffer;
      const neededSize = Math.ceil(Math.max(neededWidth, neededHeight));
      const minSize = isMobileViewport ? 292 : 350;
      const maxSize = Math.floor(
        isMobileViewport
          ? Math.min(
              window.innerWidth * (isRussianLocale ? 0.96 : 0.93),
              window.innerHeight * 0.88
            )
          : Math.min(
              window.innerWidth * (isRussianLocale ? 0.99 : 0.97),
              window.innerHeight * 0.94
            )
      );
      const nextSize = Math.max(minSize, Math.min(maxSize, neededSize));
      setBeforeDiameter((prev) => (prev === nextSize ? prev : nextSize));
    };

    updateSize();
    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateSize) : null;
    ro?.observe(contentEl);
    window.addEventListener("resize", updateSize);
    window.document?.fonts?.ready?.then?.(updateSize).catch?.(() => {});

    return () => {
      ro?.disconnect?.();
      window.removeEventListener("resize", updateSize);
    };
  }, [isRussianLocale, showAdminLinks]);

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
  const aboutBottomFade = aboutFade.bottom ? "4.4rem" : "0px";
  const aboutMaskImage = `linear-gradient(to bottom, rgba(0,0,0,0) 0, rgba(0,0,0,0.08) calc(${aboutTopFade} * 0.14), rgba(0,0,0,0.28) calc(${aboutTopFade} * 0.34), rgba(0,0,0,0.56) calc(${aboutTopFade} * 0.58), rgba(0,0,0,0.82) calc(${aboutTopFade} * 0.82), #000 ${aboutTopFade}, #000 calc(100% - ${aboutBottomFade}), rgba(0,0,0,0.96) calc(100% - calc(${aboutBottomFade} * 0.86)), rgba(0,0,0,0.84) calc(100% - calc(${aboutBottomFade} * 0.68)), rgba(0,0,0,0.62) calc(100% - calc(${aboutBottomFade} * 0.48)), rgba(0,0,0,0.36) calc(100% - calc(${aboutBottomFade} * 0.28)), rgba(0,0,0,0.14) calc(100% - calc(${aboutBottomFade} * 0.1)), rgba(0,0,0,0) 100%)`;
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
          className="home-about-panel relative bg-[var(--home-panel-bg)] backdrop-blur-[var(--glass-blur-radius,1rem)] backdrop-saturate-[var(--glass-modal-saturate,100%)] rounded-t-[clamp(1.25rem,2.6vw,2.4rem)] rounded-b-[clamp(0.9rem,1.7vw,1.35rem)] shadow-[var(--home-panel-shadow)] border-0 px-[clamp(0.86rem,2.05vw,1.72rem)] pt-[clamp(1.4rem,2.4vw,2.15rem)] pb-[clamp(0.35rem,0.8vw,0.65rem)] max-[768px]:px-[clamp(1rem,4.8vw,1.35rem)] isolation-isolate"
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
              className="home-about-scrollbox relative overflow-y-auto px-[clamp(0.14rem,0.38vw,0.34rem)] pt-[0.05rem] pb-[0.5rem] max-[768px]:px-[0.1rem] max-[768px]:pt-[0rem] max-[768px]:pb-[0.5rem] text-center text-[clamp(1.1rem,1.6vw,1.28rem)] max-[768px]:text-[clamp(1.2rem,4.7vw,1.42rem)] leading-[1.7] max-[768px]:leading-[1.62] tracking-[0.03em] max-[768px]:tracking-[0.018em] space-y-[0.95rem] [color:var(--home-prose-color)]"
              style={{
                maxHeight: "min(72vh, 42rem)",
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
          className="home-before-panel relative bg-[var(--home-panel-bg)] backdrop-blur-[var(--glass-blur-radius,1rem)] backdrop-saturate-[var(--glass-modal-saturate,100%)] rounded-full shadow-[var(--home-before-shadow)] border-0 mx-auto mt-[clamp(0.8rem,2.2vw,1.8rem)] flex items-center justify-center px-[clamp(0.4rem,1.05vw,0.78rem)] py-[clamp(0.34rem,0.92vw,0.66rem)] max-[768px]:px-[clamp(0.24rem,0.85vw,0.42rem)] max-[768px]:py-[clamp(0.18rem,0.65vw,0.34rem)] box-border"
          style={
            beforeDiameter
              ? { width: `${beforeDiameter}px`, height: `${beforeDiameter}px` }
              : { width: "min(82vw, 22rem)", height: "min(82vw, 22rem)" }
          }
        >
          <div
            ref={beforeContentRef}
            className="relative z-[1] w-fit max-w-[min(88vw,26rem)] text-center text-[clamp(1.05rem,1.5vw,1.2rem)] leading-[1.7] flex flex-col gap-[clamp(0.44rem,0.92vw,0.68rem)] max-[768px]:gap-[clamp(0.3rem,0.74vw,0.44rem)] max-[768px]:max-w-[min(88vw,24rem)] items-center"
          >
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
                </>
              ) : null}
            </ul>
            <p className="m-0">
              <AppLink
                href="mailto:info@sotsiaal.ai"
                className={cn(homeCircleLinkResponsiveClassName, linkBrandInlineClass)}
              >
                info@sotsiaal.ai
              </AppLink>
            </p>
          </div>
        </section>
      </div>
    </section>
  );
}



