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

  function sendMessage(e) {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;

    setMessages(msgs => [...msgs, { role: "user", text: input }]);
    setInput("");
    setIsGenerating(true);

    requestAnimationFrame(() => inputRef.current?.focus());

    setTimeout(() => {
      setMessages(msgs => [
        ...msgs,
        { role: "ai", text: "Tere! Väga meeldiv Sinuga vestelda. Peagi oskan rohkem aidata." }
      ]);
      setIsGenerating(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }, 1300);
  }

  function handleStop(e) {
    e.preventDefault();
    setIsGenerating(false);
  }

  function scrollToBottom() {
    chatWindowRef.current?.scrollTo({
      top: chatWindowRef.current.scrollHeight,
      behavior: "smooth",
    });
  }

  // Jälgi kerimist
  useEffect(() => {
    const chatNode = chatWindowRef.current;
    if (!chatNode) return;

function handleScroll() {
  const chatNode = chatWindowRef.current;
  const atBottom =
    chatNode.scrollHeight - chatNode.scrollTop - chatNode.clientHeight <= 50;
  isUserAtBottom.current = atBottom;
  setShowScrollDown(!atBottom); // lihtsam loogika – näita, kui pole all
}

    chatNode.addEventListener("scroll", handleScroll);
    return () => chatNode.removeEventListener("scroll", handleScroll);
  }, []);

  // Kui uus sõnum ja kasutaja on all, kerime ainult chat akent
  useEffect(() => {
    const chatNode = chatWindowRef.current;
    if (chatNode && isUserAtBottom.current) {
      chatNode.scrollTop = chatNode.scrollHeight;
    }
  }, [messages]);

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
          <div className="chat-window" ref={chatWindowRef}>
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
  >
    <svg viewBox="0 0 24 24">
      <path
        d="M4 9l8 8 8-8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
            />
            <button
              type="submit"
              className={`chat-send-btn${isGenerating ? " stop" : ""}`}
              aria-label={isGenerating ? "Peata vastus" : "Saada"}
              title={isGenerating ? "Peata vastus" : "Saada (Enter)"}
            >
              {isGenerating ? (
                <svg width="28" height="28" viewBox="0 0 24 24">
                  <rect x="5" y="5" width="14" height="14" rx="2.5" fill="#1a1a1a" />
                </svg>
              ) : (
                <svg width="38" height="38" viewBox="0 0 24 24">
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
        </footer>
      </div>
  );
}
