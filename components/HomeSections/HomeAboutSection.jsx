"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AppLink from "@/components/ui/Link";
import { linkBrandInlineClass, linkRichTextBase } from "@/components/ui/linkStyles";
import { cn } from "@/components/ui/cn";
import useT from "@/components/i18n/useT";
import { useI18n } from "@/components/i18n/I18nProvider";
import RichText from "@/components/i18n/RichText";
import InstallAppLink from "@/components/pwa/InstallAppLink";
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
  "block h-[clamp(3.78rem,5vw,4.42rem)] w-[clamp(3.78rem,5vw,4.42rem)] shrink-0 overflow-visible text-[#c57171] stroke-current opacity-95 transform-gpu will-change-transform transition-transform duration-[340ms] ease-out group-hover:scale-[1.06] group-focus-visible:scale-[1.06] light:text-[#7a3a38] hc:text-[color:var(--hc-accent)] [vertical-align:top] max-[768px]:h-[clamp(4.78rem,19vw,5.9rem)] max-[768px]:w-[clamp(4.78rem,19vw,5.9rem)]";
const homeQuickLabelClassName =
  "home-quick-label relative mt-[0.12rem] block w-[11.2rem] max-w-none translate-y-0 whitespace-nowrap text-center text-[clamp(1.18rem,1.52vw,1.36rem)] font-medium leading-[1.18] tracking-[0.04em] text-transparent opacity-100 pointer-events-none transform-gpu [-webkit-background-clip:text] [background-clip:text] [-webkit-text-fill-color:transparent] [background-repeat:no-repeat] [background-size:220%_100%] [background-position:200%_center] [animation:profile-footer-shine_12000ms_linear_infinite] [animation-delay:100ms] [animation-fill-mode:both] motion-reduce:animate-pulse after:content-[attr(data-label)] after:absolute after:inset-0 after:text-center after:text-[color:var(--home-link-color,var(--brand-primary,#c57171))] after:opacity-0 after:transition-opacity after:duration-[750ms] after:ease-[cubic-bezier(0.16,1,0.3,1)] after:[-webkit-text-fill-color:currentColor] after:[animation:none] max-[768px]:mt-[0.08rem] max-[768px]:min-h-[2.25em] max-[768px]:w-[9.8rem] max-[768px]:whitespace-normal max-[768px]:text-center max-[768px]:text-[clamp(1.08rem,4.45vw,1.26rem)] max-[768px]:tracking-[0.03em] max-[768px]:[text-wrap:balance]";
const homeQuickLabelStyle = {
  backgroundImage:
    "linear-gradient(90deg, transparent 0%, color-mix(in srgb, currentColor 22%, transparent) 32%, currentColor 50%, color-mix(in srgb, currentColor 22%, transparent) 68%, transparent 100%)"
};

function centerQuickItem(list, target, behavior = "auto") {
  if (!(list instanceof HTMLElement) || !(target instanceof HTMLElement)) return;

  const targetCenter = target.offsetLeft + target.offsetWidth / 2;
  const nextLeft = Math.max(
    0,
    Math.min(list.scrollWidth - list.clientWidth, targetCenter - list.clientWidth / 2)
  );

  list.scrollTo({
    left: nextLeft,
    behavior
  });
}

function HomeQuickLinkIcon({ name, className }) {
  const commonProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.18,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
    focusable: "false",
    className: cn("overflow-visible", className)
  };
  const installIconProps = {
    ...commonProps,
    strokeWidth: 1.02
  };

  if (name === "book") {
    return (
      <svg {...commonProps}>
        <path d="M12 4.25v15.5" />
        <path d="M3.95 4.55c2.48-.64 5.18-.1 8.05 1.62v13.58c-2.87-1.72-5.57-2.26-8.05-1.62V4.55Z" />
        <path d="M20.05 4.55c-2.48-.64-5.18-.1-8.05 1.62v13.58c2.87-1.72 5.57-2.26 8.05-1.62V4.55Z" />
      </svg>
    );
  }

  if (name === "file") {
    return (
      <svg {...commonProps}>
        <path d="M6.35 3.65h6.55c.38 0 .74.15 1.01.42l3.72 3.72c.27.27.42.63.42 1.01v11.05c0 .55-.45 1-1 1H6.35c-.55 0-1-.45-1-1V4.65c0-.55.45-1 1-1Z" />
        <path d="M13.15 3.85v4.02c0 .38.3.68.68.68h4" />
        <path d="M8.65 12.1h5.8" />
        <path d="M8.65 15.55h5.8" />
        <path d="M8.65 8.7h2.05" />
      </svg>
    );
  }

  if (name === "shield") {
    return (
      <svg {...commonProps}>
        <path d="M12 3.55 5.2 6.12v5.6c0 4.38 2.77 8 6.8 9.46 4.03-1.46 6.8-5.08 6.8-9.46v-5.6L12 3.55Z" />
        <circle cx="12" cy="10.35" r="1.72" />
        <path d="M8.5 16.18c.8-1.78 1.96-2.66 3.5-2.66s2.7.88 3.5 2.66" />
      </svg>
    );
  }

  if (name === "tag") {
    return (
      <svg {...commonProps}>
        <path d="M4.15 4.5h6.05c.48 0 .94.19 1.28.53l7.75 7.75c.47.47.47 1.21 0 1.68l-4.77 4.77c-.47.47-1.21.47-1.68 0l-7.75-7.75a1.81 1.81 0 0 1-.53-1.28V5.2c0-.39.31-.7.7-.7Z" />
        <circle cx="8.45" cy="8.25" r="0.5" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (name === "chart") {
    return (
      <svg {...commonProps}>
        <path d="M4.65 19.45V4.15" />
        <path d="M4.65 19.45h15.2" />
        <path d="M8.15 15.95v-4.7" />
        <path d="M12.35 15.95V7.65" />
        <path d="M16.55 15.95V9.1" />
      </svg>
    );
  }

  if (name === "database") {
    return (
      <svg {...commonProps}>
        <ellipse cx="12" cy="5.05" rx="7.05" ry="2.72" />
        <path d="M4.95 5.05v5.55c0 1.5 3.16 2.72 7.05 2.72s7.05-1.22 7.05-2.72V5.05" />
        <path d="M4.95 10.6v5.5c0 1.5 3.16 2.72 7.05 2.72s7.05-1.22 7.05-2.72v-5.5" />
      </svg>
    );
  }

  if (name === "audit") {
    return (
      <svg {...commonProps}>
        <path d="M12 3.35 4.95 6.02v5.62c0 4.48 2.92 8.18 7.05 9.02 4.13-.84 7.05-4.54 7.05-9.02V6.02L12 3.35Z" />
        <path d="m8.85 12.5 2.1 2.1 4.34-4.75" />
      </svg>
    );
  }

  if (name === "install-desktop") {
    return (
      <svg {...installIconProps}>
        <rect x="5.7" y="4.55" width="12.6" height="8.75" rx="1.12" />
        <path d="M9.2 15.8h5.6" />
        <path d="m4.05 18.85 1.2-3.05h13.5l1.2 3.05H4.05Z" />
        <path d="M12 6.7v4.42" />
        <path d="m9.9 9.35 2.1 2.1 2.1-2.1" />
      </svg>
    );
  }

  if (name === "install-mobile") {
    return (
      <svg {...installIconProps}>
        <rect x="7.25" y="3.65" width="9.5" height="16.7" rx="1.55" />
        <path d="M10.7 18.12h2.6" />
        <path d="M12 6.8v5" />
        <path d="m9.9 10.05 2.1 2.1 2.1-2.1" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <rect x="3.85" y="5.85" width="16.3" height="12.1" rx="1.18" />
      <path d="m4.85 6.8 7.15 5.72 7.15-5.72" />
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
  const quickListRef = useRef(null);
  const quickListInitialCenterRef = useRef(false);
  const activeQuickKeyRef = useRef("privacy");
  const [activeQuickKey, setActiveQuickKey] = useState("privacy");
  const [quickInstallTarget, setQuickInstallTarget] = useState("desktop");
  const [quickInstallAvailable, setQuickInstallAvailable] = useState(false);
  const [useQuickCarouselVisibility, setUseQuickCarouselVisibility] = useState(false);
  const quickCarouselProgrammaticRef = useRef(false);
  const quickCarouselSettleTimerRef = useRef(0);
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
      ? "Kinnitused"
      : locale === "ru"
        ? "Подтверждения"
        : "Confirmations";
  const installLabel =
    locale === "et" ? "Paigalda" : locale === "ru" ? "Установить" : "Install";
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
    const mobileQuery = window.matchMedia?.("(max-width: 768px)");
    const standaloneQuery = window.matchMedia?.("(display-mode: standalone)");
    const fullscreenQuery = window.matchMedia?.("(display-mode: fullscreen)");
    const isStandaloneDisplay = () =>
      Boolean(
        standaloneQuery?.matches ||
          fullscreenQuery?.matches ||
          window.navigator?.standalone === true ||
          window.document?.documentElement?.dataset?.displayMode === "standalone" ||
          window.document?.documentElement?.dataset?.displayMode === "fullscreen" ||
          window.document?.body?.dataset?.displayMode === "standalone" ||
          window.document?.body?.dataset?.displayMode === "fullscreen"
      );
    const updateInstallTarget = () => {
      const isMobile = mobileQuery?.matches ?? false;
      setQuickInstallTarget(isMobile ? "mobile" : "desktop");
      setQuickInstallAvailable(!isStandaloneDisplay());
      setUseQuickCarouselVisibility(isMobile);
    };
    const handleAppInstalled = () => {
      setQuickInstallAvailable(false);
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        updateInstallTarget();
      }
    };

    updateInstallTarget();
    mobileQuery?.addEventListener?.("change", updateInstallTarget);
    standaloneQuery?.addEventListener?.("change", updateInstallTarget);
    fullscreenQuery?.addEventListener?.("change", updateInstallTarget);
    window.addEventListener("pageshow", updateInstallTarget);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      mobileQuery?.removeEventListener?.("change", updateInstallTarget);
      standaloneQuery?.removeEventListener?.("change", updateInstallTarget);
      fullscreenQuery?.removeEventListener?.("change", updateInstallTarget);
      window.removeEventListener("pageshow", updateInstallTarget);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  useEffect(() => () => {
    if (quickCarouselSettleTimerRef.current) {
      window.clearTimeout(quickCarouselSettleTimerRef.current);
    }
  }, []);

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
  const aboutTopFade = aboutFade.top ? "clamp(3.25rem, 6vw, 4.8rem)" : "0px";
  const aboutBottomFade = aboutFade.bottom ? "clamp(3.25rem, 6vw, 4.8rem)" : "0px";
  const aboutMaskImage = `linear-gradient(to bottom, transparent 0, #000 ${aboutTopFade}, #000 calc(100% - ${aboutBottomFade}), transparent 100%)`;
  const shouldFadeAbout = animateIntro && !aboutIntroDone;
  const shouldFadeBefore = animateIntro && !beforeIntroDone;
  const openBeforeContact = (event) => {
    event.preventDefault();
    setBeforeView((currentView) => (currentView === "contact" ? "links" : "contact"));
  };
  const quickLinks = [
    {
      key: "guide",
      href: "/kasutusjuhend",
      label: locale === "et" ? "Juhend" : t("about.guide.jump_link"),
      icon: "book",
      onClick: (event) => openGlassPage(event, "/kasutusjuhend")
    },
    {
      key: "terms",
      href: "/kasutustingimused",
      label: locale === "et" ? "Tingimused" : t("about.links.terms"),
      icon: "file",
      onClick: (event) => openGlassPage(event, "/kasutustingimused")
    },
    {
      key: "privacy",
      href: "/privaatsustingimused",
      label: locale === "et" ? "Privaatsus" : t("about.links.privacy"),
      icon: "shield",
      onClick: (event) => openGlassPage(event, "/privaatsustingimused")
    },
    {
      key: "pricing",
      href: "/hinnastus",
      label: t("about.links.pricing"),
      icon: "tag",
      onClick: (event) => openGlassPage(event, "/hinnastus")
    },
    ...(quickInstallAvailable
      ? quickInstallTarget === "desktop"
        ? [
            {
              key: "install-desktop",
              label: installLabel,
              ariaLabel: t("pwa.cta_desktop"),
              icon: "install-desktop",
              type: "install",
              installTarget: "desktop"
            }
          ]
        : [
            {
              key: "install-mobile",
              label: installLabel,
              ariaLabel: t("pwa.cta_mobile"),
              icon: "install-mobile",
              type: "install",
              installTarget: "mobile"
            }
          ]
      : []),
    {
      key: "contact",
      label: t("about.contact.title"),
      icon: "mail",
      type: "button",
      onClick: openBeforeContact
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
      : [])
  ];
  const quickLinkSignature = quickLinks.map((item) => item.key).join("|");
  useEffect(() => {
    const quickLinkKeys = quickLinkSignature ? quickLinkSignature.split("|") : [];
    if (quickLinkKeys.includes(activeQuickKeyRef.current)) return;

    const fallbackKey = quickLinkKeys.includes("privacy") ? "privacy" : quickLinkKeys[0];
    if (!fallbackKey) return;

    activeQuickKeyRef.current = fallbackKey;
    setActiveQuickKey(fallbackKey);
  }, [quickLinkSignature]);
  const activeQuickIndex = quickLinks.findIndex((item) => item.key === activeQuickKey);
  const activeQuickLabel = activeQuickIndex >= 0 ? quickLinks[activeQuickIndex]?.label || "" : "";
  const quickCarouselLabel =
    locale === "et"
      ? "Avalehe lisalingid"
      : "Home quick links";
  const quickCarouselStatus =
    locale === "et"
      ? `Fookuses link: ${activeQuickLabel}`
      : `Focused link: ${activeQuickLabel}`;
  const quickVisibilityForIndex = (index) => {
    if (!useQuickCarouselVisibility) return "active";
    if (activeQuickIndex < 0) return "hidden";

    const distance = Math.abs(index - activeQuickIndex);
    if (distance === 0) return "active";
    if (distance === 1) return "adjacent";
    return "hidden";
  };
  useEffect(() => {
    const list = quickListRef.current;
    if (!list || typeof window === "undefined") return undefined;

    const mobileQuery = window.matchMedia?.("(max-width: 768px)");
    const isMobile = () => mobileQuery?.matches ?? window.innerWidth <= 768;
    let rafId = 0;

    const itemElements = () =>
      Array.from(list.querySelectorAll("[data-home-quick-key]")).filter(
        (element) => element instanceof HTMLElement
      );

    const applyActiveKey = (items, nextKey) => {
      if (!nextKey) return;

      const activeIndex = items.findIndex((item) => item.dataset.homeQuickKey === nextKey);

      items.forEach((item, index) => {
        const isActive = item.dataset.homeQuickKey === nextKey;
        const distance = activeIndex >= 0 ? Math.abs(index - activeIndex) : Number.POSITIVE_INFINITY;

        item.dataset.active = isActive ? "true" : "false";
        item.dataset.quickVisibility =
          distance === 0 ? "active" : distance === 1 ? "adjacent" : "hidden";
      });

      if (activeQuickKeyRef.current === nextKey) return;

      activeQuickKeyRef.current = nextKey;
      setActiveQuickKey(nextKey);
    };

    const updateActive = () => {
      rafId = 0;
      if (!isMobile()) return;
      if (quickCarouselProgrammaticRef.current) return;

      const items = itemElements();
      if (!items.length) return;

      const listRect = list.getBoundingClientRect();
      const listCenter = listRect.left + listRect.width / 2;
      let nearest = items[0];
      let nearestDistance = Number.POSITIVE_INFINITY;

      items.forEach((item) => {
        const rect = item.getBoundingClientRect();
        const itemCenter = rect.left + rect.width / 2;
        const distance = Math.abs(itemCenter - listCenter);
        if (distance < nearestDistance) {
          nearest = item;
          nearestDistance = distance;
        }
      });

      const nextKey = nearest.dataset.homeQuickKey;
      applyActiveKey(items, nextKey);
    };

    const scheduleUpdate = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(updateActive);
    };

    const centerInitialItem = (behavior = "auto") => {
      const items = itemElements();
      if (!isMobile() || !items.length) {
        scheduleUpdate();
        return false;
      }

      const target =
        list.querySelector('[data-home-quick-key="privacy"]') ||
        items[Math.floor(items.length / 2)];
      if (!target || list.clientWidth <= 0 || target.offsetWidth <= 0) {
        return false;
      }

      if (quickCarouselSettleTimerRef.current) {
        window.clearTimeout(quickCarouselSettleTimerRef.current);
      }
      quickCarouselProgrammaticRef.current = true;
      applyActiveKey(items, target?.dataset?.homeQuickKey || "privacy");
      centerQuickItem(list, target, behavior);
      quickCarouselSettleTimerRef.current = window.setTimeout(() => {
        quickCarouselProgrammaticRef.current = false;
        quickCarouselSettleTimerRef.current = 0;
      }, 220);
      quickListInitialCenterRef.current = true;
      return true;
    };

    const initialTimers = [];
    const clearInitialTimers = () => {
      initialTimers.splice(0).forEach((timer) => window.clearTimeout(timer));
    };
    const scheduleInitialCenter = () => {
      if (!isMobile()) {
        scheduleUpdate();
        return;
      }

      clearInitialTimers();
      centerInitialItem();
      [90, 260, 620, 1120, 1800, 2600].forEach((delay) => {
        const timer = window.setTimeout(() => {
          if (isMobile()) {
            centerInitialItem();
          }
        }, delay);
        initialTimers.push(timer);
      });
    };
    const handlePageRestore = () => {
      quickListInitialCenterRef.current = false;
      scheduleInitialCenter();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        handlePageRestore();
      }
    };
    const initialFrame = window.requestAnimationFrame(() => {
      scheduleInitialCenter();
    });
    const layoutObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => scheduleInitialCenter())
        : null;
    layoutObserver?.observe(list);
    list.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("pageshow", handlePageRestore);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    mobileQuery?.addEventListener?.("change", scheduleUpdate);

    return () => {
      window.cancelAnimationFrame(initialFrame);
      clearInitialTimers();
      if (quickCarouselSettleTimerRef.current) {
        window.clearTimeout(quickCarouselSettleTimerRef.current);
        quickCarouselSettleTimerRef.current = 0;
      }
      quickCarouselProgrammaticRef.current = false;
      if (rafId) window.cancelAnimationFrame(rafId);
      layoutObserver?.disconnect?.();
      list.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("pageshow", handlePageRestore);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      mobileQuery?.removeEventListener?.("change", scheduleUpdate);
    };
  }, [quickLinkSignature]);

  const scrollQuickCarousel = (direction) => {
    const list = quickListRef.current;
    if (!list || typeof window === "undefined") return;

    const items = Array.from(list.querySelectorAll("[data-home-quick-key]")).filter(
      (element) => element instanceof HTMLElement && element.offsetParent !== null
    );
    if (!items.length) return;

    const activeElementIndex = items.findIndex((item) => item.dataset.active === "true");
    const currentIndex = Math.max(
      0,
      activeElementIndex >= 0
        ? activeElementIndex
        : items.findIndex((item) => item.dataset.homeQuickKey === activeQuickKeyRef.current)
    );
    const targetIndex = Math.max(0, Math.min(items.length - 1, currentIndex + direction));
    const target = items[targetIndex];
    const isMobileCarousel =
      window.matchMedia?.("(max-width: 768px)")?.matches ?? window.innerWidth <= 768;
    const behavior =
      window.document?.documentElement?.dataset?.reduceMotion === "1" || isMobileCarousel
        ? "auto"
        : "smooth";

    if (quickCarouselSettleTimerRef.current) {
      window.clearTimeout(quickCarouselSettleTimerRef.current);
    }
    quickCarouselProgrammaticRef.current = true;
    centerQuickItem(list, target, behavior);
    quickCarouselSettleTimerRef.current = window.setTimeout(() => {
      quickCarouselProgrammaticRef.current = false;
      quickCarouselSettleTimerRef.current = 0;
    }, behavior === "smooth" ? 480 : 0);

    const nextKey = target.dataset.homeQuickKey;
    if (nextKey) {
      activeQuickKeyRef.current = nextKey;
      const activeIndex = items.findIndex((item) => item.dataset.homeQuickKey === nextKey);

      items.forEach((item, index) => {
        const distance = activeIndex >= 0 ? Math.abs(index - activeIndex) : Number.POSITIVE_INFINITY;

        item.dataset.active = item.dataset.homeQuickKey === nextKey ? "true" : "false";
        item.dataset.quickVisibility =
          distance === 0 ? "active" : distance === 1 ? "adjacent" : "hidden";
      });
      setActiveQuickKey(nextKey);
    }
  };

  const handleQuickLinkClick = (event, item) => {
    item.onClick?.(event);
  };
  const handleQuickCarouselKeyDown = (event) => {
    if (event.defaultPrevented) return;

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollQuickCarousel(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollQuickCarousel(1);
    } else if (event.key === "Home" || event.key === "End") {
      const list = quickListRef.current;
      if (!list || typeof window === "undefined") return;

      event.preventDefault();
      const items = Array.from(list.querySelectorAll("[data-home-quick-key]")).filter(
        (element) => element instanceof HTMLElement && element.offsetParent !== null
      );
      const target = event.key === "Home" ? items[0] : items[items.length - 1];
      if (!target) return;

      const isMobileCarousel =
        window.matchMedia?.("(max-width: 768px)")?.matches ?? window.innerWidth <= 768;
      const behavior =
        window.document?.documentElement?.dataset?.reduceMotion === "1" || isMobileCarousel
          ? "auto"
          : "smooth";
      centerQuickItem(list, target, behavior);

      const nextKey = target.dataset.homeQuickKey;
      if (nextKey) {
        activeQuickKeyRef.current = nextKey;
        setActiveQuickKey(nextKey);
      }
    }
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
          <div className="relative mx-auto w-full max-w-[54.5rem] max-[768px]:max-w-[52rem]">
            <div
              ref={aboutScrollRef}
              lang={locale}
              className="home-about-scrollbox relative overflow-y-auto px-[clamp(0.14rem,0.38vw,0.34rem)] pt-[0.05rem] pb-[0.3rem] max-[768px]:px-[0.1rem] max-[768px]:pt-[0rem] max-[768px]:pb-[0.45rem] text-left text-[clamp(1.1rem,1.6vw,1.28rem)] max-[768px]:text-[clamp(1.12rem,4.25vw,1.32rem)] leading-[1.7] max-[768px]:leading-[1.58] tracking-[0.03em] max-[768px]:tracking-[0.006em] [color:var(--home-prose-color)] break-words hyphens-auto max-[768px]:hyphens-none max-[768px]:[--about-scroll-max-height:min(76vh,44.5rem)]"
              style={{
                maxHeight: "var(--about-scroll-max-height, min(71vh, 41rem))",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                WebkitMaskImage: aboutMaskImage,
                maskImage: aboutMaskImage
              }}
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
              <div className="space-y-[0.95rem]">
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
          <button
            type="button"
            className="home-before-carousel-arrow home-before-carousel-arrow--prev"
            aria-label={locale === "et" ? "Eelmine link" : "Previous link"}
            onClick={() => scrollQuickCarousel(-1)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M14.6 6.2 8.8 12l5.8 5.8" />
            </svg>
          </button>
          <button
            type="button"
            className="home-before-carousel-arrow home-before-carousel-arrow--next"
            aria-label={locale === "et" ? "Järgmine link" : "Next link"}
            onClick={() => scrollQuickCarousel(1)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="m9.4 6.2 5.8 5.8-5.8 5.8" />
            </svg>
          </button>
          <ul
            ref={quickListRef}
            tabIndex={0}
            aria-label={quickCarouselLabel}
            aria-describedby={`${beforeHeadingId}-quick-status`}
            onKeyDown={handleQuickCarouselKeyDown}
            className={cn(
              "home-before-link-list m-0 w-full list-none items-start gap-y-[clamp(0.45rem,1.25vw,0.95rem)] overflow-visible p-0 max-[768px]:grid max-[768px]:grid-cols-2 max-[768px]:gap-x-[clamp(0.65rem,4vw,1rem)] max-[768px]:gap-y-[clamp(0.95rem,4.8vw,1.45rem)] max-[768px]:[grid-auto-rows:auto] min-[430px]:max-[768px]:grid-cols-3",
              showAdminLinks
                ? "grid grid-cols-[repeat(6,clamp(4.8rem,6vw,5.4rem))] justify-between"
                : "flex flex-nowrap justify-between gap-x-0"
            )}
          >
            {quickLinks.map((item, index) => {
              const isContactItem = item.key === "contact";
              const isActiveQuickItem = activeQuickKey === item.key;
              const quickVisibility = quickVisibilityForIndex(index);
              const isVisibleQuickItem = quickVisibility !== "hidden";

              return (
                <li
                  key={item.key}
                  data-home-quick-key={item.key}
                  data-home-quick-type={item.type || "link"}
                  data-active={isActiveQuickItem ? "true" : "false"}
                  data-quick-visibility={quickVisibility}
                  aria-hidden={isVisibleQuickItem ? undefined : true}
                  className={cn(
                    "home-before-link-item pointer-events-none relative flex min-h-[clamp(6.5rem,7.9vw,7.15rem)] flex-col items-center justify-start pt-[0.26rem] max-[768px]:min-h-[clamp(7rem,25.5vw,8.4rem)] max-[768px]:min-w-0 max-[768px]:flex-none max-[768px]:justify-start",
                    showAdminLinks
                      ? "w-full min-w-0"
                      : "w-[clamp(4.8rem,6vw,5.4rem)] min-w-[clamp(4.8rem,6vw,5.4rem)] flex-none",
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
                      tabIndex={isVisibleQuickItem ? undefined : -1}
                      className={cn("home-before-contact-button", homeQuickLinkClassName)}
                    >
                      <HomeQuickLinkIcon name={item.icon} className={homeQuickIconClassName} />
                    </button>
                  ) : item.type === "install" ? (
                    <InstallAppLink
                      variant="quickIcon"
                      installTarget={item.installTarget}
                      showWhenUnavailable
                      mobilePopoverPreferAbove
                      allowDesktopInstructions={item.installTarget !== "desktop"}
                      ariaLabel={item.ariaLabel || item.label}
                      tabIndex={isVisibleQuickItem ? undefined : -1}
                      className={homeQuickLinkClassName}
                    >
                      <HomeQuickLinkIcon name={item.icon} className={homeQuickIconClassName} />
                    </InstallAppLink>
                  ) : (
                    <AppLink
                      href={item.href}
                      onClick={(event) => handleQuickLinkClick(event, item)}
                      aria-label={item.label}
                      tabIndex={isVisibleQuickItem ? undefined : -1}
                      className={homeQuickLinkClassName}
                    >
                      <HomeQuickLinkIcon name={item.icon} className={homeQuickIconClassName} />
                    </AppLink>
                  )}
                  <span
                    aria-hidden="true"
                    className={homeQuickLabelClassName}
                    style={homeQuickLabelStyle}
                    data-label={item.label}
                  >
                    {item.label}
                  </span>
                </li>
              );
            })}
          </ul>
          <span id={`${beforeHeadingId}-quick-status`} className="sr-only" aria-live="polite">
            {quickCarouselStatus}
          </span>
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
