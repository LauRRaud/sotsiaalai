import test from "node:test";
import assert from "node:assert/strict";

import { renderOneContextBlock } from "../../lib/chat/ragContext.js";

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
