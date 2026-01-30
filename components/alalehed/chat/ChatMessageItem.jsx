"use client";

import { memo } from "react";
import { cn } from "@/components/ui/cn";
const ChatMessageItem = memo(function ChatMessageItem({
  role,
  text,
  aiVisible: _aiVisible,
  authorName,
  authorRole: _authorRole,
  isRoomMode: _isRoomMode,
  t
}) {
  const isAssistant = role === "ai";
  const isOwn = role === "user";
  const authorLabel = isAssistant ? t("chat.aria.assistant") : isOwn ? t("chat.aria.user") : authorName || t("chat.aria.user");
  const messageBaseClassName =
    "max-w-full leading-[1.45] mb-[1em] self-start";
  const messageWrapClassName =
    "flex flex-col self-start mb-[1em] gap-[0.35em]";
  const nameClassName =
    "text-[0.95rem] tracking-[0.05em] text-[rgba(197,113,113,0.9)]";
  const userBubbleClassName =
    "chat-msg-user self-end ml-auto inline-block w-fit max-w-[85%] text-right " +
    "bg-[rgba(14,20,32,0.34)] text-[color:var(--pt-150)] " +
    "border-2 border-[rgba(240,240,240,0.55)] " +
    "rounded-[1.15em] rounded-br-[0.55em] " +
    "px-[1em] py-[0.62em] text-[1.16rem] leading-[1.32] tracking-[0.04em] font-[400] " +
    "shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_0.32rem_0.85rem_rgba(5,8,15,0.16)] " +
    "transition-[border-color,box-shadow,background] duration-150 " +
    "hover:border-[rgba(255,255,255,0.32)] hover:[background:var(--glass-input-bg-active)] " +
    "focus-within:border-[rgba(255,255,255,0.32)] focus-within:[background:var(--glass-input-bg-active)] " +
    "light:bg-[var(--input-bg)] light:border-transparent light:shadow-[var(--input-shadow)] " +
    "light:text-[color:var(--input-text)] light:hover:bg-[var(--input-bg)] light:focus-within:bg-[var(--input-bg)]";
  const memberBubbleClassName =
    "self-start text-left bg-[rgba(14,20,32,0.2)] " +
    "border-[rgba(240,240,240,0.35)] rounded-bl-[0.55em]";
  const aiBubbleClassName =
    "chat-msg-ai w-full bg-transparent border-0 shadow-none py-[0.25em] " +
    "text-[color:var(--pt-150)] text-left text-[1.16rem] leading-[1.32] tracking-[0.03em] font-[500] " +
    "light:text-[color:var(--input-text)]";
  if (!isAssistant && !isOwn) {
    return <div className={messageWrapClassName} role="article" tabIndex={0}>
        {authorName ? <div className={nameClassName}>{authorName}</div> : null}
        <div className={cn(messageBaseClassName, userBubbleClassName, memberBubbleClassName)}>
          <span className="sr-only">
            {authorLabel}
            {": "}
          </span>
          <div className="whitespace-pre-wrap">{text}</div>
        </div>
      </div>;
  }
  return <div className={cn(messageBaseClassName, isAssistant ? aiBubbleClassName : userBubbleClassName)} role="article" tabIndex={0}>
      <span className="sr-only">
        {authorLabel}
        {": "}
      </span>

      <div className="whitespace-pre-wrap">{text}</div>
    </div>;
});
export default ChatMessageItem;
