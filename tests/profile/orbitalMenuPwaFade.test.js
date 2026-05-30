import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";

function readCss(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("mobile orbital stack list has no PWA-specific display mode override", () => {
  const css = readCss("app/styles/mobile.css");

  assert.match(css, /\.profile-orbit-stack-list/);
  assert.doesNotMatch(
    css,
    /(?:^|})\s*[^{}]*data-display-mode="(?:standalone|fullscreen)"[^{}]*profile-orbit-stack-list[^{}]*\{/
  );
  assert.doesNotMatch(
    css,
    /(?:^|})\s*[^{}]*profile-orbit-stack-list[^{}]*data-display-mode="(?:standalone|fullscreen)"[^{}]*\{/
  );
});
