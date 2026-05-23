import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";

function readCss(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("register and accessibility scroll masks are disabled", () => {
  const css = readCss("components/CenteredScrollPicker.css");
  const sharedBlocks = [
    ...css.matchAll(
      /\.register-scroll\.csp-container,[\s\S]*?\.a11y-csp-scroll\.csp-container\s*\{([\s\S]*?)\n\}/g
    ),
  ];
  const finalOverride = sharedBlocks.at(-1);

  assert.ok(finalOverride, "register/accessibility mask override should exist");
  assert.match(
    finalOverride[1],
    /-webkit-mask-image:\s*none\s*!important/
  );
  assert.match(
    finalOverride[1],
    /mask-image:\s*none\s*!important/
  );
});
