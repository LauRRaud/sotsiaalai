import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("wellbeing workspace cards reuse dashboard card layout without visible descriptions", () => {
  const source = readFileSync(new URL("../../components/wellbeing/WellbeingPage.jsx", import.meta.url), "utf8");

  assert.match(source, /className=\{cn\("workspace-dashboard-card",\s*workspaceStyles\.card\)\}/);
  assert.match(source, /workspaceStyles\.cardTitle/);
  assert.doesNotMatch(source, /styles\.toolDescription/);
  assert.doesNotMatch(source, /<span className=\{styles\.toolDescription\}>/);
});
