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
  messageItems
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
    "relative flex flex-1 flex-col min-h-0 gap-[0.5rem] mt-[-1.1rem] mb-[calc(-1*var(--chat-window-bottom-shift,0rem))]";
  const windowClassName =
    "relative flex flex-1 flex-col items-stretch gap-[0.65em] " +
    "w-full max-w-[calc(100%-var(--right-rail-width,clamp(4.6rem,8vw,5.8rem))+2.0rem)] mx-auto " +
    "min-h-[clamp(320px,48vh,620px)] overflow-y-auto overscroll-contain " +
    "pl-[calc(var(--chat-hpad)*0.6)] pr-[0.55rem] " +
    "pt-[calc(var(--chat-pad-top,1rem)+0.4rem)] " +
    "pb-[calc(var(--chat-pad-bottom,1rem)+5.2rem+var(--chat-input-row-gap,0rem)+var(--chat-input-shift,0rem))] " +
    "[scroll-padding-top:calc(var(--chat-pad-top,1rem)+0.4rem)] " +
    "[scroll-padding-bottom:calc(var(--chat-pad-bottom,1rem)+5.2rem+var(--chat-input-row-gap,0rem)+var(--chat-input-shift,0rem))] " +
    "-translate-x-[0.6rem] max-[48em]:translate-x-0 " +
    "max-[48em]:max-w-full " +
    "[scrollbar-width:none] [scrollbar-color:transparent_transparent] " +
    "[-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_12%,black_88%,transparent_100%)] " +
    "[mask-image:linear-gradient(to_bottom,transparent_0%,black_12%,black_88%,transparent_100%)] " +
    "[-webkit-mask-size:100%_100%] [mask-size:100%_100%] " +
    "[-webkit-mask-repeat:no-repeat] [mask-repeat:no-repeat] " +
    "[&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0";
  const scrollButtonClassName =
    "absolute left-1/2 -translate-x-1/2 bottom-[calc(-1*(var(--chat-input-row-gap,3.1rem)+var(--chat-input-shift,1.8rem))+var(--chat-scroll-down-offset,0rem)+var(--chat-scroll-button-lift,0rem))] " +
    "bg-transparent border-0 p-[0.375rem] cursor-[var(--cursor-pointer)] z-[5] " +
    "flex items-center justify-center transition-transform duration-150 hover:scale-[1.15] focus-visible:scale-[1.15]";
  const scrollIconClassName =
    "h-[2.25rem] w-[2.25rem] fill-none stroke-[#c57171] " +
    "transition-[stroke] duration-200 light:stroke-[#7a3a38]";
  const buttonClassName =
    "mx-auto rounded-full border border-[rgba(148,163,184,0.35)] bg-[rgba(10,14,24,0.35)] " +
    "px-[1rem] py-[0.4rem] text-[0.85rem] font-semibold text-[color:var(--pt-120)] " +
    "transition-[border-color,background,transform] duration-150 hover:-translate-y-[1px] " +
    "light:border-[rgba(148,163,184,0.5)] light:bg-[rgba(255,255,255,0.9)] light:text-[#1f2937]";
  return <main className={mainClassName}>
      <div id="chat-window" className={windowClassName} ref={chatWindowRef} role="region" aria-label={t("chat.aria.messages")} aria-live="polite" aria-busy={isStreamingAny ? "true" : "false"}>
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

      {showScrollDown ? <button className={scrollButtonClassName} onClick={onJumpToBottom} aria-label={t("chat.scroll_to_bottom")} title={t("chat.scroll_to_bottom_title")} aria-controls="chat-window">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={scrollIconClassName}>
            <path d="M4 9l8 8 8-8" />
          </svg>
        </button> : null}
    </main>;
});
export default ConversationView;
