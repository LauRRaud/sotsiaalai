"use client";
import { useState, useRef, useEffect, useMemo, useCallback, useLayoutEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useAccessibility } from "@/components/accessibility/AccessibilityProvider";
import Link from "next/link";
import AllikadLight from "@/public/logo/heleallikad.svg";
import AllikadDark from "@/public/logo/tumeallikad.svg";
import ShowLight from "@/public/logo/showhele.svg";
import ShowDark from "@/public/logo/showtume.svg";
import InviteModal from "@/components/invite/InviteModal";
import TopNav from "@/components/nav/TopNav";
import { useI18n } from "@/components/i18n/I18nProvider";
import ChatAnalysisPanel from "./chat/ChatAnalysisPanel";
import ChatComposer from "./chat/ChatComposer";
import ConversationView from "./chat/ConversationView";
import ChatMessageItem from "./chat/ChatMessageItem";
import ChatSourcesPanel from "./chat/ChatSourcesPanel";
import { useRoomMessages } from "@/components/rooms/useRoomMessages";
import { pushWithTransition } from "@/lib/routeTransition";
import { useSpeech } from "../chat/hooks/useSpeech";
import { useChatStream } from "@/components/chat/hooks/useChatStream";
import { useChatConversationState } from "../chat/hooks/useChatConversationState";
import { formatSourceLabel, collapsePages, prettifyFileName } from "@/components/chat/utils/sources";

/* ---------- Komponent ---------- */
export default function ChatBody({ roomId = null }) {
  const router = useRouter();
  const { data: session } = useSession();
  const { t, locale } = useI18n();
  const { prefs } = useAccessibility();
  const isLightTheme = prefs?.theme === "light";
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
    "Vaikimisi on see inimeste jutt ja assistent ei nae sonumit."
  );
  const isRoomMode = Boolean(roomId);

  const crisisText = t(
    "chat.crisis.notice",
    "KRIIS: Kui on vahetu oht, helista 112. Lastele ja peredele on ’┐Į’┐Įp’┐Įevaringselt tasuta 116111 (Lasteabi)."
  );

  const userRole = useMemo(() => {
    const raw = session?.user?.role ?? (session?.user?.isAdmin ? "ADMIN" : null);
    const up = String(raw || "").toUpperCase();
    return up || "CLIENT";
  }, [session]);

  const [inputFocused, setInputFocused] = useState(false);
  const [topNavPinned, setTopNavPinned] = useState(false);
  const [errorBanner, setErrorBanner] = useState(null);
  const [isCrisis, setIsCrisis] = useState(false);
  const [showSourcesPanel, setShowSourcesPanel] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [sourcesPulse, setSourcesPulse] = useState(false);
  const [ephemeralChunks, setEphemeralChunks] = useState([]);
  const [isEntering, setIsEntering] = useState(false);
  const [isGeneratingForSave, setIsGeneratingForSave] = useState(false);
  const MAX_RENDERED_MESSAGES = 80;
  const PAGE_SIZE = 80;
  const [renderLimit, setRenderLimit] = useState(MAX_RENDERED_MESSAGES);
  // Dok-analuusi re’┐Įiim: false = kombineeritud (dok + RAG), true = ainult dokument
  const [docOnlyMode, setDocOnlyMode] = useState(true);
  const [uploadUsage, setUploadUsage] = useState(null);
  const [analysisPanelOpen, setAnalysisPanelOpen] = useState(false);
  const [analysisCollapsed, setAnalysisCollapsed] = useState(false);
  const [analysisPanelInline, setAnalysisPanelInline] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [sendToAssistant, setSendToAssistant] = useState(false);
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
  const handleInputBlur = (event) => {
    const next = event?.relatedTarget || document.activeElement;
    if (next && chatContainerRef.current?.contains(next)) return;
    setInputFocused(false);
  };
  useEffect(() => {
    if (!inputFocused) setTopNavPinned(false);
  }, [inputFocused]);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(max-width: 48em)");
    const update = () => setIsMobileViewport(!!mq.matches);
    update();
    if (mq.addEventListener) {
      mq.addEventListener("change", update);
      return () => mq.removeEventListener("change", update);
    }
    mq.addListener(update);
    return () => mq.removeListener(update);
  }, []);
  const inputRef = useRef(null);
  const composerDraftApiRef = useRef(null);
  const inputBarRef = useRef(null);
  const fileInputRef = useRef(null);
  const analysisPanelRef = useRef(null);
  const sourcesButtonRef = useRef(null);
  const sourcesPulseTimerRef = useRef(null);
  const prevSourcesCountRef = useRef(0);

  useLayoutEffect(() => {
    const box = chatContainerRef.current;
    const inputBar = inputBarRef.current;
    if (!box || !inputBar) return;

    if (isLightTheme) {
      box.style.removeProperty("--chat-input-hole-mask");
      return;
    }

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const encodeSvgMask = (svg) =>
      `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
    let lastMask = "";
    let raf = 0;

    const roundedRectPath = (x, y, width, height, radius) => {
      const r = clamp(radius, 0, Math.min(width, height) / 2);
      const right = x + width;
      const bottom = y + height;
      return [
        `M ${x + r} ${y}`,
        `H ${right - r}`,
        `A ${r} ${r} 0 0 1 ${right} ${y + r}`,
        `V ${bottom - r}`,
        `A ${r} ${r} 0 0 1 ${right - r} ${bottom}`,
        `H ${x + r}`,
        `A ${r} ${r} 0 0 1 ${x} ${bottom - r}`,
        `V ${y + r}`,
        `A ${r} ${r} 0 0 1 ${x + r} ${y}`,
        "Z",
      ].join(" ");
    };

      const updateMask = () => {
        const boxRect = box.getBoundingClientRect();
        const inputRect = inputBar.getBoundingClientRect();
        if (!boxRect.width || !boxRect.height) return;
        if (!inputRect.width || !inputRect.height) return;

      const boxW = Math.round(boxRect.width);
      const boxH = Math.round(boxRect.height);

      const toLocal = (rect) => ({
        x: Math.round(clamp(rect.left - boxRect.left, 0, boxW)),
        y: Math.round(clamp(rect.top - boxRect.top, 0, boxH)),
        w: Math.round(rect.width),
        h: Math.round(rect.height),
      });

      const inputLocal = toLocal(inputRect);
      const radiusRaw = Number.parseFloat(
        window.getComputedStyle(inputBar).borderTopLeftRadius
      );
      const radius = Number.isFinite(radiusRaw) ? radiusRaw : inputLocal.h / 2;

      const outerPath = `M 0 0 H ${boxW} V ${boxH} H 0 Z`;
        const holePad = 0;
        const holeX = clamp(inputLocal.x - holePad, 0, boxW);
        const holeY = clamp(inputLocal.y - holePad, 0, boxH);
        const holeW = clamp(inputLocal.w + holePad * 2, 0, boxW - holeX);
        const holeH = clamp(inputLocal.h + holePad * 2, 0, boxH - holeY);
        const holePath = roundedRectPath(
          holeX,
          holeY,
          holeW,
          holeH,
          radius + holePad
        );

      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${boxW} ${boxH}" preserveAspectRatio="none"><path fill="white" fill-rule="evenodd" d="${outerPath} ${holePath}"/></svg>`;
      const mask = encodeSvgMask(svg);

      if (mask !== lastMask) {
        box.style.setProperty("--chat-input-hole-mask", mask);
        lastMask = mask;
      }
    };

    const scheduleUpdate = () => {
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(updateMask);
    };

    scheduleUpdate();
    window.addEventListener("resize", scheduleUpdate);
    box.addEventListener("scroll", scheduleUpdate);

    let ro;
    let mo;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(scheduleUpdate);
      ro.observe(box);
      ro.observe(inputBar);
    }
    if (typeof MutationObserver !== "undefined") {
      mo = new MutationObserver(scheduleUpdate);
      mo.observe(box, { childList: true, subtree: true });
    }

    document.fonts?.ready?.then?.(scheduleUpdate).catch?.(() => {});

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", scheduleUpdate);
      box.removeEventListener("scroll", scheduleUpdate);
      ro?.disconnect?.();
      mo?.disconnect?.();
    };
  }, [isLightTheme]);

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
    hydrateFromServer,
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
  const conversationSources = useMemo(() => {
    const map = new Map();
    messages.forEach((m) => {
      if (!Array.isArray(m?.sources) || !m.sources.length) return;
      m.sources.forEach((src, idx) => {
        const url =
          typeof src?.url === "string"
            ? src.url
            : typeof src?.source === "string"
            ? src.source
            : undefined;
        const label = formatSourceLabel(src);
        const pageText =
          src?.pageRange ||
          collapsePages([
            ...(Array.isArray(src?.pages) ? src.pages : []),
            ...(src?.page ? [src.page] : []),
          ]);
        const section = typeof src?.section === "string" ? src.section : undefined;
        const key = src?.key || src?.id || url || `${label}-${pageText || ""}-${idx}`;
        const existing =
          map.get(key) ||
          {
            key,
            label,
            pageText,
            section,
            allUrls: [],
            occurrences: 0,
          };
        if (url && !existing.allUrls.includes(url)) {
          existing.allUrls.push(url);
        }
        existing.occurrences += 1;
        map.set(key, existing);
      });
    });
    return Array.from(map.values());
  }, [messages]);

  const hasConversationSources = conversationSources.length > 0;
  const hasAnalysisContent = !!(uploadPreview || uploadBusy);
  const hasAnyAnalysisState = !!(uploadPreview || uploadBusy || uploadError);
  const showAnalysisPanel = analysisPanelOpen || hasAnyAnalysisState;
  useEffect(() => {
    const currentCount = conversationSources.length;
    const prevCount = prevSourcesCountRef.current;
    prevSourcesCountRef.current = currentCount;

    if (currentCount > prevCount && !showSourcesPanel) {
      setSourcesPulse(true);
      if (sourcesPulseTimerRef.current) {
        window.clearTimeout(sourcesPulseTimerRef.current);
      }
      sourcesPulseTimerRef.current = window.setTimeout(() => {
        setSourcesPulse(false);
      }, 1000);
    }

    return () => {
      if (sourcesPulseTimerRef.current) {
        window.clearTimeout(sourcesPulseTimerRef.current);
      }
    };
  }, [conversationSources.length, showSourcesPanel]);
  const previewText = useMemo(() => {
    if (uploadPreview?.fullText && uploadPreview.fullText.trim()) {
      return uploadPreview.fullText;
    }
    if (uploadPreview?.preview && uploadPreview.preview.trim()) {
      return uploadPreview.preview;
    }
    if (ephemeralChunks?.length) {
      return ephemeralChunks.join("\n\n");
    }
    return "";
  }, [uploadPreview?.fullText, uploadPreview?.preview, ephemeralChunks]);
  const isAnalysisExpanded = Boolean(previewText && !analysisCollapsed);
  const forceOverlay = !uploadPreview;
  const analysisPanelMode = isAnalysisExpanded
    ? "expanded"
    : analysisPanelInline && !isMobileViewport && !forceOverlay
    ? "inline"
    : "overlay";

  const MAX_UPLOAD_MB = useMemo(() => {
    const v = Number(process.env.NEXT_PUBLIC_RAG_MAX_UPLOAD_MB || 50);
    return Number.isFinite(v) && v > 0 ? v : 50;
  }, []);
  const RAW_ALLOWED_MIME = String(
    process.env.NEXT_PUBLIC_RAG_ALLOWED_MIME ||
      "application/pdf,text/plain,text/markdown,text/html,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  );
  const ALLOWED_MIME_LIST = useMemo(
    () => RAW_ALLOWED_MIME.split(",").map((s) => s.trim()).filter(Boolean),
    [RAW_ALLOWED_MIME]
  );
  const ACCEPT_ATTR = useMemo(() => {
    const set = new Set();
    ALLOWED_MIME_LIST.forEach((m) => {
      if (m === "application/pdf") {
        set.add(m);
        set.add(".pdf");
      } else if (m === "text/plain") {
        set.add(m);
        set.add(".txt");
      } else if (m === "text/markdown") {
        set.add(m);
        set.add(".md");
        set.add(".markdown");
      } else if (m === "text/html") {
        set.add(m);
        set.add(".html");
        set.add(".htm");
      } else if (m === "application/msword") {
        set.add(m);
        set.add(".doc");
      } else if (
        m === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        set.add(m);
        set.add(".docx");
      } else {
        set.add(m);
      }
    });
    return Array.from(set).join(",");
  }, [ALLOWED_MIME_LIST]);

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
  const scrollAnalysisPanelIntoView = useCallback(() => {
    requestAnimationFrame(() => {
      try {
        const panel = analysisPanelRef.current;
        if (!panel) return;
        const mode = panel.dataset?.analysisMode;
        if (mode === "overlay" || mode === "expanded") return;
        panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } catch {}
    });
  }, []);
  const ensureAnalysisPanelVisible = useCallback(() => {
    setAnalysisCollapsed(false);
    setAnalysisPanelOpen(true);
    scrollAnalysisPanelIntoView();
  }, [scrollAnalysisPanelIntoView]);
  const toggleAnalysisCollapse = useCallback(() => {
    if (!hasAnalysisContent) return;
    setAnalysisCollapsed((prev) => !prev);
  }, [hasAnalysisContent]);
  const closeAnalysisPanel = useCallback(() => {
    if (hasAnalysisContent) return;
    setAnalysisPanelOpen(false);
    setAnalysisCollapsed(false);
  }, [hasAnalysisContent]);
  useEffect(() => {
    if (hasAnyAnalysisState) {
      setAnalysisCollapsed(false);
      setAnalysisPanelOpen(true);
      scrollAnalysisPanelIntoView();
    } else {
      setAnalysisCollapsed(false);
    }
  }, [hasAnyAnalysisState, scrollAnalysisPanelIntoView]);

  useLayoutEffect(() => {
    if (isMobileViewport || !showAnalysisPanel || isAnalysisExpanded) {
      setAnalysisPanelInline(false);
      return;
    }
    const node = chatWindowRef.current;
    if (!node) return;
    const updateLayout = () => {
      const hasOverflow = node.scrollHeight - node.clientHeight > 8;
      setAnalysisPanelInline((prev) => {
        const next = !hasOverflow;
        return prev === next ? prev : next;
      });
    };
    updateLayout();
    window.addEventListener("resize", updateLayout);
    let ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(updateLayout);
      ro.observe(node);
    }
    return () => {
      window.removeEventListener("resize", updateLayout);
      ro?.disconnect?.();
    };
  }, [isMobileViewport, showAnalysisPanel, isAnalysisExpanded, visibleMessages.length]);

  const refreshUsage = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      const res = await fetch("/api/chat/analyze-usage", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json().catch(() => null);
      if (data?.ok) {
        setUploadUsage({
          used: typeof data.used === "number" ? data.used : 0,
          limit: typeof data.limit === "number" ? data.limit : 0,
        });
      }
    } catch {}
  }, [session?.user?.id]);

  useEffect(() => {
    refreshUsage();
  }, [refreshUsage]);

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
    docOnlyMode,
    ephemeralChunks,
    uploadPreview,
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

  /* ---------- Vestluse vahetus s??t?????ndmus ---------- */
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

  /* ---------- Allikate paneeli sulgemine, kui allikaid pole ---------- */
  useEffect(() => {
    if (!hasConversationSources && showSourcesPanel) {
      closeSourcesPanel();
    }
  }, [hasConversationSources, showSourcesPanel, closeSourcesPanel]);

  const onPickFile = useCallback(() => {
    ensureAnalysisPanelVisible();
    if (uploadBusy || isGenerating) return;
    setUploadError(null);
    try {
      fileInputRef.current?.click?.();
    } catch {}
  }, [ensureAnalysisPanelVisible, isGenerating, uploadBusy]);

  const onFileChange = useCallback(
    async (e) => {
      const file = e.target?.files?.[0];
      if (!file) return;
      setUploadError(null);
      setDocOnlyMode(true);
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > MAX_UPLOAD_MB) {
        const sizeError = t("chat.upload.error_size", "Fail on liiga suur ({size}MB > {limit}MB).")
          .replace("{size}", sizeMB.toFixed(1))
          .replace("{limit}", String(MAX_UPLOAD_MB));
        setUploadError(sizeError);
        e.target.value = "";
        return;
      }
      try {
        setUploadBusy(true);
        const fd = new FormData();
        fd.append("file", file, file.name || "file");
        fd.append("mimeType", file.type || "");
        const res = await fetch("/api/chat/analyze-file", { method: "POST", body: fd });
        const data = await res.json().catch(() => ({ ok: false }));
        if (!res.ok || !data?.ok) {
          const statusError = t(
            "chat.upload.error_status",
            "Dokumendi anal’┐Į’┐Įs eba’┐Įnnestus (veakood {status})."
          ).replace("{status}", String(res.status));
          throw new Error(data?.message || statusError);
        }
        const chunksArray = Array.isArray(data.chunks) ? data.chunks : [];
        setUploadPreview({
          fileName: data.fileName || file.name,
          sizeMB:
            typeof data.sizeMB === "number" ? data.sizeMB : Number(sizeMB.toFixed(2)),
          mimeType: data.mimeType || file.type,
          preview: data.preview || "",
          fullText:
            typeof data.fullText === "string" && data.fullText.trim()
              ? data.fullText
              : chunksArray.length
              ? chunksArray.join("\n\n")
              : data.preview || "",
          chunksCount: chunksArray.length,
        });
        setEphemeralChunks(chunksArray);
        setDocOnlyMode(true);
        refreshUsage();
      } catch (err) {
        const genericError = t("chat.upload.error_generic", "Dokumendi anal’┐Į’┐Įs eba’┐Įnnestus.");
        setUploadError(err?.message || genericError);
        setUploadPreview(null);
        setEphemeralChunks([]);
        setDocOnlyMode(true);
      } finally {
        setUploadBusy(false);
        e.target.value = "";
      }
    },
    [MAX_UPLOAD_MB, refreshUsage, t]
  );

  const scrollToBottom = useCallback(() => {
    const node = chatWindowRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
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

  const BackButton = () => (
    <div className="chat-back-btn-wrapper">
      <button
        type="button"
        className="back-arrow-btn"
        onClick={() => pushWithTransition(router, "/")}
        aria-label={t("chat.back_to_home", "Tagasi avalehele")}
      >
        <span className="back-arrow-circle" />
      </button>
    </div>
  );


  useEffect(() => {
    if (prefs?.reduceMotion) {
      setIsEntering(false);
    }
  }, [prefs?.reduceMotion]);

  /* ---------- Render ---------- */
  return (
    <>
      <InviteModal />
      <div className={`chat-page-shell${isEntering ? " chat-entering" : ""}`}>
        <div
          className={`main-content glass-box chat-container chat-container--round${showAnalysisPanel ? " chat-container--analysis-open" : ""}${isAnalysisExpanded ? " chat-container--analysis-expanded" : ""}${inputFocused ? " chat-container--input-focus" : ""}`}
          role="region"
          aria-label={t("chat.page_label", "Vestluse sisu")}
          data-chat-bg={
            userRole === "SOCIAL_WORKER" || userRole === "ADMIN" ? "worker" : "client"
          }
          ref={chatContainerRef}
        >
          <div className="chat-window-fade chat-window-fade--top" aria-hidden="true" />
      {/* Parempoolne vertikaalne ikoonirida */}
      <div className="chat-right-actions">
        <Link href="/profiil" className="avatar-link" aria-label="Ava profiil">
          <span className="chat-avatar-abs" aria-hidden="true" />
          <span className="avatar-label">Profiil</span>
        </Link>
        <button
          type="button"
          ref={sourcesButtonRef}
          onClick={toggleSourcesPanel}
          className={`chat-sources-btn chat-sources-btn--icon${showSourcesPanel ? " chat-sources-btn--active" : ""}${sourcesPulse ? " is-pulse" : ""}`}
          aria-haspopup="dialog"
          aria-expanded={showSourcesPanel ? "true" : "false"}
          aria-controls="chat-sources-panel"
          aria-label={t("chat.sources.button", "Allikad ({count})").replace(
            "{count}",
            String(conversationSources.length)
          )}
          title={t("chat.sources.button", "Allikad ({count})").replace(
            "{count}",
            String(conversationSources.length)
          )}
          disabled={!hasConversationSources}
        >
          {isLightTheme ? (
            <AllikadLight className="chat-sources-icon" aria-hidden="true" role="img" />
          ) : (
            <AllikadDark className="chat-sources-icon" aria-hidden="true" role="img" />
          )}
        </button>
      </div>

      {/* Pealkiri ja nav */}
      <h1 className="glass-title">{t("chat.title", "SotsiaalAI")}</h1>
      {isRoomMode && roomTitle ? (
        <div className="room-title-sub">
          {roomTitle}
        </div>
      ) : null}
      <TopNav roomId={roomId} forceChat className={inputFocused && !topNavPinned ? "top-nav--collapsed" : ""} />
      <button
        type="button"
        className={`top-nav-toggle${inputFocused && !topNavPinned ? " is-visible" : ""}`}
        aria-label={t("chat.topnav.show", "Näita menüüd")}
        title={t("chat.topnav.show", "Näita menüüd")}
        onClick={() => {
          setTopNavPinned(false);
          setInputFocused(false);
          inputRef.current?.blur();
        }}
      >
        {isLightTheme ? (
          <ShowLight className="top-nav-toggle-icon" aria-hidden="true" role="img" />
        ) : (
          <ShowDark className="top-nav-toggle-icon" aria-hidden="true" role="img" />
        )}
      </button>

      {/* Kriisi teavitus */}
      {isCrisis ? (
        <div
          role="alert"
          style={{
            margin: "0.35rem 0 0.75rem",
            padding: "0.65rem 0.9rem",
            borderRadius: 10,
            border: "1px solid rgba(231,76,60,0.35)",
            background: "rgba(231,76,60,0.12)",
            color: "#ff9c9c",
            fontSize: "0.92rem",
          }}
        >
          {crisisText}
        </div>
      ) : null}

      {/* Vea teavitus */}
      {errorBanner ? (
        <div
          role="alert"
          className="chat-error-banner"
          style={{
            margin: "0.5rem 0 0.75rem",
            padding: "0.7rem 0.9rem",
            borderRadius: 10,
            border: "1px solid rgba(231,76,60,0.35)",
            background: "rgba(231,76,60,0.12)",
            color: "#ff9c9c",
            fontSize: "0.9rem",
          }}
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
        acceptAttr={ACCEPT_ATTR}
        ensureAnalysisPanelVisible={ensureAnalysisPanelVisible}
        fileInputRef={fileInputRef}
        onFileChange={onFileChange}
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
          className="glass-note chat-error-banner"
          style={{ marginTop: "0.5rem" }}
        >
          {recordingError}
        </div>
      ) : null}

      {showAnalysisPanel ? (
        <ChatAnalysisPanel
          t={t}
          analysisPanelRef={analysisPanelRef}
          analysisPanelMode={analysisPanelMode}
          uploadPreview={uploadPreview}
          uploadBusy={uploadBusy}
          uploadError={uploadError}
          uploadUsage={uploadUsage}
          previewText={previewText}
          analysisCollapsed={analysisCollapsed}
          toggleAnalysisCollapse={toggleAnalysisCollapse}
          docOnlyMode={docOnlyMode}
          setDocOnlyMode={setDocOnlyMode}
          extendedLabel={extendedLabel}
          contextHint={contextHint}
          inputRef={inputRef}
          onPickFile={onPickFile}
          setUploadPreview={setUploadPreview}
          setUploadError={setUploadError}
          setEphemeralChunks={setEphemeralChunks}
          closeAnalysisPanel={closeAnalysisPanel}
          isGenerating={isGenerating}
          prettifyFileName={prettifyFileName}
        />
      ) : null}

      <footer className={`chat-footer${showAnalysisPanel ? " chat-footer--analysis-open" : ""}`}>
        <BackButton />
      </footer>
      <ChatSourcesPanel
        open={showSourcesPanel}
        t={t}
        conversationSources={conversationSources}
        onClose={closeSourcesPanel}
        returnFocusRef={sourcesButtonRef}
      />

      </div>
    </div>
    </>
  );
}







