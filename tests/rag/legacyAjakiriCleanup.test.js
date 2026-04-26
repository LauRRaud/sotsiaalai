import test from "node:test";
import assert from "node:assert/strict";

import {
  buildLegacyAjakiriCleanupPlan,
  extractAjakiriYear,
  isLegacyAjakiriFileDocument,
  normalizeAjakiriTitle
} from "../../lib/rag/legacyAjakiriCleanup.js";

test("normalizes ajakiri titles for duplicate matching", () => {
  assert.equal(
    normalizeAjakiriTitle("Tehisintellekt sotsiaaltöös: praktika, kaalutlused ja väärtuspõhised piirid"),
    "tehisintellekt sotsiaaltoos praktika kaalutlused ja vaartuspohised piirid"
  );
});

test("detects legacy ajakiri file documents but not article ingest documents", () => {
  assert.equal(isLegacyAjakiriFileDocument({
    docId: "sotsiaaltoo-2-2025-old",
    title: "Artikkel",
    type: "FILE",
    source_type: "file",
    source_file_type: "unknown",
    collection_family: "ajakiri_sotsiaaltoo"
  }), true);

  assert.equal(isLegacyAjakiriFileDocument({
    docId: "sotsiaaltoo-2-2025-new",
    title: "Artikkel",
    source_type: "journal_article",
    source_file_type: "article_ingest",
    collection_family: "ajakiri_sotsiaaltoo"
  }), false);

  assert.equal(isLegacyAjakiriFileDocument({
    docId: "kov-tartu-koduteenus",
    title: "Koduteenus",
    type: "FILE",
    source_type: "file",
    collection_family: "kov_web"
  }), false);
});

test("extracts year from explicit year or document identity", () => {
  assert.equal(extractAjakiriYear({ year: "2025" }), 2025);
  assert.equal(extractAjakiriYear({ docId: "sotsiaaltoo-1-2023-hooldekodude-rahastamine" }), 2023);
});

test("builds safe delete_duplicate plan when article ingest replacement exists", () => {
  const plan = buildLegacyAjakiriCleanupPlan([
    {
      docId: "sotsiaaltoo-2-2025-tehisintellekt-old",
      title: "Tehisintellekt sotsiaaltöös: praktika, kaalutlused ja väärtuspõhised piirid",
      source_type: "file",
      source_file_type: "unknown",
      collection_family: "ajakiri_sotsiaaltoo"
    },
    {
      docId: "sotsiaaltoo-2-2025-artikkel-12-tehisintellekt-sotsiaaltoos",
      source_id: "sotsiaaltoo-2-2025-artikkel-12-tehisintellekt-sotsiaaltoos",
      title: "Tehisintellekt sotsiaaltöös: praktika, kaalutlused ja väärtuspõhised piirid",
      year: 2025,
      source_type: "journal_article",
      source_file_type: "article_ingest",
      collection_family: "ajakiri_sotsiaaltoo"
    }
  ]);

  assert.equal(plan.summary.article_ingest_documents, 1);
  assert.equal(plan.summary.legacy_ajakiri_file_documents, 1);
  assert.equal(plan.summary.delete_duplicate, 1);
  assert.equal(plan.actions[0].action, "delete_duplicate");
  assert.equal(plan.actions[0].replacement_doc_id, "sotsiaaltoo-2-2025-artikkel-12-tehisintellekt-sotsiaaltoos");
  assert.equal(plan.actions[0].match_reason, "normalized_title_and_year");
});

test("marks unmatched legacy ajakiri files for review instead of deletion", () => {
  const plan = buildLegacyAjakiriCleanupPlan([
    {
      docId: "sotsiaaltoo-1-2021-old-only",
      title: "Pikaajaline hooldus Sloveenias: probleemid ja tulevikusuunad",
      source_type: "file",
      source_file_type: "unknown",
      collection_family: "ajakiri_sotsiaaltoo"
    }
  ]);

  assert.equal(plan.summary.delete_duplicate || 0, 0);
  assert.equal(plan.summary.review_legacy, 1);
  assert.equal(plan.actions[0].action, "review_legacy");
  assert.equal(plan.actions[0].reason, "replacement_not_found");
});

test("keeps ambiguous replacements in review", () => {
  const title = "Sama pealkiri";
  const plan = buildLegacyAjakiriCleanupPlan([
    {
      docId: "sotsiaaltoo-old-2024",
      title,
      source_type: "file",
      source_file_type: "unknown",
      collection_family: "ajakiri_sotsiaaltoo"
    },
    {
      docId: "sotsiaaltoo-new-2023",
      title,
      year: 2023,
      source_type: "journal_article",
      source_file_type: "article_ingest",
      collection_family: "ajakiri_sotsiaaltoo"
    },
    {
      docId: "sotsiaaltoo-new-2025",
      title,
      year: 2025,
      source_type: "journal_article",
      source_file_type: "article_ingest",
      collection_family: "ajakiri_sotsiaaltoo"
    }
  ]);

  assert.equal(plan.summary.delete_duplicate || 0, 0);
  assert.equal(plan.summary.review_legacy, 1);
  assert.equal(plan.actions[0].reason, "ambiguous_replacement");
  assert.equal(plan.actions[0].replacement_candidates.length, 2);
});
