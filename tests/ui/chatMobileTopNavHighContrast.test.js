import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("high contrast mobile chat top nav icons stay background-free", () => {
  const css = read("app/styles/theme/hc.css");

  assert.match(
    css,
    /html\[data-contrast="hc"\] \.chat-mobile-topnav button\[data-chat-mobile-topnav-button="1"\],[\s\S]*?\.chat-mobile-topnav button\[data-chat-mobile-topnav-button="1"\]::after\s*\{[\s\S]*?background:\s*transparent !important;[\s\S]*?background-image:\s*none !important;[\s\S]*?box-shadow:\s*none !important;/
  );
  assert.match(
    css,
    /:not\(\[data-chat-mobile-topnav-button="1"\]\):not\(\.chat-rail-icon-btn\)/
  );
});

test("mobile chat top nav keeps the active label under the focused icon", () => {
  const source = read("components/alalehed/chat/view/ChatMobileTopNav.jsx");
  const headerCss = read("app/styles/mobile/subpage-title-system.css");

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
    headerCss,
    /\.chat-mobile-topnav \.mobile-shared-topnav-title\s*\{[\s\S]*?font-size:\s*clamp\(1\.16rem,\s*4\.65vw,\s*1\.34rem\)\s*!important;/
  );
});
