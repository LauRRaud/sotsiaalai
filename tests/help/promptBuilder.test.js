import test from "node:test";
import assert from "node:assert/strict";

import { toResponsesInput } from "../../lib/chat/promptBuilder.js";

function getSystemPrompt(payload) {
  return String(payload?.input?.[0]?.content || "");
}

test("promptBuilder uses client-oriented plain-language guidance for client role", () => {
  const payload = toResponsesInput({
    history: [],
    userMessage: "Selgita, mis võimalused mul on.",
    context: "",
    effectiveRole: "CLIENT",
    replyLang: "et"
  });

  const system = getSystemPrompt(payload);
  assert.match(system, /default conversational mode/i);
  assert.match(system, /Do not initiate document, help request, or help offer workflow on your own\./i);
  assert.match(system, /Use plain language and avoid bureaucratic or technical wording\./i);
  assert.match(system, /What the person can do next\./i);
  assert.match(system, /Do not mix languages unnecessarily\./i);
});

test("promptBuilder uses professional structured guidance for social worker role", () => {
  const payload = toResponsesInput({
    history: [],
    userMessage: "Selgita, mis on järgmised sammud.",
    context: "",
    effectiveRole: "SOCIAL_WORKER",
    replyLang: "et"
  });

  const system = getSystemPrompt(payload);
  assert.match(system, /Be professional, structured, and practical\./i);
  assert.match(system, /distinguish between service, benefit, legal basis, and practical next step/i);
  assert.match(system, /Key distinctions, conditions, or risks\./i);
  assert.match(system, /Use up to 5 bullets only when steps, options, or distinctions clearly benefit from it\./i);
});
