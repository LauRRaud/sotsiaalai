import { RAG_BASE, RAG_KEY, RAG_TOP_K } from "@/lib/chat/settings";

function normalizeIntentText(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .toLowerCase()
    .trim();
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

export function buildRagSearchQuery(message = "", history = []) {
  const current = String(message || "").trim();
  if (!current) return "";
  const recent = shouldUseRecentTextForRetrieval(current)
    ? extractRecentUserText(history, recentRetrievalContextLimit(current))
    : [];
  const parts = [current, ...recent].filter(Boolean);
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
  const hasAvailabilityIntent =
    /\b(kas\s+)?(su|sul|sinul|teil)\b/.test(normalizedCurrent) ||
    /\b(olemas|naed|näed|naitab|näitab|andmebaas|materjalides|allikates|kasuta|kasutas|kasutasid|kasutatud|viitasid|leia|leidsid|kusin|küsin|kysin|küsisin|find|have|available|database|ask|asking|used|cited)\b/.test(normalizedCurrent);
  const hasIdentificationIntent =
    /\b(mis|milline|kust|kus|what|which|where)\b/.test(normalizedCurrent) &&
    /\b(tekst|lause|katkend|paragrahv|paragraph|loige|lõige|sate|säte|allik|viide|dokument|source|document|passage|quote|citation)\b/.test(normalizedCurrent);
  const shortParagraphFollowup =
    /^[§\s\d,;a-zA-Z-]+$/.test(current) &&
    /\b(paragrahv|paragraph|§|seadus|shs|andmebaas|materjal)\b/.test(normalizedCombined);
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
  const asksUsed =
    /\b(kasuta|kasutas|kasutasid|kasutatud|viitasid|used|cited)\b/.test(normalized) ||
    /\b(selle|eelmis|viimas|vastuse)\b/.test(normalized);
  return asksSources && asksUsed;
}

export function buildSourceLookupSearchQuery(message = "", history = []) {
  const current = String(message || "").trim();
  const recent = extractRecentUserText(history, 8);
  const combined = [current, ...recent].filter(Boolean).join("\n");
  const subject = inferSourceLookupSubject(combined);
  const paragraphRefs = extractParagraphReferences(combined);
  const parts = [];
  if (subject) parts.push(subject);
  if (current) parts.push(current);
  for (const ref of paragraphRefs) {
    parts.push(`${subject || ""} § ${ref}`.trim());
    parts.push(`${subject || ""} paragrahv ${ref}`.trim());
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
  return Array.isArray(data?.results) ? data.results : [];
}

export function dedupeRagMatches(matches = []) {
  const out = [];
  const seen = new Set();
  for (const match of Array.isArray(matches) ? matches : []) {
    const md = match?.metadata || {};
    const key = String(match?.id || md.chunk_id || md.chunkId || md.doc_id || md.docId || match?.text || "").slice(0, 220);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(match);
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
