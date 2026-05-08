import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("custom checkbox visuals use one square and the brand red check treatment", () => {
  const fancyCheckbox = read("components/ui/FancyCheckbox.jsx");
  const optionCard = read("components/ui/OptionCard.jsx");
  const chatSidebar = read("components/ChatSidebar.jsx");
  const glassCss = read("app/styles/components/glass.css");
  const serviceMapCss = read("app/styles/components/service-map.css");
  const darkTheme = read("app/styles/theme/dark.css");
  const midTheme = read("app/styles/theme/mid.css");
  const nightTheme = read("app/styles/theme/night.css");
  const hcTheme = read("app/styles/theme/hc.css");

  assert.doesNotMatch(fancyCheckbox, /<rect\s+className="shape"/);
  assert.match(fancyCheckbox, /--checkbox-accent/);
  assert.match(fancyCheckbox, /input:checked \+ \.box/);

  for (const source of [optionCard, chatSidebar]) {
    assert.match(source, /--checkbox-accent/);
    assert.doesNotMatch(source, /--seg-radio-bg/);
    assert.doesNotMatch(source, /--seg-radio-inner-ring/);
  }

  assert.match(glassCss, /--ui-checkbox-accent/);
  assert.doesNotMatch(glassCss, /--ui-checkbox-shadow/);
  assert.doesNotMatch(serviceMapCss, /\.workspace-feature-fancy-checkbox \.shape/);
  assert.match(serviceMapCss, /--workspace-feature-checkbox-text:\s*var\(--workspace-feature-text\)/);
  assert.match(serviceMapCss, /:root\.theme-light:not\(\.theme-mid\) \.workspace-feature-panel\s*\{[\s\S]*?--workspace-feature-checkbox-text:\s*#1f2937/);

  for (const source of [darkTheme, midTheme, nightTheme]) {
    assert.doesNotMatch(
      source,
      /login-otp-remember\.fancy-checkbox--otp[\s\S]{0,140}\.box\s*\{[^}]*border-color:\s*transparent/
    );
  }

  assert.doesNotMatch(hcTheme, /fancy-checkbox--otp \.shape/);
});
