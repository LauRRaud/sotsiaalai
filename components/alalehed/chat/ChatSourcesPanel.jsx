"use client";

import { memo, useCallback, useEffect, useRef } from "react";

const ChatSourcesPanel = memo(function ChatSourcesPanel({
  open,
  t,
  conversationSources,
  onClose,
  returnFocusRef,
}) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const prevFocusRef = useRef(null);

  const getFocusables = useCallback((root) => {
    if (!root) return [];
    const nodes = root.querySelectorAll(
      [
        "a[href]",
        "area[href]",
        "button:not([disabled])",
        "input:not([disabled]):not([type='hidden'])",
        "select:not([disabled])",
        "textarea:not([disabled])",
        "[tabindex]:not([tabindex='-1'])",
      ].join(",")
    );
    return Array.from(nodes).filter(
      (el) => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length)
    );
  }, []);

  useEffect(() => {
    if (!open) return;

    try {
      prevFocusRef.current = document.activeElement;
    } catch {}

    const root = dialogRef.current;
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
        const fallback = returnFocusRef?.current;
        const target = prev && typeof prev.focus === "function" ? prev : fallback;
        if (target && typeof target.focus === "function") {
          try {
            target.focus();
          } catch {}
        }
      }, 0);
    };
  }, [open, getFocusables, onClose, returnFocusRef]);

  if (!open) return null;

  return (
    <div
      id="chat-sources-panel"
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={t("chat.sources.dialog_label", "Vestluse allikad")}
      onClick={onClose}
      tabIndex={-1}
      className="chat-sources-overlay"
    >
      <div onClick={(e) => e.stopPropagation()} className="chat-sources-dialog">
        <div className="chat-sources-header">
          <h2 className="chat-sources-title">
            {t("chat.sources.heading", "Vestluse allikad")}
          </h2>
          <button
            type="button"
            ref={closeRef}
            onClick={onClose}
            className="chat-sources-close"
          >
            {t("buttons.close", "Sulge")}
          </button>
        </div>

        {conversationSources.length === 0 ? (
          <p className="chat-sources-empty">
            {t("chat.sources.empty", "Vestluses ei ole allikaid.")}
          </p>
        ) : (
          <ol className="chat-sources-list">
            {conversationSources.map((src, idx) => (
              <li key={src.key || idx} className="chat-source-item">
                <div className="chat-source-label">
                  {src.label}
                </div>
                {src.occurrences > 1 ? (
                  <div className="chat-source-usage">
                    {t("chat.sources.used_multiple", "Kasutatud {count} vestluse lõigus.").replace("{count}", String(src.occurrences))}
                  </div>
                ) : null}

                {src.pageText && !`${src.label}`.toLowerCase().includes("lk") ? (
                  <div className="chat-source-pages">
                    {t("chat.sources.pages", "Leheküljed: {pages}").replace("{pages}", String(src.pageText))}
                  </div>
                ) : null}
                {src.allUrls && src.allUrls.length ? (
                  <div
                    className="chat-source-links"
                  >
                    {src.allUrls.map((url, urlIdx) => (
                      <a
                        key={`${src.key || idx}-url-${urlIdx}`}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="chat-source-link"
                      >
                        {src.allUrls.length > 1
                          ? t("chat.sources.open_indexed", "Ava ({index})").replace("{index}", String(urlIdx + 1))
                          : t("chat.sources.open_single", "Ava allikas")}
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

