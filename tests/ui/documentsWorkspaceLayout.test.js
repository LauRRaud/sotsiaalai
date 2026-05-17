import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("documents workspace routes keep the outer page fixed and scroll inside the glass panel", () => {
  const css = read("app/styles/utilities/helpers.css");
  const documentsCss = read("app/styles/components/documents-mode.css");

  assert.match(
    documentsCss,
    /\.documents-workspace-page--documents,\s*\n\s*\.documents-workspace-page--agent\s*\{[\s\S]*?overflow-x:\s*hidden;[\s\S]*?overflow-y:\s*hidden;[\s\S]*?overscroll-behavior:\s*contain;/
  );
  assert.match(
    documentsCss,
    /\.documents-workspace-page--documents,\s*\n\s*\.documents-workspace-page--agent\s*\{[\s\S]*?display:\s*flex;[\s\S]*?height:\s*100dvh;[\s\S]*?align-items:\s*center;[\s\S]*?justify-content:\s*center;/
  );
  assert.doesNotMatch(
    css,
    /:is\(\.documents-workspace-page--documents,\s*\.documents-workspace-page--agent\)\s*\{[\s\S]*?overflow:\s*hidden\s*!important;/
  );
  assert.match(
    css,
    /@media \(min-width:\s*769px\)[\s\S]*?\.workspace-guide-panel\.glass-subpage-surface\s*\{[\s\S]*?height:\s*var\(--workspace-glass-block-size\)\s*!important;[\s\S]*?max-height:\s*var\(--workspace-glass-block-size\)\s*!important;/
  );
  assert.match(
    documentsCss,
    /\.documents-page-shell--content\s*\{[\s\S]*?height:\s*100%;[\s\S]*?max-height:\s*100%;[\s\S]*?overflow-y:\s*auto\s*!important;/
  );
  assert.match(
    documentsCss,
    /\.documents-workspace-shell\.workspace-guide-panel > \.documents-grid\.workspace-guide-panel-scroll\s*\{[\s\S]*?overflow-y:\s*auto;/
  );
  assert.match(
    documentsCss,
    /\.documents-workspace-page--library :is\([\s\S]*?\.documents-grid\.workspace-guide-panel-scroll,[\s\S]*?\.documents-page-shell\.workspace-guide-panel-scroll[\s\S]*?\)\s*\{[\s\S]*?width:\s*calc\(100% \+ var\(--workspace-guide-panel-pad-x[\s\S]*?margin-top:\s*calc\(0px - var\(--workspace-guide-panel-pad-top[\s\S]*?padding-right:\s*var\(--workspace-guide-panel-pad-x[\s\S]*?padding-left:\s*var\(--workspace-guide-panel-pad-x[\s\S]*?mask-image:\s*none\s*!important;[\s\S]*?scrollbar-gutter:\s*auto\s*!important;/
  );
});

test("documents and dokreziim hero controls use the shared glass subpage header", () => {
  const documentsSource = read("components/documents/DocumentsPage.jsx");
  const agentSource = read("components/agent/AgentModePage.jsx");
  const css = read("app/styles/components/documents-mode.css");
  const mobileCss = read("app/styles/mobile.css");

  assert.match(documentsSource, /<GlassSubpageHeader[\s\S]*?onBack=\{handleBack\}[\s\S]*?backAriaLabel=\{t\("buttons\.back"\)\}/);
  assert.match(agentSource, /<GlassSubpageHeader[\s\S]*?onBack=\{handleBack\}[\s\S]*?backAriaLabel=\{t\("documents\.agent_workspace\.back_to_chat"\)\}/);
  assert.match(documentsSource, /<GlassSubpageHeader[\s\S]*?anchorBack=\{false\}/);
  assert.match(agentSource, /<GlassSubpageHeader[\s\S]*?anchorBack=\{false\}/);
  assert.match(documentsSource, /<GlassSubpageHeader[\s\S]*?backClassName="documents-scroll-back-button"/);
  assert.match(agentSource, /<GlassSubpageHeader[\s\S]*?backClassName="documents-scroll-back-button"/);
  assert.match(documentsSource, /className="documents-admin-role-menu"/);
  assert.match(agentSource, /className="documents-admin-role-menu"/);
  assert.match(
    css,
    /@media \(min-width:\s*769px\)[\s\S]*?\.documents-scroll-back-button\s*\{[\s\S]*?position:\s*absolute\s*!important;[\s\S]*?left:\s*calc\(0\.55rem - var\(--workspace-guide-panel-pad-x,\s*1rem\)\)\s*!important;[\s\S]*?top:\s*calc\([\s\S]*?0\.55rem - var\(--workspace-guide-panel-pad-top,\s*0\.6rem\)[\s\S]*?clamp\(0\.18rem,\s*0\.65vh,\s*0\.42rem\)[\s\S]*?\)\s*!important;/
  );
  assert.match(
    mobileCss,
    /@media \(max-width:\s*768px\)[\s\S]*?\.documents-workspace-page--library \.documents-scroll-back-button\s*\{[\s\S]*?left:\s*calc\(env\(safe-area-inset-left,\s*0px\) \+ 0\.04rem\)\s*!important;[\s\S]*?top:\s*calc\([\s\S]*?env\(safe-area-inset-top,\s*0px\) \+ 0\.22rem[\s\S]*?var\(--workspace-guide-panel-pad-top/
  );
  assert.match(
    mobileCss,
    /@media \(max-width:\s*768px\)[\s\S]*?\.documents-workspace-page--library \.glass-subpage-title-wrap\s*\{[\s\S]*?--policy-title-inline-start:\s*clamp\(3\.15rem,\s*9\.2vw,\s*3\.7rem\)\s*!important;[\s\S]*?--policy-title-inline-end:\s*clamp\(2\.72rem,\s*8vw,\s*3\.25rem\)\s*!important;[\s\S]*?padding-top:\s*calc\(env\(safe-area-inset-top,\s*0px\) \+ 1\.82rem\)\s*!important;/
  );
  assert.match(css, /\.documents-workspace-shell\s*\{[\s\S]*?padding:\s*0;/);
  assert.doesNotMatch(documentsSource, /documents-page-shell-title-row|documents-mobile-title/);
  assert.doesNotMatch(agentSource, /documents-page-shell-title-row|agent-mobile-title/);
  assert.doesNotMatch(documentsSource, /glassRingTiltFromLeft/);
  assert.doesNotMatch(agentSource, /glassRingTiltFromLeft/);
  assert.doesNotMatch(documentsSource, /workspace-guide-panel--collapse/);
  assert.doesNotMatch(agentSource, /workspace-guide-panel--collapse/);
  assert.match(
    css,
    /\.documents-page-shell\.workspace-guide-panel-scroll[\s\S]*?> \.documents-admin-role-menu\s*\{[\s\S]*?position:\s*absolute;/
  );
  assert.match(
    documentsSource,
    /documents-page-shell--content[\s\S]*?<GlassSubpageHeader[\s\S]*?rightSlot=\{isAdmin \? \(/
  );
  assert.match(
    agentSource,
    /documents-page-shell--content[\s\S]*?<GlassSubpageHeader[\s\S]*?rightSlot=\{isAdmin \? \(/
  );
  assert.match(
    agentSource,
    /const heroBodyClassName =\s*\n\s*"grid gap-\[1\.05rem\] px-0 py-0/
  );
  assert.doesNotMatch(
    agentSource,
    /heroBodyClassName\s*=[\s\S]*?pt-\[0\.9rem\]/
  );
  assert.match(
    css,
    /\.documents-page-hero-panel--agent\s*\{[\s\S]*?margin-top:\s*0;/
  );
  assert.doesNotMatch(
    css,
    /\.documents-page-hero-panel--agent\s*\{[\s\S]*?margin-top:\s*-/
  );
  assert.doesNotMatch(css, /documents-page-shell-title-row|documents-mobile-title-wrap|agent-mobile-title-wrap/);
  assert.doesNotMatch(
    documentsSource,
    /`w-full !mt-0 !mb-0/
  );
  assert.doesNotMatch(
    agentSource,
    /`w-full !mt-0 !mb-0/
  );
  assert.doesNotMatch(css, /documents-admin-role-menu--hero/);
});
