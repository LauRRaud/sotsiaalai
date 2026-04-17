import test from "node:test";
import assert from "node:assert/strict";

const { extractCareerProfilePatchWithAi } = await import(
  "../../lib/career-agent/ai/careerAiExtraction.js"
);
const { isCareerAiExtractorEnabled } = await import(
  "../../lib/career-agent/ai/careerAiExtraction.js"
);
const { runCareerAgentPayload } = await import(
  "../../lib/career-agent/api/runCareerAgent.js"
);

test("career AI extractor is enabled by default and can be explicitly disabled", () => {
  assert.equal(isCareerAiExtractorEnabled({}), true);
  assert.equal(
    isCareerAiExtractorEnabled({ CAREER_WORKFLOW_AI_EXTRACTOR: "false" }),
    false
  );
});

test("career AI extractor builds a conservative patch from injected extractor output", async () => {
  const result = await extractCareerProfilePatchWithAi({
    message:
      "Olen klienditeenindaja ja tahan liikuda IT-testimise valdkonda. Mul on tugev suhtlemisoskus ja huvi digilahenduste vastu.",
    extractor: async () => ({
      confidence: "high",
      profilePatch: {
        goals: {
          primaryGoal: "change_career",
          preferredNextStep: "compare_options",
        },
        skills: {
          transferableSkills: ["suhtlemisoskus"],
          digitalSkills: ["testimine"],
        },
        directions: {
          immediateTargets: [
            {
              title: "IT-testija",
              type: "job",
              priority: 18,
              rationale: ["Kasutaja kirjeldas selget huvi IT-testimise vastu."],
            },
          ],
        },
      },
    }),
  });

  assert.equal(result.meta?.used, true);
  assert.equal(result.profilePatch?.goals?.primaryGoal, "change_career");
  assert.deepEqual(result.profilePatch?.skills?.digitalSkills, ["testimine"]);
  assert.equal(
    result.profilePatch?.directions?.immediateTargets?.[0]?.title,
    "IT-testija"
  );
});

test("career AI extractor ignores low-confidence output", async () => {
  const result = await extractCareerProfilePatchWithAi({
    message:
      "Tahaks midagi uut proovida, aga ma ei tea veel täpselt mida.",
    extractor: async () => ({
      confidence: "low",
      profilePatch: {
        goals: {
          primaryGoal: "change_career",
        },
      },
    }),
  });

  assert.equal(result.profilePatch, null);
  assert.equal(result.meta?.used, false);
});

test("runCareerAgentPayload can merge AI-inferred career patch before orchestration", async () => {
  const response = await runCareerAgentPayload({
    userMessage:
      "Olen klienditeenindaja ja tahan liikuda IT-testimise valdkonda. Olen kasutanud testkeskkondi ja mulle meeldib vigu leida.",
    runtime: {},
    profile: {},
    options: {
      aiProfileExtractor: async () => ({
        confidence: "high",
        profilePatch: {
          goals: {
            primaryGoal: "change_career",
            preferredNextStep: "compare_options",
          },
          skills: {
            digitalSkills: ["testkeskkonnad", "vigade leidmine"],
          },
          directions: {
            immediateTargets: [
              {
                title: "IT-testija",
                type: "job",
                priority: 18,
              },
            ],
          },
        },
      }),
    },
  });

  assert.equal(response.ok, true);
  assert.equal(response.body?.result?.profile?.goals?.primaryGoal?.value, "change_career");
  assert.ok(
    (response.body?.result?.profile?.skills?.digitalSkills?.items || []).includes(
      "testkeskkonnad"
    )
  );
  assert.ok(
    (response.body?.meta?.aiExtractor?.used || false) === true
  );
});
