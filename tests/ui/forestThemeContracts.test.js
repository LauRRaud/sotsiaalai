import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("forest theme is wired through globals, layout and accessibility provider", () => {
  const globals = read("app/styles/globals.css");
  const layout = read("app/layout.js");
  const provider = read("components/accessibility/AccessibilityProvider.jsx");

  assert.match(globals, /@import url\("\.\/theme\/forest\.css"\);/);
  assert.match(layout, /rawTheme === "forest"/);
  assert.match(layout, /theme === "forest" \? "theme-forest"/);
  assert.match(provider, /theme === "forest"/);
  assert.match(provider, /html\.classList\.toggle\("theme-forest", shouldBeForest\)/);
});

test("profile orbital theme switch includes forest before high contrast", () => {
  const profile = read("components/alalehed/ProfiilBody.jsx");

  assert.match(profile, /const modeSequence = \["light", "mid", "dark", "night", "forest", "hc"\]/);
  assert.match(profile, /function ThemeForestDockIcon/);
  assert.match(profile, /nextMode === "forest"[\s\S]*?<ThemeForestDockIcon/);
});

test("forest theme has moss glass, warm mid-style icons, controls and home/about tokens", () => {
  const forest = read("app/styles/theme/forest.css");
  const orbital = read("components/effects/Components/OrbitalMenu/OrbitalMenu.css");

  assert.match(forest, /:root\.theme-forest/);
  assert.match(forest, /--forest-bg-top:\s*#235347/);
  assert.match(forest, /--forest-icon:\s*rgba\(238,\s*228,\s*222/);
  assert.match(forest, /--glass-ring-surface-bg:\s*rgba\(/);
  assert.match(forest, /--home-panel-bg:\s*rgba\(/);
  assert.match(forest, /--btn-primary-bg:/);
  assert.match(forest, /--input-bg:/);
  assert.match(forest, /--chat-icon-dark:\s*var\(--forest-icon\)/);
  assert.match(forest, /button:has\(\.back-icon-arrow\)[\s\S]*?--back-arrow-color:\s*var\(--forest-icon\)/);
  assert.match(forest, /:is\(\.button, \.btn, \.invite-primary-btn[\s\S]*?background:\s*var\(--btn-primary-bg\) !important/);
  assert.match(forest, /\.workspace-feature-panel[\s\S]*?--workspace-feature-accent:\s*var\(--forest-icon\)/);
  assert.match(orbital, /:root\.theme-forest[\s\S]*?var\(--forest-icon/);
  assert.match(orbital, /var\(--forest-orbit-surface/);
});

test("forest background uses the default dark color bends", () => {
  const backgroundLayer = read("components/backgrounds/BackgroundLayer.jsx");

  assert.doesNotMatch(backgroundLayer, /effectiveTheme === "forest"[\s\S]*?\["#eee4de"\]/);
  assert.match(backgroundLayer, /: ["#7e4442"]/);
  assert.doesNotMatch(backgroundLayer, /effectiveTheme === "forest"[\s\S]*?\?\s*0\.56/);
  assert.match(backgroundLayer, /COLOR_BENDS_OPACITY_DEFAULT/);
});

test("forest theme labels are available in all locales", () => {
  for (const locale of ["et", "en", "ru"]) {
    const messages = JSON.parse(read(`messages/${locale}.json`));
    assert.equal(typeof messages.profile.theme_mode.forest, "string");
    assert.equal(typeof messages.accessibility.options.theme.forest, "string");
  }
});
