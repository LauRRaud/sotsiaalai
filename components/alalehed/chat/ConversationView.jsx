"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { SourcesIcon } from "@/components/ui/icons/ChatIcons";

const LINE_SCROLL_STEP = 34;
const PAGE_SCROLL_RATIO = 0.72;

function isInteractiveTarget(target) {
  return (
    target instanceof Element &&
    Boolean(
      target.closest(
        "a, button, input, textarea, select, summary, [role='button'], [contenteditable='true']"
      )
    )
  );
}

const ConversationView = memo(function ConversationView({
  t,
  chatWindowRef,
  isStreamingAny,
  hiddenCount,
  pageSize,
  onRevealOlder,
  canHideOlder,
  onHideOlder,
  onJumpToBottom,
  messageItems,
  windowClassName: windowClassNameProp,
  mainClassName: mainClassNameProp,
  onWindowDoubleClick,
  isMobile = false,
  isRoomMode = false,
  isLightTheme = false,
  hasConversationSources = false,
  conversationSourcesCount = 0,
  toggleSourcesPanel,
  showSourcesPanel = false,
  sourcesPulse = false,
  sourcesButtonRef
}) {
  const [showScrollDown, setShowScrollDown] = useState(false);
  const isUserAtBottom = useRef(true);
  const mountedRef = useRef(false);
  const contentEndRef = useRef(null);
  const revealOlderLockRef = useRef(false);
  const hiddenCountRef = useRef(hiddenCount);
  const onRevealOlderRef = useRef(onRevealOlder);
  useEffect(() => {
    hiddenCountRef.current = hiddenCount;
    revealOlderLockRef.current = false;
  }, [hiddenCount]);
  useEffect(() => {
    onRevealOlderRef.current = onRevealOlder;
  }, [onRevealOlder]);
  const updateScrollState = useCallback(() => {
    const node = chatWindowRef?.current;
    if (!node) {
      isUserAtBottom.current = true;
      setShowScrollDown(false);
      return;
    }
    const maxScrollable = Math.max(0, node.scrollHeight - node.clientHeight);
    const hasOverflow = maxScrollable > 8;
    let hasHiddenContentBelow = hasOverflow;
    const contentEndNode = contentEndRef.current;
    if (contentEndNode) {
      const viewportBottom = node.getBoundingClientRect().bottom;
      const contentBottom = contentEndNode.getBoundingClientRect().bottom;
      hasHiddenContentBelow = contentBottom - viewportBottom > 12;
    }
    const atBottom = !hasOverflow || !hasHiddenContentBelow;
    isUserAtBottom.current = atBottom;
    setShowScrollDown(hasOverflow && hasHiddenContentBelow);

    const nearTopThreshold = Math.max(48, node.clientHeight * 0.08);
    if (
      hiddenCountRef.current > 0 &&
      node.scrollTop <= nearTopThreshold &&
      !revealOlderLockRef.current
    ) {
      revealOlderLockRef.current = true;
      onRevealOlderRef.current?.();
    }
  }, [chatWindowRef]);
  useEffect(() => {
    const node = chatWindowRef?.current;
    if (!node) return;
    function handleScroll() {
      updateScrollState();
    }
    node.addEventListener("scroll", handleScroll, {
      passive: true
    });
    const frame = window.requestAnimationFrame(updateScrollState);
    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            updateScrollState();
          })
        : null;
    resizeObserver?.observe(node);
    if (contentEndRef.current) {
      resizeObserver?.observe(contentEndRef.current);
    }
    window.addEventListener("resize", updateScrollState);
    return () => {
      node.removeEventListener("scroll", handleScroll);
      window.cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateScrollState);
    };
  }, [chatWindowRef, updateScrollState]);
  useEffect(() => {
    const node = chatWindowRef?.current;
    if (!node) return;

    const shouldStickToBottom = !mountedRef.current || isUserAtBottom.current;

    if (shouldStickToBottom) {
      const frame = window.requestAnimationFrame(() => {
        node.scrollTop = node.scrollHeight;
        isUserAtBottom.current = true;
        updateScrollState();
      });
      return () => window.cancelAnimationFrame(frame);
    }

    updateScrollState();
  }, [chatWindowRef, messageItems, hiddenCount, canHideOlder, updateScrollState]);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  const focusScrollArea = useCallback(event => {
    if (isInteractiveTarget(event.target)) return;
    const node = event.currentTarget;
    if (node instanceof HTMLElement && document.activeElement !== node) {
      node.focus({ preventScroll: true });
    }
  }, []);
  const handleScrollKeyDown = useCallback(event => {
    const node = event.currentTarget;
    if (!(node instanceof HTMLElement) || node.scrollHeight <= node.clientHeight) return;

    const pageStep = Math.max(
      LINE_SCROLL_STEP * 3,
      Math.round(node.clientHeight * PAGE_SCROLL_RATIO)
    );

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        node.scrollBy({ top: LINE_SCROLL_STEP });
        break;
      case "ArrowUp":
        event.preventDefault();
        node.scrollBy({ top: -LINE_SCROLL_STEP });
        break;
      case "PageDown":
        event.preventDefault();
        node.scrollBy({ top: pageStep });
        break;
      case "PageUp":
        event.preventDefault();
        node.scrollBy({ top: -pageStep });
        break;
      case "Home":
        event.preventDefault();
        node.scrollTo({ top: 0 });
        break;
      case "End":
        event.preventDefault();
        node.scrollTo({ top: node.scrollHeight });
        break;
      case " ":
        event.preventDefault();
        node.scrollBy({ top: event.shiftKey ? -pageStep : pageStep });
        break;
      default:
        break;
    }
  }, []);
  const mainClassName =
    "conversation-view relative flex flex-1 flex-col min-h-0 w-full " +
    "transition-[transform,margin-bottom] duration-[400ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] max-[768px]:transition-none";
  const mergedMainClassName = mainClassNameProp ? `${mainClassName} ${mainClassNameProp}` : mainClassName;
  const windowClassName =
    "chat-window relative flex flex-1 min-h-0 flex-col items-stretch gap-[0.75rem] " +
    "mt-[var(--chat-window-top-offset,0rem)] max-[768px]:flex-none max-[768px]:h-[calc(100%-var(--chat-window-bottom-gap,0rem)-var(--chat-vk-offset,0px)+var(--chat-window-mobile-extra-height,0rem))] max-[768px]:mb-[calc(var(--chat-window-bottom-gap,0rem)+var(--chat-vk-offset,0px))] max-h-[calc(100%-var(--chat-window-top-offset,0rem)-var(--chat-window-bottom-gap,0rem))] " +
    "[--chat-window-corner:clamp(0.9rem,2.2vw,1.4rem)] [--chat-window-curve-x:var(--chat-window-curve-x,var(--chat-window-corner))] [--chat-window-curve-y:var(--chat-window-curve-y,var(--chat-window-corner))] [--chat-window-curve-y-left:var(--chat-window-curve-y-left,var(--chat-window-corner))] [--chat-window-curve-y-right:var(--chat-window-curve-y-right,var(--chat-window-corner))] " +
    "[--chat-window-pad-x:var(--chat-window-pad-x,clamp(0.6rem,1.8vw,1.35rem))] [--chat-window-pad-top:var(--chat-window-pad-top,clamp(1.8rem,4vh,3rem))] " +
    "[--chat-window-bottom-safe:clamp(1.2rem,2.8vh,2.4rem)] [--chat-window-fade-top-default:2.15rem] " +
    "[--chat-window-fade-top-focus-default:2.75rem] [--chat-window-fade-top-focus:var(--chat-window-fade-top-focus-default)] [--chat-window-fade-top-active:var(--chat-window-fade-top,var(--chat-window-fade-top-default))] " +
    "[--chat-window-fade-bottom-default:clamp(1.62rem,4.9vh,2.68rem)] [--chat-window-fade-bottom-focus-default:clamp(2.32rem,6.3vh,3.88rem)] [--chat-window-fade-bottom-focus:var(--chat-window-fade-bottom-focus-default)] [--chat-window-fade-bottom-active:var(--chat-window-fade-bottom,var(--chat-window-fade-bottom-default))] " +
    "[--chat-window-top-glaze-h:clamp(5rem,14vh,9rem)] [--chat-window-top-glaze-alpha:0.6] " +
    "[--chat-window-side-fade-in:18%] [--chat-window-side-fade-band:clamp(3.2rem,11vh,7rem)] " +
    "[--chat-arc-fade-width:84%] [--chat-arc-fade-depth:74%] [--chat-arc-rgb:14_18_28] [--chat-arc-center-alpha:0.14] [--chat-arc-side-alpha:0.3] [--chat-arc-mid-alpha:0.11] " +
    "[--chat-window-scroll-top-fade-start-default:1.08rem] [--chat-window-scroll-top-fade-start-focus-default:1.18rem] [--chat-window-scroll-top-fade-start-focus:var(--chat-window-scroll-top-fade-start-focus-default)] [--chat-window-scroll-top-fade-start-active:var(--chat-window-scroll-top-fade-start,var(--chat-window-scroll-top-fade-start-default))] " +
    "[--chat-window-scroll-top-fade-mid-default:2.08rem] [--chat-window-scroll-top-fade-mid-focus-default:2.5rem] [--chat-window-scroll-top-fade-mid-focus:var(--chat-window-scroll-top-fade-mid-focus-default)] [--chat-window-scroll-top-fade-mid-active:var(--chat-window-scroll-top-fade-mid,var(--chat-window-scroll-top-fade-mid-default))] " +
    "[--chat-window-scroll-top-fade-end-default:3.28rem] [--chat-window-scroll-top-fade-end-focus-default:3.95rem] [--chat-window-scroll-top-fade-end-focus:var(--chat-window-scroll-top-fade-end-focus-default)] [--chat-window-scroll-top-fade-end-active:var(--chat-window-scroll-top-fade-end,var(--chat-window-scroll-top-fade-end-default))] " +
    "[border-radius:var(--chat-window-curve-x)_var(--chat-window-curve-x)_var(--chat-window-corner)_var(--chat-window-corner)_/_var(--chat-window-curve-y-left)_var(--chat-window-curve-y-right)_var(--chat-window-corner)_var(--chat-window-corner)] " +
    "bg-transparent border-0 shadow-none isolate overflow-hidden " +
    "w-full max-w-[var(--chat-window-max-w,calc(100%-var(--right-rail-width,clamp(4.6rem,8vw,5.8rem))-clamp(1.4rem,3vw,2.2rem)))] mx-auto " +
    "[transform:translateX(var(--chat-window-shift-x,0rem))_translateY(var(--chat-window-shift-y,0rem))] " +
    "max-[768px]:[--chat-window-curve-x:var(--chat-window-corner)] max-[768px]:[--chat-window-curve-y:var(--chat-window-corner)] max-[768px]:[--chat-window-curve-y-left:var(--chat-window-corner)] max-[768px]:[--chat-window-curve-y-right:var(--chat-window-corner)] " +
    "light:[--chat-arc-rgb:210_214_222] light:[--chat-arc-center-alpha:0.1] light:[--chat-arc-side-alpha:0.24] light:[--chat-arc-mid-alpha:0.09] " +
    "transition-[padding-top,padding-bottom,margin-top,max-height,max-width,transform] duration-[400ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] " +
    "max-[768px]:w-[calc(100%+var(--chat-window-mobile-width-right,0rem))] max-[768px]:max-w-none max-[768px]:mx-0 max-[768px]:mr-auto max-[768px]:transition-none";
  const roomModeWindowTuningClassName =
    isRoomMode
      ? "[--chat-window-pad-top:clamp(0.72rem,1.8vh,1.18rem)] [--chat-window-fade-top-default:0.72rem] [--chat-window-fade-top-focus-default:0.88rem] " +
        "[--chat-window-scroll-top-fade-start-default:0.12rem] [--chat-window-scroll-top-fade-mid-default:0.58rem] [--chat-window-scroll-top-fade-end-default:1.04rem] " +
        "max-[768px]:[--chat-window-pad-top:clamp(0.54rem,1.4vh,0.9rem)] max-[768px]:[--chat-window-fade-top-default:0.56rem] " +
        "max-[768px]:[--chat-window-scroll-top-fade-start-default:0.08rem] max-[768px]:[--chat-window-scroll-top-fade-mid-default:0.4rem] max-[768px]:[--chat-window-scroll-top-fade-end-default:0.82rem]"
      : "";
  const scrollClassName =
    "chat-window__scroll relative z-[1] h-full flex flex-col items-stretch gap-[0.75rem] flex-1 min-h-0 overflow-y-auto overscroll-contain " +
    "[-webkit-overflow-scrolling:touch] [scrollbar-width:none] [scrollbar-color:transparent_transparent] " +
    "[mask-image:linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.002)_calc(var(--chat-window-fade-top-active)*0.03+var(--chat-window-scroll-top-fade-start-active)*0.12),rgba(0,0,0,0.007)_calc(var(--chat-window-fade-top-active)*0.08+var(--chat-window-scroll-top-fade-start-active)*0.26),rgba(0,0,0,0.016)_calc(var(--chat-window-fade-top-active)*0.14+var(--chat-window-scroll-top-fade-start-active)*0.42),rgba(0,0,0,0.032)_calc(var(--chat-window-fade-top-active)*0.22+var(--chat-window-scroll-top-fade-start-active)*0.62),rgba(0,0,0,0.056)_calc(var(--chat-window-fade-top-active)*0.34+var(--chat-window-scroll-top-fade-mid-active)*0.34),rgba(0,0,0,0.088)_calc(var(--chat-window-fade-top-active)*0.48+var(--chat-window-scroll-top-fade-mid-active)*0.54),rgba(0,0,0,0.136)_calc(var(--chat-window-fade-top-active)*0.64+var(--chat-window-scroll-top-fade-mid-active)*0.76),rgba(0,0,0,0.208)_calc(var(--chat-window-fade-top-active)*0.82+var(--chat-window-scroll-top-fade-end-active)*0.52),rgba(0,0,0,0.308)_calc(var(--chat-window-fade-top-active)*0.98+var(--chat-window-scroll-top-fade-end-active)*0.68),rgba(0,0,0,0.44)_calc(var(--chat-window-fade-top-active)*1.14+var(--chat-window-scroll-top-fade-end-active)*0.84),rgba(0,0,0,0.61)_calc(var(--chat-window-fade-top-active)*1.28+var(--chat-window-scroll-top-fade-end-active)*0.98),rgba(0,0,0,0.8)_calc(var(--chat-window-fade-top-active)*1.42+var(--chat-window-scroll-top-fade-end-active)*1.06),#000_calc(var(--chat-window-fade-top-active)*1.58+var(--chat-window-scroll-top-fade-end-active)*1.14),#000_calc(100%-(var(--chat-window-fade-bottom-active)*1.22)),rgba(0,0,0,0.92)_calc(100%-(var(--chat-window-fade-bottom-active)*0.98)),rgba(0,0,0,0.74)_calc(100%-(var(--chat-window-fade-bottom-active)*0.78)),rgba(0,0,0,0.5)_calc(100%-(var(--chat-window-fade-bottom-active)*0.56)),rgba(0,0,0,0.28)_calc(100%-(var(--chat-window-fade-bottom-active)*0.34)),rgba(0,0,0,0.11)_calc(100%-(var(--chat-window-fade-bottom-active)*0.16)),transparent_100%)] " +
    "[-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.002)_calc(var(--chat-window-fade-top-active)*0.03+var(--chat-window-scroll-top-fade-start-active)*0.12),rgba(0,0,0,0.007)_calc(var(--chat-window-fade-top-active)*0.08+var(--chat-window-scroll-top-fade-start-active)*0.26),rgba(0,0,0,0.016)_calc(var(--chat-window-fade-top-active)*0.14+var(--chat-window-scroll-top-fade-start-active)*0.42),rgba(0,0,0,0.032)_calc(var(--chat-window-fade-top-active)*0.22+var(--chat-window-scroll-top-fade-start-active)*0.62),rgba(0,0,0,0.056)_calc(var(--chat-window-fade-top-active)*0.34+var(--chat-window-scroll-top-fade-mid-active)*0.34),rgba(0,0,0,0.088)_calc(var(--chat-window-fade-top-active)*0.48+var(--chat-window-scroll-top-fade-mid-active)*0.54),rgba(0,0,0,0.136)_calc(var(--chat-window-fade-top-active)*0.64+var(--chat-window-scroll-top-fade-mid-active)*0.76),rgba(0,0,0,0.208)_calc(var(--chat-window-fade-top-active)*0.82+var(--chat-window-scroll-top-fade-end-active)*0.52),rgba(0,0,0,0.308)_calc(var(--chat-window-fade-top-active)*0.98+var(--chat-window-scroll-top-fade-end-active)*0.68),rgba(0,0,0,0.44)_calc(var(--chat-window-fade-top-active)*1.14+var(--chat-window-scroll-top-fade-end-active)*0.84),rgba(0,0,0,0.61)_calc(var(--chat-window-fade-top-active)*1.28+var(--chat-window-scroll-top-fade-end-active)*0.98),rgba(0,0,0,0.8)_calc(var(--chat-window-fade-top-active)*1.42+var(--chat-window-scroll-top-fade-end-active)*1.06),#000_calc(var(--chat-window-fade-top-active)*1.58+var(--chat-window-scroll-top-fade-end-active)*1.14),#000_calc(100%-(var(--chat-window-fade-bottom-active)*1.22)),rgba(0,0,0,0.92)_calc(100%-(var(--chat-window-fade-bottom-active)*0.98)),rgba(0,0,0,0.74)_calc(100%-(var(--chat-window-fade-bottom-active)*0.78)),rgba(0,0,0,0.5)_calc(100%-(var(--chat-window-fade-bottom-active)*0.56)),rgba(0,0,0,0.28)_calc(100%-(var(--chat-window-fade-bottom-active)*0.34)),rgba(0,0,0,0.11)_calc(100%-(var(--chat-window-fade-bottom-active)*0.16)),transparent_100%)] " +
    "max-[768px]:[mask-image:linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.18)_calc(var(--chat-window-fade-top-active)*0.16),rgba(0,0,0,0.52)_calc(var(--chat-window-fade-top-active)*0.42),rgba(0,0,0,0.82)_calc(var(--chat-window-fade-top-active)*0.72),#000_calc(var(--chat-window-fade-top-active)*1.02),#000_calc(100%-(var(--chat-window-fade-bottom-active)*1.02)),rgba(0,0,0,0.82)_calc(100%-(var(--chat-window-fade-bottom-active)*0.72)),rgba(0,0,0,0.52)_calc(100%-(var(--chat-window-fade-bottom-active)*0.42)),rgba(0,0,0,0.18)_calc(100%-(var(--chat-window-fade-bottom-active)*0.16)),transparent_100%)] " +
    "max-[768px]:[-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.18)_calc(var(--chat-window-fade-top-active)*0.16),rgba(0,0,0,0.52)_calc(var(--chat-window-fade-top-active)*0.42),rgba(0,0,0,0.82)_calc(var(--chat-window-fade-top-active)*0.72),#000_calc(var(--chat-window-fade-top-active)*1.02),#000_calc(100%-(var(--chat-window-fade-bottom-active)*1.02)),rgba(0,0,0,0.82)_calc(100%-(var(--chat-window-fade-bottom-active)*0.72)),rgba(0,0,0,0.52)_calc(100%-(var(--chat-window-fade-bottom-active)*0.42)),rgba(0,0,0,0.18)_calc(100%-(var(--chat-window-fade-bottom-active)*0.16)),transparent_100%)] " +
    "[mask-size:100%_100%] [-webkit-mask-size:100%_100%] [mask-repeat:no-repeat] [-webkit-mask-repeat:no-repeat] " +
    "[&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0 " +
    "[&::-webkit-scrollbar-thumb]:bg-[linear-gradient(135deg,var(--pt-400),var(--pt-200))] [&::-webkit-scrollbar-thumb]:rounded-[0.625rem] [&::-webkit-scrollbar-thumb]:border-[0.1875rem] [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent " +
    "[&::-webkit-scrollbar-track]:bg-transparent " +
    "transition-[padding] duration-[400ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] will-change-[padding] " +
    "[padding:calc(var(--chat-window-pad-top)+var(--chat-window-top-safe)+var(--chat-window-fade-top-active)*0.28+var(--chat-content-top-offset,0rem))_var(--chat-window-pad-x)_calc(var(--chat-window-pad-bottom)+var(--chat-window-bottom-safe)+var(--chat-window-fade-bottom-active)+var(--chat-vk-offset,0px))] " +
    "[scroll-padding-top:calc(var(--chat-window-pad-top)+var(--chat-window-top-safe)+var(--chat-window-fade-top-active)*0.28+var(--chat-content-top-offset,0rem))] " +
    "[scroll-padding-bottom:calc(var(--chat-window-pad-bottom)+var(--chat-window-bottom-safe)+var(--chat-window-fade-bottom-active)+var(--chat-vk-offset,0px))] max-[768px]:transition-none";
  const mergedWindowClassName = `${windowClassName} ${roomModeWindowTuningClassName} ${windowClassNameProp || ""}`.trim();
  const scrollButtonClassName =
    "chat-scroll-down-btn absolute left-1/2 -translate-x-1/2 bottom-[calc(0.85rem+var(--chat-scroll-down-offset,0rem))] " +
    "bg-transparent border-0 p-[0.375rem] cursor-[var(--cursor-pointer)] z-[5] " +
    "flex items-center justify-center transition-[transform,bottom] duration-[400ms] " +
    "hover:scale-[1.15] focus-visible:scale-[1.15]";
  const scrollIconClassName =
    "chat-scroll-down-icon h-[2.25rem] w-[2.25rem] fill-none stroke-[#c57171] " +
    "transition-[stroke] duration-200 light:stroke-[#7a3a38]";
  const buttonClassName =
    "mx-auto rounded-full border border-[rgba(148,163,184,0.35)] bg-[rgba(10,14,24,0.35)] " +
    "px-[1rem] py-[0.4rem] text-[0.85rem] font-semibold text-[color:var(--pt-120)] " +
    "transition-[border-color,background,transform] duration-150 hover:-translate-y-[1px] " +
    "light:border-[rgba(148,163,184,0.5)] light:bg-[rgba(255,255,255,0.9)] light:text-[#1f2937]";
  return <main className={mergedMainClassName}>
      <div id="chat-window" className={mergedWindowClassName} onDoubleClick={onWindowDoubleClick}>
        <div id="chat-window-scroll" className={scrollClassName} ref={chatWindowRef} role="region" aria-label={t("chat.aria.messages")} aria-live="polite" aria-busy={isStreamingAny ? "true" : "false"} tabIndex={0} onKeyDown={handleScrollKeyDown} onMouseDown={focusScrollArea} onWheel={focusScrollArea}>
          <div aria-hidden="true" className={isMobile ? `shrink-0 ${isRoomMode ? "h-[0.18rem]" : "h-[var(--chat-content-spacer,0.55rem)]"} transition-[height] duration-[400ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] max-[768px]:transition-none` : `shrink-0 ${isRoomMode ? "h-[0.24rem]" : "h-[calc(var(--chat-content-spacer,1.6rem)+0.8rem)]"} transition-[height] duration-[400ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] max-[768px]:transition-none`} />

          {hiddenCount > 0 ? <div className="flex justify-center">
              <button type="button" onClick={onRevealOlder} className={buttonClassName}>
                {t("chat.show_older")} (+{Math.min(pageSize, hiddenCount)}){" "}
                {hiddenCount} {t("chat.left")}
              </button>
            </div> : null}

          {messageItems}

          {canHideOlder ? <div className="flex justify-center">
              <button type="button" onClick={onHideOlder} className={buttonClassName}>
                {t("chat.show_recent")}
              </button>
            </div> : null}

          <div ref={contentEndRef} aria-hidden="true" className="h-0 w-full shrink-0" />
          <div aria-hidden="true" className={isMobile ? "shrink-0 h-[var(--chat-content-bottom-spacer,0.85rem)] transition-[height] duration-[400ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] max-[768px]:transition-none" : "shrink-0 h-[var(--chat-content-bottom-spacer,0rem)] transition-[height] duration-[400ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] max-[768px]:transition-none"} />
        </div>
        {isMobile && hasConversationSources ? <button
            ref={sourcesButtonRef}
            type="button"
            className="chat-sources-floating-btn group absolute right-[clamp(0.35rem,2vw,0.65rem)] top-[clamp(0.35rem,2vw,0.65rem)] z-[6] h-[2.9rem] w-[2.9rem] rounded-full border-0 bg-transparent p-0 shadow-none outline-none"
            aria-label={t("chat.sources.button").replace("{count}", String(conversationSourcesCount))}
            aria-haspopup="dialog"
            aria-expanded={showSourcesPanel ? "true" : "false"}
            aria-controls="chat-sources-panel"
            onClick={() => {
            toggleSourcesPanel?.();
          }}
          >
            <SourcesIcon isLightTheme={isLightTheme} className={`h-[2.7rem] w-[2.7rem] transition-transform duration-150 group-hover:scale-110 group-focus-visible:scale-110 ${sourcesPulse ? "opacity-100" : "opacity-88"}`} />
          </button> : null}
      </div>

      {showScrollDown ? <button className={scrollButtonClassName} onClick={onJumpToBottom} aria-label={t("chat.scroll_to_bottom")} title={t("chat.scroll_to_bottom_title")} aria-controls="chat-window-scroll">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={scrollIconClassName}>
            <path d="M4 9l8 8 8-8" />
          </svg>
        </button> : null}
    </main>;
});
export default ConversationView;
