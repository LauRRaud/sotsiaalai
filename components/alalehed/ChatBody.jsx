"use client";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { useRoomMessages } from "@/components/rooms/useRoomMessages";
import { useSpeech } from "../chat/hooks/useSpeech";
import { useChatStream } from "@/components/chat/hooks/useChatStream";
import { useChatConversationState } from "../chat/hooks/useChatConversationState";
import { prettifyFileName } from "@/components/chat/utils/sources";
import { useChatInputHoleMask } from "@/components/chat/hooks/useChatInputHoleMask";
import { useConversationSources } from "@/components/chat/hooks/useConversationSources";
import { useChatAnalysisController } from "@/components/chat/hooks/useChatAnalysisController";
import { pushWithTransition } from "@/lib/routeTransition";
import ProfiilBody from "@/components/alalehed/ProfiilBody";
import { cn } from "@/components/ui/cn";

export default function ChatBody({ roomId = null, onBackHome = null, embedded = false }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { t, locale } = useI18n();
  const { prefs } = useAccessibility();
  const isLightTheme = prefs?.theme === "light";
  const initialProfileOpen = searchParams?.get("profile") === "1";
  const extendedLabel = t("chat.analysis.extended_label");
  const contextHint = t("chat.upload.context_hint");
  const aiNote = t("chat.ai_toggle.note");
  const isRoomMode = Boolean(roomId);
  const crisisText = t("chat.crisis.notice");

  const userRole = useMemo(() => {
    const raw = session?.user?.role ?? (session?.user?.isAdmin ? "ADMIN" : null);
    const up = String(raw || "").toUpperCase();
    return up || "CLIENT";
  }, [session]);

  const [inputFocused, setInputFocused] = useState(false);
  const [errorBanner, setErrorBanner] = useState(null);
  const [isCrisis, setIsCrisis] = useState(false);
  const [showSourcesPanel, setShowSourcesPanel] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [isGeneratingForSave, setIsGeneratingForSave] = useState(false);
  const MAX_RENDERED_MESSAGES = 80;
  const PAGE_SIZE = 80;
  const rollMs = 560;
  const [renderLimit, setRenderLimit] = useState(MAX_RENDERED_MESSAGES);
  const [sendToAssistant, setSendToAssistant] = useState(false);
  const [profileOpen, setProfileOpen] = useState(() => initialProfileOpen);
  const [rollDirection, setRollDirection] = useState("right");
  const [isRolling, setIsRolling] = useState(false);
  const {
    messages: roomMessages,
    blocked: roomBlocked,
    authRequired: roomAuthRequired,
    roomTitle,
  } = useRoomMessages(roomId || "", 3000);
  const aiVisibleByMessageId = useRef(new Map());
  const pendingRoomAiIdsRef = useRef([]);
  const seenRoomAiIdsRef = useRef(new Set());
  useEffect(() => {
    aiVisibleByMessageId.current = new Map();
    pendingRoomAiIdsRef.current = [];
    seenRoomAiIdsRef.current = new Set();
  }, [roomId]);

  const chatWindowRef = useRef(null);
  const chatContainerRef = useRef(null);
  const isGeneratingRef = useRef(false);
  const handleInputBlur = (event) => {
    const next = event?.relatedTarget || document.activeElement;
    if (next && chatContainerRef.current?.contains(next)) return;
    setInputFocused(false);
  };
  const inputRef = useRef(null);
  const composerDraftApiRef = useRef(null);
  const inputBarRef = useRef(null);
  const sourcesButtonRef = useRef(null);
  const rollTimerRef = useRef(null);
  const rollSwapTimerRef = useRef(null);
  useChatInputHoleMask({
    containerRef: chatContainerRef,
    inputBarRef: inputBarRef,
    enabled: !isLightTheme,
  });
  useEffect(() => {
    if (!embedded || typeof document === "undefined") return;
    document.body.classList.toggle("home-profile-open", profileOpen);
    return () => document.body.classList.remove("home-profile-open");
  }, [embedded, profileOpen]);



  const mappedRoomMessages = useMemo(() => {
    if (!isRoomMode) return [];
    return (roomMessages || []).map((m) => {
      const created = m?.createdAt ? new Date(m.createdAt).getTime() : Date.now();
      const isMine = m?.authorId && session?.user?.id && m.authorId === session.user.id;
      const isAssistant = m?.senderType === "ASSISTANT";
      const aiSeen = isAssistant ? true : isMine ? !!aiVisibleByMessageId.current.get(m.id) : false;
      return {
        id: m.id,
        role: isAssistant ? "ai" : isMine ? "user" : "member",
        text: m.content || "",
        authorName: isAssistant ? t("chat.aria.assistant") : m.authorName || t("chat.aria.member"),
        authorRole: m.authorRole || "MEMBER",
        createdAt: created,
        aiVisible: aiSeen,
      };
    });
  }, [isRoomMode, roomMessages, session?.user?.id, t]);

  const getVisibleMessages = useCallback(
    (msgs) => {
      if (!isRoomMode) return msgs;
      const withTsAi = msgs
        .filter((m) => m.role === "ai")
        .map((m) => ({
          ...m,
          createdAt: m.createdAt || Date.now(),
        }));
      return [...mappedRoomMessages, ...withTsAi].sort((a, b) => {
        const ta = a.createdAt || 0;
        const tb = b.createdAt || 0;
        if (ta !== tb) return ta - tb;
        return String(a.id || "").localeCompare(String(b.id || ""));
      });
    },
    [isRoomMode, mappedRoomMessages]
  );

  const {
    convId,
    setConvId,
    messages,
    setMessages,
    saveMessages,
    appendMessage,
    mutateMessage,
    historyPayload,
  } = useChatConversationState({
    isRoomMode,
    roomId,
    isGenerating: isGeneratingForSave,
    setErrorBanner,
    setIsCrisis,
    t,
    locale,
    userId: session?.user?.id,
    userRole: session?.user?.role,
    getVisibleMessages,
  });

  const visibleMessages = useMemo(
    () => getVisibleMessages(messages),
    [getVisibleMessages, messages]
  );
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
    sessionUserId: session?.user?.id,
    chatWindowRef,
    visibleMessagesCount: visibleMessages.length,
    isGeneratingRef,
  });

  const {
    speechReady,
    isSpeaking,
    speakLatestReply,
    recording,
    recordingPulse,
    recordingError,
    handleMic,
  } = useSpeech({
    locale,
    latestAiText,
    onAppendText: (txt) => composerDraftApiRef.current?.appendText?.(txt),
    onError: (msg) => setErrorBanner(msg),
    t,
  });

  const canSpeakLatest = useMemo(() => {
    return Boolean(speechReady && latestAiText);
  }, [speechReady, latestAiText]);

  const revealOlder = useCallback(() => {
    const el = chatWindowRef.current;
    const prevScrollHeight = el ? el.scrollHeight : 0;
    const prevScrollTop = el ? el.scrollTop : 0;
    setRenderLimit((prev) => {
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
    return renderedMessages.map((msg) => (
      <ChatMessageItem
        key={msg.id}
        role={msg.role}
        text={msg.text}
        aiVisible={!!msg.aiVisible}
        authorName={msg.authorName}
        authorRole={msg.authorRole}
        isRoomMode={isRoomMode}
        t={t}
      />
    ));
  }, [renderedMessages, isRoomMode, t]);
  const { conversationSources, hasConversationSources, sourcesPulse } =
    useConversationSources({ messages, showSourcesPanel, uploadPreview: analysis.uploadPreview });

  /* ---------- UI utilid ---------- */
  const focusSourcesButton = useCallback(() => {
    setTimeout(() => {
      try {
        sourcesButtonRef.current?.focus?.();
      } catch {}
    }, 0);
  }, []);
  const toggleSourcesPanel = useCallback(() => {
    if (!hasConversationSources) return;
    setShowSourcesPanel((prev) => {
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
  const syncProfileUrl = useCallback((open) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (open) {
      url.searchParams.set("profile", "1");
    } else {
      url.searchParams.delete("profile");
    }
    window.history.replaceState({ profileOpen: open }, "", `${url.pathname}${url.search}${url.hash}`);
  }, []);
  const triggerRoll = useCallback(
    (direction, open) => {
      if (isRolling) return;
      setRollDirection(direction);
      setIsRolling(true);
      if (showSourcesPanel) closeSourcesPanel();
      setInputFocused(false);
      try {
        inputRef.current?.blur?.();
      } catch {}
      if (rollSwapTimerRef.current) window.clearTimeout(rollSwapTimerRef.current);
      const swapDelay = Math.round(rollMs * 0.35);
      rollSwapTimerRef.current = window.setTimeout(() => {
        setProfileOpen(open);
        syncProfileUrl(open);
      }, swapDelay);
      if (rollTimerRef.current) window.clearTimeout(rollTimerRef.current);
      rollTimerRef.current = window.setTimeout(() => setIsRolling(false), rollMs);
    },
    [closeSourcesPanel, isRolling, rollMs, showSourcesPanel, syncProfileUrl]
  );
  const openProfile = useCallback(() => triggerRoll("right", true), [triggerRoll]);
  const closeProfile = useCallback(() => triggerRoll("left", false), [triggerRoll]);
  const toggleProfile = useCallback(
    () => (profileOpen ? closeProfile() : openProfile()),
    [closeProfile, openProfile, profileOpen]
  );

  const requestConversationsRefresh = useCallback(() => {
    try {
      window.dispatchEvent(new CustomEvent("sotsiaalai:refresh-conversations"));
    } catch {}
  }, []);

  const onRoomMessageSent = useCallback((msgId) => {
    try {
      aiVisibleByMessageId.current.set(msgId, true);
    } catch {}
  }, []);

  const onAssistantMessageCreated = useCallback(
    (msgId) => {
      if (!isRoomMode || msgId == null) return;
      pendingRoomAiIdsRef.current = [...pendingRoomAiIdsRef.current, msgId];
    },
    [isRoomMode]
  );

  const { isGenerating, sendMessage, stop } = useChatStream({
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
    onAuthRedirect: null,
  });

  const isStreamingAny = useMemo(
    () => isGenerating || visibleMessages.some((m) => m.role === "ai" && m.isStreaming),
    [isGenerating, visibleMessages]
  );

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
        window.dispatchEvent(
          new CustomEvent("sotsiaalai:toggle-conversations", { detail: { open: false } })
        );
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
        window.scrollTo({ top: y, behavior: "auto" });
      }
    };
    requestAnimationFrame(restore);
    setTimeout(restore, 0);
    setTimeout(restore, 120);
    setTimeout(restore, 260);
  }, [analysis.showAnalysisPanel, analysis.uploadPreview]);

  useEffect(() => {
    if (!isRoomMode) return;
    const myId = session?.user?.id;
    if (!myId || !roomMessages?.length) return;
    const pending = pendingRoomAiIdsRef.current;
    if (!pending.length) return;
    const seen = seenRoomAiIdsRef.current;
    const freshAssistant = roomMessages.filter(
      (m) => m?.senderType === "ASSISTANT" && m?.authorId === myId && !seen.has(m.id)
    );
    if (!freshAssistant.length) return;
    const toRemove = [...freshAssistant];
    freshAssistant.forEach((m) => seen.add(m.id));
    if (!toRemove.length) return;
    setMessages((prev) => {
      let next = prev;
      toRemove.forEach(() => {
        const localId = pending.shift();
        if (localId == null) return;
        next = next.filter((msg) => msg.id !== localId);
      });
      pendingRoomAiIdsRef.current = pending;
      return next;
    });
  }, [isRoomMode, roomMessages, session?.user?.id, setMessages]);

  /* ---------- Allikate paneeli sulgemine, kui allikaid pole ---------- */
  useEffect(() => {
    if (!hasConversationSources && showSourcesPanel) {
      closeSourcesPanel();
    }
  }, [hasConversationSources, showSourcesPanel, closeSourcesPanel]);


  const scrollToBottom = useCallback(() => {
    const node = chatWindowRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
  }, []);
  const handleBackHome = useCallback(() => {
    if (typeof onBackHome === "function") {
      onBackHome();
      return;
    }
    pushWithTransition(router, "/");
  }, [onBackHome, router]);
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
    return () => {
      if (rollSwapTimerRef.current) window.clearTimeout(rollSwapTimerRef.current);
      if (rollTimerRef.current) window.clearTimeout(rollTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const shouldOpen = searchParams?.get("profile") === "1";
    if (typeof shouldOpen !== "boolean") return;
    setProfileOpen((prev) => {
      if (prev === shouldOpen) return prev;
      return shouldOpen;
    });
    if (shouldOpen) setRollDirection("right");
  }, [searchParams]);

  const rollCardClass = [
    "chat-roll-card",
    `roll-${rollDirection}`,
    profileOpen ? "is-profile" : "",
    isRolling ? "is-rolling" : "",
    inputFocused && !profileOpen ? "is-input-focus" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const chatFaceClass = `chat-roll-face chat-roll-face--chat${profileOpen ? "" : " is-active"}`;
  const profileFaceClass = `chat-roll-face chat-roll-face--profile${profileOpen ? " is-active" : ""}`;

  /* ---------- Render ---------- */
  return (
    <>
      <InviteModal />
      <div
        className={cn(
          "chat-page-shell relative flex min-h-[100dvh] w-full items-start justify-center",
          "min-[48em]:pt-[calc(env(safe-area-inset-top,0px)+clamp(0.7rem,1.9vh,1.3rem))]",
          isEntering ? "chat-entering" : null
        )}
      >
        <div className="chat-roll-stage relative flex w-full items-start justify-center">
          <div className={rollCardClass}>
            <div
              className={cn(
                chatFaceClass,
                "flex items-center justify-center transition-opacity duration-300"
              )}
              aria-hidden={profileOpen ? "true" : "false"}
            >
              <div
                className={cn(
                  "main-content chat-container chat-container--round relative z-20 flex aspect-square h-[var(--chat-diameter)] w-[var(--chat-diameter)] min-h-[var(--chat-diameter)] min-w-[var(--chat-diameter)] max-h-[var(--chat-diameter)] max-w-[var(--chat-diameter)] flex-col gap-[0.4rem] overflow-y-auto overscroll-contain rounded-full px-[var(--chat-hpad)] pb-[clamp(0.2rem,1vh,0.6rem)] pt-[clamp(1.6rem,3vh,2.6rem)]",
                  "before:absolute before:inset-0 before:z-0 before:rounded-[inherit] before:bg-[var(--glass-surface-bg,rgba(0,0,0,0.25))] before:[backdrop-filter:blur(var(--glass-blur-radius,1rem))] before:[-webkit-backdrop-filter:blur(var(--glass-blur-radius,1rem))] before:[-webkit-mask-image:var(--chat-input-hole-mask,linear-gradient(#fff,#fff))] before:[-webkit-mask-position:0_0] before:[-webkit-mask-repeat:no-repeat] before:[-webkit-mask-size:100%_100%] before:[mask-image:var(--chat-input-hole-mask,linear-gradient(#fff,#fff))] before:[mask-position:0_0] before:[mask-repeat:no-repeat] before:[mask-size:100%_100%]",
                  "max-[48em]:h-[100dvh] max-[48em]:w-screen max-[48em]:min-h-0 max-[48em]:min-w-0 max-[48em]:max-h-[100dvh] max-[48em]:max-w-screen max-[48em]:rounded-none max-[48em]:overflow-visible max-[48em]:px-[clamp(1rem,4vw,1.5rem)] max-[48em]:pt-[clamp(1.2rem,3vh,2rem)]",
                  "min-[48em]:mt-[max(0px,calc((100dvh-var(--chat-diameter))/2-clamp(0.7rem,1.9vh,1.3rem)))]",
                  inputFocused && !profileOpen
                    ? "chat-container--input-focus min-[48em]:rounded-[calc(var(--chat-diameter)/2)_calc(var(--chat-diameter)/2)_2.4rem_2.4rem]"
                    : null
                )}
                role="region"
                aria-label={t("chat.page_label")}
                ref={chatContainerRef}
                style={{
                  "--chat-hpad": "clamp(2.2rem, 6vw, 3.4rem)",
                  "--chat-logo-height": "clamp(12rem, 32vw, 26rem)",
                  "--chat-logo-y": "clamp(5.2rem, 23vh, 12.2rem)",
                  "--chat-ai-offset": "clamp(1.35rem, 3vw, 2.4rem)",
                  "--hud-edge": "clamp(1.05rem, 2.5vw, 1.55rem)",
                  "--hud-icon": "clamp(3rem, 5vw, 3.3rem)",
                }}
              >
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[clamp(3.6rem,8vh,6.5rem)] bg-gradient-to-b from-[rgba(10,12,18,0.9)] to-transparent"
                  aria-hidden="true"
                />
                {!profileOpen ? (
                  <div
                    className={cn(
                      "back-btn-wrapper back-btn-wrapper--side absolute left-[clamp(0.1rem,1.2vw,0.8rem)] top-[clamp(0.4rem,2vh,1rem)] z-30",
                      analysis.showAnalysisPanel ? "is-hidden pointer-events-none opacity-0" : null
                    )}
                    aria-hidden={analysis.showAnalysisPanel ? "true" : "false"}
                  >
                    <button
                      type="button"
                      className="back-arrow-btn inline-flex h-[4.2rem] w-[4.2rem] items-center justify-center rounded-full border border-[rgba(255,255,255,0.2)] bg-[rgba(8,12,20,0.55)] shadow-[0_10px_24px_rgba(0,0,0,0.35)] transition-transform duration-150 hover:-translate-y-[1px]"
                      onClick={handleBackHome}
                      aria-label={t("chat.back_to_home")}
                      tabIndex={analysis.showAnalysisPanel ? -1 : undefined}
                    >
                      <span className="back-arrow-circle" />
                    </button>
                  </div>
                ) : null}

                <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-[0.4rem]">
                  <RightRail
                    t={t}
                    roomId={roomId}
                    isLightTheme={isLightTheme}
                    inputFocused={inputFocused}
                    sourcesButtonRef={sourcesButtonRef}
                    toggleSourcesPanel={toggleSourcesPanel}
                    showSourcesPanel={showSourcesPanel}
                    sourcesPulse={sourcesPulse}
                    conversationSources={conversationSources}
                    hasConversationSources={hasConversationSources}
                    onProfileToggle={toggleProfile}
                    embedded={embedded}
                  />

                  <h1 className="glass-title text-center">{t("chat.title")}</h1>
                  {isRoomMode && roomTitle ? (
                    <div className="room-title-sub text-center text-[1.25rem] tracking-[0.02em] text-[color:var(--pt-200)]">
                      {roomTitle}
                    </div>
                  ) : null}
                  {isCrisis ? (
                    <div
                      role="alert"
                      className="mb-[0.75rem] mt-[0.35rem] rounded-[10px] border border-[rgba(231,76,60,0.35)] bg-[rgba(231,76,60,0.12)] px-[0.9rem] py-[0.65rem] text-[0.92rem] text-[#ff9c9c]"
                    >
                      {crisisText}
                    </div>
                  ) : null}

                  {errorBanner ? (
                    <div
                      role="alert"
                      className="chat-error-banner mb-[0.75rem] mt-[0.5rem] rounded-[10px] border border-[rgba(231,76,60,0.35)] bg-[rgba(231,76,60,0.12)] px-[0.9rem] py-[0.7rem] text-[0.9rem] text-[#ff9c9c]"
                    >
                      {errorBanner}
                    </div>
                  ) : null}
                  {isRoomMode && roomBlocked ? (
                    <div className="chat-error-banner rounded-[10px] border border-[rgba(231,76,60,0.35)] bg-[rgba(231,76,60,0.12)] px-[0.9rem] py-[0.7rem] text-[0.9rem] text-[#ff9c9c]" role="alert">
                      {t("chat.room.blocked")}
                    </div>
                  ) : null}

                  {isRoomMode && roomAuthRequired ? (
                    <div className="chat-error-banner rounded-[10px] border border-[rgba(231,76,60,0.35)] bg-[rgba(231,76,60,0.12)] px-[0.9rem] py-[0.7rem] text-[0.9rem] text-[#ff9c9c]" role="alert">
                      {t("chat.room.auth_required")}
                    </div>
                  ) : null}

                  <ConversationView
                    t={t}
                    chatWindowRef={chatWindowRef}
                    isStreamingAny={isStreamingAny}
                    hiddenCount={hiddenCount}
                    pageSize={PAGE_SIZE}
                    onRevealOlder={revealOlder}
                    canHideOlder={visibleMessages.length > MAX_RENDERED_MESSAGES && renderLimit > MAX_RENDERED_MESSAGES}
                    onHideOlder={hideOlder}
                    onJumpToBottom={handleJumpToBottom}
                    messageItems={messageItems}
                  />

                  <ChatComposer
                    t={t}
                    isLightTheme={isLightTheme}
                    acceptAttr={analysis.acceptAttr}
                    ensureAnalysisPanelVisible={analysis.ensureAnalysisPanelVisible}
                    fileInputRef={analysis.fileInputRef}
                    onFileChange={analysis.onFileChange}
                    inputBarRef={inputBarRef}
                    inputRef={inputRef}
                    onFocusInput={() => setInputFocused(true)}
                    onBlurInput={handleInputBlur}
                    isGenerating={isGenerating}
                    isStreamingAny={isStreamingAny}
                    isRoomMode={isRoomMode}
                    roomBlocked={roomBlocked}
                    roomAuthRequired={roomAuthRequired}
                    onStop={stop}
                    onSend={sendMessage}
                    speakLatestReply={speakLatestReply}
                    canSpeakLatest={canSpeakLatest}
                    isSpeaking={isSpeaking}
                    recording={recording}
                    recordingPulse={recordingPulse}
                    handleMic={handleMic}
                    draftApiRef={composerDraftApiRef}
                  />

                  {isRoomMode && inputFocused ? (
                    <div className="chat-ai-toggle mt-[0.4rem] flex items-center justify-center gap-[0.65rem]">
                      <label className="glass-checkbox chat-ai-checkbox inline-flex items-center gap-[0.5rem]">
                        <input
                          type="checkbox"
                          checked={sendToAssistant}
                          onChange={(e) => setSendToAssistant(e.target.checked)}
                          aria-describedby="chat-ai-hint"
                        />
                        <span className="checkbox-text">{t("chat.ai_toggle.label")}</span>
                      </label>
                      <span id="chat-ai-hint" className="sr-only">{aiNote}</span>
                    </div>
                  ) : null}

                  {recordingError ? (
                    <div
                      role="alert"
                      className="chat-error-banner mt-[0.5rem] rounded-[10px] border border-[rgba(231,76,60,0.35)] bg-[rgba(231,76,60,0.12)] px-[0.9rem] py-[0.7rem] text-[0.9rem] text-[#ff9c9c]"
                    >
                      {recordingError}
                    </div>
                  ) : null}

                  <footer className="chat-footer min-h-[5.8rem]" />
                  <ChatSourcesPanel
                    open={showSourcesPanel}
                    t={t}
                    conversationSources={conversationSources}
                    onClose={closeSourcesPanel}
                    returnFocusRef={sourcesButtonRef}
                  />
                </div>

              </div>
            </div>
            <div
              className={cn(
                profileFaceClass,
                "flex items-center justify-center transition-opacity duration-300"
              )}
              aria-hidden={profileOpen ? "false" : "true"}
            >
              <ProfiilBody embedded isActive={profileOpen} onBack={closeProfile} />
            </div>
          </div>
        </div>
      {analysis.showAnalysisPanel ? (
        <ChatAnalysisPanel
          t={t}
          analysisPanelRef={analysis.analysisPanelRef}
          analysisPanelMode={analysis.analysisPanelMode}
          uploadPreview={analysis.uploadPreview}
          uploadBusy={analysis.uploadBusy}
          uploadError={analysis.uploadError}
          uploadUsage={analysis.uploadUsage}
          previewText={analysis.previewText}
          analysisCollapsed={analysis.analysisCollapsed}
          toggleAnalysisCollapse={analysis.toggleAnalysisCollapse}
          docOnlyMode={analysis.docOnlyMode}
          setDocOnlyMode={analysis.setDocOnlyMode}
          extendedLabel={extendedLabel}
          contextHint={contextHint}
          inputRef={inputRef}
          onPickFile={analysis.onPickFile}
          setUploadPreview={analysis.setUploadPreview}
          setUploadError={analysis.setUploadError}
          setEphemeralChunks={analysis.setEphemeralChunks}
          closeAnalysisPanel={analysis.closeAnalysisPanel}
          isGenerating={isGenerating}
          prettifyFileName={prettifyFileName}
        />
      ) : null}
    </div>
    </>
  );
}









