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
