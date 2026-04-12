import { useCallback, useRef, useState } from "react";
import { createSSEReader as defaultCreateSSEReader } from "@/components/chat/utils/sse";
import {
  normalizeGeo,
  normalizeSources,
  pollResearchJobUntilTerminal,
  translateDeepResearchError,
} from "@/components/chat/hooks/deepResearchClient";

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

      let jobId = "";
      let controller = null;

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

        jobId = String(createBody.id);
        activeJobIdRef.current = jobId;
        controller = new AbortController();
        activeControllerRef.current = controller;

        let finalText = "";
        let finalSources = [];
        let hadError = false;
        let fallbackAttempted = false;

        const applyTerminalJob = job => {
          const status = String(job?.status || "").trim().toLowerCase();
          if (status === "done") {
            finalText = String(job?.result?.report_text || "").trim();
            finalSources = normalizeSources(job?.result?.sources);
            mutateMessage?.(streamingMessageId, msg => ({
              ...msg,
              text: finalText || t("chat.deep_research.error_generic"),
              sources: finalSources,
              isStreaming: false,
            }));
            return true;
          }
          if (status === "error" || status === "cancelled") {
            hadError = true;
            const key = String(job?.error || "").trim() || "chat.deep_research.error_generic";
            const message = translateDeepResearchError(key, t);
            setErrorBanner?.(message);
            mutateMessage?.(streamingMessageId, msg => ({
              ...msg,
              text: message,
              isStreaming: false,
            }));
            return true;
          }
          return false;
        };

        const recoverFromPersistedJob = async () => {
          if (fallbackAttempted || cancelledRef.current || !jobId) return false;
          fallbackAttempted = true;
          const job = await pollResearchJobUntilTerminal(jobId, {
            signal: controller?.signal,
            intervalMs: 2500,
            maxAttempts: 24,
          });
          return applyTerminalJob(job);
        };

        try {
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
        } catch (streamError) {
          if (!cancelledRef.current && !(await recoverFromPersistedJob())) {
            throw streamError;
          }
        }

        if (!hadError && !finalText && !cancelledRef.current && !(await recoverFromPersistedJob())) {
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
