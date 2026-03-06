import test from "node:test";
import assert from "node:assert/strict";

import { resolveDocumentTaskDecision } from "../../lib/chat/documentOrchestration.js";
import { REASONING_DEPTH, WORK_MODES } from "../../lib/chat/orchestrationPolicy.js";

test("resolveDocumentTaskDecision detects document workflow and builds task config", () => {
  const decision = resolveDocumentTaskDecision({
    message: "Aita mul koostada taotlus kiri vallale eesti keeles.",
    history: [],
    role: "CLIENT",
    replyLang: "et",
    sourceCount: 1
  });

  assert.equal(decision.isDocumentTask, true);
  assert.equal(decision.plan.mode, WORK_MODES.DOCUMENT_DRAFTING);
  assert.equal(decision.plan.reasoning, REASONING_DEPTH.MEDIUM);
  assert.equal(decision.taskConfig.artifactType, "LETTER_DRAFT");
  assert.equal(decision.taskConfig.language, "et");
});

test("resolveDocumentTaskDecision escalates reports to high reasoning", () => {
  const decision = resolveDocumentTaskDecision({
    message: "Aita mul koostada aruanne kliendijuhtumist ja tee pohjalik kokkuvote.",
    history: [],
    role: "SOCIAL_WORKER",
    replyLang: "et",
    sourceCount: 4,
    requestedThoroughness: true
  });

  assert.equal(decision.isDocumentTask, true);
  assert.equal(decision.plan.mode, WORK_MODES.REPORT_DRAFTING);
  assert.equal(decision.plan.reasoning, REASONING_DEPTH.HIGH);
  assert.equal(decision.taskConfig.artifactType, "REPORT_DRAFT");
});

test("resolveDocumentTaskDecision keeps non-document messages out of document workflow", () => {
  const decision = resolveDocumentTaskDecision({
    message: "Naita mulle sobivaid abipakkumisi Tallinnas.",
    history: [],
    role: "CLIENT",
    replyLang: "et"
  });

  assert.equal(decision.isDocumentTask, false);
  assert.equal(decision.plan, null);
  assert.equal(decision.taskConfig, null);
});
