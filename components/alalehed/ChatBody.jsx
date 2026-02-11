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
import { clearStaleScrollLock } from "@/lib/scrollLock";
import ProfiilBody from "@/components/alalehed/ProfiilBody";
import BackButton from "@/components/ui/BackButton";
import GlassRing from "@/components/ui/GlassRing";
import { glassPageBackMobileBottomCenterClassName } from "@/components/ui/glassPageStyles";
import { cn } from "@/components/ui/cn";
import { ShowRailIcon } from "@/components/ui/icons/ChatIcons";
const chatNoteClassName = "mt-[0.5rem] mb-[0.75rem] rounded-[10px] border border-[rgba(231,76,60,0.35)] bg-[rgba(231,76,60,0.12)] px-[0.9rem] py-[0.7rem] text-[0.9rem] text-[#ff9c9c] self-center text-center mx-auto w-full max-w-[min(38rem,100%)]";
const aiToggleLabelClassName = "flex items-center gap-[0.6rem] rounded-[0.95rem] border border-[rgba(148,163,184,0.35)] bg-[rgba(10,14,24,0.35)] px-[0.8rem] py-[0.55rem] text-[0.95rem] text-[color:var(--pt-120)]";
const aiToggleInputClassName = "h-[1.05rem] w-[1.05rem] accent-[color:var(--brand-primary)]";
export default function ChatBody({
  roomId = null,
  onBackHome = null,
  embedded = false
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const initialProfileOpen = embedded && searchParams?.get("profile") === "1";
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
  const [isMobile, setIsMobile] = useState(false);
  const [errorBanner, setErrorBanner] = useState(null);
  const [isCrisis, setIsCrisis] = useState(false);
  const [showSourcesPanel, setShowSourcesPanel] = useState(false);
  const [mobileRailVisible, setMobileRailVisible] = useState(false);
  const [mobileRailInteractionLocked, setMobileRailInteractionLocked] = useState(false);
  const mobileModeRef = useRef(null);
  const mobileRailShowTimerRef = useRef(0);
  const mobileRailUnlockTimerRef = useRef(0);
  const [isEntering, setIsEntering] = useState(false);
  const [isGeneratingForSave, setIsGeneratingForSave] = useState(false);
  const [analysisPanelWidth, setAnalysisPanelWidth] = useState(null);
  useEffect(() => {
    clearStaleScrollLock();
  }, []);
  useEffect(() => {
    const update = () => {
      if (typeof window === "undefined") return;
      const nextIsMobile = window.matchMedia?.("(max-width: 48em)")?.matches ?? window.innerWidth <= 768;
      setIsMobile(nextIsMobile);
      setMobileRailVisible(prev => {
        const prevMode = mobileModeRef.current;
        if (prevMode === null || prevMode !== nextIsMobile) {
          mobileModeRef.current = nextIsMobile;
          if (mobileRailShowTimerRef.current) {
            window.clearTimeout(mobileRailShowTimerRef.current);
            mobileRailShowTimerRef.current = 0;
          }
          if (mobileRailUnlockTimerRef.current) {
            window.clearTimeout(mobileRailUnlockTimerRef.current);
            mobileRailUnlockTimerRef.current = 0;
          }
          setMobileRailInteractionLocked(false);
          return nextIsMobile ? false : true;
        }
        return prev;
      });
    };
    update();
    if (typeof window === "undefined") return;
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  useEffect(() => {
    const node = chatContainerRef.current;
    if (!node || typeof window === "undefined") return;
    if (!isMobile) {
      node.style.setProperty("--chat-vk-offset", "0px");
      return;
    }
    const vv = window.visualViewport;
    const updateKeyboardOffset = () => {
      const offset = vv
        ? Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop))
        : 0;
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
  }, [isMobile]);
  const MAX_RENDERED_MESSAGES = 80;
  const PAGE_SIZE = 80;
  const rollMs = 560;
  const [renderLimit, setRenderLimit] = useState(MAX_RENDERED_MESSAGES);
  const [sendToAssistant, setSendToAssistant] = useState(false);
  const [profileOpen, setProfileOpen] = useState(() => initialProfileOpen);
  const [_rollDirection, setRollDirection] = useState("right");
  const [isRolling, setIsRolling] = useState(false);
  const {
    messages: roomMessages,
    blocked: roomBlocked,
    authRequired: roomAuthRequired,
    roomTitle
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
  const rollTimerRef = useRef(null);
  const rollSwapTimerRef = useRef(null);
  const maskRefreshRef = useRef(null);
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
  useEffect(() => {
    if (!embedded || typeof document === "undefined") return;
    document.body.classList.toggle("home-profile-open", profileOpen);
    return () => document.body.classList.remove("home-profile-open");
  }, [embedded, profileOpen]);
  useEffect(() => {
    if (!embedded) return;
    const wantsProfile = searchParams?.get("profile") === "1";
    if (wantsProfile === profileOpen || isRolling) return;
    setProfileOpen(wantsProfile);
  }, [embedded, isRolling, profileOpen, searchParams]);
  const mappedRoomMessages = useMemo(() => {
    if (!isRoomMode) return [];
    return (roomMessages || []).map(m => {
      const created = m?.createdAt ? new Date(m.createdAt).getTime() : Date.now();
      const isMine = m?.authorId && session?.user?.id && m.authorId === session.user.id;
      const isAssistant = m?.senderType === "ASSISTANT";
      const aiSeen = isAssistant ? true : isMine ? !!aiVisibleByMessageId.current.get(m.id) : false;
      return {
        id: m.id,
        role: isAssistant ? "ai" : isMine ? "user" : "member",
        text: m.content || "",
        authorName: isAssistant ? t("chat.aria.assistant") : m.authorName || "Liige",
        authorRole: m.authorRole || "MEMBER",
        createdAt: created,
        aiVisible: aiSeen
      };
    });
  }, [isRoomMode, roomMessages, session?.user?.id, t]);
  const getVisibleMessages = useCallback(msgs => {
    if (!isRoomMode) return msgs;
    const withTsAi = msgs.filter(m => m.role === "ai").map(m => ({
      ...m,
      createdAt: m.createdAt || Date.now()
    }));
    return [...mappedRoomMessages, ...withTsAi].sort((a, b) => {
      const ta = a.createdAt || 0;
      const tb = b.createdAt || 0;
      if (ta !== tb) return ta - tb;
      return String(a.id || "").localeCompare(String(b.id || ""));
    });
  }, [isRoomMode, mappedRoomMessages]);
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
    userId: session?.user?.id,
    userRole: session?.user?.role,
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
    sessionUserId: session?.user?.id,
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
  const syncProfileUrl = useCallback(open => {
    if (!embedded || typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (open) {
      url.searchParams.set("profile", "1");
    } else {
      url.searchParams.delete("profile");
    }
    window.history.replaceState({
      profileOpen: open
    }, "", `${url.pathname}${url.search}${url.hash}`);
  }, [embedded]);
  const triggerRoll = useCallback((direction, open) => {
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
  }, [closeSourcesPanel, isRolling, rollMs, showSourcesPanel, syncProfileUrl]);
  const openProfile = useCallback(() => {
    if (!embedded) {
      pushWithTransition(router, "/profiil");
      return;
    }
    triggerRoll("right", true);
  }, [embedded, router, triggerRoll]);
  const closeProfile = useCallback(() => {
    if (!embedded) return;
    triggerRoll("left", false);
  }, [embedded, triggerRoll]);
  const toggleProfile = useCallback(() => profileOpen ? closeProfile() : openProfile(), [closeProfile, openProfile, profileOpen]);
  const requestConversationsRefresh = useCallback(() => {
    try {
      window.dispatchEvent(new CustomEvent("sotsiaalai:refresh-conversations"));
    } catch {}
  }, []);
  const onRoomMessageSent = useCallback(msgId => {
    try {
      aiVisibleByMessageId.current.set(msgId, true);
    } catch {}
  }, []);
  const onAssistantMessageCreated = useCallback(msgId => {
    if (!isRoomMode || msgId == null) return;
    pendingRoomAiIdsRef.current = [...pendingRoomAiIdsRef.current, msgId];
  }, [isRoomMode]);
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
  useEffect(() => {
    if (!isRoomMode) return;
    const myId = session?.user?.id;
    if (!myId || !roomMessages?.length) return;
    const pending = pendingRoomAiIdsRef.current;
    if (!pending.length) return;
    const seen = seenRoomAiIdsRef.current;
    const freshAssistant = roomMessages.filter(m => m?.senderType === "ASSISTANT" && m?.authorId === myId && !seen.has(m.id));
    if (!freshAssistant.length) return;
    const toRemove = [...freshAssistant];
    freshAssistant.forEach(m => seen.add(m.id));
    if (!toRemove.length) return;
    setMessages(prev => {
      let next = prev;
      toRemove.forEach(() => {
        const localId = pending.shift();
        if (localId == null) return;
        next = next.filter(msg => msg.id !== localId);
      });
      pendingRoomAiIdsRef.current = pending;
      return next;
    });
  }, [isRoomMode, roomMessages, session?.user?.id, setMessages]);
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
  const showMobileRail = useCallback(() => {
    if (mobileRailInteractionLocked) return;
    setMobileRailInteractionLocked(true);
    if (mobileRailShowTimerRef.current) {
      window.clearTimeout(mobileRailShowTimerRef.current);
      mobileRailShowTimerRef.current = 0;
    }
    mobileRailShowTimerRef.current = window.setTimeout(() => {
      setMobileRailVisible(true);
      mobileRailShowTimerRef.current = 0;
    }, 140);
    if (mobileRailUnlockTimerRef.current) {
      window.clearTimeout(mobileRailUnlockTimerRef.current);
      mobileRailUnlockTimerRef.current = 0;
    }
    mobileRailUnlockTimerRef.current = window.setTimeout(() => {
      setMobileRailInteractionLocked(false);
      mobileRailUnlockTimerRef.current = 0;
    }, 620);
  }, [mobileRailInteractionLocked]);
  const handleComposerFocus = useCallback(() => {
    setInputFocused(true);
    if (!isMobile) return;
    const ensureVisible = () => {
      try {
        inputRef.current?.scrollIntoView({
          block: "end",
          inline: "nearest"
        });
      } catch {}
    };
    requestAnimationFrame(ensureVisible);
    setTimeout(ensureVisible, 80);
    setTimeout(ensureVisible, 180);
  }, [isMobile]);
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
      if (mobileRailShowTimerRef.current) {
        window.clearTimeout(mobileRailShowTimerRef.current);
        mobileRailShowTimerRef.current = 0;
      }
      if (mobileRailUnlockTimerRef.current) {
        window.clearTimeout(mobileRailUnlockTimerRef.current);
        mobileRailUnlockTimerRef.current = 0;
      }
    };
  }, []);
  useEffect(() => {
    if (!embedded) return;
    const shouldOpen = searchParams?.get("profile") === "1";
    if (typeof shouldOpen !== "boolean") return;
    setProfileOpen(prev => {
      if (prev === shouldOpen) return prev;
      return shouldOpen;
    });
    if (shouldOpen) setRollDirection("right");
  }, [embedded, searchParams]);
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
    const baseChatVars = {
      "--chat-diameter": "var(--profile-diameter)",
      "--chat-input-shift": "calc(clamp(1.5rem, 3.8dvh, 2.5rem) + 0.9rem)",
      "--chat-window-max-w": "clamp(19.4rem, 42.5vw, 28.2rem)",
      "--chat-window-shift-x": "clamp(-0.2rem, -0.42vw, -0.08rem)",
      "--chat-window-shift-y": isMobile ? "clamp(3.7rem, 9.5vh, 5.1rem)" : "0rem",
      "--chat-window-pad-top": "clamp(2.4rem, 4.8vh, 3.4rem)",
      "--chat-window-pad-bottom": isMobile
        ? "calc(env(safe-area-inset-bottom, 0px) + 4.45rem)"
        : "calc(clamp(2.2rem, 4.5dvh, 3.4rem) + 2.35rem)",
      "--chat-window-top-safe": isMobile
        ? "calc(env(safe-area-inset-top, 0px) + 2.7rem)"
        : "clamp(4.2rem, 7.2vh, 6.6rem)",
      "--chat-window-top-offset": "0.65rem",
      "--chat-window-bottom-gap": isMobile ? "2.1rem" : "1.9rem",
      "--chat-scroll-down-offset": isMobile ? "-1.9rem" : "0.2rem",
      "--chat-content-top-offset": "5.2rem",
      "--chat-content-spacer": "7.4rem",
      "--chat-content-bottom-spacer": "0.35rem"
    };
    const focusVars = focusActive
      ? {
          "--chat-diameter": "var(--chat-diameter-max)",
          "--chat-window-max-w": "clamp(20.1rem, 45.8vw, 30.9rem)",
          "--chat-window-shift-x": "clamp(-0.18rem, -0.36vw, -0.06rem)",
          "--chat-window-pad-top": "clamp(3.6rem, 6.4vh, 4.8rem)",
          "--chat-window-pad-bottom": "calc(clamp(1.6rem, 3.2dvh, 2.4rem) + 1.1rem)",
          "--chat-window-top-offset": "0.65rem",
          "--chat-window-bottom-gap": "0.4rem",
          "--chat-window-stack-shift": "calc(clamp(4rem, 7vh, 6rem) + 3.6rem)",
          "--chat-window-bottom-extend": "calc(clamp(16rem, 26vh, 20rem) + 3.6rem)",
          "--chat-scroll-button-shift": "calc(clamp(6rem, 10vh, 8rem) + 6.2rem)",
          "--chat-scroll-button-lift": "clamp(0.8rem, 1.4vh, 1.2rem)",
          "--chat-scroll-down-offset": "-1.0rem",
          "--chat-window-fade-bottom-focus": "clamp(1.1rem, 3vh, 1.8rem)",
          "--chat-input-row-gap": "clamp(2.6rem, 5.6vh, 3.9rem)",
          "--chat-input-focus-shift": "-2.35rem",
          "--chat-attach-left-pull": "-2.15rem",
          "--chat-inputbar-left-pull": "-2.25rem",
          "--chat-content-top-offset": "6.4rem",
          "--chat-content-spacer": "8.6rem",
          "--chat-content-bottom-spacer": "0.25rem"
        }
      : null;
    const chatVars = focusVars ? { ...baseChatVars, ...focusVars } : baseChatVars;
    const chatRingSurfaceStyle = !isLightTheme
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
        "relative z-[21] min-h-0 " +
        "[--chat-attach-left-pull:-1.15rem] [--chat-inputbar-left-pull:-1.1rem] " +
        "[--chat-hpad:clamp(1.25rem,2.5vw,1.6rem)] [--chat-input-max-w:clamp(8.2rem,23vw,15.8rem)] " +
        "[--chat-ai-offset:clamp(1.35rem,3vw,2.4rem)] [--hud-edge:clamp(1.05rem,2.5vw,1.55rem)] [--hud-icon:clamp(3rem,5vw,3.3rem)] " +
        "[--chat-scroll-down-offset:1.1rem] [--inputbar-h:3.2rem] " +
        "[--chat-input-shift:calc(clamp(1.5rem,3.8dvh,2.5rem)+1.8rem)] [--chat-input-focus-shift:0.85rem] " +
        "[--chat-pad-top:clamp(1.6rem,4.2vw,2.6rem)] [--chat-pad-bottom:0.9rem] " +
        "[--chat-window-max-w:clamp(17.5rem,40vw,26.5rem)] [--chat-window-pad-top:clamp(1.8rem,4vh,3rem)] " +
        "[--chat-window-pad-bottom:calc(clamp(2.2rem,4.5dvh,3.4rem)+2.35rem)] [--chat-window-top-safe:clamp(4.2rem,7.2vh,6.6rem)] " +
        "[--chat-window-top-offset:0.65rem] [--chat-window-bottom-gap:2.6rem] [--chat-window-focus-shift:0rem] " +
        "[--glass-center-offset:0px] [--hud-edge-safe:calc(var(--hud-edge)+env(safe-area-inset-top,0))] " +
        "[--hud-edge-left:env(safe-area-inset-left,0px)] [--hud-edge-right:env(safe-area-inset-right,0px)] " +
        "[--glass-edge-left:clamp(0.1rem,1.2vw,0.8rem)] [--glass-edge-right:clamp(0.1rem,1.2vw,0.8rem)] " +
        "[--rail-inset:0.2rem] [--chat-back-inset:clamp(0.2rem,1vw,0.6rem)] " +
        "[--chat-logo-height:clamp(12rem,32vw,26rem)] [--chat-logo-y:clamp(5.2rem,23vh,12.2rem)] " +
        "[@media(min-resolution:1.25dppx)_and_(max-resolution:1.49dppx)]:[--chat-logo-height:clamp(11rem,30vw,24rem)] " +
        "[@media(min-resolution:1.5dppx)]:[--chat-logo-height:clamp(10rem,28vw,22rem)] " +
        "[--chat-nav-top:calc(var(--hud-edge-safe)+var(--hud-icon)+13rem)] " +
        "[overflow-anchor:none] light:text-[#1f2937] " +
        "[scrollbar-width:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0 " +
        "[&::-webkit-scrollbar-track]:bg-transparent " +
        "[&>:not(.top-nav--chat):not(.chat-right-actions):not(.chat-nav-overlay):not(.chat-back-button)]:z-[1] " +
        "gap-[0.4rem] pt-[var(--chat-pad-top)] pb-[var(--chat-pad-bottom)] " +
        "overflow-hidden " +
        "[--ring-pad-top:0px] [--ring-pad-x:0px] [--ring-ui-reserve:var(--ring-ui-reserve-page)] " +
        "max-[48em]:[--hud-edge:clamp(0.55rem,3vw,0.95rem)] " +
        "max-[48em]:[--hud-icon:clamp(2.65rem,12vw,3rem)] " +
        "max-[48em]:[--chat-ai-offset:clamp(2.2rem,8vw,3.6rem)] " +
        "max-[48em]:[--hud-edge-safe:calc(var(--hud-edge)+env(safe-area-inset-top,0))] " +
        "max-[48em]:[--hud-edge-left:env(safe-area-inset-left,0px)] " +
        "max-[48em]:[--hud-edge-right:env(safe-area-inset-right,0px)] " +
        "max-[48em]:[--chat-hpad:calc(max(var(--hud-edge-left),var(--hud-edge-right))+var(--hud-icon)+0.05rem)] " +
        "max-[48em]:[--chat-nav-top:clamp(2.8rem,11vw,4.2rem)] " +
        "max-[48em]:[--chat-pad-top:clamp(0.75rem,2vh,1.1rem)] " +
        "max-[48em]:[--chat-pad-bottom:clamp(0.5rem,1.8vh,0.9rem)] " +
        "max-[48em]:[--chat-window-top-offset:0rem] " +
        "max-[48em]:[--chat-window-pad-top:clamp(0.32rem,1vh,0.65rem)] " +
        "max-[48em]:[--chat-window-bottom-safe:0rem] max-[48em]:[--chat-window-fade-top:0rem] max-[48em]:[--chat-window-fade-bottom:0rem] " +
        "max-[48em]:[--chat-content-top-offset:0rem] max-[48em]:[--chat-content-spacer:0.9rem] max-[48em]:[--chat-content-bottom-spacer:0.85rem] " +
        "max-[48em]:[--chat-logo-height:clamp(9rem,52vw,18rem)] " +
        "max-[48em]:[--chat-logo-y:clamp(3.6rem,24vh,9.4rem)] " +
        "max-[48em]:[--chat-input-shift:0rem] " +
        "max-[48em]:[--chat-inputbar-left-pull:0rem] " +
        "max-[48em]:[--chat-attach-left-pull:0rem] " +
        "max-[48em]:[--chat-hpad-left:clamp(0.7rem,3vw,1rem)] " +
        "max-[48em]:[--chat-hpad-right:clamp(0.7rem,3vw,1rem)] " +
        "max-[48em]:gap-[0.35rem] max-[48em]:flex-[1_1_auto] " +
        "max-[48em]:min-h-0 max-[48em]:mx-auto " +
        "min-[48em]:w-[var(--chat-diameter)] min-[48em]:h-[var(--chat-diameter)] " +
        "min-[48em]:[inline-size:var(--chat-diameter)] min-[48em]:[block-size:var(--chat-diameter)] " +
        "min-[48em]:min-w-[var(--chat-diameter)] min-[48em]:min-h-[var(--chat-diameter)] " +
        "min-[48em]:max-w-[var(--chat-diameter)] min-[48em]:max-h-[var(--chat-diameter)] " +
        "min-[48em]:flex-[0_0_auto] min-[48em]:self-center min-[48em]:aspect-square min-[48em]:rounded-full " +
        "min-[48em]:[--chat-pad-top:clamp(1.6rem,4.2vw,2.6rem)] min-[48em]:[--chat-pad-bottom:clamp(3.2rem,7vh,5rem)] " +
        "min-[48em]:[--chat-window-pad-top:clamp(0.9rem,2.2vh,1.6rem)] min-[48em]:[--chat-nav-top:50%] " +
        "min-[48em]:[--chat-hpad:clamp(2.2rem,6vw,3.4rem)] " +
        "min-[48em]:[transition:border-top-left-radius_400ms_cubic-bezier(0.22,0.61,0.36,1),border-top-right-radius_400ms_cubic-bezier(0.22,0.61,0.36,1),border-bottom-left-radius_400ms_cubic-bezier(0.22,0.61,0.36,1),border-bottom-right-radius_400ms_cubic-bezier(0.22,0.61,0.36,1),width_400ms_cubic-bezier(0.22,0.61,0.36,1),min-width_400ms_cubic-bezier(0.22,0.61,0.36,1),max-width_400ms_cubic-bezier(0.22,0.61,0.36,1),height_400ms_cubic-bezier(0.22,0.61,0.36,1),min-height_400ms_cubic-bezier(0.22,0.61,0.36,1),max-height_400ms_cubic-bezier(0.22,0.61,0.36,1),inline-size_400ms_cubic-bezier(0.22,0.61,0.36,1),block-size_400ms_cubic-bezier(0.22,0.61,0.36,1),transform_400ms_cubic-bezier(0.22,0.61,0.36,1)] " +
        "min-[48em]:[&_.top-nav--chat]:left-[max(0px,calc(var(--hud-edge-left)+0.9rem))] " +
        "min-[48em]:[&_.chat-right-actions]:right-[max(0px,calc(var(--hud-edge-right)+0.2rem))]",
      focusActive
        ? "chat-container--input-focus"
        : null
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
                >
                  {!isLightTheme ? <div className="chat-mask-layer absolute inset-0 z-0 rounded-[inherit] pointer-events-none bg-[color:var(--glass-surface-bg,rgba(0,0,0,0.25))] backdrop-blur-[var(--glass-blur-radius,1rem)] [-webkit-backdrop-filter:blur(var(--glass-blur-radius,1rem))] [mask-image:var(--chat-input-hole-mask,none)] [-webkit-mask-image:var(--chat-input-hole-mask,none)] [mask-size:100%_100%] [-webkit-mask-size:100%_100%] [mask-repeat:no-repeat] [-webkit-mask-repeat:no-repeat]" aria-hidden="true" /> : null}
                    {!profileOpen ? <BackButton
                        onClick={handleBackHome}
                        ariaLabel={t("chat.back_to_home")}
                        className={cn(glassPageBackMobileBottomCenterClassName, "chat-back-button pointer-events-auto z-[120] touch-manipulation max-[48em]:!fixed max-[48em]:!z-[220] max-[48em]:!top-[calc(env(safe-area-inset-top,0px)+0.34rem)]")}
                      /> : null}
                    {!profileOpen && isMobile && !mobileRailVisible ? <button
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
                        aria-label={t("chat.show_quick_actions", "Näita otseteid")}
                        className="chat-rail-show-btn pointer-events-auto touch-manipulation fixed z-[221] top-[calc(env(safe-area-inset-top,0px)+0.69rem)] left-[calc(env(safe-area-inset-left,0px)+5.15rem)] h-[3.58rem] w-[3.58rem] p-0 m-0 border-0 bg-transparent inline-flex items-center justify-center text-[#c57171] light:text-[#7a3a38] opacity-90 transition-[opacity,transform] duration-180 ease-out active:scale-[0.96] focus-visible:outline-none disabled:opacity-55 disabled:pointer-events-none min-[48.0625em]:hidden"
                      >
                        <ShowRailIcon isLightTheme={isLightTheme} className="h-[2.95rem] w-[2.95rem]" />
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


                {analysis.showAnalysisPanel && !analysis.uploadPreview ? <ChatAnalysisPanel t={t} analysisPanelRef={analysis.analysisPanelRef} analysisPanelMode={analysis.analysisPanelMode} uploadPreview={analysis.uploadPreview} uploadBusy={analysis.uploadBusy} uploadError={analysis.uploadError} uploadUsage={analysis.uploadUsage} previewText={analysis.previewText} analysisCollapsed={analysis.analysisCollapsed} toggleAnalysisCollapse={analysis.toggleAnalysisCollapse} docOnlyMode={analysis.docOnlyMode} setDocOnlyMode={analysis.setDocOnlyMode} extendedLabel={extendedLabel} contextHint={contextHint} inputRef={inputRef} onPickFile={analysis.onPickFile} setUploadPreview={analysis.setUploadPreview} setUploadError={analysis.setUploadError} setEphemeralChunks={analysis.setEphemeralChunks} closeAnalysisPanel={analysis.closeAnalysisPanel} isGenerating={isGenerating} prettifyFileName={prettifyFileName} /> : null}

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
                  <ChatAnalysisPanel t={t} analysisPanelRef={analysis.analysisPanelRef} analysisPanelMode={analysis.analysisPanelMode} uploadPreview={analysis.uploadPreview} uploadBusy={analysis.uploadBusy} uploadError={analysis.uploadError} uploadUsage={analysis.uploadUsage} previewText={analysis.previewText} analysisCollapsed={analysis.analysisCollapsed} toggleAnalysisCollapse={analysis.toggleAnalysisCollapse} docOnlyMode={analysis.docOnlyMode} setDocOnlyMode={analysis.setDocOnlyMode} extendedLabel={extendedLabel} contextHint={contextHint} inputRef={inputRef} onPickFile={analysis.onPickFile} setUploadPreview={analysis.setUploadPreview} setUploadError={analysis.setUploadError} setEphemeralChunks={analysis.setEphemeralChunks} closeAnalysisPanel={analysis.closeAnalysisPanel} isGenerating={isGenerating} prettifyFileName={prettifyFileName} />
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

