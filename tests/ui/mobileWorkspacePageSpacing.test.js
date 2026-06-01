import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { readMobileCssBundle } from "../helpers/mobileCssBundle.mjs";


function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("documents and agent pages use a shared mobile glass-panel system", () => {
  const css = read("app/styles/components/documents-mode.css");
  const mobileCss = readMobileCssBundle();
  const helpersCss = read("app/styles/utilities/helpers.css");
  const documentsSource = read("components/documents/DocumentsPage.jsx");
  const agentSource = read("components/agent/AgentModePage.jsx");

  assert.match(
    css,
    /--documents-mobile-panel-gap:\s*var\(--mobile-glass-card-gap,\s*clamp\(0\.32rem,\s*1\.6vw,\s*0\.5rem\)\)/
  );
  assert.match(
    css,
    /\.documents-workspace-page--documents,\s*\n\s*\.documents-workspace-page--agent\s*\{[\s\S]*?padding:[\s\S]*?env\(safe-area-inset-top,\s*0px\)[\s\S]*?var\(--documents-mobile-panel-gap\)/
  );
  assert.match(
    css,
    /\.documents-workspace-page--documents,\s*\n\s*\.documents-workspace-page--agent\s*\{[\s\S]*?overflow-x:\s*hidden;[\s\S]*?overflow-y:\s*hidden;[\s\S]*?overscroll-behavior:\s*contain;/
  );
  assert.match(
    css,
    /@media \(max-width:\s*768px\)[\s\S]*?\.documents-workspace-page--documents\s+:is\([\s\S]*?\.documents-library-panel[\s\S]*?\),[\s\S]*?\.documents-workspace-page--agent\s+:is\([\s\S]*?\.documents-agent-card/
  );
  assert.match(css, /border-radius:\s*var\(--documents-mobile-panel-radius\)\s*!important/);
  assert.match(css, /box-shadow:\s*var\(--glass-shell-shadow,\s*none\)\s*!important/);
  assert.match(css, /backdrop-filter:\s*blur\(var\(--glass-blur-radius,\s*1rem\)\)\s*saturate\(100%\)\s*!important/);
  assert.match(
    css,
    /\.documents-workspace-page--documents\s+\.documents-page-shell,[\s\S]*?\.documents-workspace-page--agent\s+\.documents-page-shell\s*\{[\s\S]*?padding:\s*0\s*!important[\s\S]*?background:\s*transparent\s*!important[\s\S]*?backdrop-filter:\s*none\s*!important/
  );
  assert.match(
    css,
    /\.documents-workspace-page--documents\s+:is\([\s\S]*?\.documents-library-panel[\s\S]*?\),[\s\S]*?\.documents-workspace-page--agent\s+:is\([\s\S]*?\.documents-agent-content-pane[\s\S]*?\)\s*\{[\s\S]*?padding:[\s\S]*?var\(--documents-mobile-panel-pad-y\)[\s\S]*?var\(--documents-mobile-panel-pad-x\)\s*!important/
  );
  assert.doesNotMatch(mobileCss, /documents-workspace-page--library/);
  assert.doesNotMatch(mobileCss, /documents-workspace-shell--documents/);
  assert.doesNotMatch(mobileCss, /documents-workspace-shell--agent/);
  assert.doesNotMatch(mobileCss, /documents-page-shell/);
  assert.match(
    mobileCss,
    /:is\(\.documents-workspace-page--documents,\s*\.documents-workspace-page--agent\)\s*\{[\s\S]*?align-items:\s*flex-start\s*!important;[\s\S]*?justify-content:\s*flex-start\s*!important;[\s\S]*?padding:\s*0\s*!important;/
  );
  assert.match(
    mobileCss,
    /:is\([\s\S]*?\.workspace-guide-panel\.glass-subpage-surface,[\s\S]*?\.documents-workspace-shell\.workspace-guide-panel,[\s\S]*?\.materials-page-content\.workspace-guide-panel,[\s\S]*?\.covision-page-surface\.workspace-guide-panel,[\s\S]*?\.workspace-feature-panel\.workspace-guide-panel[\s\S]*?\)\s*\{[\s\S]*?--workspace-mobile-panel-gap:\s*var\(--mobile-glass-card-gap\);[\s\S]*?margin-top:\s*calc\(var\(--mobile-safe-top,/
  );
  assert.match(documentsSource, /fixed inset-0 isolate z-\[30\] bg-transparent/);
  assert.match(agentSource, /fixed inset-0 isolate z-\[30\] bg-transparent/);
  assert.doesNotMatch(css, /documents-workspace-shell--route-enter/);
  assert.doesNotMatch(css, /workspace-guide-panel--collapse/);
  assert.doesNotMatch(helpersCss, /workspace-guide-panel--route-enter/);
  assert.doesNotMatch(helpersCss, /workspace-guide-panel--collapse/);
});

test("short workspace feature pages keep content pinned under the header", () => {
  const workspaceSource = read("components/workspace/WorkspaceFeaturePage.jsx");
  const materialsSource = read("components/materials/MaterialsPage.jsx");

  assert.match(
    workspaceSource,
    /workspace-feature-content[\s\S]*?grid content-start gap-\[1rem\]/
  );
  assert.match(
    materialsSource,
    /materials-page-body[\s\S]*?grid content-start gap-\[0\.66rem\]/
  );
});

test("documents mobile controls stretch instead of keeping desktop fixed widths", () => {
  const css = read("app/styles/components/documents-mode.css");

  assert.match(
    css,
    /@media \(max-width:\s*768px\)[\s\S]*?\.documents-upload-control--kind\s*\{[\s\S]*?width:\s*100%[\s\S]*?max-width:\s*none[\s\S]*?justify-self:\s*stretch/
  );
  assert.match(
    css,
    /@media \(max-width:\s*768px\)[\s\S]*?\.documents-agent-template-control\s*\{[\s\S]*?width:\s*100%[\s\S]*?max-width:\s*none[\s\S]*?justify-self:\s*stretch/
  );
  assert.match(
    css,
    /@media \(max-width:\s*768px\)[\s\S]*?\.documents-agent-template-row,[\s\S]*?\.documents-agent-select-grid\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\)/
  );
});

test("viewport setter updates the shared mobile glass height variable", () => {
  const source = read("components/ViewportLayoutSetter.jsx");

  assert.match(source, /root\.style\.setProperty\("--glass-mobile-root-vh",\s*`\$\{layoutHeight\}px`\)/);
  assert.match(source, /root\.style\.setProperty\("--glass-mobile-vh",\s*`\$\{layoutHeight\}px`\)/);
});

test("documents and agent glass panels use the shared borderless surface", () => {
  const css = read("app/styles/components/documents-mode.css");

  assert.match(
    css,
    /\.documents-workspace-page--library\s+\.documents-surface-panel\s*\{[\s\S]*?background:\s*var\(--documents-surface-panel-bg\)\s*!important/
  );
  assert.match(
    css,
    /\.documents-workspace-page--library\s+\.documents-surface-panel\s*\{[\s\S]*?border:\s*none\s*!important/
  );
  assert.match(
    css,
    /\.documents-workspace-page--library\s+\.documents-surface-panel\s*\{[\s\S]*?box-shadow:\s*var\(--glass-shell-shadow,\s*none\)\s*!important/
  );
  assert.match(
    css,
    /\.documents-workspace-page--library\s*\{[\s\S]*?--documents-glass-sheen:\s*var\(--glass-ring-sheen,\s*none\)[\s\S]*?--documents-card-bg:\s*var\(--documents-glass-surface\)[\s\S]*?--documents-agent-thread-bg:\s*var\(--documents-glass-surface\)[\s\S]*?--documents-surface-panel-bg:\s*var\(--documents-glass-sheen\),\s*var\(--documents-glass-surface\)/
  );
  assert.match(
    css,
    /\.documents-workspace-page--library\s*\{[\s\S]*?--subpage-card-bg:\s*var\(--documents-glass-surface\)[\s\S]*?--subpage-card-bg-hover:\s*var\(--documents-glass-surface\)/
  );
  assert.match(
    css,
    /:root:not\(\.theme-light\):not\(\.theme-mid\):not\(\.theme-night\):not\(\.theme-mono\):not\(\[data-contrast="hc"\]\) \.documents-workspace\.documents-workspace-page--library,[\s\S]*?:root\.theme-night \.documents-workspace\.documents-workspace-page--library,[\s\S]*?html\[data-contrast="hc"\] \.documents-workspace\.documents-workspace-page--library\s*\{[\s\S]*?--documents-glass-surface:\s*var\(--glass-ring-surface-bg,[\s\S]*?--documents-surface-panel-bg:\s*var\(--documents-glass-sheen\),\s*var\(--documents-glass-surface\)/
  );
  assert.ok(
    css.indexOf(":root.theme-night .documents-workspace.documents-workspace-page--library") >
      css.indexOf(":root.theme-night .documents-workspace-page--library"),
    "final night surface override must come after the original theme-night library tokens"
  );
  assert.match(
    css,
    /\.documents-workspace-page--library\s*\{[\s\S]*?--documents-surface-panel-bg:\s*[\s\S]*?var\(--glass-ring-sheen/
  );
  assert.doesNotMatch(css, /--documents-dark-panel-sheen/);
  assert.doesNotMatch(css, /\.documents-page-hero-panel::before/);
});

test("dokreziim conversation glow shadows stay close to the element", () => {
  const css = read("app/styles/components/documents-mode.css");

  assert.match(
    css,
    /\.documents-agent-glow-window,[\s\S]*?\.documents-agent-glow-composer\s*\{[\s\S]*?0 4px 10px rgba\(0,\s*0,\s*0,\s*0\.12\)\s*!important/
  );
  assert.match(
    css,
    /\.documents-agent-glow-window:hover,[\s\S]*?\.documents-agent-glow-composer:focus-within\s*\{[\s\S]*?0 6px 13px rgba\(0,\s*0,\s*0,\s*0\.14\)\s*!important/
  );
  assert.doesNotMatch(
    css,
    /\.documents-agent-glow-window,[\s\S]*?\.documents-agent-glow-composer\s*\{[\s\S]*?0 10px 24px/
  );
});

test("covision mobile surface opts into compact full-width glass layout", () => {
  const component = read("components/covision/CovisionPage.jsx");
  const css = read("components/covision/CovisionPage.module.css");

  assert.match(component, /covision-page-surface/);
  assert.match(component, /workspaceGuidePanelClassName/);
  assert.doesNotMatch(component, /!w-\[min\(calc\(100vw-2rem\),clamp\(36rem,76vw,54rem\)\)\]/);
  assert.match(
    css,
    /\.surface\s*\{[\s\S]*?width:\s*var\(--workspace-glass-inline-size/
  );
  assert.match(
    css,
    /--covision-mobile-page-gap:\s*clamp\(0\.18rem,\s*0\.8vw,\s*0\.32rem\)/
  );
  assert.match(
    css,
    /\.page\s*\{[\s\S]*?align-items:\s*stretch\s*!important/
  );
  assert.match(
    css,
    /@media \(max-width:\s*768px\)[\s\S]*?\.surface\s*\{[\s\S]*?margin-left:\s*max\(var\(--covision-mobile-page-gap/
  );
  assert.match(
    css,
    /@media \(max-width:\s*768px\)[\s\S]*?\.surface\s*\{[\s\S]*?padding-left:\s*var\(--covision-surface-mobile-pad-x\)\s*!important/
  );
});

test("covision mobile shell does not double offset the glass panel", () => {
  const component = read("components/covision/CovisionPage.jsx");

  assert.match(component, /max-\[768px\]:py-0/);
  assert.doesNotMatch(component, /max-\[768px\]:py-\[max\(/);
});

test("covision overview back restores the workspace without panel collapse morphs", () => {
  const component = read("components/covision/CovisionPage.jsx");

  assert.doesNotMatch(component, /const \[isClosing,\s*setIsClosing\]\s*=\s*useState\(false\)/);
  assert.doesNotMatch(component, /setIsClosing\(true\);/);
  assert.doesNotMatch(component, /waitForGlassRingTilt:\s*true/);
  assert.doesNotMatch(
    component,
    /motion-safe:animate-\[glassRingTiltFromLeft_540ms_cubic-bezier\(0\.42,0,0\.58,1\)_both\]/
  );
  assert.doesNotMatch(component, /markWorkspacePanelMorph\("collapse",\s*"\/vestlus"\);/);
  assert.doesNotMatch(component, /delayMs:\s*WORKSPACE_PANEL_MORPH_DELAY_MS/);
  assert.match(component, /persistGlassRingTilt:\s*false/);
});
