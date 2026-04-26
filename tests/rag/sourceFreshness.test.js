import test from "node:test";
import assert from "node:assert/strict";

import {
  assessSourceFreshness,
  summarizeHighRiskSourceFreshness,
  normalizeSourceMetadataForFreshness,
  summarizeFreshnessAudit
} from "../../lib/rag/sourceFreshness.js";

const NOW = new Date("2026-04-26T12:00:00Z");

test("normalizes RagDocument metadata for freshness audit", () => {
  const normalized = normalizeSourceMetadataForFreshness({
    id: "doc_1",
    title: "Koduteenus",
    type: "document",
    status: "active",
    sourceUrl: "https://example.test/koduteenus",
    metadata: {
      source_id: "tartu_koduteenus",
      document_id: "kov::tartu::koduteenus",
      source_type: "kov_service_info",
      source_status: "active",
      last_checked: "2026-04-25",
      municipality_id: "tartu_linn",
      sections_present: ["description", "forms"],
      related_forms_count: 1
    }
  });

  assert.equal(normalized.source_id, "tartu_koduteenus");
  assert.equal(normalized.document_id, "kov::tartu::koduteenus");
  assert.equal(normalized.title, "Koduteenus");
  assert.equal(normalized.source_type, "kov_service_info");
  assert.equal(normalized.last_checked, "2026-04-25");
  assert.equal(normalized.url, "https://example.test/koduteenus");
  assert.deepEqual(normalized.sections_present, ["description", "forms"]);
  assert.equal(normalized.related_forms_count, 1);
});

test("flags stale high-priority KOV forms as errors", () => {
  const result = assessSourceFreshness({
    source_id: "tartu_hooldajatoetus_vorm",
    title: "Hooldajatoetuse vorm",
    source_type: "application_form",
    source_status: "active",
    last_checked: "2025-10-01",
    historical: false
  }, {
    now: NOW
  });

  assert.equal(result.freshness_status, "stale");
  assert.equal(result.severity, "error");
  assert.ok(result.reasons.includes("last_checked_stale"));
  assert.equal(result.max_age_days, 90);
});

test("keeps background historical articles out of current freshness errors", () => {
  const result = assessSourceFreshness({
    source_id: "sotsiaaltoo_2017_voimaluste_kohvik",
    title: "Voimaluste kohvik",
    source_type: "journal_article",
    source_status: "active",
    historical: true
  }, {
    now: NOW
  });

  assert.equal(result.freshness_status, "missing_last_checked");
  assert.equal(result.severity, "warning");
  assert.equal(result.current_evidence, false);
});

test("summarizes freshness audit counts", () => {
  const result = summarizeFreshnessAudit([
    {
      source_id: "ok",
      title: "Teenuseinfo",
      source_type: "kov_service_info",
      source_status: "active",
      last_checked: "2026-04-20",
      url: "https://example.test/koduteenus"
    },
    {
      source_id: "stale",
      title: "Kontakt",
      source_type: "official_contact",
      source_status: "active",
      last_checked: "2025-12-01",
      url: "https://example.test/kontakt"
    },
    {
      source_id: "missing",
      title: "Vorm",
      source_type: "application_form",
      source_status: "active"
    }
  ], {
    now: NOW
  });

  assert.equal(result.ok, false);
  assert.equal(result.summary.total, 3);
  assert.equal(result.summary.ok, 1);
  assert.equal(result.summary.stale, 1);
  assert.equal(result.summary.missing_last_checked, 1);
  assert.equal(result.summary.errors, 2);
});

test("flags invalid URLs and non-official contact sources", () => {
  const result = summarizeFreshnessAudit([
    {
      source_id: "contact_article",
      title: "Kontakt: teenusepakkuja",
      source_type: "journal_article",
      source_status: "active",
      last_checked: "2026-04-20",
      url: "not-a-url"
    }
  ], {
    now: NOW
  });

  assert.equal(result.summary.warnings, 1);
  assert.equal(result.items[0].freshness_status, "invalid_url");
  assert.ok(result.items[0].reasons.includes("invalid_url"));
  assert.ok(result.items[0].reasons.includes("contact_not_official_source"));
  assert.equal(result.summary.reasons.invalid_url, 1);
});

test("flags KOV service packages without a form source", () => {
  const result = summarizeFreshnessAudit([
    {
      source_id: "tartu_koduteenus",
      title: "Koduteenus",
      source_type: "kov_service_info",
      source_status: "active",
      last_checked: "2026-04-20",
      url: "https://example.test/koduteenus",
      canonical_item_id: "tartu_koduteenus",
      sections_present: ["description", "application", "forms"],
      related_forms_count: 1
    },
    {
      source_id: "tartu_koduteenus_contact",
      title: "Koduteenuse kontakt",
      source_type: "official_contact",
      source_status: "active",
      last_checked: "2026-04-20",
      url: "https://example.test/kontakt",
      canonical_item_id: "tartu_koduteenus"
    }
  ], {
    now: NOW
  });

  const service = result.items.find(item => item.source_id === "tartu_koduteenus");
  assert.equal(service.freshness_status, "kov_service_missing_form_source");
  assert.equal(service.severity, "warning");
  assert.ok(service.reasons.includes("kov_service_missing_form_source"));
  assert.equal(result.summary.reasons.kov_service_missing_form_source, 1);
});

test("does not infer missing KOV form source without package form signals", () => {
  const result = summarizeFreshnessAudit([
    {
      source_id: "tartu_koduteenus",
      title: "Koduteenus",
      source_type: "kov_service_info",
      source_status: "active",
      last_checked: "2026-04-20",
      url: "https://example.test/koduteenus",
      canonical_item_id: "tartu_koduteenus",
      sections_present: ["description", "application"]
    }
  ], {
    now: NOW
  });

  const service = result.items.find(item => item.source_id === "tartu_koduteenus");
  assert.equal(service.freshness_status, "ok");
  assert.equal(result.summary.reasons.kov_service_missing_form_source, undefined);
});

test("does not flag KOV service package when a form source exists", () => {
  const result = summarizeFreshnessAudit([
    {
      source_id: "tartu_koduteenus",
      title: "Koduteenus",
      source_type: "kov_service_info",
      source_status: "active",
      last_checked: "2026-04-20",
      url: "https://example.test/koduteenus",
      canonical_item_id: "tartu_koduteenus",
      sections_present: ["description", "application", "forms"],
      related_forms_count: 1
    },
    {
      source_id: "tartu_koduteenus_form",
      title: "Koduteenuse taotlus",
      source_type: "application_form",
      source_status: "active",
      last_checked: "2026-04-20",
      url: "https://example.test/taotlus",
      canonical_item_id: "tartu_koduteenus"
    }
  ], {
    now: NOW
  });

  const service = result.items.find(item => item.source_id === "tartu_koduteenus");
  assert.equal(service.freshness_status, "ok");
  assert.equal(service.severity, "info");
  assert.equal(result.summary.reasons.kov_service_missing_form_source, undefined);
});

test("flags KOV service packages with contact signals but no official contact source", () => {
  const result = summarizeFreshnessAudit([
    {
      source_id: "tartu_koduteenus",
      title: "Koduteenus",
      source_type: "kov_service_info",
      source_status: "active",
      last_checked: "2026-04-20",
      url: "https://example.test/koduteenus",
      canonical_item_id: "tartu_koduteenus",
      sections_present: ["description", "contacts"],
      related_contacts_count: 1
    },
    {
      source_id: "tartu_koduteenus_article",
      title: "Koduteenuse taust",
      source_type: "journal_article",
      source_status: "active",
      last_checked: "2026-04-20",
      url: "https://example.test/artikkel",
      canonical_item_id: "tartu_koduteenus"
    }
  ], {
    now: NOW
  });

  const service = result.items.find(item => item.source_id === "tartu_koduteenus");
  assert.equal(service.freshness_status, "kov_service_missing_official_contact_source");
  assert.equal(service.severity, "warning");
  assert.ok(service.reasons.includes("kov_service_missing_official_contact_source"));
  assert.equal(result.summary.reasons.kov_service_missing_official_contact_source, 1);
});

test("summarizes stale source rate for high-risk traces", () => {
  const freshness = summarizeFreshnessAudit([
    {
      source_id: "law-ok",
      title: "Seadus",
      source_type: "national_law",
      source_status: "active",
      last_checked: "2026-04-20",
      url: "https://example.test/law"
    },
    {
      source_id: "kov-stale",
      title: "KOV teenus",
      source_type: "kov_service_info",
      source_status: "active",
      last_checked: "2025-01-01",
      url: "https://example.test/kov"
    }
  ], {
    now: NOW
  });

  const result = summarizeHighRiskSourceFreshness([
    {
      data: {
        rag_risk_level: "high",
        displayed_source_ids: ["law-ok"]
      }
    },
    {
      data: {
        rag_risk_level: "high",
        displayed_source_ids: ["kov-stale"]
      }
    },
    {
      data: {
        rag_risk_level: "medium",
        displayed_source_ids: ["kov-stale"]
      }
    },
    {
      data: {
        rag_risk_level: "high",
        displayed_source_ids: ["missing-source"]
      }
    }
  ], freshness.items);

  assert.equal(result.summary.high_risk_traces, 3);
  assert.equal(result.summary.high_risk_with_displayed_sources, 3);
  assert.equal(result.summary.stale_source_responses, 1);
  assert.equal(result.summary.unknown_source_responses, 1);
  assert.equal(result.summary.stale_source_rate, 1 / 3);
  assert.equal(result.summary.unknown_source_freshness_rate, 1 / 3);
  assert.equal(result.summary.displayed_source_stale_rate, 1 / 3);
  assert.equal(result.summary.displayed_unknown_source_rate, 1 / 3);
  assert.equal(result.summary.issue_reasons.last_checked_stale, 1);
});

test("keeps high-risk answer source risk separate from displayed source risk", () => {
  const freshness = summarizeFreshnessAudit([
    {
      source_id: "fresh-displayed",
      title: "Kuvatav seadus",
      source_type: "national_law",
      source_status: "active",
      last_checked: "2026-04-20",
      url: "https://example.test/fresh"
    },
    {
      source_id: "stale-answer",
      title: "Vana KOV teenus",
      source_type: "kov_service_info",
      source_status: "active",
      last_checked: "2025-01-01",
      url: "https://example.test/stale"
    }
  ], {
    now: NOW
  });

  const result = summarizeHighRiskSourceFreshness([
    {
      data: {
        rag_risk_level: "high",
        answer_source_ids: ["stale-answer"],
        displayed_source_ids: ["fresh-displayed"]
      }
    }
  ], freshness.items);

  assert.equal(result.summary.high_risk_with_answer_sources, 1);
  assert.equal(result.summary.high_risk_with_displayed_sources, 1);
  assert.equal(result.summary.stale_answer_source_responses, 1);
  assert.equal(result.summary.stale_displayed_source_responses, 0);
  assert.equal(result.summary.answer_source_stale_rate, 1);
  assert.equal(result.summary.displayed_source_stale_rate, 0);
  assert.equal(result.summary.stale_source_rate, 0);
  assert.ok(result.issues.some(item => item.layer === "answer" && item.source_id === "stale-answer"));
});
