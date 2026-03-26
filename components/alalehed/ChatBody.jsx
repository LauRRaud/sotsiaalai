"use client";

import { useState, useRef, useEffect, useLayoutEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAccessibility } from "@/components/accessibility/AccessibilityProvider";
import { useEffectiveRole } from "@/components/auth/useEffectiveRole";
import { useI18n } from "@/components/i18n/I18nProvider";
import ChatMessageItem from "./chat/ChatMessageItem";
import { useSpeech } from "../chat/hooks/useSpeech";
import { useChatStream } from "@/components/chat/hooks/useChatStream";
import { useDeepResearchStream } from "@/components/chat/hooks/useDeepResearchStream";
import { useChatConversationState } from "../chat/hooks/useChatConversationState";
import { prettifyFileName } from "@/components/chat/utils/sources";
import { useChatInputHoleMask } from "@/components/chat/hooks/useChatInputHoleMask";
import { useConversationSources } from "@/components/chat/hooks/useConversationSources";
import { useChatAnalysisController } from "@/components/chat/hooks/useChatAnalysisController";
import HelpListingsPanel from "@/components/chat/HelpListingsPanel";
import SelectedListingContext from "@/components/chat/SelectedListingContext";
import { getHelpUiText } from "@/components/chat/helpUiText";
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
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
const MOBILE_KEYBOARD_OPEN_THRESHOLD = 88;
const MOBILE_KEYBOARD_CLOSE_THRESHOLD = 56;
const MOBILE_KEYBOARD_BLUR_SETTLE_MS = 220;
const MOBILE_KEYBOARD_BASELINE_CAPTURE_MS = 320;
const MOBILE_KEYBOARD_OPEN_STABLE_MS = 96;
const PANEL_TILT_CLOSE_MS = 540;
const DEEP_RESEARCH_ARMED_TEXT =
  "S\u00fcvauuring on valitud ja ootel. Kirjuta oma uurimisk\u00fcsimus ning soovi korral t\u00e4psusta piirkond v\u00f5i tasand. Seej\u00e4rel vajuta Enter v\u00f5i Saada. T\u00fchistamiseks vajuta s\u00fcvauuringu ikooni.";
const DEEP_RESEARCH_EMPTY_QUERY_HINT = "Kirjuta uurimisk\u00fcsimus.";
const DEEP_RESEARCH_MODE_ENDED_TEXT = "S\u00fcvauuringu re\u017eiim l\u00f5petatud.";
const CHAT_HELP_PANEL_STORAGE_KEY = "__SOTSIAALAI_CHAT_HELP_PANEL__";
const CHAT_HELP_PANEL_SOURCE_STORAGE_KEY = "__SOTSIAALAI_CHAT_HELP_PANEL_SOURCE__";
const CHAT_EMPTY_INTRO_SEEN_KEY_PREFIX = "sotsiaalai:chat:empty-intro-seen";

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

function isEditableElement(node) {
  if (!(node instanceof Element)) return false;
  const tag = node.tagName;
  return tag === "TEXTAREA" || tag === "INPUT" || node.isContentEditable;
}

function isCareerIntent(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return false;

  return (
    normalized.includes("karjäärinõust") ||
    normalized.includes("karjäärinoust") ||
    normalized.includes("cv abi") ||
    normalized.includes("cv üle") ||
    normalized.includes("cv ule") ||
    normalized.includes("töösuund") ||
    normalized.includes("toosuund") ||
    normalized.includes("õpisuund") ||
    normalized.includes("opisuund")
  );
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

export default function ChatBody({
  roomId = null,
  onBackHome = null,
  embedded = false
}) {
  const router = useRouter();
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
  const isLightTheme = prefs?.theme === "light" || prefs?.theme === "light-mono" || prefs?.theme === "mid";
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
  const helpUi = useMemo(() => getHelpUiText(t), [t]);
  const [activeListingsPanel, setActiveListingsPanel] = useState(null);
  const [listingsPanelClosing, setListingsPanelClosing] = useState(false);
  const [listingsPanelState, setListingsPanelState] = useState({
    items: [],
    nextOffset: null,
    loading: false,
    error: ""
  });
  const [selectedListingState, setSelectedListingState] = useState({
    loading: false,
    error: "",
    listing: null,
    isOwn: false,
    connectOptions: [],
    selectedConnectListingId: "",
    edit: null,
    busyAction: ""
  });
  const [isEntering, setIsEntering] = useState(false);
  const [isGeneratingForSave, setIsGeneratingForSave] = useState(false);
  const [analysisPanelWidth, setAnalysisPanelWidth] = useState(null);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [layoutTransitionsReady, setLayoutTransitionsReady] = useState(false);
  const listingsPanelCloseTimerRef = useRef(null);
  const deepResearchHintMessageIdRef = useRef(null);
  const {
    isRoomMode,
    roomMessages,
    roomBlocked,
    roomAuthRequired,
    roomTitle,
    sendToAssistant,
    setSendToAssistant,
    getVisibleMessages,
    onRoomMessageSent,
    onAssistantMessageCreated,
    pendingRoomAiIdsRef,
    seenRoomAiIdsRef
  } = useChatRoomMode({
    roomId,
    sessionUserId,
    t
  });
  useEffect(() => {
    clearStaleScrollLock();
  }, []);
  useIsomorphicLayoutEffect(() => {
    setHasHydrated(true);
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
      maskRefreshRef.current?.();
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
  }, [inputFocused, isMobile]);
  const MAX_RENDERED_MESSAGES = 80;
  const PAGE_SIZE = 80;
  const [renderLimit, setRenderLimit] = useState(MAX_RENDERED_MESSAGES);
  const chatWindowRef = useRef(null);
  const chatContainerRef = useRef(null);
  const isGeneratingRef = useRef(false);
  const blurTimerRef = useRef(0);
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
  const inputRef = useRef(null);
  const [composerHasDraft, setComposerHasDraft] = useState(false);
  const [emptyIntroSeenOverride, setEmptyIntroSeenOverride] = useState(false);
  const composerDraftApiRef = useRef(null);
  const inputRowRef = useRef(null);
  const inputBarRef = useRef(null);
  const maskLayerRef = useRef(null);
  const sourcesButtonRef = useRef(null);
  const backTapGuardRef = useRef(0);
  const maskRefreshRef = useRef(null);
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
      const finish = () => {
        if (settled) return;
        settled = true;
        row?.removeEventListener("transitionend", onTransitionEnd);
        container?.removeEventListener("transitionend", onTransitionEnd);
        if (timeoutId) window.clearTimeout(timeoutId);
        resolve();
      };
      const onTransitionEnd = event => {
        if (
          event.target === row &&
          (event.propertyName === "top" ||
            event.propertyName === "margin-top" ||
            event.propertyName === "transform")
        ) {
          finish();
          return;
        }
        if (event.target !== container) return;
        if (
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
          finish();
        }
      };
      row?.addEventListener("transitionend", onTransitionEnd);
      container?.addEventListener("transitionend", onTransitionEnd);
      timeoutId = window.setTimeout(finish, 460);
    });
    maskRefreshRef.current?.();
  }, [inputFocused, isMobile]);
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
  useChatInputHoleMask({
    containerRef: chatContainerRef,
    inputRowRef,
    inputBarRef: inputBarRef,
    maskLayerRef,
    enabled: !isLightTheme && !profileOpen,
    refreshRef: maskRefreshRef
  });
  useEffect(() => {
    if (isLightTheme) return;
    maskRefreshRef.current?.();
  }, [isLightTheme]);
  const {
    convId,
    setConvId,
    messages,
    setMessages,
    conversationStateReady,
    appendMessage,
    mutateMessage,
    historyPayload
  } = useChatConversationState({
    isRoomMode,
    roomId,
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
  }, [convId, locale, roomId, sessionUserId, sessionUserRole]);
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
      if (parsed?.activeWorkflow === "career") {
        setActiveWorkflow("career");
      }
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
        activeWorkflow !== "career" &&
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
      conversationStateReady &&
      draftAllowsIntro &&
      visibleMessages.length === 0;
    const displayMessages = hasEmptyIntro
      ? [{
          id: "__chat-empty-intro__",
          role: "ai",
          text: t("chat.empty_intro"),
          aiVisible: true,
          typingEffect: !emptyIntroSeen,
          onTypingComplete: !emptyIntroSeen ? "emptyIntro" : null
        }]
      : visibleMessages;
    const n = displayMessages.length;
    if (n <= renderLimit) return displayMessages;
    return displayMessages.slice(n - renderLimit);
  }, [composerHasDraft, conversationStateReady, emptyIntroSeen, isRoomMode, renderLimit, t, visibleMessages]);
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
      return Math.min(total, prev + PAGE_SIZE);
    });
    requestAnimationFrame(() => {
      if (!el) return;
      const newScrollHeight = el.scrollHeight;
      const delta = newScrollHeight - prevScrollHeight;
      el.scrollTop = prevScrollTop + delta;
    });
  }, [visibleMessages.length]);
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
  const focusInput = useCallback(() => {
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);
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
      afterClose?.();
    };
    if (shouldReducePanelMotion()) {
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
    closeListingsPanel();
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

      setSelectedListingState({
        loading: false,
        error: "",
        listing: payload.listing,
        isOwn: Boolean(payload.isOwn),
        connectOptions,
        selectedConnectListingId: "",
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
  }, [closeListingsPanel, helpUi.detailLoadFailed, locale]);
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
          roleLabel: prev.listing.roleLabel || "",
          helpType: prev.listing.helpType || "",
          timeType: prev.listing.timeType || "",
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
          roleLabel: editPayload?.roleLabel,
          helpType: editPayload?.helpType,
          timeType: editPayload?.timeType,
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
  const closeOwnedListing = useCallback(async () => {
    const listing = selectedListingState.listing;
    if (!listing) return;
    setSelectedListingState((prev) => ({
      ...prev,
      busyAction: "close",
      error: ""
    }));
    try {
      const response = await fetch(`/api/help/listings/${encodeURIComponent(listing.kind)}/${encodeURIComponent(listing.id)}?locale=${encodeURIComponent(locale)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: "CLOSED"
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
  const deleteOwnedListing = useCallback(async () => {
    const listing = selectedListingState.listing;
    if (!listing) return;
    if (typeof window !== "undefined" && !window.confirm(helpUi.deleteConfirm)) return;
    setSelectedListingState((prev) => ({
      ...prev,
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
  }, [dismissSelectedListing, helpUi.deleteConfirm, helpUi.deleteFailed, patchListingCollections, selectedListingState.listing]);
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
        pushWithTransition(router, roomTarget);
      }
    } catch (error) {
      setSelectedListingState((prev) => ({
        ...prev,
        busyAction: "",
        error: error?.message || helpUi.connectFailed
      }));
    }
  }, [helpUi.connectFailed, locale, router, selectedListingState.listing, selectedListingState.selectedConnectListingId]);
  const askAiAboutListing = useCallback(() => {
    const listing = selectedListingState.listing;
    if (!listing) return;
    const parts = [
      helpUi.aiPromptPrefix,
      listing.title,
      listing.description || listing.summary || "",
      listing.municipalityLabel || ""
    ].filter(Boolean);
    composerDraftApiRef.current?.appendText?.(`${parts.join("\n")}\n`);
    focusInput();
  }, [focusInput, helpUi.aiPromptPrefix, selectedListingState.listing]);
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
      key: "my_help_requests",
      side: "right",
      kind: "request",
      scope: "mine",
      status: "OPEN",
      returnToProfile: source === "profile",
      title: helpUi.helpRequests,
      emptyText: helpUi.emptyMyRequests
    });
  }, [helpUi.emptyMyRequests, helpUi.helpRequests, openListingsPanel]);
  const openMyOffersPanel = useCallback((source = "chat") => {
    openListingsPanel({
      key: "my_help_offers",
      side: "right",
      kind: "offer",
      scope: "mine",
      status: "OPEN",
      returnToProfile: source === "profile",
      title: helpUi.helpOffers,
      emptyText: helpUi.emptyMyOffers
    });
  }, [helpUi.emptyMyOffers, helpUi.helpOffers, openListingsPanel]);
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
  const {
    isGenerating: isChatGenerating,
    sendMessage,
    stop: stopChatStream
  } = useChatStream({
    convId,
    historyPayload,
    userRole,
    locale,
    docOnlyMode: analysis.docOnlyMode,
    ephemeralChunks: analysis.ephemeralChunks,
    ephemeralSource: analysis.ephemeralSource,
    uploadPreview: analysis.uploadPreview,
    isRoomMode,
    roomId,
    roomBlocked,
    roomAuthRequired,
    sendToAssistant,
    onRoomMessageSent,
    onAssistantMessageCreated,
    t,
    setErrorBanner,
    setIsCrisis,
    requestConversationsRefresh,
    appendMessage,
    mutateMessage,
    onFocusInput: focusInput,
    onAuthRedirect: null
  });
  const {
    isResearching,
    runDeepResearch,
    stopResearch
  } = useDeepResearchStream({
    convId,
    userRole,
    locale,
    t,
    appendMessage,
    mutateMessage,
    onFocusInput: focusInput,
    setErrorBanner,
    requestConversationsRefresh
  });
  const isGenerating = isChatGenerating || isResearching || careerLoading;
  const stop = useCallback(() => {
    stopChatStream();
    void stopResearch();
  }, [stopChatStream, stopResearch]);
  const handleArmDeepResearch = useCallback(() => {
    const activeMessageId = deepResearchHintMessageIdRef.current;
    if (activeMessageId != null) {
      mutateMessage(activeMessageId, msg => ({
        ...msg,
        role: "ai",
        text: DEEP_RESEARCH_ARMED_TEXT,
        aiVisible: true
      }));
      return;
    }
    const createdId = appendMessage({
      role: "ai",
      text: DEEP_RESEARCH_ARMED_TEXT,
      aiVisible: true
    });
    deepResearchHintMessageIdRef.current = createdId;
  }, [appendMessage, mutateMessage]);
  const handleCancelDeepResearchMode = useCallback(() => {
    const messageId = deepResearchHintMessageIdRef.current;
    if (messageId != null) {
      mutateMessage(messageId, msg => ({
        ...msg,
        text: t("chat.deep_research.scope_cancelled"),
        meta: null
      }));
      deepResearchHintMessageIdRef.current = null;
    }
  }, [mutateMessage, t]);
  const handleConsumeDeepResearchMode = useCallback(payload => {
    const started = Boolean(payload?.started);
    const messageId = deepResearchHintMessageIdRef.current;
    if (messageId != null) {
      mutateMessage(messageId, msg => ({
        ...msg,
        text: started
          ? t("chat.deep_research.scope_started")
          : DEEP_RESEARCH_MODE_ENDED_TEXT,
        meta: null
      }));
      deepResearchHintMessageIdRef.current = null;
    }
  }, [mutateMessage, t]);
  const handleDeepResearchEmptySubmit = useCallback(() => {
    appendMessage({
      role: "ai",
      text: DEEP_RESEARCH_EMPTY_QUERY_HINT,
      aiVisible: true
    });
  }, [appendMessage]);
  const handleSendDeepResearchFromComposer = useCallback((query) => {
    return runDeepResearch(query);
  }, [runDeepResearch]);
  const runCareerTurn = useCallback(async (payload = {}, options = {}) => {
    const {
      echoUserText = false,
      userEchoText = null,
      activateWorkflow = true,
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
    }

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
        throw new Error(body?.error || "Karj??rin?ustamise k?ivitamine eba?nnestus.");
      }

      const result = body.result;

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

      return true;
    } catch (error) {
      const message =
        error?.message || "Karj??rin?ustamise k?ivitamine eba?nnestus.";
      setErrorBanner(message);
      appendMessage({
        role: "ai",
        text: `Karj??rin?ustamise k?ivitamine eba?nnestus.\n\n${message}`,
        aiVisible: true,
      });
      return false;
    } finally {
      setCareerLoading(false);
    }
  }, [appendMessage, goToSubscription, router]);
  const handleCareerQuestionAnswer = useCallback((question, answer, answerLabel = null) => {
    const questionId = question?.id;
    if (!questionId) return false;

    const echoText = formatCareerAnswerForDisplay(question, answer, answerLabel);

    void runCareerTurn(
      {
        questionId,
        answer,
        profile: careerProfile || {},
        runtime: {
          ...(careerRuntime || {}),
          ...(careerCurrentState ? { currentState: careerCurrentState } : {}),
        },
      },
      {
        echoUserText: Boolean(echoText),
        userEchoText: echoText,
        activateWorkflow: true,
      }
    );

    return true;
  }, [careerCurrentState, careerProfile, careerRuntime, runCareerTurn]);
  const activateCareerMode = useCallback(() => {
    if (!careerAccessReady) return false;
    if (careerModeLocked) {
      goToSubscription();
      return false;
    }
    void runCareerTurn(
      {
        userMessage: "Soovin karj??rin?ustamist",
        profile: careerProfile || {},
        runtime: {
          ...(careerRuntime || {}),
          ...(careerCurrentState ? { currentState: careerCurrentState } : {}),
        },
      },
      {
        echoUserText: false,
        activateWorkflow: true,
      }
    );
    return true;
  }, [careerAccessReady, careerCurrentState, careerModeLocked, careerProfile, careerRuntime, goToSubscription, runCareerTurn]);
  const handleSendMessage = useCallback(async (rawText) => {
    const text = String(rawText || "").trim();
    if (!text) return false;

    const shouldUseCareerWorkflow =
      activeWorkflow === "career" || isCareerIntent(text);

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

    const pendingQuestions = Array.isArray(careerLastResult?.response?.questions)
      ? careerLastResult.response.questions
      : [];

    const payload =
      activeWorkflow === "career" && pendingQuestions.length === 1
        ? {
            questionId: pendingQuestions[0]?.id,
            answer: text,
            profile: careerProfile || {},
            runtime: {
              ...(careerRuntime || {}),
              ...(careerCurrentState ? { currentState: careerCurrentState } : {}),
            },
          }
        : {
            userMessage: text,
            profile: careerProfile || {},
            runtime: {
              ...(careerRuntime || {}),
              ...(careerCurrentState ? { currentState: careerCurrentState } : {}),
            },
          };

    return runCareerTurn(payload, {
      echoUserText: true,
      activateWorkflow: true,
    });
  }, [activeWorkflow, careerAccessReady, careerCurrentState, careerLastResult, careerModeLocked, careerProfile, careerRuntime, goToSubscription, runCareerTurn, sendMessage]);
  const handleDraftStateChange = useCallback(({ ready, hasDraft }) => {
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
    return renderedMessages.map(msg => <ChatMessageItem key={msg.id} role={msg.role} text={msg.text} attachments={msg.attachments} cards={msg.cards} careerResponse={msg.careerResponse} careerSecondaryResponse={msg.careerSecondaryResponse} careerDocumentStep={msg.careerDocumentStep} careerGeneratedDocument={msg.careerGeneratedDocument} onCareerQuestionAnswer={handleCareerQuestionAnswer} aiVisible={!!msg.aiVisible} typingEffect={!!msg.typingEffect} onTypingComplete={msg.onTypingComplete === "emptyIntro" ? handleEmptyIntroTyped : undefined} authorName={msg.authorName} authorRole={msg.authorRole} isRoomMode={isRoomMode} t={t} />);
  }, [handleCareerQuestionAnswer, handleEmptyIntroTyped, isRoomMode, renderedMessages, t]);
  const modeNotice = activeWorkflow === "career" ? "Aktiivne režiim: karjäärinõustamine" : null;
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
    />
  ) : null;
  const selectedListingContextNode = (selectedListingState.listing || selectedListingState.loading || selectedListingState.error) ? (
    <SelectedListingContext
      locale={locale}
      loading={selectedListingState.loading}
      error={selectedListingState.error}
      listing={selectedListingState.listing}
      isOwn={selectedListingState.isOwn}
      editState={selectedListingState.edit}
      connectOptions={selectedListingState.connectOptions}
      selectedConnectListingId={selectedListingState.selectedConnectListingId}
      busyAction={selectedListingState.busyAction}
      onDismiss={dismissSelectedListing}
      onAskAi={askAiAboutListing}
      onStartEdit={startListingEdit}
      onChangeEditField={changeListingEditField}
      onCancelEdit={() => setSelectedListingState((prev) => ({ ...prev, edit: null, busyAction: "" }))}
      onSaveEdit={saveListingEdit}
      onCloseListing={closeOwnedListing}
      onDeleteListing={deleteOwnedListing}
      onSelectConnectListing={(value) => setSelectedListingState((prev) => ({ ...prev, selectedConnectListingId: value }))}
      onConnect={connectSelectedListing}
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
      setConvId(newId);
      setMessages([]);
      setIsCrisis(false);
      resetCareerSession();
      try {
        window.dispatchEvent(new CustomEvent("sotsiaalai:toggle-conversations"));
      } catch {}
    }
    window.addEventListener("sotsiaalai:switch-conversation", onSwitch);
    return () => window.removeEventListener("sotsiaalai:switch-conversation", onSwitch);
  }, [resetCareerSession, setConvId, setIsCrisis, setMessages]);
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);
  useEffect(() => {
    if (!analysis.showAnalysisPanel) return;
    try {
      inputRef.current?.blur?.();
    } catch {}
    setInputFocused(false);
  }, [analysis.showAnalysisPanel]);
  useEffect(() => {
    if (!analysis.showAnalysisPanel) return;
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
  }, [analysis.showAnalysisPanel, analysis.uploadPreview]);
  useEffect(() => {
    if (!analysis.showAnalysisPanel) return;
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
  }, [analysis.showAnalysisPanel, analysis.uploadPreview, analysis.analysisPanelRef]);
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
      setRenderLimit(Math.min(visibleMessages.length, MAX_RENDERED_MESSAGES));
    }
    scrollToBottom();
  }, [renderLimit, scrollToBottom, visibleMessages.length]);
  const hideOlder = useCallback(() => {
    const el = chatWindowRef.current;
    const prevScrollHeight = el ? el.scrollHeight : 0;
    const prevScrollTop = el ? el.scrollTop : 0;
    setRenderLimit(MAX_RENDERED_MESSAGES);
    requestAnimationFrame(() => {
      if (!el) return;
      const newScrollHeight = el.scrollHeight;
      const delta = newScrollHeight - prevScrollHeight;
      el.scrollTop = prevScrollTop + delta;
    });
  }, []);
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
  const viewportIsMobile = hasHydrated ? isMobile : false;
  const focusActive = inputFocused && !profileOpen && !viewportIsMobile;
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
    onPickFile: analysis.onPickFile,
    setUploadPreview: analysis.setUploadPreview,
    setUploadError: analysis.setUploadError,
    setEphemeralChunks: analysis.setEphemeralChunks,
    closeAnalysisPanel: analysis.closeAnalysisPanel,
    isGenerating,
    prettifyFileName
  };
  const useMaskedChatSurface =
    !isLightTheme ||
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
      layoutTransitionsReady
        ? "min-[768px]:[transition:border-top-left-radius_400ms_cubic-bezier(0.22,0.61,0.36,1),border-top-right-radius_400ms_cubic-bezier(0.22,0.61,0.36,1),border-bottom-left-radius_400ms_cubic-bezier(0.22,0.61,0.36,1),border-bottom-right-radius_400ms_cubic-bezier(0.22,0.61,0.36,1),width_400ms_cubic-bezier(0.22,0.61,0.36,1),min-width_400ms_cubic-bezier(0.22,0.61,0.36,1),max-width_400ms_cubic-bezier(0.22,0.61,0.36,1),height_400ms_cubic-bezier(0.22,0.61,0.36,1),min-height_400ms_cubic-bezier(0.22,0.61,0.36,1),max-height_400ms_cubic-bezier(0.22,0.61,0.36,1),inline-size_400ms_cubic-bezier(0.22,0.61,0.36,1),block-size_400ms_cubic-bezier(0.22,0.61,0.36,1),transform_400ms_cubic-bezier(0.22,0.61,0.36,1)]"
        : null,
      focusActive
        ? "chat-container--input-focus"
        : null,
      viewportIsMobile ? "chat-layout-mobile" : "chat-layout-desktop"
    );
  return <ChatBodyView
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
    roomId={roomId}
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
    onShowMyHelpRequests={openMyRequestsPanel}
    onShowMyHelpOffers={openMyOffersPanel}
    toggleProfile={toggleProfile}
    openProfileDirect={openProfileDirect}
    analysis={analysis}
    isRoomMode={isRoomMode}
    roomTitle={roomTitle}
    isCrisis={isCrisis}
    crisisText={crisisText}
    errorBanner={errorBanner}
    roomBlocked={roomBlocked}
    roomAuthRequired={roomAuthRequired}
    modeNotice={modeNotice}
    activeModeLabel={modeNotice}
    activeModeKey={activeWorkflow === "career" ? "career" : "default"}
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
    onSendDeepResearch={handleSendDeepResearchFromComposer}
    onArmDeepResearch={handleArmDeepResearch}
    onCancelDeepResearchMode={handleCancelDeepResearchMode}
    onConsumeDeepResearchMode={handleConsumeDeepResearchMode}
    onDeepResearchEmptySubmit={handleDeepResearchEmptySubmit}
    onActivateCareerMode={activateCareerMode}
    careerModeLocked={careerModeLocked}
    documentFlowActive={documentFlowActive}
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
    sendToAssistant={sendToAssistant}
    setSendToAssistant={setSendToAssistant}
    aiNote={aiNote}
    recordingError={recordingError}
    closeSourcesPanel={closeSourcesPanel}
    analysisPanelWidth={analysisPanelWidth}
    maskLayerRef={maskLayerRef}
  />;
}
