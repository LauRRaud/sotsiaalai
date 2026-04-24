import test from "node:test";
import assert from "node:assert/strict";

import { shouldUseExternalSourcesForTurn } from "../../lib/chat/sourceNeed.js";

test("uses RAG for ordinary municipality services and supports questions", () => {
  assert.equal(
    shouldUseExternalSourcesForTurn("Kas Jõgeva pakub sotsiaalteenuseid ja toetusi?"),
    true
  );
});

test("uses RAG for service jurisdiction classification questions", () => {
  assert.equal(
    shouldUseExternalSourcesForTurn("Varjupaigateenus on KOV või riiklik teenus?"),
    true
  );
});

test("uses RAG for affirmative numbered follow-ups when there is history", () => {
  assert.equal(
    shouldUseExternalSourcesForTurn("2", { hasHistory: true }),
    true
  );
});

test("does not treat a decline as a retrieval follow-up by itself", () => {
  assert.equal(
    shouldUseExternalSourcesForTurn("ei", { hasHistory: true }),
    false
  );
});

test("does not use RAG when the user asks about the source UI itself", () => {
  assert.equal(
    shouldUseExternalSourcesForTurn("Miks vastuste allikad näitab imelikult?"),
    false
  );
});
