import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function readSource(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("workspace dashboard card navigation uses plain route push without tilt or morph classes", () => {
  const source = readSource("components/chat/WorkspacePanel.jsx");
  const navigateToMatch = source.match(
    /const navigateTo = useCallback\(\s*path => \{([\s\S]*?)\},\s*\[[^\]]*locale[\s\S]*?router[^\]]*\]\s*\);/
  );

  assert.ok(navigateToMatch, "navigateTo callback should be present");
  assert.doesNotMatch(navigateToMatch[1], /onClose\?\.\(\);/);
  assert.doesNotMatch(navigateToMatch[1], /glassRingTilt|waitForGlassRingTilt/);
  assert.doesNotMatch(source, /setHandoffPending/);
  assert.doesNotMatch(source, /workspace-dashboard-panel--route-handoff/);
  assert.doesNotMatch(navigateToMatch[1], /markWorkspacePanelMorph/);
  assert.doesNotMatch(source, /WORKSPACE_ROUTE_HANDOFF_DELAY_MS/);
  assert.doesNotMatch(source, /workspacePanelMorph:\s*"content-handoff"/);
  assert.match(
    source,
    /import \{ createWorkspaceDashboardRows,\s*WORKSPACE_ROUTE_PREFETCH_PATHS \} from "@\/lib\/workspaceDashboardCards";/
  );
  assert.match(
    source,
    /router\.prefetch\?\.\(href\)/
  );
  assert.match(
    navigateToMatch[1],
    /router\.push\(href\);/
  );
});

test("workspace dashboard back button closes the in-chat workspace", () => {
  const source = readSource("components/chat/WorkspacePanel.jsx");

  assert.doesNotMatch(source, /from "@\/lib\/routeTransition";/);
  assert.match(source, /const handleWorkspaceBack = useCallback\(\s*\(\) => \{/);
  assert.match(source, /const handleWorkspaceBack = useCallback\(\s*\(\) => \{[\s\S]*?onClose\?\.\(\);[\s\S]*?\},\s*\[[^\]]*onClose[^\]]*\]\s*\);/);
  assert.doesNotMatch(source, /runWithTransition|resolveWorkspaceNavigationTiltDirection/);
  assert.match(
    source,
    /<GlassSubpageHeader[\s\S]*?onBack=\{handleWorkspaceBack\}/
  );
});

test("workspace subpage back buttons return instantly without collapse morphs", () => {
  const workspaceFeatureSource = readSource("components/workspace/WorkspaceFeaturePage.jsx");
  const documentsSource = readSource("components/documents/DocumentsPage.jsx");
  const agentSource = readSource("components/agent/AgentModePage.jsx");
  const covisionSource = readSource("components/covision/CovisionPage.jsx");
  const materialsSource = readSource("components/materials/MaterialsPage.jsx");

  assert.doesNotMatch(workspaceFeatureSource, /const \[isClosing,\s*setIsClosing\]/);
  assert.doesNotMatch(workspaceFeatureSource, /shouldTiltOnBack/);
  assert.doesNotMatch(workspaceFeatureSource, /waitForGlassRingTilt:\s*true/);
  assert.doesNotMatch(workspaceFeatureSource, /glassRingTilt:\s*"left"/);
  assert.doesNotMatch(workspaceFeatureSource, /markWorkspacePanelMorph\("collapse"/);
  assert.doesNotMatch(workspaceFeatureSource, /WORKSPACE_PANEL_MORPH_DELAY_MS/);
  assert.doesNotMatch(workspaceFeatureSource, /workspaceBackTiltClassName/);
  assert.doesNotMatch(workspaceFeatureSource, /workspace-guide-panel--collapse/);
  assert.match(
    workspaceFeatureSource,
    /workspaceReturn\(locale,\s*router,\s*\{\s*persistGlassRingTilt:\s*false\s*\}\);/
  );
  assert.match(
    readSource("app/styles/components/documents-workspace.shared.css"),
    /\.documents-workspace-shell--agent\s*\{[\s\S]*?--glass-ring-tilt-perspective:\s*4200px;[\s\S]*?--glass-ring-tilt-angle-left:\s*-0\.85deg;[\s\S]*?--glass-ring-tilt-angle-right:\s*0\.85deg;/
  );

  for (const source of [documentsSource, agentSource, covisionSource, materialsSource]) {
    assert.doesNotMatch(source, /const \[isClosing,\s*setIsClosing\]/);
    assert.doesNotMatch(source, /setIsClosing\(true\)/);
    assert.doesNotMatch(source, /waitForGlassRingTilt:\s*true/);
    assert.doesNotMatch(source, /glassRingTilt:\s*"left"/);
    assert.doesNotMatch(source, /markWorkspacePanelMorph\("collapse"/);
    assert.doesNotMatch(source, /WORKSPACE_PANEL_MORPH_DELAY_MS/);
    assert.doesNotMatch(source, /workspacePanelMorph:\s*"collapse"/);
    assert.doesNotMatch(source, /workspace-guide-panel--collapse/);
    assert.match(
      source,
      /pushWithTransition\([\s\S]*?\{[\s\S]*?persistGlassRingTilt:\s*false[\s\S]*?\}\)/
    );
  }
});
