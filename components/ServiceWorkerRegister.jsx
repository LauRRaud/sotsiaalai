"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const isSecureContext =
      window.isSecureContext || window.location.hostname === "localhost";

    if (!isSecureContext) return;

    navigator.serviceWorker
      .getRegistration()
      .then((registration) => {
        if (registration) return registration;
        return navigator.serviceWorker.register("/service-worker.js");
      })
      .catch((error) => {
        if (process.env.NODE_ENV !== "production") {
          console.warn("Service worker registration failed", error);
        }
        return undefined;
      });
  }, []);

  return null;
}
