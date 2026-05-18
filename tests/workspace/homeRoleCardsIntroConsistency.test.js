import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function readSource(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("home role card blur backdrop fades with the desktop card intro", () => {
  const homeCss = readSource("app/styles/components/home.css");
  const mobileCss = readSource("app/styles/mobile.css");
  const homePage = readSource("components/HomePage.jsx");

  assert.match(homePage, /home-card-rotating-backdrop-ready/);
  assert.match(homePage, /home-card-rotating-backdrop-reveal/);
  assert.doesNotMatch(homePage, /BLUR_REVEAL_DELAY_MS/);
  assert.doesNotMatch(homePage, /BlurRevealReady/);
  assert.match(
    homeCss,
    /\.homepage-root \.home-card-rotating-backdrop\s*\{[\s\S]*?background:\s*rgb\(255 255 255 \/ 0\.004\);[\s\S]*?-webkit-backdrop-filter:\s*blur\(0\.34rem\) saturate\(103%\);[\s\S]*?backdrop-filter:\s*blur\(0\.34rem\) saturate\(103%\);[\s\S]*?opacity:\s*1;/
  );
  assert.match(
    homeCss,
    /\.homepage-root \.home-card-rotating-backdrop-reveal\s*\{[\s\S]*?animation:\s*homeCardBackdropIntro 2400ms cubic-bezier\(0\.61,\s*0,\s*0\.19,\s*1\) 500ms both;/
  );
  assert.match(
    homeCss,
    /\.homepage-root \.home-card-rotating-backdrop-ready\s*\{[\s\S]*?opacity:\s*1;/
  );
  assert.match(
    homeCss,
    /three-d-card:is\(:hover,\s*:focus-within,\s*:active\)[\s\S]*?\.home-card-rotating-backdrop[\s\S]*?backdrop-filter:\s*blur/
  );
  assert.match(
    homeCss,
    /@keyframes homeCardBackdropIntro\s*\{[\s\S]*?0%\s*\{[\s\S]*?opacity:\s*0;[\s\S]*?70%\s*\{[\s\S]*?opacity:\s*1;[\s\S]*?100%\s*\{[\s\S]*?opacity:\s*1;/
  );
  const mobileBackdropBlock = mobileCss.match(
    /\.homepage-root \.home-card-rotating-backdrop\s*\{[^}]*\}/
  )?.[0] || "";
  assert.ok(mobileBackdropBlock, "expected a mobile home card backdrop rule");
  assert.match(
    mobileBackdropBlock,
    /-webkit-backdrop-filter:\s*none\s*!important;[\s\S]*?backdrop-filter:\s*none\s*!important;/
  );
  assert.match(
    mobileCss,
    /\.homepage-root \.home-card-rotating-backdrop-reveal\s*\{[\s\S]*?animation:\s*homeCardBackdropIntroMobile 2400ms cubic-bezier\(0\.61,\s*0,\s*0\.19,\s*1\) 500ms both\s*!important;/
  );
  assert.match(
    mobileCss,
    /@keyframes homeCardBackdropIntroMobile\s*\{[\s\S]*?0%\s*\{[\s\S]*?opacity:\s*0;[\s\S]*?filter:\s*blur\(0\.16rem\);[\s\S]*?transform:\s*scale\(0\.965\);[\s\S]*?42%\s*\{[\s\S]*?filter:\s*blur\(0\);[\s\S]*?70%\s*\{[\s\S]*?opacity:\s*1;[\s\S]*?filter:\s*blur\(0\);[\s\S]*?transform:\s*scale\(1\);[\s\S]*?100%\s*\{[\s\S]*?opacity:\s*1;[\s\S]*?filter:\s*blur\(0\);[\s\S]*?transform:\s*scale\(1\);/
  );
  const mobileKeyframesBlock = mobileCss.match(
    /@keyframes homeCardBackdropIntroMobile\s*\{[\s\S]*?\n\s*\}/
  )?.[0] || "";
  assert.ok(mobileKeyframesBlock, "expected mobile intro keyframes");
  assert.doesNotMatch(mobileKeyframesBlock, /scale\(0\.88\)/);
});
