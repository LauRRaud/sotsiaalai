import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("workspace and framework scroll pages keep the back button inside the scrolling surface", () => {
  const materials = read("components/materials/MaterialsPage.jsx");
  const covision = read("components/covision/CovisionPage.jsx");
  const workspaceFeature = read("components/workspace/WorkspaceFeaturePage.jsx");
  const framework = read("components/alalehed/TooalaseRaamistikuBody.jsx");
  const helpersCss = read("app/styles/utilities/helpers.css");
  const mobileCss = read("app/styles/mobile.css");

  for (const source of [materials, covision]) {
    assert.match(source, /workspace-scroll-surface/);
    assert.match(source, /<GlassSubpageHeader[\s\S]*?anchorBack=\{false\}[\s\S]*?backClassName="workspace-scroll-back-button"/);
  }

  assert.match(workspaceFeature, /workspace-scroll-surface/);
  assert.match(workspaceFeature, /anchorBack=\{isServiceMap\}/);
  assert.match(workspaceFeature, /backClassName=\{!isServiceMap \? "workspace-scroll-back-button" : null\}/);

  assert.match(framework, /<GlassSubpageHeader[\s\S]*?anchorBack=\{false\}[\s\S]*?backClassName="policy-scroll-back-button"/);

  for (const css of [helpersCss, mobileCss]) {
    assert.match(css, /\.workspace-scroll-surface\.workspace-guide-panel > \.workspace-guide-panel-scroll\s*\{/);
    assert.match(css, /mask-image:\s*none\s*!important;[\s\S]*?-webkit-mask-image:\s*none\s*!important;/);
    assert.match(css, /\.workspace-scroll-surface \.workspace-scroll-back-button\s*\{[\s\S]*?position:\s*absolute\s*!important;[\s\S]*?left:\s*0\.55rem\s*!important;[\s\S]*?top:\s*0\.55rem\s*!important;/);
  }

  assert.match(
    mobileCss,
    /@media \(max-width:\s*768px\)[\s\S]*?\.workspace-scroll-surface \.workspace-scroll-back-button\s*\{[\s\S]*?left:\s*calc\(env\(safe-area-inset-left,\s*0px\) \+ 0\.04rem\)\s*!important;[\s\S]*?top:\s*calc\([\s\S]*?env\(safe-area-inset-top,\s*0px\) \+ 0\.22rem[\s\S]*?clamp\(calc\(0\.4 \* var\(--base-rem,\s*16px\)\),\s*1\.4vh,\s*calc\(1\.1 \* var\(--base-rem,\s*16px\)\)\)[\s\S]*?var\(--workspace-guide-panel-pad-top/
  );
});
