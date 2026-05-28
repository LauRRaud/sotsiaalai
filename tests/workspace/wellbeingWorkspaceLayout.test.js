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

test("wellbeing dashboard uses the same desktop panel sizing and title spacing tokens as workspace", () => {
  const source = readFileSync(new URL("../../components/wellbeing/WellbeingPage.jsx", import.meta.url), "utf8");
  const css = readFileSync(new URL("../../components/wellbeing/WellbeingPage.module.css", import.meta.url), "utf8");

  assert.match(source, /\[--workspace-subpage-header-margin-bottom:0\.35rem\]/);
  assert.match(source, /\[--workspace-subpage-title-margin-top:clamp\(2\.15rem,5\.4vh,3\.25rem\)\]/);
  assert.match(source, /\[--workspace-subpage-title-margin-bottom:clamp\(0\.35rem,1\.4vh,0\.8rem\)\]/);
  assert.match(css, /--workspace-glass-shell-inline-size/);
  assert.doesNotMatch(
    css,
    /\.surface\s*\{[\s\S]*?width:\s*var\(--workspace-glass-inline-size/
  );
});

test("wellbeing dashboard keeps the same flexible vertical card rhythm as workspace", () => {
  const css = readFileSync(new URL("../../components/wellbeing/WellbeingPage.module.css", import.meta.url), "utf8");
  const toolsGrid = css.match(/\.toolsGrid\s*\{[\s\S]*?\n\}/)?.[0] || "";
  const dashboardBody = css.match(/\.dashboardBody\s*\{[\s\S]*?\n\}/)?.[0] || "";

  assert.match(toolsGrid, /flex:\s*1 1 auto;/);
  assert.match(toolsGrid, /min-height:\s*0;/);
  assert.match(toolsGrid, /margin:\s*0 auto;/);
  assert.doesNotMatch(toolsGrid, /height:\s*min\(41\.15rem/);
  assert.match(dashboardBody, /max-width:\s*none\s*!important;/);
  assert.match(dashboardBody, /gap:\s*0\s*!important;/);
  assert.match(dashboardBody, /padding:\s*0\s*!important;/);
  assert.match(dashboardBody, /overflow:\s*visible\s*!important;/);
  assert.match(dashboardBody, /mask-image:\s*none\s*!important;/);
  assert.match(dashboardBody, /-webkit-mask-image:\s*none\s*!important;/);
  assert.match(css, /\.page :global\(\.workspace-guide-panel-scroll\)\s*\{[\s\S]*?mask-image:\s*none\s*!important;/);
  assert.match(css, /\.page :global\(\.workspace-guide-panel-scroll\)\s*\{[\s\S]*?-webkit-mask-image:\s*none\s*!important;/);
});

test("wellbeing tool routes update the header title and info content", () => {
  const source = readFileSync(new URL("../../components/wellbeing/WellbeingPage.jsx", import.meta.url), "utf8");

  assert.match(source, /const activeTitle = activeTool\?\.title \|\|/);
  assert.match(source, /const infoId = activeTool\?\.infoId \|\| WELLBEING_INFO_ID;/);
  assert.match(source, /infoId=\{infoId\}/);
  assert.match(source, /title=\{activeTitle\}/);
  assert.match(source, /\{activeTitle\}/);
});

test("workspace routes wellbeing through the real wellbeing page", () => {
  const source = readFileSync(new URL("../../components/chat/WorkspacePanel.jsx", import.meta.url), "utf8");
  const cards = readFileSync(new URL("../../lib/workspaceDashboardCards.js", import.meta.url), "utf8");

  assert.match(cards, /onClick:\s*\(\) => navigateTo\?\.\("\/tooheaolu"\)/);
  assert.match(source, /router\.push\(href\);/);
  assert.doesNotMatch(source, /WellbeingEmbeddedPanel/);
  assert.doesNotMatch(source, /wellbeingEmbeddedOpen/);
  assert.doesNotMatch(source, /mirrorEmbeddedWellbeingUrl/);
  assert.doesNotMatch(source, /workspacePanelMorph:\s*"content-handoff"/);
  assert.doesNotMatch(cards, /openWellbeing/);
});

test("wellbeing direct page keeps one glass shell and no embedded sizing overrides", () => {
  const source = readFileSync(new URL("../../components/wellbeing/WellbeingPage.jsx", import.meta.url), "utf8");
  const css = readFileSync(new URL("../../components/wellbeing/WellbeingPage.module.css", import.meta.url), "utf8");

  assert.match(source, /styles\.dashboardBody/);
  assert.match(source, /className=\{cn\(surfaceClassName,\s*styles\.surface\)\}/);
  assert.match(source, /infoId=\{infoId\}/);
  assert.match(source, /title=\{activeTitle\}/);
  assert.doesNotMatch(css, /\.embeddedBody/);
});
