"use client";

import { useState, useRef, useEffect, useLayoutEffect, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import LoginModal from "@/components/LoginModal";
import { useAccessibility } from "@/components/accessibility/AccessibilityProvider";
import { useEffectiveRole } from "@/components/auth/useEffectiveRole";
import { useI18n } from "@/components/i18n/I18nProvider";
import ChatMessageItem from "./chat/ChatMessageItem";
import { useSpeech } from "../chat/hooks/useSpeech";
import { useChatStream } from "@/components/chat/hooks/useChatStream";
import { useChatConversationState } from "../chat/hooks/useChatConversationState";
import { prettifyFileName } from "@/components/chat/utils/sources";
import { useChatInputHoleMask } from "@/components/chat/hooks/useChatInputHoleMask";
import { useConversationSources } from "@/components/chat/hooks/useConversationSources";
import { useChatAnalysisController } from "@/components/chat/hooks/useChatAnalysisController";
import HelpListingsPanel from "@/components/chat/HelpListingsPanel";
import SelectedListingContext from "@/components/chat/SelectedListingContext";
import { getHelpUiText } from "@/components/chat/helpUiText";
import ModalConfirm from "@/components/ui/ModalConfirm";
import { pushWithTransition } from "@/lib/routeTransition";
import { clearStaleScrollLock } from "@/lib/scrollLock";
import { cn } from "@/components/ui/cn";
import { resolveChatLayoutVars } from "./chat/chatLayoutVars";
import { useChatMobileRail } from "./chat/hooks/useChatMobileRail";
import { useChatProfileRoll } from "./chat/hooks/useChatProfileRoll";
import { useChatRoomMode, useSyncRoomAssistantMessages } from "./chat/hooks/useChatRoomMode";
import ChatBodyView from "./chat/ChatBodyView";
import { localizePath, stripLocaleFromPath } from "@/lib/localizePath";
import { buildRoomChatPath } from "@/lib/roomPath";
import { isActiveDocumentWorkflowState } from "@/lib/chat/documentWorkflowState";
import { isActiveHelpWorkflowState } from "@/lib/help/workflowState";
import { getCompactRoomTitle } from "./chat/view/ChatNotices";
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
const MOBILE_KEYBOARD_OPEN_THRESHOLD = 88;
const MOBILE_KEYBOARD_CLOSE_THRESHOLD = 56;
const MOBILE_KEYBOARD_BLUR_SETTLE_MS = 220;
const MOBILE_KEYBOARD_BASELINE_CAPTURE_MS = 320;
const MOBILE_KEYBOARD_OPEN_STABLE_MS = 96;
const PANEL_TILT_CLOSE_MS = 540;
const CHAT_HELP_PANEL_STORAGE_KEY = "__SOTSIAALAI_CHAT_HELP_PANEL__";
const CHAT_HELP_PANEL_SOURCE_STORAGE_KEY = "__SOTSIAALAI_CHAT_HELP_PANEL_SOURCE__";
const CHAT_EMPTY_INTRO_SEEN_KEY_PREFIX = "sotsiaalai:chat:empty-intro-seen";
const HOME_RETURN_FROM_CHAT_KEY = "sotsiaalai:home-return-from-chat";
const CAREER_WORKFLOW_ENABLED =
  String(process.env.NEXT_PUBLIC_ENABLE_CAREER_WORKFLOW || "")
    .trim()
    .toLowerCase() === "true";
const ACTIVE_CHAT_WORKFLOW_VALUES = Object.freeze([
  "default",
  "career",
  "help_request",
  "help_offer"
]);

function readChatSurfaceModeFromDom() {
  if (typeof document === "undefined") return null;
  const html = document.documentElement;
  const highContrast = html.getAttribute("data-contrast") === "hc";
  const lightTheme = html.classList.contains("theme-light");
  const midTheme = html.classList.contains("theme-mid");
  const isLightTheme = !highContrast && (lightTheme || midTheme);

  return {
    isLightTheme,
    usesInputHoleSurface: highContrast || !isLightTheme,
    signature: `${highContrast ? "hc" : "normal"}|${lightTheme ? "light" : ""}|${midTheme ? "mid" : ""}|${html.classList.contains("theme-night") ? "night" : ""}`
  };
}

function createConversationId() {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return String(Date.now());
}

function createEmptyListingsPanelState() {
  return {
    items: [],
    nextOffset: null,
    loading: false,
    error: ""
  };
}

function createEmptySelectedListingState() {
  return {
    loading: false,
    error: "",
    listing: null,
    isOwn: false,
    connectOptions: [],
    selectedConnectListingId: "",
    edit: null,
    busyAction: "",
    deleteConfirmOpen: false
  };
}

function normalizeActiveWorkflow(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "career" && !CAREER_WORKFLOW_ENABLED) {
    return "default";
  }
  return ACTIVE_CHAT_WORKFLOW_VALUES.includes(normalized) ? normalized : "default";
}

function getEmptyIntroMessage(t, workflow) {
  if (workflow === "help_request") return t("chat.empty_intro_help_request");
  if (workflow === "help_offer") return t("chat.empty_intro_help_offer");
  return t("chat.empty_intro");
}

function getWorkflowModeLabel(t, workflow) {
  if (workflow === "career") {
    const value = t("chat.tools.career_mode");
    return value && value !== "chat.tools.career_mode"
      ? value
      : "Karjäärinõustamine";
  }
  if (workflow === "help_request") {
    const value = t("chat.tools.help_request_mode");
    return value && value !== "chat.tools.help_request_mode"
      ? value
      : "Abisoov";
  }
  if (workflow === "help_offer") {
    const value = t("chat.tools.help_offer_mode");
    return value && value !== "chat.tools.help_offer_mode"
      ? value
      : "Abipakkumine";
  }
  return t("chat.tools.info_mode");
}

function getEmptyIntroSeenStorageKey({
  convId,
  userId,
  userRole,
  locale
}) {
  if (!convId) return null;
  const uid = userId || "anon";
  const role = (userRole || "CLIENT").toLowerCase();
  const loc = locale || "et";
  return `${CHAT_EMPTY_INTRO_SEEN_KEY_PREFIX}:${uid}:${role}:${loc}:${convId}`;
}

function getCareerSessionStorageKey({
  convId,
  userId,
  userRole,
  locale
}) {
  if (!convId) return null;
  const uid = userId || "anon";
  const role = (userRole || "CLIENT").toLowerCase();
  const loc = locale || "et";
  return `sotsiaalai:career-session:${uid}:${role}:${loc}:${convId}`;
}

function getConversationRenderLimitStorageKey({
  convId,
  userId,
  userRole,
  locale
}) {
  if (!convId) return null;
  const uid = userId || "anon";
  const role = (userRole || "CLIENT").toLowerCase();
  const loc = locale || "et";
  return `sotsiaalai:chat:render-limit:${uid}:${role}:${loc}:${convId}`;
}

function readStoredRenderLimit(storageKey) {
  if (!storageKey || typeof window === "undefined") return null;
  try {
    const rawValue = window.sessionStorage.getItem(storageKey);
    const parsed = Number.parseInt(String(rawValue || ""), 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  } catch {
    return null;
  }
}

function writeStoredRenderLimit(storageKey, value) {
  if (!storageKey || typeof window === "undefined") return;
  const nextValue = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(nextValue) || nextValue <= 0) return;
  try {
    window.sessionStorage.setItem(storageKey, String(nextValue));
  } catch {}
}

function isEditableElement(node) {
  if (!(node instanceof Element)) return false;
  const tag = node.tagName;
  return tag === "TEXTAREA" || tag === "INPUT" || node.isContentEditable;
}

function formatCareerAnswerForDisplay(question, answer, answerLabel = null) {
  if (typeof answerLabel === "string" && answerLabel.trim()) {
    return answerLabel.trim();
  }

  if (question?.type === "boolean") {
    return answer === true ? "Jah" : answer === false ? "Ei" : "";
  }

  if (Array.isArray(answer)) {
    return answer
      .map((item) => String(item || "").trim())
      .filter(Boolean)
      .join(", ");
  }

  if (typeof answer === "string") {
    return answer.trim();
  }

  if (typeof answer === "number") {
    return String(answer);
  }

  return "";
}

function parseCareerBooleanAnswer(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return null;

  if (["jah", "jaa", "ja", "yes", "y", "true", "1", "да", "ага"].includes(normalized)) {
    return true;
  }

  if (["ei", "ei.", "eip", "no", "n", "false", "0", "нет", "не"].includes(normalized)) {
    return false;
  }

  return null;
}

function inferCareerBooleanFromContext(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return null;

  if (/(ei sobi|pole sobiv|ei saa|ei ole voimalik|ei ole võimalik|kindlasti ei)/i.test(normalized)) {
    return false;
  }

  if (/(sobib|saan|voin|võin|olen valmis|on võimalik|saaksin|liigun|liikuda saan|kaugtöö sobib)/i.test(normalized)) {
    return true;
  }

  return null;
}

export default function ChatBody({
  roomId = null,
  onBackHome = null,
  embedded = false,
  requestLoginOnOpen = false,
  emailVerifiedEntry = false
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    data: session,
    status
  } = useSession();
  const { effectiveRole } = useEffectiveRole();
  const {
    t,
    locale
  } = useI18n();
  const {
    prefs
  } = useAccessibility();
  const prefsIsLightTheme = prefs?.theme === "light" || prefs?.theme === "light-mono" || prefs?.theme === "mid";
  const prefsUsesInputHoleSurface = prefs?.contrast === "hc" || !prefsIsLightTheme;
  const [domChatSurfaceMode, setDomChatSurfaceMode] = useState(null);
  const isLightTheme = domChatSurfaceMode?.isLightTheme ?? prefsIsLightTheme;
  const usesInputHoleSurface = domChatSurfaceMode?.usesInputHoleSurface ?? prefsUsesInputHoleSurface;
  const extendedLabel = t("chat.analysis.extended_label");
  const contextHint = t("chat.upload.context_hint");
  const aiNote = t("chat.ai_toggle.note");
  const crisisText = t("chat.crisis.notice");
  const sessionUserId = session?.user?.id;
  const sessionUserRole = effectiveRole;
  const userRole = effectiveRole;
  const voiceEnabled = Boolean(session?.user?.isAdmin || session?.subActive);
  const careerAccessReady = status !== "loading";
  const hasCareerAccess = Boolean(session?.user?.isAdmin || session?.subActive);
  const careerModeLocked = careerAccessReady && !hasCareerAccess;
  const [inputFocused, setInputFocused] = useState(false);
  const {
    isMobile,
    mobileRailVisible,
    mobileRailInteractionLocked,
    showMobileRail
  } = useChatMobileRail();
  const [errorBanner, setErrorBanner] = useState(null);
  const [isCrisis, setIsCrisis] = useState(false);
  const [activeWorkflow, setActiveWorkflow] = useState("default");
  const [careerProfile, setCareerProfile] = useState(null);
  const [careerRuntime, setCareerRuntime] = useState(null);
  const [careerLastResult, setCareerLastResult] = useState(null);
  const [careerCurrentState, setCareerCurrentState] = useState(null);
  const [careerLoading, setCareerLoading] = useState(false);
  const [showSourcesPanel, setShowSourcesPanel] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const autoLoginHandledRef = useRef(false);
  const verifyEntryUrlClearedRef = useRef(false);
  const helpUi = useMemo(() => getHelpUiText(t), [t]);
  const effectiveRoomId = useMemo(() => {
    const roomIdFromSearch = typeof searchParams?.get === "function"
      ? String(searchParams.get("roomId") || "").trim()
      : "";
    return roomIdFromSearch || roomId || null;
  }, [roomId, searchParams]);
  const initialIsHelpMatchRoom = useMemo(() => {
    if (typeof searchParams?.get !== "function") return false;
    return String(searchParams.get("roomKind") || "").trim().toLowerCase() === "help-match";
  }, [searchParams]);
  const [activeListingsPanel, setActiveListingsPanel] = useState(null);
  const [listingsPanelClosing, setListingsPanelClosing] = useState(false);
  const [listingsPanelState, setListingsPanelState] = useState(() => createEmptyListingsPanelState());
  const [selectedListingState, setSelectedListingState] = useState(() => createEmptySelectedListingState());
  const [isEntering, setIsEntering] = useState(false);
  const [isGeneratingForSave, setIsGeneratingForSave] = useState(false);
  const [analysisPanelWidth, setAnalysisPanelWidth] = useState(null);
  const [hasHydrated, setHasHydrated] = useState(false);
  const viewportIsMobile = hasHydrated ? isMobile : false;
  const [layoutTransitionsReady, setLayoutTransitionsReady] = useState(false);
  const listingsPanelCloseTimerRef = useRef(null);
  const careerTurnRequestRef = useRef(0);
  const maskRefreshRef = useRef(null);
  const chatWindowRef = useRef(null);
  const chatContainerRef = useRef(null);
  const isGeneratingRef = useRef(false);
  const renderLimitInitializedConvRef = useRef(null);
  const blurTimerRef = useRef(0);
  const inputRef = useRef(null);
  const composerDraftApiRef = useRef(null);
  const inputRowRef = useRef(null);
  const inputBarRef = useRef(null);
  const maskLayerRef = useRef(null);
  const sourcesButtonRef = useRef(null);
  const backTapGuardRef = useRef(0);
  const processedCareerUploadRef = useRef("");
  const refreshMask = useCallback((options = {}) => {
    const immediate = options.immediate === true;
    const mobileImmediate = options.mobileImmediate === true;
    maskRefreshRef.current?.({
      ...options,
      immediate: immediate && (!isMobile || mobileImmediate)
    });
  }, [isMobile]);
  const {
    isRoomMode,
    roomMessages,
    roomBlocked,
    roomAuthRequired,
    roomTitle,
    roomRole,
    isHelpMatchRoom,
    sendToAssistant,
    setSendToAssistant,
    getVisibleMessages,
    onRoomMessageSent,
    onAssistantMessageCreated,
    pendingRoomAiIdsRef,
    seenRoomAiIdsRef
  } = useChatRoomMode({
    roomId: effectiveRoomId,
    sessionUserId,
    t,
    initialIsHelpMatchRoom
  });
  const allowAssistantForward = !isHelpMatchRoom;
  const hideComposerTools = isHelpMatchRoom;
  useEffect(() => {
    clearStaleScrollLock();
  }, []);
  const clearVerifyEntryUrl = useCallback(() => {
    if (!emailVerifiedEntry || typeof window === "undefined") return;
    const url = new URL(window.location.href);
    let changed = false;
    if (url.searchParams.has("login")) {
      url.searchParams.delete("login");
      changed = true;
    }
    if (url.searchParams.get("reason") === "email-verified") {
      url.searchParams.delete("reason");
      changed = true;
    }
    if (!changed) return;
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  }, [emailVerifiedEntry]);
  useEffect(() => {
    if (status === "loading") return;
    if (!requestLoginOnOpen || status !== "unauthenticated") return;
    if (autoLoginHandledRef.current) return;
    autoLoginHandledRef.current = true;
    setLoginOpen(true);
  }, [requestLoginOnOpen, status]);
  useEffect(() => {
    if (!emailVerifiedEntry || status !== "authenticated") return;
    if (verifyEntryUrlClearedRef.current) return;
    verifyEntryUrlClearedRef.current = true;
    clearVerifyEntryUrl();
  }, [clearVerifyEntryUrl, emailVerifiedEntry, status]);
  useIsomorphicLayoutEffect(() => {
    setHasHydrated(true);
  }, []);
  useIsomorphicLayoutEffect(() => {
    if (typeof document === "undefined" || typeof MutationObserver === "undefined") return;
    const html = document.documentElement;
    let lastSignature = "";
    const syncSurfaceMode = () => {
      const next = readChatSurfaceModeFromDom();
      if (!next || next.signature === lastSignature) return;
      lastSignature = next.signature;
      setDomChatSurfaceMode(next);
    };

    syncSurfaceMode();
    const observer = new MutationObserver(syncSurfaceMode);
    observer.observe(html, {
      attributes: true,
      attributeFilter: ["class", "data-contrast"]
    });
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const rafId = window.requestAnimationFrame(() => {
      setLayoutTransitionsReady(true);
    });
    return () => window.cancelAnimationFrame(rafId);
  }, []);
  useEffect(() => {
    return () => {
      if (listingsPanelCloseTimerRef.current && typeof window !== "undefined") {
        window.clearTimeout(listingsPanelCloseTimerRef.current);
        listingsPanelCloseTimerRef.current = null;
      }
    };
  }, []);
  useEffect(() => {
    const node = chatContainerRef.current;
    if (!node || typeof window === "undefined") return;
    if (!isMobile || !inputFocused) {
      node.style.setProperty("--chat-vk-offset", "0px");
      return;
    }
    const vv = window.visualViewport;
    let rafId = 0;
    let lastAppliedOffset = Number.NaN;
    let lastResolvedOffset = 0;
    let pendingOpenSince = 0;
    let pendingOpenOffset = 0;
    const now = () =>
      typeof performance !== "undefined" ? performance.now() : Date.now();
    const readViewportExtent = () =>
      vv ? Math.max(0, vv.height + vv.offsetTop) : Math.max(0, window.innerHeight);
    const readContainerHeight = () => {
      const h = node.getBoundingClientRect().height;
      return Math.max(0, Math.round(h || 0));
    };
    let baselineViewportExtent = readViewportExtent();
    let baselineContainerHeight = readContainerHeight();
    const baselineCaptureUntil = now() + MOBILE_KEYBOARD_BASELINE_CAPTURE_MS;
    const readKeyboardOffset = () => {
      const currentExtent = readViewportExtent();
      const currentContainerHeight = readContainerHeight();
      if (now() <= baselineCaptureUntil) {
        baselineViewportExtent = Math.max(baselineViewportExtent, currentExtent);
        if (currentContainerHeight > 0) {
          baselineContainerHeight = Math.max(
            baselineContainerHeight,
            currentContainerHeight
          );
        }
      }
      const rawOffset = Math.max(
        0,
        Math.round(baselineViewportExtent - currentExtent)
      );
      const layoutHandledOffset =
        baselineContainerHeight > 0 && currentContainerHeight > 0
          ? Math.max(0, baselineContainerHeight - currentContainerHeight)
          : 0;
      const compensatedOffset = Math.max(0, rawOffset - layoutHandledOffset);
      const maxReasonable = Math.round(
        Math.max(baselineViewportExtent, window.innerHeight || 0) * 0.55
      );
      return Math.min(compensatedOffset, Math.max(0, maxReasonable));
    };
    const resolveKeyboardOffset = () => {
      const rawOffset = readKeyboardOffset();
      if (lastResolvedOffset > 0) {
        if (rawOffset > MOBILE_KEYBOARD_CLOSE_THRESHOLD) {
          lastResolvedOffset = rawOffset;
          return lastResolvedOffset;
        }
        lastResolvedOffset = 0;
        pendingOpenSince = 0;
        pendingOpenOffset = 0;
        return lastResolvedOffset;
      }
      if (rawOffset <= MOBILE_KEYBOARD_OPEN_THRESHOLD) {
        pendingOpenSince = 0;
        pendingOpenOffset = 0;
        return 0;
      }
      const ts = now();
      if (!pendingOpenSince) {
        pendingOpenSince = ts;
        pendingOpenOffset = rawOffset;
        return 0;
      }
      pendingOpenOffset = Math.max(pendingOpenOffset, rawOffset);
      if (ts - pendingOpenSince < MOBILE_KEYBOARD_OPEN_STABLE_MS) {
        return 0;
      }
      lastResolvedOffset = pendingOpenOffset;
      pendingOpenSince = 0;
      pendingOpenOffset = 0;
      return lastResolvedOffset;
    };
    const applyKeyboardOffset = offset => {
      if (offset === lastAppliedOffset) return;
      lastAppliedOffset = offset;
      node.style.setProperty("--chat-vk-offset", `${offset}px`);
      refreshMask({
        immediate: true
      });
    };
    const updateKeyboardOffset = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        applyKeyboardOffset(resolveKeyboardOffset());
      });
    };
    updateKeyboardOffset();
    vv?.addEventListener("resize", updateKeyboardOffset);
    vv?.addEventListener("scroll", updateKeyboardOffset);
    window.addEventListener("orientationchange", updateKeyboardOffset);
    window.addEventListener("resize", updateKeyboardOffset);
    window.addEventListener("focusin", updateKeyboardOffset);
    window.addEventListener("focusout", updateKeyboardOffset);
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      vv?.removeEventListener("resize", updateKeyboardOffset);
      vv?.removeEventListener("scroll", updateKeyboardOffset);
      window.removeEventListener("orientationchange", updateKeyboardOffset);
      window.removeEventListener("resize", updateKeyboardOffset);
      window.removeEventListener("focusin", updateKeyboardOffset);
      window.removeEventListener("focusout", updateKeyboardOffset);
      node.style.setProperty("--chat-vk-offset", "0px");
    };
  }, [inputFocused, isMobile, refreshMask]);
  const MAX_RENDERED_MESSAGES = 80;
  const PAGE_SIZE = 80;
  const [renderLimit, setRenderLimit] = useState(MAX_RENDERED_MESSAGES);
  const handleInputBlur = useCallback(event => {
    const node = chatContainerRef.current;
    const next = event?.relatedTarget || document.activeElement;
    if (next && node?.contains(next)) return;
    if (blurTimerRef.current && typeof window !== "undefined") {
      window.clearTimeout(blurTimerRef.current);
      blurTimerRef.current = 0;
    }
    if (!isMobile) {
      blurTimerRef.current = window.setTimeout(() => {
        const active = document.activeElement;
        if (node?.contains(active)) return;
        setInputFocused(false);
        blurTimerRef.current = 0;
      }, 0);
      return;
    }
    blurTimerRef.current = window.setTimeout(() => {
      const active = document.activeElement;
      if (node?.contains(active) && isEditableElement(active)) return;
      const vv = window.visualViewport;
      const rawOffset = vv
        ? Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop))
        : 0;
      if (rawOffset > MOBILE_KEYBOARD_CLOSE_THRESHOLD) return;
      setInputFocused(false);
      blurTimerRef.current = 0;
    }, MOBILE_KEYBOARD_BLUR_SETTLE_MS);
  }, [isMobile]);
  const [composerHasDraft, setComposerHasDraft] = useState(false);
  const [emptyIntroSeenOverride, setEmptyIntroSeenOverride] = useState(false);
  const waitForComposerCollapse = useCallback(async () => {
    if (blurTimerRef.current && typeof window !== "undefined") {
      window.clearTimeout(blurTimerRef.current);
      blurTimerRef.current = 0;
    }
    const shouldWait =
      typeof window !== "undefined" &&
      !isMobile &&
      inputFocused;
    setInputFocused(false);
    try {
      inputRef.current?.blur?.();
    } catch {}
    if (!shouldWait) return;
    await new Promise(resolve => {
      const row = inputRowRef.current;
      const container = chatContainerRef.current;
      let settled = false;
      let timeoutId = 0;
      let handleTransitionEnd = null;
      let rowSettled = !row;
      let containerSettled = !container;
      function finish() {
        if (settled) return;
        settled = true;
        if (handleTransitionEnd) {
          row?.removeEventListener("transitionend", handleTransitionEnd);
          container?.removeEventListener("transitionend", handleTransitionEnd);
        }
        if (timeoutId) window.clearTimeout(timeoutId);
        resolve();
      }
      handleTransitionEnd = event => {
        if (
          event.target === row &&
          (event.propertyName === "top" ||
            event.propertyName === "margin-top" ||
            event.propertyName === "transform")
        ) {
          rowSettled = true;
          if (containerSettled) finish();
          return;
        }
        if (event.target !== container) return;
        if (
          event.propertyName === "border-top-left-radius" ||
          event.propertyName === "border-top-right-radius" ||
          event.propertyName === "border-bottom-left-radius" ||
          event.propertyName === "border-bottom-right-radius" ||
          event.propertyName === "width" ||
          event.propertyName === "min-width" ||
          event.propertyName === "max-width" ||
          event.propertyName === "height" ||
          event.propertyName === "min-height" ||
          event.propertyName === "max-height" ||
          event.propertyName === "inline-size" ||
          event.propertyName === "block-size" ||
          event.propertyName === "transform"
        ) {
          containerSettled = true;
          if (rowSettled) finish();
        }
      };
      row?.addEventListener("transitionend", handleTransitionEnd);
      container?.addEventListener("transitionend", handleTransitionEnd);
      timeoutId = window.setTimeout(finish, 760);
    });
    refreshMask({
      immediate: true,
      mobileImmediate: true
    });
  }, [inputFocused, isMobile, refreshMask]);
  const {
    profileOpen,
    openProfileDirect,
    closeProfile,
    toggleProfile
  } = useChatProfileRoll({
    embedded,
    router,
    locale,
    showSourcesPanel,
    setShowSourcesPanel,
    setInputFocused,
    inputRef,
    waitForComposerCollapse
  });
  useEffect(() => {
    if (!usesInputHoleSurface) return;
    refreshMask({
      immediate: true
    });
  }, [usesInputHoleSurface, refreshMask]);
  const {
    convId,
    setConvId,
    messages,
    setMessages,
    conversationLocalReady,
    appendMessage,
    mutateMessage,
    historyPayload,
    getLatestHelpWorkflowState
  } = useChatConversationState({
    isRoomMode,
    roomId: effectiveRoomId,
    isGenerating: isGeneratingForSave,
    setErrorBanner,
    setIsCrisis,
    t,
    locale,
    userId: sessionUserId,
    userRole: sessionUserRole,
    getVisibleMessages
  });
  const visibleMessages = useMemo(() => getVisibleMessages(messages), [getVisibleMessages, messages]);
  const latestHelpWorkflowState = useMemo(() => {
    for (let i = visibleMessages.length - 1; i >= 0; i -= 1) {
      const message = visibleMessages[i];
      if (message?.role !== "ai") continue;
      if (!message?.workflow || typeof message.workflow !== "object") continue;
      const helpState = message.workflow.help;
      if (!helpState || typeof helpState !== "object") continue;
      return helpState;
    }
    return null;
  }, [visibleMessages]);
  const renderLimitStorageKey = useMemo(() => getConversationRenderLimitStorageKey({
    convId,
    userId: sessionUserId,
    userRole: sessionUserRole,
    locale
  }), [convId, locale, sessionUserId, sessionUserRole]);
  const careerSessionHydratedRef = useRef(false);
  const careerSessionStorageKey = useMemo(() => getCareerSessionStorageKey({
    convId,
    userId: sessionUserId,
    userRole: sessionUserRole,
    locale
  }), [convId, locale, sessionUserId, sessionUserRole]);
  const emptyIntroSeenStorageKey = useMemo(() => getEmptyIntroSeenStorageKey({
    convId,
    userId: sessionUserId,
    userRole: sessionUserRole,
    locale
  }), [convId, locale, sessionUserId, sessionUserRole]);
  const emptyIntroSeenStored = useMemo(() => {
    if (!emptyIntroSeenStorageKey || typeof window === "undefined") return false;
    try {
      return window.sessionStorage.getItem(emptyIntroSeenStorageKey) === "1";
    } catch {
      return false;
    }
  }, [emptyIntroSeenStorageKey]);
  const emptyIntroSeen = emptyIntroSeenStored || emptyIntroSeenOverride;
  useEffect(() => {
    setComposerHasDraft(false);
  }, [convId, effectiveRoomId, locale, sessionUserId, sessionUserRole]);
  useEffect(() => {
    setEmptyIntroSeenOverride(false);
  }, [emptyIntroSeenStorageKey]);
  const resetCareerSession = useCallback(() => {
    setActiveWorkflow("default");
    setCareerProfile(null);
    setCareerRuntime(null);
    setCareerLastResult(null);
    setCareerCurrentState(null);
  }, []);
  useEffect(() => {
    if (!isRoomMode) return;
    setActiveWorkflow("default");
    setShowSourcesPanel(false);
    setActiveListingsPanel(null);
    setListingsPanelClosing(false);
    setListingsPanelState(createEmptyListingsPanelState());
    setSelectedListingState(createEmptySelectedListingState());
  }, [isRoomMode]);
  const goToSubscription = useCallback(() => {
    pushWithTransition(router, localizePath("/tellimus", locale));
  }, [locale, router]);
  useEffect(() => {
    if (!careerSessionStorageKey || typeof window === "undefined") return;
    careerSessionHydratedRef.current = false;
    try {
      const raw = window.sessionStorage.getItem(careerSessionStorageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      setActiveWorkflow(normalizeActiveWorkflow(parsed?.activeWorkflow));
      setCareerProfile(parsed?.careerProfile || null);
      setCareerRuntime(parsed?.careerRuntime || null);
      setCareerLastResult(parsed?.careerLastResult || null);
      setCareerCurrentState(parsed?.careerCurrentState || null);
    } catch {}
    finally {
      careerSessionHydratedRef.current = true;
    }
  }, [careerSessionStorageKey]);
  useEffect(() => {
    if (!careerAccessReady || hasCareerAccess) return;
    if (
      activeWorkflow !== "career" &&
      !careerProfile &&
      !careerRuntime &&
      !careerLastResult &&
      !careerCurrentState
    ) {
      return;
    }
    resetCareerSession();
  }, [
    activeWorkflow,
    careerAccessReady,
    careerCurrentState,
    careerLastResult,
    careerProfile,
    careerRuntime,
    hasCareerAccess,
    resetCareerSession
  ]);
  useEffect(() => {
    if (!careerSessionStorageKey || typeof window === "undefined") return;
    if (!careerSessionHydratedRef.current) return;
    try {
      if (
        activeWorkflow === "default" &&
        !careerProfile &&
        !careerRuntime &&
        !careerLastResult &&
        !careerCurrentState
      ) {
        window.sessionStorage.removeItem(careerSessionStorageKey);
        return;
      }
      window.sessionStorage.setItem(careerSessionStorageKey, JSON.stringify({
        activeWorkflow,
        careerProfile,
        careerRuntime,
        careerLastResult,
        careerCurrentState
      }));
    } catch {}
  }, [activeWorkflow, careerCurrentState, careerLastResult, careerProfile, careerRuntime, careerSessionStorageKey]);
  const renderedMessages = useMemo(() => {
    const canShowIntroImmediately = emptyIntroSeen;
    const draftAllowsIntro = canShowIntroImmediately
      ? !composerHasDraft
      : !composerHasDraft;
    const hasEmptyIntro =
      !isRoomMode &&
      conversationLocalReady &&
      draftAllowsIntro &&
      visibleMessages.length === 0;
    const emptyIntroText = getEmptyIntroMessage(t, activeWorkflow);
    const displayMessages = hasEmptyIntro
      ? [{
          id: "__chat-empty-intro__",
          role: "ai",
          text: emptyIntroText,
          aiVisible: true,
          typingEffect: !emptyIntroSeen,
          onTypingComplete: !emptyIntroSeen ? "emptyIntro" : null
        }]
      : visibleMessages;
    const n = displayMessages.length;
    if (n <= renderLimit) return displayMessages;
    return displayMessages.slice(n - renderLimit);
  }, [activeWorkflow, composerHasDraft, conversationLocalReady, emptyIntroSeen, isRoomMode, renderLimit, t, visibleMessages]);
  useEffect(() => {
    if (!convId || !conversationLocalReady) return;

    const initKey = `${convId}:${renderLimitStorageKey || "none"}`;

    if (renderLimitInitializedConvRef.current !== initKey) {
      renderLimitInitializedConvRef.current = initKey;
      const storedLimit = readStoredRenderLimit(renderLimitStorageKey);

      if (storedLimit != null) {
        setRenderLimit(Math.max(MAX_RENDERED_MESSAGES, storedLimit));
        return;
      }

      setRenderLimit(MAX_RENDERED_MESSAGES);
    }
  }, [convId, conversationLocalReady, renderLimitStorageKey]);
  const hiddenCount = useMemo(() => {
    const n = visibleMessages.length;
    return n > renderLimit ? n - renderLimit : 0;
  }, [visibleMessages.length, renderLimit]);
  const latestAiText = useMemo(() => {
    for (let i = visibleMessages.length - 1; i >= 0; i--) {
      const m = visibleMessages[i];
      if (m?.role === "ai" && m?.text) {
        const trimmed = String(m.text).trim();
        if (trimmed) return trimmed;
      }
    }
    return "";
  }, [visibleMessages]);
  const analysis = useChatAnalysisController({
    t,
    locale,
    sessionUserId,
    userRole: sessionUserRole,
    chatWindowRef,
    visibleMessagesCount: visibleMessages.length,
    isGeneratingRef
  });
  const careerUploadPreview = analysis.uploadPreview;
  const setCareerUploadPreview = analysis.setUploadPreview;
  const closeCareerAnalysisPanel = analysis.closeAnalysisPanel;
  useChatInputHoleMask({
    containerRef: chatContainerRef,
    inputRowRef,
    inputBarRef: inputBarRef,
    maskLayerRef,
    applyMaskImage: isMobile,
    enabled:
      (usesInputHoleSurface ||
        (analysis.analysisPanelMode === "overlay" &&
          analysis.showAnalysisPanel)) &&
      !profileOpen,
    applyMaskImage: true,
    refreshRef: maskRefreshRef
  });
  const {
    speechReady,
    isSpeaking,
    speakLatestReply,
    recording,
    recordingPulse,
    recordingError,
    handleMic
  } = useSpeech({
    locale,
    latestAiText,
    onAppendText: txt => composerDraftApiRef.current?.appendText?.(txt),
    onError: msg => setErrorBanner(msg),
    t
  });
  const canSpeakLatest = useMemo(() => {
    return Boolean(voiceEnabled && speechReady && latestAiText);
  }, [voiceEnabled, speechReady, latestAiText]);
  const revealOlder = useCallback(() => {
    const el = chatWindowRef.current;
    const prevScrollHeight = el ? el.scrollHeight : 0;
    const prevScrollTop = el ? el.scrollTop : 0;
    setRenderLimit(prev => {
      const total = visibleMessages.length;
      const nextLimit = Math.min(total, prev + PAGE_SIZE);
      writeStoredRenderLimit(renderLimitStorageKey, nextLimit);
      return nextLimit;
    });
    requestAnimationFrame(() => {
      if (!el) return;
      const newScrollHeight = el.scrollHeight;
      const delta = newScrollHeight - prevScrollHeight;
      el.scrollTop = prevScrollTop + delta;
    });
  }, [renderLimitStorageKey, visibleMessages.length]);
  const {
    conversationSources,
    hasConversationSources,
    sourcesPulse
  } = useConversationSources({
    messages,
    showSourcesPanel,
    uploadPreview: analysis.uploadPreview
  });
  const focusSourcesButton = useCallback(() => {
    setTimeout(() => {
      try {
        sourcesButtonRef.current?.focus?.();
      } catch {}
    }, 0);
  }, []);
  const toggleSourcesPanel = useCallback(() => {
    if (!hasConversationSources) return;
    setShowSourcesPanel(prev => {
      const next = !prev;
      if (!next) focusSourcesButton();
      return next;
    });
  }, [hasConversationSources, focusSourcesButton]);
  const closeSourcesPanel = useCallback(() => {
    setShowSourcesPanel(false);
  }, []);
  const singlePendingCareerQuestion = useMemo(() => {
    const pendingQuestions = Array.isArray(careerLastResult?.questions)
      ? careerLastResult.questions
      : Array.isArray(careerLastResult?.response?.questions)
      ? careerLastResult.response.questions
      : [];

    return activeWorkflow === "career" && pendingQuestions.length > 0
      ? pendingQuestions[0]
      : null;
  }, [activeWorkflow, careerLastResult]);
  const careerCvQuestionPending =
    singlePendingCareerQuestion?.id === "profile_cv_available";
  const keepCareerUploadFocus =
    activeWorkflow === "career" &&
    careerCvQuestionPending &&
    analysis.uploadBusy;
  const suppressCareerCvPreview =
    activeWorkflow === "career" &&
    careerCvQuestionPending &&
    Boolean(analysis.uploadPreview);
  const focusInput = useCallback(() => {
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);
  const scrollConversationToBottom = useCallback(() => {
    const scrollToLatest = () => {
      const node = chatWindowRef.current;
      if (!node) return;
      node.scrollTop = node.scrollHeight;
    };

    requestAnimationFrame(scrollToLatest);
    window.setTimeout(scrollToLatest, 60);
    window.setTimeout(scrollToLatest, 180);
  }, []);
  const updateComposerMobileReserve = useCallback(() => {
    const container = chatContainerRef.current;
    if (!container || typeof window === "undefined") return;
    if (!viewportIsMobile) {
      container.style.setProperty("--chat-composer-dynamic-extra", "0px");
      return;
    }

    const inputBar = inputBarRef.current;
    if (!inputBar) {
      container.style.setProperty("--chat-composer-dynamic-extra", "0px");
      return;
    }

    const computed = window.getComputedStyle(inputBar);
    const resolvedBaseHeight =
      Number.parseFloat(computed.getPropertyValue("--inputbar-h")) ||
      Number.parseFloat(computed.height) ||
      0;
    const currentHeight =
      inputBar.getBoundingClientRect().height || inputBar.offsetHeight || 0;
    const extraHeight = Math.max(0, currentHeight - resolvedBaseHeight);

    container.style.setProperty(
      "--chat-composer-dynamic-extra",
      `${Math.round(extraHeight)}px`
    );
  }, [viewportIsMobile]);
  useIsomorphicLayoutEffect(() => {
    const container = chatContainerRef.current;
    if (!container || typeof window === "undefined") return;

    let frameId = 0;
    let resizeObserver = null;
    const visualViewport = window.visualViewport;
    const scheduleUpdate = () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        updateComposerMobileReserve();
      });
    };

    scheduleUpdate();

    const inputBar = inputBarRef.current;
    if (typeof ResizeObserver !== "undefined" && inputBar) {
      resizeObserver = new ResizeObserver(scheduleUpdate);
      resizeObserver.observe(inputBar);
    }

    window.addEventListener("resize", scheduleUpdate);
    visualViewport?.addEventListener("resize", scheduleUpdate);

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
      resizeObserver?.disconnect?.();
      window.removeEventListener("resize", scheduleUpdate);
      visualViewport?.removeEventListener("resize", scheduleUpdate);
      container.style.removeProperty("--chat-composer-dynamic-extra");
    };
  }, [updateComposerMobileReserve]);
  const handleComposerLayoutChange = useCallback(() => {
    updateComposerMobileReserve();
    refreshMask({
      immediate: true,
      mobileImmediate: true,
    });

    if (!inputFocused && !keepCareerUploadFocus) return;

    const stickToBottom = () => {
      const node = chatWindowRef.current;
      if (!node) return;
      node.scrollTop = node.scrollHeight;
    };

    requestAnimationFrame(stickToBottom);
    window.setTimeout(stickToBottom, 32);
    window.setTimeout(stickToBottom, 120);
  }, [inputFocused, keepCareerUploadFocus, refreshMask, updateComposerMobileReserve]);
  const restoreComposerFocus = useCallback(() => {
    if (blurTimerRef.current && typeof window !== "undefined") {
      window.clearTimeout(blurTimerRef.current);
      blurTimerRef.current = 0;
    }

    const focusField = () => {
      const node = inputRef.current;
      if (!node) return;
      setInputFocused(true);
      try {
        if (!isMobile) {
          node.focus({
            preventScroll: true,
          });
          return;
        }
      } catch {}
      node.focus?.();
    };

    requestAnimationFrame(focusField);
    window.setTimeout(focusField, isMobile ? 140 : 0);
  }, [isMobile]);
  const patchListingCollections = useCallback((kind, listing, mode = "replace") => {
    setListingsPanelState((prev) => {
      const nextItems = prev.items.filter((item) => !(item.kind === kind && item.id === listing.id));
      if (mode === "delete") {
        return {
          ...prev,
          items: nextItems
        };
      }
      return {
        ...prev,
        items: [listing, ...nextItems]
      };
    });
    setSelectedListingState((prev) => {
      if (!prev.listing || prev.listing.id !== listing.id || prev.listing.kind !== kind) return prev;
      if (mode === "delete") {
        return {
          loading: false,
          error: "",
          listing: null,
          isOwn: false,
          connectOptions: [],
          selectedConnectListingId: "",
          edit: null,
          busyAction: ""
        };
      }
      return {
        ...prev,
        listing
      };
    });
  }, []);
  const loadListingsPanel = useCallback(async (panelConfig, options = {}) => {
    if (!panelConfig) return;
    const append = options?.append === true;
    const offset = append
      ? (Number.isFinite(Number(listingsPanelState.nextOffset)) ? Number(listingsPanelState.nextOffset) : 0)
      : 0;

    setListingsPanelState((prev) => ({
      ...prev,
      loading: true,
      error: append ? prev.error : ""
    }));

    try {
      const search = new URLSearchParams({
        kind: panelConfig.kind,
        scope: panelConfig.scope,
        locale,
        limit: "10"
      });
      if (offset > 0) search.set("offset", String(offset));
      if (panelConfig.status) search.set("status", panelConfig.status);
      const response = await fetch(`/api/help/listings?${search.toString()}`, {
        cache: "no-store"
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.ok === false) {
        throw new Error(helpUi.loadFailed);
      }
      setListingsPanelState((prev) => ({
        items: append ? [...prev.items, ...(payload?.items || [])] : (payload?.items || []),
        nextOffset: payload?.nextOffset ?? null,
        loading: false,
        error: ""
      }));
    } catch (error) {
      setListingsPanelState((prev) => ({
        ...prev,
        loading: false,
        error: error?.message || helpUi.loadFailed
      }));
    }
  }, [helpUi.loadFailed, listingsPanelState.nextOffset, locale]);
  const openListingsPanel = useCallback((panelConfig) => {
    setShowSourcesPanel(false);
    if (listingsPanelCloseTimerRef.current && typeof window !== "undefined") {
      window.clearTimeout(listingsPanelCloseTimerRef.current);
      listingsPanelCloseTimerRef.current = null;
    }
    setListingsPanelClosing(false);
    setActiveListingsPanel(panelConfig);
  }, []);
  const shouldReducePanelMotion = useCallback(() => {
    if (typeof window === "undefined") return false;
    try {
      if (document?.documentElement?.dataset?.reduceMotion === "1") return true;
      return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);
    } catch {
      return false;
    }
  }, []);
  const closeListingsPanel = useCallback((options = {}) => {
    const afterClose = typeof options.afterClose === "function" ? options.afterClose : null;
    const skipAnimation = options?.skipAnimation === true;
    if (listingsPanelClosing) return;
    if (listingsPanelCloseTimerRef.current && typeof window !== "undefined") {
      window.clearTimeout(listingsPanelCloseTimerRef.current);
      listingsPanelCloseTimerRef.current = null;
    }
    const finishClose = () => {
      setListingsPanelClosing(false);
      setActiveListingsPanel(null);
      setListingsPanelState({
        items: [],
        nextOffset: null,
        loading: false,
        error: ""
      });
      setSelectedListingState(createEmptySelectedListingState());
      afterClose?.();
    };
    if (skipAnimation || shouldReducePanelMotion()) {
      finishClose();
      return;
    }
    setListingsPanelClosing(true);
    listingsPanelCloseTimerRef.current = window.setTimeout(() => {
      finishClose();
      listingsPanelCloseTimerRef.current = null;
    }, PANEL_TILT_CLOSE_MS);
  }, [listingsPanelClosing, shouldReducePanelMotion]);
  const backToProfileFromListingsPanel = useCallback(() => {
    closeListingsPanel({
      afterClose: () => {
        void openProfileDirect();
      }
    });
  }, [closeListingsPanel, openProfileDirect]);
  const openSelectedListing = useCallback(async (item) => {
    const kind = String(item?.kind || "").trim().toLowerCase();
    const id = String(item?.id || "").trim();
    if (!kind || !id) return;
    setSelectedListingState((prev) => ({
      ...prev,
      loading: true,
      error: "",
      edit: null,
      busyAction: "",
      selectedConnectListingId: "",
      connectOptions: []
    }));
    try {
      const response = await fetch(`/api/help/listings/${encodeURIComponent(kind)}/${encodeURIComponent(id)}?locale=${encodeURIComponent(locale)}`, {
        cache: "no-store"
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.ok === false || !payload?.listing) {
        throw new Error(helpUi.detailLoadFailed);
      }

      let connectOptions = [];
      if (!payload.isOwn) {
        const oppositeKind = kind === "request" ? "offer" : "request";
        const optionsResponse = await fetch(`/api/help/listings?kind=${encodeURIComponent(oppositeKind)}&scope=mine&status=OPEN&locale=${encodeURIComponent(locale)}&limit=20`, {
          cache: "no-store"
        });
        const optionsPayload = await optionsResponse.json().catch(() => ({}));
        if (optionsResponse.ok && optionsPayload?.ok !== false) {
          connectOptions = Array.isArray(optionsPayload?.items) ? optionsPayload.items : [];
        }
      }
      const initialConnectListingId = connectOptions[0]?.id
        ? String(connectOptions[0].id).trim()
        : "";

      setSelectedListingState({
        loading: false,
        error: "",
        listing: payload.listing,
        isOwn: Boolean(payload.isOwn),
        connectOptions,
        selectedConnectListingId: initialConnectListingId,
        edit: null,
        busyAction: ""
      });
    } catch (error) {
      setSelectedListingState({
        loading: false,
        error: error?.message || helpUi.detailLoadFailed,
        listing: null,
        isOwn: false,
        connectOptions: [],
        selectedConnectListingId: "",
        edit: null,
        busyAction: ""
      });
    }
  }, [helpUi.detailLoadFailed, locale]);
  const dismissSelectedListing = useCallback(() => {
    setSelectedListingState({
      loading: false,
      error: "",
      listing: null,
      isOwn: false,
      connectOptions: [],
      selectedConnectListingId: "",
      edit: null,
      busyAction: ""
    });
  }, []);
  const startListingEdit = useCallback(() => {
    setSelectedListingState((prev) => {
      if (!prev.listing) return prev;
      return {
        ...prev,
        edit: {
          title: prev.listing.editableTitle || prev.listing.title || "",
          description: prev.listing.editableDescription || prev.listing.description || "",
          primaryCategoryCode: prev.listing.primaryCategoryCode || "",
          roleLabel: prev.listing.roleLabel || "",
          rawPlace: prev.listing.editableRawPlace || prev.listing.rawPlace || "",
          helpType: prev.listing.helpType || "",
          timeType: prev.listing.timeType || "",
          availabilityOrStart: prev.listing.editableAvailabilityOrStart || prev.listing.availabilityOrStart || "",
          compensationDetails: prev.listing.editableCompensationDetails || prev.listing.compensationDetails || "",
          conditions: prev.listing.editableConditions || prev.listing.conditions || "",
          targetGroupCodes: Array.isArray(prev.listing.targetGroupCodes) ? prev.listing.targetGroupCodes : [],
          targetGroups: Array.isArray(prev.listing.targetGroupLabels) ? prev.listing.targetGroupLabels.join(", ") : ""
        }
      };
    });
  }, []);
  const changeListingEditField = useCallback((field, value) => {
    setSelectedListingState((prev) => prev.edit ? {
      ...prev,
      edit: {
        ...prev.edit,
        [field]: value
      }
    } : prev);
  }, []);
  const saveListingEdit = useCallback(async (editPayload) => {
    const listing = selectedListingState.listing;
    if (!listing) return;
    setSelectedListingState((prev) => ({
      ...prev,
      busyAction: "save",
      error: ""
    }));
    try {
      const response = await fetch(`/api/help/listings/${encodeURIComponent(listing.kind)}/${encodeURIComponent(listing.id)}?locale=${encodeURIComponent(locale)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: editPayload?.title,
          description: editPayload?.description,
          primaryCategoryCode: editPayload?.primaryCategoryCode,
          roleLabel: editPayload?.roleLabel,
          rawPlace: editPayload?.rawPlace,
          helpType: editPayload?.helpType,
          timeType: editPayload?.timeType,
          availabilityOrStart: editPayload?.availabilityOrStart,
          compensationDetails: editPayload?.compensationDetails,
          conditions: editPayload?.conditions,
          targetGroupCodes: Array.isArray(editPayload?.targetGroupCodes) ? editPayload.targetGroupCodes : undefined,
          targetGroups: Array.isArray(editPayload?.targetGroups) ? editPayload.targetGroups : []
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.ok === false || !payload?.listing) {
        throw new Error(helpUi.updateFailed);
      }
      patchListingCollections(listing.kind, payload.listing);
      setSelectedListingState((prev) => ({
        ...prev,
        listing: payload.listing,
        edit: null,
        busyAction: "",
        error: ""
      }));
    } catch (error) {
      setSelectedListingState((prev) => ({
        ...prev,
        busyAction: "",
        error: error?.message || helpUi.updateFailed
      }));
    }
  }, [helpUi.updateFailed, locale, patchListingCollections, selectedListingState.listing]);
  const requestDeleteOwnedListing = useCallback(() => {
    setSelectedListingState((prev) => prev.listing ? {
      ...prev,
      deleteConfirmOpen: true,
      error: ""
    } : prev);
  }, []);
  const cancelDeleteOwnedListing = useCallback(() => {
    setSelectedListingState((prev) => ({
      ...prev,
      deleteConfirmOpen: false
    }));
  }, []);
  const deleteOwnedListing = useCallback(async () => {
    const listing = selectedListingState.listing;
    if (!listing) return;
    setSelectedListingState((prev) => ({
      ...prev,
      deleteConfirmOpen: false,
      busyAction: "delete",
      error: ""
    }));
    try {
      const response = await fetch(`/api/help/listings/${encodeURIComponent(listing.kind)}/${encodeURIComponent(listing.id)}`, {
        method: "DELETE"
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.ok === false) {
        throw new Error(helpUi.deleteFailed);
      }
      patchListingCollections(listing.kind, listing, "delete");
      dismissSelectedListing();
    } catch (error) {
      setSelectedListingState((prev) => ({
        ...prev,
        busyAction: "",
        error: error?.message || helpUi.deleteFailed
      }));
    }
  }, [dismissSelectedListing, helpUi.deleteFailed, patchListingCollections, selectedListingState.listing]);
  const connectSelectedListing = useCallback(async () => {
    const listing = selectedListingState.listing;
    const selectedConnectListingId = String(selectedListingState.selectedConnectListingId || "").trim();
    if (!listing || !selectedConnectListingId) return;
    setSelectedListingState((prev) => ({
      ...prev,
      busyAction: "connect",
      error: ""
    }));
    try {
      const payload = listing.kind === "request"
        ? { requestId: listing.id, offerId: selectedConnectListingId }
        : { requestId: selectedConnectListingId, offerId: listing.id };
      const response = await fetch("/api/help/matches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || body?.ok === false || !body?.match) {
        throw new Error(helpUi.connectFailed);
      }
      const roomTarget = body?.match?.roomId ? buildRoomChatPath(body.match.roomId, locale) : null;
      setSelectedListingState((prev) => ({
        ...prev,
        busyAction: ""
      }));
      if (roomTarget) {
        if (activeListingsPanel) {
          closeListingsPanel({
            skipAnimation: true,
            afterClose: () => {
              pushWithTransition(router, roomTarget);
            }
          });
          return;
        }
        dismissSelectedListing();
        requestAnimationFrame(() => {
          pushWithTransition(router, roomTarget);
        });
      }
    } catch (error) {
      setSelectedListingState((prev) => ({
        ...prev,
        busyAction: "",
        error: error?.message || helpUi.connectFailed
      }));
    }
  }, [activeListingsPanel, closeListingsPanel, dismissSelectedListing, helpUi.connectFailed, locale, router, selectedListingState.listing, selectedListingState.selectedConnectListingId]);
  const openGlobalRequestsPanel = useCallback(() => {
    openListingsPanel({
      key: "help_requests",
      side: "left",
      kind: "request",
      scope: "global",
      status: "OPEN",
      returnToProfile: false,
      title: helpUi.helpRequests,
      emptyText: helpUi.emptyGlobalRequests
    });
  }, [helpUi.emptyGlobalRequests, helpUi.helpRequests, openListingsPanel]);
  const openGlobalOffersPanel = useCallback(() => {
    openListingsPanel({
      key: "help_offers",
      side: "left",
      kind: "offer",
      scope: "global",
      status: "OPEN",
      returnToProfile: false,
      title: helpUi.helpOffers,
      emptyText: helpUi.emptyGlobalOffers
    });
  }, [helpUi.emptyGlobalOffers, helpUi.helpOffers, openListingsPanel]);
  const openMyRequestsPanel = useCallback((source = "chat") => {
    openListingsPanel({
      key: "help_requests",
      side: "left",
      kind: "request",
      scope: "global",
      status: "OPEN",
      returnToProfile: source === "profile",
      title: helpUi.helpRequests,
      emptyText: helpUi.emptyGlobalRequests
    });
  }, [helpUi.emptyGlobalRequests, helpUi.helpRequests, openListingsPanel]);
  const openMyOffersPanel = useCallback((source = "chat") => {
    openListingsPanel({
      key: "help_offers",
      side: "left",
      kind: "offer",
      scope: "global",
      status: "OPEN",
      returnToProfile: source === "profile",
      title: helpUi.helpOffers,
      emptyText: helpUi.emptyGlobalOffers
    });
  }, [helpUi.emptyGlobalOffers, helpUi.helpOffers, openListingsPanel]);
  const openHelpPanelByKey = useCallback((panelKey, source = "chat") => {
    if (panelKey === "my_help_requests") {
      openMyRequestsPanel(source);
      return;
    }
    if (panelKey === "my_help_offers") {
      openMyOffersPanel(source);
      return;
    }
    if (panelKey === "help_requests") {
      openGlobalRequestsPanel();
      return;
    }
    if (panelKey === "help_offers") {
      openGlobalOffersPanel();
    }
  }, [openGlobalOffersPanel, openGlobalRequestsPanel, openMyOffersPanel, openMyRequestsPanel]);
  useEffect(() => {
    const onOpenHelpListings = event => {
      const panelKey = String(event?.detail?.panelKey || "");
      const source = String(event?.detail?.source || "chat");
      openHelpPanelByKey(panelKey, source);
    };
    window.addEventListener("sotsiaalai:open-help-listings", onOpenHelpListings);
    return () => {
      window.removeEventListener("sotsiaalai:open-help-listings", onOpenHelpListings);
    };
  }, [openHelpPanelByKey]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    let panelKey = "";
    let source = "chat";
    try {
      panelKey = String(window.sessionStorage.getItem(CHAT_HELP_PANEL_STORAGE_KEY) || "");
      source = String(window.sessionStorage.getItem(CHAT_HELP_PANEL_SOURCE_STORAGE_KEY) || "chat");
      if (panelKey) {
        window.sessionStorage.removeItem(CHAT_HELP_PANEL_STORAGE_KEY);
        window.sessionStorage.removeItem(CHAT_HELP_PANEL_SOURCE_STORAGE_KEY);
      }
    } catch {
      panelKey = "";
      source = "chat";
    }
    if (!panelKey) return;
    openHelpPanelByKey(panelKey, source);
  }, [openHelpPanelByKey]);
  useEffect(() => {
    if (!activeListingsPanel) return;
    void loadListingsPanel(activeListingsPanel);
  }, [activeListingsPanel, loadListingsPanel]);
  useEffect(() => {
    const onRefreshHelpListings = () => {
      if (!activeListingsPanel) return;
      void loadListingsPanel(activeListingsPanel);
    };
    window.addEventListener("sotsiaalai:refresh-help-listings", onRefreshHelpListings);
    return () => {
      window.removeEventListener("sotsiaalai:refresh-help-listings", onRefreshHelpListings);
    };
  }, [activeListingsPanel, loadListingsPanel]);
  const requestConversationsRefresh = useCallback(() => {
    try {
      window.dispatchEvent(new CustomEvent("sotsiaalai:refresh-conversations"));
    } catch {}
  }, []);
  const helpFlowActive = useMemo(
    () => isActiveHelpWorkflowState(latestHelpWorkflowState),
    [latestHelpWorkflowState]
  );
  const handleAssistantMessageCreated = useCallback((messageId) => {
    onAssistantMessageCreated?.(messageId);
    if (!(activeWorkflow === "help_request" || activeWorkflow === "help_offer" || helpFlowActive)) return;
    if (messageId == null) return;

    const scrollToMessageStart = () => {
      const node = chatWindowRef.current;
      if (!(node instanceof HTMLElement)) return;
      const messageNode = node.querySelector(`[data-chat-message-id="${messageId}"]`);
      if (!(messageNode instanceof HTMLElement)) return;
      const nodeRect = node.getBoundingClientRect();
      const messageRect = messageNode.getBoundingClientRect();
      const offsetTop = messageRect.top - nodeRect.top;
      node.scrollTo({
        top: Math.max(0, node.scrollTop + offsetTop - 8),
        behavior: "auto"
      });
    };

    requestAnimationFrame(scrollToMessageStart);
    window.setTimeout(scrollToMessageStart, 80);
    window.setTimeout(scrollToMessageStart, 220);
  }, [activeWorkflow, helpFlowActive, onAssistantMessageCreated]);
  const {
    isGenerating: isChatGenerating,
    sendMessage,
    stop: stopChatStream
  } = useChatStream({
    convId,
    historyPayload,
    userRole,
    locale,
    activeWorkflow,
    helpWorkflowState: latestHelpWorkflowState,
    getLatestHelpWorkflowState,
    docOnlyMode: analysis.docOnlyMode,
    ephemeralChunks: analysis.ephemeralChunks,
    ephemeralSource: analysis.ephemeralSource,
    uploadPreview: analysis.uploadPreview,
    isRoomMode,
    roomId: effectiveRoomId,
    roomBlocked,
    roomAuthRequired,
    sendToAssistant: allowAssistantForward ? sendToAssistant : false,
    onRoomMessageSent,
    onAssistantMessageCreated: handleAssistantMessageCreated,
    t,
    setErrorBanner,
    setIsCrisis,
    requestConversationsRefresh,
    appendMessage,
    mutateMessage,
    onFocusInput: focusInput,
    onAuthRedirect: () => setLoginOpen(true)
  });
  const isGenerating = isChatGenerating || careerLoading;
  const stop = useCallback(() => {
    stopChatStream();
  }, [stopChatStream]);
  const startFreshConversation = useCallback((nextWorkflow = "default", options = {}) => {
    const {
      convId: requestedConvId = null,
      closeAnalysis = true
    } = options;
    const nextConvId = String(requestedConvId || "").trim() || createConversationId();

    stop();
    careerTurnRequestRef.current += 1;
    setCareerLoading(false);
    setErrorBanner(null);
    setIsCrisis(false);
    setShowSourcesPanel(false);
    setActiveListingsPanel(null);
    setListingsPanelClosing(false);
    setListingsPanelState(createEmptyListingsPanelState());
    setSelectedListingState(createEmptySelectedListingState());
    if (closeAnalysis) {
      analysis.closeAnalysisPanel?.();
    }
    resetCareerSession();
    setMessages([]);
    renderLimitInitializedConvRef.current = null;
    setRenderLimit(MAX_RENDERED_MESSAGES);
    setConvId(nextConvId);
    setActiveWorkflow(normalizeActiveWorkflow(nextWorkflow));

    if (typeof window !== "undefined") {
      try {
        window.sessionStorage.setItem("sotsiaalai:chat:convId", nextConvId);
      } catch {}
    }

    return nextConvId;
  }, [analysis, resetCareerSession, setConvId, setIsCrisis, setMessages, stop]);
  const runCareerTurn = useCallback(async (payload = {}, options = {}) => {
    const {
      echoUserText = false,
      userEchoText = null,
      activateWorkflow = true,
      restoreFocusAfterResponse = false,
    } = options;

    const rawText =
      payload?.userMessage ||
      payload?.message ||
      payload?.text ||
      null;

    const trimmedText = typeof rawText === "string" ? rawText.trim() : "";
    const echoText =
      typeof userEchoText === "string" && userEchoText.trim()
        ? userEchoText.trim()
        : trimmedText;

    if (echoUserText && echoText) {
      appendMessage({
        role: "user",
        text: echoText,
        aiVisible: true,
      });
      scrollConversationToBottom();
    }

    const requestId = careerTurnRequestRef.current + 1;
    careerTurnRequestRef.current = requestId;
    setCareerLoading(true);
    setErrorBanner(null);

    try {
      const response = await fetch("/api/career-agent/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const body = await response.json().catch(() => ({}));

      const isSubscriptionRequired =
        body?.messageKey === "api.common.subscription_required" ||
        body?.requireSubscription === true;
      if (isSubscriptionRequired) {
        goToSubscription();
        return false;
      }

      const redirectTarget =
        typeof body?.redirect === "string" ? body.redirect.trim() : "";
      if (body?.messageKey === "api.common.unauthorized" && redirectTarget) {
        pushWithTransition(router, redirectTarget);
        return false;
      }

      if (!response.ok || body?.ok === false || !body?.result) {
        throw new Error(body?.error || "Karjäärinõustamise käivitamine ebaõnnestus.");
      }

      const result = body.result;
      if (careerTurnRequestRef.current !== requestId) {
        return false;
      }

      if (activateWorkflow) {
        setActiveWorkflow("career");
      }

      setCareerProfile(result.profile || null);
      setCareerRuntime(result.runtime || null);
      setCareerLastResult(result);
      setCareerCurrentState(result.currentState || null);

      appendMessage({
        role: "ai",
        text: "",
        aiVisible: true,
        careerResponse: result.response || null,
        careerSecondaryResponse: result.secondaryResponse || null,
        careerDocumentStep: result.documentStep || null,
        careerGeneratedDocument: result.generatedDocument || null,
        workflow: {
          career: {
            state: result.currentState || null,
            mode: result.modeDecision?.mode || null,
          },
        },
      });
      scrollConversationToBottom();

      return true;
    } catch (error) {
      if (careerTurnRequestRef.current !== requestId) {
        return false;
      }
      const message =
        error?.message || "Karjäärinõustamise käivitamine ebaõnnestus.";
      setErrorBanner(message);
      appendMessage({
        role: "ai",
        text: `Karjäärinõustamise käivitamine ebaõnnestus.\n\n${message}`,
        aiVisible: true,
      });
      scrollConversationToBottom();
      return false;
    } finally {
      if (careerTurnRequestRef.current === requestId) {
        setCareerLoading(false);
        if (
          restoreFocusAfterResponse &&
          (!analysis.showAnalysisPanel || suppressCareerCvPreview)
        ) {
          restoreComposerFocus();
        }
      }
    }
  }, [analysis.showAnalysisPanel, appendMessage, goToSubscription, restoreComposerFocus, router, scrollConversationToBottom, suppressCareerCvPreview]);
  const buildCareerCvPayload = useCallback(() => {
    if (activeWorkflow !== "career" || !analysis.uploadPreview) {
      return {};
    }

    const fullText =
      typeof analysis.uploadPreview?.fullText === "string"
        ? analysis.uploadPreview.fullText.trim()
        : "";
    const preview =
      typeof analysis.uploadPreview?.preview === "string"
        ? analysis.uploadPreview.preview.trim()
        : "";
    const cvText = fullText || preview;

    if (!cvText) {
      return {};
    }

    const cvFileName = String(analysis.uploadPreview?.fileName || "").trim();

    return {
      cvText,
      ...(cvFileName ? { cvFileName } : {}),
    };
  }, [activeWorkflow, analysis.uploadPreview]);
  const buildCareerProfilePayload = useCallback(() => {
    const baseProfile =
      careerProfile && typeof careerProfile === "object"
        ? careerProfile
        : {};

    if (activeWorkflow !== "career" || !analysis.uploadPreview) {
      return baseProfile;
    }

    const sourceMode =
      baseProfile.sourceMode && typeof baseProfile.sourceMode === "object"
        ? baseProfile.sourceMode
        : {};
    const activeModes = Array.isArray(sourceMode.activeModes)
      ? sourceMode.activeModes
      : [];

    return {
      ...baseProfile,
      sourceMode: {
        ...sourceMode,
        activeModes: Array.from(new Set([...activeModes, "cv_upload"])),
        cvUploaded: true,
      },
    };
  }, [activeWorkflow, analysis.uploadPreview, careerProfile]);
  const buildCareerRuntimePayload = useCallback(() => {
    const baseRuntime = {
      ...(careerRuntime || {}),
      ...(careerCurrentState ? { currentState: careerCurrentState } : {}),
    };

    if (activeWorkflow !== "career" || !analysis.uploadPreview) {
      return baseRuntime;
    }

    return {
      ...baseRuntime,
      profileCvChecked: true,
      profileCvAvailable: true,
    };
  }, [activeWorkflow, analysis.uploadPreview, careerCurrentState, careerRuntime]);
  const handleCareerQuestionAnswer = useCallback((question, answer, answerLabel = null) => {
    const questionId = question?.id;
    if (!questionId) return false;

    const echoText = formatCareerAnswerForDisplay(question, answer, answerLabel);
    const shouldRestoreFocus =
      document.activeElement === inputRef.current || inputFocused;
    const shouldAttachCvPayload =
      questionId === "profile_cv_available" && answer === true;

    void runCareerTurn(
      {
        questionId,
        answer,
        profile: buildCareerProfilePayload(),
        runtime: buildCareerRuntimePayload(),
        ...(shouldAttachCvPayload ? buildCareerCvPayload() : {}),
      },
      {
        echoUserText: Boolean(echoText),
        userEchoText: echoText,
        activateWorkflow: true,
        restoreFocusAfterResponse: shouldRestoreFocus,
      }
    );

    return true;
  }, [buildCareerCvPayload, buildCareerProfilePayload, buildCareerRuntimePayload, inputFocused, runCareerTurn]);
  const activateCareerMode = useCallback(() => {
    if (!CAREER_WORKFLOW_ENABLED) return false;
    if (!careerAccessReady) return false;
    if (careerModeLocked) {
      goToSubscription();
      return false;
    }
    startFreshConversation("career");
    void runCareerTurn(
      {
        profile: {},
        runtime: {},
      },
      {
        echoUserText: false,
        activateWorkflow: true,
      }
    );
    return true;
  }, [careerAccessReady, careerModeLocked, goToSubscription, runCareerTurn, startFreshConversation]);
  const activateInfoMode = useCallback(() => {
    startFreshConversation("default");
    return true;
  }, [startFreshConversation]);
  const activateHelpRequestMode = useCallback(() => {
    startFreshConversation("help_request");
    return true;
  }, [startFreshConversation]);
  const activateHelpOfferMode = useCallback(() => {
    startFreshConversation("help_offer");
    return true;
  }, [startFreshConversation]);
  const handleSendMessage = useCallback(async (rawText) => {
    const text = String(rawText || "").trim();
    if (!text) return false;
    const shouldUseCareerWorkflow = activeWorkflow === "career";

    if (shouldUseCareerWorkflow) {
      if (!careerAccessReady) return false;
      if (careerModeLocked) {
        goToSubscription();
        return false;
      }
    }

    if (!shouldUseCareerWorkflow) {
      return sendMessage(text);
    }

    const singleQuestionAnswer =
      singlePendingCareerQuestion?.type === "boolean"
        ? parseCareerBooleanAnswer(text) ?? inferCareerBooleanFromContext(text)
        : text;
    const shouldAttachCvPayload =
      singlePendingCareerQuestion?.id === "profile_cv_available" &&
      singleQuestionAnswer === true;

    const payload =
      singlePendingCareerQuestion
        ? {
            questionId: singlePendingCareerQuestion?.id,
            answer: singleQuestionAnswer,
            profile: buildCareerProfilePayload(),
            runtime: buildCareerRuntimePayload(),
            ...(shouldAttachCvPayload ? buildCareerCvPayload() : {}),
          }
        : {
            userMessage: text,
            profile: buildCareerProfilePayload(),
            runtime: buildCareerRuntimePayload(),
          };

    const shouldRestoreFocus =
      document.activeElement === inputRef.current || inputFocused;

    return runCareerTurn(payload, {
      echoUserText: true,
      userEchoText: text,
      activateWorkflow: true,
      restoreFocusAfterResponse: shouldRestoreFocus,
    });
  }, [activeWorkflow, buildCareerCvPayload, buildCareerProfilePayload, buildCareerRuntimePayload, careerAccessReady, careerModeLocked, goToSubscription, inputFocused, runCareerTurn, sendMessage, singlePendingCareerQuestion]);
  useEffect(() => {
    if (activeWorkflow !== "career") {
      processedCareerUploadRef.current = "";
      return;
    }

    const uploadPreview = careerUploadPreview;
    if (!uploadPreview) return;

    if (singlePendingCareerQuestion?.id !== "profile_cv_available") {
      return;
    }

    const uploadKey = [
      String(uploadPreview?.fileName || "").trim(),
      Number(uploadPreview?.chunksCount || 0),
      Number(String(uploadPreview?.fullText || "").length),
    ].join(":");

    if (!uploadKey || processedCareerUploadRef.current === uploadKey) {
      return;
    }

    processedCareerUploadRef.current = uploadKey;

    const prettyFileName = prettifyFileName(uploadPreview?.fileName || "");
    const echoText = prettyFileName
      ? `Lisasin CV manusesse: ${prettyFileName}`
      : "Lisasin CV manusesse";

    void runCareerTurn(
      {
        questionId: "profile_cv_available",
        answer: true,
        profile: buildCareerProfilePayload(),
        runtime: buildCareerRuntimePayload(),
        ...buildCareerCvPayload(),
      },
      {
        echoUserText: true,
        userEchoText: echoText,
        activateWorkflow: true,
      }
    );
    setCareerUploadPreview?.(null);
    closeCareerAnalysisPanel?.();
  }, [activeWorkflow, buildCareerCvPayload, buildCareerProfilePayload, buildCareerRuntimePayload, careerUploadPreview, closeCareerAnalysisPanel, runCareerTurn, setCareerUploadPreview, singlePendingCareerQuestion]);
  const handleDraftStateChange = useCallback(({ ready: _ready, hasDraft }) => {
    setComposerHasDraft(Boolean(hasDraft));
  }, []);
  const handleEmptyIntroTyped = useCallback(() => {
    if (!emptyIntroSeenStorageKey) return;
    setEmptyIntroSeenOverride(true);
    try {
      window.sessionStorage.setItem(emptyIntroSeenStorageKey, "1");
    } catch {}
  }, [emptyIntroSeenStorageKey]);
  const messageItems = useMemo(() => {
    return renderedMessages.map(msg => <ChatMessageItem key={msg.id} messageId={msg.id} role={msg.role} text={msg.text} attachments={msg.attachments} cards={msg.cards} careerResponse={msg.careerResponse} careerSecondaryResponse={msg.careerSecondaryResponse} careerDocumentStep={msg.careerDocumentStep} careerGeneratedDocument={msg.careerGeneratedDocument} onCareerQuestionAnswer={handleCareerQuestionAnswer} aiVisible={!!msg.aiVisible} typingEffect={!!msg.typingEffect} onTypingComplete={msg.onTypingComplete === "emptyIntro" ? handleEmptyIntroTyped : undefined} authorName={msg.authorName} authorRole={msg.authorRole} isRoomMode={isRoomMode} t={t} />);
  }, [handleCareerQuestionAnswer, handleEmptyIntroTyped, isRoomMode, renderedMessages, t]);
  const modeNotice = activeWorkflow === "career" ? "Aktiivne režiim: karjäärinõustamine" : null;
  const activeModeLabel = useMemo(() => {
    return getWorkflowModeLabel(t, activeWorkflow);
  }, [activeWorkflow, t]);
  const roomModeLabel = useMemo(() => {
    if (!isRoomMode) return "";
    const compactRoomTitle = getCompactRoomTitle(roomTitle);
    if (compactRoomTitle) return compactRoomTitle;
    if (!isHelpMatchRoom) return "";
    if (roomRole === "OWNER") {
      const value = t("chat.tools.help_request_mode");
      return value && value !== "chat.tools.help_request_mode"
        ? value
        : "Abisoov";
    }
    if (roomRole === "MEMBER") {
      const value = t("chat.tools.help_offer_mode");
      return value && value !== "chat.tools.help_offer_mode"
        ? value
        : "Abipakkumine";
    }
    return "";
  }, [isHelpMatchRoom, isRoomMode, roomRole, roomTitle, t]);
  const hideRoomTitle = Boolean(roomModeLabel);
  const documentFlowActive = useMemo(() => {
    for (let i = visibleMessages.length - 1; i >= 0; i -= 1) {
      const message = visibleMessages[i];
      if (message?.role !== "ai") continue;
      if (!message?.workflow || typeof message.workflow !== "object") continue;
      if (!Object.prototype.hasOwnProperty.call(message.workflow, "document")) continue;
      return isActiveDocumentWorkflowState(message.workflow.document);
    }
    return false;
  }, [visibleMessages]);
  const hasSelectedListing = Boolean(selectedListingState.listing || selectedListingState.loading || selectedListingState.error);
  const selectedListingContextProps = hasSelectedListing ? {
    locale,
    loading: selectedListingState.loading,
    error: selectedListingState.error,
    listing: selectedListingState.listing,
    isOwn: selectedListingState.isOwn,
    editState: selectedListingState.edit,
    connectOptions: selectedListingState.connectOptions,
    selectedConnectListingId: selectedListingState.selectedConnectListingId,
    busyAction: selectedListingState.busyAction,
    onDismiss: dismissSelectedListing,
    onStartEdit: startListingEdit,
    onChangeEditField: changeListingEditField,
    onCancelEdit: () => setSelectedListingState((prev) => ({ ...prev, edit: null, busyAction: "" })),
    onSaveEdit: saveListingEdit,
    onDeleteListing: requestDeleteOwnedListing,
    onSelectConnectListing: (value) => setSelectedListingState((prev) => ({ ...prev, selectedConnectListingId: value })),
    onConnect: connectSelectedListing
  } : null;
  const inlineSelectedListingNode = activeListingsPanel && selectedListingContextProps ? (
    <SelectedListingContext
      {...selectedListingContextProps}
      inline
    />
  ) : null;
  const listingsPanelNode = activeListingsPanel ? (
    <HelpListingsPanel
      locale={locale}
      title={activeListingsPanel.title}
      side={activeListingsPanel.side}
      items={listingsPanelState.items}
      loading={listingsPanelState.loading}
      error={listingsPanelState.error}
      nextOffset={listingsPanelState.nextOffset}
      emptyText={activeListingsPanel.emptyText}
      isClosing={listingsPanelClosing}
      onClose={closeListingsPanel}
      onBackToProfile={activeListingsPanel?.returnToProfile ? backToProfileFromListingsPanel : undefined}
      onLoadMore={() => loadListingsPanel(activeListingsPanel, { append: true })}
      onSelectItem={openSelectedListing}
      detailNode={inlineSelectedListingNode}
    />
  ) : null;
  const selectedListingContextNode = !activeListingsPanel && selectedListingContextProps ? (
    <SelectedListingContext
      {...selectedListingContextProps}
    />
  ) : null;
  const deleteListingConfirmNode = selectedListingState.deleteConfirmOpen ? (
    <ModalConfirm
      message={helpUi.deleteConfirm}
      confirmLabel={t("buttons.delete")}
      cancelLabel={t("buttons.cancel")}
      confirmVariant="danger"
      cancelVariant="primary"
      onConfirm={deleteOwnedListing}
      onCancel={cancelDeleteOwnedListing}
      disabled={selectedListingState.busyAction === "delete"}
      overlayClassName="!z-[146] !bg-transparent !backdrop-blur-0 !backdrop-saturate-100"
      contentClassName="chat-analysis-upload-modal-card !w-[min(100%,20.5rem)] !max-w-[20.5rem]"
    />
  ) : null;
  const isStreamingAny = useMemo(() => isGenerating || visibleMessages.some(m => m.role === "ai" && m.isStreaming), [isGenerating, visibleMessages]);
  useEffect(() => {
    setIsGeneratingForSave(isGenerating);
  }, [isGenerating]);
  useEffect(() => {
    isGeneratingRef.current = isGenerating;
  }, [isGenerating]);
  useEffect(() => {
    function onSwitch(e) {
      const newId = e?.detail?.convId;
      if (!newId) return;
      startFreshConversation(e?.detail?.workflow, {
        convId: newId,
        closeAnalysis: false
      });
      try {
        window.dispatchEvent(new CustomEvent("sotsiaalai:toggle-conversations"));
      } catch {}
    }
    window.addEventListener("sotsiaalai:switch-conversation", onSwitch);
    return () => window.removeEventListener("sotsiaalai:switch-conversation", onSwitch);
  }, [startFreshConversation]);
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);
  useEffect(() => {
    if (!analysis.showAnalysisPanel || suppressCareerCvPreview || keepCareerUploadFocus) return;
    try {
      inputRef.current?.blur?.();
    } catch {}
    setInputFocused(false);
  }, [analysis.showAnalysisPanel, keepCareerUploadFocus, suppressCareerCvPreview]);
  useEffect(() => {
    if (!analysis.showAnalysisPanel || suppressCareerCvPreview) return;
    if (analysis.uploadPreview) return;
    if (typeof window === "undefined") return;
    const scroller = document.scrollingElement || document.documentElement;
    const y = scroller ? scroller.scrollTop : window.scrollY;
    const restore = () => {
      if (scroller) {
        scroller.scrollTop = y;
      } else {
        window.scrollTo({
          top: y,
          behavior: "auto"
        });
      }
    };
    requestAnimationFrame(restore);
    setTimeout(restore, 0);
    setTimeout(restore, 120);
    setTimeout(restore, 260);
  }, [analysis.showAnalysisPanel, analysis.uploadPreview, suppressCareerCvPreview]);
  useEffect(() => {
    if (!analysis.showAnalysisPanel || suppressCareerCvPreview) return;
    if (!analysis.uploadPreview) return;
    if (typeof window === "undefined") return;
    const ensureVisible = () => {
      const panel = analysis.analysisPanelRef?.current;
      if (!panel) return;
      const rect = panel.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight || 0;
      const margin = 24;
      const isAbove = rect.top < margin;
      const isBelow = rect.bottom > vh - margin;
      if (isAbove || isBelow) {
        panel.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    };
    requestAnimationFrame(ensureVisible);
    setTimeout(ensureVisible, 120);
  }, [analysis.showAnalysisPanel, analysis.uploadPreview, analysis.analysisPanelRef, suppressCareerCvPreview]);
  useSyncRoomAssistantMessages({
    isRoomMode,
    roomMessages,
    sessionUserId,
    setMessages,
    pendingRoomAiIdsRef,
    seenRoomAiIdsRef
  });
  useEffect(() => {
    if (!hasConversationSources && showSourcesPanel) {
      closeSourcesPanel();
    }
  }, [hasConversationSources, showSourcesPanel, closeSourcesPanel]);
  const scrollToBottom = useCallback(() => {
    const node = chatWindowRef.current;
    if (!node) return;
    node.scrollTo({
      top: node.scrollHeight,
      behavior: "smooth"
    });
  }, []);
  const handleBackHome = useCallback(async () => {
      const now = Date.now();
      if (now - backTapGuardRef.current < 320) return;
      backTapGuardRef.current = now;
      setShowSourcesPanel(false);
      await waitForComposerCollapse();
      if (typeof window !== "undefined") {
        try {
          window.sessionStorage.setItem(HOME_RETURN_FROM_CHAT_KEY, String(now));
        } catch {}
      }
      if (typeof onBackHome === "function") {
        onBackHome();
        return;
      }
    const homePath = localizePath("/", locale);
    window.requestAnimationFrame(() => {
      pushWithTransition(router, homePath, {
        glassRingTilt: "left",
        waitForGlassRingTilt: true,
        persistGlassRingTilt: false
      });
    });
    if (typeof window !== "undefined") {
      window.setTimeout(() => {
        if (stripLocaleFromPath(window.location.pathname).startsWith("/vestlus")) {
          window.location.assign(homePath);
        }
      }, 760);
    }
  }, [locale, onBackHome, router, setShowSourcesPanel, waitForComposerCollapse]);
  const handleComposerFocus = useCallback(() => {
    if (blurTimerRef.current && typeof window !== "undefined") {
      window.clearTimeout(blurTimerRef.current);
      blurTimerRef.current = 0;
    }
    setInputFocused(true);
    if (!isMobile) return;
    const keepConversationAtBottom = () => {
      const node = chatWindowRef.current;
      if (!node) return;
      node.scrollTop = node.scrollHeight;
    };
    requestAnimationFrame(keepConversationAtBottom);
    setTimeout(keepConversationAtBottom, 90);
    setTimeout(keepConversationAtBottom, 190);
  }, [isMobile]);
  useEffect(() => {
    return () => {
      if (blurTimerRef.current && typeof window !== "undefined") {
        window.clearTimeout(blurTimerRef.current);
        blurTimerRef.current = 0;
      }
    };
  }, []);
  const handleJumpToBottom = useCallback(() => {
    if (renderLimit > MAX_RENDERED_MESSAGES) {
      writeStoredRenderLimit(renderLimitStorageKey, MAX_RENDERED_MESSAGES);
      setRenderLimit(Math.min(visibleMessages.length, MAX_RENDERED_MESSAGES));
    }
    scrollToBottom();
  }, [renderLimit, renderLimitStorageKey, scrollToBottom, visibleMessages.length]);
  const hideOlder = useCallback(() => {
    const el = chatWindowRef.current;
    const prevScrollHeight = el ? el.scrollHeight : 0;
    const prevScrollTop = el ? el.scrollTop : 0;
    writeStoredRenderLimit(renderLimitStorageKey, MAX_RENDERED_MESSAGES);
    setRenderLimit(MAX_RENDERED_MESSAGES);
    requestAnimationFrame(() => {
      if (!el) return;
      const newScrollHeight = el.scrollHeight;
      const delta = newScrollHeight - prevScrollHeight;
      el.scrollTop = prevScrollTop + delta;
    });
  }, [renderLimitStorageKey]);
  useEffect(() => {
    if (prefs?.reduceMotion) {
      setIsEntering(false);
    }
  }, [prefs?.reduceMotion]);
  useEffect(() => {
    const node = chatContainerRef.current;
    if (!node) return;
    const update = () => {
      const rect = node.getBoundingClientRect();
      const next = Math.round(rect.width || 0);
      if (next > 0) setAnalysisPanelWidth(next);
    };
    update();
    window.addEventListener("resize", update);
    let ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(update);
      ro.observe(node);
    }
    return () => {
      window.removeEventListener("resize", update);
      ro?.disconnect?.();
    };
  }, []);
  const focusActive =
    (inputFocused || keepCareerUploadFocus) &&
    !profileOpen &&
    !viewportIsMobile;
  const handleChatWindowDoubleClick = useCallback(() => {
    setInputFocused(false);
    try {
      inputRef.current?.blur?.();
    } catch {}
  }, []);
  const chatVars = resolveChatLayoutVars({
    isMobile: viewportIsMobile,
    focusActive
  });
  const chatAnalysisPanelProps = {
    t,
    analysisPanelRef: analysis.analysisPanelRef,
    analysisPanelMode: analysis.analysisPanelMode,
    uploadPreview: analysis.uploadPreview,
    uploadedFilesCount: analysis.uploadedFilesCount,
    uploadedFileNames: analysis.uploadedFileNames,
    uploadFileLimit: analysis.uploadFileLimit,
    uploadBusy: analysis.uploadBusy,
    uploadError: analysis.uploadError,
    uploadUsage: analysis.uploadUsage,
    previewText: analysis.previewText,
    analysisCollapsed: analysis.analysisCollapsed,
    toggleAnalysisCollapse: analysis.toggleAnalysisCollapse,
    docOnlyMode: analysis.docOnlyMode,
    setDocOnlyMode: analysis.setDocOnlyMode,
    extendedLabel,
    contextHint,
    inputRef,
    chatWindowRef,
    isMobileViewport: viewportIsMobile,
    onPickFile: analysis.onPickFile,
    setUploadPreview: analysis.setUploadPreview,
    setUploadError: analysis.setUploadError,
    setEphemeralChunks: analysis.setEphemeralChunks,
    closeAnalysisPanel: analysis.closeAnalysisPanel,
    isGenerating,
    prettifyFileName
  };
  const useMaskedChatSurface =
    usesInputHoleSurface ||
    (analysis.analysisPanelMode === "overlay" &&
      analysis.showAnalysisPanel);
  const chatRingSurfaceStyle = useMaskedChatSurface
    ? {
        background: "transparent",
        backdropFilter: "none",
        WebkitBackdropFilter: "none"
      }
    : null;
  const chatRingStyle = chatRingSurfaceStyle
    ? { ...chatVars, ...chatRingSurfaceStyle }
    : chatVars;
  const chatContainerClassName = cn(
        "main-content glass-ring chat-container chat-container--round " +
        "glass-ring--desktop-stable " +
        "relative z-[21] min-h-0 [overflow-anchor:none] light:text-[#1f2937] " +
        "[--chat-input-hole-x:0px] [--chat-input-hole-y:100%] [--chat-input-hole-w:0px] [--chat-input-hole-h:0px] [--chat-input-hole-r:0px] [--chat-input-hole-side-h:0px] " +
        "[--glass-ring-surface-bg:var(--glass-surface-bg,rgba(0,0,0,0.25))] " +
        "[scrollbar-width:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0 " +
        "[&::-webkit-scrollbar-track]:bg-transparent " +
        "[&>:not(.chat-mask-layer):not(.chat-mask-tilt-fallback):not(.top-nav--chat):not(.chat-mobile-topnav):not(.chat-left-actions):not(.chat-right-actions):not(.chat-nav-overlay):not(.chat-back-button):not(.chat-analysis-overlay)]:z-[1] " +
        "gap-[0.4rem] pt-[var(--chat-pad-top)] pb-[var(--chat-pad-bottom)] " +
        "overflow-hidden [--ring-pad-top:0px] [--ring-pad-x:0px] [--ring-ui-reserve:var(--ring-ui-reserve-page)] " +
        "max-[768px]:gap-[0.35rem] max-[768px]:flex-[1_1_auto] max-[768px]:min-h-0 max-[768px]:mx-auto " +
        "min-[768px]:w-[var(--chat-diameter)] min-[768px]:h-[var(--chat-diameter)] " +
        "min-[768px]:[inline-size:var(--chat-diameter)] min-[768px]:[block-size:var(--chat-diameter)] " +
        "min-[768px]:min-w-[var(--chat-diameter)] min-[768px]:min-h-[var(--chat-diameter)] " +
        "min-[768px]:max-w-[var(--chat-diameter)] min-[768px]:max-h-[var(--chat-diameter)] " +
        "min-[768px]:flex-[0_0_auto] min-[768px]:self-center min-[768px]:aspect-square min-[768px]:rounded-full " +
        "min-[768px]:[&_.chat-left-actions]:z-[140] " +
        "min-[768px]:[&_.chat-left-actions]:left-[max(0px,calc(var(--hud-edge-left)+0.2rem))] " +
        "min-[768px]:[&_.top-nav--chat]:left-[max(0px,calc(var(--hud-edge-left)+0.9rem))] " +
        "min-[768px]:[&_.chat-right-actions]:right-[max(0px,calc(var(--hud-edge-right)+0.2rem))]",
      layoutTransitionsReady && !prefs?.reduceMotion
        ? "min-[768px]:[transition:border-top-left-radius_680ms_cubic-bezier(0.22,0.61,0.36,1),border-top-right-radius_680ms_cubic-bezier(0.22,0.61,0.36,1),border-bottom-left-radius_680ms_cubic-bezier(0.22,0.61,0.36,1),border-bottom-right-radius_680ms_cubic-bezier(0.22,0.61,0.36,1),width_680ms_cubic-bezier(0.22,0.61,0.36,1),min-width_680ms_cubic-bezier(0.22,0.61,0.36,1),max-width_680ms_cubic-bezier(0.22,0.61,0.36,1),height_680ms_cubic-bezier(0.22,0.61,0.36,1),min-height_680ms_cubic-bezier(0.22,0.61,0.36,1),max-height_680ms_cubic-bezier(0.22,0.61,0.36,1),inline-size_680ms_cubic-bezier(0.22,0.61,0.36,1),block-size_680ms_cubic-bezier(0.22,0.61,0.36,1),transform_680ms_cubic-bezier(0.22,0.61,0.36,1)]"
        : null,
      focusActive
        ? "chat-container--input-focus"
        : null,
      viewportIsMobile ? "chat-layout-mobile" : "chat-layout-desktop"
    );
  return <>
    <ChatBodyView
      embedded={embedded}
      t={t}
      locale={locale}
      profileOpen={profileOpen}
      closeProfile={closeProfile}
      isEntering={isEntering}
      focusActive={focusActive}
      chatContainerRef={chatContainerRef}
      chatContainerClassName={chatContainerClassName}
      chatRingStyle={chatRingStyle}
      useMaskedChatSurface={useMaskedChatSurface}
      handleBackHome={handleBackHome}
      mobileRailVisible={mobileRailVisible}
      mobileRailInteractionLocked={mobileRailInteractionLocked}
      showMobileRail={showMobileRail}
      isLightTheme={isLightTheme}
      roomId={effectiveRoomId}
      inputFocused={inputFocused}
      isMobile={viewportIsMobile}
      sourcesButtonRef={sourcesButtonRef}
      toggleSourcesPanel={toggleSourcesPanel}
      showSourcesPanel={showSourcesPanel}
      sourcesPulse={sourcesPulse}
      conversationSources={conversationSources}
      hasConversationSources={hasConversationSources}
      leftRailActiveKey={activeListingsPanel?.side === "left" ? activeListingsPanel.key : ""}
      rightRailActiveKey={activeListingsPanel?.side === "right" ? activeListingsPanel.key : ""}
      onShowHelpRequests={openGlobalRequestsPanel}
      onShowHelpOffers={openGlobalOffersPanel}
      toggleProfile={toggleProfile}
      openProfileDirect={openProfileDirect}
      analysis={analysis}
      isRoomMode={isRoomMode}
      roomTitle={roomTitle}
      hideRoomTitle={hideRoomTitle}
      allowAssistantForward={allowAssistantForward}
      isHelpMatchRoom={isHelpMatchRoom}
      isCrisis={isCrisis}
      crisisText={crisisText}
      errorBanner={errorBanner}
      roomBlocked={roomBlocked}
      roomAuthRequired={roomAuthRequired}
      modeNotice={modeNotice}
      activeModeLabel={activeModeLabel}
      roomModeLabel={roomModeLabel}
      activeModeKey={activeWorkflow}
      chatWindowRef={chatWindowRef}
      isStreamingAny={isStreamingAny}
      hiddenCount={hiddenCount}
      pageSize={PAGE_SIZE}
      onRevealOlder={revealOlder}
      canHideOlder={visibleMessages.length > MAX_RENDERED_MESSAGES && renderLimit > MAX_RENDERED_MESSAGES}
      onHideOlder={hideOlder}
      onJumpToBottom={handleJumpToBottom}
      messageItems={messageItems}
      listingsPanelNode={listingsPanelNode}
      selectedListingContextNode={selectedListingContextNode}
      onWindowDoubleClick={handleChatWindowDoubleClick}
      chatAnalysisPanelProps={chatAnalysisPanelProps}
      inputRowRef={inputRowRef}
      inputBarRef={inputBarRef}
      inputRef={inputRef}
      onFocusComposer={handleComposerFocus}
      onBlurInput={handleInputBlur}
      isGenerating={isGenerating}
      onStop={stop}
      onSend={handleSendMessage}
      onActivateInfoMode={activateInfoMode}
      onActivateCareerMode={activateCareerMode}
      careerModeEnabled={CAREER_WORKFLOW_ENABLED}
      onActivateHelpRequestMode={activateHelpRequestMode}
      onActivateHelpOfferMode={activateHelpOfferMode}
      careerModeLocked={careerModeLocked}
      hideComposerTools={hideComposerTools}
      documentFlowActive={documentFlowActive}
      careerCvQuestionPending={careerCvQuestionPending}
      suppressCareerCvPreview={suppressCareerCvPreview}
      onPickDocumentFile={analysis.onPickFile}
      speakLatestReply={speakLatestReply}
      canSpeakLatest={canSpeakLatest}
      voiceEnabled={voiceEnabled}
      isSpeaking={isSpeaking}
      recording={recording}
      recordingPulse={recordingPulse}
      handleMic={voiceEnabled ? handleMic : undefined}
      composerDraftApiRef={composerDraftApiRef}
      onDraftStateChange={handleDraftStateChange}
      onComposerLayoutChange={handleComposerLayoutChange}
      sendToAssistant={allowAssistantForward ? sendToAssistant : false}
      setSendToAssistant={setSendToAssistant}
      aiNote={aiNote}
      recordingError={recordingError}
      closeSourcesPanel={closeSourcesPanel}
      analysisPanelWidth={analysisPanelWidth}
      maskLayerRef={maskLayerRef}
    />
    {deleteListingConfirmNode}
    <LoginModal
      open={loginOpen}
      onClose={() => {
        setLoginOpen(false);
        clearVerifyEntryUrl();
      }}
      suppressRedirect
      onAuthSuccess={() => {
        clearVerifyEntryUrl();
        setLoginOpen(false);
      }}
      prefillStoredEmail={!emailVerifiedEntry}
    />
  </>;
}

