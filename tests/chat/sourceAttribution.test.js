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

test("requires exact named-list anchors before displaying generic topical sources", () => {
  const reply = [
    "Vaimse tervise valdkonnas kasutatakse digitaalseid toetavaid tööriistu,",
    "kuid nende konkreetsete nimetuste kohta ei olnud allikates kinnitust."
  ].join(" ");

  const attribution = buildSourceAttribution(reply, [
    {
      id: "generic-mental-health",
      source_type: "journal_article",
      title: "Taastumist toetav töö vaimse tervise valdkonnas",
      evidenceText: "Artikkel käsitleb vaimse tervise valdkonna taastumist toetavaid meetodeid."
    },
    {
      id: "chatbot-article",
      source_type: "journal_article",
      title: "Vestlusrobotid vaimse tervise toetamisel",
      evidenceText: "Woebot, Wysa, Vivibot ja XiaoE on näited vaimse tervise vestlusrobotitest."
    }
  ], {
    query: "Vaimse tervise vestlusrobotid, nagu Woebot, Wysa, Vivibot ja XiaoE?",
    riskPolicy: {
      riskLevel: "low",
      requiredEvidence: "medium"
    }
  });

  assert.deepEqual(attribution.displayed_source_ids, ["chatbot-article"]);
  assert.equal(attribution.filter_reasons["generic-mental-health"], "query_anchor_mismatch");
});

test("requires more than one exact anchor when a query lists several names", () => {
  const attribution = buildSourceAttribution("Allikas mainib ainult ühte nimetatud tööriista.", [
    {
      id: "single-name-article",
      source_type: "journal_article",
      title: "Woebot vaimse tervise toetamisel",
      evidenceText: "Woebot on vaimse tervise vestlusrobot."
    }
  ], {
    query: "Woebot, Wysa, Vivibot ja XiaoE",
    riskPolicy: {
      riskLevel: "low",
      requiredEvidence: "medium"
    }
  });

  assert.deepEqual(attribution.displayed_source_ids, []);
  assert.equal(attribution.filter_reasons["single-name-article"], "query_anchor_mismatch");
});

test("keeps journal article evidence for inflected AI and Tootukassa anchors", () => {
  const reply = [
    "Jah, Eestis on Töötukassa OTT-süsteemi kirjeldatud tehisintellekti kasutusnäitena.",
    "Süsteem hindab pikaajalise töötuse riski 45 näitaja alusel ja toetab spetsialisti otsustamist."
  ].join(" ");

  const attribution = buildSourceAttribution(reply, [
    {
      id: "sotsiaaltoo-ai-ott",
      source_type: "journal_article",
      title: "Tehisintellekt sotsiaaltöös: praktika, kaalutlused ja väärtuspõhised piirid",
      journalTitle: "Sotsiaaltöö",
      year: 2025,
      evidenceText: "Eesti töötukassa OTT-süsteem pakub tasakaalukamat käsitlust, kombineerides andmepõhist prognoosi ja inimlikku otsustamist. Süsteem hindab pikaajalise töötuse riski 45 näitaja alusel."
    }
  ], {
    query: "kas eestis kasutatakse tehisintellekti, nt töötukassas?",
    riskPolicy: {
      riskLevel: "low",
      requiredEvidence: "medium"
    }
  });

  assert.deepEqual(attribution.displayed_source_ids, ["sotsiaaltoo-ai-ott"]);
  assert.equal(attribution.filter_reasons["sotsiaaltoo-ai-ott"], undefined);
  assert.equal("evidenceText" in attribution.displayedSources[0], false);
});

test("thematic synthesis displays selected journal guide and study sources without legal noise", () => {
  const attribution = buildSourceAttribution(
    "Lastekaitses on murekohtadena kirjeldatud dokumenteerimise koormust, andmesüsteemide tuge ja järelevalve selgust.",
    [
      {
        id: "excel-article",
        source_type: "journal_article",
        collection_id: "sotsiaaltoo_articles",
        title: "Hea töö ei sünni Excelis – lastekaitsetöötajad ootavad järelevalvelt selgust ja tuge",
        evidenceText: "Lastekaitsetöötajad on kurtnud, et sisulist tööd kajastavad kanded hilinevad ning dokumente tuleb vormistada töövälisel ajal."
      },
      {
        id: "child-protection-study",
        source_type: "research_report",
        title: "Lastekaitse töökorralduse uuring",
        evidenceText: "Uuring käsitleb lastekaitse töökoormust, juhtumitööd ja andmesüsteemi kitsaskohti."
      },
      {
        id: "child-protection-guide",
        source_type: "methodology_guide",
        title: "Lastekaitse juhtumitöö juhend",
        evidenceText: "Juhend kirjeldab abivajaduse hindamist ja juhtumitöö dokumenteerimist."
      },
      {
        id: "child-protection-law",
        source_type: "national_law",
        title: "Lastekaitseseadus",
        evidenceText: "Seadus sätestab lastekaitse üldised põhimõtted."
      }
    ],
    {
      query: "mis on murekohad lastekaitses?",
      queryPlan: {
        mode: "thematic_synthesis",
        selection_strategy: "multi_source_diversity"
      },
      riskPolicy: {
        riskLevel: "low",
        requiredEvidence: "medium",
        insufficientEvidenceMode: false
      }
    }
  );

  assert.deepEqual(new Set(attribution.displayed_source_ids), new Set([
    "excel-article",
    "child-protection-study",
    "child-protection-guide"
  ]));
  assert.equal(attribution.filter_reasons["child-protection-law"], "query_anchor_mismatch");
  assert.equal(attribution.attribution_decisions.find(item => item.source_id === "excel-article")?.reason, "synthesis_context_selected");
  assert.equal(attribution.displayedSources.some(source => "evidenceText" in source), false);
});

test("thematic synthesis can use research sources even when topic words look like service questions", () => {
  const attribution = buildSourceAttribution(
    "Sotsiaalteenuste kättesaadavuse murekohad puudutavad piirkondlikke erinevusi ja töökorraldust.",
    [
      {
        id: "access-study",
        source_type: "research_report",
        title: "Sotsiaalteenuste kättesaadavuse uuring",
        evidenceText: "Uuring käsitleb sotsiaalteenuste kättesaadavuse probleeme ja piirkondlikke erinevusi."
      }
    ],
    {
      query: "mis on probleemid sotsiaalteenuste kättesaadavuses?",
      queryPlan: {
        mode: "thematic_synthesis",
        selection_strategy: "multi_source_diversity"
      },
      riskPolicy: {
        riskLevel: "medium",
        requiredEvidence: "strong",
        insufficientEvidenceMode: true
      }
    }
  );

  assert.deepEqual(attribution.displayed_source_ids, ["access-study"]);
  assert.equal(attribution.attribution_decisions[0].reason, "synthesis_context_selected");
  assert.equal(attribution.attribution_decisions[0].evidence_strength, "medium");
});

test("overview synthesis displays selected synthesis sources instead of raw unrelated sources", () => {
  const attribution = buildSourceAttribution(
    "Lastekaitse murekohad korduvad dokumenteerimise, tĆ¶Ć¶koormuse ja juhtumitĆ¶Ć¶ toe teemadel.",
    [
      {
        id: "selected-article",
        source_type: "journal_article",
        collection_id: "sotsiaaltoo_articles",
        title: "Hea tĆ¶Ć¶ ei sĆ¼nni Excelis",
        evidenceText: "LastekaitsetĆ¶Ć¶tajad kirjeldavad dokumenteerimise koormust ja ajapuudust."
      },
      {
        id: "selected-guide",
        source_type: "methodology_guide",
        title: "Lastekaitse juhtumitĆ¶Ć¶ juhend",
        evidenceText: "Juhend rĆµhutab juhtumitĆ¶Ć¶ tuge, hindamist ja dokumenteerimist."
      },
      {
        id: "raw-kov-source",
        source_type: "kov_service_info",
        collection_id: "kov_services",
        title: "Koduteenus",
        evidenceText: "Koduteenuse taotlemine kohalikus omavalitsuses."
      }
    ],
    {
      query: "millised on probleemid lastekaitses?",
      queryPlan: {
        mode: "overview_synthesis",
        selection_strategy: "overview_diversity_then_depth"
      },
      riskPolicy: {
        riskLevel: "low",
        requiredEvidence: "medium",
        insufficientEvidenceMode: false
      }
    }
  );

  assert.deepEqual(new Set(attribution.displayed_source_ids), new Set([
    "selected-article",
    "selected-guide"
  ]));
  assert.equal(attribution.selected_context_source_count, 3);
  assert.equal(attribution.displayed_source_count, 2);
  assert.equal(attribution.answer_source_count, 2);
  assert.equal(attribution.filtered_out_source_count, 1);
  assert.equal(attribution.displayed_sources_subset_of_selected, true);
  assert.equal(attribution.filter_reasons["raw-kov-source"], "query_anchor_mismatch");
});

test("organization profile attribution uses organization identity fields for named organization questions", () => {
  const attribution = buildSourceAttribution(
    [
      "Astangu Kutserehabilitatsiooni Keskus pakub rehabilitatsiooniga seotud tuge,",
      "töötegevust toetavas keskkonnas ning teavitus- ja juhendmaterjale."
    ].join(" "),
    [
      {
        id: "organization-astangu",
        source_type: "organization_profile",
        collection_id: "organizations",
        title: "Töötoad ja tugiteenused",
        organization_name: "Astangu Kutserehabilitatsiooni Keskus",
        organization_id: "astangu",
        official_website: "https://www.astangu.ee",
        authority: "organization_official",
        source_status: "active",
        evidenceText: "Astangu Kutserehabilitatsiooni Keskus pakub töötube, rehabilitatsiooniga seotud tuge ja juhendmaterjale."
      },
      {
        id: "unrelated-organization",
        source_type: "organization_profile",
        collection_id: "organizations",
        title: "Muu tugiteenus",
        organization_name: "Muu organisatsioon",
        authority: "organization_official",
        source_status: "active",
        evidenceText: "Muu organisatsioon pakub teistsuguseid teenuseid."
      }
    ],
    {
      query: "Mida Astangu Keskus pakub?",
      riskPolicy: {
        riskLevel: "low",
        requiredEvidence: "medium",
        insufficientEvidenceMode: false
      }
    }
  );

  assert.deepEqual(attribution.displayed_source_ids, ["organization-astangu"]);
  assert.equal(attribution.displayedSources[0].url, "https://www.astangu.ee");
  assert.equal(attribution.displayedSources[0].url_canonical, "https://www.astangu.ee");
  assert.equal("evidenceText" in attribution.displayedSources[0], false);
  assert.equal(attribution.filter_reasons["unrelated-organization"], "query_anchor_mismatch");
});

test("resource discovery attribution keeps selected organization and material sources before legal background", () => {
  const attribution = buildSourceAttribution(
    "Puudega inimest aitavad organisatsioonid, tugivõrgustikud ja praktilised materjalid; õigusallikas on ainult taust.",
    [
      {
        id: "organization-source",
        source_type: "organization_profile",
        collection_id: "organizations",
        title: "Puudega inimeste organisatsioon",
        evidenceText: "Organisatsioon toetab puudega inimesi nõustamise ja tugivõrgustiku kaudu."
      },
      {
        id: "material-source",
        source_type: "information_material",
        collection_id: "organization_materials",
        title: "Praktiline infoleht puudega inimesele",
        evidenceText: "Materjal selgitab abivõimalusi, kontakte ja teenuseid puudega inimesele."
      },
      {
        id: "legal-background",
        source_type: "national_law",
        collection_id: "national_law",
        title: "Sotsiaalhoolekande seadus § 42",
        evidenceText: "Seadus reguleerib puudega isikule eluruumi tagamist."
      }
    ],
    {
      query: "Millised organisatsioonid või materjalid aitavad puudega inimest?",
      queryPlan: {
        mode: "resource_discovery",
        selection_strategy: "resource_discovery_diversity"
      },
      riskPolicy: {
        riskLevel: "low",
        requiredEvidence: "medium",
        insufficientEvidenceMode: false
      }
    }
  );

  assert.deepEqual(new Set(attribution.displayed_source_ids), new Set([
    "organization-source",
    "material-source"
  ]));
  assert.equal(attribution.filter_reasons["legal-background"], "query_anchor_mismatch");
  assert.equal(attribution.displayed_sources_subset_of_selected, true);
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

test("keeps the scoped KOV service source for an inflected municipality service question", () => {
  const reply = [
    "Jah, Viljandi vallas on koduteenus olemas.",
    "Teenusega aidatakse kodus toime tulla ja taotluse kohta tehakse otsus 10 toopaeva jooksul."
  ].join(" ");
  const sources = [
    {
      id: "viljandi-vald-koduteenus",
      title: "Koduteenus",
      source_type: "kov_service_info",
      municipality_id: "viljandi_vald",
      municipality_name: "Viljandi vald",
      item_type: "service",
      evidenceText: "Koduteenuse eesmargiks on aidata inimest kodus toime tulla. Otsus tehakse 10 toopaeva jooksul."
    },
    {
      id: "anija-koduteenus",
      title: "Koduteenus",
      source_type: "kov_service_info",
      municipality_id: "anija_vald",
      municipality_name: "Anija vald",
      item_type: "service",
      evidenceText: "Koduteenuse eesmargiks on aidata inimest kodus toime tulla."
    },
    {
      id: "viljandi-linn-koduteenus",
      title: "Koduteenus",
      source_type: "kov_service_info",
      municipality_id: "viljandi_linn",
      municipality_name: "Viljandi linn",
      item_type: "service",
      evidenceText: "Koduteenuse eesmargiks on aidata inimest kodus toime tulla."
    }
  ];

  const attribution = buildSourceAttribution(reply, sources, {
    query: "viljandi vallas pakutakse koduteenust?",
    municipalityContext: [{
      id: "viljandi_vald",
      municipalityId: "viljandi_vald",
      slug: "viljandi-vald",
      baseName: "Viljandi",
      type: "vald",
      displayName: "Viljandi vald"
    }],
    riskPolicy: {
      riskLevel: "low",
      requiredEvidence: "medium",
      insufficientEvidenceMode: false
    }
  });

  assert.deepEqual(attribution.displayed_source_ids, ["viljandi-vald-koduteenus"]);
  assert.equal(attribution.filter_reasons["anija-koduteenus"], "query_anchor_mismatch");
  assert.equal(attribution.filter_reasons["viljandi-linn-koduteenus"], "query_anchor_mismatch");
});

test("keeps KOV service anchors strict when municipality context is missing", () => {
  const attribution = buildSourceAttribution(
    "Viljandi vallas on koduteenus olemas.",
    [
      {
        id: "viljandi-vald-koduteenus",
        title: "Koduteenus",
        source_type: "kov_service_info",
        municipality_id: "viljandi_vald",
        municipality_name: "Viljandi vald",
        item_type: "service",
        evidenceText: "Koduteenuse info."
      },
      {
        id: "anija-koduteenus",
        title: "Koduteenus",
        source_type: "kov_service_info",
        municipality_id: "anija_vald",
        municipality_name: "Anija vald",
        item_type: "service",
        evidenceText: "Koduteenuse info."
      }
    ],
    {
      query: "viljandi vallas pakutakse koduteenust?"
    }
  );

  assert.deepEqual(attribution.displayed_source_ids, ["viljandi-vald-koduteenus"]);
  assert.equal(attribution.filter_reasons["anija-koduteenus"], "query_anchor_mismatch");
});

test("keeps municipality_kov service sources for medium-risk KOV service answers", () => {
  const attribution = buildSourceAttribution(
    "Jah, Viljandi vallas pakutakse koduteenust. Teenusega aidatakse kodus toime tulla ja otsus tehakse 10 toopaeva jooksul.",
    [
      {
        id: "viljandi-municipality-kov-koduteenus",
        title: "Koduteenus",
        source_type: "municipality_kov",
        municipality_id: "viljandi_vald",
        municipality_name: "Viljandi vald",
        item_type: "service",
        evidenceText: "Koduteenuse eesmargiks on aidata inimest kodus toime tulla. Otsus tehakse 10 toopaeva jooksul."
      }
    ],
    {
      query: "viljandi vallas pakutakse koduteenust?",
      municipalityContext: [{
        id: "viljandi_vald",
        municipalityId: "viljandi_vald",
        slug: "viljandi-vald",
        baseName: "Viljandi",
        type: "vald",
        displayName: "Viljandi vald"
      }],
      riskPolicy: {
        riskLevel: "medium",
        requiredEvidence: "strong",
        insufficientEvidenceMode: true
      }
    }
  );

  assert.deepEqual(attribution.displayed_source_ids, ["viljandi-municipality-kov-koduteenus"]);
  assert.equal(attribution.attribution_decisions[0].evidence_strength, "strong");
});

test("uses municipality context for settlement alias service questions", () => {
  const attribution = buildSourceAttribution(
    "Tartu linnas on koduteenus ja selle kohta saab esitada taotluse.",
    [
      {
        id: "tartu-koduteenus",
        title: "Koduteenus",
        source_type: "kov_service_info",
        municipality_id: "tartu_linn",
        municipality_name: "Tartu linn",
        item_type: "service",
        evidenceText: "Koduteenuse info Tartu linnas."
      },
      {
        id: "joelahtme-koduteenus",
        title: "Koduteenus",
        source_type: "kov_service_info",
        municipality_id: "joelahtme_vald",
        municipality_name: "Joelahtme vald",
        item_type: "service",
        evidenceText: "Koduteenuse info Joelahtme vallas."
      }
    ],
    {
      query: "mis sotsiaalteenuseid ja toetusi Ihastes pakutakse?",
      municipalityContext: [{
        id: "tartu_linn",
        municipalityId: "tartu_linn",
        slug: "tartu-linn",
        baseName: "Tartu",
        type: "linn",
        displayName: "Tartu linn",
        matchedTerm: "Ihaste",
        matchSource: "location_alias"
      }]
    }
  );

  assert.deepEqual(attribution.displayed_source_ids, ["tartu-koduteenus"]);
  assert.equal(attribution.filter_reasons["joelahtme-koduteenus"], "query_anchor_mismatch");
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

test("package-aware attribution displays only package-confirmed sources", () => {
  const attribution = buildSourceAttribution("Jõgeva valla koduteenuse allikad kinnitavad teenuse info.", [
    {
      id: "service-info",
      source_id: "service-info",
      title: "Jõgeva vald koduteenus",
      source_type: "kov_service_info",
      source_status: "active",
      evidenceText: "Koduteenuse info."
    },
    {
      id: "journal-background",
      source_id: "journal-background",
      title: "Koduteenuse taust",
      source_type: "journal_article",
      evidenceText: "Taustartikkel."
    }
  ], {
    query: "Jõgeva vald koduteenus",
    packageAwareAnsweringUsed: true,
    packageDisplayedSourceIds: ["service-info"]
  });

  assert.deepEqual(attribution.displayed_source_ids, ["service-info"]);
  assert.equal(attribution.filtered_out_source_ids.includes("journal-background"), true);
});
