import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { readMobileCssBundle } from "../helpers/mobileCssBundle.mjs";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("mobile title, back and info placement is centralized without PWA-only offsets", () => {
  const globalsCss = read("app/styles/globals.css");
  const mobileIndexCss = read("app/styles/mobile/index.css");
  const headerCss = read("app/styles/mobile/subpage-title-system.css");
  const scrollPanelsCss = read("app/styles/mobile/scroll-panels.css");
  const mobileCss = readMobileCssBundle();
  const workspacePanelCss = read("components/chat/WorkspacePanel.module.css");

  assert.match(globalsCss, /@import url\("\.\/mobile\/index\.css"\) screen and \(max-width: 768px\);/);
  assert.match(mobileIndexCss, /@import url\("\.\.\/mobile\.css"\);/);
  assert.match(headerCss, /--mobile-header-back-top:\s*0\.2rem;/);
  assert.match(headerCss, /--mobile-header-info-top:\s*0\.475rem;/);
  assert.match(headerCss, /--mobile-header-title-top:\s*1\.76rem;/);
  assert.match(headerCss, /--mobile-header-browser-y-offset:\s*0rem;/);
  assert.match(headerCss, /--mobile-header-pwa-y-offset:\s*0rem;/);
  assert.match(
    headerCss,
    /\.workspace-dashboard-panel,[\s\S]*?\.workspace-feature-panel\.workspace-scroll-surface,[\s\S]*?\.wellbeing-page-surface \.workspace-guide-panel-scroll\s*\{[\s\S]*?--mobile-header-back-left:[\s\S]*?0\.82rem[\s\S]*?--mobile-header-info-right:[\s\S]*?0\.55rem[\s\S]*?--mobile-header-title-top:\s*1\.94rem;[\s\S]*?--mobile-header-control-top:\s*calc\([\s\S]*?- 0\.74rem/
  );
  assert.match(
    headerCss,
    /\.wellbeing-page-surface,[\s\S]*?\.wellbeing-page-surface \.workspace-guide-panel-scroll\s*\{[\s\S]*?--mobile-header-control-top:\s*calc\([\s\S]*?- 0\.74rem/
  );
  assert.match(
    headerCss,
    /\.workspace-feature-panel\.workspace-scroll-surface\.wellbeing-page-surface,[\s\S]*?\.workspace-guide-panel-scroll\s*\{[\s\S]*?--mobile-header-info-right:\s*calc\(env\(safe-area-inset-right,\s*0px\) \+ 1\.76rem\);[\s\S]*?- 0\.64rem/
  );
  assert.match(
    headerCss,
    /\.workspace-dashboard-panel,[\s\S]*?\.workspace-dashboard-panel \.workspace-guide-panel-scroll\s*\{[\s\S]*?--mobile-header-back-left:\s*calc\(env\(safe-area-inset-left,\s*0px\) \+ 0\.04rem\);[\s\S]*?--mobile-header-info-right:\s*calc\(env\(safe-area-inset-right,\s*0px\) \+ 0\.98rem\);[\s\S]*?--mobile-header-title-top:\s*1\.72rem;[\s\S]*?- 1\.69rem/
  );
  assert.match(
    headerCss,
    /\.policy-scroll-page-scroller\s*\{[\s\S]*?--mobile-header-back-left:\s*calc\(env\(safe-area-inset-left,\s*0px\) - 0\.38rem\);[\s\S]*?--mobile-header-title-top:\s*1\.94rem;[\s\S]*?--mobile-header-control-top:\s*calc\([\s\S]*?var\(--policy-scroll-edge-pad-top,\s*0px\)[\s\S]*?var\(--policy-scroll-overscan-top,\s*0px\)[\s\S]*?var\(--mobile-header-back-top\) - 0\.74rem/
  );
  assert.match(
    headerCss,
    /:is\(\.workspace-dashboard-panel,\s*\.workspace-feature-panel\.workspace-scroll-surface,\s*\.wellbeing-page-surface\)[\s\S]*?:is\(\.glass-subpage-title,[\s\S]*?\.glass-page-title\)\s*\{[\s\S]*?margin-top:\s*0\s*!important;[\s\S]*?margin-bottom:\s*0\s*!important;/
  );
  assert.match(
    headerCss,
    /:is\([\s\S]*?\.workspace-dashboard-panel[\s\S]*?\)\s*:is\(\.glass-subpage-title-wrap,\s*\.policy-mobile-title-wrap\)\s*\{[\s\S]*?padding-top:\s*calc\([\s\S]*?var\(--mobile-header-title-top\)[\s\S]*?var\(--mobile-header-browser-y-offset,\s*0rem\)[\s\S]*?var\(--mobile-header-pwa-y-offset,\s*0rem\)[\s\S]*?\)\s*!important;/
  );
  assert.match(
    headerCss,
    /:is\([\s\S]*?\.workspace-dashboard-panel[\s\S]*?\)\s*:is\([\s\S]*?\.workspace-scroll-back-button[\s\S]*?\)\s*\{[\s\S]*?top:\s*calc\([\s\S]*?var\(--mobile-header-control-top\)[\s\S]*?var\(--mobile-header-browser-y-offset,\s*0rem\)[\s\S]*?var\(--mobile-header-pwa-y-offset,\s*0rem\)[\s\S]*?\)\s*!important;/
  );
  assert.match(
    headerCss,
    /:is\(\.dashboard-info-trigger-corner,\s*\.service-map-workspace__info\)\s*\{[\s\S]*?top:\s*calc\([\s\S]*?var\(--mobile-header-control-info-top\)[\s\S]*?var\(--mobile-header-browser-y-offset,\s*0rem\)[\s\S]*?var\(--mobile-header-pwa-y-offset,\s*0rem\)[\s\S]*?\)\s*!important;/
  );
  assert.match(
    workspacePanelCss,
    /\.backButton\s*\{[\s\S]*?top:\s*calc\([\s\S]*?var\(--mobile-header-control-top,\s*0\.05rem\)[\s\S]*?var\(--mobile-header-browser-y-offset,\s*0rem\)[\s\S]*?var\(--mobile-header-pwa-y-offset,\s*0rem\)[\s\S]*?\)\s*!important;/
  );
  assert.match(headerCss, /\.rag-admin-shell-card\s*\{[\s\S]*?padding-top:\s*calc\(var\(--mobile-header-title-top\) \+ 2\.65rem\)\s*!important;/);
  assert.doesNotMatch(headerCss, /\.rag-admin-shell-card[\s\S]*?backdrop-filter:\s*none\s*!important;/);
  assert.doesNotMatch(headerCss, /\.rag-admin-page-shell[\s\S]*?backdrop-filter:\s*none\s*!important;/);
  assert.match(scrollPanelsCss, /\.glass-subpage-surface:not\(\.rag-admin-shell-card\)/);
  assert.doesNotMatch(scrollPanelsCss, /^\s*\.glass-subpage-surface,\s*$/m);
  assert.match(headerCss, /\.rag-admin-shell-card \.rag-admin-shell-back\s*\{[\s\S]*?position:\s*absolute\s*!important;[\s\S]*?top:\s*calc\(/);
  assert.match(headerCss, /\.admin-framework-acceptances-page\s*\{[\s\S]*?padding-top:\s*calc\(var\(--mobile-header-title-top\) \+ 2\.9rem\)\s*!important;/);
  assert.doesNotMatch(headerCss, /data-display-mode="browser"[\s\S]*?--mobile-header-browser-y-offset/);
  assert.doesNotMatch(headerCss, /data-display-mode="standalone"[\s\S]*?--mobile-header-pwa-y-offset/);
  assert.doesNotMatch(mobileCss, /--workspace-pwa-(?:header|back)-lift/);
  assert.doesNotMatch(workspacePanelCss, /--workspace-dashboard-mobile-(?:header|back)-lift/);
});

test("admin RAG and framework acceptance pages expose mobile header hooks", () => {
  const ragStyles = read("components/admin/rag/ragAdminShellStyles.js");
  const ragFrame = read("components/admin/rag/RagAdminPageFrame.jsx");
  const ragLanding = read("components/admin/rag/RagAdminLandingWorkspace.jsx");
  const acceptances = read("components/admin/FrameworkAcceptancesAdmin.jsx");

  assert.match(ragStyles, /rag-admin-page-shell/);
  assert.match(ragStyles, /rag-admin-shell-card/);
  assert.match(ragStyles, /rag-admin-shell-title/);
  assert.match(ragStyles, /min-\[769px\]:backdrop-blur-\[16px\]/);
  assert.doesNotMatch(ragStyles, /[^:\w-]backdrop-blur-\[16px\]\s+\[-webkit-backdrop-filter:blur\(16px\)\]/);
  assert.match(ragFrame, /rag-admin-shell-back/);
  assert.match(ragLanding, /rag-admin-shell-back/);
  assert.match(acceptances, /admin-framework-acceptances-page/);
});
