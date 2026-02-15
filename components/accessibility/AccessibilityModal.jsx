"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import { useI18n } from "@/components/i18n/I18nProvider";
import { useRouter } from "next/navigation";
import CenteredScrollPicker from "@/components/CenteredScrollPicker";
import "@/components/CenteredScrollPicker.css";
import OptionCard from "@/components/ui/OptionCard";
import ChevronIcon from "@/components/ui/icons/ChevronIcon";
import { glassPageTitleClassName } from "@/components/ui/glassPageStyles";
const titleClassName =
  `${glassPageTitleClassName} glass-title-register !text-[clamp(1.58rem,3.35vw,2.12rem)] max-[48em]:!text-[clamp(2rem,7.9vw,2.75rem)] max-[48em]:!leading-[1.06] max-[48em]:!mt-0 max-[48em]:!mb-0 max-[48em]:!px-0 max-[48em]:!whitespace-normal`;
const modalBackdropClassName =
  "fixed inset-0 z-[49] bg-transparent backdrop-blur-0";
const modalRootClassName =
  "fixed left-1/2 top-1/2 z-[50] w-[min(680px,96vw)] max-h-[calc(100dvh-2.5rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[1.5rem] border-0 bg-[var(--glass-surface-bg,rgba(0,0,0,0.25))] text-[color:var(--glass-surface-text,#f2f2f2)] shadow-[var(--glass-shell-shadow,none)] light:[--glass-shell-shadow:0_18px_40px_rgba(0,0,0,0.16)] backdrop-blur-[var(--glass-blur-radius,1rem)] p-[2.4rem_2rem_2rem] text-[1.05rem] leading-[1.35] flex flex-col items-center text-center gap-4 outline-none";
const modalRootMobileClassName =
  "max-[48em]:left-[max(var(--glass-mobile-gap,0.35rem),env(safe-area-inset-left,0px))] max-[48em]:right-[max(var(--glass-mobile-gap,0.35rem),env(safe-area-inset-right,0px))] max-[48em]:top-[calc(env(safe-area-inset-top,0px)+var(--glass-mobile-gap,0.35rem))] max-[48em]:bottom-[calc(env(safe-area-inset-bottom,0px)+var(--glass-mobile-gap,0.35rem))] max-[48em]:transform-none max-[48em]:translate-x-0 max-[48em]:translate-y-0 max-[48em]:w-auto max-[48em]:h-auto max-[48em]:max-w-none max-[48em]:max-h-none max-[48em]:rounded-[var(--mobile-glass-card-radius,clamp(1.05rem,3.8vw,1.45rem))] max-[48em]:p-[calc(env(safe-area-inset-top,0px)+2.4rem)_0_calc(env(safe-area-inset-bottom,0px)+1.4rem)] max-[48em]:text-[1.26rem] max-[48em]:[--csp-title-top:calc(env(safe-area-inset-top,0px)+2.55rem)]";
const modalRootDesktopClassName =
  "glass-ring--desktop-stable min-[48.0625em]:[--ring-ui-reserve:var(--ring-ui-reserve-page)] min-[48.0625em]:[--ring-fit-w:calc(100vw-(2*var(--ring-fit-pad,1.5rem)))] min-[48.0625em]:[--ring-fit-h:calc(100dvh-(2*var(--ring-fit-pad,1.5rem))-var(--ring-ui-reserve,9rem))] min-[48.0625em]:[--ring-fit:min(var(--ring-fit-w),var(--ring-fit-h))] min-[48.0625em]:[--ring-max:min(var(--ring-desktop-max,55rem),calc(var(--ring-base-max,50rem)*var(--ring-scale,1)))] min-[48.0625em]:[--ring-diameter-default:min(var(--ring-max),max(var(--ring-base-min,34rem),var(--ring-fit)))] min-[48.0625em]:w-[var(--ring-diameter,var(--ring-diameter-default))] min-[48.0625em]:h-[var(--ring-diameter,var(--ring-diameter-default))] min-[48.0625em]:max-w-[var(--ring-diameter,var(--ring-diameter-default))] min-[48.0625em]:max-h-[var(--ring-diameter,var(--ring-diameter-default))] min-[48.0625em]:rounded-full min-[48.0625em]:overflow-hidden min-[48.0625em]:px-[1.35rem]";
const scrollAreaClassName =
  "a11y-csp-scroll csp-container w-full flex flex-col items-center text-center gap-[2.8rem] flex-1 min-h-0 relative z-0 overflow-y-auto overflow-x-hidden bg-transparent [scrollbar-width:none] [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0 px-[0.5rem] py-[1.1rem] overscroll-contain [--csp-title-offset:0px] [mask-image:linear-gradient(to_bottom,transparent_0%,#000_10%,#000_90%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,#000_10%,#000_90%,transparent_100%)]";
const scrollAreaMobileClassName =
  "max-[48em]:w-full max-[48em]:px-[1.1rem] max-[48em]:gap-[clamp(1.45rem,4.2vh,2.5rem)]";
const fieldsetClassName =
  "csp-step m-0 w-full max-w-[42rem] border-0 !flex !flex-col !items-center !text-center !justify-start !content-start !gap-[1rem] !pt-[0.95rem] !pb-[2.8rem] max-[48em]:!gap-[1.1rem] max-[48em]:!pt-[1.2rem] max-[48em]:!pb-[3.55rem] scroll-snap-align-center scroll-snap-stop-normal";
const legendClassName =
  "block w-full text-center mb-[0.38rem] mt-[0.2rem] max-[48em]:mb-[0.46rem] text-[color:var(--link-gold,#d0adad)] text-[clamp(1.3rem,3.1vw,1.85rem)] max-[48em]:text-[clamp(1.75rem,6.8vw,2.4rem)] [font-family:var(--font-aino-headline),var(--font-aino),Arial,sans-serif] font-[400] tracking-[0.02em] leading-[1.2] max-[48em]:leading-[1.12]";
const languageLegendClassName = "";
const languageFieldsetClassName = "a11y-language-fieldset max-[48em]:!pt-[1.42rem]";
const languageFieldsetSingleRowSpacingClassName = "max-[48em]:!pb-[4.9rem]";
const languageFieldsetWrappedSpacingClassName = "max-[48em]:!pb-[1.45rem] max-[48em]:!min-h-[12.1rem]";
const languageShiftClassName = "";
const languageOptionsClassName = "flex-nowrap max-[48em]:flex-wrap";
const languageOptionLabelClassName =
  "text-[clamp(1.04rem,2.55vw,1.16rem)] max-[48em]:text-[clamp(1.14rem,4.6vw,1.36rem)]";
const optionsRowClassName =
  "flex flex-wrap justify-center items-center gap-[0.8rem_1.05rem] max-[48em]:gap-[1.26rem_1.3rem] w-full max-w-[42rem] mx-auto";
const textScaleFieldsetClassName = "a11y-textscale-fieldset max-[48em]:!pt-[1.42rem] max-[48em]:!pb-[1.55rem] max-[48em]:!min-h-[11.8rem]";
const textScaleAfterSingleLanguageClassName = "max-[48em]:!pt-[1.42rem]";
const textScaleLegendClassName = "";
const textScaleOptionsClassName = "a11y-textscale-options mt-0 flex-nowrap max-[48em]:flex-wrap max-[48em]:mb-[0rem]";
const textScaleOptionsDesktopTightClassName = "min-[48.0625em]:gap-[0.55rem] min-[48.0625em]:justify-center";
const contrastFieldsetClassName = "a11y-contrast-fieldset max-[48em]:!pt-[0rem]";
const contrastLegendClassName = "";
const contrastOptionsClassName = "";
const motionFieldsetClassName = "a11y-motion-fieldset max-[48em]:!pt-[1.22rem] max-[48em]:!mt-[0.45rem]";
const motionLegendClassName = "";
const contrastShiftClassName = "";
const motionShiftClassName = "";
const optionCardClassName =
  "w-fit !min-h-[3.05rem] !py-[0.78rem] !px-[0.96rem] !text-[1.12rem] !leading-[1.2] tracking-[0.03em] max-[48em]:!min-h-[3.45rem] max-[48em]:!py-[0.9rem] max-[48em]:!px-[1.1rem] max-[48em]:!text-[1.24rem]";
const optionCardTextScaleDesktopClassName =
  "whitespace-nowrap";
const optionCardCenteredClassName = "max-w-[90%] mx-auto justify-center";
const accessibilityChevronStrokeWidthDesktop = 0.72;
const accessibilityChevronStrokeWidthMobile = 1.04;
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
  const languageOptionsRef = useRef(null);
  const contrastOptionsRef = useRef(null);
  const {
    t,
    locale,
    setLocale,
    setMessages
  } = useI18n();
  const a11yTitleLine1 = t("profile.preferences.title_line1");
  const a11yTitleLine2 = t("profile.preferences.title_line2");
  const router = useRouter();
  const [textScale, setTextScale] = useState(prefs.textScale || "md");
  const [contrast, setContrast] = useState(prefs.contrast || "normal");
  const [reduceMotion, setReduceMotion] = useState(!!prefs.reduceMotion);
  const [lang, setLang] = useState(locale || "et");
  const [scrollPad, setScrollPad] = useState(0);
  const [scrollPadTop, setScrollPadTop] = useState(0);
  const [scrollPadBottom, setScrollPadBottom] = useState(0);
  const [languageWraps, setLanguageWraps] = useState(false);
  const [contrastWraps, setContrastWraps] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hasUserStartedScroll, setHasUserStartedScroll] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const initViewportModeRef = useRef(null);
  const initialScrollTopRef = useRef(0);
  const hasInitialScrollTopRef = useRef(false);
  const skipNextFocusSnapRef = useRef(false);
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
        e.preventDefault();
        e.stopPropagation();
        if (typeof e.stopImmediatePropagation === "function") {
          e.stopImmediatePropagation();
        }
        onClose?.();
        return;
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
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [onClose]);
  useEffect(() => {
    const target = firstFocusRef.current;
    if (!target || typeof target.focus !== "function") return;
    skipNextFocusSnapRef.current = true;
    try {
      target.focus({
        preventScroll: true
      });
    } catch {
      target.focus();
    }
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
      const steps = Array.from(scrollEl.querySelectorAll(".csp-step"));
      const snapSteps = steps.filter(step => !step.classList.contains("a11y-save-step"));
      const firstStep = snapSteps[0] || steps[0] || null;
      const lastStep = snapSteps[snapSteps.length - 1] || firstStep;
      if (!firstStep || !lastStep) return;
      const firstH = firstStep.getBoundingClientRect().height || 0;
      const lastH = lastStep.getBoundingClientRect().height || 0;
      const titleOffset = getCssPx(scrollEl, "--csp-title-offset");
      const viewH = Math.max(0, (scrollEl.clientHeight || 0) - titleOffset);
      if (!viewH || !firstH || !lastH) return;
      const nextPadTopBase = Math.max(0, Math.floor((viewH - firstH) / 2));
      const nextPadBottomBase = Math.max(0, Math.floor((viewH - lastH) / 2));
      const nextPad = nextPadTopBase;
      setScrollPad(prev => prev === nextPad ? prev : nextPad);
      const liftPx = isMobileViewport ? 5 : 11;
      const nextTop = Math.max(0, nextPadTopBase - liftPx);
      const nextBottom = Math.max(0, nextPadBottomBase + liftPx);
      setScrollPadTop(prev => prev === nextTop ? prev : nextTop);
      setScrollPadBottom(prev => prev === nextBottom ? prev : nextBottom);
    };
    updatePad();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(updatePad) : null;
    ro?.observe(scrollEl);
    window.addEventListener("resize", updatePad);
    return () => {
      ro?.disconnect?.();
      window.removeEventListener("resize", updatePad);
    };
  }, [isMobileViewport]);
  const {
    canScrollUp,
    canScrollDown,
    scrollDirection,
    getItemClassName,
    scrollToIndex
  } = CenteredScrollPicker({
    containerRef: scrollRef,
    itemSelector: ".csp-step",
    reduceMotion,
    neighborDistance: isMobileViewport ? 2 : 1,
    lockWheelToSteps: !isMobileViewport,
    settleOnScroll: false,
    enableArrowKeys: true,
    allowArrowKeysInInputs: true,
    captureArrowKeys: true,
    settleMs: isMobileViewport ? 420 : 360,
    maxStepPerSettle: isMobileViewport ? 99 : 1,
    wheelCooldownMs: isMobileViewport ? 300 : 340,
    minWheelDelta: isMobileViewport ? 10 : 16,
    manageHiddenFocus: !isMobileViewport,
    pauseSettleOnInputFocus: isMobileViewport,
    pauseSettleWhileTouch: isMobileViewport
  });
  const getA11yStepClassName = index =>
    getItemClassName(index);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const query = window.matchMedia("(max-width: 48em)");
    const apply = () => setIsMobileViewport(query.matches);
    apply();
    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", apply);
      return () => query.removeEventListener("change", apply);
    }
    query.addListener(apply);
    return () => query.removeListener(apply);
  }, []);
  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl || typeof window === "undefined") return;
    const mode = isMobileViewport ? "mobile" : "desktop";
    if (initViewportModeRef.current === mode) return;
    initViewportModeRef.current = mode;
    const resetToFirstStep = () => {
      scrollEl.scrollTop = 0;
      scrollToIndex(0, "auto");
      setIsScrolled(false);
      setHasUserStartedScroll(false);
      hasInitialScrollTopRef.current = true;
      initialScrollTopRef.current = scrollEl.scrollTop || 0;
    };
    resetToFirstStep();
    const rafA = requestAnimationFrame(resetToFirstStep);
    const rafB = requestAnimationFrame(() => requestAnimationFrame(resetToFirstStep));
    const settleTimer = window.setTimeout(resetToFirstStep, 120);
    return () => {
      cancelAnimationFrame(rafA);
      cancelAnimationFrame(rafB);
      window.clearTimeout(settleTimer);
    };
  }, [scrollToIndex, isMobileViewport]);
  useEffect(() => {
    if (hasUserStartedScroll) return;
    const scrollEl = scrollRef.current;
    if (!scrollEl || typeof window === "undefined") return;
    const alignToFirst = () => {
      scrollToIndex(0, "auto");
      setIsScrolled(false);
      hasInitialScrollTopRef.current = true;
      initialScrollTopRef.current = scrollEl.scrollTop || 0;
    };
    const raf = requestAnimationFrame(alignToFirst);
    return () => cancelAnimationFrame(raf);
  }, [scrollPadTop, scrollPadBottom, hasUserStartedScroll, scrollToIndex]);
  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl || isMobileViewport) return;
    const onFocusIn = event => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (skipNextFocusSnapRef.current) {
        skipNextFocusSnapRef.current = false;
        return;
      }
      if ((scrollEl.scrollTop || 0) <= 8) return;
      const snapTarget = target.closest(".a11y-snap") || target;
      snapTarget.scrollIntoView?.({
        block: "center",
        behavior: reduceMotion ? "auto" : "smooth"
      });
    };
    scrollEl.addEventListener("focusin", onFocusIn);
    return () => scrollEl.removeEventListener("focusin", onFocusIn);
  }, [reduceMotion, isMobileViewport]);
  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;
    const onScroll = () => {
      const top = scrollEl.scrollTop || 0;
      if (!hasInitialScrollTopRef.current) {
        hasInitialScrollTopRef.current = true;
        initialScrollTopRef.current = top;
      }
      const delta = Math.abs(top - initialScrollTopRef.current);
      const thresholdOn = isMobileViewport ? 14 : 8;
      const thresholdOff = isMobileViewport ? 9 : 5;
      if (delta > thresholdOn) {
        setHasUserStartedScroll(prev => prev || true);
      }
      setIsScrolled(prev => {
        const next = prev ? delta > thresholdOff : delta > thresholdOn;
        return prev === next ? prev : next;
      });
    };
    onScroll();
    scrollEl.addEventListener("scroll", onScroll, {
      passive: true
    });
    return () => scrollEl.removeEventListener("scroll", onScroll);
  }, [isMobileViewport]);
  useEffect(() => {
    const host = languageOptionsRef.current;
    if (!host || typeof window === "undefined") return;
    const detectWrap = () => {
      const options = Array.from(host.querySelectorAll("label,button")).filter(Boolean);
      if (options.length < 2) {
        setLanguageWraps(false);
        return;
      }
      const tops = options.map(node => node.offsetTop || 0);
      const firstTop = Math.min(...tops);
      const wraps = tops.some(top => top > firstTop + 6);
      setLanguageWraps(prev => prev === wraps ? prev : wraps);
    };
    detectWrap();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(detectWrap) : null;
    ro?.observe(host);
    window.addEventListener("resize", detectWrap);
    return () => {
      ro?.disconnect?.();
      window.removeEventListener("resize", detectWrap);
    };
  }, [lang, locale]);
  useEffect(() => {
    const host = contrastOptionsRef.current;
    if (!host || typeof window === "undefined") return;
    const detectWrap = () => {
      const options = Array.from(host.querySelectorAll("label,button")).filter(Boolean);
      if (options.length < 2) {
        setContrastWraps(false);
        return;
      }
      const tops = options.map(node => node.offsetTop || 0);
      const firstTop = Math.min(...tops);
      const wraps = tops.some(top => top > firstTop + 6);
      setContrastWraps(prev => prev === wraps ? prev : wraps);
    };
    detectWrap();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(detectWrap) : null;
    ro?.observe(host);
    window.addEventListener("resize", detectWrap);
    return () => {
      ro?.disconnect?.();
      window.removeEventListener("resize", detectWrap);
    };
  }, [lang, locale]);
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

      <div ref={boxRef} className={`${modalRootClassName} ${modalRootMobileClassName} ${modalRootDesktopClassName} scroll-reactive-shell [--csp-chevron-top:clamp(0.12rem,0.55vh,0.45rem)] [--csp-chevron-bottom:clamp(0.12rem,0.55vh,0.45rem)] [--csp-arrow-size:clamp(2.55rem,4.2vw,3.25rem)] max-[48em]:[--csp-arrow-size:clamp(2.25rem,9.8vw,2.95rem)] max-[48em]:[--csp-chevron-top:clamp(0.22rem,1.15vw,0.52rem)] max-[48em]:[--csp-chevron-bottom:clamp(0.22rem,1.1vw,0.5rem)]`.trim()} data-scrolled={hasUserStartedScroll && isScrolled ? "1" : "0"} role="dialog" aria-modal="true" aria-labelledby="a11y-title" onClick={stopInside} tabIndex={-1}>
        {}
        <div className="csp-overlayTitle [--csp-title-top:calc(var(--csp-chevron-top,0.24rem)+var(--csp-arrow-size,2.4rem)-0.45rem)] max-[48em]:[--csp-title-top:calc(env(safe-area-inset-top,0px)+clamp(2.55rem,8.4vw,3.2rem))]" aria-hidden="false">
          <h2 id="a11y-title" className={titleClassName}>
            <span className="block">{a11yTitleLine1}</span>
            <span className="block">{a11yTitleLine2}</span>
          </h2>
        </div>

        {}
        <div className={`csp-scrim csp-scrim--top csp-scrim--chevron top-0 ${"is-visible"} ${scrollDirection === "down" ? "is-muted" : ""} ${canScrollUp ? "" : "is-hidden"}`} aria-hidden="true">
          <span className="csp-chevron-frame" aria-hidden="true">
            <ChevronIcon direction="up" strokeWidth={isMobileViewport ? accessibilityChevronStrokeWidthMobile : accessibilityChevronStrokeWidthDesktop} className="csp-chevron-icon" />
          </span>
        </div>
        <div className={`csp-scrim csp-scrim--bottom csp-scrim--chevron ${"is-visible"} ${scrollDirection === "up" ? "is-muted" : ""} ${canScrollDown ? "" : "is-hidden"}`} aria-hidden="true">
          <span className="csp-chevron-frame" aria-hidden="true">
            <ChevronIcon direction="down" strokeWidth={isMobileViewport ? accessibilityChevronStrokeWidthMobile : accessibilityChevronStrokeWidthDesktop} className="csp-chevron-icon" />
          </span>
        </div>

        <div ref={scrollRef} className={`${scrollAreaClassName} ${scrollAreaMobileClassName} ${isMobileViewport ? "" : "csp-no-neighbor-click"} ${isMobileViewport ? "[--csp-active-scale:1.01] [--csp-neighbor-scale:0.965] [--csp-hidden-scale:0.94] [--csp-neighbor-opacity:0.42] [--csp-hidden-opacity:0.2]" : "[--csp-active-scale:1] [--csp-neighbor-scale:0.92] [--csp-hidden-scale:0.86] [--csp-neighbor-opacity:0.15] [--csp-hidden-opacity:0]"}`.trim()} style={{
        "--csp-pad": `${scrollPad + padOffset}px`,
        "--csp-pad-top": `${Math.max(0, (scrollPadTop || scrollPad) + padOffset)}px`,
        "--csp-pad-bottom": `${Math.max(0, (scrollPadBottom || scrollPad) + padOffset)}px`,
        "--csp-center-offset": `${isMobileViewport ? -5 : -11}px`
      }} tabIndex={0} aria-label={t("profile.preferences.title")}>
          <fieldset className={`${fieldsetClassName} ${languageFieldsetClassName} ${languageWraps ? `a11y-language-fieldset--wrap ${languageFieldsetWrappedSpacingClassName}` : `a11y-language-fieldset--single ${languageFieldsetSingleRowSpacingClassName}`} ${getA11yStepClassName(0)}`}>
            <legend className={`${legendClassName} ${languageLegendClassName} ${languageShiftClassName}`.trim()}>
              {t("accessibility.language")}
            </legend>
            <div ref={languageOptionsRef} className={`${optionsRowClassName} ${languageOptionsClassName} ${languageShiftClassName}`.trim()}>
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

          <fieldset className={`${fieldsetClassName} ${textScaleFieldsetClassName} ${languageWraps ? "" : textScaleAfterSingleLanguageClassName} ${getA11yStepClassName(1)}`}>
            <legend className={`${legendClassName} ${textScaleLegendClassName}`.trim()}>
              {t("accessibility.text_scale")}
            </legend>
            <div className={`${optionsRowClassName} ${textScaleOptionsClassName} ${textScaleOptionsDesktopTightClassName}`.trim()}>
              <OptionCard type="radio" name="ts" value="sm" checked={textScale === "sm"} onChange={() => setTextScale("sm")} className={`${optionCardClassName} ${optionCardTextScaleDesktopClassName}`}>
                <span>{t("accessibility.options.text_scale.sm")}</span>
              </OptionCard>
              <OptionCard type="radio" name="ts" value="md" checked={textScale === "md"} onChange={() => setTextScale("md")} className={`${optionCardClassName} ${optionCardTextScaleDesktopClassName}`}>
                <span>{t("accessibility.options.text_scale.md")}</span>
              </OptionCard>
              <OptionCard type="radio" name="ts" value="lg" checked={textScale === "lg"} onChange={() => setTextScale("lg")} className={`${optionCardClassName} ${optionCardTextScaleDesktopClassName}`}>
                <span>{t("accessibility.options.text_scale.lg")}</span>
              </OptionCard>
              <OptionCard type="radio" name="ts" value="xl" checked={textScale === "xl"} onChange={() => setTextScale("xl")} className={`${optionCardClassName} ${optionCardTextScaleDesktopClassName}`}>
                <span>{t("accessibility.options.text_scale.xl")}</span>
              </OptionCard>
            </div>
          </fieldset>

          <fieldset className={`${fieldsetClassName} ${contrastFieldsetClassName} ${contrastWraps ? "max-[48em]:!pb-[3.1rem] max-[48em]:!min-h-[12.4rem]" : ""} ${getA11yStepClassName(2)}`}>
            <legend className={`${legendClassName} ${contrastLegendClassName} ${contrastShiftClassName}`.trim()}>
              {t("accessibility.contrast")}
            </legend>
            <div ref={contrastOptionsRef} className={`${optionsRowClassName} ${contrastOptionsClassName} ${contrastShiftClassName}`.trim()}>
              <OptionCard type="radio" name="ct" value="normal" checked={contrast === "normal"} onChange={() => setContrast("normal")} className={optionCardClassName}>
                <span>{t("accessibility.options.contrast.normal")}</span>
              </OptionCard>
              <OptionCard type="radio" name="ct" value="hc" checked={contrast === "hc"} onChange={() => setContrast("hc")} className={optionCardClassName}>
                <span>{t("accessibility.options.contrast.hc")}</span>
              </OptionCard>
            </div>
          </fieldset>

          <fieldset className={`${fieldsetClassName} ${motionFieldsetClassName} ${getA11yStepClassName(3)}`}>
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

          <div className={`csp-step a11y-save-step ${getA11yStepClassName(4)} flex justify-center mt-[1.6rem] min-[48.0625em]:mt-[0.7rem] min-[48.0625em]:translate-y-[-0.7rem] max-[48em]:mt-[1.1rem] max-[48em]:translate-y-0`}>
              <Button
              type="button"
              variant="primary"
              className="min-w-[9.5rem] text-[1.12rem] px-[1.1em] py-[0.6em] max-[48em]:min-w-[10.8rem] max-[48em]:text-[1.25rem] max-[48em]:px-[1.28em] max-[48em]:py-[0.72em] max-[30em]:min-w-[9rem] max-[30em]:text-[1.14rem]"
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
