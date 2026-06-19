import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { readCssBundle } from "../helpers/cssSourceBundle.mjs";

function readSource(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("mobile glass panels do not inherit desktop shell shadows", () => {
  const foundationsCss = readSource("app/styles/mobile/foundations.css");
  const finalSurfacesCss = readCssBundle("app/styles/mobile/panel-surfaces.css");
  const workspaceShadowCss = readSource(
    "app/styles/shared/mobile-workspace-shadow-surfaces.css"
  );
  const chatEntryCss = readSource("app/styles/features/chat/index.css");
  const wellbeingEntryCss = readSource("app/styles/features/wellbeing/index.css");
  const chatCss = readCssBundle("app/styles/features/chat/index.css");
  const wellbeingCss = readCssBundle("app/styles/features/wellbeing/index.css");
  const dashboardCardsCss = `${chatCss}\n${wellbeingCss}`;
  const policyMobileTallCss = readSource("app/styles/features/policy/mobile-tall.css");
  const mobileEntryCss = readSource("app/styles/mobile.css");
  const stableCss = readSource("app/styles/utilities/glass-ring-stable.shared.css");

  assert.match(
    stableCss,
    /:root\.theme-mid \.glass-ring\.glass-ring--desktop-stable\s*\{[\s\S]*?box-shadow:\s*0 24px 48px rgba\(12,\s*7,\s*6,\s*0\.34\) !important;/
  );

  assert.match(
    foundationsCss,
      /@media \(max-width:\s*768px\)[\s\S]*?:root\.theme-mid \.glass-ring\.glass-ring--desktop-stable,[\s\S]*?\.glass-ring\.glass-ring--desktop-stable,[\s\S]*?\.glass-subpage-surface,[\s\S]*?\.mobile-keep-desktop-glass-cards\s*\{[\s\S]*?--glass-shell-shadow:\s*none !important;[\s\S]*?box-shadow:\s*none !important;/
  );
  assert.doesNotMatch(foundationsCss, /\.workspace-feature-panel\.workspace-scroll-surface/);
  assert.match(
    workspaceShadowCss,
    /@media \(max-width:\s*768px\)[\s\S]*?:is\(\.workspace-dashboard-panel,\s*\.workspace-feature-panel\.workspace-scroll-surface,\s*\.wellbeing-page-surface\)\s*\{[\s\S]*?--glass-shell-shadow:\s*none !important;[\s\S]*?box-shadow:\s*none !important;/
  );

  assert.match(
    finalSurfacesCss,
      /@media \(max-width:\s*768px\)[\s\S]*?html\[data-layout="mobile"\]\.theme-mid body\[data-layout="mobile"\][\s\S]*?\.glass-ring\.glass-ring--desktop-stable,[\s\S]*?\.mobile-keep-desktop-glass-cards\s*\{[\s\S]*?--glass-shell-shadow:\s*none !important;[\s\S]*?box-shadow:\s*none(?:\s*!important)?;/
  );
  assert.doesNotMatch(finalSurfacesCss, /\.workspace-dashboard-panel/);
  assert.doesNotMatch(finalSurfacesCss, /workspace-dashboard-card/);
  assert.match(chatEntryCss, /@import url\("\.\/workspace-dashboard-cards\.css"\);/);
  assert.match(wellbeingEntryCss, /@import url\("\.\/mobile-dashboard-cards\.css"\);/);
  assert.match(
    dashboardCardsCss,
    /html\[data-layout="mobile"\] body\[data-layout="mobile"\][\s\S]*?:is\(\.workspace-dashboard-panel,\s*\.wellbeing-page-surface\)[\s\S]*?\.workspace-dashboard-card\s*\{[\s\S]*?--workspace-card-icon-size:\s*clamp\(2\.82rem,\s*11\.5vw,\s*3\.1rem\) !important;[\s\S]*?row-gap:\s*0\.82rem !important;[\s\S]*?box-shadow:\s*none !important;/
  );
  assert.match(
    dashboardCardsCss,
    /\.workspace-dashboard-card\s*\[class\*="cardIcon"\]\s*\{[\s\S]*?transform:\s*translateY\(0\.3rem\) !important;/
  );
  assert.match(
    dashboardCardsCss,
    /\.workspace-dashboard-card\s*\[class\*="cardTitle"\]\s*\{[\s\S]*?font-size:\s*clamp\(1\.14rem,\s*4\.7vw,\s*1\.28rem\) !important;[\s\S]*?transform:\s*translateY\(0\.22rem\) !important;/
  );
  assert.match(
    chatCss,
    /\.workspace-dashboard-card\[class\*="card_document_drafting"\][\s\S]*?\[class\*="cardTitle"\]\s*\{[\s\S]*?max-width:\s*100% !important;[\s\S]*?font-size:\s*clamp\(1\.14rem,\s*4\.7vw,\s*1\.28rem\) !important;[\s\S]*?white-space:\s*nowrap !important;/
  );
  assert.match(
    chatCss,
    /\.workspace-dashboard-card\[class\*="card_document_drafting"\][\s\S]*?\[class\*="cardIcon"\]\s*\{[\s\S]*?width:\s*calc\(var\(--workspace-card-icon-size\) \* 1\.22\) !important;[\s\S]*?height:\s*calc\(var\(--workspace-card-icon-size\) \* 1\.22\) !important;[\s\S]*?transform:\s*translateY\(0\.8rem\) !important;/
  );
  assert.doesNotMatch(finalSurfacesCss, /policy-mobile-tall/);
  assert.match(
    policyMobileTallCss,
    /\.policy-scroll-page-ring\.policy-mobile-tall\s*\{[\s\S]*?--policy-scroll-overscan-bottom:\s*calc\([\s\S]*?clamp\(2\.1rem,\s*6vh,\s*3\.4rem\)[\s\S]*?\) !important;[\s\S]*?padding-bottom:\s*0 !important;/
  );
  assert.match(
    policyMobileTallCss,
    /\.policy-scroll-page-ring\.policy-mobile-tall[\s\S]*?\.policy-scroll-page-scroller\s*\{[\s\S]*?padding-bottom:\s*var\(--policy-scroll-overscan-bottom\) !important;[\s\S]*?scroll-padding-bottom:\s*calc\(var\(--policy-scroll-overscan-bottom\) \+ 1\.25rem\) !important;[\s\S]*?mask-image:\s*none !important;/
  );
  assert.match(
    policyMobileTallCss,
    /\.policy-scroll-page-ring\.policy-mobile-tall::before,[\s\S]*?\.policy-scroll-page-ring\.policy-mobile-tall::after\s*\{[\s\S]*?content:\s*none !important;[\s\S]*?display:\s*none !important;/
  );
  const titleImportIndex = mobileEntryCss.lastIndexOf(
    '@import url("./mobile/subpage-title-system.css");'
  );
  const surfacesImportIndex = mobileEntryCss.lastIndexOf(
    '@import url("./mobile/panel-surfaces.css");'
  );
  assert.ok(titleImportIndex >= 0);
  assert.ok(surfacesImportIndex > titleImportIndex);
});

test("mobile top navigation title is large enough to match subpage headings", () => {
  const titleCss = readCssBundle("app/styles/features/chat/index.css");

  assert.match(
    titleCss,
    /\.chat-mobile-topnav \.mobile-shared-topnav-title\s*\{[\s\S]*?font-size:\s*clamp\(1\.36rem,\s*5\.5vw,\s*1\.54rem\) !important;/
  );
  assert.match(
    titleCss,
    /\.chat-mobile-topnav \.mobile-shared-topnav-title\s*\{[\s\S]*?font-family:[\s\S]*?var\(--font-aino\),[\s\S]*?sans-serif !important;[\s\S]*?text-shadow:\s*none !important;/
  );
  assert.doesNotMatch(
    titleCss,
    /\.chat-mobile-topnav \.mobile-shared-topnav-title\s*\{[\s\S]*?var\(--font-aino-headline\)/
  );
});
