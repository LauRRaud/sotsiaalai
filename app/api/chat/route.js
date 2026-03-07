import { NextResponse } from "next/server";
import { requireSubscription, resolveSessionRoleState } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { publishRoomEvent } from "@/lib/roomStream";
import { pickReplyLang, langStrings, toResponsesInput, buildResponsesPayload } from "@/lib/chat/promptBuilder";
import {
  chooseOrchestrationPlan,
  countClarifyingTurns,
  inferRequestedThoroughness,
  WORK_MODES
} from "@/lib/chat/orchestrationPolicy";
import { collapsePages, groupMatches, diversifyGroupsMMR, buildContextWithBudget, makeShortRef } from "@/lib/chat/ragContext";
import { detectCrisis, isGreeting, groundingStrength } from "@/lib/chat/safety";
import { persistInit, persistAppend, persistDone } from "@/lib/chat/persistence";
import { logEvent } from "@/lib/chat/logger";
import { RAG_TOP_K, CONTEXT_GROUPS_MAX, DIVERSIFY_LAMBDA, RAG_BASE, RAG_KEY } from "@/lib/chat/settings";
import { enforceChatRateLimit, readChatRateLimit } from "@/lib/chat-api-rate-limit";
import { canSpendMonthlyBudget } from "@/lib/usageBudget";
import { AGENT_ARTIFACT_TYPE_VALUES, MAX_ARTIFACT_SOURCE_DOCUMENTS } from "@/lib/documents/constants";
import { generateArtifactDraftContent, normalizeAgentLanguage } from "@/lib/documents/generation";
import { cacheRetrievalDebugMeta } from "@/lib/documents/retrievalObservability";
import {
  resolveDocumentTaskDecision
} from "@/lib/chat/documentOrchestration";
import { buildHelpWorkflowMetadata, getHelpWorkflowState, runHelpChatWorkflow } from "@/lib/help/chatWorkflow";
import { detectHelpChatIntent } from "@/lib/help/intents";
import { isActiveHelpWorkflowState } from "@/lib/help/workflowState";
import { buildModeSelectionMetadata, resolveModeSelection } from "@/lib/chat/modeSelection";
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
        reasoning: plan.reasoning || "medium",
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
function buildImmediateChatResponse({
  wantStream = false,
  reply = "",
  sources = [],
  attachments = [],
  cards = [],
  isCrisis = false,
  convId = null
}) {
  if (!wantStream) {
    return NextResponse.json({
      ok: true,
      reply,
      answer: reply,
      sources,
      attachments,
      cards,
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
          t: reply
        })}\n\n`));
        controller.enqueue(enc.encode(`event: done\ndata: ${JSON.stringify({
          attachments,
          cards
        })}\n\n`));
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
function shouldOfferDocumentDownload(message = "") {
  const lower = String(message || "").toLowerCase();
  const hasPdf = /\bpdf\b/.test(lower);
  const hasDocx = /\bdocx?\b/.test(lower);
  const hasWord = /\bms\s*word\b/.test(lower) || /\bwordi?\b/.test(lower);
  const hasFileIntent = /(allalaad|download|fail|file|dokument|document|export|eksport|laadi)/.test(lower);
  if (hasPdf || hasDocx) return true;
  if (hasWord && hasFileIntent) return true;
  return false;
}
function inferDocumentFormats(message = "") {
  const lower = String(message || "").toLowerCase();
  const wantsPdf = /\bpdf\b/.test(lower);
  const wantsWord = /\bdocx?\b/.test(lower) || /\bms\s*word\b/.test(lower) || /\bwordi?\b/.test(lower);
  if (wantsPdf && wantsWord) return ["pdf", "word"];
  if (wantsWord) return ["word"];
  return ["pdf"];
}
const CLIENT_TASK_OPTIONS = [
  { value: "LETTER_REQUEST", artifactType: "LETTER_DRAFT" },
  { value: "LETTER_REPLY", artifactType: "LETTER_DRAFT" },
  { value: "FILL_FORM", artifactType: "OTHER" }
];
function normalizeIntentText(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .toLowerCase()
    .trim();
}
function collectRecentUserInputs(history = [], currentMessage = "", maxItems = 8) {
  const items = [];
  if (Array.isArray(history)) {
    for (let i = history.length - 1; i >= 0 && items.length < maxItems; i -= 1) {
      const entry = history[i];
      const role = String(entry?.role || "").toLowerCase();
      if (!(role === "user" || role === "client")) continue;
      const text = String(entry?.text || entry?.content || "").trim();
      if (!text) continue;
      items.push(text);
    }
  }
  const current = String(currentMessage || "").trim();
  if (current) items.unshift(current);
  return items.reverse();
}
function detectClientTaskFromText(text = "") {
  const lower = normalizeIntentText(text);
  if (/\b(vorm|ankeet|blank|form|fill\s*form|fill in|taida vorm|taida ankeet)\b/.test(lower)) {
    return "FILL_FORM";
  }
  if (/\b(vastus|vastuskiri|reply|response|answer|reply letter)\b/.test(lower)) {
    return "LETTER_REPLY";
  }
  return "LETTER_REQUEST";
}
function artifactTypeFromClientTask(task = "LETTER_REQUEST") {
  const option = CLIENT_TASK_OPTIONS.find((entry) => entry.value === String(task || "").trim().toUpperCase());
  return option?.artifactType || "LETTER_DRAFT";
}
function clientTaskInstruction(task = "LETTER_REQUEST") {
  if (task === "LETTER_REPLY") {
    return "Draft a clear and practical reply to the received letter. Base it only on the user's instruction and the selected source files.";
  }
  if (task === "FILL_FORM") {
    return "Help fill in the selected form or blank. Treat the uploaded files as the working materials for this task: one file may be the form itself and the second file may contain the information that should go into it. If the file is not directly fillable, produce a structured draft the user can copy into the form.";
  }
  return "Draft a clear request or application text that the user can review, edit, and send.";
}
function inferWorkerArtifactTypeFromText(text = "") {
  const lower = normalizeIntentText(text);
  if (/\b(checklist|kontrollnimekiri|kontroll)\b/.test(lower)) return "CHECKLIST";
  if (/\b(koosolek|meeting|protokoll|minut)\b/.test(lower)) return "MEETING_SUMMARY";
  if (/\b(case\s*brief|juhtumi|juhtum)\b/.test(lower)) return "CASE_BRIEF";
  if (/\b(kiri|letter|avaldus|taotlus)\b/.test(lower)) return "LETTER_DRAFT";
  if (/\b(other|muu|vaba\s*vorm)\b/.test(lower)) return "OTHER";
  return "REPORT_DRAFT";
}
function inferToneFromText(text = "") {
  const lower = normalizeIntentText(text);
  if (/\b(supportive|toetav|rahulik|hooliv)\b/.test(lower)) return "supportive";
  if (/\b(plain|lihtne|simple|selge)\b/.test(lower)) return "plain";
  return "professional";
}
function inferLengthFromText(text = "") {
  const lower = normalizeIntentText(text);
  if (/\b(short|luhike|luhidalt|brief)\b/.test(lower)) return "short";
  if (/\b(detailed|detailne|pohjalik|thorough)\b/.test(lower)) return "detailed";
  return "standard";
}
function inferAudienceFromText(text = "", fallback = "worker") {
  const lower = normalizeIntentText(text);
  if (/\b(client|abivaj|poor|poordu|help[-\s]?seeker|service user)\b/.test(lower)) return "client";
  if (/\b(worker|spetsialist|sotsiaaltootaja|ametnik|social worker|institution)\b/.test(lower)) return "worker";
  return fallback;
}
function inferLanguageFromText(text = "", fallback = "et") {
  const lower = normalizeIntentText(text);
  if (/\b(in english|english|inglise)\b/.test(lower)) return "en";
  if (/\b(in russian|russian|vene)\b/.test(lower)) return "ru";
  if (/\b(in estonian|estonian|eesti)\b/.test(lower)) return "et";
  return fallback;
}
function wantsTemplateFromText(text = "") {
  const lower = normalizeIntentText(text);
  return /\b(mall|template)\b/.test(lower);
}
function isTemplateCompatibleForType(template, artifactType) {
  const templateType = String(template?.templateFor || "").trim().toUpperCase();
  const targetType = String(artifactType || "").trim().toUpperCase();
  return !templateType || templateType === "OTHER" || templateType === targetType;
}
function detectDocumentTaskIntent(message = "") {
  const text = normalizeIntentText(message);
  if (!text) return false;
  const hasAction = /\b(koost\w*|kirjut\w*|loo|luu\w*|loom\w*|aita\w*|valmista\w*|vormista\w*|prepare\w*|create\w*|draft\w*|write\w*|generate\w*|compose\w*)\b/.test(text);
  const hasType = /\b(aruan\w*|raport\w*|report\w*|kokkuv\w*|summary\w*|letter\w*|kiri\w*|memo\w*|checklist\w*|protokoll\w*|brief\w*|case\w*|vorm\w*|form\w*|taotlus\w*|avaldus\w*|vastus\w*)\b/.test(text);
  return hasAction && hasType;
}
function _detectDocumentTaskFollowup(message = "") {
  const text = normalizeIntentText(message);
  if (!text) return false;
  return /\b(mall|template|allik|source|tahtaeg|deadline|sihtr|audience|toon|tone|pikkus|length|keel|language|eesmark|goal|format|taotlus|vastus|vorm)\b/.test(text);
}
function hasDocumentTaskContext(history = []) {
  if (!Array.isArray(history) || !history.length) return false;
  for (let i = history.length - 1; i >= 0 && i >= history.length - 10; i -= 1) {
    const entry = history[i];
    const role = String(entry?.role || "").toLowerCase();
    if (!(role === "user" || role === "client")) continue;
    const text = String(entry?.text || entry?.content || "").trim();
    if (!text) continue;
    if (detectDocumentTaskIntent(text)) return true;
  }
  return false;
}
function isAffirmativeMessage(message = "") {
  const text = normalizeIntentText(message);
  if (!text) return false;
  return ["jah", "j", "yes", "y", "ok", "okay", "okei"].includes(text);
}
function isDocumentStartCommand(message = "", history = []) {
  const text = normalizeIntentText(message);
  if (!text) return false;
  if (/\b(alust\w*|kaivit\w*|hakka\w*|start\w*|run\w*|begin\w*)\b/.test(text) && /\b(mustand\w*|draft\w*|aruan\w*|raport\w*|kokkuv\w*|kiri\w*|checklist\w*|protokoll\w*|vorm\w*|document\w*|dokument\w*|report\w*|summary\w*|letter\w*|form\w*|taotlus\w*|avaldus\w*)\b/.test(text)) {
    return true;
  }
  return isAffirmativeMessage(text) && hasDocumentTaskContext(history);
}
function extractDocumentTaskInstruction(history = [], currentMessage = "") {
  const inputs = collectRecentUserInputs(history, currentMessage, 6);
  const filtered = inputs.filter((text) => {
    if (!text) return false;
    if (isDocumentStartCommand(text, history)) return false;
    if (isAffirmativeMessage(text)) return false;
    return true;
  });
  return filtered.slice(-4).join("\n").trim();
}
function buildDocumentIntakeReply({
  replyLang,
  sourceCount = 0,
  role = "SOCIAL_WORKER",
  defaults = {}
}) {
  const outputList = role === "CLIENT"
    ? "LETTER_REQUEST, LETTER_REPLY, FILL_FORM"
    : AGENT_ARTIFACT_TYPE_VALUES.join(", ");
  const audience = String(defaults?.audience || (role === "CLIENT" ? "client" : "worker"));
  const tone = String(defaults?.tone || "professional");
  const language = String(defaults?.language || "et");
  const length = String(defaults?.length || "standard");
  if (replyLang === "en") {
    return [
      "Understood: this is a document task and I can run the same agent workflow as in Agent mode.",
      "",
      `Role profile: ${role === "CLIENT" ? "help-seeker" : "social work specialist"}.`,
      `Available output options: ${outputList}.`,
      "",
      "Before starting, confirm:",
      "1. Output type / task",
      "2. Instruction details",
      "3. Audience, tone, language, length",
      "4. Template usage (if needed)",
      "5. Source documents",
      "",
      `Current defaults: audience=${audience}, tone=${tone}, language=${language}, length=${length}.`,
      `Currently agent-allowed source documents: ${sourceCount}.`,
      role === "CLIENT"
        ? `Client mode limit is ${CLIENT_AGENT_DOCUMENT_LIMIT} source documents per run.`
        : "Specialist mode supports more source documents per run.",
      "When ready, write: \"Start draft generation\"."
    ].join("\n");
  }
  if (replyLang === "ru") {
    return [
      "Ponjal: eto zadacha na dokument, i mozhno zapustit agent workflow kak v Agent mode.",
      "",
      `Profil roli: ${role === "CLIENT" ? "help-seeker" : "social work specialist"}.`,
      `Dostupnye varianty vyhoda: ${outputList}.`,
      "",
      "Pered zapuskom utochnite:",
      "1. Tip vyhoda / zadachi",
      "2. Detali instrukcii",
      "3. Audience, tone, language, length",
      "4. Nuzhen li template",
      "5. Kakie istochniki ispolzovat",
      "",
      `Tekushchie defaulty: audience=${audience}, tone=${tone}, language=${language}, length=${length}.`,
      `Razreshennye istochniki: ${sourceCount}.`,
      role === "CLIENT"
        ? `V client profile limit = ${CLIENT_AGENT_DOCUMENT_LIMIT} istochnika na zapusk.`
        : "V specialist profile mozhno bolshe istochnikov.",
      "Kogda gotovy, napishite: \"Start draft generation\"."
    ].join("\n");
  }
  return [
    "Sain aru: see on dokumendiülesanne ja saan käivitada sama agent-töövoo nagu agendireziimis.",
    "",
    `Rolliprofiil: ${role === "CLIENT" ? "eluküsimusega poorduja" : "sotsiaaltoo spetsialist"}.`,
    `Valjundi valikud: ${outputList}.`,
    "",
    "Enne kaivitamist taipsusta:",
    "1. Väljundi tüüp / ülesanne",
    "2. Täpne juhis",
    "3. Audience, tone, language, length",
    "4. Kas kasutada malli",
    "5. Millised allikad kasutada",
    "",
    `Vaikesätted: audience=${audience}, tone=${tone}, language=${language}, length=${length}.`,
    `Praegu on agendile lubatud allikaid: ${sourceCount}.`,
    role === "CLIENT"
      ? `Pöörduja profiilis on piirang ${CLIENT_AGENT_DOCUMENT_LIMIT} allikat jooksu kohta.`
      : "Spetsialisti profiilis saab kasutada suuremat allikate hulka.",
    "Kui valmis, kirjuta: \"Alusta mustandi loomist\"."
  ].join("\n");
}
function buildDocumentMissingSourcesReply(replyLang) {
  if (replyLang === "en") {
    return "I cannot start the draft yet because there are no agent-allowed source documents. Add files in Documents and allow them for agent mode.";
  }
  if (replyLang === "ru") {
    return "Ne mogu zapustit draft: net istochnikov s dostupom dlya agenta. Dobavte faily v Documents i vklyuchite agent mode.";
  }
  return "Mustandit ei saa veel käivitada, sest agendile lubatud allikaid ei ole. Lisa failid Dokumentidesse ja luba need agendirežiimi jaoks.";
}
function buildDocumentMissingInstructionReply(replyLang) {
  if (replyLang === "en") {
    return "To run 1:1 agent workflow I still need a concrete instruction. Describe what exactly should be created and what to emphasize.";
  }
  if (replyLang === "ru") {
    return "Dlya zapuska 1:1 agent workflow nuzhna konkretnaya instrukciya: chto sozdavat i chto podcherknut.";
  }
  return "1:1 agent-workflow kaivitamiseks on vaja konkreetset juhist: mida tapselt koostada ja mida rohutada.";
}
function buildDocumentTaskAttachments({ replyLang, artifactId = "", includeAgentWorkspace = true }) {
  const labels = replyLang === "en"
    ? {
        addSources: "Add sources",
        openDocuments: "Open documents",
        openDraft: "Open draft",
        openEditor: "Open in editor",
        openAgent: "Open Agent mode"
      }
    : replyLang === "ru"
      ? {
          addSources: "Dobavit istochniki",
          openDocuments: "Otkryt documents",
          openDraft: "Otkryt draft",
          openEditor: "Otkryt v redaktore",
          openAgent: "Otkryt Agent mode"
        }
      : {
          addSources: "Lisa allikad",
          openDocuments: "Ava dokumendid",
          openDraft: "Ava mustand",
          openEditor: "Ava redigeerijas",
          openAgent: "Ava agendireziim"
        };
  if (!artifactId) {
    const links = [
      { label: labels.addSources, url: "/documents" },
      { label: labels.openDocuments, url: "/documents" }
    ];
    if (includeAgentWorkspace) links.push({ label: labels.openAgent, url: "/agendireziim" });
    return links;
  }
  const links = [
    { label: labels.openDraft, url: `/documents/artifacts/${encodeURIComponent(artifactId)}` },
    { label: labels.openEditor, url: `/agendireziim?artifact=${encodeURIComponent(artifactId)}` }
  ];
  if (includeAgentWorkspace) links.push({ label: labels.openAgent, url: "/agendireziim" });
  return links;
}
function _buildDocumentTaskRuntimeConfig({ role = "SOCIAL_WORKER", replyLang = "et", history = [], message = "" }) {
  const defaultAudience = role === "CLIENT" ? "client" : "worker";
  const inputs = collectRecentUserInputs(history, message, 8);
  const contextText = normalizeIntentText(inputs.join("\n"));
  const instruction = extractDocumentTaskInstruction(history, message) || String(message || "").trim();
  const tone = inferToneFromText(contextText);
  const length = inferLengthFromText(contextText);
  const audience = inferAudienceFromText(contextText, defaultAudience);
  const language = normalizeAgentLanguage(inferLanguageFromText(contextText, replyLang), replyLang);
  const wantsTemplate = role !== "CLIENT" && wantsTemplateFromText(contextText);
  if (role === "CLIENT") {
    const clientTask = detectClientTaskFromText(contextText);
    const artifactType = artifactTypeFromClientTask(clientTask);
    const mergedInstruction = `${clientTaskInstruction(clientTask)}\n\n${instruction}`.trim();
    return [
      {
        role,
        artifactType,
        clientTask,
        instruction: mergedInstruction,
        audience,
        tone,
        language,
        length,
        wantsTemplate: false
      },
      {
        role,
        audience,
        tone,
        language,
        length
      }
    ];
  }
  const artifactType = inferWorkerArtifactTypeFromText(contextText);
  const safeType = AGENT_ARTIFACT_TYPE_VALUES.includes(artifactType) ? artifactType : "REPORT_DRAFT";
  return [
    {
      role,
      artifactType: safeType,
      clientTask: null,
      instruction,
      audience,
      tone,
      language,
      length,
      wantsTemplate
    },
    {
      role,
      audience,
      tone,
      language,
      length
    }
  ];
}
function buildDownloadAttachments({
  convId,
  assistantMessageId,
  message,
  replyLang
}) {
  if (!convId || !assistantMessageId) return [];
  const labels =
    replyLang === "et"
      ? {
          pdf: "Laadi PDF alla",
          word: "Laadi Word alla"
        }
      : replyLang === "ru"
        ? {
            pdf: "Скачать PDF",
            word: "Скачать Word"
          }
        : {
            pdf: "Download PDF",
            word: "Download Word"
          };
  const formats = inferDocumentFormats(message);
  return formats.map(format => {
    const qs = new URLSearchParams({
      convId: String(convId),
      messageId: String(assistantMessageId),
      format
    });
    const ext = format === "word" ? "doc" : "pdf";
    return {
      label: labels[format] || labels.pdf,
      fileName: `sotsiaalai-summary.${ext}`,
      format,
      url: `/api/chat/export?${qs.toString()}`
    };
  });
}
function buildSseImmediateResponse({ sources = [], isCrisis = false, reply = "", attachments = [], cards = [] }) {
  const enc = new TextEncoder();
  const sse = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(enc.encode(`event: meta\ndata: ${JSON.stringify({ sources, isCrisis })}\n\n`));
        controller.enqueue(enc.encode(`event: delta\ndata: ${JSON.stringify({ t: reply })}\n\n`));
        controller.enqueue(enc.encode(`event: done\ndata: ${JSON.stringify({ attachments, cards })}\n\n`));
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
  isCrisis,
  reasoningEffort
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
    stream: false,
    reasoningEffort
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
  isCrisis,
  reasoningEffort
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
    stream: true,
    reasoningEffort
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
async function mergeAssistantMessageMetadata(assistantMessageId, metadataPatch) {
  if (!assistantMessageId || !metadataPatch || typeof metadataPatch !== "object") return;
  try {
    const existing = await prisma.conversationMessage.findUnique({
      where: {
        id: assistantMessageId
      },
      select: {
        metadata: true
      }
    });
    const baseMeta = existing?.metadata && typeof existing.metadata === "object" ? existing.metadata : {};
    await prisma.conversationMessage.update({
      where: {
        id: assistantMessageId
      },
      data: {
        metadata: {
          ...baseMeta,
          ...metadataPatch
        }
      }
    });
  } catch (err) {
    logError("persist.attachments.failed", {
      assistantMessageId,
      err: err?.message || String(err)
    });
  }
}

async function persistDownloadAttachments(assistantMessageId, attachments) {
  if (!Array.isArray(attachments) || !attachments.length) return;
  await mergeAssistantMessageMetadata(assistantMessageId, { attachments });
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
  const modelMessage = message.slice(0, MAX_USER_MESSAGE_CHARS);
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
  const gate = await requireSubscription(session, normalizedRole);
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
  const greeting = isGreeting(message);
  const explicitHelpIntent = !roomId ? detectHelpChatIntent(message) : null;
  const clarifyingTurns = countClarifyingTurns(rawHistory);
  const requestedThoroughness = inferRequestedThoroughness(message);
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
    explicitHelpIntent: explicitHelpIntent || undefined,
    clarifyingTurns,
    requestedThoroughness,
    convId
  });
  const helpWorkflowState = userId && !roomId
    ? await getHelpWorkflowState(convId, userId, prisma)
    : null;
  const helpWorkflowActive = isActiveHelpWorkflowState(helpWorkflowState);
  const documentHistoryActive = hasDocumentTaskContext(rawHistory);
  const initialDocumentDecision = resolveDocumentTaskDecision({
    message,
    history: rawHistory,
    role: normalizedRole,
    replyLang,
    sourceCount: ephemeralChunks.length,
    clarifyingTurns,
    requestedThoroughness
  });
  const modeSelection = !roomId
    ? resolveModeSelection({
        message,
        history: rawHistory,
        replyLang,
        helpIntent: explicitHelpIntent,
        documentTaskIntent: initialDocumentDecision.isDocumentTask,
        skipSelection:
          greeting ||
          isCrisis ||
          helpWorkflowActive ||
          documentHistoryActive
      })
    : {
        handled: false,
        resolvedMode: null,
        routedMessage: message,
        suggestedMode: "rag"
      };
  if (userId && !roomId && modeSelection?.handled) {
    const reply = String(modeSelection.reply || "").trim();
    const metadataExtra = buildModeSelectionMetadata(modeSelection.suggestedMode);
    if (persist && convId && userId) {
      await persistInit({
        convId,
        userId,
        role: normalizedRole,
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
        attachments: [],
        cards: [],
        metadataExtra,
        isCrisis: false
      });
    }
    return buildImmediateChatResponse({
      wantStream,
      reply,
      sources: [],
      attachments: [],
      cards: [],
      isCrisis: false,
      convId
    });
  }
  const effectiveMessage = String(modeSelection?.routedMessage || message).trim() || message;
  const forcedMode = modeSelection?.resolvedMode || null;
  const effectiveExplicitHelpIntent =
    forcedMode === "help_request"
      ? "create_help_request"
      : forcedMode === "help_offer"
        ? "create_help_offer"
        : forcedMode === "rag"
          ? null
          : !roomId
            ? detectHelpChatIntent(effectiveMessage)
            : null;
  const documentDecision = forcedMode === "rag"
    ? {
        isDocumentTask: false,
        historyHasDocumentTask: false,
        documentTaskStart: false,
        plan: null,
        taskConfig: null,
        taskDefaults: null
      }
    : resolveDocumentTaskDecision({
        message: effectiveMessage,
        history: rawHistory,
        role: normalizedRole,
        replyLang,
        sourceCount: ephemeralChunks.length,
        clarifyingTurns,
        requestedThoroughness,
        forceDocumentTask: forcedMode === "document"
      });
  const documentTaskIntent = documentDecision.isDocumentTask;
  const documentPlan = documentDecision.plan;
  if (documentPlan) {
    logInfo("orchestration.plan", {
      mode: documentPlan.mode,
      step: documentPlan.step,
      complexity: documentPlan.complexity,
      reasoning: documentPlan.reasoning,
      capability: documentPlan.capability
    });
  }
  if (userId && !roomId && documentTaskIntent) {
    const documentMetadataExtra = buildOrchestrationMetadata(documentPlan);
    try {
      const taskConfig = documentDecision.taskConfig;
      const taskDefaults = documentDecision.taskDefaults;
      const documentTaskStart = documentDecision.documentTaskStart;
      const documentsLimit = normalizedRole === "CLIENT"
        ? Math.min(CLIENT_AGENT_DOCUMENT_LIMIT, MAX_ARTIFACT_SOURCE_DOCUMENTS)
        : MAX_ARTIFACT_SOURCE_DOCUMENTS;
      const agentDocuments = await prisma.userDocument.findMany({
        where: {
          ownerId: userId,
          agentAllowed: true,
          kind: {
            not: "TEMPLATE"
          }
        },
        select: {
          id: true,
          title: true,
          originalName: true,
          kind: true,
          templateFor: true,
          agentAllowed: true,
          mime: true,
          storagePath: true,
          sha256: true,
          updatedAt: true
        },
        orderBy: {
          updatedAt: "desc"
        },
        take: documentsLimit
      });
      const templates = taskConfig.wantsTemplate
        ? await prisma.userDocument.findMany({
            where: {
              ownerId: userId,
              kind: "TEMPLATE",
              agentAllowed: true
            },
            select: {
              id: true,
              title: true,
              originalName: true,
              templateFor: true
            },
            orderBy: {
              updatedAt: "desc"
            },
            take: 30
          })
        : [];
      const selectedTemplate = taskConfig.wantsTemplate
        ? templates.find((template) => isTemplateCompatibleForType(template, taskConfig.artifactType)) || null
        : null;
      if (!documentTaskStart) {
        const reply = buildDocumentIntakeReply({
          replyLang,
          sourceCount: agentDocuments.length,
          role: normalizedRole,
          defaults: taskDefaults
        });
        const attachments = buildDocumentTaskAttachments({ replyLang });
        if (persist && convId && userId) {
          await persistInit({
            convId,
            userId,
            role: normalizedRole,
            sources: [],
            isCrisis: false,
            userMessage: effectiveMessage
          });
          await persistAppend({
            convId,
            userId,
            fullText: reply
          });
          const persistResult = await persistDone({
            convId,
            userId,
            status: "COMPLETED",
            finalText: reply,
            sources: [],
            attachments: [],
            isCrisis: false,
            metadataExtra: documentMetadataExtra
          });
          await persistDownloadAttachments(persistResult?.assistantMessageId, attachments);
        }
        if (!wantStream) {
          return NextResponse.json({
            ok: true,
            reply,
            answer: reply,
            sources: [],
            attachments,
            isCrisis: false,
            convId: convId || undefined
          });
        }
        return buildSseImmediateResponse({
          sources: [],
          isCrisis: false,
          reply,
          attachments
        });
      }
      const runInstruction = String(taskConfig.instruction || "").trim();
      if (runInstruction.length < 12) {
        const reply = buildDocumentMissingInstructionReply(replyLang);
        const attachments = buildDocumentTaskAttachments({ replyLang });
        if (persist && convId && userId) {
          await persistInit({
            convId,
            userId,
            role: normalizedRole,
            sources: [],
            isCrisis: false,
            userMessage: effectiveMessage
          });
          await persistAppend({
            convId,
            userId,
            fullText: reply
          });
          const persistResult = await persistDone({
            convId,
            userId,
            status: "COMPLETED",
            finalText: reply,
            sources: [],
            attachments: [],
            isCrisis: false,
            metadataExtra: documentMetadataExtra
          });
          await persistDownloadAttachments(persistResult?.assistantMessageId, attachments);
        }
        if (!wantStream) {
          return NextResponse.json({
            ok: true,
            reply,
            answer: reply,
            sources: [],
            attachments,
            isCrisis: false,
            convId: convId || undefined
          });
        }
        return buildSseImmediateResponse({
          sources: [],
          isCrisis: false,
          reply,
          attachments
        });
      }
      if (!agentDocuments.length) {
        const reply = buildDocumentMissingSourcesReply(replyLang);
        const attachments = buildDocumentTaskAttachments({ replyLang });
        if (persist && convId && userId) {
          await persistInit({
            convId,
            userId,
            role: normalizedRole,
            sources: [],
            isCrisis: false,
            userMessage: effectiveMessage
          });
          await persistAppend({
            convId,
            userId,
            fullText: reply
          });
          const persistResult = await persistDone({
            convId,
            userId,
            status: "COMPLETED",
            finalText: reply,
            sources: [],
            attachments: [],
            isCrisis: false,
            metadataExtra: documentMetadataExtra
          });
          await persistDownloadAttachments(persistResult?.assistantMessageId, attachments);
        }
        if (!wantStream) {
          return NextResponse.json({
            ok: true,
            reply,
            answer: reply,
            sources: [],
            attachments,
            isCrisis: false,
            convId: convId || undefined
          });
        }
        return buildSseImmediateResponse({
          sources: [],
          isCrisis: false,
          reply,
          attachments
        });
      }
      const generated = await generateArtifactDraftContent({
        type: taskConfig.artifactType,
        documents: agentDocuments,
        templateTitle: selectedTemplate?.title || null,
        instruction: runInstruction,
        audience: taskConfig.audience,
        tone: taskConfig.tone,
        language: taskConfig.language,
        length: taskConfig.length,
        reasoningEffort: documentPlan?.reasoning
      });
      const content = String(generated?.content || "").trim();
      if (!content) throw new Error("documents.artifacts.errors.ai_empty");
      if (generated?.debugMeta) {
        cacheRetrievalDebugMeta(userId, content, generated.debugMeta);
      }
      const artifact = await prisma.agentArtifact.create({
        data: {
          ownerId: userId,
          type: taskConfig.artifactType,
          title: null,
          status: "DRAFT",
          content,
          templateId: selectedTemplate?.id || null,
          sourceDocuments: {
            createMany: {
              data: agentDocuments.slice(0, documentsLimit).map((document) => ({
                documentId: document.id
              }))
            }
          }
        },
        select: {
          id: true
        }
      });
      const intro =
        replyLang === "ru"
          ? "Черновик готов. Ниже результат и ссылки для редактирования."
          : replyLang === "en"
            ? "Draft ready. The result is below with links for editing."
            : "Mustand valmis. Allpool on tulemus ja redigeerimise lingid.";
      const optionSummary = [
        `type=${taskConfig.artifactType}`,
        `audience=${taskConfig.audience}`,
        `tone=${taskConfig.tone}`,
        `language=${taskConfig.language}`,
        `length=${taskConfig.length}`,
        selectedTemplate?.id ? `template=${selectedTemplate.title || selectedTemplate.originalName || selectedTemplate.id}` : "template=none",
        normalizedRole === "CLIENT" ? `clientTask=${taskConfig.clientTask || "LETTER_REQUEST"}` : ""
      ]
        .filter(Boolean)
        .join(", ");
      const reply = `${intro}\n\n(${optionSummary})\n\n${content}`;
      const sources = agentDocuments.map((document, index) => ({
        id: document.id,
        title: document.title || document.originalName || `source-${index + 1}`,
        fileName: document.originalName || undefined,
        short_ref: "(selected document)"
      }));
      const attachments = buildDocumentTaskAttachments({
        replyLang,
        artifactId: artifact.id
      });
      if (persist && convId && userId) {
        await persistInit({
          convId,
          userId,
          role: normalizedRole,
          sources,
          isCrisis: false,
          userMessage: effectiveMessage
        });
        await persistAppend({
          convId,
          userId,
          fullText: reply
        });
        const persistResult = await persistDone({
          convId,
          userId,
          status: "COMPLETED",
          finalText: reply,
          sources,
          attachments: [],
          isCrisis: false,
          metadataExtra: documentMetadataExtra
        });
        await persistDownloadAttachments(persistResult?.assistantMessageId, attachments);
      }
      if (!wantStream) {
        return NextResponse.json({
          ok: true,
          reply,
          answer: reply,
          sources,
          attachments,
          isCrisis: false,
          convId: convId || undefined
        });
      }
      return buildSseImmediateResponse({
        sources,
        isCrisis: false,
        reply,
        attachments
      });
    } catch (error) {
      logError("document_task.flow_failed", {
        err: error?.message || String(error),
        userId,
        role: normalizedRole
      });
      const reply =
        replyLang === "ru"
          ? "Запуск черновика не удался. Проверьте источники и попробуйте снова."
          : replyLang === "en"
            ? "Failed to start draft generation. Check your sources and try again."
            : "Mustandi käivitamine ebaõnnestus. Kontrolli allikaid ja proovi uuesti.";
      const attachments = buildDocumentTaskAttachments({ replyLang });
      if (persist && convId && userId) {
        await persistInit({
          convId,
          userId,
          role: normalizedRole,
          sources: [],
          isCrisis: false,
          userMessage: effectiveMessage
        });
        await persistAppend({
          convId,
          userId,
          fullText: reply
        });
        const persistResult = await persistDone({
          convId,
          userId,
          status: "COMPLETED",
          finalText: reply,
          sources: [],
          attachments: [],
          isCrisis: false,
          metadataExtra: documentMetadataExtra
        });
        await persistDownloadAttachments(persistResult?.assistantMessageId, attachments);
      }
      if (!wantStream) {
        return NextResponse.json({
          ok: true,
          reply,
          answer: reply,
          sources: [],
          attachments,
          isCrisis: false,
          convId: convId || undefined
        });
      }
      return buildSseImmediateResponse({
        sources: [],
        isCrisis: false,
        reply,
        attachments
      });
    }
  }
  if (userId && !roomId) {
    const helpResult = await runHelpChatWorkflow({
      message: effectiveMessage,
      convId,
      userId,
      replyLang,
      forcedIntent: effectiveExplicitHelpIntent
    }, prisma);

    if (helpResult?.handled) {
      const reply = String(helpResult.reply || "").trim();
      const attachments = Array.isArray(helpResult.attachments) ? helpResult.attachments : [];
      const cards = Array.isArray(helpResult.cards) ? helpResult.cards : [];
      const sources = Array.isArray(helpResult.sources) ? helpResult.sources : [];
      const helpPlan = chooseOrchestrationPlan({
        intent: helpResult?.workflowState?.intent || effectiveExplicitHelpIntent || WORK_MODES.CREATE_HELP_REQUEST,
        message: effectiveMessage,
        workflowState: helpResult?.workflowState || null,
        clarifyingTurns,
        requestedThoroughness
      });
      logInfo("orchestration.plan", {
        mode: helpPlan.mode,
        step: helpPlan.step,
        complexity: helpPlan.complexity,
        reasoning: helpPlan.reasoning,
        capability: helpPlan.capability
      });
      const metadataExtra = buildOrchestrationMetadata(
        helpPlan,
        buildHelpWorkflowMetadata(helpResult.workflowState)
      );

      if (persist && convId && userId) {
        await persistInit({
          convId,
          userId,
          role: normalizedRole,
          sources,
          isCrisis: false,
          userMessage: effectiveMessage
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
          sources,
          attachments,
          cards,
          metadataExtra,
          isCrisis: false
        });
      }

      if (!wantStream) {
        return NextResponse.json({
          ok: true,
          reply,
          answer: reply,
          sources,
          attachments,
          cards,
          isCrisis: false,
          convId: convId || undefined
        });
      }

      return buildSseImmediateResponse({
        sources,
        isCrisis: false,
        reply,
        attachments,
        cards
      });
    }
  }
  if (isCrisis) {
    logInfo("crisis.detected", {
      role: normalizedRole,
      hasHistory,
      fromRag: false
    });
  }
  if (greeting && !isCrisis && !hasHistory) {
    const reply = normalizedRole === "SOCIAL_WORKER" ? L.greetingWorker : L.greetingClient;
    let attachments = [];
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
      const persistResult = await persistDone({
        convId,
        userId,
        status: "COMPLETED",
        finalText: reply,
        sources: [],
        attachments: [],
        isCrisis
      });
      if (wantsDocumentDownload) {
        attachments = buildDownloadAttachments({
          convId,
          assistantMessageId: persistResult?.assistantMessageId,
          message,
          replyLang
        });
        await persistDownloadAttachments(persistResult?.assistantMessageId, attachments);
      }
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
        attachments,
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
          controller.enqueue(enc.encode(`event: done\ndata: ${JSON.stringify({
            attachments
          })}\n\n`));
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
        query: effectiveMessage,
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
  const docQueryText = [effectiveMessage, ...extractRecentUserText(rawHistory, 2)].filter(Boolean).join("\n");
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
    sourceCount: Number(chosen.length || 0) + Number(docContextResult.usedChunks || 0),
    hybridTask: genericIntent === WORK_MODES.SERVICE_GUIDANCE && hasDocumentTaskContext(rawHistory)
  });
  logInfo("orchestration.plan", {
    mode: mainOrchestrationPlan.mode,
    step: mainOrchestrationPlan.step,
    complexity: mainOrchestrationPlan.complexity,
    reasoning: mainOrchestrationPlan.reasoning,
    capability: mainOrchestrationPlan.capability
  });
  const mainMetadataExtra = buildOrchestrationMetadata(mainOrchestrationPlan);
  if (!context || !context.trim()) {
    const out = isCrisis ? L.crisisNoCtx : L.noContext;
    let attachments = [];
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
        userMessage: effectiveMessage
      });
      await persistAppend({
        convId,
        userId,
        fullText: out
      });
      const persistResult = await persistDone({
        convId,
        userId,
        status: "COMPLETED",
        finalText: out,
        sources,
        attachments: [],
        metadataExtra: mainMetadataExtra,
        isCrisis
      });
      if (wantsDocumentDownload) {
        attachments = buildDownloadAttachments({
          convId,
          assistantMessageId: persistResult?.assistantMessageId,
          message: effectiveMessage,
          replyLang
        });
        await persistDownloadAttachments(persistResult?.assistantMessageId, attachments);
      }
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
        attachments,
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
          controller.enqueue(enc.encode(`event: done\ndata: ${JSON.stringify({
            attachments
          })}\n\n`));
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
      userMessage: effectiveMessage
    });
  }
  if (!wantStream) {
    try {
      const aiResult = await callOpenAI({
        history,
        userMessage: effectiveMessage.slice(0, MAX_USER_MESSAGE_CHARS),
        context,
        effectiveRole: normalizedRole,
        grounding,
        includeSources,
        replyLang,
        isCrisis,
        reasoningEffort: mainOrchestrationPlan.reasoning
      });
      let attachments = [];
      if (persist && convId && userId) {
        await persistAppend({
          convId,
          userId,
          fullText: aiResult.reply
        });
        const persistResult = await persistDone({
          convId,
          userId,
          status: "COMPLETED",
          finalText: aiResult.reply,
          sources,
          attachments: [],
          metadataExtra: mainMetadataExtra,
          isCrisis
        });
        if (wantsDocumentDownload) {
          attachments = buildDownloadAttachments({
            convId,
            assistantMessageId: persistResult?.assistantMessageId,
            message: effectiveMessage,
            replyLang
          });
          await persistDownloadAttachments(persistResult?.assistantMessageId, attachments);
        }
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
        attachments,
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
          userMessage: effectiveMessage.slice(0, MAX_USER_MESSAGE_CHARS),
          context,
          effectiveRole: normalizedRole,
          grounding,
          includeSources,
          replyLang,
          isCrisis,
          reasoningEffort: mainOrchestrationPlan.reasoning
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
            let attachments = [];
            if (persist && convId && userId) {
              await persistAppend({
                convId,
                userId,
                fullText: accumulated
              });
              const persistResult = await persistDone({
                convId,
                userId,
                status: "COMPLETED",
                finalText: accumulated,
                sources,
                attachments: [],
                metadataExtra: mainMetadataExtra,
                isCrisis
              });
              if (wantsDocumentDownload) {
                attachments = buildDownloadAttachments({
                  convId,
                  assistantMessageId: persistResult?.assistantMessageId,
                  message: effectiveMessage,
                  replyLang
                });
                await persistDownloadAttachments(persistResult?.assistantMessageId, attachments);
              }
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
