"use client";
import { useState, useRef, useEffect, useMemo, useCallback, useLayoutEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useAccessibility } from "@/components/accessibility/AccessibilityProvider";
import Link from "next/link";
import PaperclipLight from "@/public/logo/papercliphele.svg";
import PaperclipDark from "@/public/logo/paperclip.svg";
import AllikadLight from "@/public/logo/heleallikad.svg";
import AllikadDark from "@/public/logo/tumeallikad.svg";
import InviteModal from "@/components/invite/InviteModal";
import TopNav from "@/components/nav/TopNav";
import { useI18n } from "@/components/i18n/I18nProvider";
import SotsiaalAILoader from "@/components/ui/SotsiaalAILoader";
import { useRoomMessages } from "@/components/rooms/useRoomMessages";
import { pushWithTransition } from "@/lib/routeTransition";

/* ---------- Konstantsed seaded ---------- */
const MAX_HISTORY = 8;
const GLOBAL_CONV_KEY = "sotsiaalai:chat:convId";

/* ---------- Brauseri püsivus (sessionStorage) ---------- */
function makeChatStorage(key = "sotsiaalai:chat:v1") {
  const storage = typeof window !== "undefined" ? window.sessionStorage : null;
  function load() {
    if (!storage) return null;
    try {
      const raw = storage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed?.messages) ? parsed.messages : null;
    } catch {
      return null;
    }
  }
  function save(messages) {
    if (!storage) return;
    try {
      const maxMsgs = 30;
      const maxChars = 10000;
      let total = 0;
      const trimmed = messages.slice(-maxMsgs).map((m) => {
        const t = String(m.text || "");
        if (total >= maxChars) return { ...m, text: "" };
        const room = maxChars - total;
        const cut = t.length > room ? t.slice(0, room) : t;
        total += cut.length;
        return { ...m, text: cut };
      });
      storage.setItem(key, JSON.stringify({ messages: trimmed }));
    } catch {}
  }
  function clear() {
    storage?.removeItem(key);
  }
  return { load, save, clear };
}

/* ---------- SSE parser ---------- */
function createSSEReader(stream) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  const queue = [];
  function feed(chunk) {
    buffer += chunk;
    buffer = buffer.replace(/\n/g, "\n");
    let idx;
    while ((idx = buffer.indexOf("\n\n")) !== -1) {
      const rawEvent = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      let event = "message";
      const dataLines = [];
      for (const line of rawEvent.split("\n")) {
        if (!line) continue;
        if (line.startsWith(":")) continue;
        if (line.startsWith("event:")) event = line.slice(6).trim();
        else if (line.startsWith("data:")) dataLines.push(line.slice(5));
      }
      queue.push({ event, data: dataLines.join("\n") });
    }
  }
  return {
    async *[Symbol.asyncIterator]() {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        feed(decoder.decode(value, { stream: true }));
        while (queue.length) yield queue.shift();
      }
      if (buffer) {
        feed("\n\n");
        while (queue.length) yield queue.shift();
      }
    },
  };
}

/* ---------- Allikate abifunktsioonid ---------- */
function uniqueSortedPages(pages) {
  if (!Array.isArray(pages)) return [];
  const nums = pages.map((p) => Number(p)).filter((p) => Number.isFinite(p));
  return [...new Set(nums)].sort((a, b) => a - b);
}
function collapsePages(pages) {
  const sorted = uniqueSortedPages(pages);
  if (!sorted.length) return "";
  const out = [];
  let start = null;
  let prev = null;
  for (const page of sorted) {
    if (start === null) {
      start = prev = page;
      continue;
    }
    if (page === prev + 1) {
      prev = page;
      continue;
    }
    out.push(start === prev ? `${start}` : `${start}–${prev}`);
    start = prev = page;
  }
  if (start !== null) out.push(start === prev ? `${start}` : `${start}–${prev}`);
  return out.join(", ");
}
function asAuthorArray(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof v === "string") {
    const s = v.trim();
    if (!s) return [];
    try {
      const arr = JSON.parse(s);
      if (Array.isArray(arr)) return arr.map(String).map((x) => x.trim()).filter(Boolean);
    } catch {}
    return s.split(/[;,]/).map((x) => x.trim()).filter(Boolean);
  }
  return [];
}
function prettifyFileName(name) {
  if (typeof name !== "string" || !name.trim()) return "";
  const noExt = name.replace(/\.[a-z0-9]+$/i, "");
  return noExt.replace(/[_-]+/g, " ").trim();
}
function formatSourceLabel(src) {
  if (typeof src?.short_ref === "string" && src.short_ref.trim()) {
    return src.short_ref.trim();
  }
  const authors = asAuthorArray(src?.authors);
  const authorText = authors.length ? authors.join("; ") : null;
  const titleText =
    typeof src?.title === "string" && src.title.trim() ? src.title.trim() : "";
  const journal = typeof src?.journalTitle === "string" ? src.journalTitle.trim() : "";
  const issue =
    typeof src?.issueLabel === "string"
      ? src.issueLabel.trim()
      : typeof src?.issueId === "string"
      ? src.issueId.trim()
      : "";
  const year =
    typeof src?.year === "number"
      ? String(src.year)
      : typeof src?.year === "string"
      ? src.year.trim()
      : "";
  const pagesCombined =
    (typeof src?.pageRange === "string" && src.pageRange.trim()) ||
    collapsePages([
      ...(Array.isArray(src?.pages) ? src.pages : []),
      ...(typeof src?.page === "number" ? [src.page] : []),
    ]);
  const section = typeof src?.section === "string" ? src.section.trim() : "";
  const filePretty = src?.fileName ? prettifyFileName(src.fileName) : "";
  const issueSegment = [journal, issue && issue !== year ? issue : ""]
    .filter(Boolean)
    .join(" ")
    .trim();
  const contextSegments = [];
  if (issueSegment) contextSegments.push(issueSegment);
  if (year && !contextSegments.some((part) => part.includes(String(year)))) {
    contextSegments.push(String(year));
  }
  const tailSegments = [];
  if (contextSegments.length) tailSegments.push(contextSegments.join(", "));
  if (pagesCombined) tailSegments.push(`lk ${pagesCombined}`);
  if (section) tailSegments.push(section);
  const mainSegments = [];
  if (authorText && titleText) {
    mainSegments.push(`${authorText}. ${titleText}`);
  } else {
    if (authorText) mainSegments.push(authorText);
    if (titleText) mainSegments.push(titleText);
  }
  const labelParts = [...mainSegments, ...tailSegments].filter(Boolean);
  let label = labelParts.join(". ").trim();
  if (!label && filePretty) {
    const fallbackParts = [
      filePretty,
      contextSegments.join(", ") || null,
      pagesCombined ? `lk ${pagesCombined}` : null,
      section || null,
    ].filter(Boolean);
    label = fallbackParts.join(", ").trim();
  }
  if (!label) {
    const url = typeof src?.url === "string" ? src.url.replace(/^https?:\/\//, "") : "";
    label = url || "Allikas";
  }
  if (label && !/[.!?]$/.test(label)) {
    label = `${label}.`;
  }
  return label;
}
/** Normaliseeri serveri allikad */
function normalizeSources(sources) {
  if (!Array.isArray(sources)) return [];
  return sources.map((src, idx) => {
    const url = src?.url || src?.source || null;
    const page =
      typeof src?.page === "number" || typeof src?.page === "string" ? src.page : null;
    const label = formatSourceLabel(src);
    const key = src?.id || url || `${label}-${idx}`;
    const pages = Array.isArray(src?.pages) ? uniqueSortedPages(src.pages) : undefined;
    const pageLabel = src?.pageRange || collapsePages([...(pages || []), page]);
    const authors = asAuthorArray(src?.authors);
    const issueLabel =
      typeof src?.issueLabel === "string"
        ? src.issueLabel
        : typeof src?.issueId === "string"
        ? src.issueId
        : undefined;
    const year =
      typeof src?.year === "number" || typeof src?.year === "string" ? src.year : undefined;
    return {
      key,
      label,
      url,
      page,
      pageRange: pageLabel || undefined,
      fileName: src?.fileName,
      short_ref: typeof src?.short_ref === "string" ? src?.short_ref : undefined,
      journalTitle: typeof src?.journalTitle === "string" ? src?.journalTitle : undefined,
      authors,
      title: typeof src?.title === "string" ? src.title : undefined,
      issueLabel,
      issueId: typeof src?.issueId === "string" ? src?.issueId : undefined,
      year,
      section: typeof src?.section === "string" ? src.section : undefined,
      pages,
    };
  });
}

/* ---------- Throttle ---------- */
function throttle(fn, waitMs) {
  let last = 0;
  let timer = null;
  let lastArgs = null;
  return function throttled(...args) {
    const now = Date.now();
    const remaining = waitMs - (now - last);
    lastArgs = args;
    if (remaining <= 0) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      last = now;
      fn(...lastArgs);
      lastArgs = null;
    } else if (!timer) {
      timer = setTimeout(() => {
        last = Date.now();
        fn(...(lastArgs || []));
        lastArgs = null;
        timer = null;
      }, remaining);
    }
  };
}

/* ---------- Komponent ---------- */
export default function ChatBody({ roomId = null }) {
  const router = useRouter();
  const pathname = usePathname() || "";
  const { data: session } = useSession();
  const { t, locale } = useI18n();
  const { prefs } = useAccessibility();
  const isLightTheme = prefs?.theme === "light";
  const modeLabel =
    locale === "en" || locale === "ru"
      ? "Document analysis mode"
      : "Dokumendi analüüsi valik";
  const combinedLabel =
    locale === "en" || locale === "ru"
      ? "Analyze document with platform knowledge"
      : "Analüüsi dokumenti platvormi lisateadmistega";
  const docOnlyLabel =
    locale === "en" || locale === "ru"
      ? "Analyze uploaded document only"
      : "Analüüsi ainult üleslaetud dokumenti";
  const contextHint = t(
    "chat.upload.context_hint",
    "Valitud analüüsiviis määrab, kas assistent kasutab ainult üleslaetud dokumenti või ka SotsiaalAI andmebaasi lisateadmisi.",
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

  // eri keelte/pidude kaupa
  const storageKey = useMemo(() => {
    const uid = session?.user?.id || "anon";
    const loc = locale || "et";
    return `sotsiaalai:chat:${uid}:${(session?.user?.role || "CLIENT").toLowerCase()}:${loc}:v1`;
  }, [session, locale]);

  const chatStore = useMemo(() => makeChatStorage(storageKey), [storageKey]);

  const [convId, setConvId] = useState(null);
  const [messages, setMessages] = useState([]); // algab tühjalt
  const [input, setInput] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [errorBanner, setErrorBanner] = useState(null);
  const [isCrisis, setIsCrisis] = useState(false);
  const [showSourcesPanel, setShowSourcesPanel] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [ephemeralChunks, setEphemeralChunks] = useState([]);
  const [isEntering, setIsEntering] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechReady, setSpeechReady] = useState(false);
  // Dok-analuusi režiim: false = kombineeritud (dok + RAG), true = ainult dokument
  const [docOnlyMode, setDocOnlyMode] = useState(false);
  const [uploadUsage, setUploadUsage] = useState(null);
  const [analysisPanelOpen, setAnalysisPanelOpen] = useState(false);
  const [analysisCollapsed, setAnalysisCollapsed] = useState(false);
  const [previewScroll, setPreviewScroll] = useState(0);
  const [recording, setRecording] = useState(false);
  const [recordingPulse, setRecordingPulse] = useState(false);
  const [recordingError, setRecordingError] = useState(null);
  const [sendToAssistant, setSendToAssistant] = useState(false);
  const {
    messages: roomMessages,
    blocked: roomBlocked,
    authRequired: roomAuthRequired,
    reload: reloadRoomMessages,
    setMessages: setRoomMessages,
  } = useRoomMessages(roomId || "", 3000);
  const [roomMembers, setRoomMembers] = useState([]);
  const [roomRole, setRoomRole] = useState(null);
  const aiVisibleByMessageId = useRef(new Map());
  useEffect(() => {
    aiVisibleByMessageId.current = new Map();
  }, [roomId]);

  const chatWindowRef = useRef(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const inputBarRef = useRef(null);
  const fileInputRef = useRef(null);
  const analysisPanelRef = useRef(null);
  const previewRef = useRef(null);
  const scrollTrackRef = useRef(null);
  const isDraggingScroll = useRef(false);
  const sourcesButtonRef = useRef(null);
  const sourcesDialogRef = useRef(null);
  const sourcesCloseRef = useRef(null);
  const sourcesPrevFocusRef = useRef(null);
  const synthesisRef = useRef(null);
  const audioRef = useRef(null);
  const recorderRef = useRef(null);
  const recordingChunksRef = useRef([]);
  const recordingPulseTimerRef = useRef(null);
  const recordingLevelRef = useRef(0);
  const recordingStartedAtRef = useRef(0);
  const audioContextRef = useRef(null);
  const audioMeterTimerRef = useRef(null);
  const isUserAtBottom = useRef(true);
  const abortControllerRef = useRef(null);
  const mountedRef = useRef(false);
  const messageIdRef = useRef(1);
  const saveTimerRef = useRef(null);

  useEffect(() => {
    if (!isRoomMode || !roomId) return;
    let cancelled = false;
    async function loadMembers() {
      try {
        const res = await fetch(`/api/rooms/${roomId}/members`, { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok && data?.ok) {
          setRoomMembers(Array.isArray(data.members) ? data.members : []);
          setRoomRole(data.role || null);
        } else {
          setRoomMembers([]);
          setRoomRole(null);
        }
      } catch {
        if (!cancelled) {
          setRoomMembers([]);
          setRoomRole(null);
        }
      }
    }
    loadMembers();
    return () => {
      cancelled = true;
    };
  }, [isRoomMode, roomId]);

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

  const aiMessagesOnly = useMemo(
    () => messages.filter((m) => m.role === "ai"),
    [messages]
  );

  const visibleMessages = useMemo(() => {
    if (!isRoomMode) return messages;
    const withTsAi = aiMessagesOnly.map((m) => ({
      ...m,
      createdAt: m.createdAt || Date.now(),
    }));
    return [...mappedRoomMessages, ...withTsAi].sort((a, b) => {
      const ta = a.createdAt || 0;
      const tb = b.createdAt || 0;
      if (ta !== tb) return ta - tb;
      return String(a.id || "").localeCompare(String(b.id || ""));
    });
  }, [isRoomMode, mappedRoomMessages, aiMessagesOnly, messages]);

  const historyPayload = useMemo(() => {
    const recent = visibleMessages.slice(-MAX_HISTORY);
    const relevant = isRoomMode
      ? recent.filter((m) => m.role === "ai" || m.aiVisible)
      : recent;
    return relevant.map((m) => ({
      role: m.role === "member" ? "user" : m.role,
      text: m.text,
    }));
  }, [visibleMessages, isRoomMode]);
  const isStreamingAny = useMemo(
    () => isGenerating || visibleMessages.some((m) => m.role === "ai" && m.isStreaming),
    [isGenerating, visibleMessages]
  );
  const handlePreviewWheel = useCallback(
    (event) => {
      const panel = analysisPanelRef.current;
      const previewNode = previewRef.current;
      if (!panel || !previewNode) return;
      const mode = panel.dataset?.analysisMode;
      const isOverlay = mode === "overlay";
      const isExpanded = mode === "expanded";
      const rect = panel.getBoundingClientRect();
      const vh =
        typeof window !== "undefined"
          ? window.innerHeight || document.documentElement.clientHeight || 0
          : 0;
      const margin = 24;
      const maxScroll = previewNode.scrollHeight - previewNode.clientHeight;
      if (maxScroll <= 0) return;
      const deltaY = event.deltaY;
      const atTop = previewNode.scrollTop <= 0;
      const atBottom = previewNode.scrollTop >= maxScroll;

      const belowViewport = rect.bottom > vh - margin;
      if (!isOverlay && !isExpanded && belowViewport && vh > 0 && deltaY > 0) {
        if (event.cancelable) event.preventDefault();
        panel.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      const canScrollDown = deltaY > 0 && !atBottom;
      const canScrollUp = deltaY < 0 && !atTop;
      if (canScrollDown || canScrollUp) {
        if (event.cancelable) event.preventDefault();
        const next = Math.max(
          0,
          Math.min(maxScroll, previewNode.scrollTop + deltaY)
        );
        previewNode.scrollTop = next;
        const maxAfter = previewNode.scrollHeight - previewNode.clientHeight;
        if (maxAfter > 0) {
          setPreviewScroll(next / maxAfter);
        }
      }
    },
    [setPreviewScroll]
  );

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
    focusSourcesButton();
  }, [focusSourcesButton]);
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

  useEffect(() => {
    function updateScrollFromClientY(clientY) {
      const track = scrollTrackRef.current;
      const node = previewRef.current;
      if (!track || !node) return;
      const rect = track.getBoundingClientRect();
      const ratio = (clientY - rect.top) / rect.height;
      const clamped = Math.max(0, Math.min(1, ratio));
      const max = node.scrollHeight - node.clientHeight;
      if (max <= 0) return;
      setPreviewScroll(clamped);
      node.scrollTo({ top: clamped * max, behavior: "auto" });
    }
    function handleMouseMove(e) {
      if (!isDraggingScroll.current) return;
      e.preventDefault();
      updateScrollFromClientY(e.clientY);
    }
    function handleMouseUp() {
      isDraggingScroll.current = false;
    }
    function handleTouchMove(e) {
      if (!isDraggingScroll.current) return;
      const touch = e.touches?.[0];
      if (!touch) return;
      e.preventDefault();
      updateScrollFromClientY(touch.clientY);
    }
    function handleTouchEnd() {
      isDraggingScroll.current = false;
    }
    const passiveFalse = { passive: false };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove, passiveFalse);
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("touchcancel", handleTouchEnd);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove, passiveFalse);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, []);
  const appendMessage = useCallback((msg) => {
    const id = messageIdRef.current++;
    const createdAt = msg?.createdAt || Date.now();
    setMessages((prev) => [...prev, { ...msg, id, createdAt }]);
    return id;
  }, []);
  const mutateMessage = useCallback((id, updater) => {
    setMessages((prev) => {
      const idx = prev.findIndex((m) => m.id === id);
      if (idx === -1) return prev;
      const current = prev[idx];
      const updated = updater(current);
      if (!updated || updated === current) return prev;
      const next = [...prev];
      next[idx] = updated;
      return next;
    });
  }, []);

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

  /* ---------- Vestluse vahetus sündmus ---------- */
  useEffect(() => {
    function onSwitch(e) {
      const newId = e?.detail?.convId;
      if (!newId) return;
      try {
        window.sessionStorage.setItem(`${storageKey}:convId`, newId);
        window.sessionStorage.setItem(GLOBAL_CONV_KEY, newId);
      } catch {}
      setConvId(newId);
      setMessages([]);
      chatStore.save([]);
      setIsCrisis(false);
      try {
        window.dispatchEvent(
          new CustomEvent("sotsiaalai:toggle-conversations", { detail: { open: false } })
        );
      } catch {}
    }
    window.addEventListener("sotsiaalai:switch-conversation", onSwitch);
    return () => window.removeEventListener("sotsiaalai:switch-conversation", onSwitch);
  }, [chatStore, storageKey]);

  /* ---------- Scrolli state ---------- */
  useEffect(() => {
    const node = chatWindowRef.current;
    if (!node) return;
    function handleScroll() {
      const atBottom = node.scrollHeight - node.scrollTop - node.clientHeight <= 50;
      isUserAtBottom.current = atBottom;
      setShowScrollDown(!atBottom);
    }
    node.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => node.removeEventListener("scroll", handleScroll);
  }, []);
  useEffect(() => {
    if (!mountedRef.current) return;
    const node = chatWindowRef.current;
    if (node && isUserAtBottom.current) {
      node.scrollTop = node.scrollHeight;
    }
  }, [visibleMessages]);

  /* ---------- Mount + püsivuse taastamine ---------- */
  useEffect(() => {
    mountedRef.current = true;

    // Lae püsivus ja eemalda tühjad tekstid
    const stored = chatStore.load();
    if (stored && stored.length) {
      let nextId = 1;
      const hydrated = stored
        .filter((m) => typeof m?.text === "string" && m.text.trim().length > 0)
        .map((m) => ({ ...m, id: nextId++ }));
      messageIdRef.current = nextId;
      setMessages(hydrated);
    }

    const idFromGlobal =
      typeof window !== "undefined" ? window.sessionStorage.getItem(GLOBAL_CONV_KEY) : null;
    const idFromPerUser =
      typeof window !== "undefined" ? window.sessionStorage.getItem(`${storageKey}:convId`) : null;
    const initialConvId =
      idFromGlobal ||
      idFromPerUser ||
      (typeof window !== "undefined" && window.crypto?.randomUUID
        ? window.crypto.randomUUID()
        : String(Date.now()));
    setConvId(initialConvId);
    if (typeof window !== "undefined") {
      if (!idFromGlobal) window.sessionStorage.setItem(GLOBAL_CONV_KEY, initialConvId);
      if (!idFromPerUser) window.sessionStorage.setItem(`${storageKey}:convId`, initialConvId);
    }
    return () => {
      mountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, [chatStore, focusInput, storageKey]);

  /* ---------- Autosalvestus ---------- */
  useEffect(() => {
    if (!mountedRef.current) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      chatStore.save(messages);
    }, 250);
    return () => saveTimerRef.current && clearTimeout(saveTimerRef.current);
  }, [messages, chatStore]);

  /* ---------- Allikate paneeli sulgemine, kui allikaid pole ---------- */
  useEffect(() => {
    if (!hasConversationSources && showSourcesPanel) {
      closeSourcesPanel();
    }
  }, [hasConversationSources, showSourcesPanel, closeSourcesPanel]);

  /* ---------- Allikate dialoogi fookus + klahvid ---------- */
  const getDialogFocusables = useCallback((root) => {
    if (!root) return [];
    const nodes = root.querySelectorAll(
      [
        "a[href]",
        "area[href]",
        "button:not([disabled])",
        "input:not([disabled]):not([type='hidden'])",
        "select:not([disabled])",
        "textarea:not([disabled])",
        "[tabindex]:not([tabindex='-1'])",
      ].join(","),
    );
    return Array.from(nodes).filter((el) => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length));
  }, []);

  useEffect(() => {
    if (!showSourcesPanel) return undefined;
    // salvesta fookuse lähtestamiseks
    try { sourcesPrevFocusRef.current = document.activeElement; } catch {}
    const dialogEl = sourcesDialogRef.current;
    const closeEl = sourcesCloseRef.current;
    const focusables = getDialogFocusables(dialogEl);
    const initial = closeEl || focusables[0] || dialogEl;
    setTimeout(() => initial?.focus(), 0);

    function onKeyDown(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeSourcesPanel();
        return;
      }
      if (e.key !== "Tab" || !dialogEl) return;
      const list = getDialogFocusables(dialogEl);
      if (!list.length) {
        e.preventDefault();
        dialogEl.focus();
        return;
      }
      const first = list[0];
      const last = list[list.length - 1];
      const active = document.activeElement;
      if (e.shiftKey) {
        if (active === first || !dialogEl.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last || !dialogEl.contains(active)) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      const prev = sourcesPrevFocusRef.current;
      setTimeout(() => {
        if (prev && typeof prev.focus === "function") {
          try { prev.focus(); } catch {}
        }
      }, 0);
    };
  }, [showSourcesPanel, closeSourcesPanel, getDialogFocusables]);

  /* ---------- Speech Synthesis (kuula viimast AI vastust) ---------- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    synthesisRef.current = window.speechSynthesis || null;
    const synth = synthesisRef.current;
    function handleVoicesChanged() {
      setSpeechReady(true);
    }
    if (synth) {
      synth.addEventListener("voiceschanged", handleVoicesChanged);
      synth.getVoices(); // trigger load
      setSpeechReady(true);
      return () => synth.removeEventListener("voiceschanged", handleVoicesChanged);
    }
  }, []);

  useEffect(
    () => () => {
      try {
        synthesisRef.current?.cancel?.();
      } catch {}
      try {
        const audio = audioRef.current;
        if (audio) {
          audio.pause();
          audioRef.current = null;
        }
      } catch {}
      try {
        recorderRef.current?.stop?.();
      } catch {}
      try {
        recorderRef.current?.stream?.getTracks?.().forEach((t) => t.stop && t.stop());
      } catch {}
    },
    []
  );

  const stopSpeaking = useCallback(() => {
    try {
      synthesisRef.current?.cancel?.();
    } catch {}
    const audio = audioRef.current;
    if (audio) {
      try {
        audio.onended = null;
        audio.onerror = null;
        audio.pause();
      } catch {}
      audioRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  const speakWithBrowser = useCallback(
    (text) => {
      if (typeof window === "undefined") return;
      const synth = synthesisRef.current;
      if (!synth || !text) return;
      try {
        synth.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = synth.getVoices() || [];
        const normLocale = (locale || "").toLowerCase();
        const base = normLocale.split("-")[0] || normLocale;
        const prefs =
          base === "et"
            ? [normLocale, "et-ee", "et", "en-us", "en"]
            : base === "ru"
            ? [normLocale, "ru-ru", "ru", "en-us", "en", "et-ee", "et"]
            : base === "en"
            ? [normLocale, "en-us", "en-gb", "en", "et-ee", "et", "ru-ru", "ru"]
            : [normLocale, base, "en-us", "en", "et-ee", "et", "ru-ru", "ru"].filter(Boolean);
        const pick = prefs
          .map((pref) =>
            voices.find((v) => (v.lang || "").toLowerCase().startsWith(pref)),
          )
          .find(Boolean);
        if (pick) {
          utterance.voice = pick;
          utterance.lang = pick.lang || normLocale || "en-US";
        } else {
          utterance.lang = normLocale || "en-US";
        }
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        synth.speak(utterance);
      } catch {
        setIsSpeaking(false);
      }
    },
    [locale],
  );

  const speakLatestReply = useCallback(async () => {
    if (typeof window === "undefined") return;
    const lastAi = [...visibleMessages].reverse().find((m) => m.role === "ai" && m.text);
    const text = (lastAi?.text || "").trim();
    if (!text) return;
    const base = (locale || "").toLowerCase().split("-")[0];
    // ru/en -> kasuta otse brauseri hääli, et vältida serveri kulu
    if (base === "ru" || base === "en") {
      stopSpeaking();
      speakWithBrowser(text);
      return;
    }
    stopSpeaking();
    setIsSpeaking(true);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.slice(0, 4500), locale }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.ok && data?.audioContent) {
        const src = `data:${data.contentType || "audio/mpeg"};base64,${data.audioContent}`;
        const audio = new Audio(src);
        audioRef.current = audio;
        audio.onended = () => {
          audioRef.current = null;
          setIsSpeaking(false);
        };
        audio.onerror = () => {
          audioRef.current = null;
          setIsSpeaking(false);
        };
        await audio.play();
        return;
      }
    } catch {
      // ignore ja lange fallbackile
    }
    stopSpeaking();
    speakWithBrowser(text);
  }, [visibleMessages, locale, stopSpeaking, speakWithBrowser]);

  /* ---------- Speech-to-Text (mikrofon) ---------- */
  const triggerRecordingPulse = useCallback(() => {
    if (recordingPulseTimerRef.current) {
      clearTimeout(recordingPulseTimerRef.current);
    }
    setRecordingPulse(true);
    recordingPulseTimerRef.current = setTimeout(() => {
      setRecordingPulse(false);
      recordingPulseTimerRef.current = null;
    }, 600);
  }, []);

  const stopRecording = useCallback(() => {
    try {
      recorderRef.current?.stop?.();
    } catch {}
    try {
      recorderRef.current?.stream?.getTracks?.().forEach((t) => t.stop && t.stop());
    } catch {}
    recorderRef.current = null;
    setRecording(false);
  }, []);

  const stopAudioMeter = useCallback(() => {
    if (audioMeterTimerRef.current) {
      clearInterval(audioMeterTimerRef.current);
      audioMeterTimerRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }
  }, []);

  const startAudioMeter = useCallback((stream) => {
    const AudioContextClass =
      typeof window !== "undefined" ? window.AudioContext || window.webkitAudioContext : null;
    if (!AudioContextClass) return;
    try {
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      const data = new Uint8Array(analyser.fftSize);
      audioMeterTimerRef.current = setInterval(() => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i += 1) {
          sum += Math.abs(data[i] - 128);
        }
        const avg = sum / data.length;
        if (avg > recordingLevelRef.current) recordingLevelRef.current = avg;
      }, 120);
    } catch {}
  }, []);

  const handleMic = useCallback(async () => {
    if (recording) {
      stopRecording();
      stopAudioMeter();
      return;
    }
    setRecordingError(null);
    if (recordingPulseTimerRef.current) {
      clearTimeout(recordingPulseTimerRef.current);
      recordingPulseTimerRef.current = null;
    }
    setRecordingPulse(false);
    if (!navigator?.mediaDevices?.getUserMedia) {
      setRecordingError(t("chat.mic.unsupported", "Mikrofon pole toetatud selles brauseris."));
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordingLevelRef.current = 0;
      recordingStartedAtRef.current = Date.now();
      startAudioMeter(stream);
      recordingChunksRef.current = [];
      const rec = new MediaRecorder(stream);
      recorderRef.current = rec;
      rec.ondataavailable = (e) => {
        if (e?.data?.size) recordingChunksRef.current.push(e.data);
      };
      rec.onstop = async () => {
        setRecording(false);
        stopAudioMeter();
        triggerRecordingPulse();
        const blob = new Blob(recordingChunksRef.current, { type: rec.mimeType || "audio/webm" });
        if (!blob.size) return;
        const durationMs = Math.max(0, Date.now() - recordingStartedAtRef.current);
        const maxLevel = recordingLevelRef.current;
        if (maxLevel < 3.5 && durationMs > 500) {
          setRecordingError(t("chat.mic.silence", "Dikteerimine: heli ei tuvastatud."));
          return;
        }
        try {
          const fd = new FormData();
          fd.append("audio", blob, "audio.webm");
          fd.append("locale", locale || "auto");
          const res = await fetch("/api/stt", { method: "POST", body: fd });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || data?.ok === false || !data?.text) {
            throw new Error(data?.message || t("chat.mic.error", "Dikteerimine ebaõnnestus."));
          }
          setInput((prev) => (prev ? `${prev} ${data.text}` : data.text));
        } catch (err) {
          setRecordingError(err?.message || t("chat.mic.error", "Dikteerimine ebaõnnestus."));
        }
      };
      rec.start();
      setRecording(true);
    } catch (err) {
      setRecordingError(err?.message || t("chat.mic.cannot_start", "Mikrofoni ei saanud avada."));
      stopRecording();
      stopAudioMeter();
    }
  }, [
    locale,
    recording,
    startAudioMeter,
    stopAudioMeter,
    stopRecording,
    t,
    setInput,
    triggerRecordingPulse,
  ]);

  useEffect(() => {
    return () => {
      if (recordingPulseTimerRef.current) {
        clearTimeout(recordingPulseTimerRef.current);
      }
      stopAudioMeter();
    };
  }, [stopAudioMeter]);

  /* ---------- TAASTA SERVERIST (/api/chat/run) ---------- */
  useEffect(() => {
    if (!convId) return;
    let cancelled = false;
    async function hydrateFromServer() {
      try {
        const r = await fetch(`/api/chat/run?convId=${encodeURIComponent(convId)}`, {
          cache: "no-store",
        });
        if (!r.ok) return;
        const data = await r.json();
        if (!data?.ok || cancelled) return;

        const currentGlobalId =
          typeof window !== "undefined" ? window.sessionStorage.getItem(GLOBAL_CONV_KEY) : convId;
        if (convId !== currentGlobalId) return;

        const serverText = String(data.text || "");
        const serverTextTrim = serverText.trim();
        const serverSources = normalizeSources(data.sources ?? []);
        const serverCrisis = !!data.isCrisis;
        const serverMessages = Array.isArray(data.messages) ? data.messages : [];

        setIsCrisis(serverCrisis);

        if (serverMessages.length) {
          setMessages(() => {
            let nextId = 1;
            const mapped = serverMessages
              .map((msg) => {
                const normalizedRole =
                  msg.role === "user" ? "user" : msg.role === "ai" ? "ai" : null;
                if (!normalizedRole) return null;
                return {
                  id: nextId++,
                  role: normalizedRole,
                  text: typeof msg.text === "string" ? msg.text : "",
                  sources:
                    normalizedRole === "ai" ? normalizeSources(msg.sources ?? []) : undefined,
                  isStreaming: false,
                };
              })
              .filter(Boolean);
            messageIdRef.current = nextId;
            return mapped;
          });
          return;
        }

        if (!serverTextTrim) return;

        setMessages((prev) => {
          const next = [...prev];
          let aiIdx = -1;
          for (let i = next.length - 1; i >= 0; i--) {
            if (next[i].role === "ai") {
              aiIdx = i;
              break;
            }
          }
          if (aiIdx === -1) {
            next.push({
              id: (next.at(-1)?.id ?? 0) + 1,
              role: "ai",
              text: serverTextTrim,
              sources: serverSources,
              isStreaming: false,
            });
          } else {
            const cur = next[aiIdx];
            if (serverTextTrim.length > (cur.text || "").length) {
              next[aiIdx] = {
                ...cur,
                text: serverTextTrim,
                sources: serverSources,
                isStreaming: false,
              };
            }
          }
          return next;
        });
      } catch {}
    }
    hydrateFromServer();
    const throttled = throttle(() => {
      if (document.visibilityState === "visible") hydrateFromServer();
    }, 2500);
    window.addEventListener("focus", throttled);
    document.addEventListener("visibilitychange", throttled);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", throttled);
      document.removeEventListener("visibilitychange", throttled);
    };
  }, [convId]);

  /* ---------- Sõnumi saatmine ---------- */
  const sendMessage = useCallback(
    async (e) => {
      e?.preventDefault();
      if (isGenerating) return;
      const trimmed = input.trim();
      if (!trimmed) return;

      setErrorBanner(null);
      setIsCrisis(false); // lähtesta, kuni server meta saadab
      if (isRoomMode) {
        if (roomBlocked) {
          setErrorBanner(t("chat.room.blocked", "Vestluses osalemine ei ole hetkel voimalik. Palun vota uhendust oma spetsialistiga."));
          return;
        }
        if (roomAuthRequired) {
          setErrorBanner(t("chat.room.auth_required", "Sessioon aegus. Palun logi uuesti sisse."));
          return;
        }
        try {
          const res = await fetch(`/api/rooms/${roomId}/messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: trimmed }),
          });
          const data = await res.json().catch(() => ({}));
          if (res.status === 403) {
            setErrorBanner(data?.message || t("chat.room.blocked", "Vestluses osalemine ei ole hetkel voimalik. Palun vota uhendust oma spetsialistiga."));
            return;
          }
          if (res.status === 401) {
            setErrorBanner(t("chat.room.auth_required", "Sessioon aegus. Palun logi uuesti sisse."));
            return;
          }
          if (!res.ok || data?.ok === false) {
            const msg = data?.message || t("chat.room.send_error", "Viga saatmisel");
            throw new Error(msg);
          }
          if (data?.message?.id && sendToAssistant) {
            aiVisibleByMessageId.current.set(data.message.id, true);
          }
        } catch (err) {
          setErrorBanner(err?.message || t("chat.room.send_error", "Viga saatmisel"));
          return;
        }
      }

      const shouldSendToAssistant = isRoomMode ? sendToAssistant : true;
      const userMsg = { role: "user", text: trimmed, aiVisible: shouldSendToAssistant };
      appendMessage(userMsg);
      setInput("");
      setIsGenerating(shouldSendToAssistant);
      focusInput();

      if (!shouldSendToAssistant) {
        return;
      }
      const controller = new AbortController();
      const clientTimeout = setTimeout(() => controller.abort(), 180000);
      abortControllerRef.current = controller;

      let streamingMessageId = null;
      const STREAM_DELAY_MS = 35; // aeglustab trükkimise tempot
      const STREAM_CHARS_PER_TICK = 6;
      let pendingText = "";
      let streamTimer = null;
      let visibleText = "";
      let sources = [];
      const pushVisibleText = () => {
        if (streamingMessageId == null) return;
        mutateMessage(streamingMessageId, (msg) => ({ ...msg, text: visibleText }));
      };
      const flushChunk = () => {
        if (!pendingText) return;
        const chunk = pendingText.slice(0, STREAM_CHARS_PER_TICK);
        pendingText = pendingText.slice(chunk.length);
        visibleText += chunk;
        pushVisibleText();
      };
      const ensureStreamTimer = () => {
        if (streamTimer) return;
        streamTimer = setInterval(() => {
          flushChunk();
          if (!pendingText) {
            clearInterval(streamTimer);
            streamTimer = null;
          }
        }, STREAM_DELAY_MS);
      };
      const flushAllPending = () => {
        if (streamTimer) {
          clearInterval(streamTimer);
          streamTimer = null;
        }
        if (pendingText) {
          visibleText += pendingText;
          pendingText = "";
          pushVisibleText();
        }
      };

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            history: historyPayload,
            role: userRole,
            stream: true,
            persist: true,
            convId,
            uiLocale: locale || "et",
            ...(ephemeralChunks.length
              ? {
                  ephemeralChunks,
                  ...(uploadPreview?.fileName
                    ? { ephemeralSource: { fileName: uploadPreview.fileName } }
                    : {}),
                  combineSources: !docOnlyMode,
                }
              : {}),
          }),
          signal: controller.signal,
        });

        clearTimeout(clientTimeout);

        if (res.status === 401 || res.status === 403) {
          const params = new URLSearchParams({ callbackUrl: "/vestlus" });
          window.location.href = `/api/auth/signin?${params.toString()}`;
          return;
        }
        if (res.status === 429) {
          const retry = res.headers.get("retry-after");
          throw new Error(
            retry
              ? `Liiga palju päringuid. Proovi ~${retry}s pärast.`
              : "Liiga palju päringuid. Proovi varsti uuesti."
          );
        }

        const contentType = res.headers.get("content-type") || "";

        // Mitte-streamiv vastus
        if (!contentType.includes("text/event-stream")) {
          let data = null;
          try {
            data = await res.json();
          } catch {}
          if (!res.ok) {
            const msg = data?.message || res.statusText || "Assistent ei vastanud.";
            throw new Error(msg);
          }
          const replyText =
            (data?.answer ?? data?.reply) || "Vabandust, ma ei saanud praegu vastust koostada.";
          const sources = normalizeSources(data?.sources);
          setIsCrisis(!!data?.isCrisis);
          appendMessage({ role: "ai", text: replyText, sources, aiVisible: true });
          requestConversationsRefresh();
          return;
        }

        // Streamiv vastus (SSE)
        if (!res.body) throw new Error("Assistent ei saatnud voogu.");
        const reader = createSSEReader(res.body);
        streamingMessageId = appendMessage({ role: "ai", text: "", isStreaming: true, aiVisible: true });
        let streamEnded = false;

        for await (const ev of reader) {
          if (ev.event === "meta") {
            try {
              const payload = JSON.parse(ev.data);
              const rawSources = Array.isArray(payload?.sources)
                ? payload.sources
                : Array.isArray(payload?.groups)
                ? payload.groups
                : null;
              if (rawSources) {
                sources = normalizeSources(rawSources);
                mutateMessage(streamingMessageId, (msg) => ({ ...msg, sources }));
              }
              if (typeof payload?.isCrisis !== "undefined") {
                setIsCrisis(!!payload.isCrisis);
              }
            } catch {}
          } else if (ev.event === "delta") {
            try {
              const payload = JSON.parse(ev.data);
              if (payload?.t) {
                pendingText += payload.t; // lisame puhvrisse ja aeglustame kuvamist
                ensureStreamTimer();
              }
            } catch {}
          } else if (ev.event === "error") {
            let msg = "Voo viga.";
            try {
              const payload = JSON.parse(ev.data);
              if (payload?.message) msg = payload.message;
            } catch {}
            throw new Error(msg);
          } else if (ev.event === "done") {
            streamEnded = true;
            break;
          }
        }

        // finalize
        flushAllPending();
        mutateMessage(streamingMessageId, (msg) => ({
          ...msg,
          text: (visibleText || "").trim() || "Vabandust, ma ei saanud praegu vastust koostada.",
          sources,
          isStreaming: false,
        }));
        requestConversationsRefresh();
        streamingMessageId = null;
      } catch (err) {
        flushAllPending();
        clearTimeout(clientTimeout);
        if (err?.name === "AbortError") {
          if (streamingMessageId != null) {
            mutateMessage(streamingMessageId, (msg) => ({
              ...msg,
              text: msg.text
                ? `${msg.text}\n\n(Vastuse genereerimine peatati.)`
                : "Vastuse genereerimine peatati.",
              isStreaming: false,
            }));
            streamingMessageId = null;
          } else {
            appendMessage({ role: "ai", text: "Vastuse genereerimine peatati." });
          }
        } else {
          const errText = err?.message || "Vabandust, vastust ei õnnestunud saada.";
          setErrorBanner(errText);
          if (streamingMessageId != null) {
            mutateMessage(streamingMessageId, (msg) => ({
              ...msg,
              text: `Viga: ${errText}`,
              sources: [],
              isStreaming: false,
            }));
            streamingMessageId = null;
          } else {
            appendMessage({ role: "ai", text: `Viga: ${errText}` });
          }
        }
      } finally {
        if (streamTimer) {
          clearInterval(streamTimer);
          streamTimer = null;
        }
        pendingText = "";
        setIsGenerating(false);
        abortControllerRef.current = null;
        focusInput();
      }
    },
    [
      appendMessage,
      convId,
      ephemeralChunks,
      focusInput,
      historyPayload,
      input,
      isGenerating,
      locale,
      mutateMessage,
      uploadPreview,
      docOnlyMode,
      userRole,
      requestConversationsRefresh,
      isRoomMode,
      roomBlocked,
      roomAuthRequired,
      roomId,
      sendToAssistant,
      t,
    ]
  );

  const handleStop = useCallback((e) => {
    e?.preventDefault();
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsGenerating(false);
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (!isGenerating && input.trim()) {
          void sendMessage();
        }
      }
    },
    [input, isGenerating, sendMessage]
  );

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
            "Dokumendi analüüs ebaõnnestus (veakood {status})."
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
        setDocOnlyMode(false);
        refreshUsage();
      } catch (err) {
        const genericError = t("chat.upload.error_generic", "Dokumendi analüüs ebaõnnestus.");
        setUploadError(err?.message || genericError);
        setUploadPreview(null);
        setEphemeralChunks([]);
        setDocOnlyMode(false);
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

  const openConversations = useCallback(() => {
    try {
      window.dispatchEvent(
        new CustomEvent("sotsiaalai:toggle-conversations", { detail: { open: true } })
      );
    } catch {}
  }, []);

  const goRooms = useCallback(() => {
    try {
      pushWithTransition(router, "/ruum");
    } catch {}
  }, [router]);

  const openInvite = useCallback(() => {
    try {
      window.dispatchEvent(new CustomEvent("sotsiaalai:open-invite"));
    } catch {}
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
  const hasInput = Boolean(input.trim());

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
          className={`chat-sources-btn chat-sources-btn--icon${showSourcesPanel ? " chat-sources-btn--active" : ""}`}
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
      <TopNav roomId={roomId} forceChat />

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
      {isRoomMode && roomMembers.length ? (
        <div className="room-chat__members" style={{ margin: "0.5rem 0", display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
          {roomMembers.map((m) => (
            <span key={m.userId || m.name} className="chat-msg-tag chat-msg-tag--human">
              {m.name || "Liige"}{m.role ? ` - ${m.role}` : ""}
            </span>
          ))}
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


      <main className="chat-main" style={{ position: "relative" }}>
        <div
          id="chat-window"
          className="chat-window u-mobile-scroll u-mobile-safe-pad"
          ref={chatWindowRef}
          role="region"
          aria-label={t("chat.aria.messages", "Chat messages")}
          aria-live="polite"
          aria-busy={isStreamingAny ? "true" : "false"}
          style={{ position: "relative" }}
        >
          {/* Vestluse sõnumid */}
          {visibleMessages.map((msg) => {
            const isAssistant = msg.role === "ai";
            const isOwn = msg.role === "user";
            const variant = isAssistant ? "chat-msg-ai" : "chat-msg-user";
            const audienceClass = isAssistant
              ? ""
              : isRoomMode
              ? isOwn && msg.aiVisible
                ? "chat-msg--ai-targeted"
                : "chat-msg--human-only"
              : "";
            const authorLabel =
              isAssistant
                ? t("chat.aria.assistant", "Assistent")
                : isOwn
                ? t("chat.aria.user", "Sina")
                : msg.authorName || t("chat.aria.user", "Liige");
            return (
              <div
                key={msg.id}
                className={`chat-msg ${variant} ${audienceClass}`}
                role="article"
                tabIndex={0}
              >
                {isOwn && isRoomMode ? (
                  <div className="chat-msg-meta">
                    <span className={`chat-msg-tag${msg.aiVisible ? " chat-msg-tag--ai" : " chat-msg-tag--human"}`}>
                      {msg.aiVisible
                        ? t("chat.tag.ai_visible", "Assistent naeb")
                        : t("chat.tag.human_only", "Ainult inimesed")}
                    </span>
                  </div>
                ) : null}
                {!isAssistant && !isOwn && (msg.authorName || msg.authorRole) ? (
                  <div className="chat-msg-meta">
                    <span className="chat-msg-tag chat-msg-tag--human">
                      {msg.authorName || "Liige"}
                      {msg.authorRole ? ` (${msg.authorRole})` : ""}
                    </span>
                  </div>
                ) : null}
                <span className="sr-only">
                  {authorLabel}
                  {": "}
                </span>
                <div style={{ whiteSpace: "pre-wrap" }}>{msg.text}</div>
              </div>
            );
          })}
          <div className="chat-window-fade chat-window-fade--bottom" aria-hidden="true" />
        </div>

        {showScrollDown && (
  <button
    className="scroll-down-btn"
    onClick={scrollToBottom}
    aria-label={t("chat.scroll_to_bottom")}
    title={t("chat.scroll_to_bottom_title")}
    aria-controls="chat-window"
  >
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 9l8 8 8-8" />
    </svg>
  </button>
)}

        <form
          className="chat-input-row"
          onSubmit={isGenerating ? handleStop : sendMessage}
          autoComplete="off"
        >
          <button
            type="button"
            className="chat-attach-btn chat-send-btn chat-attach-as-send"
            aria-label={t("chat.upload.aria")}
            title={t("chat.upload.tooltip")}
            onClick={() => {
              ensureAnalysisPanelVisible();
            }}
          >
            {isLightTheme ? (
              <PaperclipLight className="chat-attach-icon" aria-hidden="true" role="img" />
            ) : (
              <PaperclipDark className="chat-attach-icon" aria-hidden="true" role="img" />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT_ATTR}
            onChange={onFileChange}
            style={{ display: "none" }}
          />
          <label htmlFor="chat-input" className="sr-only">
            {t("chat.input.label")}
          </label>
            <div className="chat-inputbar chat-inputbar--mobile u-mobile-reset-position" ref={inputBarRef}>
              <div className="chat-input-field-wrap">
                <textarea
                  id="chat-input"
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  className="chat-input-field"
                  disabled={isGenerating || (isRoomMode && (roomBlocked || roomAuthRequired))}
                  rows={1}
                />
              </div>
            <button
              type="button"
              className="chat-send-btn chat-listen-btn"
              aria-label={t("chat.listen.last_reply", "Kuula viimast vastust")}
              title={t("chat.listen.title", "Kuula viimast assistendi vastust")}
              onClick={speakLatestReply}
              disabled={!speechReady || !visibleMessages.some((m) => m.role === "ai" && m.text)}
              data-speaking={isSpeaking ? "true" : "false"}
            >
              <svg
                aria-hidden="true"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ width: "1.4rem", height: "1.4rem" }}
              >
                <path d="M11 5L6 9H2v6h4l5 4z" />
                <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
              </svg>
            </button>
            {hasInput || isGenerating || isStreamingAny ? (
              <button
                type="submit"
                className={`chat-send-btn${(isGenerating || isStreamingAny) ? " chat-send-btn--active" : ""}`}
                aria-label={isGenerating ? t("chat.send.stop","Peata vastus") : t("chat.send.send","Saada sõnum")}
                title={isGenerating ? t("chat.send.title_stop","Peata vastus") : t("chat.send.title_send","Saada (Enter)")}
                disabled={(isRoomMode && (roomBlocked || roomAuthRequired)) || (!hasInput && !isGenerating && !isStreamingAny)}
                data-loader-active={(isGenerating || isStreamingAny) ? "true" : "false"}
              >
                <SotsiaalAILoader
                  animated={isGenerating || isStreamingAny}
                  ariaHidden
                  className="send-loader"
                  showBottomGlow={false}
                />
              </button>
            ) : (
              <button
                type="button"
                className={`chat-send-btn${recording ? " chat-send-btn--active" : ""}`}
                aria-label={recording ? t("chat.mic.stop", "Lõpeta salvestus") : t("chat.mic.start", "Alusta dikteerimist")}
                title={recording ? t("chat.mic.stop", "Lõpeta salvestus") : t("chat.mic.start", "Alusta dikteerimist")}
                onClick={handleMic}
                disabled={isRoomMode && (roomBlocked || roomAuthRequired)}
                data-speaking={recording ? "true" : "false"}
                data-recording={recording ? "true" : "false"}
                data-recording-complete={recordingPulse ? "true" : "false"}
              >
                <svg
                  aria-hidden="true"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ width: "1.4rem", height: "1.4rem" }}
                >
                  <path d="M12 1a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              </button>
            )}
          </div>
        </form>

        {isRoomMode ? (
          <div className="chat-ai-toggle">
            <label className="glass-checkbox chat-ai-checkbox">
              <input
                type="checkbox"
                checked={sendToAssistant}
                onChange={(e) => setSendToAssistant(e.target.checked)}
              />
              <span className="checkbox-text">
                {t("chat.ai_toggle.label", "Saada assistendile")}
              </span>
            </label>
            <div className="chat-ai-note">
              {t("chat.ai_toggle.note", "Vaikimisi on see inimeste jutt ja assistent ei nae sonumit.")}
            </div>
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
          <section
            ref={analysisPanelRef}
            className={`chat-analysis-panel${isAnalysisExpanded ? " chat-analysis-panel--expanded" : " chat-analysis-panel--overlay"}`}
            role="region"
            aria-live="polite"
            aria-label={t("chat.upload.summary")}
            data-analysis-mode={isAnalysisExpanded ? "expanded" : "overlay"}
          >
            <div className="chat-analysis-card">
              <header className="chat-analysis-header" style={{ position: "relative" }}>
                {uploadPreview ? (
                  <div className="chat-analysis-titleblock">
                    <div className="chat-analysis-file-name">
                      {prettifyFileName(uploadPreview.fileName)}
                    </div>
                  </div>
                ) : null}
                <button
                  type="button"
                  className="chat-analysis-close modal-close-btn"
                  onClick={() => {
                    setUploadPreview(null);
                    setUploadError(null);
                    setEphemeralChunks([]);
                    setDocOnlyMode(false);
                    closeAnalysisPanel();
                  }}
                  aria-label={t("buttons.close", "Sulge")}
                />
              </header>
              <div className="chat-analysis-body">
                {uploadBusy ? (
                  <div className="chat-analysis-status">
                    {t("chat.upload.busy")}
                  </div>
                ) : null}
                {uploadError ? <div className="chat-analysis-error">{uploadError}</div> : null}
                {uploadPreview ? (
                  <>
                    <div className="chat-analysis-controls chat-analysis-controls--context chat-analysis-controls--header">
                      <div id="chat-doc-mode-label" className="chat-analysis-mode-label">
                        {modeLabel}
                      </div>
                      <div
                        className="glass-radio-group chat-analysis-mode-group"
                        role="radiogroup"
                        aria-labelledby="chat-doc-mode-label"
                        aria-describedby="chat-upload-context-hint"
                      >
                        <label>
                          <input
                            type="radio"
                            name="chat-doc-mode"
                            value="combined"
                            checked={!docOnlyMode}
                            onChange={() => setDocOnlyMode(false)}
                          />
                          <span className="glass-radio-label-text">{combinedLabel}</span>
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="chat-doc-mode"
                            value="doc-only"
                            checked={docOnlyMode}
                            onChange={() => setDocOnlyMode(true)}
                          />
                          <span className="glass-radio-label-text">{docOnlyLabel}</span>
                        </label>
                      </div>
                    </div>
                    <p id="chat-upload-context-hint" className="sr-only">
                      {contextHint}
                    </p>
                    {previewText ? (
                                            <div className="chat-analysis-actions chat-analysis-actions--inline">
                        <button
                          type="button"
                          className="chat-context-info chat-context-info--inline"
                          aria-label={contextHint}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          <span className="chat-context-info-icon" aria-hidden="true">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 320 512"
                              className="chat-context-info-icon-svg"
                            >
                              <path d="M80 160c0-35.3 28.7-64 64-64h32c35.3 0 64 28.7 64 64v3.6c0 21.8-11.1 42.1-29.4 53.8l-42.2 27.1c-25.2 16.2-40.4 44.1-40.4 74V320c0 17.7 14.3 32 32 32s32-14.3 32-32v-1.4c0-8.2 4.2-15.8 11-20.2l42.2-27.1c36.6-23.6 58.8-64.1 58.8-107.7V160c0-70.7-57.3-128-128-128H144C73.3 32 16 89.3 16 160c0 17.7 14.3 32 32 32s32-14.3 32-32zm80 320a40 40 0 1 0 0-80 40 40 0 1 0 0 80z" />
                            </svg>
                          </span>
                          <span className="chat-context-info-tooltip">
                            {contextHint}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={toggleAnalysisCollapse}
                          className="btn-base chat-analysis-jump"
                        >
                          {analysisCollapsed
                            ? t("chat.upload.summary_show", "Näita dokumenti")
                            : t("chat.upload.summary_hide", "Peida tekst")}
                        </button>
                      </div>
                    ) : null}

                    {!analysisCollapsed && previewText ? (
                      <div className="chat-analysis-preview-wrap">
                        <button
                          type="button"
                          className="btn-base chat-analysis-jump chat-analysis-jump--floating chat-analysis-jump--text"
                          onClick={() => {
                            inputRef.current?.focus();
                            inputRef.current?.scrollIntoView({
                              behavior: "smooth",
                              block: "center",
                            });
                          }}
                          aria-label={t("chat.upload.jump_to_chat", "Küsi")}
                          title={t("chat.upload.jump_to_chat", "Küsi")}
                        >
                          {t("chat.upload.jump_to_chat", "Küsi")}
                        </button>
                        <div
                          ref={previewRef}
                          className="chat-analysis-preview chat-upload-preview-scroll"
                          tabIndex={0}
                          aria-label={t("chat.upload.preview", "Dokumendi tekst")}
                          onWheel={handlePreviewWheel}
                          onScroll={() => {
                            const node = previewRef.current;
                            if (!node) return;
                            const max = node.scrollHeight - node.clientHeight;
                            if (max <= 0) {
                              setPreviewScroll(0);
                              return;
                            }
                            setPreviewScroll(node.scrollTop / max);
                          }}
                        >
                          {previewText}
                        </div>
                        <div
                          ref={scrollTrackRef}
                          className="chat-analysis-scroll-track"
                          onClick={(event) => {
                            const track = scrollTrackRef.current;
                            const node = previewRef.current;
                            if (!track || !node) return;
                            const rect = track.getBoundingClientRect();
                            const ratio = (event.clientY - rect.top) / rect.height;
                            const max = node.scrollHeight - node.clientHeight;
                            if (max <= 0) return;
                            const clamped = Math.max(0, Math.min(1, ratio));
                            setPreviewScroll(clamped);
                            node.scrollTo({ top: clamped * max, behavior: "smooth" });
                          }}
                          onMouseDown={(event) => {
                            const track = scrollTrackRef.current;
                            const node = previewRef.current;
                            if (track && node) {
                              const rect = track.getBoundingClientRect();
                              const ratio = (event.clientY - rect.top) / rect.height;
                              const max = node.scrollHeight - node.clientHeight;
                              if (max > 0) {
                                const clamped = Math.max(0, Math.min(1, ratio));
                                setPreviewScroll(clamped);
                                node.scrollTo({ top: clamped * max, behavior: "auto" });
                              }
                            }
                            isDraggingScroll.current = true;
                            event.preventDefault();
                          }}
                          onTouchStart={(event) => {
                            const track = scrollTrackRef.current;
                            const node = previewRef.current;
                            const touch = event.touches?.[0];
                            if (track && node && touch) {
                              const rect = track.getBoundingClientRect();
                              const ratio = (touch.clientY - rect.top) / rect.height;
                              const max = node.scrollHeight - node.clientHeight;
                              if (max > 0) {
                                const clamped = Math.max(0, Math.min(1, ratio));
                                setPreviewScroll(clamped);
                                node.scrollTo({ top: clamped * max, behavior: "auto" });
                              }
                            }
                            isDraggingScroll.current = true;
                            event.preventDefault();
                          }}
                          aria-hidden="true"
                        >
                          <div
                            className="chat-analysis-scroll-thumb"
                            style={{
                              top: `calc(${previewScroll * 100}% + 0.3rem)`,
                              opacity: previewScroll > 0.92 || previewScroll < 0.02 ? 0 : 1,
                              transition: "opacity 0.16s ease",
                            }}
                            onMouseDown={(event) => {
                              const track = scrollTrackRef.current;
                              const node = previewRef.current;
                              if (track && node) {
                                const rect = track.getBoundingClientRect();
                                const ratio = (event.clientY - rect.top) / rect.height;
                                const max = node.scrollHeight - node.clientHeight;
                                if (max > 0) {
                                  const clamped = Math.max(0, Math.min(1, ratio));
                                  setPreviewScroll(clamped);
                                  node.scrollTo({ top: clamped * max, behavior: "auto" });
                                }
                              }
                              isDraggingScroll.current = true;
                              event.preventDefault();
                            }}
                            onTouchStart={(event) => {
                              const track = scrollTrackRef.current;
                              const node = previewRef.current;
                              const touch = event.touches?.[0];
                              if (track && node && touch) {
                                const rect = track.getBoundingClientRect();
                                const ratio = (touch.clientY - rect.top) / rect.height;
                                const max = node.scrollHeight - node.clientHeight;
                                if (max > 0) {
                                  const clamped = Math.max(0, Math.min(1, ratio));
                                  setPreviewScroll(clamped);
                                  node.scrollTo({ top: clamped * max, behavior: "auto" });
                                }
                              }
                              isDraggingScroll.current = true;
                              event.preventDefault();
                            }}
                          >
                            <SotsiaalAILoader size="1rem" animated={false} ariaHidden />
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </>
                    ) : (
                    <div className="chat-analysis-empty">
                      <button
                        type="button"
                        className="btn-base"
                        onClick={onPickFile}
                        disabled={uploadBusy || isGenerating}
                      >
                        {t("chat.upload.aria")}
                      </button>
                    <p className="chat-analysis-meta chat-analysis-meta--spaced">
                      {uploadUsage?.limit
                        ? t("chat.upload.usage", "{used}/{limit} analüüsi täna")
                            .replace(
                              "{used}",
                              String(Math.max(0, Math.min(uploadUsage.used ?? 0, uploadUsage.limit ?? Infinity)))
                            )
                            .replace("{limit}", String(uploadUsage.limit ?? 0))
                        : ""}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        ) : null}

        <footer className={`chat-footer${showAnalysisPanel ? " chat-footer--analysis-open" : ""}`}>
          <BackButton />
        </footer>

        {showSourcesPanel ? (
        <div
          id="chat-sources-panel"
          ref={sourcesDialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={t("chat.sources.dialog_label", "Vestluse allikad")}
          onClick={closeSourcesPanel}
          tabIndex={-1}
          className="chat-sources-overlay"
        >
          <div onClick={(e) => e.stopPropagation()} className="chat-sources-dialog">
            <div className="chat-sources-header">
              <h2 className="chat-sources-title">
                {t("chat.sources.heading", "Vestluse allikad")}
              </h2>
              <button
                type="button"
                ref={sourcesCloseRef}
                onClick={closeSourcesPanel}
                className="chat-sources-close"
              >
                {t("buttons.close", "Sulge")}
              </button>
            </div>

            {conversationSources.length === 0 ? (
              <p className="chat-sources-empty">
                {t("chat.sources.empty", "Vestluses ei ole allikaid.")}
              </p>
            ) : (
              <ol className="chat-sources-list">
                {conversationSources.map((src, idx) => (
                  <li key={src.key || idx} className="chat-source-item">
                    <div className="chat-source-label">
                      {src.label}
                    </div>
                    {src.occurrences > 1 ? (
                      <div className="chat-source-usage">
                        {t("chat.sources.used_multiple", "Kasutatud {count} vestluse lõigus.").replace("{count}", String(src.occurrences))}
                      </div>
                    ) : null}
                    
                    {src.pageText && !`${src.label}`.toLowerCase().includes("lk") ? (
                      <div className="chat-source-pages">
                        {t("chat.sources.pages", "Leheküljed: {pages}").replace("{pages}", String(src.pageText))}
                      </div>
                    ) : null}
                    {src.allUrls && src.allUrls.length ? (
                      <div
                        className="chat-source-links"
                      >
                        {src.allUrls.map((url, urlIdx) => (
                          <a
                            key={`${src.key || idx}-url-${urlIdx}`}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="chat-source-link"
                          >
                            {src.allUrls.length > 1
                              ? t("chat.sources.open_indexed", "Ava ({index})").replace("{index}", String(urlIdx + 1))
                              : t("chat.sources.open_single", "Ava allikas")}
                          </a>
                        ))}
                      </div>
                    ) : null}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      ) : null}
        </main>
      </div>
    </div>
    </>
  );
}



