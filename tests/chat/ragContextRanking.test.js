import test from "node:test";
import assert from "node:assert/strict";

import { rankGroupsWithTopicHints } from "../../lib/chat/ragContext.js";

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
