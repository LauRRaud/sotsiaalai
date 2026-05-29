import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

function cssBlock(source, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = source.match(new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\n\\}`));
  return match?.[0] || "";
}

test("workspace subpage surfaces reuse the shared glass shell edge shine", () => {
  const stylesSource = read("components/ui/glassPageStyles.js");
  const helpersCss = read("app/styles/utilities/helpers.css");
  const glassCss = read("app/styles/components/glass.css");
  const covisionSource = read("components/covision/CovisionPage.jsx");
  const inviteSource = read("components/invite/InviteModal.jsx");
  const materialsSource = read("components/materials/MaterialsPage.jsx");
  const workspaceFeatureSource = read("components/workspace/WorkspaceFeaturePage.jsx");
  const serviceMapCss = read("app/styles/components/service-map.css");
  const surfaceBlock = cssBlock(helpersCss, ".glass-subpage-surface");
  const surfaceBeforeBlock = cssBlock(helpersCss, ".glass-subpage-surface::before");

  assert.match(
    stylesSource,
    /glassSubpageSurfaceScopeClassName\s*=[\s\S]*?glass-subpage-surface/
  );
  assert.match(stylesSource, /workspaceGuidePanelClassName\s*=[\s\S]*?workspace-guide-panel[\s\S]*?glass-subpage-surface/);
  assert.match(stylesSource, /workspaceGuidePanelScrollClassName\s*=[\s\S]*?workspace-guide-panel-scroll[\s\S]*?overflow-y-auto/);
  assert.match(covisionSource, /covision-page-surface[\s\S]*?\$\{workspaceGuidePanelClassName\}/);
  assert.match(inviteSource, /invite-modal-content[\s\S]*?workspaceGuidePanelClassName/);
  assert.match(inviteSource, /invite-modal-content[\s\S]*?glassSubpageSurfaceScopeClassName/);
  assert.match(inviteSource, /workspaceGuidePanelScrollClassName[\s\S]*?invite-modal-scroll/);
  assert.match(workspaceFeatureSource, /workspace-feature-panel[\s\S]*?overflow-hidden/);
  assert.match(workspaceFeatureSource, /workspace-feature-content[\s\S]*?\$\{workspaceGuidePanelScrollClassName\}/);
  assert.match(serviceMapCss, /\.workspace-feature-panel:not\(\.service-map-page-panel\) > \.workspace-feature-content\s*\{[\s\S]*?overflow-y:\s*auto/);
  assert.match(materialsSource, /materials-page-content[\s\S]*?overflow-hidden/);
  assert.doesNotMatch(
    materialsSource,
    /materials-page-content[\s\S]*?\[scrollbar-gutter:stable_both-edges\][\s\S]*?\$\{glassSubpageSurfaceScopeClassName\}/
  );
  assert.match(materialsSource, /materials-page-content[\s\S]*?\$\{workspaceGuidePanelClassName\}/);
  assert.match(materialsSource, /materials-page-body[\s\S]*?\$\{workspaceGuidePanelScrollClassName\}/);
  assert.match(inviteSource, /invite-modal-content[\s\S]*?!overflow-hidden/);
  assert.match(inviteSource, /invite-modal-scroll[\s\S]*?overflow-y-visible/);
  assert.match(
    read("app/styles/mobile.css"),
    /\.invite-modal-content\.person-invite-modal-content\.glass-subpage-surface:not\(\.invite-modal-content--workspace\)\s*\{[\s\S]*?max-height:\s*calc\(100dvh - 1\.25rem\) !important;[\s\S]*?overflow:\s*hidden !important;/
  );
  assert.match(
    read("app/styles/mobile.css"),
    /> \.invite-modal-scroll:not\(\.workspace-guide-panel-scroll\)\s*\{[\s\S]*?flex:\s*1 1 auto !important;[\s\S]*?overflow:\s*visible !important;/
  );
  assert.match(
    read("app/styles/mobile.css"),
    /\.invite-modal-content\.person-invite-modal-content\.glass-subpage-surface:not\(\.invite-modal-content--workspace\)[\s\S]*?\.invite-list-panel\s*\{[\s\S]*?overflow-y:\s*auto !important;/
  );
  assert.match(surfaceBlock, /--glass-subpage-edge-stroke-width:\s*0px/);
  assert.match(surfaceBeforeBlock, /content:\s*""/);
  assert.match(surfaceBeforeBlock, /background:\s*var\(--glass-subpage-edge-stroke,\s*none\)/);
  assert.match(surfaceBeforeBlock, /mask-composite:\s*exclude/);
  assert.match(
    helpersCss,
    /@media \(min-width:\s*769px\)[\s\S]*?\.glass-subpage-surface\s*\{[\s\S]*?--glass-subpage-edge-stroke:\s*var\(\s*--glass-ring-edge-stroke-desktop/
  );
  assert.match(
    helpersCss,
    /@media \(max-width:\s*768px\)[\s\S]*?\.glass-subpage-surface::before\s*\{[\s\S]*?display:\s*none/
  );
  assert.match(
    helpersCss,
    /html\[data-contrast="hc"\]\s+\.glass-subpage-surface::before\s*\{[\s\S]*?display:\s*none\s*!important/
  );
  assert.match(
    helpersCss,
    /\.glass-subpage-surface\s*\{[\s\S]*?--subpage-card-bg:\s*color-mix\([\s\S]*?var\(--glass-ring-surface-bg/
  );
  assert.match(
    helpersCss,
    /:root\.theme-light:not\(\.theme-mid\) \.glass-subpage-surface\s*\{[\s\S]*?--subpage-card-bg:\s*var\(--btn-primary-bg\)/
  );
  assert.match(
    helpersCss,
    /:root\.theme-mid \.glass-subpage-surface\s*\{[\s\S]*?--subpage-card-bg:\s*var\(--mid-unified-surface-bg\)/
  );
  assert.match(
    helpersCss,
    /:root\.theme-mono:not\(\[data-contrast="hc"\]\) \.glass-subpage-surface\s*\{[\s\S]*?--subpage-card-bg:\s*var\(--forest-input-surface\)/
  );
  assert.match(
    helpersCss,
    /:root:not\(\.theme-light\):not\(\.theme-mid\):not\(\.theme-night\):not\(\.theme-mono\):not\(\[data-contrast="hc"\]\)[\s\S]*?\.workspace-feature-panel\.glass-subpage-surface/
  );
  assert.match(
    helpersCss,
    /\.workspace-feature-panel\.glass-subpage-surface,[\s\S]*?--subpage-card-bg:[\s\S]*?color-mix\([\s\S]*?!important/
  );
  assert.match(
    helpersCss,
    /\.workspace-guide-panel\.glass-subpage-surface\s*\{[\s\S]*?--ring-base-max:\s*calc\(54 \* var\(--base-rem\)\)/
  );
  assert.match(
    helpersCss,
    /@media \(min-width:\s*769px\)[\s\S]*?\.workspace-guide-panel\.glass-subpage-surface\s*\{[\s\S]*?width:\s*var\(--workspace-glass-shell-inline-size\)\s*!important[\s\S]*?height:\s*var\(--workspace-glass-block-size\)\s*!important/
  );
  assert.match(
    glassCss,
    /\.workspace-feature-glow-card > \[class\*="edgeLight"\],[\s\S]*?\.materials-glow-card::after\s*\{[\s\S]*?display:\s*none !important/
  );
});

test("invite modal form controls align to the invite list panel width", () => {
  const inviteSource = read("components/invite/InviteModal.jsx");
  const mobileCss = read("app/styles/mobile.css");

  assert.match(
    inviteSource,
    /inviteFormClassName\s*=[\s\S]*?max-w-\[36rem\][\s\S]*?max-\[768px\]:max-w-\[23rem\]/
  );
  assert.match(
    inviteSource,
    /inviteFieldWrapClassName\s*=[\s\S]*?max-w-\[36rem\][\s\S]*?max-\[768px\]:max-w-\[23rem\]/
  );
  assert.match(
    inviteSource,
    /inviteListCardClassName\s*=[\s\S]*?max-w-\[36rem\][\s\S]*?max-\[768px\]:max-w-\[23rem\]/
  );
  assert.doesNotMatch(inviteSource, /useGlassFieldHoleMask/);
  assert.doesNotMatch(inviteSource, /maskRootReady/);
  assert.doesNotMatch(inviteSource, /contentRef=\{setModalContentRef\}/);
  assert.doesNotMatch(inviteSource, /data-glass-field-hole="invite"/);
  assert.doesNotMatch(inviteSource, /glass-field-hole-surface/);
  assert.doesNotMatch(inviteSource, /glass-hole-mask-layer/);
  assert.doesNotMatch(
    mobileCss,
    /\.invite-modal-content\.glass-field-hole-surface > \.glass-hole-mask-layer\s*\{[\s\S]*?mask-image:\s*var\(--glass-field-hole-mask/
  );
  assert.doesNotMatch(inviteSource, /glass-hole-underlay-layer/);
  assert.doesNotMatch(mobileCss, /glass-hole-underlay-layer/);
  assert.doesNotMatch(
    mobileCss,
    /\.invite-modal-content\.glass-field-hole-surface::before\s*\{[\s\S]*?glass-field-hole-mask/
  );
});

test("register ring surface matches chat and profile glass surface token", () => {
  const registerSource = read("components/alalehed/RegistreerimineBody.jsx");
  const mobileCss = read("app/styles/mobile.css");

  assert.match(registerSource, /registerRingClassName[\s\S]*?glass-ring--desktop-stable/);
  assert.match(
    registerSource,
    /registerRingClassName[\s\S]*?\[--glass-ring-surface-bg:var\(--glass-surface-bg,rgba\(0,0,0,0\.25\)\)\]/
  );
  assert.match(
    registerSource,
    /registerRingClassName[\s\S]*?\[--mobile-common-glass-surface-bg:var\(--glass-surface-bg,rgba\(0,0,0,0\.25\)\)\]/
  );
  assert.match(
    mobileCss,
    /\.profile-container\.glass-ring \.profile-mask-layer\s*\{[\s\S]*?var\(--glass-surface-bg,\s*rgba\(0,\s*0,\s*0,\s*0\.25\)\) !important;/
  );
  assert.match(
    mobileCss,
    /\.profile-container\.glass-ring\[data-orbit-open="true"\] \.profile-mask-layer\s*\{[\s\S]*?var\(--glass-surface-bg,\s*rgba\(0,\s*0,\s*0,\s*0\.25\)\) !important;/
  );
});
