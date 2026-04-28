import test from "node:test";
import assert from "node:assert/strict";

import {
  ALLOWED_ATTRIBUTION_DECISION_REASONS,
  buildSourceAttribution,
  extractParagraphRefsFromReply,
  filterSourcesForReply,
  getSourceAttributionId
} from "../../lib/chat/sourceAttribution.js";

test("keeps only sources that overlap with the direct answer", () => {
  const reply = [
    "Võimaluste kohvik oli 2017. aasta paiku kirjeldatud projekt,",
    "mille eesmärk oli luua psüühilise erivajadusega inimestele toetatud töövõimalus.",
    "Seal said inimesed kohvikus töötada ning valmistada leiba ja pagaritooteid."
  ].join(" ");

  const sources = [
    {
      id: "voimaluste-kohvik",
      title: "Võimaluste kohvik võimalikuks",
      year: 2017,
      evidenceText: "Võimaluste kohvik oli projekt psüühilise erivajadusega inimestele töövõimaluse loomiseks."
    },
    {
      id: "kanep",
      title: "Kanep - mis on mis?",
      year: 2021,
      evidenceText: "Artikkel selgitab kanepi tarvitamise tervisemõjusid ja sõltuvusriske."
    },
    {
      id: "kaasamine",
      title: "Kaasata ja olla kaasatud: kaasatava vaade",
      year: 2025,
      evidenceText: "Artikkel käsitleb koosloomet, kaasamist ja kogemusnõustamist."
    }
  ];

  const filtered = filterSourcesForReply(reply, sources, {
    query: "mis on võimaluste kohvik?"
  });

  assert.deepEqual(filtered.map(source => source.id), ["voimaluste-kohvik"]);
  assert.equal("evidenceText" in filtered[0], false);
});

test("requires named question anchors for displayed answer sources", () => {
  const reply = [
    "Võimaluste kohvik oli 2017. aasta paiku kirjeldatud projekt,",
    "mille eesmärk oli luua psüühilise erivajadusega inimestele toetatud töövõimalus.",
    "Algatus toetas osalemist kogukonnaelus ja vaimse tervise valdkonna taastumist."
  ].join(" ");

  const sources = [
    {
      id: "voimaluste-kohvik",
      title: "Võimaluste kohvik võimalikuks",
      year: 2017,
      evidenceText: "Võimaluste kohvik oli projekt psüühilise erivajadusega inimestele töövõimaluse loomiseks."
    },
    {
      id: "avatud-dialoog",
      title: "Avatud dialoog: võimalus muudatusteks vaimse tervise valdkonnas",
      year: 2020,
      evidenceText: "Avatud dialoog aitab vaimse tervise valdkonnas muudatusi ja taastumist toetada."
    },
    {
      id: "kaasamine",
      title: "Kaasata ja olla kaasatud: kaasatava vaade",
      year: 2025,
      evidenceText: "Artikkel käsitleb kaasamist, osalemist ja kogukonnaelus osalemise vaadet."
    }
  ];

  const filtered = filterSourcesForReply(reply, sources, {
    query: "mis on võimaluste kohvik?"
  });

  assert.deepEqual(filtered.map(source => source.id), ["voimaluste-kohvik"]);
});

test("does not drop the only candidate source", () => {
  const filtered = filterSourcesForReply("Lühike vastus.", [
    {
      id: "single",
      title: "Ainus allikas",
      evidenceText: "Taustatekst"
    }
  ]);

  assert.deepEqual(filtered.map(source => source.id), ["single"]);
  assert.equal("evidenceText" in filtered[0], false);
});

test("returns attribution decisions and filtered-out source ids", () => {
  const reply = "Tartu linn koduteenus: taotlus käib sotsiaal- ja tervishoiuosakonna kaudu.";
  const sources = [
    {
      id: "tartu-koduteenus",
      title: "Tartu linn koduteenus",
      evidenceText: "Tartu linn koduteenus taotlus käib sotsiaal- ja tervishoiuosakonna kaudu."
    },
    {
      id: "journal-background",
      title: "Koduteenuse areng Eestis",
      evidenceText: "Artikkel kirjeldab koduteenuse üldist arengut."
    }
  ];

  const attribution = buildSourceAttribution(reply, sources, {
    query: "Tartu linn koduteenus"
  });

  assert.deepEqual(attribution.displayed_source_ids, ["tartu-koduteenus"]);
  assert.deepEqual(attribution.filtered_out_source_ids, ["journal-background"]);
  assert.equal(attribution.filter_reasons["journal-background"], "query_anchor_mismatch");
  assert.deepEqual(
    attribution.attribution_decisions.map(item => [item.source_id, item.decision]),
    [
      ["tartu-koduteenus", "display"],
      ["journal-background", "hide"]
    ]
  );
  assert.equal("evidenceText" in attribution.displayedSources[0], false);
});

test("uses only standardized attribution decision reasons", () => {
  const reply = "Tartu linn koduteenus: taotlus kĆ¤ib sotsiaal- ja tervishoiuosakonna kaudu.";
  const attribution = buildSourceAttribution(reply, [
    {
      id: "tartu-koduteenus",
      title: "Tartu linn koduteenus",
      evidenceText: "Tartu linn koduteenus taotlus kĆ¤ib sotsiaal- ja tervishoiuosakonna kaudu."
    },
    {
      id: "journal-background",
      title: "Koduteenuse areng Eestis",
      evidenceText: "Artikkel kirjeldab koduteenuse Ć¼ldist arengut."
    }
  ], {
    query: "Tartu linn koduteenus"
  });

  for (const decision of attribution.attribution_decisions) {
    assert.equal(ALLOWED_ATTRIBUTION_DECISION_REASONS.has(decision.reason), true, decision.reason);
  }
});

test("uses standardized insufficient evidence reason", () => {
  const attribution = buildSourceAttribution("Hooldajatoetuse summa on artiklis mainitud.", [
    {
      id: "single-journal",
      title: "Hooldajatoetuse summa",
      source_type: "journal_article",
      evidenceText: "Artikkel mainib hooldajatoetuse summat."
    }
  ], {
    query: "hooldajatoetuse summa",
    riskPolicy: {
      riskLevel: "high",
      requiredEvidence: "strong",
      insufficientEvidenceMode: true
    }
  });

  assert.equal(ALLOWED_ATTRIBUTION_DECISION_REASONS.has(attribution.attribution_decisions[0].reason), true);
  assert.equal(attribution.attribution_decisions[0].reason, "insufficient_evidence_strength");
});

test("hides weak background sources for high-risk answers", () => {
  const reply = "Hooldajatoetuse summa tuleb kinnitada ametlikust allikast.";
  const sources = [
    {
      id: "journal-background",
      title: "Hooldajatoetuse summa",
      source_type: "journal_article",
      evidenceText: "Artikkel mainib hooldajatoetuse summat üldise näitena."
    },
    {
      id: "kov-regulation",
      title: "Hooldajatoetuse summa",
      source_type: "kov_regulation",
      evidenceText: "Määrus sätestab hooldajatoetuse summa."
    }
  ];

  const attribution = buildSourceAttribution(reply, sources, {
    query: "hooldajatoetuse summa",
    riskPolicy: {
      riskLevel: "high",
      requiredEvidence: "strong",
      insufficientEvidenceMode: true
    }
  });

  assert.deepEqual(attribution.displayed_source_ids, ["kov-regulation"]);
  assert.equal(attribution.filter_reasons["journal-background"], "insufficient_evidence_strength");
  const journalDecision = attribution.attribution_decisions.find(item => item.source_id === "journal-background");
  assert.equal(journalDecision.evidence_strength, "weak");
  assert.equal(journalDecision.required_evidence, "strong");
});

test("does not keep the only candidate when high-risk evidence is insufficient", () => {
  const attribution = buildSourceAttribution("Hooldajatoetuse summa on artiklis mainitud.", [
    {
      id: "single-journal",
      title: "Hooldajatoetuse summa",
      source_type: "journal_article",
      evidenceText: "Artikkel mainib hooldajatoetuse summat."
    }
  ], {
    query: "hooldajatoetuse summa",
    riskPolicy: {
      riskLevel: "high",
      requiredEvidence: "strong",
      insufficientEvidenceMode: true
    }
  });

  assert.deepEqual(attribution.displayed_source_ids, []);
  assert.deepEqual(attribution.filtered_out_source_ids, ["single-journal"]);
  assert.equal(attribution.filter_reasons["single-journal"], "insufficient_evidence_strength");
});

test("uses legal chunk ids for national law attribution instead of collapsing by document source", () => {
  const sources = [
    {
      id: "riigiteataja:130122025029:paragraph-131-lg-1",
      source_id: "national_rt_130122025029",
      sourceType: "national_law",
      title: "Eesti - Sotsiaalhoolekande seadus - § 131 Toimetulekutoetus lg 1",
      paragraphNumber: "131",
      paragraphTitle: "Toimetulekutoetus",
      authority: "official_legal",
      source_status: "active",
      evidenceText: "§ 131. Toimetulekutoetus. Toimetulekutoetuse eesmärk on materiaalset puudust leevendada."
    },
    {
      id: "riigiteataja:130122025029:paragraph-132-lg-1",
      source_id: "national_rt_130122025029",
      sourceType: "national_law",
      title: "Eesti - Sotsiaalhoolekande seadus - § 132 Toimetulekutoetuse taotlemine lg 1",
      paragraphNumber: "132",
      paragraphTitle: "Toimetulekutoetuse taotlemine",
      authority: "official_legal",
      source_status: "active",
      evidenceText: "§ 132. Toimetulekutoetuse taotlemine. Taotleja esitab taotluse kohaliku omavalitsuse üksusele."
    }
  ];
  const reply = "Peamised sätted on § 131 „Toimetulekutoetus” ja § 132 „Toimetulekutoetuse taotlemine”.";
  const attribution = buildSourceAttribution(reply, sources, {
    query: "Millised Sotsiaalhoolekande seaduse paragrahvid reguleerivad toimetulekutoetust?",
    riskPolicy: {
      riskLevel: "high",
      requiredEvidence: "strong",
      insufficientEvidenceMode: true
    }
  });

  assert.equal(getSourceAttributionId(sources[0], 0), "riigiteataja:130122025029:paragraph-131-lg-1");
  assert.deepEqual([...attribution.displayed_source_ids].sort(), [
    "riigiteataja:130122025029:paragraph-131-lg-1",
    "riigiteataja:130122025029:paragraph-132-lg-1"
  ].sort());
});

test("keeps exact SHS legal sources with acronym and inflected benefit terms", () => {
  const sources = [
    {
      id: "riigiteataja:130122025029:paragraph-132-lg-1",
      source_id: "national_rt_130122025029",
      sourceType: "national_law",
      title: "Eesti - Sotsiaalhoolekande seadus - § 132 Toimetulekutoetuse taotlemine lg 1",
      paragraphNumber: "132",
      paragraphTitle: "Toimetulekutoetuse taotlemine",
      authority: "official_legal",
      source_status: "active",
      evidenceText: "§ 132. Toimetulekutoetuse taotlemine. Taotleja esitab taotluse kohaliku omavalitsuse üksusele."
    },
    {
      id: "riigiteataja:130122025029:paragraph-135-lg-1",
      source_id: "national_rt_130122025029",
      sourceType: "national_law",
      title: "Eesti - Sotsiaalhoolekande seadus - § 135 Riigieelarvest makstav täiendav sotsiaaltoetus lg 1",
      paragraphNumber: "135",
      paragraphTitle: "Riigieelarvest makstav täiendav sotsiaaltoetus",
      authority: "official_legal",
      source_status: "active",
      evidenceText: "§ 135. Riigieelarvest makstav täiendav sotsiaaltoetus."
    }
  ];
  const reply = "Sotsiaalhoolekande seaduse § 132 „Toimetulekutoetuse taotlemine” on siin nähtav, kuid ainult osalise katkendi kujul.";
  const attribution = buildSourceAttribution(reply, sources, {
    query: "SHS § 132 toimetulekutoetuse taotlemine",
    riskPolicy: {
      riskLevel: "high",
      requiredEvidence: "strong",
      insufficientEvidenceMode: true
    }
  });

  assert.deepEqual(attribution.displayed_source_ids, [
    "riigiteataja:130122025029:paragraph-132-lg-1"
  ]);
  assert.equal(attribution.filter_reasons["riigiteataja:130122025029:paragraph-135-lg-1"], "query_anchor_mismatch");
});

test("extracts paragraph refs from reply text", () => {
  assert.deepEqual(
    extractParagraphRefsFromReply("Selles vastuses on § 140 ja paragrahv 132."),
    ["140", "132"]
  );
});

test("hides wrong legal paragraph sources even when reply mentions a nearby paragraph", () => {
  const sources = [
    {
      id: "rt-140",
      sourceType: "national_law",
      actTitle: "Sotsiaalhoolekande seadus",
      paragraphNumber: "140",
      paragraphTitle: "Toimetulekutoetuse maksmine",
      source_status: "active",
      evidenceText: "§ 140. Toimetulekutoetuse maksmine."
    },
    {
      id: "rt-160",
      sourceType: "national_law",
      actTitle: "Sotsiaalhoolekande seadus",
      paragraphNumber: "160",
      paragraphTitle: "Paragrahvi 140 rakendamine",
      source_status: "active",
      evidenceText: "§ 160. Paragrahvi 140 rakendamine."
    }
  ];

  const attribution = buildSourceAttribution("SHS § 140 käsitleb toimetulekutoetuse maksmist.", sources, {
    query: "SHS § 140",
    legalLookupPlan: {
      enabled: true,
      mode: "explicit_paragraph",
      sourceTypes: ["national_law"],
      collectionId: "national_regulations",
      actTitle: "Sotsiaalhoolekande seadus",
      paragraphRefs: ["140"],
      municipalityId: null,
      requireCurrent: true
    },
    riskPolicy: {
      riskLevel: "high",
      requiredEvidence: "strong",
      insufficientEvidenceMode: true
    }
  });

  assert.deepEqual(attribution.displayed_source_ids, ["rt-140"]);
  assert.equal(attribution.filter_reasons["rt-160"], "legal_paragraph_not_in_answer_or_plan");
});

test("hides journal article for exact current legal paragraph lookup", () => {
  const attribution = buildSourceAttribution("SHS § 132 reguleerib toimetulekutoetuse taotlemist.", [
    {
      id: "journal-shs-132",
      sourceType: "journal_article",
      title: "SHS muudatused",
      paragraphNumber: "132",
      evidenceText: "Artikkel kirjeldab SHS muudatusi."
    },
    {
      id: "law-132",
      sourceType: "national_law",
      actTitle: "Sotsiaalhoolekande seadus",
      paragraphNumber: "132",
      source_status: "active",
      evidenceText: "§ 132. Toimetulekutoetuse taotlemine."
    }
  ], {
    query: "SHS § 132 toimetulekutoetuse taotlemine",
    legalLookupPlan: {
      enabled: true,
      mode: "explicit_paragraph",
      sourceTypes: ["national_law"],
      collectionId: "national_regulations",
      actTitle: "Sotsiaalhoolekande seadus",
      paragraphRefs: ["132"],
      municipalityId: null,
      requireCurrent: true
    },
    riskPolicy: {
      riskLevel: "high",
      requiredEvidence: "strong",
      insufficientEvidenceMode: true
    }
  });

  assert.deepEqual(attribution.displayed_source_ids, ["law-132"]);
  assert.equal(attribution.filter_reasons["journal-shs-132"], "legal_source_type_mismatch");
});

test("accepts exact legal source when act title is provided in snake_case retrieval shape", () => {
  const attribution = buildSourceAttribution("SHS Ā§ 140 reguleerib toimetulekutoetuse maksmist.", [
    {
      id: "law-140",
      source_type: "national_law",
      act_title: "Sotsiaalhoolekande seadus",
      paragraphNumber: "140",
      source_status: "active",
      evidenceText: "Ā§ 140. Toimetulekutoetuse maksmine."
    }
  ], {
    query: "SHS Ā§ 140",
    legalLookupPlan: {
      enabled: true,
      mode: "explicit_paragraph",
      sourceTypes: ["national_law"],
      collectionId: "national_regulations",
      actTitle: "Sotsiaalhoolekande seadus",
      paragraphRefs: ["140"],
      municipalityId: null,
      requireCurrent: true
    },
    riskPolicy: {
      riskLevel: "high",
      requiredEvidence: "strong",
      insufficientEvidenceMode: true
    }
  });

  assert.deepEqual(attribution.displayed_source_ids, ["law-140"]);
});
