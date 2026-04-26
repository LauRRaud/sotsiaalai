"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
const ChatSourcesPanel = memo(function ChatSourcesPanel({
  open,
  t,
  conversationSources,
  latestAnswerSources,
  allConversationSources,
  onClose,
  returnFocusRef
}) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const prevFocusRef = useRef(null);
  const [activeScope, setActiveScope] = useState("latest");
  const latestSources = Array.isArray(latestAnswerSources)
    ? latestAnswerSources
    : Array.isArray(conversationSources)
      ? conversationSources
      : [];
  const historySources = Array.isArray(allConversationSources)
    ? allConversationSources
    : Array.isArray(conversationSources)
      ? conversationSources
      : [];
  const hasLatestSources = latestSources.length > 0;
  const hasHistorySources = historySources.length > 0;
  const showScopeSwitch = hasHistorySources && (
    !hasLatestSources ||
    latestSources.length !== historySources.length ||
    latestSources.some((source, index) => source?.key !== historySources[index]?.key)
  );
  const selectedScope = activeScope === "all" ? "all" : "latest";
  const selectedSources = selectedScope === "all" ? historySources : latestSources;
  const emptyText = selectedScope === "latest" && hasHistorySources
    ? t("chat.sources.latest_empty")
    : t("chat.sources.empty");
  const getFocusables = useCallback(root => {
    if (!root) return [];
    const nodes = root.querySelectorAll(["a[href]", "area[href]", "button:not([disabled])", "input:not([disabled]):not([type='hidden'])", "select:not([disabled])", "textarea:not([disabled])", "[tabindex]:not([tabindex='-1'])"].join(","));
    return Array.from(nodes).filter(el => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length));
  }, []);
  useEffect(() => {
    if (!open) return;
    setActiveScope("latest");
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
  const scopeOptions = useMemo(() => [
    {
      key: "latest",
      label: t("chat.sources.latest_scope"),
      count: latestSources.length
    },
    {
      key: "all",
      label: t("chat.sources.all_scope"),
      count: historySources.length
    }
  ], [historySources.length, latestSources.length, t]);
  if (!open || typeof document === "undefined") return null;
  const overlayClassName =
    "fixed inset-0 z-[170] flex items-center justify-center " +
    "bg-[rgba(7,11,20,0.24)] p-[clamp(0.75rem,2.2vw,1.25rem)]";
  const dialogClassName =
    "chat-sources-window chat-tools-menu isolate flex w-[min(100%,38rem)] " +
    "max-h-[min(78vh,44rem)] flex-col overflow-hidden rounded-[0.88rem] border-0 " +
    "[background:var(--chat-tools-panel-bg,var(--opaque-panel-bg,var(--rail-tooltip-bg,var(--subpage-card-bg))))] " +
    "text-[color:var(--opaque-panel-text,var(--rail-tooltip-text,var(--pt-100)))] " +
    "p-[0.35rem] shadow-[var(--opaque-panel-shadow,var(--rail-tooltip-shadow,var(--subpage-card-shadow)))] " +
    "backdrop-blur-0 backdrop-saturate-100 hc:border-0 hc:shadow-none";
  const headerClassName =
    "relative flex shrink-0 items-center justify-center px-[3.5rem] pb-[0.55rem] pt-[0.7rem]";
  const titleClassName =
    "m-0 w-full text-center text-[clamp(1.36rem,2.4vw,1.78rem)] font-[400] leading-[1.1] tracking-[0.03em] " +
    "text-[color:var(--title-color,var(--brand-primary))] [text-shadow:var(--glass-modal-title-shadow)] " +
    "[font-family:var(--font-aino-headline),var(--font-aino),Arial,sans-serif]";
  const closeClassName =
    "absolute right-[0.78rem] top-[0.55rem] inline-flex h-[2.65rem] w-[2.65rem] items-center justify-center " +
    "rounded-none border-0 bg-transparent p-0 text-[2.05rem] leading-none text-[#c57171] shadow-none " +
    "transition-[transform,color,opacity] duration-[180ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] " +
    "hover:-translate-y-[1px] active:translate-y-[1px] focus-visible:outline-none light:text-[#7a3a38]";
  const bodyClassName =
    "min-h-0 flex-1 overflow-y-auto px-[0.75rem] pb-[0.85rem] pt-[0.18rem]";
  const scopeClassName =
    "mb-[0.65rem] flex rounded-[0.5rem] bg-[color:var(--chat-tools-item-hover-bg,rgba(255,255,255,0.10))] p-[0.18rem]";
  const scopeButtonBaseClassName =
    "min-w-0 flex-1 rounded-[0.38rem] border-0 px-[0.55rem] py-[0.45rem] text-[0.82rem] " +
    "font-[600] leading-[1.15] transition-colors duration-150 focus-visible:outline-none " +
    "focus-visible:ring-2 focus-visible:ring-[color:var(--brand-primary,#93c5fd)]";
  const scopeButtonActiveClassName =
    "bg-[color:var(--chat-tools-item-active-bg,rgba(255,255,255,0.22))] text-[color:var(--opaque-panel-text,var(--pt-100))]";
  const scopeButtonInactiveClassName =
    "bg-transparent text-[color:var(--opaque-panel-text,var(--pt-100))] opacity-70 hover:opacity-100";
  const emptyClassName = "m-0 text-[0.94rem] opacity-80";
  const listClassName = "m-0 list-decimal pl-[1.25rem]";
  const itemClassName =
    "mb-[0.72rem] rounded-[0.5rem] px-[0.45rem] py-[0.38rem] leading-[1.42] " +
    "transition-colors duration-150 hover:bg-[color:var(--chat-tools-item-hover-bg,rgba(255,255,255,0.12))]";
  const labelClassName = "text-[0.98rem] font-[600]";
  const usageClassName = "mt-[0.16rem] text-[0.84rem] opacity-70";
  const pagesClassName = "mt-[0.16rem] text-[0.86rem] opacity-70";
  const linksClassName = "mt-[0.45rem] flex flex-wrap gap-[0.5rem]";
  const linkClassName = "text-[0.9rem] text-[#93c5fd] underline light:text-[#7a3a38]";
  return createPortal(
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
            aria-label={t("buttons.close")}
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>

        <div className={bodyClassName}>
          {showScopeSwitch ? (
            <div className={scopeClassName} role="tablist" aria-label={t("chat.sources.scope_label")}>
              {scopeOptions.map(option => {
                const isActive = selectedScope === option.key;
                return (
                  <button
                    key={option.key}
                    type="button"
                    role="tab"
                    aria-selected={isActive ? "true" : "false"}
                    className={`${scopeButtonBaseClassName} ${isActive ? scopeButtonActiveClassName : scopeButtonInactiveClassName}`}
                    onClick={() => setActiveScope(option.key)}
                  >
                    {option.label} ({option.count})
                  </button>
                );
              })}
            </div>
          ) : null}

          {selectedSources.length === 0 ? (
            <p className={emptyClassName}>
              {emptyText}
            </p>
          ) : (
            <ol className={listClassName}>
              {selectedSources.map((src, idx) => {
                const pageText = String(src.pageText || "").trim();
                const showPageText =
                  pageText &&
                  !/^0+(?:\s*[-,]\s*0+)*$/.test(pageText) &&
                  !`${src.label}`.toLowerCase().includes("lk");
                return (
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

                    {showPageText ? (
                      <div className={pagesClassName}>
                        {t("chat.sources.pages").replace(
                          "{pages}",
                          pageText
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
                );
              })}
            </ol>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
});
export default ChatSourcesPanel;
