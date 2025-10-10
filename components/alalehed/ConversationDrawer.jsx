"use client";
import { useEffect, useState, useCallback } from "react";

export default function ConversationDrawer({ children }) {
  const [open, setOpen] = useState(false);

  // luba teistelt komponentidelt (nt ChatBody) avada/sulgeda
  useEffect(() => {
    function onToggle(e) {
      const want = e?.detail?.open;
      setOpen((prev) => (typeof want === "boolean" ? want : !prev));
    }
    window.addEventListener("sotsiaalai:toggle-conversations", onToggle);
    return () => window.removeEventListener("sotsiaalai:toggle-conversations", onToggle);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      {/* taust */}
      {open && (
        <div
          onClick={close}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 40,
          }}
          aria-hidden="true"
        />
      )}

      {/* sahtel */}
      <aside
        role="dialog"
        aria-label="Vestlused"
        aria-modal="true"
        style={{
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
          width: 340,
          maxWidth: "85vw",
          transform: open ? "translateX(0)" : "translateX(-105%)",
          transition: "transform .22s ease",
          background: "var(--glass-800, #0f1218)",
          borderRight: "1px solid rgba(255,255,255,.07)",
          zIndex: 41,
          overflow: "auto",
        }}
      >
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 12 }}>
          <strong>Vestlused</strong>
          <button onClick={close} className="btn ghost small" aria-label="Sulge">✕</button>
        </header>

        <div style={{ padding: 12 }}>
          {/* Pane siia sisu (ChatSidebar) */}
          {children}
        </div>
      </aside>
    </>
  );
}
