import assert from "node:assert/strict";
import test from "node:test";
import { readMobileCssBundle } from "../helpers/mobileCssBundle.mjs";

test("mobile orbital stack list has no PWA-specific display mode override", () => {
  const css = readMobileCssBundle();

  assert.match(css, /\.profile-orbit-stack-list/);
  assert.match(
    css,
    /\.profile-orbit-stack-panel\s*\{[\s\S]*?overflow:\s*visible;[\s\S]*?--orbit-stack-panel-mask:\s*none;[\s\S]*?-webkit-mask-image:\s*none;[\s\S]*?mask-image:\s*none;/
  );
  assert.match(
    css,
    /\.profile-orbit-stack-fade\s*\{[\s\S]*?display:\s*none;[\s\S]*?opacity:\s*0;/
  );
  assert.match(
    css,
    /\.profile-orbit-stack-list\s*\{[\s\S]*?--stack-edge-fade:\s*0rem;[\s\S]*?padding-top:\s*0;[\s\S]*?padding-bottom:\s*0;[\s\S]*?--orbit-stack-list-mask:\s*none;[\s\S]*?-webkit-mask-image:\s*none;[\s\S]*?mask-image:\s*none;/
  );
  assert.doesNotMatch(
    css,
    /(?:^|})\s*[^{}]*data-display-mode="(?:standalone|fullscreen)"[^{}]*profile-orbit-stack-list[^{}]*\{/
  );
  assert.doesNotMatch(
    css,
    /(?:^|})\s*[^{}]*profile-orbit-stack-list[^{}]*data-display-mode="(?:standalone|fullscreen)"[^{}]*\{/
  );
});
