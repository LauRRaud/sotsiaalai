"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import useT from "@/components/i18n/useT";
import { useI18n } from "@/components/i18n/I18nProvider";
import { cn } from "@/components/ui/cn";
import { linkBrandBase } from "@/components/ui/linkStyles";

function InstallHintIcon({ children, className }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex h-[1.15em] w-[1.15em] align-[-0.18em] items-center justify-center text-current",
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

function InstallHintSteps({ items }) {
  return (
    <ol className="m-0 list-none p-0 space-y-[0.12rem] text-left">
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-[0.08rem]">
          <span className="w-[0.92rem] shrink-0 text-right leading-[1.34] tabular-nums">
            {index + 1}.
          </span>
          <span className="min-w-0 flex-1 leading-[1.34]">{item}</span>
        </li>
      ))}
    </ol>
  );
}

export default function InstallAppLink({
  variant = "list",
  heading,
  className
}) {
  const [canInstall, setCanInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isMacSafari, setIsMacSafari] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [inlineMessage, setInlineMessage] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);
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
    "absolute left-1/2 top-[calc(100%+0.62rem)] z-[40] w-[min(16.8rem,calc(100vw-2.4rem))] max-[480px]:w-[min(15.5rem,calc(100vw-2.8rem))] -translate-x-1/2 rounded-[16px] " +
    "border-0 px-[0.86rem] pt-[0.78rem] pb-[0.7rem] shadow-[var(--home-panel-shadow)] " +
    "bg-[rgba(10,14,24,0.84)] text-[#f3eee8] backdrop-blur-0 [-webkit-backdrop-filter:none] [backdrop-filter:none] " +
    "[.theme-night_&]:bg-[rgba(10,14,24,0.86)] [.theme-night_&]:text-[#eef4ff] " +
    "[.theme-dark_&]:bg-[rgba(10,14,24,0.84)] [.theme-dark_&]:text-[#f3eee8] " +
    "[.theme-mid_&]:bg-[rgba(252,248,247,0.92)] [.theme-mid_&]:text-[#4a3833] [.theme-mid_&]:shadow-[var(--home-panel-shadow)] " +
    "[.theme-light:not(.theme-mid)_&]:bg-[rgba(247,247,246,0.94)] [.theme-light:not(.theme-mid)_&]:text-[#111827] [.theme-light:not(.theme-mid)_&]:shadow-[var(--home-panel-shadow)]";
  const desktopHintNode = <span>{isMacSafari ? macHint : desktopHint}</span>;

  const iosHintNode = locale === "et" ? (
    <InstallHintSteps
      items={[
        <>
          {t("pwa.instructions.ios_steps.step_1_prefix")} &quot;{t("pwa.instructions.ios_steps.share_label")} {" "}<ShareIcon />&quot;
        </>,
        <>
          {t("pwa.instructions.ios_steps.step_2_prefix")} &quot;{t("pwa.instructions.ios_steps.more_label")} {" "}<MoreIcon />&quot;
        </>,
        <>
          {t("pwa.instructions.ios_steps.step_3_prefix")} &quot;{t("pwa.instructions.ios_steps.add_home_label")} {" "}<AddToHomeIcon />&quot;
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

  const helpPopover = helpOpen ? (
    <div
      ref={helpPopoverRef}
      role="dialog"
      aria-modal="false"
      aria-label={isMobileViewport || isIOS ? t("pwa.cta_mobile") : t("pwa.cta_desktop")}
      className={helpPopoverClassName}
    >
      <button
        type="button"
        className="absolute right-[0.14rem] top-[0.08rem] h-[2.05rem] w-[2.05rem] rounded-full border-0 bg-transparent text-[1.56rem] leading-none text-[#c57171] light:text-[#7a3a38]"
        aria-label={t("buttons.close")}
        onClick={() => setHelpOpen(false)}
      >
        {t("symbols.times")}
      </button>
      <div className="flex max-w-[inherit] flex-col pr-[1.55rem]">
        <div className="mt-[0.02rem] text-left text-[0.98rem] leading-[1.34] text-inherit opacity-95">
          {isMobileViewport || isIOS ? mobileHintNode : desktopHintNode}
        </div>
      </div>
    </div>
  ) : null;

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
