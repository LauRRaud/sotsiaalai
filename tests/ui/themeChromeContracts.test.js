import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("accessibility preferences own mobile browser chrome color", () => {
  const provider = read("components/accessibility/AccessibilityProvider.jsx");
  const core = read("app/styles/base/core.css");

  assert.match(provider, /function syncThemeChrome\(prefs\)/);
  assert.match(provider, /ensureMetaTag\("theme-color"\)\?\.setAttribute\("content", themeColor\)/);
  assert.match(provider, /apple-mobile-web-app-status-bar-style/);
  assert.match(provider, /syncThemeChrome\(\{ \.\.\.prefs, theme, contrast:/);
  assert.match(provider, /if \(contrast === "hc"\) return "#10151d"/);
  assert.match(core, /html\s*\{[\s\S]*?--app-chrome-bg:\s*#10151d/);
  assert.match(core, /html\[data-contrast="hc"\]\s*\{[\s\S]*?--app-chrome-bg:\s*#10151d/);
  assert.match(core, /html\.theme-light\s*\{[\s\S]*?--app-chrome-bg:\s*#f4f2ee/);
  assert.match(core, /body\s*\{[\s\S]*?background-color:\s*var\(--app-chrome-bg\)/);
});

test("service map does not restore stale theme-color on route exit", () => {
  const workspace = read("components/workspace/WorkspaceFeaturePage.jsx");
  const serviceMapEffect = workspace.match(/useLayoutEffect\(\(\) => \{[\s\S]*?service-map-page-active[\s\S]*?\}, \[\]\);/);

  assert.ok(serviceMapEffect, "service map page-active effect must exist");
  assert.doesNotMatch(serviceMapEffect[0], /theme-color/);
  assert.doesNotMatch(serviceMapEffect[0], /previousThemeColor/);
});

test("accessibility theme preferences are applied before first paint", () => {
  const provider = read("components/accessibility/AccessibilityProvider.jsx");

  assert.match(provider, /import \{[\s\S]*useLayoutEffect[\s\S]*\} from "react"/);
  assert.match(
    provider,
    /useLayoutEffect\(\(\) => \{[\s\S]*?const domPrefs = readInitialPrefsFromDom\(\);[\s\S]*?safeApplyPrefsToDom\(initial, "init"\);[\s\S]*?\}, \[safeApplyPrefsToDom, scheduleOpenModal\]\);/
  );
});
