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
  const infoButton = read("components/ui/PageInfoButton.module.css");
  const leftRail = read("components/chat/LeftRail.module.css");
  const rightRail = read("components/chat/RightRail.module.css");

  assert.match(forest, /:root\.theme-forest/);
  assert.match(forest, /--forest-bg-top:\s*#1b3a2f/);
  assert.match(forest, /--forest-highlight:\s*#c57171/);
  assert.match(forest, /--forest-icon:\s*rgba\(238,\s*228,\s*222/);
  assert.match(forest, /--glass-ring-surface-bg:\s*rgba\(13,\s*23,\s*20,\s*0\.62\)/);
  assert.match(forest, /--home-panel-bg:\s*var\(--glass-ring-surface-bg\)/);
  assert.match(forest, /--forest-orbit-surface:/);
  assert.match(forest, /--forest-floating-surface:/);
  assert.match(forest, /--forest-input-surface:/);
  assert.match(forest, /--btn-primary-bg:\s*var\(--forest-orbit-surface\)/);
  assert.match(forest, /--form-surface:\s*var\(--forest-input-surface\)/);
  assert.match(forest, /--input-bg:\s*var\(--form-surface\)/);
  assert.match(forest, /--chat-icon-dark:\s*var\(--forest-highlight\)/);
  assert.match(forest, /button:has\(\.back-icon-arrow\)[\s\S]*?--back-arrow-color:\s*var\(--forest-highlight\)/);
  assert.match(forest, /button:has\(\.back-icon-arrow\)[\s\S]*?--back-dot-color:\s*#7A3A38/);
  assert.match(forest, /\.chat-rail-icon-btn \.back-icon-dot \{[\s\S]*?fill:\s*#7A3A38 !important;/);
  assert.match(forest, /--chat-tools-panel-bg:\s*var\(--forest-floating-surface\)/);
  assert.match(forest, /--chat-tools-item-hover-bg:\s*var\(--forest-floating-surface-hover\)/);
  assert.match(forest, /\.chat-tools-menu \{[\s\S]*?background:\s*var\(--forest-floating-surface\)/);
  assert.match(forest, /\.chat-inputbar \.chat-send-btn[\s\S]*?--btn-primary-bg:\s*var\(--forest-orbit-surface\) !important/);
  assert.match(forest, /--home-title-color:\s*var\(--forest-highlight\)/);
  assert.match(forest, /:is\(\.button, \.btn, \.invite-primary-btn[\s\S]*?background:\s*var\(--btn-primary-bg\) !important/);
  assert.match(forest, /\.workspace-feature-panel[\s\S]*?--workspace-feature-accent:\s*var\(--forest-icon\)/);
  assert.match(infoButton, /:global\(:root\.theme-forest\) \.trigger \{[\s\S]*?--page-info-ring-color:\s*var\(--forest-highlight,\s*#c57171\);[\s\S]*?--page-info-dot-color:\s*#7A3A38;/);
  assert.match(leftRail, /:global\(:root\.theme-forest\) \.tooltip \{[\s\S]*?background:\s*var\(--forest-floating-surface/);
  assert.match(rightRail, /:global\(:root\.theme-forest\) \.tooltip \{[\s\S]*?background:\s*var\(--forest-floating-surface/);
  assert.match(orbital, /:root\.theme-forest[\s\S]*?var\(--forest-highlight,\s*#c57171\)/);
  assert.match(orbital, /var\(--forest-orbit-surface/);
});

test("forest background uses brown color bends with stronger opacity", () => {
  const backgroundLayer = read("components/backgrounds/BackgroundLayer.jsx");

  assert.doesNotMatch(backgroundLayer, /effectiveTheme === "forest"[\s\S]*?\["#eee4de"\]/);
  assert.match(backgroundLayer, /effectiveTheme === "forest"[\s\S]*?\["#5a3438"\]/);
  assert.doesNotMatch(backgroundLayer, /effectiveTheme === "forest"[\s\S]*?\?\s*0\.56/);
  assert.match(backgroundLayer, /const COLOR_BENDS_OPACITY_FOREST = 0\.78;/);
  assert.match(backgroundLayer, /effectiveTheme === "forest"\s*\?\s*COLOR_BENDS_OPACITY_FOREST/);
});

test("forest theme labels are available in all locales", () => {
  for (const locale of ["et", "en", "ru"]) {
    const messages = JSON.parse(read(`messages/${locale}.json`));
    assert.equal(typeof messages.profile.theme_mode.forest, "string");
    assert.equal(typeof messages.accessibility.options.theme.forest, "string");
  }
});
