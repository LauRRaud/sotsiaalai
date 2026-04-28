import test from "node:test";
import assert from "node:assert/strict";

import { buildPackageAwareContext } from "../../lib/chat/packageAwareContext.js";

test("buildPackageAwareContext creates compact package context and V3.2 trace signals", () => {
  const result = buildPackageAwareContext([
    {
      package_id: "jogeva_vald_service_koduteenus_package",
      canonical_item_id: "jogeva_vald_service_koduteenus",
      package_type: "kov_service",
      title: "Koduteenus",
      municipality_id: "jogeva_vald",
      municipality_name: "Jõgeva vald",
      confidence: "medium",
      missing_sections: ["forms", "contacts", "legal_basis", "fees", "deadlines"],
      sections: {
        description: [
          {
            source_id: "service-info",
            title: "Koduteenus",
            source_type: "kov_service_info",
            evidenceText: "Long source text must not appear."
          }
        ],
        eligibility: [],
        application: [],
        forms: [],
        contacts: [],
        legal_basis: []
      }
    }
  ]);

  assert.equal(result.used, true);
  assert.deepEqual(result.usedPackageIds, ["jogeva_vald_service_koduteenus_package"]);
  assert.deepEqual(result.missingSectionsUsed, ["contacts", "deadlines", "fees", "forms", "legal_basis"]);
  assert.deepEqual(result.packageDisplayedSourceIds, ["service-info"]);
  assert.equal(result.packageAnswerFlags.includes("missing_forms"), true);
  assert.equal(result.contextText.includes("SOURCE PACKAGE 1"), true);
  assert.equal(result.contextText.includes("vormid: missing"), true);
  assert.equal(result.contextText.includes("Long source text"), false);
});
