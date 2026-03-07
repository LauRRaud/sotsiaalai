import test from "node:test";
import assert from "node:assert/strict";

import {
  buildDocumentGeneratedIntro,
  buildDocumentTaskAttachments,
  resolveDocumentTaskDecision
} from "../../lib/chat/documentOrchestration.js";
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

test("resolveDocumentTaskDecision does not auto-route client report wording into document flow", () => {
  const decision = resolveDocumentTaskDecision({
    message: "Mul on vaja aruannet oma olukorra kohta.",
    history: [],
    role: "CLIENT",
    replyLang: "et"
  });

  assert.equal(decision.isDocumentTask, false);
  assert.equal(decision.plan, null);
  assert.equal(decision.taskConfig, null);
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

test("document task attachments route workers to documents results and draft detail", () => {
  const attachments = buildDocumentTaskAttachments({
    replyLang: "et",
    role: "SOCIAL_WORKER",
    artifactId: "artifact-123"
  });

  assert.deepEqual(attachments, [
    { label: "Ava Dokumentide lehel", url: "/documents?artifacts=all#artifacts" },
    { label: "Ava mustand", url: "/documents/artifacts/artifact-123" },
    { label: "Ava agendireziimis", url: "/agendireziim?artifact=artifact-123" }
  ]);
});

test("document task attachments route clients only to agent mode results", () => {
  const attachments = buildDocumentTaskAttachments({
    replyLang: "et",
    role: "CLIENT",
    artifactId: "artifact-123"
  });

  assert.deepEqual(attachments, [
    { label: "Ava tulemus", url: "/agendireziim?artifact=artifact-123" },
    { label: "Ava Agendireziimi lehel", url: "/agendireziim" }
  ]);
});

test("document task attachments can include direct download links when artifact is downloadable", () => {
  const attachments = buildDocumentTaskAttachments({
    replyLang: "et",
    role: "SOCIAL_WORKER",
    artifactId: "artifact-123",
    downloadReady: true
  });

  assert.deepEqual(attachments, [
    { label: "Ava Dokumentide lehel", url: "/documents?artifacts=all#artifacts" },
    { label: "Ava mustand", url: "/documents/artifacts/artifact-123" },
    { label: "Laadi DOCX alla", url: "/api/documents/artifacts/artifact-123/download?format=docx" },
    { label: "Laadi PDF alla", url: "/api/documents/artifacts/artifact-123/download?format=pdf" },
    { label: "Ava agendireziimis", url: "/agendireziim?artifact=artifact-123" }
  ]);
});

test("generated intro tells each role where the draft appears", () => {
  assert.match(
    buildDocumentGeneratedIntro({ replyLang: "et", role: "SOCIAL_WORKER" }),
    /Dokumentide lehel/i
  );
  assert.match(
    buildDocumentGeneratedIntro({ replyLang: "et", role: "CLIENT" }),
    /Agendireziimi lehel/i
  );
});
