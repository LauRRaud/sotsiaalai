"use client";

import { memo, useEffect, useRef, useState } from "react";
import SotsiaalAILoader from "@/components/ui/SotsiaalAILoader";
import Button from "@/components/ui/Button";
import OptionCard from "@/components/ui/OptionCard";
import { cn } from "@/components/ui/cn";
import { glassPrimaryButtonToneClassName } from "@/components/ui/glassPageStyles";
import { primarySegmentedButtonClassName } from "@/components/ui/primarySegmentedButtonClassName";

const docToggleCardClassName =
  "!inline-flex !w-fit !justify-self-center !self-center !min-h-[2.72rem] !rounded-[1.6rem] !px-[1.05rem] !py-[0.64rem] !text-[1.06rem] !leading-[1.2] " +
  "[--seg-control-size:1.42rem] [--seg-check-size:1.1rem] " +
  "[&>span.shrink-0]:-translate-y-[0.08rem] " +
  `${primarySegmentedButtonClassName} ` +
  "max-[768px]:!mt-[0.34rem] max-[768px]:!min-h-[2.9rem] max-[768px]:!rounded-[1.45rem] max-[768px]:!text-[1.12rem]";
const ChatAnalysisPanel = memo(function ChatAnalysisPanel({
  t,
  analysisPanelRef,
  analysisPanelMode,
  uploadPreview,
  uploadedFilesCount,
  uploadedFileNames,
  uploadFileLimit,
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
  chatWindowRef,
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
  const contextHintWrapRef = useRef(null);
  const isDraggingScroll = useRef(false);
  const touchStartYRef = useRef(null);
  const [previewScroll, setPreviewScroll] = useState(0);
  const [contextHintOpen, setContextHintOpen] = useState(false);
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
  useEffect(() => {
    if (!contextHintOpen) return undefined;
    function handlePointerDown(event) {
      const node = contextHintWrapRef.current;
      if (!node || node.contains(event.target)) return;
      setContextHintOpen(false);
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") setContextHintOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [contextHintOpen]);
  const handlePreviewTouchStart = event => {
    const touch = event.touches?.[0];
    touchStartYRef.current = touch?.clientY ?? null;
  };
  const handlePreviewTouchMove = event => {
    const touch = event.touches?.[0];
    const startY = touchStartYRef.current;
    const node = previewRef.current;
    const chatNode = chatWindowRef?.current;
    if (!touch || startY == null || !node || !chatNode) return;
    const deltaY = touch.clientY - startY;
    const atTop = node.scrollTop <= 0;
    if (!atTop || deltaY <= 0) return;
    if (chatNode.scrollTop <= 0) return;
    event.preventDefault();
    chatNode.scrollTop = Math.max(0, chatNode.scrollTop - deltaY);
    touchStartYRef.current = touch.clientY;
  };
  const handlePreviewTouchEnd = () => {
    touchStartYRef.current = null;
  };
  const panelBaseClassName =
    "w-full max-w-[min(90vw,24rem)] px-0 mx-auto " +
    "mt-[clamp(0.3rem,0.8vw,0.5rem)] mb-[clamp(1.2rem,3vw,2rem)] " +
    "relative z-[30]";
  const panelWideClassName =
    "max-w-none w-full px-0";
  const panelExpandedClassName =
    "relative mt-[clamp(0.3rem,0.8vw,0.5rem)] px-[clamp(0.05rem,0.8vw,0.55rem)]";
  const panelOverlayClassName =
    "chat-analysis-overlay absolute left-1/2 bottom-[clamp(4.9rem,11vh,6.8rem)] " +
    "-translate-x-1/2 w-[min(64vw,24rem)] max-w-[calc(100%-2.2rem)] " +
    "m-0 p-[clamp(0.05rem,0.6vw,0.4rem)] z-[260] pointer-events-auto " +
    "max-[768px]:bottom-[calc(env(safe-area-inset-bottom,0px)+7.15rem+var(--chat-vk-offset,0px))] " +
    "max-[768px]:w-[min(88vw,24rem)]";
  const cardOverlayClassName =
    "chat-analysis-overlay-card !isolation-auto";
  const cardClassName =
    "w-full max-w-none rounded-[1.55rem] border border-[color:color-mix(in_srgb,var(--glass-surface-text,#f2f2f2)_10%,transparent)] " +
    "bg-[color:var(--glass-ring-surface-bg,var(--glass-surface-bg,rgba(0,0,0,0.25)))] text-[color:var(--glass-surface-text,#f2f2f2)] " +
    "shadow-[var(--glass-shell-shadow,none)] backdrop-blur-[var(--glass-blur-radius,1rem)] " +
    "[-webkit-backdrop-filter:blur(var(--glass-blur-radius,1rem))] " +
    "[--analysis-card-pad-y:clamp(0.7rem,1.95vw,1.05rem)] " +
    "[--analysis-card-pad-x:clamp(0.85rem,2.5vw,1.65rem)] " +
    "[--analysis-card-pad-b:clamp(0.95rem,2.7vw,1.45rem)] " +
    "p-[var(--analysis-card-pad-y)_var(--analysis-card-pad-x)_var(--analysis-card-pad-b)] " +
    "tracking-[0.035em] text-rendering-geometricPrecision isolate " +
    "antialiased flex flex-col gap-[0.9rem] relative z-[100] pointer-events-auto";
  const headerClassName =
    "flex flex-col items-center justify-center gap-[0.6rem] flex-wrap relative z-[60] " +
    "pt-[0.15rem] mb-[0.6rem]";
  const titleBlockClassName =
    "w-full min-w-0 text-center pt-[0.1rem] px-[0.2rem] pr-[3rem]";
  const fileNameClassName =
    "text-[1.25rem] font-[600] leading-[1.28] tracking-[0.04em] [overflow-wrap:anywhere] break-words " +
    "text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))]";
  const closeClassName =
    "chat-analysis-close-btn absolute top-[0.18rem] right-[0.18rem] grid place-items-center z-[220] rounded-none border-0 bg-transparent " +
    "h-[2.1rem] w-[2.1rem] text-[2.2rem] leading-none text-[color:var(--title-color,var(--brand-primary))] " +
    "pointer-events-auto max-[768px]:h-[2.45rem] max-[768px]:w-[2.45rem] max-[768px]:text-[2.35rem]";
  const bodyClassName =
    "relative z-[120] flex flex-col gap-[0.95rem] text-[1.08rem] leading-[1.85] " +
    "tracking-[0.02em] text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))]";
  const statusClassName =
    "text-[1.02rem] opacity-95 tracking-[0.02em] text-center text-[color:var(--glass-modal-text,var(--glass-surface-text,#f2f2f2))]";
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
    "flex items-center justify-center gap-[0.5rem] flex-nowrap max-[480px]:flex-wrap";
  const actionsInlineClassName =
    "w-full flex justify-center gap-[0.65rem] mt-[0.35rem] mb-[0.5rem]";
  const uploadButtonClassName =
    `documents-primary-button documents-primary-button--compact documents-upload-choose-button ${glassPrimaryButtonToneClassName}`;
  const actionPrimaryButtonClassName =
    `documents-primary-button documents-primary-button--compact ${glassPrimaryButtonToneClassName}`;
  const actionSecondaryButtonClassName = actionPrimaryButtonClassName;
  const previewWrapClassName =
    "relative block overflow-visible w-[calc(100%+(var(--analysis-card-pad-x)*2))] " +
    "ml-[calc(-1*var(--analysis-card-pad-x))] mr-[calc(-1*var(--analysis-card-pad-x))]";
  const previewClassName =
    "relative flex-1 min-h-[260px] max-h-[clamp(38rem,80vh,70rem)] " +
    "rounded-[1.2rem] border border-[color:transparent] bg-transparent shadow-none " +
    "pl-[var(--analysis-preview-pad-x)] pr-[var(--analysis-preview-pad-right)] " +
    "py-[clamp(0.28rem,1vw,0.6rem)] " +
    "[--analysis-preview-pad-x:clamp(0.75rem,2.2vw,1.35rem)] " +
    "[--analysis-preview-pad-right:clamp(0.2rem,0.9vw,0.6rem)] " +
    "overflow-y-auto overflow-x-hidden overscroll-contain [-webkit-overflow-scrolling:touch] [overscroll-behavior-x:none] [overscroll-behavior-y:contain] [touch-action:pan-y] " +
    "text-[1.18rem] leading-[1.92] tracking-[0.02em] " +
    "text-[color:var(--glass-surface-text,#f2f2f2)] whitespace-pre-wrap [overflow-wrap:anywhere] break-words scrollbar-none " +
    "[-webkit-mask-size:100%_100%] [mask-size:100%_100%] " +
    "[-webkit-mask-repeat:no-repeat] [mask-repeat:no-repeat] " +
    "backdrop-blur-0 [-webkit-backdrop-filter:none] " +
    "max-[768px]:[overscroll-behavior-y:auto]";
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
  const metaClassName = "mt-[0.35rem] text-[1.08rem]";
  const contextButtonClassName =
    "relative inline-flex items-center justify-center " +
    "!min-h-[2.5rem] !h-[2.5rem] !w-[2.5rem] !px-0 !py-0 !rounded-full " +
    "!text-[1.15rem] !leading-[1] !tracking-[-0.02em]";
  const tooltipClassName =
    "absolute left-1/2 bottom-[calc(100%+0.45rem)] -translate-x-1/2 " +
    "min-w-[14rem] max-w-[min(18rem,90vw)] rounded-[0.95rem] px-[0.7rem] py-[0.75rem] " +
    "bg-[color:var(--rail-tooltip-bg)] text-[color:var(--rail-tooltip-text,var(--glass-surface-text,#f2f2f2))] text-[0.98rem] " +
    "leading-[1.42] tracking-[0.01em] text-center shadow-[var(--rail-tooltip-shadow)] border border-[color:var(--rail-tooltip-border,transparent)] " +
    "z-[9999]";
  const tooltipArrowClassName =
    "absolute left-1/2 -translate-x-1/2 bottom-[-0.25rem] h-[0.55rem] w-[0.55rem] " +
    "rotate-45 bg-[color:var(--rail-tooltip-bg)]";
  const handleClose = () => {
    setUploadPreview(null);
    setUploadError(null);
    setEphemeralChunks([]);
    setDocOnlyMode(true);
    closeAnalysisPanel();
  };
  return (
    <section
      ref={analysisPanelRef}
      className={cn(
        analysisPanelMode === "overlay" ? panelOverlayClassName : panelBaseClassName,
        uploadPreview ? panelWideClassName : null,
        analysisPanelMode === "expanded" ? panelExpandedClassName : null
      )}
      role="region"
      aria-live="polite"
      aria-label={t("chat.upload.summary")}
      data-analysis-mode={analysisPanelMode}
    >
      <div
        className={cn(
          cardClassName,
          analysisPanelMode === "overlay" ? cardOverlayClassName : null,
          analysisPanelMode === "overlay" && !uploadPreview
            ? "chat-analysis-upload-modal-card"
            : null
        )}
      >
        <button
          type="button"
          className={closeClassName}
          onClick={handleClose}
          aria-label={t("buttons.close")}
        >
          x
        </button>
        <header className={headerClassName}>
              {uploadPreview ? (
                <div className={titleBlockClassName}>
                  <div className={fileNameClassName}>
                    {prettifyFileName(uploadPreview.fileName)}
                  </div>
                </div>
              ) : null}
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
                <div ref={contextHintWrapRef} className="relative z-[999]">
                  <Button
                    type="button"
                    size="sm"
                    variant="primary"
                    className={contextButtonClassName}
                    aria-label={contextHint}
                    aria-expanded={contextHintOpen ? "true" : "false"}
                    aria-describedby={contextHintOpen ? "chat-upload-context-hint" : undefined}
                    onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      setContextHintOpen(prev => !prev);
                    }}
                  >
                    ?
                  </Button>
                  {contextHintOpen ? (
                    <div className={tooltipClassName} role="status" aria-live="polite">
                      {contextHint}
                      <span className={tooltipArrowClassName} aria-hidden="true" />
                    </div>
                  ) : null}
                </div>
              </div>
              </div>
              <p id="chat-upload-context-hint" className="sr-only">
                {contextHint}
              </p>
              {previewText ? (
                <div className={actionsInlineClassName}>
                  <Button
                    type="button"
                    size="sm"
                    variant="primary"
                    className={actionPrimaryButtonClassName}
                    onClick={() => {
                      inputRef.current?.focus();
                      inputRef.current?.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                      });
                    }}
                    aria-label={t("chat.upload.jump_to_chat")}
                    title={t("chat.upload.jump_to_chat")}
                  >
                    {t("chat.upload.jump_to_chat")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="primary"
                    className={actionSecondaryButtonClassName}
                    onClick={toggleAnalysisCollapse}
                  >
                    {analysisCollapsed
                      ? t("chat.upload.summary_show")
                      : t("chat.upload.summary_hide")}
                  </Button>
                </div>
              ) : null}

              {!analysisCollapsed && previewText ? (
                <div className={previewWrapClassName}>
                  <div
                    ref={previewRef}
                    className={`${previewClassName} chat-analysis-preview`}
                    tabIndex={0}
                    aria-label={t("chat.upload.preview")}
                    style={{
                      paddingTop: "clamp(2rem,4.2vh,2.9rem)"
                    }}
                    onTouchStart={handlePreviewTouchStart}
                    onTouchMove={handlePreviewTouchMove}
                    onTouchEnd={handlePreviewTouchEnd}
                    onTouchCancel={handlePreviewTouchEnd}
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
                      <SotsiaalAILoader
                        size="1rem"
                        color="#d09a9a"
                        redStops={{
                          s0: "#ddbbb5",
                          s25: "#b77f78",
                          s50: "#7a403c",
                          s75: "#512725",
                          s100: "#2f1515"
                        }}
                        animated={false}
                        ariaHidden
                      />
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
                className={uploadButtonClassName}
                onClick={onPickFile}
                disabled={uploadBusy || isGenerating}
              >
                {t("chat.upload.aria")}
              </Button>
              {uploadUsage || uploadFileLimit ? (
                <div className={metaClassName}>
                  {t("chat.upload.usage")
                    .replace("{used}", String(uploadUsage?.used ?? 0))
                    .replace("{limit}", String(uploadUsage?.limit ?? uploadFileLimit ?? 0))}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
});
export default ChatAnalysisPanel;

