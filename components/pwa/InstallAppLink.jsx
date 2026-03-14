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
        <path d="M12 16V4" />
        <path d="M7.5 8.5 12 4l4.5 4.5" />
        <path d="M6.5 10.5h-1A2.5 2.5 0 0 0 3 13v5.5A2.5 2.5 0 0 0 5.5 21h13a2.5 2.5 0 0 0 2.5-2.5V13a2.5 2.5 0 0 0-2.5-2.5h-1" />
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
  const androidHint = t(
    "pwa.instructions.android",
    'Android: ava brauseri menyy ja vali "Add to Home screen".'
  );
  const macHint = t("pwa.instructions.mac");
  const desktopHint = t("pwa.instructions.desktop");
  const helpPopoverClassName =
    "absolute left-1/2 top-[calc(100%+0.62rem)] z-[40] w-[min(19.6rem,calc(100vw-1.6rem))] -translate-x-1/2 rounded-[16px] " +
    "border px-[0.95rem] pt-[0.72rem] pb-[0.68rem] shadow-[0_14px_28px_rgba(0,0,0,0.3)] " +
    "bg-[#13151b] text-[#f3eee8] border-[rgba(255,255,255,0.12)] " +
    "[.theme-night_&]:bg-[#0d1422] [.theme-night_&]:text-[#eef4ff] [.theme-night_&]:border-[rgba(148,163,184,0.24)] " +
    "[.theme-dark_&]:bg-[#13151b] [.theme-dark_&]:text-[#f3eee8] [.theme-dark_&]:border-[rgba(255,255,255,0.12)] " +
    "[.theme-mid_&]:bg-[#f3ece8] [.theme-mid_&]:text-[#4a3833] [.theme-mid_&]:border-[rgba(122,58,56,0.14)] [.theme-mid_&]:shadow-[0_12px_24px_rgba(80,58,52,0.12)] " +
    "[.theme-light:not(.theme-mid)_&]:bg-[#fffaf8] [.theme-light:not(.theme-mid)_&]:text-[#111827] [.theme-light:not(.theme-mid)_&]:border-[rgba(122,58,56,0.12)] [.theme-light:not(.theme-mid)_&]:shadow-[0_12px_24px_rgba(15,23,42,0.12)]";
  const mutedHintClass =
    "text-[color:var(--pt-300)] font-medium text-[1em] whitespace-normal";
  const inlineMessageClass =
    "mt-[0.42rem] text-[0.96em] leading-[1.35] text-[color:var(--pt-200)]";

  const mobileHintNodeEt = (
    <span>
      Vajuta &quot;Jaga&quot; <ShareIcon /> ja seejärel &quot;Vaata veel&quot; <MoreIcon />.
      {" "}Ekraanile lisamiseks vajuta <AddToHomeIcon />.
    </span>
  );
  const mobileHintNode = locale === "et" ? mobileHintNodeEt : iosHint;

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

      if (message) setInlineMessage(message);
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

  const installCta =
    isMobileViewport || isIOS ? installCtaMobile : installCtaDesktop;

  const helpPopover = helpOpen ? (
    <div
      ref={helpPopoverRef}
      role="dialog"
      aria-modal="false"
      aria-label={t("pwa.cta_mobile")}
      className={helpPopoverClassName}
    >
      <button
        type="button"
        className="absolute right-[0.12rem] top-[0.04rem] h-[2.05rem] w-[2.05rem] rounded-full border-0 bg-transparent text-[1.56rem] leading-none text-[#c57171] light:text-[#7a3a38]"
        aria-label={t("buttons.close")}
        onClick={() => setHelpOpen(false)}
      >
        {t("symbols.times")}
      </button>
      <div className="flex flex-col pr-[1.28rem] max-w-[inherit]">
        <div className="mt-[0.06rem] text-[1.04rem] leading-[1.38] text-inherit opacity-95">
          {mobileHintNode}
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
        {!isMobileViewport && !isIOS && !canInstall && isMacSafari ? (
          <p className={mutedHintClass}>{macHint}</p>
        ) : null}
        {inlineMessage ? (
          <p className={inlineMessageClass} role="status" aria-live="polite">
            {inlineMessage}
          </p>
        ) : null}
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
        {inlineMessage ? (
          <span className={inlineMessageClass} role="status" aria-live="polite">
            {inlineMessage}
          </span>
        ) : null}
      </span>
    );
  }

  return (
    <li className="relative">
      <a href="#" ref={triggerRef} className={linkBrandBase} onClick={handleClick}>
        {installCta}
      </a>
      {helpPopover}
      {inlineMessage ? (
        <p className={inlineMessageClass} role="status" aria-live="polite">
          {inlineMessage}
        </p>
      ) : null}
    </li>
  );
}
