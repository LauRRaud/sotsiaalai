import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("mobile PWA pages paint the bottom safe area with the active theme background", () => {
  const mobileCss = read("app/styles/mobile.css");
  const mobileBackgroundCss = read("app/styles/mobile/mobile-background.css");
  const globalsCss = read("app/styles/globals.css");
  const coreCss = read("app/styles/base/core.css");
  const backgroundCss = read("app/styles/base/backgrounds.css");
  const backgroundLayer = read("components/backgrounds/BackgroundLayer.jsx");
  const clickPulseCursor = read("components/ClickPulseCursor.jsx");
  const manifest = read("public/site.webmanifest");
  const layout = read("app/layout.js");

  assert.match(
    mobileCss,
    /body\.homepage,[\s\S]*?html\[data-initial-page="home"\] body\.app-root\s*\{[\s\S]*?--home-mobile-canvas-height:\s*calc\([\s\S]*?var\(--glass-mobile-root-vh,\s*100dvh\)[\s\S]*?\+ var\(--home-mobile-safe-bottom\)[\s\S]*?\);[\s\S]*?height:\s*var\(--home-mobile-canvas-height\);[\s\S]*?min-height:\s*var\(--home-mobile-canvas-height\);/,
    "homepage body should use the measured mobile app height instead of raw 100dvh"
  );
  assert.match(
    mobileCss,
    /\.homepage-root\s*\{[\s\S]*?height:\s*var\(--home-mobile-canvas-height,\s*var\(--glass-mobile-root-vh,\s*100dvh\)\);[\s\S]*?min-height:\s*var\(--home-mobile-canvas-height,\s*var\(--glass-mobile-root-vh,\s*100dvh\)\);/,
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
    /html\[data-display-mode="standalone"\],[\s\S]*?body\[data-display-mode="fullscreen"\]\s*\{[\s\S]*?--pwa-background-bottom-overscan:\s*max\(env\(safe-area-inset-bottom,\s*0px\),\s*clamp\(5rem,\s*10vh,\s*7\.5rem\)\);[\s\S]*?min-height:\s*var\(--pwa-viewport-fill-height\)\s*!important;[\s\S]*?background-color:\s*var\(--app-chrome-bg,\s*#10151d\) !important;[\s\S]*?background-image:\s*var\(--app-chrome-bg-image,\s*none\) !important;[\s\S]*?background-size:\s*100%[\s\S]*?calc\([\s\S]*?var\(--glass-mobile-root-vh,\s*var\(--app-height,\s*100dvh\)\) \+[\s\S]*?var\(--pwa-background-bottom-overscan\)[\s\S]*?\)/,
    "standalone/fullscreen PWA should paint the chrome fallback without adding scrollable layout height"
  );
  assert.match(
    coreCss,
    /html\[data-display-mode="standalone"\] \.app-root,[\s\S]*?html\[data-display-mode="fullscreen"\] \.app-root\s*\{[\s\S]*?min-height:\s*var\(--pwa-viewport-fill-height,\s*var\(--glass-mobile-root-vh,\s*var\(--app-height,\s*100dvh\)\)\) !important;[\s\S]*?background:\s*transparent\s*!important;/,
    "PWA app root should keep stable viewport height so keyboard focus cannot leave a bottom spacer"
  );
  assert.match(globalsCss, /@import url\("\.\/mobile\/mobile-background\.css"\) screen and \(max-width: 768px\);/);
  assert.match(mobileBackgroundCss, /html\[data-app-prepaint\][\s\S]*?background:\s*var\(--mobile-background-prepaint\)\s*!important;/);
  assert.match(
    mobileBackgroundCss,
    /html\[data-display-mode="standalone"\] \[data-bg-layer\],[\s\S]*?body\[data-display-mode="fullscreen"\] \[data-bg-layer\]\[data-page="home"\]\s*\{[\s\S]*?--pwa-background-bottom-overscan:\s*0px;[\s\S]*?inset:\s*0\s*!important;[\s\S]*?height:\s*var\(--glass-mobile-root-vh,\s*var\(--app-height,\s*100dvh\)\)\s*!important;/
  );
  assert.match(
    mobileBackgroundCss,
    /html\[data-display-mode="standalone"\],[\s\S]*?html\[data-display-mode="fullscreen"\] \.app-root\s*\{[\s\S]*?--pwa-viewport-fill-height:\s*var\(--glass-mobile-root-vh,\s*var\(--app-height,\s*100dvh\)\);[\s\S]*?height:\s*auto\s*!important;[\s\S]*?min-height:\s*var\(--pwa-viewport-fill-height\)\s*!important;[\s\S]*?max-height:\s*none\s*!important;/
  );
  assert.match(
    mobileBackgroundCss,
    /\[data-bg-layer\]\[data-mobile-bends="ready"\] \.bg-bends-layer,[\s\S]*?\.bg-particles-layer\[data-mobile-visible="ready"\][\s\S]*?transition-duration:\s*var\(--mobile-background-reveal-duration\),\s*0s\s*!important;/
  );
  assert.match(
    mobileBackgroundCss,
    /html\[data-display-mode="standalone"\] \[data-bg-layer\] :is\(\.bg-space-layer,\s*\.space-backdrop,\s*\.bg-bends-layer,\s*\.bg-particles-layer\),[\s\S]*?body\[data-display-mode="fullscreen"\] \[data-bg-layer\] :is\(\.bg-space-layer,\s*\.space-backdrop,\s*\.bg-bends-layer,\s*\.bg-particles-layer\)[\s\S]*?\{[\s\S]*?bottom:\s*0\s*!important;[\s\S]*?height:\s*auto\s*!important;/,
    "homepage background child layers should stay inside the measured viewport"
  );
  assert.match(backgroundLayer, /const INITIAL_PREPAINT_MAX_MS = 1200;/);
  assert.match(
    backgroundLayer,
    /window\.setTimeout\(\(\) => \{[\s\S]*?root\.removeAttribute\("data-app-prepaint"\);[\s\S]*?\}, INITIAL_PREPAINT_MAX_MS\)/
  );
  assert.match(
    mobileBackgroundCss,
    /html\[data-display-mode="standalone"\] body\.homepage,[\s\S]*?body\.homepage\[data-display-mode="fullscreen"\]\s*\{[\s\S]*?--home-mobile-safe-bottom:\s*0px;[\s\S]*?--home-mobile-canvas-height:\s*var\(--glass-mobile-root-vh,\s*var\(--app-height,\s*100dvh\)\);[\s\S]*?background:\s*var\(--home-browser-base-bg,[\s\S]*?\) !important;[\s\S]*?background-size:\s*100%\s*100%\s*!important;[\s\S]*?height:\s*var\(--home-mobile-canvas-height\)\s*!important;[\s\S]*?min-height:\s*var\(--home-mobile-canvas-height\)\s*!important;/,
    "installed homepage should keep the themed base background without adding an overscan layout box"
  );
  assert.match(
    mobileBackgroundCss,
    /html\[data-display-mode="standalone"\] body\.homepage \.homepage-root,[\s\S]*?body\.homepage\[data-display-mode="fullscreen"\] \.homepage-root\s*\{[\s\S]*?height:\s*auto\s*!important;[\s\S]*?min-height:\s*var\(--home-mobile-canvas-height,[\s\S]*?max-height:\s*none\s*!important;[\s\S]*?overflow-y:\s*auto\s*!important;/,
    "installed homepage scroll root should allow footer/logo content below the first viewport"
  );
  assert.match(
    mobileBackgroundCss,
    /html\[data-display-mode="standalone"\][\s\S]*?:is\([\s\S]*?\.glass-ring,[\s\S]*?\.chat-container\[data-chat-layout="mobile"\],[\s\S]*?\.policy-scroll-page-ring[\s\S]*?\)[\s\S]*?\{[\s\S]*?--glass-mobile-safe-bottom:\s*0px;[\s\S]*?--mobile-safe-bottom:\s*0px;/,
    "installed mobile glass panels should not subtract the iOS bottom safe area twice"
  );
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
  assert.match(
    coreCss,
    /html\[data-display-mode="standalone"\] \.click-pulse-cursor,[\s\S]*?body\[data-display-mode="fullscreen"\] \.click-pulse-cursor\s*\{[\s\S]*?display:\s*none\s*!important;/
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
