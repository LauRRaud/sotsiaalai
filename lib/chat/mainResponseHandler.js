import { persistInit, persistDone } from "@/lib/chat/persistence";
import { callOpenAI, streamOpenAI, shouldFlushStreamDelta } from "@/lib/chat/openaiRuntime";
import { buildImmediateChatResponse, finalizeAssistantReply } from "@/lib/chat/responseFinalizer";
import { CHAT_NO_STORE_HEADERS } from "@/lib/chat/routeServerUtils";

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

    const { attachments } = await finalizeAssistantReply({
      persist,
      convId,
      userId,
      role: normalizedRole,
      userMessage: effectiveMessage,
      reply: noContextReply,
      sources,
      attachments: [],
      cards: [],
      metadataExtra,
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
      sources,
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
      const { attachments } = await finalizeAssistantReply({
        persist,
        persistInitialized: true,
        convId,
        userId,
        role: normalizedRole,
        userMessage: effectiveMessage,
        reply: aiResult.reply,
        sources,
        attachments: [],
        cards: [],
        metadataExtra,
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
        sources,
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
        flushPendingDelta();
        const { attachments } = await finalizeAssistantReply({
          persist,
          persistInitialized: true,
          convId,
          userId,
          role: normalizedRole,
          userMessage: effectiveMessage,
          reply: accumulated,
          sources,
          attachments: [],
          cards: [],
          metadataExtra,
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
              attachments
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
            sources,
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
        if (!streamFinalized && (accumulated || pendingDelta)) {
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
