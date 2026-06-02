import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { readMobileCssBundle } from "../helpers/mobileCssBundle.mjs";


function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("mobile layout no longer ships standalone/fullscreen PWA CSS overrides", () => {
  const mobileCss = readMobileCssBundle();
  const mobileIndexCss = read("app/styles/mobile/index.css");
  const mobileBackgroundCss = read("app/styles/mobile/background-home.css");
  const mobileFoundationsCss = read("app/styles/mobile/foundations.css");
  const mobilePolicyScrollCss = read("app/styles/mobile/policy-scroll.css");
  const mobileModalSurfaceCss = read("app/styles/mobile/modal-surfaces.css");
  const mobileChatLayoutCss = read("app/styles/mobile/chat-mobile-layout.css");
  const globalsCss = read("app/styles/globals.css");
  const coreCss = read("app/styles/base/core.css");
  const baseBackgroundsCss = read("app/styles/base/backgrounds.css");
  const backgroundLayer = read("components/backgrounds/BackgroundLayer.jsx");
  const clickPulseCursor = read("components/ClickPulseCursor.jsx");
  const viewportLayoutSetter = read("components/ViewportLayoutSetter.jsx");
  const manifest = read("public/site.webmanifest");
  const layout = read("app/layout.js");
  const cssFilesWithoutPwaLayout = [
    coreCss,
    baseBackgroundsCss,
    mobileBackgroundCss,
    mobileFoundationsCss,
    mobilePolicyScrollCss,
    mobileModalSurfaceCss,
    mobileChatLayoutCss
  ].join("\n");

  assert.match(
    mobileCss,
    /body\.homepage,[\s\S]*?html\[data-initial-page="home"\] body\.app-root\s*\{[\s\S]*?--home-mobile-canvas-height:\s*calc\([\s\S]*?var\(--glass-mobile-root-vh,\s*100dvh\)[\s\S]*?\+ var\(--home-mobile-safe-bottom\)[\s\S]*?\);[\s\S]*?overflow-y:\s*auto;[\s\S]*?height:\s*auto;[\s\S]*?min-height:\s*var\(--home-mobile-canvas-height\);/,
    "homepage body should own mobile scrolling so footer content remains reachable"
  );
  assert.match(
    mobileCss,
    /\.homepage-root\s*\{[\s\S]*?height:\s*auto;[\s\S]*?min-height:\s*var\(--home-mobile-canvas-height,\s*var\(--glass-mobile-root-vh,\s*100dvh\)\);[\s\S]*?overflow-y:\s*visible;/,
    "homepage root should not create a competing inner scroll container"
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
  assert.match(globalsCss, /@import url\("\.\/mobile\/index\.css"\) screen and \(max-width: 768px\);/);
  assert.match(mobileIndexCss, /@import url\("\.\.\/mobile\.css"\);/);
  assert.doesNotMatch(mobileIndexCss, /mobile-background\.css/);
  assert.match(mobileCss, /--mobile-background-prepaint:\s*#000;/);
  assert.match(mobileBackgroundCss, /html\[data-app-prepaint\][\s\S]*?background:\s*var\(--mobile-background-prepaint\)\s*!important;/);
  assert.doesNotMatch(cssFilesWithoutPwaLayout, /data-display-mode="standalone"/);
  assert.doesNotMatch(cssFilesWithoutPwaLayout, /data-display-mode="fullscreen"/);
  assert.doesNotMatch(cssFilesWithoutPwaLayout, /--pwa-/);
  assert.match(
    mobileBackgroundCss,
    /\[data-bg-layer\]\[data-mobile-bends="ready"\] \.bg-bends-layer,[\s\S]*?\.bg-particles-layer\[data-mobile-visible="ready"\][\s\S]*?transition-duration:\s*var\(--mobile-background-reveal-duration\),\s*0s\s*!important;/
  );
  assert.match(backgroundLayer, /const INITIAL_PREPAINT_MAX_MS = 2400;/);
  assert.match(
    backgroundLayer,
    /window\.setTimeout\(\(\) => \{[\s\S]*?root\.removeAttribute\("data-app-prepaint"\);[\s\S]*?\}, INITIAL_PREPAINT_MAX_MS\)/
  );
  assert.doesNotMatch(viewportLayoutSetter, /visualViewport\?\.addEventListener\("scroll"/);
  assert.doesNotMatch(viewportLayoutSetter, /visualViewport\?\.removeEventListener\("scroll"/);
  assert.match(
    clickPulseCursor,
    /window\.matchMedia\?\.\("\(hover: hover\) and \(pointer: fine\)"\)/
  );
  assert.match(clickPulseCursor, /window\.matchMedia\?\.\("\(pointer: coarse\)"\)/);
  assert.match(clickPulseCursor, /window\.matchMedia\?\.\("\(display-mode: standalone\)"\)/);
  assert.match(clickPulseCursor, /window\.matchMedia\?\.\("\(display-mode: fullscreen\)"\)/);
  assert.match(clickPulseCursor, /if \(!enabled\) return null;/);
  assert.match(
    coreCss,
    /@media \(hover: none\), \(pointer: coarse\) \{[\s\S]*?\.click-pulse-cursor\s*\{[\s\S]*?display:\s*none\s*!important;/
  );
  assert.doesNotMatch(mobileCss, /--pwa-background-bottom-overscan/);
  assert.doesNotMatch(coreCss, /body::after|body\.homepage::before|body\.homepage::after/);
  assert.match(coreCss, /--app-chrome-bg-image:\s*radial-gradient\(/);
  assert.match(coreCss, /html\.theme-light\s*\{[\s\S]*?--app-chrome-bg-image:\s*linear-gradient\(180deg,\s*#f4f2ee 0%,\s*#e9e6df 100%\);/);
  assert.match(coreCss, /html\.theme-mono:not\(\[data-contrast="hc"\]\)\s*\{[\s\S]*?--app-chrome-bg:\s*#101010;/);
  assert.match(manifest, /"background_color": "#6f5853"/);
  assert.match(manifest, /"theme_color": "#6f5853"/);
  assert.match(layout, /themeColor:\s*\[[\s\S]*?\{ media:\s*"\(prefers-color-scheme: light\)",\s*color:\s*"#f4f2ee" \}[\s\S]*?\{ media:\s*"\(prefers-color-scheme: dark\)",\s*color:\s*"#101010" \}/);
  assert.doesNotMatch(mobileCss, /--home-safe-area-bg/);
});
