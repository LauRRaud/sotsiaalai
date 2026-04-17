import test from "node:test";
import assert from "node:assert/strict";

const {
  loadCareerLocalOccupationCatalog,
  mergeLocalOccupationsIntoDataset,
} = await import("../../lib/career-agent/taxonomy/careerLocalTaxonomy.js");

test("local occupation catalog loads codes, labels and external links from bundled files", async () => {
  const catalog = await loadCareerLocalOccupationCatalog();

  assert.ok((catalog.meta?.occupationCount || 0) > 50);

  const socialPedagogue = catalog.byCode.get("26350013");
  assert.equal(socialPedagogue?.labels?.et, "Sotsiaalpedagoog");
  assert.match(socialPedagogue?.externalUrl || "", /oskused\.ee\/ametid\//i);
});

test("remote occupation labels can be enriched with local classifier code and link", async () => {
  const catalog = await loadCareerLocalOccupationCatalog();
  const dataset = mergeLocalOccupationsIntoDataset(
    {
      occupations: [
        {
          type: "occupation",
          id: "remote:social",
          code: "A00.0",
          label: "Sotsiaalpedagoog",
          aliases: [],
          description: "Remote profile",
          summary: "Remote profile",
          fieldCodes: [],
          fieldLabels: [],
          skillCodes: [],
          skillLabels: [],
          knowledgeAreas: [],
          parentCode: null,
          parentLabel: null,
          workConditions: [],
          goodToKnow: [],
          educationLevels: [],
          toolLabels: [],
          careerOpportunities: [],
          akCodes: [],
          iscedfCode: null,
          emtakCode: null,
          tags: [],
          searchTerms: ["Sotsiaalpedagoog"],
        },
      ],
      skills: [],
      fields: [],
      meta: {
        occupationCount: 1,
        skillCount: 0,
        fieldCount: 0,
      },
    },
    catalog,
    { locale: "et" }
  );

  const occupation = dataset.occupations.find((item) => item.label === "Sotsiaalpedagoog");
  assert.equal(occupation?.localCatalog?.code, "26350013");
  assert.match(occupation?.externalUrl || "", /sotsiaalpedagoog/i);
});

