import test from "node:test";
import assert from "node:assert/strict";

const { suggestRelatedDirectionsWithOska } = await import(
  "../../lib/career-agent/taxonomy/careerOskaMatchingBridge.js"
);

test("taxonomy suggestions expand one desired direction into multiple nearby roles", async () => {
  const taxonomyService = {
    async ensureReady() {
      return null;
    },
    async searchOccupations() {
      return [
        {
          code: "25120003",
          label: "Tarkvaraarendaja",
          fieldLabels: ["IKT"],
          externalUrl: "https://oskused.ee/ametid/tarkvaraarendaja",
          occupationGroup: "Tarkvaraarendajad",
          matchScore: 0.93,
        },
        {
          code: "25130002",
          label: "Veebiarendaja",
          fieldLabels: ["IKT"],
          externalUrl: "https://oskused.ee/ametid/veebiarendaja",
          occupationGroup: "Veebi- ja multimeediaarendajad",
          matchScore: 0.88,
        },
        {
          code: "25110001",
          label: "Süsteemianalüütik",
          fieldLabels: ["IKT"],
          externalUrl: "https://oskused.ee/ametid/ikt-susteemide-analuutik",
          occupationGroup: "Analüütikud",
          matchScore: 0.81,
        },
      ];
    },
  };

  const suggestions = await suggestRelatedDirectionsWithOska(
    [
      {
        title: "tehisintellekti arendaja sotsiaalvaldkonnas",
        priority: 18,
        rationale: ["See suund põhineb kasutaja enda kirjeldatud eesmärgil."],
      },
    ],
    taxonomyService
  );

  assert.ok(suggestions.length >= 3);
  assert.deepEqual(
    suggestions.slice(0, 3).map((item) => item.direction?.title),
    ["Tarkvaraarendaja", "Veebiarendaja", "Süsteemianalüütik"]
  );
  assert.equal(suggestions[1]?.oska?.occupation?.code, "25130002");
  assert.match(
    suggestions[1]?.oska?.occupation?.externalUrl || "",
    /oskused\.ee\/ametid\/veebiarendaja/i
  );
});

