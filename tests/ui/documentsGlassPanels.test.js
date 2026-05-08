import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("documents and document drafting routes do not render ColorBends", () => {
  const backgroundLayer = read("components/backgrounds/BackgroundLayer.jsx");

  assert.match(backgroundLayer, /COLOR_BENDS_EXCLUDED_PATHS[\s\S]*?"\/documents"/);
  assert.match(backgroundLayer, /COLOR_BENDS_EXCLUDED_PATHS[\s\S]*?"\/dokreziim"/);
});

test("documents library avoids a broad blur shortcut over every panel-like element", () => {
  const css = read("app/styles/components/documents-mode.css");

  assert.doesNotMatch(
    css,
    /\.documents-workspace-page--library\s+:is\([\s\S]*?\.documents-panel[\s\S]*?\)\s*\{[\s\S]*?backdrop-filter:\s*blur/
  );
  assert.doesNotMatch(css, /--documents-library-glass-bg/);
});

test("documents library surface panels use the shared subpage card surface", () => {
  const css = read("app/styles/components/documents-mode.css");

  assert.match(
    css,
    /\.documents-workspace-page--library\s+\.documents-surface-panel\s*\{[\s\S]*?background:\s*var\(--subpage-card-bg\)\s*!important/
  );
  assert.match(
    css,
    /\.documents-workspace-page--library\s+\.documents-surface-panel\s*\{[\s\S]*?border:\s*var\(--subpage-card-border-width,\s*1px\)\s+solid\s+var\(--subpage-card-border\)\s*!important/
  );
  assert.match(
    css,
    /\.documents-workspace-page--library\s+\.documents-surface-panel\s*\{[\s\S]*?backdrop-filter:\s*blur\(var\(--glass-blur-radius,\s*1rem\)\)\s*saturate\(100%\)\s*!important/
  );
});

test("documents and document drafting panels keep the profile glass surface transparent", () => {
  const css = read("app/styles/components/documents-mode.css");
  const documentsPage = read("components/documents/DocumentsPage.jsx");
  const agentPage = read("components/agent/AgentModePage.jsx");

  assert.match(documentsPage, /documents-workspace-page--documents/);
  assert.match(agentPage, /documents-workspace-page--agent/);
  assert.match(
    css,
    /\.documents-workspace-page--library\s*\{[\s\S]*?--documents-glass-surface:\s*var\(--glass-ring-surface-bg,\s*var\(--glass-surface-bg,\s*rgba\(0,\s*0,\s*0,\s*0\.25\)\)\)/
  );
  assert.match(
    css,
    /\.documents-workspace-page--library\s*\{[\s\S]*?--subpage-card-bg:\s*var\(--documents-surface-panel-bg\)/
  );
  assert.doesNotMatch(css, /\.documents-workspace-page--library[\s\S]*?--documents-surface-panel-bg:\s*rgba\([^;]*,\s*0\.9[0-9]*\)/);
  assert.doesNotMatch(css, /\.documents-workspace-page--library[\s\S]*?--documents-panel-bg:\s*rgba\([^;]*,\s*0\.9[0-9]*\)/);
  assert.doesNotMatch(css, /\.documents-workspace-page--library[\s\S]*?--documents-card-bg:\s*rgba\([^;]*,\s*0\.9[0-9]*\)/);
});
