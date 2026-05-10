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

test("pre-inquiry assistant clears stale draft and recipient when no draft or contact is returned", () => {
  const source = read("components/workspace/WorkspaceFeaturePage.jsx");

  assert.match(source, /if \(payload\?\.draftBody \|\| payload\?\.draft\) \{[\s\S]*?setDraft\(payload\.draftBody \|\| payload\.draft\);[\s\S]*?\} else \{[\s\S]*?setDraft\(""\);[\s\S]*?setDraftTouched\(false\);[\s\S]*?\}/);
  assert.match(source, /if \(firstSuggestion\?\.id\) \{[\s\S]*?setSelectedRecipientId\(firstSuggestion\.id\);[\s\S]*?\} else \{[\s\S]*?setSelectedRecipientId\(""\);[\s\S]*?\}/);
});

test("pre-inquiry assistant conversation surfaces non-urgent workflow warnings", () => {
  const source = read("components/workspace/WorkspaceFeaturePage.jsx");

  assert.match(source, /const otherWarnings = assistantWarnings\.filter/);
  assert.match(source, /otherWarnings\.map\(\(warning\) => `Oluline: \$\{warning\}`\)/);
});

test("pre-inquiry assistant conversation and input shadows stay close to the element", () => {
  const css = read("app/styles/components/service-map.css");

  assert.match(
    css,
    /\.pre-inquiry-agent-chat \.documents-agent-glow-window,[\s\S]*?\.pre-inquiry-agent-chat \.documents-agent-glow-composer\s*\{[\s\S]*?0 4px 10px rgba\(0,\s*0,\s*0,\s*0\.12\)\s*!important/
  );
  assert.match(
    css,
    /\.pre-inquiry-agent-chat \.documents-agent-glow-window:hover,[\s\S]*?\.pre-inquiry-agent-chat \.documents-agent-glow-composer:focus-within\s*\{[\s\S]*?0 6px 13px rgba\(0,\s*0,\s*0,\s*0\.14\)\s*!important/
  );
  assert.doesNotMatch(
    css,
    /\.pre-inquiry-agent-chat \.documents-agent-glow-window,[\s\S]*?\.pre-inquiry-agent-chat \.documents-agent-glow-composer\s*\{[\s\S]*?0 10px 24px/
  );
});
