import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function readSource(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("workspace dashboard card navigation does not close or tilt the chat surface before route change", () => {
  const source = readSource("components/chat/WorkspacePanel.jsx");
  const navigateToMatch = source.match(
    /const navigateTo = useCallback\(\s*path => \{([\s\S]*?)\},\s*\[[^\]]*locale[\s\S]*?router[^\]]*\]\s*\);/
  );

  assert.ok(navigateToMatch, "navigateTo callback should be present");
  assert.doesNotMatch(navigateToMatch[1], /onClose\?\.\(\);/);
  assert.doesNotMatch(navigateToMatch[1], /glassRingTilt|waitForGlassRingTilt/);
  assert.match(
    navigateToMatch[1],
    /markWorkspacePanelMorph\("expand",\s*path\);/
  );
  assert.match(
    navigateToMatch[1],
    /delayMs:\s*shouldRestoreWorkspace \? WORKSPACE_PANEL_MORPH_EXPAND_MS : 0/
  );
});

test("workspace dashboard back button closes the in-chat workspace", () => {
  const source = readSource("components/chat/WorkspacePanel.jsx");

  assert.match(source, /import \{\s*pushWithTransition\s*\} from "@\/lib\/routeTransition";/);
  assert.match(source, /const handleWorkspaceBack = useCallback\(\s*\(\) => \{/);
  assert.match(source, /const handleWorkspaceBack = useCallback\(\s*\(\) => \{[\s\S]*?onClose\?\.\(\);[\s\S]*?\},\s*\[onClose\]\s*\);/);
  assert.doesNotMatch(source, /runWithTransition|resolveWorkspaceNavigationTiltDirection/);
  assert.match(
    source,
    /<BackButton[\s\S]*?onClick=\{handleWorkspaceBack\}/
  );
});

test("workspace subpage back buttons tilt the visible page and delay return for panel collapse", () => {
  const workspaceFeatureSource = readSource("components/workspace/WorkspaceFeaturePage.jsx");
  const documentsSource = readSource("components/documents/DocumentsPage.jsx");
  const agentSource = readSource("components/agent/AgentModePage.jsx");
  const covisionSource = readSource("components/covision/CovisionPage.jsx");
  const materialsSource = readSource("components/materials/MaterialsPage.jsx");

  assert.match(workspaceFeatureSource, /const \[isClosing,\s*setIsClosing\]\s*=\s*useState\(false\);/);
  assert.match(workspaceFeatureSource, /const shouldTiltOnBack = featureKey !== "service_map";/);
  assert.doesNotMatch(workspaceFeatureSource, /waitForGlassRingTilt:\s*true/);
  assert.doesNotMatch(workspaceFeatureSource, /glassRingTilt:\s*"left"/);
  assert.match(workspaceFeatureSource, /markWorkspacePanelMorph\("collapse",\s*"\/vestlus"\)/);
  assert.match(workspaceFeatureSource, /delayMs:\s*WORKSPACE_PANEL_MORPH_DELAY_MS/);
  assert.match(workspaceFeatureSource, /workspaceBackTiltClassName/);
  assert.match(workspaceFeatureSource, /if \(shouldTiltOnBack\) \{\s*setIsClosing\(true\);/);
  assert.match(
    workspaceFeatureSource,
    /workspaceReturn\(locale,\s*router,\s*\{\s*persistGlassRingTilt:\s*false\s*\}\);/
  );
  assert.match(
    readSource("app/styles/components/documents-mode.css"),
    /\.documents-workspace-shell--agent\s*\{[\s\S]*?--glass-ring-tilt-perspective:\s*4200px;[\s\S]*?--glass-ring-tilt-angle-left:\s*-0\.85deg;[\s\S]*?--glass-ring-tilt-angle-right:\s*0\.85deg;/
  );

  for (const source of [documentsSource, agentSource, covisionSource, materialsSource]) {
    assert.match(source, /const \[isClosing,\s*setIsClosing\]\s*=\s*useState\(false\)/);
    assert.match(source, /if \(isClosing\) return/);
    assert.match(source, /setIsClosing\(true\)/);
    assert.doesNotMatch(source, /waitForGlassRingTilt:\s*true/);
    assert.doesNotMatch(source, /glassRingTilt:\s*"left"/);
    assert.match(source, /markWorkspacePanelMorph\("collapse",/);
    assert.match(source, /delayMs:\s*WORKSPACE_PANEL_MORPH_DELAY_MS/);
    assert.match(
      source,
      /motion-safe:animate-\[glassRingTiltFromLeft_540ms_cubic-bezier\(0\.42,0,0\.58,1\)_both\]/
    );
    assert.match(
      source,
      /pushWithTransition\([\s\S]*?\{[\s\S]*?persistGlassRingTilt:\s*false[\s\S]*?\}\)/
    );
  }
});
