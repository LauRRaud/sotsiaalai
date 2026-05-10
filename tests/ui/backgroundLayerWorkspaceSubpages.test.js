import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("workspace subpages keep the shared app background visible", () => {
  const backgroundLayer = read("components/backgrounds/BackgroundLayer.jsx");
  const workspaceFeature = read("components/workspace/WorkspaceFeaturePage.jsx");
  const materials = read("components/materials/MaterialsPage.jsx");
  const covision = read("components/covision/CovisionPage.jsx");
  const documents = read("components/documents/DocumentsPage.jsx");
  const agent = read("components/agent/AgentModePage.jsx");

  assert.match(backgroundLayer, /COLOR_BENDS_EXCLUDED_PATHS[\s\S]*?"\/documents"/);
  assert.match(backgroundLayer, /COLOR_BENDS_EXCLUDED_PATHS[\s\S]*?"\/dokreziim"/);

  for (const source of [workspaceFeature, materials, covision, documents, agent]) {
    assert.match(source, /fixed inset-0 isolate z-\[30\]/);
    assert.match(source, /bg-transparent/);
    assert.doesNotMatch(source, /bg-\[color:var\(--app-chrome-bg\)\]/);
  }
});
