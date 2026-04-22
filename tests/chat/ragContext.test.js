import test from "node:test";
import assert from "node:assert/strict";

import { renderOneContextBlock, selectTemporalGroups, rankGroupsWithTopicHints } from "../../lib/chat/ragContext.js";

test("rag context header includes journal and year metadata", () => {
  const block = renderOneContextBlock({
    title: "Sotsiaalvaldkonna muutused",
    journalTitle: "Sotsiaaltoo",
    issueLabel: "1/2021",
    year: 2021,
    authors: ["Mari Maas"],
    pages: [12, 13],
    pageRanges: [],
    paragraphTitle: null,
    section: "Teenuste arendus",
    bodies: ["Oluline kokkuvote."]
  }, 0);

  assert.match(block, /\(1\) Sotsiaalvaldkonna muutused\. Sotsiaaltoo 1\/2021\. 2021\. Mari Maas\. lk 12-13\. Teenuste arendus/);
});

test("temporal group selection reserves room for requested years", () => {
  const groups = [
    {
      key: "2018-a",
      title: "2018 A",
      year: 2018,
      bestScore: 0.99,
      bodies: ["2018 kokkuvote"],
      __sig: "2018 kokkuvote"
    },
    {
      key: "2018-b",
      title: "2018 B",
      year: 2018,
      bestScore: 0.98,
      bodies: ["2018 teine kokkuvote"],
      __sig: "2018 teine kokkuvote"
    },
    {
      key: "2019-a",
      title: "2019 A",
      year: 2019,
      bestScore: 0.55,
      bodies: ["2019 kokkuvote"],
      __sig: "2019 kokkuvote"
    },
    {
      key: "2020-a",
      title: "2020 A",
      year: 2020,
      bestScore: 0.52,
      bodies: ["2020 kokkuvote"],
      __sig: "2020 kokkuvote"
    }
  ];

  const selected = selectTemporalGroups(groups, [2018, 2019, 2020], 3, 0.5);

  assert.deepEqual(selected.map(item => item.year), [2018, 2019, 2020]);
});

test("topic hint ranking boosts matching tags within the same year", () => {
  const ranked = rankGroupsWithTopicHints([
    {
      key: "2019-generic",
      title: "2019 üldine ülevaade",
      section: "Sotsiaalpoliitika",
      year: 2019,
      bestScore: 0.91,
      tags: ["pensionid"],
      bodies: ["Üldine kokkuvõte"],
      __sig: "2019 üldine ülevaade"
    },
    {
      key: "2019-kov",
      title: "Omavalitsuste jaoks loodud nõustamisüksus",
      section: "Sotsiaaltöö korraldus",
      year: 2019,
      bestScore: 0.74,
      tags: ["KOV", "nõustamine", "sotsiaaltöö korraldus"],
      bodies: ["Artikkel tutvustab omavalitsuste nõustamisüksust."],
      __sig: "Omavalitsuste jaoks loodud nõustamisüksus"
    }
  ], ["kov", "noustamine"]);

  assert.equal(ranked[0].key, "2019-kov");
  assert.ok(ranked[0].topicBoost > ranked[1].topicBoost);
});

test("source quality ranking demotes eessona against substantive analysis", () => {
  const ranked = rankGroupsWithTopicHints([
    {
      key: "2021-eessona",
      title: "EESSONA",
      section: "Eessona",
      year: 2021,
      bestScore: 0.9,
      tags: [],
      pageRanges: ["2-2"],
      pages: [2],
      authors: ["Toimetus"],
      bodies: ["Luhike sissejuhatus."],
      __sig: "eessona"
    },
    {
      key: "2021-analysis",
      title: "Eesti inimeste toetamine majandusliku olukorra muutumisel",
      section: "Analuus",
      year: 2021,
      bestScore: 0.82,
      tags: [],
      pageRanges: ["10-20"],
      pages: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
      authors: ["Hede Sinisaar"],
      bodies: ["Pikk sisuline analuus, mis kasitleb toimetulekut ja tugiteenuseid.".repeat(20)],
      __sig: "analysis"
    }
  ], []);

  assert.equal(ranked[0].key, "2021-analysis");
  assert.ok(ranked[0].qualityAdjust > ranked[1].qualityAdjust);
});
