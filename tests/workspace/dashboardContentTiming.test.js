import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function readSource(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("chat workspace waits for the glass surface before showing dashboard content", () => {
  const chatBodySource = readSource("components/alalehed/ChatBody.jsx");
  const chatBodyViewSource = readSource("components/alalehed/chat/ChatBodyView.jsx");
  const workspaceSource = readSource("components/chat/WorkspacePanel.jsx");
  const workspaceCss = readSource("components/chat/WorkspacePanel.module.css");

  assert.match(chatBodySource, /const WORKSPACE_SURFACE_SETTLE_MS = 700;/);
  assert.match(chatBodySource, /const \[workspaceSurfaceReady,\s*setWorkspaceSurfaceReady\] = useState\(false\);/);
  assert.match(chatBodySource, /setWorkspaceSurfaceReady\(false\);[\s\S]*?if \(!workspaceOpen\) return;/);
  assert.match(chatBodySource, /setWorkspaceSurfaceReady\(true\);[\s\S]*?WORKSPACE_SURFACE_SETTLE_MS/);
  assert.match(chatBodySource, /workspaceSurfaceReady=\{workspaceSurfaceReady\}/);

  assert.match(chatBodyViewSource, /workspaceSurfaceReady,/);
  assert.match(chatBodyViewSource, /<WorkspacePanel[\s\S]*?visible=\{workspaceSurfaceReady\}/);

  assert.match(workspaceSource, /visible = true/);
  assert.match(workspaceSource, /data-visible=\{visible \? "true" : "false"\}/);

  assert.match(
    workspaceCss,
    /\.panel\[data-visible="false"\]\s+:global\(\.glass-subpage-back-button\),[\s\S]*?\.panel\[data-visible="false"\]\s+:global\(\.glass-subpage-header\),[\s\S]*?\.panel\[data-visible="false"\]\s+\.grid\s*\{[\s\S]*?opacity:\s*0;[\s\S]*?pointer-events:\s*none;/
  );
  assert.doesNotMatch(chatBodySource, /const WORKSPACE_FOCUS_RESET_OPEN_MS = 720;/);
  assert.doesNotMatch(
    chatBodySource,
    /workspaceOpenDelayTimerRef\.current = window\.setTimeout\(\(\) => \{[\s\S]*?setWorkspaceOpen\(true\);[\s\S]*?\}\s*,\s*WORKSPACE_FOCUS_RESET_OPEN_MS\);/
  );
});

test("restored workspace returns already settled without replaying the dashboard reveal", () => {
  const chatBodySource = readSource("components/alalehed/ChatBody.jsx");

  assert.match(
    chatBodySource,
    /const workspaceRestoredOpenRef = useRef\(false\);/
  );
  assert.match(
    chatBodySource,
    /const \[workspaceSuppressOpenTransition,\s*setWorkspaceSuppressOpenTransition\] = useState\(false\);/
  );
  assert.match(
    chatBodySource,
    /workspaceRestoredOpenRef\.current = true;[\s\S]*?setWorkspaceSuppressOpenTransition\(true\);[\s\S]*?setWorkspaceOpen\(true\);[\s\S]*?setWorkspaceSurfaceReady\(true\);/
  );
  assert.match(
    chatBodySource,
    /if \(workspaceRestoredOpenRef\.current\) \{[\s\S]*?workspaceRestoredOpenRef\.current = false;[\s\S]*?setWorkspaceSurfaceReady\(true\);[\s\S]*?return;[\s\S]*?\}/
  );
  assert.match(
    chatBodySource,
    /workspaceSuppressOpenTransition[\s\S]*?"chat-container--workspace-restore-no-transition"/
  );
  assert.match(
    readSource("app/styles/components/chat-focus.css"),
    /\.chat-container\.chat-container--round\.chat-container--workspace-restore-no-transition\s*\{[\s\S]*?transition:\s*none\s*!important;/
  );
});

test("workspace card navigation keeps the chat surface in workspace shape until route changes", () => {
  const workspaceSource = readSource("components/chat/WorkspacePanel.jsx");
  const navigateToMatch = workspaceSource.match(
    /const navigateTo = useCallback\(\s*path => \{([\s\S]*?)\},\s*\[[^\]]*locale[\s\S]*?router[^\]]*\]\s*\);/
  );

  assert.ok(navigateToMatch, "navigateTo callback should be present");
  assert.doesNotMatch(
    navigateToMatch[1],
    /onClose\?\.\(\);/,
    "workspace route navigation must not close the workspace before the new route takes over"
  );
  assert.match(
    navigateToMatch[1],
    /markWorkspacePanelMorph\("expand",\s*path\);/
  );
  assert.match(
    navigateToMatch[1],
    /delayMs:\s*shouldRestoreWorkspace \? WORKSPACE_PANEL_MORPH_EXPAND_MS : 0/
  );
  assert.match(
    workspaceSource,
    /WORKSPACE_PANEL_MORPH_EXPAND_MS/
  );
  assert.match(
    readSource("lib/workspacePanelMorph.js"),
    /export const WORKSPACE_PANEL_MORPH_EXPAND_MS = 720;/
  );
  assert.match(
    navigateToMatch[1],
    /pushWithTransition\(router,\s*localizePath\(path,\s*locale\),\s*\{[\s\S]*?workspacePanelMorph:\s*shouldRestoreWorkspace \? "expand" : undefined/
  );

  assert.match(
    workspaceSource,
    /const openHelpPanel = useCallback\([\s\S]*?onClose\?\.\(\);/,
    "same-page workspace panels should still close the dashboard"
  );
});

test("help listings opened from workspace return to a settled workspace", () => {
  const chatBodySource = readSource("components/alalehed/ChatBody.jsx");
  const backToWorkspaceMatch = chatBodySource.match(
    /const backToWorkspaceFromListingsPanel = useCallback\(\(\) => \{([\s\S]*?)\},\s*\[[^\]]*\]\);/
  );

  assert.ok(backToWorkspaceMatch, "workspace help-listing return callback should be present");
  assert.match(backToWorkspaceMatch[1], /markWorkspacePanelMorph\("collapse",\s*"\/vestlus"\);/);
  assert.match(backToWorkspaceMatch[1], /delayMs:\s*WORKSPACE_PANEL_MORPH_DELAY_MS/);
  assert.match(backToWorkspaceMatch[1], /restoreWorkspaceFromSharedPanel\(\);/);
  assert.match(chatBodySource, /const restoreWorkspaceFromSharedPanel = useCallback\(\(\) => \{[\s\S]*?workspaceRestoredOpenRef\.current = true;[\s\S]*?setWorkspaceSuppressOpenTransition\(false\);[\s\S]*?setWorkspaceReturnMorphing\(true\);[\s\S]*?setWorkspaceSurfaceReady\(true\);[\s\S]*?setWorkspaceOpen\(true\);/);
  assert.doesNotMatch(chatBodySource, /const PANEL_TILT_CLOSE_MS = 540;/);
  assert.match(chatBodySource, /listingsPanelCloseTimerRef\.current = window\.setTimeout\(/);
});

test("workspace return morph keeps border radius out of the transition", () => {
  const chatBodySource = readSource("components/alalehed/ChatBody.jsx");
  const cssSource = readSource("app/styles/components/chat-focus.css");

  assert.match(chatBodySource, /chat-container--workspace-return-morph/);
  assert.match(chatBodySource, /const WORKSPACE_RETURN_MORPH_SETTLE_MS = 760;/);
  assert.match(
    chatBodySource,
    /setWorkspaceReturnTransitioning\(false\);[\s\S]*?WORKSPACE_RETURN_MORPH_SETTLE_MS/
  );
  assert.match(
    cssSource,
    /\.chat-container\.chat-container--round\.chat-container--workspace-open\.chat-container--workspace-return-morph\s*\{[\s\S]*?transition:[\s\S]*?width 680ms[\s\S]*?transform 680ms[\s\S]*?!important;[\s\S]*?\}/
  );
  assert.doesNotMatch(
    cssSource,
    /\.chat-container\.chat-container--round\.chat-container--workspace-open\.chat-container--workspace-return-morph\s*\{[\s\S]*?border-top-left-radius/
  );
});

test("workspace route return does not replay the dashboard morph after subpage collapse", async () => {
  const morph = await import("../../lib/workspacePanelMorph.js");
  const chatBodySource = readSource("components/alalehed/ChatBody.jsx");
  const added = new Set();
  const removed = new Set();
  const classList = {
    add(value) {
      added.add(value);
      removed.delete(value);
    },
    remove(value) {
      removed.add(value);
      added.delete(value);
    }
  };
  const previousWindow = globalThis.window;
  const previousDocument = globalThis.document;

  globalThis.window = {
    sessionStorage: {
      setItem() {}
    }
  };
  globalThis.document = {
    documentElement: { classList },
    body: { classList }
  };

  try {
    morph.markWorkspacePanelMorph("collapse", "/vestlus");
    assert.equal(added.has("chat-workspace-return-pending"), false);
    assert.equal(removed.has("chat-workspace-return-pending"), false);
  } finally {
    globalThis.window = previousWindow;
    globalThis.document = previousDocument;
  }

  const routeRestoreBranch = chatBodySource.match(
    /if \(morphState\?\.direction === "collapse"\) \{([\s\S]*?)\} else \{/
  );
  assert.ok(routeRestoreBranch, "route restore collapse branch should be present");
  assert.doesNotMatch(routeRestoreBranch[1], /setWorkspaceReturnMorphing\(true\);/);
  assert.match(
    routeRestoreBranch[1],
    /setWorkspaceSuppressOpenTransition\(true\);[\s\S]*?setWorkspaceReturnMorphing\(false\);[\s\S]*?setWorkspaceReturnTransitioning\(false\);/
  );
});

test("workspace subpage back controls mark the dashboard for instant restore", () => {
  const documentsSource = readSource("components/documents/DocumentsPage.jsx");
  const agentSource = readSource("components/agent/AgentModePage.jsx");
  const covisionSource = readSource("components/covision/CovisionPage.jsx");

  for (const source of [documentsSource, agentSource, covisionSource]) {
    assert.match(source, /const CHAT_WORKSPACE_RESTORE_STORAGE_KEY = "__SOTSIAALAI_CHAT_WORKSPACE_RESTORE__";?/);
    assert.match(source, /function markChatWorkspaceRestore\(\) \{[\s\S]*?window\.sessionStorage\.setItem\([\s\S]*?CHAT_WORKSPACE_RESTORE_STORAGE_KEY,[\s\S]*?JSON\.stringify\(\{ ts: Date\.now\(\) \}\)[\s\S]*?\);?[\s\S]*?\}/);
    assert.match(source, /const handleBack = useCallback\(\(\) => \{[\s\S]*?markChatWorkspaceRestore\(\);?[\s\S]*?(?:router\.push|pushWithTransition)\(/);
  }
});
