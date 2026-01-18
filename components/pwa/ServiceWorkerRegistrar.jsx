"use client";

import { useEffect } from "react";
export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (!window.isSecureContext) return;
    const controller = new AbortController();
    const register = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js", {
          scope: "/"
        });
      } catch (err) {
        console.warn("SW register failed", err);
      }
    };
    const id = setTimeout(register, 0);
    return () => {
      clearTimeout(id);
      controller.abort();
    };
  }, []);
  return null;
}