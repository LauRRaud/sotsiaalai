"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import { useI18n } from "@/components/i18n/I18nProvider";
import { useRouter } from "next/navigation";
import CenteredScrollPicker from "@/components/CenteredScrollPicker";
import "@/components/CenteredScrollPicker.css";
import OptionCard from "@/components/ui/OptionCard";
import ChevronIcon from "@/components/ui/icons/ChevronIcon";
import { glassPageTitleClassName } from "@/components/ui/glassPageStyles";
import { primarySegmentedButtonClassName } from "@/components/ui/primarySegmentedButtonClassName";
import useSmoothWheelProxy from "@/components/ui/useSmoothWheelProxy";
const titleClassName =
  `${glassPageTitleClassName} glass-title-register !text-[clamp(1.58rem,calc(var(--ring-diameter,52rem)/24.5),2.12rem)] min-[769px]:!mt-0 min-[769px]:!mb-0 max-[768px]:!text-[clamp(2rem,7.9vw,2.75rem)] max-[768px]:!leading-[1.06] max-[768px]:!mt-0 max-[768px]:!mb-0 max-[768px]:!px-0 max-[768px]:!whitespace-normal`;
const modalBackdropClassName =
  "fixed inset-0 z-[49] bg-transparent backdrop-blur-0";
const modalRootClassName =
  "fixed left-1/2 top-1/2 z-[50] w-[min(680px,96vw)] max-h-[calc(100dvh-2.5rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[1.5rem] border-0 bg-[var(--glass-surface-bg,rgba(0,0,0,0.25))] text-[color:var(--glass-surface-text,#f2f2f2)] shadow-[var(--glass-shell-shadow,none)] light:[--glass-shell-shadow:0_18px_40px_rgba(0,0,0,0.16)] backdrop-blur-[var(--glass-blur-radius,1rem)] p-[2.4rem_2rem_2rem] text-[1.05rem] leading-[1.35] flex flex-col items-center text-center gap-4 outline-none hc:[--seg-card-border-width:2px] hc:[--seg-card-border:var(--hc-accent)]";
const modalRootMobileClassName =
  "max-[768px]:left-[max(var(--glass-mobile-gap,0.35rem),env(safe-area-inset-left,0px))] max-[768px]:right-[max(var(--glass-mobile-gap,0.35rem),env(safe-area-inset-right,0px))] max-[768px]:top-[calc(env(safe-area-inset-top,0px)+var(--glass-mobile-gap,0.35rem))] max-[768px]:bottom-[calc(env(safe-area-inset-bottom,0px)+var(--glass-mobile-gap,0.35rem))] max-[768px]:transform-none max-[768px]:translate-x-0 max-[768px]:translate-y-0 max-[768px]:w-auto max-[768px]:h-auto max-[768px]:max-w-none max-[768px]:max-h-none max-[768px]:rounded-[var(--mobile-glass-card-radius,clamp(1.05rem,3.8vw,1.45rem))] max-[768px]:p-[calc(env(safe-area-inset-top,0px)+2.4rem)_0_calc(env(safe-area-inset-bottom,0px)+1.4rem)] max-[768px]:text-[1.26rem] max-[768px]:[--csp-title-top:calc(env(safe-area-inset-top,0px)+2.55rem)]";
const modalRootDesktopClassName =
  "glass-ring--desktop-stable min-[769px]:[--ring-ui-reserve:var(--ring-ui-reserve-page)] min-[769px]:[--ring-fit-w:calc(100vw-(2*var(--ring-fit-pad,calc(1.5*var(--base-rem)))))] min-[769px]:[--ring-fit-h:calc(100dvh-(2*var(--ring-fit-pad,calc(1.5*var(--base-rem))))-var(--ring-ui-reserve,calc(9*var(--base-rem))))] min-[769px]:[--ring-fit:min(var(--ring-fit-w),var(--ring-fit-h))] min-[769px]:[--ring-max:min(var(--ring-desktop-max,calc(55*var(--base-rem))),calc(var(--ring-base-max,calc(50*var(--base-rem)))*var(--ring-scale,1)))] min-[769px]:[--ring-diameter-default:min(var(--ring-max),max(var(--ring-base-min,calc(34*var(--base-rem))),var(--ring-fit)))] min-[769px]:w-[var(--ring-diameter,var(--ring-diameter-default))] min-[769px]:h-[var(--ring-diameter,var(--ring-diameter-default))] min-[769px]:max-w-[var(--ring-diameter,var(--ring-diameter-default))] min-[769px]:max-h-[var(--ring-diameter,var(--ring-diameter-default))] min-[769px]:rounded-full min-[769px]:overflow-hidden min-[769px]:px-[1.35rem] min-[769px]:[--csp-arrow-size:clamp(1.95rem,calc(var(--ring-diameter,52rem)/20.8),2.45rem)]";
const scrollAreaClassName =
  "a11y-csp-scroll csp-container w-full flex flex-col items-center text-center gap-[2.8rem] flex-1 min-h-0 relative z-0 overflow-y-auto overflow-x-hidden bg-transparent [scrollbar-width:none] [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0 px-[0.5rem] py-[1.1rem] overscroll-contain [--csp-title-offset:0px]";
const scrollAreaMobileClassName =
  "max-[768px]:w-full max-[768px]:px-[1.1rem] max-[768px]:gap-[clamp(1.45rem,4.2vh,2.5rem)]";
const fieldsetClassName =
  "csp-step m-0 w-full max-w-[42rem] border-0 !flex !flex-col !items-center !text-center !justify-start !content-start !gap-[1rem] !pt-[0.95rem] !pb-[2.8rem] max-[768px]:!gap-[1.1rem] max-[768px]:!pt-[1.2rem] max-[768px]:!pb-[3.55rem] max-[768px]:scroll-snap-align-center max-[768px]:scroll-snap-stop-normal";
const legendClassName =
  "block w-full text-center mb-[0.38rem] mt-[0.2rem] max-[768px]:mb-[0.46rem] text-[color:var(--link-gold,#d0adad)] text-[clamp(1.3rem,3.1vw,1.85rem)] max-[768px]:text-[clamp(1.75rem,6.8vw,2.4rem)] [font-family:var(--font-aino-headline),var(--font-aino),Arial,sans-serif] font-[400] tracking-[0.02em] leading-[1.2] max-[768px]:leading-[1.12]";
const languageLegendClassName = "";
const languageFieldsetClassName = "a11y-language-fieldset max-[768px]:!pt-[1.42rem]";
const languageFieldsetSingleRowSpacingClassName = "max-[768px]:!pb-[4.9rem]";
const languageFieldsetWrappedSpacingClassName = "max-[768px]:!pb-[1.45rem] max-[768px]:!min-h-[12.1rem]";
const languageOptionsShiftClassName = "a11y-language-options-shift";
const languageOptionsClassName = "flex-nowrap max-[768px]:flex-wrap";
const languageOptionLabelClassName =
  "text-[clamp(1.04rem,2.55vw,1.16rem)] max-[768px]:text-[clamp(1.14rem,4.6vw,1.36rem)]";
const optionsRowClassName =
  "flex flex-wrap justify-center items-center gap-[0.8rem_1.05rem] max-[768px]:gap-[1.26rem_1.3rem] w-full max-w-[42rem] mx-auto";
const screenProfileFieldsetClassName = "a11y-screenprofile-fieldset min-[769px]:!mb-[3.6rem] min-[769px]:!pb-[4.35rem] max-[768px]:!mb-[1.75rem] max-[768px]:!pt-[1.42rem] max-[768px]:!pb-[3.15rem] max-[768px]:!min-h-[14.1rem]";
const screenProfileLegendClassName = "";
const screenProfileOptionsClassName = "a11y-screenprofile-options mt-0 flex-wrap max-[768px]:flex-wrap max-[768px]:mb-[0rem]";
const screenProfileOptionsDesktopClassName = "min-[769px]:gap-[0.72rem] min-[769px]:justify-center";
const textScaleFieldsetClassName = "a11y-textscale-fieldset max-[768px]:!pt-[1.42rem] max-[768px]:!pb-[1.55rem] max-[768px]:!min-h-[11.8rem]";
const textScaleAfterSingleLanguageClassName = "max-[768px]:!pt-[1.42rem]";
const textScaleLegendClassName = "";
const textScaleOptionsClassName = "a11y-textscale-options mt-0 flex-nowrap max-[768px]:flex-wrap max-[768px]:mb-[0rem]";
const textScaleOptionsDesktopTightClassName = "min-[769px]:gap-[0.55rem] min-[769px]:justify-center";
const themeFieldsetClassName = "a11y-theme-fieldset max-[768px]:!pt-[1.42rem]";
const themeOptionsClassName = "a11y-theme-options mt-0 flex-nowrap max-[768px]:flex-wrap max-[768px]:mb-[0rem]";
const contrastFieldsetClassName = "a11y-contrast-fieldset max-[768px]:!pt-[0rem]";
const contrastLegendClassName = "";
const contrastOptionsClassName = "";
const motionFieldsetClassName = "a11y-motion-fieldset max-[768px]:!pt-[1.22rem] max-[768px]:!mt-[0.45rem] max-[768px]:!pb-[3.1rem] max-[768px]:!min-h-[14rem]";
const motionLegendClassName = "";
const motionOptionsClassName = "a11y-motion-options mt-0 flex-col items-center justify-center gap-[0.72rem] max-[768px]:items-stretch";
const contrastShiftClassName = "";
const motionShiftClassName = "";
const optionCardClassName =
  "w-fit !min-h-[3.05rem] !py-[0.78rem] !px-[0.96rem] !text-[1.12rem] !leading-[1.2] tracking-[0.03em] max-[768px]:!min-h-[3.45rem] max-[768px]:!py-[0.9rem] max-[768px]:!px-[1.1rem] max-[768px]:!text-[1.24rem]";
const optionCardButtonClassName = primarySegmentedButtonClassName;
const optionCardTextScaleDesktopClassName =
  "whitespace-nowrap";
const saveButtonClassName =
  "max-w-[22rem] whitespace-normal text-center leading-[1.2] px-[1.6rem] py-[1.05rem] text-[1.18rem] " +
  "max-[768px]:!min-h-[3.42rem] max-[768px]:!px-[1.7rem] max-[768px]:!py-[0.98rem] max-[768px]:!text-[1.32rem]";
const accessibilityChevronStrokeWidthDesktop = 0.72;
const accessibilityChevronStrokeWidthMobile = 1.04;
export default function AccessibilityModal({
  onClose,
  prefs,
  onSave,
  onPreview,
  onPreviewEnd,
  requireInitialSelection = false,
}) {
  const boxRef = useRef(null);
  const firstFocusRef = useRef(null);
  const scrollRef = useRef(null);
  const languageOptionsRef = useRef(null);
  const contrastOptionsRef = useRef(null);
  const themeOptionsRef = useRef(null);
  const {
    t,
    locale,
    setLocale,
    setMessages
  } = useI18n();
  const a11yTitleLine1 = t("profile.preferences.title_line1");
  const a11yTitleLine2 = t("profile.preferences.title_line2");
  const router = useRouter();
  const normalizeUiProfile = value =>
    value === "mac" ? "mac" : value === "lg" || value === "xl" ? "lg" : "sm";
  const initialUiScale = requireInitialSelection ? null : prefs.uiScale || "md";
  const initialUiProfile = requireInitialSelection ? null : prefs.uiProfile || normalizeUiProfile(prefs.uiScale);
  const initialLang = requireInitialSelection ? null : locale || "et";
  const initialContrast = requireInitialSelection ? null : prefs.contrast || "normal";
  const initialTheme = requireInitialSelection ? null : prefs.theme || "mono";
  const [uiScale, setUiScale] = useState(initialUiScale);
  const [uiProfile, setUiProfile] = useState(initialUiProfile);
  const [contrast, setContrast] = useState(initialContrast);
  const [reduceMotion, setReduceMotion] = useState(!!prefs.reduceMotion);
  const [reduceTransparency, setReduceTransparency] = useState(!!prefs.reduceTransparency);
  const [theme, setTheme] = useState(initialTheme);
  const [lang, setLang] = useState(initialLang);
  const [scrollPad, setScrollPad] = useState(0);
  const [scrollPadTop, setScrollPadTop] = useState(0);
  const [scrollPadBottom, setScrollPadBottom] = useState(0);
  const [languageWraps, setLanguageWraps] = useState(false);
  const [contrastWraps, setContrastWraps] = useState(false);
  const [themeWraps, setThemeWraps] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hasUserStartedScroll, setHasUserStartedScroll] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const initViewportModeRef = useRef(null);
  const initialScrollTopRef = useRef(0);
  const hasInitialScrollTopRef = useRef(false);
  const initialFirstStepAlignDoneRef = useRef(false);
  const originalLocaleRef = useRef(locale);
  const previewedLangRef = useRef(null);
  const saveDisabled =
    requireInitialSelection &&
    (!lang || !contrast || !uiScale || !uiProfile || !theme);
  const proxyWheelToModalScroll = useSmoothWheelProxy({
    scrollRef,
    disabled: isMobileViewport,
    passthroughNativeTargets: false,
  });
  useEffect(() => {
    setUiScale(current => current ?? initialUiScale);
    setUiProfile(current => current ?? initialUiProfile);
    setContrast(current => current ?? initialContrast);
    setReduceMotion(!!prefs.reduceMotion);
    setReduceTransparency(!!prefs.reduceTransparency);
    setTheme(current => current ?? initialTheme);
  }, [initialContrast, initialTheme, initialUiProfile, initialUiScale, prefs]);
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
    try {
      target.focus({
        preventScroll: true
      });
    } catch {
      target.focus();
    }
  }, []);
  useLayoutEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl || typeof window === "undefined") return;
    const updatePad = () => {
      const steps = Array.from(scrollEl.querySelectorAll(".csp-step"));
      const firstStep = steps[0] || null;
      const lastStep = steps[steps.length - 1] || firstStep;
      if (!firstStep || !lastStep) return;
      const firstH = firstStep.getBoundingClientRect().height || 0;
      const lastH = lastStep.getBoundingClientRect().height || 0;
      const viewH = Math.max(0, scrollEl.clientHeight || 0);
      if (!viewH || !firstH || !lastH) return;
      const targetCenter = viewH / 2 - (isMobileViewport ? 5 : 0);
      const nextPadTopBase = Math.max(0, Math.floor(targetCenter - firstH / 2));
      const nextPadBottomBase = Math.max(
        0,
        Math.floor(viewH - targetCenter - lastH / 2),
      );
      const nextPad = Math.max(0, Math.floor((viewH - firstH) / 2));
      setScrollPad(prev => prev === nextPad ? prev : nextPad);
      setScrollPadTop(prev => prev === nextPadTopBase ? prev : nextPadTopBase);
      setScrollPadBottom(prev => prev === nextPadBottomBase ? prev : nextPadBottomBase);
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
    applyItemVisibility: isMobileViewport,
    neighborDistance: isMobileViewport ? 2 : 1,
    lockWheelToSteps: false,
    settleOnScroll: false,
    applyEdgeVisibility: !isMobileViewport,
    edgeVisibilityMin: 0.06,
    enableArrowKeys: isMobileViewport,
    allowArrowKeysInInputs: true,
    captureArrowKeys: isMobileViewport,
    settleMs: isMobileViewport ? 420 : 360,
    maxStepPerSettle: isMobileViewport ? 99 : 1,
    wheelCooldownMs: isMobileViewport ? 300 : 340,
    minWheelDelta: isMobileViewport ? 10 : 16,
    manageHiddenFocus: isMobileViewport,
    pauseSettleOnInputFocus: isMobileViewport,
    pauseSettleWhileTouch: isMobileViewport
  });
  const getA11yStepClassName = index =>
    isMobileViewport ? getItemClassName(index) : "";
  useEffect(() => {
    if (typeof window === "undefined") return;
    const query = window.matchMedia("(max-width: 768px)");
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
    initialFirstStepAlignDoneRef.current = false;
    const resetToFirstStep = () => {
      scrollEl.scrollTop = 0;
      if (isMobileViewport) {
        scrollToIndex(0, "auto");
      }
      setIsScrolled(false);
      setHasUserStartedScroll(false);
      hasInitialScrollTopRef.current = true;
      initialScrollTopRef.current = scrollEl.scrollTop || 0;
      initialFirstStepAlignDoneRef.current = true;
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
    if (
      !isMobileViewport ||
      hasUserStartedScroll ||
      initialFirstStepAlignDoneRef.current
    ) {
      return;
    }
    const scrollEl = scrollRef.current;
    if (!scrollEl || typeof window === "undefined") return;
    const alignToFirst = () => {
      scrollToIndex(0, "auto");
      setIsScrolled(false);
      hasInitialScrollTopRef.current = true;
      initialScrollTopRef.current = scrollEl.scrollTop || 0;
      initialFirstStepAlignDoneRef.current = true;
    };
    const raf = requestAnimationFrame(alignToFirst);
    return () => cancelAnimationFrame(raf);
  }, [scrollPadTop, scrollPadBottom, hasUserStartedScroll, scrollToIndex, isMobileViewport]);
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
  useEffect(() => {
    const host = themeOptionsRef.current;
    if (!host || typeof window === "undefined") return;
    const detectWrap = () => {
      const options = Array.from(host.querySelectorAll("label,button")).filter(Boolean);
      if (options.length < 2) {
        setThemeWraps(false);
        return;
      }
      const tops = options.map(node => node.offsetTop || 0);
      const firstTop = Math.min(...tops);
      const wraps = tops.some(top => top > firstTop + 6);
      setThemeWraps(prev => prev === wraps ? prev : wraps);
    };
    detectWrap();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(detectWrap) : null;
    ro?.observe(host);
    window.addEventListener("resize", detectWrap);
    return () => {
      ro?.disconnect?.();
      window.removeEventListener("resize", detectWrap);
    };
  }, [lang, locale, theme]);
  const stopInside = e => e.stopPropagation();
  const save = async () => {
    if (saveDisabled) return;
    onSave?.({
      uiScale: uiScale || prefs.uiScale || "md",
      uiProfile: uiProfile || prefs.uiProfile || normalizeUiProfile(prefs.uiScale),
      contrast: contrast || prefs.contrast || "normal",
      reduceMotion,
      reduceTransparency,
      theme: theme || prefs.theme || "mono"
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
      uiScale: uiScale || prefs.uiScale || "md",
      uiProfile: uiProfile || prefs.uiProfile || normalizeUiProfile(prefs.uiScale),
      contrast: contrast || prefs.contrast || "normal",
      reduceMotion,
      reduceTransparency,
      theme: theme || prefs.theme || "mono"
    });
  }, [contrast, onPreview, prefs.contrast, prefs.theme, prefs.uiProfile, prefs.uiScale, reduceMotion, reduceTransparency, theme, uiProfile, uiScale]);
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

      <div ref={boxRef} className={`${modalRootClassName} ${modalRootMobileClassName} ${modalRootDesktopClassName} scroll-reactive-shell a11y-modal-shell [--csp-chevron-top:clamp(0.12rem,0.55vh,0.45rem)] [--csp-chevron-bottom:clamp(0.12rem,0.55vh,0.45rem)] [--csp-arrow-size:clamp(2.55rem,calc(var(--ring-diameter,52rem)/16.8),3.25rem)] max-[768px]:[--csp-arrow-size:clamp(2.25rem,9.8vw,2.95rem)] max-[768px]:[--csp-chevron-top:clamp(0.22rem,1.15vw,0.52rem)] max-[768px]:[--csp-chevron-bottom:clamp(0.22rem,1.1vw,0.5rem)]`.trim()} data-scrolled={hasUserStartedScroll && isScrolled ? "1" : "0"} role="dialog" aria-modal="true" aria-labelledby="a11y-title" onClick={stopInside} onWheel={proxyWheelToModalScroll} tabIndex={-1}>
        <div className="csp-overlayTitle [--csp-title-top:calc(var(--csp-chevron-top,0.24rem)+var(--csp-arrow-size,2.4rem)-0.45rem)] max-[768px]:[--csp-title-top:calc(env(safe-area-inset-top,0px)+clamp(2.55rem,8.4vw,3.2rem))]" aria-hidden="false">
          <h2 id="a11y-title" className={titleClassName}>
            <span className="block">{a11yTitleLine1}</span>
            <span className="block">{a11yTitleLine2}</span>
          </h2>
        </div>

        <><div className={`csp-scrim csp-scrim--top csp-scrim--chevron top-0 is-visible ${scrollDirection === "down" ? "is-muted" : ""} ${canScrollUp ? "" : "is-hidden"}`} aria-hidden="true">
          <span className="csp-chevron-frame" aria-hidden="true">
            <ChevronIcon direction="up" strokeWidth={isMobileViewport ? accessibilityChevronStrokeWidthMobile : accessibilityChevronStrokeWidthDesktop} className="csp-chevron-icon" />
          </span>
        </div>
        <div className={`csp-scrim csp-scrim--wide csp-scrim--bottom csp-scrim--chevron is-visible ${scrollDirection === "up" ? "is-muted" : ""} ${!isScrolled && canScrollDown ? "is-scroll-cue" : ""} ${canScrollDown ? "" : "is-hidden"}`} aria-hidden="true">
          <span className="csp-chevron-frame" aria-hidden="true">
            <ChevronIcon direction="down" strokeWidth={isMobileViewport ? accessibilityChevronStrokeWidthMobile : accessibilityChevronStrokeWidthDesktop} className="csp-chevron-icon" />
          </span>
        </div></>

        <div ref={scrollRef} className={`${scrollAreaClassName} ${scrollAreaMobileClassName} ${isMobileViewport ? "" : "csp-desktop-free-scroll"}`.trim()} style={{
        "--csp-pad": `${scrollPad}px`,
        "--csp-pad-top": `${scrollPadTop || scrollPad}px`,
        "--csp-pad-bottom": `${scrollPadBottom || scrollPad}px`,
        "--csp-center-offset": `${isMobileViewport ? -5 : 0}px`
      }} tabIndex={0} aria-label={t("profile.preferences.title")}>
          <fieldset className={`${fieldsetClassName} ${languageFieldsetClassName} ${languageWraps ? `a11y-language-fieldset--wrap ${languageFieldsetWrappedSpacingClassName}` : `a11y-language-fieldset--single ${languageFieldsetSingleRowSpacingClassName}`} ${getA11yStepClassName(0)}`}>
            <legend className={`${legendClassName} ${languageLegendClassName}`.trim()}>
              {t("accessibility.language")}
            </legend>
            <div ref={languageOptionsRef} className={`${optionsRowClassName} ${languageOptionsClassName} ${languageOptionsShiftClassName}`.trim()}>
              <OptionCard
                inputRef={firstFocusRef}
                type="radio"
                name="lg"
                value="et"
                checked={lang === "et"}
                onChange={() => setLang("et")}
                className={`${optionCardClassName} ${optionCardButtonClassName} ${languageOptionLabelClassName}`}
              >
                <span>{t("accessibility.options.language.et")}</span>
              </OptionCard>
              <OptionCard
                type="radio"
                name="lg"
                value="ru"
                checked={lang === "ru"}
                onChange={() => setLang("ru")}
                className={`${optionCardClassName} ${optionCardButtonClassName} ${languageOptionLabelClassName}`}
              >
                <span>{t("accessibility.options.language.ru")}</span>
              </OptionCard>
              <OptionCard
                type="radio"
                name="lg"
                value="en"
                checked={lang === "en"}
                onChange={() => setLang("en")}
                className={`${optionCardClassName} ${optionCardButtonClassName} ${languageOptionLabelClassName}`}
              >
                <span>{t("accessibility.options.language.en")}</span>
              </OptionCard>
            </div>
          </fieldset>

          <fieldset className={`${fieldsetClassName} ${contrastFieldsetClassName} ${contrastWraps ? "max-[768px]:!pb-[3.1rem] max-[768px]:!min-h-[12.4rem]" : ""} ${getA11yStepClassName(1)}`}>
            <legend className={`${legendClassName} ${contrastLegendClassName} ${contrastShiftClassName}`.trim()}>
              {t("accessibility.contrast")}
            </legend>
            <div ref={contrastOptionsRef} className={`${optionsRowClassName} ${contrastOptionsClassName} ${contrastShiftClassName}`.trim()}>
              <OptionCard type="radio" name="ct" value="normal" checked={contrast === "normal"} onChange={() => setContrast("normal")} className={`${optionCardClassName} ${optionCardButtonClassName}`}>
                <span>{t("accessibility.options.contrast.normal")}</span>
              </OptionCard>
              <OptionCard type="radio" name="ct" value="hc" checked={contrast === "hc"} onChange={() => setContrast("hc")} className={`${optionCardClassName} ${optionCardButtonClassName}`}>
                <span>{t("accessibility.options.contrast.hc")}</span>
              </OptionCard>
            </div>
          </fieldset>

          <fieldset className={`${fieldsetClassName} ${textScaleFieldsetClassName} ${languageWraps ? "" : textScaleAfterSingleLanguageClassName} ${getA11yStepClassName(2)}`}>
            <legend className={`${legendClassName} ${textScaleLegendClassName}`.trim()}>
              {t("accessibility.text_scale")}
            </legend>
            <div className={`${optionsRowClassName} ${textScaleOptionsClassName} ${textScaleOptionsDesktopTightClassName}`.trim()}>
              <OptionCard type="radio" name="ts" value="sm" checked={uiScale === "sm"} onChange={() => setUiScale("sm")} className={`${optionCardClassName} ${optionCardButtonClassName} ${optionCardTextScaleDesktopClassName}`}>
                <span>{t("accessibility.options.text_scale.sm")}</span>
              </OptionCard>
              <OptionCard type="radio" name="ts" value="md" checked={uiScale === "md"} onChange={() => setUiScale("md")} className={`${optionCardClassName} ${optionCardButtonClassName} ${optionCardTextScaleDesktopClassName}`}>
                <span>{t("accessibility.options.text_scale.md")}</span>
              </OptionCard>
              <OptionCard type="radio" name="ts" value="lg" checked={uiScale === "lg"} onChange={() => setUiScale("lg")} className={`${optionCardClassName} ${optionCardButtonClassName} ${optionCardTextScaleDesktopClassName}`}>
                <span>{t("accessibility.options.text_scale.lg")}</span>
              </OptionCard>
              <OptionCard type="radio" name="ts" value="xl" checked={uiScale === "xl"} onChange={() => setUiScale("xl")} className={`${optionCardClassName} ${optionCardButtonClassName} ${optionCardTextScaleDesktopClassName}`}>
                <span>{t("accessibility.options.text_scale.xl")}</span>
              </OptionCard>
            </div>
          </fieldset>

          <fieldset className={`${fieldsetClassName} ${themeFieldsetClassName} ${themeWraps ? "max-[768px]:!pb-[2.4rem] max-[768px]:!min-h-[11.5rem]" : ""} ${getA11yStepClassName(3)}`}>
            <legend className={`${legendClassName}`.trim()}>
              {t("accessibility.theme")}
            </legend>
            <div ref={themeOptionsRef} className={`${optionsRowClassName} ${themeOptionsClassName} ${textScaleOptionsDesktopTightClassName}`.trim()}>
              <OptionCard type="radio" name="theme" value="light" checked={theme === "light"} onChange={() => setTheme("light")} className={`${optionCardClassName} ${optionCardButtonClassName} ${optionCardTextScaleDesktopClassName}`}>
                <span>{t("accessibility.options.theme.light")}</span>
              </OptionCard>
              <OptionCard type="radio" name="theme" value="mid" checked={theme === "mid"} onChange={() => setTheme("mid")} className={`${optionCardClassName} ${optionCardButtonClassName} ${optionCardTextScaleDesktopClassName}`}>
                <span>{t("accessibility.options.theme.mid")}</span>
              </OptionCard>
              <OptionCard type="radio" name="theme" value="dark" checked={theme === "dark"} onChange={() => setTheme("dark")} className={`${optionCardClassName} ${optionCardButtonClassName} ${optionCardTextScaleDesktopClassName}`}>
                <span>{t("accessibility.options.theme.dark")}</span>
              </OptionCard>
              <OptionCard type="radio" name="theme" value="night" checked={theme === "night"} onChange={() => setTheme("night")} className={`${optionCardClassName} ${optionCardButtonClassName} ${optionCardTextScaleDesktopClassName}`}>
                <span>{t("accessibility.options.theme.night")}</span>
              </OptionCard>
              <OptionCard type="radio" name="theme" value="mono" checked={theme === "mono"} onChange={() => setTheme("mono")} className={`${optionCardClassName} ${optionCardButtonClassName} ${optionCardTextScaleDesktopClassName}`}>
                <span>{t("accessibility.options.theme.mono")}</span>
              </OptionCard>
            </div>
          </fieldset>

          <fieldset className={`${fieldsetClassName} ${screenProfileFieldsetClassName} ${languageWraps ? "" : textScaleAfterSingleLanguageClassName} ${getA11yStepClassName(4)}`}>
            <legend className={`${legendClassName} ${screenProfileLegendClassName}`.trim()}>
              {t("accessibility.screen_profile")}
            </legend>
            <div className={`${optionsRowClassName} ${screenProfileOptionsClassName} ${screenProfileOptionsDesktopClassName}`.trim()}>
              <OptionCard type="radio" name="sp" value="sm" checked={uiProfile === "sm"} onChange={() => setUiProfile("sm")} className={`${optionCardClassName} ${optionCardButtonClassName} ${optionCardTextScaleDesktopClassName}`}>
                <span>{t("accessibility.options.screen_profile.sm")}</span>
              </OptionCard>
              <OptionCard type="radio" name="sp" value="mac" checked={uiProfile === "mac"} onChange={() => setUiProfile("mac")} className={`${optionCardClassName} ${optionCardButtonClassName} ${optionCardTextScaleDesktopClassName}`}>
                <span>{t("accessibility.options.screen_profile.mac")}</span>
              </OptionCard>
              <OptionCard type="radio" name="sp" value="lg" checked={uiProfile === "lg"} onChange={() => setUiProfile("lg")} className={`${optionCardClassName} ${optionCardButtonClassName} ${optionCardTextScaleDesktopClassName} a11y-screenprofile-option--bottom`}>
                <span>{t("accessibility.options.screen_profile.lg")}</span>
              </OptionCard>
            </div>
          </fieldset>

          <fieldset className={`${fieldsetClassName} ${motionFieldsetClassName} ${getA11yStepClassName(5)}`}>
            <legend className={`${legendClassName} ${motionLegendClassName} ${motionShiftClassName}`.trim()}>{t("accessibility.motion")}</legend>
            <div className={`${optionsRowClassName} ${motionOptionsClassName} ${motionShiftClassName}`.trim()}>
              <OptionCard
                type="checkbox"
                checked={reduceMotion}
                onChange={e => setReduceMotion(e.target.checked)}
                className={`${optionCardClassName} ${optionCardButtonClassName} ${optionCardTextScaleDesktopClassName} max-[768px]:!w-full max-[768px]:!justify-start a11y-motion-reduce-option`}
              >
                <span>{t("accessibility.options.motion.reduce")}</span>
              </OptionCard>
              <OptionCard
                type="checkbox"
                checked={reduceTransparency}
                onChange={e => setReduceTransparency(e.target.checked)}
                className={`${optionCardClassName} ${optionCardButtonClassName} ${optionCardTextScaleDesktopClassName} max-[768px]:!w-full max-[768px]:!justify-start a11y-transparency-reduce-option`}
              >
                <span>{t("accessibility.options.transparency.reduce")}</span>
              </OptionCard>
            </div>
          </fieldset>

          <div className={`csp-step a11y-save-step ${getA11yStepClassName(6)} flex justify-center mt-[1.6rem] min-[769px]:mt-[3.2rem] min-[769px]:translate-y-0 max-[768px]:mt-[1.1rem] max-[768px]:translate-y-0`}>
              <Button
              type="button"
              variant="primary"
              className={saveButtonClassName}
              onClick={save}
              aria-label={t("accessibility.save")}
              disabled={saveDisabled}
            >
              <span>{t("accessibility.save")}</span>
            </Button>
          </div>
        </div>
      </div>
    </>;
}
