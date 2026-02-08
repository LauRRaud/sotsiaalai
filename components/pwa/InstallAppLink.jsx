"use client";

import { useEffect, useState, useCallback } from "react";
import useT from "@/components/i18n/useT";
import { cn } from "@/components/ui/cn";
import { linkBrandBase } from "@/components/ui/linkStyles";
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
  const t = useT();
  const resolvedHeading = heading || t("pwa.heading");
  const installCta = t("pwa.cta");
  const iosHint = t("pwa.instructions.ios");
  const macHint = t("pwa.instructions.mac");
  const mutedHintClass = "text-[color:var(--pt-300)] font-medium text-[1em] whitespace-normal";
  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
    setIsStandalone(standalone);
    try {
      const ua = navigator.userAgent || "";
      const vendor = navigator.vendor || "";
      const platform = navigator.userAgentData?.platform || navigator.platform || "";
      const likelyIOS = /iPhone|iPad|iPod/i.test(ua) || platform === "MacIntel" && navigator.maxTouchPoints > 1;
      const isSafariEngine = /Safari/i.test(ua) && /Apple Computer/i.test(vendor);
      const likelyMac = /Mac/i.test(platform) && !likelyIOS;
      setIsIOS(likelyIOS);
      setIsMacSafari(Boolean(likelyMac && isSafariEngine));
    } catch {}
    const existing = typeof window !== "undefined" ? window.__deferredPWAInstallPrompt : undefined;
    if (existing) {
      setDeferredPrompt(existing);
      setCanInstall(true);
    }
    const onBeforeInstall = e => {
      e.preventDefault();
      try {
        window.__deferredPWAInstallPrompt = e;
      } catch {}
      setDeferredPrompt(e);
      setCanInstall(true);
    };
    const onInstalled = () => {
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
  const handleClick = useCallback(async e => {
    e.preventDefault();
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    try {
      await deferredPrompt.userChoice;
    } finally {
      setDeferredPrompt(null);
      setCanInstall(false);
    }
  }, [deferredPrompt]);
  const showInstallLink = !isStandalone && canInstall;
  const showFallback = !isStandalone && !canInstall && (isIOS || isMacSafari);
  if (!showInstallLink && !showFallback) return null;
  if (variant === "section") {
    return <section className="glass-section install-section">
        <p>
          <strong>{resolvedHeading}</strong>
        </p>
        {showInstallLink ? <p>
            <a href="#" className={linkBrandBase} onClick={handleClick}>
              {installCta}
            </a>
          </p> : null}
        {showFallback ? <p className={mutedHintClass}>{isIOS ? iosHint : macHint}</p> : null}
      </section>;
  }
  if (variant === "row") {
    return showInstallLink ? <a href="#" className={cn(linkBrandBase, className)} onClick={handleClick}>
        {installCta}
      </a> : <span className={className || mutedHintClass}>{isIOS ? iosHint : macHint}</span>;
  }
  return <li>
      {showInstallLink ? <a href="#" className={linkBrandBase} onClick={handleClick}>
          {installCta}
        </a> : <span className={mutedHintClass}>{isIOS ? iosHint : macHint}</span>}
    </li>;
}
