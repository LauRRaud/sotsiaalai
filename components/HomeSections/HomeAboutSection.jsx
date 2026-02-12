"use client";

import { useEffect, useRef, useState } from "react";
import AppLink from "@/components/ui/Link";
import InstallAppLink from "@/components/pwa/InstallAppLink";
import { linkBrandInlineClass } from "@/components/ui/linkStyles";
import { cn } from "@/components/ui/cn";
import useT from "@/components/i18n/useT";
import RichText from "@/components/i18n/RichText";

const homeCircleLinkClassName =
  "home-link inline-flex w-fit flex-none items-center justify-center whitespace-nowrap text-[clamp(1.28rem,1.95vw,1.5rem)] tracking-[0.01em] leading-[1.1] text-center font-medium text-[color:var(--home-link-color,var(--brand-primary))] [--link-brand-text:var(--home-link-color,var(--brand-primary))] [--link-brand-border-hover:var(--home-link-color,var(--brand-primary))] [--link-brand-shadow-hover:rgba(197,113,113,0.35)]";

export default function HomeAboutSection({ id = "meist", className, showAdminLinks = false }) {
  const t = useT();
  const ctaTitle = t("about.cta.title");
  const beforeCardRef = useRef(null);
  const beforeContentRef = useRef(null);
  const [beforeDiameter, setBeforeDiameter] = useState(null);
  const oskaLinkClassName = cn(
    "home-link inline-flex items-center justify-center text-[clamp(1.08rem,1.5vw,1.25rem)] tracking-[0.01em] leading-[1.1] text-center font-medium text-[color:var(--home-link-color,var(--brand-primary))] [--link-brand-text:var(--home-link-color,var(--brand-primary))] [--link-brand-border-hover:var(--home-link-color,var(--brand-primary))] [--link-brand-shadow-hover:rgba(197,113,113,0.35)]",
    linkBrandInlineClass
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

      const neededWidth = contentRect.width + padX;
      const neededHeight = contentRect.height + padY;
      const neededSize = Math.ceil(Math.max(neededWidth, neededHeight));
      const minSize = 300;
      const maxSize = Math.floor(window.innerWidth * 0.9);
      const nextSize = Math.max(minSize, Math.min(maxSize, neededSize));
      setBeforeDiameter((prev) => (prev === nextSize ? prev : nextSize));
    };

    updateSize();
    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateSize) : null;
    ro?.observe(contentEl);
    window.addEventListener("resize", updateSize);

    return () => {
      ro?.disconnect?.();
      window.removeEventListener("resize", updateSize);
    };
  }, [showAdminLinks]);

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

  return (
    <section
      id={id}
      className={cn(
        "home-section",
        "relative z-30 w-full overflow-visible py-[clamp(2.8rem,7vw,5rem)] pb-[clamp(0.6rem,1.6vw,1rem)] max-[48em]:pt-[clamp(1.2rem,4.2vw,2rem)] max-[48em]:pb-[clamp(0.4rem,1.2vw,0.8rem)] touch-pan-y",
        className
      )}
    >
      <div
        className={cn(
          "relative z-[1] mx-auto w-[min(92vw,58rem)] flex flex-col gap-[1.5rem]"
        )}
      >
        <div
          className="relative bg-[var(--home-panel-bg)] backdrop-blur-[var(--glass-blur-radius,1rem)] backdrop-saturate-[var(--glass-modal-saturate,100%)] rounded-[clamp(1.25rem,2.6vw,2.4rem)] shadow-[var(--home-panel-shadow)] border-0 px-[clamp(1rem,2.6vw,2.25rem)] pt-[clamp(1.4rem,2.4vw,2.15rem)] pb-[clamp(1.4rem,2.4vw,2.25rem)] isolation-isolate"
        >
          <h2
            className={cn(
              "text-center text-[clamp(1.9rem,3.9vw,2.6rem)] font-headline tracking-[0.02em] mt-0 mb-[1.1rem] text-[color:var(--home-title-color)]"
            )}
          >
            {t("about.title")}
          </h2>
          <div className="text-center text-[clamp(1.1rem,1.6vw,1.28rem)] leading-[1.7] tracking-[0.03em] space-y-[0.95rem] [color:var(--home-prose-color)]">
            <RichText as="div" className="[&>p]:m-0" value={t("about.intro.paragraph1")} />
            <RichText as="div" className="[&>p]:m-0" value={t("about.intro.paragraph2")} />
            <RichText
              as="div"
              className="[&>p]:m-0"
              value={t("about.intro.paragraph3")}
              replacements={{
                oska: {
                  open: `<a href="https://uuringud.oska.kutsekoda.ee/uuringud/sotsiaaltoo-seirearuande" target="_blank" rel="noreferrer" class="${oskaLinkClassName}">`,
                  close: "</a>"
                }
              }}
            />
          </div>
        </div>
        <div
          ref={beforeCardRef}
          className="relative bg-[var(--home-panel-bg)] backdrop-blur-[var(--glass-blur-radius,1rem)] backdrop-saturate-[var(--glass-modal-saturate,100%)] rounded-full shadow-[var(--home-before-shadow)] border-0 mx-auto mt-[clamp(0.8rem,2.2vw,1.8rem)] flex items-center justify-center p-[clamp(0.9rem,2.2vw,1.75rem)] box-border"
          style={
            beforeDiameter
              ? { width: `${beforeDiameter}px`, height: `${beforeDiameter}px` }
              : { width: "min(90vw, 30rem)", height: "min(90vw, 30rem)" }
          }
        >
          <div
            ref={beforeContentRef}
            className="relative z-[1] text-center text-[clamp(1.05rem,1.5vw,1.2rem)] leading-[1.7] flex flex-col gap-[clamp(0.55rem,1.1vw,0.8rem)] max-w-[min(74vw,24.5rem)] items-center"
          >
            <p className="m-0 mb-[clamp(0.16rem,0.45vw,0.34rem)] -translate-y-[clamp(0.5rem,1.35vw,0.9rem)] text-[clamp(1.48rem,2.45vw,2.05rem)] font-headline tracking-[0.02em] leading-[1.2] text-[color:var(--home-prose-color)]">
              {renderCircleTitle(ctaTitle)}
            </p>
            <ul className="flex flex-wrap items-center justify-center list-none p-0 m-0 gap-x-[1.05rem] gap-y-[0.45rem]">
              <li className="w-fit flex-none">
                <AppLink
                  href="/kasutusjuhend"
                  className={cn(
                    homeCircleLinkClassName,
                    linkBrandInlineClass
                  )}
                >
                  {t("about.guide.jump_link")}
                </AppLink>
              </li>
              <li className="w-fit flex-none">
                <AppLink
                  href="/kasutustingimused"
                  className={cn(
                    homeCircleLinkClassName,
                    linkBrandInlineClass
                  )}
                >
                  {t("about.links.terms")}
                </AppLink>
              </li>
              <li className="w-fit flex-none">
                <AppLink
                  href="/privaatsustingimused"
                  className={cn(
                    homeCircleLinkClassName,
                    linkBrandInlineClass
                  )}
                >
                  {t("about.links.privacy")}
                </AppLink>
              </li>
              <li className="w-fit flex-none">
                <InstallAppLink
                  variant="row"
                  className={cn(
                    homeCircleLinkClassName,
                    linkBrandInlineClass
                  )}
                />
              </li>
              {showAdminLinks ? (
                <>
                  <li className="w-fit flex-none">
                    <AppLink
                      href="/admin/analytics"
                      className={cn(
                        homeCircleLinkClassName,
                        linkBrandInlineClass
                      )}
                    >
                      {t("about.links.analytics")}
                    </AppLink>
                  </li>
                  <li className="w-fit flex-none">
                    <AppLink
                      href="/admin/rag"
                      className={cn(
                        homeCircleLinkClassName,
                        linkBrandInlineClass
                      )}
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
                className={cn(
                  homeCircleLinkClassName,
                  linkBrandInlineClass
                )}
              >
                info@sotsiaal.ai
              </AppLink>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}



