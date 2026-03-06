import test from "node:test";
import assert from "node:assert/strict";

import {
  chooseOrchestrationPlan,
  REASONING_DEPTH,
  WORK_MODES
} from "../../lib/chat/orchestrationPolicy.js";
import { buildResponsesPayload } from "../../lib/chat/promptBuilder.js";

test("browse intent defaults to low reasoning", () => {
  const plan = chooseOrchestrationPlan({
    intent: WORK_MODES.BROWSE_HELP_OFFERS,
    message: "Naita mulle abipakkumisi"
  });

  assert.equal(plan.reasoning, REASONING_DEPTH.LOW);
  assert.equal(plan.capability, "structured_retrieval");
});

test("help workflow refinement uses medium reasoning", () => {
  const plan = chooseOrchestrationPlan({
    intent: WORK_MODES.CREATE_HELP_REQUEST,
    message: "Mul oleks vaja emale paar korda nadalast abi poes kaimiseks.",
    workflowState: {
      intent: "create_help_request",
      draft: { description: "Mul oleks vaja emale abi" },
      missingFields: ["municipalityId", "description"]
    },
    clarifyingTurns: 1
  });

  assert.equal(plan.reasoning, REASONING_DEPTH.MEDIUM);
  assert.equal(plan.step, "refine");
});

test("report drafting escalates to high reasoning", () => {
  const plan = chooseOrchestrationPlan({
    intent: WORK_MODES.REPORT_DRAFTING,
    message: "Aita mul koostada aruanne kliendijuhtumist"
  });

  assert.equal(plan.reasoning, REASONING_DEPTH.HIGH);
  assert.equal(plan.capability, "document_workflow");
});

test("OpenAI payload uses orchestration reasoning override", () => {
  const payload = buildResponsesPayload({
    model: "gpt-5-mini",
    input: [],
    max_output_tokens: 600
  }, {
    stream: false,
    reasoningEffort: "low"
  });

  assert.deepEqual(payload.reasoning, { effort: "low" });
});
