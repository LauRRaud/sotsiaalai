// Graph-lite retrieval channel (track C2). Deterministic entity matching from
// the user question plus 1-hop traversal over RagRelation. Behind the
// RAG_GRAPH_CHANNEL_ENABLED flag (default off): the channel returns retrieval
// HINTS (entity names, related items, evidence document refs) that the
// orchestrator may use as extra query anchors — it never produces answer text
// and never bypasses source attribution.

import { normalizeEntityName } from "./graphSchema.js";

const ENTITY_CACHE_TTL_MS = Number(process.env.RAG_GRAPH_ENTITY_CACHE_TTL_MS || 5 * 60 * 1000);
const MATCHABLE_TYPES = Object.freeze(["SERVICE", "BENEFIT", "MUNICIPALITY", "ORGANIZATION"]);
const MAX_MATCHED_ENTITIES = 4;
const MAX_HINTS_PER_ENTITY = 8;

// Generic single tokens that must not match an entity on their own
// (e.g. the bare word "teenus" or a municipality word like "vald").
const WEAK_TOKENS = new Set(["teenus", "teenused", "toetus", "toetused", "vald", "linn", "valla", "linna", "keskus", "info"]);

let entityCache = { rows: null, loadedAt: 0 };

export function isGraphChannelEnabled(env = process.env) {
  return String(env.RAG_GRAPH_CHANNEL_ENABLED || "").trim() === "1";
}

export function _resetGraphEntityCacheForTests() {
  entityCache = { rows: null, loadedAt: 0 };
}

async function loadMatchableEntities(prisma) {
  const now = Date.now();
  if (entityCache.rows && now - entityCache.loadedAt < ENTITY_CACHE_TTL_MS) return entityCache.rows;
  const rows = await prisma.ragEntity.findMany({
    where: { type: { in: [...MATCHABLE_TYPES] }, reviewStatus: { in: ["AUTO_APPROVED", "APPROVED"] } },
    select: { id: true, type: true, name: true, normalizedName: true, externalKey: true }
  });
  entityCache = { rows, loadedAt: now };
  return rows;
}

export function matchEntitiesInText(question = "", entities = []) {
  const normalizedQuestion = ` ${normalizeEntityName(question)} `;
  if (!normalizedQuestion.trim()) return [];
  const matches = [];
  for (const entity of entities) {
    const name = entity.normalizedName || "";
    if (!name || name.length < 4) continue;
    const tokens = name.split(" ").filter(Boolean);
    if (tokens.length === 1 && WEAK_TOKENS.has(tokens[0])) continue;
    let hit = false;
    if (normalizedQuestion.includes(` ${name} `)) hit = true;
    else if (tokens.length === 1 && tokens[0].length >= 6) {
      // Single distinctive word (e.g. "koduteenus"): allow Estonian inflected
      // forms by prefix match ("koduteenusel", "koduteenuse").
      hit = new RegExp(`(^| )${tokens[0]}[a-z]{0,4}( |$)`).test(normalizedQuestion);
    }
    if (hit) matches.push(entity);
  }
  // Prefer longer (more specific) names, cap the count.
  matches.sort((a, b) => (b.normalizedName?.length || 0) - (a.normalizedName?.length || 0));
  return matches.slice(0, MAX_MATCHED_ENTITIES);
}

function hintFromRelation(relation, direction) {
  const other = direction === "out" ? relation.toEntity : relation.fromEntity;
  if (!other) return null;
  return {
    relation_type: relation.relationType,
    entity_type: other.type,
    name: other.name,
    external_key: other.externalKey,
    source_document_id: relation.sourceDocumentId || null,
    evidence_ref: relation.evidenceRef || null
  };
}

export async function graphChannelLookup({ question = "", prisma }) {
  if (!prisma) return { enabled: false, matched_entities: [], hints: [] };
  const entities = await loadMatchableEntities(prisma);
  const matched = matchEntitiesInText(question, entities);
  if (matched.length === 0) return { enabled: true, matched_entities: [], hints: [] };

  const ids = matched.map(entity => entity.id);
  const relations = await prisma.ragRelation.findMany({
    where: {
      OR: [{ fromEntityId: { in: ids } }, { toEntityId: { in: ids } }],
      reviewStatus: { in: ["AUTO_APPROVED", "APPROVED"] }
    },
    include: {
      fromEntity: { select: { id: true, type: true, name: true, externalKey: true } },
      toEntity: { select: { id: true, type: true, name: true, externalKey: true } }
    },
    take: 200
  });

  const hintsByEntity = new Map();
  for (const relation of relations) {
    for (const matchedEntity of matched) {
      let hint = null;
      if (relation.fromEntityId === matchedEntity.id) hint = hintFromRelation(relation, "out");
      else if (relation.toEntityId === matchedEntity.id) hint = hintFromRelation(relation, "in");
      if (!hint) continue;
      const list = hintsByEntity.get(matchedEntity.externalKey) || [];
      if (list.length < MAX_HINTS_PER_ENTITY && !list.some(existing => existing.external_key === hint.external_key && existing.relation_type === hint.relation_type)) {
        list.push(hint);
      }
      hintsByEntity.set(matchedEntity.externalKey, list);
    }
  }

  return {
    enabled: true,
    matched_entities: matched.map(entity => ({
      type: entity.type,
      name: entity.name,
      external_key: entity.externalKey
    })),
    hints: [...hintsByEntity.entries()].map(([externalKey, list]) => ({
      entity_external_key: externalKey,
      related: list
    }))
  };
}

// Converts graph hints into extra retrieval query strings the orchestrator can
// append (broad-first). Pure helper, easy to test.
export function graphHintsToQueryTexts(lookup = {}, { maxQueries = 3 } = {}) {
  const queries = [];
  for (const group of lookup.hints || []) {
    const matched = (lookup.matched_entities || []).find(entity => entity.external_key === group.entity_external_key);
    if (!matched) continue;
    const related = (group.related || [])
      .filter(hint => ["HAS_FORM", "HAS_CONTACT_POINT", "HAS_LEGAL_BASIS", "AVAILABLE_IN", "REGULATES"].includes(hint.relation_type))
      .slice(0, 3)
      .map(hint => hint.name)
      .filter(Boolean);
    if (related.length > 0) queries.push(`${matched.name} ${related.join(" ")}`);
    if (queries.length >= maxQueries) break;
  }
  return queries;
}
