"use client";

import { memo } from "react";
import { cn } from "@/components/ui/cn";
const ChatMessageItem = memo(function ChatMessageItem({
  role,
  text,
  attachments,
  cards,
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
    "max-w-full leading-[1.45] mb-[0.35em] self-start";
  const messageWrapClassName =
    "flex flex-col self-start mb-[0.35em] gap-[0.16em]";
  const nameClassName =
    "text-[0.95rem] tracking-[0.05em] text-[rgba(197,113,113,0.9)]";
  const userBubbleClassName =
    "chat-msg-user self-end ml-auto inline-block w-fit max-w-[84%] mr-[clamp(0.24rem,0.65vw,0.48rem)] max-[768px]:mr-[0.08rem] text-right " +
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
    "text-[color:var(--input-text)] text-left text-[1.16rem] leading-[1.32] tracking-[0.03em] font-[500]";
  const normalizedAttachments = Array.isArray(attachments)
    ? attachments
        .filter(item => item && typeof item === "object")
        .map(item => ({
          label: String(item.label || "").trim() || "Download file",
          url: String(item.url || "").trim(),
          fileName: String(item.fileName || "").trim()
        }))
        .filter(item => !!item.url)
    : [];
  const showAttachments = isAssistant && normalizedAttachments.length > 0;
  const normalizedCards = Array.isArray(cards)
    ? cards
        .filter((item) => item && typeof item === "object")
        .map((item) => ({
          title: String(item.title || "").trim(),
          subtitle: String(item.subtitle || "").trim(),
          body: String(item.body || "").trim(),
          meta: String(item.meta || "").trim(),
          hint: String(item.hint || "").trim()
        }))
        .filter((item) => item.title || item.body)
    : [];
  const showCards = isAssistant && normalizedCards.length > 0;
  const attachmentsWrapClassName = "mt-[0.45rem] flex flex-wrap gap-[0.45rem]";
  const attachmentLinkClassName =
    "inline-flex items-center justify-center rounded-full border border-[rgba(240,240,240,0.45)] " +
    "bg-[rgba(14,20,32,0.3)] px-[0.75rem] py-[0.3rem] text-[0.88rem] leading-[1.2] " +
    "text-[color:var(--pt-150)] no-underline transition-colors duration-150 " +
    "hover:bg-[rgba(14,20,32,0.45)] focus-visible:bg-[rgba(14,20,32,0.45)] " +
    "light:border-[rgba(15,23,42,0.2)] light:bg-[rgba(255,255,255,0.75)] light:text-[color:var(--input-text)]";
  const cardsWrapClassName = "mt-[0.55rem] grid gap-[0.55rem]";
  const cardClassName =
    "rounded-[1rem] border border-[rgba(240,240,240,0.18)] bg-[rgba(14,20,32,0.26)] " +
    "px-[0.9rem] py-[0.78rem] text-left shadow-[0_0.32rem_0.85rem_rgba(5,8,15,0.12)] " +
    "light:border-[rgba(15,23,42,0.12)] light:bg-[rgba(255,255,255,0.82)]";
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
      {showCards ? (
        <div className={cardsWrapClassName}>
          {normalizedCards.map((item, idx) => (
            <article key={`${item.title || item.body}-${idx}`} className={cardClassName}>
              {item.title ? <div className="text-[0.98rem] font-semibold leading-[1.35]">{item.title}</div> : null}
              {item.subtitle ? <div className="mt-[0.12rem] text-[0.82rem] uppercase tracking-[0.08em] text-[rgba(197,113,113,0.92)]">{item.subtitle}</div> : null}
              {item.body ? <div className="mt-[0.42rem] whitespace-pre-wrap text-[0.96rem] leading-[1.5]">{item.body}</div> : null}
              {item.meta ? <div className="mt-[0.45rem] text-[0.82rem] opacity-80">{item.meta}</div> : null}
              {item.hint ? <div className="mt-[0.38rem] text-[0.84rem] font-medium opacity-90">{item.hint}</div> : null}
            </article>
          ))}
        </div>
      ) : null}
      {showAttachments ? (
        <div className={attachmentsWrapClassName}>
          {normalizedAttachments.map((item, idx) => (
            <a
              key={`${item.url}-${idx}`}
              href={item.url}
              className={attachmentLinkClassName}
              download={item.fileName || undefined}
            >
              {item.label}
            </a>
          ))}
        </div>
      ) : null}
    </div>;
});
export default ChatMessageItem;
