import test from "node:test";
import assert from "node:assert/strict";

const {
  getQuestionsForState,
  createQuestionAnswerPatch,
} = await import("../../lib/career-agent/core/careerQuestionBank.js");

test('multi-select "ei" answer does not become a fake constraint item', () => {
  const questions = getQuestionsForState("clarify_problem", {}, {}, { locale: "et" });
  const targetQuestion = questions.find((question) => question.id === "work_other_constraints");

  assert.ok(targetQuestion);

  const patch = createQuestionAnswerPatch(targetQuestion, "ei", {
    source: "from_user",
    confirmed: true,
  });

  assert.deepEqual(patch?.workStatus?.otherConstraints?.items || [], []);
});
