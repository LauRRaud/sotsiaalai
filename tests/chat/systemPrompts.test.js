import test from "node:test";
import assert from "node:assert/strict";

import { pickReplyLang, toResponsesInput } from "../../lib/chat/promptBuilder.js";
import {
  SYSTEM_PROMPT_DEFINITIONS,
  buildLocalizedExtraSystemInstruction,
  buildLocalizedSystemPrompt
} from "../../lib/chat/systemPrompts/index.js";
import {
  EXTRA_SYSTEM_INSTRUCTION_KEYS,
  SYSTEM_PROMPT_ROLE_KEYS
} from "../../lib/chat/systemPrompts/common.js";

test("localized chat system prompts expose the same role blocks", () => {
  for (const [lang, definition] of Object.entries(SYSTEM_PROMPT_DEFINITIONS)) {
    assert.equal(typeof definition.base, "function", `${lang} base prompt`);
    assert.deepEqual(
      Object.keys(definition.roles).sort(),
      [...SYSTEM_PROMPT_ROLE_KEYS].sort(),
      `${lang} role keys`
    );
  }
});

test("localized chat system prompts expose the same extra instruction blocks", () => {
  for (const [lang, definition] of Object.entries(SYSTEM_PROMPT_DEFINITIONS)) {
    assert.deepEqual(
      Object.keys(definition.extra).sort(),
      [...EXTRA_SYSTEM_INSTRUCTION_KEYS].sort(),
      `${lang} extra instruction keys`
    );
  }
});

test("Estonian system prompt is selected from reply language", () => {
  const input = toResponsesInput({
    history: [],
    userMessage: "mis on võimaluste kohvik?",
    context: "",
    effectiveRole: "CLIENT",
    replyLang: "et"
  });
  const system = input.input[0].content;

  assert.match(system, /Sa oled SotsiaalAI/);
  assert.match(system, /üldise raamistiku/);
  assert.doesNotMatch(system, /wider framework/i);
});

test("reply language is normalized before prompt rendering", () => {
  const input = toResponsesInput({
    history: [],
    userMessage: "palun selgita",
    context: "",
    effectiveRole: "CLIENT",
    replyLang: "et-EE"
  });
  const system = input.input[0].content;

  assert.match(system, /Vasta keeles et,/);
  assert.doesNotMatch(system, /Vasta keeles et-EE/);
});

test("UI language has priority over lightweight message language detection", () => {
  assert.equal(
    pickReplyLang({
      userMessage: "hello, can you help?",
      uiLocale: "et"
    }),
    "et"
  );
  assert.equal(
    pickReplyLang({
      userMessage: "tere",
      uiLocale: "en"
    }),
    "en"
  );
  assert.equal(
    pickReplyLang({
      userMessage: "привет",
      uiLocale: "et"
    }),
    "et"
  );
});

test("extra chat instructions are selected from reply language", () => {
  const etSourceLookup = buildLocalizedExtraSystemInstruction("SOURCE_LOOKUP_MODE", {
    replyLang: "et"
  });
  const ruMunicipality = buildLocalizedExtraSystemInstruction("MUNICIPALITY_CLARIFICATION_REQUIRED", {
    effectiveRole: "SOCIAL_WORKER",
    replyLang: "ru"
  });

  assert.match(etSourceLookup, /^SOURCE_LOOKUP_MODE:/);
  assert.doesNotMatch(etSourceLookup, /The user is asking whether a source/);
  assert.match(ruMunicipality, /^MUNICIPALITY_CLARIFICATION_REQUIRED:/);
  assert.doesNotMatch(ruMunicipality, /The current specialist question/);
});

test("document analysis instruction is localized", () => {
  const input = toResponsesInput({
    history: [],
    userMessage: "tee kokkuvõte",
    context: "USER DOCUMENT:\nDokumendi sisu.",
    effectiveRole: "CLIENT",
    replyLang: "et"
  });
  const docInstruction = input.input.find(item =>
    item.role === "system" && String(item.content || "").startsWith("DOCUMENT_ANALYSIS_MODE:")
  )?.content || "";

  assert.match(docInstruction, /^DOCUMENT_ANALYSIS_MODE:/);
  assert.match(docInstruction, /analüüs/i);
  assert.doesNotMatch(docInstruction, /The user has uploaded a document/);
});

test("Russian system prompt is selected from reply language", () => {
  const system = buildLocalizedSystemPrompt({
    effectiveRole: "SOCIAL_WORKER",
    replyLang: "ru",
    dateContext: "Контекст даты: 21.04.2026 (Europe/Tallinn)."
  });

  assert.match(system, /Ты SotsiaalAI\./);
  assert.match(system, /Пиши для специалиста социальной сферы\./);
  assert.doesNotMatch(system, /Write for a social work specialist/i);
});
