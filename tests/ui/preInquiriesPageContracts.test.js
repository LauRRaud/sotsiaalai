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

test("pre-inquiry recipient type filter is optional and aligned with search", () => {
  const source = read("components/workspace/WorkspaceFeaturePage.jsx");
  const css = read("app/styles/components/service-map.css");

  assert.match(source, /const \[recipientType, setRecipientType\] = useState\(""\)/);
  assert.match(source, /type="checkbox"[\s\S]*?name="pre-inquiry-recipient-type"/);
  assert.match(source, /setRecipientType\(\(current\) => current === value \? "" : value\)/);
  assert.match(source, /pre-inquiry-recipient-controls/);
  assert.match(css, /\.pre-inquiry-recipient-controls\s*\{[\s\S]*?grid-template-columns:\s*auto minmax\(min\(18rem,\s*100%\),\s*1fr\)/);
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

test("workspace feature pages are anchored to the viewport", () => {
  const source = read("components/workspace/WorkspaceFeaturePage.jsx");

  assert.match(source, /workspace-feature-page-shell/);
  assert.match(source, /fixed inset-0 isolate z-\[30\]/);
  assert.match(source, /w-screen max-w-\[100vw\]/);
  assert.match(source, /bg-transparent/);
  assert.match(source, /persistGlassRingTilt:\s*false/);
});

test("workspace feature panels keep a stable desktop footprint across role views", () => {
  const css = read("app/styles/components/service-map.css");
  const source = read("components/workspace/WorkspaceFeaturePage.jsx");

  assert.match(
    css,
    /@media \(min-width:\s*769px\)[\s\S]*?\.workspace-feature-panel:not\(\.service-map-page-panel\)\s*\{[\s\S]*?width:\s*min\(calc\(100vw - 2rem\),\s*clamp\(36rem,\s*76vw,\s*54rem\)\)\s*!important/
  );
  assert.match(
    css,
    /\.workspace-feature-panel:not\(\.service-map-page-panel\)\s*\{[\s\S]*?height:\s*min\(52rem,\s*calc\(100dvh - 2rem\)\)/
  );
  assert.match(source, /!w-\[min\(calc\(100vw-2rem\),clamp\(36rem,76vw,54rem\)\)\]/);
  assert.match(source, /!max-w-\[min\(calc\(100vw-2rem\),clamp\(36rem,76vw,54rem\)\)\]/);
  assert.doesNotMatch(source, /!max-w-\[66rem\]/);
});

test("workspace feature pages use the same desktop width as help listings", () => {
  const source = read("components/workspace/WorkspaceFeaturePage.jsx");
  const css = read("app/styles/components/service-map.css");
  const covisionSource = read("components/covision/CovisionPage.jsx");
  const covisionCss = read("components/covision/CovisionPage.module.css");
  const helpListingsSource = read("components/chat/HelpListingsPanel.jsx");

  assert.match(helpListingsSource, /!max-w-\[clamp\(36rem,76vw,54rem\)\]/);
  assert.match(
    css,
    /\.workspace-feature-panel:not\(\.service-map-page-panel\)\s*\{[\s\S]*?max-width:\s*min\(calc\(100vw - 2rem\),\s*clamp\(36rem,\s*76vw,\s*54rem\)\)\s*!important/
  );
  assert.match(covisionSource, /!w-\[min\(calc\(100vw-2rem\),clamp\(36rem,76vw,54rem\)\)\]/);
  assert.match(covisionSource, /!max-w-\[min\(calc\(100vw-2rem\),clamp\(36rem,76vw,54rem\)\)\]/);
  assert.match(
    covisionCss,
    /\.surface\s*\{[\s\S]*?width:\s*min\(calc\(100vw - 2rem\),\s*clamp\(36rem,\s*76vw,\s*54rem\)\)\s*!important/
  );
  assert.doesNotMatch(source, /workspace-feature-panel--pre-inquiries/);
  assert.doesNotMatch(css, /workspace-feature-panel--pre-inquiries/);
});
