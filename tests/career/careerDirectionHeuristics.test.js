import assert from "node:assert/strict";
import test from "node:test";

const { resolveCareerTurn } = await import(
  "../../lib/career-agent/core/careerOrchestrator.js"
);

test("shortlist prefers tech-adjacent roles when user wants to combine social field and AI", async () => {
  const result = await resolveCareerTurn({
    useOska: false,
    profile: {
      directions: {
        immediateTargets: {
          items: [
            { title: "sotsiaaltootaja" },
            { title: "sotsiaalpedagoog" },
          ],
          source: "from_cv",
          status: "confirmed",
        },
      },
      selfAnalysis: {
        interests: {
          items: ["sotsiaalvaldkond", "tehisintellekt", "infotehnoloogia"],
          source: "from_user",
          status: "confirmed",
        },
        developmentNeeds: {
          items: ["tehisintellekt"],
          source: "from_user",
          status: "confirmed",
        },
      },
      experience: {
        sectors: {
          items: ["sotsiaalvaldkond", "IT"],
          source: "from_cv",
          status: "confirmed",
        },
      },
    },
    runtime: {
      currentState: "shortlist_directions",
      directionsShortlisted: true,
      problemStatementText:
        "Mul on sotsiaaltöö taust, kogemus sotsiaalvaldkonnas ja IT-poolel ning huvi tehisintellekti rakendamise vastu.",
      intakeReasonText:
        "Ma ei otsi ainult kinnitust, et sotsiaaltöö mulle sobib, vaid tahan aru saada, millised seotud või uued ametisuunad mulle veel võiksid sobida.",
      latestUserText:
        "mul on kogemus tehisintellekti platvormi arendamises sotsiaaltöös",
    },
  });

  const titles = (result.directionItems || []).map((item) => item.title);
  assert.deepEqual(titles.slice(0, 4), [
    "IKT-süsteemide analüütik",
    "Tarkvaraarendaja",
    "Andmeanalüütik",
    "Teenusedisainer",
  ]);
});
