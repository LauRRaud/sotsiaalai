import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("workspace documents card uses the rounded document frame with an envelope mark", () => {
  const workspacePanel = read("components/chat/WorkspacePanel.jsx");

  assert.match(workspacePanel, /type === "document"/);
  assert.match(workspacePanel, /M6\.85 3\.35h6\.35l5\.55 5\.55/);
  assert.match(workspacePanel, /strokeWidth="1\.48"/);
  assert.match(workspacePanel, /M7\.55 11\.62h8\.9v5\.38h-8\.9v-5\.38Z/);
  assert.match(workspacePanel, /m7\.92 11\.96 4\.08 3\.02 4\.08-3\.02/);
  assert.doesNotMatch(workspacePanel, /M8\.6 12\.1h6\.8M8\.6 15\.35h5\.2/);
  assert.match(
    workspacePanel,
    /key:\s*"documents"[\s\S]*?icon:\s*"document"/
  );
});
