import test from "node:test";
import assert from "node:assert/strict";

import { groupMatches, rankGroupsWithTopicHints, renderOneContextBlock, selectMultiSourceGroups } from "../../lib/chat/ragContext.js";

test("topic hints outrank generic high-scoring noise for named concept questions", () => {
  const ranked = rankGroupsWithTopicHints([
    {
      key: "kanep",
      title: "Kanep - mis on mis?",
      bodies: ["Artikkel selgitab kanepi tarvitamise tervisemõjusid."],
      bestScore: 0.82,
      tags: []
    },
    {
      key: "voimaluste-kohvik",
      title: "Võimaluste kohvik võimalikuks",
      bodies: ["Projekt kirjeldas Võimaluste kohvikut psüühilise erivajadusega inimestele."],
      bestScore: 0.54,
      tags: []
    }
  ], ["voimaluste", "kohvik"]);

  assert.equal(ranked[0].key, "voimaluste-kohvik");
});

test("title_match channel boosts lexical exact title candidates", () => {
  const ranked = rankGroupsWithTopicHints([
    {
      key: "semantic-noise",
      title: "Koduteenuse üldine taust",
      bodies: ["Üldine kirjeldus koduteenuse tähendusest."],
      bestScore: 0.61,
      retrievalChannels: ["dense"],
      tags: []
    },
    {
      key: "title-hit",
      title: "Tartu linn koduteenus",
      bodies: ["Koduteenuse taotlemise info Tartu linnas."],
      bestScore: 0.3,
      retrievalChannels: ["title_match"],
      tags: []
    }
  ], []);

  assert.equal(ranked[0].key, "title-hit");
});

test("bm25 channel boosts lexical body matches without requiring exact phrase", () => {
  const ranked = rankGroupsWithTopicHints([
    {
      key: "dense-nearby",
      title: "Teenuste ylevaade",
      bodies: ["Yldine kohalike teenuste kirjeldus."],
      bestScore: 0.46,
      retrievalChannels: ["dense"],
      tags: []
    },
    {
      key: "bm25-hit",
      title: "Koduteenuse taotlemine",
      bodies: ["Tartu koduteenus ja taotlus on kirjeldatud teenuselehel."],
      bestScore: 0.31,
      retrievalChannels: ["bm25"],
      tags: []
    }
  ], []);

  assert.equal(ranked[0].key, "bm25-hit");
});

test("group ranking uses backend hybrid_score when present", () => {
  const groups = groupMatches([
    {
      id: "dense-top",
      doc_id: "dense-top",
      title: "Semantiline vaste",
      chunk: "Sisuliselt laiem vastus.",
      distance: 0.05,
      retrieval_channels: ["dense"],
      hybrid_score: 0.42
    },
    {
      id: "hybrid-top",
      doc_id: "hybrid-top",
      title: "Täpne hübriidvaste",
      chunk: "Päringu täpne tekstiline vaste.",
      distance: 0.4,
      retrieval_channels: ["dense", "bm25"],
      hybrid_score: 0.78
    }
  ]);
  const ranked = rankGroupsWithTopicHints(groups, []);

  assert.equal(ranked[0].key, "hybrid-top");
  assert.equal(ranked[0].bestScore, 0.78);
});

test("official active sources outrank background sources with close scores", () => {
  const ranked = rankGroupsWithTopicHints([
    {
      key: "background",
      title: "Koduteenuse taust",
      bodies: ["Artikkel selgitab koduteenuse üldist tähendust."],
      bestScore: 0.57,
      sourceType: "journal_article",
      sourceStatus: "active",
      tags: []
    },
    {
      key: "official",
      title: "Koduteenus",
      bodies: ["Ametlik KOV teenuseinfo koduteenuse taotlemise kohta."],
      bestScore: 0.45,
      sourceType: "kov_service_info",
      sourceStatus: "active",
      tags: []
    }
  ], []);

  assert.equal(ranked[0].key, "official");
  assert.ok(ranked[0].qualityAdjust > ranked[1].qualityAdjust);
});

test("historical or inactive sources are penalized below active current sources", () => {
  const ranked = rankGroupsWithTopicHints([
    {
      key: "historical",
      title: "Koduteenus",
      bodies: ["Vana teenusekirjeldus."],
      bestScore: 0.65,
      sourceType: "kov_service_info",
      sourceStatus: "inactive",
      historical: true,
      tags: []
    },
    {
      key: "current",
      title: "Koduteenus",
      bodies: ["Kehtiv teenusekirjeldus."],
      bestScore: 0.25,
      sourceType: "kov_service_info",
      sourceStatus: "active",
      historical: false,
      tags: []
    }
  ], []);

  assert.equal(ranked[0].key, "current");
});

test("groupMatches preserves source validity metadata for later evidence checks", () => {
  const groups = groupMatches([
    {
      id: "chunk-1",
      chunk: "Koduteenuse taotlemine.",
      metadata: {
        title: "Koduteenus",
        source_id: "tartu-koduteenus",
        source_type: "kov_service_info",
        source_status: "active",
        last_checked: "2026-04-25",
        valid_from: "2026-01-01",
        valid_to: null,
        historical: false
      }
    }
  ]);

  assert.equal(groups.length, 1);
  assert.equal(groups[0].sourceId, "tartu-koduteenus");
  assert.equal(groups[0].sourceType, "kov_service_info");
  assert.equal(groups[0].sourceStatus, "active");
  assert.equal(groups[0].lastChecked, "2026-04-25");
  assert.equal(groups[0].validFrom, "2026-01-01");
  assert.equal(groups[0].historical, false);
});

test("renderOneContextBlock exposes source status metadata for time-aware answers", () => {
  const block = renderOneContextBlock({
    title: "Juubelilugu",
    sourceType: "journal_article",
    sourceStatus: "archived",
    historical: true,
    year: 2018,
    lastChecked: "2026-04-25",
    validFrom: "2018-01-01",
    bodies: ["Artiklis kirjeldati varasemat rolli."],
    authors: []
  }, 0);

  assert.match(block, /source_year=2018/);
  assert.match(block, /source_type=journal_article/);
  assert.match(block, /source_status=archived/);
  assert.match(block, /historical=true/);
});

test("high-risk ranking prefers strong official evidence over high-scoring background", () => {
  const ranked = rankGroupsWithTopicHints([
    {
      key: "background",
      title: "Toimetulekutoetuse käsitlus",
      bodies: ["Ajakirjaartikkel kirjeldab toimetulekutoetuse tausta."],
      bestScore: 0.82,
      sourceType: "journal_article",
      sourceStatus: "active",
      tags: []
    },
    {
      key: "law",
      title: "Sotsiaalhoolekande seadus",
      bodies: ["Kehtiv õiguslik alus toimetulekutoetuse kohta."],
      bestScore: 0.5,
      sourceType: "national_law",
      sourceStatus: "active",
      tags: []
    }
  ], [], {
    ragRiskPolicy: {
      riskLevel: "high",
      preferredSourceTypes: ["national_law", "kov_regulation", "state_guide"],
      requiredEvidence: "strong"
    }
  });

  assert.equal(ranked[0].key, "law");
});

test("low-risk ranking can still prefer methodology and practice background", () => {
  const ranked = rankGroupsWithTopicHints([
    {
      key: "generic",
      title: "Projekti kirjeldus",
      bodies: ["Üldine projekti taustakirjeldus."],
      bestScore: 0.46,
      sourceType: "project_description",
      sourceStatus: "active",
      tags: []
    },
    {
      key: "methodology",
      title: "Juhtumikorralduse metoodika",
      bodies: ["Metoodiline taust juhtumikorralduse praktika kohta."],
      bestScore: 0.42,
      sourceType: "methodology_guide",
      sourceStatus: "active",
      tags: []
    }
  ], [], {
    ragRiskPolicy: {
      riskLevel: "low",
      preferredSourceTypes: ["journal_article", "methodology_guide", "practice_example"],
      requiredEvidence: "medium"
    }
  });

  assert.equal(ranked[0].key, "methodology");
});

test("selectMultiSourceGroups prefers distinct source identities for synthesis", () => {
  const selected = selectMultiSourceGroups([
    {
      key: "a-1",
      docId: "article-a",
      title: "Article A",
      bestScore: 0.9,
      rankScore: 0.9,
      __sig: "article a tehisintellekt"
    },
    {
      key: "a-2",
      docId: "article-a",
      title: "Article A",
      bestScore: 0.85,
      rankScore: 0.85,
      __sig: "article a tehisintellekt teine"
    },
    {
      key: "b-1",
      docId: "article-b",
      title: "Article B",
      bestScore: 0.7,
      rankScore: 0.7,
      __sig: "article b tehisintellekt"
    }
  ], 2, 0.8);

  assert.equal(selected.length, 2);
  assert.deepEqual(selected.map(item => item.docId), ["article-a", "article-b"]);
});

test("selectMultiSourceGroups deduplicates canonical item identities for synthesis", () => {
  const groups = groupMatches([
    {
      id: "ai-summary",
      text: "Article summary about tehisintellekt in social work.",
      hybrid_score: 0.95,
      metadata: {
        title: "Tehisintellekt sotsiaaltoos",
        doc_id: "article-ai-summary",
        source_id: "article-ai-summary",
        canonical_item_id: "article-ai",
        source_type: "journal_article"
      }
    },
    {
      id: "ai-pdf",
      text: "PDF chunk from the same tehisintellekt social work article.",
      hybrid_score: 0.93,
      metadata: {
        title: "Tehisintellekt sotsiaaltoos PDF",
        doc_id: "article-ai-pdf",
        source_id: "article-ai-pdf",
        canonical_item_id: "article-ai",
        source_type: "journal_article"
      }
    },
    {
      id: "slovenia",
      text: "Separate article about long-term care in Slovenia.",
      hybrid_score: 0.64,
      metadata: {
        title: "Pikaajaline hooldus Sloveenias",
        doc_id: "article-slovenia",
        source_id: "article-slovenia",
        canonical_item_id: "article-slovenia",
        source_type: "journal_article"
      }
    },
    {
      id: "ott",
      text: "Separate article about community service examples and OTT.",
      hybrid_score: 0.62,
      metadata: {
        title: "Kogukonnateenuse naited",
        doc_id: "article-ott",
        source_id: "article-ott",
        canonical_item_id: "article-ott",
        source_type: "journal_article"
      }
    }
  ]);
  const ranked = rankGroupsWithTopicHints(groups, ["tehisintellekt", "sotsiaaltoo"]);
  const selected = selectMultiSourceGroups(ranked, 3, 0.9);

  assert.equal(selected.length, 3);
  assert.deepEqual(selected.map(item => item.canonicalItemId), ["article-ai", "article-slovenia", "article-ott"]);
  assert.deepEqual(new Set(selected.map(item => item.canonicalItemId)).size, selected.length);
});
