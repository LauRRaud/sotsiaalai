import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { readServiceMapCssBundle } from "../helpers/serviceMapCssBundle.mjs";
import { readMobileCssBundle } from "../helpers/mobileCssBundle.mjs";


function readSource(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("workspace dashboard mobile back icon is not offset from the shared chat back anchor", () => {
  const workspaceSource = readSource("components/chat/WorkspacePanel.jsx");
  const chatTopNavSource = readSource("components/alalehed/chat/view/ChatMobileTopNav.jsx");
  const headerSource = readSource("components/ui/GlassSubpageHeader.jsx");
  const anchorSelectorSource = headerSource.match(/const BACK_ANCHOR_SELECTOR = \[[\s\S]*?\]\.join/)?.[0] || "";
  const glassPageStylesSource = readSource("components/ui/glassPageStyles.js");
  const workspacePanelCss = readSource("components/chat/WorkspacePanel.module.css");
  const mobileCss = readMobileCssBundle();
  const mobileHeaderCss = readSource("app/styles/mobile/mobile-title-backbutton-info.css");

  assert.match(
    workspaceSource,
    /className=\{cn\("workspace-dashboard-panel",\s*styles\.panel/
  );
  assert.match(
    workspaceSource,
    /<GlassSubpageHeader[\s\S]*?onBack=\{handleWorkspaceBack\}/
  );
  assert.match(
    workspaceSource,
    /<GlassSubpageHeader[\s\S]*?anchorBack=\{false\}/
  );
  assert.match(
    workspaceSource,
    /<GlassSubpageHeader[\s\S]*?backClassName=\{styles\.backButton\}/
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
  assert.doesNotMatch(
    mobileCss,
    /\.workspace-dashboard-panel \.glass-subpage-title-wrap\s*\{/
  );
  assert.match(
    mobileCss,
    /:is\([\s\S]*?\.policy-mobile-title-wrap,[\s\S]*?\.glass-subpage-title-wrap,[\s\S]*?\.workspace-guide-panel \.glass-subpage-title-wrap,[\s\S]*?\.workspace-feature-panel \.glass-subpage-title-wrap[\s\S]*?\)\s*\{[\s\S]*?padding-top:\s*var\(--mobile-common-title-top\)\s*!important;/
  );
  assert.match(
    workspacePanelCss,
    /padding:[\s\S]*?0\.08rem[\s\S]*?calc\(var\(--mobile-safe-bottom,\s*env\(safe-area-inset-bottom,\s*0px\)\) \+ clamp\(0\.55rem,\s*1\.7vh,\s*0\.9rem\)\)/
  );
  assert.doesNotMatch(
    workspacePanelCss,
    /padding:[\s\S]*?calc\(var\(--mobile-safe-top,\s*env\(safe-area-inset-top,\s*0px\)\) \+ 0\.08rem\)/
  );
  assert.match(
    workspacePanelCss,
    /\.backButton\s*\{[\s\S]*?position:\s*absolute\s*!important;[\s\S]*?left:\s*var\(--mobile-header-back-left,\s*0\.55rem\)\s*!important;[\s\S]*?top:\s*var\(--mobile-header-control-top,\s*0\.05rem\)\s*!important;/
  );
  assert.match(
    workspacePanelCss,
    /@media \(min-width:\s*769px\)[\s\S]*?\.backButton\s*\{[\s\S]*?left:\s*var\(--workspace-subpage-back-left,\s*0\.55rem\)\s*!important;[\s\S]*?top:\s*var\(--workspace-subpage-back-top,\s*0\.55rem\)\s*!important;/
  );
  assert.doesNotMatch(workspacePanelCss, /--workspace-dashboard-mobile-header-lift/);
  assert.doesNotMatch(workspacePanelCss, /--workspace-dashboard-mobile-back-lift/);
  assert.doesNotMatch(workspacePanelCss, /0\.04rem - 1rem/);
  assert.doesNotMatch(workspacePanelCss, /\.panel\s*>\s*:global\(\.dashboard-info-trigger-corner\)\s*\{/);
  assert.doesNotMatch(
    mobileHeaderCss,
    /data-display-mode="browser"[\s\S]*?--mobile-header-browser-y-offset/
  );
  assert.match(
    mobileHeaderCss,
    /:is\([\s\S]*?\.workspace-dashboard-panel[\s\S]*?\)\s*:is\(\.glass-subpage-title-wrap,\s*\.policy-mobile-title-wrap\)\s*\{[\s\S]*?padding-top:\s*calc\([\s\S]*?var\(--mobile-header-title-top\)[\s\S]*?var\(--mobile-header-browser-y-offset,\s*0rem\)[\s\S]*?var\(--mobile-header-pwa-y-offset,\s*0rem\)[\s\S]*?\)\s*!important;/
  );
  assert.match(
    mobileHeaderCss,
    /:is\([\s\S]*?\.workspace-dashboard-panel[\s\S]*?\)\s*:is\([\s\S]*?\.glass-subpage-back-button[\s\S]*?\.workspace-scroll-back-button[\s\S]*?\)\s*\{[\s\S]*?top:\s*calc\([\s\S]*?var\(--mobile-header-control-top\)[\s\S]*?var\(--mobile-header-browser-y-offset,\s*0rem\)[\s\S]*?var\(--mobile-header-pwa-y-offset,\s*0rem\)[\s\S]*?\)\s*!important;/
  );
  assert.doesNotMatch(
    workspacePanelCss,
    /@media \(max-width:\s*768px\)[\s\S]*?\.backButton\s*\{[\s\S]*?top:\s*calc\([\s\S]*?var\(--mobile-safe-top,\s*env\(safe-area-inset-top,\s*0px\)\)[\s\S]*?var\(--chat-pad-top,\s*1rem\)/
  );
  assert.match(
    workspacePanelCss,
    /\.roleMenu\s*\{[\s\S]*?top:\s*calc\(var\(--mobile-safe-top,\s*env\(safe-area-inset-top,\s*0px\)\) \+ 0\.42rem\);/
  );
  assert.match(
    glassPageStylesSource,
    /glassPageBackMobileBottomCenterClassName[\s\S]*?top-\[calc\(var\(--mobile-safe-top,env\(safe-area-inset-top,0px\)\)\+0\.2rem\)\]/
  );
  assert.doesNotMatch(mobileCss, /--workspace-pwa-header-lift/);
  assert.doesNotMatch(mobileCss, /--workspace-pwa-back-lift/);
});

test("shared subpage header keeps back icons in the scroll flow by default", () => {
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
  assert.doesNotMatch(headerSource, /function getPwaSafeTopPx\(\)/);
  assert.doesNotMatch(headerSource, /function getAnchorSafeTopDeficit\(anchorRect\)/);
  assert.match(headerSource, /new MutationObserver\(scheduleUpdate\)/);
  assert.match(headerSource, /attributeFilter:\s*\["data-platform",\s*"style"\]/);
  assert.match(headerSource, /rect\.left - containingBlock\.left \+ insets\.left/);
  assert.match(headerSource, /rect\.top - containingBlock\.top \+ insets\.top \+ workspaceRingTopInset/);
  assert.match(headerSource, /const targetLeft = anchorRect\.left \+ insets\.left/);
  assert.match(headerSource, /const targetTop = anchorRect\.top \+ insets\.top \+ workspaceRingTopInset/);
  assert.match(headerSource, /currentLeft \+ deltaLeft/);
  assert.match(headerSource, /anchorBack = false/);
  assert.match(headerSource, /const shouldAnchorBack = Boolean\(hasBack && anchorBack\)/);
  assert.match(headerSource, /className=\{cn\([\s\S]*glassSubpageBackButtonClassName,[\s\S]*backAnchorStyle \? "glass-subpage-back-button--anchored" : null/);

  assert.match(
    glassStyles,
    /\.glass-subpage-back-button--anchored\s*\{[\s\S]*?position:\s*fixed\s*!important[\s\S]*?left:\s*var\(--glass-subpage-back-left\)\s*!important[\s\S]*?top:\s*var\(--glass-subpage-back-top\)\s*!important/
  );
});

test("service map mobile back icon matches the workspace visual inset", () => {
  const serviceMapSource = readSource("components/workspace/WorkspaceFeaturePage.jsx");
  const serviceMapCss = readServiceMapCssBundle();

  assert.match(
    serviceMapSource,
    /className=\{cn\(glassPageBackTopLeftClassName,\s*"service-map-workspace__back"\)\}/
  );
  assert.match(
    serviceMapCss,
    /@media \(max-width:\s*768px\)[\s\S]*?\.service-map-workspace__back\s*\{[\s\S]*?top:\s*calc\(env\(safe-area-inset-top,\s*0px\) \+ 0\.53rem\)\s*!important[\s\S]*?left:\s*calc\(env\(safe-area-inset-left,\s*0px\) \+ 0\.37rem\)\s*!important/
  );
  assert.doesNotMatch(
    serviceMapCss,
    /@media \(max-width:\s*768px\)[\s\S]*?\.service-map-workspace__back\s*\{[\s\S]*?left:\s*calc\(env\(safe-area-inset-left,\s*0px\) \+ 0\.04rem - 1rem\)/
  );
});

test("service map mobile filter toggle is larger with a larger arrow and narrow shadow", () => {
  const serviceMapCss = readServiceMapCssBundle();
  const serviceMapSource = readSource("components/workspace/WorkspaceFeaturePage.jsx");

  assert.match(
    serviceMapCss,
    /@media \(max-width:\s*768px\)[\s\S]*?\.service-map-workspace\s*\{[\s\S]*?--service-map-mobile-control-size:\s*3\.12rem/
  );
  assert.match(
    serviceMapCss,
    /@media \(max-width:\s*768px\)[\s\S]*?\.service-map-workspace\s*\{[\s\S]*?--service-map-mobile-control-top:\s*0\.61rem/
  );
  assert.match(
    serviceMapCss,
    /@media \(max-width:\s*560px\)[\s\S]*?\.service-map-workspace\s*\{[\s\S]*?--service-map-mobile-control-top:\s*0\.61rem/
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
