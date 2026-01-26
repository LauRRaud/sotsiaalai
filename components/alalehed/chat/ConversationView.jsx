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
    "relative flex flex-1 flex-col min-h-0 gap-[0.5rem]";
  const windowClassName =
    "relative flex flex-1 flex-col items-center gap-[0.65em] " +
    "min-h-[clamp(320px,48vh,620px)] overflow-y-auto overscroll-contain " +
    "px-[var(--chat-hpad)] pt-[clamp(0.75rem,2vw,1.2rem)] pb-[clamp(1rem,3vw,1.6rem)] " +
    "[scrollbar-width:thin] [scrollbar-color:var(--pt-mid)_transparent] " +
    "[-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_12%,black_88%,transparent_100%)] " +
    "[mask-image:linear-gradient(to_bottom,transparent_0%,black_12%,black_88%,transparent_100%)] " +
    "[-webkit-mask-size:100%_100%] [mask-size:100%_100%] " +
    "[-webkit-mask-repeat:no-repeat] [mask-repeat:no-repeat] " +
    "[&::-webkit-scrollbar]:w-[0.75rem] [&::-webkit-scrollbar]:h-[0.75rem]";
  const scrollButtonClassName =
    "absolute left-1/2 -translate-x-1/2 bottom-[var(--chat-scroll-down-offset,5.6rem)] " +
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
        {hiddenCount > 0 ? <div>
            <button type="button" onClick={onRevealOlder} className={buttonClassName}>
              {t("chat.show_older")} (+{Math.min(pageSize, hiddenCount)}){" "}
              {hiddenCount} {t("chat.left")}
            </button>
          </div> : null}

        {messageItems}

        {canHideOlder ? <div>
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
