"use client";

import { memo, useEffect, useRef, useState } from "react";
import AllikadLight from "@/public/logo/heleallikad.svg";
import AllikadDark from "@/public/logo/tumeallikad.svg";
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
  useEffect(() => {
    const node = chatWindowRef?.current;
    if (!node) return;
    function handleScroll() {
      const atBottom = node.scrollHeight - node.scrollTop - node.clientHeight <= 50;
      isUserAtBottom.current = atBottom;
      setShowScrollDown(!atBottom);
    }
    node.addEventListener("scroll", handleScroll, {
      passive: true
    });
    handleScroll();
    return () => node.removeEventListener("scroll", handleScroll);
  }, [chatWindowRef]);
  useEffect(() => {
    if (!mountedRef.current) return;
    const node = chatWindowRef?.current;
    if (node && isUserAtBottom.current) {
      node.scrollTop = node.scrollHeight;
    }
  }, [chatWindowRef, messageItems]);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  const mainClassName =
    "conversation-view relative flex flex-1 flex-col min-h-0 w-full " +
    "transition-[transform] duration-[400ms] ease-[cubic-bezier(0.22,0.61,0.36,1)]";
  const mergedMainClassName = mainClassNameProp ? `${mainClassName} ${mainClassNameProp}` : mainClassName;
  const windowClassName =
    "chat-window relative flex flex-1 min-h-0 flex-col items-stretch gap-[0.75rem] " +
    "mt-[var(--chat-window-top-offset,0rem)] max-h-[calc(100%-var(--chat-window-top-offset,0rem)-var(--chat-window-bottom-gap,0rem))] " +
    "[--chat-window-corner:clamp(0.9rem,2.2vw,1.4rem)] [--chat-window-curve-x:100%] [--chat-window-curve-y:72%] " +
    "[--chat-window-pad-x:var(--chat-window-pad-x,clamp(0.6rem,1.8vw,1.35rem))] [--chat-window-pad-top:var(--chat-window-pad-top,clamp(1.8rem,4vh,3rem))] " +
    "[--chat-window-bottom-safe:clamp(1.2rem,2.8vh,2.4rem)] [--chat-window-fade-top:clamp(1.2rem,4vh,2.4rem)] " +
    "[--chat-window-fade-top-focus:clamp(1.8rem,5.6vh,3.4rem)] [--chat-window-fade-top-active:var(--chat-window-fade-top)] " +
    "[--chat-window-fade-bottom:clamp(2.2rem,7vh,4rem)] [--chat-window-fade-bottom-focus:clamp(3rem,9vh,5rem)] [--chat-window-fade-bottom-active:var(--chat-window-fade-bottom)] " +
    "[--chat-window-top-glaze-h:clamp(5rem,14vh,9rem)] [--chat-window-top-glaze-alpha:0.6] " +
    "[--chat-window-side-fade-in:18%] [--chat-window-side-fade-band:clamp(3.2rem,11vh,7rem)] " +
    "[--chat-arc-fade-width:84%] [--chat-arc-fade-depth:74%] [--chat-arc-rgb:14_18_28] [--chat-arc-center-alpha:0.14] [--chat-arc-side-alpha:0.3] [--chat-arc-mid-alpha:0.11] " +
    "[border-radius:var(--chat-window-curve-x)_var(--chat-window-curve-x)_var(--chat-window-corner)_var(--chat-window-corner)_/_var(--chat-window-curve-y)_var(--chat-window-curve-y)_var(--chat-window-corner)_var(--chat-window-corner)] " +
    "bg-transparent border-0 shadow-none isolate overflow-hidden " +
    "w-full max-w-[var(--chat-window-max-w,calc(100%-var(--right-rail-width,clamp(4.6rem,8vw,5.8rem))-clamp(1.4rem,3vw,2.2rem)))] mx-auto " +
    "[transform:translateX(var(--chat-window-shift-x,0rem))] " +
    "max-[48em]:[--chat-window-curve-x:var(--chat-window-corner)] max-[48em]:[--chat-window-curve-y:var(--chat-window-corner)] " +
    "light:[--chat-arc-rgb:210_214_222] light:[--chat-arc-center-alpha:0.1] light:[--chat-arc-side-alpha:0.24] light:[--chat-arc-mid-alpha:0.09] " +
    "transition-[padding-top,padding-bottom,margin-top,max-height,max-width,transform] duration-[400ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] " +
    "max-[48em]:max-w-full";
  const scrollClassName =
    "chat-window__scroll relative z-[1] h-full flex flex-col items-stretch gap-[0.75rem] flex-1 min-h-0 overflow-y-auto overscroll-contain " +
    "[-webkit-overflow-scrolling:touch] [scrollbar-width:none] [scrollbar-color:transparent_transparent] " +
    "[mask-image:radial-gradient(225%_158%_at_50%_-86%,transparent_56%,rgba(0,0,0,0.08)_61%,rgba(0,0,0,0.34)_66%,rgba(0,0,0,0.78)_70%,#000_74%,#000_100%),linear-gradient(to_bottom,#000_0%,#000_calc(100%-var(--chat-window-fade-bottom-active)),transparent_100%)] " +
    "[-webkit-mask-image:radial-gradient(225%_158%_at_50%_-86%,transparent_56%,rgba(0,0,0,0.08)_61%,rgba(0,0,0,0.34)_66%,rgba(0,0,0,0.78)_70%,#000_74%,#000_100%),linear-gradient(to_bottom,#000_0%,#000_calc(100%-var(--chat-window-fade-bottom-active)),transparent_100%)] " +
    "[mask-composite:intersect] [-webkit-mask-composite:source-in] " +
    "[mask-size:100%_100%] [-webkit-mask-size:100%_100%] [mask-repeat:no-repeat] [-webkit-mask-repeat:no-repeat] " +
    "[&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0 " +
    "[&::-webkit-scrollbar-thumb]:bg-[linear-gradient(135deg,var(--pt-400),var(--pt-200))] [&::-webkit-scrollbar-thumb]:rounded-[0.625rem] [&::-webkit-scrollbar-thumb]:border-[0.1875rem] [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent " +
    "[&::-webkit-scrollbar-track]:bg-transparent " +
    "transition-[padding] duration-[400ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] will-change-[padding] " +
    "[padding:calc(var(--chat-window-pad-top)+var(--chat-window-top-safe)+var(--chat-window-fade-top-active)+var(--chat-content-top-offset,0rem))_var(--chat-window-pad-x)_calc(var(--chat-window-pad-bottom)+var(--chat-window-bottom-safe)+var(--chat-window-fade-bottom-active))] " +
    "[scroll-padding-top:calc(var(--chat-window-pad-top)+var(--chat-window-top-safe)+var(--chat-window-fade-top-active)+var(--chat-content-top-offset,0rem))] " +
    "[scroll-padding-bottom:calc(var(--chat-window-pad-bottom)+var(--chat-window-bottom-safe)+var(--chat-window-fade-bottom-active))] " +
    "max-[48em]:[mask-image:none] max-[48em]:[-webkit-mask-image:none] max-[48em]:[mask-composite:add] max-[48em]:[-webkit-mask-composite:source-over]";
  const mergedWindowClassName = windowClassNameProp ? `${windowClassName} ${windowClassNameProp}` : windowClassName;
  const scrollButtonClassName =
    "absolute left-1/2 -translate-x-1/2 bottom-[calc(0.85rem+var(--chat-scroll-down-offset,0rem))] " +
    "bg-transparent border-0 p-[0.375rem] cursor-[var(--cursor-pointer)] z-[5] " +
    "flex items-center justify-center transition-[transform,bottom] duration-[400ms] " +
    "hover:scale-[1.15] focus-visible:scale-[1.15]";
  const scrollIconClassName =
    "h-[2.25rem] w-[2.25rem] fill-none stroke-[#c57171] " +
    "transition-[stroke] duration-200 light:stroke-[#7a3a38]";
  const buttonClassName =
    "mx-auto rounded-full border border-[rgba(148,163,184,0.35)] bg-[rgba(10,14,24,0.35)] " +
    "px-[1rem] py-[0.4rem] text-[0.85rem] font-semibold text-[color:var(--pt-120)] " +
    "transition-[border-color,background,transform] duration-150 hover:-translate-y-[1px] " +
    "light:border-[rgba(148,163,184,0.5)] light:bg-[rgba(255,255,255,0.9)] light:text-[#1f2937]";
  return <main className={mergedMainClassName}>
      <div id="chat-window" className={mergedWindowClassName} onDoubleClick={onWindowDoubleClick}>
        <div id="chat-window-scroll" className={scrollClassName} ref={chatWindowRef} role="region" aria-label={t("chat.aria.messages")} aria-live="polite" aria-busy={isStreamingAny ? "true" : "false"}>
          <div aria-hidden="true" className={isMobile ? "shrink-0 h-[0.08rem]" : "shrink-0 h-[var(--chat-content-spacer,1.6rem)]"} />

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

          <div aria-hidden="true" className={isMobile ? "shrink-0 h-[0.05rem]" : "shrink-0 h-[var(--chat-content-bottom-spacer,0rem)]"} />
        </div>
        {isMobile && hasConversationSources ? <button
            ref={sourcesButtonRef}
            type="button"
            className="chat-sources-floating-btn group absolute right-[clamp(0.35rem,2vw,0.65rem)] top-[clamp(0.35rem,2vw,0.65rem)] z-[6] h-[2.9rem] w-[2.9rem] rounded-full border-0 bg-transparent p-0 shadow-none outline-none"
            aria-label={t("chat.sources.button", "Allikad ({count})").replace("{count}", String(conversationSourcesCount))}
            aria-haspopup="dialog"
            aria-expanded={showSourcesPanel ? "true" : "false"}
            aria-controls="chat-sources-panel"
            onClick={() => {
            toggleSourcesPanel?.();
          }}
          >
            {isLightTheme ? <AllikadLight className={`h-[2.7rem] w-[2.7rem] transition-transform duration-150 group-hover:scale-110 group-focus-visible:scale-110 ${sourcesPulse ? "opacity-100" : "opacity-88"}`} aria-hidden="true" role="img" /> : <AllikadDark className={`h-[2.7rem] w-[2.7rem] transition-transform duration-150 group-hover:scale-110 group-focus-visible:scale-110 ${sourcesPulse ? "opacity-100" : "opacity-88"}`} aria-hidden="true" role="img" />}
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
