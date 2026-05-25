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

test("home role card intro is remembered across chat navigation returns", () => {
  const homePage = readSource("components/HomePage.jsx");
  const appPage = readSource("app/page.js");

  assert.match(homePage, /const HOME_RETURN_FROM_CHAT_KEY = "sotsiaalai:home-return-from-chat";/);
  assert.match(homePage, /const HOME_FULL_INTRO = "full";/);
  assert.match(homePage, /const HOME_SOFT_INTRO = "soft";/);
  assert.match(homePage, /const SOFT_FADE_DELAY_MS = 40;/);
  assert.match(homePage, /const SOFT_FADE_DURATION_MS = 600;/);
  assert.doesNotMatch(homePage, /HOME_INTRO_SEEN_KEY/);
  assert.doesNotMatch(homePage, /HOME_INTRO_SEEN_COOKIE/);
  assert.doesNotMatch(homePage, /persistHomeIntroSeen/);
  assert.doesNotMatch(homePage, /hasPersistedHomeIntroSeen/);
  assert.match(
    homePage,
    /export default function HomePage\(\{ initialIntroVariant = HOME_FULL_INTRO \} = \{\}\)/
  );
  assert.match(
    homePage,
    /const initialIntroMode =[\s\S]*?initialIntroVariant === HOME_SOFT_INTRO \? HOME_SOFT_INTRO : HOME_FULL_INTRO;/
  );
  assert.match(
    homePage,
    /const startSoftIntroState = useCallback\(\(\) => \{[\s\S]*?setIntroMode\(HOME_SOFT_INTRO\);[\s\S]*?setIntroStart\(false\);[\s\S]*?setLeftFadeDone\(false\);[\s\S]*?setRightFadeDone\(false\);/
  );
  assert.match(
    homePage,
    /const markChatEnterFromHome = useCallback\(\(\) => \{[\s\S]*?window\.sessionStorage\.setItem\("sotsiaalai:chat-enter-from-home",\s*String\(Date\.now\(\)\)\);/
  );
  assert.match(
    homePage,
    /if \(returnedFromChat\) \{[\s\S]*?window\.sessionStorage\.removeItem\(HOME_RETURN_FROM_CHAT_KEY\);[\s\S]*?\}[\s\S]*?if \(!returnedFromChat\) return;[\s\S]*?startSoftIntroState\(\);/
  );
  assert.match(homePage, /const fadeDurationMs =[\s\S]*?introMode === HOME_FULL_INTRO \? CARD_FADE_DELAY_MS \+ CARD_FADE_DURATION_MS : SOFT_FADE_DURATION_MS;/);
  assert.match(homePage, /const isFullIntro = introMode === HOME_FULL_INTRO && !prefs\.reduceMotion;/);
  assert.match(homePage, /const isSoftIntro = introMode === HOME_SOFT_INTRO && !prefs\.reduceMotion;/);
  assert.match(homePage, /const delayMs = isFullIntro \? INTRO_ANIMATION_DELAY_MS : SOFT_FADE_DELAY_MS;/);
  assert.match(homePage, /if \(introMode !== HOME_FULL_INTRO\) \{[\s\S]*?setShowHomeBottomSections\(true\);[\s\S]*?setShowHomeFooter\(true\);[\s\S]*?return;/);
  assert.match(homePage, /introMode === HOME_SOFT_INTRO \? "is-visible" : "", "relative z-\[4\]"/);
  assert.doesNotMatch(appPage, /HOME_INTRO_SEEN_COOKIE/);
  assert.match(appPage, /return <HomePage \/>;/);
});
