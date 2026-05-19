import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("policy pages use the scroll-surface back header pattern", () => {
  const guide = read("components/alalehed/KasutusjuhendBody.jsx");
  const terms = read("components/alalehed/KasutustingimusedBody.jsx");
  const privacy = read("components/alalehed/PrivaatsusBody.jsx");
  const mobileCss = read("app/styles/mobile.css");

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
    mobileCss,
    /\.policy-scroll-page-ring::before\s*\{[\s\S]*?display:\s*none\s*!important/
  );
  assert.match(
    mobileCss,
    /\.policy-scroll-page-scroller\.glass-policy-scroll,[\s\S]*?mask-image:\s*none\s*!important;[\s\S]*?-webkit-mask-image:\s*none\s*!important;/
  );
  assert.match(
    mobileCss,
    /\.policy-scroll-page-ring \.glass-policy-content,[\s\S]*?overflow:\s*visible\s*!important;/
  );
  assert.match(
    mobileCss,
    /\.policy-scroll-page-scroller\.glass-policy-scroll,[\s\S]*?width:\s*calc\([\s\S]*?100% \+ var\(--policy-scroll-edge-pad-x\) \+ var\(--policy-scroll-edge-pad-x\)[\s\S]*?margin-left:\s*calc\(0px - var\(--policy-scroll-edge-pad-x\)\)\s*!important;/
  );
  assert.match(
    mobileCss,
    /\.policy-scroll-page-scroller\.glass-policy-scroll,[\s\S]*?--policy-scroll-overscan-top:\s*clamp\(1\.6rem,\s*4\.8vh,\s*2\.4rem\);[\s\S]*?height:\s*calc\([\s\S]*?100% \+ var\(--policy-scroll-edge-pad-top\) \+[\s\S]*?var\(--policy-scroll-overscan-top\)[\s\S]*?\)\s*!important;[\s\S]*?margin-top:\s*calc\([\s\S]*?0px - var\(--policy-scroll-edge-pad-top\) -[\s\S]*?var\(--policy-scroll-overscan-top\)[\s\S]*?\)\s*!important;/
  );
  assert.match(
    mobileCss,
    /\.policy-scroll-page-scroller\.glass-policy-scroll,[\s\S]*?--workspace-guide-panel-overscan-top:\s*var\(--policy-scroll-overscan-top\);[\s\S]*?--workspace-guide-panel-overscan-bottom:\s*var\(--policy-scroll-overscan-bottom\);/
  );
  assert.match(
    mobileCss,
    /@media \(max-width:\s*768px\)[\s\S]*?\.policy-scroll-page-scroller\.glass-policy-scroll,[\s\S]*?--policy-scroll-overscan-top:\s*clamp\(2\.2rem,\s*8vh,\s*3rem\);/
  );
  assert.doesNotMatch(mobileCss, /scroll-snap-type:\s*y mandatory\s*!important;/);
  assert.match(
    mobileCss,
    /\.policy-scroll-back-button\s*\{[\s\S]*?position:\s*absolute\s*!important;[\s\S]*?left:\s*0\.55rem\s*!important;[\s\S]*?top:\s*calc\(var\(--policy-scroll-overscan-top,\s*0px\) \+ 0\.55rem\)\s*!important;/
  );
  assert.match(
    mobileCss,
    /\.workspace-scroll-surface \.workspace-scroll-back-button\s*\{[\s\S]*?left:\s*calc\(env\(safe-area-inset-left,\s*0px\) \+ 0\.04rem\)\s*!important;[\s\S]*?top:\s*calc\([\s\S]*?var\(--workspace-guide-panel-overscan-top,\s*0px\) \+[\s\S]*?0\.2rem[\s\S]*?\)\s*!important;/
  );
  assert.equal(mobileCss.includes('--mobile-common-title-top: 2.18rem;'), true);
  assert.match(
    mobileCss,
    /:is\([\s\S]*?\.direct-scroll-surface,[\s\S]*?\.subscription-modal-content,[\s\S]*?\.policy-scroll-page-ring,[\s\S]*?\.workspace-guide-panel\.glass-subpage-surface[\s\S]*?\)\s*\.glass-subpage-title-wrap\s*\{[\s\S]*?padding-top:\s*calc\(var\(--mobile-common-title-top\) \+ 0\.216rem\)\s*!important;/
  );
  assert.doesNotMatch(mobileCss, /\.policy-mobile-tall \.policy-mobile-title-wrap/);
  assert.equal(mobileCss.includes('html:not([data-platform="android"]) .policy-mobile-title-wrap'), false);
  assert.equal(mobileCss.includes('html[data-platform="android"] .policy-mobile-title-wrap'), false);
  assert.equal(mobileCss.includes('body[data-platform="android"] .policy-mobile-title-wrap'), false);
});
