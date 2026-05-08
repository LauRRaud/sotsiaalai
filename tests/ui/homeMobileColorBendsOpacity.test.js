import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("mobile homepage fades ColorBends opacity while scrolling", () => {
  const backgroundLayer = read("components/backgrounds/BackgroundLayer.jsx");

  assert.match(backgroundLayer, /MOBILE_HOME_BENDS_OPACITY_FLOOR_RATIO\s*=\s*0\.22/);
  assert.match(backgroundLayer, /if \(!isHomepage \|\| !mobileBackgroundMode\) return;/);
  assert.match(backgroundLayer, /homepageRoot\.addEventListener\("scroll", onScroll/);
  assert.match(
    backgroundLayer,
    /colorBendsOpacity - progress \* \(colorBendsOpacity - floorOpacity\)/
  );
});
