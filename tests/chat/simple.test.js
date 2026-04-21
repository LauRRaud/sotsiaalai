import test from "node:test";
import assert from "node:assert/strict";

import {
  buildResponsesPayload,
  detectLang,
  langStrings,
  pickReplyLang,
  todayContext,
  toResponsesInput
} from "../../lib/chat/promptBuilder.js";
import { DEFAULT_MODEL } from "../../lib/chat/settings.js";

test("detectLang detects common chat languages", () => {
  assert.equal(detectLang("\u041f\u0440\u0438\u0432\u0435\u0442, vaja abi"), "ru");
  assert.equal(detectLang("Tere, mul on kusimus toetuse kohta"), "et");
  assert.equal(detectLang("Hello, I need help with a service"), "en");
  assert.equal(detectLang("ok"), null);
});

test("pickReplyLang uses detected language before fallbacks", () => {
  assert.equal(
    pickReplyLang({
      userMessage: "Tere, vajan abi",
      uiLocale: "en"
    }),
    "et"
  );

  assert.equal(
    pickReplyLang({
      userMessage: "ok",
      uiLocale: "en",
      lastReplyLang: "et"
    }),
    "et"
  );

  assert.equal(
    pickReplyLang({
      userMessage: "ok",
      uiLocale: "en",
      history: [{ role: "assistant", content: "Tere! Kuidas saan aidata?" }]
    }),
    "et"
  );

  assert.equal(pickReplyLang({ userMessage: "ok", uiLocale: "en" }), "en");
  assert.equal(pickReplyLang({ userMessage: "" }), "et");
});

test("langStrings returns role and language specific fallback strings", () => {
  const etClient = langStrings("et", "CLIENT");
  assert.match(etClient.greetingClient, /Tere/i);
  assert.match(etClient.crisis, /112/);

  const enWorker = langStrings("en", "SOCIAL_WORKER");
  assert.match(enWorker.greetingWorker, /Hello/i);
  assert.match(enWorker.noContext, /municipality|service|situation/i);

  const ruClient = langStrings("ru", "CLIENT");
  assert.match(ruClient.crisis, /112/);
});

test("todayContext returns Tallinn date context", () => {
  const value = todayContext();
  assert.match(value, /Date context:/);
  assert.match(value, /Europe\/Tallinn/);
});

test("toResponsesInput builds model, system prompt, context, history and user message", () => {
  const payload = toResponsesInput({
    history: [{ role: "assistant", content: "Earlier answer" }],
    userMessage: "Mis on tugiisikuteenus?",
    context: "Teenuse kirjeldus siin",
    effectiveRole: "CLIENT",
    replyLang: "et",
    isCrisis: false
  });

  assert.equal(payload.model, DEFAULT_MODEL);
  assert.equal(payload.max_output_tokens, 900);
  assert.equal(Array.isArray(payload.input), true);

  const systemMessage = payload.input[0];
  assert.equal(systemMessage.role, "system");
  assert.match(systemMessage.content, /You are SotsiaalAI/);
  assert.match(systemMessage.content, /Reply in et/);

  const ragMessage = payload.input.find(
    msg => msg.role === "system" && String(msg.content).startsWith("RAG_CONTEXT")
  );
  assert.ok(ragMessage);
  assert.match(ragMessage.content, /Teenuse kirjeldus siin/);

  assert.deepEqual(payload.input.at(-1), {
    role: "user",
    content: "Mis on tugiisikuteenus?"
  });
});

test("toResponsesInput uses worker fallback and explicit token override", () => {
  const workerPayload = toResponsesInput({
    history: [],
    userMessage: "Mis on teenuseosutaja nouded?",
    context: "Kontekst",
    effectiveRole: "SOCIAL_WORKER",
    replyLang: "et"
  });
  assert.equal(workerPayload.max_output_tokens, 1200);

  const explicitPayload = toResponsesInput({
    history: [],
    userMessage: "Test",
    context: "Kontekst",
    effectiveRole: "CLIENT",
    replyLang: "et",
    maxOutputTokens: 321
  });
  assert.equal(explicitPayload.max_output_tokens, 321);
});

test("toResponsesInput adds document analysis and extra system instructions", () => {
  const payload = toResponsesInput({
    history: [],
    userMessage: "Kokkuvote palun",
    context: "USER DOCUMENT:\nSee on faili sisu",
    effectiveRole: "CLIENT",
    replyLang: "et",
    extraSystemInstructions: ["Be extra careful.", "Keep answer compact."]
  });

  const documentRule = payload.input.find(
    msg => msg.role === "system" && String(msg.content).includes("DOCUMENT_ANALYSIS_MODE:")
  );
  assert.ok(documentRule);

  const extraMessages = payload.input.filter(
    msg =>
      msg.role === "system" &&
      (msg.content === "Be extra careful." || msg.content === "Keep answer compact.")
  );
  assert.equal(extraMessages.length, 2);
});

test("buildResponsesPayload adds response API defaults and respects overrides", () => {
  const defaultResult = buildResponsesPayload({
    model: "gpt-test",
    input: [{ role: "user", content: "Hi" }],
    preferredVerbosity: "low"
  });

  assert.equal(defaultResult.stream, true);
  assert.deepEqual(defaultResult.metadata, { source: "sotsiaalai-chat" });
  assert.deepEqual(defaultResult.text, { verbosity: "medium" });
  assert.deepEqual(defaultResult.reasoning, { effort: "low" });
  assert.equal(defaultResult.preferredVerbosity, undefined);

  const overrideResult = buildResponsesPayload(
    {
      model: "gpt-test",
      input: [{ role: "user", content: "Hi" }]
    },
    {
      verbosity: "low",
      stream: false
    }
  );

  assert.equal(overrideResult.stream, false);
  assert.deepEqual(overrideResult.text, { verbosity: "low" });
});
