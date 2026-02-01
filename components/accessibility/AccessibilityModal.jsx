"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import { useI18n } from "@/components/i18n/I18nProvider";
import { useRouter } from "next/navigation";
import CenteredScrollPicker from "@/components/CenteredScrollPicker";
import "@/components/CenteredScrollPicker.css";
const titleClassName = "mt-[0.25rem] text-[#c57171] [font-family:var(--font-aino-headline),var(--font-aino),Arial,sans-serif] font-[400]";
const modalBackdropClassName =
  "fixed inset-0 z-[49] bg-transparent backdrop-blur-[var(--glass-blur-radius,1rem)] min-[48.0625em]:backdrop-blur-0";
const modalRootClassName =
  "fixed left-1/2 top-1/2 z-[50] w-[min(680px,96vw)] max-h-[calc(100dvh-2.5rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[1.5rem] border-0 bg-[var(--glass-surface-bg,rgba(0,0,0,0.25))] text-[color:var(--glass-surface-text,#f2f2f2)] shadow-[var(--glass-shell-shadow,none)] light:[--glass-shell-shadow:0_18px_40px_rgba(0,0,0,0.16)] backdrop-blur-[var(--glass-blur-radius,1rem)] p-[2.4rem_2rem_2rem] text-[1.05rem] leading-[1.35] flex flex-col items-center text-center gap-4 outline-none";
const modalRootMobileClassName =
  "max-[48em]:inset-0 max-[48em]:left-0 max-[48em]:top-0 max-[48em]:transform-none max-[48em]:translate-x-0 max-[48em]:translate-y-0 max-[48em]:w-full max-[48em]:h-[100dvh] max-[48em]:max-w-full max-[48em]:max-h-[100dvh] max-[48em]:rounded-none max-[48em]:p-[calc(env(safe-area-inset-top,0px)+2rem)_0_calc(env(safe-area-inset-bottom,0px)+1.6rem)] max-[48em]:text-[1.22rem]";
const modalRootDesktopClassName =
  "min-[48.0625em]:w-[var(--profile-diameter)] min-[48.0625em]:h-[var(--profile-diameter)] min-[48.0625em]:max-w-[var(--profile-diameter)] min-[48.0625em]:max-h-[var(--profile-diameter)] min-[48.0625em]:rounded-full min-[48.0625em]:overflow-hidden";
const scrollAreaClassName =
  "csp-container csp-no-neighbor-click w-full flex flex-col items-center text-center gap-[0.95rem] flex-1 min-h-0 relative z-0 overflow-y-auto overflow-x-hidden bg-transparent [scrollbar-width:none] [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0 px-[0.5rem] py-[1.1rem] overscroll-contain [--csp-title-offset:0px] [mask-image:linear-gradient(to_bottom,transparent_0%,#000_10%,#000_90%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,#000_10%,#000_90%,transparent_100%)]";
const scrollAreaMobileClassName =
  "max-[48em]:w-full max-[48em]:px-[1.1rem] max-[48em]:gap-[clamp(1.2rem,3.6vh,2.2rem)]";
const fieldsetClassName =
  "csp-step m-0 w-full max-w-[40rem] border-0 !flex !flex-col !items-center !text-center !justify-start !content-start !gap-[0.65rem] !pt-[0.5rem] !pb-[2.4rem] scroll-snap-align-center scroll-snap-stop-normal";
const legendClassName =
  "block w-full text-center mb-[0.45rem] mt-[0.4rem] text-[color:var(--link-gold,#d0adad)] text-[clamp(1.3rem,3.1vw,1.85rem)] [font-family:var(--font-aino-headline),var(--font-aino),Arial,sans-serif] font-[400] tracking-[0.02em] leading-[1.2]";
const languageLegendClassName = "!mb-[0.95rem]";
const languageFieldsetClassName = "!pb-[3.6rem]";
const languageShiftClassName = "-translate-y-[1.6rem]";
const optionsRowClassName =
  "flex flex-wrap justify-center items-center gap-[0.6rem_1rem] w-full max-w-[30rem] mx-auto";
const textScaleFieldsetClassName = "!min-h-[12.2rem] !pb-[3.2rem] !gap-[0.9rem]";
const textScaleLegendClassName = "!mb-[0.95rem]";
const textScaleOptionsClassName = "mt-0";
const contrastFieldsetClassName = "!pb-[4.4rem] !min-h-[8.6rem]";
const contrastLegendClassName = "!mb-[0.95rem]";
const contrastOptionsClassName = "!mt-[0.2rem]";
const motionFieldsetClassName = "!pt-[1.4rem] !mt-[0.6rem]";
const motionLegendClassName = "!mt-[0.9rem] !mb-[0.6rem]";
const contrastShiftClassName = "-translate-y-[0.4rem]";
const motionShiftClassName = "-translate-y-[0.9rem]";
const radioLabelClassName =
  "inline-flex items-center gap-[0.65rem] rounded-[999px] border border-transparent bg-[var(--seg-card-bg)] px-[0.85rem] py-[0.65rem] text-[1.18rem] tracking-[0.03em] text-[color:var(--seg-card-text)] shadow-[var(--seg-card-shadow)] transition-[color,border-color,background,box-shadow,transform] duration-150 ease-out hover:[background:var(--seg-card-bg-hover)] hover:text-[color:var(--seg-card-text-hover)] hover:shadow-[var(--seg-card-shadow-hover)] peer-checked:[background:var(--seg-card-bg-selected)] peer-checked:text-[color:var(--seg-card-text-selected)] peer-checked:shadow-[var(--seg-card-shadow-selected)] cursor-pointer";
const radioIndicatorClassName =
  "relative flex h-[20px] w-[20px] items-center justify-center rounded-full border-[2px] border-[color:var(--seg-radio-border)] bg-[color:var(--seg-radio-bg)] shadow-[var(--seg-radio-inner-ring)] transition-[border-color,box-shadow,background] duration-150 ease-out after:block after:h-[8px] after:w-[8px] after:scale-0 after:rounded-full after:bg-[color:var(--seg-radio-dot-bg)] after:shadow-[var(--seg-radio-dot-shadow)] after:opacity-0 after:transition-none after:content-[''] peer-checked:after:opacity-100 peer-checked:after:scale-100";
const checkboxLabelClassName =
  "inline-flex items-center gap-[0.65rem] rounded-[999px] border border-transparent bg-[var(--seg-card-bg)] px-[0.85rem] py-[0.65rem] text-[1.18rem] tracking-[0.03em] text-[color:var(--seg-card-text)] shadow-[var(--seg-card-shadow)] transition-[color,border-color,background,box-shadow,transform] duration-150 ease-out hover:[background:var(--seg-card-bg-hover)] hover:text-[color:var(--seg-card-text-hover)] hover:shadow-[var(--seg-card-shadow-hover)] cursor-pointer peer-checked:[background:var(--seg-card-bg-selected)] peer-checked:text-[color:var(--seg-card-text-selected)] peer-checked:shadow-[var(--seg-card-shadow-selected)] w-fit max-w-[90%] mx-auto justify-center";
const checkboxIndicatorClassName =
  "relative flex h-[20px] w-[20px] items-center justify-center rounded-[0.4rem] border-[2px] border-[color:var(--seg-radio-border)] bg-[color:var(--seg-radio-bg)] shadow-[var(--seg-radio-inner-ring)] text-[color:var(--seg-radio-dot-bg)] transition-[border-color,box-shadow,background] duration-150 ease-out peer-checked:[&>svg]:opacity-100 peer-checked:[&>svg]:scale-100";
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
  const padOffset = 36;
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
      const snapEl = scrollEl.querySelector(".csp-step");
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
    itemSelector: ".csp-step",
    reduceMotion,
    neighborDistance: 1,
    lockWheelToSteps: true,
    settleOnScroll: true,
    enableArrowKeys: true,
    allowArrowKeysInInputs: true,
    captureArrowKeys: true,
    settleMs: 0,
    maxStepPerSettle: 999,
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
      <div className={modalBackdropClassName} onClick={onClose} role="presentation" aria-hidden="true" />

      <div ref={boxRef} className={`${modalRootClassName} ${modalRootMobileClassName} ${modalRootDesktopClassName}`.trim()} role="dialog" aria-modal="true" aria-labelledby="a11y-title" onClick={stopInside} tabIndex={-1} style={{
      "--csp-chevron-top": "-1.6rem",
      "--csp-chevron-bottom": "-1.6rem"
    }}>
        {}
        <div className="csp-overlayTitle min-[48.0625em]:hidden" aria-hidden="false">
          <h2 id="a11y-title" className={titleClassName}>
            {t("profile.preferences.title")}
          </h2>
        </div>

        {}
        <div className={`csp-scrim csp-scrim--top csp-scrim--chevron top-0 ${"is-visible"} ${scrollDirection === "down" ? "is-muted" : ""} ${canScrollUp ? "" : "is-hidden"}`} aria-hidden="true">
          <span className="csp-chevron-frame" aria-hidden="true">
            <span className="csp-chevron-icon" />
          </span>
        </div>
        <div className={`csp-scrim csp-scrim--bottom csp-scrim--chevron ${"is-visible"} ${scrollDirection === "up" ? "is-muted" : ""} ${canScrollDown ? "" : "is-hidden"}`} aria-hidden="true">
          <span className="csp-chevron-frame" aria-hidden="true">
            <span className="csp-chevron-icon" />
          </span>
        </div>

        <div ref={scrollRef} className={`${scrollAreaClassName} ${scrollAreaMobileClassName}`.trim()} style={{
        "--csp-pad": `${scrollPad + padOffset}px`,
        "--csp-pad-top": `${Math.max(0, scrollPad + padOffset)}px`,
        "--csp-pad-bottom": `${Math.max(0, scrollPad + padOffset)}px`,
        "--csp-active-scale": "1",
        "--csp-neighbor-scale": "0.92",
        "--csp-hidden-scale": "0.86",
        "--csp-neighbor-opacity": "0.15",
        "--csp-hidden-opacity": "0"
      }} tabIndex={0} aria-label={t("profile.preferences.title")}>
          <fieldset className={`${fieldsetClassName} ${languageFieldsetClassName} ${getItemClassName(0)}`}>
            <legend className={`${legendClassName} ${languageLegendClassName} ${languageShiftClassName}`.trim()}>
              {t("accessibility.language")}
            </legend>
            <div className={`${optionsRowClassName} ${languageShiftClassName}`.trim()}>
              <label className={radioLabelClassName}>
                <input ref={firstFocusRef} type="radio" name="lg" value="et" checked={lang === "et"} onChange={() => setLang("et")} className="peer sr-only" />
                <span aria-hidden="true" className={radioIndicatorClassName} />
                <span>{t("accessibility.options.language.et")}</span>
              </label>
              <label className={radioLabelClassName}>
                <input type="radio" name="lg" value="ru" checked={lang === "ru"} onChange={() => setLang("ru")} className="peer sr-only" />
                <span aria-hidden="true" className={radioIndicatorClassName} />
                <span>{t("accessibility.options.language.ru")}</span>
              </label>
              <label className={radioLabelClassName}>
                <input type="radio" name="lg" value="en" checked={lang === "en"} onChange={() => setLang("en")} className="peer sr-only" />
                <span aria-hidden="true" className={radioIndicatorClassName} />
                <span>{t("accessibility.options.language.en")}</span>
              </label>
            </div>
          </fieldset>

          <fieldset className={`${fieldsetClassName} ${textScaleFieldsetClassName} ${getItemClassName(1)}`}>
            <legend className={`${legendClassName} ${textScaleLegendClassName}`.trim()}>
              {t("accessibility.text_scale")}
            </legend>
            <div className={`${optionsRowClassName} ${textScaleOptionsClassName}`.trim()}>
              <label className={radioLabelClassName}>
                <input type="radio" name="ts" value="sm" checked={textScale === "sm"} onChange={() => setTextScale("sm")} className="peer sr-only" />
                <span aria-hidden="true" className={radioIndicatorClassName} />
                <span>{t("accessibility.options.text_scale.sm")}</span>
              </label>
              <label className={radioLabelClassName}>
                <input type="radio" name="ts" value="md" checked={textScale === "md"} onChange={() => setTextScale("md")} className="peer sr-only" />
                <span aria-hidden="true" className={radioIndicatorClassName} />
                <span>{t("accessibility.options.text_scale.md")}</span>
              </label>
              <label className={radioLabelClassName}>
                <input type="radio" name="ts" value="lg" checked={textScale === "lg"} onChange={() => setTextScale("lg")} className="peer sr-only" />
                <span aria-hidden="true" className={radioIndicatorClassName} />
                <span>{t("accessibility.options.text_scale.lg")}</span>
              </label>
              <label className={radioLabelClassName}>
                <input type="radio" name="ts" value="xl" checked={textScale === "xl"} onChange={() => setTextScale("xl")} className="peer sr-only" />
                <span aria-hidden="true" className={radioIndicatorClassName} />
                <span>{t("accessibility.options.text_scale.xl")}</span>
              </label>
            </div>
          </fieldset>

          <fieldset className={`${fieldsetClassName} ${contrastFieldsetClassName} ${getItemClassName(2)}`}>
            <legend className={`${legendClassName} ${contrastLegendClassName} ${contrastShiftClassName}`.trim()}>
              {t("accessibility.contrast")}
            </legend>
            <div className={`${optionsRowClassName} ${contrastOptionsClassName} ${contrastShiftClassName}`.trim()}>
              <label className={radioLabelClassName}>
                <input type="radio" name="ct" value="normal" checked={contrast === "normal"} onChange={() => setContrast("normal")} className="peer sr-only" />
                <span aria-hidden="true" className={radioIndicatorClassName} />
                <span>{t("accessibility.options.contrast.normal")}</span>
              </label>
              <label className={radioLabelClassName}>
                <input type="radio" name="ct" value="hc" checked={contrast === "hc"} onChange={() => setContrast("hc")} className="peer sr-only" />
                <span aria-hidden="true" className={radioIndicatorClassName} />
                <span>{t("accessibility.options.contrast.hc")}</span>
              </label>
            </div>
          </fieldset>

          <fieldset className={`${fieldsetClassName} ${motionFieldsetClassName} ${getItemClassName(3)}`}>
            <legend className={`${legendClassName} ${motionLegendClassName} ${motionShiftClassName}`.trim()}>{t("accessibility.motion")}</legend>
            <label className={`${checkboxLabelClassName} ${motionShiftClassName}`.trim()}>
              <input type="checkbox" checked={reduceMotion} onChange={e => setReduceMotion(e.target.checked)} className="peer sr-only" />
              <span aria-hidden="true" className={checkboxIndicatorClassName}>
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] scale-90 opacity-0 transition-[opacity,transform] duration-150 ease-out" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 12.5l4 4 8-8" />
                </svg>
              </span>
              <span>{t("accessibility.options.motion.reduce")}</span>
            </label>
          </fieldset>

          <div className={`csp-step ${getItemClassName(4)} flex justify-center mt-[1.6rem]`}>
            <Button
              type="button"
              variant="primary"
              className="min-w-[9.5rem] text-[1.12rem] px-[1.1em] py-[0.6em] max-[30em]:min-w-[9rem] max-[30em]:text-[1.08rem]"
              onClick={save}
              aria-label={t("accessibility.save")}
            >
              {t("accessibility.save")}
            </Button>
          </div>
        </div>
      </div>
    </>;
}
