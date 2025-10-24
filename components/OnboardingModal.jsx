"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { sanitizeNextPath } from "@/lib/preferences";
import {
  LOCALE_OPTIONS,
  CONTRAST_OPTIONS,
  FONT_SIZE_OPTIONS,
  MOTION_OPTIONS,
} from "./preferences/options";
import { applyHtmlAttributes, readHtmlAttributes } from "./preferences/dom";

export default function OnboardingModal({
  isOpen,
  onClose = () => {},            // ⬅️ vaikeväärtus: no-op
  preferredLocale = "et",
  initialContrast = "normal",
  initialFontSize = "md",
  initialMotion = "normal",
  nextPath = null,
}) {
  const router = useRouter();
  const initialValuesRef = useRef({
    contrast: initialContrast,
    fontSize: initialFontSize,
    motion: initialMotion,
  });
  const [contrast, setContrast] = useState(initialValuesRef.current.contrast);
  const [fontSize, setFontSize] = useState(initialValuesRef.current.fontSize);
  const [motion, setMotion] = useState(initialValuesRef.current.motion);
  const [error, setError] = useState(null);
  const [submittingLocale, setSubmittingLocale] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const htmlOriginalRef = useRef(readHtmlAttributes());

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      applyHtmlAttributes({ contrast, fontSize, motion });
    }
  }, [contrast, fontSize, motion, isOpen]);

  const resetPreview = useCallback(() => {
    const original = htmlOriginalRef.current;
    const initial = initialValuesRef.current;
    setContrast(initial.contrast);
    setFontSize(initial.fontSize);
    setMotion(initial.motion);
    applyHtmlAttributes({
      contrast: original.contrast ?? initial.contrast,
      fontSize: original.fontSize ?? initial.fontSize,
      motion: original.motion ?? initial.motion,
    });
  }, []);

  const disableControls = Boolean(submittingLocale);

  const localeLabel = useMemo(() => {
    if (!preferredLocale) return null;
    const match = LOCALE_OPTIONS.find((option) => option.value === preferredLocale);
    return match?.label ?? null;
  }, [preferredLocale]);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      if (!isMounted || submittingLocale) return;

      const submitter = event.nativeEvent?.submitter;
      const locale = submitter?.value;
      if (!locale) {
        setError("Vali sobiv keel.");
        return;
      }

      setSubmittingLocale(locale);
      setError(null);

      const payload = {
        locale,
        contrast,
        fs: fontSize,
        motion,
      };
      const sanitizedNext = sanitizeNextPath(nextPath, window.location?.origin ?? undefined);
      if (sanitizedNext) payload.next = sanitizedNext;

      try {
        const response = await fetch("/api/prefs/onboarding", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
          redirect: "manual",
        });

        if (response.status === 303) {
          const location = response.headers.get("Location") ?? response.headers.get("location");
          if (location) {
            window.location.href = location;
            return;
          }
        }

        if (response.ok) {
          const data = await response.json().catch(() => null);
          const redirectTarget = data?.redirect ?? data?.next ?? null;
          if (redirectTarget) {
            router.replace(redirectTarget);
            return;
          }
          window.location.reload();
          return;
        }

        const data = await response.json().catch(() => null);
        const message =
          data?.message ||
          "Eelistuste salvestamine ebaõnnestus. Palun proovi uuesti või kontrolli ühendust.";
        setError(message);
        resetPreview();
        setSubmittingLocale(null);
      } catch (cause) {
        console.error("Onboarding POST failed", cause);
        setError("Eelistuste salvestamine ebaõnnestus. Palun proovi uuesti.");
        resetPreview();
        setSubmittingLocale(null);
      }
    },
    [contrast, fontSize, motion, nextPath, router, submittingLocale, resetPreview, isMounted]
  );

  const handleRadioChange = (setter) => (event) => {
    if (disableControls) return;
    setter(event.target.value);
  };

  const safeClose = useCallback(() => {
    try {
      onClose?.();
    } catch {
      // ignore
    }
  }, [onClose]);

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      safeClose();
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      safeClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="onboarding-modal-overlay"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      tabIndex={-1}
    >
      <div className="onboarding-modal">
        <header className="onboarding-modal__header">
          <h1 id="onboarding-title" className="onboarding-modal__title">
            Keel &amp; ligipääsetavus
          </h1>
          <p className="onboarding-modal__lead">
            Vali keel ja ligipääsetavuse eelistused. Keele nupule vajutamine salvestab eelistused
            ning suunab sind edasi.
          </p>
          <button
            type="button"
            className="onboarding-modal__close"
            onClick={safeClose}
            aria-label="Sulge"
          >
            ×
          </button>
        </header>

        <form
          className="onboarding-form"
          method="POST"
          action="/api/prefs/onboarding"
          onSubmit={handleSubmit}
          noValidate
        >
          <input type="hidden" name="contrast" value={contrast} />
          <input type="hidden" name="fs" value={fontSize} />
          <input type="hidden" name="motion" value={motion} />
          {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}

          <section className="onboarding-form__group" aria-labelledby="contrast-group-label">
            <h2 id="contrast-group-label" className="onboarding-form__group-title">
              Kontrast
            </h2>
            <div className="onboarding-form__choices">
              {CONTRAST_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={[
                    "onboarding-form__choice",
                    contrast === option.value ? "onboarding-form__choice--active" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <input
                    type="radio"
                    name="contrastChoice"
                    value={option.value}
                    checked={contrast === option.value}
                    onChange={handleRadioChange(setContrast)}
                    disabled={disableControls}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="onboarding-form__group" aria-labelledby="fontsize-group-label">
            <h2 id="fontsize-group-label" className="onboarding-form__group-title">
              Kirjasuurus
            </h2>
            <div className="onboarding-form__choices">
              {FONT_SIZE_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={[
                    "onboarding-form__choice",
                    fontSize === option.value ? "onboarding-form__choice--active" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <input
                    type="radio"
                    name="fontSizeChoice"
                    value={option.value}
                    checked={fontSize === option.value}
                    onChange={handleRadioChange(setFontSize)}
                    disabled={disableControls}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="onboarding-form__group" aria-labelledby="motion-group-label">
            <h2 id="motion-group-label" className="onboarding-form__group-title">
              Animatsioonid
            </h2>
            <div className="onboarding-form__choices">
              {MOTION_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={[
                    "onboarding-form__choice",
                    motion === option.value ? "onboarding-form__choice--active" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <input
                    type="radio"
                    name="motionChoice"
                    value={option.value}
                    checked={motion === option.value}
                    onChange={handleRadioChange(setMotion)}
                    disabled={disableControls}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </section>

          <section
            className="onboarding-form__group onboarding-form__group--locales"
            aria-labelledby="locale-group-label"
          >
            <h2 id="locale-group-label" className="onboarding-form__group-title">
              Keel
            </h2>
            {localeLabel ? (
              <p className="onboarding-form__hint">Praegune keel: {localeLabel}</p>
            ) : null}
            <div className="onboarding-form__locale-grid" role="radiogroup" aria-label="Vali keel">
              {LOCALE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="submit"
                  name="locale"
                  value={option.value}
                  className={[
                    "onboarding-form__locale-button",
                    preferredLocale === option.value ? "onboarding-form__locale-button--current" : "",
                    submittingLocale && submittingLocale !== option.value
                      ? "onboarding-form__locale-button--disabled"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  disabled={disableControls && submittingLocale !== option.value}
                  aria-pressed={preferredLocale === option.value}
                >
                  {submittingLocale === option.value ? "Salvestan…" : option.label}
                </button>
              ))}
            </div>
          </section>

          <div className="onboarding-form__status" aria-live="polite" role="status">
            {error ? <p className="onboarding-form__error">{error}</p> : null}
          </div>
        </form>
      </div>
    </div>
  );
}
