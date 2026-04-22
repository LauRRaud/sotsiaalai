import test from "node:test";
import assert from "node:assert/strict";

import {
  buildTemporalRetrievalPlan,
  buildTemporalBreakdownInstruction,
  buildTemporalFillQueries,
  extractTopicHints
} from "../../lib/chat/retrievalPlanning.js";

test("temporal retrieval plan expands an explicit yearly range", () => {
  const plan = buildTemporalRetrievalPlan({
    message: "mis on olnud suurimad muudatused iga aasta kohta, 2018-2025",
    history: [],
    baseQuery: "mis on olnud suurimad muudatused iga aasta kohta, 2018-2025"
  });

  assert.equal(plan.enabled, true);
  assert.deepEqual(plan.years, [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025]);
  assert.ok(plan.queries.some(query => /\b2018\b/.test(query)));
  assert.ok(plan.queries.some(query => /\b2025\b/.test(query)));
  assert.ok(plan.queries.some(query => /\bsotsiaalkaitse\b/i.test(query)));
  assert.ok(plan.queries.some(query => /\bsotsiaalhoolekanne\b/i.test(query)));
  assert.match(plan.focusText, /suurimad muudatused/i);
  assert.doesNotMatch(plan.focusText, /\b2018\b/);
});

test("temporal retrieval plan uses history for short table followup", () => {
  const history = [
    { role: "user", content: "mis on olnud suurimad muudatused iga aasta kohta, 2018-2025" },
    { role: "assistant", content: "..." }
  ];
  const plan = buildTemporalRetrievalPlan({
    message: "uldist, tee tabel",
    history,
    baseQuery: "uldist, tee tabel\nmis on olnud suurimad muudatused iga aasta kohta, 2018-2025"
  });

  assert.equal(plan.enabled, true);
  assert.deepEqual(plan.years, [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025]);
  assert.match(plan.focusText, /suurimad muudatused/i);
});

test("temporal retrieval plan does not expand discrete years into a range", () => {
  const plan = buildTemporalRetrievalPlan({
    message: "vordle 2018 ja 2020 aastate kaupa",
    history: [],
    baseQuery: "vordle 2018 ja 2020 aastate kaupa"
  });

  assert.equal(plan.enabled, true);
  assert.deepEqual(plan.years, [2018, 2020]);
  assert.ok(!plan.queries.some(query => /\b2019\b/.test(query)));
});

test("temporal retrieval plan treats common short followups as non-focus text", () => {
  const history = [
    { role: "user", content: "mis on olnud suurimad muutused Eesti sotsiaalvaldkonnas iga aasta kohta 2018-2021" },
    { role: "assistant", content: "..." }
  ];
  const plan = buildTemporalRetrievalPlan({
    message: "jätka",
    history,
    baseQuery: "jätka\nmis on olnud suurimad muutused Eesti sotsiaalvaldkonnas iga aasta kohta 2018-2021"
  });

  assert.equal(plan.enabled, true);
  assert.match(plan.focusText, /sotsiaalvaldkonnas/i);
  assert.doesNotMatch(plan.focusText, /^jatka$/i);
});

test("temporal retrieval plan prefers the latest meaningful user focus over an older longer one", () => {
  const history = [
    { role: "user", content: "palun kirjelda voimalikult pohjalikult pensionisusteemi, toetuste, teenuste ja kogu sotsiaalvaldkonna arenguid iga aasta kohta 2018-2021" },
    { role: "assistant", content: "..." },
    { role: "user", content: "toimetulekutoetuse muutused iga aasta kohta 2018-2021" }
  ];
  const plan = buildTemporalRetrievalPlan({
    message: "jatka, tee tabel",
    history,
    baseQuery: "jatka, tee tabel\ntoimetulekutoetuse muutused iga aasta kohta 2018-2021"
  });

  assert.equal(plan.enabled, true);
  assert.match(plan.focusText, /toimetulekutoetuse muutused/i);
  assert.doesNotMatch(plan.focusText, /pensionisusteemi/i);
});

test("temporal retrieval plan stays off for broad trend questions without yearly breakdown cue", () => {
  const plan = buildTemporalRetrievalPlan({
    message: "kuidas on sotsiaalvaldkond arenenud alates 2018 algusest",
    history: [],
    baseQuery: "kuidas on sotsiaalvaldkond arenenud alates 2018 algusest"
  });

  assert.equal(plan.enabled, false);
  assert.deepEqual(plan.years, []);
});

test("temporal breakdown instruction tells the model not to fill missing years", () => {
  const instruction = buildTemporalBreakdownInstruction("et", [2018, 2019, 2020]);

  assert.match(instruction, /^TEMPORAL_BREAKDOWN_MODE:/);
  assert.match(instruction, /puuduvaid aastaid/i);
  assert.match(instruction, /2018, 2019, 2020/);
});

test("topic hints keep concrete domain keywords and drop generic timeline words", () => {
  const hints = extractTopicHints("KOV rolli muutused ja noustamine aastatel 2018-2025");

  assert.ok(hints.includes("kov"));
  assert.ok(hints.includes("noustamine"));
  assert.ok(!hints.includes("aastatel"));
  assert.ok(!hints.includes("muutused"));
});

test("topic hint stopwords are normalized consistently", () => {
  const hints = extractTopicHints("Või KOV roll valja toodud aastatel 2018-2025");

  assert.ok(hints.includes("kov"));
  assert.ok(!hints.includes("voi"));
  assert.ok(!hints.includes("valja"));
});

test("temporal fill queries create broader year-bounded fallbacks", () => {
  const queries = buildTemporalFillQueries({
    years: [2021],
    focusText: "Mis on olnud suurimad muutused Eesti sotsiaalvaldkonnas iga aasta kohta",
    topicHints: ["kov", "noustamine"]
  });

  assert.ok(queries.length >= 4);
  assert.ok(queries.every(entry => entry.filters?.year === 2021));
  assert.ok(queries.every(entry => !("tag_tokens" in (entry.filters || {}))));
  assert.ok(queries.some(entry => /sotsiaalhoolekanne/i.test(entry.query)));
  assert.ok(queries.some(entry => /sotsiaalt[oö]{2}/i.test(entry.query)));
  assert.ok(queries.some(entry => /eesti sotsiaalvaldkond 2021/i.test(entry.query)));
});
