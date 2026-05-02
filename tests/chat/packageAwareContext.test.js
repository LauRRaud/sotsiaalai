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

test("buildPackageAwareContext anchors package selection to the requested service", () => {
  const result = buildPackageAwareContext([
    {
      package_id: "alutaguse_vald_service_asendushooldusteenus_package",
      canonical_item_id: "alutaguse_vald_service_asendushooldusteenus",
      package_type: "kov_service",
      title: "Asendushooldusteenus",
      municipality_id: "alutaguse_vald",
      sections: {
        description: [{ source_id: "alutaguse-asendushooldus", title: "Asendushooldusteenus" }],
        legal_basis: [{ source_id: "alutaguse-rt-koduteenus", title: "Sotsiaalhoolekandelise abi andmise kord § 7 Koduteenus" }]
      },
      source_ids: ["alutaguse-asendushooldus"],
      missing_sections: ["forms", "contacts", "legal_basis"]
    },
    {
      package_id: "alutaguse_vald_service_koduteenus_package",
      canonical_item_id: "alutaguse_vald_service_koduteenus",
      package_type: "kov_service",
      title: "Koduteenus",
      municipality_id: "alutaguse_vald",
      sections: {
        description: [{ source_id: "alutaguse-koduteenus", title: "Koduteenus" }]
      },
      source_ids: ["alutaguse-koduteenus"],
      missing_sections: ["forms", "contacts", "legal_basis"]
    },
    {
      package_id: "alutaguse_vald_service_isikliku_abistaja_teenus_package",
      canonical_item_id: "alutaguse_vald_service_isikliku_abistaja_teenus",
      package_type: "kov_service",
      title: "Isikliku abistaja teenus",
      municipality_id: "alutaguse_vald",
      sections: {
        description: [{ source_id: "alutaguse-isiklik-abistaja", title: "Isikliku abistaja teenus" }]
      },
      source_ids: ["alutaguse-isiklik-abistaja"],
      missing_sections: ["forms", "contacts", "legal_basis"]
    }
  ], {
    query: "kas alutaguse vallas pakutakse koduteenuseid?"
  });

  assert.equal(result.used, true);
  assert.deepEqual(result.usedPackageIds, ["alutaguse_vald_service_koduteenus_package"]);
  assert.deepEqual(result.packageDisplayedSourceIds, ["alutaguse-koduteenus"]);
  assert.equal(result.contextText.includes("Koduteenus"), true);
  assert.equal(result.contextText.includes("Asendushooldusteenus"), false);
  assert.equal(result.contextText.includes("Isikliku abistaja teenus"), false);
});
