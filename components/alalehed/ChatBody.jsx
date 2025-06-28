"use client";

import { useState } from "react";
import Link from "next/link";

export default function ChatBody() {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Tere tulemast SotsiaalAI vestlusesse! Kuidas saan aidata?" }
  ]);
  const [input, setInput] = useState("");

  function sendMessage(e) {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages([...messages, { role: "user", text: input }]);
    setInput("");
    setTimeout(() => {
      setMessages(msgs =>
        [...msgs, { role: "ai", text: "See oleks koht, kus AI vastaks kasutajale!" }]
      );
    }, 700);
  }

  return (
    <div className="alaleht-hero">
      <div className="alaleht-inner">
        <div className="alaleht-box chatbox-override">
          {/* Profiili ikoon paremal üleval */}
          <div className="chat-profile">
            <Link href="/profiil" aria-label="Ava profiil">
              <img
                src="data:image/svg+xml;utf8,<svg width='44' height='44' xmlns='http://www.w3.org/2000/svg'><circle cx='22' cy='22' r='22' fill='%237f2ab1'/><circle cx='22' cy='16' r='7' fill='%23e3d2ff'/><ellipse cx='22' cy='31' rx='12' ry='7' fill='%23e3d2ff'/></svg>"
                alt="Profiil"
                className="chat-avatar"
                style={{ cursor: "pointer" }}
              />
            </Link>
          </div>

          {/* Pealkiri */}
          <h1 className="alaleht-title" style={{ marginTop: 0, marginBottom: "1em" }}>
            SotsiaalAI
          </h1>

          {/* Vestlusaken */}
          <div className="chat-window">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg chat-msg-${msg.role}`}>
                {msg.text}
              </div>
            ))}
          </div>

          {/* Sisestus */}
          <form className="chat-inputbar" onSubmit={sendMessage}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Kirjuta siia oma küsimus..."
              autoFocus
            />
            <button type="submit">Saada</button>
          </form>

          {/* Avalehe link kõige all */}
          <Link href="/" className="back-link" style={{ marginTop: "2.5em" }}>
            &larr; Avalehele
          </Link>
        </div>
      </div>
    </div>
  );
}
