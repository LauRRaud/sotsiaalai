"use client";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const INTRO_MESSAGE =
  "Tere! SotsiaalAI aitab sind usaldusväärsetele allikatele tuginedes. Küsi oma küsimus.";
const MAX_HISTORY = 8;
const GLOBAL_CONV_KEY = "sotsiaalai:chat:convId";

const CRISIS_TEXT =
  "KRIIS: Kui on vahetu oht, helista 112. Lastele ja peredele on ööpäevaringselt tasuta 116111 (Lasteabi).";

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

/* --- autorite normaliseerija --- */
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

/* --- kui backend andis short_ref, eelistame seda --- */
function formatSourceLabel(src) {
  if (src?.short_ref && typeof src.short_ref === "string") {
    return src.short_ref.trim();
  }

  const authors = asAuthorArray(src?.authors);
  const authorText = authors.length ? authors.join("; ") : null;
  const title = src?.title || src?.fileName || src?.url || "Allikas";

  // UUS: võta ka ajakirja nimi (journalTitle) ja number/issue ning aasta
  const journal = (src?.journalTitle || "").trim() || null;
  const issue = src?.issueLabel || src?.issueId || src?.issue || null;
  const year = src?.year;

  const pagesCombined =
    src?.pageRange ||
    collapsePages([
      ...(Array.isArray(src?.pages) ? src.pages : []),
      ...(typeof src?.page === "number" ? [src.page] : []),
    ]);

  const parts = [];
  if (authorText) parts.push(authorText);
  if (title) parts.push(title);

  // kuvame: ajakiri + number/issue + aasta, kui olemas
  if (journal || issue || year) {
    const meta = [journal, issue, year].filter(Boolean).join(" ");
    if (meta) parts.push(meta);
  }

  if (pagesCombined) parts.push(`lk ${pagesCombined}`);
  if (src?.section) parts.push(src.section);
  return parts.join(". ") || title || "Allikas";
}

/** Normaliseeri serveri allikad  */
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
      journalTitle: typeof src?.journalTitle === "string" ? src.journalTitle : undefined, // valikuline
      authors,
      title: typeof src?.title === "string" ? src.title : undefined,
      issueLabel,
      issueId: typeof src?.issueId === "string" ? src.issueId : undefined,
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

/* ---------- Allikate list ---------- */
export default function ChatBody() {
  const router = useRouter();
  const { data: session } = useSession();

  const userRole = useMemo(() => {
    const raw = session?.user?.role ?? (session?.user?.isAdmin ? "ADMIN" : null);
    const up = String(raw || "").toUpperCase();
    return up || "CLIENT";
  }, [session]);

  const storageKey = useMemo(() => {
    const uid = session?.user?.id || "anon";
    return `sotsiaalai:chat:${uid}:${(session?.user?.role || "CLIENT").toLowerCase()}:v1`;
  }, [session]);
  const chatStore = useMemo(() => makeChatStorage(storageKey), [storageKey]);

  const [convId, setConvId] = useState(null);
  const [messages, setMessages] = useState(() => [{ id: 0, role: "ai", text: INTRO_MESSAGE }]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [errorBanner, setErrorBanner] = useState(null);
  const [isCrisis, setIsCrisis] = useState(false);
  const [showSourcesPanel, setShowSourcesPanel] = useState(false);

  const chatWindowRef = useRef(null);
  const inputRef = useRef(null);
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
        if (src.url) {
          entry.urls.add(src.url);
        }
        if (src.pageRange) {
          entry.pageRanges.add(src.pageRange);
        }
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
          title:
            entry.title ||
            Array.from(entry.labels)[0] ||
            entry.fileName ||
            (primaryUrl ? primaryUrl.replace(/^https?:\/\//, "") : "Allikas"),
          journalTitle: entry.journalTitle,
          issueLabel: entry.issueLabel,
          issueId: entry.issueId,
          year: entry.year,
          section: entry.section,
          pageRange: pageText || undefined,
          pages: pageNumbers,
          fileName: entry.fileName,
        });

        const label =
          (formattedLabel && formattedLabel.trim()) ||
          entry.shortRef ||
          Array.from(entry.labels)[0] ||
          entry.fileName ||
          primaryUrl ||
          "Allikas";

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

  const focusSourcesButton = useCallback(() => {
    setTimeout(() => {
      try {
        sourcesButtonRef.current?.focus?.();
      } catch {
        /* ignore */
      }
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

  useEffect(() => {
    function onSwitch(e) {
      const newId = e?.detail?.convId;
      if (!newId) return;
      try {
        window.sessionStorage.setItem(`${storageKey}:convId`, newId);
        window.sessionStorage.setItem(GLOBAL_CONV_KEY, newId);
      } catch {}
      setConvId(newId);
      setMessages([{ id: 0, role: "ai", text: INTRO_MESSAGE }]);
      chatStore.save([{ role: "ai", text: INTRO_MESSAGE }]);
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

  useEffect(() => {
    mountedRef.current = true;
    focusInput();

    const stored = chatStore.load();
    if (stored && stored.length) {
      let nextId = 1;
      const hydrated = stored.map((m) => ({ ...m, id: nextId++ }));
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

  useEffect(() => {
    if (!mountedRef.current) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      chatStore.save(messages);
    }, 250);
    return () => saveTimerRef.current && clearTimeout(saveTimerRef.current);
  }, [messages, chatStore]);

  useEffect(() => {
    if (!hasConversationSources && showSourcesPanel) {
      closeSourcesPanel();
    }
  }, [hasConversationSources, showSourcesPanel, closeSourcesPanel]);

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

  /* ---------- TAASTA SERVERIST ---------- */
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

        // Kui kasutaja jõudis vahepeal vestlust vahetada, ära kirjuta üle
        const currentGlobalId =
          typeof window !== "undefined" ? window.sessionStorage.getItem(GLOBAL_CONV_KEY) : convId;
        if (convId !== currentGlobalId) return;

        const serverText = String(data.text || "");
        const serverSources = normalizeSources(data.sources ?? []);
        const serverCrisis = !!data.isCrisis;

        setIsCrisis(serverCrisis);

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
              text: serverText,
              sources: serverSources,
              isStreaming: false,
            });
          } else {
            const cur = next[aiIdx];
            if ((serverText || "").length > (cur.text || "").length) {
              next[aiIdx] = { ...cur, text: serverText, sources: serverSources, isStreaming: false };
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
      const clientTimeout = setTimeout(() => controller.abort(), 60000);
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
          return;
        }

        if (!res.body) throw new Error("Assistent ei saatnud voogu.");

        const reader = createSSEReader(res.body);
        streamingMessageId = appendMessage({ role: "ai", text: "", isStreaming: true });
        let acc = "";
        let sources = [];

        for await (const ev of reader) {
          if (ev.event === "meta") {
            try {
              const payload = JSON.parse(ev.data);
              // toeta nii {sources: [...]} kui {groups: [...]}
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
                acc += payload.t;
                mutateMessage(streamingMessageId, (msg) => ({ ...msg, text: acc }));
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
            break;
          }
        }

        const finalText = acc.trim() || "Vabandust, ma ei saanud praegu vastust koostada.";
        mutateMessage(streamingMessageId, (msg) => ({
          ...msg,
          text: finalText,
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
    [appendMessage, focusInput, historyPayload, input, isGenerating, mutateMessage, userRole, convId]
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

  const handleBackClick = useCallback(() => {
    router.push("/");
  }, [router]);

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
        onClick={handleBackClick}
        aria-label="Tagasi avalehele"
      >
        <span className="back-arrow-circle" />
      </button>
    </div>
  );

  return (
    <div
      className="main-content glass-box chat-container chat-container--mobile u-mobile-pane"
      style={{ position: "relative" }}
    >
      {/* Hamburger / Vestlused – vasak ülanurk (sümmeetriline avatariga) */}
      <button
        type="button"
        className="chat-menu-btn"
        onClick={openConversations}
        aria-label="Ava vestlused"
        aria-haspopup="dialog"
      >
        <span className="chat-menu-icon" aria-hidden="true">
          <span></span><span></span><span></span>
        </span>
        <span className="chat-menu-label" aria-hidden="true">Vestlused</span>
      </button>

      {/* Profiili avatar – parem ülanurk */}
      <Link href="/profiil" aria-label="Ava profiil" className="avatar-link">
        <img
          src="/logo/User-circle.svg"
          alt="Profiil"
          className="chat-avatar-abs"
          draggable={false}
        />
        <span className="avatar-label">Profiil</span>
      </Link>

      {/* Pealkiri */}
      <h1 className="glass-title">SotsiaalAI</h1>

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
          {CRISIS_TEXT}
        </div>
      ) : null}

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
          aria-label="Chat messages"
          aria-live="polite"
          aria-busy={isStreamingAny ? "true" : "false"}
        >
          {messages.map((msg) => {
            const variant = msg.role === "user" ? "chat-msg-user" : "chat-msg-ai";
            return (
              <div key={msg.id} className={`chat-msg ${variant}`}>
                <div style={{ whiteSpace: "pre-wrap" }}>{msg.text}</div>
              </div>
            );
          })}

          {isStreamingAny && (
            <div className="chat-msg chat-msg-ai typing-bubble" aria-live="polite">
              <span className="typing-label">Mõtleb</span>
              <span className="dots" aria-hidden="true">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </div>
          )}
        </div>

        {showScrollDown && (
          <button
            className="scroll-down-btn"
            onClick={scrollToBottom}
            aria-label="Kerige chati lõppu"
            title="Kerige lõppu"
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
          className="chat-inputbar chat-inputbar--mobile u-mobile-reset-position"
          onSubmit={isGenerating ? handleStop : sendMessage}
          autoComplete="off"
        >
          <label htmlFor="chat-input" className="sr-only">
            Kirjuta sõnum
          </label>
          <textarea
            id="chat-input"
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Kirjuta siia küsimus..."
            className="chat-input-field"
            disabled={isGenerating}
            rows={1}
            style={{ resize: "none" }}
          />

          <button
            type="submit"
            className={`chat-send-btn${isGenerating ? " stop" : ""}`}
            aria-label={isGenerating ? "Peata vastus" : "Saada sõnum"}
            title={isGenerating ? "Peata vastus" : "Saada (Enter)"}
            disabled={!isGenerating ? !input.trim() : false}
          >
            {isGenerating ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
                <rect x="5" y="5" width="14" height="14" rx="2.5" />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M4 15l8-8 8 8" />
              </svg>
            )}
          </button>
        </form>
      </main>

      <footer
        className="chat-footer"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          marginTop: "1rem",
        }}
      >
        <div style={{ flex: 1, display: "flex", justifyContent: "flex-start" }}>
          {hasConversationSources ? (
            <button
              type="button"
              ref={sourcesButtonRef}
              onClick={toggleSourcesPanel}
              className="chat-sources-btn"
              aria-haspopup="dialog"
              aria-expanded={showSourcesPanel ? "true" : "false"}
              aria-controls="chat-sources-panel"
              style={{
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.25)",
                background: showSourcesPanel ? "rgba(99,102,241,0.25)" : "rgba(15,23,42,0.75)",
                color: "#fff",
                padding: "0.55rem 1.15rem",
                fontSize: "0.95rem",
                fontWeight: 600,
                letterSpacing: "0.02em",
                display: "inline-flex",
                alignItems: "center",
                transition: "background 0.2s ease, border 0.2s ease",
                boxShadow: showSourcesPanel
                  ? "0 0 0 1px rgba(99,102,241,0.35)"
                  : "0 4px 16px rgba(15,23,42,0.35)",
              }}
            >
              Allikad ({conversationSources.length})
            </button>
          ) : null}
        </div>
        <div style={{ flexShrink: 0 }}>
          <BackButton />
        </div>
      </footer>

      {showSourcesPanel ? (
        <div
          id="chat-sources-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Vestluse allikad"
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
              <h2 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 600 }}>Vestluse allikad</h2>
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
                Sulge
              </button>
            </div>

            {conversationSources.length === 0 ? (
              <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.75 }}>
                Vestluses ei ole allikaid.
              </p>
            ) : (
              <ol style={{ margin: 0, paddingLeft: "1.2rem" }}>
                {conversationSources.map((src, idx) => (
                  <li
                    key={src.key || idx}
                    style={{ marginBottom: "1rem", lineHeight: 1.5 }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: "0.95rem",
                        color: "#f8fafc",
                      }}
                    >
                      {src.label}
                    </div>
                    {src.occurrences > 1 ? (
                      <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>
                        Kasutatud {src.occurrences} vestluse lõigus.
                      </div>
                    ) : null}
                    {src.section ? (
                      <div style={{ fontSize: "0.82rem", opacity: 0.7, marginTop: "0.2rem" }}>
                        Sektsioon: {src.section}
                      </div>
                    ) : null}
                    {src.pageText && !`${src.label}`.toLowerCase().includes("lk") ? (
                      <div style={{ fontSize: "0.82rem", opacity: 0.7, marginTop: "0.2rem" }}>
                        Leheküljed: {src.pageText}
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
                            Ava {src.allUrls.length > 1 ? `(${urlIdx + 1})` : "allikas"}
                          </a>
                        ))}
                      </div>
                    ) : src.fileName ? (
                      <div style={{ fontSize: "0.82rem", opacity: 0.7, marginTop: "0.35rem" }}>
                        Fail: {src.fileName}
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
