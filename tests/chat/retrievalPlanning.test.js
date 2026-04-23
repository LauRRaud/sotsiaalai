import test from "node:test";
import assert from "node:assert/strict";

import {
  buildTemporalBreakdownInstruction,
  buildTemporalRetrievalPlan,
  buildTemporalYearSearchQuery
} from "../../lib/chat/retrievalPlanning.js";

test("initial year-range question enables per-year temporal retrieval", () => {
  const plan = buildTemporalRetrievalPlan({
    message: "mis olid peamised muudatused sotsiaalvaldkonnas aastatel 2018-2021?",
    baseQuery: "mis olid peamised muudatused sotsiaalvaldkonnas aastatel 2018-2021?",
    history: []
  });

  assert.equal(plan.enabled, true);
  assert.deepEqual(plan.years, [2018, 2019, 2020, 2021]);
  assert.match(buildTemporalYearSearchQuery(plan.focusText, 2019), /Sotsiaaltöö/);
});

test("short affirmative follow-up accepts assistant temporal table offer", () => {
  const plan = buildTemporalRetrievalPlan({
    message: "jah",
    baseQuery: "jah\nmis olid peamised muudatused sotsiaalvaldkonnas aastatel 2018-2021?",
    history: [
      {
        role: "user",
        content: "mis olid peamised muudatused sotsiaalvaldkonnas aastatel 2018-2021?"
      },
      {
        role: "assistant",
        content: "Kui soovid, võin selle panna aastate kaupa 2018 / 2019 / 2020 / 2021 lühikesse tabelisse."
      }
    ]
  });

  assert.equal(plan.enabled, true);
  assert.deepEqual(plan.years, [2018, 2019, 2020, 2021]);
  assert.match(plan.focusText, /sotsiaalvaldkonnas/);
});

test("temporal instruction tells model to resolve short affirmative follow-ups", () => {
  const instruction = buildTemporalBreakdownInstruction("et", [2018, 2019]);

  assert.match(instruction, /lühike nõusolek/);
  assert.match(instruction, /source_year/);
  assert.match(instruction, /2018, 2019/);
});
