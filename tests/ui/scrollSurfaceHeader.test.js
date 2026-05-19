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
  const features = read("components/alalehed/VoimalusedBody.jsx");
  const pricing = read("components/alalehed/HinnastusBody.jsx");
  const author = read("components/alalehed/AutoriltBody.jsx");
  const invite = read("components/invite/InviteModal.jsx");
  const helpersCss = read("app/styles/utilities/helpers.css");
  const mobileCss = read("app/styles/mobile.css");

  for (const source of [materials, covision]) {
    assert.match(source, /workspace-scroll-surface/);
    assert.match(source, /<GlassSubpageHeader[\s\S]*?anchorBack=\{false\}[\s\S]*?backClassName="workspace-scroll-back-button"/);
  }

  assert.match(workspaceFeature, /workspace-scroll-surface/);
  assert.match(workspaceFeature, /anchorBack=\{isServiceMap\}/);
  assert.match(workspaceFeature, /backClassName=\{!isServiceMap \? "workspace-scroll-back-button" : null\}/);

  assert.match(framework, /<GlassSubpageHeader[\s\S]*?anchorBack=\{false\}[\s\S]*?backClassName="workspace-scroll-back-button"/);
  for (const source of [framework, features, pricing, author]) {
    assert.match(source, /direct-scroll-surface/);
  }

  for (const css of [helpersCss, mobileCss]) {
    assert.match(css, /\.workspace-scroll-surface\.workspace-guide-panel > \.workspace-guide-panel-scroll\s*\{/);
    assert.match(css, /--workspace-guide-panel-overscan-top:\s*clamp\(1\.6rem,\s*4\.8vh,\s*2\.4rem\)/);
    assert.match(css, /--workspace-guide-panel-overscan-bottom:\s*clamp\(1\.05rem,\s*2\.4vh,\s*1\.45rem\)/);
    assert.match(
      css,
      /height:\s*calc\([\s\S]*?100% \+[\s\S]*?var\(--workspace-guide-panel-overscan-top\) \+[\s\S]*?var\(--workspace-guide-panel-overscan-bottom\)[\s\S]*?\)\s*!important;/
    );
    assert.match(css, /padding-bottom:\s*var\(--workspace-guide-panel-overscan-bottom\)\s*!important;/);
    assert.match(css, /mask-image:\s*none\s*!important;[\s\S]*?-webkit-mask-image:\s*none\s*!important;/);
    assert.match(css, /\.workspace-scroll-surface \.workspace-scroll-back-button\s*\{[\s\S]*?position:\s*absolute\s*!important;[\s\S]*?left:\s*0\.55rem\s*!important;[\s\S]*?top:\s*calc\(var\(--workspace-guide-panel-overscan-top,\s*0px\) \+ 0\.55rem\)\s*!important;/);
  }

  assert.match(invite, /invite-modal-content--workspace/);
  assert.doesNotMatch(invite, /invite-modal-content--workspace workspace-scroll-surface/);
  assert.match(invite, /isWorkspaceReturn \? "!overflow-y-auto" : "!overflow-y-hidden"/);
  assert.match(
    mobileCss,
    /\.invite-modal-content--workspace\.workspace-guide-panel\.glass-subpage-surface\s*\{[\s\S]*?overflow-y:\s*auto\s*!important;/
  );
  assert.match(
    mobileCss,
    /\.invite-modal-content--workspace\.workspace-guide-panel\.glass-subpage-surface[\s\S]*?> \.invite-modal-scroll\.workspace-guide-panel-scroll\s*\{[\s\S]*?overflow:\s*visible\s*!important;/
  );

  assert.match(mobileCss, /\.direct-scroll-surface\s*\{[\s\S]*?padding-top:\s*0\s*!important;/);
  assert.match(mobileCss, /\.direct-scroll-surface\s*\{[\s\S]*?--direct-scroll-surface-header-offset:\s*0px;/);

  assert.match(
    mobileCss,
    /@media \(max-width:\s*768px\)[\s\S]*?\.workspace-scroll-surface \.workspace-scroll-back-button\s*\{[\s\S]*?left:\s*calc\(env\(safe-area-inset-left,\s*0px\) \+ 0\.04rem\)\s*!important;[\s\S]*?\}/
  );
  assert.doesNotMatch(
    mobileCss,
    /@media \(max-width:\s*768px\)[\s\S]*?\.workspace-scroll-surface \.workspace-scroll-back-button\s*\{[\s\S]*?env\(safe-area-inset-top,\s*0px\) \+ 0\.22rem[\s\S]*?workspace-guide-panel-pad-top/
  );
  assert.match(
    mobileCss,
    /\.workspace-scroll-surface \.workspace-scroll-back-button\s*\{[\s\S]*?top:\s*calc\([\s\S]*?var\(--workspace-guide-panel-overscan-top,\s*0px\) \+[\s\S]*?0\.2rem[\s\S]*?\)\s*!important;/
  );
  assert.match(
    mobileCss,
    /:is\([\s\S]*?\.direct-scroll-surface,[\s\S]*?\.documents-workspace-shell\.workspace-guide-panel,[\s\S]*?\.materials-page-content\.workspace-guide-panel,[\s\S]*?\.covision-page-surface\.workspace-guide-panel,[\s\S]*?\.workspace-feature-panel\.workspace-guide-panel[\s\S]*?\)\s*\.glass-subpage-title-wrap\s*\{[\s\S]*?padding-top:\s*calc\(var\(--mobile-common-title-top\) \+ 0\.216rem\)\s*!important;/
  );
});
