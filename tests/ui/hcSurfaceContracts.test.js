import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";
import { readServiceMapCssBundle } from "../helpers/serviceMapCssBundle.mjs";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("HC chat composer controls stay transparent and input glow is yellow", () => {
  const css = read("app/styles/components/chat-focus.css");
  const borderGlow = read("components/ui/BorderGlow.module.css");
  const hc = read("app/styles/theme/hc.css");
  const composerShellBlocks = css.match(
    /:root:not\(\.theme-light\):not\(\.theme-mid\):not\(\[data-contrast="hc"\]\) \.chat-page-shell \.chat-composer-glow-shell(?::hover)?\s*\{[\s\S]*?\n\}/g
  ) || [];

  assert.match(
    css,
    /html\[data-contrast="hc"\]\s+\.chat-composer-glow-shell\s*\{[\s\S]*?--glow-color:\s*rgba\(255,\s*234,\s*0/
  );
  assert.match(
    borderGlow,
    /\.card:global\(\.chat-composer-glow-shell\)[\s\S]*?rgba\(255,\s*234,\s*0/
  );
  assert.match(
    hc,
    /\.chat-inputbar \.chat-send-btn[\s\S]*?background:\s*transparent\s*!important/
  );
  assert.match(
    css,
    /html\[data-contrast="hc"\][\s\S]*?\.chat-input-row\s+\.chat-side-control-btn[\s\S]*?\.chat-inputbar\s+\.chat-send-btn:is\(:hover,\s*:focus-visible,\s*:active\)\s*\{[\s\S]*?background:\s*transparent\s*!important/
  );
  assert.ok(composerShellBlocks.length >= 2, "chat composer should define idle and hover shell glow blocks");
  for (const block of composerShellBlocks) {
    assert.match(block, /rgba\(255,\s*122,\s*126/);
    assert.doesNotMatch(block, /rgba\(255,\s*234,\s*0/);
  }
});

test("chat send arrow is centered by the button box, not manual glyph offsets", () => {
  const css = read("app/styles/components/chat-focus.css");
  const composer = read("components/alalehed/chat/ChatComposer.jsx");

  assert.match(
    css,
    /body \.chat-inputbar \.chat-send-btn\s*\{[\s\S]*?display:\s*inline-grid\s*!important;[\s\S]*?place-items:\s*center\s*!important;/
  );
  assert.match(
    css,
    /body \.chat-inputbar \.chat-send-btn > \.chat-send-icon-anchor\s*\{[\s\S]*?width:\s*100%\s*!important;[\s\S]*?height:\s*100%\s*!important;[\s\S]*?place-items:\s*center\s*!important;[\s\S]*?position:\s*absolute\s*!important;[\s\S]*?inset:\s*0\s*!important;/
  );
  assert.match(
    css,
    /body \.chat-inputbar \.chat-send-btn \.chat-send-glyph\s*\{[\s\S]*?display:\s*block\s*!important;[\s\S]*?transform-box:\s*fill-box\s*!important;[\s\S]*?transform-origin:\s*center\s*!important;/
  );
  assert.match(composer, /import ChevronIcon from "@\/components\/ui\/icons\/ChevronIcon";/);
  assert.match(composer, /const sendIconAnchorClassName =\s*\n\s*"chat-send-icon-anchor/);
  assert.match(composer, /<button type="submit" className=\{sendButtonClassName\}/);
  assert.match(composer, /<span className=\{sendIconAnchorClassName\} aria-hidden="true">\s*\n\s*<ChevronIcon\s*\n\s*direction="up"\s*\n\s*strokeWidth=\{1\.25\}\s*\n\s*className=\{sendGlyphClassName\}/);
  assert.doesNotMatch(composer, /chat-send-glyph[^\n"]*translate-/);
  assert.doesNotMatch(composer, /chat-send-glyph[^\n"]*rotate-/);
  assert.doesNotMatch(composer, /<Button as="button" variant="primary" size="md" type="submit" className=\{sendButtonClassName\}/);
});

test("HC global button reset excludes chat composer icon controls", () => {
  const css = read("app/styles/theme/hc.css");
  const chatIconExclusions = [
    "chat-send-btn",
    "chat-listen-btn",
    "chat-assistant-action-btn",
    "chat-dictate-btn",
    "chat-side-control-btn",
    "chat-tools-btn",
    "chat-document-attach-btn"
  ];

  for (const className of chatIconExclusions) {
    const matches = css.match(new RegExp(`:not\\(\\.${className}\\)`, "g")) || [];
    assert.ok(matches.length >= 3, `${className} should be excluded from HC global button resets`);
  }
  assert.match(css, /:not\(\.chat-rail-icon-btn\)/);
  assert.match(css, /\.chat-rail-icon-btn[\s\S]*?background:\s*transparent\s*!important/);
});

test("HC panels define actual yellow borders, not only border color", () => {
  const hc = read("app/styles/theme/hc.css");
  const serviceMap = readServiceMapCssBundle();
  const documents = read("app/styles/components/documents-mode.css");
  const covision = read("components/covision/CovisionPage.module.css");
  const workspacePanel = read("components/chat/WorkspacePanel.jsx");

  assert.match(hc, /\.invite-list-panel[\s\S]*?\{[\s\S]*?border:\s*2px solid rgba\(255,\s*234,\s*0/);
  assert.match(hc, /\.workspace-dashboard-card,[\s\S]*?\.workspace-dashboard-card:is\(:hover,\s*:focus-visible,\s*:active\)\s*\{[\s\S]*?border:\s*2px solid rgba\(255,\s*234,\s*0/);
  assert.match(workspacePanel, /"workspace-dashboard-card"/);
  assert.match(serviceMap, /\.workspace-feature-card[\s\S]*?\{[\s\S]*?border:\s*2px solid var\(--hc-accent/);
  assert.match(
    hc,
    /--hc-control-bg:\s*var\(--chat-card-surface-night-standard-bg\)/
  );
  assert.match(
    hc,
    /--workspace-elevated-card-bg:\s*var\(--hc-panel-bg\)/
  );
  assert.match(
    hc,
    /\.workspace-feature-card,[\s\S]*?\.selected-listing-panel--inline[\s\S]*?\{[\s\S]*?background:\s*var\(--hc-panel-bg\)\s*!important/
  );
  assert.match(documents, /\.documents-workspace-card[\s\S]*?\.documents-content[\s\S]*?\{[\s\S]*?border:\s*2px solid rgba\(255,\s*234,\s*0/);
  assert.match(
    documents,
    /\.documents-workspace \.documents-agent-glow-window[\s\S]*?\{[\s\S]*?box-shadow:\s*inset 0 0 0 2px rgba\(255,\s*234,\s*0,\s*0\.72\)/
  );
  assert.match(documents, /--documents-hc-panel-bg:\s*var\(--documents-glass-surface\)/);
  assert.match(documents, /\.documents-framework-banner\.documents-notice[\s\S]*?background:\s*var\(--documents-surface-panel-bg\)\s*!important[\s\S]*?border:\s*none\s*!important[\s\S]*?backdrop-filter:\s*var\(--documents-glass-backdrop-filter/);
  assert.match(documents, /\.documents-page-shell\s*\{[\s\S]*?background:\s*transparent\s*!important[\s\S]*?border:\s*0\s*!important/);
  assert.match(documents, /\\!border-0[\s\S]*?border:\s*2px solid rgba\(255,\s*234,\s*0/);
  assert.match(covision, /\.sectionPanel,[\s\S]*?\.confirmBox\s*\{[\s\S]*?border-style:\s*solid\s*!important/);
});

test("HC glow fields stay dark on hover and hide edge light overlays", () => {
  const hc = read("app/styles/theme/hc.css");
  const glass = read("app/styles/components/glass.css");
  const borderGlow = read("components/ui/BorderGlow.module.css");
  const hoverIndex = hc.indexOf("):is(:hover, :focus, :focus-within, :focus-visible, :active) {");
  const hoverBlock = hc.slice(hoverIndex, hc.indexOf("\n}", hoverIndex) + 2);

  assert.match(hc, /--hc-field-bg:\s*var\(--hc-control-bg\)/);
  assert.match(hc, /--input-bg-hover:\s*var\(--hc-field-bg-hover\)/);
  assert.match(hc, /--input-bg-focus:\s*var\(--hc-field-bg-focus\)/);
  assert.match(hoverBlock, /background:\s*var\(--hc-field-bg-focus\)\s*!important/);
  assert.doesNotMatch(hoverBlock, /--hc-control-bg-hover/);
  assert.match(
    hc,
    /\.ui-glow-field,[\s\S]*?\.invite-glow-field,[\s\S]*?\) > :is\(\.edgeLight,\s*\[class\*="edgeLight"\]\) \{[\s\S]*?display:\s*none\s*!important/
  );
  assert.match(
    glass,
    /html\[data-contrast="hc"\] \.ui-glow-field > \.edgeLight,[\s\S]*?display:\s*none\s*!important/
  );
  assert.match(
    glass,
    /html\[data-contrast="hc"\] \.ui-glow-field:hover \{[\s\S]*?background:\s*var\(--hc-field-bg-hover/
  );
  assert.match(
    borderGlow,
    /:global\(html\[data-contrast="hc"\]\) \.card:global\(\.ui-glow-field\),[\s\S]*?background:\s*var\(--hc-field-bg/
  );
  assert.match(
    borderGlow,
    /\.card:global\(\.ui-glow-field\):is\(:hover,\s*:focus-within\),[\s\S]*?background:\s*var\(--hc-field-bg-focus/
  );
});

test("HC invite modal list panel keeps a yellow border over glow panel defaults", () => {
  const hc = read("app/styles/theme/hc.css");
  const borderGlow = read("components/ui/BorderGlow.module.css");

  assert.match(
    hc,
    /html\[data-contrast="hc"\] body \.invite-list-panel \{[\s\S]*?border:\s*2px solid rgba\(var\(--hc-accent-rgb\),\s*0\.72\)\s*!important/
  );
  assert.match(
    hc,
    /\.invite-list-panel:is\(:hover,\s*:focus-within,\s*:focus-visible,\s*:active\) \{[\s\S]*?border-color:\s*rgba\(var\(--hc-accent-rgb\),\s*0\.72\)\s*!important/
  );
  assert.match(
    hc,
    /\.invite-list-panel::before,[\s\S]*?\.invite-list-panel::after,[\s\S]*?\.invite-list-panel > :is\(\.edgeLight,\s*\[class\*="edgeLight"\]\) \{[\s\S]*?display:\s*none\s*!important/
  );
  assert.match(
    hc,
    /html\[data-contrast="hc"\] body :is\([\s\S]*?\.invite-modal-content,[\s\S]*?\.person-invite-modal-content[\s\S]*?\) \.invite-list-panel\.invite-glow-panel \{[\s\S]*?border:\s*2px solid rgba\(var\(--hc-accent-rgb\),\s*0\.72\)\s*!important/
  );
  assert.match(
    borderGlow,
    /\.card:global\(\.invite-list-panel\) \{[\s\S]*?border:\s*2px solid rgba\(255,\s*234,\s*0,\s*0\.72\)\s*!important/
  );
  assert.match(
    borderGlow,
    /\.card:global\(\.invite-list-panel\)::before,[\s\S]*?\.card:global\(\.invite-list-panel\)::after,[\s\S]*?display:\s*none\s*!important/
  );
});

test("HC left and right rail icon buttons stay transparent", () => {
  const rail = read("components/chat/rail.module.css");
  const mono = read("app/styles/theme/mono.css");
  const orbital = read("components/effects/Components/OrbitalMenu/OrbitalMenu.css");

  // The HC icon-button reset is shared by both rails via composes; it now
  // lives once in rail.module.css.
  assert.match(rail, /:global\(html\[data-contrast="hc"\] body\) \.item[\s\S]*?\{[\s\S]*?background:\s*transparent\s*!important/);
  assert.match(rail, /:global\(html\[data-contrast="hc"\] body\) \.iconBtn[\s\S]*?\{[\s\S]*?box-shadow:\s*none\s*!important/);
  assert.doesNotMatch(mono, /:root\.theme-mono(?![^{]*data-contrast="hc")[^{]*:is\(\.chat-rail-icon-btn,[^{]*\{/);
  assert.doesNotMatch(mono, /:root\.theme-mono(?![^{]*data-contrast="hc")[^{]*\.chat-tools-menu/);
  assert.doesNotMatch(orbital, /:root\.theme-mono(?![^{]*data-contrast="hc")[^{]*\.profile-orbit-item-icon/);
});

test("HC invite selected payment cards and workspace action buttons have clear outlines", () => {
  const hc = read("app/styles/theme/hc.css");
  const serviceMap = readServiceMapCssBundle();
  const workspace = read("components/workspace/WorkspaceFeaturePage.jsx");

  assert.match(hc, /\.invite-modal-content \[data-control-type\]\[data-checked="true"\][\s\S]*?background:\s*rgba\(var\(--hc-accent-rgb\),\s*0\.1\)\s*!important/);
  assert.match(serviceMap, /\.workspace-feature-panel \[data-variant="primary"\][\s\S]*?background:\s*transparent\s*!important[\s\S]*?border:\s*2px solid rgba\(255,\s*234,\s*0/);
  assert.doesNotMatch(workspace, /workspace-feature-action-btn/);
});

test("HC selected option cards keep a yellow fill after the generic glow reset", () => {
  const hc = read("app/styles/theme/hc.css");
  const glass = read("app/styles/components/glass.css");
  const borderGlow = read("components/ui/BorderGlow.module.css");
  const segmented = read("components/ui/primarySegmentedButtonClassName.js");
  const genericResetIndex = hc.lastIndexOf("html[data-contrast=\"hc\"] body :is(\n  button,\n  [role=\"button\"],\n  label\n):is(");
  const selectedOverrideIndex = hc.indexOf(
    "html[data-contrast=\"hc\"] body :is(\n  .register-content,\n  .invite-modal-content,\n  .person-invite-modal-content,\n  .a11y-modal-shell\n) [data-control-type][data-checked=\"true\"] {",
    genericResetIndex
  );

  assert.ok(genericResetIndex > -1, "HC generic button/glow reset should exist");
  assert.ok(selectedOverrideIndex > genericResetIndex, "selected option card override must come after the generic reset");
  assert.match(
    hc.slice(selectedOverrideIndex),
    /background:\s*rgba\(var\(--hc-accent-rgb\),\s*0\.1\)\s*!important/
  );
  assert.match(
    hc.slice(selectedOverrideIndex),
    /\[data-control-type\]\[data-checked="true"\]::before[\s\S]*?background:\s*rgba\(var\(--hc-accent-rgb\),\s*0\.06\)\s*!important/
  );
  assert.match(
    hc.slice(selectedOverrideIndex),
    /:is\(button,\s*\[role="button"\],\s*label\)\.ui-glow-option-card-frame\[data-checked="true"\][\s\S]*?background:\s*rgba\(var\(--hc-accent-rgb\),\s*0\.1\)\s*!important/
  );
  assert.match(
    glass,
    /html\[data-contrast="hc"\] \.ui-glow-option-card-frame\[data-checked="true"\][\s\S]*?background:\s*rgba\(255,\s*234,\s*0,\s*0\.1\)\s*!important/
  );
  assert.match(
    glass,
    /html\[data-contrast="hc"\] \.register-role-options \.register-role-button\.register-option-card\[data-checked="true"\][\s\S]*?background:\s*rgba\(255,\s*234,\s*0,\s*0\.1\)\s*!important/
  );
  assert.match(segmented, /hc:\[--seg-card-bg-selected:rgba\(255,234,0,0\.10\)\]/);
  assert.match(glass, /\.register-role-options \.register-role-button\.register-option-card\[data-checked="true"\]\s*\{[\s\S]*?background:\s*var\(--seg-card-bg-selected/);
  assert.match(
    borderGlow,
    /:global\(html\[data-contrast="hc"\]\) \.card:global\(\.ui-glow-option-card-frame\[data-checked="true"\]\)[\s\S]*?background:\s*rgba\(255,\s*234,\s*0,\s*0\.1\)\s*!important/
  );
});

test("HC registration inputs do not draw an inner native input rectangle", () => {
  const glass = read("app/styles/components/glass.css");

  assert.match(
    glass,
    /html\[data-contrast="hc"\] \.register-input \.ui-glow-control,[\s\S]*?border:\s*0\s*!important[\s\S]*?outline:\s*0\s*!important[\s\S]*?background:\s*transparent\s*!important/
  );
});

test("HC framework page action buttons keep visible yellow borders", () => {
  const hc = read("app/styles/theme/hc.css");

  assert.match(
    hc,
    /html\[data-contrast="hc"\] \.framework-page-shell \.ui-glow-button-frame,[\s\S]*?border:\s*2px solid rgba\(var\(--hc-accent-rgb\),\s*0\.72\)\s*!important/
  );
});

test("registration option cards and credential fields share one desktop width", () => {
  const source = read("components/alalehed/RegistreerimineBody.jsx");

  assert.match(source, /const registerControlWidthClassName\s*=/);
  assert.match(source, /const registerCredentialFieldClassName\s*=\s*\n\s*registerControlWidthClassName;/);
  assert.match(source, /const checkboxCardClassName\s*=[\s\S]*registerControlWidthClassName/);
  assert.match(source, /register-role-button register-option-card w-full \$\{registerControlWidthClassName\}/);
  assert.match(source, /register-step--email[\s\S]*?<GlowField className=\{cn\(inputBaseClassName,\s*inputClassName,\s*pinInputClassName,\s*registerCredentialFieldClassName\)\}/);
  assert.match(source, /register-step--pin[\s\S]*?<GlowField className=\{cn\(inputBaseClassName,\s*inputClassName,\s*pinInputClassName,\s*registerCredentialFieldClassName\)\}/);
});

test("HC assistant message action buttons stay transparent under replies", () => {
  const component = read("components/alalehed/chat/ChatMessageItem.jsx");
  const hc = read("app/styles/theme/hc.css");

  assert.match(component, /chat-assistant-action-btn inline-flex/);
  assert.match(
    hc,
    /\.chat-msg-ai \.chat-assistant-action-btn,[\s\S]*?background:\s*transparent\s*!important[\s\S]*?background-image:\s*none\s*!important[\s\S]*?box-shadow:\s*none\s*!important/
  );
  assert.match(
    hc,
    /\.chat-msg-ai \.chat-assistant-action-btn \{[\s\S]*?color:\s*var\(--hc-accent\)\s*!important/
  );
  assert.match(
    hc,
    /\.chat-msg-ai \.chat-assistant-action-btn svg :is\(path, circle, line, rect, ellipse, polyline, polygon\) \{[\s\S]*?stroke:\s*var\(--hc-accent\)\s*!important/
  );
});

test("HC chat plus menu items use yellow hover fill", () => {
  const hc = read("app/styles/theme/hc.css");

  assert.match(
    hc,
    /\.chat-tools-menu \.chat-tools-item:hover,[\s\S]*?background:\s*rgba\(var\(--hc-accent-rgb\),\s*0\.14\)\s*!important/
  );
});

test("HC service map toolbar placeholders are yellow", () => {
  const hc = read("app/styles/theme/hc.css");

  assert.match(
    hc,
    /\.service-map-workspace \.service-map-toolbar__input::placeholder,[\s\S]*?color:\s*rgba\(var\(--hc-accent-rgb\),\s*0\.92\)\s*!important/
  );
});
