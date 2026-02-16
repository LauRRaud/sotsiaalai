import { NextResponse } from "next/server";
import { roleFromSession, normalizeRole, requireSubscription, hasActiveSubscription, isAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { publishRoomEvent } from "@/lib/roomStream";
import { pickReplyLang, langStrings, toResponsesInput, buildResponsesPayload } from "@/lib/chat/promptBuilder";
import { collapsePages, groupMatches, diversifyGroupsMMR, buildContextWithBudget, makeShortRef } from "@/lib/chat/ragContext";
import { detectCrisis, isGreeting, groundingStrength } from "@/lib/chat/safety";
import { persistInit, persistAppend, persistDone } from "@/lib/chat/persistence";
import { logEvent } from "@/lib/chat/logger";
import { RAG_TOP_K, CONTEXT_GROUPS_MAX, DIVERSIFY_LAMBDA, RAG_BASE, RAG_KEY } from "@/lib/chat/settings";
import { enforceChatRateLimit, readChatRateLimit } from "@/lib/chat-api-rate-limit";
import { canSpendMonthlyBudget } from "@/lib/usageBudget";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
const ALLOW_SPONSORED_WITHOUT_SUBSCRIPTION = process.env.ALLOW_SPONSORED_WITHOUT_SUBSCRIPTION !== "false";
const CHAT_RATE_LIMIT_WINDOW_MS = readChatRateLimit(process.env.CHAT_RATE_LIMIT_WINDOW_MS, 60_000, 1000);
const CHAT_POST_RATE_LIMIT_MAX = readChatRateLimit(process.env.CHAT_RATE_LIMIT_CHAT_POST_MAX, 24);
const CHAT_GET_RATE_LIMIT_MAX = readChatRateLimit(process.env.CHAT_RATE_LIMIT_CHAT_GET_MAX, 120);
const CHAT_HISTORY_MAX_ITEMS = readChatRateLimit(process.env.CHAT_HISTORY_MAX_ITEMS, 8, 1);
const CHAT_HISTORY_MAX_CHARS = readChatRateLimit(process.env.CHAT_HISTORY_MAX_CHARS, 2000, 200);
const CHAT_HISTORY_WITH_DOC_MAX_ITEMS = readChatRateLimit(process.env.CHAT_HISTORY_WITH_DOC_MAX_ITEMS, 6, 1);
const CHAT_HISTORY_WITH_DOC_MAX_CHARS = readChatRateLimit(process.env.CHAT_HISTORY_WITH_DOC_MAX_CHARS, 1200, 200);
const CHAT_EPHEMERAL_CHUNKS_MAX = readChatRateLimit(process.env.CHAT_EPHEMERAL_CHUNKS_MAX, 80, 1);
const CHAT_EPHEMERAL_CHUNK_CHARS_MAX = readChatRateLimit(process.env.CHAT_EPHEMERAL_CHUNK_CHARS_MAX, 1800, 200);
const CHAT_DOC_CONTEXT_CLIENT_CHARS = readChatRateLimit(process.env.CHAT_DOC_CONTEXT_CLIENT_CHARS, 1800, 300);
const CHAT_DOC_CONTEXT_CLIENT_COMBINED_CHARS = readChatRateLimit(process.env.CHAT_DOC_CONTEXT_CLIENT_COMBINED_CHARS, 1200, 300);
const CHAT_DOC_CONTEXT_WORKER_CHARS = readChatRateLimit(process.env.CHAT_DOC_CONTEXT_WORKER_CHARS, 2600, 300);
const CHAT_DOC_CONTEXT_WORKER_COMBINED_CHARS = readChatRateLimit(process.env.CHAT_DOC_CONTEXT_WORKER_COMBINED_CHARS, 1600, 300);
const CHAT_DOC_CONTEXT_CLIENT_MAX_CHUNKS = readChatRateLimit(process.env.CHAT_DOC_CONTEXT_CLIENT_MAX_CHUNKS, 4, 1);
const CHAT_DOC_CONTEXT_WORKER_MAX_CHUNKS = readChatRateLimit(process.env.CHAT_DOC_CONTEXT_WORKER_MAX_CHUNKS, 6, 1);
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
function toOpenAiMessages(history, options = {}) {
  if (!Array.isArray(history) || history.length === 0) return [];
  const maxItems = Math.max(1, Number(options.maxItems) || CHAT_HISTORY_MAX_ITEMS);
  const maxChars = Math.max(200, Number(options.maxChars) || CHAT_HISTORY_MAX_CHARS);
  return history.filter(msg => msg && typeof msg.text === "string").slice(-maxItems).map(msg => ({
    role: msg.role === "ai" ? "assistant" : "user",
    content: String(msg.text).slice(0, maxChars)
  }));
}
function normalizeEphemeralChunk(text, maxChars = CHAT_EPHEMERAL_CHUNK_CHARS_MAX) {
  const normalized = String(text || "").replace(/\r\n?/g, "\n").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (!normalized) return "";
  if (normalized.length <= maxChars) return normalized;
  return `${normalized.slice(0, Math.max(1, maxChars - 3)).trimEnd()}...`;
}
function tokenizeForChunkSearch(text = "") {
  const tokens = String(text || "").toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(token => token.length >= 3);
  return Array.from(new Set(tokens)).slice(0, 28);
}
function extractQueryPhrases(text = "") {
  const parts = String(text || "").toLowerCase().split(/[.?!\n;:]+/).map(s => s.trim()).filter(s => s.length >= 16);
  return Array.from(new Set(parts)).slice(0, 4);
}
function extractRecentUserText(history = [], maxItems = 2) {
  if (!Array.isArray(history) || !history.length) return [];
  const picked = [];
  for (let i = history.length - 1; i >= 0 && picked.length < maxItems; i -= 1) {
    const msg = history[i];
    const role = String(msg?.role || "").toLowerCase();
    if (!(role === "user" || role === "client")) continue;
    const text = String(msg?.text || msg?.content || "").trim();
    if (!text) continue;
    picked.push(text.slice(0, 700));
  }
  return picked.reverse();
}
function getDocContextBudget(role = "CLIENT", combineSources = false) {
  const worker = role === "SOCIAL_WORKER";
  return {
    charBudget: worker
      ? combineSources
        ? CHAT_DOC_CONTEXT_WORKER_COMBINED_CHARS
        : CHAT_DOC_CONTEXT_WORKER_CHARS
      : combineSources
        ? CHAT_DOC_CONTEXT_CLIENT_COMBINED_CHARS
        : CHAT_DOC_CONTEXT_CLIENT_CHARS,
    maxChunks: worker ? CHAT_DOC_CONTEXT_WORKER_MAX_CHUNKS : CHAT_DOC_CONTEXT_CLIENT_MAX_CHUNKS
  };
}
function buildEphemeralDocContext(ephemeralChunks = [], options = {}) {
  const chunks = Array.isArray(ephemeralChunks) ? ephemeralChunks : [];
  if (!chunks.length) return {
    text: "",
    usedChars: 0,
    usedChunks: 0
  };
  const maxChunks = Math.max(1, Number(options.maxChunks) || CHAT_DOC_CONTEXT_CLIENT_MAX_CHUNKS);
  const charBudget = Math.max(300, Number(options.charBudget) || CHAT_DOC_CONTEXT_CLIENT_CHARS);
  const normalized = [];
  const seen = new Set();
  for (const raw of chunks.slice(0, CHAT_EPHEMERAL_CHUNKS_MAX)) {
    const cleaned = normalizeEphemeralChunk(raw, CHAT_EPHEMERAL_CHUNK_CHARS_MAX);
    if (!cleaned) continue;
    const dedupeKey = cleaned.slice(0, 180).toLowerCase();
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    normalized.push(cleaned);
  }
  if (!normalized.length) return {
    text: "",
    usedChars: 0,
    usedChunks: 0
  };
  const queryText = String(options.queryText || "").trim().toLowerCase();
  const queryTokens = tokenizeForChunkSearch(queryText);
  const queryPhrases = extractQueryPhrases(queryText);
  const queryNumbers = Array.from(new Set((queryText.match(/\d+/g) || []).slice(0, 5)));
  const scored = normalized.map((chunk, index) => {
    const lower = chunk.toLowerCase();
    let tokenHits = 0;
    for (const token of queryTokens) {
      if (lower.includes(token)) tokenHits += 1;
    }
    let phraseHits = 0;
    for (const phrase of queryPhrases) {
      if (lower.includes(phrase)) phraseHits += 1;
    }
    let numberHits = 0;
    for (const numberToken of queryNumbers) {
      if (lower.includes(numberToken)) numberHits += 1;
    }
    const score = tokenHits * 1.5 + phraseHits * 2.1 + numberHits * 1.1 + (index === 0 ? 0.1 : 0);
    return {
      index,
      chunk,
      score
    };
  });
  const ranked = [...scored].sort((a, b) => b.score - a.score || a.index - b.index);
  let usedChars = 0;
  const selected = [];
  for (const entry of ranked) {
    if (selected.length >= maxChunks) break;
    const remaining = charBudget - usedChars;
    if (remaining < 120) break;
    const piece = entry.chunk.length > remaining ? entry.chunk.slice(0, remaining).trimEnd() : entry.chunk;
    if (!piece) continue;
    selected.push({
      index: entry.index,
      text: piece
    });
    usedChars += piece.length + 8;
  }
  if (!selected.length) {
    const fallback = normalized[0].slice(0, charBudget).trim();
    return {
      text: fallback,
      usedChars: fallback.length,
      usedChunks: fallback ? 1 : 0
    };
  }
  selected.sort((a, b) => a.index - b.index);
  const text = selected.map((entry, idx) => `[DOC ${idx + 1}]\n${entry.text}`).join("\n\n---\n\n").trim();
  return {
    text,
    usedChars: Math.min(charBudget, text.length),
    usedChunks: selected.length
  };
}
function detectSourcesRequest(history = [], message = "") {
  const sourcesText = [];
  if (typeof message === "string") sourcesText.push(message);
  if (Array.isArray(history)) {
    for (const h of history) {
      const role = String(h?.role || "").toLowerCase();
      if (role === "user" || role === "client") {
        sourcesText.push(h?.text || h?.content || "");
      }
    }
  }
  const txt = sourcesText.join(" ").toLowerCase();
  const tokens = [
    "allik",
    "viide",
    "source",
    "cite",
    "citation",
    "\u0438\u0441\u0442\u043e\u0447\u043d",
    "\u0441\u0441\u044b\u043b\u043a"
  ];
  return tokens.some(token => txt.includes(token));
}
async function searchRagDirect({
  query,
  topK = RAG_TOP_K,
  filters
}) {
  const body = {
    query,
    top_k: topK,
    where: filters || undefined
  };
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 12000);
  const res = await fetch(`${RAG_BASE}/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(RAG_KEY ? {
        "X-API-Key": RAG_KEY
      } : {})
    },
    body: JSON.stringify(body),
    cache: "no-store",
    signal: controller.signal
  });
  clearTimeout(t);
  let data = null;
  try {
    const raw = await res.text();
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = null;
  }
  if (!res.ok) {
    return [];
  }
  return Array.isArray(data?.results) ? data.results : [];
}
async function callOpenAI({
  history,
  userMessage,
  context,
  effectiveRole,
  grounding,
  includeSources,
  replyLang,
  isCrisis
}) {
  const {
    default: OpenAI
  } = await import("openai");
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
  const client = new OpenAI({
    apiKey
  });
  const input = toResponsesInput({
    history,
    userMessage,
    context,
    effectiveRole,
    grounding,
    includeSources,
    replyLang,
    isCrisis
  });
  const payload = buildResponsesPayload(input, {
    stream: false
  });
  const resp = await client.responses.create(payload);
  const reply = resp.output_text && resp.output_text.trim() || "Sorry, I couldn't generate an answer right now.";
  return {
    reply
  };
}
async function streamOpenAI({
  history,
  userMessage,
  context,
  effectiveRole,
  grounding,
  includeSources,
  replyLang,
  isCrisis
}) {
  const {
    default: OpenAI
  } = await import("openai");
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
  const client = new OpenAI({
    apiKey
  });
  const input = toResponsesInput({
    history,
    userMessage,
    context,
    effectiveRole,
    grounding,
    includeSources,
    replyLang,
    isCrisis
  });
  const payload = buildResponsesPayload(input, {
    stream: true
  });
  const stream = await client.responses.stream(payload);
  async function* iterator() {
    for await (const event of stream) {
      if (event.type === "response.output_text.delta") {
        yield {
          type: "delta",
          text: event.delta || ""
        };
      } else if (event.type === "response.error") {
        throw new Error(event.error?.message || "OpenAI stream error");
      } else if (event.type === "response.completed") {
        yield {
          type: "done"
        };
      }
    }
  }
  return iterator();
}
function normalizePageRangeString(s = "") {
  return s.replace(/\s*[-\u2010-\u2015]\s*/g, "-").trim();
}
function normalizeRoomId(roomIdRaw) {
  const value = String(roomIdRaw || "").trim();
  return value || null;
}
function isPlausibleConversationId(id) {
  if (!id || typeof id !== "string") return false;
  if (id.length < 8 || id.length > 200) return false;
  return /^[A-Za-z0-9._\-:+]+$/.test(id);
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
  const ephemeralChunks = Array.isArray(payload?.ephemeralChunks)
    ? payload.ephemeralChunks.filter(s => typeof s === "string" && s.trim()).slice(0, CHAT_EPHEMERAL_CHUNKS_MAX).map(s => normalizeEphemeralChunk(s, CHAT_EPHEMERAL_CHUNK_CHARS_MAX)).filter(Boolean)
    : [];
  const ephemeralSource = payload?.ephemeralSource && typeof payload.ephemeralSource === "object" ? payload.ephemeralSource : null;
  const combineSources = payload?.combineSources === true;
  const forceSources = payload?.forceSources === true || payload?.includeSources === true || payload?.showSources === true;
  const includeSources = forceSources || detectSourcesRequest(rawHistory, message);
  const userId = session?.user?.id || null;
  const sessionRole = roleFromSession(session);
  const payloadRole = typeof payload?.role === "string" ? payload.role.toUpperCase().trim() : "";
  const pickedRole = sessionRole || payloadRole || "CLIENT";
  const normalizedRole = normalizeRole(pickedRole);
  const history = toOpenAiMessages(rawHistory, ephemeralChunks.length
    ? {
        maxItems: CHAT_HISTORY_WITH_DOC_MAX_ITEMS,
        maxChars: CHAT_HISTORY_WITH_DOC_MAX_CHARS
      }
    : {
        maxItems: CHAT_HISTORY_MAX_ITEMS,
        maxChars: CHAT_HISTORY_MAX_CHARS
      });
  const adminUser = isAdmin(session?.user);
  let roomMembership = null;
  if (roomId && userId && !adminUser) {
    roomMembership = await getRoomMembership(userId, roomId);
    if (!roomMembership) return makeError("api.common.forbidden", 403);
  }
  let gate = await requireSubscription(session, normalizedRole);
  if (!gate.ok && roomId && roomMembership?.billingSource === "SPONSORED_BY_HOST") {
    if (ALLOW_SPONSORED_WITHOUT_SUBSCRIPTION) {
      gate = {
        ok: true,
        status: 200
      };
    } else if (await hasActiveSubscription(roomMembership.sponsorUserId)) {
      gate = {
        ok: true,
        status: 200
      };
    }
  }
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
  const replyLang = pickReplyLang({
    userMessage: message,
    uiLocale
  });
  const L = langStrings(replyLang, normalizedRole);
  const isCrisis = detectCrisis(message);
  const hasHistory = Array.isArray(rawHistory) && rawHistory.length > 0;
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
    convId
  });
  if (isCrisis) {
    logInfo("crisis.detected", {
      role: normalizedRole,
      hasHistory,
      fromRag: false
    });
  }
  const greeting = isGreeting(message);
  if (greeting && !isCrisis && !hasHistory) {
    const reply = normalizedRole === "SOCIAL_WORKER" ? L.greetingWorker : L.greetingClient;
    if (persist && convId && userId) {
      await persistInit({
        convId,
        userId,
        role: normalizedRole,
        sources: [],
        isCrisis,
        userMessage: message
      });
      await persistAppend({
        convId,
        userId,
        fullText: reply
      });
      await persistDone({
        convId,
        userId,
        status: "COMPLETED",
        finalText: reply,
        sources: [],
        isCrisis
      });
    }
    if (roomId && userId) {
      await saveAssistantRoomMessage({
        roomId,
        userId,
        content: reply
      });
    }
    if (!wantStream) {
      return NextResponse.json({
        ok: true,
        reply,
        answer: reply,
        sources: [],
        isCrisis,
        convId: convId || undefined
      });
    }
    const enc = new TextEncoder();
    const sse = new ReadableStream({
      async start(controller) {
        try {
          controller.enqueue(enc.encode(`event: meta\ndata: ${JSON.stringify({
            sources: [],
            isCrisis
          })}\n\n`));
          controller.enqueue(enc.encode(`event: delta\ndata: ${JSON.stringify({
            t: reply
          })}\n\n`));
          controller.enqueue(enc.encode(`event: done\ndata: {}\n\n`));
        } finally {
          try {
            controller.close();
          } catch {}
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
  const audienceFilter = payload?.audience === "CLIENT" || normalizedRole === "CLIENT" ? {
    audience: {
      $in: ["CLIENT", "BOTH"]
    }
  } : {
    audience: {
      $in: ["SOCIAL_WORKER", "BOTH"]
    }
  };
  let matches = [];
  let groupedMatches = [];
  let chosen = [];
  let budgeted = {
    text: "",
    used: []
  };
  if (!ephemeralChunks.length || combineSources) {
    try {
      matches = await searchRagDirect({
        query: message,
        topK: RAG_TOP_K,
        filters: audienceFilter
      });
    } catch (err) {
      logError("rag.search.error", {
        err: err?.message,
        role: normalizedRole,
        userId
      });
      await logEvent("rag_error", {
        userId,
        role: normalizedRole,
        isCrisis,
        message: err?.message || "rag search error"
      });
    }
    groupedMatches = groupMatches(matches);
    chosen = diversifyGroupsMMR(groupedMatches, CONTEXT_GROUPS_MAX, DIVERSIFY_LAMBDA);
    budgeted = buildContextWithBudget(chosen);
  }
  const ragContext = budgeted.text;
  const docBudget = getDocContextBudget(normalizedRole, combineSources);
  const docQueryText = [message, ...extractRecentUserText(rawHistory, 2)].filter(Boolean).join("\n");
  const docContextResult = buildEphemeralDocContext(ephemeralChunks, {
    queryText: docQueryText,
    charBudget: docBudget.charBudget,
    maxChunks: docBudget.maxChunks
  });
  const docContext = docContextResult.text;
  const contextParts = [];
  if (docContext) {
    contextParts.push(`USER DOCUMENT:\n${docContext}`);
  }
  if (!docContext) {
    if (ragContext) contextParts.push(ragContext);
  } else if (combineSources && ragContext) {
    contextParts.push(ragContext);
  }
  const context = contextParts.filter(Boolean).join("\n\n");
  const grounding = groundingStrength(groupedMatches);
  const hadDocContext = !!docContext;
  const hadRagContext = !!ragContext;
  logInfo("rag.afterSearch", {
    rawMatches: matches.length,
    groups: groupedMatches.length,
    grounding,
    mmrSelected: chosen.length,
    docChunkInputCount: ephemeralChunks.length,
    docChunkUsedCount: docContextResult.usedChunks,
    docContextChars: docContextResult.usedChars
  });
  await logEvent("rag_search", {
    userId,
    role: normalizedRole,
    isCrisis,
    ragMatchCount: matches.length,
    groupCount: groupedMatches.length,
    chosenGroupCount: chosen.length,
    grounding,
    docChunkInputCount: ephemeralChunks.length,
    docChunkUsedCount: docContextResult.usedChunks,
    docContextChars: docContextResult.usedChars,
    hadDocContext,
    hadRagContext
  });
  if (isCrisis) {
    await logEvent("crisis_detected", {
      userId,
      role: normalizedRole,
      hasHistory,
      hadRagContext
    });
  }
  const docSources = ephemeralChunks && ephemeralChunks.length ? [{
    id: "user-document",
    title: "(Uploaded document)",
    url: undefined,
    file: undefined,
    fileName: typeof ephemeralSource?.fileName === "string" ? ephemeralSource.fileName : undefined,
    audience: undefined,
    pageRange: undefined,
    authors: undefined,
    issueLabel: undefined,
    issueId: undefined,
    journalTitle: undefined,
    section: undefined,
    year: undefined,
    pages: undefined,
    short_ref: "(uploaded document)"
  }] : [];
  const ragSources = (budgeted.used.length ? budgeted.used : chosen).map((entry, idx) => {
    const pageNumbers = Array.isArray(entry.pages) ? entry.pages : [];
    const pageRanges = Array.isArray(entry.pageRanges) ? Array.from(new Set(entry.pageRanges.filter(Boolean))) : [];
    const pageTextRaw = (pageRanges.length ? pageRanges.join(", ") : collapsePages(pageNumbers)).trim();
    const pageText = normalizePageRangeString(pageTextRaw);
    const short_ref_text = (makeShortRef(entry, pageText) || "").trim();
    return {
      id: entry.key || entry.docId || entry.articleId || entry.url || entry.fileName || `source-${idx}`,
      title: entry.title,
      url: entry.url || undefined,
      file: undefined,
      fileName: entry.fileName || undefined,
      audience: entry.audience || undefined,
      pageRange: pageText || undefined,
      authors: Array.isArray(entry.authors) && entry.authors.length ? entry.authors : undefined,
      issueLabel: entry.issueLabel || undefined,
      issueId: entry.issueId || undefined,
      journalTitle: entry.journalTitle || undefined,
      section: entry.section || undefined,
      year: entry.year || undefined,
      pages: pageNumbers.length ? pageNumbers : undefined,
      short_ref: short_ref_text || undefined
    };
  });
  let sources;
  if (docSources.length && combineSources) {
    sources = [...docSources, ...ragSources];
  } else if (docSources.length) {
    sources = docSources;
  } else {
    sources = ragSources;
  }
  if (!context || !context.trim()) {
    const out = isCrisis ? L.crisisNoCtx : L.noContext;
    logInfo("branch.noContext", {
      role: normalizedRole,
      isCrisis,
      ragReturned: matches.length > 0,
      hadDocContext: !!docContext
    });
    await logEvent("no_context", {
      userId,
      role: normalizedRole,
      isCrisis,
      hadRagResults: matches.length > 0,
      hadDocContext: !!docContext
    });
    if (persist && convId && userId) {
      await persistInit({
        convId,
        userId,
        role: normalizedRole,
        sources,
        isCrisis,
        userMessage: message
      });
      await persistAppend({
        convId,
        userId,
        fullText: out
      });
      await persistDone({
        convId,
        userId,
        status: "COMPLETED",
        finalText: out,
        sources,
        isCrisis
      });
    }
    if (roomId && userId) {
      await saveAssistantRoomMessage({
        roomId,
        userId,
        content: out
      });
    }
    if (!wantStream) {
      return NextResponse.json({
        ok: true,
        reply: out,
        answer: out,
        sources,
        isCrisis,
        convId: convId || undefined
      });
    }
    const enc = new TextEncoder();
    const sse = new ReadableStream({
      async start(controller) {
        try {
          controller.enqueue(enc.encode(`event: meta\ndata: ${JSON.stringify({
            sources,
            isCrisis
          })}\n\n`));
          controller.enqueue(enc.encode(`event: delta\ndata: ${JSON.stringify({
            t: out
          })}\n\n`));
          controller.enqueue(enc.encode(`event: done\ndata: {}\n\n`));
        } finally {
          try {
            controller.close();
          } catch {}
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
  if (persist && convId && userId) {
    await persistInit({
      convId,
      userId,
      role: normalizedRole,
      sources,
      isCrisis,
      userMessage: message
    });
  }
  if (!wantStream) {
    try {
      const aiResult = await callOpenAI({
        history,
        userMessage: message,
        context,
        effectiveRole: normalizedRole,
        grounding,
        includeSources,
        replyLang,
        isCrisis
      });
      if (persist && convId && userId) {
        await persistAppend({
          convId,
          userId,
          fullText: aiResult.reply
        });
        await persistDone({
          convId,
          userId,
          status: "COMPLETED",
          finalText: aiResult.reply,
          sources,
          isCrisis
        });
      }
      if (roomId && userId) {
        await saveAssistantRoomMessage({
          roomId,
          userId,
          content: aiResult.reply
        });
      }
      return NextResponse.json({
        ok: true,
        reply: aiResult.reply,
        answer: aiResult.reply,
        sources,
        isCrisis,
        convId: convId || undefined
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
  const sse = new ReadableStream({
    async start(controller) {
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
          userMessage: message,
          context,
          effectiveRole: normalizedRole,
          grounding,
          includeSources,
          replyLang,
          isCrisis
        });
        for await (const ev of iter) {
          if (ev.type === "delta" && ev.text) {
            accumulated += ev.text;
            if (!clientGone) {
              try {
                controller.enqueue(enc.encode(`event: delta\ndata: ${JSON.stringify({
                  t: ev.text
                })}\n\n`));
              } catch {
                clientGone = true;
              }
            }
          } else if (ev.type === "done") {
            if (persist && convId && userId) {
              await persistAppend({
                convId,
                userId,
                fullText: accumulated
              });
              await persistDone({
                convId,
                userId,
                status: "COMPLETED",
                finalText: accumulated,
                sources,
                isCrisis
              });
            }
            if (roomId && userId) {
              await saveAssistantRoomMessage({
                roomId,
                userId,
                content: accumulated
              });
            }
            if (!clientGone) {
              try {
                controller.enqueue(enc.encode(`event: done\ndata: {}\n\n`));
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
