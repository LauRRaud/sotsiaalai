import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

function cssBlock(source, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = source.match(new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\n\\}`));
  return match?.[0] || "";
}

test("workspace subpage surfaces reuse the shared glass shell edge shine", () => {
  const stylesSource = read("components/ui/glassPageStyles.js");
  const helpersCss = read("app/styles/utilities/helpers.css");
  const glassCss = read("app/styles/components/glass.css");
  const covisionSource = read("components/covision/CovisionPage.jsx");
  const inviteSource = read("components/invite/InviteModal.jsx");
  const materialsSource = read("components/materials/MaterialsPage.jsx");
  const workspaceFeatureSource = read("components/workspace/WorkspaceFeaturePage.jsx");
  const serviceMapCss = read("app/styles/components/service-map.css");
  const surfaceBlock = cssBlock(helpersCss, ".glass-subpage-surface");
  const surfaceBeforeBlock = cssBlock(helpersCss, ".glass-subpage-surface::before");

  assert.match(
    stylesSource,
    /glassSubpageSurfaceScopeClassName\s*=[\s\S]*?glass-subpage-surface/
  );
  assert.match(covisionSource, /covision-page-surface[\s\S]*?\$\{glassSubpageSurfaceScopeClassName\}/);
  assert.match(inviteSource, /invite-modal-content[\s\S]*?\$\{glassSubpageSurfaceScopeClassName\}/);
  assert.match(workspaceFeatureSource, /workspace-feature-panel[\s\S]*?overflow-hidden/);
  assert.match(workspaceFeatureSource, /workspace-feature-content/);
  assert.match(serviceMapCss, /\.workspace-feature-panel:not\(\.service-map-page-panel\) > \.workspace-feature-content\s*\{[\s\S]*?overflow-y:\s*auto/);
  assert.match(materialsSource, /materials-page-content[\s\S]*?overflow-hidden/);
  assert.doesNotMatch(
    materialsSource,
    /materials-page-content[\s\S]*?\[scrollbar-gutter:stable_both-edges\][\s\S]*?\$\{glassSubpageSurfaceScopeClassName\}/
  );
  assert.match(materialsSource, /materials-page-body[\s\S]*?overflow-y-auto/);
  assert.match(materialsSource, /materials-page-body[\s\S]*?\[scrollbar-gutter:stable_both-edges\]/);
  assert.match(inviteSource, /invite-modal-content[\s\S]*?!overflow-y-hidden/);
  assert.match(inviteSource, /invite-modal-scroll[\s\S]*?overflow-y-auto/);
  assert.match(surfaceBlock, /--glass-subpage-edge-stroke-width:\s*0px/);
  assert.match(surfaceBeforeBlock, /content:\s*""/);
  assert.match(surfaceBeforeBlock, /background:\s*var\(--glass-subpage-edge-stroke,\s*none\)/);
  assert.match(surfaceBeforeBlock, /mask-composite:\s*exclude/);
  assert.match(
    helpersCss,
    /@media \(min-width:\s*769px\)[\s\S]*?\.glass-subpage-surface\s*\{[\s\S]*?--glass-subpage-edge-stroke:\s*var\(\s*--glass-ring-edge-stroke-desktop/
  );
  assert.match(
    helpersCss,
    /@media \(max-width:\s*768px\)[\s\S]*?\.glass-subpage-surface::before\s*\{[\s\S]*?display:\s*none/
  );
  assert.match(
    helpersCss,
    /html\[data-contrast="hc"\]\s+\.glass-subpage-surface::before\s*\{[\s\S]*?display:\s*none\s*!important/
  );
  assert.match(
    helpersCss,
    /\.glass-subpage-surface\s*\{[\s\S]*?--subpage-card-bg:\s*color-mix\([\s\S]*?var\(--glass-ring-surface-bg/
  );
  assert.match(
    helpersCss,
    /:root\.theme-light:not\(\.theme-mid\) \.glass-subpage-surface\s*\{[\s\S]*?--subpage-card-bg:\s*rgba\(251,\s*248,\s*246,\s*0\.64\)/
  );
  assert.match(
    helpersCss,
    /:root\.theme-mid \.glass-subpage-surface\s*\{[\s\S]*?--subpage-card-bg:\s*rgba\(232,\s*222,\s*218,\s*0\.42\)/
  );
  assert.match(
    helpersCss,
    /\.workspace-feature-panel\.glass-subpage-surface,[\s\S]*?--subpage-card-bg:[\s\S]*?color-mix\([\s\S]*?!important/
  );
  assert.match(
    glassCss,
    /\.workspace-feature-glow-card > \[class\*="edgeLight"\],[\s\S]*?\.materials-glow-card::after\s*\{[\s\S]*?display:\s*none !important/
  );
});
