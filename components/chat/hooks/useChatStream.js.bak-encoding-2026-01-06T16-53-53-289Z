import { startTransition, useCallback, useEffect, useRef, useState } from "react";
import { createSSEReader as defaultCreateSSEReader } from "../utils/sse";
import { normalizeSources as defaultNormalizeSources } from "../utils/sources";

/**
 * useChatStream
 * - kapseldab sendMessage + SSE streaming + stop/abort
 * - EI halda messages state'i ise: kasutab appendMessage/mutateMessage callbacke
 *
 * NB: payload ja meta/delta loogika on ChatBody-ga sama.
 */
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

  const sendMessage = useCallback(async (rawText) => {
    const cfg = cfgRef.current;

    const text = String(rawText ?? "").trim();
    if (!text) return false;
    if (isGeneratingRef.current) return false;

    cfg.setErrorBanner?.(null);
    cfg.setIsCrisis?.(false);

    if (cfg.isRoomMode) {
      if (cfg.roomBlocked) {
        cfg.setErrorBanner?.(
          cfg.t?.(
            "chat.room.blocked",
            "Vestluses osalemine ei ole hetkel voimalik. Palun vota uhendust oma spetsialistiga."
          ) ?? "Vestluses osalemine ei ole hetkel voimalik."
        );
        return false;
      }
      if (cfg.roomAuthRequired) {
        cfg.setErrorBanner?.(
          cfg.t?.("chat.room.auth_required", "Sessioon aegus. Palun logi uuesti sisse.") ??
            "Sessioon aegus."
        );
        return false;
      }

      try {
        const res = await fetch(`/api/rooms/${cfg.roomId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: text }),
        });
        const data = await res.json().catch(() => ({}));

        if (res.status === 403) {
          cfg.setErrorBanner?.(
            data?.message ||
              (cfg.t?.(
                "chat.room.blocked",
                "Vestluses osalemine ei ole hetkel voimalik. Palun vota uhendust oma spetsialistiga."
              ) ?? "Vestluses osalemine ei ole hetkel voimalik.")
          );
          return false;
        }
        if (res.status === 401) {
          cfg.setErrorBanner?.(
            cfg.t?.("chat.room.auth_required", "Sessioon aegus. Palun logi uuesti sisse.") ??
              "Sessioon aegus."
          );
          return false;
        }
        if (!res.ok || data?.ok === false) {
          const msg =
            data?.message || cfg.t?.("chat.room.send_error", "Viga saatmisel") || "Viga saatmisel";
          throw new Error(msg);
        }

        if (data?.message?.id && cfg.sendToAssistant) {
          cfg.onRoomMessageSent?.(data.message.id);
        }
      } catch (err) {
        cfg.setErrorBanner?.(
          err?.message || cfg.t?.("chat.room.send_error", "Viga saatmisel") || "Viga saatmisel"
        );
        return false;
      }
    }

    const shouldSendToAssistant = cfg.isRoomMode ? cfg.sendToAssistant : true;

    cfg.appendMessage?.({ role: "user", text, aiVisible: shouldSendToAssistant });

    isGeneratingRef.current = shouldSendToAssistant;
    setIsGenerating(shouldSendToAssistant);

    cfg.onFocusInput?.();

    if (!shouldSendToAssistant) return true;

    const controller = new AbortController();
    abortRef.current = controller;

    const clientTimeout = setTimeout(() => controller.abort(), 180000);

    const STREAM_DELAY_MS = 35;
    const STREAM_CHARS_PER_TICK = 6;
    const PUSH_DELAY_MS = 70;

    let streamingMessageId = null;
    let pendingText = "";
    let visibleText = "";
    let sources = [];

    let streamTimer = null;
    let pushTimer = null;

    const clearStreamTimer = () => {
      if (streamTimer) {
        clearTimeout(streamTimer);
        streamTimer = null;
      }
    };

    const clearPushTimer = () => {
      if (pushTimer) {
        clearTimeout(pushTimer);
        pushTimer = null;
      }
    };

    const doPushVisibleText = () => {
      if (streamingMessageId == null) return;
      startTransition(() => {
        cfg.mutateMessage?.(streamingMessageId, (msg) => ({ ...msg, text: visibleText }));
      });
    };

    const schedulePushVisibleText = (force = false) => {
      if (force) {
        clearPushTimer();
        doPushVisibleText();
        return;
      }
      if (pushTimer) return;
      pushTimer = setTimeout(() => {
        pushTimer = null;
        doPushVisibleText();
      }, PUSH_DELAY_MS);
    };

    const flushChunk = () => {
      if (!pendingText) return;
      const chunk = pendingText.slice(0, STREAM_CHARS_PER_TICK);
      pendingText = pendingText.slice(chunk.length);
      visibleText += chunk;
      schedulePushVisibleText(false);
    };

    const ensureStreamTimer = () => {
      if (streamTimer) return;
      const tick = () => {
        streamTimer = null;
        flushChunk();
        if (pendingText) ensureStreamTimer();
      };
      streamTimer = setTimeout(tick, STREAM_DELAY_MS);
    };

    const flushAllPending = () => {
      clearStreamTimer();
      clearPushTimer();
      if (pendingText) {
        visibleText += pendingText;
        pendingText = "";
      }
      schedulePushVisibleText(true);
    };

    const runStream = async () => {
      try {
        const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: cfg.historyPayload,
          role: cfg.userRole,
          stream: true,
          persist: true,
          convId: cfg.convId,
          uiLocale: cfg.locale || "et",
          ...(cfg.ephemeralChunks?.length
            ? {
                ephemeralChunks: cfg.ephemeralChunks,
                ...(cfg.uploadPreview?.fileName
                  ? { ephemeralSource: { fileName: cfg.uploadPreview.fileName } }
                  : {}),
                combineSources: !cfg.docOnlyMode,
              }
            : {}),
        }),
        signal: controller.signal,
      });

      clearTimeout(clientTimeout);

      if (res.status === 401 || res.status === 403) {
        if (cfg.onAuthRedirect) {
          cfg.onAuthRedirect();
        } else if (typeof window !== "undefined") {
          const params = new URLSearchParams({ callbackUrl: "/vestlus" });
          window.location.href = `/api/auth/signin?${params.toString()}`;
        }
        return true;
      }
      if (res.status === 429) {
        const retry = res.headers.get("retry-after");
        throw new Error(
          retry
              ? `Liiga palju p’┐Įringuid. Proovi ~${retry}s p’┐Įrast.`
              : "Liiga palju p’┐Įringuid. Proovi varsti uuesti."
        );
      }

      const contentType = res.headers.get("content-type") || "";

      if (!contentType.includes("text/event-stream")) {
        let data = null;
        try {
          data = await res.json();
        } catch {}

        if (!res.ok) {
          const msg = data?.message || res.statusText || "Assistent ei vastanud.";
          throw new Error(msg);
        }

        const replyText =
          (data?.answer ?? data?.reply) || "Vabandust, ma ei saanud praegu vastust koostada.";

        const normalize = cfg.normalizeSources || defaultNormalizeSources;
        const normSources = normalize(data?.sources);
        cfg.setIsCrisis?.(!!data?.isCrisis);

        cfg.appendMessage?.({ role: "ai", text: replyText, sources: normSources, aiVisible: true });
        cfg.requestConversationsRefresh?.();
        return true;
      }

      if (!res.body) throw new Error("Assistent ei saatnud voogu.");

      const reader = (cfg.createSSEReader || defaultCreateSSEReader)(res.body);

      streamingMessageId = cfg.appendMessage?.({ role: "ai", text: "", isStreaming: true, aiVisible: true });

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
              cfg.mutateMessage?.(streamingMessageId, (msg) => ({ ...msg, sources }));
            }
            if (typeof payload?.isCrisis !== "undefined") {
              cfg.setIsCrisis?.(!!payload.isCrisis);
            }
          } catch {}
        } else if (ev.event === "delta") {
          try {
            const payload = JSON.parse(ev.data);
            if (payload?.t) {
              pendingText += payload.t;
              ensureStreamTimer();
            }
          } catch {}
        } else if (ev.event === "error") {
          let msg = "Voo viga.";
          try {
            const payload = JSON.parse(ev.data);
            if (payload?.message) msg = payload.message;
          } catch {}
          throw new Error(msg);
        } else if (ev.event === "done") {
          break;
        }
      }

      flushAllPending();
      cfg.mutateMessage?.(streamingMessageId, (msg) => ({
        ...msg,
        text: (visibleText || "").trim() || "Vabandust, ma ei saanud praegu vastust koostada.",
        sources,
        isStreaming: false,
      }));
      cfg.requestConversationsRefresh?.();
      streamingMessageId = null;

      return true;
    } catch (err) {
      flushAllPending();
      clearTimeout(clientTimeout);

      if (err?.name === "AbortError") {
        if (streamingMessageId != null) {
          cfg.mutateMessage?.(streamingMessageId, (msg) => ({
            ...msg,
            text: msg.text ? `${msg.text}\n\n(Vastuse genereerimine peatati.)` : "Vastuse genereerimine peatati.",
            isStreaming: false,
          }));
          streamingMessageId = null;
        } else {
          cfg.appendMessage?.({ role: "ai", text: "Vastuse genereerimine peatati." });
        }
      } else {
          const errText = err?.message || "Vabandust, vastust ei ’┐Įnnestunud saada.";
        cfg.setErrorBanner?.(errText);

        if (streamingMessageId != null) {
          cfg.mutateMessage?.(streamingMessageId, (msg) => ({
            ...msg,
            text: `Viga: ${errText}`,
            sources: [],
            isStreaming: false,
          }));
          streamingMessageId = null;
        } else {
          cfg.appendMessage?.({ role: "ai", text: `Viga: ${errText}` });
        }
      }

      return false;
    } finally {
      clearStreamTimer();
      clearPushTimer();
      pendingText = "";
      abortRef.current = null;
      isGeneratingRef.current = false;
      setIsGenerating(false);
      cfg.onFocusInput?.();
    }
    };

    void runStream();
    return true;
  }, []);

  return { isGenerating, sendMessage, stop };
}
