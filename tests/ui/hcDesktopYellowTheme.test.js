import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("HC desktop surfaces are normalized to yellow controls after component CSS", () => {
  const globalsCss = read("app/styles/globals.css");
  const hcCss = read("app/styles/theme/hc.css");
  const borderGlowCss = read("components/ui/BorderGlow.module.css");

  const hcImport = globalsCss.indexOf('@import url("./theme/hc.css");');
  const glassImport = globalsCss.indexOf('@import url("./components/glass.css");');
  const documentsImport = globalsCss.indexOf('@import url("./components/documents-mode.css");');
  const chatFocusImport = globalsCss.indexOf('@import url("./components/chat-focus.css");');
  const serviceMapImport = globalsCss.indexOf('@import url("./components/service-map.css");');

  assert.ok(hcImport > glassImport);
  assert.ok(hcImport > documentsImport);
  assert.ok(hcImport > chatFocusImport);
  assert.ok(hcImport > serviceMapImport);

  assert.match(hcCss, /--hc-text:\s*var\(--hc-accent\)/);
  assert.match(hcCss, /--hc-muted:\s*var\(--hc-accent\)/);
  assert.match(hcCss, /--pt-50:\s*var\(--hc-accent\)/);
  assert.match(hcCss, /--btn-primary-text:\s*var\(--hc-accent\)/);
  assert.match(hcCss, /--input-text:\s*var\(--hc-accent\)/);
  assert.match(hcCss, /--input-placeholder:\s*rgba\(255,\s*234,\s*0,\s*0\.92\)/);

  assert.match(
    hcCss,
    /html\[data-contrast="hc"\]\s+:is\(\s*\.ui-glow-field,[\s\S]*?\.service-profile-glow-field,[\s\S]*?\.workspace-feature-panel \.workspace-feature-field,[\s\S]*?\.documents-workspace :is\([^)]*\.documents-field[\s\S]*?\)\s*\{[\s\S]*?background:\s*var\(--hc-control-bg\)\s*!important;[\s\S]*?color:\s*var\(--hc-accent\)\s*!important;[\s\S]*?border(?:-color)?:/
  );

  assert.match(
    hcCss,
    /html\[data-contrast="hc"\]\s+:is\([\s\S]*?\.materials-comment-glow-field,[\s\S]*?\.service-map-toolbar__glow-field,[\s\S]*?\.service-map-toolbar__type-card,[\s\S]*?\.invite-glow-field[\s\S]*?\)\s*\{[\s\S]*?box-shadow:\s*none\s*!important/
  );

  assert.match(
    hcCss,
    /html\[data-contrast="hc"\]\s+body\s+:is\([\s\S]*?\.materials-comment-glow-field,[\s\S]*?\.service-map-toolbar__glow-field,[\s\S]*?\.service-map-toolbar__type-card[\s\S]*?\):is\(\[class\*="BorderGlow-module"\],[\s\S]*?\)\s*\{[\s\S]*?box-shadow:\s*none\s*!important/
  );

  assert.match(
    hcCss,
    /html\[data-contrast="hc"\]\s+body\s+:is\(\s*button,[\s\S]*?\):is\([\s\S]*?\[class\*="BorderGlow-module"\],[\s\S]*?\.materials-surface-button,[\s\S]*?\.service-map-toolbar__type-card[\s\S]*?\)\s*\{[\s\S]*?background:\s*var\(--hc-control-bg\)\s*!important;[\s\S]*?box-shadow:\s*none\s*!important/
  );

  assert.match(
    hcCss,
    /html\[data-contrast="hc"\]\s+body\s+:is\([\s\S]*?\.back-button,[\s\S]*?\.chat-back-button,[\s\S]*?\.glass-policy-back,[\s\S]*?\.service-map-workspace__toggle[\s\S]*?\)\s*\{[\s\S]*?color:\s*var\(--hc-accent\)\s*!important/
  );

  assert.match(
    hcCss,
    /html\[data-contrast="hc"\]\s+body\s+\.chat-inputbar:is\(:hover,\s*:focus-within\)[\s\S]*?border-color:\s*rgba\(255,\s*234,\s*0,\s*0\.94\)\s*!important/
  );

  assert.match(
    hcCss,
    /html\[data-contrast="hc"\]\s+body\s+\.chat-inputbar\s+\.chat-send-btn\.invite-primary-btn[\s\S]*?--btn-primary-text:\s*var\(--hc-accent\)\s*!important/
  );

  assert.match(
    borderGlowCss,
    /:global\(html\[data-contrast="hc"\]\)\s+\.card\s*\{[\s\S]*?background:\s*var\(--hc-control-bg,[\s\S]*?\)\s*!important;[\s\S]*?box-shadow:\s*none\s*!important/
  );

  assert.match(
    borderGlowCss,
    /:global\(html\[data-contrast="hc"\]\)\s+\.edgeOnly::after,[\s\S]*?:global\(html\[data-contrast="hc"\]\)\s+\.edgeLight::before[\s\S]*?\{[\s\S]*?box-shadow:\s*none\s*!important;[\s\S]*?opacity:\s*0\s*!important/
  );
});
