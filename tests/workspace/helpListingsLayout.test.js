import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function readSource(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("workspace-launched help listings render inside the workspace panel", () => {
  const componentSource = readSource("components/chat/HelpListingsPanel.jsx");
  const chatBodySource = readSource("components/alalehed/ChatBody.jsx");
  const chatBodyViewSource = readSource("components/alalehed/chat/ChatBodyView.jsx");
  const finalCssSource = readSource("app/styles/mobile.css");

  assert.match(chatBodySource, /workspaceListingsPanelNode/);
  assert.match(chatBodySource, /workspaceListingsPanelMeta/);
  assert.match(chatBodySource, /modalListingsPanelNode/);
  assert.match(chatBodyViewSource, /embeddedPanelNode=\{workspaceListingsPanelNode\}/);
  assert.match(chatBodyViewSource, /embeddedPanelMeta=\{workspaceListingsPanelMeta\}/);
  assert.match(componentSource, /hideHeader = false/);
  assert.match(componentSource, /!\s*hideHeader\s*\?/);
  assert.match(componentSource, /embedded = false/);
  assert.match(componentSource, /if \(embedded\) return undefined;/);
  assert.match(componentSource, /help-listings-modal-content--embedded/);
  assert.match(componentSource, /<div className="workspace-feature-embedded">/);
  assert.match(componentSource, /isWorkspaceReturn/);
  assert.match(componentSource, /workspaceGuidePanelClassName/);
  assert.match(componentSource, /workspaceGuidePanelScrollClassName/);
  assert.match(componentSource, /min-\[769px\]:!min-h-0/);
  assert.match(componentSource, /help-listings-modal-overlay--workspace/);
  assert.match(componentSource, /help-listings-modal-content--workspace/);
  assert.doesNotMatch(componentSource, /workspace-guide-panel--route-enter/);
  assert.doesNotMatch(componentSource, /workspace-guide-panel--collapse/);
  assert.match(finalCssSource, /\.workspace-dashboard-panel \.workspace-feature-embedded > :is\(/);
  assert.match(finalCssSource, /help-listings-modal-content--embedded/);
  assert.match(finalCssSource, /--glass-shell-shadow:\s*none\s*!important;/);
  assert.match(finalCssSource, /mask-image:\s*none\s*!important;/);

  const workspacePanelCss = readSource("components/chat/WorkspacePanel.module.css");
  assert.match(
    workspacePanelCss,
    /\.embeddedContent\s*\{[\s\S]*?width:\s*min\(100%,\s*clamp\(38rem,\s*76vw,\s*56rem\)\);[\s\S]*?flex-direction:\s*column;/
  );
  assert.doesNotMatch(workspacePanelCss, /\.panel :global\(\.workspace-feature-embedded \.help-listings-panel\),[\s\S]*?background:\s*transparent\s*!important;/);
  assert.match(workspacePanelCss, /\.panel :global\(\.workspace-feature-embedded \.workspace-feature-card\),[\s\S]*?box-shadow:\s*none\s*!important;/);
});

test("workspace-launched invite renders inside the workspace panel", () => {
  const componentSource = readSource("components/invite/InviteModal.jsx");
  const workspaceSource = readSource("components/chat/WorkspacePanel.jsx");
  const finalCssSource = readSource("app/styles/mobile.css");

  assert.match(workspaceSource, /"__invite":\s*"invite"/);
  assert.match(workspaceSource, /setActiveEmbeddedFeature\("invite"\)/);
  assert.match(workspaceSource, /<InviteModal[\s\S]*?embedded[\s\S]*?onBack=\{handleWorkspaceBack\}/);
  assert.match(componentSource, /embedded = false/);
  assert.match(componentSource, /const \[open,\s*setOpen\] = useState\(embedded\)/);
  assert.match(componentSource, /if \(embedded\) return undefined;/);
  assert.match(componentSource, /invite-modal-content--embedded/);
  assert.match(componentSource, /<div className="workspace-feature-embedded">/);
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
  assert.match(finalCssSource, /invite-modal-content--embedded/);
  assert.match(finalCssSource, /--glass-modal-shadow:\s*none\s*!important;/);
  assert.match(finalCssSource, /-webkit-mask-image:\s*none\s*!important;/);
  assert.doesNotMatch(componentSource, /--invite-workspace-measured-height/);
});

test("PWA help listings fill the mobile viewport without artificial extra height", () => {
  const componentSource = readSource("components/chat/HelpListingsPanel.jsx");
  const cssSource = readSource("app/styles/mobile.css");

  assert.doesNotMatch(componentSource, /max-\[768px\]:!min-h-\[calc\(100dvh-env\(safe-area-inset-top/);
  assert.match(cssSource, /\.help-listings-modal-content[\s\S]*height:\s*var\(--glass-mobile-root-vh,\s*100dvh\)\s*!important/);
  assert.doesNotMatch(cssSource, /--help-listings-pwa-extra-height/);
  assert.doesNotMatch(cssSource, /min-height:\s*calc\(var\(--glass-mobile-root-vh,\s*100dvh\)\s*\+\s*var\(--help-listings-pwa-extra-height\)\)/);
});
