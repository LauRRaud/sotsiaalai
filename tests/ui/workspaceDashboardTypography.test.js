import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("workspace dashboard card titles use a subtitle-weight text style", () => {
  const css = read("components/chat/WorkspacePanel.module.css");

  assert.match(css, /\.cardTitle\s*\{[\s\S]*?font-family:\s*var\(--font-aino\), Arial, sans-serif;/);
  assert.match(css, /\.cardTitle\s*\{[\s\S]*?font-size:\s*clamp\(1\.12rem,\s*1\.76vw,\s*1\.28rem\);/);
  assert.match(css, /\.cardTitle\s*\{[\s\S]*?font-weight:\s*500;/);
  assert.match(css, /\.cardTitle\s*\{[\s\S]*?line-height:\s*1\.08;/);
  assert.match(css, /\.card_document_drafting \.cardTitle\s*\{[\s\S]*?max-width:\s*7\.35em;/);
  assert.doesNotMatch(css, /\.cardTitle\s*\{[\s\S]*?font-weight:\s*6[5-9]0;/);
});
