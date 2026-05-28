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
    /\.documents-workspace-shell--embedded :is\([\s\S]*?\.documents-panel,[\s\S]*?\.documents-library-panel,[\s\S]*?\.documents-shell-surface,[\s\S]*?\.documents-subsection-stack[\s\S]*?\)\s*\{[\s\S]*?background:\s*transparent\s*!important;[\s\S]*?backdrop-filter:\s*none\s*!important;/
  );
  assert.match(
    read("app/styles/mobile.css"),
    /\.workspace-dashboard-panel \.documents-workspace-shell--embedded :is\([\s\S]*?\.documents-panel,[\s\S]*?\.documents-surface-panel,[\s\S]*?\.documents-library-panel,[\s\S]*?\.documents-shell-surface[\s\S]*?\)\s*\{[\s\S]*?--tw-backdrop-blur:\s*;[\s\S]*?backdrop-filter:\s*none\s*!important;/
  );
  assert.match(
    documentsCss,
    /\.documents-workspace-shell\.workspace-guide-panel > \.documents-grid\.workspace-guide-panel-scroll\s*\{[\s\S]*?overflow-y:\s*auto;/
  );
  assert.match(
    documentsCss,
    /\.documents-workspace-page--library :is\([\s\S]*?\.documents-grid\.workspace-guide-panel-scroll,[\s\S]*?\.documents-page-shell\.workspace-guide-panel-scroll[\s\S]*?\)\s*\{[\s\S]*?--workspace-guide-panel-overscan-top:\s*clamp\(1\.6rem,\s*4\.8vh,\s*2\.4rem\);[\s\S]*?--workspace-guide-panel-overscan-bottom:\s*clamp\(1\.05rem,\s*2\.4vh,\s*1\.45rem\);[\s\S]*?scrollbar-gutter:\s*auto\s*!important;/
  );
  assert.match(
    documentsCss,
    /\.documents-workspace-page--library :is\([\s\S]*?height:\s*calc\([\s\S]*?100% \+ var\(--workspace-guide-panel-pad-top,\s*0\.6rem\) \+[\s\S]*?var\(--workspace-guide-panel-overscan-top\) \+[\s\S]*?var\(--workspace-guide-panel-overscan-bottom\)[\s\S]*?\)\s*!important;/
  );
  assert.match(
    documentsCss,
    /\.documents-workspace-page--library :is\([\s\S]*?margin-top:\s*calc\([\s\S]*?0px - var\(--workspace-guide-panel-pad-top,\s*0\.6rem\) -[\s\S]*?var\(--workspace-guide-panel-overscan-top\)[\s\S]*?\)\s*!important;/
  );
  assert.match(
    documentsCss,
    /\.documents-workspace-page--library :is\([\s\S]*?padding-top:\s*calc\([\s\S]*?var\(--workspace-guide-panel-pad-top,\s*0\.6rem\) \+[\s\S]*?var\(--workspace-guide-panel-overscan-top\)[\s\S]*?\)\s*!important;/
  );
  assert.match(
    documentsCss,
    /@media \(max-width:\s*768px\)[\s\S]*?\.documents-workspace-page--library :is\([\s\S]*?padding-bottom:\s*0\s*!important;/
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
  assert.match(documentsSource, /<GlassSubpageHeader[\s\S]*?backClassName="workspace-scroll-back-button documents-scroll-back-button"/);
  assert.match(agentSource, /<GlassSubpageHeader[\s\S]*?backClassName="workspace-scroll-back-button documents-scroll-back-button"/);
  assert.match(documentsSource, /documents-workspace-shell documents-workspace-shell--documents workspace-scroll-surface/);
  assert.match(agentSource, /documents-workspace-shell documents-workspace-shell--agent workspace-scroll-surface/);
  assert.match(documentsSource, /isAdmin && !embedded \? \([\s\S]*?className="documents-admin-role-menu documents-admin-role-menu--viewport"/);
  assert.match(agentSource, /isAdmin && !embedded \? \([\s\S]*?className=\{embedded \? "documents-admin-role-menu" : "documents-admin-role-menu documents-admin-role-menu--viewport"\}/);
  assert.match(documentsSource, /const content = \([\s\S]*?isAdmin && !embedded \? \([\s\S]*?className="documents-admin-role-menu documents-admin-role-menu--viewport"[\s\S]*?<div className=\{documentsShellClassName\}/);
  assert.match(agentSource, /const content = \([\s\S]*?isAdmin && !embedded \? \([\s\S]*?documents-admin-role-menu--viewport[\s\S]*?<div className=\{agentShellClassName\}/);
  assert.match(documentsSource, /if \(embedded\) return content[\s\S]*?<section className=\{`documents-workspace/);
  assert.match(agentSource, /if \(embedded\) return content[\s\S]*?<section className=\{`documents-workspace/);
  assert.doesNotMatch(documentsSource, /rightSlot=\{isAdmin \? \(/);
  assert.doesNotMatch(agentSource, /rightSlot=\{isAdmin \? \(/);
  assert.match(
    css,
    /@media \(min-width:\s*769px\)[\s\S]*?\.workspace-guide-panel\.glass-subpage-surface :is\(\s*\.workspace-scroll-back-button,\s*\.documents-scroll-back-button\s*\)\s*\{[\s\S]*?position:\s*absolute\s*!important;[\s\S]*?left:\s*var\(--workspace-subpage-back-left,\s*0\.55rem\)\s*!important;[\s\S]*?top:\s*calc\([\s\S]*?var\(--workspace-guide-panel-overscan-top,\s*0px\)[\s\S]*?var\(--workspace-subpage-back-top,\s*0\.55rem\)[\s\S]*?\)\s*!important;/
  );
  assert.doesNotMatch(mobileCss, /documents-workspace-page--library/);
  assert.match(
    mobileCss,
    /:is\(\s*\.glass-subpage-title-wrap\s*\)\s*\{[\s\S]*?padding-top:\s*calc\(var\(--mobile-safe-top,\s*env\(safe-area-inset-top,\s*0px\)\) \+ 1\.18rem\)\s*!important;/
  );
  assert.doesNotMatch(
    mobileCss,
    /:is\(\.documents-workspace-page--documents,\s*\.documents-workspace-page--agent\)[\s\S]*?\.documents-workspace-shell\.workspace-guide-panel\s*\{[\s\S]*?--mobile-glass-card-radius/
  );
  assert.match(
    mobileCss,
    /:is\([\s\S]*?\.documents-workspace-shell\.workspace-guide-panel,[\s\S]*?\.workspace-feature-panel\.workspace-guide-panel[\s\S]*?\)\s*\{[\s\S]*?--workspace-mobile-panel-gap:\s*var\(--mobile-glass-card-gap\);/
  );
  assert.doesNotMatch(mobileCss, /data-display-mode="standalone"[\s\S]*?documents-workspace-shell/);
  assert.doesNotMatch(mobileCss, /data-display-mode="fullscreen"[\s\S]*?documents-workspace-shell/);
  assert.doesNotMatch(
    mobileCss,
    /:is\(\.documents-workspace-page--documents,\s*\.documents-workspace-page--agent\)\s+\.documents-workspace-shell[^{]*\.workspace-scroll-back-button\s*\{/
  );
  assert.match(
    mobileCss,
    /\.workspace-scroll-surface \.workspace-scroll-back-button\s*\{[\s\S]*?var\(--workspace-guide-panel-overscan-top,\s*0px\) \+[\s\S]*?0\.2rem/
  );
  assert.match(mobileCss, /\.policy-mobile-title--static\s*\{[\s\S]*?white-space:\s*normal\s*!important;[\s\S]*?text-wrap:\s*balance\s*!important;/);
  assert.match(documentsCss, /\.documents-workspace-shell\s*\{[\s\S]*?padding:\s*0;/);
  assert.doesNotMatch(documentsSource, /documents-page-shell-title-row|documents-mobile-title/);
  assert.doesNotMatch(agentSource, /documents-page-shell-title-row|agent-mobile-title/);
  assert.doesNotMatch(glassCss, /compact-workspace-subpage-title/);
  assert.doesNotMatch(documentsSource, /glassRingTiltFromLeft/);
  assert.doesNotMatch(agentSource, /glassRingTiltFromLeft/);
  assert.doesNotMatch(documentsSource, /documents-workspace-shell--route-enter/);
  assert.doesNotMatch(agentSource, /documents-workspace-shell--route-enter/);
  assert.doesNotMatch(documentsSource, /workspace-guide-panel--collapse/);
  assert.doesNotMatch(agentSource, /workspace-guide-panel--collapse/);
  assert.doesNotMatch(documentsCss, /documents-workspace-panel-enter/);
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
  assert.doesNotMatch(agentSource, /heroBodyClassName\s*=[\s\S]*?pt-\[0\.9rem\]/);
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
