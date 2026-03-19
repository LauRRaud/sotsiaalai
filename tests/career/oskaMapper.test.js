import test from "node:test";
import assert from "node:assert/strict";

import {
  buildOskaLookups,
  mapFieldOfActivityRecord,
  mapOccupationRecord,
  mapOskaDataset,
  mapSkillRecord
} from "../../lib/career/oskaMapper.js";

test("mapOccupationRecord extracts explainability and taxonomy fields", () => {
  const occupation = mapOccupationRecord({
    id: 46,
    code: "A23.1",
    name: "Abikokk",
    slug: "abikokk",
    alternativeNames: ["koka abi"],
    keySkills: [{ skill: { id: 89, name: "Ohutusnouete jargimine", slug: "ohutusnouete-jargimine" } }],
    knowledgeRequired: [{ skill: { id: 95, name: "Toiduohutuse nouete jargimine", slug: "toiduohutuse-nouete-jargimine" } }],
    educationLevels: [{ educationLevel: { code: "voc", name: "Kutseharidus" } }],
    oskaFieldOfActivity: { id: 3, code: "T3", name: "Toitlustus", slug: "toitlustus" }
  });

  assert.equal(occupation.name, "Abikokk");
  assert.equal(occupation.alternativeNames[0], "koka abi");
  assert.equal(occupation.keySkills[0].slug, "ohutusnouete-jargimine");
  assert.equal(occupation.knowledgeRequired[0].name, "Toiduohutuse nouete jargimine");
  assert.equal(occupation.educationLevels[0].name, "Kutseharidus");
  assert.equal(occupation.fieldOfActivity.slug, "toitlustus");
});

test("mapSkillRecord and field mapping retain relations and flags", () => {
  const skill = mapSkillRecord({
    id: 549,
    code: "5.3.3.1.",
    name: "2D-plaani tolgendamine",
    alternativeNames: ["CAD-joonise lugemine"],
    inDemand: true,
    parentSkill: { id: 548, name: "Projekti lugemine", slug: "projekti-lugemine" },
    keyOccupations: [{ occupation: { id: 17, name: "Ehitusinsener", slug: "ehitusinsener" } }]
  });
  const field = mapFieldOfActivityRecord({
    id: 32,
    code: "T32",
    name: "Arindusharidus",
    slug: "arindusharidus",
    oskaOccupations: [{ occupation: { id: 17, name: "Ehitusinsener", slug: "ehitusinsener" } }]
  });

  assert.equal(skill.inDemand, true);
  assert.equal(skill.parentSkill.slug, "projekti-lugemine");
  assert.equal(skill.keyOccupations[0].name, "Ehitusinsener");
  assert.equal(field.occupations[0].slug, "ehitusinsener");
});

test("mapOskaDataset and lookups provide internal layer without raw API coupling", () => {
  const dataset = mapOskaDataset({
    occupations: [{ id: 1, code: "A1", name: "Analuutik", slug: "analuutik" }],
    skills: [{ id: 2, code: "S1", name: "Andmeanaluus", slug: "andmeanaluus" }],
    fieldsOfActivity: [{ id: 3, code: "T1", name: "IT", slug: "it" }]
  });
  const lookups = buildOskaLookups(dataset);

  assert.equal(lookups.occupations.byCode.get("A1").name, "Analuutik");
  assert.equal(lookups.skills.bySlug.get("andmeanaluus").code, "S1");
  assert.equal(lookups.fieldsOfActivity.byId.get(3).name, "IT");
});

