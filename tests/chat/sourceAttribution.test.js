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
