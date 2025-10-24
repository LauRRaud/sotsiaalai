"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SNOOZE_STORAGE_KEY = "pwa_install_snooze_until";

export default function InstallPromptGlass({
  title = "Kas soovid rakenduse installida arvutisse?",
  body = "Installitud rakendus avaneb eraldi aknas, ilma brauseriribata.",
  yes = "Jah",
  no = "Ei",
  snoozeDaysOnNo = 7,
  snoozeDaysOnDismiss = 1,
}) {
  const [deferred, setDeferred] = useState(null);
  const [open, setOpen] = useState(false);
  const [installed, setInstalled] = useState(false);
  const yesRef = useRef(null);

  const isStandalone =
    typeof window !== "undefined" &&
    (window.matchMedia?.("(display-mode: standalone)").matches ||
      window.navigator.standalone === true);

  const snoozed = useCallback(() => {
    try {
      const until = localStorage.getItem(SNOOZE_STORAGE_KEY);
      return until ? new Date(until) > new Date() : false;
    } catch {
      return false;
    }
  }, []);

  const snooze = useCallback((days) => {
    const until = new Date();
    until.setDate(until.getDate() + days);
    try {
      localStorage.setItem(SNOOZE_STORAGE_KEY, until.toISOString());
    } catch {
      // ignore write errors (e.g. private mode)
    }
  }, []);

  useEffect(() => {
    const onBeforeInstall = (event) => {
      event.preventDefault();
      if (isStandalone || snoozed()) return;
      setDeferred(event);
      setOpen(true);
    };

    const onInstalled = () => {
      setInstalled(true);
      setOpen(false);
      setDeferred(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [isStandalone, snoozed]);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        snooze(snoozeDaysOnDismiss);
        setOpen(false);
      }
    };

    const id = window.setTimeout(() => yesRef.current?.focus(), 0);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(id);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, snooze, snoozeDaysOnDismiss]);

  if (installed || isStandalone) {
    return null;
  }

  const handleInstall = async () => {
    if (!deferred) return;

    deferred.prompt();
    const { outcome } = await deferred.userChoice;

    if (outcome === "accepted") {
      setInstalled(true);
      setOpen(false);
    } else {
      snooze(snoozeDaysOnDismiss);
      setOpen(false);
    }

    setDeferred(null);
  };

  const handleSnooze = () => {
    snooze(snoozeDaysOnNo);
    setOpen(false);
  };

  const canInstall = Boolean(deferred);

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-install-title"
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,.35)", backdropFilter: "blur(4px)" }}
        >
          <div
            className="w-full max-w-md rounded-2xl border"
            style={{
              background: "rgba(255,255,255,.72)",
              backdropFilter: "blur(16px)",
              borderColor: "rgba(0,0,0,.15)",
            }}
          >
            <div className="px-6 py-5">
              <h2 id="pwa-install-title" className="text-lg font-semibold mb-1">
                {title}
              </h2>
              <p className="text-sm opacity-80">{body}</p>
              <div className="mt-5 flex justify-end gap-2">
                <button onClick={handleSnooze} className="px-4 py-2 rounded-xl border">
                  {no}
                </button>
                <button
                  ref={yesRef}
                  onClick={handleInstall}
                  className="px-4 py-2 rounded-xl text-white"
                  style={{ background: "linear-gradient(180deg,#111,#000)" }}
                >
                  {yes}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <section
        className="mt-12 rounded-3xl border px-6 py-8 text-center"
        style={{ background: "rgba(255,255,255,.6)", backdropFilter: "blur(10px)" }}
      >
        <h3 className="text-xl font-semibold">Installi SotsiaalAI arvutisse</h3>
        <p className="mt-1 text-sm opacity-75">Installitud rakendus avaneb eraldi aknas.</p>
        {canInstall ? (
          <button
            onClick={handleInstall}
            className="mt-4 px-6 py-3 rounded-2xl text-white"
            style={{ background: "linear-gradient(180deg,#111,#000)" }}
          >
            Installi rakendus
          </button>
        ) : (
          <details className="mt-4 inline-block text-left">
            <summary className="cursor-pointer underline">Kuidas paigaldada, kui nuppu ei näe</summary>
            <div className="mt-2 text-sm opacity-80">
              <p>
                <strong>Chrome / Edge:</strong> Aadressiriba “Install” ikoon → <em>Install app</em>.
              </p>
              <p>
                <strong>Safari (macOS):</strong> Share → <em>Add to Dock</em>.
              </p>
            </div>
          </details>
        )}
      </section>
    </>
  );
}
