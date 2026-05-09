import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("pre-inquiry assistant renders assessment details inside the conversation message", () => {
  const source = read("components/workspace/WorkspaceFeaturePage.jsx");

  assert.match(source, /const assistantConversationText = useMemo/);
  assert.match(source, /assessmentQuestions\.map\(\(question\) => `- \$\{question\}`\)/);
  assert.match(source, /text=\{assistantConversationText\}/);
  assert.doesNotMatch(source, /assistantWarnings\.map\(\(warning\)/);
});

test("pre-inquiry draft and recipient selection have clear visible contracts", () => {
  const source = read("components/workspace/WorkspaceFeaturePage.jsx");
  const css = read("app/styles/components/service-map.css");

  assert.match(source, /Koosta kirja mustand/);
  assert.match(source, /aria-pressed=\{isSelectedRecipient \? "true" : "false"\}/);
  assert.match(source, /data-selected=\{isSelectedRecipient \? "true" : undefined\}/);
  assert.match(source, /className="pre-inquiry-draft-textarea"/);
  assert.match(css, /\.pre-inquiry-draft-textarea\s*\{[\s\S]*?min-height:\s*clamp\(24rem,\s*54vh,\s*34rem\)/);
  assert.match(css, /\.workspace-feature-list-card\[data-selected="true"\]\s*\{[\s\S]*?background:\s*color-mix\(in srgb,\s*var\(--workspace-feature-accent\) 16%/);
});
