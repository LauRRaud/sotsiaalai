const STOPWORDS = new Set([
  "aga", "and", "are", "because", "been", "but", "can", "could", "does", "for", "from", "has", "have", "into", "its", "kui", "mis", "ning", "not", "oli", "oma", "see", "seda", "selle", "that", "the", "this", "was", "were", "with",
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

export function filterSourcesForReply(reply = "", sources = []) {
  const list = Array.isArray(sources) ? sources : [];
  if (!list.length) return [];
  if (list.length === 1) return list.map(stripSourceEvidence);

  const scored = list
    .map((source, index) => ({
      source,
      index,
      score: scoreSourceForReply(reply, source)
    }))
    .filter(item => item.score >= 3.2)
    .sort((a, b) => b.score - a.score || a.index - b.index);

  return scored.map(item => stripSourceEvidence(item.source));
}
