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

test("buildModeSelectionPrompt uses natural localized copy and only lists alternatives", () => {
  const prompt = buildModeSelectionPrompt({
    replyLang: "et",
    suggestedMode: "help_offer"
  });

  assert.match(prompt, /Sain aru, et soovid vormistada abipakkumise\. Kas jätkame sellega\?/);
  assert.match(prompt, /Kui soovid hoopis midagi muud, vali:/);
  assert.match(prompt, /1\. Küsi infot ja juhendamist/);
  assert.match(prompt, /2\. Koosta dokument või aruanne/);
  assert.match(prompt, /3\. Vormista abisoov/);
  assert.doesNotMatch(prompt, /4\./);
  assert.doesNotMatch(prompt, /RAG/i);
  assert.match(prompt, /Vasta „jah“, et jätkata\. Muu variandi valimiseks sisesta number\./);
});

test("getPendingModeSelection extracts the original user message and suggestion", () => {
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

test("buildModeSelectionPrompt uses client-safe document wording for client role", () => {
  const prompt = buildModeSelectionPrompt({
    replyLang: "et",
    suggestedMode: "document",
    role: "CLIENT"
  });

  assert.match(prompt, /soovid koostada dokumendi/i);
  assert.doesNotMatch(prompt, /dokumendi v.*aruande/i);
  assert.doesNotMatch(prompt, /Koosta dokument v.*aruanne/i);
});

test("parseModeChoice accepts yes and dynamic alternative numbering", () => {
  assert.equal(parseModeChoice("jah", "help_offer"), "help_offer");
  assert.equal(parseModeChoice("1", "help_offer"), "rag");
  assert.equal(parseModeChoice("2", "help_offer"), "document");
  assert.equal(parseModeChoice("3", "help_offer"), "help_request");

  assert.equal(parseModeChoice("1", "rag"), "document");
  assert.equal(parseModeChoice("2", "rag"), "help_request");
  assert.equal(parseModeChoice("3", "rag"), "help_offer");
});

test("parseModeChoice does not treat report keyword as client document shortcut", () => {
  assert.equal(parseModeChoice("aruanne", "rag", "CLIENT"), null);
  assert.equal(parseModeChoice("dokument", "rag", "CLIENT"), "document");
});

test("resolveModeSelection asks for mode confirmation before routing a natural help message", () => {
  const result = resolveModeSelection({
    message: "Soovin pakkuda transporti Tabasalus.",
    history: [],
    replyLang: "et",
    role: "CLIENT",
    helpIntent: "create_help_offer",
    documentTaskIntent: false
  });

  assert.equal(result.handled, true);
  assert.equal(result.suggestedMode, "help_offer");
  assert.match(result.reply, /Sain aru, et soovid vormistada abipakkumise\. Kas jätkame sellega\?/);
  assert.match(result.reply, /1\. Küsi infot ja juhendamist/);
});

test("resolveModeSelection keeps the original source message after a negative reply", () => {
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
  assert.equal(result.routedMessage, "Koosta mulle aruanne.");
  assert.match(result.reply, /Kui soovid hoopis midagi muud, vali:/);
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

test("resolveModeSelection resolves an alternative number after a negative reply", () => {
  const prompt = buildModeSelectionPrompt({
    replyLang: "et",
    suggestedMode: "help_offer"
  });
  const reprompt = resolveModeSelection({
    message: "ei",
    history: [
      { role: "user", text: "Soovin pakkuda transporti Tabasalus." },
      { role: "ai", text: prompt }
    ],
    replyLang: "et"
  });

  const resolved = resolveModeSelection({
    message: "2",
    history: [
      { role: "user", text: "Soovin pakkuda transporti Tabasalus." },
      { role: "ai", text: prompt },
      { role: "user", text: "ei" },
      { role: "ai", text: reprompt.reply }
    ],
    replyLang: "et"
  });

  assert.equal(resolved.handled, false);
  assert.equal(resolved.resolvedMode, "document");
  assert.equal(resolved.routedMessage, "Soovin pakkuda transporti Tabasalus.");
});

test("resolveModeSelection can switch from a rejected structured flow into info and guidance", () => {
  const prompt = buildModeSelectionPrompt({
    replyLang: "et",
    suggestedMode: "help_offer"
  });
  const reprompt = resolveModeSelection({
    message: "ei",
    history: [
      { role: "user", text: "Soovin pakkuda transporti Tabasalus." },
      { role: "ai", text: prompt }
    ],
    replyLang: "et"
  });

  const resolvedByNumber = resolveModeSelection({
    message: "1",
    history: [
      { role: "user", text: "Soovin pakkuda transporti Tabasalus." },
      { role: "ai", text: prompt },
      { role: "user", text: "ei" },
      { role: "ai", text: reprompt.reply }
    ],
    replyLang: "et"
  });

  assert.equal(resolvedByNumber.handled, false);
  assert.equal(resolvedByNumber.resolvedMode, "rag");
  assert.equal(resolvedByNumber.routedMessage, "Soovin pakkuda transporti Tabasalus.");

  const resolvedByKeyword = resolveModeSelection({
    message: "info ja juhendamine",
    history: [
      { role: "user", text: "Soovin pakkuda transporti Tabasalus." },
      { role: "ai", text: prompt }
    ],
    replyLang: "et"
  });

  assert.equal(resolvedByKeyword.handled, false);
  assert.equal(resolvedByKeyword.resolvedMode, "rag");
  assert.equal(resolvedByKeyword.routedMessage, "Soovin pakkuda transporti Tabasalus.");
});

test("getPendingModeSelection preserves the original source message across repeated reprompts", () => {
  const prompt = buildModeSelectionPrompt({
    replyLang: "et",
    suggestedMode: "help_offer"
  });

  const pending = getPendingModeSelection([
    { role: "user", text: "Soovin pakkuda transporti Tabasalus." },
    { role: "ai", text: prompt },
    { role: "user", text: "midagi muud" },
    { role: "ai", text: prompt }
  ]);

  assert.equal(pending?.sourceMessage, "Soovin pakkuda transporti Tabasalus.");
});

test("resolveModeSelection keeps the original source message after an invalid reply and later numbered choice", () => {
  const prompt = buildModeSelectionPrompt({
    replyLang: "et",
    suggestedMode: "help_offer"
  });

  const reprompt = resolveModeSelection({
    message: "midagi muud",
    history: [
      { role: "user", text: "Soovin pakkuda transporti Tabasalus." },
      { role: "ai", text: prompt }
    ],
    replyLang: "et"
  });

  const resolved = resolveModeSelection({
    message: "1",
    history: [
      { role: "user", text: "Soovin pakkuda transporti Tabasalus." },
      { role: "ai", text: prompt },
      { role: "user", text: "midagi muud" },
      { role: "ai", text: reprompt.reply }
    ],
    replyLang: "et"
  });

  assert.equal(resolved.handled, false);
  assert.equal(resolved.resolvedMode, "rag");
  assert.equal(resolved.routedMessage, "Soovin pakkuda transporti Tabasalus.");
});
