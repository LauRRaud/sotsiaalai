import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("documents and document drafting routes do not render ColorBends", () => {
  const backgroundLayer = read("components/backgrounds/BackgroundLayer.jsx");

  assert.match(backgroundLayer, /COLOR_BENDS_EXCLUDED_PATHS[\s\S]*?"\/documents"/);
  assert.match(backgroundLayer, /COLOR_BENDS_EXCLUDED_PATHS[\s\S]*?"\/dokreziim"/);
});

test("documents library avoids a broad blur shortcut over every panel-like element", () => {
  const css = read("app/styles/components/documents-mode.css");

  assert.doesNotMatch(
    css,
    /\.documents-workspace-page--library\s+:is\([\s\S]*?\.documents-panel[\s\S]*?\)\s*\{[\s\S]*?backdrop-filter:\s*blur/
  );
  assert.doesNotMatch(css, /--documents-library-glass-bg/);
});

test("documents library surface panels use the shared subpage card surface", () => {
  const css = read("app/styles/components/documents-mode.css");

  assert.match(
    css,
    /\.documents-workspace-page--library\s+\.documents-surface-panel\s*\{[\s\S]*?background:\s*var\(--subpage-card-bg\)\s*!important/
  );
  assert.match(
    css,
    /\.documents-workspace-page--library\s+\.documents-surface-panel\s*\{[\s\S]*?border:\s*var\(--subpage-card-border-width,\s*1px\)\s+solid\s+var\(--subpage-card-border\)\s*!important/
  );
  assert.match(
    css,
    /\.documents-workspace-page--library\s+\.documents-surface-panel\s*\{[\s\S]*?backdrop-filter:\s*blur\(var\(--glass-blur-radius,\s*1rem\)\)\s*saturate\(100%\)\s*!important/
  );
});
