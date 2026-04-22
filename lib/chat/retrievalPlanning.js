function normalizePlanningText(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

const TOPIC_STOPWORDS = new Set([
  "aasta", "aastad", "aastate", "aastaks", "aastal", "aastani", "aastast", "aastatel", "ajatelg",
  "alates", "alla", "asemel", "ega", "ehk", "ei", "et", "ga", "iga", "ikka",
  "ja", "kas", "kogu", "kohta", "kui", "kuidas", "kus", "mida", "miks", "millal",
  "milline", "mis", "mitte", "ning", "nagu", "ning", "on", "oli", "olid", "oleks",
  "palun", "peamised", "peamine", "rohkem", "sama", "see", "selle", "selles", "siis",
  "suurim", "suurimad", "suuna", "suunad", "suunas", "table", "tabel", "tee",
  "to", "timeline", "too", "tule", "uldine", "uldist", "valja", "voi", "või",
  "which", "what", "when", "where", "year", "years"
]);

const GENERIC_TOPIC_WORDS = new Set([
  "abi", "areng", "arendus", "eesti", "elu", "inimene", "inimesed", "korraldus", "muutus",
  "muutused", "muutumine", "pohine", "sotsiaal", "sotsiaalvaldkond", "teema", "teemad",
  "teenus", "teenused", "toetus", "toetused", "trend", "trendid", "valdkond", "valdkonna"
]);

function recentUserTexts(history = [], maxItems = 8) {
  const out = [];
  if (!Array.isArray(history)) return out;
  for (let i = history.length - 1; i >= 0 && out.length < maxItems; i -= 1) {
    const entry = history[i];
    const role = String(entry?.role || "").toLowerCase();
    if (!(role === "user" || role === "client")) continue;
    const text = String(entry?.text || entry?.content || "").trim();
    if (!text) continue;
    out.push(text);
  }
  return out;
}

function isShortFollowup(text = "") {
  const normalized = normalizePlanningText(text).replace(/[.!?\s]+$/g, "");
  if (!normalized) return true;
  return /^(jah|jaa|jep|ok|okei|selge|sobib|hea|vaga hea|jah palun|tee tabel|tabel|uldist|uldine)$/.test(normalized);
}

function hasTemporalBreakdownCue(normalizedText = "") {
  if (!normalizedText) return false;
  return /\b(iga aasta|iga aasta kohta|aasta kohta|aastate kaupa|ajatelg|timeline|kronoloog|tabel)\b/.test(normalizedText);
}

function expandYearRange(start, end, maxSpan = 10) {
  const from = Number(start);
  const to = Number(end);
  if (!Number.isInteger(from) || !Number.isInteger(to)) return [];
  const min = Math.min(from, to);
  const max = Math.max(from, to);
  if (min < 1900 || max > 2100 || max - min > maxSpan) return [];
  const years = [];
  for (let year = min; year <= max; year += 1) {
    years.push(year);
  }
  return years;
}

function extractTemporalBreakdownYears(text = "") {
  const source = String(text || "");
  const rangePattern = /\b(\d{4})\s*(?:-|–|—|kuni|to)\s*(\d{4})\b/giu;
  for (const match of source.matchAll(rangePattern)) {
    const from = Number(match[1]);
    const to = Number(match[2]);
    const expanded = expandYearRange(from, to);
    if (expanded.length >= 2) return expanded;
  }

  const years = Array.from(new Set(
    (source.match(/\b(19|20)\d{2}\b/g) || [])
      .map(value => Number(value))
      .filter(year => Number.isInteger(year) && year >= 1900 && year <= 2100)
  )).sort((a, b) => a - b);

  if (years.length >= 2) {
    const expanded = expandYearRange(years[0], years[years.length - 1], 8);
    if (expanded.length >= 2 && expanded.length >= years.length) return expanded;
  }

  return years.slice(0, 8);
}

function stripTemporalNoise(text = "") {
  return String(text || "")
    .replace(/\b\d{4}\s*(?:-|–|—|kuni|to)\s*\d{4}\b/giu, " ")
    .replace(/\b(19|20)\d{2}\b/g, " ")
    .replace(/\b(iga aasta(?: kohta)?|aastate kaupa|ajatelg|timeline|kronoloogiliselt|kronoloogilis|tee tabel|tabelina|tabel)\b/giu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function pickFocusText(message = "", history = []) {
  const candidates = [String(message || "").trim(), ...recentUserTexts(history, 8)]
    .filter(Boolean)
    .filter(text => !isShortFollowup(text));

  const cleaned = candidates
    .map(text => stripTemporalNoise(text))
    .filter(text => text.length >= 18);

  if (cleaned.length) {
    return cleaned.sort((a, b) => b.length - a.length)[0];
  }

  return stripTemporalNoise(String(message || "").trim());
}

export function extractTopicHints(text = "", maxHints = 6) {
  const normalized = normalizePlanningText(stripTemporalNoise(text));
  if (!normalized) return [];

  const words = normalized
    .split(/[^a-z0-9]+/i)
    .map(word => word.trim())
    .filter(Boolean)
    .filter(word => !TOPIC_STOPWORDS.has(word))
    .filter(word => !/^\d{4}$/.test(word))
    .filter(word => word === "kov" || word.length >= 4)
    .filter(word => !GENERIC_TOPIC_WORDS.has(word));

  const unique = [];
  const seen = new Set();
  for (const word of words) {
    if (seen.has(word)) continue;
    seen.add(word);
    unique.push(word);
    if (unique.length >= maxHints) break;
  }
  return unique;
}

export function buildTemporalRetrievalPlan({ message = "", history = [], baseQuery = "" } = {}) {
  const current = String(message || "").trim();
  const recent = recentUserTexts(history, 8);
  const combined = [current, ...recent].filter(Boolean).join("\n");
  const normalized = normalizePlanningText(combined);
  const years = hasTemporalBreakdownCue(normalized)
    ? extractTemporalBreakdownYears(combined)
    : [];

  const enabled = years.length >= 2 && years.length <= 8;
  if (!enabled) {
    return {
      enabled: false,
      years: [],
      focusText: "",
      queries: baseQuery ? [baseQuery] : []
    };
  }

  const focusText = pickFocusText(current, history) || stripTemporalNoise(baseQuery);
  const queries = Array.from(new Set([
    baseQuery,
    ...years.map(year => [focusText, String(year)].filter(Boolean).join("\n").trim())
  ].filter(Boolean)));

  return {
    enabled: true,
    years,
    focusText,
    queries
  };
}

export function buildTemporalBreakdownInstruction(replyLang = "et", years = []) {
  const yearLabel = Array.isArray(years) && years.length ? years.join(", ") : "";

  if (replyLang === "en") {
    return [
      "TEMPORAL_BREAKDOWN_MODE:",
      "The user wants a year-by-year or timeline answer.",
      "Make claims for a specific year only when RAG_CONTEXT shows evidence for that same year.",
      "Do not fill missing years from general trends or neighboring years.",
      "If evidence is missing for a year, say that directly for that year.",
      "If the user asks for a table, prefer a table or a clearly year-structured answer.",
      yearLabel ? `Target years: ${yearLabel}.` : null
    ].filter(Boolean).join("\n");
  }

  if (replyLang === "ru") {
    return [
      "TEMPORAL_BREAKDOWN_MODE:",
      "Polzovatel prosit otvet po godam ili v vide hronologii.",
      "Utverzhdenie pro konkretnyi god davai tolko togda, kogda v RAG_CONTEXT est dokazatelstvo imenno za etot god.",
      "Ne zapolnyai propushchennye gody obshchimi trendami ili dannymi iz sosednikh let.",
      "Esli po kakomu-to godu ne hvataet materiala, skazhi eto pryamo u etogo goda.",
      "Esli polzovatel prosit tablicu, predpochti tablicu ili yavno strukturirovannyi spisok po godam.",
      yearLabel ? `Cevye gody: ${yearLabel}.` : null
    ].filter(Boolean).join("\n");
  }

  return [
    "TEMPORAL_BREAKDOWN_MODE:",
    "Kasutaja soovib aastate kaupa voi ajateljena vastust.",
    "Tee vaide konkreetse aasta kohta ainult siis, kui RAG_CONTEXT-is on sama aasta kohta nahtav toendus.",
    "Ara taida puuduvaid aastaid uldiste trendide voi naaberaastate pohjal.",
    "Kui moni aasta ei ole piisavalt kaetud, utle seda selle aasta juures otse.",
    "Kui kasutaja palub tabelit, eelista tabelit voi selgelt aastate kaupa struktureeritud vastust.",
    yearLabel ? `Sihtaastad: ${yearLabel}.` : null
  ].filter(Boolean).join("\n");
}
