import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("documents and agent pages use a compact mobile page gap and wider cards", () => {
  const css = read("app/styles/components/documents-mode.css");

  assert.match(
    css,
    /--documents-mobile-page-gap:\s*clamp\(0\.08rem,\s*0\.35vw,\s*0\.14rem\)/
  );
  assert.match(
    css,
    /\.documents-workspace-page--documents,\s*\n\s*\.documents-workspace-page--agent\s*\{[\s\S]*?padding:[\s\S]*?var\(--documents-mobile-page-gap/
  );
  assert.match(
    css,
    /\.documents-workspace-page--documents\s+\.documents-surface-panel,[\s\S]*?\.documents-workspace-page--agent\s+\.documents-surface-panel[\s\S]*?\{[\s\S]*?padding-inline:\s*clamp\(0\.38rem,\s*1\.5vw,\s*0\.52rem\)\s*!important/
  );
  assert.match(
    css,
    /\.documents-workspace-page--documents\s+\.documents-grid,[\s\S]*?\.documents-workspace-page--agent\s+\.documents-agent-layout[\s\S]*?\{[\s\S]*?max-width:\s*none/
  );
  assert.match(
    css,
    /\.documents-workspace-page--documents\s+:is\([\s\S]*?\.documents-library-section[\s\S]*?\.documents-library-intro[\s\S]*?\.documents-library-panel[\s\S]*?\.documents-library-list[\s\S]*?\.documents-empty-state[\s\S]*?\),[\s\S]*?\.documents-workspace-page--agent\s+:is\([\s\S]*?\.documents-agent-card[\s\S]*?\.documents-agent-documents[\s\S]*?\.documents-agent-result[\s\S]*?\.documents-agent-results-list[\s\S]*?\)\s*\{[\s\S]*?width:\s*100%\s*!important[\s\S]*?justify-self:\s*stretch\s*!important/
  );
});

test("documents and agent glass panels use the shared borderless surface", () => {
  const css = read("app/styles/components/documents-mode.css");

  assert.match(
    css,
    /\.documents-workspace-page--library\s+\.documents-surface-panel\s*\{[\s\S]*?background:\s*var\(--documents-surface-panel-bg\)\s*!important/
  );
  assert.match(
    css,
    /\.documents-workspace-page--library\s+\.documents-surface-panel\s*\{[\s\S]*?border:\s*none\s*!important/
  );
  assert.match(
    css,
    /\.documents-workspace-page--library\s+\.documents-surface-panel\s*\{[\s\S]*?box-shadow:\s*var\(--glass-shell-shadow,\s*none\)\s*!important/
  );
});

test("covision mobile surface opts into compact full-width glass layout", () => {
  const component = read("components/covision/CovisionPage.jsx");
  const css = read("components/covision/CovisionPage.module.css");

  assert.match(component, /covision-page-surface/);
  assert.match(
    css,
    /--covision-mobile-page-gap:\s*clamp\(0\.18rem,\s*0\.8vw,\s*0\.32rem\)/
  );
  assert.match(
    css,
    /\.page\s*\{[\s\S]*?align-items:\s*stretch\s*!important/
  );
  assert.match(
    css,
    /@media \(max-width:\s*768px\)[\s\S]*?\.surface\s*\{[\s\S]*?margin-left:\s*max\(var\(--covision-mobile-page-gap/
  );
  assert.match(
    css,
    /@media \(max-width:\s*768px\)[\s\S]*?\.surface\s*\{[\s\S]*?padding-left:\s*var\(--covision-surface-mobile-pad-x\)\s*!important/
  );
});

test("covision mobile shell does not double offset the glass panel", () => {
  const component = read("components/covision/CovisionPage.jsx");

  assert.match(component, /max-\[768px\]:py-0/);
  assert.doesNotMatch(component, /max-\[768px\]:py-\[max\(/);
});

test("covision overview back tilts the visible glass page before route navigation", () => {
  const component = read("components/covision/CovisionPage.jsx");

  assert.match(component, /const \[isClosing,\s*setIsClosing\]\s*=\s*useState\(false\)/);
  assert.match(component, /setIsClosing\(true\);[\s\S]*?pushWithTransition\(router,\s*localizePath\("\/vestlus",\s*locale\)/);
  assert.match(
    component,
    /motion-safe:animate-\[glassRingTiltFromLeft_540ms_cubic-bezier\(0\.42,0,0\.58,1\)_both\]/
  );
});
