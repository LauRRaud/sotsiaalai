import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("workspace dashboard icons use the larger tuned icon size", () => {
  const styles = read("components/chat/WorkspacePanel.module.css");

  assert.match(styles, /--workspace-card-icon-size:\s*clamp\(2\.38rem,\s*5\.05vw,\s*2\.84rem\)/);
  assert.match(styles, /--workspace-card-icon-size:\s*2\.16rem/);
});
