import { persistInit, persistDone } from "@/lib/chat/persistence";
import { callOpenAI, streamOpenAI, shouldFlushStreamDelta } from "@/lib/chat/openaiRuntime";
import { buildImmediateChatResponse, finalizeAssistantReply } from "@/lib/chat/responseFinalizer";
import { CHAT_NO_STORE_HEADERS } from "@/lib/chat/routeServerUtils";
import { buildSourceAttribution, getSourceAttributionId } from "@/lib/chat/sourceAttribution";
import {
  RAG_ATTRIBUTION_DECISIONS_ENABLED,
  RAG_DISPLAYED_SOURCES_ENFORCED,
  RAG_TRACE_V1_ENABLED
} from "@/lib/chat/settings";

const EMPTY_STREAM_REPLY_FALLBACK = "Sorry, I couldn't generate an answer right now.";

export function buildRagTraceFromAttribution(sources = [], attribution, retrievalMeta = null) {
  const sourceList = Array.isArray(sources) ? sources : [];
  const sourceIds = sourceList.map((source, index) => getSourceAttributionId(source, index));
  const retrievedSourceIds = Array.isArray(retrievalMeta?.retrievedSourceIds)
    ? retrievalMeta.retrievedSourceIds
    : attribution?.retrieved_source_ids || sourceIds;
  const selectedContextSourceIds = Array.isArray(retrievalMeta?.selectedContextSourceIds)
    ? retrievalMeta.selectedContextSourceIds
    : attribution?.selected_context_source_ids || sourceIds;
  const retrievedCount = Number.isFinite(Number(retrievalMeta?.rawMatchesCount))
    ? Number(retrievalMeta.rawMatchesCount)
    : sourceList.length;
  return {
    retrieved_count: retrievedCount,
    selected_context_count: Number.isFinite(Number(retrievalMeta?.selectedContextCount))
      ? Number(retrievalMeta.selectedContextCount)
      : sourceList.length,
    retrievers_used: Array.isArray(retrievalMeta?.retrieversUsed)
      ? retrievalMeta.retrieversUsed
      : [],
    retrieved_source_ids: retrievedSourceIds,
    selected_context_source_ids: selectedContextSourceIds,
    answer_source_ids: attribution?.answer_source_ids || attribution?.displayed_source_ids || [],
    displayed_source_ids: attribution?.displayed_source_ids || [],
    filtered_out_source_ids: attribution?.filtered_out_source_ids || [],
    filter_reasons: attribution?.filter_reasons || {},
    attribution_decisions: attribution?.attribution_decisions || [],
    ...(retrievalMeta?.ragRiskPolicy
      ? {
          rag_risk_level: retrievalMeta.ragRiskPolicy.riskLevel,
          rag_required_evidence: retrievalMeta.ragRiskPolicy.requiredEvidence,
          rag_insufficient_evidence_mode: !!retrievalMeta.ragRiskPolicy.insufficientEvidenceMode
        }
      : {}),
    retrieval_trace_level: Array.isArray(retrievalMeta?.retrievedSourceIds)
      ? "retrieved_candidates"
      : "selected_context_sources"
  };
}

export function buildAttributionMetadata(metadataExtra, sources, attribution, retrievalMeta = null) {
  const ragTrace = buildRagTraceFromAttribution(sources, attribution, retrievalMeta);
  return {
    ...(metadataExtra && typeof metadataExtra === "object" ? metadataExtra : {}),
    displayed_sources: attribution?.displayedSources || [],
    displayed_source_ids: attribution?.displayed_source_ids || [],
    ...(RAG_ATTRIBUTION_DECISIONS_ENABLED ? { attribution_decisions: attribution?.attribution_decisions || [] } : {}),
    ...(RAG_TRACE_V1_ENABLED ? { rag_trace: ragTrace } : {})
  };
}

async function emitRagTraceEvent(logEvent, {
  userId,
  role,
  isCrisis,
  ragTrace
}) {
  if (!RAG_TRACE_V1_ENABLED || typeof logEvent !== "function" || !ragTrace) return;
  await logEvent("rag_trace", {
    userId,
    role,
    isCrisis,
    retrieved_count: ragTrace.retrieved_count,
    selected_context_count: ragTrace.selected_context_count,
    retrievers_used: ragTrace.retrievers_used,
    retrieved_source_ids: ragTrace.retrieved_source_ids,
    selected_context_source_ids: ragTrace.selected_context_source_ids,
    answer_source_ids: ragTrace.answer_source_ids,
    displayed_source_ids: ragTrace.displayed_source_ids,
    filtered_out_source_ids: ragTrace.filtered_out_source_ids,
    filter_reasons: ragTrace.filter_reasons,
    attribution_decisions: ragTrace.attribution_decisions,
    rag_risk_level: ragTrace.rag_risk_level,
    rag_required_evidence: ragTrace.rag_required_evidence,
    rag_insufficient_evidence_mode: ragTrace.rag_insufficient_evidence_mode,
    retrieval_trace_level: ragTrace.retrieval_trace_level
  });
}

function resolveDisplayedSources(originalSources, attribution) {
  return RAG_DISPLAYED_SOURCES_ENFORCED
    ? attribution?.displayedSources || []
    : Array.isArray(originalSources)
      ? originalSources
      : [];
}

function resolveAttributionDecisions(attribution) {
  return RAG_ATTRIBUTION_DECISIONS_ENABLED ? attribution?.attribution_decisions || [] : null;
}

function resolveRagTrace(sources, attribution, retrievalMeta) {
  return RAG_TRACE_V1_ENABLED ? buildRagTraceFromAttribution(sources, attribution, retrievalMeta) : null;
}

export async function handleMainChatResponse({
  req,
  wantStream,
  persist,
  convId,
  userId,
  normalizedRole,
  effectiveMessage,
  modelUserMessage = null,
  messageLength,
  history,
  effectiveContext,
  grounding,
  includeSources,
  replyLang,
  isCrisis,
  extraSystemInstructions,
  sources,
  retrievalMeta,
  metadataExtra,
  wantsDocumentDownload,
  roomId,
  saveRoomMessage,
  noContextReply,
  noContextMeta,
  makeError,
  logInfo,
  logError,
  logEvent
}) {
  if (!effectiveContext || !effectiveContext.trim()) {
    if (typeof logInfo === "function") {
      logInfo("branch.noContext", {
        role: normalizedRole,
        isCrisis,
        ragReturned: !!noContextMeta?.ragReturned,
        hadDocContext: !!noContextMeta?.hadDocContext,
        sourceLookupRequest: !!noContextMeta?.sourceLookupRequest,
        previousSourceUseRequest: !!noContextMeta?.previousSourceUseRequest
      });
    }
    if (typeof logEvent === "function") {
      await logEvent("no_context", {
        userId,
        role: normalizedRole,
        isCrisis,
        hadRagResults: !!noContextMeta?.ragReturned,
        hadDocContext: !!noContextMeta?.hadDocContext,
        sourceLookupRequest: !!noContextMeta?.sourceLookupRequest,
        previousSourceUseRequest: !!noContextMeta?.previousSourceUseRequest
      });
    }

    const attribution = buildSourceAttribution(noContextReply, sources, {
      query: effectiveMessage,
      riskPolicy: retrievalMeta?.ragRiskPolicy
    });
    const replySources = resolveDisplayedSources(sources, attribution);
    const ragTrace = resolveRagTrace(sources, attribution, retrievalMeta);
    const attributionDecisions = resolveAttributionDecisions(attribution);
    await emitRagTraceEvent(logEvent, {
      userId,
      role: normalizedRole,
      isCrisis,
      ragTrace
    });
    const { attachments } = await finalizeAssistantReply({
      persist,
      convId,
      userId,
      role: normalizedRole,
      userMessage: effectiveMessage,
      reply: noContextReply,
      sources: replySources,
      displayedSources: replySources,
      ragTrace,
      attributionDecisions,
      attachments: [],
      cards: [],
      metadataExtra: buildAttributionMetadata(metadataExtra, sources, attribution, retrievalMeta),
      isCrisis,
      wantsDocumentDownload,
      replyLang,
      messageForDownload: effectiveMessage,
      roomId,
      saveRoomMessage
    });
    return buildImmediateChatResponse({
      wantStream,
      reply: noContextReply,
      sources: replySources,
      displayedSources: replySources,
      ragTrace,
      attributionDecisions,
      attachments,
      cards: [],
      isCrisis,
      convId
    });
  }

  if (persist && convId && userId) {
    await persistInit({
      convId,
      userId,
      role: normalizedRole,
      sources,
      isCrisis,
      userMessage: effectiveMessage
    });
  }

  if (!wantStream) {
    try {
      const aiResult = await callOpenAI({
        history,
        userMessage: modelUserMessage || effectiveMessage,
        context: effectiveContext,
        effectiveRole: normalizedRole,
        grounding,
        includeSources,
        replyLang,
        isCrisis,
        extraSystemInstructions,
        userId,
        role: normalizedRole
      });
      const attribution = buildSourceAttribution(aiResult.reply, sources, {
        query: effectiveMessage,
        riskPolicy: retrievalMeta?.ragRiskPolicy
      });
      const replySources = resolveDisplayedSources(sources, attribution);
      const ragTrace = resolveRagTrace(sources, attribution, retrievalMeta);
      const attributionDecisions = resolveAttributionDecisions(attribution);
      await emitRagTraceEvent(logEvent, {
        userId,
        role: normalizedRole,
        isCrisis,
        ragTrace
      });
      const { attachments } = await finalizeAssistantReply({
        persist,
        persistInitialized: true,
        convId,
        userId,
        role: normalizedRole,
        userMessage: effectiveMessage,
        reply: aiResult.reply,
        sources: replySources,
        displayedSources: replySources,
        ragTrace,
        attributionDecisions,
        attachments: [],
        cards: [],
        metadataExtra: buildAttributionMetadata(metadataExtra, sources, attribution, retrievalMeta),
        isCrisis,
        wantsDocumentDownload,
        replyLang,
        messageForDownload: effectiveMessage,
        roomId,
        saveRoomMessage
      });
      return buildImmediateChatResponse({
        wantStream: false,
        reply: aiResult.reply,
        sources: replySources,
        displayedSources: replySources,
        ragTrace,
        attributionDecisions,
        attachments,
        cards: [],
        isCrisis,
        convId
      });
    } catch (err) {
      const rawErrMessage = (err?.response?.data?.error?.message || err?.error?.message || err?.message) ?? "chat.error.openai_request_failed";
      const safeMessageKey = typeof rawErrMessage === "string" && rawErrMessage.startsWith("chat.")
        ? rawErrMessage
        : "chat.error.openai_request_failed";
      if (typeof logError === "function") {
        logError("openai.call.error", {
          err: rawErrMessage,
          stack: err?.stack,
          userId,
          role: normalizedRole,
          isCrisis,
          messageLength
        });
      }
      if (typeof logEvent === "function") {
        await logEvent("openai_error", {
          userId,
          role: normalizedRole,
          isCrisis,
          message: rawErrMessage,
          messageLength
        });
      }
      if (persist && convId && userId) {
        await persistDone({
          convId,
          userId,
          status: "ERROR"
        });
      }
      return makeError(safeMessageKey, 502, {
        code: err?.name
      });
    }
  }

  const enc = new TextEncoder();
  let clientGone = false;
  let heartbeatTimer = null;
  let accumulated = "";
  let pendingDelta = "";
  let lastDeltaFlushAt = Date.now();
  const sse = new ReadableStream({
    async start(controller) {
      let streamFinalized = false;

      const flushPendingDelta = () => {
        if (!pendingDelta || clientGone) return;
        const text = pendingDelta;
        pendingDelta = "";
        lastDeltaFlushAt = Date.now();
        try {
          controller.enqueue(enc.encode(`event: delta\ndata: ${JSON.stringify({
            t: text
          })}\n\n`));
        } catch {
          clientGone = true;
        }
      };

      const finalizeStreamReply = async () => {
        if (streamFinalized) return;
        streamFinalized = true;
        if (!accumulated.trim()) {
          accumulated = EMPTY_STREAM_REPLY_FALLBACK;
          pendingDelta += EMPTY_STREAM_REPLY_FALLBACK;
        }
        flushPendingDelta();
        const attribution = buildSourceAttribution(accumulated, sources, {
          query: effectiveMessage,
          riskPolicy: retrievalMeta?.ragRiskPolicy
        });
        const replySources = resolveDisplayedSources(sources, attribution);
        const ragTrace = resolveRagTrace(sources, attribution, retrievalMeta);
        const attributionDecisions = resolveAttributionDecisions(attribution);
        await emitRagTraceEvent(logEvent, {
          userId,
          role: normalizedRole,
          isCrisis,
          ragTrace
        });
        const { attachments } = await finalizeAssistantReply({
          persist,
          persistInitialized: true,
          convId,
          userId,
          role: normalizedRole,
          userMessage: effectiveMessage,
          reply: accumulated,
          sources: replySources,
          displayedSources: replySources,
          ragTrace,
          attributionDecisions,
          attachments: [],
          cards: [],
          metadataExtra: buildAttributionMetadata(metadataExtra, sources, attribution, retrievalMeta),
          isCrisis,
          wantsDocumentDownload,
          replyLang,
          messageForDownload: effectiveMessage,
          roomId,
          saveRoomMessage
        });
        if (!clientGone) {
          try {
            controller.enqueue(enc.encode(`event: done\ndata: ${JSON.stringify({
              attachments,
              sources: replySources,
              displayed_sources: replySources,
              ...(ragTrace ? { rag_trace: ragTrace } : {}),
              ...(Array.isArray(attributionDecisions) ? { attribution_decisions: attributionDecisions } : {})
            })}\n\n`));
          } catch {}
        }
      };

      try {
        req.signal?.addEventListener("abort", () => {
          clientGone = true;
          if (heartbeatTimer) {
            clearInterval(heartbeatTimer);
            heartbeatTimer = null;
          }
        });
      } catch {}

      heartbeatTimer = setInterval(() => {
        if (!clientGone) {
          try {
            controller.enqueue(enc.encode(`: keepalive\n\n`));
          } catch {
            clientGone = true;
            clearInterval(heartbeatTimer);
            heartbeatTimer = null;
          }
        }
      }, 15000);

      if (!clientGone) {
        try {
          controller.enqueue(enc.encode(`event: meta\ndata: ${JSON.stringify({
            isCrisis
          })}\n\n`));
        } catch {
          clientGone = true;
        }
      }

      try {
        const iter = await streamOpenAI({
          history,
          userMessage: modelUserMessage || effectiveMessage,
          context: effectiveContext,
          effectiveRole: normalizedRole,
          grounding,
          includeSources,
          replyLang,
          isCrisis,
          extraSystemInstructions,
          userId,
          role: normalizedRole
        });
        for await (const ev of iter) {
          if (ev.type === "delta" && ev.text) {
            accumulated += ev.text;
            pendingDelta += ev.text;
            if (!clientGone && shouldFlushStreamDelta(pendingDelta, lastDeltaFlushAt)) {
              flushPendingDelta();
            }
          } else if (ev.type === "done") {
            await finalizeStreamReply();
          }
        }
        if (!streamFinalized) {
          await finalizeStreamReply();
        }
      } catch (err) {
        const streamSafeMessage = "chat.error.openai_request_failed";
        if (!clientGone) {
          try {
            controller.enqueue(enc.encode(`event: error\ndata: ${JSON.stringify({
              message: streamSafeMessage
            })}\n\n`));
          } catch {}
        }
        if (typeof logError === "function") {
          logError("openai.stream.error", {
            err: err?.message,
            stack: err?.stack,
            userId,
            role: normalizedRole,
            isCrisis,
            messageLength
          });
        }
        if (typeof logEvent === "function") {
          await logEvent("openai_error", {
            userId,
            role: normalizedRole,
            isCrisis,
            message: err?.message || "openai stream error",
            messageLength
          });
        }
        if (persist && convId && userId) {
          await persistDone({
            convId,
            userId,
            status: "ERROR"
          });
        }
      } finally {
        if (heartbeatTimer) {
          clearInterval(heartbeatTimer);
          heartbeatTimer = null;
        }
        if (!clientGone) {
          try {
            controller.close();
          } catch {}
        }
      }
    }
  });

  return new Response(sse, {
    headers: {
      ...CHAT_NO_STORE_HEADERS,
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no"
    }
  });
}
