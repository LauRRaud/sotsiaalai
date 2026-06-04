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
  const mobileHeaderCss = read("app/styles/mobile/subpage-title-system.css");

  assert.match(
    subscription,
    /<GlassSubpageHeader[\s\S]*?backClassName="workspace-scroll-back-button z-\[3\]"/
  );
  assert.match(
    mobileHeaderCss,
    /:is\([\s\S]*?\.subscription-modal-content[\s\S]*?\)\s*:is\(\.glass-subpage-title-wrap,\s*\.policy-mobile-title-wrap\)\s*\{[\s\S]*?padding-top:\s*calc\([\s\S]*?var\(--mobile-header-title-top\)[\s\S]*?var\(--mobile-header-browser-y-offset,\s*0rem\)[\s\S]*?\)\s*!important;/
  );
  assert.match(
    mobileHeaderCss,
    /:is\([\s\S]*?\.subscription-modal-content[\s\S]*?\)\s*:is\([\s\S]*?\.glass-subpage-back-button,[\s\S]*?\.workspace-scroll-back-button[\s\S]*?\)\s*\{[\s\S]*?left:\s*var\(--mobile-header-back-left\)\s*!important;[\s\S]*?top:\s*calc\([\s\S]*?var\(--mobile-header-control-top\)[\s\S]*?\)\s*!important;/
  );
});

test("subscription page does not add a desktop-only header offset", () => {
  const subscription = read("components/alalehed/TellimusBody.jsx");

  assert.match(subscription, /subscription-modal-content[\s\S]*?px-\[0\.95rem\] pt-0 pb-\[1rem\]/);
  assert.doesNotMatch(subscription, /subscription-modal-content[\s\S]*?px-\[0\.95rem\] pt-\[0\.35rem\] pb-\[1rem\]/);
});
