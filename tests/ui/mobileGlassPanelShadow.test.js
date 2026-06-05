import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function readSource(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("mobile glass panels do not inherit desktop shell shadows", () => {
  const foundationsCss = readSource("app/styles/mobile/foundations.css");
  const finalSurfacesCss = readSource("app/styles/mobile/panel-surfaces.css");
  const mobileEntryCss = readSource("app/styles/mobile.css");
  const stableCss = readSource("app/styles/utilities/glass-ring-stable.shared.css");

  assert.match(
    stableCss,
    /:root\.theme-mid \.glass-ring\.glass-ring--desktop-stable\s*\{[\s\S]*?box-shadow:\s*0 24px 48px rgba\(12,\s*7,\s*6,\s*0\.34\) !important;/
  );

  assert.match(
    foundationsCss,
      /@media \(max-width:\s*768px\)[\s\S]*?:root\.theme-mid \.glass-ring\.glass-ring--desktop-stable,[\s\S]*?\.glass-ring\.glass-ring--desktop-stable,[\s\S]*?\.glass-subpage-surface,[\s\S]*?\.workspace-feature-panel\.workspace-scroll-surface,[\s\S]*?\.wellbeing-page-surface,[\s\S]*?\.mobile-keep-desktop-glass-cards\s*\{[\s\S]*?--glass-shell-shadow:\s*none !important;[\s\S]*?box-shadow:\s*none !important;/
  );

  assert.match(
    finalSurfacesCss,
      /@media \(max-width:\s*768px\)[\s\S]*?html\[data-layout="mobile"\]\.theme-mid body\[data-layout="mobile"\][\s\S]*?\.glass-ring\.glass-ring--desktop-stable,[\s\S]*?\.workspace-dashboard-panel,[\s\S]*?\.wellbeing-page-surface,[\s\S]*?\.mobile-keep-desktop-glass-cards\s*\{[\s\S]*?--glass-shell-shadow:\s*none !important;[\s\S]*?box-shadow:\s*none !important;/
  );
  assert.match(
    finalSurfacesCss,
    /html\[data-layout="mobile"\] body\[data-layout="mobile"\][\s\S]*?:is\(\.workspace-dashboard-panel,\s*\.wellbeing-page-surface\)[\s\S]*?\.workspace-dashboard-card\s*\{[\s\S]*?--workspace-card-icon-size:\s*clamp\(3rem,\s*12\.4vw,\s*3\.35rem\) !important;[\s\S]*?row-gap:\s*1rem !important;[\s\S]*?box-shadow:\s*none !important;/
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
  const titleCss = readSource("app/styles/mobile/subpage-title-system.css");

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
