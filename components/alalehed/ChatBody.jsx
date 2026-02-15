"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAccessibility } from "@/components/accessibility/AccessibilityProvider";
import InviteModal from "@/components/invite/InviteModal";
import RightRail from "@/components/chat/RightRail";
import { useI18n } from "@/components/i18n/I18nProvider";
import ChatAnalysisPanel from "./chat/ChatAnalysisPanel";
import ChatComposer from "./chat/ChatComposer";
import ConversationView from "./chat/ConversationView";
import ChatMessageItem from "./chat/ChatMessageItem";
import ChatSourcesPanel from "./chat/ChatSourcesPanel";
import { useSpeech } from "../chat/hooks/useSpeech";
import { useChatStream } from "@/components/chat/hooks/useChatStream";
import { useChatConversationState } from "../chat/hooks/useChatConversationState";
import { prettifyFileName } from "@/components/chat/utils/sources";
import { useChatInputHoleMask } from "@/components/chat/hooks/useChatInputHoleMask";
import { useConversationSources } from "@/components/chat/hooks/useConversationSources";
import { useChatAnalysisController } from "@/components/chat/hooks/useChatAnalysisController";
import { pushWithTransition } from "@/lib/routeTransition";
import { clearStaleScrollLock } from "@/lib/scrollLock";
import ProfiilBody from "@/components/alalehed/ProfiilBody";
import BackButton from "@/components/ui/BackButton";
import GlassRing from "@/components/ui/GlassRing";
import { glassPageBackMobileBottomCenterClassName } from "@/components/ui/glassPageStyles";
import { cn } from "@/components/ui/cn";
import { ShowRailIcon } from "@/components/ui/icons/ChatIcons";
import { resolveChatLayoutVars } from "./chat/chatLayoutVars";
import { useChatMobileRail } from "./chat/hooks/useChatMobileRail";
import { useChatProfileRoll } from "./chat/hooks/useChatProfileRoll";
import { useChatRoomMode, useSyncRoomAssistantMessages } from "./chat/hooks/useChatRoomMode";
const chatNoteClassName = "mt-[0.5rem] mb-[0.75rem] rounded-[10px] border border-[rgba(231,76,60,0.35)] bg-[rgba(231,76,60,0.12)] px-[0.9rem] py-[0.7rem] text-[0.9rem] text-[#ff9c9c] self-center text-center mx-auto w-full max-w-[min(38rem,100%)]";
const aiToggleLabelClassName = "flex items-center gap-[0.6rem] rounded-[0.95rem] border border-[rgba(148,163,184,0.35)] bg-[rgba(10,14,24,0.35)] px-[0.8rem] py-[0.55rem] text-[0.95rem] text-[color:var(--pt-120)]";
const aiToggleInputClassName = "h-[1.05rem] w-[1.05rem] accent-[color:var(--brand-primary)]";
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
  const chatFaceClass = null;
  const profileFaceClass = null;
    const showChatFace = !profileOpen;
    const showProfileFace = profileOpen;
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
  return <>
      <InviteModal />
      <div className={cn("chat-page-shell grid place-items-center min-h-[100dvh] h-[100dvh] p-0 [overflow-anchor:none]", isEntering ? "chat-entering" : null, focusActive ? "chat-page-shell--input-focus place-items-center pt-0 pb-0 [scroll-padding-top:0] [scroll-padding-bottom:0]" : null)}>
        <>
            {showChatFace ? <div className={chatFaceClass ?? undefined} aria-hidden={profileOpen ? "true" : "false"}>
                <div className="relative overflow-visible">
                  <GlassRing
                    className={chatContainerClassName}
                    style={chatRingStyle}
                    role="region"
                    aria-label={t("chat.page_label")}
                    ref={chatContainerRef}
                  data-chat-container="true"
                  data-chat-theme={isLightTheme ? "light" : "dark"}
                  data-chat-layout={isMobile ? "mobile" : "desktop"}
                  data-chat-layout-focus={focusActive ? "true" : "false"}
                >
                  {useMaskedChatSurface ? <div className="chat-mask-layer absolute inset-0 z-0 rounded-[inherit] pointer-events-none bg-[color:var(--glass-surface-bg,rgba(0,0,0,0.25))] backdrop-blur-[var(--glass-blur-radius,1rem)] [-webkit-backdrop-filter:blur(var(--glass-blur-radius,1rem))] [mask-image:var(--chat-input-hole-mask,none)] [-webkit-mask-image:var(--chat-input-hole-mask,none)] [mask-size:100%_100%] [-webkit-mask-size:100%_100%] [mask-repeat:no-repeat] [-webkit-mask-repeat:no-repeat]" aria-hidden="true" /> : null}
                    {!profileOpen ? <BackButton
                        onClick={handleBackHome}
                        ariaLabel={t("chat.back_to_home")}
                        className={cn(glassPageBackMobileBottomCenterClassName, "chat-back-button pointer-events-auto z-[120] touch-manipulation max-[48em]:!z-[95]")}
                      /> : null}
                    {!profileOpen && !mobileRailVisible ? <button
                        type="button"
                        onPointerDown={event => {
                event.stopPropagation();
              }}
                        onClick={event => {
                event.preventDefault();
                event.stopPropagation();
                showMobileRail();
              }}
                        disabled={mobileRailInteractionLocked}
                        aria-label={t("chat.show_quick_actions")}
                        className="chat-rail-show-btn pointer-events-auto touch-manipulation absolute z-[221] top-[var(--chat-mobile-show-top)] left-[calc(env(safe-area-inset-left,0px)+0.04rem+var(--chat-mobile-back-size)+0.08rem)] h-[var(--chat-mobile-show-size)] w-[var(--chat-mobile-show-size)] p-0 m-0 border-0 bg-transparent inline-flex items-center justify-center text-[#c57171] light:text-[#7a3a38] opacity-90 active:scale-[0.96] focus-visible:outline-none disabled:opacity-55 disabled:pointer-events-none min-[48.0625em]:hidden"
                      >
                        <ShowRailIcon isLightTheme={isLightTheme} className="h-[var(--chat-mobile-show-icon-size)] w-[var(--chat-mobile-show-icon-size)]" />
                      </button> : null}

                <RightRail
                  t={t}
                  roomId={roomId}
                  isLightTheme={isLightTheme}
                  inputFocused={profileOpen ? false : (isMobile ? inputFocused : focusActive)}
                  sourcesButtonRef={sourcesButtonRef}
                  toggleSourcesPanel={toggleSourcesPanel}
                  showSourcesPanel={showSourcesPanel}
                  sourcesPulse={sourcesPulse}
                  conversationSources={conversationSources}
                  hasConversationSources={hasConversationSources}
                  onProfileToggle={toggleProfile}
                  embedded={embedded}
                  suppressTooltip={analysis.showAnalysisPanel}
                  suspendPointerEvents={analysis.showAnalysisPanel && analysis.analysisPanelMode === "overlay" || mobileRailInteractionLocked}
                  mobileVisible={mobileRailVisible}
                />

                {isRoomMode && roomTitle ? <div className="text-center mt-[-0.6rem] mb-[0.9rem] text-[1.25rem] text-[color:var(--pt-200)] tracking-[0.02em]">
                    {roomTitle}
                  </div> : null}

                {isCrisis ? <div role="alert" className="mt-[0.35rem] mb-[0.75rem] rounded-[10px] border border-[rgba(231,76,60,0.35)] bg-[rgba(231,76,60,0.12)] px-[0.9rem] py-[0.65rem] text-[0.92rem] text-[#ff9c9c]">
                    {crisisText}
                  </div> : null}

                {errorBanner ? <div role="alert" className="mt-[0.5rem] mb-[0.75rem] rounded-[10px] border border-[rgba(231,76,60,0.35)] bg-[rgba(231,76,60,0.12)] px-[0.9rem] py-[0.7rem] text-[0.9rem] text-[#ff9c9c] self-center text-center mx-auto w-full max-w-[min(38rem,100%)]">
                    {errorBanner}
                  </div> : null}
                {isRoomMode && roomBlocked ? <div className={chatNoteClassName} role="alert">
                    {t("chat.room.blocked")}
                  </div> : null}

                {isRoomMode && roomAuthRequired ? <div className={chatNoteClassName} role="alert">
                    {t("chat.room.auth_required")}
                  </div> : null}

                <ConversationView t={t} chatWindowRef={chatWindowRef} isStreamingAny={isStreamingAny} hiddenCount={hiddenCount} pageSize={PAGE_SIZE} onRevealOlder={revealOlder} canHideOlder={visibleMessages.length > MAX_RENDERED_MESSAGES && renderLimit > MAX_RENDERED_MESSAGES} onHideOlder={hideOlder} onJumpToBottom={handleJumpToBottom} messageItems={messageItems} onWindowDoubleClick={handleChatWindowDoubleClick} mainClassName={focusActive ? "mb-[clamp(0.6rem,1.6vh,1.3rem)] [transform:translateY(var(--chat-window-focus-shift,0rem))]" : "mb-[clamp(0.5rem,1.4vh,1.1rem)] [transform:translateY(0)]"} isMobile={isMobile} isLightTheme={isLightTheme} hasConversationSources={hasConversationSources} conversationSourcesCount={conversationSources.length} toggleSourcesPanel={toggleSourcesPanel} showSourcesPanel={showSourcesPanel} sourcesPulse={sourcesPulse} sourcesButtonRef={sourcesButtonRef} />


                {analysis.showAnalysisPanel && !analysis.uploadPreview ? <ChatAnalysisPanel {...chatAnalysisPanelProps} /> : null}

                <ChatComposer t={t} isLightTheme={isLightTheme} acceptAttr={analysis.acceptAttr} ensureAnalysisPanelVisible={analysis.ensureAnalysisPanelVisible} fileInputRef={analysis.fileInputRef} onFileChange={analysis.onFileChange} inputBarRef={inputBarRef} inputRef={inputRef} onFocusInput={() => {
                handleComposerFocus();
              }} onBlurInput={handleInputBlur} isGenerating={isGenerating} isStreamingAny={isStreamingAny} isRoomMode={isRoomMode} roomBlocked={roomBlocked} roomAuthRequired={roomAuthRequired} onStop={stop} onSend={sendMessage} speakLatestReply={speakLatestReply} canSpeakLatest={canSpeakLatest} isSpeaking={isSpeaking} recording={recording} recordingPulse={recordingPulse} handleMic={handleMic} draftApiRef={composerDraftApiRef} inputFocused={focusActive} isMobile={isMobile} />

                {isRoomMode && focusActive ? <div className="mt-[0.35rem] flex w-full max-w-[min(93%,45rem)] items-center justify-end gap-[0.45rem] mx-auto pl-[clamp(0.7rem,2.1vw,1.2rem)] pr-[clamp(0.8rem,2.7vw,1.5rem)]">
                    <label className={aiToggleLabelClassName}>
                      <input type="checkbox" className={aiToggleInputClassName} checked={sendToAssistant} onChange={e => setSendToAssistant(e.target.checked)} aria-describedby="chat-ai-hint" />
                      <span className="text-[0.95rem] leading-[1.2] text-[color:var(--pt-120)]">
                        {t("chat.ai_toggle.label")}
                      </span>
                    </label>
                    <span id="chat-ai-hint" className="sr-only">
                      {aiNote}
                    </span>
                  </div> : null}

                {recordingError ? <div role="alert" className={chatNoteClassName}>
                    {recordingError}
                  </div> : null}

                <footer className="relative mt-[0.35rem] flex min-h-[1.6rem] flex-none justify-center max-[48em]:mt-[0.55rem] max-[48em]:min-h-[1.1rem] max-[48em]:pb-[0.15rem]" />
                <ChatSourcesPanel open={showSourcesPanel} t={t} conversationSources={conversationSources} onClose={closeSourcesPanel} returnFocusRef={sourcesButtonRef} />
              </GlassRing>
              {analysis.showAnalysisPanel && analysis.uploadPreview ? <div className="mt-[2.4rem] mx-auto" style={analysisPanelWidth ? {
                  width: `${analysisPanelWidth}px`,
                  maxWidth: `${analysisPanelWidth}px`
                } : undefined}>
                  <ChatAnalysisPanel {...chatAnalysisPanelProps} />
                </div> : null}
            </div>
          </div>
            : null}
            {showProfileFace ? <div className={profileFaceClass ?? undefined} aria-hidden={profileOpen ? "false" : "true"}>
              <ProfiilBody embedded isActive={profileOpen} onBack={closeProfile} />
            </div> : null}
        </>
      </div>
    </>;
}

