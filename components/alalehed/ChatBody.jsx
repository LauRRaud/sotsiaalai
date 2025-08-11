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
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  function sendMessage(e) {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;
    setMessages((msgs) => [...msgs, { role: "user", text: input }]);
    setInput("");
    setIsGenerating(true);

    // Demo: “AI vastus”
    setTimeout(() => {
      setMessages((msgs) => [
        ...msgs,
        { role: "ai", text: "See oleks koht, kus AI vastaks kasutajale!" }
      ]);
      setIsGenerating(false);
    }, 1300);
  }

  // Kui vajutatakse “stop”, katkestame vastuse (simuleeritud)
  function handleStop(e) {
    e.preventDefault();
    setIsGenerating(false);
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="page-bg-gradient">
      <div className="glass-box chat-container" style={{ position: "relative" }}>
        {/* Avatar + tekst – paremas ülanurgas */}
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

        <main className="chat-main">
          <div className="chat-window">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`chat-msg ${msg.role === "user" ? "chat-msg-user" : "chat-msg-ai"}`}
                aria-live="polite"
              >
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* SISEND + NUpp (nupp renderdatakse lahtri sisse CSS-iga) */}
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
            />
            <button
              type="submit"
              className={`chat-send-btn${isGenerating ? " stop" : ""}`}
              aria-label={isGenerating ? "Peata vastus" : "Saada"}
              title={isGenerating ? "Peata vastus" : "Saada (Enter)"}
              tabIndex={0}
            >
{isGenerating ? (
  // STOP-ikoon
  <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="5" y="5" width="14" height="14" rx="2.5" fill="#1a1a1a" />
  </svg>
) : (
  // ÜLESNOOL
<svg width="38" height="38" viewBox="0 0 24 24" aria-hidden="true">
  <path
    d="M4 15l8-8 8 8"
    fill="none"
    stroke="#2a1b07"
    strokeWidth="4"
    strokeLinecap="round"
    strokeLinejoin="round"
    />
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
              <span className="back-arrow-circle"></span>
            </button>
          </div>
          <div className="alaleht-footer">SotsiaalAI &copy; 2025</div>
        </footer>
      </div>
    </div>
  );
}
