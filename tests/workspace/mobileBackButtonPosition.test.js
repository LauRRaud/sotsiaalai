import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function readSource(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("workspace dashboard mobile back icon is not offset from the shared chat back anchor", () => {
  const workspaceSource = readSource("components/chat/WorkspacePanel.jsx");
  const chatTopNavSource = readSource("components/alalehed/chat/view/ChatMobileTopNav.jsx");
  const headerSource = readSource("components/ui/GlassSubpageHeader.jsx");
  const anchorSelectorSource = headerSource.match(/const BACK_ANCHOR_SELECTOR = \[[\s\S]*?\]\.join/)?.[0] || "";
  const mobileCss = readSource("app/styles/mobile.css");

  assert.match(
    workspaceSource,
    /className=\{cn\("workspace-dashboard-panel",\s*styles\.panel/
  );
  assert.match(
    workspaceSource,
    /<GlassSubpageHeader[\s\S]*?onBack=\{handleWorkspaceBack\}/
  );
  assert.match(
    chatTopNavSource,
    /className=\{cn\(\s*glassPageBackMobileBottomCenterClassName,[\s\S]*?"pointer-events-auto !z-\[123\] rounded-full"/
  );
  assert.match(
    headerSource,
    /\.glass-ring/
  );
  assert.doesNotMatch(
    anchorSelectorSource,
    /\.workspace-dashboard-panel/
  );
  assert.match(
    headerSource,
    /button\.closest\?\.\("\.workspace-dashboard-panel"\)/
  );
  assert.doesNotMatch(
    mobileCss,
    /\.workspace-dashboard-panel \.glass-subpage-back-button--anchored/
  );
  assert.match(
    mobileCss,
    /\.workspace-dashboard-panel \.glass-subpage-title-wrap\s*\{[\s\S]*?padding-top:\s*calc\(var\(--mobile-safe-top,\s*env\(safe-area-inset-top,\s*0px\)\) \+ 1\.08rem\)\s*!important;/
  );
});

test("shared subpage header anchors the back icon to the visible glass surface", () => {
  const headerSource = readSource("components/ui/GlassSubpageHeader.jsx");
  const anchorSelectorSource = headerSource.match(/const BACK_ANCHOR_SELECTOR = \[[\s\S]*?\]\.join/)?.[0] || "";
  const glassStyles = readSource("app/styles/components/glass.css");

  assert.match(headerSource, /const BACK_ANCHOR_SELECTOR = \[/);
  assert.match(headerSource, /\.materials-page-content/);
  assert.match(headerSource, /\.covision-page-surface/);
  assert.doesNotMatch(
    anchorSelectorSource,
    /\.workspace-dashboard-panel/
  );
  assert.match(headerSource, /\.workspace-feature-panel/);
  assert.match(headerSource, /\.documents-workspace-shell/);
  assert.match(headerSource, /button\?\.closest\?\.\(BACK_ANCHOR_SELECTOR\)/);
  assert.match(headerSource, /function getFixedContainingBlockRect\(element\)/);
  assert.match(headerSource, /rect\.left - containingBlock\.left \+ insets\.left/);
  assert.match(headerSource, /const targetLeft = anchorRect\.left \+ insets\.left/);
  assert.match(headerSource, /currentLeft \+ deltaLeft/);
  assert.match(headerSource, /anchorBack = true/);
  assert.match(headerSource, /const shouldAnchorBack = Boolean\(hasBack && anchorBack\)/);
  assert.match(headerSource, /className=\{cn\([\s\S]*glassSubpageBackButtonClassName,[\s\S]*backAnchorStyle \? "glass-subpage-back-button--anchored" : null/);

  assert.match(
    glassStyles,
    /\.glass-subpage-back-button--anchored\s*\{[\s\S]*?position:\s*fixed\s*!important[\s\S]*?left:\s*var\(--glass-subpage-back-left\)\s*!important[\s\S]*?top:\s*var\(--glass-subpage-back-top\)\s*!important/
  );
});

test("service map mobile back icon matches the workspace visual inset", () => {
  const serviceMapSource = readSource("components/workspace/WorkspaceFeaturePage.jsx");
  const serviceMapCss = readSource("app/styles/components/service-map.css");

  assert.match(
    serviceMapSource,
    /className=\{cn\(glassPageBackTopLeftClassName,\s*"service-map-workspace__back"\)\}/
  );
  assert.match(
    serviceMapCss,
    /@media \(max-width:\s*768px\)[\s\S]*?\.service-map-workspace__back\s*\{[\s\S]*?top:\s*calc\(env\(safe-area-inset-top,\s*0px\) \+ 0\.2rem\)\s*!important[\s\S]*?left:\s*calc\(env\(safe-area-inset-left,\s*0px\) \+ 0\.42rem\)\s*!important/
  );
  assert.doesNotMatch(
    serviceMapCss,
    /@media \(max-width:\s*768px\)[\s\S]*?\.service-map-workspace__back\s*\{[\s\S]*?left:\s*calc\(env\(safe-area-inset-left,\s*0px\) \+ 0\.04rem - 1rem\)/
  );
});

test("service map mobile filter toggle is larger with a larger arrow and narrow shadow", () => {
  const serviceMapCss = readSource("app/styles/components/service-map.css");
  const serviceMapSource = readSource("components/workspace/WorkspaceFeaturePage.jsx");

  assert.match(
    serviceMapCss,
    /@media \(max-width:\s*768px\)[\s\S]*?\.service-map-workspace\s*\{[\s\S]*?--service-map-mobile-control-size:\s*3\.12rem/
  );
  assert.match(
    serviceMapCss,
    /@media \(max-width:\s*768px\)[\s\S]*?\.service-map-workspace__toggle svg\s*\{[\s\S]*?width:\s*2\.72rem[\s\S]*?height:\s*2\.72rem/
  );
  assert.match(
    serviceMapSource,
    /d=\{open \? "M5 15L12 8L19 15" : "M5 9L12 16L19 9"\}[\s\S]*?stroke="var\(--service-map-toggle-arrow-color, var\(--back-arrow-color, #c57171\)\)"[\s\S]*?strokeWidth="2\.1"[\s\S]*?opacity="0\.9"/
  );
  assert.match(
    serviceMapCss,
    /--service-map-toggle-arrow-color:\s*#c57171/
  );
  assert.match(
    serviceMapCss,
    /:root\.theme-light \.service-map-workspace__toggle,\s*:root\.theme-mid \.service-map-workspace__toggle\s*\{[\s\S]*?--service-map-toggle-arrow-color:\s*#7A3A38/
  );
  assert.match(
    serviceMapCss,
    /--service-map-mobile-toggle-shadow:\s*0 0\.24rem 0\.48rem rgba\(0,\s*0,\s*0,\s*0\.13\)/
  );
  assert.doesNotMatch(
    serviceMapCss,
    /@media \(max-width:\s*768px\)[\s\S]*?\.service-map-workspace__toggle[\s\S]*?0 0\.55rem 1\.05rem/
  );
  assert.match(
    serviceMapCss,
    /@media \(max-width:\s*768px\)[\s\S]*?\.service-map-workspace__filters:not\(\.service-map-workspace__filters--collapsed\) \.service-map-workspace__toggle[\s\S]*?background:[\s\S]*?var\(--service-map-control-glass-bg\)\s*!important[\s\S]*?box-shadow:\s*var\(--service-map-mobile-toggle-shadow\)\s*!important/
  );
  assert.doesNotMatch(
    serviceMapCss,
    /@media \(max-width:\s*768px\)[\s\S]*?\.service-map-workspace__filters:not\(\.service-map-workspace__filters--collapsed\) \.service-map-workspace__toggle[\s\S]*?background:\s*transparent\s*!important/
  );
});
