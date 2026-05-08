import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("help listings panel uses the workspace card surface in dark modes", () => {
  const helpListingsPanel = read("components/chat/HelpListingsPanel.jsx");
  const chatFocusCss = read("app/styles/components/chat-focus.css");
  const mobileCss = read("app/styles/mobile.css");

  assert.doesNotMatch(
    helpListingsPanel,
    /help-listings-panel[\s\S]{0,240}!shadow-none/
  );
  assert.match(
    chatFocusCss,
    /:root:not\(\.theme-light\):not\(\.theme-mid\)\s+\.help-listings-modal-content\s+\.help-listings-panel/
  );
  assert.match(chatFocusCss, /rgba\(197,\s*113,\s*113,\s*0\.12\)/);
  assert.match(chatFocusCss, /linear-gradient\(\s*145deg,\s*rgba\(255,\s*255,\s*255,\s*0\.1\)/);
  assert.match(chatFocusCss, /var\(--glass-ring-surface-bg,\s*rgba\(0,\s*0,\s*0,\s*0\.25\)\)\s+58%/);
  assert.match(chatFocusCss, /inset 0 0 0 1px rgba\(255,\s*255,\s*255,\s*0\.09\)/);
  assert.match(mobileCss, /\.help-listings-modal-content \.help-listings-panel\s*\{[\s\S]*?rgba\(197,\s*113,\s*113,\s*0\.12\)/);
});

test("help listings panel keeps a dedicated high contrast surface", () => {
  const chatFocusCss = read("app/styles/components/chat-focus.css");
  const mobileCss = read("app/styles/mobile.css");

  assert.match(
    chatFocusCss,
    /html\[data-contrast="hc"\]\s+\.help-listings-modal-content\s+\.help-listings-panel/
  );
  assert.match(chatFocusCss, /rgba\(255,\s*234,\s*0,\s*0\.035\)/);
  assert.match(chatFocusCss, /box-shadow:\s*inset 0 0 0 1\.5px var\(--hc-accent,\s*#ffea00\) !important/);
  assert.match(mobileCss, /html\[data-contrast="hc"\] \.help-listings-modal-content \.help-listings-panel/);
});
