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
    setMessages(msgs => [...msgs, { role: "user", text: input }]);
    setInput("");
    setIsGenerating(true);

    // Demo: “AI vastus”
    setTimeout(() => {
      setMessages(msgs =>
        [...msgs, { role: "ai", text: "See oleks koht, kus AI vastaks kasutajale!" }]
      );
      setIsGenerating(false);
    }, 1300);
  }

  // Kui vajutatakse “stop”, katkestame vastuse (simuleeritud)
  function handleStop(e) {
    e.preventDefault();
    setIsGenerating(false);
    // soovi korral saad lisada päris fetch-i katkestuse siia
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
    src={`data:image/svg+xml;utf8,<svg width='64' height='64' xmlns='http://www.w3.org/2000/svg'>
      <defs>
        <linearGradient id='btnGrad' x1='0' y1='0' x2='1' y2='0'>
          <stop offset='60%' stop-color='%23e2d1c3'/>
          <stop offset='100%' stop-color='%23bfa177'/>
        </linearGradient>
      </defs>
      <circle cx='32' cy='32' r='32' fill='url(%23btnGrad)'/>
      <circle cx='32' cy='23' r='11' fill='%23fff9f3'/>
      <ellipse cx='32' cy='45' rx='18' ry='10' fill='%23d1b894'/>
    </svg>`}
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
          <form className="chat-inputbar" onSubmit={isGenerating ? handleStop : sendMessage} autoComplete="off">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Kirjuta siia oma küsimus..."
              className="chat-input-field"
              disabled={isGenerating}
            />
            <button
              type="submit"
              className={`chat-send-btn${isGenerating ? " stop" : ""}`}
              aria-label={isGenerating ? "Peata vastus" : "Saada"}
              tabIndex={0}
            >
              {isGenerating ? (
                // Must ruut SVG
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="12" fill="#181818"/>
                  <rect x="7" y="7" width="10" height="10" rx="2.5" fill="#fff6e0"/>
                </svg>
              ) : (
                // Ülesnool SVG
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="12" fill="url(#btnGrad)"/>
                  <path d="M7 13l5-5 5 5" stroke="#332000" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <defs>
                    <linearGradient id="btnGrad" x1="0" y1="12" x2="24" y2="12" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#e2d1c3"/>
                      <stop offset="1" stopColor="#bfa177"/>
                    </linearGradient>
                  </defs>
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
