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
    /\.documents-workspace-page--library :is\([\s\S]*?\.documents-grid\.workspace-guide-panel-scroll,[\s\S]*?\.documents-page-shell\.workspace-guide-panel-scroll[\s\S]*?\)\s*\{[\s\S]*?mask-image:\s*none\s*!important;[\s\S]*?-webkit-mask-image:\s*none\s*!important;/
  );
});

test("documents and dokreziim hero controls follow the invite modal header pattern", () => {
  const documentsSource = read("components/documents/DocumentsPage.jsx");
  const agentSource = read("components/agent/AgentModePage.jsx");
  const css = read("app/styles/components/documents-mode.css");

  assert.match(documentsSource, /<BackButton[\s\S]*?className=\{backButtonClassName\}/);
  assert.match(agentSource, /<BackButton[\s\S]*?className=\{backButtonClassName\}/);
  assert.match(documentsSource, /className="documents-admin-role-menu"/);
  assert.match(agentSource, /className="documents-admin-role-menu"/);
  assert.match(documentsSource, /documents-scroll-back-button/);
  assert.match(agentSource, /documents-scroll-back-button/);
  assert.match(
    css,
    /\.documents-page-shell\.workspace-guide-panel-scroll[\s\S]*?> \.documents-admin-role-menu\s*\{[\s\S]*?position:\s*absolute;/
  );
  assert.match(
    documentsSource,
    /documents-page-shell--content[\s\S]*?<BackButton[\s\S]*?documents-page-shell-title-row/
  );
  assert.match(
    agentSource,
    /documents-page-shell--content[\s\S]*?<BackButton[\s\S]*?documents-page-shell-title-row/
  );
  assert.match(
    documentsSource,
    /documents-page-shell-title-row[\s\S]*?<h1 className=\{documentsTitleClassName\}>/
  );
  assert.match(
    agentSource,
    /documents-page-shell-title-row[\s\S]*?<h1 className=\{agentTitleClassName\}>/
  );
  assert.match(
    documentsSource,
    /documentsTitleClassName\s*=\s*[\s\S]*?!mt-0[\s\S]*?!mb-0/
  );
  assert.match(
    agentSource,
    /agentTitleClassName\s*=\s*[\s\S]*?!mt-0[\s\S]*?!mb-0/
  );
  assert.match(
    css,
    /\.documents-page-shell-title-row\s*\{[\s\S]*?min-height:\s*clamp\(4\.2rem,\s*8\.2vh,\s*5\.4rem\);[\s\S]*?align-items:\s*center;[\s\S]*?position:\s*relative;/
  );
  assert.doesNotMatch(css, /documents-admin-role-menu--hero/);
});
