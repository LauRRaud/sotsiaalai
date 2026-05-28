import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function readSource(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("high contrast keeps the left home card back title dark across split lines", () => {
  const css = readSource("app/styles/theme/hc.css");

  assert.match(
    css,
    /html\[data-contrast="hc"\] \.centered-back-left h2,\s*html\[data-contrast="hc"\] \.centered-back-left h2 span\s*\{\s*color:\s*#000 !important;/
  );
  assert.match(css, /html\[data-contrast="hc"\] \.centered-back-right h2\s*\{\s*color:\s*var\(--hc-accent\) !important;/);
});
