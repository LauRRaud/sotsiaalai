"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ChatBody() {
  const router = useRouter();

  const [messages, setMessages] = useState([
    { role: "ai", text: "Tere tulemast SotsiaalAI vestlusesse! Kuidas saan aidata?" }
  ]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);

  const chatWindowRef = useRef(null);
  const inputRef = useRef(null);
  const isUserAtBottom = useRef(true);

  // ---- Sõnumi saatmine (näidis/placeholder AI) ----
  function sendMessage(e) {
    e?.preventDefault();
    if (!input.trim() || isGenerating) return;

    const userText = input.trim();
    setMessages((msgs) => [...msgs, { role: "user", text: userText }]);
    setInput("");
    setIsGenerating(true);

    // Hoia fokus inputil
    requestAnimationFrame(() => inputRef.current?.focus());

    // Näidis-AI vastus (asenda reaalse API-kõnega)
    setTimeout(() => {
      setMessages((msgs) => [
        ...msgs,
        { role: "ai", text: "Tere! Väga meeldiv Sinuga vestelda. Peagi oskan rohkem aidata." }
      ]);
      setIsGenerating(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }, 1200);
  }

  function handleStop(e) {
    e?.preventDefault();
    // Simuleeri peatamist
    setIsGenerating(false);
  }

  function scrollToBottom() {
    const node = chatWindowRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
  }

  // ---- Kerimise jälgimine ----
  useEffect(() => {
    const node = chatWindowRef.current;
    if (!node) return;

    function handleScroll() {
      const atBottom =
        node.scrollHeight - node.scrollTop - node.clientHeight <= 50;
      isUserAtBottom.current = atBottom;
      setShowScrollDown(!atBottom);
    }

    node.addEventListener("scroll", handleScroll, { passive: true });
    // algseisu arvutamine
    handleScroll();

    return () => node.removeEventListener("scroll", handleScroll);
  }, []);

  // Kui tekitatakse uus sõnum ja kasutaja on all, kerime automaatselt lõppu
  useEffect(() => {
    const node = chatWindowRef.current;
    if (node && isUserAtBottom.current) {
      node.scrollTop = node.scrollHeight;
    }
  }, [messages]);

  // keskendu inputile mountimisel
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="main-content glass-box chat-container" style={{ position: "relative" }}>
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
          className="chat-window"
          ref={chatWindowRef}
          role="region"
          aria-label="Chat messages"
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`chat-msg ${msg.role === "user" ? "chat-msg-user" : "chat-msg-ai"}`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        {showScrollDown && (
          <button
            className="scroll-down-btn"
            onClick={scrollToBottom}
            aria-label="Kerige chati lõppu"
            title="Kerige lõppu"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 9l8 8 8-8" />
            </svg>
          </button>
        )}

        <form
          className="chat-inputbar"
          onSubmit={isGenerating ? handleStop : sendMessage}
          autoComplete="off"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Kirjuta siia oma küsimus..."
            className="chat-input-field"
            disabled={isGenerating}
            aria-label="Kirjuta sõnum"
          />

          <button
            type="submit"
            className={`chat-send-btn${isGenerating ? " stop" : ""}`}
            aria-label={isGenerating ? "Peata vastus" : "Saada sõnum"}
            title={isGenerating ? "Peata vastus" : "Saada (Enter)"}
          >
            {isGenerating ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
                {/* stop-ruut */}
                <rect x="5" y="5" width="14" height="14" rx="2.5" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                {/* saatmisnoolekujuline ikoon */}
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
