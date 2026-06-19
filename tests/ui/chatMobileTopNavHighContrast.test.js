import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { readCssSourceBundle } from "../helpers/cssSourceBundle.mjs";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("high contrast mobile chat top nav icons stay background-free", () => {
  const css = readCssSourceBundle("app/styles/features/chat/index.css");

  // The topnav button is now made background-free by a direct positive rule
  // (background/background-image/box-shadow reset on the button itself), not by
  // being excluded from a general reset chain. The assertion below guards that
  // contract; the old `:not([data-chat-mobile-topnav-button]):not(.chat-rail-icon-btn)`
  // exclusion shape was removed in the chat-feature CSS restructure (cf45cadb).
  assert.match(
    css,
    /html\[data-contrast="hc"\] \.chat-mobile-topnav button\[data-chat-mobile-topnav-button="1"\],[\s\S]*?\.chat-mobile-topnav button\[data-chat-mobile-topnav-button="1"\]::after\s*\{[\s\S]*?background:\s*transparent !important;[\s\S]*?background-image:\s*none !important;[\s\S]*?box-shadow:\s*none !important;/
  );
});

test("mobile chat top nav keeps the active label under the focused icon", () => {
  const source = read("components/alalehed/chat/view/ChatMobileTopNav.jsx");
  const chatCss = readCssSourceBundle("app/styles/features/chat/index.css");

  assert.match(source, /"--chat-mobile-topnav-button-size":\s*"clamp/);
  assert.match(source, /"--chat-mobile-topnav-label-top":\s*"4\./);
  assert.match(
    source,
    /className="mobile-shared-topnav-title-wrap[\s\S]*?absolute left-1\/2 top-\[var\(--chat-mobile-topnav-label-top\)\]/
  );
  assert.match(
    source,
    /style=\{\{ transform:\s*`translateX\(calc\(-50% \+ \$\{centerOffsetRem\}rem\)\)` \}\}/
  );
  assert.doesNotMatch(
    source,
    /absolute inset-x-0 top-\[calc\(var\(--mobile-safe-top/
  );
  assert.match(
    chatCss,
    /\.chat-mobile-topnav \.mobile-shared-topnav-title\s*\{[\s\S]*?font-size:\s*clamp\(1\.36rem,\s*5\.5vw,\s*1\.54rem\)\s*!important;/
  );
});

test("mobile chat top nav activates button taps from the swipe surface", () => {
  const source = read("components/alalehed/chat/view/ChatMobileTopNav.jsx");

  assert.match(
    source,
    /function getTopNavButtonTargetKey\(target\)[\s\S]*?data-chat-mobile-topnav-button/
  );
  assert.match(
    source,
    /dragStateRef\.current\.startedButtonKey = startedButtonKey;/
  );
  assert.match(
    source,
    /if \(startedOnButton\) \{[\s\S]*?suppressClickUntilRef\.current[\s\S]*?handleItemActivation\(startedButtonKey, event\);/
  );
  assert.match(
    source,
    /beginSwipe\([\s\S]*?getTopNavButtonTargetKey\(event\.target\)/
  );
});
