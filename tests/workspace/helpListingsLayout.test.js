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

test("workspace-launched invite modal aligns with workspace desktop chrome", () => {
  const componentSource = readSource("components/invite/InviteModal.jsx");
  const cssSource = readSource("app/styles/components/chat-focus.css");

  assert.match(componentSource, /isWorkspaceReturn/);
  assert.match(componentSource, /workspaceModalHeight/);
  assert.match(componentSource, /invite-workspace-measured-height/);
  assert.match(componentSource, /invite-modal-overlay--workspace/);
  assert.match(componentSource, /invite-modal-content--workspace/);
  assert.match(
    cssSource,
    /\.invite-modal-overlay\.person-invite-modal-overlay\.invite-modal-overlay--workspace\s*\{[\s\S]*?align-items:\s*center\s*!important;[\s\S]*?align-content:\s*center\s*!important;[\s\S]*?padding-top:\s*0\s*!important;[\s\S]*?padding-bottom:\s*0\s*!important;/
  );
  assert.doesNotMatch(
    cssSource,
    /\.invite-modal-overlay\.person-invite-modal-overlay\.invite-modal-overlay--workspace\s*\{[\s\S]*?align-items:\s*start\s*!important;/
  );
  assert.doesNotMatch(
    cssSource,
    /\.invite-modal-content--workspace\s*\{[^}]*top:\s*0\s*!important;/
  );
  assert.match(cssSource, /--invite-workspace-measured-height/);
});

test("PWA help listings fill the mobile viewport without artificial extra height", () => {
  const componentSource = readSource("components/chat/HelpListingsPanel.jsx");
  const cssSource = readSource("app/styles/mobile.css");

  assert.doesNotMatch(componentSource, /max-\[768px\]:!min-h-\[calc\(100dvh-env\(safe-area-inset-top/);
  assert.match(cssSource, /\.help-listings-modal-content[\s\S]*height:\s*var\(--glass-mobile-root-vh,\s*100dvh\)\s*!important/);
  assert.doesNotMatch(cssSource, /--help-listings-pwa-extra-height/);
  assert.doesNotMatch(cssSource, /min-height:\s*calc\(var\(--glass-mobile-root-vh,\s*100dvh\)\s*\+\s*var\(--help-listings-pwa-extra-height\)\)/);
});
