"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function ChatBody() {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Tere tulemast SotsiaalAI vestlusesse! Kuidas saan aidata?" }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  function sendMessage(e) {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages(msgs => [...msgs, { role: "user", text: input }]);
    setInput("");
    setTimeout(() => {
      setMessages(msgs =>
        [...msgs, { role: "ai", text: "See oleks koht, kus AI vastaks kasutajale!" }]
      );
    }, 700);
  }

  // Scrollib alla, kui sõnumid muutuvad
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  // Fookus inputile
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="chat-root">
      <div className="chat-container">
        <header className="chat-header">
          <div className="chat-title-wrapper">
            <h1 className="chat-title">SotsiaalAI</h1>
          </div>
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
        </header>
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
          <form className="chat-inputbar" onSubmit={sendMessage} autoComplete="off">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Kirjuta siia oma küsimus..."
              className="chat-input"
            />
            <button type="submit" className="chat-send-btn">
              Saada
            </button>
          </form>
        </main>
        <footer className="chat-footer">
          <Link href="/" className="back-link">&larr; Avalehele</Link>
          <div className="alaleht-footer">Sotsiaal.AI &copy; 2025</div>
        </footer>
      </div>
    </div>
  );
}
