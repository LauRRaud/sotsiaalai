import test from "node:test";
import assert from "node:assert/strict";

import { buildOskaNormalizer } from "../../lib/career/oskaNormalizer.js";

test("normalizer matches alternative names for occupations", () => {
  const normalizer = buildOskaNormalizer({
    occupations: [
      {
        id: 46,
        code: "A23.1",
        name: "Abikokk",
        slug: "abikokk",
        alternativeNames: ["koka abi"],
        keySkills: [],
        knowledgeRequired: []
      }
    ],
    skills: [],
    fieldsOfActivity: []
  });

  const matches = normalizer.normalizeOccupation("koka abi");

  assert.equal(matches[0].item.name, "Abikokk");
  assert.ok(matches[0].score >= 0.9);
});

test("normalizer can use relation terms to interpret free text", () => {
  const normalizer = buildOskaNormalizer({
    occupations: [],
    skills: [
      {
        id: 549,
        code: "5.3.3.1.",
        name: "2D-plaani tolgendamine",
        slug: "2d-plaani-tolgendamine",
        alternativeNames: ["CAD-joonise lugemine"],
        keyOccupations: [{ id: 17, name: "Ehitusinsener", slug: "ehitusinsener" }]
      }
    ],
    fieldsOfActivity: []
  });

  const matches = normalizer.normalizeSkill("ehitusinsener");

  assert.equal(matches[0].item.name, "2D-plaani tolgendamine");
  assert.equal(matches[0].matchedOn, "relation");
});

