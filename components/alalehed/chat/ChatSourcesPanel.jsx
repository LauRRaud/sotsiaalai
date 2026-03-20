"use client";

import { memo, useCallback, useEffect, useRef } from "react";
const ChatSourcesPanel = memo(function ChatSourcesPanel({
  open,
  t,
  conversationSources,
  onClose,
  returnFocusRef
}) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const prevFocusRef = useRef(null);
  const getFocusables = useCallback(root => {
    if (!root) return [];
    const nodes = root.querySelectorAll(["a[href]", "area[href]", "button:not([disabled])", "input:not([disabled]):not([type='hidden'])", "select:not([disabled])", "textarea:not([disabled])", "[tabindex]:not([tabindex='-1'])"].join(","));
    return Array.from(nodes).filter(el => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length));
  }, []);
  useEffect(() => {
    if (!open) return;
    try {
      prevFocusRef.current = document.activeElement;
    } catch {}
    const root = dialogRef.current;
    const fallbackFocus = returnFocusRef?.current;
    const initial = closeRef.current || getFocusables(root)[0] || root;
    setTimeout(() => initial?.focus?.(), 0);
    function onKeyDown(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose?.();
        return;
      }
      if (e.key === "Tab") {
        const focusables = getFocusables(root);
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (e.shiftKey) {
          if (active === first || !root.contains(active)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (active === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      const prev = prevFocusRef.current;
      setTimeout(() => {
        const target = prev && typeof prev.focus === "function" ? prev : fallbackFocus;
        if (target && typeof target.focus === "function") {
          try {
            target.focus();
          } catch {}
        }
      }, 0);
    };
  }, [open, getFocusables, onClose, returnFocusRef]);
  if (!open) return null;
  const overlayClassName =
    "fixed inset-0 z-[40] bg-[rgba(9,14,25,0.72)] " +
    "flex items-center justify-center p-[1rem]";
  const dialogClassName =
    "w-full max-w-[34rem] max-h-[80vh] overflow-y-auto rounded-[1.5rem] " +
    "bg-[color:var(--rail-tooltip-bg)] border border-[color:var(--rail-tooltip-border)] " +
    "p-[1.15rem_1.25rem] text-[color:var(--rail-tooltip-text,var(--glass-surface-text,#f8fafc))] " +
    "shadow-[var(--rail-tooltip-shadow)]";
  const headerClassName =
    "flex items-center justify-between gap-[0.75rem] mb-[0.85rem]";
  const titleClassName = "m-0 text-[1.05rem] font-[600]";
  const closeClassName =
    "rounded-full border border-[color:var(--rail-tooltip-border)] bg-[color:var(--rail-tooltip-bg)] " +
    "text-[color:var(--rail-tooltip-text,var(--glass-surface-text,#f1f5f9))] px-[0.75rem] py-[0.3rem] " +
    "text-[0.8rem] font-[500] shadow-[var(--rail-tooltip-shadow)] " +
    "hover:bg-[color:var(--rail-tooltip-bg)] transition-colors";
  const emptyClassName = "m-0 text-[0.92rem] opacity-80";
  const listClassName = "m-0 pl-[1.2rem]";
  const itemClassName = "mb-[1rem] leading-[1.6]";
  const labelClassName = "text-[1rem] font-[600] text-[#f8fafc]";
  const usageClassName = "text-[0.88rem] opacity-70";
  const pagesClassName = "mt-[0.2rem] text-[0.9rem] opacity-70";
  const linksClassName = "mt-[0.45rem] flex flex-wrap gap-[0.5rem]";
  const linkClassName = "text-[0.9rem] text-[#93c5fd] underline";
  return (
    <div
      id="chat-sources-panel"
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={t("chat.sources.dialog_label")}
      onClick={onClose}
      tabIndex={-1}
      className={overlayClassName}
    >
      <div onClick={e => e.stopPropagation()} className={dialogClassName}>
        <div className={headerClassName}>
          <h2 className={titleClassName}>
            {t("chat.sources.heading")}
          </h2>
          <button
            type="button"
            ref={closeRef}
            onClick={onClose}
            className={closeClassName}
          >
            {t("buttons.close")}
          </button>
        </div>

        {conversationSources.length === 0 ? (
          <p className={emptyClassName}>
            {t("chat.sources.empty")}
          </p>
        ) : (
          <ol className={listClassName}>
            {conversationSources.map((src, idx) => (
              <li key={src.key || idx} className={itemClassName}>
                <div className={labelClassName}>{src.label}</div>
                {src.occurrences > 1 ? (
                  <div className={usageClassName}>
                    {t("chat.sources.used_multiple").replace(
                      "{count}",
                      String(src.occurrences)
                    )}
                  </div>
                ) : null}

                {src.pageText &&
                !`${src.label}`.toLowerCase().includes("lk") ? (
                  <div className={pagesClassName}>
                    {t("chat.sources.pages").replace(
                      "{pages}",
                      String(src.pageText)
                    )}
                  </div>
                ) : null}
                {src.allUrls && src.allUrls.length ? (
                  <div className={linksClassName}>
                    {src.allUrls.map((url, urlIdx) => (
                      <a
                        key={`${src.key || idx}-url-${urlIdx}`}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className={linkClassName}
                      >
                        {src.allUrls.length > 1
                          ? t("chat.sources.open_indexed").replace(
                              "{index}",
                              String(urlIdx + 1)
                            )
                          : t("chat.sources.open_single")}
                      </a>
                    ))}
                  </div>
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
});
export default ChatSourcesPanel;
