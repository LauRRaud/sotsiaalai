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
  assert.match(css, /\.surface\.surface > :global\(\.workspace-guide-panel-scroll\)\s*\{[\s\S]*?0\.75rem[\s\S]*?\}\s*\}/);
  assert.match(css, /\.surface\.surface :global\(\.workspace-scroll-back-button\)\s*\{[\s\S]*?0\.75rem[\s\S]*?\}/);
  assert.match(css, /\.surface\.surface :global\(\.dashboard-info-trigger-corner\)\s*\{[\s\S]*?1\.175rem[\s\S]*?\}/);
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
  assert.match(
    toolsGrid,
    /padding:\s*clamp\(0\.22rem,\s*0\.8vh,\s*0\.45rem\)\s*clamp\(0\.4rem,\s*1vw,\s*0\.72rem\)\s*clamp\(0\.36rem,\s*0\.85vh,\s*0\.46rem\);/
  );
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

test("wellbeing quick check output uses separators instead of nested cards", () => {
  const css = readFileSync(new URL("../../components/wellbeing/WellbeingPage.module.css", import.meta.url), "utf8");
  const sharedCardSelector = css.match(/\.quickCheckFieldset,[\s\S]*?\.quickCheckToggleGroup\s*\{[\s\S]*?\n\}/)?.[0] || "";
  const outputBlocks = [...css.matchAll(/\.quickCheckOutput\s*\{[^}]*\}/g)].map((match) => match[0]);
  const outputCardBlocks = [...css.matchAll(/\.quickCheckOutputCard\s*\{[^}]*\}/g)].map((match) => match[0]);
  const output = outputBlocks.find((block) => block.includes("border-top")) || "";
  const outputCard = outputCardBlocks.find((block) => block.includes("background: transparent")) || "";

  assert.match(sharedCardSelector, /\.quickCheckFieldset,/);
  assert.match(sharedCardSelector, /\.quickCheckToggleGroup/);
  assert.doesNotMatch(sharedCardSelector, /\.quickCheckIntro/);
  assert.doesNotMatch(sharedCardSelector, /\.quickCheckOutput/);
  assert.doesNotMatch(sharedCardSelector, /\.quickCheckOutputCard/);
  assert.match(output, /border-top:\s*1px solid var\(--wellbeing-card-border\)/);
  assert.doesNotMatch(output, /background:/);
  assert.match(outputCard, /background:\s*transparent/);
  assert.match(outputCard, /border-top:\s*1px solid/);
  assert.match(outputCard, /box-shadow:\s*none/);
});

test("wellbeing dropdown shows the selected item darker than unselected choices", () => {
  const css = readFileSync(new URL("../../components/wellbeing/WellbeingPage.module.css", import.meta.url), "utf8");

  assert.match(css, /--wellbeing-dropdown-item-bg:\s*rgb\(239,\s*230,\s*224\)/);
  assert.match(css, /--wellbeing-dropdown-selected-bg:\s*rgba\(31,\s*38,\s*50,\s*0\.9\)/);
  assert.match(css, /:global\(:root\.theme-mid \.documents-dropdown-menu\.wellbeing-dropdown-menu\)\s*\{[\s\S]*?--wellbeing-dropdown-selected-bg:\s*rgba\(31,\s*38,\s*50,\s*0\.9\)/);
  assert.match(
    css,
    /:global\(\.documents-dropdown-menu\.wellbeing-dropdown-menu \.documents-dropdown-item\)[\s\S]*?background:\s*var\(--wellbeing-dropdown-item-bg\)/
  );
  assert.match(
    css,
    /:global\(\.documents-dropdown-menu\.wellbeing-dropdown-menu \.documents-dropdown-item\.is-active\)[\s\S]*?background:\s*var\(--wellbeing-dropdown-selected-bg\)/
  );
  assert.doesNotMatch(
    css,
    /\.page :global\(\.wellbeing-dropdown \.documents-dropdown-item:is\(:hover, :focus-visible, \.is-active\)\)/
  );
});
