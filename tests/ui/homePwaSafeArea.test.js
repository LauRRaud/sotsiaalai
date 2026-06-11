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
  const mobileChatBootstrapCss = read("app/styles/mobile/chat-bootstrap.css");
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
  const providers = read("app/providers.jsx");
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
    mobileFoundationsCss,
    /@supports \(height:\s*100lvh\)[\s\S]*?body\.homepage,[\s\S]*?html\[data-initial-page="home"\] body\.app-root\s*\{[\s\S]*?--home-mobile-stable-vh:\s*max\(var\(--glass-mobile-root-vh,\s*100dvh\),\s*100lvh\);[\s\S]*?--home-mobile-canvas-height:\s*calc\([\s\S]*?var\(--home-mobile-stable-vh\)[\s\S]*?\+ var\(--home-mobile-safe-bottom\)[\s\S]*?\);/,
    "homepage mobile background should keep a stable large-viewport floor behind browser chrome"
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
  assert.match(globalsCss, /@import url\("\.\/mobile\/chat-bootstrap\.css"\);/);
  assert.match(mobileIndexCss, /@import url\("\.\.\/mobile\.css"\);/);
  assert.doesNotMatch(mobileIndexCss, /mobile-background\.css/);
  assert.doesNotMatch(mobileCss, /data-app-prepaint|mobile-background-prepaint/);
  assert.doesNotMatch(mobileBackgroundCss, /data-app-prepaint|mobile-background-prepaint/);
  assert.doesNotMatch(cssFilesWithoutPwaLayout, /data-display-mode="standalone"/);
  assert.doesNotMatch(cssFilesWithoutPwaLayout, /data-display-mode="fullscreen"/);
  assert.doesNotMatch(cssFilesWithoutPwaLayout, /--pwa-/);
  assert.match(
    mobileBackgroundCss,
    /\[data-bg-layer\]\[data-mobile-bends="ready"\] \.bg-bends-layer,[\s\S]*?\.bg-particles-layer\[data-mobile-visible="ready"\][\s\S]*?transition-duration:\s*var\(--mobile-background-reveal-duration\),\s*0s\s*!important;/
  );
  assert.match(
    mobileBackgroundCss,
    /\[data-bg-layer\]\[data-page="subpage"\] \.bg-bends-layer\s*\{[\s\S]*?transition-duration:\s*0s,\s*0s\s*!important;/
  );
  assert.match(
    mobileBackgroundCss,
    /\[data-bg-layer\]\[data-page="subpage"\]\[data-mobile-bends="pending"\] \.bg-bends-layer\s*\{[\s\S]*?opacity:\s*var\(--saai-bends-opacity,\s*1\)\s*!important;[\s\S]*?visibility:\s*visible\s*!important;/
  );
  assert.match(
    mobileBackgroundCss,
    /\[data-bg-layer\]\[data-page="home"\]\[data-mobile-bends="pending"\] \.bg-bends-layer\s*\{[\s\S]*?opacity:\s*var\(--saai-bends-opacity,\s*1\)\s*!important;[\s\S]*?visibility:\s*visible\s*!important;/
  );
  assert.doesNotMatch(
    mobileBackgroundCss,
    /\[data-bg-layer\]\[data-page="home"\] \.particles-container\s*\{[\s\S]*?height:\s*100%/
  );
  assert.match(
    mobileChatBootstrapCss,
    /html\[data-layout="mobile"\] \.chat-page-shell \.chat-input-row:not\(\.chat-input-row--embedded\)\s*\{[\s\S]*?position:\s*absolute\s*!important;[\s\S]*?bottom:\s*calc\([\s\S]*?var\(--chat-composer-mobile-bottom-base,\s*2\.5rem\)[\s\S]*?var\(--chat-vk-offset,\s*0px\)[\s\S]*?\)\s*!important;/
  );
  assert.doesNotMatch(backgroundLayer, /INITIAL_PREPAINT_MAX_MS|data-app-prepaint/);
  assert.doesNotMatch(viewportLayoutSetter, /visualViewport\?\.addEventListener\("scroll"/);
  assert.doesNotMatch(viewportLayoutSetter, /visualViewport\?\.removeEventListener\("scroll"/);
  assert.match(
    viewportLayoutSetter,
    /const syncViewportState = \(\) => \{[\s\S]*?applyLayoutFlag\(mql\.matches\);[\s\S]*?applyVhVar\(stableLayoutHeightRef\.current\);[\s\S]*?\};/
  );
  assert.match(
    viewportLayoutSetter,
    /layoutHeight < previousStable &&[\s\S]*?previousStable - layoutHeight <= 96/,
    "standalone height freeze must only suppress small shrinks, never growth (iOS launch underreport)"
  );
  assert.doesNotMatch(
    viewportLayoutSetter,
    /Math\.abs\(layoutHeight - previousStable\)/,
    "symmetric freeze would pin the underreported launch height forever in PWA mode"
  );
  assert.match(
    baseBackgroundsCss,
    /\[data-bg-layer\]\s*\{[\s\S]*?min-height:\s*max\(\s*var\(--app-height,\s*100dvh\),\s*calc\(100lvh \+ env\(safe-area-inset-bottom,\s*0px\)\)\s*\);/,
    "background layer must keep a large-viewport + safe-area floor so a stale --app-height cannot expose chrome bands at the bottom edge"
  );
  assert.match(
    viewportLayoutSetter,
    /window\.requestAnimationFrame\(\(\) => \{[\s\S]*?syncViewportState\(\);[\s\S]*?\}\);/
  );
  assert.match(
    viewportLayoutSetter,
    /const syncAfterRouteRestore = \(\) => \{[\s\S]*?applyLayoutFlag\(window\.matchMedia\?\.\(MOBILE_QUERY\)\?\.matches \?\? window\.innerWidth <= 768\);[\s\S]*?applyVhVar\(stableLayoutHeightRef\.current\);[\s\S]*?\};[\s\S]*?\}, \[pathname\]\);/
  );
  assert.match(providers, /const timers = \[80, 220, 520\]\.map\(delay => window\.setTimeout\(clearIfStale, delay\)\);/);
  assert.match(providers, /window\.addEventListener\("resize", clearIfStale\);/);
  assert.match(providers, /window\.visualViewport\?\.addEventListener\("resize", clearIfStale\);/);
  assert.match(providers, /window\.addEventListener\("pageshow", clearIfStale\);/);
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
  assert.doesNotMatch(layout, /data-app-prepaint|APP_PREPAINT_GUARD_SCRIPT|app-prepaint-guard/);
  assert.match(layout, /const LAYOUT_INIT_SCRIPT = `\(function \(\) \{/);
  assert.match(layout, /function syncLayoutFlag\(\) \{[\s\S]*?root\.setAttribute\("data-layout", "mobile"\);[\s\S]*?root\.removeAttribute\("data-layout"\);[\s\S]*?\}/);
  assert.doesNotMatch(layout, /body\.setAttribute\("data-layout", "mobile"\)/);
  assert.doesNotMatch(layout, /body\.removeAttribute\("data-layout"\)/);
  assert.match(layout, /syncLayoutFlag\(\);[\s\S]*?window\.requestAnimationFrame\(syncLayoutFlag\);/);
  assert.match(layout, /window\.addEventListener\("resize", syncLayoutFlag\);/);
  assert.doesNotMatch(layout, /clearAppPrepaint|fallbackTimer|pagehide/);
  assert.match(layout, /var HOME_BG_RESET_KEY = "sotsiaalai:home-background-reset-on-return";/);
  assert.match(layout, /var HOME_BG_RESET_PATHS = \{[\s\S]*?"\/kasutusjuhend": true,[\s\S]*?"\/kasutustingimused": true,[\s\S]*?"\/privaatsustingimused": true[\s\S]*?\};/);
  assert.match(layout, /window\.addEventListener\("sotsiaalai:route-transition", markHomeBackgroundReset\);/);
  assert.match(layout, /function resetHomeBackgroundReturn\(\) \{[\s\S]*?window\.sessionStorage\.removeItem\(HOME_BG_RESET_KEY\);[\s\S]*?window\.scrollTo && window\.scrollTo\(\{ top: 0, left: 0, behavior: "auto" \}\);[\s\S]*?bgLayer && bgLayer\.style\.setProperty\("--saai-bends-opacity", "0\.78"\);/);
  assert.match(layout, /window\.addEventListener\("pageshow", function \(\) \{[\s\S]*?syncLayoutFlag\(\);[\s\S]*?\}\);/);
  assert.match(layout, /<script[\s\S]*?id="app-layout-init"[\s\S]*?dangerouslySetInnerHTML=\{\{ __html: LAYOUT_INIT_SCRIPT \}\}/);
  assert.match(
    mobileFoundationsCss,
    /html\[data-layout="mobile"\] \[data-bg-layer\]\[data-page="subpage"\],[\s\S]*?body\[data-layout="mobile"\] \[data-bg-layer\]\[data-page="subpage"\]\s*\{[\s\S]*?bottom:\s*0\s*!important;[\s\S]*?height:\s*auto\s*!important;[\s\S]*?min-height:\s*100dvh\s*!important;/
  );
  assert.match(
    mobileFoundationsCss,
    /html\[data-layout="mobile"\][\s\S]*?\[data-bg-layer\]\[data-page="subpage"\][\s\S]*?:is\(\.bg-space-layer,\s*\.space-backdrop,\s*\.bg-bends-layer,\s*\.bg-particles-layer\),[\s\S]*?body\[data-layout="mobile"\][\s\S]*?\[data-bg-layer\]\[data-page="subpage"\][\s\S]*?:is\(\.bg-space-layer,\s*\.space-backdrop,\s*\.bg-bends-layer,\s*\.bg-particles-layer\)\s*\{[\s\S]*?top:\s*0\s*!important;[\s\S]*?bottom:\s*0\s*!important;[\s\S]*?height:\s*auto\s*!important;[\s\S]*?transform:\s*none\s*!important;/
  );
  assert.doesNotMatch(
    mobileFoundationsCss,
    /:is\([\s\S]*?\.particles-container[\s\S]*?\)\s*\{[\s\S]*?height:\s*100%\s*!important;/
  );
  assert.doesNotMatch(mobileCss, /--home-safe-area-bg/);
});
