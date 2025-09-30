"use client";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const INTRO_MESSAGE =
  "Tere! SotsiaalAI assistent otsib vastuseid usaldusväärsetest allikatest. Küsi julgelt ja ma teen parima, et aidata.";
const MAX_HISTORY = 8;

/** Normaliseeri serveri allikad üheks kuju(ks): { key, label, url?, page? } */
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
    const raw =
      session?.user?.role ??
      (session?.user?.isAdmin ? "ADMIN" : null);
    const up = String(raw || "").toUpperCase();
    return up || "CLIENT";
  }, [session]);

  const [messages, setMessages] = useState([{ role: "ai", text: INTRO_MESSAGE }]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [errorBanner, setErrorBanner] = useState(null);

  const chatWindowRef = useRef(null);
  const inputRef = useRef(null);
  const isUserAtBottom = useRef(true);
  const abortControllerRef = useRef(null);
  const mountedRef = useRef(false);

  const historyPayload = useMemo(
    () => messages.slice(-MAX_HISTORY).map((m) => ({ role: m.role, text: m.text })),
    [messages]
  );

  const focusInput = useCallback(() => {
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const appendMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, msg]);
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
    return () => {
      mountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, [focusInput]);

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

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed, history: historyPayload, role: userRole }),
          signal: controller.signal,
        });

        if (res.status === 401 || res.status === 403) {
          const params = new URLSearchParams({ callbackUrl: "/vestlus" });
          window.location.href = `/api/auth/signin?${params.toString()}`;
          return;
        }

        let data = null;
        try {
          data = await res.json();
        } catch {
          // kui tuli tühi vms
        }

        if (!res.ok) {
          const msg =
            data?.message ||
            (res.status === 429
              ? "Liiga palju päringuid korraga. Palun proovi hetke pärast uuesti."
              : res.statusText || "Assistent ei vastanud.");
          throw new Error(msg);
        }

        const replyText =
          (data?.answer ?? data?.reply) || "Vabandust, ma ei saanud praegu vastust koostada.";
        const sources = normalizeSources(data?.sources);

        appendMessage({ role: "ai", text: replyText, sources });
      } catch (err) {
        if (err?.name === "AbortError") {
          appendMessage({ role: "ai", text: "Vastuse genereerimine peatati." });
        } else {
          const errText = err?.message || "Vabandust, vastust ei õnnestunud saada.";
          setErrorBanner(errText);
          appendMessage({ role: "ai", text: `Viga: ${errText}` });
        }
      } finally {
        setIsGenerating(false);
        abortControllerRef.current = null;
        focusInput();
      }
    },
    [appendMessage, focusInput, historyPayload, input, isGenerating, userRole]
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
        <img
          src="/logo/User-circle.svg"
          alt="Profiil"
          className="chat-avatar-abs"
          draggable={false}
        />
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
        >
          {messages.map((msg, i) => {
            const variant = msg.role === "user" ? "chat-msg-user" : "chat-msg-ai";
            return (
              <div key={i} className={`chat-msg ${variant}`}>
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
            placeholder="Kirjuta siia oma küsimus... (Shift+Enter = uus rida)"
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
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
                focusable="false"
              >
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
    </div>
  );
}
