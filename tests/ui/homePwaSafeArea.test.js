import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("mobile PWA pages paint the bottom safe area with the active theme background", () => {
  const mobileCss = read("app/styles/mobile.css");
  const coreCss = read("app/styles/base/core.css");
  const backgroundCss = read("app/styles/base/backgrounds.css");
  const manifest = read("public/site.webmanifest");
  const layout = read("app/layout.js");

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
    /\.homepage-root \.home-hero-section\s*\{[\s\S]*?min-height:\s*auto;/,
    "mobile homepage hero should not push the cards downward in PWA mode"
  );
  assert.match(
    mobileCss,
    /\.home-hero-shell\s*\{[\s\S]*?position:\s*relative;[\s\S]*?transform:\s*translateY\(-0\.75rem\);/,
    "mobile homepage hero should keep the cards in their original upper position"
  );
  assert.match(
    coreCss,
    /html\[data-display-mode="standalone"\],[\s\S]*?html\[data-display-mode="fullscreen"\] \.app-root\s*\{[\s\S]*?min-height:\s*var\(--glass-mobile-root-vh,\s*var\(--app-height,\s*100dvh\)\) !important;[\s\S]*?background-color:\s*var\(--app-chrome-bg,\s*#10151d\) !important;[\s\S]*?background-image:\s*var\(--app-chrome-bg-image,\s*none\) !important;[\s\S]*?background-size:\s*100% max\(100%,\s*var\(--glass-mobile-root-vh,\s*var\(--app-height,\s*100dvh\)\)\) !important;/,
    "standalone/fullscreen PWA should paint every page's browser chrome with the active theme background"
  );
  assert.match(
    coreCss,
    /html\[data-display-mode="standalone"\] body::after,[\s\S]*?body\[data-display-mode="fullscreen"\]::after\s*\{[\s\S]*?height:\s*max\(env\(safe-area-inset-bottom,\s*0px\),\s*2\.4rem\);[\s\S]*?background-color:\s*var\(--app-chrome-bg,\s*#10151d\);[\s\S]*?background-image:\s*var\(--app-chrome-bg-image,\s*none\);/,
    "all PWA pages should paint the bottom safe area with the active theme background"
  );
  assert.match(
    backgroundCss,
    /html\[data-display-mode="standalone"\] \[data-bg-layer\],[\s\S]*?body\[data-display-mode="fullscreen"\] \[data-bg-layer\]\s*\{[\s\S]*?height:\s*var\(--glass-mobile-root-vh,\s*var\(--app-height,\s*100dvh\)\);[\s\S]*?min-height:\s*var\(--glass-mobile-root-vh,\s*var\(--app-height,\s*100dvh\)\);/,
    "PWA background layer should cover the measured mobile viewport height"
  );
  assert.doesNotMatch(coreCss, /body\.homepage::before|body\.homepage::after/);
  assert.match(coreCss, /--app-chrome-bg-image:\s*radial-gradient\(/);
  assert.match(coreCss, /html\.theme-light\s*\{[\s\S]*?--app-chrome-bg-image:\s*linear-gradient\(180deg,\s*#f4f2ee 0%,\s*#e9e6df 100%\);/);
  assert.match(coreCss, /html\.theme-mono:not\(\[data-contrast="hc"\]\)\s*\{[\s\S]*?--app-chrome-bg:\s*#101010;/);
  assert.match(manifest, /"background_color": "#101010"/);
  assert.match(manifest, /"theme_color": "#101010"/);
  assert.match(layout, /themeColor:\s*"#101010"/);
  assert.doesNotMatch(mobileCss, /--home-safe-area-bg/);
});
