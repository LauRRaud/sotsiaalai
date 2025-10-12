"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";

export default function ConversationDrawer({ children }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const closeBtnRef = useRef(null);
  const overlayRef = useRef(null);
  const drawerRootRef = useRef(null); // hoidke overlay + panel ühes “juures”

  // --- Väline toggle event ---
  useEffect(() => {
    function onToggle(e) {
      const want = e?.detail?.open;
      setOpen((prev) => (typeof want === "boolean" ? want : !prev));
    }
    window.addEventListener("sotsiaalai:toggle-conversations", onToggle);
    return () => window.removeEventListener("sotsiaalai:toggle-conversations", onToggle);
  }, []);

  // --- Loo portaalijuure DIV body alla (esmakordsel mountimisel) ---
  useEffect(() => {
    const root = document.createElement("div");
    root.setAttribute("data-conversation-drawer-root", "true");
    drawerRootRef.current = root;
    document.body.appendChild(root);
    return () => {
      try {
        document.body.removeChild(root);
      } catch {}
      drawerRootRef.current = null;
    };
  }, []);

  // --- Body scroll lock + tausta inert/aria-hidden ---
  useEffect(() => {
    const body = document.body;
    if (!open) {
      body.classList.remove("modal-open");
      unsetBackdropInert();
      return;
    }
    body.classList.add("modal-open");
    setBackdropInert();
    return () => {
      body.classList.remove("modal-open");
      unsetBackdropInert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function setBackdropInert() {
    const root = drawerRootRef.current;
    if (!root) return;
    const children = Array.from(document.body.children);
    for (const el of children) {
      if (el === root) continue;
      try {
        el.setAttribute("aria-hidden", "true");
        // inert on eksperimentaalne, lisame kui olemas
        if ("inert" in el) {
          // @ts-ignore
          el.inert = true;
        }
      } catch {}
    }
  }

  function unsetBackdropInert() {
    const root = drawerRootRef.current;
    if (!root) return;
    const children = Array.from(document.body.children);
    for (const el of children) {
      if (el === root) continue;
      try {
        el.removeAttribute("aria-hidden");
        if ("inert" in el) {
          // @ts-ignore
          el.inert = false;
        }
      } catch {}
    }
  }

  // --- ESC sulgemine ---
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // --- Fookuse haldus (trap + esmane fookus) ---
  useEffect(() => {
    if (!open) return;

    // Sea esmane fookus sulgemisnupule (või esimesele fookustavale)
    const toFocus =
      closeBtnRef.current ||
      panelRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
    // väikese viitega, et render jõuaks lõpule
    const t = setTimeout(() => toFocus?.focus(), 0);

    // Trap TAB/Shift+TAB paneeli sisse
    function onKeydown(e) {
      if (e.key !== "Tab") return;
      const focusable = getFocusable(panelRef.current);
      if (!focusable.length) {
        e.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (e.shiftKey) {
        if (active === first || !panelRef.current.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last || !panelRef.current.contains(active)) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    panelRef.current?.addEventListener("keydown", onKeydown);
    return () => {
      clearTimeout(t);
      panelRef.current?.removeEventListener("keydown", onKeydown);
    };
  }, [open]);

  const close = useCallback(() => setOpen(false), []);

  // --- Render (portal) ---
  if (!drawerRootRef.current) return null;

  return createPortal(
    <>
      {open && (
        <div
          ref={overlayRef}
          className="drawer-overlay"
          onClick={close}
          aria-hidden="true"
        />
      )}

      <aside
        ref={panelRef}
        role="dialog"
        aria-label="Vestlused"
        aria-modal="true"
        className={`drawer-panel ${open ? "open" : ""}`}
      >
        <header className="drawer-header">
          <strong>Vestlused</strong>
          <button
            ref={closeBtnRef}
            onClick={close}
            className="drawer-close"
            aria-label="Sulge"
          >
            ✕
          </button>
        </header>

        <div style={{ padding: 12 }}>{children}</div>
      </aside>
    </>,
    drawerRootRef.current
  );
}

/* -------- helpers -------- */

function getFocusable(root) {
  if (!root) return [];
  const nodes = root.querySelectorAll(
    [
      "a[href]",
      "area[href]",
      "button:not([disabled])",
      "input:not([disabled]):not([type='hidden'])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "iframe",
      "object",
      "embed",
      "[contenteditable]",
      "[tabindex]:not([tabindex='-1'])",
    ].join(",")
  );
  return Array.from(nodes).filter((el) => isVisible(el));
}

function isVisible(el) {
  return !!(
    el.offsetWidth ||
    el.offsetHeight ||
    el.getClientRects().length
  );
}

