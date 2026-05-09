import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function readSource(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("workspace-launched help listings use workspace-sized desktop modal chrome", () => {
  const componentSource = readSource("components/chat/HelpListingsPanel.jsx");
  const cssSource = readSource("app/styles/components/chat-focus.css");

  assert.match(componentSource, /isWorkspaceReturn/);
  assert.match(componentSource, /workspaceModalHeight/);
  assert.match(componentSource, /help-listings-workspace-measured-height/);
  assert.match(componentSource, /min-\[769px\]:!min-h-0/);
  assert.match(componentSource, /help-listings-modal-overlay--workspace/);
  assert.match(componentSource, /help-listings-modal-content--workspace/);
  assert.match(cssSource, /\.help-listings-modal-overlay--workspace/);
  assert.match(cssSource, /\.help-listings-modal-content--workspace/);
  assert.match(cssSource, /--help-listings-workspace-diameter/);
  assert.match(cssSource, /--help-listings-workspace-fit/);
  assert.match(cssSource, /--help-listings-workspace-block-size/);
  assert.match(cssSource, /--help-listings-workspace-measured-height/);
  assert.match(cssSource, /height:\s*var\(--help-listings-workspace-block-size\)/);
  assert.doesNotMatch(cssSource, /height:\s*var\(--chat-diameter\)\s*!important/);
});

test("PWA help listings fill the mobile viewport without artificial extra height", () => {
  const componentSource = readSource("components/chat/HelpListingsPanel.jsx");
  const cssSource = readSource("app/styles/mobile.css");

  assert.doesNotMatch(componentSource, /max-\[768px\]:!min-h-\[calc\(100dvh-env\(safe-area-inset-top/);
  assert.match(cssSource, /\.help-listings-modal-content[\s\S]*height:\s*var\(--glass-mobile-root-vh,\s*100dvh\)\s*!important/);
  assert.doesNotMatch(cssSource, /--help-listings-pwa-extra-height/);
  assert.doesNotMatch(cssSource, /min-height:\s*calc\(var\(--glass-mobile-root-vh,\s*100dvh\)\s*\+\s*var\(--help-listings-pwa-extra-height\)\)/);
});
