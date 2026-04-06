import test from "node:test";
import assert from "node:assert/strict";

const { shouldUseHelpWorkflowMode } = await import("../../lib/chat/workflowModeRouting.js");

test("active help workflow continues even when chatMode falls back to rag", () => {
  const result = shouldUseHelpWorkflowMode({
    userId: "user-1",
    roomId: null,
    forcedMode: "rag",
    explicitHelpModeActive: false,
    helpWorkflowActive: true,
    inactiveHelpStateCanResume: false
  });

  assert.equal(result, true);
});

test("document mode still overrides help workflow continuation", () => {
  const result = shouldUseHelpWorkflowMode({
    userId: "user-1",
    roomId: null,
    forcedMode: "document",
    explicitHelpModeActive: false,
    helpWorkflowActive: true,
    inactiveHelpStateCanResume: true
  });

  assert.equal(result, false);
});

test("inactive help workflow resumes only without an explicit non-help mode", () => {
  assert.equal(shouldUseHelpWorkflowMode({
    userId: "user-1",
    roomId: null,
    forcedMode: null,
    explicitHelpModeActive: false,
    helpWorkflowActive: false,
    inactiveHelpStateCanResume: true
  }), true);

  assert.equal(shouldUseHelpWorkflowMode({
    userId: "user-1",
    roomId: null,
    forcedMode: "rag",
    explicitHelpModeActive: false,
    helpWorkflowActive: false,
    inactiveHelpStateCanResume: true
  }), false);
});
