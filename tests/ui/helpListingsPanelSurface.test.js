import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("help listings panel uses the workspace card surface in dark modes", () => {
  const helpListingsPanel = read("components/chat/HelpListingsPanel.jsx");
  const darkCss = read("app/styles/theme/dark.css");
  const nightCss = read("app/styles/theme/night.css");
  const chatFocusCss = read("app/styles/components/chat-focus.css");
  const mobileCss = read("app/styles/mobile.css");

  assert.doesNotMatch(
    helpListingsPanel,
    /help-listings-panel[\s\S]{0,240}!shadow-none/
  );
  assert.match(
    helpListingsPanel,
    /help-listings-item-card[\s\S]{0,240}!shadow-none/
  );
  assert.doesNotMatch(
    darkCss,
    /:is\([\s\S]*?\.help-listings-panel[\s\S]*?\)\s*\{[\s\S]*?chat-card-surface-standard-bg/
  );
  assert.doesNotMatch(
    nightCss,
    /:is\([\s\S]*?\.help-listings-panel[\s\S]*?\)\s*\{[\s\S]*?chat-card-surface-night-standard-bg/
  );
  assert.match(
    darkCss,
    /:root:not\(\.theme-light\):not\(\.theme-mid\):not\(\.theme-night\):not\(\[data-contrast="hc"\]\)\s+\.help-listings-modal-content\s+\.help-listings-panel[\s\S]*?linear-gradient\(\s*145deg,\s*rgba\(255,\s*255,\s*255,\s*0\.08\)/
  );
  assert.match(
    nightCss,
    /:root\.theme-night \.help-listings-modal-content \.help-listings-panel[\s\S]*?linear-gradient\(\s*145deg,\s*rgba\(255,\s*255,\s*255,\s*0\.08\)/
  );
  assert.match(
    chatFocusCss,
    /:root:not\(\.theme-light\):not\(\.theme-mid\)\s+\.help-listings-modal-content\s+\.help-listings-panel/
  );
  assert.match(chatFocusCss, /linear-gradient\(\s*145deg,\s*rgba\(255,\s*255,\s*255,\s*0\.08\)/);
  assert.match(chatFocusCss, /var\(--glass-ring-surface-bg,\s*rgba\(0,\s*0,\s*0,\s*0\.25\)\)\s+64%/);
  assert.match(chatFocusCss, /inset 0 0 0 1px rgba\(255,\s*255,\s*255,\s*0\.08\)/);
  assert.match(mobileCss, /\.help-listings-modal-content \.help-listings-panel\s*\{[\s\S]*?var\(--glass-ring-surface-bg,\s*rgba\(0,\s*0,\s*0,\s*0\.25\)\)\s+64%/);
});

test("help listings panel keeps a dedicated high contrast surface", () => {
  const hcCss = read("app/styles/theme/hc.css");
  const chatFocusCss = read("app/styles/components/chat-focus.css");
  const mobileCss = read("app/styles/mobile.css");

  assert.doesNotMatch(
    hcCss,
    /html\[data-contrast="hc"\]\s+:is\([\s\S]*?\.help-listings-panel[\s\S]*?\)\s*\{[\s\S]*?chat-card-surface-night-standard-bg/
  );
  assert.match(
    hcCss,
    /html\[data-contrast="hc"\] \.help-listings-modal-content \.help-listings-panel[\s\S]*?background:\s*transparent !important/
  );
  assert.match(
    hcCss,
    /html\[data-contrast="hc"\] \.help-listings-modal-content \.help-listings-panel[\s\S]*?box-shadow:\s*inset 0 0 0 1\.5px var\(--hc-accent,\s*#ffea00\) !important/
  );
  assert.match(
    chatFocusCss,
    /html\[data-contrast="hc"\]\s+\.help-listings-modal-content\s+\.help-listings-panel/
  );
  assert.match(chatFocusCss, /background:\s*transparent !important/);
  assert.match(chatFocusCss, /box-shadow:\s*inset 0 0 0 1\.5px var\(--hc-accent,\s*#ffea00\) !important/);
  assert.match(mobileCss, /html\[data-contrast="hc"\] \.help-listings-modal-content \.help-listings-panel/);
});
