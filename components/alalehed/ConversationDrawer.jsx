"use client";
import { useEffect, useState, useCallback, useRef } from "react";

/**
 * ConversationDrawer
 * - Ava/sulge sündmusega: new CustomEvent("sotsiaalai:toggle-conversations", { detail: { open?: boolean, opener?: HTMLElement } })
 * - ESC sulgeb
 * - Tab/Shift+Tab fookuse lõks
 * - Overlay klikk sulgeb (sisu ei kuku läbi)
 * - Fookuse taastamine avamisnupule
 * - Body scroll-lock (lisab klassi body.modal-open)
 */
export default function ConversationDrawer({ children }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const lastOpenerRef = useRef(null);

  // Ava/sulge välise sündmusega
  useEffect(() => {
    function onToggle(e) {
      const want = e?.detail?.open;
      lastOpenerRef.current = e?.detail?.opener || document.activeElement || null;
      setOpen((prev) => (typeof want === "boolean" ? want : !prev));
    }
    window.addEventListener("sotsiaalai:toggle-conversations", onToggle);
    return () => window.removeEventListener("sotsiaalai:toggle-conversations", onToggle);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  // Body scroll-lock + fookuse seadmine/taastamine
  useEffect(() => {
    const body = document.body;
    if (open) {
      body.classList.add("modal-open");
      const t = setTimeout(() => focusFirst(panelRef.current), 0);
      return () => {
        clearTimeout(t);
        body.classList.remove("modal-open");
      };
    } else {
      if (lastOpenerRef.current instanceof HTMLElement) {
        lastOpenerRef.current.focus?.();
      }
    }
  }, [open]);

  // ESC + Tab focus trap
  const onKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key === "Tab") {
        const nodes = getFocusable(panelRef.current);
        if (!nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [close]
  );

  return (
    <>
      {open && (
        <div
          className="drawer-overlay"
          onClick={close}
          aria-hidden="true"
        />
      )}

      <aside
        className={`drawer-panel cs-scroll ${open ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        ref={panelRef}
        onKeyDown={onKeyDown}
        onClick={(e) => e.stopPropagation()} /* väldi overlay click-through’i */
      >
        <header className="drawer-header">
          <strong id="drawer-title">Vestlused</strong>
          <button
            type="button"
            className="drawer-close"
            onClick={close}
            aria-label="Sulge"
          >
            ✕
          </button>
        </header>

        <div className="cs-container" style={{ padding: 12 }}>
          {children}
        </div>
      </aside>
    </>
  );
}

/* ===== Abifunktsioonid ===== */
function getFocusable(root) {
  if (!root) return [];
  const sel =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
  return Array.from(root.querySelectorAll(sel)).filter(
    (el) =>
      !el.hasAttribute("disabled") &&
      el.getAttribute("tabindex") !== "-1" &&
      el.getAttribute("aria-hidden") !== "true"
  );
}

function focusFirst(root) {
  const f = getFocusable(root);
  (f[0] || root)?.focus?.();
}
