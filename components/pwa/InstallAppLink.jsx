"use client";

import { createPortal } from "react-dom";
import { useEffect, useLayoutEffect, useState, useCallback, useRef } from "react";
import useT from "@/components/i18n/useT";
import { useI18n } from "@/components/i18n/I18nProvider";
import { cn } from "@/components/ui/cn";
import { linkBrandBase } from "@/components/ui/linkStyles";

function InstallHintIcon({ children, className }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex h-[1.2em] w-[1.2em] align-[-0.18em] items-center justify-center text-current",
        className
      )}
    >
      {children}
    </span>
  );
}

function ShareIcon() {
  return (
    <InstallHintIcon className="mx-[0.14em]">
      <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 14.8V3.7" />
        <path d="M8.15 7.55 12 3.7l3.85 3.85" />
        <path d="M5.25 8.95v9.25a2.2 2.2 0 0 0 2.2 2.2h9.1a2.2 2.2 0 0 0 2.2-2.2V8.95" />
      </svg>
    </InstallHintIcon>
  );
}

function MoreIcon() {
  return (
    <InstallHintIcon className="mx-[0.14em]">
      <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 8.5 12 16l7.5-7.5" />
      </svg>
    </InstallHintIcon>
  );
}

function AddToHomeIcon() {
  return (
    <InstallHintIcon className="mx-[0.14em]">
      <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3.5" y="3.5" width="17" height="17" rx="3.4" />
        <path d="M12 8v8" />
        <path d="M8 12h8" />
      </svg>
    </InstallHintIcon>
  );
}

function InstallInlineToken({ children }) {
  return (
    <span className="inline-flex items-center gap-[0.08em] whitespace-nowrap align-[-0.02em]">
      {children}
    </span>
  );
}

function InstallHintSteps({ items }) {
  return (
    <ol className="m-0 list-none p-0 space-y-[0.16rem] text-left text-[1.06rem] leading-[1.42] max-[480px]:text-[1.1rem] max-[480px]:leading-[1.46]">
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-[0.14rem]">
          <span className="w-[0.98rem] shrink-0 text-right leading-[1.38] tabular-nums">
            {index + 1}.
          </span>
          <span className="min-w-0 flex-1 leading-[1.42]">{item}</span>
        </li>
      ))}
    </ol>
  );
}

export default function InstallAppLink({
  variant = "list",
  heading,
  className,
  mobilePopoverPreferAbove = false
}) {
  const [canInstall, setCanInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isMacSafari, setIsMacSafari] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [inlineMessage, setInlineMessage] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpPopoverPlacement, setHelpPopoverPlacement] = useState(null);
  const triggerRef = useRef(null);
  const helpPopoverRef = useRef(null);

  const t = useT();
  const { locale } = useI18n();
  const resolvedHeading = heading || t("pwa.heading");
  const installCtaMobile = t("pwa.cta_mobile");
  const installCtaDesktop = t("pwa.cta_desktop");
  const iosHint = t("pwa.instructions.ios");
  const androidHint = t("pwa.instructions.android");
  const macHint = t("pwa.instructions.mac");
  const desktopHint = t("pwa.instructions.desktop");
  const helpPopoverClassName =
    "chat-tools-surface-popover fixed z-[9999] w-[min(18rem,calc(100vw-1.5rem))] max-[480px]:w-[min(19rem,calc(100vw-1rem))] rounded-[16px] " +
    "border border-[color:var(--opaque-panel-border,var(--subpage-card-border))] px-[0.95rem] pt-[0.92rem] pb-[0.84rem] " +
    "[background:var(--opaque-panel-bg,var(--subpage-card-bg))] text-[color:var(--opaque-panel-text,var(--subpage-card-text))] " +
    "text-[1.02rem] leading-[1.42] shadow-[var(--opaque-panel-shadow,var(--subpage-card-shadow))] backdrop-blur-0 backdrop-saturate-100 " +
    "[-webkit-backdrop-filter:none] [backdrop-filter:none] max-[480px]:px-[1rem] max-[480px]:pt-[1rem] max-[480px]:pb-[0.9rem] max-[480px]:text-[1.08rem] max-[480px]:leading-[1.48]";
  const desktopHintNode = <span>{isMacSafari ? macHint : desktopHint}</span>;

  const iosHintNode = locale === "et" ? (
    <InstallHintSteps
      items={[
        <>
          {t("pwa.instructions.ios_steps.step_1_prefix")}{" "}
          <InstallInlineToken>
            <span>&quot;{t("pwa.instructions.ios_steps.share_label")}</span>
            <ShareIcon />
            <span>&quot;</span>
          </InstallInlineToken>
        </>,
        <>
          {t("pwa.instructions.ios_steps.step_2_prefix")}{" "}
          <InstallInlineToken>
            <span>&quot;{t("pwa.instructions.ios_steps.more_label")}</span>
            <MoreIcon />
            <span>&quot;</span>
          </InstallInlineToken>
        </>,
        <>
          {t("pwa.instructions.ios_steps.step_3_prefix")}{" "}
          <InstallInlineToken>
            <span>&quot;{t("pwa.instructions.ios_steps.add_home_label")}</span>
            <AddToHomeIcon />
            <span>&quot;</span>
          </InstallInlineToken>
        </>
      ]}
    />
  ) : iosHint;
  const androidHintNode = locale === "et" ? (
    <InstallHintSteps
      items={[
        <>
          {t("pwa.instructions.android_steps.step_1_prefix")} &quot;{t("pwa.instructions.android_steps.menu_label")}&quot;
        </>,
        <>
          {t("pwa.instructions.android_steps.step_2_prefix")} &quot;{t("pwa.instructions.android_steps.add_home_label")} {" "}<AddToHomeIcon />&quot;
        </>
      ]}
    />
  ) : androidHint;
  const mobileHintNode = isIOS ? iosHintNode : androidHintNode;

  useEffect(() => {
    if (!inlineMessage) return;
    const id = window.setTimeout(() => setInlineMessage(""), 7000);
    return () => window.clearTimeout(id);
  }, [inlineMessage]);

  useEffect(() => {
    if (!helpOpen) return;

    const onPointerDown = (event) => {
      const pop = helpPopoverRef.current;
      const trigger = triggerRef.current;
      if (pop?.contains(event.target)) return;
      if (trigger?.contains(event.target)) return;
      setHelpOpen(false);
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") setHelpOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [helpOpen]);

  useLayoutEffect(() => {
    if (!helpOpen || typeof window === "undefined") {
      setHelpPopoverPlacement(null);
      return undefined;
    }

    const updatePlacement = () => {
      const trigger = triggerRef.current;
      const popover = helpPopoverRef.current;
      if (!trigger || !popover) return;

      const margin = 12;
      const gap = 10;
      const rect = trigger.getBoundingClientRect();
      const popRect = popover.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const width = Math.min(popRect.width || 0, viewportWidth - margin * 2);
      const centerX = rect.left + rect.width / 2;
      const left = Math.min(
        Math.max(centerX, margin + width / 2),
        viewportWidth - margin - width / 2
      );
      const spaceBelow = viewportHeight - rect.bottom - gap - margin;
      const spaceAbove = rect.top - gap - margin;
      const fitsBelow = spaceBelow >= popRect.height;
      const fitsAbove = spaceAbove >= popRect.height;
      const shouldPreferAbove =
        mobilePopoverPreferAbove &&
        (window.matchMedia?.("(max-width: 768px)")?.matches || isIOS);
      const placeAbove =
        shouldPreferAbove ? (fitsAbove || spaceAbove > 0) : (!fitsBelow && (fitsAbove || spaceAbove > spaceBelow));
      const top = placeAbove
        ? Math.max(rect.top - gap - popRect.height, margin)
        : Math.min(rect.bottom + gap, viewportHeight - margin - popRect.height);

      setHelpPopoverPlacement({
        top,
        left,
        width
      });
    };

    let raf2 = 0;
    const raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(updatePlacement);
    });

    const onScroll = () => {
      window.requestAnimationFrame(updatePlacement);
    };
    const onResize = () => {
      window.requestAnimationFrame(updatePlacement);
    };

    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);

    return () => {
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [helpOpen, isIOS, mobilePopoverPreferAbove]);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    setIsStandalone(standalone);

    try {
      const ua = navigator.userAgent || "";
      const vendor = navigator.vendor || "";
      const platform =
        navigator.userAgentData?.platform || navigator.platform || "";
      const likelyIOS =
        /iPhone|iPad|iPod/i.test(ua) ||
        (platform === "MacIntel" && navigator.maxTouchPoints > 1);
      const isSafariEngine =
        /Safari/i.test(ua) && /Apple Computer/i.test(vendor);
      const likelyMac = /Mac/i.test(platform) && !likelyIOS;

      setIsIOS(likelyIOS);
      setIsMacSafari(Boolean(likelyMac && isSafariEngine));
      setIsMobileViewport(
        window.matchMedia?.("(max-width: 768px)")?.matches ??
          /Android|iPhone|iPad|iPod/i.test(ua)
      );
    } catch {}

    const existing =
      typeof window !== "undefined" ? window.__deferredPWAInstallPrompt : undefined;
    if (existing) {
      setDeferredPrompt(existing);
      setCanInstall(true);
    }

    const onBeforeInstall = e => {
      if (!e.defaultPrevented) e.preventDefault();
      try {
        window.__deferredPWAInstallPrompt = e;
      } catch {}
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    const onInstalled = () => {
      try {
        window.__deferredPWAInstallPrompt = null;
      } catch {}
      setCanInstall(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleClick = useCallback(
    async e => {
      e.preventDefault();
      const isMobile = isMobileViewport || isIOS;

      if (isMobile) {
        setHelpOpen((current) => !current);
        setInlineMessage("");
        return;
      }

      if (deferredPrompt) {
        deferredPrompt.prompt();
        try {
          await deferredPrompt.userChoice;
        } finally {
          try {
            window.__deferredPWAInstallPrompt = null;
          } catch {}
          setDeferredPrompt(null);
          setCanInstall(false);
        }
        return;
      }

      const message = isMobile
        ? isIOS
          ? iosHint
          : androidHint
        : isMacSafari
          ? macHint
          : desktopHint;

      if (message) {
        setHelpOpen((current) => !current);
        setInlineMessage("");
      }
    },
    [
      androidHint,
      deferredPrompt,
      desktopHint,
      iosHint,
      isIOS,
      isMobileViewport,
      isMacSafari,
      macHint
    ]
  );

  if (isStandalone) return null;

  const shouldHideDesktopInstall = !isMobileViewport && !isIOS && !canInstall;
  if (shouldHideDesktopInstall) return null;

  const installCta =
    isMobileViewport || isIOS ? installCtaMobile : installCtaDesktop;

  const helpPopover =
    helpOpen && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={helpPopoverRef}
            role="dialog"
            aria-modal="false"
            aria-label={isMobileViewport || isIOS ? t("pwa.cta_mobile") : t("pwa.cta_desktop")}
            className={helpPopoverClassName}
            style={
              helpPopoverPlacement
                ? {
                    top: `${helpPopoverPlacement.top}px`,
                    left: `${helpPopoverPlacement.left}px`,
                    width: `${helpPopoverPlacement.width}px`,
                    transform: "translateX(-50%)"
                  }
                : {
                    top: "-10000px",
                    left: "-10000px",
                    width: "min(18rem, calc(100vw - 1.5rem))",
                    transform: "translateX(-50%)"
                  }
            }
          >
        <button
          type="button"
          className="absolute right-[0.12rem] top-[0.08rem] h-[2.2rem] w-[2.2rem] rounded-full border-0 bg-transparent text-[1.7rem] leading-none text-[color:var(--icon-btn-close-color)] hc:text-[color:var(--hc-accent)]"
          aria-label={t("buttons.close")}
          onClick={() => setHelpOpen(false)}
        >
              {t("symbols.times")}
            </button>
            <div className="flex max-w-[inherit] flex-col pr-[1.38rem]">
              <div className="mt-[0.02rem] text-left text-[1.02rem] leading-[1.42] text-inherit opacity-95 max-[480px]:text-[1.08rem] max-[480px]:leading-[1.48]">
                {isMobileViewport || isIOS ? mobileHintNode : desktopHintNode}
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  if (variant === "section") {
    return (
      <section className="glass-section install-section">
        <p>
          <strong>{resolvedHeading}</strong>
        </p>
        <p className="relative">
          <a href="#" ref={triggerRef} className={linkBrandBase} onClick={handleClick}>
            {installCta}
          </a>
          {helpPopover}
        </p>
      </section>
    );
  }

  if (variant === "row") {
    return (
      <span className="relative inline-flex flex-col items-start align-top">
        <a
          href="#"
          ref={triggerRef}
          className={cn(linkBrandBase, className)}
          onClick={handleClick}
        >
          {installCta}
        </a>
        {helpPopover}
      </span>
    );
  }

  return (
    <li className="relative">
      <a href="#" ref={triggerRef} className={linkBrandBase} onClick={handleClick}>
        {installCta}
      </a>
      {helpPopover}
    </li>
  );
}
