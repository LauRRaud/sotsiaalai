"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState, useId } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import OptionCard from "@/components/ui/OptionCard";
import RichText from "@/components/i18n/RichText";
import BackButton from "@/components/ui/BackButton";
import CloseButton from "@/components/ui/CloseButton";
import Button from "@/components/ui/Button";
import BorderGlow from "@/components/ui/BorderGlow";
import GlassRing from "@/components/ui/GlassRing";
import GlowField, { fieldEdgeGlowStyle } from "@/components/ui/GlowField";
import { pillInputBaseClassName } from "@/components/ui/inputClassNames";
import { cn } from "@/components/ui/cn";
import {
  glassPageBackClassName,
  glassPageBackMobileBottomCenterClassName,
  glassPageCloseClassName,
  glassPageShellCenteredClassName,
  glassPageTitleClassName,
} from "@/components/ui/glassPageStyles";
import { localizePath } from "@/lib/localizePath";
import CenteredScrollPicker from "@/components/CenteredScrollPicker";
import "@/components/CenteredScrollPicker.css";
import ChevronIcon from "@/components/ui/icons/ChevronIcon";
import { primarySegmentedButtonClassName } from "@/components/ui/primarySegmentedButtonClassName";
import useSmoothWheelProxy from "@/components/ui/useSmoothWheelProxy";
import {
  WORKER_FRAMEWORK_REGISTER_ACK_STORAGE_KEY,
  WORKER_FRAMEWORK_REGISTER_CONTEXT_STORAGE_KEY,
  WORKER_FRAMEWORK_REVIEW_STORAGE_KEY,
  WORKER_FRAMEWORK_SIGNED_DOWNLOAD_STORAGE_KEY,
  WORKER_FRAMEWORK_VERSION,
} from "@/lib/frameworkAcceptances";
import { pushWithTransition } from "@/lib/routeTransition";
import { resolveApiMessage } from "@/lib/i18n/resolveApiMessage";
const pageShellClassName = glassPageShellCenteredClassName;
const titleClassName = `${glassPageTitleClassName} glass-title-register max-[768px]:!text-[clamp(2.2rem,8.7vw,3rem)] max-[768px]:!leading-[1.06] max-[768px]:!mt-0 max-[768px]:!mb-0 max-[768px]:!px-0`;
const successTitleClassName =
  `${glassPageTitleClassName} subpage-mobile-title policy-mobile-title policy-mobile-title--static max-[768px]:!mt-0 max-[768px]:!mb-0`;
const successTitleWrapClassName =
  "policy-mobile-title-wrap relative z-[4] flex w-full items-center justify-center max-[768px]:pt-[calc(env(safe-area-inset-top,0px)+2.18rem)] max-[768px]:pb-[clamp(0.18rem,0.9vh,0.42rem)]";
const contentClassName =
  "register-content mt-0 flex w-full flex-1 min-h-0 flex-col items-center pb-[clamp(1rem,3vh,1.8rem)]";
const successContentClassName =
  "register-success-content mx-auto mt-[clamp(2.8rem,6.2vh,3.8rem)] flex w-full max-w-[clamp(21rem,62vw,32rem)] flex-col items-center gap-[1.35rem] text-center";
const successPanelClassName =
  "register-success-panel relative w-full rounded-t-[clamp(1.25rem,2.6vw,2.4rem)] rounded-b-[clamp(0.9rem,1.7vw,1.35rem)] " +
  "[background:var(--glass-ring-surface-bg,var(--glass-surface-bg,rgba(0,0,0,0.25)))] backdrop-blur-[var(--glass-blur-radius,1rem)] " +
  "[-webkit-backdrop-filter:blur(var(--glass-blur-radius,1rem))] shadow-[var(--glass-shell-shadow,none)] [border:none] " +
  "px-[clamp(1rem,2.4vw,1.8rem)] pt-[clamp(1.3rem,2.6vw,2rem)] pb-[clamp(1rem,2vw,1.45rem)] max-[768px]:px-[clamp(1rem,4.8vw,1.35rem)]";
const successMessageClassName =
  "m-0 text-center text-[1.18rem] leading-[1.5] tracking-[0.012em] text-[color:var(--glass-surface-text,#f2f2f2)] light:text-[color:var(--input-text)] max-[768px]:text-[1.28rem] max-[768px]:leading-[1.42]";
const successActionsClassName = "mt-[0.25rem] flex w-full justify-center";
const scrollClassName =
  "register-scroll relative flex-1 w-full max-w-full min-h-0 overflow-y-auto overflow-x-hidden px-[0.6rem] min-[769px]:px-[1.02rem] text-left csp-container mx-auto";
const registerFormClassName =
  "register-form mx-auto flex w-full max-w-[clamp(18rem,39vw,25.2rem)] min-[769px]:max-w-[clamp(18.2rem,calc(var(--ring-diameter,52rem)/2.2),23.6rem)] flex-col gap-[2rem]";
const registerTextClassName =
  "register-copy text-[1.25rem] leading-[1.45] text-[color:var(--pt-50)] light:text-[color:var(--input-text)]";
const registerPolicyLinkClassName =
  "register-policy-link inline p-0 m-0 border-0 bg-transparent align-baseline font-medium !text-[color:var(--home-link-color,var(--brand-primary))] no-underline hover:no-underline focus:no-underline active:no-underline !decoration-transparent hover:!decoration-transparent focus:!decoration-transparent active:!decoration-transparent hover:border-transparent focus:border-transparent active:border-transparent hover:shadow-none focus:shadow-none active:shadow-none transition-[color] duration-150 light:!text-[color:var(--home-link-color,var(--link-color,#7a3a38))] hc:!text-[color:var(--home-link-color,var(--hc-accent))]";
const inputClassName = `w-full ${registerTextClassName} placeholder:text-[color:var(--pt-200)]`;
const pinInputClassName =
  "placeholder:text-[#6b7280] light:placeholder:text-[#4b5563]";
const registerFieldHintClassName =
  "pointer-events-none absolute inset-y-0 left-[1.5rem] right-[1.5rem] flex items-center overflow-hidden whitespace-nowrap text-ellipsis text-[1.25rem] leading-[1.45] tracking-[0.01em] text-[color:var(--subscription-error-color,#fca5a5)] opacity-95 max-[768px]:text-[clamp(1.24rem,4.95vw,1.42rem)] max-[768px]:leading-[1.34]";
const registerControlWidthClassName =
  "min-[769px]:!w-[calc(100%-clamp(1.55rem,calc(var(--ring-diameter,52rem)/22),2.35rem))] min-[769px]:!max-w-[calc(100%-clamp(1.55rem,calc(var(--ring-diameter,52rem)/22),2.35rem))] min-[769px]:mx-auto";
const checkboxCardClassName =
  `register-checkbox-card w-full ${registerControlWidthClassName} gap-[0.72rem] text-[1.04rem] leading-[1.28] px-[1.05rem] py-[0.72rem] text-[color:var(--pt-50)] light:text-[color:var(--input-text)]`;
const registerControlVarsClassName =
  "[--seg-control-size:24px] [--seg-radio-dot-size:10px] [--seg-check-size:22px] [--seg-control-radius:0.5rem]";
const registerOptionButtonClassName = primarySegmentedButtonClassName;
const lockedRoleCardClassName =
  "register-option-card relative overflow-hidden flex items-center rounded-[var(--seg-card-radius)] px-[0.85rem] py-[1.1rem] text-[1.18rem] font-normal tracking-[0.03em] shadow-[var(--seg-card-shadow-selected,var(--btn-primary-shadow-hover))] " +
  "[background:var(--seg-card-bg-selected,var(--btn-primary-bg-hover))] text-[color:var(--seg-card-text-selected,var(--title-color,var(--brand-primary)))] " +
  `w-full ${registerControlWidthClassName} justify-center text-center max-[768px]:text-[1.15rem] max-[768px]:leading-[1.34]`;
const registerButtonClassName =
  "register-submit px-[1.65rem] py-[0.9rem] text-[1.32rem] leading-[1.1]";
const successButtonClassName =
  "register-success-button !min-h-[3.05rem] !px-[1.55rem] !py-[0.9rem] !text-[1.18rem] !leading-[1.12] !tracking-[0.02em] " +
  "max-[768px]:!min-h-[3.42rem] max-[768px]:!px-[1.7rem] max-[768px]:!py-[0.98rem] max-[768px]:!text-[1.32rem]";
const registerStepClassName = "register-step csp-step !min-h-0 !py-[0.6rem]";
const registerChevronStrokeWidthDesktop = 0.72;
const registerChevronStrokeWidthMobile = 1.04;
const inputBaseClassName =
  `register-input register-input-mid-shell ${pillInputBaseClassName} ` +
  "min-[769px]:w-[calc(100%-clamp(1.45rem,calc(var(--ring-diameter,52rem)/24.8),2.1rem))] min-[769px]:mx-auto py-[0.95rem] px-[1.5rem] min-h-[3.6rem]";
const registerCredentialFieldClassName =
  registerControlWidthClassName;
const isRegistrationOpen = !["false", "0", "off"].includes(
  String(process.env.NEXT_PUBLIC_REGISTRATION_OPEN || "true")
    .trim()
    .toLowerCase(),
);
const REGISTER_DRAFT_STORAGE_KEY = "sotsiaalai_register_draft";
const initialForm = {
  email: "",
  pin: "",
  role: "",
  workerUse: "",
  frameworkAck: false,
  agree: false,
  guideAck: false,
};
const REGISTER_ROLE_OPTIONS = ["SOCIAL_WORKER", "CLIENT", "SERVICE_PROVIDER"];
const PROFESSIONAL_ROLE_VALUES = new Set(["SOCIAL_WORKER", "SERVICE_PROVIDER"]);

function isProfessionalRole(role) {
  return PROFESSIONAL_ROLE_VALUES.has(String(role || "").trim().toUpperCase());
}

function roleLabelKey(role) {
  const normalized = String(role || "").trim().toUpperCase();
  if (normalized === "SERVICE_PROVIDER") return "role.provider";
  if (normalized === "SOCIAL_WORKER") return "role.worker";
  return "role.client";
}

function normalizeDraftForm(draft) {
  if (!draft || typeof draft !== "object") return null;
  return {
    email: typeof draft.email === "string" ? draft.email : "",
    pin: typeof draft.pin === "string" ? draft.pin.replace(/\D/g, "").slice(0, 8) : "",
    role: REGISTER_ROLE_OPTIONS.includes(draft.role) ? draft.role : "",
    workerUse: draft.workerUse === "ORG_IDENTIFIABLE" ? "ORG_IDENTIFIABLE" : "",
    frameworkAck: draft.frameworkAck === true,
    agree: draft.agree === true,
    guideAck: draft.guideAck === true,
  };
}

function normalizeRegistrationRoleParam(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (raw === "specialist" || raw === "worker" || raw === "social_worker") {
    return "SOCIAL_WORKER";
  }
  if (raw === "provider" || raw === "service_provider" || raw === "teenuseosutaja") {
    return "SERVICE_PROVIDER";
  }
  if (raw === "client" || raw === "citizen") {
    return "CLIENT";
  }
  return "";
}

export default function RegistreerimineBody({}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, locale } = useI18n();
  const lockedRole = normalizeRegistrationRoleParam(searchParams?.get("role"));
  const isRoleLocked = Boolean(lockedRole);
  const localizedTitleClassName = `${titleClassName}${locale === "ru" ? " glass-title-register-ru" : ""}`;
  const ringRef = useRef(null);
  const scrollRef = useRef(null);
  const backButtonRef = useRef(null);
  const handleClose = () => {
    pushWithTransition(router, localizePath("/", locale), {
      glassRingTilt: "left",
      waitForGlassRingTilt: true,
      persistGlassRingTilt: false,
    });
  };
  const openFrameworkPage = (overrides = {}) => {
    if (typeof window !== "undefined") {
      const liveForm = {
        ...form,
        ...overrides,
        email: document.getElementById("email")?.value || form.email,
        pin: document.getElementById("pin")?.value || form.pin,
        role:
          document.querySelector('input[name="role"]:checked')?.value ||
          overrides.role ||
          form.role ||
          "SOCIAL_WORKER",
        agree:
          document.querySelector('input[name="agree"]')?.checked ??
          form.agree,
        guideAck:
          document.querySelector('input[name="guideAck"]')?.checked ??
          form.guideAck,
      };
      const timestamp =
        window.sessionStorage.getItem(WORKER_FRAMEWORK_REVIEW_STORAGE_KEY) ||
        new Date().toISOString();
      window.sessionStorage.setItem(
        WORKER_FRAMEWORK_REVIEW_STORAGE_KEY,
        timestamp,
      );
      setFrameworkReviewOpenedAt(timestamp);
      window.sessionStorage.setItem(WORKER_FRAMEWORK_REGISTER_CONTEXT_STORAGE_KEY, "1");
      window.sessionStorage.setItem(
        REGISTER_DRAFT_STORAGE_KEY,
        JSON.stringify({
          ...liveForm,
          role: isProfessionalRole(liveForm.role) ? liveForm.role : "SOCIAL_WORKER",
          workerUse: "ORG_IDENTIFIABLE",
        }),
      );
    }
    router.push(localizePath("/tooalase-kasutuse-raamistik", locale));
  };
  const PIN_MIN = 4;
  const PIN_MAX = 8;
  const [form, setForm] = useState(initialForm);
  const [draftReady, setDraftReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    pin: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const showSuccessState = Boolean(successMessage);
  const [frameworkReviewOpenedAt, setFrameworkReviewOpenedAt] = useState("");
  const [frameworkSignedDownloadedAt, setFrameworkSignedDownloadedAt] =
    useState("");
  const [scrollPad, setScrollPad] = useState(0);
  const [scrollPadTop, setScrollPadTop] = useState(0);
  const [scrollPadBottom, setScrollPadBottom] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hasUserStartedScroll, setHasUserStartedScroll] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const initViewportModeRef = useRef(null);
  const initialScrollTopRef = useRef(0);
  const hasInitialScrollTopRef = useRef(false);
  const initialFirstStepAlignDoneRef = useRef(false);
  const roleLabelId = useId();
  const roleHintId = useId();
  const emailErrorId = useId();
  const pinErrorId = useId();
  const roleLabelText = t("auth.register.role_label_question");
  const isProfessionalUser = isProfessionalRole(form.role);
  const requiresFramework =
    isProfessionalUser && form.workerUse === "ORG_IDENTIFIABLE";
  const hasConfirmedFramework = requiresFramework && form.frameworkAck;
  const registerRingClassName = cn(
    "glass-ring glass-ring--desktop-stable scroll-reactive-shell register-mobile-ring register-ring-shell md:mt-0 md:mb-0 [--glass-ring-surface-bg:var(--glass-surface-bg,rgba(0,0,0,0.25))] [--csp-chevron-top:clamp(0.12rem,0.55vh,0.45rem)] [--csp-chevron-bottom:clamp(0.12rem,0.55vh,0.45rem)] [--csp-arrow-size:clamp(2.55rem,calc(var(--ring-diameter,52rem)/16.8),3.25rem)] min-[769px]:[--csp-arrow-size:clamp(1.95rem,calc(var(--ring-diameter,52rem)/20.8),2.45rem)] max-[768px]:[--csp-arrow-size:clamp(2.25rem,9.8vw,2.95rem)] max-[768px]:[--csp-chevron-top:clamp(0.24rem,1.2vw,0.54rem)] max-[768px]:[--csp-chevron-bottom:clamp(0.24rem,1.15vw,0.52rem)] max-[768px]:[--mobile-glass-card-gap:clamp(calc(0.26*var(--base-rem)),1.2vw,calc(0.4*var(--base-rem)))] max-[768px]:[--ring-pad-x:clamp(calc(0.44*var(--base-rem)),2vw,calc(0.78*var(--base-rem)))] max-[768px]:pb-[calc(env(safe-area-inset-bottom,0px)+1.4rem)]",
  );
  const roleStepIndex = 0;
  const emailStepIndex = 1;
  const pinStepIndex = 2;
  const agreementStepIndex = 3;
  const guideStepIndex = 4;
  const workerStepIndex = 5;
  const submitStepIndex = isProfessionalUser ? 6 : 5;
  const proxyWheelToRegisterScroll = useSmoothWheelProxy({
    scrollRef,
    disabled: isMobileViewport,
    passthroughNativeTargets: true,
  });

  useEffect(() => {
    if (!draftReady || !lockedRole) return;

    setForm((prev) => ({
      ...prev,
      role: lockedRole,
      workerUse: isProfessionalRole(lockedRole) ? prev.workerUse : "",
      frameworkAck: isProfessionalRole(lockedRole) ? prev.frameworkAck : false,
    }));
  }, [draftReady, lockedRole]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    const nextValue =
      name === "pin"
        ? value.replace(/\D/g, "").slice(0, PIN_MAX)
        : type === "checkbox"
          ? checked
          : value;
    setForm((prev) => ({
      ...prev,
      [name]: nextValue,
      ...(name === "role" && !isProfessionalRole(nextValue)
        ? {
            workerUse: "",
            frameworkAck: false,
          }
        : null),
      ...(name === "workerUse" && nextValue !== "ORG_IDENTIFIABLE"
        ? {
            frameworkAck: false,
          }
        : null),
    }));
    if (name === "email" || name === "pin") {
      setFieldErrors((prev) =>
        prev[name]
          ? {
              ...prev,
              [name]: "",
            }
          : prev,
      );
    }
  }
  const handleRoleSelect = (role) => {
    setForm((prev) => ({
      ...prev,
      role,
      ...(!isProfessionalRole(role)
        ? {
            workerUse: "",
            frameworkAck: false,
          }
        : null),
    }));
  };
  const handleRoleKeyDown = (event, role) => {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown" && event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
      return;
    }
    event.preventDefault();
    const currentIndex = Math.max(0, REGISTER_ROLE_OPTIONS.indexOf(role));
    const direction = event.key === "ArrowUp" || event.key === "ArrowLeft" ? -1 : 1;
    const nextIndex =
      (currentIndex + direction + REGISTER_ROLE_OPTIONS.length) % REGISTER_ROLE_OPTIONS.length;
    handleRoleSelect(REGISTER_ROLE_OPTIONS[nextIndex]);
  };
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setFieldErrors({
      email: "",
      pin: "",
    });
    setSuccessMessage("");
    if (!isRegistrationOpen) {
      setError(t("auth.register.closed_notice"));
      return;
    }
    const email = form.email.trim().toLowerCase();
    const pin = form.pin.replace(/\D/g, "");
    const jumpToStep = (index) => {
      scrollToIndex(index);
    };
    if (!form.role) {
      setError(t("auth.register.error.role_required"));
      jumpToStep(roleStepIndex);
      return;
    }
    if (!email) {
      setFieldErrors((prev) => ({
        ...prev,
        email: t("profile.email_update.error_email_required"),
      }));
      jumpToStep(emailStepIndex);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFieldErrors((prev) => ({
        ...prev,
        email: t("profile.email_update.error_email_invalid"),
      }));
      jumpToStep(emailStepIndex);
      return;
    }
    if (!pin) {
      setFieldErrors((prev) => ({
        ...prev,
        pin: t("profile.email_update.error_pin_required"),
      }));
      jumpToStep(pinStepIndex);
      return;
    }
    if (pin.length < PIN_MIN || pin.length > PIN_MAX) {
      setFieldErrors((prev) => ({
        ...prev,
        pin: t("profile.email_update.error_pin_length", {
          min: PIN_MIN,
          max: PIN_MAX,
        }),
      }));
      jumpToStep(pinStepIndex);
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
          "Content-Type": "application/json",
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
          locale,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        const resolvedMessage = resolveApiMessage({
          payload,
          t,
          fallbackKey: "auth.register.error.failed",
        });
        if (
          payload?.code === "INVALID_EMAIL" ||
          payload?.code === "EMAIL_IN_USE" ||
          payload?.messageKey === "api.auth.register.invalid_email" ||
          payload?.messageKey === "api.auth.register.email_in_use"
        ) {
          setFieldErrors((prev) => ({
            ...prev,
            email: resolvedMessage,
          }));
          jumpToStep(emailStepIndex);
          return;
        }
        if (
          payload?.code === "PIN_INVALID" ||
          payload?.messageKey === "api.auth.register.pin_invalid"
        ) {
          setFieldErrors((prev) => ({
            ...prev,
            pin: resolvedMessage,
          }));
          jumpToStep(pinStepIndex);
          return;
        }
        setError(resolvedMessage);
        return;
      }
      setSuccessMessage(
        t("auth.register.success_message", {
          email,
        }),
      );
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(REGISTER_DRAFT_STORAGE_KEY);
        window.sessionStorage.removeItem(WORKER_FRAMEWORK_REGISTER_CONTEXT_STORAGE_KEY);
        window.sessionStorage.removeItem(WORKER_FRAMEWORK_REGISTER_ACK_STORAGE_KEY);
        window.sessionStorage.removeItem(WORKER_FRAMEWORK_REVIEW_STORAGE_KEY);
        window.sessionStorage.removeItem(
          WORKER_FRAMEWORK_SIGNED_DOWNLOAD_STORAGE_KEY,
        );
      }
      setFrameworkReviewOpenedAt("");
      setFrameworkSignedDownloadedAt("");
      setForm((prev) => ({
        ...initialForm,
        role: prev.role,
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
    scrollToIndex,
  } = CenteredScrollPicker({
    containerRef: scrollRef,
    itemSelector: ".register-step",
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
    pauseSettleWhileTouch: isMobileViewport,
  });
  const getRegisterStepClassName = (index) =>
    isMobileViewport ? getItemClassName(index) : "";
  useEffect(() => {
    if (typeof window === "undefined") return;
    const rawDraft = window.sessionStorage.getItem(REGISTER_DRAFT_STORAGE_KEY);
    const registerFrameworkAck =
      window.sessionStorage.getItem(WORKER_FRAMEWORK_REGISTER_ACK_STORAGE_KEY) === "1";
    if (rawDraft || registerFrameworkAck) {
      try {
        const parsedDraft = rawDraft ? JSON.parse(rawDraft) : null;
        const nextDraft = normalizeDraftForm(parsedDraft) || initialForm;
        setForm({
          ...initialForm,
          ...nextDraft,
          ...(registerFrameworkAck
            ? {
                role: isProfessionalRole(nextDraft.role) ? nextDraft.role : "SOCIAL_WORKER",
                workerUse: "ORG_IDENTIFIABLE",
                frameworkAck: true,
              }
            : null),
        });
      } catch {
        if (registerFrameworkAck) {
          setForm((prev) => ({
            ...prev,
            role: isProfessionalRole(prev.role) ? prev.role : "SOCIAL_WORKER",
            workerUse: "ORG_IDENTIFIABLE",
            frameworkAck: true,
          }));
        }
      }
    }
    setDraftReady(true);
    setFrameworkReviewOpenedAt(
      window.sessionStorage.getItem(WORKER_FRAMEWORK_REVIEW_STORAGE_KEY) || "",
    );
    setFrameworkSignedDownloadedAt(
      window.sessionStorage.getItem(
        WORKER_FRAMEWORK_SIGNED_DOWNLOAD_STORAGE_KEY,
      ) || "",
    );
  }, []);
  useEffect(() => {
    if (typeof window === "undefined" || showSuccessState || !draftReady) return;
    window.sessionStorage.setItem(REGISTER_DRAFT_STORAGE_KEY, JSON.stringify(form));
  }, [draftReady, form, showSuccessState]);
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
  useLayoutEffect(() => {
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
      const scrollRect = scrollEl.getBoundingClientRect();
      const backRect = backButtonRef.current?.getBoundingClientRect?.();
      const targetCenter = !isMobileViewport && backRect
        ? backRect.top + backRect.height / 2 - scrollRect.top
        : viewH / 2 - 5;
      const nextPadTopBase = Math.max(0, Math.floor(targetCenter - firstH / 2));
      const nextPadBottomBase = Math.max(
        0,
        Math.floor(viewH - targetCenter - lastH / 2),
      );
      const nextPad = Math.max(0, Math.floor((viewH - firstH) / 2));
      setScrollPad((prev) => (prev === nextPad ? prev : nextPad));
      setScrollPadTop((prev) => (prev === nextPadTopBase ? prev : nextPadTopBase));
      setScrollPadBottom((prev) =>
        prev === nextPadBottomBase ? prev : nextPadBottomBase,
      );
    };
    updatePad();
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(updatePad)
        : null;
    ro?.observe(scrollEl);
    window.addEventListener("resize", updatePad);
    return () => {
      ro?.disconnect?.();
      window.removeEventListener("resize", updatePad);
    };
  }, [isMobileViewport, isRoleLocked]);
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
      } else {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "auto",
        });
      }
      setIsScrolled(false);
      setHasUserStartedScroll(false);
      hasInitialScrollTopRef.current = true;
      initialScrollTopRef.current = scrollEl.scrollTop || 0;
      initialFirstStepAlignDoneRef.current = true;
    };
    resetToFirstStep();
    const rafA = requestAnimationFrame(resetToFirstStep);
    const rafB = requestAnimationFrame(() =>
      requestAnimationFrame(resetToFirstStep),
    );
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
        setHasUserStartedScroll((prev) => prev || true);
      }
      setIsScrolled((prev) => {
        const next = prev ? delta > thresholdOff : delta > thresholdOn;
        return prev === next ? prev : next;
      });
    };
    onScroll();
    scrollEl.addEventListener("scroll", onScroll, {
      passive: true,
    });
    return () => {
      scrollEl.removeEventListener("scroll", onScroll);
    };
  }, [isMobileViewport]);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      pushWithTransition(router, localizePath("/", locale));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, locale]);
  const handleWorkerUseToggle = (checked) => {
    if (checked) {
      const registerFrameworkAck =
        typeof window !== "undefined" &&
        window.sessionStorage.getItem(WORKER_FRAMEWORK_REGISTER_ACK_STORAGE_KEY) === "1";
      setForm((prev) => ({
        ...prev,
        workerUse: "ORG_IDENTIFIABLE",
        frameworkAck: registerFrameworkAck,
      }));
      if (!registerFrameworkAck) {
        openFrameworkPage({
          role: isProfessionalRole(form.role) ? form.role : "SOCIAL_WORKER",
          workerUse: "ORG_IDENTIFIABLE",
          frameworkAck: false,
        });
      }
      return;
    }

    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(WORKER_FRAMEWORK_REGISTER_CONTEXT_STORAGE_KEY);
      window.sessionStorage.removeItem(WORKER_FRAMEWORK_REGISTER_ACK_STORAGE_KEY);
      window.sessionStorage.removeItem(WORKER_FRAMEWORK_REVIEW_STORAGE_KEY);
      window.sessionStorage.removeItem(
        WORKER_FRAMEWORK_SIGNED_DOWNLOAD_STORAGE_KEY,
      );
    }
    setFrameworkReviewOpenedAt("");
    setFrameworkSignedDownloadedAt("");
    setForm((prev) => ({
      ...prev,
      workerUse: "",
      frameworkAck: false,
    }));
  };
  return (
    <section className={pageShellClassName} lang={locale}>
      <GlassRing
        ref={ringRef}
        className={cn(
          registerRingClassName,
          showSuccessState ? "register-success-shell mobile-keep-desktop-glass-cards" : null,
        )}
        data-scrolled={hasUserStartedScroll && isScrolled ? "1" : "0"}
        onWheel={proxyWheelToRegisterScroll}
      >
        <BackButton
          ref={backButtonRef}
          onClick={showSuccessState ? handleClose : handleClose}
          ariaLabel={t("buttons.back_home")}
          className={showSuccessState ? glassPageBackMobileBottomCenterClassName : `${glassPageBackClassName} scroll-reactive-back register-back-button`}
        />
        {showSuccessState ? (
          <>
            <CloseButton
              onClick={handleClose}
              ariaLabel={t("buttons.close")}
              className={cn(glassPageCloseClassName, "max-[768px]:hidden")}
            />
            <div className={successTitleWrapClassName}>
              <h1 className={successTitleClassName}>
                {t("auth.register.title")}
              </h1>
            </div>
            <div className={successContentClassName}>
              <div role="status" className={successPanelClassName}>
                <p className={successMessageClassName}>
                  {successMessage}
                </p>
              </div>
              <div className={successActionsClassName}>
                <Button
                  type="button"
                  variant="primary"
                  className={successButtonClassName}
                  onClick={handleClose}
                >
                  <span>{t("buttons.back_home")}</span>
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div
              className="csp-overlayTitle [--csp-title-top:2.35rem] max-[768px]:[--csp-title-top:calc(env(safe-area-inset-top,0px)+2.9rem)]"
              aria-hidden="true"
            >
              <h1 className={localizedTitleClassName}>
                {t("auth.register.title")}
              </h1>
            </div>

            <>
              <div
                className={`csp-scrim csp-scrim--top csp-scrim--chevron top-0 is-visible ${scrollDirection === "down" ? "is-muted" : ""} ${canScrollUp ? "" : "is-hidden"}`}
                aria-hidden="true"
              >
                <span className="csp-chevron-frame" aria-hidden="true">
                  <ChevronIcon
                    direction="up"
                    strokeWidth={
                      isMobileViewport
                        ? registerChevronStrokeWidthMobile
                        : registerChevronStrokeWidthDesktop
                    }
                    className="csp-chevron-icon"
                  />
                </span>
              </div>
              <div
                className={`csp-scrim csp-scrim--wide csp-scrim--bottom csp-scrim--chevron is-visible ${scrollDirection === "up" ? "is-muted" : ""} ${!isScrolled && canScrollDown ? "is-scroll-cue" : ""} ${canScrollDown ? "" : "is-hidden"}`}
                aria-hidden="true"
              >
                <span className="csp-chevron-frame" aria-hidden="true">
                  <ChevronIcon
                    direction="down"
                    strokeWidth={
                      isMobileViewport
                        ? registerChevronStrokeWidthMobile
                        : registerChevronStrokeWidthDesktop
                    }
                    className="csp-chevron-icon"
                  />
                </span>
              </div>
            </>

            <div className={contentClassName}>
              <div
                ref={scrollRef}
                className={`${scrollClassName} ${isMobileViewport ? "" : "csp-desktop-free-scroll"} ${isMobileViewport ? "[--csp-active-scale:1.01] [--csp-neighbor-scale:0.965] [--csp-hidden-scale:0.94] [--csp-neighbor-opacity:0.42] [--csp-hidden-opacity:0.2]" : ""}`}
                style={{
                  "--csp-pad": `${scrollPad}px`,
                  "--csp-pad-top": `${scrollPadTop || scrollPad}px`,
                  "--csp-pad-bottom": `${scrollPadBottom || scrollPad}px`,
                  "--csp-center-offset": `${isMobileViewport ? -5 : 0}px`,
                  overflowAnchor: "none",
                }}
                tabIndex={0}
                aria-label={t("auth.register.title")}
              >
                <form
                  className={registerFormClassName}
                  onSubmit={handleSubmit}
                  autoComplete="on"
                  noValidate
                >
              <section
                className={`${registerStepClassName} register-step--role ${getRegisterStepClassName(roleStepIndex)}`}
              >
                {!isRoleLocked ? (
                  <>
                    <div
                      id={roleLabelId}
                      className="mb-[0.9rem] text-center text-[1.35rem] font-medium tracking-[0.02em] text-[color:var(--title-color,var(--brand-primary))]"
                    >
                      {roleLabelText}
                    </div>
                    <div
                      className="register-role-options flex flex-col gap-[0.95rem]"
                      role="radiogroup"
                      aria-labelledby={roleLabelId}
                      aria-describedby={roleHintId}
                    >
                      <div id={roleHintId} className="sr-only">
                        {t("auth.register.role_hint")}
                      </div>
                      {REGISTER_ROLE_OPTIONS.map((role) => (
                        <BorderGlow
                          key={role}
                          as="button"
                          type="button"
                          role="radio"
                          aria-checked={form.role === role}
                          data-checked={form.role === role ? "true" : "false"}
                          onClick={() => handleRoleSelect(role)}
                          onKeyDown={(event) => handleRoleKeyDown(event, role)}
                          className={`ui-glow-option-card-frame register-role-button register-option-card w-full ${registerControlWidthClassName} ${registerTextClassName} max-[768px]:text-[1.15rem] max-[768px]:leading-[1.34] py-[1.1rem] ${registerControlVarsClassName} ${registerOptionButtonClassName}`}
                          edgeSensitivity={22}
                          glowColor="358 82 72"
                          backgroundColor="var(--seg-card-bg)"
                          borderRadius={20}
                          glowRadius={42}
                          glowIntensity={0.62}
                          coneSpread={20}
                          fillOpacity={0}
                          edgeOnly
                          style={{
                            ...fieldEdgeGlowStyle,
                            "--border-radius": "var(--seg-card-radius, 1.25rem)"
                          }}
                        >
                          <span className="relative z-[1] flex min-w-0 flex-1 items-center justify-center text-center leading-[inherit]">
                            {t(roleLabelKey(role))}
                          </span>
                        </BorderGlow>
                      ))}
                    </div>
                  </>
                ) : (
                  <div
                    className={`${lockedRoleCardClassName} ${registerControlVarsClassName} ${registerOptionButtonClassName}`}
                    aria-label={t(roleLabelKey(lockedRole))}
                  >
                    <span className="relative z-[1] flex min-w-0 flex-1 items-center justify-center text-center leading-[inherit]">
                      {t(roleLabelKey(lockedRole))}
                    </span>
                  </div>
                )}
              </section>

              <section
                className={`${registerStepClassName} register-step--field register-step--email ${getRegisterStepClassName(emailStepIndex)}`}
              >
                <div className="register-input-shell register-input-shell--mid relative flex justify-center">
                  <GlowField className={cn(inputBaseClassName, inputClassName, pinInputClassName, registerCredentialFieldClassName)}>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className={cn(inputClassName, pinInputClassName, "ui-glow-control", fieldErrors.email ? "text-transparent caret-[color:var(--glass-surface-text,#f2f2f2)] light:caret-[color:var(--input-text)]" : "")}
                      placeholder={fieldErrors.email ? "" : t("auth.email_placeholder")}
                      value={form.email}
                      onChange={handleChange}
                      required
                      inputMode="email"
                      autoComplete="email"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      aria-invalid={fieldErrors.email ? "true" : "false"}
                      aria-describedby={fieldErrors.email ? emailErrorId : undefined}
                    />
                    {fieldErrors.email ? (
                      <span
                        id={emailErrorId}
                        className={registerFieldHintClassName}
                      >
                        {fieldErrors.email}
                      </span>
                    ) : null}
                  </GlowField>
                </div>
              </section>

              <section
                className={`${registerStepClassName} register-step--field register-step--pin ${getRegisterStepClassName(pinStepIndex)}`}
              >
                <div className="register-input-shell register-input-shell--mid relative flex justify-center">
                  <GlowField className={cn(inputBaseClassName, inputClassName, pinInputClassName, registerCredentialFieldClassName)}>
                    <input
                      type="text"
                      id="pin"
                      name="pin"
                      className={cn(inputClassName, pinInputClassName, "ui-glow-control", fieldErrors.pin ? "text-transparent caret-[color:var(--glass-surface-text,#f2f2f2)] light:caret-[color:var(--input-text)]" : "")}
                      placeholder={
                        fieldErrors.pin
                          ? ""
                          : t("auth.register.pin_placeholder", {
                              min: PIN_MIN,
                              max: PIN_MAX,
                            })
                      }
                      value={form.pin}
                      onChange={handleChange}
                      required
                      minLength={PIN_MIN}
                      maxLength={PIN_MAX}
                      autoComplete="new-password"
                      inputMode="numeric"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      pattern={`\\d{${PIN_MIN},${PIN_MAX}}`}
                      aria-invalid={fieldErrors.pin ? "true" : "false"}
                      aria-describedby={fieldErrors.pin ? pinErrorId : undefined}
                    />
                    {fieldErrors.pin ? (
                      <span id={pinErrorId} className={registerFieldHintClassName}>
                        {fieldErrors.pin}
                      </span>
                    ) : null}
                  </GlowField>
                </div>
              </section>

              <section
                className={`${registerStepClassName} ${getRegisterStepClassName(agreementStepIndex)}`}
              >
                <OptionCard
                  type="checkbox"
                  name="agree"
                  checked={form.agree}
                  onChange={handleChange}
                  fitTextLines={2}
                  fitTextMinPx={15}
                  fitTextMaxPx={19}
                  className={`register-agree-card ${checkboxCardClassName} ${registerControlVarsClassName} ${registerOptionButtonClassName}`}
                >
                  <RichText
                    value={t("auth.register.agreement")}
                    replacements={{
                      terms: {
                        open: `<a class="${registerPolicyLinkClassName}" href="${localizePath("/kasutustingimused", locale)}">`,
                        close: "</a>",
                      },
                      privacy: {
                        open: `<a class="${registerPolicyLinkClassName}" href="${localizePath("/privaatsustingimused", locale)}">`,
                        close: "</a>",
                      },
                    }}
                  />
                </OptionCard>
              </section>

              <section
                className={`${registerStepClassName} ${getRegisterStepClassName(guideStepIndex)}`}
              >
                <OptionCard
                  type="checkbox"
                  name="guideAck"
                  checked={form.guideAck}
                  onChange={handleChange}
                  fitTextLines={2}
                  fitTextMinPx={15}
                  fitTextMaxPx={19}
                  className={`register-guide-card ${checkboxCardClassName} ${registerControlVarsClassName} ${registerOptionButtonClassName}`}
                >
                  <RichText
                    value={t("auth.register.guide_ack")}
                    replacements={{
                      guide: {
                        open: `<a class="${registerPolicyLinkClassName}" href="${localizePath("/kasutusjuhend", locale)}">`,
                        close: "</a>",
                      },
                      guide1: {
                        open: `<a class="${registerPolicyLinkClassName}" href="${localizePath("/kasutusjuhend", locale)}">`,
                        close: "</a>",
                      },
                      guide2: {
                        open: `<a class="${registerPolicyLinkClassName}" href="${localizePath("/kasutusjuhend", locale)}">`,
                        close: "</a>",
                      },
                    }}
                  />
                </OptionCard>
              </section>

              {isProfessionalUser ? (
                <section
                  className={`${registerStepClassName} ${getRegisterStepClassName(workerStepIndex)}`}
                >
                  <div className="flex flex-col gap-[0.95rem]">
                    <OptionCard
                      type="checkbox"
                      name="workerUseOrg"
                      checked={hasConfirmedFramework}
                      onChange={(e) => handleWorkerUseToggle(e.target.checked)}
                      fitTextLines={2}
                      fitTextMinPx={15}
                      fitTextMaxPx={19}
                      className={`w-full min-[769px]:w-[calc(100%-clamp(1.55rem,calc(var(--ring-diameter,52rem)/22),2.35rem))] min-[769px]:mx-auto ${checkboxCardClassName} ${registerControlVarsClassName} ${registerOptionButtonClassName}`}
                    >
                      {t("auth.register.worker_use_org")}
                    </OptionCard>
                  </div>
                </section>
              ) : null}

                  <section
                    className={`${registerStepClassName} ${getRegisterStepClassName(submitStepIndex)}`}
                  >
                    {!isRegistrationOpen && (
                      <div
                        role="status"
                        className="w-full rounded-[0.95rem] border border-[rgba(251,191,36,0.45)] bg-[rgba(251,191,36,0.12)] px-[0.95rem] py-[0.78rem] text-[color:#fde68a] light:text-[color:#92400e] text-[1.08rem] leading-[1.4]"
                      >
                        {t("auth.register.closed_notice")}
                      </div>
                    )}
                    {error && (
                      <div
                        role="alert"
                        className="register-alert w-full rounded-[0.95rem] border border-[rgba(248,113,113,0.45)] bg-[rgba(248,113,113,0.12)] px-[0.95rem] py-[0.78rem] text-[color:#fca5a5] text-[1.12rem] leading-[1.4]"
                      >
                        {error}
                      </div>
                    )}
                    <div
                      className="register-submit-wrap flex justify-center"
                    >
                      <Button
                        type="submit"
                        variant="primary"
                        className={registerButtonClassName}
                        disabled={submitting || !isRegistrationOpen}
                      >
                        <span className="register-submit-label">
                          {t("auth.register.submit")}
                        </span>
                      </Button>
                    </div>
                  </section>
                </form>
              </div>
            </div>
          </>
        )}
      </GlassRing>
    </section>
  );
}
