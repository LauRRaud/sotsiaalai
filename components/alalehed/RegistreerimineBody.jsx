"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useId } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import OptionCard from "@/components/ui/OptionCard";
import RichText from "@/components/i18n/RichText";
import BackButton from "@/components/ui/BackButton";
import Button from "@/components/ui/Button";
import GlassRing from "@/components/ui/GlassRing";
import { cn } from "@/components/ui/cn";
import { glassPageBackClassName, glassPageBackMobileBottomCenterClassName, glassPageRingCenteredClassName, glassPageShellCenteredClassName, glassPageTitleClassName } from "@/components/ui/glassPageStyles";
import { localizePath } from "@/lib/localizePath";
import CenteredScrollPicker from "@/components/CenteredScrollPicker";
import "@/components/CenteredScrollPicker.css";
import ChevronIcon from "@/components/ui/icons/ChevronIcon";
import SotsiaalAILoader from "@/components/ui/SotsiaalAILoader";
import { WORKER_FRAMEWORK_REVIEW_STORAGE_KEY, WORKER_FRAMEWORK_SIGNED_DOWNLOAD_STORAGE_KEY, WORKER_FRAMEWORK_VERSION } from "@/lib/frameworkAcceptances";
import { pushWithTransition, runWithTransition } from "@/lib/routeTransition";
import { resolveApiMessage } from "@/lib/i18n/resolveApiMessage";
const pageShellClassName = glassPageShellCenteredClassName;
const titleClassName =
  `${glassPageTitleClassName} glass-title-register max-[768px]:!text-[clamp(2.2rem,8.7vw,3rem)] max-[768px]:!leading-[1.06] max-[768px]:!mt-0 max-[768px]:!mb-0 max-[768px]:!px-0`;
const contentClassName = "register-content mt-0 flex w-full flex-1 min-h-0 flex-col items-center pb-[clamp(1rem,3vh,1.8rem)]";
const scrollClassName = "register-scroll relative flex-1 w-full max-w-[clamp(18rem,39vw,25.2rem)] min-[769px]:max-w-[clamp(18.2rem,calc(var(--ring-diameter,52rem)/2.2),23.6rem)] min-h-0 overflow-y-auto overflow-x-hidden min-[769px]:overflow-x-visible px-[0.6rem] min-[769px]:px-[1.02rem] text-left csp-container mx-auto";
const registerTextClassName = "register-copy text-[1.25rem] leading-[1.45] text-[color:var(--pt-50)] light:text-[color:var(--input-text)]";
const registerPolicyLinkClassName =
  "register-policy-link inline p-0 m-0 border-0 bg-transparent align-baseline font-medium !text-[color:var(--home-link-color,var(--brand-primary))] no-underline hover:no-underline focus:no-underline active:no-underline !decoration-transparent hover:!decoration-transparent focus:!decoration-transparent active:!decoration-transparent hover:border-transparent focus:border-transparent active:border-transparent hover:shadow-none focus:shadow-none active:shadow-none transition-[color] duration-150 light:!text-[color:var(--home-link-color,var(--link-color,#7a3a38))] hc:!text-[color:var(--home-link-color,var(--hc-accent))]";
const inputClassName = `w-full ${registerTextClassName} placeholder:text-[color:var(--pt-200)]`;
const pinInputClassName = "placeholder:text-[#6b7280] light:placeholder:text-[#4b5563]";
const checkboxCardClassName = "register-checkbox-card w-full min-[769px]:w-[calc(100%-clamp(1.55rem,calc(var(--ring-diameter,52rem)/22),2.35rem))] min-[769px]:mx-auto gap-[0.72rem] text-[1.04rem] leading-[1.28] px-[1.05rem] py-[0.72rem] text-[color:var(--pt-50)] light:text-[color:var(--input-text)]";
const registerControlVarsClassName = "[--seg-control-size:24px] [--seg-radio-dot-size:10px] [--seg-check-size:22px] [--seg-control-radius:0.5rem]";
const registerOptionButtonClassName =
  "[--seg-card-bg:var(--btn-primary-bg)] [--seg-card-bg-hover:var(--btn-primary-bg-hover)] [--seg-card-bg-selected:var(--btn-primary-bg-hover)] " +
  "[--seg-card-text:var(--btn-primary-text,var(--input-text))] [--seg-card-text-hover:var(--title-color,var(--brand-primary))] [--seg-card-text-selected:var(--title-color,var(--brand-primary))] " +
  "[--seg-card-shadow:var(--btn-primary-shadow)] [--seg-card-shadow-hover:var(--btn-primary-shadow-hover)] [--seg-card-shadow-selected:var(--btn-primary-shadow-hover)] " +
  "[--seg-card-border:transparent] [--seg-card-border-width:0px] [--seg-card-duration:560ms] [--seg-card-ease:cubic-bezier(0.22,0.61,0.36,1)] " +
  "!transition-[border-color,box-shadow,color] !duration-[560ms] !ease-[cubic-bezier(0.22,0.61,0.36,1)] " +
  "hover:shadow-[var(--seg-card-shadow-hover)] focus-visible:shadow-[var(--seg-card-shadow-hover)] data-[checked=true]:shadow-[var(--seg-card-shadow-selected)]";
const registerButtonClassName = "register-submit px-[1.65rem] py-[0.9rem] text-[1.32rem] leading-[1.1]";
const registerStepClassName = "register-step csp-step !min-h-0 !py-[0.6rem]";
const registerChevronStrokeWidthDesktop = 0.72;
const registerChevronStrokeWidthMobile = 1.04;
const inputBaseClassName = "register-input w-full min-[769px]:w-[calc(100%-clamp(1.45rem,calc(var(--ring-diameter,52rem)/24.8),2.1rem))] min-[769px]:mx-auto rounded-full [border:var(--input-border)] [background:var(--input-bg)] px-[1rem] py-[0.78rem] text-[1.05rem] text-[color:var(--input-text)] caret-[color:var(--input-caret)] shadow-[var(--input-shadow)] min-h-[3.05rem] transition-[background,border-color,box-shadow,color] duration-150 ease-out placeholder:text-[color:var(--input-placeholder)] placeholder:[font-size:1.02em] placeholder:opacity-100 focus-visible:outline-none focus-visible:[background:var(--input-bg-focus)] focus-visible:shadow-[var(--input-shadow-hover,var(--input-shadow))] hover:[background:var(--input-bg-hover)] hover:shadow-[var(--input-shadow-hover,var(--input-shadow))] disabled:opacity-[var(--input-disabled-opacity)] disabled:cursor-not-allowed aria-disabled:opacity-[var(--input-disabled-opacity)] aria-disabled:cursor-not-allowed py-[0.95rem] px-[1.5rem] min-h-[3.6rem]";
const frameworkDownloadClassName = "w-auto whitespace-normal text-center leading-[1.08] !px-[1.45rem] !py-[0.7rem] !text-[1.1rem] no-underline !min-h-[2.95rem] min-[769px]:min-w-[10.9rem] max-[768px]:min-w-[11.6rem] max-[768px]:!min-h-[3rem] max-[768px]:!px-[1.25rem] max-[768px]:!py-[0.72rem] max-[768px]:!text-[1.08rem]";
const frameworkRingClassName = cn(glassPageRingCenteredClassName, "glass-ring--desktop-stable");
const frameworkOverlayClassName = "fixed inset-0 z-[60] flex items-center justify-center bg-transparent p-[1.25rem]";
const frameworkInnerClassName = "flex h-full w-full min-h-0 flex-col items-center text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))]";
const registerSelectedOptionClassName =
  "border border-transparent " +
  "[background:var(--btn-primary-bg-hover)] text-[color:var(--title-color,var(--brand-primary))] " +
  "shadow-[var(--btn-primary-shadow-hover)]";
const frameworkTitleClassName = `${glassPageTitleClassName} subpage-mobile-title policy-mobile-title policy-mobile-title--static max-w-[12ch] text-balance min-[769px]:!text-[2.28rem] min-[769px]:!leading-[1.06] min-[769px]:!mt-[2.1rem] min-[769px]:!mb-[0.1rem] max-[768px]:!mt-0 max-[768px]:!mb-0`;
const frameworkTitleWrapClassName = "policy-mobile-title-wrap relative z-[4] flex w-full items-center justify-center pt-[1rem] pb-[0.42rem] max-[768px]:pt-[calc(env(safe-area-inset-top,0px)+1.45rem)] max-[768px]:pb-[0.36rem]";
const frameworkContentClassName = "mx-auto mt-[clamp(1.35rem,3.2vh,1.75rem)] flex w-full max-w-[clamp(20rem,52vw,28rem)] flex-col items-start gap-[1.05rem] px-[0.35rem] pb-[calc(env(safe-area-inset-bottom,0px)+1.35rem)]";
const frameworkPanelSurfaceClassName =
  "border-0 bg-[rgba(30,32,38,0.42)] [.theme-night_&]:bg-[rgba(16,22,34,0.4)] " +
  "text-[color:var(--pt-120)] [.theme-light_&]:bg-[rgba(255,255,255,0.58)] [.theme-light_&]:text-[#1f2937]";
const frameworkPanelShadowClassName =
  "shadow-[var(--chat-invite-shadow,var(--input-shadow))] [.theme-light_&]:shadow-[var(--input-shadow)]";
const frameworkPanelClassName =
  `w-full max-w-[28rem] self-center rounded-[1.15rem] px-[1.15rem] pt-[1rem] pb-[1.28rem] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] ` +
  `${frameworkPanelSurfaceClassName} ${frameworkPanelShadowClassName} max-[768px]:max-w-[23rem] max-[768px]:px-[1rem] max-[768px]:pt-[0.92rem] max-[768px]:pb-[1.18rem]`;
const frameworkLeadClassName = "m-0 w-full max-w-[28rem] self-center text-left text-[1.14rem] leading-[1.52] tracking-[0.01em] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))] max-[768px]:max-w-[23rem] max-[768px]:text-[1.18rem]";
const frameworkActionsClassName = "mt-[0.95rem] flex w-full items-stretch justify-center";
const isRegistrationOpen = !["false", "0", "off"].includes(
  String(process.env.NEXT_PUBLIC_REGISTRATION_OPEN || "true").trim().toLowerCase()
);
export default function RegistreerimineBody({
}) {
  const router = useRouter();
  const {
    t,
    locale
  } = useI18n();
  const localizedTitleClassName = `${titleClassName}${locale === "ru" ? " glass-title-register-ru" : ""}`;
  const scrollRef = useRef(null);
  const handleClose = () => {
    pushWithTransition(router, localizePath("/", locale), {
      glassRingTilt: "left",
      waitForGlassRingTilt: true,
      persistGlassRingTilt: false
    });
  };
  const closeFrameworkModal = useCallback(() => {
    runWithTransition(() => setIsFrameworkModalOpen(false), {
      glassRingTilt: "left",
      waitForGlassRingTilt: true,
      persistGlassRingTilt: false
    });
  }, []);
  const openFrameworkPage = () => {
    if (typeof window !== "undefined") {
      const timestamp = window.sessionStorage.getItem(WORKER_FRAMEWORK_REVIEW_STORAGE_KEY) || new Date().toISOString();
      window.sessionStorage.setItem(WORKER_FRAMEWORK_REVIEW_STORAGE_KEY, timestamp);
      setFrameworkReviewOpenedAt(timestamp);
    }
    router.push(localizePath("/tooalase-kasutuse-raamistik", locale));
  };
  const PIN_MIN = 4;
  const PIN_MAX = 8;
  const initialForm = {
    email: "",
    pin: "",
    role: "",
    workerUse: "",
    frameworkAck: false,
    agree: false,
    guideAck: false
  };
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isFrameworkModalOpen, setIsFrameworkModalOpen] = useState(false);
  const [frameworkReviewOpenedAt, setFrameworkReviewOpenedAt] = useState("");
  const [frameworkSignedDownloadedAt, setFrameworkSignedDownloadedAt] = useState("");
  const [scrollPad, setScrollPad] = useState(0);
  const [scrollPadTop, setScrollPadTop] = useState(0);
  const [scrollPadBottom, setScrollPadBottom] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hasUserStartedScroll, setHasUserStartedScroll] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const initViewportModeRef = useRef(null);
  const initialScrollTopRef = useRef(0);
  const hasInitialScrollTopRef = useRef(false);
  const roleLabelId = useId();
  const roleHintId = useId();
  const roleLabelText = t("auth.register.role_label_question");
  const frameworkTitleLines = locale === "et"
    ? ["Tööalase kasutuse", "raamistik"]
    : locale === "ru"
      ? ["Рамка рабочего", "использования"]
      : ["Professional-use", "framework"];
  const isSocialWorker = form.role === "SOCIAL_WORKER";
  const requiresFramework = isSocialWorker && form.workerUse === "ORG_IDENTIFIABLE";
  const hasConfirmedFramework = requiresFramework && form.frameworkAck;
  const registerRingClassName = cn(
    "glass-ring glass-ring--desktop-stable scroll-reactive-shell register-mobile-ring md:mt-0 md:mb-0 [--csp-chevron-top:clamp(0.12rem,0.55vh,0.45rem)] [--csp-chevron-bottom:clamp(0.12rem,0.55vh,0.45rem)] [--csp-arrow-size:clamp(2.55rem,calc(var(--ring-diameter,52rem)/16.8),3.25rem)] max-[768px]:[--csp-arrow-size:clamp(2.25rem,9.8vw,2.95rem)] max-[768px]:[--csp-chevron-top:clamp(0.24rem,1.2vw,0.54rem)] max-[768px]:[--csp-chevron-bottom:clamp(0.24rem,1.15vw,0.52rem)] max-[768px]:[--mobile-glass-card-gap:clamp(calc(0.26*var(--base-rem)),1.2vw,calc(0.4*var(--base-rem)))] max-[768px]:[--ring-pad-x:clamp(calc(0.44*var(--base-rem)),2vw,calc(0.78*var(--base-rem)))]",
    isFrameworkModalOpen ? "pointer-events-none opacity-0" : null
  );
  const agreementStepIndex = 3;
  const guideStepIndex = 4;
  const workerStepIndex = 5;
  const submitStepIndex = isSocialWorker ? 6 : 5;
  function handleChange(e) {
    const {
      name,
      value,
      type,
      checked
    } = e.target;
    const nextValue = name === "pin" ? value.replace(/\D/g, "").slice(0, PIN_MAX) : type === "checkbox" ? checked : value;
    setForm(prev => ({
      ...prev,
      [name]: nextValue,
      ...(name === "role" && nextValue !== "SOCIAL_WORKER" ? {
        workerUse: "",
        frameworkAck: false
      } : null),
      ...(name === "workerUse" && nextValue !== "ORG_IDENTIFIABLE" ? {
        frameworkAck: false
      } : null)
    }));
  }
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    if (!isRegistrationOpen) {
      setError(t("auth.register.closed_notice"));
      return;
    }
    const email = form.email.trim().toLowerCase();
    const pin = form.pin.replace(/\D/g, "");
    const jumpToStep = index => {
      scrollToIndex(index);
    };
    if (!email) {
      setError(t("profile.email_update.error_email_required"));
      jumpToStep(0);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t("profile.email_update.error_email_invalid"));
      jumpToStep(0);
      return;
    }
    if (!pin) {
      setError(t("profile.email_update.error_pin_required"));
      jumpToStep(1);
      return;
    }
    if (pin.length < PIN_MIN || pin.length > PIN_MAX) {
      setError(t("profile.email_update.error_pin_length", {
        min: PIN_MIN,
        max: PIN_MAX
      }));
      jumpToStep(1);
      return;
    }
    if (!form.role) {
      setError(t("auth.register.error.role_required"));
      jumpToStep(2);
      return;
    }
    if (requiresFramework && !form.frameworkAck) {
      setError(t("auth.register.error.framework_ack_required"));
      jumpToStep(workerStepIndex);
      return;
    }
    if (!form.agree || !form.guideAck) {
      setError(t("auth.register.error.agree_required"));
      jumpToStep(!form.agree ? agreementStepIndex : guideStepIndex);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          pin,
          role: form.role,
          workerUse: form.workerUse,
          frameworkAck: form.frameworkAck,
          frameworkVersion: WORKER_FRAMEWORK_VERSION,
          frameworkReviewOpenedAt: frameworkReviewOpenedAt || null,
          frameworkSignedDownloadedAt: frameworkSignedDownloadedAt || null,
          locale
        })
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(resolveApiMessage({
          payload,
          t,
          fallbackKey: "auth.register.error.failed"
        }));
        return;
      }
      setSuccessMessage(t("auth.register.success_message", {
        email
      }));
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(WORKER_FRAMEWORK_REVIEW_STORAGE_KEY);
        window.sessionStorage.removeItem(WORKER_FRAMEWORK_SIGNED_DOWNLOAD_STORAGE_KEY);
      }
      setFrameworkReviewOpenedAt("");
      setFrameworkSignedDownloadedAt("");
      setForm(prev => ({
        ...initialForm,
        role: prev.role
      }));
      router.refresh();
    } catch (err) {
      console.error("Register error", err);
      setError(t("profile.server_unreachable"));
    } finally {
      setSubmitting(false);
    }
  }
  const {
    canScrollUp,
    canScrollDown,
    scrollDirection,
    getItemClassName,
    scrollToIndex
  } = CenteredScrollPicker({
    containerRef: scrollRef,
    itemSelector: ".register-step",
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
  const getRegisterStepClassName = index =>
    getItemClassName(index);
  useEffect(() => {
    if (typeof window === "undefined") return;
    setFrameworkReviewOpenedAt(window.sessionStorage.getItem(WORKER_FRAMEWORK_REVIEW_STORAGE_KEY) || "");
    setFrameworkSignedDownloadedAt(window.sessionStorage.getItem(WORKER_FRAMEWORK_SIGNED_DOWNLOAD_STORAGE_KEY) || "");
  }, []);
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
    const updatePad = () => {
      const steps = Array.from(scrollEl.querySelectorAll(".register-step"));
      const firstStep = steps[0] || null;
      const lastStep = steps[steps.length - 1] || firstStep;
      if (!firstStep || !lastStep) return;
      const firstH = firstStep.getBoundingClientRect().height || 0;
      const lastH = lastStep.getBoundingClientRect().height || 0;
      const viewH = Math.max(0, scrollEl.clientHeight || 0);
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
  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl || typeof window === "undefined") return;
    const mode = isMobileViewport ? "mobile" : "desktop";
    if (initViewportModeRef.current === mode) return;
    initViewportModeRef.current = mode;
    const resetToFirstStep = () => {
      if (!isMobileViewport) {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "auto"
        });
      }
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
    if (!scrollEl || typeof window === "undefined") return;
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
    return () => {
      scrollEl.removeEventListener("scroll", onScroll);
    };
  }, [isMobileViewport]);
  useEffect(() => {
    const onKey = e => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      if (isFrameworkModalOpen) {
        closeFrameworkModal();
        return;
      }
      pushWithTransition(router, localizePath("/", locale));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeFrameworkModal, isFrameworkModalOpen, router, locale]);
  const handleWorkerUseToggle = checked => {
    if (checked) {
      setForm(prev => ({
        ...prev,
        workerUse: "ORG_IDENTIFIABLE"
      }));
      setIsFrameworkModalOpen(true);
      return;
    }

    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(WORKER_FRAMEWORK_REVIEW_STORAGE_KEY);
      window.sessionStorage.removeItem(WORKER_FRAMEWORK_SIGNED_DOWNLOAD_STORAGE_KEY);
    }
    setFrameworkReviewOpenedAt("");
    setFrameworkSignedDownloadedAt("");
    setForm(prev => ({
      ...prev,
      workerUse: "",
      frameworkAck: false
    }));
    setIsFrameworkModalOpen(false);
  };
  return <section className={pageShellClassName} lang={locale}>
      <GlassRing className={registerRingClassName} data-scrolled={hasUserStartedScroll && isScrolled ? "1" : "0"}>
        <BackButton onClick={handleClose} ariaLabel={t("buttons.back_home")} className={`${glassPageBackClassName} scroll-reactive-back`} />
        <div className="csp-overlayTitle [--csp-title-top:2.35rem] max-[768px]:[--csp-title-top:calc(env(safe-area-inset-top,0px)+2.9rem)]" aria-hidden="true">
          <h1 className={localizedTitleClassName}>{t("auth.register.title")}</h1>
        </div>

        <div className={`csp-scrim csp-scrim--wide csp-scrim--top csp-scrim--chevron ${"is-visible"} ${scrollDirection === "down" ? "is-muted" : ""} ${canScrollUp ? "" : "is-hidden"}`} aria-hidden="true">
          <span className="csp-chevron-frame" aria-hidden="true">
            <ChevronIcon direction="up" strokeWidth={isMobileViewport ? registerChevronStrokeWidthMobile : registerChevronStrokeWidthDesktop} className="csp-chevron-icon" />
          </span>
        </div>
        <div className={`csp-scrim csp-scrim--wide csp-scrim--bottom csp-scrim--chevron ${"is-visible"} ${scrollDirection === "up" ? "is-muted" : ""} ${canScrollDown ? "" : "is-hidden"}`} aria-hidden="true">
          <span className="csp-chevron-frame" aria-hidden="true">
            <ChevronIcon direction="down" strokeWidth={isMobileViewport ? registerChevronStrokeWidthMobile : registerChevronStrokeWidthDesktop} className="csp-chevron-icon" />
          </span>
        </div>

        <div className={contentClassName}>
          <div ref={scrollRef} className={`${scrollClassName} ${isMobileViewport ? "" : "csp-no-neighbor-click"} ${isMobileViewport ? "[--csp-active-scale:1.01] [--csp-neighbor-scale:0.965] [--csp-hidden-scale:0.94] [--csp-neighbor-opacity:0.42] [--csp-hidden-opacity:0.2]" : "[--csp-active-scale:1] [--csp-neighbor-scale:0.92] [--csp-hidden-scale:0.86] [--csp-neighbor-opacity:0.15] [--csp-hidden-opacity:0]"}`} style={{
          "--csp-pad-top": `${Math.max(0, scrollPadTop || scrollPad)}px`,
          "--csp-pad-bottom": `${Math.max(0, scrollPadBottom || scrollPad)}px`,
          "--csp-center-offset": `${isMobileViewport ? -5 : -11}px`
        }} tabIndex={0} aria-label={t("auth.register.title")}>
            <form className="register-form flex flex-col gap-[2rem]" onSubmit={handleSubmit} autoComplete="on" noValidate>
              <section className={`${registerStepClassName} ${getRegisterStepClassName(0)}`}>
                <input type="email" id="email" name="email" className={`${inputBaseClassName} ${inputClassName} ${pinInputClassName}`.trim()} placeholder={t("auth.email_placeholder")} value={form.email} onChange={handleChange} required autoComplete="username" />
              </section>

              <section className={`${registerStepClassName} ${getRegisterStepClassName(1)}`}>
                <input type="password" id="pin" name="pin" className={`${inputBaseClassName} ${inputClassName} ${pinInputClassName}`.trim()} placeholder={t("auth.register.pin_placeholder", {
                min: PIN_MIN,
                max: PIN_MAX
              })} value={form.pin} onChange={handleChange} required minLength={PIN_MIN} maxLength={PIN_MAX} autoComplete="new-password" inputMode="numeric" pattern={`\\d{${PIN_MIN},${PIN_MAX}}`} />
              </section>

              <section className={`${registerStepClassName} ${getRegisterStepClassName(2)}`}>
                <div id={roleLabelId} className="mb-[0.9rem] text-center text-[1.35rem] font-medium tracking-[0.02em] text-[color:var(--title-color,var(--brand-primary))]">
                  {roleLabelText}
                </div>
                <div className="register-role-options flex flex-col gap-[0.95rem]" role="radiogroup" aria-labelledby={roleLabelId} aria-describedby={roleHintId}>
                  <div id={roleHintId} className="sr-only">
                    {t("auth.register.role_hint")}
                  </div>
                <OptionCard type="radio" name="role" value="SOCIAL_WORKER" checked={form.role === "SOCIAL_WORKER"} onChange={handleChange} fitTextLines={2} fitTextMinPx={15} className={`register-option-card w-full min-[769px]:w-[calc(100%-clamp(1.55rem,calc(var(--ring-diameter,52rem)/22),2.35rem))] min-[769px]:mx-auto ${registerTextClassName} max-[768px]:text-[1.15rem] max-[768px]:leading-[1.34] py-[1.1rem] ${registerControlVarsClassName} ${registerOptionButtonClassName} ${form.role === "SOCIAL_WORKER" ? registerSelectedOptionClassName : ""}`}>
                  {t("role.worker")}
                </OptionCard>
                <OptionCard type="radio" name="role" value="CLIENT" checked={form.role === "CLIENT"} onChange={handleChange} fitTextLines={2} fitTextMinPx={15} className={`register-option-card w-full min-[769px]:w-[calc(100%-clamp(1.55rem,calc(var(--ring-diameter,52rem)/22),2.35rem))] min-[769px]:mx-auto ${registerTextClassName} max-[768px]:text-[1.15rem] max-[768px]:leading-[1.34] py-[1.1rem] ${registerControlVarsClassName} ${registerOptionButtonClassName} ${form.role === "CLIENT" ? registerSelectedOptionClassName : ""}`}>
                  {t("role.client")}
                </OptionCard>
                </div>
              </section>

              <section className={`${registerStepClassName} ${getRegisterStepClassName(agreementStepIndex)}`}>
                <OptionCard type="checkbox" name="agree" checked={form.agree} onChange={handleChange} fitTextLines={2} fitTextMinPx={15} className={`register-agree-card ${checkboxCardClassName} ${registerControlVarsClassName} ${registerOptionButtonClassName}`}>
                    <RichText value={t("auth.register.agreement")} replacements={{
                    terms: {
                      open: `<a class="${registerPolicyLinkClassName}" href="${localizePath("/kasutustingimused", locale)}">`,
                      close: "</a>"
                    },
                    privacy: {
                      open: `<a class="${registerPolicyLinkClassName}" href="${localizePath("/privaatsustingimused", locale)}">`,
                      close: "</a>"
                    }
                  }} />
                </OptionCard>
              </section>

              <section className={`${registerStepClassName} ${getRegisterStepClassName(guideStepIndex)}`}>
                <OptionCard type="checkbox" name="guideAck" checked={form.guideAck} onChange={handleChange} fitTextLines={2} fitTextMinPx={15} className={`register-guide-card ${checkboxCardClassName} ${registerControlVarsClassName} ${registerOptionButtonClassName}`}>
                    <RichText value={t("auth.register.guide_ack")} replacements={{
                    guide: {
                      open: `<a class="${registerPolicyLinkClassName}" href="${localizePath("/kasutusjuhend", locale)}">`,
                      close: "</a>"
                    },
                    guide1: {
                      open: `<a class="${registerPolicyLinkClassName}" href="${localizePath("/kasutusjuhend", locale)}">`,
                      close: "</a>"
                    },
                    guide2: {
                      open: `<a class="${registerPolicyLinkClassName}" href="${localizePath("/kasutusjuhend", locale)}">`,
                      close: "</a>"
                    }
                  }} />
                </OptionCard>
              </section>

              {isSocialWorker ? <section className={`${registerStepClassName} ${getRegisterStepClassName(workerStepIndex)}`}>
                  <div className="flex flex-col gap-[0.95rem]">
                    <OptionCard type="checkbox" name="workerUseOrg" checked={hasConfirmedFramework} onChange={e => handleWorkerUseToggle(e.target.checked)} className={`w-full min-[769px]:w-[calc(100%-clamp(1.55rem,calc(var(--ring-diameter,52rem)/22),2.35rem))] min-[769px]:mx-auto ${checkboxCardClassName} ${registerControlVarsClassName} ${registerOptionButtonClassName}`}>
                      {t("auth.register.worker_use_org")}
                    </OptionCard>
                  </div>
              </section>
               : null}

              <section className={`${registerStepClassName} ${getRegisterStepClassName(submitStepIndex)}`}>
                {!isRegistrationOpen && <div role="status" className="w-full rounded-[0.95rem] border border-[rgba(251,191,36,0.45)] bg-[rgba(251,191,36,0.12)] px-[0.95rem] py-[0.78rem] text-[color:#fde68a] light:text-[color:#92400e] text-[1.08rem] leading-[1.4]">
                    {t("auth.register.closed_notice")}
                  </div>}
                {error && <div role="alert" className="register-alert w-full rounded-[0.95rem] border border-[rgba(248,113,113,0.45)] bg-[rgba(248,113,113,0.12)] px-[0.95rem] py-[0.78rem] text-[color:#fca5a5] text-[1.12rem] leading-[1.4]">
                    {error}
                  </div>}
                {successMessage && <div role="status" className="auth-success-panel w-full rounded-[1.02rem] px-[1rem] py-[0.9rem] text-[1.2rem] max-[768px]:text-[1.34rem] leading-[1.38] font-medium">
                    {successMessage}
                  </div>}
                {submitting ? <div className="flex justify-center py-[0.12rem]" role="status" aria-live="polite" aria-atomic="true">
                    <div className="relative w-fit min-w-[clamp(9.5rem,17vw,11.1rem)] rounded-[1.34rem] border border-[rgba(255,255,255,0.18)] bg-[linear-gradient(153deg,rgba(255,255,255,0.14)_0%,rgba(30,41,59,0.36)_55%,rgba(8,14,24,0.46)_100%)] px-[1rem] pt-[0.95rem] pb-[0.92rem] shadow-[0_15px_30px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-[var(--glass-modal-blur,1rem)] backdrop-saturate-[var(--glass-modal-saturate,100%)] light:border-[rgba(148,163,184,0.36)] light:bg-[linear-gradient(150deg,rgba(255,255,255,0.98)_0%,rgba(241,245,249,0.92)_58%,rgba(226,232,240,0.84)_100%)] light:shadow-[0_12px_24px_rgba(15,23,42,0.16),inset_0_1px_0_rgba(255,255,255,0.82)]">
                      <div className="flex flex-col items-center gap-[0.82rem]">
                        <div className="grid min-h-[clamp(4.8rem,9.4vw,5.7rem)] place-items-center">
                          <SotsiaalAILoader size="clamp(3.35rem,6.4vw,3.95rem)" ariaHidden />
                        </div>
                        <span className="block text-center text-[1.16rem] leading-[1.16] font-medium tracking-[0.01em] text-[color:#e2e8f0] light:text-[color:#334155]">
                          {t("auth.register.loading_status", "Konto loomine")}
                        </span>
                      </div>
                    </div>
                  </div> : null}
                <div className={`register-submit-wrap flex justify-center ${submitting ? "mt-[0.8rem]" : ""}`}>
                  <Button type="submit" variant="primary" className={registerButtonClassName} disabled={submitting || !isRegistrationOpen}>
                    <span className="register-submit-label">
                      {t("auth.register.submit")}
                    </span>
                  </Button>
                </div>
              </section>
            </form>
          </div>
        </div>
      </GlassRing>
      {isFrameworkModalOpen ? <div className={frameworkOverlayClassName} role="presentation" onClick={event => {
      if (event.target === event.currentTarget) closeFrameworkModal();
    }}>
          <GlassRing className={frameworkRingClassName} role="dialog" aria-modal="true" aria-label={t("auth.register.worker_framework_title")}>
            <div className={frameworkInnerClassName}>
              <BackButton onClick={closeFrameworkModal} ariaLabel={t("buttons.back_previous")} holdPressedVisualDisabled className={glassPageBackMobileBottomCenterClassName} />
              <div className={frameworkTitleWrapClassName}>
                <h2 className={frameworkTitleClassName}>
                  <span className="block">{frameworkTitleLines[0]}</span>
                  <span className="block">{frameworkTitleLines[1]}</span>
                </h2>
                </div>
                <div className={frameworkContentClassName}>
                  <div className={frameworkPanelClassName}>
                    <p className={frameworkLeadClassName}>
                      {t("auth.register.worker_framework_note")}
                    </p>
                    <div className={frameworkActionsClassName}>
                      <Button type="button" onClick={openFrameworkPage} variant="primary" className={frameworkDownloadClassName}>
                        {t("auth.register.worker_framework_open")}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </GlassRing>
      </div> : null}
    </section>;
}
