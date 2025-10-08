"use client";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const INTRO_MESSAGE =
  "Tere! SotsiaalAI aitab sind usaldusväärsetele allikatele tuginedes. Küsi oma küsimus.";
const MAX_HISTORY = 8;

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

/* ---------- SSE parser: CRLF→LF, mitu data: rida, flush ---------- */
function createSSEReader(stream) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  const queue = [];

  function feed(chunk) {
    buffer += chunk;
    buffer = buffer.replace(/\r\n/g, "\n"); // CRLF → LF
    let idx;
    while ((idx = buffer.indexOf("\n\n")) !== -1) {
      const rawEvent = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);

      let event = "message";
      const dataLines = [];
      for (const line of rawEvent.split("\n")) {
        if (!line) continue;
        if (line.startsWith(":")) continue; // heartbeat/comment
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
      // flush kui viimane plokk jäi ilma \n\n
      if (buffer) {
        feed("\n\n");
        while (queue.length) yield queue.shift();
      }
    },
  };
}

/** Normaliseeri serveri allikad üheks kujuks: { key, label, url?, page? } */
function normalizeSources(sources) {
  if (!Array.isArray(sources)) return [];
  return sources.map((src, idx) => {
    const url = src?.url || src?.source || null;
    const page = typeof src?.page === "number" || typeof src?.page === "string" ? src.page : null;
    const label = src?.title || src?.file || src?.source || "Allikas";
    const key = src?.id || url || `${label}-${idx}`;
    return { key, label, url, page };
  });
}

export default function ChatBody() {
  const router = useRouter();
  const { data: session } = useSession();

  // Roll API-le (admin möödub subActive kontrollist middleware’is)
  const userRole = useMemo(() => {
    const raw = session?.user?.role ?? (session?.user?.isAdmin ? "ADMIN" : null);
    const up = String(raw || "").toUpperCase();
    return up || "CLIENT";
  }, [session]);

  // püsivusvõti kasutaja & rolli kaupa
  const storageKey = useMemo(() => {
    const uid = session?.user?.id || "anon";
    return `sotsiaalai:chat:${uid}:${(session?.user?.role || "CLIENT").toLowerCase()}:v1`;
  }, [session]);
  const chatStore = useMemo(() => makeChatStorage(storageKey), [storageKey]);

  // vestluse ID (serveri persist jaoks)
  const [convId, setConvId] = useState(null);

  const [messages, setMessages] = useState(() => [{ id: 0, role: "ai", text: INTRO_MESSAGE }]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [errorBanner, setErrorBanner] = useState(null);

  const chatWindowRef = useRef(null);
  const inputRef = useRef(null);
  const isUserAtBottom = useRef(true);
  const abortControllerRef = useRef(null);
  const mountedRef = useRef(false);
  const messageIdRef = useRef(1);
  const saveTimerRef = useRef(null);

  const historyPayload = useMemo(
    () => messages.slice(-MAX_HISTORY).map((m) => ({ role: m.role, text: m.text })), // ainult möödunud vähendatud ajalugu
    [messages]
  );

  const isStreamingAny = useMemo(
    () => isGenerating || messages.some((m) => m.role === "ai" && m.isStreaming),
    [isGenerating, messages]
  );

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

  // Kerimise abi
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

  // autoscroll, kui lisandub sõnumeid ja kasutaja on all
  useEffect(() => {
    if (!mountedRef.current) return;
    const node = chatWindowRef.current;
    if (node && isUserAtBottom.current) {
      node.scrollTop = node.scrollHeight;
    }
  }, [messages]);

  // esmane mount: focus, rehüdratsioon & convId
  useEffect(() => {
    mountedRef.current = true;
    focusInput();

    // lae talletatud vestlus
    const stored = chatStore.load();
    if (stored && stored.length) {
      let nextId = 1;
      const hydrated = stored.map((m) => ({ ...m, id: nextId++ }));
      messageIdRef.current = nextId;
      setMessages(hydrated);
    }

    // convId
    const idFromStorage =
      typeof window !== "undefined" ? window.sessionStorage.getItem(`${storageKey}:convId`) : null;
    const initialConvId =
      idFromStorage ||
      (typeof window !== "undefined" && window.crypto?.randomUUID
        ? window.crypto.randomUUID()
        : String(Date.now()));
    setConvId(initialConvId);
    if (!idFromStorage && typeof window !== "undefined") {
      window.sessionStorage.setItem(`${storageKey}:convId`, initialConvId);
    }

    return () => {
      mountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, [chatStore, focusInput, storageKey]);

  // salvestus (debounce 250ms)
  useEffect(() => {
    if (!mountedRef.current) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      chatStore.save(messages);
    }, 250);
    return () => saveTimerRef.current && clearTimeout(saveTimerRef.current);
  }, [messages, chatStore]);

  /* ---------- TAASTA SERVERIST: kui paneel oli kinni ---------- */
  useEffect(() => {
    if (!convId) return;
    let cancelled = false;

    async function hydrateFromServer() {
      try {
        const r = await fetch(`/api/chat/run?convId=${encodeURIComponent(convId)}`, { cache: "no-store" });
        if (!r.ok) return;
        const data = await r.json();
        if (!data?.ok || cancelled) return;

        const serverText = String(data.text || "");
        const serverSources = normalizeSources(data.sources ?? []);

        setMessages((prev) => {
          const next = [...prev];
          // leia VIIMANE AI-sõnum
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

    function onFocusOrVisible() {
      if (document.visibilityState === "visible") hydrateFromServer();
    }
    window.addEventListener("focus", onFocusOrVisible);
    document.addEventListener("visibilitychange", onFocusOrVisible);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocusOrVisible);
      document.removeEventListener("visibilitychange", onFocusOrVisible);
    };
  }, [convId]);

  const sendMessage = useCallback(
    async (e) => {
      e?.preventDefault();
      if (isGenerating) return;

      const trimmed = input.trim();
      if (!trimmed) return;

      setErrorBanner(null);
      appendMessage({ role: "user", text: trimmed });
      setInput("");
      setIsGenerating(true);
      focusInput();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      let streamingMessageId = null;
      try {
        // 1) proovi STRIIMI (SSE)
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            history: historyPayload,
            role: userRole,
            stream: true,
            persist: true, // lase serveril salvestada ja jätkata ka siis, kui paneel suletakse
            convId, // püsiv vestluse ID
          }),
          signal: controller.signal,
        });

        if (res.status === 401 || res.status === 403) {
          const params = new URLSearchParams({ callbackUrl: "/vestlus" });
          window.location.href = `/api/auth/signin?${params.toString()}`;
          return;
        }

        if (res.status === 429) {
          const retry = res.headers.get("retry-after");
          throw new Error(
            retry ? `Liiga palju päringuid. Proovi ~${retry}s pärast.` : "Liiga palju päringuid. Proovi varsti uuesti."
          );
        }

        const contentType = res.headers.get("content-type") || "";

        // --- A) Kui server EI striimi (tagasi JSON) ---
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
          appendMessage({ role: "ai", text: replyText, sources });
          return;
        }

        // --- B) SSE striim: uuenda jooksvalt ---
        if (!res.body) throw new Error("Assistent ei saatnud voogu.");

        const reader = createSSEReader(res.body);
        streamingMessageId = appendMessage({ role: "ai", text: "", isStreaming: true });
        let acc = "";
        let sources = [];

        for await (const ev of reader) {
          if (ev.event === "meta") {
            try {
              const payload = JSON.parse(ev.data);
              if (Array.isArray(payload?.sources)) {
                sources = normalizeSources(payload.sources);
                mutateMessage(streamingMessageId, (msg) => ({ ...msg, sources }));
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

  const handleStop = useCallback(
    (e) => {
      e?.preventDefault();
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
      setIsGenerating(false);
    },
    []
  );

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

  return (
    <div
      className="main-content glass-box chat-container chat-container--mobile u-mobile-pane"
      style={{ position: "relative" }}
    >
      <Link href="/profiil" aria-label="Ava profiil" className="avatar-link">
        <img src="/logo/User-circle.svg" alt="Profiil" className="chat-avatar-abs" draggable={false} />
        <span className="avatar-label">Profiil</span>
      </Link>

      <h1 className="glass-title">SotsiaalAI</h1>

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
          className="chat-window u-mobile-scroll u-mobile-safe-pad"
          ref={chatWindowRef}
          role="region"
          aria-label="Chat messages"
          aria-live="polite"
          aria-busy={isStreamingAny ? "true" : "false"}
        >
          {messages.map((msg, i) => {
            const variant = msg.role === "user" ? "chat-msg-user" : "chat-msg-ai";
            return (
              <div key={msg.id ?? i} className={`chat-msg ${variant}`}>
                <div style={{ whiteSpace: "pre-wrap" }}>{msg.text}</div>

                {Array.isArray(msg.sources) && msg.sources.length > 0 ? (
                  <ul
                    className="chat-msg-sources"
                    aria-label="Allikad"
                    style={{
                      marginTop: "0.5rem",
                      paddingLeft: "1.1rem",
                      fontSize: "0.8rem",
                      opacity: 0.85,
                    }}
                  >
                    {msg.sources.map((src) => (
                      <li key={src.key}>
                        {src.url ? (
                          <a
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="chat-source-link"
                          >
                            {src.label}
                            {src.page ? ` (lk ${src.page})` : ""}
                          </a>
                        ) : (
                          <span>
                            {src.label}
                            {src.page ? ` (lk ${src.page})` : ""}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            );
          })}

          {/* Tippimisindikaator — “Mõtleb…” (kuvatakse ainult genereerimise ajal) */}
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
            disabled={!isGenerating && !input.trim()}
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

      <footer className="chat-footer">
        <div className="chat-back-btn-wrapper">
          <button
            type="button"
            className="back-arrow-btn"
            onClick={() => router.push("/")}
            aria-label="Tagasi avalehele"
          >
            <span className="back-arrow-circle" />
          </button>
        </div>
      </footer>

      {/* Tippimisindikaatori stiilid */}
      <style jsx>{`
        .typing-bubble {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 0.4rem;
          padding: 0.85rem 1.1rem;
          border-radius: 14px;
          background:none;
          border: none;
          color: var(--pt-100);
          font-size: 1.05rem;
          line-height: 1.4;
          max-width: 90%;
        }
        .typing-label {
          margin-right: 0.3rem;
          font-weight: 500;
          opacity: 1;
        }
        .dots {
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }
        .dots span {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: currentColor;
          opacity: 0.8;
          animation: typingDot 1.2s ease-in-out infinite;
        }
        .dots span:nth-child(2) {
          animation-delay: 0.2s;
        }
        .dots span:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes typingDot {
          0%,
          80%,
          100% {
            transform: translateY(0);
            opacity: 0.8;
          }
          40% {
            transform: translateY(-4px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
