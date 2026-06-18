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
  assert.match(source, /\[--workspace-subpage-title-margin-bottom:clamp\(0\.18rem,0\.9vh,0\.42rem\)\]/);
  assert.match(
    css,
    /--wellbeing-desktop-panel-pad-top:\s*clamp\(0\.18rem,\s*0\.65vh,\s*0\.42rem\);/
  );
  assert.match(
    css,
    /--wellbeing-desktop-control-left:\s*calc\(0\.55rem - var\(--workspace-guide-panel-pad-x,\s*1\.1rem\)\);/
  );
  assert.match(
    css,
    /--wellbeing-desktop-guide-overscan-top:\s*clamp\(1\.6rem,\s*4\.8vh,\s*2\.4rem\);/
  );
  assert.match(
    css,
    /--wellbeing-desktop-control-top:\s*calc\([\s\S]*?0\.55rem - var\(--wellbeing-desktop-guide-overscan-top\) -[\s\S]*?var\(--wellbeing-desktop-panel-pad-top\)[\s\S]*?\);/
  );
  assert.match(
    css,
    /--workspace-guide-panel-overscan-top:\s*var\(--wellbeing-desktop-guide-overscan-top\);/
  );
  assert.match(
    css,
    /--workspace-subpage-back-left:\s*var\(--wellbeing-desktop-control-left\);/
  );
  assert.match(
    css,
    /--workspace-subpage-back-top:\s*var\(--wellbeing-desktop-control-top\);/
  );
  assert.match(
    css,
    /\.surface\.surface\.surface\s*\{[\s\S]*?--workspace-subpage-back-top:\s*var\(--wellbeing-desktop-control-top\);/
  );
  assert.match(
    css,
    /--workspace-subpage-title-margin-bottom:\s*clamp\(0\.18rem,\s*0\.9vh,\s*0\.42rem\);/
  );
  assert.match(
    css,
    /padding-top:\s*var\(--wellbeing-desktop-panel-pad-top\)\s*!important;/
  );
  assert.doesNotMatch(
    css,
    /\.surface\.surface > :global\(\.workspace-guide-panel-scroll\)\s*\{[\s\S]*?margin-top:\s*calc\(\s*0px -/
  );
  assert.doesNotMatch(
    css,
    /\.surface\.surface :global\(\.workspace-scroll-back-button\)\s*\{[\s\S]*?\+\s*0\.75rem/
  );
  assert.doesNotMatch(
    css,
    /\.surface\.surface :global\(\.dashboard-info-trigger-corner\)\s*\{[\s\S]*?\+\s*1\.175rem/
  );
  assert.match(css, /--workspace-glass-shell-inline-size/);
  assert.doesNotMatch(
    css,
    /\.surface\s*\{[\s\S]*?width:\s*var\(--workspace-glass-inline-size/
  );
});

test("wellbeing dashboard keeps the same compact two-column mobile grid rhythm as workspace", () => {
  const css = readFileSync(new URL("../../components/wellbeing/WellbeingPage.module.css", import.meta.url), "utf8");
  const workspaceCss = readFileSync(new URL("../../components/chat/WorkspacePanel.module.css", import.meta.url), "utf8");
  const dashboardBody = css.match(/\.dashboardBody\s*\{[\s\S]*?\n\}/)?.[0] || "";

  assert.match(workspaceCss, /@media \(max-width:\s*768px\)[\s\S]*?--workspace-dashboard-mobile-edge-pad:\s*clamp\(0\.58rem,\s*2\.7vw,\s*0\.82rem\);/);
  assert.match(workspaceCss, /@media \(max-width:\s*768px\)[\s\S]*?\.grid\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);/);
  assert.match(workspaceCss, /@media \(max-width:\s*768px\)[\s\S]*?\.grid\s*\{[\s\S]*?padding:[\s\S]*?var\(--workspace-dashboard-mobile-edge-pad\)/);
  assert.match(css, /@media \(max-width:\s*768px\)[\s\S]*?\.toolsGrid\s*\{[\s\S]*?display:\s*grid;/);
  assert.match(css, /@media \(max-width:\s*768px\)[\s\S]*?\.toolsGrid\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);/);
  assert.match(css, /@media \(max-width:\s*768px\)[\s\S]*?\.toolsGrid\s*\{[\s\S]*?grid-auto-rows:\s*minmax\(5\.15rem,\s*1fr\);/);
  assert.match(css, /@media \(max-width:\s*768px\)[\s\S]*?--workspace-dashboard-mobile-edge-pad:\s*clamp\(0\.58rem,\s*2\.7vw,\s*0\.82rem\);/);
  assert.match(css, /@media \(max-width:\s*768px\)[\s\S]*?\.toolsGrid\s*\{[\s\S]*?padding:[\s\S]*?var\(--workspace-dashboard-mobile-edge-pad\)/);
  assert.match(css, /@media \(max-width:\s*768px\)[\s\S]*?\.toolsGrid :global\(\.workspace-dashboard-card\)\s*\{[\s\S]*?--workspace-card-icon-size:\s*clamp\(2\.08rem,\s*8\.8vw,\s*2\.58rem\);/);
  assert.match(css, /@media \(max-width:\s*768px\)[\s\S]*?\.toolsGrid :global\(\.workspace-dashboard-card\) \[class\*="cardIcon"\]\s*\{[\s\S]*?grid-column:\s*1;/);
  assert.match(css, /@media \(max-width:\s*768px\)[\s\S]*?\.toolsGrid :global\(\.workspace-dashboard-card\) \[class\*="cardCopy"\]\s*\{[\s\S]*?grid-row:\s*2;/);
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
  assert.match(source, /const activateDashboardCard = useCallback\(cardKey => \{/);
  assert.match(source, /wellbeing:\s*"\/tooheaolu"/);
  assert.match(source, /const route = routeByCardKey\[cardKey\];[\s\S]*?if \(route\) navigateTo\(route\);/);
  assert.match(source, /onClick=\{card\.disabled \? undefined : handleCardDirectClick\}/);
  assert.match(source, /onPointerUp=\{card\.disabled \? undefined : handleCardDirectPointerUp\}/);
  assert.match(source, /router\.push\(href\);/);
  assert.doesNotMatch(source, /window\.location\.assign\(href\);/);
  assert.doesNotMatch(source, /workspacePanelMorph:\s*"mobile-workspace-route"/);
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

test("wellbeing server pages pass admin access into role gate", () => {
  const page = readFileSync(new URL("../../app/tooheaolu/page.jsx", import.meta.url), "utf8");
  const toolPage = readFileSync(new URL("../../app/tooheaolu/[tool]/page.jsx", import.meta.url), "utf8");

  assert.match(page, /canUseWellbeingRole\(roleState\.effectiveRole,\s*Boolean\(roleState\.isAdmin\)\)/);
  assert.match(toolPage, /canUseWellbeingRole\(roleState\.effectiveRole,\s*Boolean\(roleState\.isAdmin\)\)/);
  assert.doesNotMatch(page, /canUseWellbeingRole\(roleState\.effectiveRole,\s*false\)/);
  assert.doesNotMatch(toolPage, /canUseWellbeingRole\(roleState\.effectiveRole,\s*false\)/);
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
