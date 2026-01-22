"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import SotsiaalAILoader from "@/components/ui/SotsiaalAILoader";
import Button from "@/components/ui/Button";
const docToggleLabelClassName = "flex items-center gap-[0.6rem] rounded-[0.95rem] border border-[rgba(148,163,184,0.35)] bg-[rgba(10,14,24,0.35)] px-[0.8rem] py-[0.55rem] text-[0.95rem] text-[color:var(--pt-120)]";
const docToggleInputClassName = "h-[1.05rem] w-[1.05rem] accent-[color:var(--brand-primary)]";
const ChatAnalysisPanel = memo(function ChatAnalysisPanel({
  t,
  analysisPanelRef,
  analysisPanelMode,
  uploadPreview,
  uploadBusy,
  uploadError,
  uploadUsage,
  previewText,
  analysisCollapsed,
  toggleAnalysisCollapse,
  docOnlyMode,
  setDocOnlyMode,
  extendedLabel,
  contextHint,
  inputRef,
  onPickFile,
  setUploadPreview,
  setUploadError,
  setEphemeralChunks,
  closeAnalysisPanel,
  isGenerating,
  prettifyFileName
}) {
  const previewRef = useRef(null);
  const scrollTrackRef = useRef(null);
  const isDraggingScroll = useRef(false);
  const [previewScroll, setPreviewScroll] = useState(0);
  const handlePreviewWheel = useCallback(event => {
    const panel = analysisPanelRef.current;
    const previewNode = previewRef.current;
    if (!panel || !previewNode) return;
    const mode = panel.dataset?.analysisMode;
    const isOverlay = mode === "overlay";
    const isExpanded = mode === "expanded";
    const rect = panel.getBoundingClientRect();
    const vh = typeof window !== "undefined" ? window.innerHeight || document.documentElement.clientHeight || 0 : 0;
    const margin = 24;
    const maxScroll = previewNode.scrollHeight - previewNode.clientHeight;
    if (maxScroll <= 0) return;
    const deltaY = event.deltaY;
    const atTop = previewNode.scrollTop <= 0;
    const atBottom = previewNode.scrollTop >= maxScroll;
    const belowViewport = rect.bottom > vh - margin;
    if (!isOverlay && !isExpanded && belowViewport && vh > 0 && deltaY > 0) {
      if (event.cancelable) event.preventDefault();
      panel.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
      return;
    }
    const canScrollDown = deltaY > 0 && !atBottom;
    const canScrollUp = deltaY < 0 && !atTop;
    if (canScrollDown || canScrollUp) {
      if (event.cancelable) event.preventDefault();
      const next = Math.max(0, Math.min(maxScroll, previewNode.scrollTop + deltaY));
      previewNode.scrollTop = next;
      const maxAfter = previewNode.scrollHeight - previewNode.clientHeight;
      if (maxAfter > 0) {
        setPreviewScroll(next / maxAfter);
      }
    }
  }, [analysisPanelRef]);
  useEffect(() => {
    function updateScrollFromClientY(clientY) {
      const track = scrollTrackRef.current;
      const node = previewRef.current;
      if (!track || !node) return;
      const rect = track.getBoundingClientRect();
      const ratio = (clientY - rect.top) / rect.height;
      const clamped = Math.max(0, Math.min(1, ratio));
      const max = node.scrollHeight - node.clientHeight;
      if (max <= 0) return;
      setPreviewScroll(clamped);
      node.scrollTo({
        top: clamped * max,
        behavior: "auto"
      });
    }
    function handleMouseMove(e) {
      if (!isDraggingScroll.current) return;
      e.preventDefault();
      updateScrollFromClientY(e.clientY);
    }
    function handleMouseUp() {
      isDraggingScroll.current = false;
    }
    function handleTouchMove(e) {
      if (!isDraggingScroll.current) return;
      const touch = e.touches?.[0];
      if (!touch) return;
      e.preventDefault();
      updateScrollFromClientY(touch.clientY);
    }
    function handleTouchEnd() {
      isDraggingScroll.current = false;
    }
    const passiveFalse = {
      passive: false
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove, passiveFalse);
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("touchcancel", handleTouchEnd);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove, passiveFalse);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, []);
  return <section ref={analysisPanelRef} className={`chat-analysis-panel${analysisPanelMode === "expanded" ? " chat-analysis-panel--expanded" : analysisPanelMode === "overlay" ? " chat-analysis-panel--overlay" : ""}`} role="region" aria-live="polite" aria-label={t("chat.upload.summary")} data-analysis-mode={analysisPanelMode}>
      <div className="chat-analysis-card">
        <header className="chat-analysis-header relative">
          {uploadPreview ? <div className="chat-analysis-titleblock">
              <div className="chat-analysis-file-name">
                {prettifyFileName(uploadPreview.fileName)}
              </div>
            </div> : null}
          <button type="button" className="chat-analysis-close modal-close-btn" onClick={() => {
          setUploadPreview(null);
          setUploadError(null);
          setEphemeralChunks([]);
          setDocOnlyMode(true);
          closeAnalysisPanel();
        }} aria-label={t("buttons.close", "Sulge")} />
        </header>
        <div className="chat-analysis-body">
          {uploadBusy ? <div className="chat-analysis-status">{t("chat.upload.busy")}</div> : null}
          {uploadError ? <div className="chat-analysis-error">{uploadError}</div> : null}
          {uploadPreview ? <>
              <div className="chat-analysis-controls chat-analysis-controls--context chat-analysis-controls--header">
                <div className="chat-analysis-mode-row">
                  <label className={docToggleLabelClassName} id="chat-doc-mode-label">
                    <input type="checkbox" className={docToggleInputClassName} checked={!docOnlyMode} onChange={e => setDocOnlyMode(!e.target.checked)} aria-describedby="chat-upload-context-hint" />
                    <span className="text-[0.95rem] leading-[1.2] text-[color:var(--pt-120)]">{extendedLabel}</span>
                  </label>
                  <button type="button" className="chat-context-info chat-context-info--inline chat-context-info--label" aria-label={contextHint} onClick={e => {
                e.preventDefault();
                e.stopPropagation();
              }}>
                    <span className="chat-context-info-icon" aria-hidden="true">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" className="chat-context-info-icon-svg">
                        <path d="M80 160c0-35.3 28.7-64 64-64h32c35.3 0 64 28.7 64 64v3.6c0 21.8-11.1 42.1-29.4 53.8l-42.2 27.1c-25.2 16.2-40.4 44.1-40.4 74V320c0 17.7 14.3 32 32 32s32-14.3 32-32v-1.4c0-8.2 4.2-15.8 11-20.2l42.2-27.1c36.6-23.6 58.8-64.1 58.8-107.7V160c0-70.7-57.3-128-128-128H144C73.3 32 16 89.3 16 160c0 17.7 14.3 32 32 32s32-14.3 32-32zm80 320a40 40 0 1 0 0-80 40 40 0 1 0 0 80z" />
                      </svg>
                    </span>
                    <span className="chat-context-info-tooltip">
                      {contextHint}
                    </span>
                  </button>
                </div>
              </div>
              <p id="chat-upload-context-hint" className="sr-only">
                {contextHint}
              </p>
              {previewText ? <div className="chat-analysis-actions chat-analysis-actions--inline chat-analysis-actions--center">
                  <Button type="button" size="sm" variant="primary" className="chat-analysis-jump chat-analysis-jump--ask" onClick={() => {
              inputRef.current?.focus();
              inputRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "center"
              });
            }} aria-label={t("chat.upload.jump_to_chat", "Küsi")} title={t("chat.upload.jump_to_chat", "Küsi")}>
                    {t("chat.upload.jump_to_chat", "Küsi")}
                  </Button>
                  <Button type="button" size="sm" variant="primary" className="chat-analysis-jump" onClick={toggleAnalysisCollapse}>
                    {analysisCollapsed ? t("chat.upload.summary_show", "Näita") : t("chat.upload.summary_hide", "Peida")}
                  </Button>
                </div> : null}

              {!analysisCollapsed && previewText ? <div className="chat-analysis-preview-wrap">
                  <div ref={previewRef} className="chat-analysis-preview chat-upload-preview-scroll" tabIndex={0} aria-label={t("chat.upload.preview", "Dokumendi tekst")} onWheel={handlePreviewWheel} onScroll={() => {
              const node = previewRef.current;
              if (!node) return;
              const max = node.scrollHeight - node.clientHeight;
              if (max <= 0) {
                setPreviewScroll(0);
                return;
              }
              setPreviewScroll(node.scrollTop / max);
            }}>
                    {previewText}
                  </div>
                  <div ref={scrollTrackRef} className="chat-analysis-scroll-track" onClick={event => {
              const track = scrollTrackRef.current;
              const node = previewRef.current;
              if (!track || !node) return;
              const rect = track.getBoundingClientRect();
              const ratio = (event.clientY - rect.top) / rect.height;
              const max = node.scrollHeight - node.clientHeight;
              if (max <= 0) return;
              const clamped = Math.max(0, Math.min(1, ratio));
              setPreviewScroll(clamped);
              node.scrollTo({
                top: clamped * max,
                behavior: "smooth"
              });
            }} onMouseDown={event => {
              const track = scrollTrackRef.current;
              const node = previewRef.current;
              if (track && node) {
                const rect = track.getBoundingClientRect();
                const ratio = (event.clientY - rect.top) / rect.height;
                const max = node.scrollHeight - node.clientHeight;
                if (max > 0) {
                  const clamped = Math.max(0, Math.min(1, ratio));
                  setPreviewScroll(clamped);
                  node.scrollTo({
                    top: clamped * max,
                    behavior: "auto"
                  });
                }
              }
              isDraggingScroll.current = true;
              event.preventDefault();
            }} onTouchStart={event => {
              const track = scrollTrackRef.current;
              const node = previewRef.current;
              const touch = event.touches?.[0];
              if (track && node && touch) {
                const rect = track.getBoundingClientRect();
                const ratio = (touch.clientY - rect.top) / rect.height;
                const max = node.scrollHeight - node.clientHeight;
                if (max > 0) {
                  const clamped = Math.max(0, Math.min(1, ratio));
                  setPreviewScroll(clamped);
                  node.scrollTo({
                    top: clamped * max,
                    behavior: "auto"
                  });
                }
              }
              isDraggingScroll.current = true;
              event.preventDefault();
            }} aria-hidden="true">
                    <div className="chat-analysis-scroll-thumb" style={{
                top: `calc(${previewScroll * 100}% + 0.3rem)`,
                opacity: previewScroll > 0.92 || previewScroll < 0.02 ? 0 : 1,
                transition: "opacity 0.16s ease"
              }} onMouseDown={event => {
                const track = scrollTrackRef.current;
                const node = previewRef.current;
                if (track && node) {
                  const rect = track.getBoundingClientRect();
                  const ratio = (event.clientY - rect.top) / rect.height;
                  const max = node.scrollHeight - node.clientHeight;
                  if (max > 0) {
                    const clamped = Math.max(0, Math.min(1, ratio));
                    setPreviewScroll(clamped);
                    node.scrollTo({
                      top: clamped * max,
                      behavior: "auto"
                    });
                  }
                }
                isDraggingScroll.current = true;
                event.preventDefault();
              }} onTouchStart={event => {
                const track = scrollTrackRef.current;
                const node = previewRef.current;
                const touch = event.touches?.[0];
                if (track && node && touch) {
                  const rect = track.getBoundingClientRect();
                  const ratio = (touch.clientY - rect.top) / rect.height;
                  const max = node.scrollHeight - node.clientHeight;
                  if (max > 0) {
                    const clamped = Math.max(0, Math.min(1, ratio));
                    setPreviewScroll(clamped);
                    node.scrollTo({
                      top: clamped * max,
                      behavior: "auto"
                    });
                  }
                }
                isDraggingScroll.current = true;
                event.preventDefault();
              }}>
                      <SotsiaalAILoader size="1rem" animated={false} ariaHidden />
                    </div>
                  </div>
                </div> : null}
            </> : <div className="chat-analysis-empty">
              <Button type="button" size="sm" variant="primary" onClick={onPickFile} disabled={uploadBusy || isGenerating}>
                {t("chat.upload.aria")}
              </Button>
              <p className="chat-analysis-meta chat-analysis-meta--spaced">
                {uploadUsage?.limit ? t("chat.upload.usage", "{used}/{limit} analƒ?tƒ¦?Ž©ƒ?tƒ¦?Ž©si tƒ?tƒ¦?Ž©na").replace("{used}", String(Math.max(0, Math.min(uploadUsage.used ?? 0, uploadUsage.limit ?? Infinity)))).replace("{limit}", String(uploadUsage.limit ?? 0)) : ""}
              </p>
            </div>}
        </div>
      </div>
    </section>;
});
export default ChatAnalysisPanel;
