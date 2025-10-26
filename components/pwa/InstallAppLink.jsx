"use client";
import { useEffect, useState, useCallback } from "react";
import useT from "@/components/i18n/useT";

export default function InstallAppLink({ variant = "list", heading }) {
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

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    setIsStandalone(standalone);

    // Environment detection for fallbacks (iOS Safari and macOS Safari)
    try {
      const ua = navigator.userAgent || "";
      const vendor = navigator.vendor || "";
      const platform = navigator.userAgentData?.platform || navigator.platform || "";
      const likelyIOS = /iPhone|iPad|iPod/i.test(ua) || (platform === "MacIntel" && navigator.maxTouchPoints > 1);
      const isSafariEngine = /Safari/i.test(ua) && /Apple Computer/i.test(vendor);
      const likelyMac = /Mac/i.test(platform) && !likelyIOS;
      setIsIOS(likelyIOS);
      setIsMacSafari(Boolean(likelyMac && isSafariEngine));
    } catch {}

    // Use a global bucket so navigation between pages doesn't lose the prompt
    const existing = typeof window !== "undefined" ? window.__deferredPWAInstallPrompt : undefined;
    if (existing) {
      setDeferredPrompt(existing);
      setCanInstall(true);
    }

    const onBeforeInstall = (e) => {
      e.preventDefault();
      try { window.__deferredPWAInstallPrompt = e; } catch {}
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

  const handleClick = useCallback(async (e) => {
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
    return (
      <section className="glass-section install-section">
        <p><strong>{resolvedHeading}</strong></p>
        {showInstallLink ? (
          <p>
            <a href="#" className="link-brand" onClick={handleClick}>
              {installCta}
            </a>
          </p>
        ) : null}
        {showFallback ? (
          <p className="text-muted">
            {isIOS ? iosHint : macHint}
          </p>
        ) : null}
      </section>
    );
  }

  // default: render inside a list
  return (
    <li>
      {showInstallLink ? (
        <a href="#" className="link-brand" onClick={handleClick}>
          {installCta}
        </a>
      ) : (
        <span className="text-muted">
          {isIOS ? iosHint : macHint}
        </span>
      )}
    </li>
  );
}
