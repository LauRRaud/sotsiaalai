"use client";
import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const INTRO_MESSAGE = "Tere! SotsiaalAI assistent otsib vastuseid usaldusväärsetest allikatest. Küsi julgelt ja ma teen parima, et aidata.";
const MAX_HISTORY = 8;

export default function ChatBody() {
  const router = useRouter();
  const { data: session } = useSession();
  const sessionRole = session?.user?.role;
  const userRole = sessionRole === "ADMIN"
    ? "ADMIN"
    : sessionRole
    ? sessionRole
    : session?.user?.isAdmin
    ? "ADMIN"
    : "CLIENT";

  const [messages, setMessages] = useState([{ role: "ai", text: INTRO_MESSAGE }]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);

  const chatWindowRef = useRef(null);
  const inputRef = useRef(null);
  const isUserAtBottom = useRef(true);
  const abortControllerRef = useRef(null);

  async function sendMessage(e) {
    e?.preventDefault();
    if (isGenerating) return;

    const trimmed = input.trim();
    if (!trimmed) return;

    const historyPayload = messages
      .slice(-MAX_HISTORY)
      .map((msg) => ({ role: msg.role, text: msg.text }));

    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    setIsGenerating(true);

    requestAnimationFrame(() => inputRef.current?.focus());

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, history: historyPayload, role: userRole }),
        signal: controller.signal,
      });

      if (!res.ok) {
        let errorMessage = "Assistent ei vastanud.";
        try {
          const errJson = await res.json();
          if (errJson?.message) errorMessage = errJson.message;
        } catch (_) {
          // ignore json parse errors
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();
      const replyText = data?.reply || "Vabandust, ma ei saanud praegu vastust koostada.";
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: replyText,
          sources: Array.isArray(data?.sources) ? data.sources : undefined,
        },
      ]);
    } catch (err) {
      if (err?.name === "AbortError") {
        setMessages((prev) => [
          ...prev,
          { role: "ai", text: "Vastuse genereerimine peatati." },
        ]);
      } else {
        const errText = err?.message || "Vabandust, vastust ei õnnestunud saada.";
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            text: `Viga: ${errText}`,
          },
        ]);
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }

  function handleStop(e) {
    e?.preventDefault();
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsGenerating(false);
  }

  function scrollToBottom() {
    const node = chatWindowRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
  }

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
    const node = chatWindowRef.current;
    if (node && isUserAtBottom.current) {
      node.scrollTop = node.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
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
                {msg.sources?.length ? (
                  <ul
                    className="chat-msg-sources"
                    aria-label="Allikad"
                    style={{ marginTop: "0.5rem", paddingLeft: "1.1rem", fontSize: "0.8rem", opacity: 0.85 }}
                  >
                    {msg.sources.map((src, idx) => {
                      const label = src?.title || src?.url || src?.file || "Allikas";
                      const key = src?.id || src?.url || `${label}-${idx}`;
                      return (
                        <li key={key}>
                          {src?.url ? (
                            <a
                              href={src.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="chat-source-link"
                            >
                              {label}
                            </a>
                          ) : (
                            <span>{label}</span>
                          )}
                        </li>
                      );
                    })}
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
          <input
            id="chat-input"
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Kirjuta siia oma küsimus..."
            className="chat-input-field"
            disabled={isGenerating}
          />

          <button
            type="submit"
            className={`chat-send-btn${isGenerating ? " stop" : ""}`}
            aria-label={isGenerating ? "Peata vastus" : "Saada sõnum"}
            title={isGenerating ? "Peata vastus" : "Saada (Enter)"}
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




