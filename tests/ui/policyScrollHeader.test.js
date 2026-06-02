import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { readMobileCssBundle } from "../helpers/mobileCssBundle.mjs";


function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("policy pages use the scroll-surface back header pattern", () => {
  const guide = read("components/alalehed/KasutusjuhendBody.jsx");
  const terms = read("components/alalehed/KasutustingimusedBody.jsx");
  const privacy = read("components/alalehed/PrivaatsusBody.jsx");
  const mobileCss = readMobileCssBundle();
  const policyMobileCss = read("app/styles/mobile/policy-scroll.css");
  const mobileHeaderCss = read("app/styles/mobile/subpage-title-system.css");

  for (const source of [guide, terms, privacy]) {
    assert.match(source, /policy-scroll-page-ring/);
    assert.match(source, /policy-scroll-page-scroller/);
    assert.match(source, /workspace-scroll-surface/);
    assert.match(source, /<GlassSubpageHeader[\s\S]*?anchorBack=\{false\}[\s\S]*?backClassName="workspace-scroll-back-button"/);
    assert.doesNotMatch(source, /backClassName="policy-scroll-back-button"/);
    assert.doesNotMatch(source, /glassPageBackMobileBottomCenterClassName|glassPolicyBackButtonClassName/);
    assert.doesNotMatch(source, /titleClassName=/);
  }

  assert.doesNotMatch(terms, /import CloseButton|import BackButton/);
  assert.doesNotMatch(privacy, /import CloseButton|import BackButton/);
  assert.doesNotMatch(guide, /import BackButton/);

  assert.match(
    policyMobileCss,
    /\.policy-scroll-page-ring::before\s*\{[\s\S]*?display:\s*none\s*!important/
  );
  assert.match(
    policyMobileCss,
    /\.policy-scroll-page-scroller\.glass-policy-scroll,[\s\S]*?mask-image:\s*none\s*!important;[\s\S]*?-webkit-mask-image:\s*none\s*!important;/
  );
  assert.match(
    policyMobileCss,
    /\.policy-scroll-page-ring \.glass-policy-content,[\s\S]*?overflow:\s*visible\s*!important;/
  );
  assert.match(
    policyMobileCss,
    /\.policy-scroll-page-scroller\.glass-policy-scroll,[\s\S]*?width:\s*calc\([\s\S]*?100% \+ var\(--policy-scroll-edge-pad-x\) \+ var\(--policy-scroll-edge-pad-x\)[\s\S]*?margin-left:\s*calc\(0px - var\(--policy-scroll-edge-pad-x\)\)\s*!important;/
  );
  assert.match(
    policyMobileCss,
    /\.policy-scroll-page-scroller\.glass-policy-scroll,[\s\S]*?--policy-scroll-overscan-top:\s*clamp\(1\.6rem,\s*4\.8vh,\s*2\.4rem\);[\s\S]*?height:\s*calc\([\s\S]*?100% \+ var\(--policy-scroll-edge-pad-top\) \+[\s\S]*?var\(--policy-scroll-overscan-top\)[\s\S]*?\)\s*!important;[\s\S]*?margin-top:\s*calc\([\s\S]*?0px - var\(--policy-scroll-edge-pad-top\) -[\s\S]*?var\(--policy-scroll-overscan-top\)[\s\S]*?\)\s*!important;/
  );
  assert.match(
    policyMobileCss,
    /\.policy-scroll-page-scroller\.glass-policy-scroll,[\s\S]*?--workspace-guide-panel-overscan-top:\s*var\(--policy-scroll-overscan-top\);[\s\S]*?--workspace-guide-panel-overscan-bottom:\s*var\(--policy-scroll-overscan-bottom\);/
  );
  assert.match(
    policyMobileCss,
    /@media \(max-width:\s*768px\)[\s\S]*?\.policy-scroll-page-scroller\.glass-policy-scroll,[\s\S]*?--policy-scroll-overscan-top:\s*clamp\(2\.2rem,\s*8vh,\s*3rem\);/
  );
  assert.doesNotMatch(mobileCss, /scroll-snap-type:\s*y mandatory\s*!important;/);
  assert.doesNotMatch(mobileCss, /\.policy-scroll-back-button\s*\{/);
  assert.match(
    mobileCss,
    /\.workspace-scroll-surface \.workspace-scroll-back-button\s*\{[\s\S]*?left:\s*calc\(env\(safe-area-inset-left,\s*0px\) \+ 0\.04rem\)\s*!important;[\s\S]*?top:\s*0\.2rem\s*!important;/
  );
  assert.equal(mobileCss.includes('--mobile-common-title-top: 2.18rem;'), true);
  assert.match(
    mobileCss,
    /:is\([\s\S]*?\.direct-scroll-surface,[\s\S]*?\.subscription-modal-content,[\s\S]*?\.policy-scroll-page-ring,[\s\S]*?\.workspace-guide-panel\.glass-subpage-surface[\s\S]*?\)\s*\.glass-subpage-title-wrap\s*\{[\s\S]*?padding-top:\s*calc\(var\(--mobile-common-title-top\) \+ 0\.396rem\)\s*!important;/
  );
  assert.match(
    mobileHeaderCss,
    /\.policy-scroll-page-scroller\s*\{[\s\S]*?--mobile-header-control-top:\s*calc\([\s\S]*?var\(--policy-scroll-edge-pad-top,\s*0px\)[\s\S]*?var\(--policy-scroll-overscan-top,\s*0px\) - 0\.54rem[\s\S]*?\);/
  );
  assert.match(
    mobileHeaderCss,
    /\.policy-scroll-page-ring[\s\S]*?:is\(\.glass-subpage-title-wrap,\s*\.policy-mobile-title-wrap\)[\s\S]*?padding-top:\s*calc\([\s\S]*?var\(--mobile-header-title-top\)[\s\S]*?var\(--mobile-header-browser-y-offset,\s*0rem\)[\s\S]*?var\(--mobile-header-pwa-y-offset,\s*0rem\)[\s\S]*?\)\s*!important;/
  );
  assert.doesNotMatch(
    mobileHeaderCss,
    /\.policy-scroll-page-ring[\s\S]*?--mobile-header-pwa-y-offset:\s*-/
  );
  assert.doesNotMatch(mobileCss, /\.policy-mobile-tall \.policy-mobile-title-wrap/);
  assert.equal(mobileCss.includes('html:not([data-platform="android"]) .policy-mobile-title-wrap'), false);
  assert.equal(mobileCss.includes('html[data-platform="android"] .policy-mobile-title-wrap'), false);
  assert.equal(mobileCss.includes('body[data-platform="android"] .policy-mobile-title-wrap'), false);
  assert.match(
    policyMobileCss,
    /@media \(max-width:\s*768px\)[\s\S]*?\.policy-scroll-page-scroller\.glass-policy-scroll,[\s\S]*?var\(--policy-scroll-overscan-bottom\)\s*!important;/
  );
  assert.match(
    mobileHeaderCss,
    /:is\([\s\S]*?\.workspace-scroll-back-button,[\s\S]*?\.scroll-reactive-back[\s\S]*?\)\s*\{[\s\S]*?top:\s*calc\([\s\S]*?var\(--mobile-header-control-top\)[\s\S]*?var\(--mobile-header-browser-y-offset,\s*0rem\)[\s\S]*?var\(--mobile-header-pwa-y-offset,\s*0rem\)[\s\S]*?\)\s*!important;/
  );
  assert.match(
    policyMobileCss,
    /html\[data-display-mode="browser"\][\s\S]*?\.policy-scroll-page-scroller\.glass-policy-scroll,[\s\S]*?--policy-mobile-browser-bottom-clearance:\s*clamp\(4\.25rem,\s*13vh,\s*6\.5rem\);[\s\S]*?padding:\s*calc\([\s\S]*?var\(--policy-scroll-edge-pad-top\)[\s\S]*?calc\([\s\S]*?var\(--policy-scroll-edge-pad-x\)[\s\S]*?calc\([\s\S]*?var\(--policy-scroll-overscan-bottom\) \+[\s\S]*?var\(--policy-mobile-browser-bottom-clearance\)[\s\S]*?\)\s*!important;/
  );
  assert.match(
    policyMobileCss,
    /html\[data-display-mode="browser"\][\s\S]*?\.policy-scroll-page-ring[\s\S]*?\.policy-scroll-page-scroller\.glass-policy-scroll\.glass-ring-scroll,[\s\S]*?padding-bottom:\s*calc\([\s\S]*?var\(--policy-scroll-overscan-bottom\) \+[\s\S]*?var\(--policy-mobile-browser-bottom-clearance\)[\s\S]*?\)\s*!important;/
  );
});
