import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";

const source = readFileSync(
  new URL("../../components/backgrounds/BackgroundLayer.jsx", import.meta.url),
  "utf8"
);

function setEntries(name) {
  const match = source.match(new RegExp(`const ${name} = new Set\\(\\[([\\s\\S]*?)\\]\\);`));
  assert.ok(match, `${name} set must exist`);
  return [...match[1].matchAll(/"([^"]+)"/g)].map((entry) => entry[1]);
}

test("service map keeps the shared background but excludes animated overlays", () => {
  assert.ok(setEntries("COLOR_BENDS_EXCLUDED_PATHS").includes("/teenusekaart"));
  assert.ok(setEntries("PARTICLES_EXCLUDED_PATHS").includes("/teenusekaart"));
  assert.ok(!setEntries("BACKGROUND_LAYER_EXCLUDED_PATHS").includes("/teenusekaart"));
});

test("documents and agent mode keep color bends visible", () => {
  assert.ok(!setEntries("COLOR_BENDS_EXCLUDED_PATHS").includes("/documents"));
  assert.ok(!setEntries("COLOR_BENDS_EXCLUDED_PATHS").includes("/dokreziim"));
  assert.ok(!setEntries("MOBILE_COLOR_BENDS_READY_PATHS").includes("/documents"));
  assert.ok(!setEntries("MOBILE_COLOR_BENDS_READY_PATHS").includes("/dokreziim"));
});

test("covision keeps color bends while the glass corner glow stays on the surface edge", () => {
  assert.ok(!setEntries("COLOR_BENDS_EXCLUDED_PATHS").includes("/kovisioon"));
  assert.ok(!setEntries("BACKGROUND_LAYER_EXCLUDED_PATHS").includes("/kovisioon"));
});

test("homepage color bends still fade on scroll when motion is reduced", () => {
  assert.match(
    source,
    /el\.style\.setProperty\("--saai-bends-opacity", String\(colorBendsOpacity\)\);[\s\S]*if \(!isHomepage\) return;[\s\S]*const bendsOpacity = mobileBackgroundMode[\s\S]*: \(1 - clamp\(\(y - 240\) \/ 220, 0, 1\)\) \* colorBendsOpacity;/
  );
});
