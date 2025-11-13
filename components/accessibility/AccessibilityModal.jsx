"use client";
import { useEffect, useRef, useState } from "react";
import FancyCheckbox from "@/components/ui/FancyCheckbox";
import FancyRadio from "@/components/ui/FancyRadio";
import { useI18n } from "@/components/i18n/I18nProvider";
import { useRouter } from "next/navigation";
export default function AccessibilityModal({ onClose, prefs, onSave, onPreview, onPreviewEnd }) {
  const boxRef = useRef(null);
  const firstFocusRef = useRef(null);
  const { t, locale, setLocale, setMessages } = useI18n();
  const router = useRouter();
  const [textScale, setTextScale] = useState(prefs.textScale || "md");
  const [contrast, setContrast] = useState(prefs.contrast || "normal");
  const [reduceMotion, setReduceMotion] = useState(!!prefs.reduceMotion);
  const [lang, setLang] = useState(locale || "et");
  const originalLocaleRef = useRef(locale);
  const previewedLangRef = useRef(null);
  // Sync local state when modal opens with fresh prefs
  useEffect(() => {
    setTextScale(prefs.textScale || "md");
    setContrast(prefs.contrast || "normal");
    setReduceMotion(!!prefs.reduceMotion);
  }, [prefs]);
  // Live language preview (no cookie)
  useEffect(() => {
    let canceled = false;
    async function applyLanguageMessages(targetLocale) {
      try {
        const LOADERS = {
          et: () => import("@/messages/et.json"),
          ru: () => import("@/messages/ru.json"),
          en: () => import("@/messages/en.json"),
        };
        const mod = await (LOADERS[targetLocale] ? LOADERS[targetLocale]() : LOADERS.et());
        if (!canceled) {
          setMessages(mod?.default || {});
          previewedLangRef.current = targetLocale;
        }
      } catch {}
    }
    if (lang && lang !== originalLocaleRef.current) {
      applyLanguageMessages(lang);
    } else if (lang === originalLocaleRef.current) {
      applyLanguageMessages(originalLocaleRef.current);
      previewedLangRef.current = null;
    }
    return () => { canceled = true; };
  }, [lang, setMessages]);
  // Focus trap + ESC close
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose?.();
      }
      if (e.key === "Tab" && boxRef.current) {
        const nodes = boxRef.current.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        const focusables = Array.from(nodes).filter((n) => (n.offsetWidth > 0 || n.offsetHeight > 0));
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  // Autofocus first control on mount
  useEffect(() => {
    firstFocusRef.current?.focus?.();
  }, []);
  const stopInside = (e) => e.stopPropagation();
  const save = async () => {
    onSave?.({ textScale, contrast, reduceMotion });
    // Change language if needed: update cookie + client messages immediately, then refresh SSR
    if (typeof window !== "undefined" && lang && lang !== locale) {
      setLocale(lang);
      // Load messages client-side for instant update (no full reload flicker)
      try {
        const LOADERS = {
          et: () => import("@/messages/et.json"),
          ru: () => import("@/messages/ru.json"),
          en: () => import("@/messages/en.json"),
        };
        const mod = await (LOADERS[lang] ? LOADERS[lang]() : LOADERS.et());
        const msgs = mod?.default || {};
        setMessages(msgs);
      } catch {}
      try {
        const current = `${window.location.pathname}${window.location.search || ""}${window.location.hash || ""}`;
        router.replace(current, { scroll: false });
        router.refresh();
      } catch {}
    }
    onPreviewEnd?.();
    onClose?.();
  };
  useEffect(() => {
    onPreview?.({ textScale, contrast, reduceMotion });
  }, [textScale, contrast, reduceMotion, onPreview]);
  useEffect(() => () => {
    onPreviewEnd?.();
  }, [onPreviewEnd]);
  // Revert language preview on unmount if not saved
  useEffect(() => () => {
    try {
      const orig = originalLocaleRef.current;
      if (previewedLangRef.current && orig !== previewedLangRef.current) {
        const LOADERS = {
          et: () => import("@/messages/et.json"),
          ru: () => import("@/messages/ru.json"),
          en: () => import("@/messages/en.json"),
        };
        const loader = LOADERS[orig] || LOADERS.et;
        loader().then((mod) => setMessages(mod?.default || {})).catch(() => {});
      }
    } catch {}
  }, [setMessages]);
  return (
    <>
      {/* Backdrop */}
      <div className="a11y-modal-backdrop" onClick={onClose} role="presentation" aria-hidden="true" />
      {/* Modal */}
      <div
        ref={boxRef}
        className="a11y-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="a11y-title"
        onClick={stopInside}
        tabIndex={-1}
      >
        <button type="button" className="a11y-close" aria-label={t("buttons.close")} onClick={onClose}>{"\u00D7"}</button>
        <h2 id="a11y-title" className="glass-title">
          {t("profile.preferences.title")}
        </h2>
        {/* Description removed per request to declutter under title */}
        {/* Keel */}
        <fieldset className="a11y-fieldset">
          <legend className="sr-only">{t("accessibility.language")}</legend>
          <div className="a11y-options">
            <FancyRadio id="lg-et" name="lg" value="et" label={t("accessibility.options.language.et")} checked={lang === "et"} onChange={() => setLang("et")} ref={firstFocusRef} />
            <FancyRadio id="lg-ru" name="lg" value="ru" label={t("accessibility.options.language.ru")} checked={lang === "ru"} onChange={() => setLang("ru")} />
            <FancyRadio id="lg-en" name="lg" value="en" label={t("accessibility.options.language.en")} checked={lang === "en"} onChange={() => setLang("en")} />
          </div>
        </fieldset>
        {/* Teksti suurus */}
        <fieldset className="a11y-fieldset">
          <legend className="a11y-legend" style={{ fontFamily: "var(--font-inter, Arial, sans-serif)", fontWeight: 400, fontSize: "0.95rem" }}>{t("accessibility.text_scale")}</legend>
          <div className="a11y-options">
            <FancyRadio id="ts-sm" name="ts" value="sm" label={t("accessibility.options.text_scale.sm")} checked={textScale === "sm"} onChange={() => setTextScale("sm")} />
            <FancyRadio id="ts-md" name="ts" value="md" label={t("accessibility.options.text_scale.md")} checked={textScale === "md"} onChange={() => setTextScale("md")} />
            <FancyRadio id="ts-lg" name="ts" value="lg" label={t("accessibility.options.text_scale.lg")} checked={textScale === "lg"} onChange={() => setTextScale("lg")} />
            <FancyRadio id="ts-xl" name="ts" value="xl" label={t("accessibility.options.text_scale.xl")} checked={textScale === "xl"} onChange={() => setTextScale("xl")} />
          </div>
        </fieldset>
        {/* Kontrast */}
        <fieldset className="a11y-fieldset">
          <legend className="a11y-legend" style={{ fontFamily: "var(--font-inter, Arial, sans-serif)", fontWeight: 400, fontSize: "0.95rem" }}>{t("accessibility.contrast")}</legend>
          <div className="a11y-options">
            <FancyRadio id="ct-normal" name="ct" value="normal" label={t("accessibility.options.contrast.normal")} checked={contrast === "normal"} onChange={() => setContrast("normal")} />
            <FancyRadio id="ct-hc" name="ct" value="hc" label={t("accessibility.options.contrast.hc")} checked={contrast === "hc"} onChange={() => setContrast("hc")} />
          </div>
        </fieldset>
        {/* Liikumine */}
        <fieldset className="a11y-fieldset">
          <legend className="a11y-legend" style={{ fontFamily: "var(--font-inter, Arial, sans-serif)", fontWeight: 400, fontSize: "0.95rem" }}>{t("accessibility.motion")}</legend>
          <FancyCheckbox
            label={t("accessibility.options.motion.reduce")}
            checked={reduceMotion}
            onChange={(v) => setReduceMotion(v)}
          />
        </fieldset>
        <div className="a11y-actions">
          <button type="button" className="btn-primary btn-spacing-accessibility" onClick={save} aria-label={t("accessibility.save")}>
            {t("accessibility.save")}
          </button>
        </div>
      </div>
    </>
  );
}

