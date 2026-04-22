import test from "node:test";
import assert from "node:assert/strict";

import {
  buildTemporalRetrievalPlan,
  buildTemporalBreakdownInstruction,
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
  const hints = extractTopicHints("KOVi rolli muutused ja noustamine aastatel 2018-2025");

  assert.ok(hints.includes("kov"));
  assert.ok(hints.includes("noustamine"));
  assert.ok(!hints.includes("aastatel"));
  assert.ok(!hints.includes("muutused"));
});
