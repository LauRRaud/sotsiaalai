import test from "node:test";
import assert from "node:assert/strict";

import { toResponsesInput } from "../../lib/chat/promptBuilder.js";

test("weak RAG grounding adds a caution instruction for partial context", () => {
  const payload = toResponsesInput({
    history: [],
    userMessage: "mis olid peamised muudatused?",
    context: "(1) Testallikas 2020\nOsaline kirjeldus.",
    effectiveRole: "SOCIAL_WORKER",
    grounding: "weak",
    replyLang: "et"
  });

  const groundingMessage = payload.input.find(item => String(item.content || "").startsWith("RAG_GROUNDING: weak."));
  assert.ok(groundingMessage);
  assert.match(groundingMessage.content, /Ära esita vastust täieliku ülevaatena/);
});

test("weak grounding does not add RAG caution when no numbered RAG block exists", () => {
  const payload = toResponsesInput({
    history: [],
    userMessage: "tere",
    context: "CONVERSATIONAL_CONTEXT: No verified external context was retrieved for this turn.",
    effectiveRole: "SOCIAL_WORKER",
    grounding: "weak",
    replyLang: "et"
  });

  assert.equal(
    payload.input.some(item => String(item.content || "").startsWith("RAG_GROUNDING: weak.")),
    false
  );
});
