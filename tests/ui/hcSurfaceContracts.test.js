import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("HC chat composer controls stay transparent and input glow is yellow", () => {
  const css = read("app/styles/components/chat-focus.css");
  const borderGlow = read("components/ui/BorderGlow.module.css");
  const hc = read("app/styles/theme/hc.css");
  const composerShellBlocks = css.match(
    /:root:not\(\.theme-light\):not\(\.theme-mid\) \.chat-page-shell \.chat-composer-glow-shell(?::hover)?\s*\{[\s\S]*?\n\}/g
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
    assert.match(block, /rgba\(255,\s*234,\s*0/);
    assert.doesNotMatch(block, /rgba\(255,\s*122,\s*126/);
  }
});

test("HC global button reset excludes chat composer icon controls", () => {
  const css = read("app/styles/theme/hc.css");
  const chatExclusion =
    /:not\(\.chat-send-btn\)\s*:not\(\.chat-listen-btn\)\s*:not\(\.chat-dictate-btn\)\s*:not\(\.chat-side-control-btn\)\s*:not\(\.chat-tools-btn\)\s*:not\(\.chat-document-attach-btn\)/g;

  assert.ok((css.match(chatExclusion) || []).length >= 3);
  assert.match(css, /:not\(\.chat-rail-icon-btn\)/);
  assert.match(css, /\.chat-rail-icon-btn[\s\S]*?background:\s*transparent\s*!important/);
});

test("HC panels define actual yellow borders, not only border color", () => {
  const hc = read("app/styles/theme/hc.css");
  const serviceMap = read("app/styles/components/service-map.css");
  const documents = read("app/styles/components/documents-mode.css");
  const covision = read("components/covision/CovisionPage.module.css");
  const workspacePanel = read("components/chat/WorkspacePanel.jsx");

  assert.match(hc, /\.invite-list-panel[\s\S]*?\{[\s\S]*?border:\s*2px solid rgba\(255,\s*234,\s*0/);
  assert.match(hc, /\.workspace-dashboard-card,[\s\S]*?\.workspace-dashboard-card:is\(:hover,\s*:focus-visible,\s*:active\)\s*\{[\s\S]*?border:\s*2px solid rgba\(255,\s*234,\s*0/);
  assert.match(workspacePanel, /"workspace-dashboard-card"/);
  assert.match(serviceMap, /\.workspace-feature-card[\s\S]*?\{[\s\S]*?border:\s*2px solid var\(--hc-accent/);
  assert.match(documents, /\.documents-workspace-card[\s\S]*?\.documents-content[\s\S]*?\{[\s\S]*?border:\s*2px solid rgba\(255,\s*234,\s*0/);
  assert.match(documents, /--documents-hc-panel-bg:\s*rgba\(9,\s*14,\s*24,\s*0\.62\)/);
  assert.match(documents, /\.documents-framework-banner\.documents-notice[\s\S]*?background:\s*var\(--documents-hc-panel-bg\)\s*!important/);
  assert.match(documents, /\.documents-page-shell\s*\{[\s\S]*?background:\s*transparent\s*!important[\s\S]*?border:\s*0\s*!important/);
  assert.match(documents, /\\!border-0[\s\S]*?border:\s*2px solid rgba\(255,\s*234,\s*0/);
  assert.match(covision, /\.sectionPanel,[\s\S]*?\.confirmBox\s*\{[\s\S]*?border-style:\s*solid\s*!important/);
});

test("HC left and right rail icon buttons stay transparent", () => {
  const left = read("components/chat/LeftRail.module.css");
  const right = read("components/chat/RightRail.module.css");

  for (const css of [left, right]) {
    assert.match(css, /:global\(html\[data-contrast="hc"\] body\) \.item[\s\S]*?\{[\s\S]*?background:\s*transparent\s*!important/);
    assert.match(css, /:global\(html\[data-contrast="hc"\] body\) \.iconBtn[\s\S]*?\{[\s\S]*?box-shadow:\s*none\s*!important/);
  }
});

test("HC invite selected payment cards and workspace action buttons have clear outlines", () => {
  const hc = read("app/styles/theme/hc.css");
  const serviceMap = read("app/styles/components/service-map.css");
  const workspace = read("components/workspace/WorkspaceFeaturePage.jsx");

  assert.match(hc, /\.invite-modal-content \[data-control-type\]\[data-checked="true"\][\s\S]*?background:\s*rgba\(255,\s*234,\s*0,\s*0\.1\)\s*!important/);
  assert.match(serviceMap, /\.workspace-feature-action-btn[\s\S]*?background:\s*transparent\s*!important[\s\S]*?border:\s*2px solid rgba\(255,\s*234,\s*0/);
  assert.match(workspace, /workspace-feature-action-btn/);
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
    /background:\s*rgba\(255,\s*234,\s*0,\s*0\.1\)\s*!important/
  );
  assert.match(
    hc.slice(selectedOverrideIndex),
    /\[data-control-type\]\[data-checked="true"\]::before[\s\S]*?background:\s*rgba\(255,\s*234,\s*0,\s*0\.06\)\s*!important/
  );
  assert.match(
    hc.slice(selectedOverrideIndex),
    /:is\(button,\s*\[role="button"\],\s*label\)\.ui-glow-option-card-frame\[data-checked="true"\][\s\S]*?background:\s*rgba\(255,\s*234,\s*0,\s*0\.1\)\s*!important/
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
    /html\[data-contrast="hc"\] \.framework-page-shell \.ui-glow-button-frame,[\s\S]*?border:\s*2px solid rgba\(255,\s*234,\s*0,\s*0\.72\)\s*!important/
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
});

test("HC chat plus menu items use yellow hover fill", () => {
  const hc = read("app/styles/theme/hc.css");

  assert.match(
    hc,
    /\.chat-tools-menu \.chat-tools-item:hover,[\s\S]*?background:\s*rgba\(255,\s*234,\s*0,\s*0\.14\)\s*!important/
  );
});

test("HC service map toolbar placeholders are yellow", () => {
  const hc = read("app/styles/theme/hc.css");

  assert.match(
    hc,
    /\.service-map-workspace \.service-map-toolbar__input::placeholder,[\s\S]*?color:\s*rgba\(255,\s*234,\s*0,\s*0\.92\)\s*!important/
  );
});
