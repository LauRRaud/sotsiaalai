"use client";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
// NOTE: using SVG as static image for avatar
import Paperclip from "@/public/logo/paperclip.svg";
import { useI18n } from "@/components/i18n/I18nProvider";
import SotsiaalAILoader from "@/components/ui/SotsiaalAILoader";
import ShinyText from "@/components/effects/TextAnimations/ShinyText/ShinyText";
import TextType from "@/components/effects/TextAnimations/TextType/TextType";

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
export default function ChatBody() {
  const router = useRouter();
  const { data: session } = useSession();
  const { t, locale } = useI18n();

  const introGreeting = t("chat.intro.greeting", "Hello!");
  const introMessage = t(
    "chat.intro.message",
    "SotsiaalAI assists you with information based on trusted sources."
  );
  const introCTA = t("chat.intro.cta", "Kirjuta mulle!");
  const introAnimationTexts = useMemo(
    () => [introGreeting, introMessage, introCTA],
    [introGreeting, introMessage, introCTA]
  );
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [errorBanner, setErrorBanner] = useState(null);
  const [isCrisis, setIsCrisis] = useState(false);
  const [showSourcesPanel, setShowSourcesPanel] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [ephemeralChunks, setEphemeralChunks] = useState([]);
  const [useAsContext, setUseAsContext] = useState(false);
  const [uploadUsage, setUploadUsage] = useState(null);
  const [analysisPanelOpen, setAnalysisPanelOpen] = useState(false);
  const [analysisCollapsed, setAnalysisCollapsed] = useState(false);

  const chatWindowRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const analysisPanelRef = useRef(null);
  const sourcesButtonRef = useRef(null);
  const isUserAtBottom = useRef(true);
  const abortControllerRef = useRef(null);
  const mountedRef = useRef(false);
  const messageIdRef = useRef(1);
  const saveTimerRef = useRef(null);

  const historyPayload = useMemo(
    () => messages.slice(-MAX_HISTORY).map((m) => ({ role: m.role, text: m.text })),
    [messages]
  );
  const isStreamingAny = useMemo(
    () => isGenerating || messages.some((m) => m.role === "ai" && m.isStreaming),
    [isGenerating, messages]
  );

  // Intro nähtav kuni on vähemalt üks mitte-tühi sõnum
  const hasRealContent = useMemo(
    () => messages.some((m) => typeof m?.text === "string" && m.text.trim().length > 0),
    [messages]
  );

  // Koonda vestluse allikad
  const conversationSources = useMemo(() => {
    const map = new Map();
    let order = 0;
    let fallbackCounter = 0;
    for (const msg of messages) {
      if (msg?.role !== "ai" || !Array.isArray(msg?.sources)) continue;
      for (const src of msg.sources) {
        if (!src) continue;
        const key =
          (src.key && String(src.key)) ||
          (src.url ? `url:${src.url}` : null) ||
          (src.short_ref ? `short:${src.short_ref}` : null) ||
          (src.label ? `label:${src.label}` : null) ||
          (src.fileName ? `file:${src.fileName}` : null) ||
          `auto-${fallbackCounter++}`;
        let entry = map.get(key);
        if (!entry) {
          entry = {
            key,
            order: order++,
            occurrences: 0,
            shortRef: typeof src.short_ref === "string" ? src.short_ref.trim() : null,
            labels: new Set(),
            fileName: src.fileName || null,
            urls: new Set(),
            pageRanges: new Set(),
            pages: new Set(),
            authors: new Set(),
            title: typeof src?.title === "string" ? src.title : null,
            journalTitle: typeof src?.journalTitle === "string" ? src.journalTitle : null,
            issueLabel: typeof src?.issueLabel === "string" ? src.issueLabel : null,
            issueId: typeof src?.issueId === "string" ? src.issueId : null,
            year: src.year ?? null,
            section: typeof src?.section === "string" ? src.section : null,
          };
          map.set(key, entry);
        }
        entry.occurrences += 1;
        if (!entry.shortRef && typeof src?.short_ref === "string") {
          entry.shortRef = src.short_ref.trim();
        }
        if (typeof src.label === "string" && src.label.trim()) {
          entry.labels.add(src.label.trim());
        }
        if (!entry.fileName && src.fileName) {
          entry.fileName = src.fileName;
        }
        if (src.url) entry.urls.add(src.url);
        if (src.pageRange) entry.pageRanges.add(src.pageRange);
        if (Array.isArray(src.pages)) {
          for (const p of src.pages) {
            const num = Number(p);
            if (Number.isFinite(num)) entry.pages.add(num);
          }
        }
        const pageNum = Number(src.page);
        if (Number.isFinite(pageNum)) entry.pages.add(pageNum);
        if (Array.isArray(src.authors)) {
          for (const author of src.authors) {
            if (author && typeof author === "string") entry.authors.add(author);
          }
        }
        if (!entry.title && typeof src?.title === "string" && src.title.trim()) {
          entry.title = src.title.trim();
        }
        if (!entry.journalTitle && typeof src?.journalTitle === "string" && src.journalTitle.trim()) {
          entry.journalTitle = src.journalTitle.trim();
        }
        if (!entry.issueLabel && typeof src?.issueLabel === "string" && src.issueLabel.trim()) {
          entry.issueLabel = src.issueLabel.trim();
        }
        if (!entry.issueId && typeof src?.issueId === "string" && src.issueId.trim()) {
          entry.issueId = src.issueId.trim();
        }
        if (entry.year == null && (typeof src?.year === "number" || typeof src?.year === "string")) {
          entry.year = src.year;
        }
        if (!entry.section && typeof src?.section === "string" && src.section.trim()) {
          entry.section = src.section.trim();
        }
      }
    }
    return Array.from(map.values())
      .sort((a, b) => a.order - b.order)
      .map((entry) => {
        const urlList = Array.from(entry.urls);
        const pageRangeList = Array.from(entry.pageRanges);
        const pageNumbers = Array.from(entry.pages).sort((a, b) => a - b);
        const primaryUrl = urlList[0] || null;
        const numericPagesText = pageNumbers.length ? collapsePages(pageNumbers) : "";
        const rangeText = pageRangeList.length ? [...new Set(pageRangeList)].join(", ") : "";
        const pageSegments = [numericPagesText, rangeText].filter((seg) => seg && seg.trim());
        const pageText = pageSegments.length ? pageSegments.join(", ") : null;
        const formattedLabel = formatSourceLabel({
          short_ref: entry.shortRef,
          authors: Array.from(entry.authors),
          title: entry.title || Array.from(entry.labels).find((l) => typeof l === "string"),
          journalTitle: entry.journalTitle,
          issueLabel: entry.issueLabel || entry.issueId,
          issueId: entry.issueId,
          year: entry.year,
          section: entry.section,
          pageRange: pageText || undefined,
          pages: pageNumbers,
          fileName: entry.fileName,
          url: primaryUrl,
        });
        const shortRefText =
          typeof entry.shortRef === "string" && entry.shortRef.trim()
            ? entry.shortRef.trim()
            : null;
        const label =
          (formattedLabel && formattedLabel.trim()) ||
          shortRefText ||
          prettifyFileName(entry.fileName || "") ||
          (primaryUrl ? primaryUrl.replace(/^https?:\/\//, "") : "Allikas");
        return {
          key: entry.key,
          label,
          url: primaryUrl,
          allUrls: urlList,
          pageText,
          fileName: entry.fileName,
          occurrences: entry.occurrences,
          authors: Array.from(entry.authors),
          journalTitle: entry.journalTitle,
          issueLabel: entry.issueLabel,
          issueId: entry.issueId,
          year: entry.year,
          section: entry.section,
        };
      });
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
        analysisPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
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
  const appendMessage = useCallback((msg) => {
    const id = messageIdRef.current++;
    setMessages((prev) => [...prev, { ...msg, id }]);
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
  }, [messages]);

  /* ---------- Mount + püsivuse taastamine ---------- */
  useEffect(() => {
    mountedRef.current = true;
    focusInput();

    // Lae püsivus ja eemalda tühjad tekstid (hoiab intro nähtaval)
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

  /* ---------- ESC sulgemiseks ---------- */
  useEffect(() => {
    if (!showSourcesPanel) return;
    function onKeyDown(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeSourcesPanel();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showSourcesPanel, closeSourcesPanel]);

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
      appendMessage({ role: "user", text: trimmed });
      setInput("");
      setIsGenerating(true);
      focusInput();

      const controller = new AbortController();
      const clientTimeout = setTimeout(() => controller.abort(), 180000);
      abortControllerRef.current = controller;

      let streamingMessageId = null;

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
            ...(useAsContext && ephemeralChunks.length
              ? {
                  ephemeralChunks,
                  ...(uploadPreview?.fileName
                    ? { ephemeralSource: { fileName: uploadPreview.fileName } }
                    : {}),
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
          appendMessage({ role: "ai", text: replyText, sources });
          requestConversationsRefresh();
          return;
        }

        // Streamiv vastus (SSE)
        if (!res.body) throw new Error("Assistent ei saatnud voogu.");
        const reader = createSSEReader(res.body);
        streamingMessageId = appendMessage({ role: "ai", text: "", isStreaming: true });
        let visibleText = "";
        let sources = [];
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
                visibleText += payload.t; // koheline lisamine
                mutateMessage(streamingMessageId, (msg) => ({ ...msg, text: visibleText }));
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
        mutateMessage(streamingMessageId, (msg) => ({
          ...msg,
          text: (visibleText || "").trim() || "Vabandust, ma ei saanud praegu vastust koostada.",
          sources,
          isStreaming: false,
        }));
        requestConversationsRefresh();
        streamingMessageId = null;
      } catch (err) {
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
      useAsContext,
      userRole,
      requestConversationsRefresh,
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
        setUseAsContext(false);
        refreshUsage();
      } catch (err) {
        const genericError = t("chat.upload.error_generic", "Dokumendi analüüs ebaõnnestus.");
        setUploadError(err?.message || genericError);
        setUploadPreview(null);
        setEphemeralChunks([]);
        setUseAsContext(false);
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

  const BackButton = () => (
    <div className="chat-back-btn-wrapper">
      <button
        type="button"
        className="back-arrow-btn"
        onClick={() => router.push("/")}
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

  const backgroundLogo =
    userRole === "SOCIAL_WORKER" || userRole === "ADMIN"
      ? "/logo/aiilma.svg"
      : "/logo/silma.svg";

  /* ---------- Render ---------- */
  return (
    <div
      className="main-content glass-box chat-container chat-container--mobile u-mobile-pane"
      style={{ position: "relative", "--chat-bg-logo": `url(${backgroundLogo})` }}
    >
      {/* Hamburger / Conversations */}
      <button
        type="button"
        className="chat-menu-btn"
        onClick={openConversations}
        aria-label={t("chat.menu.open", "Ava vestlused")}
        aria-haspopup="dialog"
      >
        <span className="chat-menu-icon" aria-hidden="true">
          <span></span><span></span><span></span>
        </span>
        <span className="chat-menu-label" aria-hidden="true">
          {t("chat.menu.label", "Vestlused")}
        </span>
      </button>

      {/* Profiili avatar */}
      <Link href="/profiil" aria-label={t("chat.profile.open", "Ava profiil")} className="avatar-link">
        <Image
          src="/logo/User-circle.svg"
          alt={t("chat.profile.alt", "Profiil")}
          className="chat-avatar-abs"
          width={56}
          height={56}
          draggable={false}
        />
        <span className="avatar-label">{t("chat.profile.label", "Profiil")}</span>
      </Link>

      {/* Pealkiri */}
      <h1 className="glass-title">{t("chat.title", "SotsiaalAI")}</h1>

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
          {/* Intro – nähtav kuni tekib reaalne sisu */}
          {!hasRealContent && (
            <div className="chat-msg chat-msg-ai" style={{ opacity: 0.9 }}>
              <div style={{ whiteSpace: "pre-wrap" }}>
                <TextType
                  text={introAnimationTexts}
                  typingSpeed={[70, 45, 45]}
                  deletingSpeed={40}
                  pauseDuration={[2000, 3000, 3500]}
                  initialDelay={1000}
                  loop={false}
                  showCursor={false}
                  className="chat-intro-text"
                />
              </div>
            </div>
          )}

          {/* Vestluse sõnumid */}
          {messages.map((msg) => {
            const variant = msg.role === "user" ? "chat-msg-user" : "chat-msg-ai";
            return (
              <div key={msg.id} className={`chat-msg ${variant}`}>
                <div style={{ whiteSpace: "pre-wrap" }}>{msg.text}</div>
              </div>
            );
          })}
        </div>

        {showScrollDown && (
  <button
    className="scroll-down-btn"
    onClick={scrollToBottom}
    aria-label={t("chat.scroll_to_bottom", "Kerige chati lõppu")}
    title={t("chat.scroll_to_bottom_title", "Kerige lõppu")}
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
          className={`chat-inputbar chat-inputbar--mobile u-mobile-reset-position${!input.trim() ? " shiny-ph" : ""}`}
          style={{ columnGap: 0 }}
          onSubmit={isGenerating ? handleStop : sendMessage}
          autoComplete="off"
        >
          {/* Left side: attach + input in one row */}
          <div style={{ display: "flex", alignItems: "center", gap: 0, minWidth: 0, position: "relative" }}>
            <button
              type="button"
              className="chat-attach-btn chat-send-btn chat-attach-as-send"
              aria-label={t("chat.upload.aria", "Laadi dokument")}
              title={t("chat.upload.tooltip", "Laadi dokument")}
              onClick={() => {
                ensureAnalysisPanelVisible();
              }}
            >
              {/* Vertical paperclip (inline SVGR) */}
              <Paperclip className="chat-attach-icon" aria-hidden="true" role="img" width={26} height={26} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT_ATTR}
              onChange={onFileChange}
              style={{ display: "none" }}
            />
            <label htmlFor="chat-input" className="sr-only">
              {t("chat.input.label", "Kirjuta sõnum")}
            </label>
            <textarea
              id="chat-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="chat-input-field"
              disabled={isGenerating}
              rows={1}
            />
            {!input.trim() ? (
              <div
                aria-hidden
                className="shiny-ph-overlay"
                style={{
                  position: "absolute",
                  // start after attach button (3.5rem wide, -6px margin) + textarea padding
                  left: "calc(3.5rem - 6px + clamp(0.75rem, 3vw, 1.125rem))",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  opacity: 0.9,
                }}
              >
                <ShinyText text={t("chat.input.placeholder", "Kirjuta siia")} speed={5} />
              </div>
            ) : null}
          </div>
          <button
            type="submit"
            className={`chat-send-btn${(isGenerating || isStreamingAny) ? " chat-send-btn--active" : ""}`}
            aria-label={isGenerating ? t("chat.send.stop","Peata vastus") : t("chat.send.send","Saada sõnum")}
            title={isGenerating ? t("chat.send.title_stop","Peata vastus") : t("chat.send.title_send","Saada (Enter)")}
            disabled={!input.trim() && !isGenerating && !isStreamingAny}
            data-loader-active={(isGenerating || isStreamingAny) ? "true" : "false"}
          >
            {(() => {
              const thinking = isGenerating || isStreamingAny;
              return (
                <SotsiaalAILoader
                  size="calc(100% + 2px)"
                  animated={thinking}
                  ariaHidden
                  className="send-loader"
                />
              );
            })()}
          </button>
        </form>

        {showAnalysisPanel ? (
          <section
            ref={analysisPanelRef}
            className="chat-analysis-panel"
            role="region"
            aria-live="polite"
            aria-label={t("chat.upload.summary", "Dokumendi eelvaade")}
          >
            <div className="chat-analysis-card">
              <header className="chat-analysis-header">
                <div className="chat-analysis-actions">
                  <button
                    type="button"
                    className="btn-tertiary chat-analysis-close"
                    onClick={onPickFile}
                    disabled={uploadBusy || isGenerating}
                  >
                    {t("chat.upload.aria", "Laadi dokument")}
                  </button>
                  {!hasAnalysisContent ? (
                    <button
                      type="button"
                      className="btn-tertiary chat-analysis-close"
                      onClick={closeAnalysisPanel}
                    >
                      {t("buttons.close", "Sulge")}
                    </button>
                  ) : null}
                </div>
              </header>
              <div className="chat-analysis-body">
                {uploadBusy ? (
                  <div className="chat-analysis-status">
                    {t("chat.upload.busy", "Anal����sin dokumenti�?�")}
                  </div>
                ) : null}
                {uploadError ? <div className="chat-analysis-error">{uploadError}</div> : null}
                {uploadPreview ? (
                  <>
                    <div className="chat-analysis-file">
                      <div className="chat-analysis-file-info">
                        <div className="chat-analysis-file-name">
                          {prettifyFileName(uploadPreview.fileName)}
                        </div>
                        <div className="chat-analysis-file-meta">
                          {`${uploadPreview.sizeMB?.toFixed?.(2) || uploadPreview.sizeMB} MB`}
                        </div>
                      </div>
                      <div className="chat-analysis-file-actions">
                        <button
                          type="button"
                          onClick={() => {
                            setUploadPreview(null);
                            setUploadError(null);
                            setEphemeralChunks([]);
                            setUseAsContext(false);
                          }}
                          className="btn-tertiary chat-analysis-btn chat-analysis-btn--small"
                          aria-label={t("buttons.cancel", "Katkesta")}
                        >
                          {t("buttons.cancel", "Katkesta")}
                        </button>
                        {previewText ? (
                          <button
                            type="button"
                            onClick={toggleAnalysisCollapse}
                            className="btn-tertiary chat-analysis-btn chat-analysis-btn--small"
                          >
                            {analysisCollapsed
                              ? t("chat.upload.summary_show", "Näita eelvaadet")
                              : t("chat.upload.summary_hide", "Peida eelvaade")}
                          </button>
                        ) : null}
                      </div>
                    </div>

                    {!analysisCollapsed && previewText ? (
                      <div className="chat-analysis-preview chat-upload-preview-scroll">
                        {previewText}
                      </div>
                    ) : null}
                    {analysisCollapsed ? (
                      <div className="chat-analysis-collapsed-note">
                        {t("chat.upload.preview_hidden", "Eelvaade on peidetud.")}
                      </div>
                    ) : null}

                    <div className="chat-analysis-controls">
                      <button
                        type="button"
                        onClick={() => {
                          try {
                            inputRef.current?.focus?.();
                          } catch {}
                        }}
                        className="btn-primary btn-glass chat-analysis-ask-btn"
                      >
                        {t("chat.upload.ask_more_btn", "Alusta k��simust")}
                      </button>
                      <label className="glass-checkbox chat-analysis-checkbox">
                        <input
                          type="checkbox"
                          checked={useAsContext}
                          onChange={(e) => setUseAsContext(e.target.checked)}
                        />
                        <span className="checkbox-text">
                          {t("chat.upload.use_as_context", "Kasuta j��rgneval vastusel kontekstina")}
                        </span>
                      </label>
                      <span className="chat-analysis-meta">
                        {t("chat.upload.privacy", "Anal����siks, ei salvestata p��sivalt.")}
                      </span>
                      <span className="chat-analysis-meta">
                        {t(
                          "chat.upload.context_hint",
                          "Linnukesega vastab assistent ainult sellest failist; ilma linnukeseta kasutatakse tavap��rast SotsiaalAI andmebaasi."
                        )}
                      </span>
                      {uploadUsage?.limit ? (
                        <span className="chat-analysis-meta">
                          {t("chat.upload.usage", "{used}/{limit} anal����si t��na")
                            .replace("{used}", String(uploadUsage.used ?? 0))
                            .replace("{limit}", String(uploadUsage.limit ?? 0))}
                        </span>
                      ) : null}
                    </div>
                  </>
                ) : (
                  <div className="chat-analysis-empty">
                    <p className="chat-analysis-meta">
                      {t("chat.upload.privacy", "Anal����siks, ei salvestata p��sivalt.")}
                    </p>
                    <p className="chat-analysis-meta">
                      {t(
                        "chat.upload.context_hint",
                        "Linnukesega vastab assistent ainult sellest failist; ilma linnukeseta kasutatakse tavap��rast SotsiaalAI andmebaasi."
                      )}
                    </p>
                    <div className="chat-analysis-empty-actions">
                      {uploadUsage?.limit ? (
                        <span className="chat-analysis-meta">
                          {t("chat.upload.usage", "{used}/{limit} anal����si t��na")
                            .replace("{used}", String(uploadUsage.used ?? 0))
                            .replace("{limit}", String(uploadUsage.limit ?? 0))}
                        </span>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        ) : null}
        </main>
  
        {hasConversationSources ? (
        <div className="chat-sources-inline">
          <button
            type="button"
            ref={sourcesButtonRef}
            onClick={toggleSourcesPanel}
            className={`chat-sources-btn chat-sources-btn--mini${showSourcesPanel ? " chat-sources-btn--active" : ""}`}
            aria-haspopup="dialog"
            aria-expanded={showSourcesPanel ? "true" : "false"}
            aria-controls="chat-sources-panel"
          >
            {t("chat.sources.button", "Allikad ({count})").replace("{count}", String(conversationSources.length))}
          </button>
        </div>
      ) : null}

      <footer
        className="chat-footer"
        style={{ marginTop: "1rem", position: "relative", display: "flex", justifyContent: "center" }}
      >
        <BackButton />
      </footer>

      {showSourcesPanel ? (
        <div
          id="chat-sources-panel"
          role="dialog"
          aria-modal="true"
          aria-label={t("chat.sources.dialog_label", "Vestluse allikad")}
          onClick={closeSourcesPanel}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 40,
            background: "rgba(9, 14, 25, 0.55)",
            backdropFilter: "blur(2px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "rgba(12, 19, 35, 0.95)",
              borderRadius: 14,
              width: "100%",
              maxWidth: "520px",
              maxHeight: "80vh",
              padding: "1.25rem 1.4rem",
              overflowY: "auto",
              boxShadow: "0 18px 40px rgba(0,0,0,0.45)",
              border: "1px solid rgba(148, 163, 184, 0.15)",
              color: "#f8fafc",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "0.75rem",
                marginBottom: "0.85rem",
              }}
            >
              <h2 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 600 }}>
                {t("chat.sources.heading", "Vestluse allikad")}
              </h2>
              <button
                type="button"
                onClick={closeSourcesPanel}
                style={{
                  border: "none",
                  background: "rgba(148,163,184,0.15)",
                  color: "#f1f5f9",
                  borderRadius: 999,
                  padding: "0.3rem 0.75rem",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                {t("buttons.close", "Sulge")}
              </button>
            </div>

            {conversationSources.length === 0 ? (
              <p style={{ margin: 0, fontSize: "0.92rem", opacity: 0.8 }}>
                {t("chat.sources.empty", "Vestluses ei ole allikaid.")}
              </p>
            ) : (
              <ol style={{ margin: 0, paddingLeft: "1.2rem" }}>
                {conversationSources.map((src, idx) => (
                  <li key={src.key || idx} style={{ marginBottom: "1rem", lineHeight: 1.6 }}>
                    <div style={{ fontWeight: 600, fontSize: "1rem", color: "#f8fafc" }}>
                      {src.label}
                    </div>
                    {src.occurrences > 1 ? (
                      <div style={{ fontSize: "0.88rem", opacity: 0.7 }}>
                        {t("chat.sources.used_multiple", "Kasutatud {count} vestluse lõigus.").replace("{count}", String(src.occurrences))}
                      </div>
                    ) : null}
                    {src.section ? (
                      <div style={{ fontSize: "0.9rem", opacity: 0.7, marginTop: "0.2rem" }}>
                        {t("chat.sources.section", "Sektsioon: {section}").replace("{section}", String(src.section))}
                      </div>
                    ) : null}
                    {src.pageText && !`${src.label}`.toLowerCase().includes("lk") ? (
                      <div style={{ fontSize: "0.9rem", opacity: 0.7, marginTop: "0.2rem" }}>
                        {t("chat.sources.pages", "Leheküljed: {pages}").replace("{pages}", String(src.pageText))}
                      </div>
                    ) : null}
                    {src.allUrls && src.allUrls.length ? (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "0.5rem",
                          marginTop: "0.45rem",
                        }}
                      >
                        {src.allUrls.map((url, urlIdx) => (
                          <a
                            key={`${src.key || idx}-url-${urlIdx}`}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              color: "#93c5fd",
                              textDecoration: "underline",
                              fontSize: "0.9rem",
                            }}
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
    </div>
  );
}




