import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("desktop chat rooms navigation tilts the visible chat ring before route change", () => {
  const rightRail = read("components/chat/RightRail.jsx");
  const leftRail = read("components/chat/LeftRail.jsx");
  const mobileTopNav = read("components/alalehed/chat/view/ChatMobileTopNav.jsx");
  const roomsTiltPattern =
    /if \(isMobile\) \{[\s\S]*?pushWithTransition\(router,\s*localizePath\("\/ruum",\s*locale\)\);[\s\S]*?return;[\s\S]*?\}[\s\S]*?pushWithTransition\(router,\s*localizePath\("\/ruum",\s*locale\),\s*\{[\s\S]*?glassRingTilt:\s*"right",[\s\S]*?waitForGlassRingTilt:\s*true,[\s\S]*?persistGlassRingTilt:\s*false[\s\S]*?\}\);/;

  assert.match(rightRail, roomsTiltPattern);
  assert.match(leftRail, roomsTiltPattern);
  assert.match(mobileTopNav, /pushWithTransition\(router,\s*localizePath\("\/ruum",\s*locale\)\);/);
  assert.doesNotMatch(mobileTopNav, /glassRingTilt:\s*"right"/);
  assert.doesNotMatch(mobileTopNav, /waitForGlassRingTilt:\s*true/);
});
