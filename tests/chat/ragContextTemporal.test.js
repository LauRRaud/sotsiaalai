import test from "node:test";
import assert from "node:assert/strict";

import {
  renderOneContextBlock,
  selectTemporalGroups
} from "../../lib/chat/ragContext.js";

function group(title, year, rankScore = 0.7) {
  return {
    key: `${title}-${year}`,
    title,
    year,
    bestScore: rankScore,
    rankScore,
    __sig: `${title} ${year}`,
    bodies: [`${title} body`]
  };
}

test("temporal group selection does not fill requested period with outside years", () => {
  const selected = selectTemporalGroups(
    [
      group("outside newer", 2024, 0.99),
      group("year 2018", 2018, 0.7),
      group("outside older", 2017, 0.98),
      group("year 2020", 2020, 0.65),
      group("year 2021", 2021, 0.6)
    ],
    [2018, 2019, 2020, 2021],
    8,
    0.5
  );

  assert.deepEqual(selected.map(item => item.year).sort(), [2018, 2020, 2021]);
  assert.equal(selected.some(item => item.year === 2024), false);
});

test("temporal group selection can use retrospective sources that mention target years", () => {
  const selected = selectTemporalGroups(
    [
      {
        ...group("retrospective article", 2024, 0.95),
        bodies: ["Ülevaade kirjeldab, kuidas 2021. aastal muudeti pikaajalise hoolduse korraldust."]
      },
      group("unrelated newer article", 2024, 0.99),
      group("year 2020", 2020, 0.7)
    ],
    [2020, 2021],
    8,
    0.5
  );

  assert.deepEqual(selected.map(item => item.title), ["year 2020", "retrospective article"]);
});

test("rag context labels metadata year as source_year", () => {
  const block = renderOneContextBlock(
    {
      title: "Sotsiaalvaldkonna võimalused",
      journalTitle: "Sotsiaaltöö",
      year: 2020,
      jurisdictionLevel: "NATIONAL",
      collectionId: "sotsiaaltoo_journal",
      bodies: ["Allika sisu."]
    },
    0
  );

  assert.match(block, /source_year=2020/);
  assert.match(block, /scope=NATIONAL/);
  assert.match(block, /collection=sotsiaaltoo_journal/);
});
