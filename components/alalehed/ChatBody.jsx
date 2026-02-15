"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAccessibility } from "@/components/accessibility/AccessibilityProvider";
import { useI18n } from "@/components/i18n/I18nProvider";
import ChatMessageItem from "./chat/ChatMessageItem";
import { useSpeech } from "../chat/hooks/useSpeech";
import { useChatStream } from "@/components/chat/hooks/useChatStream";
import { useChatConversationState } from "../chat/hooks/useChatConversationState";
import { prettifyFileName } from "@/components/chat/utils/sources";
import { useChatInputHoleMask } from "@/components/chat/hooks/useChatInputHoleMask";
import { useConversationSources } from "@/components/chat/hooks/useConversationSources";
import { useChatAnalysisController } from "@/components/chat/hooks/useChatAnalysisController";
import { pushWithTransition } from "@/lib/routeTransition";
import { clearStaleScrollLock } from "@/lib/scrollLock";
import { cn } from "@/components/ui/cn";
import { resolveChatLayoutVars } from "./chat/chatLayoutVars";
import { useChatMobileRail } from "./chat/hooks/useChatMobileRail";
import { useChatProfileRoll } from "./chat/hooks/useChatProfileRoll";
import { useChatRoomMode, useSyncRoomAssistantMessages } from "./chat/hooks/useChatRoomMode";
import ChatBodyView from "./chat/ChatBodyView";
const MOBILE_KEYBOARD_OFFSET_THRESHOLD = 96;

export default function ChatBody({
  roomId = null,
  onBackHome = null,
  embedded = false
}) {
  const router = useRouter();
  const {
    data: session
  } = useSession();
  const {
    t,
    locale
  } = useI18n();
  const {
    prefs
  } = useAccessibility();
  const isLightTheme = prefs?.theme === "light";
  const extendedLabel = t("chat.analysis.extended_label");
  const contextHint = t("chat.upload.context_hint");
  const aiNote = t("chat.ai_toggle.note");
  const crisisText = t("chat.crisis.notice");
  const sessionUserId = session?.user?.id;
  const sessionUserRole = session?.user?.role;
  const userRole = useMemo(() => {
    const raw = session?.user?.role ?? (session?.user?.isAdmin ? "ADMIN" : null);
    const up = String(raw || "").toUpperCase();
    return up || "CLIENT";
  }, [session]);
  const [inputFocused, setInputFocused] = useState(false);
  const {
    isMobile,
    mobileRailVisible,
    mobileRailInteractionLocked,
    showMobileRail,
    hideMobileRail
  } = useChatMobileRail();
  const [errorBanner, setErrorBanner] = useState(null);
  const [isCrisis, setIsCrisis] = useState(false);
  const [showSourcesPanel, setShowSourcesPanel] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [isGeneratingForSave, setIsGeneratingForSave] = useState(false);
  const [analysisPanelWidth, setAnalysisPanelWidth] = useState(null);
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
  useEffect(() => {
    const node = chatContainerRef.current;
    if (!node || typeof window === "undefined") return;
    if (!isMobile || !inputFocused) {
      node.style.setProperty("--chat-vk-offset", "0px");
      return;
    }
    const vv = window.visualViewport;
    const readKeyboardOffset = () => {
      const rawOffset = vv
        ? Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop))
        : 0;
      return rawOffset > MOBILE_KEYBOARD_OFFSET_THRESHOLD ? rawOffset : 0;
    };
    const updateKeyboardOffset = () => {
      const offset = readKeyboardOffset();
      node.style.setProperty("--chat-vk-offset", `${offset}px`);
    };
    updateKeyboardOffset();
    vv?.addEventListener("resize", updateKeyboardOffset);
    vv?.addEventListener("scroll", updateKeyboardOffset);
    window.addEventListener("orientationchange", updateKeyboardOffset);
    window.addEventListener("resize", updateKeyboardOffset);
    return () => {
      vv?.removeEventListener("resize", updateKeyboardOffset);
      vv?.removeEventListener("scroll", updateKeyboardOffset);
      window.removeEventListener("orientationchange", updateKeyboardOffset);
      window.removeEventListener("resize", updateKeyboardOffset);
      node.style.setProperty("--chat-vk-offset", "0px");
    };
  }, [inputFocused, isMobile]);
  const MAX_RENDERED_MESSAGES = 80;
  const PAGE_SIZE = 80;
  const [renderLimit, setRenderLimit] = useState(MAX_RENDERED_MESSAGES);
  const chatWindowRef = useRef(null);
  const chatContainerRef = useRef(null);
  const isGeneratingRef = useRef(false);
  const handleInputBlur = event => {
    const next = event?.relatedTarget || document.activeElement;
    if (next && chatContainerRef.current?.contains(next)) return;
    setInputFocused(false);
  };
  const inputRef = useRef(null);
  const composerDraftApiRef = useRef(null);
  const inputBarRef = useRef(null);
  const sourcesButtonRef = useRef(null);
  const backTapGuardRef = useRef(0);
  const maskRefreshRef = useRef(null);
  const {
    profileOpen,
    closeProfile,
    toggleProfile
  } = useChatProfileRoll({
    embedded,
    router,
    showSourcesPanel,
    setShowSourcesPanel,
    setInputFocused,
    inputRef
  });
  useChatInputHoleMask({
    containerRef: chatContainerRef,
    inputBarRef: inputBarRef,
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
    saveMessages,
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
  const renderedMessages = useMemo(() => {
    const n = visibleMessages.length;
    if (n <= renderLimit) return visibleMessages;
    return visibleMessages.slice(n - renderLimit);
  }, [visibleMessages, renderLimit]);
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
    return Boolean(speechReady && latestAiText);
  }, [speechReady, latestAiText]);
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
  const messageItems = useMemo(() => {
    return renderedMessages.map(msg => <ChatMessageItem key={msg.id} role={msg.role} text={msg.text} aiVisible={!!msg.aiVisible} authorName={msg.authorName} authorRole={msg.authorRole} isRoomMode={isRoomMode} t={t} />);
  }, [renderedMessages, isRoomMode, t]);
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
  const requestConversationsRefresh = useCallback(() => {
    try {
      window.dispatchEvent(new CustomEvent("sotsiaalai:refresh-conversations"));
    } catch {}
  }, []);
  const {
    isGenerating,
    sendMessage,
    stop
  } = useChatStream({
    convId,
    historyPayload,
    userRole,
    locale,
    docOnlyMode: analysis.docOnlyMode,
    ephemeralChunks: analysis.ephemeralChunks,
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
      saveMessages([]);
      setIsCrisis(false);
      try {
        window.dispatchEvent(new CustomEvent("sotsiaalai:toggle-conversations"));
      } catch {}
    }
    window.addEventListener("sotsiaalai:switch-conversation", onSwitch);
    return () => window.removeEventListener("sotsiaalai:switch-conversation", onSwitch);
  }, [saveMessages, setConvId, setIsCrisis, setMessages]);
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
  const handleBackHome = useCallback(() => {
    const now = Date.now();
    if (now - backTapGuardRef.current < 320) return;
    backTapGuardRef.current = now;
    if (typeof onBackHome === "function") {
      onBackHome();
      return;
    }
    pushWithTransition(router, "/");
    if (typeof window !== "undefined") {
      window.setTimeout(() => {
        if (window.location.pathname.startsWith("/vestlus")) {
          window.location.assign("/");
        }
      }, 220);
    }
  }, [onBackHome, router]);
  const handleComposerFocus = useCallback(() => {
    setInputFocused(true);
    if (!isMobile) return;
    hideMobileRail();
    const keepConversationAtBottom = () => {
      const node = chatWindowRef.current;
      if (!node) return;
      node.scrollTop = node.scrollHeight;
    };
    requestAnimationFrame(keepConversationAtBottom);
    setTimeout(keepConversationAtBottom, 90);
    setTimeout(keepConversationAtBottom, 190);
  }, [hideMobileRail, isMobile]);
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
  const focusActive = inputFocused && !profileOpen && !isMobile;
  const handleChatWindowDoubleClick = useCallback(() => {
    setInputFocused(false);
    try {
      inputRef.current?.blur?.();
    } catch {}
  }, []);
  const chatVars = resolveChatLayoutVars({
    isMobile,
    focusActive
  });
  const chatAnalysisPanelProps = {
    t,
    analysisPanelRef: analysis.analysisPanelRef,
    analysisPanelMode: analysis.analysisPanelMode,
    uploadPreview: analysis.uploadPreview,
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
        "[&>:not(.top-nav--chat):not(.chat-right-actions):not(.chat-nav-overlay):not(.chat-back-button):not(.chat-analysis-overlay)]:z-[1] " +
        "gap-[0.4rem] pt-[var(--chat-pad-top)] pb-[var(--chat-pad-bottom)] " +
        "overflow-hidden [--ring-pad-top:0px] [--ring-pad-x:0px] [--ring-ui-reserve:var(--ring-ui-reserve-page)] " +
        "max-[48em]:gap-[0.35rem] max-[48em]:flex-[1_1_auto] max-[48em]:min-h-0 max-[48em]:mx-auto " +
        "min-[48em]:w-[var(--chat-diameter)] min-[48em]:h-[var(--chat-diameter)] " +
        "min-[48em]:[inline-size:var(--chat-diameter)] min-[48em]:[block-size:var(--chat-diameter)] " +
        "min-[48em]:min-w-[var(--chat-diameter)] min-[48em]:min-h-[var(--chat-diameter)] " +
        "min-[48em]:max-w-[var(--chat-diameter)] min-[48em]:max-h-[var(--chat-diameter)] " +
        "min-[48em]:flex-[0_0_auto] min-[48em]:self-center min-[48em]:aspect-square min-[48em]:rounded-full " +
        "min-[48em]:[transition:border-top-left-radius_400ms_cubic-bezier(0.22,0.61,0.36,1),border-top-right-radius_400ms_cubic-bezier(0.22,0.61,0.36,1),border-bottom-left-radius_400ms_cubic-bezier(0.22,0.61,0.36,1),border-bottom-right-radius_400ms_cubic-bezier(0.22,0.61,0.36,1),width_400ms_cubic-bezier(0.22,0.61,0.36,1),min-width_400ms_cubic-bezier(0.22,0.61,0.36,1),max-width_400ms_cubic-bezier(0.22,0.61,0.36,1),height_400ms_cubic-bezier(0.22,0.61,0.36,1),min-height_400ms_cubic-bezier(0.22,0.61,0.36,1),max-height_400ms_cubic-bezier(0.22,0.61,0.36,1),inline-size_400ms_cubic-bezier(0.22,0.61,0.36,1),block-size_400ms_cubic-bezier(0.22,0.61,0.36,1),transform_400ms_cubic-bezier(0.22,0.61,0.36,1)] " +
        "min-[48em]:[&_.top-nav--chat]:left-[max(0px,calc(var(--hud-edge-left)+0.9rem))] " +
        "min-[48em]:[&_.chat-right-actions]:right-[max(0px,calc(var(--hud-edge-right)+0.2rem))]",
      focusActive
        ? "chat-container--input-focus"
        : null,
      isMobile ? "chat-layout-mobile" : "chat-layout-desktop"
    );
  return <ChatBodyView
    embedded={embedded}
    t={t}
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
    showMobileRail={showMobileRail}
    mobileRailInteractionLocked={mobileRailInteractionLocked}
    isLightTheme={isLightTheme}
    roomId={roomId}
    inputFocused={inputFocused}
    isMobile={isMobile}
    sourcesButtonRef={sourcesButtonRef}
    toggleSourcesPanel={toggleSourcesPanel}
    showSourcesPanel={showSourcesPanel}
    sourcesPulse={sourcesPulse}
    conversationSources={conversationSources}
    hasConversationSources={hasConversationSources}
    toggleProfile={toggleProfile}
    analysis={analysis}
    isRoomMode={isRoomMode}
    roomTitle={roomTitle}
    isCrisis={isCrisis}
    crisisText={crisisText}
    errorBanner={errorBanner}
    roomBlocked={roomBlocked}
    roomAuthRequired={roomAuthRequired}
    chatWindowRef={chatWindowRef}
    isStreamingAny={isStreamingAny}
    hiddenCount={hiddenCount}
    pageSize={PAGE_SIZE}
    onRevealOlder={revealOlder}
    canHideOlder={visibleMessages.length > MAX_RENDERED_MESSAGES && renderLimit > MAX_RENDERED_MESSAGES}
    onHideOlder={hideOlder}
    onJumpToBottom={handleJumpToBottom}
    messageItems={messageItems}
    onWindowDoubleClick={handleChatWindowDoubleClick}
    chatAnalysisPanelProps={chatAnalysisPanelProps}
    inputBarRef={inputBarRef}
    inputRef={inputRef}
    onFocusComposer={handleComposerFocus}
    onBlurInput={handleInputBlur}
    isGenerating={isGenerating}
    onStop={stop}
    onSend={sendMessage}
    speakLatestReply={speakLatestReply}
    canSpeakLatest={canSpeakLatest}
    isSpeaking={isSpeaking}
    recording={recording}
    recordingPulse={recordingPulse}
    handleMic={handleMic}
    composerDraftApiRef={composerDraftApiRef}
    sendToAssistant={sendToAssistant}
    setSendToAssistant={setSendToAssistant}
    aiNote={aiNote}
    recordingError={recordingError}
    closeSourcesPanel={closeSourcesPanel}
    analysisPanelWidth={analysisPanelWidth}
  />;
}

