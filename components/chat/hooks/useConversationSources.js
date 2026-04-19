import { useEffect, useMemo, useRef, useState } from "react";
import { collapsePages, formatSourceLabel, normalizePageRange } from "../utils/sources.js";

function normalizeIdentityText(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .toLowerCase()
    .replace(/[.!?\s]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isIdentityQuestionText(text = "") {
  const normalized = normalizeIdentityText(text);
  if (!normalized) return false;
  return (
    /\b(kes sa oled|kes te olete|mis sa oled|who are you|what are you)\b/.test(normalized) ||
    /\b(mis assistent sa oled|milline assistent sa oled|what assistant are you)\b/.test(normalized) ||
    /\b(?:(?:kas )?oled(?: sa)? (?:chatgpt|openai|sotsiaalai)|kas sa oled (?:chatgpt|openai|sotsiaalai)|are you (?:chatgpt|openai|sotsiaalai)|(?:chatgpt|openai|sotsiaalai) assistent)\b/.test(normalized) ||
    /^(?:chatgpt|openai|sotsiaalai)(?:\s+assistent)?$/.test(normalized)
  );
}

function isSourceFreeIdentityAnswer(text = "") {
  const normalized = normalizeIdentityText(text);
  return (
    normalized === "olen sotsiaalai vestlusassistent" ||
    normalized === "i am the sotsiaalai chat assistant" ||
    normalized === "im the sotsiaalai chat assistant" ||
    normalized === "я чат-ассистент sotsiaalai"
  );
}

export function collectLatestAnswerSources(messages, uploadPreview) {
  const map = new Map();
  const uploadName = typeof uploadPreview?.fileName === "string" ? uploadPreview.fileName.trim().toLowerCase() : "";
  const isDbSource = src => {
    if (!src) return false;
    const fileName = typeof src.fileName === "string" ? src.fileName.trim().toLowerCase() : "";
    if (uploadName && fileName && fileName === uploadName) return false;
    const sourceType = typeof src.sourceType === "string" ? src.sourceType : typeof src.source_type === "string" ? src.source_type : typeof src.origin === "string" ? src.origin : typeof src.type === "string" ? src.type : "";
    if (sourceType.toLowerCase().includes("ephemeral")) return false;
    if (sourceType.toLowerCase().includes("upload")) return false;
    const hasDbHint = !!src.url || !!src.short_ref || !!src.journalTitle || Array.isArray(src.authors) && src.authors.length > 0;
    if (!hasDbHint && fileName) return false;
    return true;
  };
  const messageList = Array.isArray(messages) ? messages : [];
  let latestAssistantMessage = null;
  let latestAssistantIndex = -1;
  for (let i = messageList.length - 1; i >= 0; i -= 1) {
    const role = String(messageList[i]?.role || "").toLowerCase();
    if (role !== "ai" && role !== "assistant") continue;
    latestAssistantMessage = messageList[i];
    latestAssistantIndex = i;
    break;
  }
  let previousUserMessage = null;
  for (let i = latestAssistantIndex - 1; i >= 0; i -= 1) {
    const role = String(messageList[i]?.role || "").toLowerCase();
    if (role !== "user" && role !== "client" && role !== "member") continue;
    previousUserMessage = messageList[i];
    break;
  }
  const latestAnswerText = String(latestAssistantMessage?.text || "").trim();
  if (
    isSourceFreeIdentityAnswer(latestAnswerText) ||
    (
      isIdentityQuestionText(previousUserMessage?.text) &&
      (!latestAnswerText || isSourceFreeIdentityAnswer(latestAnswerText))
    )
  ) {
    return [];
  }
  const sources = Array.isArray(latestAssistantMessage?.sources) ? latestAssistantMessage.sources : [];
  sources.forEach((src, idx) => {
    if (!isDbSource(src)) return;
    const url = typeof src?.url === "string" && src.url.trim() ? src.url.trim() : "";
    const label =
      typeof src?.label === "string" && src.label.trim()
        ? src.label.trim()
        : formatSourceLabel(src && typeof src === "object" ? src : { title: "Allikas" });
    const pageText = normalizePageRange(src?.pageRange) || collapsePages([...(Array.isArray(src?.pages) ? src.pages : []), ...(src?.page ? [src.page] : [])]);
    const section = typeof src?.section === "string" ? src.section : undefined;
    const key = src?.key || src?.id || url || `${label}-${pageText || ""}-${idx}`;
    const existing = map.get(key) || {
      key,
      label,
      pageText,
      section,
      allUrls: [],
      occurrences: 0
    };
    if (url && !existing.allUrls.includes(url)) existing.allUrls.push(url);
    existing.occurrences += 1;
    map.set(key, existing);
  });
  return Array.from(map.values());
}

export function useConversationSources({
  messages,
  showSourcesPanel,
  uploadPreview
}) {
  const [sourcesPulse, setSourcesPulse] = useState(false);
  const sourcesPulseTimerRef = useRef(null);
  const prevSourcesCountRef = useRef(0);
  const conversationSources = useMemo(() => {
    return collectLatestAnswerSources(messages, uploadPreview);
  }, [messages, uploadPreview]);
  const hasConversationSources = conversationSources.length > 0;
  useEffect(() => {
    const currentCount = conversationSources.length;
    const prevCount = prevSourcesCountRef.current;
    prevSourcesCountRef.current = currentCount;
    if (!showSourcesPanel && currentCount > prevCount && currentCount > 0) {
      setSourcesPulse(true);
      if (sourcesPulseTimerRef.current) {
        window.clearTimeout(sourcesPulseTimerRef.current);
      }
      sourcesPulseTimerRef.current = window.setTimeout(() => {
        setSourcesPulse(false);
      }, 1000);
    }
    return () => {
      if (sourcesPulseTimerRef.current) {
        window.clearTimeout(sourcesPulseTimerRef.current);
      }
    };
  }, [conversationSources.length, showSourcesPanel]);
  return {
    conversationSources,
    hasConversationSources,
    sourcesPulse
  };
}
