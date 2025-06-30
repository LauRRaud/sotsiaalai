"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function ChatBody() {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Tere tulemast SotsiaalAI vestlusesse! Kuidas saan aidata?" }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  function sendMessage(e) {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages(msgs => [
      ...msgs,
      { role: "user", text: input }
    ]);
    setInput("");
    setTimeout(() => {
      setMessages(msgs =>
        [...msgs, { role: "ai", text: "See oleks koht, kus AI vastaks kasutajale!" }]
      );
    }, 700);
  }

  // Automaatne kerimine viimase sõnumi juurde
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="page-bg-gradient">
      <div className="glass-box chatbox-override" role="main" aria-labelledby="chat-title">
        <div className="chat-profile">
          <Link href="/profiil" aria-label="Ava profiil">
            <img
              src="data:image/svg+xml;utf8,<svg width='44' height='44' xmlns='http://www.w3.org/2000/svg'><circle cx='22' cy='22' r='22' fill='%238a60e1'/><circle cx='22' cy='16' r='7' fill='%23e3d2ff'/><ellipse cx='22' cy='31' rx='12' ry='7' fill='%23e3d2ff'/></svg>"
              alt="Profiil"
              className="chat-avatar"
              draggable={false}
            />
          </Link>
        </div>

        <h1 id="chat-title" className="glass-title" style={{ marginTop: 0 }}>
          SotsiaalAI
        </h1>

        <div className="chat-window" tabIndex={0}>
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

        <form
          className="chat-inputbar"
          onSubmit={sendMessage}
          autoComplete="off"
        >
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Kirjuta siia oma küsimus..."
            autoFocus
            className="chat-input"
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                sendMessage(e);
              }
            }}
          />
          <button type="submit" className="chat-send-btn">
            Saada
          </button>
        </form>

        <Link href="/" className="back-link" tabIndex={0}>
          &larr; Avalehele
        </Link>
      </div>
    </div>
  );
}
