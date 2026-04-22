import { NextResponse } from "next/server";
import { requireSubscription, resolveSessionRoleState } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { publishRoomEvent } from "@/lib/roomStream";
import { pickReplyLang, langStrings } from "@/lib/chat/promptBuilder";
import { buildLocalizedExtraSystemInstruction } from "@/lib/chat/systemPrompts/index.js";
import {
  chooseOrchestrationPlan,
  countClarifyingTurns,
  inferRequestedThoroughness,
  WORK_MODES
} from "@/lib/chat/orchestrationPolicy";
import { detectCrisis, isGreeting } from "@/lib/chat/safety";
import { persistInit, persistDone } from "@/lib/chat/persistence";
import { logEvent } from "@/lib/chat/logger";
import { enforceChatRateLimit, readChatRateLimit } from "@/lib/chat-api-rate-limit";
import { callOpenAI, streamOpenAI, shouldFlushStreamDelta } from "@/lib/chat/openaiRuntime";
import { assembleRetrievalContext } from "@/lib/chat/retrievalContextAssembler";
import { buildImmediateChatResponse, finalizeAssistantReply } from "@/lib/chat/responseFinalizer";
import { handleDocumentWorkflowBranch, handleHelpWorkflowBranch } from "@/lib/chat/workflowBranchHandlers";
import {
  normalizeEphemeralChunk,
  detectSourcesRequest,
  shouldOfferDocumentDownload,
  normalizeRoomId,
  isPlausibleConversationId
} from "@/lib/chat/requestContext";
import { canSpendMonthlyBudget } from "@/lib/usageBudget";
import {
  hasDocumentTaskContext,
  getDocumentWorkflowState,
  isActiveDocumentWorkflowState
} from "@/lib/chat/documentOrchestration";
import { getHelpWorkflowState } from "@/lib/help/chatWorkflow";
import { detectHelpChatIntent } from "@/lib/help/intents";
import { isActiveHelpWorkflowState, normalizeHelpWorkflowState } from "@/lib/help/workflowState";
import { getChatSessionTurnLimit } from "@/lib/chat/guardrails";
import { shouldUseHelpWorkflowMode } from "@/lib/chat/workflowModeRouting";
import { shouldAllowChatWithoutSubscription } from "@/lib/chat/subscriptionGate";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
const CHAT_RATE_LIMIT_WINDOW_MS = readChatRateLimit(process.env.CHAT_RATE_LIMIT_WINDOW_MS, 60_000, 1000);
const CHAT_POST_RATE_LIMIT_MAX = readChatRateLimit(process.env.CHAT_RATE_LIMIT_CHAT_POST_MAX, 24);
const CHAT_GET_RATE_LIMIT_MAX = readChatRateLimit(process.env.CHAT_RATE_LIMIT_CHAT_GET_MAX, 120);
const CHAT_HISTORY_MAX_ITEMS = readChatRateLimit(process.env.CHAT_HISTORY_MAX_ITEMS, 8, 1);
const CHAT_HISTORY_MAX_CHARS = readChatRateLimit(process.env.CHAT_HISTORY_MAX_CHARS, 800, 200);
const CHAT_HISTORY_WITH_DOC_MAX_ITEMS = readChatRateLimit(process.env.CHAT_HISTORY_WITH_DOC_MAX_ITEMS, 8, 1);
const CHAT_HISTORY_WITH_DOC_MAX_CHARS = readChatRateLimit(process.env.CHAT_HISTORY_WITH_DOC_MAX_CHARS, 800, 200);
const CHAT_EPHEMERAL_CHUNKS_MAX = readChatRateLimit(process.env.CHAT_EPHEMERAL_CHUNKS_MAX, 80, 1);
const CHAT_EPHEMERAL_CHUNK_CHARS_MAX = readChatRateLimit(process.env.CHAT_EPHEMERAL_CHUNK_CHARS_MAX, 1800, 200);
const CHAT_DOC_CONTEXT_CLIENT_CHARS = readChatRateLimit(process.env.CHAT_DOC_CONTEXT_CLIENT_CHARS, 1800, 300);
const CHAT_DOC_CONTEXT_CLIENT_COMBINED_CHARS = readChatRateLimit(process.env.CHAT_DOC_CONTEXT_CLIENT_COMBINED_CHARS, 1200, 300);
const CHAT_DOC_CONTEXT_WORKER_CHARS = readChatRateLimit(process.env.CHAT_DOC_CONTEXT_WORKER_CHARS, 2600, 300);
const CHAT_DOC_CONTEXT_WORKER_COMBINED_CHARS = readChatRateLimit(process.env.CHAT_DOC_CONTEXT_WORKER_COMBINED_CHARS, 1600, 300);
const CHAT_DOC_CONTEXT_CLIENT_MAX_CHUNKS = readChatRateLimit(process.env.CHAT_DOC_CONTEXT_CLIENT_MAX_CHUNKS, 4, 1);
const CHAT_DOC_CONTEXT_WORKER_MAX_CHUNKS = readChatRateLimit(process.env.CHAT_DOC_CONTEXT_WORKER_MAX_CHUNKS, 6, 1);
const EXPLICIT_CHAT_MODE_VALUES = new Set(["rag", "document", "help_request", "help_offer"]);
const MAX_USER_MESSAGE_CHARS = 1500;
const CLIENT_AGENT_DOCUMENT_LIMIT = 2;
function makeError(messageKey, status = 400, extras = {}) {
  return NextResponse.json({
    ok: false,
    messageKey,
    message: messageKey,
    ...extras
  }, {
    status
  });
}
const logInfo = (event, payload = {}) => {
  try {
    console.info("[chat]", event, payload);
  } catch {}
};
const logError = (event, payload = {}) => {
  try {
    console.error("[chat]", event, payload);
  } catch {}
};
function buildOrchestrationMetadata(plan, extra = null) {
  const orchestration = plan && typeof plan === "object"
    ? {
        mode: plan.mode || WORK_MODES.GENERAL_QUESTION,
        step: plan.step || "detect",
        complexity: plan.complexity || "normal",
        reasoning: plan.reasoning || "low",
        capability: plan.capability || "assistant",
        userVisibleMode: plan.userVisibleMode || "assistant"
      }
    : null;

  if (!orchestration && !extra) return null;
  return {
    ...(extra && typeof extra === "object" ? extra : {}),
    ...(orchestration ? { orchestration } : {})
  };
}
function toOpenAiMessages(history, options = {}) {
  if (!Array.isArray(history) || history.length === 0) return [];
  const maxItems = Math.max(1, Number(options.maxItems) || CHAT_HISTORY_MAX_ITEMS);
  const maxChars = Math.max(200, Number(options.maxChars) || CHAT_HISTORY_MAX_CHARS);
  const sourceSummary = sources => {
    if (!Array.isArray(sources) || !sources.length) return "";
    const lines = sources.slice(0, 8).map((src, idx) => {
      const label = String(src?.label || src?.title || src?.url || "").trim();
      if (!label) return "";
      const paragraphTitle = String(src?.paragraphTitle || src?.paragraph_title || "").trim();
      const section = paragraphTitle || String(src?.section || "").trim();
      const pages = String(src?.pageRange || "").trim();
      const tail = [section, pages && !/^0+$/.test(pages) ? `lk ${pages}` : ""].filter(Boolean).join(", ");
      return `${idx + 1}. ${tail ? `${label} (${tail})` : label}`;
    }).filter(Boolean);
    if (!lines.length) return "";
    return `\n\nAssistant source metadata for this answer:\n${lines.join("\n")}`;
  };
  return history.filter(msg => msg && typeof msg.text === "string").slice(-maxItems).map(msg => {
    const role = msg.role === "ai" ? "assistant" : "user";
    const baseContent = String(msg.text).slice(0, maxChars);
    return {
      role,
      content: role === "assistant"
        ? `${baseContent}${sourceSummary(msg.sources)}`
        : baseContent
    };
  });
}

function sourceLookupSystemInstruction(replyLang = "et") {
  return buildLocalizedExtraSystemInstruction("SOURCE_LOOKUP_MODE", { replyLang });
}

function missingMunicipalitySystemInstruction(effectiveRole = "CLIENT", replyLang = "et") {
  return buildLocalizedExtraSystemInstruction("MUNICIPALITY_CLARIFICATION_REQUIRED", {
    effectiveRole,
    replyLang
  });
}
async function getRoomMembership(userId, roomId) {
  if (!userId || !roomId) return null;
  return prisma.roomMember.findFirst({
    where: {
      roomId,
      userId,
      leftAt: null
    },
    select: {
      billingSource: true,
      sponsorUserId: true
    }
  });
}
async function saveAssistantRoomMessage({
  roomId,
  userId,
  content
}) {
  if (!roomId || !userId || !content) return null;
  const msg = await prisma.roomMessage.create({
    data: {
      roomId,
      authorId: userId,
      senderType: "ASSISTANT",
      content
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      authorId: true,
      senderType: true,
      author: {
        select: {
          role: true
        }
      }
    }
  });
  const payload = {
    ...msg,
    authorName: "Assistant",
    authorRole: msg.author?.role || "CLIENT"
  };
  try {
    publishRoomEvent(roomId, {
      type: "message",
      message: payload
    });
  } catch {}
  return payload;
}
export async function POST(req) {
  const {
    getServerSession
  } = await import("next-auth/next");
  let authOptions;
  try {
    ({
      authOptions
    } = await import("@/pages/api/auth/[...nextauth]"));
  } catch {
    try {
      const mod = await import("@/auth");
      authOptions = mod.authConfig || mod.authOptions || mod.default;
    } catch {
      authOptions = undefined;
    }
  }
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch {}
  const earlyRateLimit = enforceChatRateLimit(req, {
    scope: "main_post",
    userId: session?.user?.id,
    limit: CHAT_POST_RATE_LIMIT_MAX,
    windowMs: CHAT_RATE_LIMIT_WINDOW_MS
  });
  if (earlyRateLimit) return earlyRateLimit;
  let payload;
  try {
    payload = await req.json();
  } catch {
    return makeError("chat.error.invalid_json");
  }
  const message = String(payload?.message || "").trim();
  if (!message) return makeError("chat.error.message_required");
  const rawHistory = Array.isArray(payload?.history) ? payload.history : [];
  const wantStream = !!payload?.stream;
  const persist = !!payload?.persist;
  const convIdRaw = payload?.convId && String(payload.convId) || "";
  const convId = convIdRaw.trim() || null;
  if (persist && convId && !isPlausibleConversationId(convId)) {
    return makeError("chat.error.invalid_conv_id");
  }
  const uiLocale = typeof payload?.uiLocale === "string" ? payload.uiLocale : undefined;
  const roomId = normalizeRoomId(payload?.roomId ?? payload?.room_id);
  const requestedChatModeRaw = typeof payload?.chatMode === "string" ? payload.chatMode.trim().toLowerCase() : "";
  const requestedChatMode = !roomId && EXPLICIT_CHAT_MODE_VALUES.has(requestedChatModeRaw) ? requestedChatModeRaw : null;
  const ephemeralChunks = Array.isArray(payload?.ephemeralChunks)
    ? payload.ephemeralChunks.filter(s => typeof s === "string" && s.trim()).slice(0, CHAT_EPHEMERAL_CHUNKS_MAX).map(s => normalizeEphemeralChunk(s, CHAT_EPHEMERAL_CHUNK_CHARS_MAX)).filter(Boolean)
    : [];
  const ephemeralSource = payload?.ephemeralSource && typeof payload.ephemeralSource === "object" ? payload.ephemeralSource : null;
  const combineSources = payload?.combineSources === true;
  const forceSources = payload?.forceSources === true || payload?.includeSources === true || payload?.showSources === true;
  const includeSources = forceSources || detectSourcesRequest(rawHistory, message);
  const wantsDocumentDownload = shouldOfferDocumentDownload(message);
  const userId = session?.user?.id || null;
  const roleState = resolveSessionRoleState(session, req.cookies);
  const normalizedRole = roleState.effectiveRole;
  const history = toOpenAiMessages(rawHistory, ephemeralChunks.length
    ? {
        maxItems: CHAT_HISTORY_WITH_DOC_MAX_ITEMS,
        maxChars: CHAT_HISTORY_WITH_DOC_MAX_CHARS
      }
    : {
        maxItems: CHAT_HISTORY_MAX_ITEMS,
        maxChars: CHAT_HISTORY_MAX_CHARS
      });
  const adminUser = roleState.isAdmin;
  if (roomId && userId && !adminUser) {
    const roomMembership = await getRoomMembership(userId, roomId);
    if (!roomMembership) return makeError("api.common.forbidden", 403);
  }
  const explicitHelpIntent = !roomId
    ? requestedChatMode === "help_request"
      ? "create_help_request"
      : requestedChatMode === "help_offer"
        ? "create_help_offer"
        : null
    : null;
  const clientHelpWorkflowState = !roomId
    ? normalizeHelpWorkflowState(payload?.helpWorkflowState || null)
    : null;
  const helpWorkflowState = clientHelpWorkflowState || (userId && !roomId
    ? await getHelpWorkflowState(convId, userId, prisma)
    : null);
  const helpWorkflowActive = isActiveHelpWorkflowState(helpWorkflowState);
  const detectedHelpIntent = !roomId ? detectHelpChatIntent(message) : null;
  const gate = await requireSubscription(session, normalizedRole, {
    allowWithoutSubscription: shouldAllowChatWithoutSubscription({
      roomId,
      requestedChatMode,
      explicitHelpIntent,
      detectedHelpIntent,
      helpWorkflowState,
      helpWorkflowActive
    })
  });
  if (!gate.ok) {
    return NextResponse.json({
      ok: false,
      messageKey: gate.message,
      message: gate.message,
      requireSubscription: gate.requireSubscription,
      redirect: gate.redirect
    }, {
      status: gate.status
    });
  }
  if (userId) {
    const budgetCheck = await canSpendMonthlyBudget(userId, { chatRequests: 1 });
    if (!budgetCheck.allowed) {
      return makeError("api.common.monthly_budget_exceeded", 429, {
        budgetEur: budgetCheck.budgetEur,
        usedEur: budgetCheck.usedEur,
        remainingEur: budgetCheck.remainingEur
      });
    }
  }
  if (persist && convId && userId && !roomId) {
    const sessionTurnLimit = getChatSessionTurnLimit(normalizedRole);
    const sessionTurnCount = await prisma.conversationMessage.count({
      where: {
        conversationId: convId,
        role: "USER",
        conversation: {
          userId
        }
      }
    });
    if (sessionTurnCount >= sessionTurnLimit) {
      return makeError("api.common.rate_limited", 429, {
        scope: "chat_session_turns",
        limit: sessionTurnLimit,
        used: sessionTurnCount
      });
    }
  }
  const replyLang = pickReplyLang({
    userMessage: message,
    uiLocale
  });
  const greeting = isGreeting(message);
  const clarifyingTurns = countClarifyingTurns(rawHistory);
  const requestedThoroughness = inferRequestedThoroughness(message);
  const L = langStrings(replyLang, normalizedRole);
  const isCrisis = detectCrisis(message);
  const hasHistory = Array.isArray(rawHistory) && rawHistory.length > 0;
  const effectiveMessage = message;
  const forcedMode = requestedChatMode;
  const effectiveExplicitHelpIntent = explicitHelpIntent;
  logInfo("request.start", {
    ts: new Date().toISOString(),
    userId,
    role: normalizedRole,
    isCrisis,
    hasHistory,
    hasEphemeral: !!ephemeralChunks.length
  });
  await logEvent("chat_request", {
    userId,
    role: normalizedRole,
    isCrisis,
    hasHistory,
    hasEphemeralDoc: !!ephemeralChunks.length,
    messageLength: message.length,
    explicitHelpIntent: explicitHelpIntent || undefined,
    clarifyingTurns,
    requestedThoroughness,
    convId
  });

  const documentWorkflowState = userId && !roomId
    ? await getDocumentWorkflowState(convId, userId, prisma)
    : null;
  const documentWorkflowActive = isActiveDocumentWorkflowState(documentWorkflowState);
  const explicitHelpModeActive = forcedMode === "help_request" || forcedMode === "help_offer";
  const helpForcedIntent = effectiveExplicitHelpIntent && !helpWorkflowState
    ? effectiveExplicitHelpIntent
    : null;
  const inactiveHelpStateCanResume = Boolean(
    helpWorkflowState
    && !helpWorkflowActive
    && detectedHelpIntent
    && detectedHelpIntent !== "service_guidance"
  );
  const shouldUseDocumentWorkflow = Boolean(
    userId &&
    !roomId &&
    (forcedMode === "document" || (!forcedMode && documentWorkflowActive))
  );
  const shouldUseHelpWorkflow = shouldUseHelpWorkflowMode({
    userId,
    roomId,
    forcedMode,
    explicitHelpModeActive,
    helpWorkflowActive,
    inactiveHelpStateCanResume
  });
  const documentWorkflowResponse = await handleDocumentWorkflowBranch({
    shouldUseDocumentWorkflow,
    message: effectiveMessage,
    convId,
    userId,
    replyLang,
    normalizedRole,
    documentWorkflowState,
    forcedMode,
    ephemeralChunks,
    ephemeralSource,
    persist,
    roomId,
    wantStream,
    clarifyingTurns,
    requestedThoroughness,
    prisma,
    saveRoomMessage: saveAssistantRoomMessage,
    buildOrchestrationMetadata,
    logInfo,
    logError
  });
  if (documentWorkflowResponse) return documentWorkflowResponse;

  const helpWorkflowResponse = await handleHelpWorkflowBranch({
    shouldUseHelpWorkflow,
    message: effectiveMessage,
    convId,
    userId,
    replyLang,
    helpWorkflowState,
    helpForcedIntent,
    effectiveExplicitHelpIntent,
    clarifyingTurns,
    requestedThoroughness,
    persist,
    normalizedRole,
    roomId,
    wantStream,
    prisma,
    saveRoomMessage: saveAssistantRoomMessage,
    buildOrchestrationMetadata,
    logInfo
  });
  if (helpWorkflowResponse) return helpWorkflowResponse;
  if (isCrisis) {
    logInfo("crisis.detected", {
      role: normalizedRole,
      hasHistory,
      fromRag: false
    });
  }
  if (greeting && !isCrisis && !hasHistory) {
    const reply = normalizedRole === "SOCIAL_WORKER" ? L.greetingWorker : L.greetingClient;
    const { attachments } = await finalizeAssistantReply({
      persist,
      convId,
      userId,
      role: normalizedRole,
      userMessage: message,
      reply,
      sources: [],
      attachments: [],
      cards: [],
      metadataExtra: null,
      isCrisis,
      wantsDocumentDownload,
      replyLang,
      messageForDownload: message,
      roomId,
      saveRoomMessage: saveAssistantRoomMessage
    });
    return buildImmediateChatResponse({
      wantStream,
      reply,
      sources: [],
      attachments,
      cards: [],
      isCrisis,
      convId
    });
  }
  const {
    previousSourceUseRequest,
    sourceLookupRequest,
    extraSystemInstructions,
    effectiveContext,
    grounding,
    sources,
    retrievalMeta
  } = await assembleRetrievalContext({
    payloadAudience: payload?.audience,
    normalizedRole,
    rawHistory,
    effectiveMessage,
    forceSources,
    forcedMode,
    hasHistory,
    replyLang,
    ephemeralChunks,
    ephemeralSource,
    combineSources,
    userId,
    convId,
    isCrisis,
    logInfo,
    logError,
    logEvent,
    buildMissingMunicipalityInstruction: missingMunicipalitySystemInstruction,
    buildSourceLookupInstruction: sourceLookupSystemInstruction,
    docContextBudgets: {
      clientChars: CHAT_DOC_CONTEXT_CLIENT_CHARS,
      clientCombinedChars: CHAT_DOC_CONTEXT_CLIENT_COMBINED_CHARS,
      workerChars: CHAT_DOC_CONTEXT_WORKER_CHARS,
      workerCombinedChars: CHAT_DOC_CONTEXT_WORKER_COMBINED_CHARS,
      clientMaxChunks: CHAT_DOC_CONTEXT_CLIENT_MAX_CHUNKS,
      workerMaxChunks: CHAT_DOC_CONTEXT_WORKER_MAX_CHUNKS,
      maxInputChunks: CHAT_EPHEMERAL_CHUNKS_MAX,
      chunkCharsMax: CHAT_EPHEMERAL_CHUNK_CHARS_MAX
    }
  });
  const genericIntent =
    forcedMode === "rag"
      ? WORK_MODES.SERVICE_GUIDANCE
      : effectiveExplicitHelpIntent === "service_guidance"
      ? WORK_MODES.SERVICE_GUIDANCE
      : WORK_MODES.GENERAL_QUESTION;
  const mainOrchestrationPlan = chooseOrchestrationPlan({
    intent: genericIntent,
    message: effectiveMessage,
    clarifyingTurns,
    requestedThoroughness,
    sourceCount: retrievalMeta.sourceCount,
    hybridTask: genericIntent === WORK_MODES.SERVICE_GUIDANCE && hasDocumentTaskContext(rawHistory, normalizedRole)
  });
  logInfo("orchestration.plan", {
    mode: mainOrchestrationPlan.mode,
    step: mainOrchestrationPlan.step,
    complexity: mainOrchestrationPlan.complexity,
    reasoning: mainOrchestrationPlan.reasoning,
    capability: mainOrchestrationPlan.capability
  });
  const mainMetadataExtra = buildOrchestrationMetadata(mainOrchestrationPlan);
  if (!effectiveContext || !effectiveContext.trim()) {
    const out = isCrisis ? L.crisisNoCtx : L.noContext;
    logInfo("branch.noContext", {
      role: normalizedRole,
      isCrisis,
      ragReturned: retrievalMeta.rawMatchesCount > 0,
      hadDocContext: retrievalMeta.hadDocContext,
      sourceLookupRequest,
      previousSourceUseRequest
    });
    await logEvent("no_context", {
      userId,
      role: normalizedRole,
      isCrisis,
      hadRagResults: retrievalMeta.rawMatchesCount > 0,
      hadDocContext: retrievalMeta.hadDocContext,
      sourceLookupRequest,
      previousSourceUseRequest
    });
    const { attachments } = await finalizeAssistantReply({
      persist,
      convId,
      userId,
      role: normalizedRole,
      userMessage: effectiveMessage,
      reply: out,
      sources,
      attachments: [],
      cards: [],
      metadataExtra: mainMetadataExtra,
      isCrisis,
      wantsDocumentDownload,
      replyLang,
      messageForDownload: effectiveMessage,
      roomId,
      saveRoomMessage: saveAssistantRoomMessage
    });
    return buildImmediateChatResponse({
      wantStream,
      reply: out,
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
        userMessage: effectiveMessage.slice(0, MAX_USER_MESSAGE_CHARS),
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
        metadataExtra: mainMetadataExtra,
        isCrisis,
        wantsDocumentDownload,
        replyLang,
        messageForDownload: effectiveMessage,
        roomId,
        saveRoomMessage: saveAssistantRoomMessage
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
      logError("openai.call.error", {
        err: rawErrMessage,
        stack: err?.stack,
        userId,
        role: normalizedRole,
        isCrisis,
        messageLength: message.length
      });
      await logEvent("openai_error", {
        userId,
        role: normalizedRole,
        isCrisis,
        message: rawErrMessage,
        messageLength: message.length
      });
      if (persist && convId && userId) await persistDone({
        convId,
        userId,
        status: "ERROR"
      });
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
          userMessage: effectiveMessage.slice(0, MAX_USER_MESSAGE_CHARS),
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
              metadataExtra: mainMetadataExtra,
              isCrisis,
              wantsDocumentDownload,
              replyLang,
              messageForDownload: effectiveMessage,
              roomId,
              saveRoomMessage: saveAssistantRoomMessage
            });
            if (!clientGone) {
              try {
                controller.enqueue(enc.encode(`event: done\ndata: ${JSON.stringify({
                  attachments
                })}\n\n`));
              } catch {}
            }
          }
        }
      } catch (e) {
        const streamSafeMessage = "chat.error.openai_request_failed";
        if (!clientGone) {
          try {
            controller.enqueue(enc.encode(`event: error\ndata: ${JSON.stringify({
              message: streamSafeMessage
            })}\n\n`));
          } catch {}
        }
        logError("openai.stream.error", {
          err: e?.message,
          stack: e?.stack,
          userId,
          role: normalizedRole,
          isCrisis,
          messageLength: message.length
        });
        await logEvent("openai_error", {
          userId,
          role: normalizedRole,
          isCrisis,
          message: e?.message || "openai stream error",
          messageLength: message.length
        });
        if (persist && convId && userId) await persistDone({
          convId,
          userId,
          status: "ERROR"
        });
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
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no"
    }
  });
}
export async function GET(req) {
  const limitResponse = enforceChatRateLimit(req, {
    scope: "main_get",
    limit: CHAT_GET_RATE_LIMIT_MAX,
    windowMs: CHAT_RATE_LIMIT_WINDOW_MS
  });
  if (limitResponse) return limitResponse;

  return NextResponse.json({
    ok: true,
    route: "api/chat"
  });
}
