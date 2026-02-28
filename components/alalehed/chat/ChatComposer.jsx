"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import SotsiaalAILoader from "@/components/ui/SotsiaalAILoader";
import Button from "@/components/ui/Button";
import { localizePath } from "@/lib/localizePath";
export default function ChatComposer({
  t,
  locale = "et",
  isLightTheme,
  hideTools = false,
  embedded = false,
  placeholderText,
  forcePlaceholderVisible = false,
  acceptAttr,
  ensureAnalysisPanelVisible,
  fileInputRef,
  onFileChange,
  inputBarRef,
  inputRef,
  onFocusInput,
  onBlurInput,
  isGenerating,
  isStreamingAny,
  isRoomMode,
  roomBlocked,
  roomAuthRequired,
  onStop,
  onSend,
  onSendDeepResearch,
  onArmDeepResearch,
  onCancelDeepResearchMode,
  onConsumeDeepResearchMode,
  onDeepResearchEmptySubmit,
  speakLatestReply,
  canSpeakLatest,
  isSpeaking,
  recording,
  recordingPulse,
  handleMic,
  draftApiRef,
  inputFocused = false,
  isMobile = false
}) {
  const router = useRouter();
  const [draft, setDraft] = useState("");
  const [toolsOpen, setToolsOpen] = useState(false);
  const [composerMode, setComposerMode] = useState("chat");
  const submitInFlightRef = useRef(false);
  const toolsButtonRef = useRef(null);
  const toolsMenuRef = useRef(null);
  const deepResearchDisabled = Boolean(isRoomMode);
  const canRunDeepResearch = !deepResearchDisabled && typeof onSendDeepResearch === "function";

  useEffect(() => {
    if (!hideTools) return;
    setToolsOpen(false);
    if (composerMode === "deep_research") {
      setComposerMode("chat");
      onCancelDeepResearchMode?.();
    }
  }, [composerMode, hideTools, onCancelDeepResearchMode]);

  useEffect(() => {
    if (!toolsOpen) return;
    const onPointerDown = event => {
      const target = event?.target;
      if (!(target instanceof Node)) return;
      if (toolsButtonRef.current?.contains(target)) return;
      if (toolsMenuRef.current?.contains(target)) return;
      setToolsOpen(false);
    };
    const onKeyDown = event => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setToolsOpen(false);
      toolsButtonRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [toolsOpen]);

  useEffect(() => {
    if (!isRoomMode) return;
    setToolsOpen(false);
    if (composerMode === "deep_research") {
      setComposerMode("chat");
      onCancelDeepResearchMode?.();
    }
  }, [composerMode, isRoomMode, onCancelDeepResearchMode]);

  useEffect(() => {
    if (!draftApiRef) return;
    draftApiRef.current = {
      appendText: txt => {
        const s = String(txt ?? "").trim();
        if (!s) return;
        setDraft(prev => prev ? `${prev} ${s}` : s);
      },
      clear: () => setDraft("")
    };
    return () => {
      if (draftApiRef.current) draftApiRef.current = null;
    };
  }, [draftApiRef]);
  const hasInput = Boolean(draft.trim());
  const isDeepResearchMode = composerMode === "deep_research";
  const closeToolsMenu = useCallback(() => {
    setToolsOpen(false);
  }, []);
  const exitDeepResearchMode = useCallback(() => {
    setComposerMode("chat");
    onCancelDeepResearchMode?.();
  }, [onCancelDeepResearchMode]);
  const openDocumentAnalysis = useCallback(() => {
    ensureAnalysisPanelVisible?.();
    exitDeepResearchMode();
    closeToolsMenu();
  }, [ensureAnalysisPanelVisible, exitDeepResearchMode, closeToolsMenu]);
  const handleDeepResearchSelect = useCallback(() => {
    if (!canRunDeepResearch) return;
    setComposerMode("deep_research");
    onArmDeepResearch?.();
    closeToolsMenu();
    requestAnimationFrame(() => inputRef.current?.focus?.());
  }, [canRunDeepResearch, closeToolsMenu, inputRef, onArmDeepResearch]);
  const handleAgentModeSelect = useCallback(() => {
    closeToolsMenu();
    router.push(localizePath("/agendireziim", locale));
  }, [closeToolsMenu, locale, router]);
  const handleDocumentsSelect = useCallback(() => {
    closeToolsMenu();
    router.push(localizePath("/documents", locale));
  }, [closeToolsMenu, locale, router]);
  const submitSend = useCallback(async () => {
    if (submitInFlightRef.current) return false;
    const trimmed = draft.trim();
    if (!trimmed) return false;
    if (isGenerating) return false;
    submitInFlightRef.current = true;
    try {
      const ok = await onSend(trimmed);
      if (ok) setDraft("");
      return ok;
    } finally {
      submitInFlightRef.current = false;
    }
  }, [draft, isGenerating, onSend]);
  const submitDeepResearch = useCallback(async () => {
    if (submitInFlightRef.current) return false;
    if (!canRunDeepResearch) return false;
    const trimmed = draft.trim();
    if (!trimmed) {
      onDeepResearchEmptySubmit?.();
      return false;
    }
    if (isGenerating) return false;
    submitInFlightRef.current = true;
    let attempted = false;
    let started = false;
    try {
      attempted = true;
      const ok = await onSendDeepResearch(trimmed);
      started = Boolean(ok);
      if (ok) setDraft("");
      return ok;
    } finally {
      submitInFlightRef.current = false;
      if (attempted) {
        setComposerMode("chat");
        onConsumeDeepResearchMode?.({
          started
        });
      }
    }
  }, [canRunDeepResearch, draft, isGenerating, onConsumeDeepResearchMode, onDeepResearchEmptySubmit, onSendDeepResearch]);
  const handleToolsButtonClick = useCallback(() => {
    if (isDeepResearchMode) {
      exitDeepResearchMode();
      closeToolsMenu();
      return;
    }
    setToolsOpen(prev => !prev);
  }, [closeToolsMenu, exitDeepResearchMode, isDeepResearchMode]);
  const handleSubmit = useCallback(e => {
    e.preventDefault();
    closeToolsMenu();
    if (isGenerating) {
      onStop?.(e);
      return;
    }
    if (composerMode === "deep_research") {
      void submitDeepResearch();
      return;
    }
    void submitSend();
  }, [closeToolsMenu, composerMode, isGenerating, onStop, submitDeepResearch, submitSend]);
  const handleKeyDown = useCallback(e => {
    if (e.key === "Escape" && composerMode === "deep_research") {
      e.preventDefault();
      exitDeepResearchMode();
      return;
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      closeToolsMenu();
      if (isGenerating) return;
      if (composerMode === "deep_research") {
        void submitDeepResearch();
        return;
      }
      if (draft.trim()) {
        void submitSend();
      }
    }
  }, [closeToolsMenu, composerMode, draft, exitDeepResearchMode, isGenerating, submitDeepResearch, submitSend]);
  const handleSendPointerDown = useCallback(e => {
    if (!isMobile) return;
    if (isGenerating) return;
    if (!draft.trim()) return;
    e.preventDefault();
    e.stopPropagation();
    if (composerMode === "deep_research") {
      void submitDeepResearch();
      return;
    }
    void submitSend();
  }, [composerMode, draft, isGenerating, isMobile, submitDeepResearch, submitSend]);
  const inputRowClassName =
    "chat-input-row z-[80] flex w-full items-center justify-center gap-[0.02rem] pl-[var(--chat-hpad-left,var(--chat-hpad))] pr-[var(--chat-hpad-right,var(--chat-hpad))] " +
    "transition-[transform,margin-top] duration-[400ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] will-change-transform max-[48em]:transition-none";
  const inputRowModeClassName = embedded
    ? "relative mt-0 w-full max-w-full gap-[0.4rem] pl-0 pr-0 [--chat-input-max-w:100%]"
    : "relative mt-[clamp(0.6rem,1.8vh,1.1rem)] " +
      "max-[48em]:absolute max-[48em]:left-0 max-[48em]:right-0 " +
      "max-[48em]:bottom-[calc(env(safe-area-inset-bottom,0px)+2.75rem+var(--chat-vk-offset,0px))] " +
      "max-[48em]:z-[90] max-[48em]:mt-0 max-[48em]:w-full max-[48em]:max-w-full " +
      "max-[48em]:gap-[clamp(0.22rem,1.4vw,0.42rem)] max-[48em]:pl-[clamp(0.36rem,1.8vw,0.62rem)] max-[48em]:pr-[clamp(0.7rem,3vw,1rem)] " +
      "max-[48em]:[--chat-input-max-w:min(100%,calc(100vw-6.45rem))]";
  const inputBarClassName =
    "chat-inputbar relative grid w-full max-w-[min(100%,var(--chat-input-max-w))] " +
    "flex-[1_1_auto] grid-cols-[1fr_auto_auto] items-center gap-x-[0.28rem] " +
    "min-h-[var(--inputbar-h)] rounded-full " +
    "transition-[border-color,box-shadow,background,max-width] duration-[400ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] " +
    "px-[0.625rem] pr-[0.1rem] pointer-events-auto z-[65] translate-x-[var(--chat-inputbar-left-pull,0rem)] max-[48em]:translate-x-0 max-[48em]:transition-none";
  const inputFieldWrapClassName = "min-w-0 w-full pr-[0.2rem]";
  const inputFieldClassName =
    "chat-input-field w-full resize-none appearance-none bg-transparent text-[1.1rem] leading-[1.25] pt-[0.28rem] pb-0 " +
    "text-[color:var(--pt-150)] light:text-[color:var(--text-strong,#1f2937)] " +
    "outline-none border-0 shadow-none " +
    `${forcePlaceholderVisible ? "placeholder:opacity-100 placeholder:text-[color:var(--input-placeholder)] " : "placeholder:opacity-0 light:placeholder:opacity-100 light:placeholder:text-[color:var(--input-placeholder)]"}`;
  const actionButtonClassName =
    "chat-listen-btn relative z-[2] h-[48px] w-[48px] min-h-[48px] min-w-[48px] flex-[0_0_48px] rounded-full " +
    "flex items-center justify-center " +
    "mr-[-0.56rem] " +
    "pointer-events-auto !translate-y-0 hover:!translate-y-0 active:!translate-y-0 " +
    "!bg-transparent !border-0 !shadow-none " +
    "hover:!bg-transparent focus-visible:!bg-transparent active:!bg-transparent " +
    "data-[speaking=true]:shadow-[0_0_0_1px_rgba(148,163,184,0.22),0_0_6px_rgba(84,95,115,0.45)] " +
    "disabled:opacity-50 disabled:cursor-not-allowed";
  const sendButtonClassName =
    "chat-send-btn relative z-[2] h-[48px] w-[48px] min-h-[48px] min-w-[48px] flex-[0_0_48px] rounded-full border-0 " +
    "flex items-center justify-center overflow-hidden leading-none " +
    "!translate-y-0 hover:!translate-y-0 active:!translate-y-0 " +
    "px-[6px] py-[1px] " +
    "pointer-events-auto data-[recording=true]:text-[var(--chat-icon-color)] " +
    "disabled:opacity-50 disabled:cursor-not-allowed";
  const sendButtonLoaderClassName = `${sendButtonClassName} !grid !place-items-center !p-0`;
  const inputRowTransformClassName = embedded
    ? "[transform:none]"
    : `${inputFocused ? "[transform:translateY(calc(var(--chat-input-focus-shift,0.94rem)+clamp(0.6rem,2dvh,1.2rem)))]" : "[transform:translateY(calc(-1*var(--chat-input-shift,0rem)))]"} max-[48em]:[transform:none]`;
  const toolItemBaseClassName =
    "chat-tools-item w-full appearance-none border-0 bg-transparent px-[0.38rem] py-[0.36rem] text-left " +
    "text-[1.12rem] leading-[1.2] tracking-[0.01em] transition-colors duration-150 " +
    "rounded-[0.5rem] flex items-center gap-[0.54rem] " +
    "hover:bg-[rgba(255,255,255,0.08)] focus-visible:bg-[rgba(255,255,255,0.08)] " +
    "light:hover:bg-[rgba(122,58,56,0.1)] light:focus-visible:bg-[rgba(122,58,56,0.1)]";
  const toolIconSlotClassName = "inline-flex h-[1.9rem] w-[1.9rem] shrink-0 items-center justify-center";
  const baseToolIconSize = 23;
  const deepResearchToolIconSize = 26;
  const agentToolIconSize = 27;
  const toolIconStrokeWidth = 1.8;
  const agentToolStrokeWidth = 1.6;
  const iconStroke = isLightTheme ? "#7A3A38" : "#c57171";
  return <form className={`${inputRowClassName} ${inputRowModeClassName} ${inputRowTransformClassName}`} onSubmit={handleSubmit} autoComplete="off">
      {!embedded || !hideTools ? <div className="relative h-[2.9rem] w-[2.9rem] min-h-[2.9rem] min-w-[2.9rem] flex-[0_0_2.9rem] translate-x-[var(--chat-attach-left-pull,0rem)] max-[48em]:translate-x-0 max-[48em]:ml-[clamp(-0.52rem,-1.6vw,-0.3rem)] max-[48em]:mr-[clamp(0.02rem,0.4vw,0.12rem)]">
        {hideTools ? <div aria-hidden="true" className="h-[2.9rem] w-[2.9rem] min-h-[2.9rem] min-w-[2.9rem]" /> : <>
            <button ref={toolsButtonRef} type="button" className="chat-attach-btn group h-[2.9rem] w-[2.9rem] min-h-[2.9rem] min-w-[2.9rem] flex-[0_0_2.9rem] appearance-none border-0 bg-transparent p-0 shadow-none outline-none transition-none" aria-label={isDeepResearchMode ? t("chat.deep_research.exit_mode_aria") : t("chat.tools.aria")} title={isDeepResearchMode ? t("chat.deep_research.exit_mode_aria") : t("chat.tools.tooltip")} aria-haspopup={isDeepResearchMode ? undefined : "menu"} aria-expanded={isDeepResearchMode ? undefined : toolsOpen ? "true" : "false"} onClick={handleToolsButtonClick}>
              {isDeepResearchMode ? <svg aria-hidden="true" width="36" height="36" viewBox="0 0 42 42" fill="none" className="opacity-95 transition-transform duration-150 group-hover:scale-110 group-focus-visible:scale-110">
                  <circle cx="17.8" cy="17.8" r="8.8" stroke={iconStroke} strokeWidth="2.8" />
                  <path d="M24.2 24.2L31.5 31.5" stroke={iconStroke} strokeWidth="2.8" strokeLinecap="round" />
                </svg> : <svg aria-hidden="true" width="36" height="36" viewBox="0 0 42 42" fill="none" className="opacity-95 transition-transform duration-150 group-hover:scale-110 group-focus-visible:scale-110">
                  <path d="M21 8.75v24.5M8.75 21h24.5" stroke={iconStroke} strokeWidth="3.1" strokeLinecap="round" />
                </svg>}
            </button>
            {toolsOpen ? <div ref={toolsMenuRef} role="menu" aria-label={t("chat.tools.menu_aria")} className="chat-tools-menu absolute left-0 bottom-[calc(100%+0.45rem)] z-[120] w-max min-w-[11.4rem] rounded-[0.88rem] border border-[rgba(255,255,255,0.14)] bg-[rgba(24,26,32,0.96)] [.theme-night_&]:border-[rgba(120,156,231,0.12)] [.theme-night_&]:bg-[rgba(9,14,24,0.88)] p-[0.25rem] shadow-[0_12px_28px_rgba(0,0,0,0.34)] backdrop-blur-[10px] light:border-[rgba(122,58,56,0.12)] light:bg-[rgba(255,250,248,0.94)] [.theme-mid_&]:border-[rgba(141,77,74,0.14)] [.theme-mid_&]:bg-[rgba(252,246,244,0.9)]">
                <button type="button" role="menuitem" className={`${toolItemBaseClassName} text-[color:var(--pt-100)] light:text-[#3f241f]`} onClick={openDocumentAnalysis}>
                  <span aria-hidden="true" className={toolIconSlotClassName}>
                    <svg aria-hidden="true" width={baseToolIconSize} height={baseToolIconSize} viewBox="0 0 24 24" fill="none" className="shrink-0 opacity-90">
                      <path d="M8 3h8l5 5v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" stroke={iconStroke} strokeWidth={toolIconStrokeWidth} strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M16 3v5h5" stroke={iconStroke} strokeWidth={toolIconStrokeWidth} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span>{t("chat.tools.document_analysis")}</span>
                </button>
                <button type="button" role="menuitem" className={`${toolItemBaseClassName} ${!canRunDeepResearch ? "chat-tools-item-disabled text-[rgba(203,213,225,0.58)] light:text-[rgba(63,36,31,0.45)] cursor-not-allowed hover:bg-transparent focus-visible:bg-transparent" : "text-[color:var(--pt-100)] light:text-[#3f241f]"}`} onClick={handleDeepResearchSelect} disabled={!canRunDeepResearch} title={!canRunDeepResearch ? t("chat.tools.deep_research_room_only") : undefined}>
                  <span aria-hidden="true" className={toolIconSlotClassName}>
                    <svg aria-hidden="true" width={deepResearchToolIconSize} height={deepResearchToolIconSize} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${!canRunDeepResearch ? "opacity-55" : "opacity-95"}`}>
                      <circle cx="10.5" cy="10.5" r="5.4" stroke={iconStroke} strokeWidth={toolIconStrokeWidth} />
                      <path d="M14.6 14.6 19.3 19.3" stroke={iconStroke} strokeWidth={toolIconStrokeWidth} strokeLinecap="round" />
                    </svg>
                  </span>
                  <span>{t("chat.tools.deep_research")}</span>
                </button>
                <button type="button" role="menuitem" className={`${toolItemBaseClassName} text-[color:var(--pt-100)] light:text-[#3f241f]`} onClick={handleDocumentsSelect}>
                  <span aria-hidden="true" className={toolIconSlotClassName}>
                    <svg aria-hidden="true" width={baseToolIconSize} height={baseToolIconSize} viewBox="0 0 24 24" fill="none" className="shrink-0 opacity-90">
                      <path d="M6 4.8h9.4L19 8.4v10.8a1.8 1.8 0 0 1-1.8 1.8H6.8A1.8 1.8 0 0 1 5 19.2V6.6A1.8 1.8 0 0 1 6.8 4.8Z" stroke={iconStroke} strokeWidth={toolIconStrokeWidth} strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M14.8 4.8v3.8H19" stroke={iconStroke} strokeWidth={toolIconStrokeWidth} strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M8.3 11.2h7.4M8.3 15.1h5.5" stroke={iconStroke} strokeWidth={toolIconStrokeWidth} strokeLinecap="round" />
                    </svg>
                  </span>
                  <span>{t("chat.tools.documents")}</span>
                </button>
                <button type="button" role="menuitem" className={`${toolItemBaseClassName} text-[color:var(--pt-100)] light:text-[#3f241f]`} onClick={handleAgentModeSelect}>
                  <span aria-hidden="true" className={toolIconSlotClassName}>
                    <svg aria-hidden="true" width={agentToolIconSize} height={agentToolIconSize} viewBox="0 0 24 24" fill="none" className="shrink-0 opacity-95">
                      <rect x="6.1" y="7.2" width="11.8" height="9.6" rx="2.6" stroke={iconStroke} strokeWidth={agentToolStrokeWidth} />
                      <path d="M12 4.3v2.6" stroke={iconStroke} strokeWidth={agentToolStrokeWidth} strokeLinecap="round" />
                      <circle cx="10" cy="12" r="0.9" fill={iconStroke} />
                      <circle cx="14" cy="12" r="0.9" fill={iconStroke} />
                    </svg>
                  </span>
                  <span>{t("chat.tools.agent_mode")}</span>
                </button>
              </div> : null}
          </>}
      </div> : null}

      <input ref={fileInputRef} type="file" accept={acceptAttr} onChange={onFileChange} className="hidden" />

      <label htmlFor="chat-input" className="sr-only">
        {t("chat.input.label")}
      </label>

      <div className={inputBarClassName} ref={inputBarRef}>
        <div className={inputFieldWrapClassName}>
          <textarea id="chat-input" ref={inputRef} value={draft} placeholder={placeholderText || t("chat.input.placeholder")} onChange={e => setDraft(e.target.value)} onKeyDown={handleKeyDown} onFocus={onFocusInput} onBlur={onBlurInput} className={inputFieldClassName} disabled={isGenerating || isRoomMode && (roomBlocked || roomAuthRequired)} rows={1} />
        </div>
        <Button type="button" variant="linkBrand" className={actionButtonClassName} aria-label={t("chat.listen.last_reply")} title={t("chat.listen.title")} onClick={speakLatestReply} disabled={!canSpeakLatest} data-speaking={isSpeaking ? "true" : "false"}>
          <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="block h-[1.9rem] w-[1.9rem] translate-y-[0.06rem] text-[#c57171] light:text-[#7a3a38]">
            <path d="M11 5L6 9H2v6h4l5 4z" />
            <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
          </svg>
        </Button>
        {hasInput || isGenerating || isStreamingAny ? <Button type="submit" variant="primary" className={sendButtonLoaderClassName} aria-label={isGenerating ? t("chat.send.stop") : t("chat.send.send")} title={isGenerating ? t("chat.send.title_stop") : t("chat.send.title_send")} disabled={isRoomMode && (roomBlocked || roomAuthRequired) || !hasInput && !isGenerating && !isStreamingAny} data-loader-active={isGenerating || isStreamingAny ? "true" : "false"} onPointerDown={handleSendPointerDown}>
            <SotsiaalAILoader size="1.34rem" animated={isGenerating || isStreamingAny} ariaHidden className="chat-send-loader h-[1.34rem] w-[1.34rem] [--send-loader-shift-y:-0.24rem] [&_svg]:translate-y-[var(--send-loader-shift-y)]" style={{
          "--glow-opacity-base": 0,
          "--glow-opacity-peak": 0
        }} />
          </Button> : <Button type="button" variant="primary" className={sendButtonClassName} aria-label={recording ? t("chat.mic.stop") : t("chat.mic.start")} title={recording ? t("chat.mic.stop") : t("chat.mic.start")} onClick={handleMic} disabled={isRoomMode && (roomBlocked || roomAuthRequired)} data-speaking={recording ? "true" : "false"} data-recording={recording ? "true" : "false"} data-recording-complete={recordingPulse ? "true" : "false"}>
            <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-[1.6rem] w-[1.6rem] text-[#c57171] light:text-[#7a3a38]">
              <path d="M12 1a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </Button>}
      </div>
    </form>;
}
