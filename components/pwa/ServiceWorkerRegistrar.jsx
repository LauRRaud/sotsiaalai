"use client";
import { useEffect } from "react";

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (!window.isSecureContext) return; // required for SW on most browsers

    const controller = new AbortController();
    const register = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("SW register failed", err);
      }
    };

    // Defer a tick to avoid competing with initial page work
    const id = setTimeout(register, 0);
    return () => {
      clearTimeout(id);
      controller.abort();
    };
  }, []);

  return null;
}

