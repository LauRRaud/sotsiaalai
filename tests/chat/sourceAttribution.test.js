import test from "node:test";
import assert from "node:assert/strict";

import { filterSourcesForReply } from "../../lib/chat/sourceAttribution.js";

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

  const filtered = filterSourcesForReply(reply, sources);

  assert.deepEqual(filtered.map(source => source.id), ["voimaluste-kohvik"]);
  assert.equal("evidenceText" in filtered[0], false);
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
