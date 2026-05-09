import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";

function readCss(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("PWA orbital stack list keeps top and bottom edge mask fade", () => {
  const css = readCss("app/styles/mobile.css");
  const pwaStackListBlock = css.match(
    /html:is\(\[data-display-mode="standalone"\],\s*\[data-display-mode="fullscreen"\]\)\.profile-orbit-open\s+\.profile-orbit-stack-list[\s\S]*?body:is\(\[data-display-mode="standalone"\],\s*\[data-display-mode="fullscreen"\]\)\.profile-orbit-open\s+\.profile-orbit-stack-list\s*\{([\s\S]*?)\n\s*\}/
  );

  assert.ok(pwaStackListBlock, "PWA stack list override should stay explicit");
  assert.doesNotMatch(
    pwaStackListBlock[1],
    /-webkit-mask-image:\s*none\s*!important|mask-image:\s*none\s*!important/,
    "PWA stack list must not disable the edge fade mask"
  );
});
