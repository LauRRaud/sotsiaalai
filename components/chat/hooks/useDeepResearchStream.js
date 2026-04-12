import { useCallback, useRef, useState } from "react";
import { createSSEReader as defaultCreateSSEReader } from "@/components/chat/utils/sse";

function parseEventData(raw) {
  const text = String(raw || "").trim();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

function stageLabel(stage, t) {
  if (stage === "planning") return t("chat.deep_research.stage_planning");
  if (stage === "retrieving") return t("chat.deep_research.stage_retrieving");
  if (stage === "synthesizing") return t("chat.deep_research.stage_synthesizing");
  return "";
}

function makeProgressText(stage, t) {
  const base = t("chat.deep_research.running");
  const step = stageLabel(stage, t);
  return step ? `${base}\n${step}` : base;
}

function translateDeepResearchError(key, t) {
  const resolved = t(key);
  return resolved && resolved !== key ? resolved : t("chat.deep_research.error_generic");
}

function normalizeGeo(rawGeo = {}) {
  const levelRaw = String(rawGeo?.level || "ALL").trim().toUpperCase();
  const level =
    levelRaw === "NATIONAL" || levelRaw === "MUNICIPALITY" || levelRaw === "DISTRICT"
      ? levelRaw
      : "ALL";
  return {
    level,
    country: "EE",
    municipality_id: String(rawGeo?.municipality_id || rawGeo?.municipalityId || "").trim(),
    municipality_name: String(rawGeo?.municipality_name || "").trim(),
    district_id: String(rawGeo?.district_id || rawGeo?.districtId || "").trim(),
    district_name: String(rawGeo?.district_name || "").trim(),
  };
}

function normalizeSources(rawSources) {
  if (!Array.isArray(rawSources)) return [];
  return rawSources
    .filter(item => item && typeof item === "object")
    .map(item => ({
      id: String(item.id || "").trim() || undefined,
      title: String(item.title || "").trim() || undefined,
      url: String(item.url || "").trim() || undefined,
      fileName: String(item.fileName || "").trim() || undefined,
      section: String(item.section || "").trim() || undefined,
      year: Number.isFinite(Number(item.year)) ? Number(item.year) : undefined,
      issueLabel: String(item.issueLabel || "").trim() || undefined,
      pageRange: String(item.pageRange || "").trim() || undefined,
      short_ref: String(item.short_ref || "").trim() || undefined,
      source_type: String(item.source_type || "").trim() || undefined,
    }))
    .filter(item => item.id || item.title || item.url || item.fileName);
}

export function useDeepResearchStream({
  convId,
  userRole,
  locale,
  t,
  appendMessage,
  mutateMessage,
  onFocusInput,
  setErrorBanner,
  requestConversationsRefresh,
  createSSEReader,
}) {
  const [isResearching, setIsResearching] = useState(false);
  const activeControllerRef = useRef(null);
  const activeJobIdRef = useRef(null);
  const activeMessageIdRef = useRef(null);
  const cancelledRef = useRef(false);

  const stopResearch = useCallback(async () => {
    cancelledRef.current = true;
    const activeJobId = activeJobIdRef.current;
    try {
      activeControllerRef.current?.abort?.();
    } catch {}
    activeControllerRef.current = null;
    activeJobIdRef.current = null;
    setIsResearching(false);
    if (activeMessageIdRef.current != null) {
      mutateMessage?.(activeMessageIdRef.current, msg => ({
        ...msg,
        isStreaming: false,
        text: t("chat.deep_research.cancelled"),
      }));
      activeMessageIdRef.current = null;
    }
    if (activeJobId) {
      try {
        await fetch(`/api/research/jobs/${encodeURIComponent(activeJobId)}`, {
          method: "DELETE",
        });
      } catch {}
    }
  }, [mutateMessage, t]);

  const runDeepResearch = useCallback(
    async (rawQuery, options = {}) => {
      const query = String(rawQuery || "").trim();
      if (!query) return false;
      if (isResearching) return false;
      const outputStyle =
        String(options?.outputStyle || "").trim().toUpperCase() === "SOCIAL_WORKER"
          ? "SOCIAL_WORKER"
          : String(options?.outputStyle || "").trim().toUpperCase() === "CLIENT"
            ? "CLIENT"
            : userRole === "SOCIAL_WORKER"
              ? "SOCIAL_WORKER"
              : "CLIENT";
      const geo = normalizeGeo(options?.geo || {});

      cancelledRef.current = false;
      setErrorBanner?.(null);
      appendMessage?.({
        role: "user",
        text: query,
        aiVisible: true,
      });
      const streamingMessageId = appendMessage?.({
        role: "ai",
        text: makeProgressText("planning", t),
        isStreaming: true,
        aiVisible: true,
      });
      activeMessageIdRef.current = streamingMessageId;
      setIsResearching(true);
      onFocusInput?.();

      try {
        const createRes = await fetch("/api/research/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "deep_research",
            query,
            sources: "rag_only",
            profile: "standard",
            convId,
            persist: true,
            output_style: outputStyle,
            uiLocale: locale || "et",
            geo,
          }),
        });
        const createBody = await createRes.json().catch(() => ({}));
        if (!createRes.ok || !createBody?.id) {
          throw new Error(createBody?.messageKey || "chat.deep_research.error_generic");
        }

        const jobId = String(createBody.id);
        activeJobIdRef.current = jobId;
        const controller = new AbortController();
        activeControllerRef.current = controller;

        const streamRes = await fetch(
          `/api/research/jobs/${encodeURIComponent(jobId)}/stream`,
          {
            method: "GET",
            headers: { Accept: "text/event-stream" },
            signal: controller.signal,
          }
        );
        if (!streamRes.ok || !streamRes.body) {
          throw new Error("chat.deep_research.error_generic");
        }

        const reader = (createSSEReader || defaultCreateSSEReader)(streamRes.body);
        let finalText = "";
        let finalSources = [];
        let hadError = false;

        for await (const event of reader) {
          if (cancelledRef.current) break;
          const data = parseEventData(event?.data);
          if (event?.event === "progress") {
            const stage = String(data?.stage || "").trim().toLowerCase();
            mutateMessage?.(streamingMessageId, msg => ({
              ...msg,
              text: makeProgressText(stage, t),
            }));
            continue;
          }
          if (event?.event === "result") {
            finalText = String(data?.result?.report_text || "").trim();
            finalSources = normalizeSources(data?.result?.sources);
            mutateMessage?.(streamingMessageId, msg => ({
              ...msg,
              text: finalText || t("chat.deep_research.error_generic"),
              sources: finalSources,
              isStreaming: false,
            }));
            continue;
          }
          if (event?.event === "error") {
            hadError = true;
            const key = String(data?.message || "").trim() || "chat.deep_research.error_generic";
            const message = translateDeepResearchError(key, t);
            setErrorBanner?.(message);
            mutateMessage?.(streamingMessageId, msg => ({
              ...msg,
              text: message,
              isStreaming: false,
            }));
            continue;
          }
          if (event?.event === "done") {
            break;
          }
        }

        if (!hadError && !finalText && !cancelledRef.current) {
          mutateMessage?.(streamingMessageId, msg => ({
            ...msg,
            text: t("chat.deep_research.error_generic"),
            isStreaming: false,
          }));
        }
        requestConversationsRefresh?.();
        return true;
      } catch (error) {
        if (!cancelledRef.current) {
          const key = String(error?.message || "").trim() || "chat.deep_research.error_generic";
          const message = translateDeepResearchError(key, t);
          setErrorBanner?.(message);
          mutateMessage?.(streamingMessageId, msg => ({
            ...msg,
            text: message,
            isStreaming: false,
          }));
        }
        return false;
      } finally {
        activeControllerRef.current = null;
        activeJobIdRef.current = null;
        activeMessageIdRef.current = null;
        setIsResearching(false);
      }
    },
    [
      appendMessage,
      convId,
      createSSEReader,
      isResearching,
      locale,
      mutateMessage,
      onFocusInput,
      requestConversationsRefresh,
      setErrorBanner,
      t,
      userRole,
    ]
  );

  return {
    isResearching,
    runDeepResearch,
    stopResearch,
  };
}
