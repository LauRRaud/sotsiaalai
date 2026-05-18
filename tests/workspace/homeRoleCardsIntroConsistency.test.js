import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function readSource(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("home role card blur backdrop fades with the same intro on desktop and mobile", () => {
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
  assert.doesNotMatch(mobileCss, /homeCardBackdropIntroMobile/);
  assert.doesNotMatch(
    mobileCss,
    /\.homepage-root \.home-card-rotating-backdrop\s*\{[\s\S]*?backdrop-filter:\s*none\s*!important;/
  );
  assert.doesNotMatch(
    mobileCss,
    /\.homepage-root \.three-d-card\.(?:left|right) \.home-card-rotating-backdrop\s*\{[\s\S]*?radial-gradient/
  );
});
