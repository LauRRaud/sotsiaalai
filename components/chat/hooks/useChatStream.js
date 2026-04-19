import { startTransition, useCallback, useEffect, useRef, useState } from "react";
import { createSSEReader as defaultCreateSSEReader } from "../utils/sse";
import { normalizeSources as defaultNormalizeSources } from "../utils/sources";
import { localizePath } from "@/lib/localizePath";

function formatI18n(template, values) {
  if (!values) return template;
  let out = template;
  for (const [key, value] of Object.entries(values)) {
    out = out.split(`{${key}}`).join(String(value));
  }
  return out;
}

function createLocalizedError(key, values) {
  const err = new Error(key);
  err.chatKey = key;
  err.chatValues = values;
  return err;
}

function normalizeAttachments(payload) {
  if (!Array.isArray(payload)) return [];
  return payload
    .filter(item => item && typeof item === "object")
    .map(item => {
      const label = String(item.label || "").trim();
      const url = String(item.url || "").trim();
      const fileName = String(item.fileName || "").trim();
      const format = String(item.format || "").trim();
      if (!url) return null;
      return {
        label: label || "Download file",
        url,
        ...(fileName ? { fileName } : {}),
        ...(format ? { format } : {})
      };
    })
    .filter(Boolean);
}

function normalizeCards(payload) {
  if (!Array.isArray(payload)) return [];
  return payload
    .filter((item) => item && typeof item === "object")
    .map((item) => {
      const title = String(item.title || "").trim();
      const subtitle = String(item.subtitle || "").trim();
      const body = String(item.body || "").trim();
      const meta = String(item.meta || "").trim();
      const hint = String(item.hint || "").trim();
      if (!title && !body) return null;
      return {
        ...(title ? { title } : {}),
        ...(subtitle ? { subtitle } : {}),
        ...(body ? { body } : {}),
        ...(meta ? { meta } : {}),
        ...(hint ? { hint } : {})
      };
    })
    .filter(Boolean);
}

function normalizeWorkflow(payload) {
  return payload && typeof payload === "object" ? payload : null;
}

function dispatchHelpListingsRefresh(workflow) {
  if (typeof window === "undefined") return;
  const helpState = workflow?.help;
  if (!helpState || typeof helpState !== "object") return;
  const justSaved =
    helpState.step === "saved" ||
    helpState.mode === "saved" ||
    (
      helpState.step === "browse" &&
      helpState.mode === "browse" &&
      !!helpState.sourceRecordId
    );
  if (!justSaved) return;
  try {
    window.dispatchEvent(new CustomEvent("sotsiaalai:refresh-help-listings"));
  } catch {}
}

export function useChatStream(config) {
  const cfgRef = useRef(config);

  useEffect(() => {
    cfgRef.current = config;
  }, [config]);

  const [isGenerating, setIsGenerating] = useState(false);
  const isGeneratingRef = useRef(false);

  useEffect(() => {
    isGeneratingRef.current = isGenerating;
  }, [isGenerating]);

  const abortRef = useRef(null);

  const stop = useCallback(() => {
    try {
      abortRef.current?.abort?.();
    } catch {}
    abortRef.current = null;
    isGeneratingRef.current = false;
    setIsGenerating(false);
  }, []);

  const sendMessage = useCallback(async rawText => {
    const cfg = cfgRef.current;
    const tr = (key, values) => {
      const value = cfg?.t?.(key);
      const text = typeof value === "string" && value.trim() ? value : key;
      return formatI18n(text, values);
    };

    const text = String(rawText ?? "").trim();
    if (!text) return false;
    if (isGeneratingRef.current) return false;

    cfg.setErrorBanner?.(null);
    cfg.setIsCrisis?.(false);

    if (cfg.isRoomMode) {
      if (cfg.roomBlocked) {
        return false;
      }
      if (cfg.roomAuthRequired) {
        return false;
      }

      try {
        const roomPathId = encodeURIComponent(String(cfg.roomId || ""));
        const res = await fetch(`/api/rooms/${roomPathId}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            content: text
          })
        });
        const data = await res.json().catch(() => ({}));

        if (res.status === 403) {
          return false;
        }
        if (res.status === 401) {
          return false;
        }
        if (!res.ok || data?.ok === false) {
          throw createLocalizedError("chat.room.send_error");
        }

        if (data?.message?.id && cfg.sendToAssistant) {
          cfg.onRoomMessageSent?.(data.message.id);
        }
      } catch {
        cfg.setErrorBanner?.(tr("chat.room.send_error"));
        return false;
      }
    }

    const shouldSendToAssistant = cfg.isRoomMode ? cfg.sendToAssistant : true;
    const isInitialHelpLaunch =
      (cfg.activeWorkflow === "help_request" || cfg.activeWorkflow === "help_offer")
      && Array.isArray(cfg.historyPayload)
      && cfg.historyPayload.length === 0;
    const selectedChatMode = isInitialHelpLaunch
      ? cfg.activeWorkflow
      : "rag";

    cfg.appendMessage?.({
      role: "user",
      text,
      aiVisible: shouldSendToAssistant
    });

    isGeneratingRef.current = shouldSendToAssistant;
    setIsGenerating(shouldSendToAssistant);
    cfg.onFocusInput?.();

    if (!shouldSendToAssistant) return true;

    const controller = new AbortController();
    abortRef.current = controller;

    const clientTimeout = setTimeout(() => controller.abort(), 180000);
    let streamingMessageId = null;
    let visibleText = "";
    let sources = [];
    let attachments = [];
    let cards = [];
    let workflow = null;
    const latestHelpWorkflowState = !cfg.isRoomMode && typeof cfg.getLatestHelpWorkflowState === "function"
      ? normalizeWorkflow(cfg.getLatestHelpWorkflowState())
      : normalizeWorkflow(cfg.helpWorkflowState);
    const doPushVisibleText = () => {
      if (streamingMessageId == null) return;
      startTransition(() => {
        cfg.mutateMessage?.(streamingMessageId, msg => ({
          ...msg,
          text: visibleText
        }));
      });
    };

    const flushAllPending = () => {
      doPushVisibleText();
    };

    const runStream = async () => {
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            message: text,
            history: cfg.historyPayload,
            role: cfg.userRole,
            stream: true,
            persist: true,
            convId: cfg.convId,
            uiLocale: cfg.locale || "et",
            chatMode: selectedChatMode,
            helpWorkflowState: !cfg.isRoomMode && latestHelpWorkflowState && typeof latestHelpWorkflowState === "object"
              ? latestHelpWorkflowState
              : undefined,
            roomId: cfg.isRoomMode ? cfg.roomId : undefined,
            ...(cfg.ephemeralChunks?.length
              ? {
                  ephemeralChunks: cfg.ephemeralChunks,
                  ...((cfg.ephemeralSource?.fileName || cfg.uploadPreview?.fileName)
                    ? {
                        ephemeralSource: {
                          fileName: cfg.ephemeralSource?.fileName || cfg.uploadPreview?.fileName,
                          ...(Array.isArray(cfg.ephemeralSource?.fileNames) && cfg.ephemeralSource.fileNames.length
                            ? {
                                fileNames: cfg.ephemeralSource.fileNames
                              }
                            : {})
                        }
                      }
                    : {}),
                  combineSources: !cfg.docOnlyMode
                }
              : {})
          }),
          signal: controller.signal
        });

        clearTimeout(clientTimeout);

        let parsedBody = null;
        let parsedBodyLoaded = false;
        const readJsonBody = async () => {
          if (parsedBodyLoaded) return parsedBody;
          parsedBodyLoaded = true;
          try {
            parsedBody = await res.json();
          } catch {
            parsedBody = null;
          }
          return parsedBody;
        };
        const readApiErrorKey = payload => {
          const key = typeof payload?.messageKey === "string" ? payload.messageKey.trim() : "";
          if (key) return key;
          const message = typeof payload?.message === "string" ? payload.message.trim() : "";
          if (!message) return "";
          if (/^[a-z][a-z0-9_.:-]*$/i.test(message)) return message;
          return "";
        };

        if (res.status === 401) {
          if (cfg.onAuthRedirect) {
            cfg.onAuthRedirect();
          } else if (typeof window !== "undefined") {
            const callbackUrl = localizePath("/vestlus", cfg.locale || "et");
            const params = new URLSearchParams({
              callbackUrl
            });
            window.location.href = `/api/auth/signin?${params.toString()}`;
          }
          return true;
        }

        if (res.status === 403) {
          const data = await readJsonBody();
          if (data?.requireSubscription && data?.redirect && typeof window !== "undefined") {
            window.location.href = String(data.redirect);
            return true;
          }
          const key = readApiErrorKey(data);
          throw createLocalizedError(key || (cfg.isRoomMode ? "chat.room.blocked" : "api.common.forbidden"));
        }

        if (res.status === 429) {
          const retry = res.headers.get("retry-after");
          if (retry) {
            throw createLocalizedError("chat.error.rate_limit_retry", {
              seconds: retry
            });
          }
          throw createLocalizedError("chat.error.rate_limit_generic");
        }

        const contentType = res.headers.get("content-type") || "";

        if (!contentType.includes("text/event-stream")) {
          const data = await readJsonBody();

          if (!res.ok) {
            throw createLocalizedError(readApiErrorKey(data) || "chat.error.no_response");
          }

          const replyText = (data?.answer ?? data?.reply) || tr("chat.error.no_answer");
          const normalize = cfg.normalizeSources || defaultNormalizeSources;
          const normSources = normalize(data?.sources);
          const attachments = normalizeAttachments(data?.attachments);
          const cards = normalizeCards(data?.cards);
          const workflow = normalizeWorkflow(data?.workflow);

          cfg.setIsCrisis?.(!!data?.isCrisis);

          const createdId = cfg.appendMessage?.({
            role: "ai",
            text: replyText,
            sources: normSources,
            attachments,
            cards,
            workflow,
            aiVisible: true,
            ...(cfg.isRoomMode ? { roomScoped: true } : {})
          });

          cfg.onAssistantMessageCreated?.(createdId);
          dispatchHelpListingsRefresh(workflow);
          cfg.requestConversationsRefresh?.();
          return true;
        }

        if (!res.ok) {
          const data = await readJsonBody();
          throw createLocalizedError(readApiErrorKey(data) || "chat.error.no_response");
        }

        if (!res.body) {
          throw createLocalizedError("chat.error.stream_missing");
        }

        const reader = (cfg.createSSEReader || defaultCreateSSEReader)(res.body);

        streamingMessageId = cfg.appendMessage?.({
          role: "ai",
          text: "",
          isStreaming: true,
          aiVisible: true,
          ...(cfg.isRoomMode ? { roomScoped: true } : {})
        });

        cfg.onAssistantMessageCreated?.(streamingMessageId);

        for await (const ev of reader) {
          if (ev.event === "meta") {
            try {
              const payload = JSON.parse(ev.data);
              const rawSources = Array.isArray(payload?.sources)
                ? payload.sources
                : Array.isArray(payload?.groups)
                  ? payload.groups
                  : null;
              if (rawSources) {
                const normalize = cfg.normalizeSources || defaultNormalizeSources;
                sources = normalize(rawSources);
                cfg.mutateMessage?.(streamingMessageId, msg => ({
                  ...msg,
                  sources
                }));
              }
              workflow = normalizeWorkflow(payload?.workflow);
              if (workflow) {
                cfg.mutateMessage?.(streamingMessageId, msg => ({
                  ...msg,
                  workflow
                }));
              }
              if (typeof payload?.isCrisis !== "undefined") {
                cfg.setIsCrisis?.(!!payload.isCrisis);
              }
            } catch {}
          } else if (ev.event === "delta") {
            try {
              const payload = JSON.parse(ev.data);
              if (payload?.t) {
                visibleText += payload.t;
                doPushVisibleText();
              }
            } catch {}
          } else if (ev.event === "error") {
            throw createLocalizedError("chat.error.stream_failed");
          } else if (ev.event === "done") {
            try {
              const payload = ev?.data ? JSON.parse(ev.data) : {};
              attachments = normalizeAttachments(payload?.attachments);
              cards = normalizeCards(payload?.cards);
            } catch {}
            break;
          }
        }

        flushAllPending();

        cfg.mutateMessage?.(streamingMessageId, msg => ({
          ...msg,
          text: (visibleText || "").trim() || tr("chat.error.no_answer"),
          sources,
          attachments,
          cards,
          workflow: workflow || normalizeWorkflow(msg?.workflow),
          isStreaming: false
        }));

        dispatchHelpListingsRefresh(workflow);
        cfg.requestConversationsRefresh?.();
        streamingMessageId = null;
        return true;
      } catch (err) {
        flushAllPending();
        clearTimeout(clientTimeout);

        if (err?.name === "AbortError") {
          if (streamingMessageId != null) {
            cfg.mutateMessage?.(streamingMessageId, msg => ({
              ...msg,
              text: msg.text
                ? `${msg.text}\n\n${tr("chat.error.interrupted_suffix")}`
                : tr("chat.error.interrupted"),
              isStreaming: false
            }));
            streamingMessageId = null;
          } else {
            cfg.appendMessage?.({
              role: "ai",
              text: tr("chat.error.interrupted"),
              ...(cfg.isRoomMode ? { roomScoped: true } : {})
            });
          }
        } else {
          const isSilentRoomAccessError =
            cfg.isRoomMode &&
            (err?.chatKey === "chat.room.blocked" || err?.chatKey === "chat.room.auth_required");
          if (isSilentRoomAccessError) {
            return false;
          }
          const isSubscriptionRequired = err?.chatKey === "api.common.subscription_required";
          const errText = isSubscriptionRequired
            ? tr("chat.error.subscription_required_profile")
            : err?.chatKey
              ? tr(err.chatKey, err.chatValues)
              : tr("chat.error.generic");
          const showTopErrorBanner = !isSubscriptionRequired;
          if (showTopErrorBanner) {
            cfg.setErrorBanner?.(errText);
          }
          const errWithPrefix = isSubscriptionRequired
            ? errText
            : tr("chat.error.with_detail", {
                message: errText
              });

          if (streamingMessageId != null) {
            cfg.mutateMessage?.(streamingMessageId, msg => ({
              ...msg,
              text: errWithPrefix,
              sources: [],
              cards: [],
              isStreaming: false
            }));
            streamingMessageId = null;
          } else {
            cfg.appendMessage?.({
              role: "ai",
              text: errWithPrefix,
              ...(cfg.isRoomMode ? { roomScoped: true } : {})
            });
          }
        }

        return false;
      } finally {
        abortRef.current = null;
        isGeneratingRef.current = false;
        setIsGenerating(false);
        cfg.onFocusInput?.();
      }
    };

    void runStream();
    return true;
  }, []);

  return {
    isGenerating,
    sendMessage,
    stop
  };
}
