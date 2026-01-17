"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@/components/i18n/I18nProvider";
import { cn } from "@/components/ui/cn";

const overlayClass =
  "fixed inset-0 z-[80] bg-[rgba(0,0,0,0.45)] backdrop-blur-[2px]";

const panelClass =
  "fixed left-0 top-0 bottom-0 z-[81] w-[21.25rem] max-w-[85vw] overflow-auto border-r border-[color:var(--pt-600)] bg-transparent text-[color:var(--pt-100)] shadow-[0_0_1.875rem_rgba(0,0,0,0.35)]";

const panelGlassClass =
  "relative before:absolute before:inset-0 before:z-0 before:pointer-events-none before:bg-[var(--glass-surface-bg,rgba(0,0,0,0.25))] before:[backdrop-filter:blur(var(--glass-blur-radius,1rem))] before:[-webkit-backdrop-filter:blur(var(--glass-blur-radius,1rem))] light:before:bg-[rgba(255,255,255,0.58)]";

export default function ConversationDrawer({ children }) {
  const [open, setOpen] = useState(false);
  const [drawerRoot, setDrawerRoot] = useState(null);
  const panelRef = useRef(null);
  const closeBtnRef = useRef(null);
  const drawerRootRef = useRef(null);
  const headerIdRef = useRef(
    `drawer-title-${Math.random().toString(36).slice(2, 8)}`
  );
  const { t } = useI18n();

  useEffect(() => {
    function onToggle(e) {
      const want = e?.detail?.open;
      setOpen((prev) => (typeof want === "boolean" ? want : !prev));
    }
    window.addEventListener("sotsiaalai:toggle-conversations", onToggle);
    return () => window.removeEventListener("sotsiaalai:toggle-conversations", onToggle);
  }, []);

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
        try {
          root.parentNode.removeChild(root);
        } catch {}
      }
      drawerRootRef.current = null;
      setDrawerRoot(null);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const body = document.body;
    const prevOverflow = body.style.overflow;
    const prevPaddingRight = body.style.paddingRight;
    const scrollbarWidth = getScrollbarWidth();
    body.style.overflow = "hidden";
    if (document.documentElement.scrollHeight > document.documentElement.clientHeight) {
      const current = parseFloat(getComputedStyle(body).paddingRight) || 0;
      body.style.paddingRight = `${current + scrollbarWidth}px`;
    }
    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPaddingRight;
    };
  }, [open]);

  useEffect(() => {
    const portalRoot = drawerRootRef.current;
    if (!portalRoot || !open) return;
    const siblings = Array.from(document.body.children).filter((el) => el !== portalRoot);
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
  }, [open]);

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

  useEffect(() => {
    if (!open) return;
    const toFocus =
      closeBtnRef.current ||
      panelRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
    const timer = setTimeout(() => toFocus?.focus(), 0);
    return () => clearTimeout(timer);
  }, [open]);

  const close = useCallback(() => setOpen(false), []);

  if (!drawerRoot || !open) return null;

  return createPortal(
    <>
      <div className={overlayClass} onClick={close} aria-hidden="true" />
      <aside
        ref={panelRef}
        role="dialog"
        aria-labelledby={headerIdRef.current}
        aria-modal="true"
        className={cn(panelClass, panelGlassClass)}
      >
        <header className="relative flex items-center justify-center border-b border-[rgba(255,255,255,0.07)] px-[1rem] py-[0.75rem]">
          <strong
            id={headerIdRef.current}
            className="w-full text-center text-[1.25rem] font-bold tracking-[0.03em] text-[color:var(--brand-primary)]"
          >
            {t("chat.menu.label")}
          </strong>
          <button
            ref={closeBtnRef}
            onClick={close}
            className="absolute right-[0.75rem] top-1/2 h-[2.15rem] w-[2.15rem] -translate-y-1/2 rounded-[0.75rem] text-[color:var(--pt-100)] transition-[color,transform] duration-150 hover:text-[color:var(--brand-primary)] active:scale-95"
            aria-label={t("buttons.close")}
            type="button"
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              aria-hidden="true"
            >
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="6" y1="18" x2="18" y2="6" />
            </svg>
          </button>
        </header>
        <div className="relative z-10 px-[0.75rem] py-[0.75rem]">
          {children}
        </div>
      </aside>
    </>,
    drawerRoot
  );
}

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
  return Array.from(nodes).filter(isVisible);
}

function isVisible(el) {
  return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
}

function getScrollbarWidth() {
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
