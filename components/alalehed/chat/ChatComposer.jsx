"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useEffectiveRole } from "@/components/auth/useEffectiveRole";
import Button from "@/components/ui/Button";
import ChatAiForwardToggle from "./view/ChatAiForwardToggle";
import { SubmitArrowIcon } from "@/components/ui/icons/AuthIcons";
import { DictateWaveIcon, HelpOfferIcon, HelpRequestIcon } from "@/components/ui/icons/ChatIcons";
import { localizePath } from "@/lib/localizePath";

const MODE_LABEL_SHINE_BACKGROUND_DARK =
  "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 32%, rgba(255,255,255,0.98) 50%, rgba(255,255,255,0.2) 68%, rgba(255,255,255,0) 100%)";
const MODE_LABEL_SHINE_BACKGROUND_LIGHT =
  "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(72,46,36,0.18) 32%, rgba(56,36,28,0.92) 50%, rgba(72,46,36,0.18) 68%, rgba(0,0,0,0) 100%)";
const MODE_LABEL_SHINE_BACKGROUND_HC =
  "linear-gradient(90deg, rgba(255,224,44,0) 0%, rgba(255,224,44,0.18) 32%, rgba(255,224,44,0.98) 50%, rgba(255,224,44,0.18) 68%, rgba(255,224,44,0) 100%)";
function CareerModeIcon({
  stroke,
  className,
  strokeWidth = 1.8,
  ...props
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      {...props}
    >
      <path d="M6.15 9.05A1.65 1.65 0 0 1 7.8 7.4h8.4a1.65 1.65 0 0 1 1.65 1.65v8.1a1.65 1.65 0 0 1-1.65 1.65H7.8a1.65 1.65 0 0 1-1.65-1.65v-8.1Z" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.15 7.35v-.9a2.15 2.15 0 0 1 2.15-2.15h1.4a2.15 2.15 0 0 1 2.15 2.15v.9" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.15 11.25h11.7" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

function DocumentModeIcon({
  stroke,
  className,
  strokeWidth = 1.8,
  plus = false,
  ...props
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      {...props}
    >
      <path d="M6.2 4.7h8.95l3.25 3.25V18.1a1.7 1.7 0 0 1-1.7 1.7H7.9a1.7 1.7 0 0 1-1.7-1.7V6.4a1.7 1.7 0 0 1 1.7-1.7Z" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15.15 4.7v3.25h3.25" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      {plus ? (
        <>
          <path d="M12.3 10.7v5.1" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
          <path d="M9.75 13.25h5.1" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M9.25 11.05h5.75" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
          <path d="M9.25 14.85h5.75" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

function AttachCvIcon({
  stroke,
  className,
  strokeWidth = 1.9,
  ...props
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      {...props}
    >
      <path
        d="M14.75 6.95v8.5a4.75 4.75 0 1 1-9.5 0v-8.6a3.1 3.1 0 1 1 6.2 0v8.6a1.45 1.45 0 1 1-2.9 0V8.9"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
  onActivateInfoMode,
  onActivateCareerMode,
  careerModeEnabled = false,
  onActivateHelpRequestMode,
  onActivateHelpOfferMode,
  careerModeLocked = false,
  showDocumentAttachButton = false,
  showCareerCvAttachButton = false,
  onPickDocumentFile,
  speakLatestReply,
  canSpeakLatest,
  voiceEnabled = true,
  isSpeaking,
  recording,
  recordingPulse,
  handleMic,
  draftApiRef,
  onDraftStateChange,
  onLayoutChange,
  inputFocused = false,
  isMobile = false,
  activeModeLabel = "",
  roomModeLabel = "",
  activeModeKey = "",
  focusActive = false,
  allowAssistantForward = true,
  isHelpMatchRoom = false,
  sendToAssistant = false,
  setSendToAssistant,
  aiNote = ""
}) {
  const router = useRouter();
  const { effectiveRole } = useEffectiveRole();
  const isClientRole = effectiveRole === "CLIENT";
  const [draft, setDraft] = useState("");
  const [composerExpanded, setComposerExpanded] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [toolsMenuPosition, setToolsMenuPosition] = useState(null);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const submitInFlightRef = useRef(false);
  const primaryActionHandledAtRef = useRef(0);
  const toolsButtonRef = useRef(null);
  const toolsMenuRef = useRef(null);
  const initialDraftProbeCompleteRef = useRef(false);
  const previousDraftLengthRef = useRef(0);
  const composerLayoutSyncFramesRef = useRef([]);
  const composerLayoutSignatureRef = useRef("");
  const notifyLayoutChange = useCallback(() => {
    if (typeof onLayoutChange !== "function" || typeof window === "undefined") {
      return;
    }

    composerLayoutSyncFramesRef.current.forEach(frameId => {
      window.cancelAnimationFrame(frameId);
    });
    composerLayoutSyncFramesRef.current = [];

    const frame1 = window.requestAnimationFrame(() => {
      onLayoutChange();
      const frame2 = window.requestAnimationFrame(() => {
        onLayoutChange();
      });
      composerLayoutSyncFramesRef.current = [frame2];
    });

    composerLayoutSyncFramesRef.current = [frame1];
  }, [onLayoutChange]);
  const resizeComposerInput = useCallback(() => {
    const node = inputRef?.current;
    if (!node || typeof window === "undefined") return;

    const computed = window.getComputedStyle(node);
    const lineHeight = Number.parseFloat(computed.lineHeight) || 22;
    const paddingTop = Number.parseFloat(computed.paddingTop) || 0;
    const paddingBottom = Number.parseFloat(computed.paddingBottom) || 0;
    const borderTop = Number.parseFloat(computed.borderTopWidth) || 0;
    const borderBottom = Number.parseFloat(computed.borderBottomWidth) || 0;
    const minHeight = Math.ceil(lineHeight + paddingTop + paddingBottom + borderTop + borderBottom);
    const maxHeight = Math.ceil(lineHeight * 6 + paddingTop + paddingBottom + borderTop + borderBottom);
    const currentDraftLength = draft.length;
    const previousDraftLength = previousDraftLengthRef.current;
    const draftIsGrowing = currentDraftLength >= previousDraftLength;

    if (!inputFocused) {
      node.style.height = `${minHeight}px`;
      node.style.overflowY = "hidden";
      if (!currentDraftLength) {
        setComposerExpanded(false);
      }
      previousDraftLengthRef.current = currentDraftLength;
      const layoutSignature = `idle|${minHeight}|0`;
      if (composerLayoutSignatureRef.current !== layoutSignature) {
        composerLayoutSignatureRef.current = layoutSignature;
        notifyLayoutChange();
      }
      return;
    }

    node.style.height = "auto";
    const nextHeight = Math.max(minHeight, Math.min(node.scrollHeight, maxHeight));
    const contentHeight = Math.max(0, node.scrollHeight - paddingTop - paddingBottom);
    const lineCount = Math.max(1, Math.round(contentHeight / lineHeight));
    const scrollLocked = node.scrollHeight > maxHeight;
    let nextExpanded;

    if (composerExpanded) {
      nextExpanded = draftIsGrowing
        ? true
        : currentDraftLength > 0 && lineCount > 1;
    } else {
      nextExpanded = lineCount > 1;
    }

    if (!currentDraftLength) {
      nextExpanded = false;
    }

    node.style.height = `${nextHeight}px`;
    node.style.overflowY = scrollLocked ? "auto" : "hidden";
    if (composerExpanded !== nextExpanded) {
      setComposerExpanded(nextExpanded);
    }
    previousDraftLengthRef.current = currentDraftLength;
    const layoutSignature = `${nextHeight}|${nextExpanded ? 1 : 0}|${scrollLocked ? 1 : 0}`;
    if (composerLayoutSignatureRef.current !== layoutSignature) {
      composerLayoutSignatureRef.current = layoutSignature;
      notifyLayoutChange();
    }
  }, [composerExpanded, draft, inputFocused, inputRef, notifyLayoutChange]);
  const helpRequestModeLabelRaw = t("chat.tools.help_request_mode");
  const helpRequestModeLabel =
    helpRequestModeLabelRaw && helpRequestModeLabelRaw !== "chat.tools.help_request_mode"
      ? helpRequestModeLabelRaw
      : "Abisoov";
  const helpOfferModeLabelRaw = t("chat.tools.help_offer_mode");
  const helpOfferModeLabel =
    helpOfferModeLabelRaw && helpOfferModeLabelRaw !== "chat.tools.help_offer_mode"
      ? helpOfferModeLabelRaw
      : "Abipakkumine";
  const careerModeLabelRaw = t("chat.tools.career_mode");
  const careerModeLabel =
    careerModeLabelRaw && careerModeLabelRaw !== "chat.tools.career_mode"
      ? careerModeLabelRaw
      : "Karj\u00E4\u00E4rin\u00F5ustamine";
  const modeLabelShineBackground = isHighContrast
    ? MODE_LABEL_SHINE_BACKGROUND_HC
    : isLightTheme
      ? MODE_LABEL_SHINE_BACKGROUND_LIGHT
      : MODE_LABEL_SHINE_BACKGROUND_DARK;
  const effectiveModeLabel = String(roomModeLabel || activeModeLabel || "");
  const subtleModeLabel = effectiveModeLabel
    .trim()
    .replace(/^[^:]+:\s*/, "");
  const displayModeLabel = subtleModeLabel
    ? subtleModeLabel.charAt(0).toLocaleUpperCase(locale) + subtleModeLabel.slice(1)
    : "";
  const hasRoomModeLabel = Boolean(roomModeLabel);
  const hasActiveWorkflowMode = activeModeKey && activeModeKey !== "default";
  const isHelpWorkflowMode =
    activeModeKey === "help_request" || activeModeKey === "help_offer";
  const modeToggleShowsActiveState = hasActiveWorkflowMode;
  const assistantForwardEnabled = allowAssistantForward && !hideTools;
  const useSimpleRoomActionButtons = Boolean(
    (isRoomMode && isHelpMatchRoom) || isHelpWorkflowMode
  );
  const showAssistantToggleRow = Boolean(isRoomMode && focusActive && assistantForwardEnabled);
  const showModeLabelRow = Boolean(displayModeLabel && (modeToggleShowsActiveState || roomModeLabel));
  const roomModeLabelNeedsExtraOffset = hasRoomModeLabel && showAssistantToggleRow;
  const composerBottomReserveClassName =
    showAssistantToggleRow
      ? "pb-[clamp(2.2rem,5vh,2.9rem)] max-[768px]:pb-[2.15rem]"
      : "pb-0";
  const toolsMenuBackdropFilter = "none";
  const modeLabelClassName =
    "inline-block max-w-[min(76vw,24rem)] whitespace-pre text-center " +
    "text-[1.42rem] font-[400] leading-[1.12] tracking-[0.012em] text-transparent " +
    "[background-repeat:no-repeat] [background-size:220%_100%] [background-position:200%_center] " +
    "[-webkit-background-clip:text] [background-clip:text] [-webkit-text-fill-color:transparent] " +
    "[animation:profile-footer-shine_12000ms_linear_infinite] [animation-delay:100ms] [animation-fill-mode:both] " +
    "max-[768px]:max-w-[min(84vw,21rem)] max-[768px]:text-[1.28rem] max-[768px]:leading-[1.16]";
  const modeLabelStyle = {
    backgroundImage: modeLabelShineBackground
  };

  useEffect(() => {
    if (!hideTools) return;
    setToolsOpen(false);
  }, [hideTools]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const html = document.documentElement;
    const applyContrast = () => {
      setIsHighContrast(html.getAttribute("data-contrast") === "hc");
    };
    applyContrast();
    const observer = new MutationObserver(applyContrast);
    observer.observe(html, {
      attributes: true,
      attributeFilter: ["data-contrast"]
    });
    return () => observer.disconnect();
  }, []);

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
  }, [isRoomMode]);

  useEffect(() => {
    if (!draftApiRef) return;
    draftApiRef.current = {
      appendText: (txt, options = {}) => {
        const s = String(txt ?? "").trim();
        if (!s) return;
        const separator =
          typeof options?.separator === "string"
            ? options.separator
            : s.includes("\n")
              ? "\n\n"
              : " ";
        setDraft(prev => (prev ? `${prev}${separator}${s}` : s));
      },
      clear: () => setDraft("")
    };
    return () => {
      if (draftApiRef.current) draftApiRef.current = null;
    };
  }, [draftApiRef]);
  useLayoutEffect(() => {
    resizeComposerInput();
  }, [draft, composerExpanded, inputFocused, resizeComposerInput]);
  useEffect(() => () => {
    if (typeof window === "undefined") return;
    composerLayoutSyncFramesRef.current.forEach(frameId => {
      window.cancelAnimationFrame(frameId);
    });
    composerLayoutSyncFramesRef.current = [];
  }, []);
  useEffect(() => {
    if (!initialDraftProbeCompleteRef.current) return;
    onDraftStateChange?.({
      ready: true,
      hasDraft: Boolean(draft.trim())
    });
  }, [draft, onDraftStateChange]);
  useEffect(() => {
    if (!inputRef) return;
    let cancelled = false;
    let rafId = 0;
    let timeoutId = 0;
    const startedAt = typeof performance !== "undefined" ? performance.now() : Date.now();
    const finish = () => {
      if (cancelled) return;
      cancelled = true;
      if (rafId) window.cancelAnimationFrame(rafId);
      if (timeoutId) window.clearTimeout(timeoutId);
      initialDraftProbeCompleteRef.current = true;
      onDraftStateChange?.({
        ready: true,
        hasDraft: Boolean(String(inputRef.current?.value || "").trim())
      });
    };
    const poll = () => {
      if (cancelled) return;
      const currentInput = inputRef.current;
      if (!currentInput) {
        rafId = window.requestAnimationFrame(poll);
        return;
      }
      const value = String(currentInput.value || "");
      if (value.trim()) {
        finish();
        return;
      }
      const elapsed = (typeof performance !== "undefined" ? performance.now() : Date.now()) - startedAt;
      if (elapsed >= 1200) {
        finish();
        return;
      }
      rafId = window.requestAnimationFrame(poll);
    };
    rafId = window.requestAnimationFrame(poll);
    timeoutId = window.setTimeout(finish, 1250);
    return () => {
      cancelled = true;
      if (rafId) window.cancelAnimationFrame(rafId);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [inputRef, onDraftStateChange]);
  const hasInput = Boolean(draft.trim());
  const closeToolsMenu = useCallback(() => {
    setToolsOpen(false);
  }, []);
  const openDocumentAnalysis = useCallback(() => {
    ensureAnalysisPanelVisible?.();
    closeToolsMenu();
  }, [ensureAnalysisPanelVisible, closeToolsMenu]);
  const handleAgentModeSelect = useCallback(() => {
    closeToolsMenu();
    router.push(localizePath("/dokreziim", locale));
  }, [closeToolsMenu, locale, router]);
  const handleDocumentsSelect = useCallback(() => {
    closeToolsMenu();
    router.push(localizePath("/documents", locale));
  }, [closeToolsMenu, locale, router]);
  const handleCareerModeSelect = useCallback(() => {
    closeToolsMenu();
    onActivateCareerMode?.();
  }, [closeToolsMenu, onActivateCareerMode]);
  const handleHelpRequestModeSelect = useCallback(() => {
    closeToolsMenu();
    onActivateHelpRequestMode?.();
  }, [closeToolsMenu, onActivateHelpRequestMode]);
  const handleHelpOfferModeSelect = useCallback(() => {
    closeToolsMenu();
    onActivateHelpOfferMode?.();
  }, [closeToolsMenu, onActivateHelpOfferMode]);
  const handleCareerModeLockedSelect = useCallback(() => {
    closeToolsMenu();
    router.push(localizePath("/tellimus", locale));
  }, [closeToolsMenu, locale, router]);
  const submitSend = useCallback(async () => {
    if (submitInFlightRef.current) return false;
    const originalDraft = draft;
    const trimmed = originalDraft.trim();
    if (!trimmed) return false;
    if (isGenerating) return false;
    submitInFlightRef.current = true;
    try {
      setDraft("");
      const ok = await onSend(trimmed);
      if (!ok) {
        setDraft(originalDraft);
      }
      return ok;
    } catch {
      setDraft(originalDraft);
      return false;
    } finally {
      submitInFlightRef.current = false;
    }
  }, [draft, isGenerating, onSend]);
  const handleToolsButtonClick = useCallback(() => {
    if (hasActiveWorkflowMode) {
      onActivateInfoMode?.();
      closeToolsMenu();
      return;
    }
    setToolsOpen(prev => !prev);
  }, [closeToolsMenu, hasActiveWorkflowMode, onActivateInfoMode]);
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
    void submitSend();
  }, [closeToolsMenu, isGenerating, onStop, submitSend]);
  const handleKeyDown = useCallback(e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      closeToolsMenu();
      if (isGenerating) return;
      if (draft.trim()) {
        void submitSend();
      }
    }
  }, [closeToolsMenu, draft, isGenerating, submitSend]);
  const runPrimaryAction = useCallback(event => {
    closeToolsMenu();
    if (isGenerating || isStreamingAny) {
      onStop?.(event);
      return;
    }
    if (draft.trim()) {
      void submitSend();
      return;
    }
    if (voiceEnabled && !useSimpleRoomActionButtons) {
      handleMic?.(event);
    }
  }, [closeToolsMenu, draft, handleMic, isGenerating, isStreamingAny, onStop, submitSend, useSimpleRoomActionButtons, voiceEnabled]);
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
  const focusComposerField = useCallback(() => {
    const node = inputRef?.current;
    if (!node) return;
    try {
      if (!isMobile) {
        node.focus({
          preventScroll: true
        });
        return;
      }
    } catch {}
    node.focus?.();
  }, [inputRef, isMobile]);
  const handleInputBarMouseDown = useCallback(e => {
    const target = e?.target;
    if (!(target instanceof Element)) return;
    if (target.closest("textarea,button,a,input,select,label,[role='button'],[role='menuitem']")) {
      return;
    }
    e.preventDefault();
    focusComposerField();
  }, [focusComposerField]);
  const inputRowClassName =
    `${embedded ? "chat-input-row--embedded " : ""}` +
    "chat-input-row z-[80] flex w-full items-center justify-center gap-[0.02rem] pl-[var(--chat-hpad-left,var(--chat-hpad))] pr-[var(--chat-hpad-right,var(--chat-hpad))] " +
    "transform-gpu [transform-style:preserve-3d] [backface-visibility:hidden] [-webkit-backface-visibility:hidden] " +
    "transition-[top,margin-top,transform,padding-bottom,padding-top,padding-left,padding-right] duration-[520ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] [will-change:top,transform,padding-bottom] max-[768px]:transition-none";
  const composerMainClassName =
    "relative flex w-full max-w-[min(100%,var(--chat-input-max-w))] min-w-0 flex-[1_1_auto] items-stretch " +
    "transition-[max-width] duration-[520ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] [will-change:max-width] max-[768px]:transition-none";
  const composerAssistRowClassName =
    `pointer-events-auto absolute left-1/2 ${hasRoomModeLabel ? "top-[calc(100%+0.28rem)]" : "top-[calc(100%+0.18rem)]"} flex w-full max-w-[min(100%,var(--chat-input-max-w))] -translate-x-1/2 items-center justify-end ` +
    "pr-[clamp(1.2rem,3vw,1.65rem)] transition-[max-width,top] duration-[520ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] max-[768px]:top-[calc(100%+0.16rem)] max-[768px]:pr-[0.9rem] max-[768px]:transition-none";
  const isStandaloneDisplay = typeof window !== "undefined" && (
    document?.documentElement?.dataset?.displayMode === "standalone" ||
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
    window.matchMedia?.("(display-mode: fullscreen)")?.matches ||
    window.navigator?.standalone === true
  );
  const modeLabelMobileTopClassName = roomModeLabelNeedsExtraOffset
    ? isStandaloneDisplay
      ? "max-[768px]:top-[calc(100%+1.72rem)]"
      : "max-[768px]:top-[calc(100%+1.08rem)]"
    : isStandaloneDisplay
      ? "max-[768px]:top-[calc(100%+1.16rem)]"
      : "max-[768px]:top-[calc(100%+0.58rem)]";
  const composerModeRowClassName =
    `pointer-events-none absolute left-0 right-0 ${roomModeLabelNeedsExtraOffset ? "top-[calc(100%+1.95rem)]" : "top-[calc(100%+1.28rem)]"} ${modeLabelMobileTopClassName} flex w-full items-center justify-center ` +
    "transition-[top] duration-[520ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] max-[768px]:transition-none";
  const modeLabelWrapClassName =
    "relative overflow-visible pb-[0.14rem] text-center";
  const inputRowModeClassName = embedded
    ? "relative mt-0 w-full max-w-full gap-[0.4rem] pl-0 pr-0 [--chat-input-max-w:100%]"
    : `relative mt-[clamp(0.6rem,1.8vh,1.1rem)] min-[769px]:mb-[var(--chat-composer-bottom-gap,0rem)] ${composerBottomReserveClassName} ` +
      "max-[768px]:absolute max-[768px]:left-0 max-[768px]:right-0 " +
      "max-[768px]:bottom-[calc(env(safe-area-inset-bottom,0px)+2.75rem+var(--chat-vk-offset,0px))] " +
      "max-[768px]:z-[90] max-[768px]:mt-0 max-[768px]:w-full max-[768px]:max-w-full " +
      "max-[768px]:gap-[clamp(0.22rem,1.4vw,0.42rem)] max-[768px]:pl-[clamp(0.36rem,1.8vw,0.62rem)] max-[768px]:pr-[clamp(0.7rem,3vw,1rem)] " +
      "max-[768px]:[--chat-input-max-w:min(100%,calc(100vw-6.45rem))]";
  const displayExpanded = inputFocused && composerExpanded;
  const inputBarClassName =
    "chat-inputbar relative grid w-full overflow-hidden " +
    `${displayExpanded ? "grid-cols-[1fr] items-stretch gap-y-[0.08rem]" : "grid-cols-[1fr_auto] items-stretch gap-x-[0.24rem]"} ` +
    `${displayExpanded ? "min-h-[var(--inputbar-h)] rounded-[1.35rem]" : "h-[var(--inputbar-h)] rounded-full"} ` +
    "transition-[border-color,box-shadow,background,max-width,transform] duration-[520ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] " +
    `${displayExpanded ? "pl-[0.62rem] pt-[0.56rem] pb-0 pr-[0.08rem]" : "pl-[0.6rem] pr-0 py-0"} ` +
    "pointer-events-auto z-[65] translate-x-[var(--chat-inputbar-left-pull,0rem)] max-[768px]:translate-x-0 max-[768px]:transition-[background,box-shadow,border-color,transform] max-[768px]:duration-[180ms] max-[768px]:ease-[cubic-bezier(0.22,0.61,0.36,1)]";
  const inputFieldWrapClassName = displayExpanded
    ? "min-w-0 w-full px-[0.18rem] pt-[0.08rem]"
    : "min-w-0 w-full self-stretch flex items-center pr-[0.16rem]";
  const inputFieldClassName =
    `chat-input-field block w-full min-h-[1.38rem] max-h-[min(30dvh,8.5rem)] resize-none appearance-none overflow-y-hidden bg-transparent text-[1.1rem] [overflow-wrap:anywhere] break-words ${displayExpanded ? "leading-[1.26] px-[0.06rem] pt-0 pb-[0.05rem]" : "leading-[1.18] px-[0.12rem] pt-[0.28rem] pb-[0.12rem]"} ` +
    "text-[color:var(--pt-150)] light:text-[color:var(--text-strong,#1f2937)] " +
    "outline-none border-0 shadow-none " +
    `${forcePlaceholderVisible ? "placeholder:opacity-100 placeholder:text-[color:var(--input-placeholder)] " : "placeholder:opacity-0 light:placeholder:opacity-100 light:placeholder:text-[color:var(--input-placeholder)]"}`;
  const actionRowClassName = displayExpanded
    ? "flex w-full shrink-0 items-center justify-end gap-[0.18rem] p-0"
    : "flex h-full self-stretch items-center justify-end gap-[0.18rem]";
  const actionButtonClassName =
    `chat-listen-btn relative z-[2] ${displayExpanded ? "!h-[var(--inputbar-h)] !w-[var(--inputbar-h)] !min-h-[var(--inputbar-h)] !min-w-[var(--inputbar-h)] !flex-[0_0_var(--inputbar-h)]" : "!h-[calc(var(--inputbar-h)-2px)] !w-[calc(var(--inputbar-h)-2px)] !min-h-[calc(var(--inputbar-h)-2px)] !min-w-[calc(var(--inputbar-h)-2px)] !flex-[0_0_calc(var(--inputbar-h)-2px)]"} !p-0 rounded-full ` +
    "flex items-center justify-center " +
    "mr-0 " +
    "pointer-events-auto !translate-y-0 hover:!translate-y-0 active:!translate-y-0 " +
    "transition-[background,border-color,box-shadow,color,opacity,transform] duration-[220ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] " +
    "data-[speaking=true]:shadow-[0_0_0_1px_rgba(148,163,184,0.22),0_0_6px_rgba(84,95,115,0.45)] " +
    "disabled:opacity-50 disabled:cursor-not-allowed";
  const sendButtonClassName =
    `chat-send-btn invite-primary-btn relative z-[2] ${displayExpanded ? "!h-[var(--inputbar-h)] !w-[var(--inputbar-h)] !min-h-[var(--inputbar-h)] !min-w-[var(--inputbar-h)] !flex-[0_0_var(--inputbar-h)]" : "!h-[calc(var(--inputbar-h)-2px)] !w-[calc(var(--inputbar-h)-2px)] !min-h-[calc(var(--inputbar-h)-2px)] !min-w-[calc(var(--inputbar-h)-2px)] !flex-[0_0_calc(var(--inputbar-h)-2px)]"} !p-0 rounded-full ` +
    "flex items-center justify-center overflow-hidden leading-none " +
    "translate-x-[var(--chat-send-btn-shift-x,0rem)] translate-y-[var(--chat-send-btn-shift-y,0rem)] " +
    "transition-[background,border-color,box-shadow,color,opacity,transform] duration-[220ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] " +
    "pointer-events-auto data-[recording=true]:text-[var(--chat-icon-color)] " +
    "disabled:opacity-50 disabled:cursor-not-allowed";
  const inputRowTransformClassName = embedded
    ? "[transform:none]"
    : `${inputFocused
      ? hasRoomModeLabel
        ? "[transform:translate3d(0,calc(var(--chat-input-focus-shift,0.94rem)+clamp(1.15rem,2.8dvh,1.75rem)),0)]"
        : "[transform:translate3d(0,calc(var(--chat-input-focus-shift,0.94rem)+clamp(0.6rem,2dvh,1.2rem)),0)]"
      : "[transform:translate3d(0,calc(-1*var(--chat-input-shift,0rem)),0)]"} max-[768px]:[transform:none]`;
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
  const inputRowStyle = hideTools && !embedded
    ? {
        ...(inputRowMobileStyle || {}),
        paddingLeft: "var(--chat-hpad-right,var(--chat-hpad))",
        paddingRight: "var(--chat-hpad-right,var(--chat-hpad))",
        "--chat-inputbar-left-pull": "0rem",
        "--chat-attach-left-pull": "0rem"
      }
    : {
        ...(inputRowMobileStyle || {})
      };
  const toolItemBaseClassName =
    "chat-tools-item w-full appearance-none border-0 bg-transparent px-[0.38rem] py-[0.36rem] text-left " +
    "text-[1.12rem] leading-[1.14] tracking-[0.01em] transition-colors duration-150 " +
    "rounded-[0.5rem] grid min-h-[2.52rem] grid-cols-[1.68rem_minmax(0,1fr)] items-center gap-[0.5rem] " +
    "hover:bg-[color:var(--chat-tools-item-hover-bg,rgba(255,255,255,0.2))] " +
    "focus-visible:bg-[color:var(--chat-tools-item-hover-bg,rgba(255,255,255,0.2))]";
  const toolIconSlotClassName = "inline-flex h-[1.68rem] w-[1.68rem] shrink-0 items-center justify-center self-center";
  const toolLabelClassName = "inline-flex min-w-0 items-center self-center leading-[1.08]";
  const toolIconStrokeWidth = 1.55;
  const iconStroke = isLightTheme ? "#7A3A38" : "#c57171";
  const menuModeIconClassName = "block h-[1.64rem] w-[1.64rem] shrink-0 opacity-95";
  const menuLargeModeIconClassName = "block h-[1.82rem] w-[1.82rem] shrink-0 opacity-95";
  const activeModeIconClassName = "opacity-95 h-[var(--chat-composer-plus-icon-size)] w-[var(--chat-composer-plus-icon-size)] transition-transform duration-150 group-hover:scale-110 group-focus-visible:scale-110";
  const activeModeIconStrokeWidth = 1.45;
  const plusIconStrokeWidth = 3.5;
  const toolsMenuClassName =
    "chat-tools-menu fixed z-[160] isolate overflow-hidden w-max min-w-[11.4rem] max-w-[calc(100vw-1rem)] rounded-[0.88rem] " +
    "border-0 [background:var(--chat-tools-panel-bg,var(--opaque-panel-bg,var(--rail-tooltip-bg,var(--subpage-card-bg))))] text-[color:var(--opaque-panel-text,var(--rail-tooltip-text,var(--pt-100)))] " +
    "p-[0.25rem] shadow-[var(--opaque-panel-shadow,var(--rail-tooltip-shadow,var(--subpage-card-shadow)))] backdrop-blur-0 backdrop-saturate-100 " +
    "hc:border-0 hc:shadow-none";
  const toolsMenuPanel = toolsOpen && toolsMenuPosition && typeof document !== "undefined"
    ? createPortal(<div ref={toolsMenuRef} role="menu" aria-label={t("chat.tools.menu_aria")} className={toolsMenuClassName} style={{
      left: `${toolsMenuPosition.left}px`,
      bottom: `${toolsMenuPosition.bottom}px`,
      backdropFilter: toolsMenuBackdropFilter,
      WebkitBackdropFilter: toolsMenuBackdropFilter
    }}>
          {!isClientRole ? <button type="button" role="menuitem" className={`${toolItemBaseClassName} text-[color:var(--pt-100)] light:text-[#3f241f]`} onClick={handleDocumentsSelect}>
              <span aria-hidden="true" className={toolIconSlotClassName}>
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={menuLargeModeIconClassName}>
                  <path d="M4.85 7.4a1.75 1.75 0 0 1 1.75-1.75h4.1l1.55 1.55h5.15a1.75 1.75 0 0 1 1.75 1.75v8.45a1.75 1.75 0 0 1-1.75 1.75H6.6a1.75 1.75 0 0 1-1.75-1.75V7.4Z" stroke={iconStroke} strokeWidth={toolIconStrokeWidth} strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4.85 10.8h14.3" stroke={iconStroke} strokeWidth={1.65} strokeLinecap="round" />
                </svg>
              </span>
              <span className={toolLabelClassName}>{t("chat.tools.documents")}</span>
            </button> : null}
          {careerModeEnabled ? (
            <button
              type="button"
              role="menuitem"
              className={`${toolItemBaseClassName} ${careerModeLocked ? "chat-tools-item-disabled text-[rgba(203,213,225,0.58)] light:text-[rgba(63,36,31,0.45)] cursor-not-allowed hover:bg-transparent focus-visible:bg-transparent" : "text-[color:var(--pt-100)] light:text-[#3f241f]"}`}
              onClick={careerModeLocked ? handleCareerModeLockedSelect : handleCareerModeSelect}
              aria-disabled={careerModeLocked ? "true" : undefined}
              title={careerModeLocked ? t("chat.error.subscription_required_profile", "Tellimus vajalik") : undefined}
            >
              <span aria-hidden="true" className={toolIconSlotClassName}>
                <CareerModeIcon stroke={iconStroke} strokeWidth={toolIconStrokeWidth} className={menuLargeModeIconClassName} />
              </span>
              <span className={toolLabelClassName}>
                <span>{careerModeLabel}</span>
                {careerModeLocked ? (
                  <span
                    aria-hidden="true"
                    className="ml-[0.46rem] inline-flex h-[1.22rem] w-[1.22rem] shrink-0 items-center justify-center rounded-full border-0 bg-transparent p-0 text-[rgba(203,213,225,0.76)] light:text-[rgba(122,58,56,0.82)]"
                  >
                    <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" className="block h-[1.22rem] w-[1.22rem] shrink-0">
                      <path d="M8.5 10.2V8.1a3.5 3.5 0 1 1 7 0v2.1" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M7.4 10.2h9.2c.66 0 1.2.54 1.2 1.2v5.2c0 .66-.54 1.2-1.2 1.2H7.4c-.66 0-1.2-.54-1.2-1.2v-5.2c0-.66.54-1.2 1.2-1.2Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
                      <path d="M12 12.3v2.4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
                    </svg>
                  </span>
                ) : null}
              </span>
            </button>
          ) : null}
          <button type="button" role="menuitem" className={`${toolItemBaseClassName} text-[color:var(--pt-100)] light:text-[#3f241f]`} onClick={handleHelpRequestModeSelect}>
            <span aria-hidden="true" className={toolIconSlotClassName}>
              <HelpRequestIcon isLightTheme={isLightTheme} strokeWidth={1.92} className={menuModeIconClassName} />
            </span>
            <span className={toolLabelClassName}>{helpRequestModeLabel}</span>
          </button>
          <button type="button" role="menuitem" className={`${toolItemBaseClassName} text-[color:var(--pt-100)] light:text-[#3f241f]`} onClick={handleHelpOfferModeSelect}>
            <span aria-hidden="true" className={toolIconSlotClassName}>
              <HelpOfferIcon isLightTheme={isLightTheme} strokeWidth={1.92} className={menuModeIconClassName} />
            </span>
            <span className={toolLabelClassName}>{helpOfferModeLabel}</span>
          </button>
          <button type="button" role="menuitem" className={`${toolItemBaseClassName} text-[color:var(--pt-100)] light:text-[#3f241f]`} onClick={openDocumentAnalysis}>
            <span aria-hidden="true" className={toolIconSlotClassName}>
              <DocumentModeIcon stroke={iconStroke} strokeWidth={toolIconStrokeWidth} className={menuLargeModeIconClassName} />
            </span>
            <span className={toolLabelClassName}>{t("chat.tools.document_analysis")}</span>
          </button>
          <button type="button" role="menuitem" className={`${toolItemBaseClassName} text-[color:var(--pt-100)] light:text-[#3f241f]`} onClick={handleAgentModeSelect}>
            <span aria-hidden="true" className={toolIconSlotClassName}>
              <DocumentModeIcon stroke={iconStroke} strokeWidth={toolIconStrokeWidth} plus className={menuLargeModeIconClassName} />
            </span>
            <span className={toolLabelClassName}>{t("chat.tools.agent_mode")}</span>
          </button>
        </div>, document.body)
    : null;
  const sideControlsClassName =
    "relative z-[85] self-end pointer-events-auto flex items-center gap-[0.18rem] max-[768px]:gap-[0.12rem] " +
    "translate-x-[var(--chat-attach-left-pull,0rem)] max-[768px]:translate-x-0 " +
    "max-[768px]:ml-[clamp(-0.52rem,-1.6vw,-0.3rem)] max-[768px]:mr-[clamp(0.02rem,0.4vw,0.12rem)]";
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
  const showSideControls = !hideTools;
  const replaceModeButtonWithCareerAttach = Boolean(careerModeEnabled && showCareerCvAttachButton);
  return <form ref={inputRowRef} style={inputRowStyle} className={`${inputRowClassName} ${inputRowModeClassName} ${inputRowTransformClassName}`} onSubmit={handleSubmit} autoComplete="off">
      {showSideControls ? <div className={`chat-side-controls ${sideControlsClassName}`}>
        {hideTools ? null : <>
            {replaceModeButtonWithCareerAttach ? <button type="button" className={toolsButtonClassName} aria-label={t("chat.upload.aria")} title={t("chat.upload.tooltip")} onMouseDown={preserveDesktopInputFocusOnMouseDown} onClick={onPickDocumentFile} disabled={documentAttachDisabled}>
                <AttachCvIcon stroke={iconStroke} strokeWidth={activeModeIconStrokeWidth} className={activeModeIconClassName} />
              </button> : <button ref={toolsButtonRef} type="button" className={toolsButtonClassName} aria-label={modeToggleShowsActiveState ? t("chat.tools.exit_mode_aria") : t("chat.tools.aria")} title={modeToggleShowsActiveState ? t("chat.tools.exit_mode_aria") : t("chat.tools.tooltip")} aria-haspopup={modeToggleShowsActiveState ? undefined : "menu"} aria-expanded={modeToggleShowsActiveState ? undefined : toolsOpen ? "true" : "false"} onMouseDown={preserveDesktopInputFocusOnMouseDown} onClick={handleToolsButtonClick}>
                {activeModeKey === "career" ? <CareerModeIcon stroke={iconStroke} strokeWidth={activeModeIconStrokeWidth} className={activeModeIconClassName} />
                  : activeModeKey === "help_request" ? <HelpRequestIcon isLightTheme={isLightTheme} strokeWidth={activeModeIconStrokeWidth} className={activeModeIconClassName} />
                  : activeModeKey === "help_offer" ? <HelpOfferIcon isLightTheme={isLightTheme} strokeWidth={activeModeIconStrokeWidth} className={activeModeIconClassName} />
                  : <svg aria-hidden="true" width="36" height="36" viewBox="0 0 42 42" fill="none" className={activeModeIconClassName}>
                    <path d="M21 8.75v24.5M8.75 21h24.5" stroke={iconStroke} strokeWidth={plusIconStrokeWidth} strokeLinecap="round" />
                  </svg>}
              </button>}
            {replaceModeButtonWithCareerAttach ? null : toolsMenuPanel}
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

      <div className={composerMainClassName}>
        <div className={inputBarClassName} ref={inputBarRef} onMouseDown={handleInputBarMouseDown}>
          <div className={inputFieldWrapClassName}>
            <textarea id="chat-input" ref={inputRef} value={draft} placeholder={placeholderText ?? ""} onChange={e => setDraft(e.target.value)} onKeyDown={handleKeyDown} onFocus={e => {
            onFocusInput?.(e);
          }} onBlur={onBlurInput} className={inputFieldClassName} disabled={isGenerating || isRoomMode && (roomBlocked || roomAuthRequired)} rows={1} />
          </div>
          <div className={actionRowClassName}>
            {!useSimpleRoomActionButtons ? <button type="button" className={actionButtonClassName} aria-label={t("chat.listen.last_reply")} title={t("chat.listen.title")} onClick={speakLatestReply} onMouseDown={preserveDesktopInputFocusOnMouseDown} disabled={!voiceEnabled || !canSpeakLatest} data-speaking={isSpeaking ? "true" : "false"}>
                <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="block h-[var(--chat-composer-listen-icon-size)] w-[var(--chat-composer-listen-icon-size)] text-[color:var(--chat-composer-action-icon-color,#c57171)]">
                  <path d="M11 5L6 9H2v6h4l5 4z" />
                  <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
                </svg>
              </button> : null}
            {isGenerating || isStreamingAny ? <Button as="button" variant="primary" size="md" type="submit" className={sendButtonClassName} aria-label={t("chat.send.stop")} title={t("chat.send.title_stop")} disabled={isRoomMode && (roomBlocked || roomAuthRequired) || !hasInput && !isGenerating && !isStreamingAny} data-loader-active="true" onPointerDown={handlePrimaryActionPointerDown} onMouseDown={preserveDesktopInputFocusOnMouseDown}>
                <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="chat-send-stop-glyph h-[calc(var(--chat-composer-send-icon-size)*1.18)] w-[calc(var(--chat-composer-send-icon-size)*1.18)] text-[color:var(--chat-composer-action-icon-color,#c57171)]">
                  <rect x="4.75" y="4.75" width="14.5" height="14.5" rx="3" />
                </svg>
              </Button> : hasInput ? <Button as="button" variant="primary" size="md" type="submit" className={sendButtonClassName} aria-label={t("chat.send.send")} title={t("chat.send.title_send")} disabled={isRoomMode && (roomBlocked || roomAuthRequired)} onPointerDown={handlePrimaryActionPointerDown} onMouseDown={preserveDesktopInputFocusOnMouseDown}>
                <SubmitArrowIcon
                  useCurrentColor
                  className="chat-send-glyph -translate-y-[0.01rem] rotate-[-90deg] text-[color:var(--chat-composer-action-icon-color,#c57171)]"
                />
              </Button> : useSimpleRoomActionButtons ? <Button as="button" variant="primary" size="md" type="submit" className={sendButtonClassName} aria-label={t("chat.send.send")} title={t("chat.send.title_send")} disabled={!hasInput || isRoomMode && (roomBlocked || roomAuthRequired)} onPointerDown={handlePrimaryActionPointerDown} onMouseDown={preserveDesktopInputFocusOnMouseDown}>
                <SubmitArrowIcon
                  useCurrentColor
                  className="chat-send-glyph -translate-y-[0.01rem] rotate-[-90deg] text-[color:var(--chat-composer-action-icon-color,#c57171)]"
                />
              </Button> : <Button as="button" variant="primary" size="md" type="button" className={sendButtonClassName} aria-label={recording ? t("chat.mic.stop") : t("chat.mic.start")} title={recording ? t("chat.mic.stop") : t("chat.mic.start")} onClick={handlePrimaryActionClick} onPointerDown={handlePrimaryActionPointerDown} onMouseDown={preserveDesktopInputFocusOnMouseDown} disabled={!voiceEnabled || isRoomMode && (roomBlocked || roomAuthRequired)} data-speaking={recording ? "true" : "false"} data-recording={recording ? "true" : "false"} data-recording-complete={recordingPulse ? "true" : "false"}>
                <DictateWaveIcon className="chat-mic-glyph h-[var(--chat-composer-mic-icon-size)] w-[var(--chat-composer-mic-icon-size)] -translate-y-[0.01rem] text-[color:var(--chat-composer-action-icon-color,#c57171)]" />
              </Button>}
          </div>
        </div>
        <ChatAiForwardToggle t={t} focusActive={focusActive} isRoomMode={isRoomMode} allowAssistantForward={assistantForwardEnabled} sendToAssistant={sendToAssistant} setSendToAssistant={setSendToAssistant} aiNote={aiNote} className={composerAssistRowClassName} />
      </div>
      {showModeLabelRow ? <div className={composerModeRowClassName}>
          <div className={modeLabelWrapClassName}>
            <span
              aria-hidden="true"
              className={modeLabelClassName}
              style={modeLabelStyle}
            >
              {displayModeLabel}
            </span>
            <span className="sr-only">{displayModeLabel}</span>
          </div>
        </div> : null}
    </form>;
}
