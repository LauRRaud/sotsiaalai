import test from "node:test";
import assert from "node:assert/strict";

import { buildRuntimeSourcePackages } from "../../lib/chat/sourcePackages.js";

test("buildRuntimeSourcePackages groups Jogeva KOV service evidence by canonical item and municipality", () => {
  const packages = buildRuntimeSourcePackages([
    {
      id: "service-info",
      title: "Koduteenus",
      sourceType: "kov_service_info",
      collectionId: "kov_services",
      itemType: "service",
      canonicalItemId: "jogeva_vald_service_koduteenus",
      municipalityId: "jogeva_vald",
      municipalityName: "Jogeva vald",
      sectionsPresent: ["description", "eligibility", "application"],
      sourceStatus: "active",
      lastChecked: "2026-04-28",
      bodies: ["This text must not be copied into the package trace."]
    },
    {
      id: "service-form",
      title: "Koduteenuse taotlus",
      sourceType: "application_form",
      collectionId: "kov_services",
      itemType: "service",
      canonicalItemId: "jogeva_vald_service_koduteenus",
      municipalityId: "jogeva_vald",
      municipalityName: "Jogeva vald",
      sourceStatus: "active",
      lastChecked: "2026-04-28"
    },
    {
      id: "service-contact",
      title: "Sotsiaalosakonna kontakt",
      sourceType: "official_contact",
      collectionId: "kov_services",
      itemType: "service",
      canonicalItemId: "jogeva_vald_service_koduteenus",
      municipalityId: "jogeva_vald",
      municipalityName: "Jogeva vald",
      sourceStatus: "active",
      lastChecked: "2026-04-28"
    },
    {
      id: "kov-regulation",
      title: "Jogeva valla sotsiaalhoolekandelise abi andmise kord",
      sourceType: "kov_regulation",
      collectionId: "kov_regulations",
      canonicalItemId: "jogeva_vald_service_koduteenus",
      municipalityId: "jogeva_vald",
      municipalityName: "Jogeva vald",
      sourceStatus: "active",
      lastChecked: "2026-04-28"
    },
    {
      id: "wrong-municipality",
      title: "Vale KOV koduteenus",
      sourceType: "kov_service_info",
      collectionId: "kov_services",
      itemType: "service",
      canonicalItemId: "jogeva_vald_service_koduteenus",
      municipalityId: "tartu_linn",
      municipalityName: "Tartu linn",
      sourceStatus: "active"
    },
    {
      id: "journal-background",
      title: "Koduteenuse metoodika",
      sourceType: "journal_article",
      collectionId: "sotsiaaltoo_articles",
      canonicalItemId: "jogeva_vald_service_koduteenus",
      municipalityId: "jogeva_vald"
    }
  ]);

  const jogevaPackage = packages.find(pkg => pkg.municipality_id === "jogeva_vald");
  assert.ok(jogevaPackage);
  assert.equal(jogevaPackage.package_id, "jogeva_vald_service_koduteenus_package");
  assert.equal(jogevaPackage.package_type, "kov_service");
  assert.equal(jogevaPackage.canonical_item_id, "jogeva_vald_service_koduteenus");
  assert.equal(jogevaPackage.municipality_id, "jogeva_vald");
  assert.equal(jogevaPackage.confidence, "high");
  assert.equal(jogevaPackage.section_counts.description, 1);
  assert.equal(jogevaPackage.section_counts.forms, 1);
  assert.equal(jogevaPackage.section_counts.contacts, 1);
  assert.equal(jogevaPackage.sections.description[0].municipality_id, "jogeva_vald");

  assert.deepEqual(jogevaPackage.sections.description.map(source => source.source_id), ["service-info"]);
  assert.deepEqual(jogevaPackage.sections.eligibility.map(source => source.source_id), ["service-info"]);
  assert.deepEqual(jogevaPackage.sections.application.map(source => source.source_id), ["service-info"]);
  assert.deepEqual(jogevaPackage.sections.forms.map(source => source.source_id), ["service-form"]);
  assert.deepEqual(jogevaPackage.sections.contacts.map(source => source.source_id), ["service-contact"]);
  assert.deepEqual(jogevaPackage.sections.legal_basis.map(source => source.source_id), ["kov-regulation"]);
  assert.equal(jogevaPackage.source_ids.includes("wrong-municipality"), false);
  assert.equal(jogevaPackage.source_ids.includes("journal-background"), false);
  assert.equal(JSON.stringify(jogevaPackage).includes("This text must not be copied"), false);
});
