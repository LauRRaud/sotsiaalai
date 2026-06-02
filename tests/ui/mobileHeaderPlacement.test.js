import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { readMobileCssBundle } from "../helpers/mobileCssBundle.mjs";


function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("mobile title, back and info placement is centralized", () => {
  const globalsCss = read("app/styles/globals.css");
  const mobileIndexCss = read("app/styles/mobile/index.css");
  const headerCss = read("app/styles/mobile/subpage-title-system.css");
  const policyCss = read("app/styles/mobile/policy-scroll.css");
  const mobileCss = readMobileCssBundle();
  const workspacePanelCss = read("components/chat/WorkspacePanel.module.css");

  assert.match(
    globalsCss,
    /@import url\("\.\/mobile\/index\.css"\) screen and \(max-width: 768px\);/
  );
  assert.match(mobileIndexCss, /@import url\("\.\.\/mobile\.css"\);/);
  assert.doesNotMatch(mobileIndexCss, /mobile-title-backbutton-info\.css/);
  assert.match(mobileCss, /--mobile-header-back-top:\s*0\.2rem;/);
  assert.match(headerCss, /--mobile-header-back-top:\s*0\.2rem;/);
  assert.match(headerCss, /--mobile-header-info-top:\s*0\.475rem;/);
  assert.match(headerCss, /--mobile-header-title-top:\s*var\(--mobile-common-title-top,\s*2\.18rem\);/);
  assert.match(headerCss, /--mobile-header-browser-y-offset:\s*0rem;/);
  assert.match(headerCss, /--mobile-header-pwa-y-offset:\s*0rem;/);
  assert.match(
    headerCss,
    /\.glass-ring,[\s\S]*?\.subscription-modal-content\s*\{[\s\S]*?--mobile-header-title-top:\s*2\.355rem;/
  );
  assert.match(
    headerCss,
    /\.policy-scroll-page-ring\s*\{[\s\S]*?--mobile-header-title-top:\s*var\(--mobile-common-title-top,\s*2\.18rem\);/
  );
  assert.doesNotMatch(headerCss, /\.policy-scroll-page-ring[\s\S]*?--mobile-header-pwa-y-offset:\s*-/);
  assert.match(
    headerCss,
    /\.workspace-dashboard-panel,[\s\S]*?\.workspace-dashboard-panel \.workspace-guide-panel-scroll\s*\{[\s\S]*?--mobile-header-title-top:\s*1\.96rem;/
  );
  assert.doesNotMatch(headerCss, /data-display-mode="browser"[\s\S]*?--mobile-header-browser-y-offset/);
  assert.doesNotMatch(headerCss, /--mobile-header-title-top:\s*calc\([\s\S]*?safe-area-inset-top/);
  assert.match(
    headerCss,
    /\.policy-scroll-page-scroller\s*\{[\s\S]*?--mobile-header-control-top:\s*calc\([\s\S]*?--policy-scroll-edge-pad-top[\s\S]*?--policy-scroll-overscan-top[\s\S]*?- 0\.54rem/
  );
  assert.match(
    headerCss,
    /\.workspace-dashboard-panel,[\s\S]*?\.workspace-dashboard-panel \.workspace-guide-panel-scroll\s*\{[\s\S]*?--mobile-header-back-left:\s*calc\(env\(safe-area-inset-left,\s*0px\) \+ 0\.04rem - 1rem\);[\s\S]*?--mobile-header-control-top:\s*calc\([\s\S]*?--mobile-header-back-top[\s\S]*?- 1\.05rem/
  );
  assert.match(
    headerCss,
    /:is\([\s\S]*?\.workspace-dashboard-panel,[\s\S]*?\.policy-scroll-page-ring[\s\S]*?\)\s*:is\(\.glass-subpage-title-wrap,\s*\.policy-mobile-title-wrap\)\s*\{[\s\S]*?padding-top:\s*calc\([\s\S]*?var\(--mobile-header-title-top\)[\s\S]*?var\(--mobile-header-browser-y-offset,\s*0rem\)[\s\S]*?var\(--mobile-header-pwa-y-offset,\s*0rem\)[\s\S]*?\)\s*!important;/
  );
  assert.match(
    headerCss,
    /:is\([\s\S]*?\.workspace-dashboard-panel,[\s\S]*?\.invite-modal-content,[\s\S]*?\.policy-scroll-page-ring[\s\S]*?\)\s*:is\([\s\S]*?\.workspace-scroll-back-button,[\s\S]*?\.scroll-reactive-back[\s\S]*?\)\s*\{[\s\S]*?top:\s*calc\([\s\S]*?var\(--mobile-header-control-top\)[\s\S]*?var\(--mobile-header-browser-y-offset,\s*0rem\)[\s\S]*?var\(--mobile-header-pwa-y-offset,\s*0rem\)[\s\S]*?\)\s*!important;/
  );
  assert.match(
    headerCss,
    /\.dashboard-info-trigger-corner\s*\{[\s\S]*?top:\s*calc\([\s\S]*?var\(--mobile-header-control-info-top\)[\s\S]*?var\(--mobile-header-browser-y-offset,\s*0rem\)[\s\S]*?var\(--mobile-header-pwa-y-offset,\s*0rem\)[\s\S]*?\)\s*!important;/
  );
  assert.doesNotMatch(
    policyCss,
    /\.policy-scroll-page-ring[\s\S]*?:is\(\.glass-subpage-back-button,\s*\.workspace-scroll-back-button\)[\s\S]*?top:/
  );
  assert.doesNotMatch(policyCss, /\.policy-scroll-page-ring \.glass-subpage-title-wrap\s*\{/);
  assert.doesNotMatch(mobileCss, /\.policy-scroll-back-button/);
  assert.doesNotMatch(mobileCss, /--workspace-pwa-(?:header|back)-lift/);
  assert.doesNotMatch(workspacePanelCss, /--workspace-dashboard-mobile-(?:header|back)-lift/);
});
