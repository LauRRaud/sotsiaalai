import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("workspace feature pages reserve iOS standalone status bar and bottom edge", () => {
  const mobileCss = read("app/styles/mobile.css");

  assert.match(
    mobileCss,
    /--mobile-pwa-safe-top:\s*max\(env\(safe-area-inset-top,\s*0px\),\s*clamp\(2\.35rem,\s*7vh,\s*3\.05rem\)\)/
  );
  assert.match(
    mobileCss,
    /--mobile-safe-top:\s*var\(--mobile-pwa-safe-top,\s*env\(safe-area-inset-top,\s*0px\)\)/
  );
  assert.match(
    mobileCss,
    /html:is\(\[data-display-mode="standalone"\][\s\S]*?\.glass-ring,[\s\S]*?body:is\(\[data-display-mode="standalone"\][\s\S]*?\.glass-ring\s*\{[\s\S]*?--glass-mobile-gap:\s*0px\s*!important;[\s\S]*?width:\s*100vw\s*!important;[\s\S]*?margin-left:\s*0\s*!important;/
  );
  assert.match(
    mobileCss,
    /\.workspace-scroll-surface\.workspace-guide-panel\.workspace-feature-panel\s*\{[\s\S]*?overflow-y:\s*hidden\s*!important;/
  );
  assert.match(
    mobileCss,
    /\.workspace-scroll-surface\.workspace-guide-panel > \.workspace-guide-panel-scroll\s*\{[\s\S]*?padding-top:\s*calc\([\s\S]*?var\(--mobile-safe-top,\s*env\(safe-area-inset-top,\s*0px\)\)[\s\S]*?var\(--glass-ring-pad-top,\s*0\.6rem\)[\s\S]*?var\(--workspace-guide-panel-overscan-top,\s*0px\)/
  );
  assert.match(
    mobileCss,
    /\.workspace-scroll-surface\.workspace-guide-panel > \.workspace-guide-panel-scroll\s*\{[\s\S]*?padding-bottom:\s*calc\(var\(--mobile-safe-bottom,\s*env\(safe-area-inset-bottom,\s*0px\)\) \+ clamp\(1\.15rem/
  );
  assert.match(
    mobileCss,
    /\.workspace-scroll-surface\.workspace-guide-panel > \.workspace-guide-panel-scroll\s*\{[\s\S]*?height:\s*calc\([\s\S]*?100% \+ var\(--glass-ring-pad-top,\s*0\.6rem\) \+[\s\S]*?var\(--workspace-guide-panel-overscan-top\) \+[\s\S]*?var\(--mobile-safe-bottom,\s*env\(safe-area-inset-bottom,\s*0px\)\)[\s\S]*?\)\s*!important;/
  );
  assert.match(
    mobileCss,
    /\.help-listings-modal-content\s*\{[\s\S]*?padding-top:\s*calc\([\s\S]*?var\(--mobile-safe-top,\s*env\(safe-area-inset-top,\s*0px\)\)[\s\S]*?var\(--glass-ring-pad-top/
  );
  assert.match(
    mobileCss,
    /\.workspace-feature-panel \.glass-subpage-title-wrap\s*\{[\s\S]*?padding-top:\s*calc\(var\(--mobile-safe-top,\s*env\(safe-area-inset-top,\s*0px\)\) \+ 1\.18rem\)\s*!important;/
  );
});
