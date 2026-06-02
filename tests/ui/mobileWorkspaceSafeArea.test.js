import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { readMobileCssBundle } from "../helpers/mobileCssBundle.mjs";


function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("workspace feature pages keep mobile safe areas without browser-mode layout forks", () => {
  const mobileCss = readMobileCssBundle();
  const viewportSetter = read("components/ViewportLayoutSetter.jsx");
  const backgroundLayer = read("components/backgrounds/BackgroundLayer.jsx");
  const particles = read("components/backgrounds/Particles.jsx");

  assert.match(
    mobileCss,
    /--mobile-safe-top:\s*env\(safe-area-inset-top,\s*0px\)/
  );
  assert.match(
    mobileCss,
    /--mobile-safe-bottom:\s*env\(safe-area-inset-bottom,\s*0px\)/
  );
  assert.match(
    viewportSetter,
    /function detectDisplayMode\(\)/
  );
  assert.match(
    viewportSetter,
    /matchMedia\?\.\("\(display-mode:\s*standalone\)"\)/
  );
  assert.match(
    viewportSetter,
    /setAttribute\("data-display-mode",\s*mode\)/
  );
  assert.doesNotMatch(viewportSetter, /data-display-mode-sticky|DISPLAY_MODE_STORAGE_KEY/);
  assert.doesNotMatch(
    mobileCss,
    /data-display-mode="standalone"[\s\S]{0,240}(?:chat-page-shell|profile-container|workspace|documents|materials|covision|glass-ring)/
  );
  assert.doesNotMatch(
    mobileCss,
    /(?:chat-page-shell|profile-container|workspace|documents|materials|covision|glass-ring)[\s\S]{0,240}data-display-mode="standalone"/
  );
  assert.doesNotMatch(mobileCss, /data-display-mode-sticky|mobile-pwa/);
  assert.doesNotMatch(
    mobileCss,
    /data-display-mode="browser"/
  );
  assert.doesNotMatch(
    backgroundLayer,
    /data-display-mode|display-mode:\s*(?:standalone|fullscreen)|browserMobileMode/
  );
  assert.doesNotMatch(
    particles,
    /display-mode:\s*(?:standalone|fullscreen)|navigator\?\.standalone|isStandaloneDisplay/
  );
  assert.doesNotMatch(
    mobileCss,
    /data-display-mode="browser"[\s\S]{0,240}(?:profile-container|workspace|documents|materials|covision|glass-ring)/
  );
  assert.doesNotMatch(
    mobileCss,
    /(?:profile-container|workspace|documents|materials|covision|glass-ring)[\s\S]{0,240}data-display-mode="browser"/
  );
  assert.match(
    mobileCss,
    /\.workspace-scroll-surface\.workspace-guide-panel\.workspace-feature-panel\s*\{[\s\S]*?overflow-y:\s*hidden\s*!important;/
  );
  assert.match(
    mobileCss,
    /\.workspace-scroll-surface\.workspace-guide-panel > \.workspace-guide-panel-scroll\s*\{[\s\S]*?padding-top:\s*calc\([\s\S]*?var\(--mobile-safe-top,\s*env\(safe-area-inset-top,\s*0px\)\)[\s\S]*?var\(--glass-ring-pad-top,\s*0\.6rem\)[\s\S]*?var\(--workspace-guide-panel-overscan-top,\s*0px\)/
  );
  assert.match(
    mobileCss,
    /\.workspace-scroll-surface\.workspace-guide-panel > \.workspace-guide-panel-scroll\s*\{[\s\S]*?--workspace-guide-panel-overscan-bottom:\s*calc\([\s\S]*?var\(--mobile-safe-bottom,\s*env\(safe-area-inset-bottom,\s*0px\)\)[\s\S]*?clamp\(0\.9rem,\s*2\.2vh,\s*1\.35rem\)[\s\S]*?\);/
  );
  assert.match(
    mobileCss,
    /\.workspace-scroll-surface\.workspace-guide-panel > \.workspace-guide-panel-scroll\s*\{[\s\S]*?height:\s*calc\([\s\S]*?100% \+ var\(--glass-ring-pad-top,\s*0\.6rem\) \+[\s\S]*?var\(--workspace-guide-panel-overscan-top\) \+[\s\S]*?var\(--workspace-guide-panel-overscan-bottom\)[\s\S]*?\)\s*!important;/
  );
  assert.match(
    mobileCss,
    /\.workspace-scroll-surface\.workspace-guide-panel > \.workspace-guide-panel-scroll\s*\{[\s\S]*?padding-bottom:\s*0\s*!important;/
  );
  assert.match(
    mobileCss,
    /\.help-listings-modal-content\s*\{[\s\S]*?padding-top:\s*calc\([\s\S]*?var\(--mobile-safe-top,\s*env\(safe-area-inset-top,\s*0px\)\)[\s\S]*?var\(--glass-ring-pad-top/
  );
  assert.match(
    mobileCss,
    /:is\([\s\S]*?\.policy-mobile-title-wrap,[\s\S]*?\.glass-subpage-title-wrap,[\s\S]*?\.workspace-guide-panel \.glass-subpage-title-wrap,[\s\S]*?\.workspace-feature-panel \.glass-subpage-title-wrap[\s\S]*?\)\s*\{[\s\S]*?padding-top:\s*var\(--mobile-common-title-top\)\s*!important;/
  );
});
