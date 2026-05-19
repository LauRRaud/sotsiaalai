import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("home public subpages keep the shared mobile glass card gap", () => {
  const features = read("components/alalehed/VoimalusedBody.jsx");
  const pricing = read("components/alalehed/HinnastusBody.jsx");

  for (const source of [features, pricing]) {
    assert.match(source, /<GlassSubpageHeader[\s\S]*?titleId=/);
    assert.doesNotMatch(source, /--mobile-glass-card-gap/);
    assert.doesNotMatch(source, /headerClassName=|titleClassName=|backClassName=/);
  }
});

test("home quick links route to the checked public glass subpages", () => {
  const homeAbout = read("components/HomeSections/HomeAboutSection.jsx");

  for (const pathname of [
    "/voimalused",
    "/kasutusjuhend",
    "/kasutustingimused",
    "/privaatsustingimused",
    "/hinnastus"
  ]) {
    assert.match(homeAbout, new RegExp(`href[:=]\\s*"${pathname}"`));
  }
});

test("subscription page uses the shared subpage back button class on mobile", () => {
  const subscription = read("components/alalehed/TellimusBody.jsx");
  const mobileCss = read("app/styles/mobile.css");

  assert.match(
    subscription,
    /<GlassSubpageHeader[\s\S]*?backClassName="workspace-scroll-back-button z-\[3\]"/
  );
  assert.match(
    mobileCss,
    /\.subscription-modal-content \.glass-subpage-title-wrap\.policy-mobile-title-wrap\s*\{[\s\S]*?padding-top:\s*calc\(var\(--mobile-common-title-top\) \+ 0\.396rem\)\s*!important;/
  );
  assert.match(
    mobileCss,
    /\.subscription-modal-content :is\(\.glass-subpage-back-button,\s*\.workspace-scroll-back-button\)\s*\{[\s\S]*?left:\s*calc\(env\(safe-area-inset-left,\s*0px\) \+ 0\.04rem\)\s*!important;[\s\S]*?top:\s*0\.2rem\s*!important;/
  );
});
