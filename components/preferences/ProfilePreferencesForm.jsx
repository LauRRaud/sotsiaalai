"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LOCALE_OPTIONS,
  CONTRAST_OPTIONS,
  FONT_SIZE_OPTIONS,
  MOTION_OPTIONS,
} from "./options";
import { applyHtmlAttributes, readHtmlAttributes } from "./dom";

export default function ProfilePreferencesForm({ initialPreferences }) {
  const router = useRouter();
  const t = useTranslations("profile.preferences");
  const [locale, setLocale] = useState(initialPreferences.locale);
  const [contrast, setContrast] = useState(initialPreferences.contrast);
  const [fontSize, setFontSize] = useState(initialPreferences.fontSize);
  const [motion, setMotion] = useState(initialPreferences.motion);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const initialRef = useRef({
    locale: initialPreferences.locale,
    contrast: initialPreferences.contrast,
    fontSize: initialPreferences.fontSize,
    motion: initialPreferences.motion,
  });
  const htmlOriginalRef = useRef(readHtmlAttributes());

  useEffect(() => {
    applyHtmlAttributes({ contrast, fontSize, motion });
  }, [contrast, fontSize, motion]);

  const hasChanges = useMemo(() => {
    const initial = initialRef.current;
    return (
      locale !== initial.locale ||
      contrast !== initial.contrast ||
      fontSize !== initial.fontSize ||
      motion !== initial.motion
    );
  }, [locale, contrast, fontSize, motion]);

  const resetPreview = useCallback(() => {
    const initial = initialRef.current;
    setLocale(initial.locale);
    setContrast(initial.contrast);
    setFontSize(initial.fontSize);
    setMotion(initial.motion);
    applyHtmlAttributes({
      contrast: initial.contrast,
      fontSize: initial.fontSize,
      motion: initial.motion,
    });
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      if (saving || !hasChanges) return;

      setSaving(true);
      setError("");
      setSuccess("");

      try {
        const response = await fetch("/api/prefs/accessibility", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            locale,
            contrast,
            fs: fontSize,
            motion,
          }),
        });

        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          const message = payload?.message || t("save_failed");
          setError(message);
          resetPreview();
          setSaving(false);
          return;
        }

        const persisted = payload?.preferences || {};
        initialRef.current = {
          locale: persisted.locale ?? locale,
          contrast: persisted.contrast ?? contrast,
          fontSize: persisted.fontSize ?? fontSize,
          motion: persisted.motion ?? motion,
        };

        htmlOriginalRef.current = {
          contrast: initialRef.current.contrast,
          fontSize: initialRef.current.fontSize,
          motion: initialRef.current.motion,
        };

        setLocale(initialRef.current.locale);
        setContrast(initialRef.current.contrast);
        setFontSize(initialRef.current.fontSize);
        setMotion(initialRef.current.motion);

        setSuccess(t("saved"));
        setSaving(false);
        router.refresh();
      } catch (cause) {
        console.error("Profile preferences PUT failed", cause);
        setError(t("save_failed"));
        resetPreview();
        setSaving(false);
      }
    },
    [locale, contrast, fontSize, motion, hasChanges, saving, router, resetPreview, t]
  );

  const handleCancel = useCallback(() => {
    setError("");
    setSuccess("");
    resetPreview();
  }, [resetPreview]);

  return (
    <form className="profile-preferences" onSubmit={handleSubmit} noValidate>
      <header className="profile-preferences__header">
        <h2 className="profile-preferences__title">{t("title")}</h2>
        <p className="profile-preferences__hint">{t("hint")}</p>
      </header>

      <section className="profile-preferences__group" aria-labelledby="profile-locale-group">
        <h3 id="profile-locale-group" className="profile-preferences__group-title">
          {t("sections.locale")}
        </h3>
        <div className="profile-preferences__choices">
          {LOCALE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={[
                "profile-preferences__choice",
                locale === option.value ? "profile-preferences__choice--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <input
                type="radio"
                name="locale"
                value={option.value}
                checked={locale === option.value}
                onChange={() => setLocale(option.value)}
                disabled={saving}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="profile-preferences__group" aria-labelledby="profile-contrast-group">
        <h3 id="profile-contrast-group" className="profile-preferences__group-title">
          {t("sections.contrast")}
        </h3>
        <div className="profile-preferences__choices">
          {CONTRAST_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={[
                "profile-preferences__choice",
                contrast === option.value ? "profile-preferences__choice--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <input
                type="radio"
                name="contrast"
                value={option.value}
                checked={contrast === option.value}
                onChange={() => setContrast(option.value)}
                disabled={saving}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="profile-preferences__group" aria-labelledby="profile-font-group">
        <h3 id="profile-font-group" className="profile-preferences__group-title">
          {t("sections.fontSize")}
        </h3>
        <div className="profile-preferences__choices">
          {FONT_SIZE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={[
                "profile-preferences__choice",
                fontSize === option.value ? "profile-preferences__choice--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <input
                type="radio"
                name="fontSize"
                value={option.value}
                checked={fontSize === option.value}
                onChange={() => setFontSize(option.value)}
                disabled={saving}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="profile-preferences__group" aria-labelledby="profile-motion-group">
        <h3 id="profile-motion-group" className="profile-preferences__group-title">
          {t("sections.motion")}
        </h3>
        <div className="profile-preferences__choices">
          {MOTION_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={[
                "profile-preferences__choice",
                motion === option.value ? "profile-preferences__choice--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <input
                type="radio"
                name="motion"
                value={option.value}
                checked={motion === option.value}
                onChange={() => setMotion(option.value)}
                disabled={saving}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </section>

      <div className="profile-preferences__status" aria-live="polite">
        {error ? <p className="profile-preferences__error">{error}</p> : null}
        {success && !error ? <p className="profile-preferences__success">{success}</p> : null}
      </div>

      <div className="profile-preferences__actions">
        <button
          type="button"
          className="btn-outline"
          onClick={handleCancel}
          disabled={saving || !hasChanges}
        >
          {t("reset")}
        </button>
        <button
          type="submit"
          className="btn-primary profile-preferences__save"
          disabled={saving || !hasChanges}
        >
          {saving ? t("saving") : t("save")}
        </button>
      </div>
    </form>
  );
}
