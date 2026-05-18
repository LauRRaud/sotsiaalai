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
  assert.match(componentSource, /workspaceGuidePanelClassName/);
  assert.match(componentSource, /workspaceGuidePanelScrollClassName/);
  assert.match(componentSource, /min-\[769px\]:!min-h-0/);
  assert.match(componentSource, /help-listings-modal-overlay--workspace/);
  assert.match(componentSource, /help-listings-modal-content--workspace/);
  assert.doesNotMatch(componentSource, /workspace-guide-panel--route-enter/);
  assert.doesNotMatch(componentSource, /workspace-guide-panel--collapse/);
  assert.match(cssSource, /\.help-listings-modal-overlay--workspace/);
  assert.match(cssSource, /\.help-listings-modal-content--workspace/);
  assert.match(cssSource, /--ring-base-max:\s*calc\(54 \* var\(--base-rem\)\)/);
  assert.match(cssSource, /height:\s*var\(--workspace-glass-block-size\)/);
  assert.doesNotMatch(cssSource, /height:\s*var\(--chat-diameter\)\s*!important/);
});

test("workspace-launched invite modal aligns with workspace desktop chrome", () => {
  const componentSource = readSource("components/invite/InviteModal.jsx");
  const cssSource = readSource("app/styles/components/chat-focus.css");

  assert.match(componentSource, /isWorkspaceReturn/);
  assert.match(componentSource, /workspaceGuidePanelClassName/);
  assert.match(componentSource, /workspaceGuidePanelScrollClassName/);
  assert.match(componentSource, /invite-modal-overlay--workspace/);
  assert.match(componentSource, /invite-modal-content--workspace/);
  assert.match(componentSource, /inviteListCardClassName[\s\S]*?mt-\[1\.45rem\]/);
  assert.match(componentSource, /inviteListCardClassName[\s\S]*?mx-auto w-full max-w-\[36rem\]/);
  assert.match(componentSource, /inviteListCardClassName[\s\S]*?max-\[768px\]:max-w-\[23rem\]/);
  assert.match(componentSource, /invites\.length === 0[\s\S]*?min-h-\[12rem\]/);
  assert.match(componentSource, /invites\.length === 0[\s\S]*?max-\[768px\]:min-h-\[10\.5rem\]/);
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
  assert.match(cssSource, /height:\s*var\(--workspace-glass-block-size\)/);
  assert.doesNotMatch(cssSource, /--invite-workspace-measured-height/);
});

test("PWA help listings fill the mobile viewport without artificial extra height", () => {
  const componentSource = readSource("components/chat/HelpListingsPanel.jsx");
  const cssSource = readSource("app/styles/mobile.css");

  assert.doesNotMatch(componentSource, /max-\[768px\]:!min-h-\[calc\(100dvh-env\(safe-area-inset-top/);
  assert.match(cssSource, /\.help-listings-modal-content[\s\S]*height:\s*var\(--glass-mobile-root-vh,\s*100dvh\)\s*!important/);
  assert.doesNotMatch(cssSource, /--help-listings-pwa-extra-height/);
  assert.doesNotMatch(cssSource, /min-height:\s*calc\(var\(--glass-mobile-root-vh,\s*100dvh\)\s*\+\s*var\(--help-listings-pwa-extra-height\)\)/);
});
