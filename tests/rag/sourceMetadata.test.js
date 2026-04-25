import test from "node:test";
import assert from "node:assert/strict";

import {
  inferKovItemRagSourceType,
  isKnownRagSourceStatus,
  isKnownRagSourceType,
  mapKovItemStatusToRagSourceStatus
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
