import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("workspace help request marker keeps the question mark icon", () => {
  const workspacePanel = read("components/chat/WorkspacePanel.jsx");

  assert.match(workspacePanel, /type === "help-request"/);
  assert.match(workspacePanel, /M10\.45 8\.45a1\.95/);
  assert.match(workspacePanel, /M12 15\.25h\.01/);
  assert.doesNotMatch(workspacePanel, /M12 9\.15v4\.15/);
  assert.match(
    workspacePanel,
    /key:\s*"help_requests"[\s\S]*?icon:\s*"help-request"/
  );
});
