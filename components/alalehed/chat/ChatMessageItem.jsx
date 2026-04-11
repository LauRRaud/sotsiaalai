"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/components/ui/cn";
import CareerMessageRenderer from "@/components/career/CareerMessageRenderer";

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

function renderInlineMarkdown(text, keyPrefix) {
  const parts = [];
  const source = String(text || "");
  const boldRe = /\*\*([^*\n][\s\S]*?[^*\n])\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = boldRe.exec(source)) !== null) {
    if (match.index > lastIndex) {
      parts.push(source.slice(lastIndex, match.index));
    }
    parts.push(
      <strong key={`${keyPrefix}-strong-${match.index}`} className="font-semibold">
        {match[1]}
      </strong>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < source.length) {
    parts.push(source.slice(lastIndex));
  }

  return parts.length ? parts : source;
}

function parseMarkdownBlocks(text) {
  const lines = String(text || "").replace(/\r\n?/g, "\n").split("\n");
  const blocks = [];
  let paragraph = [];
  let list = null;

  const flushParagraph = () => {
    const content = paragraph.join("\n").trim();
    if (content) {
      blocks.push({ type: "paragraph", text: content });
    }
    paragraph = [];
  };

  const flushList = () => {
    if (list?.items?.length) {
      blocks.push(list);
    }
    list = null;
  };

  for (const line of lines) {
    const unordered = line.match(/^\s*[-*]\s+(.+)$/);
    const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
    const isIndentedContinuation = /^\s{2,}\S/.test(line);

    if (unordered || ordered) {
      flushParagraph();
      const type = ordered ? "ordered" : "unordered";
      if (!list || list.type !== type) {
        flushList();
        list = { type, items: [] };
      }
      list.items.push((ordered || unordered)[1].trim());
      continue;
    }

    if (isIndentedContinuation && list?.items?.length) {
      const lastIndex = list.items.length - 1;
      list.items[lastIndex] = `${list.items[lastIndex]}\n${line.trim()}`;
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  return blocks;
}

function AssistantMarkdown({ text }) {
  const blocks = useMemo(() => parseMarkdownBlocks(text), [text]);

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
                <li key={`${block.type}-${index}-${itemIndex}`} className="whitespace-pre-wrap">
                  {renderInlineMarkdown(item, `${block.type}-${index}-${itemIndex}`)}
                </li>
              ))}
            </ListTag>
          );
        }

        return (
          <p key={`paragraph-${index}`} className="m-0 whitespace-pre-wrap">
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
  careerResponse,
  careerSecondaryResponse,
  careerDocumentStep,
  careerGeneratedDocument,
  onCareerQuestionAnswer,
  aiVisible: _aiVisible,
  typingEffect = false,
  onTypingComplete,
  authorName,
  authorRole: _authorRole,
  isRoomMode: _isRoomMode,
  t
}) {
  const isAssistant = role === "ai";
  const isOwn = role === "user";
  const authorLabel = isAssistant ? t("chat.aria.assistant") : isOwn ? t("chat.aria.user") : authorName || t("chat.aria.user");
  const messageBaseClassName =
    "max-w-full leading-[1.45] mb-[0.35em]";
  const messageWrapClassName =
    "flex flex-col self-start mb-[0.35em] gap-[0.16em]";
  const nameClassName =
    "text-[0.95rem] tracking-[0.05em] text-[rgba(197,113,113,0.9)]";
  const userMessageRowClassName =
    "chat-msg-user flex w-full justify-end pr-[clamp(0.24rem,0.65vw,0.48rem)] max-[768px]:pr-[0.08rem]";
  const userBubbleClassName =
    "chat-msg-user-bubble inline-block w-fit max-w-[min(84%,44rem)] text-left " +
    "[background:color-mix(in_srgb,var(--chat-tools-panel-bg,var(--opaque-panel-bg,var(--rail-tooltip-bg,var(--subpage-card-bg))))_72%,transparent)] " +
    "border-0 rounded-[1.28rem] rounded-br-[0.5rem] " +
    "[.theme-light_&]:[background:color-mix(in_srgb,var(--chat-tools-panel-bg,var(--opaque-panel-bg,var(--rail-tooltip-bg,var(--subpage-card-bg))))_88%,white)] " +
    "[.theme-mid_&]:[background:var(--mid-utility-panel-bg-hover,var(--chat-tools-panel-bg,var(--opaque-panel-bg,var(--rail-tooltip-bg,var(--subpage-card-bg)))))] " +
    "[.theme-mid_&]:border-0 " +
    "px-[0.96rem] py-[0.72rem] text-[1.16rem] leading-[1.42] tracking-[0.015em] font-[400] " +
    "text-[color:var(--opaque-panel-text,var(--rail-tooltip-text,var(--input-text)))] shadow-none " +
    "[-webkit-backdrop-filter:none] [backdrop-filter:none] transition-[transform] duration-200";
  const memberBubbleClassName =
    "self-start text-left bg-[rgba(14,20,32,0.2)] " +
    "border-2 border-[rgba(240,240,240,0.35)] rounded-[1.15em] rounded-bl-[0.55em] " +
    "px-[1em] py-[0.62em] shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_0.32rem_0.85rem_rgba(5,8,15,0.12)] " +
    "light:border-[rgba(15,23,42,0.16)] light:bg-[rgba(255,255,255,0.74)]";
  const aiBubbleClassName =
    "chat-msg-ai self-start w-full bg-transparent border-0 shadow-none py-[0.25em] pr-[clamp(0.5rem,1.6vw,1.05rem)] max-[768px]:pr-[0.4rem] " +
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
  const showCareerResponse =
    isAssistant &&
    (careerResponse || careerSecondaryResponse || careerDocumentStep || careerGeneratedDocument);
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
    return <div className={messageWrapClassName} role="article" tabIndex={0} data-chat-message-id={messageId}>
        {authorName ? <div className={nameClassName}>{authorName}</div> : null}
        <div className={cn(messageBaseClassName, memberBubbleClassName)}>
          <span className="sr-only">
            {authorLabel}
            {": "}
          </span>
          <div className="whitespace-pre-wrap">{text}</div>
        </div>
      </div>;
  }
  if (isOwn) {
    return <div className={cn(messageBaseClassName, userMessageRowClassName)} role="article" tabIndex={0} data-chat-message-id={messageId}>
        <span className="sr-only">
          {authorLabel}
          {": "}
        </span>

        {text ? <div className={userBubbleClassName}>
            <div className="whitespace-pre-wrap">{visibleText}</div>
          </div> : null}
      </div>;
  }
  return <div className={cn(messageBaseClassName, isAssistant ? aiBubbleClassName : userBubbleClassName)} role="article" tabIndex={0} data-chat-message-id={messageId}>
      <span className="sr-only">
        {authorLabel}
        {": "}
      </span>

      {text ? (
        <AssistantMarkdown text={visibleText} />
      ) : null}
      {showCareerResponse ? (
        <CareerMessageRenderer
          response={careerResponse}
          secondaryResponse={careerSecondaryResponse}
          documentStep={careerDocumentStep}
          generatedDocument={careerGeneratedDocument}
          onQuestionAnswer={onCareerQuestionAnswer}
        />
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
    </div>;
});
export default ChatMessageItem;
