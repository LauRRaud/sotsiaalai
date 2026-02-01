"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import SotsiaalAILoader from "@/components/ui/SotsiaalAILoader";
import Button from "@/components/ui/Button";
import OptionCard from "@/components/ui/OptionCard";
import { cn } from "@/components/ui/cn";
const docToggleCardClassName =
  "w-auto min-w-0 !min-h-[2.8rem] !px-[0.8rem] !py-[0.7rem] !text-[0.98rem] !leading-[1.1] " +
  "[--seg-card-radius:999px] [--seg-control-size:18px] [--seg-check-size:14px]";
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
  const handlePreviewWheel = useCallback(
    event => {
      const panel = analysisPanelRef.current;
      const previewNode = previewRef.current;
      if (!panel || !previewNode) return;
      const mode = panel.dataset?.analysisMode;
      const isOverlay = mode === "overlay";
      const isExpanded = mode === "expanded";
      const rect = panel.getBoundingClientRect();
      const vh =
        typeof window !== "undefined"
          ? window.innerHeight || document.documentElement.clientHeight || 0
          : 0;
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
        const next = Math.max(
          0,
          Math.min(maxScroll, previewNode.scrollTop + deltaY)
        );
        previewNode.scrollTop = next;
        const maxAfter = previewNode.scrollHeight - previewNode.clientHeight;
        if (maxAfter > 0) {
          setPreviewScroll(next / maxAfter);
        }
      }
    },
    [analysisPanelRef]
  );
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
  const panelBaseClassName =
    "w-full max-w-[min(94vw,var(--chat-diameter,94vw))] " +
    "px-[var(--chat-hpad,clamp(0.8rem,2.6vw,1.6rem))] mx-auto " +
    "mt-[clamp(0.3rem,0.8vw,0.5rem)] mb-[clamp(1.2rem,3vw,2rem)] " +
    "relative z-[30]";
  const panelWideClassName =
    "max-w-[var(--analysis-panel-width,94vw)] w-[var(--analysis-panel-width,94vw)] px-0";
  const panelExpandedClassName =
    "relative mt-[clamp(0.3rem,0.8vw,0.5rem)] px-[clamp(0.05rem,0.8vw,0.55rem)]";
  const panelOverlayClassName =
    "fixed left-1/2 bottom-[max(env(safe-area-inset-bottom,0px),1.6rem)] " +
    "-translate-x-1/2 w-[min(62vw,24rem)] p-[clamp(0.05rem,0.6vw,0.4rem)] " +
    "z-[90] pointer-events-auto";
  const cardClassName =
    "w-full max-w-none rounded-[1.5em] border-0 " +
    "bg-[color:var(--glass-surface-bg,rgba(0,0,0,0.25))] text-[color:var(--glass-surface-text,#f2f2f2)] " +
    "backdrop-blur-[var(--glass-blur-radius,1rem)] " +
    "[--analysis-card-pad-y:clamp(0.65rem,2vw,1rem)] " +
    "[--analysis-card-pad-x:clamp(0.8rem,2.6vw,1.6rem)] " +
    "[--analysis-card-pad-b:clamp(0.9rem,2.6vw,1.4rem)] " +
    "p-[var(--analysis-card-pad-y)_var(--analysis-card-pad-x)_var(--analysis-card-pad-b)] " +
    "tracking-[0.035em] text-rendering-geometricPrecision isolate " +
    "antialiased flex flex-col gap-[0.9rem] relative z-[100] pointer-events-auto " +
    "light:bg-[color:var(--glass-surface-bg,rgba(255,255,255,0.65))] light:text-[color:var(--glass-surface-text,#0f172a)] " +
    "light:backdrop-blur-[var(--glass-blur-radius,1rem)]";
  const headerClassName =
    "flex flex-col items-center justify-center gap-[1.05rem] flex-wrap relative z-[80] " +
    "pt-[0.4rem] mb-[0.6rem]";
  const titleBlockClassName =
    "flex-1 min-w-0 text-center pt-[0.25rem]";
  const fileNameClassName =
    "text-[1.25rem] font-[600] tracking-[0.04em] text-[rgba(226,232,240,0.96)] " +
    "light:text-[#111827]";
  const closeClassName =
    "absolute top-[0.1rem] right-[0.1rem] grid place-items-center z-[220] " +
    "h-[2.1rem] w-[2.1rem] rounded-[0.75rem] border-0 bg-transparent " +
    "text-[2.05rem] leading-none text-[color:var(--pt-120)] light:text-[#7a3a38] pointer-events-auto";
  const bodyClassName =
    "flex flex-col gap-[0.95rem] text-[1.08rem] leading-[1.85] " +
    "tracking-[0.02em] text-[rgba(226,232,240,0.92)] " +
    "light:text-[#1f2937]";
  const statusClassName =
    "text-[1.02rem] opacity-95 tracking-[0.02em] text-center text-[rgba(226,232,240,0.92)] " +
    "light:text-[#1f2937]";
  const errorClassName =
    "text-[1.02rem] tracking-[0.02em] text-center text-[#fecaca] " +
    "light:text-[#b91c1c]";
  const controlsClassName =
    "flex items-center gap-[0.75rem] flex-wrap text-[1.06rem] justify-center";
  const controlsHeaderClassName =
    "mt-[0.4rem] mb-[0.6rem]";
  const controlsContextClassName =
    "w-full pt-[0.25rem] flex-col gap-[0.55rem]";
  const modeRowClassName =
    "flex items-center justify-center gap-[0.6rem] flex-nowrap max-[30em]:flex-wrap";
  const actionsInlineClassName =
    "w-full flex justify-end gap-[0.65rem] mt-[0.35rem] mb-[0.5rem]";
  const actionsCenterClassName = "justify-center";
  const jumpClassName = "whitespace-nowrap";
  const previewWrapClassName =
    "relative block overflow-visible w-[calc(100%+(var(--analysis-card-pad-x)*2))] " +
    "ml-[calc(-1*var(--analysis-card-pad-x))] mr-[calc(-1*var(--analysis-card-pad-x))]";
  const previewClassName =
    "relative flex-1 min-h-[260px] max-h-[clamp(38rem,80vh,70rem)] " +
    "rounded-[1.2rem] border-0 bg-[rgba(7,12,20,0.38)] " +
    "px-[var(--analysis-preview-pad-x)] py-[clamp(0.28rem,1vw,0.6rem)] " +
    "[--analysis-preview-pad-x:clamp(0.75rem,2.2vw,1.35rem)] " +
    "overflow-auto text-[1.18rem] leading-[1.92] tracking-[0.02em] " +
    "text-[rgba(226,232,240,0.92)] whitespace-pre-wrap scrollbar-none " +
    "[-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_12%,black_88%,transparent_100%)] " +
    "[mask-image:linear-gradient(to_bottom,transparent_0%,black_12%,black_88%,transparent_100%)] " +
    "[-webkit-mask-size:100%_100%] [mask-size:100%_100%] " +
    "[-webkit-mask-repeat:no-repeat] [mask-repeat:no-repeat] " +
    "light:bg-[rgba(248,250,252,0.9)] light:text-[#1f2937]";
  const scrollTrackClassName =
    "absolute top-[0.6rem] bottom-[0.6rem] right-0 w-[1.7rem] " +
    "bg-transparent border-0 cursor-[var(--cursor-pointer)] " +
    "flex items-center justify-center";
  const scrollThumbClassName =
    "absolute left-1/2 -translate-x-1/2 top-0 w-[1.6rem] h-[1.6rem] " +
    "rounded-full bg-transparent border-0 shadow-none opacity-80 " +
    "flex items-center justify-center";
  const emptyClassName =
    "flex flex-col gap-[1.25rem] text-[1.05rem] items-center text-center";
  const metaClassName = "mt-[0.35rem] text-[0.95rem]";
  const contextButtonClassName =
    "relative inline-flex items-center justify-center " +
    "!min-h-[2.5rem] !h-[2.5rem] !w-[2.5rem] !px-0 !py-0 !rounded-full " +
    "!text-[1.15rem] !leading-[1] !tracking-[-0.02em]";
  const tooltipClassName =
    "absolute left-1/2 bottom-[calc(100%+0.35rem)] -translate-x-1/2 " +
    "min-w-[14rem] max-w-[90vw] rounded-[0.9rem] px-[0.5rem] py-[0.75rem] " +
    "bg-[rgba(7,10,18,0.96)] text-[rgba(248,252,255,0.96)] text-[1.02rem] " +
    "leading-[1.4] tracking-[0.02em] text-center shadow-[0_0.2rem_0.6rem_rgba(0,0,0,0.45)] " +
    "opacity-0 pointer-events-none transition-[opacity,transform] duration-200 z-[9999] " +
    "group-hover:opacity-100 group-hover:-translate-y-[0.15rem] " +
    "group-focus-within:opacity-100 group-focus-within:-translate-y-[0.15rem] " +
    "light:bg-[rgba(255,255,255,0.96)] light:text-[#1f2937] light:border light:border-[rgba(148,163,184,0.45)] " +
    "light:shadow-[0_12px_26px_rgba(0,0,0,0.12)]";
  const tooltipArrowClassName =
    "absolute left-1/2 -translate-x-1/2 bottom-[-0.25rem] h-[0.55rem] w-[0.55rem] " +
    "rotate-45 bg-[rgba(7,10,18,0.54)] " +
    "light:bg-[rgba(255,255,255,0.96)] light:border light:border-[rgba(148,163,184,0.45)] light:border-l-0 light:border-t-0";
  return (
    <section
      ref={analysisPanelRef}
      className={cn(
        panelBaseClassName,
        uploadPreview ? panelWideClassName : null,
        analysisPanelMode === "expanded"
          ? panelExpandedClassName
          : analysisPanelMode === "overlay"
          ? panelOverlayClassName
          : null
      )}
      role="region"
      aria-live="polite"
      aria-label={t("chat.upload.summary")}
      data-analysis-mode={analysisPanelMode}
    >
      <div className={cardClassName}>
        <header className={headerClassName}>
          {uploadPreview ? (
            <div className={titleBlockClassName}>
              <div className={fileNameClassName}>
                {prettifyFileName(uploadPreview.fileName)}
              </div>
            </div>
          ) : null}
          <button
            type="button"
            className={closeClassName}
            onClick={() => {
              setUploadPreview(null);
              setUploadError(null);
              setEphemeralChunks([]);
              setDocOnlyMode(true);
              closeAnalysisPanel();
            }}
            aria-label={t("buttons.close", "Sulge")}
          >
            x
          </button>
        </header>
        <div className={bodyClassName}>
          {uploadBusy ? (
            <div className={statusClassName}>{t("chat.upload.busy")}</div>
          ) : null}
          {uploadError ? (
            <div className={errorClassName}>{uploadError}</div>
          ) : null}
          {uploadPreview ? (
            <>
              <div
                className={cn(
                  controlsClassName,
                  controlsContextClassName,
                  controlsHeaderClassName
                )}
              >
                <div className={modeRowClassName}>
                  <OptionCard
                    type="checkbox"
                    name="chat-doc-mode"
                    checked={!docOnlyMode}
                    onChange={e => setDocOnlyMode(!e.target.checked)}
                    className={docToggleCardClassName}
                  >
                    {extendedLabel}
                  </OptionCard>
                  <div className="group relative z-[999]">
                    <Button
                      type="button"
                      size="sm"
                      variant="primary"
                      className={contextButtonClassName}
                      aria-label={contextHint}
                      onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      ?
                    </Button>
                    <span className={tooltipClassName}>
                      {contextHint}
                      <span className={tooltipArrowClassName} aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </div>
              <p id="chat-upload-context-hint" className="sr-only">
                {contextHint}
              </p>
              {previewText ? (
                <div
                  className={cn(actionsInlineClassName, actionsCenterClassName)}
                >
                  <Button
                    type="button"
                    size="sm"
                    variant="primary"
                    className={jumpClassName}
                    onClick={() => {
                      inputRef.current?.focus();
                      inputRef.current?.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                      });
                    }}
                    aria-label={t("chat.upload.jump_to_chat", "KÃ¼si")}
                    title={t("chat.upload.jump_to_chat", "KÃ¼si")}
                  >
                    {t("chat.upload.jump_to_chat", "KÃ¼si")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="primary"
                    className={jumpClassName}
                    onClick={toggleAnalysisCollapse}
                  >
                    {analysisCollapsed
                      ? t("chat.upload.summary_show", "NÃ¤ita")
                      : t("chat.upload.summary_hide", "Peida")}
                  </Button>
                </div>
              ) : null}

              {!analysisCollapsed && previewText ? (
                <div className={previewWrapClassName}>
                  <div
                    ref={previewRef}
                    className={previewClassName}
                    tabIndex={0}
                    aria-label={t("chat.upload.preview", "Dokumendi tekst")}
                    onWheel={handlePreviewWheel}
                    onScroll={() => {
                      const node = previewRef.current;
                      if (!node) return;
                      const max = node.scrollHeight - node.clientHeight;
                      if (max <= 0) {
                        setPreviewScroll(0);
                        return;
                      }
                      setPreviewScroll(node.scrollTop / max);
                    }}
                  >
                    {previewText}
                  </div>
                  <div
                    ref={scrollTrackRef}
                    className={scrollTrackClassName}
                    onClick={event => {
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
                    }}
                    onMouseDown={event => {
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
                    }}
                    onTouchStart={event => {
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
                    }}
                    aria-hidden="true"
                  >
                    <div
                      className={scrollThumbClassName}
                      style={{
                        top: `calc(${previewScroll * 100}% + 0.3rem)`,
                        opacity:
                          previewScroll > 0.92 || previewScroll < 0.02 ? 0 : 1,
                        transition: "opacity 0.16s ease"
                      }}
                      onMouseDown={event => {
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
                      }}
                      onTouchStart={event => {
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
                      }}
                    >
                      <SotsiaalAILoader size="1rem" animated={false} ariaHidden />
                    </div>
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <div className={emptyClassName}>
              <Button
                type="button"
                size="sm"
                variant="primary"
                onClick={onPickFile}
                disabled={uploadBusy || isGenerating}
              >
                {t("chat.upload.aria")}
              </Button>
              <p className={metaClassName}>
                {uploadUsage?.limit
                  ? t(
                      "chat.upload.usage",
                      "{used}/{limit} analÆ’?tÆ’Â¦?Å½Â©Æ’?tÆ’Â¦?Å½Â©si tÆ’?tÆ’Â¦?Å½Â©na"
                    )
                      .replace(
                        "{used}",
                        String(
                          Math.max(
                            0,
                            Math.min(
                              uploadUsage.used ?? 0,
                              uploadUsage.limit ?? Infinity
                            )
                          )
                        )
                      )
                      .replace("{limit}", String(uploadUsage.limit ?? 0))
                  : ""}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
});
export default ChatAnalysisPanel;
