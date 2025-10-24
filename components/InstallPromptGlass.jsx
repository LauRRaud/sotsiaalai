"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function InstallPromptGlass({
  title = "Kas soovid rakenduse installida arvutisse?",
  body = "Installitud rakendus avaneb eraldi aknas, ilma brauseriribata.",
  yes = "Jah",
  no = "Ei",
  help = "Installimiseks ava oma brauseri menüüst käsu „Install app” või kasuta aadressiriba installi ikooni.",
  linkLabel = "Lae SotsiaalAI arvutisse alla",
}) {
  const [deferred, setDeferred] = useState(null);
  const [open, setOpen] = useState(false);
  const [installed, setInstalled] = useState(false);
  const yesRef = useRef(null);
  const noRef = useRef(null);

  const isStandalone =
    typeof window !== "undefined" &&
    (window.matchMedia?.("(display-mode: standalone)").matches ||
      window.navigator.standalone === true);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const onBeforeInstall = (event) => {
      event.preventDefault();
      if (isStandalone) return;
      setDeferred(event);
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
  }, [isStandalone]);

  useEffect(() => {
    if (!open || typeof window === "undefined") return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    const id = window.setTimeout(() => {
      if (deferred) {
        yesRef.current?.focus();
      } else {
        noRef.current?.focus();
      }
    }, 0);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(id);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, deferred]);

  if (installed || isStandalone) {
    return null;
  }

  const handleInstall = async () => {
    if (!deferred) {
      return;
    }

    deferred.prompt();
    const { outcome } = await deferred.userChoice;

    if (outcome === "accepted") {
      setInstalled(true);
      setOpen(false);
    } else {
      setOpen(false);
    }

    setDeferred(null);
  };

  const modal =
    open && typeof document !== "undefined"
      ? createPortal(
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
                {!deferred ? (
                  <p className="mt-4 text-sm opacity-75">{help}</p>
                ) : null}
                <div className="mt-5 flex justify-end gap-2">
                  <button
                    onClick={() => setOpen(false)}
                    className="px-4 py-2 rounded-xl border"
                    type="button"
                    ref={noRef}
                  >
                    {no}
                  </button>
                  <button
                    ref={yesRef}
                    onClick={handleInstall}
                    className="px-4 py-2 rounded-xl text-white"
                    style={{ background: "linear-gradient(180deg,#111,#000)" }}
                    type="button"
                    disabled={!deferred}
                  >
                    {yes}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <li>
        <button
          type="button"
          className="link-brand"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
        >
          {linkLabel}
        </button>
      </li>
      {modal}
    </>
  );
}
