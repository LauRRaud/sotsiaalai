import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("covision overview uses the shared workspace feature panel footprint", () => {
  const source = read("components/covision/CovisionPage.jsx");
  const css = read("components/covision/CovisionPage.module.css");

  assert.match(source, /covision-page-surface/);
  assert.match(source, /mobile-keep-desktop-glass-cards/);
  assert.match(source, /workspaceGuidePanelClassName/);
  assert.doesNotMatch(source, /\[scrollbar-gutter:stable_both-edges\]/);
  assert.match(css, /\.surface\s*\{[\s\S]*?width:\s*var\(--workspace-glass-inline-size/);
  assert.match(css, /\.surface\.surface\s*\{[\s\S]*?height:\s*var\(--workspace-glass-block-size/);
  assert.match(css, /\.surface\.surface\s*\{[\s\S]*?min-height:\s*0\s*!important/);
  assert.match(css, /\.surface\.surface\s*\{[\s\S]*?max-height:\s*var\(--workspace-glass-block-size/);
  assert.doesNotMatch(css, /\.surface\s*\{[\s\S]*?--glass-subpage-edge-stroke:\s*radial-gradient\(/);
  assert.doesNotMatch(source, /!min-h-\[clamp\(40rem/);
});
