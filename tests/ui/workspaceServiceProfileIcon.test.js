import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("workspace service profile card uses its own service icon", () => {
  const workspacePanel = read("components/chat/WorkspacePanel.jsx");

  assert.match(workspacePanel, /type === "service-profile"/);
  assert.match(
    workspacePanel,
    /key:\s*"service_profile"[\s\S]*?icon:\s*"service-profile"/
  );
  assert.doesNotMatch(
    workspacePanel,
    /key:\s*"service_profile"[\s\S]{0,120}?icon:\s*"profile"/
  );
});
