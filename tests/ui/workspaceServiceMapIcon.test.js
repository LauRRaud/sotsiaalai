import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("workspace service map card uses an Estonia outline with a location marker", () => {
  const workspacePanel = read("components/chat/WorkspacePanel.jsx");
  const styles = read("components/chat/WorkspacePanel.module.css");

  assert.match(workspacePanel, /type === "map"/);
  assert.match(workspacePanel, /M4\.3 14\.95 5\.9 14\.2l-\.62-1\.1/);
  assert.match(workspacePanel, /strokeWidth="1\.74"/);
  assert.match(workspacePanel, /M13\.05 18\.2c-\.66 0-1\.34-\.34-1\.82-\.91/);
  assert.match(workspacePanel, /M13\.05 9\.15v3\.35/);
  assert.match(workspacePanel, /strokeWidth="1\.6"/);
  assert.doesNotMatch(workspacePanel, /estoniaMapShape/);
  assert.doesNotMatch(styles, /estoniaMapShape/);
  assert.doesNotMatch(styles, /eesti_kontuurkaart\.svg/);
  assert.doesNotMatch(workspacePanel, /M9 18\.65 4\.7 20\.1V6\.1L9 4\.65/);
  assert.match(
    workspacePanel,
    /key:\s*"service_map"[\s\S]*?icon:\s*"map"/
  );
});
