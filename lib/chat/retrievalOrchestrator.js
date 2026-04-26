import { RAG_BASE, RAG_KEY, RAG_TOP_K } from "@/lib/chat/settings";

const DEFAULT_RETRIEVER = "dense";

function normalizeIntentText(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .toLowerCase()
    .trim();
}

function normalizeRetrieverName(value = "") {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return normalized || "";
}

function normalizeRetrieverList(value, fallback = []) {
  const raw = Array.isArray(value) ? value : value ? [value] : [];
  const out = [];
  const seen = new Set();
  for (const item of [...raw, ...fallback]) {
    const normalized = normalizeRetrieverName(item);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    out.push(normalized);
  }
  return out;
}

function getMatchRetrievers(match = {}) {
  return normalizeRetrieverList(
    match?.retrievers_used ||
      match?.retrieversUsed ||
      match?.retrieval_channels ||
      match?.retrievalChannels ||
      match?.retrieval_channel ||
      match?.retrievalChannel ||
      match?.retriever,
    []
  );
}

function annotateRagResults(results = [], retrieversUsed = []) {
  const fallbackRetrievers = normalizeRetrieverList(retrieversUsed, [DEFAULT_RETRIEVER]);
  return (Array.isArray(results) ? results : []).map((match, index) => {
    const source = match && typeof match === "object" ? match : {};
    const matchRetrievers = normalizeRetrieverList(getMatchRetrievers(source), fallbackRetrievers);
    const primaryRetriever = matchRetrievers[0] || DEFAULT_RETRIEVER;
    return {
      ...source,
      retriever: source.retriever || primaryRetriever,
      retrieval_channel: source.retrieval_channel || source.retrievalChannel || primaryRetriever,
      retrievalChannel: source.retrievalChannel || source.retrieval_channel || primaryRetriever,
      retrieval_channels: matchRetrievers,
      retrievalChannels: matchRetrievers,
      retrieval_rank: Number.isFinite(Number(source.retrieval_rank))
        ? Number(source.retrieval_rank)
        : index + 1
    };
  });
}

export function inferRetrieversUsed(matches = [], fallback = []) {
  const out = [];
  const seen = new Set();
  for (const retriever of normalizeRetrieverList(fallback, [])) {
    if (seen.has(retriever)) continue;
    seen.add(retriever);
    out.push(retriever);
  }
  for (const match of Array.isArray(matches) ? matches : []) {
    for (const retriever of getMatchRetrievers(match)) {
      if (seen.has(retriever)) continue;
      seen.add(retriever);
      out.push(retriever);
    }
  }
  return out;
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

function shouldUseRecentTextForRetrieval(message = "") {
  const normalized = normalizeIntentText(message);
  if (!normalized) return false;
  if (normalized.length <= 90) return true;
  return /\b(see|seda|sellest|selle|seal|siin|jah|jep|okei|ok|kontakt|kontaktid|telefon|e-post|email|taotlus|taotlema|pean|kuidas|kuhu|kellele)\b/.test(normalized);
}

function recentRetrievalContextLimit(message = "") {
  const normalized = normalizeIntentText(message);
  if (!normalized) return 2;
  if (normalized.length <= 40) return 6;
  if (/\b(see|seda|sellest|selle|seal|siin|jah|jep|okei|ok|kontakt|kontaktid|telefon|e-post|email|taotlus|taotlema|kuhu|kellele|mis valda|mis linna)\b/.test(normalized)) {
    return 5;
  }
  return 2;
}

function readAssistantSources(message = {}) {
  if (Array.isArray(message?.displayed_sources)) return message.displayed_sources;
  if (Array.isArray(message?.displayedSources)) return message.displayedSources;
  if (Array.isArray(message?.sources)) return message.sources;
  return [];
}

function sourceAnchorText(source = {}) {
  const authors = Array.isArray(source?.authors)
    ? source.authors
    : typeof source?.authors === "string"
      ? source.authors.split(/[;,]/).map(item => item.trim()).filter(Boolean)
      : [];
  const parts = [
    source?.title,
    source?.label,
    authors.slice(0, 2).join(" "),
    source?.journalTitle || source?.journal_title,
    source?.issueLabel || source?.issueId || source?.issue_id,
    source?.year
  ].map(value => String(value || "").trim()).filter(Boolean);
  return Array.from(new Set(parts)).join(" ");
}

function extractQuotedTitles(text = "") {
  const out = [];
  const source = String(text || "");
  for (const match of source.matchAll(/[„"“]([^„"“]{8,180})[”"“]/g)) {
    const title = String(match?.[1] || "").trim();
    if (title) out.push(title);
  }
  return out;
}

export function extractRecentAssistantSourceAnchors(history = [], maxItems = 3) {
  if (!Array.isArray(history) || !history.length) return [];
  const anchors = [];
  const seen = new Set();
  for (let i = history.length - 1; i >= 0 && anchors.length < maxItems; i -= 1) {
    const msg = history[i];
    const role = String(msg?.role || "").toLowerCase();
    if (role !== "ai" && role !== "assistant") continue;
    for (const src of readAssistantSources(msg)) {
      const anchor = sourceAnchorText(src);
      const key = normalizeIntentText(anchor);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      anchors.push(anchor.slice(0, 260));
      if (anchors.length >= maxItems) break;
    }
    if (anchors.length < maxItems) {
      for (const title of extractQuotedTitles(msg?.text || msg?.content || "")) {
        const key = normalizeIntentText(title);
        if (!key || seen.has(key)) continue;
        seen.add(key);
        anchors.push(title.slice(0, 220));
        if (anchors.length >= maxItems) break;
      }
    }
  }
  return anchors;
}

export function hasRecentAssistantSources(history = []) {
  return extractRecentAssistantSourceAnchors(history, 1).length > 0;
}

function shouldUseRecentSourceAnchorsForRetrieval(message = "") {
  const normalized = normalizeIntentText(message);
  if (!normalized) return false;
  if (normalized.length <= 90) return true;
  return /\b(seal|sealt|selles|sellel|artiklis|artikli|allikas|tekstis|mainitakse|mainitud|naide|eesti|soome|ott|tootukassa|töötukassa)\b/.test(normalized);
}

function isShortSourceLookupFollowup(message = "") {
  const normalized = normalizeIntentText(message);
  if (!normalized) return false;
  if (normalized.length <= 60) {
    return /\b(see|seda|selle|sellest|seal|siin|sealt|sinna|kontakt|kontaktid|telefon|e-post|email|taotlus)\b/.test(normalized);
  }
  return false;
}

export function buildRagSearchQuery(message = "", history = []) {
  const current = String(message || "").trim();
  if (!current) return "";
  const recent = shouldUseRecentTextForRetrieval(current)
    ? extractRecentUserText(history, recentRetrievalContextLimit(current))
    : [];
  const sourceAnchors = shouldUseRecentSourceAnchorsForRetrieval(current)
    ? extractRecentAssistantSourceAnchors(history, 3)
    : [];
  const parts = [current, ...sourceAnchors, ...recent].filter(Boolean);
  return Array.from(new Set(parts)).join("\n");
}

export function extractParagraphReferences(text = "") {
  const source = String(text || "");
  const refs = new Set();
  const explicitPattern = /(?:§+\s*|paragrahv(?:i|is|ist|ile|il|iga|iks)?\s+|paragraph\s+)(\d+[a-z]?(?:\s*[-–]\s*\d+[a-z]?)?)/giu;
  for (const match of source.matchAll(explicitPattern)) {
    const ref = String(match?.[1] || "").replace(/\s+/g, "").replace(/[–]/g, "-").trim();
    if (ref) refs.add(ref);
  }

  const normalized = normalizeIntentText(source);
  if (/\b(paragrahv|paragraph|loige|lõige|sate|säte|§)\b/.test(normalized) || source.includes("§")) {
    const listPattern = /(?:^|[\s,;])(\d{1,3}[a-z]?)(?=\s*(?:,|;|\bja\b|\band\b|\bning\b|$))/giu;
    for (const match of source.matchAll(listPattern)) {
      const ref = String(match?.[1] || "").trim();
      const matchIndex = Number(match?.index || 0);
      const prefixWindow = normalizeIntentText(source.slice(Math.max(0, matchIndex - 20), matchIndex));
      if (/\b(loige|lĆµige|lg|punkt|pt|alampunkt|sate|sĆ¤te)\s*$/.test(prefixWindow)) continue;
      if (ref) refs.add(ref);
    }
  }
  return Array.from(refs).slice(0, 8);
}

export function inferSourceLookupSubject(text = "") {
  const normalized = normalizeIntentText(text);
  if (/\bsotsiaalhoolekande sead/.test(normalized) || /\bshs\b/.test(normalized)) {
    return "Sotsiaalhoolekande seadus";
  }
  if (/\bjogeva\b/.test(normalized) && /\b(riigi teataja|riigiteataja|maar|määr|kord|sotsiaalhoolekandelise abi)\b/.test(normalized)) {
    return "Sotsiaalhoolekandelise abi andmise kord Jõgeva vallas";
  }
  if (/\bjogeva\b/.test(normalized)) {
    return "Jõgeva vald sotsiaalteenused toetused";
  }
  if (/\briigi teataja|riigiteataja\b/.test(normalized)) {
    return "Riigi Teataja";
  }
  return "";
}

export function detectSourceAvailabilityRequest(history = [], message = "") {
  const current = String(message || "").trim();
  if (!current) return false;
  const recent = extractRecentUserText(history, 6);
  const combined = [current, ...recent].join("\n");
  const normalizedCurrent = normalizeIntentText(current);
  const normalizedCombined = normalizeIntentText(combined);
  const hasSourceTerm =
    /(?:§|paragrahv|paragraph|\bseadus|sotsiaalhoolekande|\bshs\b|riigi teataja|riigiteataja|allik|materjal|andmebaas|dokument|source|document|legal act)/.test(normalizedCombined) ||
    current.includes("§");
  const genericSourcePlanningIntent =
    /\b(milliseid|mis)\s+(allikaid|viiteid|sources|citations)\s+(kasutada|use)\b/.test(normalizedCurrent) ||
    /\b(allikaid|viiteid|sources|citations)\s+(dokumendi|mustandi|kirja|taotluse|avaldus|draft|document|letter|application)\b/.test(normalizedCurrent);
  const hasAvailabilityIntent =
    /\b(kas\s+)?(su|sul|sinul|teil)\b/.test(normalizedCurrent) ||
    /\b(olemas|naed|näed|naitab|näitab|andmebaas|materjalides|allikates|leia|leidsid|kusin|küsin|kysin|küsisin|find|have|available|database|ask|asking)\b/.test(normalizedCurrent);
  const hasIdentificationIntent =
    /\b(mis|milline|kust|kus|what|which|where)\b/.test(normalizedCurrent) &&
    /\b(tekst|lause|katkend|paragrahv|paragraph|loige|lõige|sate|säte|allik|viide|dokument|source|document|passage|quote|citation)\b/.test(normalizedCurrent);
  const shortParagraphFollowup =
    /^[§\s\d,;a-zA-Z-]+$/.test(current) &&
    /\b(paragrahv|paragraph|§|seadus|shs|andmebaas|materjal)\b/.test(normalizedCombined);
  if (genericSourcePlanningIntent) return false;
  return Boolean(hasSourceTerm && (hasAvailabilityIntent || hasIdentificationIntent || shortParagraphFollowup));
}

function historyHasAssistantAnswer(history = []) {
  if (!Array.isArray(history)) return false;
  return history.some((item) => {
    const role = String(item?.role || "").toLowerCase();
    if (role !== "ai" && role !== "assistant") return false;
    return typeof item?.text === "string" && item.text.trim().length > 0;
  });
}

export function detectPreviousSourceUseRequest(history = [], message = "") {
  const normalized = normalizeIntentText(message);
  if (!normalized || !historyHasAssistantAnswer(history)) return false;
  const asksSources = /\b(allik|viide|source|cite|citation)\b/.test(normalized);
  if (!asksSources) return false;

  const explicitPreviousAnswerReference =
    /\b(eelmise|eelmises|viimase|viimases|selle|selles)\s+(vastuse|vastuses|vastusena|selgituse|selgituses)\b/.test(normalized) ||
    /\b(sinu|teie|su)\s+(eelmise|viimase|selle)\s+(vastuse|selgituse)\b/.test(normalized);
  const explicitAssistantPastUse =
    /\b(sa|sina|te|teie|su)\b.{0,40}\b(kasutasid|viitasid|used|cited)\b/.test(normalized) ||
    /\b(milliseid|mis)\s+(allikaid|viiteid|sources|citations)\s+\b(kasutasid|viitasid|used|cited)\b/.test(normalized);
  const freshLookupTarget =
    /(?:§|paragrahv|paragraph|\bseadus|sotsiaalhoolekande|\bshs\b|riigi teataja|riigiteataja|oigusakt|legal act)\b/.test(normalized) ||
    /\b(mis|milline|kust|kus|what|which|where)\b/.test(normalized);

  if (explicitPreviousAnswerReference || explicitAssistantPastUse) {
    return true;
  }

  if (freshLookupTarget) {
    return false;
  }

  return /\b(vastus|vastuses|eelmis|viimas)\b/.test(normalized) &&
    /\b(kasutas|viitas|used|cited)\b/.test(normalized);
}

export function buildSourceLookupSearchQuery(message = "", history = []) {
  const current = String(message || "").trim();
  const recent = isShortSourceLookupFollowup(current)
    ? extractRecentUserText(history, 4)
    : [];
  const combined = [current, ...recent].filter(Boolean).join("\n");
  const subject = inferSourceLookupSubject(combined);
  const paragraphRefs = extractParagraphReferences(combined);
  const parts = [];
  if (subject) parts.push(subject);
  if (current) parts.push(current);
  for (const ref of paragraphRefs.slice(0, 4)) {
    parts.push(`${subject || ""} § ${ref}`.trim());
  }
  parts.push(...recent);
  return Array.from(new Set(parts.map((part) => part.trim()).filter(Boolean))).join("\n");
}

async function searchRagDirect({
  query,
  topK = RAG_TOP_K,
  filters,
  observabilityRoute = "api/chat",
  observabilityStage = "rag_search",
  userId = null,
  role = null,
  conversationId = null
}) {
  const body = {
    query,
    top_k: topK,
    retrievers: ["dense", "title_match", "exact_phrase"],
    where: filters || undefined
  };
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 12000);
  const res = await fetch(`${RAG_BASE}/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(observabilityRoute ? {
        "X-Observability-Route": observabilityRoute
      } : {}),
      ...(observabilityStage ? {
        "X-Observability-Stage": observabilityStage
      } : {}),
      ...(userId ? {
        "X-Observability-User-Id": String(userId)
      } : {}),
      ...(role ? {
        "X-Observability-Role": String(role)
      } : {}),
      ...(conversationId ? {
        "X-Observability-Conversation-Id": String(conversationId)
      } : {}),
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
  const retrieversUsed = normalizeRetrieverList(data?.retrievers_used || data?.retrieversUsed, [DEFAULT_RETRIEVER]);
  return annotateRagResults(Array.isArray(data?.results) ? data.results : [], retrieversUsed);
}

export function dedupeRagMatches(matches = []) {
  const out = [];
  const seen = new Map();
  for (const match of Array.isArray(matches) ? matches : []) {
    const md = match?.metadata || {};
    const key = String(match?.id || md.chunk_id || md.chunkId || md.doc_id || md.docId || match?.text || "").slice(0, 220);
    if (!key) continue;
    const annotated = annotateRagResults([match], getMatchRetrievers(match))[0];
    if (seen.has(key)) {
      const existing = out[seen.get(key)];
      const mergedRetrievers = inferRetrieversUsed([existing, annotated]);
      existing.retrieval_channels = mergedRetrievers;
      existing.retrievalChannels = mergedRetrievers;
      existing.retriever = existing.retriever || mergedRetrievers[0] || DEFAULT_RETRIEVER;
      existing.retrieval_channel = existing.retrieval_channel || existing.retriever;
      existing.retrievalChannel = existing.retrievalChannel || existing.retriever;
      continue;
    }
    seen.set(key, out.length);
    out.push(annotated);
  }
  return out;
}

export async function searchRagQueries({
  queries,
  topK = RAG_TOP_K,
  filters,
  observabilityRoute = "api/chat",
  observabilityStage = "rag_search",
  userId = null,
  role = null,
  conversationId = null
}) {
  const normalizedQueries = [];
  const seen = new Set();
  for (const raw of (Array.isArray(queries) ? queries : [queries])) {
    if (!raw) continue;
    const queryText = typeof raw === "string" ? raw : raw?.query;
    const normalizedQuery = String(queryText || "").trim();
    if (!normalizedQuery) continue;
    const extraFilters = raw && typeof raw === "object" && !Array.isArray(raw) ? raw.filters || null : null;
    const dedupeKey = JSON.stringify({
      query: normalizedQuery,
      filters: extraFilters || null
    });
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    normalizedQueries.push({
      query: normalizedQuery,
      filters: extraFilters
    });
  }
  const uniqueQueries = normalizedQueries;
  if (!uniqueQueries.length) return [];
  if (uniqueQueries.length === 1) {
    return searchRagDirect({
      query: uniqueQueries[0].query,
      topK,
      filters: uniqueQueries[0].filters ? {
        ...(filters || {}),
        ...uniqueQueries[0].filters
      } : filters,
      observabilityRoute,
      observabilityStage,
      userId,
      role,
      conversationId
    });
  }

  const perQueryTopK = Math.max(4, Math.min(topK, Math.ceil(topK / uniqueQueries.length) + 2));
  const settled = await Promise.allSettled(uniqueQueries.map((entry, index) =>
    searchRagDirect({
      query: entry.query,
      topK: perQueryTopK,
      filters: entry.filters ? {
        ...(filters || {}),
        ...entry.filters
      } : filters,
      observabilityRoute,
      observabilityStage: `${observabilityStage}_q${index + 1}`,
      userId,
      role,
      conversationId
    })
  ));

  const merged = [];
  let firstError = null;
  for (const item of settled) {
    if (item.status === "fulfilled") {
      merged.push(...(Array.isArray(item.value) ? item.value : []));
    } else if (!firstError) {
      firstError = item.reason;
    }
  }
  if (!merged.length && firstError) throw firstError;
  return dedupeRagMatches(merged);
}

export function extractMatchGroupYear(entry) {
  const raw = entry?.year;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string") {
    const matched = raw.match(/\b(19|20)\d{2}\b/);
    if (matched) return Number(matched[0]);
  }
  const fallbackValues = [entry?.issueLabel, entry?.issueId, entry?.title];
  for (const value of fallbackValues) {
    if (typeof value !== "string") continue;
    const matched = value.match(/\b(19|20)\d{2}\b/);
    if (matched) return Number(matched[0]);
  }
  return null;
}
