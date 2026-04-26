import { sourceMeetsEvidenceRequirement } from "../rag/riskPolicy.js";

export const ATTRIBUTION_DECISION_REASONS = Object.freeze({
  INSUFFICIENT_EVIDENCE_STRENGTH: "insufficient_evidence_strength",
  QUERY_ANCHOR_MISMATCH: "query_anchor_mismatch",
  REPLY_OVERLAP_VALIDATED: "reply_overlap_validated",
  SINGLE_CANDIDATE_KEPT: "single_candidate_kept",
  WEAK_REPLY_OVERLAP: "weak_reply_overlap"
});

export const ALLOWED_ATTRIBUTION_DECISION_REASONS = new Set(Object.values(ATTRIBUTION_DECISION_REASONS));

const STOPWORDS = new Set([
  "aga", "and", "are", "because", "been", "but", "can", "could", "does", "for", "from", "has", "have", "into", "its", "kui", "kuidas", "mida", "milline", "mis", "ning", "not", "oli", "oma", "see", "seda", "selle", "that", "the", "this", "was", "were", "what", "when", "where", "which", "with",
  "что", "как", "для", "или", "это", "его", "она", "они", "при", "чем", "чего"
]);

function normalizeText(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value = "") {
  const normalized = normalizeText(value);
  if (!normalized) return [];
  return normalized
    .split(" ")
    .map(token => token.trim())
    .filter(token => token.length >= 3)
    .filter(token => !STOPWORDS.has(token));
}

function uniqueTokens(value = "") {
  return Array.from(new Set(tokenize(value)));
}

function bigrams(tokens = []) {
  const out = new Set();
  for (let i = 0; i < tokens.length - 1; i += 1) {
    out.add(`${tokens[i]} ${tokens[i + 1]}`);
  }
  return out;
}

function sourceText(source = {}) {
  return [
    source.title,
    source.short_ref,
    source.section,
    source.paragraphTitle,
    source.journalTitle,
    source.evidenceText
  ].filter(Boolean).join("\n");
}

function isNamedThingQuestion(query = "") {
  const normalized = normalizeText(query);
  if (!normalized) return false;
  if (/^(mis|mida|milline|what|which)\s+(on|oli|was|is)\b/.test(normalized)) return true;
  if (/^(что|какой|какая|какое)\s+/.test(normalized)) return true;
  const tokens = uniqueTokens(query);
  return tokens.length >= 1 && tokens.length <= 4 && normalized.length <= 90;
}

function sourceMatchesQueryAnchor(query = "", source = {}) {
  if (!isNamedThingQuestion(query)) return true;
  const queryTokens = uniqueTokens(query)
    .filter(token => !/^(teenus|teenused|toetus|toetused|service|services|benefit|benefits)$/.test(token));
  if (!queryTokens.length) return true;

  const sourceTokens = new Set(uniqueTokens(sourceText(source)));
  const matched = queryTokens.filter(token => sourceTokens.has(token));
  const required = queryTokens.length >= 2 ? queryTokens.length : 1;
  return matched.length >= required;
}

function scoreSourceForReply(reply = "", source = {}) {
  const replyNormalized = normalizeText(reply);
  const sourceNormalized = normalizeText(sourceText(source));
  if (!replyNormalized || !sourceNormalized) return 0;

  const titleNormalized = normalizeText(source.title || "");
  let score = titleNormalized && replyNormalized.includes(titleNormalized) ? 6 : 0;

  const replyTokens = uniqueTokens(replyNormalized);
  const sourceTokens = uniqueTokens(sourceNormalized);
  if (!replyTokens.length || !sourceTokens.length) return score;

  const replySet = new Set(replyTokens);
  const common = sourceTokens.filter(token => replySet.has(token));
  const uncommonCommon = common.filter(token => token.length >= 5 || /\d/.test(token));
  score += common.length * 0.8 + uncommonCommon.length * 0.7;

  const replyBigrams = bigrams(replyTokens);
  const sourceBigrams = bigrams(sourceTokens);
  for (const phrase of sourceBigrams) {
    if (replyBigrams.has(phrase)) score += 1.8;
  }

  const year = String(source.year || "").match(/\b(19|20)\d{2}\b/)?.[0] || "";
  if (year && new RegExp(`\\b${year}\\b`).test(replyNormalized)) score += 1;

  const coverage = common.length / Math.max(1, Math.min(replyTokens.length, sourceTokens.length));
  if (common.length >= 3 && coverage >= 0.08) score += 1.2;

  return score;
}

export function stripSourceEvidence(source = {}) {
  if (!source || typeof source !== "object") return source;
  const { evidenceText: _evidenceText, ...rest } = source;
  return rest;
}

export function getSourceAttributionId(source = {}, index = 0) {
  const raw =
    source?.source_id ||
    source?.sourceId ||
    source?.id ||
    source?.key ||
    source?.url ||
    source?.short_ref ||
    source?.title ||
    `source_${index}`;
  return String(raw || `source_${index}`).trim() || `source_${index}`;
}

function buildDecision(source, index, decision, reason, score = 0, evidence = null) {
  return {
    source_id: getSourceAttributionId(source, index),
    source_index: index,
    decision,
    reason,
    score: Number.isFinite(score) ? Number(score.toFixed(3)) : 0,
    ...(evidence?.strength ? { evidence_strength: evidence.strength } : {}),
    ...(evidence?.requiredEvidence ? { required_evidence: evidence.requiredEvidence } : {}),
    ...(evidence?.reason ? { evidence_reason: evidence.reason } : {})
  };
}

function buildAttributionResult(list, decisions, displayedItems) {
  const displayedSources = displayedItems.map(item => stripSourceEvidence(item.source));
  const displayedSourceIds = displayedItems.map(item => getSourceAttributionId(item.source, item.index));
  const filteredOutSourceIds = decisions
    .filter(item => item.decision === "hide")
    .map(item => item.source_id);
  const filterReasons = decisions.reduce((acc, item) => {
    if (item.decision === "hide") acc[item.source_id] = item.reason;
    return acc;
  }, {});
  return {
    displayedSources,
    displayed_source_ids: displayedSourceIds,
    displayedSourceIds,
    attribution_decisions: decisions,
    attributionDecisions: decisions,
    filtered_out_source_ids: filteredOutSourceIds,
    filteredOutSourceIds,
    filter_reasons: filterReasons,
    filterReasons,
    retrieved_source_ids: list.map((source, index) => getSourceAttributionId(source, index)),
    selected_context_source_ids: list.map((source, index) => getSourceAttributionId(source, index)),
    answer_source_ids: displayedSourceIds
  };
}

export function buildSourceAttribution(reply = "", sources = [], options = {}) {
  const list = Array.isArray(sources) ? sources : [];
  if (!list.length) return buildAttributionResult([], [], []);
  if (list.length === 1) {
    const evidence = sourceMeetsEvidenceRequirement(list[0], options?.riskPolicy);
    if (!evidence.ok) {
      const decisions = [buildDecision(list[0], 0, "hide", ATTRIBUTION_DECISION_REASONS.INSUFFICIENT_EVIDENCE_STRENGTH, 0, evidence)];
      return buildAttributionResult(list, decisions, []);
    }
    const decisions = [buildDecision(list[0], 0, "display", ATTRIBUTION_DECISION_REASONS.SINGLE_CANDIDATE_KEPT, 0, evidence)];
    return buildAttributionResult(list, decisions, [{ source: list[0], index: 0, score: 0 }]);
  }

  const query = String(options?.query || "");
  const riskPolicy = options?.riskPolicy || null;
  const threshold = Number.isFinite(Number(options?.scoreThreshold)) ? Number(options.scoreThreshold) : 3.2;
  const displayItems = [];
  const decisions = list.map((source, index) => {
    if (!sourceMatchesQueryAnchor(query, source)) {
      return buildDecision(source, index, "hide", ATTRIBUTION_DECISION_REASONS.QUERY_ANCHOR_MISMATCH, 0);
    }
    const score = scoreSourceForReply(reply, source);
    if (score < threshold) {
      return buildDecision(source, index, "hide", ATTRIBUTION_DECISION_REASONS.WEAK_REPLY_OVERLAP, score);
    }
    const evidence = sourceMeetsEvidenceRequirement(source, riskPolicy);
    if (!evidence.ok) {
      return buildDecision(source, index, "hide", ATTRIBUTION_DECISION_REASONS.INSUFFICIENT_EVIDENCE_STRENGTH, score, evidence);
    }
    displayItems.push({ source, index, score });
    return buildDecision(source, index, "display", ATTRIBUTION_DECISION_REASONS.REPLY_OVERLAP_VALIDATED, score, evidence);
  });

  displayItems.sort((a, b) => b.score - a.score || a.index - b.index);
  return buildAttributionResult(list, decisions, displayItems);
}

export function filterSourcesForReply(reply = "", sources = [], options = {}) {
  return buildSourceAttribution(reply, sources, options).displayedSources;
}
