import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("covision overview uses the shared workspace feature panel footprint", () => {
  const source = read("components/covision/CovisionPage.jsx");
  const css = read("components/covision/CovisionPage.module.css");

  assert.match(source, /covision-page-surface/);
  assert.match(source, /mobile-keep-desktop-glass-cards/);
  assert.match(source, /!w-\[min\(calc\(100vw-2rem\),clamp\(36rem,76vw,54rem\)\)\]/);
  assert.match(css, /\.surface\.surface\s*\{[\s\S]*?height:\s*min\(52rem,\s*calc\(100dvh - 2rem\)\)\s*!important/);
  assert.match(css, /\.surface\.surface\s*\{[\s\S]*?min-height:\s*0\s*!important/);
  assert.match(css, /\.surface\.surface\s*\{[\s\S]*?max-height:\s*calc\(100dvh - 2rem\)\s*!important/);
  assert.doesNotMatch(source, /!min-h-\[clamp\(40rem/);
});
