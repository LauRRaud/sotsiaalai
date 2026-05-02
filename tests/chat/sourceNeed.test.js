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

test("uses RAG for short article follow-ups when recent assistant sources exist", () => {
  const options = {
    hasHistory: true,
    hasRecentAssistantSources: true
  };

  assert.equal(
    shouldUseExternalSourcesForTurn("kas seal Eestit ka mainitakse?", options),
    true
  );
  assert.equal(
    shouldUseExternalSourcesForTurn("Soome", options),
    true
  );
  assert.equal(
    shouldUseExternalSourcesForTurn("OTT", options),
    true
  );
});

test("uses RAG for work and social-field AI questions without requiring a KOV term", () => {
  assert.equal(
    shouldUseExternalSourcesForTurn("kas tehisintellekti kasutatakse tĆ¶Ć¶tukassas?"),
    true
  );
});

test("does not use RAG for a source-anchored decline", () => {
  assert.equal(
    shouldUseExternalSourcesForTurn("ei", {
      hasHistory: true,
      hasRecentAssistantSources: true
    }),
    false
  );
});

test("uses RAG for broad comparison follow-ups when recent assistant sources exist", () => {
  const options = {
    hasHistory: true,
    hasRecentAssistantSources: true
  };

  assert.equal(
    shouldUseExternalSourcesForTurn("võrdle seda teiste artiklitega", options),
    true
  );
  assert.equal(
    shouldUseExternalSourcesForTurn("tee laiem ülevaade ajakirjas Sotsiaaltöö", options),
    true
  );
});

test("does not use RAG when the user asks about the source UI itself", () => {
  assert.equal(
    shouldUseExternalSourcesForTurn("Miks vastuste allikad näitab imelikult?"),
    false
  );
});
