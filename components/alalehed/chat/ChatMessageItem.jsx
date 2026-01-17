"use client";

import { memo } from "react";
import { cn } from "@/components/ui/cn";

const ChatMessageItem = memo(function ChatMessageItem({
  role,
  text,
  aiVisible,
  authorName,
  authorRole: _authorRole,
  isRoomMode,
  t,
}) {
  const isAssistant = role === "ai";
  const isOwn = role === "user";
  const variant = isAssistant ? "chat-msg-ai" : "chat-msg-user";

  const audienceClass = isAssistant
    ? ""
    : isRoomMode
    ? isOwn && aiVisible
      ? "chat-msg--ai-targeted"
      : "chat-msg--human-only"
    : "";

  const authorLabel = isAssistant
    ? t("chat.aria.assistant")
    : isOwn
    ? t("chat.aria.user")
    : authorName || t("chat.aria.member");
  const memberClass = role === "member" ? "chat-msg-user--member" : "";

  if (!isAssistant && !isOwn) {
    return (
      <div
        className={cn(
          "chat-msg-wrap chat-msg-wrap--member flex flex-col gap-[0.35em] self-start mb-[1em]",
        )}
        role="article"
        tabIndex={0}
      >
        {authorName ? (
          <div className="chat-msg-name text-[0.95rem] tracking-[0.05em] text-[rgba(197,113,113,0.9)]">
            {authorName}
          </div>
        ) : null}
        <div
          className={cn(
            "chat-msg w-full max-w-full leading-[1.45] self-start",
            variant,
            audienceClass,
            memberClass,
            "inline-block w-auto max-w-[85%] text-left bg-[rgba(14,20,32,0.2)] text-[color:var(--pt-150)] border-[2px] border-[rgba(240,240,240,0.35)] rounded-[1.15em_1.15em_1.15em_0.55em] px-[1em] py-[0.62em] text-[1.16rem] leading-[1.32] tracking-[0.04em] font-[400] shadow-[0_0_0_1px_rgba(0,0,0,0.06),_0_0.45rem_1.05rem_rgba(5,8,15,0.18)] transition-[border-color,box-shadow,background] duration-150",
          )}
        >
          <span className="sr-only">
            {authorLabel}
            {": "}
          </span>
          <div className="whitespace-pre-wrap">{text}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "chat-msg w-full max-w-full leading-[1.45] mb-[1em]",
        variant,
        audienceClass,
        memberClass,
        isAssistant
          ? "bg-transparent border-0 shadow-none px-0 py-[0.25em] text-[color:var(--pt-150)] max-w-full text-left text-[1.16rem] leading-[1.32] tracking-[0.03em] font-[500]"
          : "self-end inline-block w-auto max-w-[85%] text-right bg-[rgba(14,20,32,0.34)] text-[color:var(--pt-150)] border-[2px] border-[rgba(240,240,240,0.55)] rounded-[1.15em_1.15em_0.55em_1.15em] px-[1em] py-[0.62em] text-[1.16rem] leading-[1.32] tracking-[0.04em] font-[400] shadow-[0_0_0_1px_rgba(0,0,0,0.06),_0_0.45rem_1.05rem_rgba(5,8,15,0.18)] transition-[border-color,box-shadow,background] duration-150 hover:border-[rgba(255,255,255,0.32)] hover:bg-[var(--glass-input-bg-active)] focus-within:border-[rgba(255,255,255,0.32)] focus-within:bg-[var(--glass-input-bg-active)]"
      )}
      role="article"
      tabIndex={0}
    >
      <span className="sr-only">
        {authorLabel}
        {": "}
      </span>

      <div className="whitespace-pre-wrap">{text}</div>
    </div>
  );
});

export default ChatMessageItem;
