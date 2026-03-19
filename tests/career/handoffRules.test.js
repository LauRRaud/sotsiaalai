import test from "node:test";
import assert from "node:assert/strict";

import {
  createCareerHandoffReason,
  evaluateCareerHandoff,
  hasCareerImmediateSafetyRisk
} from "../../lib/career/handoffRules.js";

test("handoff triggers for immediate safety risk", () => {
  const result = evaluateCareerHandoff({
    message: "Ma tahan ära surra ja olukord on vahetu oht."
  });

  assert.equal(result.shouldHandoff, true);
  assert.equal(result.requiresImmediateAction, true);
  assert.equal(result.severity, "critical");
  assert.equal(hasCareerImmediateSafetyRisk({ message: "I want to kill myself" }), true);
});

test("handoff triggers when minor testing consent is unclear", () => {
  const result = evaluateCareerHandoff({
    profile: {
      identity: {
        minor: {
          value: true,
          source: "from_user",
          status: "confirmed"
        }
      }
    },
    requestedTesting: true
  });

  assert.equal(result.shouldHandoff, true);
  assert.equal(result.reasons[0].code, "minor_consent_unclear");
});

test("handoff can capture legal and official confirmation constraints together", () => {
  const result = evaluateCareerHandoff({
    message: "Kas mul on seaduslik õigus sellele toetusele ja kas see info vajab ametlikku kinnitust?"
  });

  const reasonCodes = result.reasons.map((item) => item.code);
  assert.equal(reasonCodes.includes("legal_or_formal_rights"), true);
  assert.equal(reasonCodes.includes("official_service_eligibility"), true);
  assert.equal(reasonCodes.includes("official_source_or_partner_confirmation"), true);
});

test("handoff triggers for special needs and evidence insufficiency", () => {
  const result = evaluateCareerHandoff({
    message: "Mul on erivajadus ja ligipääs peab olema tagatud.",
    evidenceInsufficient: true
  });

  const reasonCodes = result.reasons.map((item) => item.code);
  assert.equal(reasonCodes.includes("special_needs_human_assessment"), true);
  assert.equal(reasonCodes.includes("evidence_insufficient_for_safe_guidance"), true);
});

test("createCareerHandoffReason returns structured metadata", () => {
  const reason = createCareerHandoffReason("digital_service_quality_limit", {
    note: "Audio lag prevents reliable conversation."
  });

  assert.equal(reason.severity, "medium");
  assert.equal(reason.requiresHumanReview, false);
  assert.match(reason.note, /Audio lag/);
});
