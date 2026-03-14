"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useEffectiveRole } from "@/components/auth/useEffectiveRole";
import { SubmitArrowIcon } from "@/components/ui/icons/AuthIcons";
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
  inputRowRef,
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
  showDocumentAttachButton = false,
  onPickDocumentFile,
  speakLatestReply,
  canSpeakLatest,
  voiceEnabled = true,
  isSpeaking,
  recording,
  recordingPulse,
  handleMic,
  draftApiRef,
  inputFocused = false,
  isMobile = false
}) {
  const router = useRouter();
  const { effectiveRole } = useEffectiveRole();
  const isClientRole = effectiveRole === "CLIENT";
  const [draft, setDraft] = useState("");
  const [toolsOpen, setToolsOpen] = useState(false);
  const [toolsMenuPosition, setToolsMenuPosition] = useState(null);
  const [composerMode, setComposerMode] = useState("chat");
  const submitInFlightRef = useRef(false);
  const primaryActionHandledAtRef = useRef(0);
  const toolsButtonRef = useRef(null);
  const toolsMenuRef = useRef(null);
  const deepResearchDisabled = Boolean(isRoomMode);
  const canRunDeepResearch = !deepResearchDisabled && typeof onSendDeepResearch === "function";
  const toolsMenuBackdropFilter = isLightTheme
    ? "blur(18px) saturate(140%)"
    : "blur(12px) saturate(128%)";

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

  const updateToolsMenuPosition = useCallback(() => {
    if (typeof window === "undefined") return;
    const button = toolsButtonRef.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    setToolsMenuPosition({
      left: Math.max(8, rect.left),
      bottom: Math.max(8, window.innerHeight - rect.top + 7)
    });
  }, []);

  useEffect(() => {
    if (!toolsOpen) {
      setToolsMenuPosition(null);
      return;
    }
    updateToolsMenuPosition();
    if (typeof window === "undefined") return;
    const sync = () => updateToolsMenuPosition();
    window.addEventListener("resize", sync);
    window.addEventListener("scroll", sync, true);
    return () => {
      window.removeEventListener("resize", sync);
      window.removeEventListener("scroll", sync, true);
    };
  }, [toolsOpen, updateToolsMenuPosition]);

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
    if (Date.now() - primaryActionHandledAtRef.current < 400) {
      primaryActionHandledAtRef.current = 0;
      e.preventDefault();
      return;
    }
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
  const runPrimaryAction = useCallback(event => {
    closeToolsMenu();
    if (isGenerating || isStreamingAny) {
      onStop?.(event);
      return;
    }
    if (composerMode === "deep_research") {
      void submitDeepResearch();
      return;
    }
    if (draft.trim()) {
      void submitSend();
      return;
    }
    if (voiceEnabled) {
      handleMic?.(event);
    }
  }, [closeToolsMenu, composerMode, draft, handleMic, isGenerating, isStreamingAny, onStop, submitDeepResearch, submitSend, voiceEnabled]);
  const handlePrimaryActionPointerDown = useCallback(e => {
    e.preventDefault();
    e.stopPropagation();
    primaryActionHandledAtRef.current = Date.now();
    runPrimaryAction(e);
  }, [runPrimaryAction]);
  const handlePrimaryActionClick = useCallback(e => {
    if (Date.now() - primaryActionHandledAtRef.current < 400) {
      primaryActionHandledAtRef.current = 0;
      e.preventDefault();
      return;
    }
    runPrimaryAction(e);
  }, [runPrimaryAction]);
  const preserveDesktopInputFocusOnMouseDown = useCallback(e => {
    if (isMobile) return;
    e.preventDefault();
  }, [isMobile]);
  const inputRowClassName =
    `${embedded ? "chat-input-row--embedded " : ""}` +
    "chat-input-row z-[80] flex w-full items-center justify-center gap-[0.02rem] pl-[var(--chat-hpad-left,var(--chat-hpad))] pr-[var(--chat-hpad-right,var(--chat-hpad))] " +
    "transition-[top,margin-top] duration-[400ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] [will-change:top] max-[768px]:transition-none";
  const inputRowModeClassName = embedded
    ? "relative mt-0 w-full max-w-full gap-[0.4rem] pl-0 pr-0 [--chat-input-max-w:100%]"
    : "relative mt-[clamp(0.6rem,1.8vh,1.1rem)] " +
      "max-[768px]:absolute max-[768px]:left-0 max-[768px]:right-0 " +
      "max-[768px]:bottom-[calc(env(safe-area-inset-bottom,0px)+2.75rem+var(--chat-vk-offset,0px))] " +
      "max-[768px]:z-[90] max-[768px]:mt-0 max-[768px]:w-full max-[768px]:max-w-full " +
      "max-[768px]:gap-[clamp(0.22rem,1.4vw,0.42rem)] max-[768px]:pl-[clamp(0.36rem,1.8vw,0.62rem)] max-[768px]:pr-[clamp(0.7rem,3vw,1rem)] " +
      "max-[768px]:[--chat-input-max-w:min(100%,calc(100vw-6.45rem))]";
  const inputBarClassName =
    "chat-inputbar relative grid w-full max-w-[min(100%,var(--chat-input-max-w))] " +
    "flex-[1_1_auto] grid-cols-[1fr_auto_auto] items-center gap-x-[0.28rem] " +
    "min-h-[var(--inputbar-h)] rounded-full " +
    "transition-[border-color,box-shadow,background,max-width] duration-[400ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] " +
    "px-[0.625rem] pr-[0.1rem] pointer-events-auto z-[65] translate-x-[var(--chat-inputbar-left-pull,0rem)] max-[768px]:translate-x-0 max-[768px]:transition-none";
  const inputFieldWrapClassName = "min-w-0 w-full pr-[0.2rem]";
  const inputFieldClassName =
    "chat-input-field w-full resize-none appearance-none bg-transparent text-[1.1rem] leading-[1.25] pt-[0.28rem] pb-0 " +
    "text-[color:var(--pt-150)] light:text-[color:var(--text-strong,#1f2937)] " +
    "outline-none border-0 shadow-none " +
    `${forcePlaceholderVisible ? "placeholder:opacity-100 placeholder:text-[color:var(--input-placeholder)] " : "placeholder:opacity-0 light:placeholder:opacity-100 light:placeholder:text-[color:var(--input-placeholder)]"}`;
  const actionButtonClassName =
    "chat-listen-btn relative z-[2] !h-[calc(var(--inputbar-h)*0.96)] !w-[calc(var(--inputbar-h)*0.96)] !min-h-[calc(var(--inputbar-h)*0.96)] !min-w-[calc(var(--inputbar-h)*0.96)] !flex-[0_0_calc(var(--inputbar-h)*0.96)] !p-0 rounded-full " +
    "flex items-center justify-center " +
    "mr-0 " +
    "pointer-events-auto !translate-y-0 hover:!translate-y-0 active:!translate-y-0 " +
    "!bg-transparent !border-0 !shadow-none " +
    "hover:!bg-transparent focus-visible:!bg-transparent active:!bg-transparent " +
    "data-[speaking=true]:shadow-[0_0_0_1px_rgba(148,163,184,0.22),0_0_6px_rgba(84,95,115,0.45)] " +
    "disabled:opacity-50 disabled:cursor-not-allowed";
  const sendButtonClassName =
    "chat-send-btn relative z-[2] !h-[calc(var(--inputbar-h)*var(--chat-send-btn-scale,0.96))] !w-[calc(var(--inputbar-h)*var(--chat-send-btn-scale,0.96))] !min-h-[calc(var(--inputbar-h)*var(--chat-send-btn-scale,0.96))] !min-w-[calc(var(--inputbar-h)*var(--chat-send-btn-scale,0.96))] !flex-[0_0_calc(var(--inputbar-h)*var(--chat-send-btn-scale,0.96))] !p-0 rounded-full border-0 " +
    "flex items-center justify-center overflow-hidden leading-none " +
    "px-[6px] py-[1px] " +
    "pointer-events-auto data-[recording=true]:text-[var(--chat-icon-color)] " +
    "disabled:opacity-50 disabled:cursor-not-allowed";
  const inputRowTransformClassName = embedded
    ? "[transform:none]"
    : `${inputFocused ? "[transform:translateY(calc(var(--chat-input-focus-shift,0.94rem)+clamp(0.6rem,2dvh,1.2rem)))]" : "[transform:translateY(calc(-1*var(--chat-input-shift,0rem)))]"} max-[768px]:[transform:none]`;
  const isStandaloneDisplay = typeof window !== "undefined" && (
    document?.documentElement?.dataset?.displayMode === "standalone" ||
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
    window.matchMedia?.("(display-mode: fullscreen)")?.matches ||
    window.navigator?.standalone === true
  );
  const inputRowMobileStyle = !embedded && isMobile
    ? {
        position: "absolute",
        left: 0,
        right: 0,
        top: "auto",
        bottom: isStandaloneDisplay
          ? "calc(env(safe-area-inset-bottom,0px) + 1rem + var(--chat-vk-offset,0px))"
          : "calc(env(safe-area-inset-bottom,0px) + 2.5rem + var(--chat-vk-offset,0px))",
        marginTop: 0
      }
    : undefined;
  const toolItemBaseClassName =
    "chat-tools-item w-full appearance-none border-0 bg-transparent px-[0.38rem] py-[0.36rem] text-left " +
    "text-[1.12rem] leading-[1.2] tracking-[0.01em] transition-colors duration-150 " +
    "rounded-[0.5rem] flex items-center gap-[0.28rem] " +
    "hover:bg-[rgba(255,255,255,0.08)] focus-visible:bg-[rgba(255,255,255,0.08)] " +
    "light:hover:bg-[rgba(122,58,56,0.1)] light:focus-visible:bg-[rgba(122,58,56,0.1)]";
  const toolIconSlotClassName = "inline-flex h-[2.2rem] w-[1.85rem] shrink-0 items-center justify-center";
  const baseToolIconSize = 27;
  const deepResearchToolIconSize = 30;
  const agentToolIconSize = 31;
  const toolIconStrokeWidth = 1.8;
  const agentToolStrokeWidth = 1.6;
  const iconStroke = isLightTheme ? "#7A3A38" : "#c57171";
  const toolsMenuClassName =
    "chat-tools-menu fixed z-[160] isolate overflow-hidden w-max min-w-[11.4rem] max-w-[calc(100vw-1rem)] rounded-[0.88rem] " +
    "border border-[rgba(255,255,255,0.12)] bg-[rgba(24,26,32,0.72)] [.theme-night_&]:bg-[rgba(9,14,24,0.76)] p-[0.25rem] shadow-[0_12px_28px_rgba(0,0,0,0.28)] " +
    "light:border-[rgba(122,58,56,0.12)] light:bg-[rgba(255,250,248,0.58)] light:shadow-[0_12px_28px_rgba(82,50,46,0.14)] " +
    "[.theme-mid_&]:bg-[rgba(252,246,244,0.62)] hc:border-[2px] hc:border-[rgba(255,234,0,0.56)] hc:bg-[rgba(9,14,24,0.84)] hc:shadow-[0_12px_28px_rgba(0,0,0,0.28)]";
  const toolsMenuPanel = toolsOpen && toolsMenuPosition && typeof document !== "undefined"
    ? createPortal(<div ref={toolsMenuRef} role="menu" aria-label={t("chat.tools.menu_aria")} className={toolsMenuClassName} style={{
      left: `${toolsMenuPosition.left}px`,
      bottom: `${toolsMenuPosition.bottom}px`,
      backdropFilter: toolsMenuBackdropFilter,
      WebkitBackdropFilter: toolsMenuBackdropFilter
    }}>
          <button type="button" role="menuitem" className={`${toolItemBaseClassName} text-[color:var(--pt-100)] light:text-[#3f241f]`} onClick={openDocumentAnalysis}>
            <span aria-hidden="true" className={toolIconSlotClassName}>
              <svg aria-hidden="true" width={baseToolIconSize} height={baseToolIconSize} viewBox="0 0 24 24" fill="none" className="shrink-0 opacity-90">
                <path d="M8 3h8l5 5v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" stroke={iconStroke} strokeWidth={toolIconStrokeWidth} strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 3v5h5" stroke={iconStroke} strokeWidth={toolIconStrokeWidth} strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10.1 10.15a2.05 2.05 0 1 1 3 .98c-.95.48-1.48 1.08-1.48 1.98v.42" stroke={iconStroke} strokeWidth={1.65} strokeLinecap="round" strokeLinejoin="round" />
                <path d="M11.62 16.32h.01" stroke={iconStroke} strokeWidth={2.05} strokeLinecap="round" />
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
          {!isClientRole ? <button type="button" role="menuitem" className={`${toolItemBaseClassName} text-[color:var(--pt-100)] light:text-[#3f241f]`} onClick={handleDocumentsSelect}>
              <span aria-hidden="true" className={toolIconSlotClassName}>
                <svg aria-hidden="true" width={baseToolIconSize} height={baseToolIconSize} viewBox="0 0 24 24" fill="none" className="shrink-0 opacity-90">
                  <path d="M6 4.8h9.4L19 8.4v10.8a1.8 1.8 0 0 1-1.8 1.8H6.8A1.8 1.8 0 0 1 5 19.2V6.6A1.8 1.8 0 0 1 6.8 4.8Z" stroke={iconStroke} strokeWidth={toolIconStrokeWidth} strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M14.8 4.8v3.8H19" stroke={iconStroke} strokeWidth={toolIconStrokeWidth} strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8.3 11.2h7.4M8.3 15.1h5.5" stroke={iconStroke} strokeWidth={toolIconStrokeWidth} strokeLinecap="round" />
                </svg>
              </span>
              <span>{t("chat.tools.documents")}</span>
            </button> : null}
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
        </div>, document.body)
    : null;
  const sideControlsClassName =
    "relative z-[85] pointer-events-auto flex items-center gap-[0.18rem] max-[768px]:gap-[0.12rem] " +
    "translate-x-[var(--chat-attach-left-pull,0rem)] max-[768px]:translate-x-0 " +
    "max-[768px]:ml-[clamp(-0.52rem,-1.6vw,-0.3rem)] max-[768px]:mr-[clamp(0.02rem,0.4vw,0.12rem)]";
  const sideControlPlaceholderClassName =
    "inline-flex h-[var(--chat-composer-side-control-size)] w-[var(--chat-composer-side-control-size)] " +
    "min-h-[var(--chat-composer-side-control-size)] min-w-[var(--chat-composer-side-control-size)] " +
    "flex-[0_0_var(--chat-composer-side-control-size)]";
  const sideControlButtonShellClassName =
    "group relative z-[2] inline-flex " +
    "items-center justify-center leading-none pointer-events-auto " +
    "appearance-none border-0 bg-transparent p-0 shadow-none outline-none transition-none";
  const sideControlButtonBaseClassName =
    `${sideControlButtonShellClassName} h-[var(--chat-composer-side-control-size)] w-[var(--chat-composer-side-control-size)] ` +
    "min-h-[var(--chat-composer-side-control-size)] min-w-[var(--chat-composer-side-control-size)] flex-[0_0_var(--chat-composer-side-control-size)]";
  const toolsButtonClassName =
    `chat-side-control-btn chat-tools-btn ${sideControlButtonBaseClassName}`;
  const documentAttachButtonClassName =
    `chat-side-control-btn chat-document-attach-btn ${sideControlButtonBaseClassName}`;
  const documentAttachDisabled = isGenerating || isRoomMode && (roomBlocked || roomAuthRequired);
  return <form ref={inputRowRef} style={inputRowMobileStyle} className={`${inputRowClassName} ${inputRowModeClassName} ${inputRowTransformClassName}`} onSubmit={handleSubmit} autoComplete="off">
      {!embedded || !hideTools ? <div className={`chat-side-controls ${sideControlsClassName}`}>
        {hideTools ? <div aria-hidden="true" className={sideControlPlaceholderClassName} /> : <>
            <button ref={toolsButtonRef} type="button" className={toolsButtonClassName} aria-label={isDeepResearchMode ? t("chat.deep_research.exit_mode_aria") : t("chat.tools.aria")} title={isDeepResearchMode ? t("chat.deep_research.exit_mode_aria") : t("chat.tools.tooltip")} aria-haspopup={isDeepResearchMode ? undefined : "menu"} aria-expanded={isDeepResearchMode ? undefined : toolsOpen ? "true" : "false"} onMouseDown={preserveDesktopInputFocusOnMouseDown} onClick={handleToolsButtonClick}>
              {isDeepResearchMode ? <svg aria-hidden="true" width="36" height="36" viewBox="0 0 42 42" fill="none" className="opacity-95 h-[var(--chat-composer-plus-icon-size)] w-[var(--chat-composer-plus-icon-size)] transition-transform duration-150 group-hover:scale-110 group-focus-visible:scale-110">
                  <circle cx="17.8" cy="17.8" r="8.8" stroke={iconStroke} strokeWidth="2.8" />
                  <path d="M24.2 24.2L31.5 31.5" stroke={iconStroke} strokeWidth="2.8" strokeLinecap="round" />
                </svg> : <svg aria-hidden="true" width="36" height="36" viewBox="0 0 42 42" fill="none" className="opacity-95 h-[var(--chat-composer-plus-icon-size)] w-[var(--chat-composer-plus-icon-size)] transition-transform duration-150 group-hover:scale-110 group-focus-visible:scale-110">
                  <path d="M21 8.75v24.5M8.75 21h24.5" stroke={iconStroke} strokeWidth="3.1" strokeLinecap="round" />
                </svg>}
            </button>
            {toolsMenuPanel}
            {showDocumentAttachButton ? <button type="button" className={documentAttachButtonClassName} aria-label={t("chat.upload.aria")} title={t("chat.upload.tooltip")} onMouseDown={preserveDesktopInputFocusOnMouseDown} onClick={onPickDocumentFile} disabled={documentAttachDisabled}>
                    <svg aria-hidden="true" width="36" height="36" viewBox="0 0 42 42" fill="none" className="opacity-95 h-[var(--chat-composer-plus-icon-size)] w-[var(--chat-composer-plus-icon-size)] transition-transform duration-150 group-hover:scale-110 group-focus-visible:scale-110">
                      <path d="M26.9 14.2 18 23.1a4.45 4.45 0 1 0 6.29 6.29l9.26-9.26a7.42 7.42 0 0 0-10.49-10.49l-9.78 9.79a10.39 10.39 0 1 0 14.7 14.69l7.95-7.95" stroke={iconStroke} strokeWidth="2.95" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button> : null}
          </>}
      </div> : null}

      <input ref={fileInputRef} type="file" accept={acceptAttr} multiple onChange={onFileChange} className="hidden" />

      <label htmlFor="chat-input" className="sr-only">
        {t("chat.input.label")}
      </label>

      <div className={inputBarClassName} ref={inputBarRef}>
        <div className={inputFieldWrapClassName}>
          <textarea id="chat-input" ref={inputRef} value={draft} placeholder={placeholderText ?? ""} onChange={e => setDraft(e.target.value)} onKeyDown={handleKeyDown} onFocus={onFocusInput} onBlur={onBlurInput} className={inputFieldClassName} disabled={isGenerating || isRoomMode && (roomBlocked || roomAuthRequired)} rows={1} />
        </div>
        <button type="button" className={actionButtonClassName} aria-label={t("chat.listen.last_reply")} title={t("chat.listen.title")} onClick={speakLatestReply} onMouseDown={preserveDesktopInputFocusOnMouseDown} disabled={!voiceEnabled || !canSpeakLatest} data-speaking={isSpeaking ? "true" : "false"}>
          <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="block h-[var(--chat-composer-listen-icon-size)] w-[var(--chat-composer-listen-icon-size)] text-[#c57171] light:text-[#7a3a38]">
            <path d="M11 5L6 9H2v6h4l5 4z" />
            <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
          </svg>
        </button>
        {isGenerating || isStreamingAny ? <button type="submit" className={sendButtonClassName} aria-label={t("chat.send.stop")} title={t("chat.send.title_stop")} disabled={isRoomMode && (roomBlocked || roomAuthRequired) || !hasInput && !isGenerating && !isStreamingAny} data-loader-active="true" onPointerDown={handlePrimaryActionPointerDown} onMouseDown={preserveDesktopInputFocusOnMouseDown}>
            <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="chat-send-stop-glyph h-[calc(var(--chat-composer-send-icon-size)*1.18)] w-[calc(var(--chat-composer-send-icon-size)*1.18)] text-[#c57171] light:text-[#7a3a38]">
              <rect x="4.75" y="4.75" width="14.5" height="14.5" rx="3" />
            </svg>
          </button> : hasInput ? <button type="submit" className={sendButtonClassName} aria-label={t("chat.send.send")} title={t("chat.send.title_send")} disabled={isRoomMode && (roomBlocked || roomAuthRequired)} onPointerDown={handlePrimaryActionPointerDown} onMouseDown={preserveDesktopInputFocusOnMouseDown}>
            <SubmitArrowIcon
              useCurrentColor
              className="chat-send-glyph -translate-y-[0.01rem] rotate-[-90deg] text-[#c57171] light:text-[#7a3a38]"
            />
          </button> : <button type="button" className={sendButtonClassName} aria-label={recording ? t("chat.mic.stop") : t("chat.mic.start")} title={recording ? t("chat.mic.stop") : t("chat.mic.start")} onClick={handlePrimaryActionClick} onPointerDown={handlePrimaryActionPointerDown} onMouseDown={preserveDesktopInputFocusOnMouseDown} disabled={!voiceEnabled || isRoomMode && (roomBlocked || roomAuthRequired)} data-speaking={recording ? "true" : "false"} data-recording={recording ? "true" : "false"} data-recording-complete={recordingPulse ? "true" : "false"}>
            <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.82" strokeLinecap="round" strokeLinejoin="round" shapeRendering="geometricPrecision" className="chat-mic-glyph h-[var(--chat-composer-mic-icon-size)] w-[var(--chat-composer-mic-icon-size)] -translate-y-[0.01rem] text-[#c57171] light:text-[#7a3a38]">
              <path d="M12 1a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </button>}
      </div>
    </form>;
}
