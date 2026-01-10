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
    <main className="chat-main relative">
      <div
        id="chat-window"
        className="chat-window u-mobile-scroll u-mobile-safe-pad relative"
        ref={chatWindowRef}
        role="region"
        aria-label={t("chat.aria.messages", "Chat messages")}
        aria-live="polite"
        aria-busy={isStreamingAny ? "true" : "false"}
      >
        {hiddenCount > 0 ? (
          <div className="chat-history-cap">
            <button
              type="button"
              className="chat-history-cap-btn"
              onClick={onRevealOlder}
            >
              {t("chat.show_older", "Näita varasemaid")} (+{Math.min(pageSize, hiddenCount)}){" "}
              {hiddenCount} {t("chat.left", "veel")}
            </button>
          </div>
        ) : null}

        {messageItems}

        {canHideOlder ? (
          <div className="chat-history-cap">
            <button
              type="button"
              className="chat-history-cap-btn"
              onClick={onHideOlder}
            >
              {t("chat.show_recent", "Näita vähem")}
            </button>
          </div>
        ) : null}

        <div className="chat-window-fade chat-window-fade--bottom" aria-hidden="true" />
      </div>

      {showScrollDown ? (
        <button
          className="scroll-down-btn"
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
