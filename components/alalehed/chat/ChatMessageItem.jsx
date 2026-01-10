"use client";

import { memo } from "react";

const ChatMessageItem = memo(function ChatMessageItem({
  role,
  text,
  aiVisible,
  authorName,
  authorRole,
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
    ? t("chat.aria.assistant", "Assistent")
    : isOwn
    ? t("chat.aria.user", "Sina")
    : authorName || t("chat.aria.user", "Liige");

  return (
    <div className={`chat-msg ${variant} ${audienceClass}`} role="article" tabIndex={0}>
      {!isAssistant && !isOwn && (authorName || authorRole) ? (
        <div className="chat-msg-meta">
          <span className="chat-msg-tag chat-msg-tag--human">
            {authorName || "Liige"}
            {authorRole ? ` (${authorRole})` : ""}
          </span>
        </div>
      ) : null}

      <span className="sr-only">
        {authorLabel}
        {": "}
      </span>

      <div className="whitespace-pre-wrap">{text}</div>
    </div>
  );
});

export default ChatMessageItem;
