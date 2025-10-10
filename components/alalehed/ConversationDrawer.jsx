"use client";
import { useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";

export default function ConversationDrawer({ children }) {
  const [open, setOpen] = useState(false);

  // kuula välist toggle event'i
  useEffect(() => {
    function onToggle(e) {
      const want = e?.detail?.open;
      setOpen(prev => (typeof want === "boolean" ? want : !prev));
    }
    window.addEventListener("sotsiaalai:toggle-conversations", onToggle);
    return () => window.removeEventListener("sotsiaalai:toggle-conversations", onToggle);
  }, []);

  // lukusta body scroll kui avatud
  useEffect(() => {
    if (open) document.body.classList.add("modal-open");
    else document.body.classList.remove("modal-open");
    return () => document.body.classList.remove("modal-open");
  }, [open]);

  // ESC sulgeb
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      {open && <div className="drawer-overlay" onClick={close} aria-hidden="true" />}

      <aside
        role="dialog"
        aria-label="Vestlused"
        aria-modal="true"
        className={`drawer-panel ${open ? "open" : ""}`}
      >
        <header className="drawer-header">
          <strong>Vestlused</strong>
          <button onClick={close} className="drawer-close" aria-label="Sulge">✕</button>
        </header>

        <div style={{ padding: 12 }}>
          {children}
        </div>
      </aside>
    </>
  );
}

ConversationDrawer.propTypes = {
  children: PropTypes.node
};
