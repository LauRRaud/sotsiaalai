import test from "node:test";
import assert from "node:assert/strict";

import {
  inferKovItemRagSourceType,
  isKnownRagSourceStatus,
  isKnownRagSourceType,
  mapKovItemStatusToRagSourceStatus,
  validateRagSourceMetadataContract
} from "../../lib/rag/sourceMetadata.js";

test("known RAG source types and statuses cover V1 contract values", () => {
  assert.equal(isKnownRagSourceType("kov_service_info"), true);
  assert.equal(isKnownRagSourceType("application_form"), true);
  assert.equal(isKnownRagSourceType("official_contact"), true);
  assert.equal(isKnownRagSourceType("journal_article"), true);
  assert.equal(isKnownRagSourceType("unknown_custom_type"), false);

  assert.equal(isKnownRagSourceStatus("active"), true);
  assert.equal(isKnownRagSourceStatus("stale"), true);
  assert.equal(isKnownRagSourceStatus("draft"), false);
});

test("KOV item metadata maps to evidence-aware RAG source types", () => {
  assert.equal(inferKovItemRagSourceType("service"), "kov_service_info");
  assert.equal(inferKovItemRagSourceType("benefit"), "kov_service_info");
  assert.equal(inferKovItemRagSourceType("form"), "application_form");
  assert.equal(inferKovItemRagSourceType("contact"), "official_contact");
  assert.equal(inferKovItemRagSourceType("resource", "guidance"), "state_guide");
  assert.equal(inferKovItemRagSourceType("resource", "provider"), "partner_service_info");
});

test("KOV item status maps to RAG source status", () => {
  assert.equal(mapKovItemStatusToRagSourceStatus("active"), "active");
  assert.equal(mapKovItemStatusToRagSourceStatus("ended"), "inactive");
  assert.equal(mapKovItemStatusToRagSourceStatus("inactive"), "inactive");
  assert.equal(mapKovItemStatusToRagSourceStatus("unclear"), "unknown");
});

test("RAG source metadata contract enforces critical V2 fields", () => {
  const valid = validateRagSourceMetadataContract({
    source_id: "tartu_koduteenus",
    document_id: "kov::tartu::item::koduteenus",
    title: "Koduteenus",
    source_type: "kov_service_info",
    authority: "KOV",
    audience: ["CLIENT", "SOCIAL_WORKER"],
    language: "et",
    municipality_id: "tartu_linn",
    last_checked: "2026-04-25",
    historical: false,
    source_status: "active"
  }, {
    requireMunicipality: true
  });

  assert.equal(valid.ok, true);
  assert.deepEqual(valid.errors, []);
  assert.ok(valid.warnings.some(item => item.includes("content_hash")));

  const invalid = validateRagSourceMetadataContract({
    source_id: "bad",
    document_id: "doc",
    title: "Bad",
    source_type: "journal_article",
    authority: "editorial",
    audience: ["CLIENT"],
    language: "et",
    last_checked: "2026-04-25",
    historical: true,
    source_status: "active"
  }, {
    label: "source",
    requireMunicipality: true
  });

  assert.equal(invalid.ok, false);
  assert.ok(invalid.errors.includes("source.municipality_id: missing required RAG metadata"));
});
