import test from "node:test";
import assert from "node:assert/strict";

import {
  buildModeSelectionPrompt,
  getPendingModeSelection,
  inferSuggestedMode,
  parseModeChoice,
  resolveModeSelection
} from "../../lib/chat/modeSelection.js";

test("inferSuggestedMode prefers help and document detections over rag", () => {
  assert.equal(inferSuggestedMode({ helpIntent: "create_help_offer" }), "help_offer");
  assert.equal(inferSuggestedMode({ helpIntent: "create_help_request" }), "help_request");
  assert.equal(inferSuggestedMode({ documentTaskIntent: true }), "document");
  assert.equal(inferSuggestedMode({}), "rag");
});

test("resolveModeSelection asks for mode confirmation before routing a natural help message", () => {
  const result = resolveModeSelection({
    message: "Soovin pakkuda transporti Tabasalus.",
    history: [],
    replyLang: "et",
    helpIntent: "create_help_offer",
    documentTaskIntent: false
  });

  assert.equal(result.handled, true);
  assert.equal(result.suggestedMode, "help_offer");
  assert.match(result.reply, /sain aru, et soovid selle vormistada abipakkumisena/i);
  assert.doesNotMatch(result.reply, /RAG/i);
  assert.match(result.reply, /infot ja juhendamist/i);
});

test("getPendingModeSelection extracts the previous user message and suggestion", () => {
  const prompt = buildModeSelectionPrompt({
    replyLang: "et",
    suggestedMode: "document"
  });
  const pending = getPendingModeSelection([
    { role: "user", text: "Koosta mulle avaldus vallale." },
    { role: "ai", text: prompt }
  ]);

  assert.equal(pending?.suggestedMode, "document");
  assert.equal(pending?.sourceMessage, "Koosta mulle avaldus vallale.");
});

test("parseModeChoice accepts yes as confirmation for the suggested mode", () => {
  assert.equal(parseModeChoice("jah", "help_offer"), "help_offer");
  assert.equal(parseModeChoice("1", "help_offer"), "rag");
  assert.equal(parseModeChoice("2", "rag"), "document");
  assert.equal(parseModeChoice("3", "rag"), "help_request");
  assert.equal(parseModeChoice("4", "rag"), "help_offer");
  assert.equal(parseModeChoice("aruanne", "rag"), "document");
  assert.equal(parseModeChoice("juhendamine", "document"), "rag");
});

test("resolveModeSelection offers alternatives when the user says no", () => {
  const prompt = buildModeSelectionPrompt({
    replyLang: "et",
    suggestedMode: "document"
  });
  const result = resolveModeSelection({
    message: "ei",
    history: [
      { role: "user", text: "Koosta mulle aruanne." },
      { role: "ai", text: prompt }
    ],
    replyLang: "et"
  });

  assert.equal(result.handled, true);
  assert.match(result.reply, /kui see ei ole oige suund/i);
  assert.match(result.reply, /vormistada abisoov/i);
  assert.match(result.reply, /vormistada abipakkumine/i);
});

test("resolveModeSelection resolves a pending confirmation using the original source message", () => {
  const prompt = buildModeSelectionPrompt({
    replyLang: "et",
    suggestedMode: "help_request"
  });
  const result = resolveModeSelection({
    message: "jah",
    history: [
      { role: "user", text: "Mul oleks vaja emale abi poes käimiseks." },
      { role: "ai", text: prompt }
    ],
    replyLang: "et"
  });

  assert.equal(result.handled, false);
  assert.equal(result.resolvedMode, "help_request");
  assert.equal(result.routedMessage, "Mul oleks vaja emale abi poes käimiseks.");
});
