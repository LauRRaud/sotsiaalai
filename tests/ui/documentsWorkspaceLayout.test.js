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
  const css = read("app/styles/utilities/helpers.css");
  const glassCss = read("app/styles/components/glass.css");
  const documentsCss = read("app/styles/components/documents-mode.css");
  const mobileCss = read("app/styles/mobile.css");

  assert.match(documentsSource, /<GlassSubpageHeader[\s\S]*?onBack=\{handleBack\}[\s\S]*?backAriaLabel=\{t\("buttons\.back"\)\}/);
  assert.match(agentSource, /<GlassSubpageHeader[\s\S]*?onBack=\{handleBack\}[\s\S]*?backAriaLabel=\{t\("documents\.agent_workspace\.back_to_chat"\)\}/);
  assert.match(documentsSource, /<GlassSubpageHeader[\s\S]*?anchorBack=\{false\}/);
  assert.match(agentSource, /<GlassSubpageHeader[\s\S]*?anchorBack=\{false\}/);
  assert.match(documentsSource, /<GlassSubpageHeader[\s\S]*?backClassName="documents-scroll-back-button"/);
  assert.match(agentSource, /<GlassSubpageHeader[\s\S]*?backClassName="documents-scroll-back-button"/);
  assert.match(documentsSource, /className="documents-admin-role-menu documents-admin-role-menu--viewport"/);
  assert.match(agentSource, /className="documents-admin-role-menu documents-admin-role-menu--viewport"/);
  assert.match(documentsSource, /<section className=\{`documents-workspace[\s\S]*?isAdmin \? \([\s\S]*?className="documents-admin-role-menu documents-admin-role-menu--viewport"[\s\S]*?<div className=\{`documents-workspace-shell/);
  assert.match(agentSource, /<section className=\{`documents-workspace[\s\S]*?isAdmin \? \([\s\S]*?className="documents-admin-role-menu documents-admin-role-menu--viewport"[\s\S]*?<div className=\{`documents-workspace-shell/);
  assert.doesNotMatch(documentsSource, /rightSlot=\{isAdmin \? \(/);
  assert.doesNotMatch(agentSource, /rightSlot=\{isAdmin \? \(/);
  assert.match(
    css,
    /@media \(min-width:\s*769px\)[\s\S]*?\.workspace-guide-panel\.glass-subpage-surface :is\(\s*\.workspace-scroll-back-button,\s*\.documents-scroll-back-button\s*\)\s*\{[\s\S]*?position:\s*absolute\s*!important;[\s\S]*?left:\s*var\(--workspace-subpage-back-left,\s*0\.55rem\)\s*!important;[\s\S]*?top:\s*var\(--workspace-subpage-back-top,\s*0\.55rem\)\s*!important;/
  );
  assert.doesNotMatch(mobileCss, /documents-workspace-page--library/);
  assert.match(
    mobileCss,
    /:is\(\s*\.glass-subpage-title-wrap\s*\)\s*\{[\s\S]*?padding-top:\s*calc\(var\(--mobile-safe-top,\s*env\(safe-area-inset-top,\s*0px\)\) \+ 1\.18rem\)\s*!important;/
  );
  assert.match(mobileCss, /\.policy-mobile-title--static\s*\{[\s\S]*?white-space:\s*normal\s*!important;[\s\S]*?text-wrap:\s*balance\s*!important;/);
  assert.match(documentsCss, /\.documents-workspace-shell\s*\{[\s\S]*?padding:\s*0;/);
  assert.doesNotMatch(documentsSource, /documents-page-shell-title-row|documents-mobile-title/);
  assert.doesNotMatch(agentSource, /documents-page-shell-title-row|agent-mobile-title/);
  assert.doesNotMatch(glassCss, /compact-workspace-subpage-title/);
  assert.doesNotMatch(documentsSource, /glassRingTiltFromLeft/);
  assert.doesNotMatch(agentSource, /glassRingTiltFromLeft/);
  assert.match(documentsSource, /documents-workspace-shell--route-enter[\s\S]*?\$\{isClosing \? "workspace-guide-panel--collapse" : ""\}/);
  assert.match(agentSource, /documents-workspace-shell--route-enter[\s\S]*?\$\{isClosing \? "workspace-guide-panel--collapse" : ""\}/);
  assert.match(
    documentsCss,
    /\.documents-workspace-shell--route-enter:not\(\.workspace-guide-panel--collapse\)\s*\{[\s\S]*?animation:\s*documents-workspace-panel-enter 420ms cubic-bezier\(0\.22, 0\.61, 0\.36, 1\) both;/
  );
  assert.match(
    documentsCss,
    /@keyframes documents-workspace-panel-enter\s*\{[\s\S]*?transform:\s*translateY\(0\.28rem\) scale\(0\.965\);[\s\S]*?transform:\s*translateY\(0\) scale\(1\);/
  );
  assert.doesNotMatch(
    documentsSource,
    /documents-page-shell--content[\s\S]*?className="documents-admin-role-menu"/
  );
  assert.doesNotMatch(
    agentSource,
    /documents-page-shell--content[\s\S]*?className="documents-admin-role-menu"/
  );
  assert.match(
    documentsCss,
    /\.documents-admin-role-menu--viewport\s*\{[\s\S]*?position:\s*fixed;[\s\S]*?top:\s*calc\(env\(safe-area-inset-top,\s*0px\) \+ clamp\(0\.72rem,\s*2\.2vh,\s*1\.15rem\)\);[\s\S]*?right:\s*calc\(env\(safe-area-inset-right,\s*0px\) \+ clamp\(0\.72rem,\s*2vw,\s*1\.15rem\)\);/
  );
  assert.match(
    documentsSource,
    /documents-page-shell--content[\s\S]*?<GlassSubpageHeader[\s\S]*?>\s*\{t\("documents\.page_title"\)\}[\s\S]*?<section className="documents-panel documents-panel--primary documents-page-shell/
  );
  assert.match(
    agentSource,
    /documents-page-shell--content[\s\S]*?<GlassSubpageHeader[\s\S]*?>\s*\{t\("chat\.tools\.agent_mode"\)\}[\s\S]*?<section className="documents-panel documents-panel--primary documents-page-shell/
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
    documentsCss,
    /\.documents-page-hero-panel--agent\s*\{[\s\S]*?margin-top:\s*0;/
  );
  assert.doesNotMatch(
    documentsCss,
    /\.documents-page-hero-panel--agent\s*\{[\s\S]*?margin-top:\s*-/
  );
  assert.doesNotMatch(documentsCss, /documents-page-shell-title-row|documents-mobile-title-wrap|agent-mobile-title-wrap/);
  assert.doesNotMatch(
    documentsSource,
    /`w-full !mt-0 !mb-0/
  );
  assert.doesNotMatch(
    agentSource,
    /`w-full !mt-0 !mb-0/
  );
  assert.doesNotMatch(documentsCss, /documents-admin-role-menu--hero/);
});
