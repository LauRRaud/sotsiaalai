"use client";

import { memo } from "react";
const ChatMessageItem = memo(function ChatMessageItem({
  role,
  text,
  aiVisible,
  authorName,
  authorRole: _authorRole,
  isRoomMode,
  t
}) {
  const isAssistant = role === "ai";
  const isOwn = role === "user";
  const variant = isAssistant ? "chat-msg-ai" : "chat-msg-user";
  const audienceClass = isAssistant ? "" : isRoomMode ? isOwn && aiVisible ? "chat-msg--ai-targeted" : "chat-msg--human-only" : "";
  const authorLabel = isAssistant ? t("chat.aria.assistant") : isOwn ? t("chat.aria.user") : authorName || t("chat.aria.user");
  const memberClass = role === "member" ? "chat-msg-user--member" : "";
  if (!isAssistant && !isOwn) {
    return <div className="chat-msg-wrap chat-msg-wrap--member" role="article" tabIndex={0}>
        {authorName ? <div className="chat-msg-name">{authorName}</div> : null}
        <div className={`chat-msg ${variant} ${audienceClass} ${memberClass}`}>
          <span className="sr-only">
            {authorLabel}
            {": "}
          </span>
          <div className="whitespace-pre-wrap">{text}</div>
        </div>
      </div>;
  }
  return <div className={`chat-msg ${variant} ${audienceClass} ${memberClass}`} role="article" tabIndex={0}>
      <span className="sr-only">
        {authorLabel}
        {": "}
      </span>

      <div className="whitespace-pre-wrap">{text}</div>
    </div>;
});
export default ChatMessageItem;