import test from "node:test";
import assert from "node:assert/strict";

import { buildPreInquiryAssessment } from "../../lib/preInquiriesAssessment.js";

test("pre-inquiry assessment start asks questions before matching contacts", () => {
  const assessment = buildPreInquiryAssessment({
    situation: "Soovin alustada abivajaduse eelkaardistust.",
    assistantMessage: "Soovin alustada abivajaduse eelkaardistust."
  });

  assert.equal(assessment.assessmentMode, "PRE_ASSESSMENT");
  assert.equal(assessment.needsMoreInput, true);
  assert.equal(assessment.suggestedNextSteps, "ASK_DETAILS");
  assert.deepEqual(assessment.lifeDomains, []);
  assert.deepEqual(assessment.targetGroups, []);
  assert.ok(assessment.clarifyingQuestions.some((question) => question.includes("KOV-is")));
  assert.ok(assessment.clarifyingQuestions.some((question) => question.includes("kirja KOV")));
});

test("pre-inquiry assessment maps care burden to STAR2-aligned domains", () => {
  const assessment = buildPreInquiryAssessment({
    topic: "Ema hooldusvajadus",
    situation: "Mu 82-aastane ema vajab abi pesemisel, toidu tegemisel ja kodus liikumisel. Hooldan teda üksi ja ei tea, kas pöörduda KOV-i või teenuseosutaja poole."
  });

  assert.equal(assessment.assessmentMode, "PRE_ASSESSMENT");
  assert.deepEqual(assessment.lifeDomains, [
    "füüsiline tervis",
    "igapäevaelu toimingud"
  ]);
  assert.deepEqual(assessment.targetGroups, [
    "eakas inimene",
    "lähedane või hooldaja"
  ]);
  assert.equal(assessment.suggestedNextSteps, "BOTH");
  assert.ok(assessment.clarifyingQuestions.some((question) => question.includes("igapäevatoimingutes")));
  assert.ok(assessment.warnings.some((warning) => warning.includes("ei ole ametlik abivajaduse hindamine")));
});

test("pre-inquiry assessment flags child protection direction separately", () => {
  const assessment = buildPreInquiryAssessment({
    situation: "Kool andis teada, et lapse turvalisuse pärast on mure ja vanem ei tule kodus toime."
  });

  assert.deepEqual(assessment.lifeDomains, [
    "lapse heaolu ja pere"
  ]);
  assert.deepEqual(assessment.targetGroups, [
    "laps ja pere"
  ]);
  assert.equal(assessment.suggestedNextSteps, "CHILD_PROTECTION");
});

test("pre-inquiry assessment adds crisis warning for immediate danger", () => {
  const assessment = buildPreInquiryAssessment({
    situation: "Kodus on vahetu vägivalla oht ja inimene kardab oma turvalisuse pärast."
  });

  assert.equal(assessment.urgencyLevel, "URGENT");
  assert.ok(assessment.warnings.some((warning) => warning.includes("112")));
});
