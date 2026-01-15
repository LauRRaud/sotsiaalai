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

/* ---------- Komponent ---------- */
export default function ChatBody({ roomId = null, onBackHome = null, embedded = false }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { t, locale } = useI18n();
  const { prefs } = useAccessibility();
  const isLightTheme = prefs?.theme === "light";
  const initialProfileOpen = searchParams?.get("profile") === "1";
  const extendedLabel =
    locale === "en" || locale === "ru"
      ? "Extended analysis"
      : "Laiendatud analüüs";
  const contextHint = t(
    "chat.upload.context_hint",
    locale === "en" || locale === "ru"
      ? "When enabled, the assistant also uses the SotsiaalAI knowledge base."
      : "Kui see on sisse lülitatud, kasutab assistent lisaks dokumendile ka SotsiaalAI andmebaasi.",
  );
  const aiNote = t(
    "chat.ai_toggle.note",
    "Vaikimisi on see inimeste jutt ja assistent ei näe sõnumit."
  );
  const isRoomMode = Boolean(roomId);

  const crisisText = t(
    "chat.crisis.notice",
    "KRIIS: Kui on vahetu oht, helista 112. Lastele ja peredele on ööpäevaringselt tasuta 116111 (Lasteabi)."
  );

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
  useEffect(() => {
    aiVisibleByMessageId.current = new Map();
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



  const mappedRoomMessages = useMemo(() => {
    if (!isRoomMode) return [];
    return (roomMessages || []).map((m) => {
      const created = m?.createdAt ? new Date(m.createdAt).getTime() : Date.now();
      const isMine = m?.authorId && session?.user?.id && m.authorId === session.user.id;
      const aiSeen = isMine ? !!aiVisibleByMessageId.current.get(m.id) : false;
      return {
        id: m.id,
        role: isMine ? "user" : "member",
        text: m.content || "",
        authorName: m.authorName || "Liige",
        authorRole: m.authorRole || "MEMBER",
        createdAt: created,
        aiVisible: aiSeen,
      };
    });
  }, [isRoomMode, roomMessages, session?.user?.id]);

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

  /* ---------- Vestluse vahetus sündmus ---------- */
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
  ]
    .filter(Boolean)
    .join(" ");
  const chatFaceClass = `chat-roll-face chat-roll-face--chat${profileOpen ? "" : " is-active"}`;
  const profileFaceClass = `chat-roll-face chat-roll-face--profile${profileOpen ? " is-active" : ""}`;

  /* ---------- Render ---------- */
  return (
    <>
      <InviteModal />
      <div className={`chat-page-shell${isEntering ? " chat-entering" : ""}`}>
        <div className="chat-roll-stage">
          <div className={rollCardClass}>
            <div className={chatFaceClass} aria-hidden={profileOpen ? "true" : "false"}>
              <div
                className={`main-content glass-box chat-container chat-container--round${
                  inputFocused && !profileOpen ? " chat-container--input-focus" : ""
                }`}
                role="region"
                aria-label={t("chat.page_label", "Vestluse sisu")}
                ref={chatContainerRef}
              >
          <div className="chat-window-fade chat-window-fade--top" aria-hidden="true" />
          {!profileOpen ? (
            <div
              className={`back-btn-wrapper back-btn-wrapper--side${analysis.showAnalysisPanel ? " is-hidden" : ""}`}
              aria-hidden={analysis.showAnalysisPanel ? "true" : "false"}
            >
              <button
                type="button"
                className="back-arrow-btn"
                onClick={handleBackHome}
                aria-label={t("chat.back_to_home", "Tagasi avalehele")}
                tabIndex={analysis.showAnalysisPanel ? -1 : undefined}
              >
                <span className="back-arrow-circle" />
              </button>
            </div>
          ) : null}
      {/* Parempoolne vertikaalne ikoonirida */}
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

      {/* Pealkiri ja nav */}
      <h1 className="glass-title">{t("chat.title", "SotsiaalAI")}</h1>
      {isRoomMode && roomTitle ? (
        <div className="room-title-sub">
          {roomTitle}
        </div>
      ) : null}
      {/* Kriisi teavitus */}
      {isCrisis ? (
        <div
          role="alert"
          className="mt-[0.35rem] mb-[0.75rem] rounded-[10px] border border-[rgba(231,76,60,0.35)] bg-[rgba(231,76,60,0.12)] px-[0.9rem] py-[0.65rem] text-[0.92rem] text-[#ff9c9c]"
        >
          {crisisText}
        </div>
      ) : null}

      {/* Vea teavitus */}
      {errorBanner ? (
        <div
          role="alert"
          className="chat-error-banner mt-[0.5rem] mb-[0.75rem] rounded-[10px] border border-[rgba(231,76,60,0.35)] bg-[rgba(231,76,60,0.12)] px-[0.9rem] py-[0.7rem] text-[0.9rem] text-[#ff9c9c]"
        >
          {errorBanner}
        </div>
      ) : null}
      {isRoomMode && roomBlocked ? (
        <div className="glass-note chat-error-banner" role="alert">
          {t("chat.room.blocked", "Vestluses osalemine ei ole hetkel voimalik. Palun vota uhendust oma spetsialistiga.")}
        </div>
      ) : null}


      {isRoomMode && roomAuthRequired ? (
        <div className="glass-note chat-error-banner" role="alert">
          {t("chat.room.auth_required", "Sessioon aegus. Palun logi uuesti sisse.")}
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
        <div className="chat-ai-toggle">
          <label className="glass-checkbox chat-ai-checkbox">
            <input
              type="checkbox"
              checked={sendToAssistant}
              onChange={(e) => setSendToAssistant(e.target.checked)}
              aria-describedby="chat-ai-hint"
            />
            <span className="checkbox-text">
              {t("chat.ai_toggle.label", "Saada assistendile")}
            </span>
          </label>
          <span id="chat-ai-hint" className="sr-only">{aiNote}</span>
        </div>
      ) : null}

      {recordingError ? (
        <div
          role="alert"
          className="glass-note chat-error-banner mt-[0.5rem]"
        >
          {recordingError}
        </div>
      ) : null}

      <footer className="chat-footer" />
      <ChatSourcesPanel
        open={showSourcesPanel}
        t={t}
        conversationSources={conversationSources}
        onClose={closeSourcesPanel}
        returnFocusRef={sourcesButtonRef}
      />

              </div>
            </div>
            <div className={profileFaceClass} aria-hidden={profileOpen ? "false" : "true"}>
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








