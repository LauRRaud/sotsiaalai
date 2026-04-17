import test from "node:test";
import assert from "node:assert/strict";

const { extractStudyPlacesFromHtml } = await import(
  "../../lib/career-agent/taxonomy/careerOskaStudyService.js"
);
const { resolveCareerTurn } = await import(
  "../../lib/career-agent/core/careerOrchestrator.js"
);

const ABIKOKK_HTML = `
  <main>
    <h3>Kus õppida</h3>
    <a href="https://enda.ehis.ee/abikokk-jarvamaa">Abikokk, Järvamaa Kutsehariduskeskus</a>
    <a href="https://uus.teeninduskool.ee/abikokk">Abikokk, Tallinna Teeninduskool</a>
    <a href="https://oskused.ee/ametid/abikokk#toggle">Näita veel (5)</a>
    <h3>Tutvu uuringutega</h3>
  </main>
`;

function createTaxonomyService() {
  return {
    async ensureReady() {
      return null;
    },
    async findBestOccupation() {
      return {
        code: "51200101",
        label: "Abikokk",
        aliases: ["koka abi"],
        fieldLabels: ["Toitlustus"],
        skillLabels: ["Meeskonnatöö tegemine"],
        educationLevels: ["Erialane kutseharidus"],
        externalUrl: "https://oskused.ee/ametid/abikokk",
        occupationGroup: "Kokad",
      };
    },
    async findBestField() {
      return {
        label: "Toitlustus",
      };
    },
    async findBestSkill() {
      return null;
    },
    async searchOccupations() {
      return [];
    },
  };
}

test("study place parser extracts providers from occupation page section", () => {
  const studyPlaces = extractStudyPlacesFromHtml(
    ABIKOKK_HTML,
    "https://oskused.ee/ametid/abikokk"
  );

  assert.deepEqual(
    studyPlaces.map((item) => item.provider),
    ["Järvamaa Kutsehariduskeskus", "Tallinna Teeninduskool"]
  );
  assert.match(studyPlaces[0]?.url || "", /ehis\.ee/i);
});

test("shortlist response shows where to study for enriched occupations", async () => {
  const result = await resolveCareerTurn({
    runtime: {
      currentState: "shortlist_directions",
      directionSeedRoles: ["Abikokk"],
      directionsShortlisted: true,
    },
    directionCandidates: [
      {
        title: "Abikokk",
      },
    ],
    options: {
      taxonomyService: createTaxonomyService(),
      fetchImpl: async () => ({
        ok: true,
        async text() {
          return ABIKOKK_HTML;
        },
      }),
    },
  });

  assert.equal(result.response?.kind, "direction_shortlist");
  assert.deepEqual(
    result.response?.cards?.[0]?.studyPlaces?.map((item) => item.provider),
    ["Järvamaa Kutsehariduskeskus", "Tallinna Teeninduskool"]
  );
});

test("summary includes where to study signal for the top recommendation", async () => {
  const result = await resolveCareerTurn({
    runtime: {
      currentState: "summary",
      summaryPrepared: true,
    },
    directionCandidates: [
      {
        title: "Abikokk",
      },
    ],
    options: {
      taxonomyService: createTaxonomyService(),
      fetchImpl: async () => ({
        ok: true,
        async text() {
          return ABIKOKK_HTML;
        },
      }),
    },
  });

  assert.equal(result.response?.kind, "summary");
  assert.match((result.response?.bullets || []).join("\n"), /Järvamaa Kutsehariduskeskus/i);
});
