"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@/components/i18n/I18nProvider";
export default function ConversationDrawer({ children }) {
  const [open, setOpen] = useState(false);
  const [drawerRoot, setDrawerRoot] = useState(null);
  const panelRef = useRef(null);
  const closeBtnRef = useRef(null);
  const overlayRef = useRef(null);
  const drawerRootRef = useRef(null); // overlay + paneli konteiner
  const headerIdRef = useRef(`drawer-title-${Math.random().toString(36).slice(2, 8)}`);
  const { t } = useI18n();
  // --- Väline toggle event ---
  useEffect(() => {
    function onToggle(e) {
      const want = e?.detail?.open;
      setOpen((prev) => (typeof want === "boolean" ? want : !prev));
    }
    window.addEventListener("sotsiaalai:toggle-conversations", onToggle);
    return () => window.removeEventListener("sotsiaalai:toggle-conversations", onToggle);
  }, []);
  // --- Loo / taaskasuta portaalijuurt body all ---
  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    let root = document.querySelector('[data-conversation-drawer-root="true"]');
    let created = false;
    if (!root) {
      root = document.createElement("div");
      root.setAttribute("data-conversation-drawer-root", "true");
      document.body.appendChild(root);
      created = true;
    }
    drawerRootRef.current = root;
    setDrawerRoot(root);
    return () => {
      if (created && root?.parentNode) {
        try { root.parentNode.removeChild(root); } catch {}
      }
      drawerRootRef.current = null;
      setDrawerRoot(null);
    };
  }, []);
  // --- Body scroll lock (koos kerimisriba kompensatsiooniga) ---
  useEffect(() => {
    if (!open) return;
    const body = document.body;
    const prevOverflow = body.style.overflow;
    const prevPaddingRight = body.style.paddingRight;
    const scrollbarWidth = getScrollbarWidth();
    body.style.overflow = "hidden";
    // kui kerimisriba on nähtav, kompenseeri
    if (document.documentElement.scrollHeight > document.documentElement.clientHeight) {
      const current = parseFloat(getComputedStyle(body).paddingRight) || 0;
      body.style.paddingRight = `${current + scrollbarWidth}px`;
    }
    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPaddingRight;
    };
  }, [open]);
  // --- Tausta inert/aria-hidden (ainult sibling'id, portaali juur välja jäetud) ---
  useEffect(() => {
    const portalRoot = drawerRootRef.current;
    if (!portalRoot) return;
    const siblings = Array.from(document.body.children).filter((el) => el !== portalRoot);
    if (open) {
      for (const el of siblings) {
        try {
          el.setAttribute("aria-hidden", "true");
          if ("inert" in el) {
            // @ts-ignore
            el.inert = true;
          }
        } catch {}
      }
      return () => {
        for (const el of siblings) {
          try {
            el.removeAttribute("aria-hidden");
            if ("inert" in el) {
              // @ts-ignore
              el.inert = false;
            }
          } catch {}
        }
      };
    }
  }, [open]);
  // --- ESC sulgemine + TAB fookuse püünis (kuulame dokumendilt avatuna) ---
  useEffect(() => {
    if (!open) return;
    function onKeydown(e) {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const root = panelRef.current;
      if (!root) return;
      const focusable = getFocusable(root);
      if (!focusable.length) {
        e.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (e.shiftKey) {
        if (active === first || !root.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last || !root.contains(active)) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKeydown, true);
    return () => document.removeEventListener("keydown", onKeydown, true);
  }, [open]);
  // --- Esmane fookus paneelis ---
  useEffect(() => {
    if (!open) return;
    const toFocus =
      closeBtnRef.current ||
      panelRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
    const t = setTimeout(() => toFocus?.focus(), 0);
    return () => clearTimeout(t);
  }, [open]);
  const close = useCallback(() => setOpen(false), []);
  // --- Render (portal) ---
  if (!drawerRoot) return null;
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
        aria-labelledby={headerIdRef.current}
        aria-modal={open ? "true" : undefined}
        className={`drawer-panel ${open ? "open" : ""}`}
      >
        <header className="drawer-header">
          <strong id={headerIdRef.current}>{t("chat.menu.label")}</strong>
          <button
            ref={closeBtnRef}
            onClick={close}
            className="drawer-close"
            aria-label={t("buttons.close")}
          >
            ✕
          </button>
        </header>
        <div style={{ padding: 12 }}>{children}</div>
      </aside>
    </>,
    drawerRoot,
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
    ].join(","),
  );
  return Array.from(nodes).filter(isVisible);
}
function isVisible(el) {
  return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
}
function getScrollbarWidth() {
  // mõõdame dünaamiliselt – töökindel kõigil platvormidel
  const scrollDiv = document.createElement("div");
  scrollDiv.style.width = "100px";
  scrollDiv.style.height = "100px";
  scrollDiv.style.overflow = "scroll";
  scrollDiv.style.position = "absolute";
  scrollDiv.style.top = "-9999px";
  document.body.appendChild(scrollDiv);
  const width = scrollDiv.offsetWidth - scrollDiv.clientWidth;
  document.body.removeChild(scrollDiv);
  return width;
}
