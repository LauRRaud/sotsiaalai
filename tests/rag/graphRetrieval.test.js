import test from "node:test";
import assert from "node:assert/strict";

import {
  _resetGraphEntityCacheForTests,
  graphChannelLookup,
  graphHintsToQueryTexts,
  isGraphChannelEnabled,
  matchEntitiesInText,
  graphChannelSearchTopK,
  selectGraphChannelSupplement
} from "../../lib/rag/graph/graphRetrieval.js";

const ENTITIES = [
  { id: "e1", type: "SERVICE", name: "Koduteenus", normalizedName: "koduteenus", externalKey: "kov_item:kuusalu_vald:service:koduteenus" },
  { id: "e2", type: "MUNICIPALITY", name: "Kuusalu vald", normalizedName: "kuusalu vald", externalKey: "municipality:kuusalu_vald" },
  { id: "e3", type: "SERVICE", name: "Tugiisikuteenus", normalizedName: "tugiisikuteenus", externalKey: "kov_item:kuusalu_vald:service:tugiisik" },
  { id: "e4", type: "BENEFIT", name: "Toetus", normalizedName: "toetus", externalKey: "weak:toetus" }
];

test("flag defaults to off and respects env", () => {
  assert.equal(isGraphChannelEnabled({}), false);
  assert.equal(isGraphChannelEnabled({ RAG_GRAPH_CHANNEL_ENABLED: "1" }), true);
  assert.equal(isGraphChannelEnabled({ RAG_GRAPH_CHANNEL_ENABLED: "0" }), false);
});

test("matchEntitiesInText matches exact, multiword and inflected names", () => {
  assert.deepEqual(
    matchEntitiesInText("Millised on Kuusalu valla koduteenuse tingimused?", ENTITIES).map(entity => entity.id).sort(),
    ["e1"].sort().concat().sort ? ["e1"] : ["e1"]
  );
  const inflected = matchEntitiesInText("Kas tugiisikuteenusel on omaosalus?", ENTITIES);
  assert.deepEqual(inflected.map(entity => entity.id), ["e3"]);
  const multi = matchEntitiesInText("Kuusalu vald pakub abi", ENTITIES);
  assert.ok(multi.some(entity => entity.id === "e2"));
});

test("weak single tokens never match", () => {
  const matches = matchEntitiesInText("Kas mul on õigus toetusele?", ENTITIES);
  assert.equal(matches.find(entity => entity.id === "e4"), undefined);
});

test("graphChannelLookup traverses relations with mock prisma", async () => {
  _resetGraphEntityCacheForTests();
  const prisma = {
    ragEntity: { findMany: async () => ENTITIES },
    ragRelation: {
      findMany: async () => [
        {
          fromEntityId: "e1", toEntityId: "f1", relationType: "HAS_FORM",
          sourceDocumentId: "kov_bundle:kuusalu_vald", evidenceRef: "kuusalu:form:avaldus",
          fromEntity: { id: "e1", type: "SERVICE", name: "Koduteenus", externalKey: ENTITIES[0].externalKey },
          toEntity: { id: "f1", type: "FORM", name: "Sotsiaalteenuse avaldus", externalKey: "kov_item:kuusalu_vald:form:avaldus" }
        },
        {
          fromEntityId: "e1", toEntityId: "m1", relationType: "AVAILABLE_IN",
          sourceDocumentId: "kov_bundle:kuusalu_vald", evidenceRef: null,
          fromEntity: { id: "e1", type: "SERVICE", name: "Koduteenus", externalKey: ENTITIES[0].externalKey },
          toEntity: { id: "m1", type: "MUNICIPALITY", name: "Kuusalu vald", externalKey: "municipality:kuusalu_vald" }
        }
      ]
    }
  };
  const lookup = await graphChannelLookup({ question: "Millised on koduteenuse tingimused?", prisma });
  assert.equal(lookup.matched_entities.length, 1);
  assert.equal(lookup.matched_entities[0].name, "Koduteenus");
  assert.equal(lookup.hints.length, 1);
  const related = lookup.hints[0].related;
  assert.ok(related.some(hint => hint.relation_type === "HAS_FORM" && hint.name === "Sotsiaalteenuse avaldus"));
  assert.ok(related.every(hint => hint.source_document_id || hint.evidence_ref !== undefined));

  const queries = graphHintsToQueryTexts(lookup);
  assert.equal(queries.length, 1);
  assert.ok(queries[0].includes("Koduteenus"));
  assert.ok(queries[0].includes("Sotsiaalteenuse avaldus"));
});

test("graphChannelSearchTopK scales with query count and caps", () => {
  assert.equal(graphChannelSearchTopK(0), 0);
  assert.equal(graphChannelSearchTopK(1), 6);
  assert.equal(graphChannelSearchTopK(2), 12);
  assert.equal(graphChannelSearchTopK(3), 18);
  assert.equal(graphChannelSearchTopK(10), 18); // ceiling holds
  assert.equal(graphChannelSearchTopK(-1), 0); // guard
});

test("selectGraphChannelSupplement drops native dupes, caps, and marks origin", () => {
  const native = [
    { id: "d1", hybrid_score: 0.9 },
    { id: "d2", hybrid_score: 0.8 }
  ];
  const graph = [
    { id: "d2", hybrid_score: 0.95 }, // already native -> excluded
    { id: "d3", hybrid_score: 0.7 },
    { id: "d4", hybrid_score: 0.6 },
    { id: "d5", hybrid_score: 0.5 },
    { id: "d3", hybrid_score: 0.7 } // duplicate within graph -> deduped
  ];
  const supplement = selectGraphChannelSupplement(native, graph, 2);
  assert.deepEqual(supplement.map(m => m.id), ["d3", "d4"]); // top-2 by score, native excluded
  assert.ok(supplement.every(m => m.graph_channel_origin === true && m.retrieval_channel_graph === true));
});

test("selectGraphChannelSupplement returns empty when cap is zero or no new docs", () => {
  assert.deepEqual(selectGraphChannelSupplement([{ id: "d1" }], [{ id: "d2" }], 0), []);
  assert.deepEqual(selectGraphChannelSupplement([{ id: "d1" }], [{ id: "d1" }], 3), []);
  assert.deepEqual(selectGraphChannelSupplement([], [], 3), []);
});

test("graphChannelLookup returns empty hints when nothing matches", async () => {
  _resetGraphEntityCacheForTests();
  const prisma = {
    ragEntity: { findMany: async () => ENTITIES },
    ragRelation: { findMany: async () => { throw new Error("should not be called"); } }
  };
  const lookup = await graphChannelLookup({ question: "Tere, kuidas läheb?", prisma });
  assert.deepEqual(lookup.matched_entities, []);
  assert.deepEqual(lookup.hints, []);
});
