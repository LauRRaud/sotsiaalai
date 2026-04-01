"use client";

import { createPortal } from "react-dom";
import { memo, useEffect, useLayoutEffect, useRef, useState } from "react";
import SotsiaalAILoader from "@/components/ui/SotsiaalAILoader";
import Button from "@/components/ui/Button";
import OptionCard from "@/components/ui/OptionCard";
import { cn } from "@/components/ui/cn";
import { glassPrimaryButtonToneClassName } from "@/components/ui/glassPageStyles";
import { primarySegmentedButtonClassName } from "@/components/ui/primarySegmentedButtonClassName";

const docToggleCardClassName =
  "chat-analysis-toggle-btn !inline-flex !w-fit !justify-self-center !self-center !min-h-[2.72rem] !rounded-[1.6rem] !px-[1.05rem] !py-[0.64rem] !text-[1.06rem] !leading-[1.2] " +
  "[--seg-control-size:1.42rem] [--seg-check-size:1.1rem] " +
  "[&>span.shrink-0]:-translate-y-[0.08rem] " +
  "invite-sponsor-toggle-card " +
  "[--seg-card-bg:var(--btn-primary-bg)] " +
  "[--seg-card-bg-hover:var(--btn-primary-bg-hover)] " +
  "[--seg-card-bg-selected:var(--btn-primary-bg)] " +
  "[--seg-card-bg-active:var(--btn-primary-bg-active)] " +
  "[--seg-card-shadow:var(--btn-primary-shadow)] " +
  "[--seg-card-shadow-hover:var(--btn-primary-shadow-hover)] " +
  "[--seg-card-shadow-selected:var(--btn-primary-shadow)] " +
  "[--seg-card-shadow-active:var(--btn-primary-shadow-active)] " +
  "[--seg-card-border:transparent] " +
  "[--seg-card-border-hover:transparent] " +
  "[--seg-card-border-selected:transparent] " +
  "[--seg-card-border-active:transparent] " +
  "[--seg-card-text:var(--btn-primary-text)] " +
  "[--seg-card-text-hover:var(--btn-primary-text)] " +
  "[--seg-card-text-selected:var(--btn-primary-text)] " +
  `${primarySegmentedButtonClassName} ` +
  "max-[768px]:!mt-[0.34rem] max-[768px]:!min-h-[2.9rem] max-[768px]:!rounded-[1.45rem] max-[768px]:!text-[1.12rem]";
const ChatAnalysisPanel = memo(function ChatAnalysisPanel({
  t,
  analysisPanelRef,
  analysisPanelMode,
  uploadPreview,
  _uploadedFilesCount,
  _uploadedFileNames,
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
  isMobileViewport,
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
  const contextHintPopoverRef = useRef(null);
  const isDraggingScroll = useRef(false);
  const touchStartYRef = useRef(null);
  const [previewScroll, setPreviewScroll] = useState(0);
  const [contextHintOpen, setContextHintOpen] = useState(false);
  const [contextHintPlacement, setContextHintPlacement] = useState(null);
  const [isHighContrast, setIsHighContrast] = useState(false);
  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const root = document.documentElement;
    const syncContrast = () => {
      setIsHighContrast(root.dataset.contrast === "hc");
    };
    syncContrast();
    const observer = new MutationObserver(syncContrast);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-contrast"]
    });
    return () => {
      observer.disconnect();
    };
  }, []);
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
      const popover = contextHintPopoverRef.current;
      if (node?.contains(event.target) || popover?.contains(event.target)) return;
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
  useLayoutEffect(() => {
    if (!contextHintOpen || typeof window === "undefined") {
      setContextHintPlacement(null);
      return undefined;
    }

    const updatePlacement = () => {
      const trigger = contextHintWrapRef.current;
      const popover = contextHintPopoverRef.current;
      if (!trigger || !popover) return;
      const surfaceNode = trigger.closest(".chat-page-shell") || trigger;
      const computedStyles = window.getComputedStyle(surfaceNode);
      const readSurfaceVar = (...names) => {
        for (const name of names) {
          const value = computedStyles.getPropertyValue(name)?.trim();
          if (value) return value;
        }
        return "";
      };

      const margin = 12;
      const gap = 10;
      const rect = trigger.getBoundingClientRect();
      const popRect = popover.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const width = Math.min(
        popRect.width || 0,
        Math.max(0, viewportWidth - margin * 2)
      );
      const centerX = rect.left + rect.width / 2;
      const left = Math.min(
        Math.max(centerX, margin + width / 2),
        viewportWidth - margin - width / 2
      );
      const spaceBelow = viewportHeight - rect.bottom - gap - margin;
      const spaceAbove = rect.top - gap - margin;
      const fitsBelow = spaceBelow >= popRect.height;
      const fitsAbove = spaceAbove >= popRect.height;
      const placeAbove = fitsAbove || !fitsBelow;
      const top = placeAbove
        ? Math.max(rect.top - gap - popRect.height, margin)
        : Math.min(rect.bottom + gap, viewportHeight - margin - popRect.height);

      setContextHintPlacement({
        top,
        left,
        width,
        surfaceVars: {
          "--chat-analysis-hint-bg": readSurfaceVar(
            "--chat-tools-panel-bg",
            "--opaque-panel-bg",
            "--rail-tooltip-bg",
            "--subpage-card-bg"
          ),
          "--chat-analysis-hint-text": readSurfaceVar(
            "--opaque-panel-text",
            "--rail-tooltip-text",
            "--glass-surface-text"
          ),
          "--chat-analysis-hint-border": readSurfaceVar(
            "--rail-tooltip-border",
            "--chat-tools-panel-border",
            "--opaque-panel-border"
          ),
          "--chat-analysis-hint-shadow": readSurfaceVar(
            "--chat-tools-panel-shadow",
            "--opaque-panel-shadow",
            "--rail-tooltip-shadow"
          )
        }
      });
    };

    let raf2 = 0;
    const raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(updatePlacement);
    });

    const onScroll = () => {
      window.requestAnimationFrame(updatePlacement);
    };
    const onResize = () => {
      window.requestAnimationFrame(updatePlacement);
    };

    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);

    return () => {
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [contextHintOpen, isMobileViewport]);
  useLayoutEffect(() => {
    if (typeof document === "undefined") return undefined;
    const panelNode = analysisPanelRef?.current;
    if (!panelNode) return undefined;
    const actionButtons = Array.from(
      panelNode.querySelectorAll(".chat-analysis-action-btn")
    );
    const toggleButtons = Array.from(
      panelNode.querySelectorAll(".chat-analysis-toggle-btn")
    );
    const tooltipNodes = Array.from(
      document.querySelectorAll(".chat-analysis-overlay-hint")
    );
    const clearNodeStyles = (node, properties) => {
      properties.forEach(property => node.style.removeProperty(property));
    };
    const buttonProperties = [
      "color",
      "background",
      "border",
      "box-shadow",
      "backdrop-filter",
      "-webkit-backdrop-filter",
      "--btn-primary-bg",
      "--btn-primary-bg-hover",
      "--btn-primary-bg-active",
      "--btn-primary-border",
      "--btn-primary-border-hover",
      "--btn-primary-border-active",
      "--btn-primary-shadow",
      "--btn-primary-shadow-hover",
      "--btn-primary-shadow-active",
      "--btn-primary-shadow-focus",
      "--btn-primary-text"
    ];
    const toggleProperties = [
      "color",
      "background",
      "border",
      "box-shadow",
      "--seg-card-border-width",
      "--seg-card-bg",
      "--seg-card-bg-hover",
      "--seg-card-bg-selected",
      "--seg-card-bg-active",
      "--seg-card-shadow",
      "--seg-card-shadow-hover",
      "--seg-card-shadow-selected",
      "--seg-card-shadow-active",
      "--seg-card-border",
      "--seg-card-border-hover",
      "--seg-card-border-selected",
      "--seg-card-border-active",
      "--seg-card-text",
      "--seg-card-text-hover",
      "--seg-card-text-selected"
    ];
    const tooltipProperties = ["color", "border", "box-shadow"];
    if (!isHighContrast) {
      actionButtons.forEach(node => clearNodeStyles(node, buttonProperties));
      toggleButtons.forEach(node => clearNodeStyles(node, toggleProperties));
      tooltipNodes.forEach(node => clearNodeStyles(node, tooltipProperties));
      return undefined;
    }

    const hcButtonBg = `radial-gradient(
      82% 66% at 50% -14%,
      rgba(222, 236, 255, 0.108) 0%,
      rgba(222, 236, 255, 0.048) 42%,
      rgba(222, 236, 255, 0.016) 58%,
      rgba(222, 236, 255, 0) 74%
    ),
    linear-gradient(
      180deg,
      rgba(26, 35, 49, 0.92) 0%,
      rgba(16, 25, 39, 0.94) 100%
    )`;
    const hcButtonBgHover = `linear-gradient(
      0deg,
      rgba(255, 234, 0, 0.045) 0%,
      rgba(255, 234, 0, 0.045) 100%
    ),
    radial-gradient(
      82% 66% at 50% -14%,
      rgba(222, 236, 255, 0.135) 0%,
      rgba(222, 236, 255, 0.06) 42%,
      rgba(222, 236, 255, 0.02) 58%,
      rgba(222, 236, 255, 0) 74%
    ),
    linear-gradient(
      180deg,
      rgba(31, 42, 58, 0.93) 0%,
      rgba(19, 30, 46, 0.95) 100%
    )`;
    const hcButtonBgActive = `linear-gradient(
      0deg,
      rgba(255, 234, 0, 0.07) 0%,
      rgba(255, 234, 0, 0.07) 100%
    ),
    radial-gradient(
      82% 66% at 50% -14%,
      rgba(222, 236, 255, 0.13) 0%,
      rgba(222, 236, 255, 0.055) 42%,
      rgba(222, 236, 255, 0.017) 58%,
      rgba(222, 236, 255, 0) 74%
    ),
    linear-gradient(
      180deg,
      rgba(28, 38, 53, 0.91) 0%,
      rgba(18, 27, 42, 0.93) 100%
    )`;
    const hcButtonShadow =
      "inset 0 1px 0 rgba(220, 236, 255, 0.1), 0 5px 12px rgba(2, 6, 16, 0.24)";
    const hcButtonShadowHover =
      "inset 0 1px 0 rgba(220, 236, 255, 0.12), 0 7px 14px rgba(2, 6, 16, 0.28)";
    const hcButtonShadowActive =
      "inset 0 1px 0 rgba(220, 236, 255, 0.08), 0 4px 10px rgba(2, 6, 16, 0.22)";
    const hcButtonShadowFocus =
      "inset 0 1px 0 rgba(220, 236, 255, 0.16), 0 8px 18px rgba(2, 6, 16, 0.32), 0 0 0 2px rgba(255, 234, 0, 0.44)";
    const setImportant = (node, property, value) => {
      node.style.setProperty(property, value, "important");
    };

    actionButtons.forEach(node => {
      setImportant(node, "color", "var(--hc-accent)");
      setImportant(node, "background", hcButtonBg);
      setImportant(node, "border", "2px solid rgba(255, 234, 0, 0.66)");
      setImportant(node, "box-shadow", hcButtonShadow);
      setImportant(node, "backdrop-filter", "none");
      setImportant(node, "-webkit-backdrop-filter", "none");
      setImportant(node, "--btn-primary-bg", hcButtonBg);
      setImportant(node, "--btn-primary-bg-hover", hcButtonBgHover);
      setImportant(node, "--btn-primary-bg-active", hcButtonBgActive);
      setImportant(node, "--btn-primary-border", "2px solid rgba(255, 234, 0, 0.66)");
      setImportant(node, "--btn-primary-border-hover", "2px solid rgba(255, 234, 0, 0.9)");
      setImportant(node, "--btn-primary-border-active", "2px solid rgba(255, 234, 0, 0.95)");
      setImportant(node, "--btn-primary-shadow", hcButtonShadow);
      setImportant(node, "--btn-primary-shadow-hover", hcButtonShadowHover);
      setImportant(node, "--btn-primary-shadow-active", hcButtonShadowActive);
      setImportant(node, "--btn-primary-shadow-focus", hcButtonShadowFocus);
      setImportant(node, "--btn-primary-text", "var(--hc-accent)");
    });

    toggleButtons.forEach(node => {
      const checked = node.dataset.checked === "true";
      setImportant(node, "--seg-card-border-width", "2px");
      setImportant(node, "--seg-card-bg", hcButtonBg);
      setImportant(node, "--seg-card-bg-hover", hcButtonBgHover);
      setImportant(node, "--seg-card-bg-selected", "rgba(255, 234, 0, 0.1)");
      setImportant(node, "--seg-card-bg-active", hcButtonBgActive);
      setImportant(node, "--seg-card-shadow", hcButtonShadow);
      setImportant(node, "--seg-card-shadow-hover", hcButtonShadowHover);
      setImportant(node, "--seg-card-shadow-selected", "0 0 0 1px rgba(255, 234, 0, 0.64)");
      setImportant(node, "--seg-card-shadow-active", hcButtonShadowActive);
      setImportant(node, "--seg-card-border", "rgba(255, 234, 0, 0.62)");
      setImportant(node, "--seg-card-border-hover", "rgba(255, 234, 0, 0.9)");
      setImportant(node, "--seg-card-border-selected", "rgba(255, 234, 0, 0.94)");
      setImportant(node, "--seg-card-border-active", "rgba(255, 234, 0, 0.95)");
      setImportant(node, "--seg-card-text", "var(--hc-accent)");
      setImportant(node, "--seg-card-text-hover", "var(--hc-accent)");
      setImportant(node, "--seg-card-text-selected", "var(--hc-accent)");
      setImportant(node, "color", "var(--hc-accent)");
      setImportant(
        node,
        "background",
        checked ? "rgba(255, 234, 0, 0.1)" : hcButtonBg
      );
      setImportant(
        node,
        "border",
        checked
          ? "2px solid rgba(255, 234, 0, 0.94)"
          : "2px solid rgba(255, 234, 0, 0.62)"
      );
      setImportant(
        node,
        "box-shadow",
        checked
          ? "0 0 0 1px rgba(255, 234, 0, 0.64)"
          : hcButtonShadow
      );
    });

    tooltipNodes.forEach(node => {
      setImportant(node, "color", "var(--hc-accent)");
      setImportant(node, "border", "2px solid rgba(255, 234, 0, 0.72)");
      setImportant(node, "box-shadow", "none");
    });

    return undefined;
  }, [
    analysisCollapsed,
    analysisPanelRef,
    contextHintOpen,
    docOnlyMode,
    isHighContrast,
    previewText,
    uploadPreview
  ]);
  const handlePreviewTouchStart = event => {
    const touch = event.touches?.[0];
    touchStartYRef.current = touch?.clientY ?? null;
  };
  const handlePreviewTouchMove = event => {
    if (isMobileViewport) return;
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
    "chat-analysis-panel-card w-full max-w-none rounded-[1.55rem] border-0 " +
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
    "w-full min-w-0 text-center pt-[0.1rem] px-[0.2rem] pl-[3rem] pr-[3rem] " +
    "max-[768px]:pl-[3.3rem] max-[768px]:pr-[3.3rem]";
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
    "mx-auto inline-flex w-fit items-center justify-center gap-[0.5rem] flex-nowrap self-center";
  const actionsInlineClassName =
    "w-full flex justify-center gap-[0.65rem] mt-[0.35rem] mb-[0.5rem]";
  const uploadButtonClassName =
    `documents-primary-button documents-primary-button--compact documents-upload-choose-button ${glassPrimaryButtonToneClassName}`;
  const invitePrimaryButtonClassName =
    "!min-h-[3.05rem] !px-[1.15rem] !py-[0.78rem] !text-[1.12rem] !tracking-[0.03rem] " +
    "max-[768px]:!min-h-[3.2rem] max-[768px]:!text-[1.18rem]";
  const actionPrimaryButtonClassName =
    `${invitePrimaryButtonClassName} invite-primary-btn chat-analysis-action-btn`;
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
    "[--analysis-preview-fade-top:clamp(1.45rem,3.2vh,2.25rem)] " +
    "[--analysis-preview-fade-bottom:clamp(1.7rem,3.5vh,2.45rem)] " +
    "overflow-y-auto overflow-x-hidden overscroll-contain [-webkit-overflow-scrolling:touch] [overscroll-behavior-x:none] [overscroll-behavior-y:contain] [touch-action:pan-y] " +
    "text-[1.18rem] leading-[1.92] tracking-[0.02em] " +
    "text-[color:var(--glass-surface-text,#f2f2f2)] whitespace-pre-wrap [overflow-wrap:anywhere] break-words scrollbar-none " +
    "[mask-image:linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.08)_calc(var(--analysis-preview-fade-top)*0.16),rgba(0,0,0,0.28)_calc(var(--analysis-preview-fade-top)*0.38),rgba(0,0,0,0.62)_calc(var(--analysis-preview-fade-top)*0.68),rgba(0,0,0,0.9)_calc(var(--analysis-preview-fade-top)*0.9),#000_var(--analysis-preview-fade-top),#000_calc(100%-var(--analysis-preview-fade-bottom)),rgba(0,0,0,0.92)_calc(100%-(var(--analysis-preview-fade-bottom)*0.86)),rgba(0,0,0,0.68)_calc(100%-(var(--analysis-preview-fade-bottom)*0.62)),rgba(0,0,0,0.34)_calc(100%-(var(--analysis-preview-fade-bottom)*0.34)),rgba(0,0,0,0.1)_calc(100%-(var(--analysis-preview-fade-bottom)*0.12)),transparent_100%)] " +
    "[-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.08)_calc(var(--analysis-preview-fade-top)*0.16),rgba(0,0,0,0.28)_calc(var(--analysis-preview-fade-top)*0.38),rgba(0,0,0,0.62)_calc(var(--analysis-preview-fade-top)*0.68),rgba(0,0,0,0.9)_calc(var(--analysis-preview-fade-top)*0.9),#000_var(--analysis-preview-fade-top),#000_calc(100%-var(--analysis-preview-fade-bottom)),rgba(0,0,0,0.92)_calc(100%-(var(--analysis-preview-fade-bottom)*0.86)),rgba(0,0,0,0.68)_calc(100%-(var(--analysis-preview-fade-bottom)*0.62)),rgba(0,0,0,0.34)_calc(100%-(var(--analysis-preview-fade-bottom)*0.34)),rgba(0,0,0,0.1)_calc(100%-(var(--analysis-preview-fade-bottom)*0.12)),transparent_100%)] " +
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
    `${docToggleCardClassName} chat-analysis-help-btn !my-0 !min-w-[2.72rem] !justify-center !self-center !rounded-full !px-0 [&>span.shrink-0]:hidden [&>span:last-child]:flex-none [&>span:last-child]:justify-center`;
  const tooltipClassName =
    "fixed z-[9999] rounded-[0.95rem] px-[0.9rem] py-[0.85rem] text-center " +
    "min-w-[14rem] max-w-[min(18rem,calc(100vw-1.2rem))] " +
    "[background:var(--chat-analysis-hint-bg,var(--chat-tools-panel-bg,var(--opaque-panel-bg,var(--rail-tooltip-bg,var(--subpage-card-bg)))))] " +
    "text-[color:var(--chat-analysis-hint-text,var(--opaque-panel-text,var(--rail-tooltip-text,var(--glass-surface-text,#f2f2f2))))] " +
    "text-[0.98rem] leading-[1.42] tracking-[0.01em] " +
    "border hc:border-2 border-[color:var(--chat-analysis-hint-border,var(--rail-tooltip-border,var(--chat-tools-panel-border,var(--opaque-panel-border,rgba(255,255,255,0.12)))))] " +
    "shadow-[var(--chat-analysis-hint-shadow,var(--opaque-panel-shadow,var(--rail-tooltip-shadow,0_12px_26px_rgba(0,0,0,0.22))))] " +
    "backdrop-blur-0 backdrop-saturate-100 [backdrop-filter:none] [-webkit-backdrop-filter:none] " +
    "max-[768px]:min-w-[min(18rem,calc(100vw-1.2rem))] max-[768px]:max-w-[calc(100vw-1.2rem)] " +
    "max-[768px]:max-h-[calc(100dvh-8rem)] max-[768px]:overflow-y-auto max-[768px]:text-[0.95rem]";
  const contextHintPopover =
    contextHintOpen && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={contextHintPopoverRef}
            role="dialog"
            aria-modal="false"
            aria-label={contextHint}
            className={`${tooltipClassName} chat-analysis-overlay-hint`}
            style={
              contextHintPlacement
                ? {
                    top: `${contextHintPlacement.top}px`,
                    left: `${contextHintPlacement.left}px`,
                    width: `${contextHintPlacement.width}px`,
                    transform: "translateX(-50%)",
                    ...contextHintPlacement.surfaceVars
                  }
                : {
                    top: "-10000px",
                    left: "-10000px",
                    width: "min(18rem, calc(100vw - 1.2rem))",
                    transform: "translateX(-50%)"
                  }
            }
          >
            {contextHint}
          </div>,
          document.body
        )
      : null;
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
                <div
                  ref={contextHintWrapRef}
                  className="relative z-[999] inline-flex w-fit shrink-0 items-center self-center"
                >
                  <OptionCard
                    type="checkbox"
                    checked={contextHintOpen}
                    onChange={() => setContextHintOpen(prev => !prev)}
                    className={contextButtonClassName}
                    aria-label={contextHint}
                    aria-expanded={contextHintOpen ? "true" : "false"}
                    aria-describedby={contextHintOpen ? "chat-upload-context-hint" : undefined}
                  >
                    ?
                  </OptionCard>
                </div>
              </div>
              </div>
              <p id="chat-upload-context-hint" className="sr-only">
                {contextHint}
              </p>
              {contextHintPopover}
              {previewText ? (
                <div className={actionsInlineClassName}>
                  <Button
                    type="button"
                    size="md"
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
                    size="md"
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

