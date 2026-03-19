// /lib/career-agent/taxonomy/oskaNormalizer.js

export const OSKA_ENTITY_TYPES = Object.freeze({
  OCCUPATION: "occupation",
  SKILL: "skill",
  FIELD: "field",
});

function coerceString(value) {
  const normalized = String(value || "").trim();
  return normalized || null;
}

function toSafeArray(value) {
  return Array.isArray(value) ? value : [];
}

function uniqueStrings(values = []) {
  return Array.from(
    new Set(
      values
        .filter((value) => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean)
    )
  );
}

function normalizeText(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9\u00c0-\u024f\s/-]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value = "") {
  const normalized = normalizeText(value);
  if (!normalized) return [];
  return normalized.split(" ").filter((token) => token.length >= 2);
}

function firstMeaningful(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }

  return null;
}

function coerceStringList(value) {
  if (Array.isArray(value)) {
    return uniqueStrings(
      value
        .map((item) => {
          if (typeof item === "string") return item;
          if (typeof item === "number" && Number.isFinite(item)) return String(item);
          return null;
        })
        .filter(Boolean)
    );
  }

  if (typeof value === "string") {
    return uniqueStrings(
      value
        .split(/\r?\n|,/g)
        .map((item) => item.trim())
        .filter(Boolean)
    );
  }

  return [];
}

function splitTextSegments(value) {
  const normalized = coerceString(value);
  if (!normalized) return [];

  return uniqueStrings(
    normalized
      .split(/\r?\n|;/g)
      .map((item) => item.trim())
      .filter(Boolean)
  );
}

function pickNestedCandidate(item, nestedKeys = []) {
  if (!item || typeof item !== "object") return null;

  for (const key of nestedKeys) {
    const candidate = item[key];
    if (candidate && typeof candidate === "object" && !Array.isArray(candidate)) {
      return candidate;
    }
  }

  return item;
}

function extractNamedValues(value, nestedKeys = []) {
  const items = toSafeArray(value);
  const result = [];

  for (const item of items) {
    if (typeof item === "string") {
      result.push(item);
      continue;
    }

    if (!item || typeof item !== "object") continue;

    const candidate = pickNestedCandidate(item, nestedKeys);
    const label = firstMeaningful(
      candidate?.label,
      candidate?.name,
      candidate?.title,
      candidate?.value
    );

    if (label) {
      result.push(label);
    }
  }

  return uniqueStrings(result);
}

function extractLinkedEntries(value, keySets = [], nestedKeys = []) {
  const items = toSafeArray(value);
  const result = [];

  for (const item of items) {
    if (typeof item === "string") {
      result.push({
        code: item,
        label: item,
      });
      continue;
    }

    if (!item || typeof item !== "object") continue;

    const candidate = pickNestedCandidate(item, nestedKeys);
    if (!candidate) continue;

    const code = firstMeaningful(
      candidate.code,
      candidate.id,
      candidate.uuid,
      candidate.key,
      candidate.slug,
      candidate.value
    );

    let label = null;
    for (const keySet of keySets) {
      label =
        firstMeaningful(...keySet.map((key) => candidate[key])) ||
        label;
      if (label) break;
    }

    label =
      label ||
      firstMeaningful(candidate.label, candidate.name, candidate.title, candidate.value);

    result.push({
      code: code || label,
      label: label || code,
    });
  }

  return result.filter((entry) => entry.code || entry.label);
}

function collectAliases(raw = {}) {
  return uniqueStrings([
    ...coerceStringList(raw.alternativeNames),
    ...coerceStringList(raw.aliases),
    ...coerceStringList(raw.synonyms),
    ...coerceStringList(raw.altLabels),
    ...coerceStringList(raw.alternativeLabels),
    ...coerceStringList(raw.otherNames),
    ...coerceStringList(raw.searchTerms),
    ...coerceStringList(raw.keywords),
  ]);
}

function collectTags(raw = {}) {
  return uniqueStrings([
    ...coerceStringList(raw.tags),
    ...coerceStringList(raw.keywords),
    ...coerceStringList(raw.themes),
  ]);
}

function computeSearchTerms(entity) {
  return uniqueStrings([
    entity.label,
    ...(entity.aliases || []),
    ...(entity.tags || []),
    ...(entity.fieldLabels || []),
    ...(entity.skillLabels || []),
    ...(entity.knowledgeAreas || []),
  ]);
}

function buildSearchDocument(entity, type) {
  const searchTerms = computeSearchTerms(entity);
  const searchableText = uniqueStrings([
    entity.label,
    ...(entity.aliases || []),
    ...(entity.tags || []),
    ...(entity.fieldLabels || []),
    ...(entity.skillLabels || []),
    ...(entity.knowledgeAreas || []),
    entity.description,
  ]).join(" ");

  return {
    type,
    id: entity.id,
    code: entity.code,
    label: entity.label,
    searchableText,
    normalizedText: normalizeText(searchableText),
    tokens: uniqueStrings(
      searchTerms.flatMap((term) => tokenize(term))
    ),
    entity,
  };
}

function scoreSearchDocument(query, doc) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return 0;

  if (doc.normalizedText === normalizedQuery) return 1;
  if (normalizeText(doc.label) === normalizedQuery) return 0.98;
  if (doc.normalizedText.includes(normalizedQuery)) return 0.9;

  const queryTokens = tokenize(normalizedQuery);
  if (!queryTokens.length) return 0;

  const docTokenSet = new Set(doc.tokens);
  const overlap = queryTokens.filter((token) => docTokenSet.has(token));

  if (!overlap.length) return 0;

  const overlapScore = overlap.length / Math.max(queryTokens.length, doc.tokens.length, 1);
  return Math.max(0.35, Math.min(0.88, 0.42 + overlapScore * 2.2));
}

function buildEntityIndexes(items = []) {
  const byId = new Map();
  const byCode = new Map();

  for (const item of items) {
    if (item.id) byId.set(item.id, item);
    if (item.code) byCode.set(item.code, item);
  }

  return {
    byId,
    byCode,
  };
}

export function normalizeOccupation(raw = {}) {
  const linkedFields = extractLinkedEntries(
    [
      ...toSafeArray(raw.fields || raw.fieldLinks || raw.sectors || raw.categories),
      ...toSafeArray(raw.fieldsOfActivity),
      raw.oskaFieldOfActivity,
    ],
    [
      ["label", "name", "title"],
    ],
    ["field", "category"]
  );

  const linkedSkills = extractLinkedEntries(
    [
      ...toSafeArray(raw.skills || raw.skillLinks || raw.competencies),
      ...toSafeArray(raw.keySkills),
      ...toSafeArray(raw.miscSkills),
    ],
    [
      ["label", "name", "title"],
    ],
    ["skill", "competency"]
  );

  const parentOccupation = extractLinkedEntries(
    [raw.parentOccupation],
    [["label", "name", "title"]],
    ["occupation"]
  )[0] || null;

  const knowledgeAreas = uniqueStrings([
    ...coerceStringList(raw.knowledgeAreas),
    ...coerceStringList(raw.knowledge),
    ...coerceStringList(raw.knowledgeTopics),
    ...extractNamedValues(raw.knowledgeRequired, ["knowledge"]),
  ]);

  const workConditions = Array.isArray(raw.workConditions)
    ? coerceStringList(raw.workConditions)
    : splitTextSegments(raw.workConditions);

  const goodToKnow = uniqueStrings([
    ...coerceStringList(raw.goodToKnow),
    ...extractNamedValues(raw.goodToKnow),
  ]);

  const educationLevels = extractNamedValues(raw.educationLevels, ["level"]);
  const toolLabels = extractNamedValues(raw.toolsRequired, ["tool"]);
  const akCodes = uniqueStrings(
    toSafeArray(raw.akCodes)
      .map((item) => firstMeaningful(item?.akCode, item?.code, item?.value))
      .filter(Boolean)
  );

  const entity = {
    type: OSKA_ENTITY_TYPES.OCCUPATION,
    id: firstMeaningful(raw.id, raw.uuid, raw.key),
    code: firstMeaningful(raw.code, raw.occupationCode, raw.iscoCode, raw.slug),
    label: firstMeaningful(raw.label, raw.name, raw.title),
    aliases: collectAliases(raw),
    description: firstMeaningful(raw.description, raw.summary, raw.text),
    summary: firstMeaningful(raw.summary, raw.description, raw.text),
    fieldCodes: uniqueStrings(linkedFields.map((item) => item.code).filter(Boolean)),
    fieldLabels: uniqueStrings(linkedFields.map((item) => item.label).filter(Boolean)),
    skillCodes: uniqueStrings(linkedSkills.map((item) => item.code).filter(Boolean)),
    skillLabels: uniqueStrings(linkedSkills.map((item) => item.label).filter(Boolean)),
    knowledgeAreas,
    parentCode: parentOccupation?.code || null,
    parentLabel: parentOccupation?.label || null,
    workConditions,
    goodToKnow,
    educationLevels,
    toolLabels,
    careerOpportunities: coerceStringList(raw.careerOpportunities),
    akCodes,
    iscedfCode: firstMeaningful(raw.iscedfCode),
    emtakCode: firstMeaningful(raw.emtakCode),
    tags: collectTags(raw),
    raw,
  };

  entity.searchTerms = computeSearchTerms(entity);
  return entity;
}

export function normalizeSkill(raw = {}) {
  const entity = {
    type: OSKA_ENTITY_TYPES.SKILL,
    id: firstMeaningful(raw.id, raw.uuid, raw.key),
    code: firstMeaningful(raw.code, raw.skillCode, raw.slug),
    label: firstMeaningful(raw.label, raw.name, raw.title),
    aliases: collectAliases(raw),
    description: firstMeaningful(raw.description, raw.summary, raw.text),
    category: firstMeaningful(raw.category, raw.group, raw.skillGroup),
    tags: collectTags(raw),
    raw,
  };

  entity.searchTerms = computeSearchTerms(entity);
  return entity;
}

export function normalizeField(raw = {}) {
  const entity = {
    type: OSKA_ENTITY_TYPES.FIELD,
    id: firstMeaningful(raw.id, raw.uuid, raw.key),
    code: firstMeaningful(raw.code, raw.fieldCode, raw.slug),
    label: firstMeaningful(raw.label, raw.name, raw.title),
    aliases: collectAliases(raw),
    description: firstMeaningful(raw.description, raw.summary, raw.text),
    tags: collectTags(raw),
    raw,
  };

  entity.searchTerms = computeSearchTerms(entity);
  return entity;
}

export function normalizeOskaDataset(input = {}) {
  const occupations = toSafeArray(input.occupations).map((item) =>
    normalizeOccupation(item)
  );
  const skills = toSafeArray(input.skills).map((item) =>
    normalizeSkill(item)
  );
  const fields = toSafeArray(input.fields).map((item) =>
    normalizeField(item)
  );

  return {
    occupations,
    skills,
    fields,
    meta: {
      occupationCount: occupations.length,
      skillCount: skills.length,
      fieldCount: fields.length,
    },
  };
}

export function buildOskaSearchIndex(dataset = {}) {
  const occupations = toSafeArray(dataset.occupations);
  const skills = toSafeArray(dataset.skills);
  const fields = toSafeArray(dataset.fields);

  const occupationDocs = occupations.map((item) =>
    buildSearchDocument(item, OSKA_ENTITY_TYPES.OCCUPATION)
  );
  const skillDocs = skills.map((item) =>
    buildSearchDocument(item, OSKA_ENTITY_TYPES.SKILL)
  );
  const fieldDocs = fields.map((item) =>
    buildSearchDocument(item, OSKA_ENTITY_TYPES.FIELD)
  );

  return {
    occupations: {
      docs: occupationDocs,
      ...buildEntityIndexes(occupations),
    },
    skills: {
      docs: skillDocs,
      ...buildEntityIndexes(skills),
    },
    fields: {
      docs: fieldDocs,
      ...buildEntityIndexes(fields),
    },
  };
}

export function searchOskaDocuments(query, docs = [], options = {}) {
  const safeQuery = coerceString(query);
  if (!safeQuery) return [];

  const limit = Number.isFinite(options.limit) ? options.limit : 10;
  const minScore = Number.isFinite(options.minScore) ? options.minScore : 0.42;

  return toSafeArray(docs)
    .map((doc) => ({
      doc,
      score: scoreSearchDocument(safeQuery, doc),
    }))
    .filter((item) => item.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => ({
      ...item.doc.entity,
      matchScore: Number(item.score.toFixed(3)),
    }));
}

export function findBestOccupationMatch(query, searchIndex, options = {}) {
  const results = searchOskaDocuments(query, searchIndex?.occupations?.docs, {
    limit: 1,
    minScore: options.minScore,
  });

  return results[0] || null;
}

export function findBestSkillMatch(query, searchIndex, options = {}) {
  const results = searchOskaDocuments(query, searchIndex?.skills?.docs, {
    limit: 1,
    minScore: options.minScore,
  });

  return results[0] || null;
}

export function findBestFieldMatch(query, searchIndex, options = {}) {
  const results = searchOskaDocuments(query, searchIndex?.fields?.docs, {
    limit: 1,
    minScore: options.minScore,
  });

  return results[0] || null;
}

export function getOccupationByCode(code, searchIndex) {
  const normalized = coerceString(code);
  if (!normalized) return null;
  return searchIndex?.occupations?.byCode?.get(normalized) || null;
}

export function getSkillByCode(code, searchIndex) {
  const normalized = coerceString(code);
  if (!normalized) return null;
  return searchIndex?.skills?.byCode?.get(normalized) || null;
}

export function getFieldByCode(code, searchIndex) {
  const normalized = coerceString(code);
  if (!normalized) return null;
  return searchIndex?.fields?.byCode?.get(normalized) || null;
}
