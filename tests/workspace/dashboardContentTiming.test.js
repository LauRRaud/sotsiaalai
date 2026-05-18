import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function readSource(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("chat workspace keeps dashboard content visually stable while the glass surface settles", () => {
  const chatBodySource = readSource("components/alalehed/ChatBody.jsx");
  const chatBodyViewSource = readSource("components/alalehed/chat/ChatBodyView.jsx");
  const workspaceSource = readSource("components/chat/WorkspacePanel.jsx");
  const workspaceCss = readSource("components/chat/WorkspacePanel.module.css");

  assert.match(chatBodySource, /const WORKSPACE_SURFACE_SETTLE_MS = 680;/);
  assert.match(chatBodySource, /const \[workspaceSurfaceReady,\s*setWorkspaceSurfaceReady\] = useState\(false\);/);
  assert.match(chatBodySource, /setWorkspaceSurfaceReady\(false\);[\s\S]*?if \(!workspaceOpen\) return;/);
  assert.match(chatBodySource, /setWorkspaceSurfaceReady\(true\);[\s\S]*?WORKSPACE_SURFACE_SETTLE_MS/);
  assert.match(chatBodySource, /workspaceSurfaceReady=\{workspaceSurfaceReady\}/);

  assert.match(chatBodyViewSource, /workspaceSurfaceReady,/);
  assert.match(chatBodyViewSource, /<WorkspacePanel[\s\S]*?visible=\{workspaceSurfaceReady\}/);

  assert.match(workspaceSource, /visible = true/);
  assert.match(workspaceSource, /data-visible=\{visible \? "true" : "false"\}/);
  assert.match(workspaceSource, /backClassName=\{styles\.backButton\}/);

  assert.match(
    workspaceCss,
    /\.panel\[data-visible="false"\]\s+:global\(\.glass-subpage-back-button\),[\s\S]*?\.panel\[data-visible="false"\]\s+:global\(\.glass-subpage-header\),[\s\S]*?\.panel\[data-visible="false"\]\s+\.grid\s*\{[\s\S]*?visibility:\s*hidden;[\s\S]*?pointer-events:\s*none;/
  );
  assert.match(
    workspaceCss,
    /\.backButton\s*\{[\s\S]*?position:\s*absolute\s*!important;[\s\S]*?left:\s*0\.55rem\s*!important;[\s\S]*?top:\s*0\.05rem\s*!important;/
  );
  assert.match(
    workspaceCss,
    /@media \(min-width:\s*769px\)[\s\S]*?\.panel\s*\{[\s\S]*?--workspace-subpage-back-top:\s*0\.55rem;[\s\S]*?--workspace-subpage-title-margin-top:\s*clamp\(2\.15rem,\s*5\.4vh,\s*3\.25rem\);[\s\S]*?padding-top:\s*clamp\(0\.18rem,\s*0\.65vh,\s*0\.42rem\);[\s\S]*?\.backButton\s*\{[\s\S]*?top:\s*calc\(\s*var\(--workspace-subpage-back-top,\s*0\.55rem\) - var\(--chat-pad-top,\s*0rem\)\s*\)\s*!important;/
  );
  assert.doesNotMatch(
    workspaceCss,
    /\.panel\s+:global\(\.glass-subpage-back-button\),[\s\S]*?position:\s*relative;/
  );
  assert.doesNotMatch(workspaceCss, /workspace-panel-enter/);
  assert.doesNotMatch(workspaceCss, /translateY\(0\.28rem\)/);
  assert.doesNotMatch(workspaceCss, /\.panel\[data-visible="false"\][^{]*\{[^}]*opacity/);
  assert.doesNotMatch(chatBodySource, /const WORKSPACE_FOCUS_RESET_OPEN_MS = 720;/);
  assert.doesNotMatch(
    chatBodySource,
    /workspaceOpenDelayTimerRef\.current = window\.setTimeout\(\(\) => \{[\s\S]*?setWorkspaceOpen\(true\);[\s\S]*?\}\s*,\s*WORKSPACE_FOCUS_RESET_OPEN_MS\);/
  );
});

test("workspace dashboard uses the same desktop glass sizing as workspace subpages", async () => {
  const chatBodySource = readSource("components/alalehed/ChatBody.jsx");
  const { resolveChatLayoutVars } = await import("../../components/alalehed/chat/chatLayoutVars.js");

  assert.match(
    chatBodySource,
    /resolveChatLayoutVars\(\{[\s\S]*?isMobile:\s*viewportIsMobile,[\s\S]*?focusActive,[\s\S]*?workspaceOpen[\s\S]*?\}\)/
  );
  assert.match(
    chatBodySource,
    /const workspaceOpenRingPaddingStyle =[\s\S]*?workspaceOpen && !viewportIsMobile[\s\S]*?paddingTop:\s*"var\(--chat-pad-top\)"[\s\S]*?paddingBottom:\s*0/
  );
  assert.match(
    chatBodySource,
    /\{ \.\.\.chatVars,\s*\.\.\.workspaceOpenRingPaddingStyle,[\s\S]*?\}/
  );

  const defaultDesktopVars = resolveChatLayoutVars({
    isMobile: false,
    focusActive: false
  });
  const workspaceDesktopVars = resolveChatLayoutVars({
    isMobile: false,
    focusActive: false,
    workspaceOpen: true
  });
  const workspaceMobileVars = resolveChatLayoutVars({
    isMobile: true,
    focusActive: false,
    workspaceOpen: true
  });

  assert.equal(defaultDesktopVars["--chat-diameter"], "var(--profile-diameter)");
  assert.equal(workspaceDesktopVars["--chat-diameter"], "var(--ring-diameter, var(--ring-diameter-default))");
  assert.equal(workspaceDesktopVars["--chat-pad-top"], "clamp(0.35rem, 1.1vh, 0.72rem)");
  assert.equal(workspaceDesktopVars["--ring-ui-reserve"], "calc(2 * var(--base-rem))");
  assert.equal(workspaceDesktopVars["--ring-fit-pad"], "calc(1.3 * var(--base-rem))");
  assert.equal(workspaceDesktopVars["--chat-pad-bottom"], "0rem");
  assert.equal(workspaceMobileVars["--chat-diameter"], "var(--profile-diameter)");
});

test("workspace subpage surfaces match the dashboard outer glass width and radius", () => {
  const helpersCss = readSource("app/styles/utilities/helpers.css");
  const chatFocusCss = readSource("app/styles/components/chat-focus.css");

  assert.match(
    helpersCss,
    /--workspace-glass-shell-inline-size:\s*calc\(\s*var\(--workspace-glass-inline-size\)\s*\+\s*var\(--chat-focus-inline-extra,\s*0px\)\s*\);/
  );
  assert.match(
    helpersCss,
    /\.workspace-guide-panel\.glass-subpage-surface\s*\{[\s\S]*?--chat-focus-diameter-scale:\s*1\.06;/
  );
  assert.match(
    helpersCss,
    /\.workspace-guide-panel\.glass-subpage-surface\s*\{[\s\S]*?width:\s*var\(--workspace-glass-shell-inline-size\)\s*!important;[\s\S]*?border-radius:\s*clamp\(1\.6rem,\s*3\.5vw,\s*2\.4rem\)\s*!important;/
  );
  assert.match(
    helpersCss,
    /\.materials-page-content\.glass-subpage-surface,[\s\S]*?width:\s*var\(--workspace-glass-shell-inline-size\)\s*!important;[\s\S]*?border-radius:\s*clamp\(1\.6rem,\s*3\.5vw,\s*2\.4rem\)\s*!important;/
  );
  assert.match(
    chatFocusCss,
    /--help-listings-workspace-inline-size:\s*var\(--workspace-glass-shell-inline-size\);/
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
    /workspaceRestoredOpenRef\.current = true;[\s\S]*?setWorkspaceSuppressOpenTransition\(restoreTransition\.suppressOpenTransition\);[\s\S]*?setWorkspaceOpen\(true\);[\s\S]*?setWorkspaceSurfaceReady\(true\);/
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

test("workspace card navigation prefetches routes and opens subpages without route morph markers", () => {
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
  assert.doesNotMatch(workspaceSource, /WORKSPACE_PANEL_MORPH_EXPAND_MS/);
  assert.doesNotMatch(workspaceSource, /setHandoffPending/);
  assert.doesNotMatch(workspaceSource, /workspace-dashboard-panel--route-handoff/);
  assert.doesNotMatch(navigateToMatch[1], /markWorkspacePanelMorph/);
  assert.match(
    workspaceSource,
    /const WORKSPACE_ROUTE_PREFETCH_PATHS = Object\.freeze\(\[/
  );
  assert.match(
    workspaceSource,
    /router\.prefetch\?\.\(href\)/
  );
  assert.match(
    workspaceSource,
    /for \(const path of WORKSPACE_ROUTE_PREFETCH_PATHS\) \{[\s\S]*?router\.prefetch\(localizePath\(path,\s*locale\)\);/
  );
  assert.match(navigateToMatch[1], /pushWithTransition\(router,\s*href\);/);
  assert.doesNotMatch(navigateToMatch[1], /delayMs:/);
  assert.doesNotMatch(navigateToMatch[1], /workspacePanelMorph/);

  assert.match(
    workspaceSource,
    /const openHelpPanel = useCallback\([\s\S]*?onClose\?\.\(\);/,
    "same-page workspace panels should still close the dashboard"
  );
});

test("workspace subpage routes do not use panel enter or collapse morph classes", () => {
  const workspaceFeatureSource = readSource("components/workspace/WorkspaceFeaturePage.jsx");
  const documentsSource = readSource("components/documents/DocumentsPage.jsx");
  const agentSource = readSource("components/agent/AgentModePage.jsx");
  const materialsSource = readSource("components/materials/MaterialsPage.jsx");
  const covisionSource = readSource("components/covision/CovisionPage.jsx");

  for (const source of [workspaceFeatureSource, documentsSource, agentSource, materialsSource, covisionSource]) {
    assert.doesNotMatch(source, /workspace-guide-panel--route-enter/);
    assert.doesNotMatch(source, /documents-workspace-shell--route-enter/);
    assert.doesNotMatch(source, /workspace-guide-panel--collapse/);
    assert.doesNotMatch(source, /glassRingTiltFromLeft/);
  }
});

test("help listings opened from workspace return immediately without collapse morph", () => {
  const chatBodySource = readSource("components/alalehed/ChatBody.jsx");
  const helpListingsSource = readSource("components/chat/HelpListingsPanel.jsx");
  const backToWorkspaceMatch = chatBodySource.match(
    /const backToWorkspaceFromListingsPanel = useCallback\(\(\) => \{([\s\S]*?)\},\s*\[[^\]]*\]\);/
  );

  assert.ok(backToWorkspaceMatch, "workspace help-listing return callback should be present");
  assert.doesNotMatch(backToWorkspaceMatch[1], /markWorkspacePanelMorph/);
  assert.doesNotMatch(backToWorkspaceMatch[1], /delayMs:/);
  assert.match(backToWorkspaceMatch[1], /restoreWorkspaceFromSharedPanel\(\);/);
  assert.match(chatBodySource, /const restoreWorkspaceFromSharedPanel = useCallback\(\(\) => \{[\s\S]*?workspaceRestoredOpenRef\.current = true;[\s\S]*?setWorkspaceSuppressOpenTransition\(true\);[\s\S]*?setWorkspaceSurfaceReady\(true\);[\s\S]*?setWorkspaceOpen\(true\);/);
  assert.doesNotMatch(helpListingsSource, /workspace-guide-panel--route-enter/);
  assert.doesNotMatch(helpListingsSource, /workspace-guide-panel--collapse/);
});

test("workspace route handoff does not resize the desktop chat container", () => {
  const chatBodySource = readSource("components/alalehed/ChatBody.jsx");
  const cssSource = readSource("app/styles/components/chat-focus.css");

  assert.doesNotMatch(chatBodySource, /chat-container--workspace-return-morph/);
  assert.doesNotMatch(chatBodySource, /WORKSPACE_RETURN_MORPH_SETTLE_MS/);
  assert.doesNotMatch(chatBodySource, /workspaceReturnMorphing/);
  assert.doesNotMatch(chatBodySource, /workspaceReturnTransitioning/);
  assert.doesNotMatch(
    cssSource,
    /workspace-guide-morph-size/
  );
  assert.doesNotMatch(
    cssSource,
    /chat-container--workspace-open:has\(\.workspace-dashboard-panel--route-handoff\)/
  );
});

test("workspace route return keeps restores local to the chat page", async () => {
  const chatBodySource = readSource("components/alalehed/ChatBody.jsx");

  assert.match(
    chatBodySource,
    /resolveWorkspaceRestoreTransition\(morphState,\s*\{[\s\S]*?reduceMotion:\s*prefs\?\.reduceMotion[\s\S]*?\}\)/
  );
  assert.doesNotMatch(chatBodySource, /setWorkspaceReturnMorphing/);
  assert.doesNotMatch(chatBodySource, /setWorkspaceReturnTransitioning/);
});

test("workspace route return restores the dashboard without collapse markers", async () => {
  const { resolveWorkspaceRestoreTransition } = await import("../../lib/workspacePanelMorph.js");
  const chatBodySource = readSource("components/alalehed/ChatBody.jsx");
  const workspaceCss = readSource("components/chat/WorkspacePanel.module.css");

  assert.deepEqual(resolveWorkspaceRestoreTransition({ direction: "collapse" }), {
    suppressOpenTransition: true,
    returnMorphing: false,
    returnTransitioning: false
  });
  assert.deepEqual(resolveWorkspaceRestoreTransition({ direction: "expand" }), {
    suppressOpenTransition: true,
    returnMorphing: false,
    returnTransitioning: false
  });

  assert.match(chatBodySource, /setWorkspaceSuppressOpenTransition\(restoreTransition\.suppressOpenTransition\);/);
  assert.doesNotMatch(chatBodySource, /setWorkspaceReturnMorphing/);
  assert.doesNotMatch(chatBodySource, /setWorkspaceReturnTransitioning/);

  assert.doesNotMatch(workspaceCss, /workspace-dashboard-panel--route-handoff/);
  assert.doesNotMatch(workspaceCss, /opacity:\s*0\.86/);
  assert.match(
    workspaceCss,
    /\.panel::after\s*\{[\s\S]*?backdrop-filter:\s*none;[\s\S]*?-webkit-backdrop-filter:\s*none;/
  );
  assert.match(
    workspaceCss,
    /\.panel\s+:global\(\.glass-subpage-header\),[\s\S]*?\.panel\s+\.grid\s*\{[\s\S]*?z-index:\s*1;/
  );
  assert.match(workspaceCss, /\.backButton\s*\{[\s\S]*?position:\s*absolute\s*!important;/);
  assert.match(
    workspaceCss,
    /@media \(min-width:\s*769px\)[\s\S]*?\.panel\s+:global\(\.glass-subpage-title\)\s*\{[\s\S]*?--glass-subpage-title-margin-top:\s*var\(--workspace-subpage-title-margin-top,[\s\S]*?--glass-subpage-title-margin-bottom:\s*var\(--workspace-subpage-title-margin-bottom,/
  );
  assert.doesNotMatch(
    workspaceCss,
    /workspace-dashboard-content-release|workspace-dashboard-card-release|workspace-morph-surface-breathe/
  );
  assert.doesNotMatch(workspaceCss, /workspace-dashboard-panel--morph-expand/);
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
