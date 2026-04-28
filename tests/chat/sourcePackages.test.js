import test from "node:test";
import assert from "node:assert/strict";

import {
  buildRuntimeSourcePackages,
  normalizeSourcePackageCanonicalItemId
} from "../../lib/chat/sourcePackages.js";

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

test("buildRuntimeSourcePackages links related form contact and general KOV regulation evidence conservatively", () => {
  const packages = buildRuntimeSourcePackages([
    {
      id: "service-info",
      title: "Koduteenus",
      sourceType: "kov_service_info",
      itemType: "service",
      canonicalItemId: "jogeva_vald_service_koduteenus",
      municipalityId: "jogeva_vald",
      sectionsPresent: ["description", "eligibility", "application"],
      sourceStatus: "active"
    },
    {
      id: "related-form",
      title: "Sotsiaalabi taotlus",
      sourceType: "application_form",
      itemType: "form",
      canonicalItemId: "jogeva_vald_form_sotsiaalabi_taotlus",
      relatedCanonicalItemIds: ["jogeva_vald_service_koduteenus"],
      municipalityId: "jogeva_vald",
      sourceStatus: "active"
    },
    {
      id: "related-contact",
      title: "Sotsiaalvaldkonna kontakt",
      sourceType: "contact_page",
      itemType: "contact",
      canonicalItemId: "jogeva_vald_contact_eve_viks",
      relatedCanonicalItemIds: ["jogeva_vald_service_koduteenus"],
      municipalityId: "jogeva_vald",
      sourceStatus: "active"
    },
    {
      id: "general-regulation",
      title: "Jogeva valla sotsiaalhoolekandelise abi andmise kord",
      sourceType: "kov_regulation",
      collectionId: "kov_regulations",
      municipalityId: "jogeva_vald",
      sourceStatus: "active"
    },
    {
      id: "wrong-kov-form",
      title: "Vale KOV vorm",
      sourceType: "application_form",
      itemType: "form",
      relatedCanonicalItemIds: ["jogeva_vald_service_koduteenus"],
      municipalityId: "tartu_linn",
      sourceStatus: "active"
    },
    {
      id: "journal-form",
      title: "Artikkel",
      sourceType: "journal_article",
      relatedCanonicalItemIds: ["jogeva_vald_service_koduteenus"],
      municipalityId: "jogeva_vald",
      sourceStatus: "active"
    }
  ]);

  const pkg = packages.find(item => item.canonical_item_id === "jogeva_vald_service_koduteenus");
  assert.ok(pkg);
  assert.deepEqual(pkg.sections.forms.map(source => source.source_id), ["related-form"]);
  assert.deepEqual(pkg.sections.contacts.map(source => source.source_id), ["related-contact"]);
  assert.deepEqual(pkg.sections.legal_basis.map(source => source.source_id), ["general-regulation"]);
  assert.deepEqual(pkg.sections.fees.map(source => source.source_id), []);
  assert.deepEqual(pkg.sections.deadlines.map(source => source.source_id), []);
  assert.equal(pkg.sections.legal_basis[0].evidence_strength, "partial");
  assert.equal(pkg.source_ids.includes("wrong-kov-form"), false);
  assert.equal(pkg.source_ids.includes("journal-form"), false);
});

test("buildRuntimeSourcePackages maps KOV regulation fees and deadlines only with explicit signals", () => {
  const packages = buildRuntimeSourcePackages([
    {
      id: "service-info",
      title: "Koduteenus",
      sourceType: "kov_service_info",
      itemType: "service",
      canonicalItemId: "jogeva_vald_service_koduteenus",
      municipalityId: "jogeva_vald",
      sectionsPresent: ["description", "eligibility", "application"],
      sourceStatus: "active"
    },
    {
      id: "fee-regulation",
      title: "Koduteenuse tasu ja omaosalus",
      sourceType: "kov_regulation",
      collectionId: "kov_regulations",
      municipalityId: "jogeva_vald",
      sourceStatus: "active"
    },
    {
      id: "deadline-regulation",
      title: "Taotluse menetlustähtaeg",
      sourceType: "kov_regulation",
      collectionId: "kov_regulations",
      municipalityId: "jogeva_vald",
      sourceStatus: "active"
    }
  ]);

  const pkg = packages.find(item => item.canonical_item_id === "jogeva_vald_service_koduteenus");
  assert.ok(pkg);
  assert.deepEqual(pkg.sections.legal_basis.map(source => source.source_id), ["fee-regulation", "deadline-regulation"]);
  assert.deepEqual(pkg.sections.fees.map(source => source.source_id), ["fee-regulation"]);
  assert.deepEqual(pkg.sections.deadlines.map(source => source.source_id), ["deadline-regulation"]);
});

test("buildRuntimeSourcePackages adds production-shaped same-KOV RT regulation as partial legal basis", () => {
  const packages = buildRuntimeSourcePackages([
    {
      source_id: "kov_jogeva_vald_item_jogeva_vald_service_koduteenus",
      title: "Koduteenus",
      source_type: "kov_service_info",
      collection_id: "kov_services",
      item_type: "service",
      canonical_item_id: "jogeva_vald_service_koduteenus",
      municipality_id: "jogeva_vald",
      sections_present: ["description", "eligibility", "application"],
      source_status: "active"
    },
    {
      source_id: "jogeva-vald-rt-406112024020",
      doc_id: "jogeva-vald-rt-406112024020",
      title: "Sotsiaalhoolekandelise abi andmise kord Jõgeva vallas",
      source_type: "kov_regulation",
      collection_id: "kov_regulations",
      municipality_id: "jogeva_vald",
      jurisdiction_level: "MUNICIPALITY",
      is_current_version: true,
      effective_start: "2025-01-01"
    },
    {
      source_id: "tartu-rt",
      title: "Sotsiaalhoolekandelise abi andmise kord Tartu linnas",
      source_type: "kov_regulation",
      collection_id: "kov_regulations",
      municipality_id: "tartu_linn"
    },
    {
      source_id: "national-law",
      title: "Sotsiaalhoolekande seadus",
      source_type: "national_law",
      collection_id: "national_regulations",
      jurisdiction_level: "NATIONAL"
    }
  ]);

  const pkg = packages.find(item => item.canonical_item_id === "jogeva_vald_service_koduteenus");
  assert.ok(pkg);
  assert.deepEqual(pkg.sections.legal_basis.map(source => source.source_id), ["jogeva-vald-rt-406112024020"]);
  assert.equal(pkg.sections.legal_basis[0].evidence_strength, "partial");
  assert.equal(pkg.source_ids.includes("jogeva-vald-rt-406112024020"), true);
  assert.equal(pkg.source_ids.includes("tartu-rt"), false);
  assert.equal(pkg.source_ids.includes("national-law"), false);
  assert.equal(pkg.missing_sections.includes("legal_basis"), false);
  assert.equal(pkg.missing_sections.includes("fees"), true);
  assert.equal(pkg.missing_sections.includes("deadlines"), true);
});

test("buildRuntimeSourcePackages maps service relatedForms and relatedContacts into package sections", () => {
  const packages = buildRuntimeSourcePackages([
    {
      source_id: "kov_jogeva_vald_item_jogeva_vald_service_koduteenus",
      title: "Koduteenus",
      source_type: "kov_service_info",
      collection_id: "kov_services",
      item_type: "service",
      canonical_item_id: "jogeva_vald_service_koduteenus",
      municipality_id: "jogeva_vald",
      municipality_name: "Jogeva vald",
      sections_present: ["description", "eligibility", "application"],
      related_forms: ["jogeva_vald_form_sotsiaalabi_taotlus"],
      related_contacts: ["jogeva_vald_contact_eve_viks"],
      source_status: "active",
      last_checked: "2026-04-28"
    },
    {
      source_id: "jogeva-vald-rt-406112024020",
      title: "Sotsiaalhoolekandelise abi andmise kord Jogeva vallas",
      source_type: "kov_regulation",
      collection_id: "kov_regulations",
      municipality_id: "jogeva_vald",
      source_status: "active"
    }
  ]);

  const pkg = packages.find(item => item.canonical_item_id === "jogeva_vald_service_koduteenus");
  assert.ok(pkg);
  assert.deepEqual(pkg.sections.forms.map(source => source.source_id), ["jogeva_vald_form_sotsiaalabi_taotlus"]);
  assert.equal(pkg.sections.forms[0].source_type, "application_form");
  assert.equal(pkg.sections.forms[0].item_type, "form");
  assert.deepEqual(pkg.sections.contacts.map(source => source.source_id), ["jogeva_vald_contact_eve_viks"]);
  assert.equal(pkg.sections.contacts[0].source_type, "official_contact");
  assert.equal(pkg.sections.contacts[0].item_type, "contact");
  assert.equal(pkg.missing_sections.includes("forms"), false);
  assert.equal(pkg.missing_sections.includes("contacts"), false);
  assert.equal(pkg.missing_sections.includes("legal_basis"), false);
  assert.equal(pkg.missing_sections.includes("fees"), true);
  assert.equal(pkg.missing_sections.includes("deadlines"), true);
});

test("buildRuntimeSourcePackages resolves Jogeva related forms and contacts from canonical repo JSON fallback", () => {
  const packages = buildRuntimeSourcePackages([
    {
      source_id: "kov_jogeva_vald_item_jogeva_vald_service_koduteenus",
      title: "Koduteenus",
      source_type: "kov_service_info",
      collection_id: "kov_services",
      item_type: "service",
      canonical_item_id: "jogeva_vald_service_jogeva_vald_service_koduteenus",
      municipality_id: "jogeva_vald",
      municipality_name: "Jogeva vald",
      sections_present: ["description", "eligibility", "application"],
      source_status: "active",
      last_checked: "2026-04-28"
    }
  ]);

  const pkg = packages.find(item => item.canonical_item_id === "jogeva_vald_service_koduteenus");
  assert.equal(
    normalizeSourcePackageCanonicalItemId("jogeva_vald_service_jogeva_vald_service_koduteenus"),
    "jogeva_vald_service_koduteenus"
  );
  assert.ok(pkg);
  assert.equal(pkg.package_id, "jogeva_vald_service_koduteenus_package");
  assert.deepEqual(pkg.sections.forms.map(source => source.source_id), ["jogeva_vald_sotsiaalabi_taotlus_pdf"]);
  assert.equal(pkg.sections.forms[0].source_type, "application_form");
  assert.equal(pkg.sections.forms[0].item_type, "form");
  assert.deepEqual(pkg.sections.contacts.map(source => source.source_id), ["jogeva_vald_social_contacts"]);
  assert.equal(pkg.sections.contacts[0].source_type, "contact_page");
  assert.equal(pkg.sections.contacts[0].evidence_strength, "partial");
  assert.equal(pkg.missing_sections.includes("forms"), false);
  assert.equal(pkg.missing_sections.includes("contacts"), false);
});

test("buildRuntimeSourcePackages does not use Jogeva canonical fallback for another municipality", () => {
  const packages = buildRuntimeSourcePackages([
    {
      source_id: "tartu-service",
      title: "Koduteenus",
      source_type: "kov_service_info",
      collection_id: "kov_services",
      item_type: "service",
      canonical_item_id: "jogeva_vald_service_koduteenus",
      municipality_id: "tartu_linn",
      sections_present: ["description", "eligibility", "application"],
      source_status: "active"
    }
  ]);

  const pkg = packages.find(item => item.municipality_id === "tartu_linn");
  assert.ok(pkg);
  assert.deepEqual(pkg.sections.forms, []);
  assert.deepEqual(pkg.sections.contacts, []);
});
