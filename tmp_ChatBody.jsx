"use client";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/components/i18n/I18nProvider";
import SotsiaalAILoader from "@/components/ui/SotsiaalAILoader";

/* ---------- Konstantsed seaded ---------- */
const MAX_HISTORY = 8;
const GLOBAL_CONV_KEY = "sotsiaalai:chat:convId";

/* ---------- SSE parser ---------- */
function createSSEReader(stream) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  const queue = [];
  function feed(chunk) {
    buffer += chunk;
    buffer = buffer.replace(/\r\n/g, "\n");
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
  if (
    !label &&
    (contextSegments.length || pagesCombined || section || authorText || titleText)
  ) {
    const fallbackParts = [
      authorText || null,
      titleText || null,
      contextSegments.join(", ") || null,
      pagesCombined ? `lk ${pagesCombined}` : null,
      section || null,
    ].filter(Boolean);
    label = fallbackParts.join(". ").trim();
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
function mapServerMessage(msg) {
  if (!msg) return null;
  const role =
    msg.role === "ASSISTANT" ? "ai" : msg.role === "USER" ? "user" : "system";
  const sources =
    Array.isArray(msg?.metadata?.sources) && msg.metadata.sources.length
      ? msg.metadata.sources
      : [];
  return {
    id: msg.id,
    role,
    text: msg.content || "",
    sources,
    createdAt: msg.createdAt,
    isStreaming: false,
    isCrisis: !!msg?.metadata?.isCrisis,
  };
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
      short_ref: typeof src?.short_ref === "string" ? src.short_ref : undefined,
      journalTitle: typeof src?.journalTitle === "string" ? src.journalTitle : undefined,
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

  const introText = t(
    "chat.intro.message",
    "Tere! SotsiaalAI aitab sind usaldusväärsetele allikatele tuginedes."
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


  const [convId, setConvId] = useState(null);
  const [messages, setMessages] = useState([]); // algab tühjalt
  const [messagesCursor, setMessagesCursor] = useState(null);
  const [initialMessagesLoading, setInitialMessagesLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [errorBanner, setErrorBanner] = useState(null);
  const [isCrisis, setIsCrisis] = useState(false);
  const [showSourcesPanel, setShowSourcesPanel] = useState(false);

  // Ephemeral document analyze (Variant A)
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null); // { fileName, sizeMB, mimeType, preview, chunksCount }
  const [ephemeralChunks, setEphemeralChunks] = useState([]);
  const [useAsContext, setUseAsContext] = useState(false);
  const [uploadUsage, setUploadUsage] = useState(null);
  const fileInputRef = useRef(null);

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
    [RAW_ALLOWED_MIME],
  );
  const ACCEPT_ATTR = useMemo(() => {
    const set = new Set();
    ALLOWED_MIME_LIST.forEach((m) => {
      if (m === "application/pdf") set.add(m), set.add(".pdf");
      else if (m === "text/plain") set.add(m), set.add(".txt");
      else if (m === "text/markdown") set.add(m), set.add(".md"), set.add(".markdown");
      else if (m === "text/html") set.add(m), set.add(".html"), set.add(".htm");
      else if (m === "application/msword") set.add(m), set.add(".doc");
      else if (m === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") set.add(m), set.add(".docx");
      else set.add(m);
    });
    return Array.from(set).join(",");
  }, [ALLOWED_MIME_LIST]);

  const refreshUsage = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      const res = await fetch("/api/chat/analyze-usage", { cache: "no-store" });
      if (!res.ok) throw new Error("fail");
      const data = await res.json();
      if (data?.ok) setUploadUsage({ used: data.used ?? 0, limit: data.limit ?? 0 });
    } catch {}
  }, [session?.user?.id]);

  useEffect(() => {
    refreshUsage();
  }, [refreshUsage]);

  const onPickFile = useCallback(() => {
    setUploadError(null);
    fileInputRef.current?.click?.();
  }, []);

  const onFileChange = useCallback(async (e) => {
    const file = e.target?.files?.[0];
    if (!file) return;
    setUploadError(null);
    if (file.size / (1024 * 1024) > MAX_UPLOAD_MB) {
      setUploadError(`Fail on liiga suur (${(file.size / (1024 * 1024)).toFixed(1)}MB > ${MAX_UPLOAD_MB}MB).`);
      e.target.value = "";
      return;
    }
    try {
      setUploadBusy(true);
      const fd = new FormData();
      fd.append("file", file, file.name || "file");
      fd.append("mimeType", file.type || "");
      fd.append("maxChunks", "16");
      const res = await fetch("/api/chat/analyze-file", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({ ok: false }));
      if (!res.ok || !data?.ok) {
        throw new Error(data?.message || `Analüüs ebaõnnestus (${res.status}).`);
      }
      setUploadPreview({
        fileName: data.fileName || file.name,
        sizeMB: typeof data.sizeMB === "number" ? data.sizeMB : Number((file.size / (1024 * 1024)).toFixed(2)),
        mimeType: data.mimeType || file.type,
        preview: data.preview || "",
        chunksCount: Array.isArray(data.chunks) ? data.chunks.length : 0,
      });
      setEphemeralChunks(Array.isArray(data.chunks) ? data.chunks : []);
      setUseAsContext(false);
      refreshUsage();
    } catch (err) {
      setUploadError(err?.message || "Analüüs ebaõnnestus.");
    } finally {
      setUploadBusy(false);
      e.target.value = ""; // allow re-selecting same file
    }
  }, [MAX_UPLOAD_MB, refreshUsage]);

  const chatWindowRef = useRef(null);
  const inputRef = useRef(null);
  const sourcesButtonRef = useRef(null);
  const isUserAtBottom = useRef(true);
  const abortControllerRef = useRef(null);
  const mountedRef = useRef(false);
  const messageIdRef = useRef(1);

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
            title: typeof src.title === "string" ? src.title : null,
            journalTitle: typeof src.journalTitle === "string" ? src.journalTitle : null,
            issueLabel: typeof src.issueLabel === "string" ? src.issueLabel : null,
            issueId: typeof src.issueId === "string" ? src.issueId : null,
            year: src.year ?? null,
            section: typeof src.section === "string" ? src.section : null,
          };
          map.set(key, entry);
        }
        entry.occurrences += 1;
        if (!entry.shortRef && typeof src.short_ref === "string") {
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
        if (!entry.title && typeof src.title === "string" && src.title.trim()) {
          entry.title = src.title.trim();
        }
        if (!entry.journalTitle && typeof src.journalTitle === "string" && src.journalTitle.trim()) {
          entry.journalTitle = src.journalTitle.trim();
        }
        if (!entry.issueLabel && typeof src.issueLabel === "string" && src.issueLabel.trim()) {
          entry.issueLabel = src.issueLabel.trim();
        }
        if (!entry.issueId && typeof src.issueId === "string" && src.issueId.trim()) {
          entry.issueId = src.issueId.trim();
        }
        if (entry.year == null && (typeof src.year === "number" || typeof src.year === "string")) {
          entry.year = src.year;
        }
        if (!entry.section && typeof src.section === "string" && src.section.trim()) {
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
  const appendMessage = useCallback((msg) => {
    const id = msg?.id || `local-${messageIdRef.current++}`;
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
      setMessagesCursor(null);
      setIsCrisis(false);
      try {
        window.dispatchEvent(
          new CustomEvent("sotsiaalai:toggle-conversations", { detail: { open: false } })
        );
      } catch {}
    }
    window.addEventListener("sotsiaalai:switch-conversation", onSwitch);
    return () => window.removeEventListener("sotsiaalai:switch-conversation", onSwitch);
  }, [storageKey]);

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

  /* ---------- Mount ---------- */
  useEffect(() => {
    mountedRef.current = true;
    focusInput();

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
  }, [focusInput, storageKey]);

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

  /* ---------- Lae serveri ajalugu ---------- */
  useEffect(() => {
    if (!convId) return;
    let cancelled = false;
    setInitialMessagesLoading(true);
    setMessages([]);
    setMessagesCursor(null);
    async function loadLatest() {
      try {
        const r = await fetch(
          `/api/chat/conversations/${encodeURIComponent(convId)}/messages?limit=50`,
          { cache: "no-store" },
        );
        if (!r.ok) return;
        const data = await r.json().catch(() => null);
        if (!data || cancelled) return;
        const mapped = Array.isArray(data.items)
          ? data.items.map(mapServerMessage).filter(Boolean)
          : [];
        setMessages(mapped);
        setMessagesCursor(data.nextCursor || null);
        const latestAi = [...mapped].reverse().find((m) => m.role === "ai");
        if (latestAi) {
          setIsCrisis(!!latestAi.isCrisis);
        }
      } catch {
        if (!cancelled) {
          setMessages([]);
          setMessagesCursor(null);
        }
      } finally {
        if (!cancelled) setInitialMessagesLoading(false);
      }
    }
    loadLatest();
    return () => {
      cancelled = true;
    };
  }, [convId]);

  const loadOlderMessages = useCallback(async () => {
    if (!convId || !messagesCursor || loadingHistory) return;
    setLoadingHistory(true);
    try {
      const params = new URLSearchParams({ limit: "50", before: messagesCursor });
      const r = await fetch(
        `/api/chat/conversations/${encodeURIComponent(convId)}/messages?${params.toString()}`,
        { cache: "no-store" },
      );
      if (!r.ok) return;
      const data = await r.json().catch(() => null);
      if (!data) return;
      const mapped = Array.isArray(data.items)
        ? data.items.map(mapServerMessage).filter(Boolean)
        : [];
      setMessages((prev) => [...mapped, ...prev]);
      setMessagesCursor(data.nextCursor || null);
    } catch {
      // vaikne – jätame olemasoleva loendi
    } finally {
      setLoadingHistory(false);
    }
  }, [convId, messagesCursor, loadingHistory]);

  /* ---------- Sõnumi saatmine ---------- */
  const sendMessage = useCallback(
    async (e) => {
      e?.preventDefault();
      if (isGenerating) return;
      const trimmed = input.trim();
      if (!trimmed) return;

      setErrorBanner(null);
      setIsCrisis(false); // lähtesta, kuni server meta saadab
      appendMessage({ role: "user", text: trimmed, createdAt: new Date().toISOString() });
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
            ...(useAsContext && ephemeralChunks && ephemeralChunks.length
              ? { ephemeralChunks, ephemeralSource: { fileName: uploadPreview?.fileName || undefined } }
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
          appendMessage({
            role: "ai",
            text: replyText,
            sources,
            createdAt: new Date().toISOString(),
          });
          return;
        }

        // Streamiv vastus (SSE)
        if (!res.body) throw new Error("Assistent ei saatnud voogu.");
        const reader = createSSEReader(res.body);
        streamingMessageId = appendMessage({
          role: "ai",
          text: "",
          isStreaming: true,
          createdAt: new Date().toISOString(),
        });
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
            appendMessage({
              role: "ai",
              text: "Vastuse genereerimine peatati.",
              createdAt: new Date().toISOString(),
            });
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
            appendMessage({
              role: "ai",
              text: `Viga: ${errText}`,
              createdAt: new Date().toISOString(),
            });
          }
        }
      } finally {
        setIsGenerating(false);
        abortControllerRef.current = null;
        focusInput();
      }
    },
    [appendMessage, focusInput, historyPayload, input, isGenerating, mutateMessage, userRole, convId, locale, useAsContext, ephemeralChunks, uploadPreview]
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

  /* ---------- Render ---------- */
  return (
    <div
      className="main-content glass-box chat-container chat-container--mobile u-mobile-pane"
      style={{ position: "relative" }}
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
          width={48}
          height={48}
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
          {messagesCursor && (
            <div className="chat-history-actions">
              <button
                type="button"
                className="chat-history-button"
                onClick={loadOlderMessages}
                disabled={loadingHistory || initialMessagesLoading}
              >
                {loadingHistory || initialMessagesLoading
                  ? t("chat.history.loading", "Laen varasemaid…")
                  : t("chat.history.load_more", "Lae varasemaid sõnumeid")}
              </button>
            </div>
          )}

          {initialMessagesLoading && messages.length === 0 && (
            <div className="chat-msg chat-msg-ai" style={{ opacity: 0.8 }}>
              {t("chat.history.initial_loading", "Laen vestlust…")}
            </div>
          )}

          {/* Intro – nähtav kuni tekib reaalne sisu */}
          {!hasRealContent && (
            <div className="chat-msg chat-msg-ai" style={{ opacity: 0.9 }}>
              <div style={{ whiteSpace: "pre-wrap" }}>{introText}</div>
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
          className="chat-inputbar chat-inputbar--mobile u-mobile-reset-position" style={{ paddingRight: 2, columnGap: 1 }}
          onSubmit={isGenerating ? handleStop : sendMessage}
          autoComplete="off"
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              width: "100%",
              minWidth: 0,
            }}
          >
            <button
              type="button"
              onClick={onPickFile}
              className="chat-attach-btn chat-attach-circle"
              aria-label={t("chat.upload.aria", "Laadi dokument analüüsimiseks (ei salvestata)")}
              title={t("chat.upload.tooltip", "Laadi dokument analüüsimiseks (ei salvestata)")}
              disabled={uploadBusy || isGenerating}
              style={{
                border: "none",
                background: "transparent",
                padding: 0,
                display: "flex",
                alignItems: "center",
                color: "#cbd5e1",
                cursor: uploadBusy || isGenerating ? "not-allowed" : "pointer",
                marginLeft: 8,
              }}
            >
              {/* Paperclip icon (alternate style) */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21.44 11.05l-9.19 9.19a6 6 0 1 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.88 17.05a2 2 0 1 1-2.83-2.83l8.49-8.49"/></svg>
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
              placeholder={t("chat.input.placeholder", "Kirjuta siia küsimus...")}
              className="chat-input-field"
              disabled={isGenerating}
              rows={1}
              style={{ flex: 1 }}
            />
          </div>
          <button
            type="submit"
            className={`chat-send-btn${(isGenerating || isStreamingAny) ? " chat-send-btn--active" : ""}`}
            aria-label={isGenerating ? t("chat.send.stop","Peata vastus") : t("chat.send.send","Saada sõnum")}
            title={isGenerating ? t("chat.send.title_stop","Peata vastus") : t("chat.send.title_send","Saada (Enter)")}
            disabled={!input.trim() && !isGenerating && !isStreamingAny}
            data-loader-active={(isGenerating || isStreamingAny) ? "true" : "false"}
            style={{ marginLeft: 8, marginRight: 0 }}
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

        {/* Ephemeral analyze preview & privacy note */}
        {(uploadPreview || uploadError || uploadBusy) ? (
          <div className="chat-analyze-followup" style={{ marginTop: "0.6rem", fontSize: "0.9rem", color: "#e2e8f0" }}>
            {uploadBusy ? (
              <div style={{ opacity: 0.85 }}>{t("chat.upload.busy", "Analüüsin dokumenti…")}</div>
            ) : null}
            {uploadError ? (
              <div style={{ color: "#fecaca" }}>{uploadError}</div>
            ) : null}
            {uploadPreview ? (
              <div
                style={{
                  background: "rgba(148,163,184,0.12)",
                  border: "1px solid rgba(148,163,184,0.2)",
                  borderRadius: 10,
                  padding: "10px 12px",
                  marginTop: 6,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <div style={{ fontWeight: 600 }}>
                    {prettifyFileName(uploadPreview.fileName)}
                    <span style={{ opacity: 0.7, marginLeft: 8 }}>{`${uploadPreview.sizeMB?.toFixed?.(2) || uploadPreview.sizeMB} MB`}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setUploadPreview(null); setUploadError(null); setEphemeralChunks([]); setUseAsContext(false); }}
                    style={{ border: "none", background: "transparent", color: "#93c5fd", textDecoration: "underline", cursor: "pointer" }}
                  >
                    {t("buttons.cancel", "Katkesta")}
                  </button>
                </div>
                {uploadPreview.preview ? (
                  <div style={{ marginTop: 6, whiteSpace: "pre-wrap", opacity: 0.9 }}>
                    <strong style={{ display: "block", marginBottom: 4 }}>{t("chat.upload.summary", "Dokumendi kokkuvõte")}</strong>
                    {uploadPreview.preview}
                  </div>
                ) : null}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => {
                      const suggestion = t("chat.upload.ask_more", "Palun selgita seda dokumenti lühidalt ja too välja 3–5 olulisemat punkti.");
                      setInput((prev) => (prev ? prev : suggestion));
                      try { inputRef.current?.focus?.(); } catch {}
                    }}
                    style={{ border: "1px solid rgba(148,163,184,0.35)", background: "rgba(148,163,184,0.18)", color: "#f8fafc", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: "0.88rem" }}
                  >
                    {t("chat.upload.ask_more_btn", "Küsi lisaks")}
                  </button>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: "0.88rem", cursor: "pointer" }}>
                    <input type="checkbox" checked={useAsContext} onChange={(e) => setUseAsContext(e.target.checked)} />
                    {t("chat.upload.use_as_context", "Kasuta järgmisel vastusel kontekstina")}
                  </label>
                  <span style={{ fontSize: "0.82rem", opacity: 0.75 }}>{t("chat.upload.privacy", "Analüüsiks, ei salvestata püsivalt.")}</span>
                  {uploadUsage?.limit ? (
                    <span style={{ fontSize: "0.82rem", opacity: 0.75 }}>
                      {t("chat.upload.usage", "{used}/{limit} analüüsi täna")
                        .replace("{used}", String(uploadUsage.used ?? 0))
                        .replace("{limit}", String(uploadUsage.limit ?? 0))}
                    </span>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </main>

      <footer
        className="chat-footer"
        style={{ marginTop: "1rem", position: "relative", display: "flex", justifyContent: "center" }}
      >
        {hasConversationSources ? (
          <button
            type="button"
            ref={sourcesButtonRef}
            onClick={toggleSourcesPanel}
            className={`chat-sources-btn chat-sources-btn--mini${showSourcesPanel ? " chat-sources-btn--active" : ""}`}
            aria-haspopup="dialog"
            aria-expanded={showSourcesPanel ? "true" : "false"}
            aria-controls="chat-sources-panel"
            style={{
              position: "absolute",
              left: "clamp(16px, 4.5vw, 24px)",
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            {t("chat.sources.button", "Allikad ({count})").replace("{count}", String(conversationSources.length))}
          </button>
        ) : null}
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
              <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.75 }}>
                {t("chat.sources.empty", "Vestluses ei ole allikaid.")}
              </p>
            ) : (
              <ol style={{ margin: 0, paddingLeft: "1.2rem" }}>
                {conversationSources.map((src, idx) => {
                  const labelLower = `${src.label || ""}`.toLowerCase();
                  const sectionLower = typeof src.section === "string" ? src.section.toLowerCase() : "";
                  const showSectionLine = Boolean(
                    src.section && sectionLower && !labelLower.includes(sectionLower)
                  );
                  const showPageLine = Boolean(
                    src.pageText && !labelLower.includes("lk")
                  );
                  return (
                    <li key={src.key || idx} style={{ marginBottom: "1rem", lineHeight: 1.5 }}>
                      <div style={{ fontWeight: 600, fontSize: "0.95rem", color: "#f8fafc" }}>
                        {src.label}
                      </div>
                      {src.occurrences > 1 ? (
                        <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>
                          {t("chat.sources.used_multiple", "Kasutatud {count} vestluse lõigus.").replace("{count}", String(src.occurrences))}
                        </div>
                      ) : null}
                      {showSectionLine ? (
                        <div style={{ fontSize: "0.82rem", opacity: 0.7, marginTop: "0.2rem" }}>
                          {t("chat.sources.section", "Sektsioon: {section}").replace("{section}", String(src.section))}
                        </div>
                      ) : null}
                      {showPageLine ? (
                        <div style={{ fontSize: "0.82rem", opacity: 0.7, marginTop: "0.2rem" }}>
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
                              fontSize: "0.85rem",
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
                  );
                })}
              </ol>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
















