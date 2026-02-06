"use client";

import { memo, useEffect, useRef, useState } from "react";
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
  onWindowDoubleClick
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
    "w-full max-w-[var(--chat-window-max-w,calc(100%-var(--right-rail-width,clamp(4.6rem,8vw,5.8rem))-clamp(1.4rem,3vw,2.2rem)))] mx-auto " +
    "transition-[padding-top,padding-bottom,margin-top,max-height,max-width] duration-[400ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] " +
    "max-[48em]:max-w-full";
  const scrollClassName =
    "chat-window__scroll flex flex-col items-stretch gap-[0.75rem] flex-1 min-h-0 overflow-y-auto overscroll-contain";
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
        </div>
      </div>

      {showScrollDown ? <button className={scrollButtonClassName} onClick={onJumpToBottom} aria-label={t("chat.scroll_to_bottom")} title={t("chat.scroll_to_bottom_title")} aria-controls="chat-window-scroll">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={scrollIconClassName}>
            <path d="M4 9l8 8 8-8" />
          </svg>
        </button> : null}
    </main>;
});
export default ConversationView;
