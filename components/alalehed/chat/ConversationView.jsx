"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { SourcesIcon } from "@/components/ui/icons/ChatIcons";

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
  const mainClassName =
    "conversation-view relative flex flex-1 flex-col min-h-0 w-full " +
    "transition-[transform,margin-bottom] duration-[400ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] max-[768px]:transition-none";
  const mergedMainClassName = mainClassNameProp ? `${mainClassName} ${mainClassNameProp}` : mainClassName;
  const windowClassName =
    "chat-window relative flex flex-1 min-h-0 flex-col items-stretch gap-[0.75rem] " +
    "mt-[var(--chat-window-top-offset,0rem)] max-[768px]:flex-none max-[768px]:h-[calc(100%-var(--chat-window-bottom-gap,0rem)-var(--chat-vk-offset,0px)+var(--chat-window-mobile-extra-height,0rem))] max-[768px]:mb-[calc(var(--chat-window-bottom-gap,0rem)+var(--chat-vk-offset,0px))] max-h-[calc(100%-var(--chat-window-top-offset,0rem)-var(--chat-window-bottom-gap,0rem))] " +
    "[--chat-window-corner:clamp(0.9rem,2.2vw,1.4rem)] [--chat-window-curve-x:100%] [--chat-window-curve-y:72%] [--chat-window-curve-y-left:calc(var(--chat-window-curve-y)-2%)] [--chat-window-curve-y-right:calc(var(--chat-window-curve-y)+2%)] " +
    "[--chat-window-pad-x:var(--chat-window-pad-x,clamp(0.6rem,1.8vw,1.35rem))] [--chat-window-pad-top:var(--chat-window-pad-top,clamp(1.8rem,4vh,3rem))] " +
    "[--chat-window-bottom-safe:clamp(1.2rem,2.8vh,2.4rem)] [--chat-window-fade-top-default:1.35rem] " +
    "[--chat-window-fade-top-focus-default:2.1rem] [--chat-window-fade-top-focus:var(--chat-window-fade-top-focus-default)] [--chat-window-fade-top-active:var(--chat-window-fade-top,var(--chat-window-fade-top-default))] " +
    "[--chat-window-fade-bottom-default:clamp(2.2rem,7vh,4rem)] [--chat-window-fade-bottom-focus-default:clamp(3rem,9vh,5rem)] [--chat-window-fade-bottom-focus:var(--chat-window-fade-bottom-focus-default)] [--chat-window-fade-bottom-active:var(--chat-window-fade-bottom,var(--chat-window-fade-bottom-default))] " +
    "[--chat-window-top-glaze-h:clamp(5rem,14vh,9rem)] [--chat-window-top-glaze-alpha:0.6] " +
    "[--chat-window-side-fade-in:18%] [--chat-window-side-fade-band:clamp(3.2rem,11vh,7rem)] " +
    "[--chat-arc-fade-width:84%] [--chat-arc-fade-depth:74%] [--chat-arc-rgb:14_18_28] [--chat-arc-center-alpha:0.14] [--chat-arc-side-alpha:0.3] [--chat-arc-mid-alpha:0.11] " +
    "[--chat-window-scroll-top-fade-start:1.5rem] [--chat-window-scroll-top-fade-mid:2.9rem] [--chat-window-scroll-top-fade-end:4.5rem] " +
    "[--chat-window-top-text-fade:calc(var(--chat-window-fade-top-active)+var(--chat-window-top-text-fade-extra,5.6rem))] " +
    "[border-radius:var(--chat-window-curve-x)_var(--chat-window-curve-x)_var(--chat-window-corner)_var(--chat-window-corner)_/_var(--chat-window-curve-y-left)_var(--chat-window-curve-y-right)_var(--chat-window-corner)_var(--chat-window-corner)] " +
    "[mask-image:linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.34)_calc(var(--chat-window-top-text-fade)*0.52),rgba(0,0,0,0.84)_calc(var(--chat-window-top-text-fade)*0.86),#000_var(--chat-window-top-text-fade),#000_100%)] " +
    "[-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.34)_calc(var(--chat-window-top-text-fade)*0.52),rgba(0,0,0,0.84)_calc(var(--chat-window-top-text-fade)*0.86),#000_var(--chat-window-top-text-fade),#000_100%)] " +
    "[mask-size:100%_100%] [-webkit-mask-size:100%_100%] [mask-repeat:no-repeat] [-webkit-mask-repeat:no-repeat] " +
    "bg-transparent border-0 shadow-none isolate overflow-hidden " +
    "w-full max-w-[var(--chat-window-max-w,calc(100%-var(--right-rail-width,clamp(4.6rem,8vw,5.8rem))-clamp(1.4rem,3vw,2.2rem)))] mx-auto " +
    "[transform:translateX(var(--chat-window-shift-x,0rem))_translateY(var(--chat-window-shift-y,0rem))] " +
    "max-[768px]:[--chat-window-curve-x:var(--chat-window-corner)] max-[768px]:[--chat-window-curve-y:var(--chat-window-corner)] max-[768px]:[--chat-window-curve-y-left:var(--chat-window-corner)] max-[768px]:[--chat-window-curve-y-right:var(--chat-window-corner)] " +
    "light:[--chat-arc-rgb:210_214_222] light:[--chat-arc-center-alpha:0.1] light:[--chat-arc-side-alpha:0.24] light:[--chat-arc-mid-alpha:0.09] " +
    "transition-[padding-top,padding-bottom,margin-top,max-height,max-width,transform] duration-[400ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] " +
    "max-[768px]:w-[calc(100%+var(--chat-window-mobile-width-right,0rem))] max-[768px]:max-w-none max-[768px]:mx-0 max-[768px]:mr-auto max-[768px]:transition-none";
  const scrollClassName =
    "chat-window__scroll relative z-[1] h-full flex flex-col items-stretch gap-[0.75rem] flex-1 min-h-0 overflow-y-auto overscroll-contain " +
    "[-webkit-overflow-scrolling:touch] [scrollbar-width:none] [scrollbar-color:transparent_transparent] " +
    "[mask-image:linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.34)_calc(var(--chat-window-fade-top-active)*0.44+var(--chat-window-scroll-top-fade-start,1.5rem)),rgba(0,0,0,0.86)_calc(var(--chat-window-fade-top-active)*0.9+var(--chat-window-scroll-top-fade-mid,2.9rem)),#000_calc(var(--chat-window-fade-top-active)+var(--chat-window-scroll-top-fade-end,4.5rem)),#000_calc(100%-(var(--chat-window-fade-bottom-active)*0.98)),rgba(0,0,0,0.9)_calc(100%-(var(--chat-window-fade-bottom-active)*0.72)),rgba(0,0,0,0.66)_calc(100%-(var(--chat-window-fade-bottom-active)*0.5)),rgba(0,0,0,0.4)_calc(100%-(var(--chat-window-fade-bottom-active)*0.3)),rgba(0,0,0,0.2)_calc(100%-(var(--chat-window-fade-bottom-active)*0.16)),rgba(0,0,0,0.08)_calc(100%-(var(--chat-window-fade-bottom-active)*0.06)),transparent_100%)] " +
    "[-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.34)_calc(var(--chat-window-fade-top-active)*0.44+var(--chat-window-scroll-top-fade-start,1.5rem)),rgba(0,0,0,0.86)_calc(var(--chat-window-fade-top-active)*0.9+var(--chat-window-scroll-top-fade-mid,2.9rem)),#000_calc(var(--chat-window-fade-top-active)+var(--chat-window-scroll-top-fade-end,4.5rem)),#000_calc(100%-(var(--chat-window-fade-bottom-active)*0.98)),rgba(0,0,0,0.9)_calc(100%-(var(--chat-window-fade-bottom-active)*0.72)),rgba(0,0,0,0.66)_calc(100%-(var(--chat-window-fade-bottom-active)*0.5)),rgba(0,0,0,0.4)_calc(100%-(var(--chat-window-fade-bottom-active)*0.3)),rgba(0,0,0,0.2)_calc(100%-(var(--chat-window-fade-bottom-active)*0.16)),rgba(0,0,0,0.08)_calc(100%-(var(--chat-window-fade-bottom-active)*0.06)),transparent_100%)] " +
    "[mask-size:100%_100%] [-webkit-mask-size:100%_100%] [mask-repeat:no-repeat] [-webkit-mask-repeat:no-repeat] " +
    "[&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0 " +
    "[&::-webkit-scrollbar-thumb]:bg-[linear-gradient(135deg,var(--pt-400),var(--pt-200))] [&::-webkit-scrollbar-thumb]:rounded-[0.625rem] [&::-webkit-scrollbar-thumb]:border-[0.1875rem] [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent " +
    "[&::-webkit-scrollbar-track]:bg-transparent " +
    "transition-[padding] duration-[400ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] will-change-[padding] " +
    "[padding:calc(var(--chat-window-pad-top)+var(--chat-window-top-safe)+var(--chat-window-fade-top-active)*0.28+var(--chat-content-top-offset,0rem))_var(--chat-window-pad-x)_calc(var(--chat-window-pad-bottom)+var(--chat-window-bottom-safe)+var(--chat-window-fade-bottom-active)+var(--chat-vk-offset,0px))] " +
    "[scroll-padding-top:calc(var(--chat-window-pad-top)+var(--chat-window-top-safe)+var(--chat-window-fade-top-active)*0.28+var(--chat-content-top-offset,0rem))] " +
    "[scroll-padding-bottom:calc(var(--chat-window-pad-bottom)+var(--chat-window-bottom-safe)+var(--chat-window-fade-bottom-active)+var(--chat-vk-offset,0px))] max-[768px]:transition-none";
  const mergedWindowClassName = windowClassNameProp ? `${windowClassName} ${windowClassNameProp}` : windowClassName;
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
        <div id="chat-window-scroll" className={scrollClassName} ref={chatWindowRef} role="region" aria-label={t("chat.aria.messages")} aria-live="polite" aria-busy={isStreamingAny ? "true" : "false"}>
          <div aria-hidden="true" className={isMobile ? "shrink-0 h-[var(--chat-content-spacer,0.55rem)] transition-[height] duration-[400ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] max-[768px]:transition-none" : "shrink-0 h-[calc(var(--chat-content-spacer,1.6rem)+0.8rem)] transition-[height] duration-[400ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] max-[768px]:transition-none"} />

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
