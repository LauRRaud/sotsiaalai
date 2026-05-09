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

  assert.match(hc, /\.invite-modal-content \[data-control-type\]\[data-checked="true"\][\s\S]*?background:\s*rgba\(255,\s*234,\s*0,\s*0\.22\)\s*!important/);
  assert.match(serviceMap, /\.workspace-feature-action-btn[\s\S]*?background:\s*transparent\s*!important[\s\S]*?border:\s*2px solid rgba\(255,\s*234,\s*0/);
  assert.match(workspace, /workspace-feature-action-btn/);
});
