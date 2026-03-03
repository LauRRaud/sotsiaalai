"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@/components/i18n/I18nProvider";
import { cn } from "@/components/ui/cn";
import IconButton from "@/components/ui/IconButton";
export default function ConversationDrawer({
  children
}) {
  const [open, setOpen] = useState(false);
  const [drawerRoot, setDrawerRoot] = useState(null);
  const panelRef = useRef(null);
  const closeBtnRef = useRef(null);
  const overlayRef = useRef(null);
  const drawerRootRef = useRef(null);
  const openRef = useRef(false);
  const lastOpenerRef = useRef(null);
  const headerIdRef = useRef(`drawer-title-${Math.random().toString(36).slice(2, 8)}`);
  const {
    t
  } = useI18n();
  const parkFocusOutsidePanel = () => {
    if (typeof document === "undefined") return;
    const panel = panelRef.current;
    const active = document.activeElement;
    if (!panel || !(active instanceof HTMLElement) || !panel.contains(active)) return;
    try {
      active.blur();
    } catch {}
    const root = drawerRootRef.current;
    if (!(root instanceof HTMLElement) || typeof root.focus !== "function") return;
    const hadTabIndex = root.hasAttribute("tabindex");
    if (!hadTabIndex) root.setAttribute("tabindex", "-1");
    try {
      root.focus({
        preventScroll: true
      });
    } catch {
      try {
        root.focus();
      } catch {}
    }
    if (!hadTabIndex) root.removeAttribute("tabindex");
  };
  useEffect(() => {
    openRef.current = open;
  }, [open]);
  useEffect(() => {
    function onToggle(e) {
      const want = e?.detail?.open;
      const next = typeof want === "boolean" ? want : !openRef.current;
      if (next) {
        const active = document.activeElement;
        lastOpenerRef.current = active instanceof HTMLElement ? active : null;
        setOpen(true);
        return;
      }
      parkFocusOutsidePanel();
      setOpen(false);
    }
    window.addEventListener("sotsiaalai:toggle-conversations", onToggle);
    return () => window.removeEventListener("sotsiaalai:toggle-conversations", onToggle);
  }, []);
  useEffect(() => {
    if (open) return;
    const opener = lastOpenerRef.current;
    if (!(opener instanceof HTMLElement) || !opener.isConnected || typeof opener.focus !== "function") {
      return;
    }
    const id = window.setTimeout(() => {
      try {
        opener.focus({
          preventScroll: true
        });
      } catch {
        try {
          opener.focus();
        } catch {}
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, [open]);
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
    if (typeof document === "undefined") return;
    document.body.classList.toggle("conversation-drawer-open", open);
    return () => {
      document.body.classList.remove("conversation-drawer-open");
    };
  }, [open]);
  useEffect(() => {
    const portalRoot = drawerRootRef.current;
    if (!portalRoot) return;
    const siblings = Array.from(document.body.children).filter(el => el !== portalRoot);
    if (open) {
      const active = document.activeElement;
      if (active instanceof HTMLElement && siblings.some(el => el.contains(active))) {
        const target = closeBtnRef.current || panelRef.current;
        if (target && typeof target.focus === "function") {
          try {
            target.focus({
              preventScroll: true
            });
          } catch {
            try {
              target.focus();
            } catch {}
          }
        }
      }
      for (const el of siblings) {
        try {
          el.setAttribute("aria-hidden", "true");
          if ("inert" in el) {
            el.inert = true;
          }
        } catch {}
      }
      return () => {
        for (const el of siblings) {
          try {
            el.removeAttribute("aria-hidden");
            if ("inert" in el) {
              el.inert = false;
            }
          } catch {}
        }
      };
    }
  }, [open]);
  useEffect(() => {
    if (!open) return;
    function onKeydown(e) {
      if (e.key === "Escape") {
        e.stopPropagation();
        parkFocusOutsidePanel();
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
    const toFocus = closeBtnRef.current || panelRef.current?.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const timer = setTimeout(() => toFocus?.focus(), 0);
    return () => clearTimeout(timer);
  }, [open]);
  const close = () => {
    parkFocusOutsidePanel();
    setOpen(false);
  };
  if (!drawerRoot) return null;
  const overlayClassName =
    "drawer-overlay fixed inset-0 z-[130] bg-transparent [-webkit-backdrop-filter:none] [backdrop-filter:none]";
  const panelClassName = cn(
    "drawer-panel drawer-panel--chat-glass " +
      "fixed top-0 bottom-0 left-0 w-[22rem] max-w-[78vw] z-[131] overflow-hidden " +
      "bg-transparent border-r-0 shadow-none [-webkit-backdrop-filter:none] [backdrop-filter:none] " +
      "text-[color:var(--pt-100)] [scrollbar-width:none] " +
      "[&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0 " +
      "[&::-webkit-scrollbar-thumb]:bg-[linear-gradient(135deg,var(--pt-400),var(--pt-200))] " +
      "[&::-webkit-scrollbar-thumb]:rounded-[0.625rem] [&::-webkit-scrollbar-thumb]:border-[0.1875rem] " +
      "[&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent " +
      "[&::-webkit-scrollbar-track]:bg-transparent " +
      "[backdrop-filter:blur(var(--glass-blur-radius,1rem))] [-webkit-backdrop-filter:blur(var(--glass-blur-radius,1rem))] " +
      "before:content-[''] before:absolute before:inset-0 before:pointer-events-none " +
      "before:[background:var(--drawer-glass-bg,var(--glass-surface-bg,rgba(0,0,0,0.25)))] before:opacity-100 " +
      "before:[filter:none] before:[-webkit-filter:none] " +
      "before:[backdrop-filter:blur(var(--glass-blur-radius,1rem))] before:[-webkit-backdrop-filter:blur(var(--glass-blur-radius,1rem))] " +
      "before:z-0 [&>*]:relative [&>*]:z-[1] " +
      "transition-transform duration-[220ms] ease-out",
    open
      ? "translate-x-0 visible pointer-events-auto"
      : "-translate-x-[105%] invisible pointer-events-none",
    open ? "open" : null
  );
  const headerClassName =
    "drawer-header relative flex items-center justify-center px-[1.2rem] pt-[0.66rem] pb-[0.42rem] border-b-0";
  const closeButtonClassName =
    "drawer-close drawer-close-btn--chat absolute top-[0.08rem] right-[0.18rem] z-[6] " +
    "!p-0 !w-[2.7rem] !h-[2.7rem] !rounded-full !border-0 !bg-transparent !shadow-none " +
    "text-[#c57171] light:text-[#7a3a38] [&>span]:text-[2rem] " +
    "max-[768px]:!w-[3.2rem] max-[768px]:!h-[3.2rem] max-[768px]:[&>span]:text-[2.35rem]";
  const contentClassName =
    "drawer-content px-[1rem] pt-[0.65rem] pb-[1rem] h-[calc(100%-3.2rem)] overflow-hidden";
  return createPortal(<>
      {open && <div ref={overlayRef} className={overlayClassName} onClick={close} aria-hidden="true" />}
      <aside ref={panelRef} role="dialog" aria-labelledby={headerIdRef.current} aria-modal={open ? "true" : undefined} aria-hidden={open ? undefined : "true"} inert={open ? undefined : true} tabIndex={open ? undefined : -1} className={panelClassName}>
        <header className={headerClassName}>
          <h1 id={headerIdRef.current} className="drawer-title w-full text-center text-[clamp(1.62rem,1.28rem+1.2vw,2.08rem)] max-[768px]:text-[clamp(2rem,8.1vw,2.45rem)] leading-[1.1] tracking-[0.018em] mt-[clamp(0.2rem,0.62vh,0.36rem)] mb-[clamp(0.34rem,1vh,0.7rem)] text-[#d18484] light:text-[#7A3A38] [font-family:var(--font-aino-headline),var(--font-aino),Arial,sans-serif] font-[500] opacity-100 [text-shadow:0_0.2rem_0.65rem_rgba(0,0,0,0.28)] light:[text-shadow:0_0.1rem_0.35rem_rgba(255,255,255,0.22)]">
            {t("chat.menu.label")}
          </h1>
          <IconButton ref={closeBtnRef} onClick={close} className={closeButtonClassName} label={t("buttons.close")} />
        </header>
        <div className={contentClassName}>
          {children}
        </div>
      </aside>
    </>, drawerRoot);
}
function getFocusable(root) {
  if (!root) return [];
  const nodes = root.querySelectorAll(["a[href]", "area[href]", "button:not([disabled])", "input:not([disabled]):not([type='hidden'])", "select:not([disabled])", "textarea:not([disabled])", "iframe", "object", "embed", "[contenteditable]", "[tabindex]:not([tabindex='-1'])"].join(","));
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
