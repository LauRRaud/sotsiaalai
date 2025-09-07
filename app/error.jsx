// app/error.jsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Error({ error, reset }) {
  const router = useRouter();

  useEffect(() => {
    console.error("Viga rakenduses:", error);
  }, [error]);

  return (
    <div className="main-content glass-box" style={{ textAlign: "center" }}>
      <h1 className="glass-title">Midagi läks valesti</h1>
      <p style={{ marginTop: "0.8em", marginBottom: "1.4em", fontSize: "1.2em" }}>
        Vabandame, ilmnes ootamatu viga. Palun proovi uuesti või mine tagasi avalehele.
      </p>

      <div style={{ display: "flex", justifyContent: "center", gap: "1.2em" }}>
        <button
          type="button"
          className="btn-primary"
          onClick={() => reset()}
        >
          Proovi uuesti
        </button>

        <div className="chat-back-btn-wrapper" style={{ margin: 0 }}>
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
    </div>
  );
}
