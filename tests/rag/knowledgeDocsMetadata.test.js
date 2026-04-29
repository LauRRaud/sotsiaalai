import assert from "node:assert/strict";
import test from "node:test";

import {
  buildKnowledgeDocIngestPayload,
  DISALLOWED_CURRENT_EVIDENCE_CLAIMS,
  upgradeKnowledgeMetadata,
  validateKnowledgeMetadata
} from "../../scripts/lib/knowledge-docs.mjs";

test("knowledge guideline metadata stays separate from KOV service and legal layers", () => {
  const metadata = upgradeKnowledgeMetadata({
    docId: "sm-terviseprobleemiga-laste-perede-hea-tava-2025",
    title: "Terviseprobleemiga laste ja nende perede toetamise hea tava",
    source_path: "Terviseprobleemiga laste ja nende perede toetamise hea tava 12.122025_VEEB.pdf"
  });
  const validation = validateKnowledgeMetadata(metadata, { root: process.cwd() });
  const payload = buildKnowledgeDocIngestPayload(metadata);

  assert.equal(validation.ok, true);
  assert.equal(metadata.collection_id, "national_guidelines");
  assert.equal(metadata.source_type, "official_guideline");
  assert.equal(metadata.evidence_role, "practice_guidance");
  assert.notEqual(metadata.collection_id, "kov_services");
  assert.notEqual(metadata.evidence_role, "legal_basis");
  for (const claim of DISALLOWED_CURRENT_EVIDENCE_CLAIMS) {
    assert.equal(metadata.disallowed_claim_types.includes(claim), true);
  }

  assert.equal(payload.metadata.legal_basis, false);
  assert.equal(payload.metadata.collection_id, "national_guidelines");
  assert.equal(payload.chunks.length, metadata.sectionIndex.length);
  assert.equal(payload.chunks.every(chunk => chunk.metadata.legal_basis === false), true);
  assert.equal(payload.chunks.every(chunk => chunk.metadata.collection_id !== "kov_services"), true);
});

test("knowledge validator rejects guideline metadata that tries to act as legal or KOV evidence", () => {
  const metadata = upgradeKnowledgeMetadata({
    docId: "bad-guideline",
    title: "Bad guideline",
    source_path: "bad.pdf"
  });
  metadata.collection_id = "kov_services";
  metadata.evidence_role = "legal_basis";
  metadata.display_full_text = true;

  const validation = validateKnowledgeMetadata(metadata);
  assert.equal(validation.ok, false);
  assert.match(validation.errors.join("\n"), /kov_services/);
  assert.match(validation.errors.join("\n"), /legal_basis/);
  assert.match(validation.errors.join("\n"), /display_full_text/);
});
