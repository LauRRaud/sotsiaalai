import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("mobile PWA homepage paints the bottom safe area with the active theme background", () => {
  const mobileCss = read("app/styles/mobile.css");

  assert.match(
    mobileCss,
    /body\.homepage\s*\{[\s\S]*?height:\s*var\(--glass-mobile-root-vh,\s*100dvh\);[\s\S]*?min-height:\s*var\(--glass-mobile-root-vh,\s*100dvh\);/,
    "homepage body should use the measured mobile app height instead of raw 100dvh"
  );
  assert.match(
    mobileCss,
    /\.homepage-root\s*\{[\s\S]*?height:\s*var\(--glass-mobile-root-vh,\s*100dvh\);[\s\S]*?min-height:\s*var\(--glass-mobile-root-vh,\s*100dvh\);/,
    "homepage scroll root should share the measured mobile app height"
  );
  assert.match(
    mobileCss,
    /html\[data-display-mode="standalone"\] body\.homepage::before,[\s\S]*?body\[data-display-mode="fullscreen"\]\.homepage::before\s*\{[\s\S]*?height:\s*max\(env\(safe-area-inset-bottom,\s*0px\),\s*4\.5rem\);[\s\S]*?background:\s*var\(--home-browser-base-bg,\s*var\(--app-chrome-bg,\s*#10151d\)\);/,
    "standalone/fullscreen PWA should not expose the manifest black fallback at the bottom edge"
  );
});
