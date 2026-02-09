"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import { useI18n } from "@/components/i18n/I18nProvider";
import { useRouter } from "next/navigation";
import CenteredScrollPicker from "@/components/CenteredScrollPicker";
import "@/components/CenteredScrollPicker.css";
import OptionCard from "@/components/ui/OptionCard";
const titleClassName = "mt-[0.25rem] text-[#c57171] [font-family:var(--font-aino-headline),var(--font-aino),Arial,sans-serif] font-[400]";
const modalBackdropClassName =
  "fixed inset-0 z-[49] bg-transparent backdrop-blur-[var(--glass-blur-radius,1rem)] min-[48.0625em]:backdrop-blur-0";
const modalRootClassName =
  "fixed left-1/2 top-1/2 z-[50] w-[min(680px,96vw)] max-h-[calc(100dvh-2.5rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[1.5rem] border-0 bg-[var(--glass-surface-bg,rgba(0,0,0,0.25))] text-[color:var(--glass-surface-text,#f2f2f2)] shadow-[var(--glass-shell-shadow,none)] light:[--glass-shell-shadow:0_18px_40px_rgba(0,0,0,0.16)] backdrop-blur-[var(--glass-blur-radius,1rem)] p-[2.4rem_2rem_2rem] text-[1.05rem] leading-[1.35] flex flex-col items-center text-center gap-4 outline-none";
const modalRootMobileClassName =
  "max-[48em]:left-[max(var(--glass-mobile-gap,0.35rem),env(safe-area-inset-left,0px))] max-[48em]:right-[max(var(--glass-mobile-gap,0.35rem),env(safe-area-inset-right,0px))] max-[48em]:top-[calc(env(safe-area-inset-top,0px)+var(--glass-mobile-gap,0.35rem))] max-[48em]:bottom-[calc(env(safe-area-inset-bottom,0px)+var(--glass-mobile-gap,0.35rem))] max-[48em]:transform-none max-[48em]:translate-x-0 max-[48em]:translate-y-0 max-[48em]:w-auto max-[48em]:h-auto max-[48em]:max-w-none max-[48em]:max-h-none max-[48em]:rounded-[var(--mobile-glass-card-radius,clamp(1.05rem,3.8vw,1.45rem))] max-[48em]:p-[calc(env(safe-area-inset-top,0px)+2.4rem)_0_calc(env(safe-area-inset-bottom,0px)+1.4rem)] max-[48em]:text-[1.22rem] max-[48em]:[--csp-title-top:calc(env(safe-area-inset-top,0px)+2.15rem)]";
const modalRootDesktopClassName =
  "min-[48.0625em]:w-[var(--profile-diameter)] min-[48.0625em]:h-[var(--profile-diameter)] min-[48.0625em]:max-w-[var(--profile-diameter)] min-[48.0625em]:max-h-[var(--profile-diameter)] min-[48.0625em]:rounded-full min-[48.0625em]:overflow-hidden";
const scrollAreaClassName =
  "csp-container csp-no-neighbor-click w-full flex flex-col items-center text-center gap-[2.8rem] flex-1 min-h-0 relative z-0 overflow-y-auto overflow-x-hidden bg-transparent [scrollbar-width:none] [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0 px-[0.5rem] py-[1.1rem] overscroll-contain [--csp-title-offset:0px] [mask-image:linear-gradient(to_bottom,transparent_0%,#000_10%,#000_90%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,#000_10%,#000_90%,transparent_100%)]";
const scrollAreaMobileClassName =
  "max-[48em]:w-full max-[48em]:px-[1.1rem] max-[48em]:gap-[clamp(1.45rem,4.2vh,2.5rem)] max-[48em]:[--csp-neighbor-opacity:0] max-[48em]:[--csp-hidden-opacity:0]";
const fieldsetClassName =
  "csp-step m-0 w-full max-w-[42rem] border-0 !flex !flex-col !items-center !text-center !justify-start !content-start !gap-[0.8rem] !pt-[0.8rem] !pb-[2.4rem] max-[48em]:!pb-[3.35rem] scroll-snap-align-center scroll-snap-stop-normal";
const legendClassName =
  "block w-full text-center mb-[0.8rem] mt-[0.2rem] text-[color:var(--link-gold,#d0adad)] text-[clamp(1.3rem,3.1vw,1.85rem)] [font-family:var(--font-aino-headline),var(--font-aino),Arial,sans-serif] font-[400] tracking-[0.02em] leading-[1.2]";
const languageLegendClassName = "";
const languageFieldsetClassName = "";
const languageShiftClassName = "";
const languageOptionsClassName = "flex-nowrap";
const languageOptionLabelClassName = "text-[clamp(0.95rem,2.4vw,1.08rem)]";
const optionsRowClassName =
  "flex flex-wrap justify-center items-center gap-[0.7rem_1rem] max-[48em]:gap-[0.85rem_0.95rem] w-full max-w-[42rem] mx-auto";
const textScaleFieldsetClassName = "";
const textScaleLegendClassName = "";
const textScaleOptionsClassName = "mt-0 flex-nowrap max-[48em]:flex-wrap";
const contrastFieldsetClassName = "";
const contrastLegendClassName = "";
const contrastOptionsClassName = "";
const motionFieldsetClassName = "";
const motionLegendClassName = "";
const contrastShiftClassName = "";
const motionShiftClassName = "";
const optionCardClassName =
  "w-fit !min-h-[3.05rem] !py-[0.78rem] !px-[1rem] !text-[1.05rem] !leading-[1.2] tracking-[0.03em]";
const optionCardCenteredClassName = "max-w-[90%] mx-auto justify-center";
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

      <div ref={boxRef} className={`${modalRootClassName} ${modalRootMobileClassName} ${modalRootDesktopClassName} [--csp-chevron-top:-1.6rem] [--csp-chevron-bottom:-1.6rem]`.trim()} role="dialog" aria-modal="true" aria-labelledby="a11y-title" onClick={stopInside} tabIndex={-1}>
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

        <div ref={scrollRef} className={`${scrollAreaClassName} ${scrollAreaMobileClassName} [--csp-active-scale:1] [--csp-neighbor-scale:0.92] [--csp-hidden-scale:0.86] [--csp-neighbor-opacity:0.15] [--csp-hidden-opacity:0] max-[48em]:[--csp-neighbor-opacity:0] max-[48em]:[--csp-hidden-opacity:0]`.trim()} style={{
        "--csp-pad": `${scrollPad + padOffset}px`,
        "--csp-pad-top": `${Math.max(0, scrollPad + padOffset)}px`,
        "--csp-pad-bottom": `${Math.max(0, scrollPad + padOffset)}px`
      }} tabIndex={0} aria-label={t("profile.preferences.title")}>
          <fieldset className={`${fieldsetClassName} ${languageFieldsetClassName} ${getItemClassName(0)}`}>
            <legend className={`${legendClassName} ${languageLegendClassName} ${languageShiftClassName}`.trim()}>
              {t("accessibility.language")}
            </legend>
            <div className={`${optionsRowClassName} ${languageOptionsClassName} ${languageShiftClassName}`.trim()}>
              <OptionCard
                inputRef={firstFocusRef}
                type="radio"
                name="lg"
                value="et"
                checked={lang === "et"}
                onChange={() => setLang("et")}
                className={`${optionCardClassName} ${languageOptionLabelClassName}`}
              >
                <span>{t("accessibility.options.language.et")}</span>
              </OptionCard>
              <OptionCard
                type="radio"
                name="lg"
                value="ru"
                checked={lang === "ru"}
                onChange={() => setLang("ru")}
                className={`${optionCardClassName} ${languageOptionLabelClassName}`}
              >
                <span>{t("accessibility.options.language.ru")}</span>
              </OptionCard>
              <OptionCard
                type="radio"
                name="lg"
                value="en"
                checked={lang === "en"}
                onChange={() => setLang("en")}
                className={`${optionCardClassName} ${languageOptionLabelClassName}`}
              >
                <span>{t("accessibility.options.language.en")}</span>
              </OptionCard>
            </div>
          </fieldset>

          <fieldset className={`${fieldsetClassName} ${textScaleFieldsetClassName} ${getItemClassName(1)}`}>
            <legend className={`${legendClassName} ${textScaleLegendClassName}`.trim()}>
              {t("accessibility.text_scale")}
            </legend>
            <div className={`${optionsRowClassName} ${textScaleOptionsClassName}`.trim()}>
              <OptionCard type="radio" name="ts" value="sm" checked={textScale === "sm"} onChange={() => setTextScale("sm")} className={optionCardClassName}>
                <span>{t("accessibility.options.text_scale.sm")}</span>
              </OptionCard>
              <OptionCard type="radio" name="ts" value="md" checked={textScale === "md"} onChange={() => setTextScale("md")} className={optionCardClassName}>
                <span>{t("accessibility.options.text_scale.md")}</span>
              </OptionCard>
              <OptionCard type="radio" name="ts" value="lg" checked={textScale === "lg"} onChange={() => setTextScale("lg")} className={optionCardClassName}>
                <span>{t("accessibility.options.text_scale.lg")}</span>
              </OptionCard>
              <OptionCard type="radio" name="ts" value="xl" checked={textScale === "xl"} onChange={() => setTextScale("xl")} className={optionCardClassName}>
                <span>{t("accessibility.options.text_scale.xl")}</span>
              </OptionCard>
            </div>
          </fieldset>

          <fieldset className={`${fieldsetClassName} ${contrastFieldsetClassName} ${getItemClassName(2)}`}>
            <legend className={`${legendClassName} ${contrastLegendClassName} ${contrastShiftClassName}`.trim()}>
              {t("accessibility.contrast")}
            </legend>
            <div className={`${optionsRowClassName} ${contrastOptionsClassName} ${contrastShiftClassName}`.trim()}>
              <OptionCard type="radio" name="ct" value="normal" checked={contrast === "normal"} onChange={() => setContrast("normal")} className={optionCardClassName}>
                <span>{t("accessibility.options.contrast.normal")}</span>
              </OptionCard>
              <OptionCard type="radio" name="ct" value="hc" checked={contrast === "hc"} onChange={() => setContrast("hc")} className={optionCardClassName}>
                <span>{t("accessibility.options.contrast.hc")}</span>
              </OptionCard>
            </div>
          </fieldset>

          <fieldset className={`${fieldsetClassName} ${motionFieldsetClassName} ${getItemClassName(3)}`}>
            <legend className={`${legendClassName} ${motionLegendClassName} ${motionShiftClassName}`.trim()}>{t("accessibility.motion")}</legend>
            <OptionCard
              type="checkbox"
              checked={reduceMotion}
              onChange={e => setReduceMotion(e.target.checked)}
              className={`${optionCardClassName} ${optionCardCenteredClassName} ${motionShiftClassName}`}
            >
              <span>{t("accessibility.options.motion.reduce")}</span>
            </OptionCard>
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
