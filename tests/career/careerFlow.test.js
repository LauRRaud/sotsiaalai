import test from "node:test";
import assert from "node:assert/strict";

const { resolveCareerTurn } = await import("../../lib/career-agent/core/careerOrchestrator.js");

test("empty career turn asks for the actual intake reason first", async () => {
  const result = await resolveCareerTurn({});

  assert.equal(result.currentState, "intake");
  assert.equal(result.response?.kind, "question_set");
  assert.deepEqual(result.questions?.map((question) => question.id), ["intake_reason"]);
});

test("generic career mode activation phrase stays in intake", async () => {
  const result = await resolveCareerTurn({
    runtime: {
      userMessage: "Soovin karjäärinõustamist",
    },
  });

  assert.equal(result.currentState, "intake");
  assert.equal(result.response?.kind, "question_set");
  assert.deepEqual(result.questions?.map((question) => question.id), ["intake_reason"]);
});

test("informative first message moves directly to profile parsing without storage consent", async () => {
  const result = await resolveCareerTurn({
    runtime: {
      userMessage: "Olen klienditeenindaja ja tahan liikuda IT-testimise valdkonda.",
    },
  });

  assert.equal(result.currentState, "parse_profile");
  assert.equal(result.response?.kind, "question_set");
  assert.deepEqual(
    result.questions?.map((question) => question.id),
    ["profile_cv_available"]
  );
});

test("explicit profile storage requirement still asks for consent", async () => {
  const result = await resolveCareerTurn({
    runtime: {
      userMessage: "Olen klienditeenindaja ja tahan liikuda IT-testimise valdkonda.",
      requiresProfileStorage: true,
    },
  });

  assert.equal(result.currentState, "agreements");
  assert.equal(result.response?.kind, "question_set");
  assert.deepEqual(
    result.questions?.map((question) => question.id),
    ["consent_profile_storage"]
  );
});

test("distress context continues with questions instead of handoff", async () => {
  const result = await resolveCareerTurn({
    runtime: {
      userMessage: "Mul on praegu vaga raske ja paanika, aga tahan aru saada mis amet mulle sobiks.",
      highDistress: true,
    },
  });

  assert.notEqual(result.response?.kind, "handoff");
  assert.equal(result.response?.kind, "question_set");
  assert.deepEqual(
    result.questions?.map((question) => question.id),
    ["profile_cv_available"]
  );
});

test("when cv is already available parse profile asks what else to add before building summary", async () => {
  const result = await resolveCareerTurn({
    profile: {
      sourceMode: {
        activeModes: ["cv_upload"],
        cvUploaded: true,
      },
    },
    runtime: {
      userMessage: "Tahan saada aru, mis amet mulle sobiks.",
    },
  });

  assert.equal(result.currentState, "parse_profile");
  assert.equal(result.response?.kind, "question_set");
  assert.deepEqual(
    result.questions?.map((question) => question.id),
    ["profile_background_summary"]
  );
});

test("too little context continues by asking for more information", async () => {
  const result = await resolveCareerTurn({
    profile: {
      recommendationContext: {
        missingInformation: [
          "kogemus",
          "oskused",
          "eesmark",
          "haridus",
          "asukoht",
          "piirangud",
          "huvid",
        ],
      },
    },
    runtime: {
      userMessage: "Ma ei tea veel tapselt, mida teha.",
      insufficientEvidence: true,
      contextTooUnclear: true,
    },
  });

  assert.notEqual(result.response?.kind, "handoff");
  assert.equal(result.response?.kind, "question_set");
});

test("summary stage gives a concrete recommendation when a direction is available", async () => {
  const result = await resolveCareerTurn({
    runtime: {
      currentState: "summary",
      summaryPrepared: true,
    },
    directionCandidates: [
      {
        title: "Abikokk",
        rationale: ["Sul on tugev meeskonnatoo ja tempoka tootamise kogemus."],
      },
    ],
  });

  assert.equal(result.response?.kind, "summary");
  assert.match(
    (result.response?.bullets || []).join("\n"),
    /Abikokk/
  );
  assert.match(
    (result.response?.bullets || []).join("\n"),
    /meeskonnatoo/i
  );
});
