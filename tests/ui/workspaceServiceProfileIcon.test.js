import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("workspace service profile card uses its own service icon", () => {
  const workspacePanel = read("components/chat/WorkspacePanel.jsx");

  assert.match(workspacePanel, /type === "service-profile"/);
  assert.match(workspacePanel, /<circle cx="8\.45" cy="9\.1" r="1\.5"/);
  assert.match(workspacePanel, /M12\.7 8\.15h4\.45/);
  assert.match(
    workspacePanel,
    /key:\s*"service_profile"[\s\S]*?icon:\s*"service-profile"/
  );
  assert.doesNotMatch(workspacePanel, /m15\.25 16\.55/);
  assert.doesNotMatch(workspacePanel, /L15\.7 6\.7H8\.3L7\.25 9\.35Z/);
  assert.doesNotMatch(
    workspacePanel,
    /key:\s*"service_profile"[\s\S]{0,120}?icon:\s*"profile"/
  );
});
