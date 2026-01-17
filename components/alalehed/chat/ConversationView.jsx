"use client";

import { memo, useEffect, useRef, useState } from "react";
import { cn } from "@/components/ui/cn";

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

    node.addEventListener("scroll", handleScroll, { passive: true });
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

  return (
    <main className={cn("chat-main relative flex min-h-0 flex-1 flex-col gap-[0.5rem]")}>
      <div
        id="chat-window"
        className={cn(
          "chat-window relative flex min-h-[clamp(320px,48vh,620px)] flex-1 flex-col items-center gap-[var(--chat-window-gap,0.65em)] overflow-y-auto overscroll-contain px-[var(--chat-hpad)] py-[clamp(.75rem,2vw,1.2rem)]",
          "[--chat-window-gap:.65em]",
          "[-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_12%,black_88%,transparent_100%)]",
          "[mask-image:linear-gradient(to_bottom,transparent_0%,black_12%,black_88%,transparent_100%)]",
          "[-webkit-mask-size:100%_100%] [mask-size:100%_100%] [-webkit-mask-position:0_0] [mask-position:0_0] [-webkit-mask-repeat:no-repeat] [mask-repeat:no-repeat]"
        )}
        ref={chatWindowRef}
        role="region"
        aria-label={t("chat.aria.messages")}
        aria-live="polite"
        aria-busy={isStreamingAny ? "true" : "false"}
      >
        {hiddenCount > 0 ? (
          <div className="chat-history-cap flex w-full justify-center">
            <button
              type="button"
              className="chat-history-cap-btn rounded-full border border-[rgba(255,255,255,0.25)] bg-[rgba(10,12,18,0.45)] px-[1.1rem] py-[0.45rem] text-[0.95rem] tracking-[0.02em] text-[color:var(--pt-150)] transition hover:border-[rgba(255,255,255,0.35)] hover:text-[color:var(--pt-80)]"
              onClick={onRevealOlder}
            >
              {t("chat.show_older")} (+{Math.min(pageSize, hiddenCount)}) {hiddenCount} {t("chat.left")}
            </button>
          </div>
        ) : null}

        {messageItems}

        {canHideOlder ? (
          <div className="chat-history-cap flex w-full justify-center">
            <button
              type="button"
              className="chat-history-cap-btn rounded-full border border-[rgba(255,255,255,0.25)] bg-[rgba(10,12,18,0.45)] px-[1.1rem] py-[0.45rem] text-[0.95rem] tracking-[0.02em] text-[color:var(--pt-150)] transition hover:border-[rgba(255,255,255,0.35)] hover:text-[color:var(--pt-80)]"
              onClick={onHideOlder}
            >
              {t("chat.show_recent")}
            </button>
          </div>
        ) : null}

        <div
          className="chat-window-fade chat-window-fade--bottom pointer-events-none sticky bottom-0 left-0 right-0 z-10 h-[clamp(2.6rem,7vh,4.8rem)] bg-gradient-to-t from-[rgba(10,12,18,0.9)] to-transparent"
          aria-hidden="true"
        />
      </div>

      {showScrollDown ? (
        <button
          className="scroll-down-btn group absolute bottom-[clamp(1rem,2.6vh,2rem)] left-1/2 z-20 -translate-x-1/2 rounded-full border border-transparent bg-transparent p-[0.45rem] transition hover:scale-110 focus-visible:scale-110"
          onClick={onJumpToBottom}
          aria-label={t("chat.scroll_to_bottom")}
          title={t("chat.scroll_to_bottom_title")}
          aria-controls="chat-window"
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-[2.25rem] w-[2.25rem] stroke-[var(--pt-400)] transition group-hover:stroke-[color:var(--pt-200)]"
            aria-hidden="true"
          >
            <path d="M4 9l8 8 8-8" />
          </svg>
        </button>
      ) : null}
    </main>
  );
});

export default ConversationView;
