import assert from "node:assert/strict";
import test from "node:test";
import { readMobileCssBundle } from "../helpers/mobileCssBundle.mjs";

test("mobile orbital stack list has no PWA-specific display mode override", () => {
  const css = readMobileCssBundle();

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
