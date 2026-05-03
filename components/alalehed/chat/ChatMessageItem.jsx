"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/components/ui/cn";
import { SourcesIcon } from "@/components/ui/icons/ChatIcons";
import { parseAssistantMarkdownBlocks } from "@/lib/chat/messageMarkdown";

function splitGraphemes(text) {
  if (!text) return [];
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter(undefined, {
      granularity: "grapheme"
    });
    return Array.from(segmenter.segment(text), segment => segment.segment);
  }
  return Array.from(text);
}

const TYPING_STEP_MS = 18;
const TYPING_TRAILING_INLINE_RE = /^[\s!?,.;:)]$/;
const THINKING_SHINE_BACKGROUND_DARK =
  "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 32%, rgba(255,255,255,0.98) 50%, rgba(255,255,255,0.2) 68%, rgba(255,255,255,0) 100%)";
const THINKING_SHINE_BACKGROUND_LIGHT =
  "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(72,46,36,0.18) 32%, rgba(56,36,28,0.92) 50%, rgba(72,46,36,0.18) 68%, rgba(0,0,0,0) 100%)";

function getTimeLocale(locale) {
  if (locale === "et") return "et-EE";
  if (locale === "ru") return "ru-RU";
  if (locale === "en") return "en-GB";
  return locale || undefined;
}

function formatMessageTime(createdAt, locale) {
  if (!createdAt) return null;
  const date = createdAt instanceof Date ? createdAt : new Date(createdAt);
  const timestamp = date.getTime();
  if (!Number.isFinite(timestamp)) return null;

  try {
    return {
      label: new Intl.DateTimeFormat(getTimeLocale(locale), {
        hour: "2-digit",
        minute: "2-digit"
      }).format(date),
      iso: date.toISOString()
    };
  } catch {
    return {
      label: date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      }),
      iso: date.toISOString()
    };
  }
}

function renderInlineMarkdown(text, keyPrefix) {
  const source = String(text || "");
  void keyPrefix;
  return source
    .replace(/\*\*([^*\n][\s\S]*?[^*\n])\*\*/g, "$1")
    .replace(/__([^_\n][\s\S]*?[^_\n])__/g, "$1");
}

function AssistantMarkdown({ text }) {
  const blocks = useMemo(() => parseAssistantMarkdownBlocks(text), [text]);

  if (!blocks.length) return null;

  return (
    <div className="grid gap-[0.42em]">
      {blocks.map((block, index) => {
        if (block.type === "unordered" || block.type === "ordered") {
          const ListTag = block.type === "ordered" ? "ol" : "ul";
          return (
            <ListTag
              key={`${block.type}-${index}`}
              className={cn(
                "m-0 grid gap-[0.18em] pl-[1.25em] leading-inherit tracking-inherit",
                block.type === "ordered" ? "list-decimal" : "list-disc"
              )}
            >
              {block.items.map((item, itemIndex) => (
                <li key={`${block.type}-${index}-${itemIndex}`} className="whitespace-pre-wrap [overflow-wrap:break-word] [hyphens:auto]">
                  {renderInlineMarkdown(item, `${block.type}-${index}-${itemIndex}`)}
                </li>
              ))}
            </ListTag>
          );
        }

        return (
          <p key={`paragraph-${index}`} className="m-0 whitespace-pre-wrap [overflow-wrap:break-word] [hyphens:auto]">
            {renderInlineMarkdown(block.text, `paragraph-${index}`)}
          </p>
        );
      })}
    </div>
  );
}

const ChatMessageItem = memo(function ChatMessageItem({
  messageId,
  role,
  text,
  attachments,
  cards,
  createdAt,
  aiVisible: _aiVisible,
  typingEffect = false,
  onTypingComplete,
  authorName,
  authorRole: _authorRole,
  isRoomMode: _isRoomMode,
  t,
  locale = "et",
  isLightTheme = false,
  voiceEnabled = true,
  canSpeak = false,
  isSpeaking = false,
  onSpeak,
  messageSources = [],
  onShowSources,
  isStreaming = false
}) {
  const isAssistant = role === "ai";
  const isOwn = role === "user";
  const [userTimeVisible, setUserTimeVisible] = useState(false);
  const messageTime = useMemo(() => formatMessageTime(createdAt, locale), [createdAt, locale]);
  const normalizedAuthorName = String(authorName || "").trim();
  const hiddenAuthorNames = new Set([
    String(t("chat.aria.member") || "").trim().toLowerCase(),
    "liige",
    "member"
  ]);
  const displayAuthorName =
    normalizedAuthorName && !hiddenAuthorNames.has(normalizedAuthorName.toLowerCase())
      ? normalizedAuthorName
      : "";
  const authorLabel = isAssistant ? t("chat.aria.assistant") : isOwn ? t("chat.aria.user") : displayAuthorName || t("chat.aria.user");
  const messageBaseClassName =
    "max-w-full leading-[1.45] mb-[0.35em]";
  const messageWrapClassName =
    "flex flex-col self-start mb-[0.35em] gap-[0.16em]";
  const nameClassName =
    "text-[0.95rem] tracking-[0.05em] text-[rgba(197,113,113,0.9)]";
  const userMessageRowClassName =
    "chat-msg-user flex w-full justify-end pl-[clamp(0.42rem,0.95vw,0.78rem)] pr-[clamp(0.42rem,0.95vw,0.78rem)] max-[768px]:pl-[0.6rem] max-[768px]:pr-[0.18rem]";
  const userMessageStackClassName =
    "flex min-w-0 max-w-[min(84%,44rem)] flex-col items-end";
  const userBubbleClassName =
    "chat-msg-user-bubble mr-[0.04rem] max-[768px]:mr-[0.08rem] inline-block min-w-0 w-fit max-w-full text-left [overflow-wrap:break-word] [hyphens:auto] " +
    "[background:var(--chat-tools-panel-bg,var(--opaque-panel-bg,var(--rail-tooltip-bg,var(--subpage-card-bg))))] border-0 " +
    "[box-shadow:var(--rail-tooltip-shadow,var(--subpage-card-shadow,0_12px_24px_rgba(0,0,0,0.18)))] " +
    "[-webkit-backdrop-filter:none] [backdrop-filter:none] rounded-[1.28rem] rounded-br-[0.5rem] " +
    "px-[0.96rem] py-[0.72rem] text-[1.1rem] leading-[1.42] tracking-[0.015em] font-[400] " +
    "text-[color:var(--opaque-panel-text,var(--rail-tooltip-text,var(--input-text)))] transition-[transform,box-shadow] duration-200 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(197,113,113,0.35)]";
  const memberTextClassName =
    "chat-msg-ai self-start w-full bg-transparent border-0 shadow-none py-[0.06em] pr-[clamp(0.5rem,1.6vw,1.05rem)] max-[768px]:pr-[0.4rem] " +
    "text-[color:var(--input-text)] text-left text-[1.1rem] leading-[1.32] tracking-[0.03em] font-[500] [overflow-wrap:break-word] [hyphens:auto]";
  const aiBubbleClassName =
    "chat-msg-ai self-start w-full bg-transparent border-0 shadow-none py-[0.25em] pr-[clamp(0.5rem,1.6vw,1.05rem)] max-[768px]:pr-[0.4rem] " +
    "text-[color:var(--input-text)] text-left text-[1.1rem] leading-[1.32] tracking-[0.03em] font-[500] [overflow-wrap:break-word] [hyphens:auto]";
  const thinkingLabelRaw = typeof t === "function" ? t("chat.typing.label") : "";
  const thinkingLabel = thinkingLabelRaw && thinkingLabelRaw !== "chat.typing.label"
    ? thinkingLabelRaw
    : locale === "en"
      ? "Thinking"
      : locale === "ru"
        ? "Думаю"
        : "Mõtlen";
  const thinkingClassName =
    "inline-block whitespace-pre text-[1.1rem] leading-[1.32] tracking-[0.03em] text-transparent " +
    "[background-repeat:no-repeat] [background-size:220%_100%] [background-position:200%_center] " +
    "[-webkit-background-clip:text] [background-clip:text] [-webkit-text-fill-color:transparent] " +
    "[animation:profile-footer-shine_1800ms_linear_infinite] [animation-fill-mode:both] motion-reduce:animate-pulse";
  const thinkingStyle = {
    backgroundImage: isLightTheme ? THINKING_SHINE_BACKGROUND_LIGHT : THINKING_SHINE_BACKGROUND_DARK
  };
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
  const typingTimerRef = useRef(0);
  const typingCompleteNotifiedRef = useRef(false);
  const [visibleCount, setVisibleCount] = useState(0);
  const textSegments = useMemo(
    () => splitGraphemes(String(text || "").trim()),
    [text]
  );
  const clearTypingTimer = () => {
    if (!typingTimerRef.current || typeof window === "undefined") return;
    window.clearTimeout(typingTimerRef.current);
    typingTimerRef.current = 0;
  };
  useEffect(() => {
    clearTypingTimer();
    setVisibleCount(0);
    typingCompleteNotifiedRef.current = false;

    if (!typingEffect || !textSegments.length) {
      setVisibleCount(textSegments.length);
      if (typingEffect && textSegments.length === 0 && !typingCompleteNotifiedRef.current) {
        typingCompleteNotifiedRef.current = true;
        onTypingComplete?.();
      }
      return;
    }

    let nextCount = Math.min(textSegments.length, 1);
    while (nextCount < textSegments.length && TYPING_TRAILING_INLINE_RE.test(textSegments[nextCount])) {
      nextCount += 1;
    }
    setVisibleCount(nextCount);

    const step = () => {
      let followingCount = Math.min(textSegments.length, nextCount + 1);
      while (followingCount < textSegments.length && TYPING_TRAILING_INLINE_RE.test(textSegments[followingCount])) {
        followingCount += 1;
      }
      nextCount = followingCount;
      setVisibleCount(followingCount);
      if (followingCount >= textSegments.length) {
        typingTimerRef.current = 0;
        if (!typingCompleteNotifiedRef.current) {
          typingCompleteNotifiedRef.current = true;
          onTypingComplete?.();
        }
        return;
      }
      typingTimerRef.current = window.setTimeout(step, TYPING_STEP_MS);
    };

    typingTimerRef.current = window.setTimeout(step, TYPING_STEP_MS);
    return () => {
      clearTypingTimer();
    };
  }, [onTypingComplete, textSegments, typingEffect]);
  useEffect(() => () => {
    clearTypingTimer();
  }, []);
  const visibleText = typingEffect
    ? textSegments.slice(0, visibleCount).join("")
    : textSegments.join("");
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
  const showThinking = isAssistant && isStreaming && !String(visibleText || "").trim() && !showCards && !showAttachments;
  const tr = key => {
    const value = typeof t === "function" ? t(key) : "";
    return value && value !== key ? value : "";
  };
  const copyLabel = locale === "en" ? "Copy" : locale === "ru" ? "Копировать" : "Kopeeri";
  const copyTitle = copyLabel;
  const listenLabel = tr("chat.listen.last_reply") || "Loe ette";
  const listenTitle = tr("chat.listen.title") || listenLabel;
  const sourcesLabel = tr("chat.sources.heading") || "Allikad";
  const sourcesTitle = tr("chat.sources.dialog_label") || sourcesLabel;
  const actionsLabel = locale === "en" ? "Message actions" : locale === "ru" ? "Действия с сообщением" : "Sõnumi tegevused";
  const hasMessageSources = Array.isArray(messageSources) && messageSources.length > 0;
  const assistantActionsClassName =
    "mt-[0.54rem] flex w-full items-center gap-[0.46rem] text-[color:var(--chat-composer-action-icon-color,#c57171)]";
  const assistantActionButtonClassName =
    "inline-flex h-[2.15rem] w-[2.15rem] items-center justify-center rounded-full border-0 bg-transparent p-0 " +
    "text-current shadow-none outline-none transition-opacity duration-150 " +
    "focus-visible:ring-2 focus-visible:ring-current/35 " +
    "disabled:cursor-not-allowed disabled:opacity-45";
  const assistantActionIconClassName = "h-[1.56rem] w-[1.56rem]";
  const timestampClassName =
    "inline-flex h-[2.15rem] select-none items-center whitespace-nowrap text-[1.08rem] leading-none tracking-[0.02em] text-[color:var(--chat-composer-action-icon-color,#c57171)] opacity-75";
  const assistantTimestampClassName = cn(timestampClassName, "ml-auto pr-[0.18rem]");
  const userTimestampClassName =
    "mt-[0.48rem] mr-[0.34rem] select-none whitespace-nowrap text-[0.9rem] leading-none tracking-[0.02em] text-[color:var(--input-text)] opacity-55";
  const handleCopy = async () => {
    const value = String(text || "").trim();
    if (!value || typeof navigator === "undefined") return;
    try {
      await navigator.clipboard?.writeText(value);
    } catch {}
  };
  const handleSpeak = () => {
    const value = String(text || "").trim();
    if (!value) return;
    onSpeak?.(value);
  };
  const toggleUserTimestamp = () => {
    if (!messageTime) return;
    setUserTimeVisible(prev => !prev);
  };
  const handleUserBubbleKeyDown = event => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    toggleUserTimestamp();
  };
  const attachmentsWrapClassName = "mt-[0.45rem] flex flex-wrap gap-[0.45rem]";
  const attachmentLinkClassName =
    "inline-flex items-center justify-center rounded-full border border-[rgba(240,240,240,0.45)] " +
    "bg-[rgba(14,20,32,0.3)] px-[0.75rem] py-[0.3rem] text-[0.88rem] leading-[1.2] " +
    "text-[color:var(--pt-150)] no-underline transition-colors duration-150 " +
    "hover:bg-[rgba(14,20,32,0.45)] focus-visible:bg-[rgba(14,20,32,0.45)] " +
    "light:border-[rgba(15,23,42,0.2)] light:bg-[rgba(255,255,255,0.75)] light:text-[color:var(--input-text)] " +
    "light:hover:bg-[rgba(255,255,255,0.92)] light:focus-visible:bg-[rgba(255,255,255,0.92)] " +
    "[.theme-mid_&]:border-[rgba(122,58,56,0.18)] [.theme-mid_&]:bg-[rgba(255,246,243,0.82)] [.theme-mid_&]:text-[#4e201e] " +
    "[.theme-mid_&]:hover:bg-[rgba(255,250,248,0.96)] [.theme-mid_&]:focus-visible:bg-[rgba(255,250,248,0.96)]";
  const cardsWrapClassName = "mt-[0.55rem] grid gap-[0.55rem]";
  const cardClassName =
    "rounded-[1rem] border border-[rgba(240,240,240,0.18)] bg-[rgba(14,20,32,0.26)] " +
    "px-[0.9rem] py-[0.78rem] text-left shadow-[0_0.32rem_0.85rem_rgba(5,8,15,0.12)] " +
    "light:border-[rgba(15,23,42,0.12)] light:bg-[rgba(255,255,255,0.82)]";
  if (!isAssistant && !isOwn) {
    return <div className={messageWrapClassName} role="article" tabIndex={0} data-chat-message-id={messageId}>
        {displayAuthorName ? <div className={nameClassName}>{displayAuthorName}</div> : null}
        <div className={cn(messageBaseClassName, memberTextClassName)}>
          <span className="sr-only">
            {authorLabel}
            {": "}
          </span>
        <div className="whitespace-pre-wrap [overflow-wrap:break-word] [hyphens:auto]" lang={locale}>{text}</div>
        </div>
      </div>;
  }
  if (isOwn) {
    return <div className={cn(messageBaseClassName, userMessageRowClassName)} role="article" tabIndex={0} data-chat-message-id={messageId}>
        <span className="sr-only">
          {authorLabel}
          {": "}
        </span>

        {text ? <div className={userMessageStackClassName}>
            <div
              className={userBubbleClassName}
              role={messageTime ? "button" : undefined}
              tabIndex={messageTime ? 0 : undefined}
              aria-expanded={messageTime ? userTimeVisible : undefined}
              onClick={toggleUserTimestamp}
              onKeyDown={handleUserBubbleKeyDown}
            >
              <div className="min-w-0 max-w-full whitespace-pre-wrap [overflow-wrap:break-word] [hyphens:auto]" lang={locale}>{visibleText}</div>
            </div>
            {messageTime && userTimeVisible ? (
              <time className={userTimestampClassName} dateTime={messageTime.iso}>
                {messageTime.label}
              </time>
            ) : null}
          </div> : null}
      </div>;
  }
  return <div className={cn(messageBaseClassName, isAssistant ? aiBubbleClassName : userBubbleClassName)} role="article" tabIndex={0} data-chat-message-id={messageId} lang={locale}>
      <span className="sr-only">
        {authorLabel}
        {": "}
      </span>

      {text ? (
        <AssistantMarkdown text={visibleText} />
      ) : null}
      {showThinking ? (
        <span className={thinkingClassName} style={thinkingStyle} aria-label={thinkingLabel}>
          {thinkingLabel}
        </span>
      ) : null}
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
      {isAssistant && String(text || "").trim() ? (
        <div className={assistantActionsClassName} aria-label={actionsLabel}>
          <button
            type="button"
            className={assistantActionButtonClassName}
            aria-label={listenLabel}
            title={listenTitle}
            onClick={handleSpeak}
            disabled={!voiceEnabled || !canSpeak}
            data-speaking={isSpeaking ? "true" : "false"}
          >
            <svg aria-hidden="true" width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={assistantActionIconClassName}>
              <path d="M11 5 6 9H2v6h4l5 4z" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          </button>
          <button
            type="button"
            className={assistantActionButtonClassName}
            aria-label={copyLabel}
            title={copyTitle}
            onClick={handleCopy}
          >
            <svg aria-hidden="true" width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={assistantActionIconClassName}>
              <rect x="9" y="9" width="10" height="10" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" />
            </svg>
          </button>
          {hasMessageSources ? (
            <button
              type="button"
              className={assistantActionButtonClassName}
              aria-label={sourcesLabel}
              title={sourcesTitle}
              onClick={() => onShowSources?.(messageSources)}
            >
              <SourcesIcon isLightTheme={isLightTheme} className={assistantActionIconClassName} />
            </button>
          ) : null}
          {messageTime ? (
            <time className={assistantTimestampClassName} dateTime={messageTime.iso}>
              {messageTime.label}
            </time>
          ) : null}
        </div>
      ) : null}
    </div>;
});
export default ChatMessageItem;
