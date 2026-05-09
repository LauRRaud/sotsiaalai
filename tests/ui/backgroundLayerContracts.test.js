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
