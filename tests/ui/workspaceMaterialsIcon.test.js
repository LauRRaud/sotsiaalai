import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("workspace materials card uses an upload arrowhead without a tail", () => {
  const workspacePanel = read("components/chat/WorkspacePanel.jsx");

  assert.match(workspacePanel, /type === "materials"/);
  assert.match(workspacePanel, /M6\.85 3\.35h6\.35l5\.55 5\.55/);
  assert.match(workspacePanel, /strokeWidth="1\.48"/);
  assert.match(workspacePanel, /m9\.25 13\.08 2\.75-2\.75 2\.75 2\.75/);
  assert.match(workspacePanel, /M7\.85 15\.28v2\.12h8\.3v-2\.12/);
  assert.doesNotMatch(workspacePanel, /M11\.5 17\.15v-5\.2/);
  assert.match(
    workspacePanel,
    /key:\s*"materials"[\s\S]*?icon:\s*"materials"/
  );
});
