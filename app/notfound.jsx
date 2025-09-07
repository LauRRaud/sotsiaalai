// app/not-found.jsx
"use client";

import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="main-content glass-box" style={{ textAlign: "center" }}>
      <h1 className="glass-title">Lehte ei leitud</h1>
      <p style={{ marginTop: "0.8em", marginBottom: "1.4em", fontSize: "1.2em" }}>
        Vabandame, otsitud lehte ei eksisteeri või see on eemaldatud.
      </p>

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
    </div>
  );
}
