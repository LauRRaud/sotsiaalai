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
    /html\[data-display-mode="standalone"\],[\s\S]*?body\[data-display-mode="fullscreen"\]\s*\{[\s\S]*?--pwa-background-bottom-overscan:\s*max\(env\(safe-area-inset-bottom,\s*0px\),\s*7\.5rem\);[\s\S]*?min-height:\s*calc\([\s\S]*?var\(--glass-mobile-root-vh,\s*var\(--app-height,\s*100dvh\)\) \+[\s\S]*?var\(--pwa-background-bottom-overscan\)[\s\S]*?\) !important;[\s\S]*?background-color:\s*var\(--app-chrome-bg,\s*#10151d\) !important;[\s\S]*?background-image:\s*var\(--app-chrome-bg-image,\s*none\) !important;[\s\S]*?background-size:\s*100%[\s\S]*?calc\([\s\S]*?var\(--glass-mobile-root-vh,\s*var\(--app-height,\s*100dvh\)\) \+[\s\S]*?var\(--pwa-background-bottom-overscan\)[\s\S]*?\)/,
    "standalone/fullscreen PWA should paint the browser chrome fallback with the active theme background"
  );
  assert.match(
    coreCss,
    /html\[data-display-mode="standalone"\] \.app-root,[\s\S]*?html\[data-display-mode="fullscreen"\] \.app-root\s*\{[\s\S]*?min-height:\s*calc\([\s\S]*?var\(--glass-mobile-root-vh,\s*var\(--app-height,\s*100dvh\)\) \+[\s\S]*?var\(--pwa-background-bottom-overscan,[\s\S]*?7\.5rem\)[\s\S]*?\) !important;[\s\S]*?background:\s*transparent\s*!important;/,
    "PWA app root should stay transparent so the real background layer remains visible"
  );
  assert.match(
    backgroundCss,
    /html\[data-display-mode="standalone"\] \[data-bg-layer\],[\s\S]*?body\[data-display-mode="fullscreen"\] \[data-bg-layer\]\s*\{[\s\S]*?--pwa-background-bottom-overscan:\s*max\(env\(safe-area-inset-bottom,\s*0px\),\s*7\.5rem\);[\s\S]*?bottom:\s*calc\(0px - var\(--pwa-background-bottom-overscan\)\);[\s\S]*?height:\s*auto;[\s\S]*?min-height:\s*calc\([\s\S]*?var\(--glass-mobile-root-vh,\s*var\(--app-height,\s*100dvh\)\) \+[\s\S]*?var\(--pwa-background-bottom-overscan\)[\s\S]*?\);/,
    "PWA background layer should extend under the bottom safe area instead of using a cover box"
  );
  assert.match(
    mobileCss,
    /html\[data-display-mode="standalone"\] \[data-bg-layer\]\[data-page="home"\],[\s\S]*?body\[data-display-mode="fullscreen"\] \[data-bg-layer\]\[data-page="home"\]\s*\{[\s\S]*?--pwa-background-bottom-overscan:\s*max\(env\(safe-area-inset-bottom,\s*0px\),\s*7\.5rem\);[\s\S]*?bottom:\s*calc\(0px - var\(--pwa-background-bottom-overscan\)\)\s*!important;[\s\S]*?height:\s*auto\s*!important;[\s\S]*?min-height:\s*calc\([\s\S]*?var\(--glass-mobile-root-vh,\s*var\(--app-height,\s*100dvh\)\) \+[\s\S]*?var\(--pwa-background-bottom-overscan\)[\s\S]*?\)\s*!important;/,
    "homepage-specific mobile background rules should not override the PWA safe-area extension"
  );
  assert.match(
    mobileCss,
    /html\[data-display-mode="standalone"\] \[data-bg-layer\]\[data-page="home"\] :is\(\.bg-space-layer,\s*\.space-backdrop,\s*\.bg-bends-layer,\s*\.bg-particles-layer\),[\s\S]*?body\[data-display-mode="fullscreen"\] \[data-bg-layer\]\[data-page="home"\] :is\(\.bg-space-layer,\s*\.space-backdrop,\s*\.bg-bends-layer,\s*\.bg-particles-layer\)[\s\S]*?\{[\s\S]*?bottom:\s*0\s*!important;[\s\S]*?height:\s*auto\s*!important;/,
    "homepage background child layers should follow the extended PWA layer instead of ending early"
  );
  assert.match(
    mobileCss,
    /html\[data-display-mode="standalone"\] body\.homepage,[\s\S]*?body\.homepage\[data-display-mode="fullscreen"\]\s*\{[\s\S]*?background:\s*transparent\s*!important;[\s\S]*?height:\s*calc\([\s\S]*?var\(--glass-mobile-root-vh,\s*100dvh\) \+[\s\S]*?var\(--pwa-background-bottom-overscan,[\s\S]*?7\.5rem\)[\s\S]*?\) !important;/,
    "installed homepage should not expose the flat browser base color below the app root"
  );
  assert.doesNotMatch(coreCss, /body::after|body\.homepage::before|body\.homepage::after/);
  assert.match(coreCss, /--app-chrome-bg-image:\s*radial-gradient\(/);
  assert.match(coreCss, /html\.theme-light\s*\{[\s\S]*?--app-chrome-bg-image:\s*linear-gradient\(180deg,\s*#f4f2ee 0%,\s*#e9e6df 100%\);/);
  assert.match(coreCss, /html\.theme-mono:not\(\[data-contrast="hc"\]\)\s*\{[\s\S]*?--app-chrome-bg:\s*#101010;/);
  assert.match(manifest, /"background_color": "#101010"/);
  assert.match(manifest, /"theme_color": "#101010"/);
  assert.match(layout, /themeColor:\s*"#101010"/);
  assert.doesNotMatch(mobileCss, /--home-safe-area-bg/);
});
