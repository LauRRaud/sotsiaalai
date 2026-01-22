"use client";

import { useEffect, useRef, useState } from "react";
import FancyCheckbox from "@/components/ui/FancyCheckbox";
import FancyRadio from "@/components/ui/FancyRadio";
import Button from "@/components/ui/Button";
import { useI18n } from "@/components/i18n/I18nProvider";
import { useRouter } from "next/navigation";
import CloseButton from "@/components/ui/CloseButton";
import CenteredScrollPicker from "@/components/CenteredScrollPicker";
import "@/components/CenteredScrollPicker.css";
const titleClassName = "mt-[0.25rem] text-[#c57171] [font-family:var(--font-aino-headline),var(--font-aino),Arial,sans-serif] font-[400]";
export default function AccessibilityModal({
  onClose,
  prefs,
  onSave,
  onPreview,
  onPreviewEnd
}) {
  const boxRef = useRef(null);
  const firstFocusRef = useRef(null);
  const scrollRef = useRef(null);
  const {
    t,
    locale,
    setLocale,
    setMessages
  } = useI18n();
  const router = useRouter();
  const [textScale, setTextScale] = useState(prefs.textScale || "md");
  const [contrast, setContrast] = useState(prefs.contrast || "normal");
  const [reduceMotion, setReduceMotion] = useState(!!prefs.reduceMotion);
  const [lang, setLang] = useState(locale || "et");
  const [scrollPad, setScrollPad] = useState(0);
  const originalLocaleRef = useRef(locale);
  const previewedLangRef = useRef(null);
  useEffect(() => {
    setTextScale(prefs.textScale || "md");
    setContrast(prefs.contrast || "normal");
    setReduceMotion(!!prefs.reduceMotion);
  }, [prefs]);
  useEffect(() => {
    let canceled = false;
    async function applyLanguageMessages(targetLocale) {
      try {
        const LOADERS = {
          et: () => import("@/messages/et.json"),
          ru: () => import("@/messages/ru.json"),
          en: () => import("@/messages/en.json")
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
    return () => {
      canceled = true;
    };
  }, [lang, setMessages]);
  useEffect(() => {
    const onKey = e => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose?.();
      }
      if (e.key === "Tab" && boxRef.current) {
        const nodes = boxRef.current.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])');
        const focusables = Array.from(nodes).filter(n => n.offsetWidth > 0 || n.offsetHeight > 0);
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
  useEffect(() => {
    firstFocusRef.current?.focus?.();
  }, []);
  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl || typeof window === "undefined") return;
    const getCssPx = (el, varName) => {
      const raw = window.getComputedStyle(el).getPropertyValue(varName).trim();
      if (!raw) return 0;
      const value = Number.parseFloat(raw);
      return Number.isFinite(value) ? value : 0;
    };
    const updatePad = () => {
      const snapEl = scrollEl.querySelector(".a11y-snap");
      if (!snapEl) return;
      const itemH = snapEl.getBoundingClientRect().height || 0;
      const titleOffset = getCssPx(scrollEl, "--csp-title-offset");
      const viewH = Math.max(0, (scrollEl.clientHeight || 0) - titleOffset);
      if (!viewH || !itemH) return;
      const nextPad = Math.max(0, Math.floor((viewH - itemH) / 2));
      setScrollPad(prev => prev === nextPad ? prev : nextPad);
    };
    updatePad();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(updatePad) : null;
    ro?.observe(scrollEl);
    window.addEventListener("resize", updatePad);
    return () => {
      ro?.disconnect?.();
      window.removeEventListener("resize", updatePad);
    };
  }, []);
  const {
    canScrollUp,
    canScrollDown,
    scrollDirection,
    getItemClassName,
    recompute
  } = CenteredScrollPicker({
    containerRef: scrollRef,
    itemSelector: ".a11y-snap",
    reduceMotion,
    neighborDistance: 1,
    lockWheelToSteps: false,
    settleOnScroll: false,
    enableArrowKeys: true,
    allowArrowKeysInInputs: true,
    captureArrowKeys: true,
    wheelCooldownMs: 240,
    settleMs: 200,
    maxStepPerSettle: 1,
    manageHiddenFocus: true
  });
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      recompute("auto");
    });
    return () => cancelAnimationFrame(raf);
  }, [recompute]);
  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;
    const onFocusIn = event => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const snapTarget = target.closest(".a11y-snap") || target;
      snapTarget.scrollIntoView?.({
        block: "center",
        behavior: reduceMotion ? "auto" : "smooth"
      });
    };
    scrollEl.addEventListener("focusin", onFocusIn);
    return () => scrollEl.removeEventListener("focusin", onFocusIn);
  }, [reduceMotion]);
  const stopInside = e => e.stopPropagation();
  const save = async () => {
    onSave?.({
      textScale,
      contrast,
      reduceMotion
    });
    if (typeof window !== "undefined" && lang && lang !== locale) {
      setLocale(lang);
      try {
        const LOADERS = {
          et: () => import("@/messages/et.json"),
          ru: () => import("@/messages/ru.json"),
          en: () => import("@/messages/en.json")
        };
        const mod = await (LOADERS[lang] ? LOADERS[lang]() : LOADERS.et());
        setMessages(mod?.default || {});
      } catch {}
      try {
        const current = `${window.location.pathname}${window.location.search || ""}${window.location.hash || ""}`;
        router.replace(current, {
          scroll: false
        });
        router.refresh();
      } catch {}
    }
    onPreviewEnd?.();
    onClose?.();
  };
  useEffect(() => {
    onPreview?.({
      textScale,
      contrast,
      reduceMotion
    });
  }, [textScale, contrast, reduceMotion, onPreview]);
  useEffect(() => () => {
    onPreviewEnd?.();
  }, [onPreviewEnd]);
  useEffect(() => () => {
    try {
      const orig = originalLocaleRef.current;
      if (previewedLangRef.current && orig !== previewedLangRef.current) {
        const LOADERS = {
          et: () => import("@/messages/et.json"),
          ru: () => import("@/messages/ru.json"),
          en: () => import("@/messages/en.json")
        };
        const loader = LOADERS[orig] || LOADERS.et;
        loader().then(mod => setMessages(mod?.default || {})).catch(() => {});
      }
    } catch {}
  }, [setMessages]);
  return <>
      <div className="a11y-modal-backdrop" onClick={onClose} role="presentation" aria-hidden="true" />

      <div ref={boxRef} className="a11y-modal" role="dialog" aria-modal="true" aria-labelledby="a11y-title" onClick={stopInside} tabIndex={-1}>
        <CloseButton onClick={onClose} ariaLabel={t("common.close")} className="a11y-close" />
        {}
        <div className="csp-overlayTitle" aria-hidden="false">
          <h2 id="a11y-title" className={titleClassName}>
            {t("profile.preferences.title")}
          </h2>
        </div>

        {}
        <div className={`a11y-modal__scrim a11y-modal__scrim--top csp-scrim csp-scrim--top csp-scrim--chevron ${"is-visible"} ${scrollDirection === "down" ? "is-muted" : ""} ${canScrollUp ? "" : "is-hidden"}`} aria-hidden="true">
          <span className="csp-chevron-frame" aria-hidden="true">
            <span className="csp-chevron-icon" />
          </span>
        </div>
        <div className={`a11y-modal__scrim a11y-modal__scrim--bottom csp-scrim csp-scrim--bottom csp-scrim--chevron ${"is-visible"} ${scrollDirection === "up" ? "is-muted" : ""} ${canScrollDown ? "" : "is-hidden"}`} aria-hidden="true">
          <span className="csp-chevron-frame" aria-hidden="true">
            <span className="csp-chevron-icon" />
          </span>
        </div>

        <div ref={scrollRef} className="a11y-modal__scroll csp-container" style={{
        "--csp-pad": `${scrollPad}px`
      }} tabIndex={0} aria-label={t("profile.preferences.title")}>
          <fieldset className={`a11y-fieldset a11y-snap csp-step ${getItemClassName(0)}`}>
            <legend className="sr-only">{t("accessibility.language")}</legend>
            <div className="a11y-options">
              <FancyRadio id="lg-et" name="lg" value="et" label={t("accessibility.options.language.et")} checked={lang === "et"} onChange={() => setLang("et")} ref={firstFocusRef} />
              <FancyRadio id="lg-ru" name="lg" value="ru" label={t("accessibility.options.language.ru")} checked={lang === "ru"} onChange={() => setLang("ru")} />
              <FancyRadio id="lg-en" name="lg" value="en" label={t("accessibility.options.language.en")} checked={lang === "en"} onChange={() => setLang("en")} />
            </div>
          </fieldset>

          <fieldset className={`a11y-fieldset a11y-snap csp-step ${getItemClassName(1)}`}>
            <legend className="a11y-legend">
              {t("accessibility.text_scale")}
            </legend>
            <div className="a11y-options">
              <FancyRadio id="ts-sm" name="ts" value="sm" label={t("accessibility.options.text_scale.sm")} checked={textScale === "sm"} onChange={() => setTextScale("sm")} />
              <FancyRadio id="ts-md" name="ts" value="md" label={t("accessibility.options.text_scale.md")} checked={textScale === "md"} onChange={() => setTextScale("md")} />
              <FancyRadio id="ts-lg" name="ts" value="lg" label={t("accessibility.options.text_scale.lg")} checked={textScale === "lg"} onChange={() => setTextScale("lg")} />
              <FancyRadio id="ts-xl" name="ts" value="xl" label={t("accessibility.options.text_scale.xl")} checked={textScale === "xl"} onChange={() => setTextScale("xl")} />
            </div>
          </fieldset>

          <fieldset className={`a11y-fieldset a11y-snap csp-step ${getItemClassName(2)}`}>
            <legend className="a11y-legend">
              {t("accessibility.contrast")}
            </legend>
            <div className="a11y-options">
              <FancyRadio id="ct-normal" name="ct" value="normal" label={t("accessibility.options.contrast.normal")} checked={contrast === "normal"} onChange={() => setContrast("normal")} />
              <FancyRadio id="ct-hc" name="ct" value="hc" label={t("accessibility.options.contrast.hc")} checked={contrast === "hc"} onChange={() => setContrast("hc")} />
            </div>
          </fieldset>

          <fieldset className={`a11y-fieldset a11y-snap csp-step ${getItemClassName(3)}`}>
            <legend className="a11y-legend">{t("accessibility.motion")}</legend>
            <FancyCheckbox label={t("accessibility.options.motion.reduce")} checked={reduceMotion} onChange={v => setReduceMotion(v)} />
          </fieldset>

          <div className={`a11y-actions a11y-snap csp-step ${getItemClassName(4)}`}>
            <Button type="button" variant="primary" className="btn-spacing-accessibility" onClick={save} aria-label={t("accessibility.save")}>
              {t("accessibility.save")}
            </Button>
          </div>
        </div>
      </div>
    </>;
}
