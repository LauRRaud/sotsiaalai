import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("wellbeing workspace cards reuse dashboard card layout without visible descriptions", () => {
  const source = readFileSync(new URL("../../components/wellbeing/WellbeingPage.jsx", import.meta.url), "utf8");

  assert.match(source, /className=\{cn\("workspace-dashboard-card",\s*workspaceStyles\.card\)\}/);
  assert.match(source, /workspaceStyles\.cardTitle/);
  assert.doesNotMatch(source, /styles\.toolDescription/);
  assert.doesNotMatch(source, /<span className=\{styles\.toolDescription\}>/);
});

test("wellbeing dashboard uses the same desktop panel sizing and title spacing tokens as workspace", () => {
  const source = readFileSync(new URL("../../components/wellbeing/WellbeingPage.jsx", import.meta.url), "utf8");
  const css = readFileSync(new URL("../../components/wellbeing/WellbeingPage.module.css", import.meta.url), "utf8");

  assert.match(source, /\[--workspace-subpage-header-margin-bottom:0\.35rem\]/);
  assert.match(source, /\[--workspace-subpage-title-margin-top:clamp\(2\.15rem,5\.4vh,3\.25rem\)\]/);
  assert.match(source, /\[--workspace-subpage-title-margin-bottom:clamp\(0\.35rem,1\.4vh,0\.8rem\)\]/);
  assert.match(css, /--workspace-glass-shell-inline-size/);
  assert.doesNotMatch(
    css,
    /\.surface\s*\{[\s\S]*?width:\s*var\(--workspace-glass-inline-size/
  );
});

test("wellbeing tool routes update the header title and info content", () => {
  const source = readFileSync(new URL("../../components/wellbeing/WellbeingPage.jsx", import.meta.url), "utf8");

  assert.match(source, /const activeTitle = activeTool\?\.title \|\|/);
  assert.match(source, /const infoId = activeTool\?\.infoId \|\| WELLBEING_INFO_ID;/);
  assert.match(source, /infoId=\{infoId\}/);
  assert.match(source, /title=\{activeTitle\}/);
  assert.match(source, /\{activeTitle\}/);
});
