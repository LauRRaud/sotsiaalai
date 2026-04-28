import test from "node:test";
import assert from "node:assert/strict";

import {
  buildSourcePackageWhere,
  computeSourcePackageReviewFlags,
  listSourcePackageSnapshots,
  reviewSourcePackageSnapshot,
  serializeSourcePackageSnapshot
} from "../../lib/admin/rag/sourcePackages/service.js";

function snapshotFixture(overrides = {}) {
  return {
    id: "snapshot-1",
    packageId: "jogeva_vald_service_koduteenus_package",
    canonicalItemId: "jogeva_vald_service_koduteenus",
    municipalityId: "jogeva_vald",
    packageType: "kov_service",
    title: "Koduteenus",
    status: "needs_review",
    reviewStatus: "pending",
    confidence: "medium",
    missingSections: ["forms", "contacts", "legal_basis"],
    packageHash: "hash-1",
    lastBuiltAt: new Date("2026-04-28T10:00:00.000Z"),
    lastChecked: "2026-04-28",
    version: 1,
    active: true,
    createdAt: new Date("2026-04-28T10:00:00.000Z"),
    updatedAt: new Date("2026-04-28T10:00:00.000Z"),
    reviewedAt: null,
    reviewedBy: null,
    reviewNote: null,
    sectionSummary: {
      description: {
        count: 1,
        source_ids: ["service-info"],
        excerpt: "This long excerpt must not leave the service serializer."
      }
    },
    sourceMembership: [
      {
        source_id: "service-info",
        source_type: "kov_service_info",
        collection_id: "kov_services",
        resource_type: "service_page",
        municipality_id: "jogeva_vald",
        source_status: "active",
        historical: false,
        sections: ["description", "application"],
        evidence_allowed: true,
        evidence_strength: "strong",
        evidenceText: "This long source excerpt must not be returned.",
        prompt: "hidden prompt",
        userMessage: "hidden user text"
      }
    ],
    ...overrides
  };
}

function matchesValue(rowValue, expected) {
  if (expected && typeof expected === "object" && "not" in expected) {
    return rowValue !== expected.not;
  }
  return rowValue === expected;
}

function createFakeClient(seedRows = []) {
  const rows = seedRows.map(row => ({ ...row }));
  const delegate = {
    rows,
    async count({ where = {} } = {}) {
      return rows.filter(row => matchesWhere(row, where)).length;
    },
    async findMany({ where = {}, skip = 0, take = 50 } = {}) {
      return rows.filter(row => matchesWhere(row, where)).slice(skip, skip + take);
    },
    async findUnique({ where = {} } = {}) {
      return rows.find(row => matchesWhere(row, where)) || null;
    },
    async update({ where = {}, data = {} } = {}) {
      const row = rows.find(item => matchesWhere(item, where));
      if (!row) {
        const error = new Error("Record not found");
        error.code = "P2025";
        throw error;
      }
      Object.assign(row, data, { updatedAt: new Date("2026-04-28T11:00:00.000Z") });
      return row;
    }
  };
  return { sourcePackageSnapshot: delegate, rows };
}

function matchesWhere(row, where = {}) {
  return Object.entries(where).every(([key, value]) => matchesValue(row[key], value));
}

test("serializeSourcePackageSnapshot returns safe review data without prompt, user text, or excerpts", () => {
  const serialized = serializeSourcePackageSnapshot(snapshotFixture(), { detail: true });
  const text = JSON.stringify(serialized);

  assert.equal(serialized.reviewStatus, "pending");
  assert.deepEqual(serialized.reviewFlags, {
    missing_forms: true,
    missing_contacts: true,
    missing_legal_basis: true,
    missing_fees: false,
    missing_deadlines: false,
    package_conflict: false,
    invalid_current_evidence: false
  });
  assert.equal(text.includes("hidden prompt"), false);
  assert.equal(text.includes("hidden user text"), false);
  assert.equal(text.includes("long source excerpt"), false);
  assert.equal(text.includes("long excerpt"), false);
});

test("buildSourcePackageWhere supports review, status, active, and needsReview filters", () => {
  assert.deepEqual(buildSourcePackageWhere({ reviewStatus: "pending" }), { reviewStatus: "pending" });
  assert.deepEqual(buildSourcePackageWhere({ status: "needs_review" }), { status: "needs_review" });
  assert.deepEqual(buildSourcePackageWhere({ active: "true" }), { active: true });
  assert.deepEqual(buildSourcePackageWhere({ needsReview: "true" }), { status: "needs_review" });
  assert.deepEqual(buildSourcePackageWhere({ needsReview: "false" }), { status: { not: "needs_review" } });
});

test("listSourcePackageSnapshots applies reviewStatus and status filters", async () => {
  const client = createFakeClient([
    snapshotFixture({ id: "pending", reviewStatus: "pending", status: "needs_review" }),
    snapshotFixture({ id: "reviewed", reviewStatus: "reviewed", status: "active" })
  ]);

  const pending = await listSourcePackageSnapshots({ reviewStatus: "pending" }, client);
  const needsReview = await listSourcePackageSnapshots({ status: "needs_review" }, client);

  assert.equal(pending.total, 1);
  assert.equal(pending.items[0].id, "pending");
  assert.equal(needsReview.total, 1);
  assert.equal(needsReview.items[0].id, "pending");
});

test("mark_reviewed sets review metadata without changing automated package status", async () => {
  const client = createFakeClient([snapshotFixture()]);
  const reviewed = await reviewSourcePackageSnapshot("snapshot-1", "mark_reviewed", {
    reviewedBy: "admin@example.test",
    reviewNote: "Checked in admin."
  }, client);

  assert.equal(reviewed.reviewStatus, "reviewed");
  assert.equal(reviewed.status, "needs_review");
  assert.equal(reviewed.reviewedBy, "admin@example.test");
  assert.equal(reviewed.reviewNote, "Checked in admin.");
  assert.ok(reviewed.reviewedAt);
  assert.equal(client.rows[0].active, true);
});

test("archive sets reviewStatus archived, status archived, and active false", async () => {
  const client = createFakeClient([snapshotFixture()]);
  const archived = await reviewSourcePackageSnapshot("snapshot-1", "archive", {
    reviewedBy: "admin@example.test"
  }, client);

  assert.equal(archived.reviewStatus, "archived");
  assert.equal(archived.status, "archived");
  assert.equal(archived.active, false);
  assert.equal(archived.reviewedBy, "admin@example.test");
});

test("computeSourcePackageReviewFlags detects package conflict and invalid current evidence", () => {
  const flags = computeSourcePackageReviewFlags(snapshotFixture({
    missingSections: ["fees", "deadlines"],
    sourceMembership: [
      {
        source_id: "service-info",
        municipality_id: "jogeva_vald",
        source_status: "active",
        historical: false,
        sections: ["description"],
        evidence_allowed: true
      },
      {
        source_id: "wrong-municipality",
        municipality_id: "tartu_linn",
        source_status: "archived",
        historical: true,
        sections: ["contacts"],
        evidence_allowed: false
      }
    ]
  }));

  assert.equal(flags.missing_fees, true);
  assert.equal(flags.missing_deadlines, true);
  assert.equal(flags.package_conflict, true);
  assert.equal(flags.invalid_current_evidence, true);
});
