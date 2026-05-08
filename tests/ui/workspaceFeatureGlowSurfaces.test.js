import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("service map panel inputs, results and popup actions use shared glow styles", () => {
  const workspaceFeaturePage = read("components/workspace/WorkspaceFeaturePage.jsx");
  const serviceMapLeaflet = read("components/workspace/ServiceMapLeaflet.jsx");
  const serviceMapCss = read("app/styles/components/service-map.css");

  assert.match(workspaceFeaturePage, /import\s+GlowField\s+from\s+"@\/components\/ui\/GlowField"/);
  assert.match(workspaceFeaturePage, /service-map-toolbar__glow-field--keyword/);
  assert.match(workspaceFeaturePage, /service-map-toolbar__glow-field--region/);
  assert.match(workspaceFeaturePage, /service-map-toolbar__input--keyword ui-glow-control/);
  assert.match(workspaceFeaturePage, /<BorderGlow[\s\S]*?as="button"[\s\S]*?workspace-feature-list-card ui-glow-button-frame/);
  assert.match(workspaceFeaturePage, /service-map-result-card__title/);
  assert.match(serviceMapLeaflet, /service-map-popup__action ui-glow-button-frame ui-glow-button-control/);
  assert.match(serviceMapCss, /\.service-map-toolbar__glow-field/);
  assert.match(serviceMapCss, /\.service-map-toolbar__results \.workspace-feature-list-card :is\(\.service-map-result-card__title,\s*\.service-map-result-card__type\)/);
  assert.match(serviceMapCss, /\.service-map-leaflet__popup \.service-map-popup__actions a:is\(:hover,\s*:focus-visible\)[\s\S]*?rgba\(255,\s*122,\s*126,\s*0\.38\)/);
  assert.match(serviceMapCss, /html\[data-contrast="hc"\]\s+\.service-map-leaflet__popup \.service-map-popup__actions a:is\(:hover,\s*:focus-visible\)[\s\S]*?rgba\(255,\s*234,\s*0,\s*0\.72\)/);
});

test("workspace feature section cards use BorderGlow card chrome", () => {
  const workspaceFeaturePage = read("components/workspace/WorkspaceFeaturePage.jsx");
  const glassCss = read("app/styles/components/glass.css");

  assert.match(workspaceFeaturePage, /function\s+SectionCard[\s\S]*?<BorderGlow[\s\S]*?as="section"/);
  assert.match(workspaceFeaturePage, /workspace-feature-glow-card/);
  assert.match(workspaceFeaturePage, /backgroundColor="var\(--subpage-card-bg,\s*var\(--workspace-feature-surface,\s*#120F17\)\)"/);
  assert.match(glassCss, /:is\(\.workspace-feature-glow-card,\s*\.materials-glow-card,\s*\.invite-glow-panel\):focus-within:not\(:hover\)/);
});

test("dark, night and HC inner cards use the elevated workspace card tone", () => {
  const workspacePanelCss = read("components/chat/WorkspacePanel.module.css");
  const serviceMapCss = read("app/styles/components/service-map.css");
  const covisionCss = read("components/covision/CovisionPage.module.css");
  const darkCss = read("app/styles/theme/dark.css");
  const nightCss = read("app/styles/theme/night.css");
  const hcCss = read("app/styles/theme/hc.css");

  assert.match(workspacePanelCss, /\.card\s*\{[\s\S]*?rgba\(255,\s*255,\s*255,\s*0\.1\)/);
  assert.match(workspacePanelCss, /\.card:hover,[\s\S]*?rgba\(255,\s*255,\s*255,\s*0\.1\)/);
  assert.match(serviceMapCss, /--workspace-feature-surface:\s*var\(\s*--workspace-elevated-card-bg/);
  assert.match(serviceMapCss, /--subpage-card-bg:\s*var\(--workspace-elevated-card-bg\)/);
  assert.match(covisionCss, /--covision-card-bg:\s*var\(--workspace-elevated-card-bg/);
  assert.match(darkCss, /--workspace-elevated-card-bg:\s*linear-gradient\(145deg,\s*rgba\(255,\s*255,\s*255,\s*0\.1\)/);
  assert.match(darkCss, /--workspace-elevated-card-bg-hover:\s*linear-gradient\(145deg,\s*rgba\(255,\s*255,\s*255,\s*0\.1\)/);
  assert.match(darkCss, /\.materials-page-shell\s*\{[\s\S]*?--subpage-card-bg:\s*var\(--workspace-elevated-card-bg\)/);
  assert.match(nightCss, /--workspace-elevated-card-bg:\s*linear-gradient\(145deg,\s*rgba\(255,\s*255,\s*255,\s*0\.1\)/);
  assert.match(hcCss, /--workspace-elevated-card-bg:\s*linear-gradient\(145deg,\s*rgba\(255,\s*255,\s*255,\s*0\.1\)/);
});

test("covision fields, filter and cards use shared glow wrappers", () => {
  const covisionPage = read("components/covision/CovisionPage.jsx");
  const covisionCss = read("components/covision/CovisionPage.module.css");

  assert.match(covisionPage, /import\s+BorderGlow\s+from\s+"@\/components\/ui\/BorderGlow"/);
  assert.match(covisionPage, /import\s+GlowField,\s*\{\s*fieldEdgeGlowStyle\s*\}\s+from\s+"@\/components\/ui\/GlowField"/);
  assert.match(covisionPage, /function\s+CovisionInput/);
  assert.match(covisionPage, /function\s+CovisionTextarea/);
  assert.match(covisionPage, /function\s+SectionPanel[\s\S]*?<BorderGlow[\s\S]*?as="section"[\s\S]*?covision-glow-card/);
  assert.match(covisionPage, /<BorderGlow[\s\S]*?as="article"[\s\S]*?covision-glow-card/);
  assert.match(covisionPage, /<CovisionInput[\s\S]*?value=\{query\}/);
  assert.match(covisionPage, /covision-glow-dropdown/);
  assert.match(covisionCss, /\.page :global\(\.covision-glow-field\)/);
  assert.match(covisionCss, /\.page :global\(\.covision-glow-card:focus-within:not\(:hover\) > \.edgeLight\)/);
});

test("materials upload textarea and panels use shared glow wrappers", () => {
  const materialsPage = read("components/materials/MaterialsPage.jsx");
  const glassCss = read("app/styles/components/glass.css");

  assert.match(materialsPage, /import\s+BorderGlow\s+from\s+"@\/components\/ui\/BorderGlow"/);
  assert.match(materialsPage, /import\s+GlowField,\s*\{\s*fieldEdgeGlowStyle\s*\}\s+from\s+"@\/components\/ui\/GlowField"/);
  assert.match(materialsPage, /function\s+MaterialsGlowPanel/);
  assert.match(materialsPage, /materials-glow-card/);
  assert.match(materialsPage, /materials-comment-glow-field/);
  assert.match(materialsPage, /materials-comment-box[\s\S]*?ui-glow-control/);
  assert.match(materialsPage, /<MaterialsGlowPanel[\s\S]*?className=\{materialsUploadSectionClassName\}/);
  assert.match(materialsPage, /<MaterialsGlowPanel[\s\S]*?materials-admin-panel/);
  assert.match(materialsPage, /<MaterialsGlowPanel[\s\S]*?as="div"[\s\S]*?materials-admin-row/);
  assert.match(glassCss, /\.materials-comment-glow-field/);
});

test("invite modal fields and invite list use shared glow wrappers", () => {
  const inviteModal = read("components/invite/InviteModal.jsx");
  const glassCss = read("app/styles/components/glass.css");

  assert.match(inviteModal, /import\s+BorderGlow\s+from\s+"@\/components\/ui\/BorderGlow"/);
  assert.match(inviteModal, /import\s+GlowField,\s*\{\s*fieldEdgeGlowStyle\s*\}\s+from\s+"@\/components\/ui\/GlowField"/);
  assert.match(inviteModal, /function\s+InviteGlowPanel/);
  assert.match(inviteModal, /invite-glow-field[\s\S]*?invite-room-title[\s\S]*?ui-glow-control/);
  assert.match(inviteModal, /invite-glow-field[\s\S]*?invite-host-name[\s\S]*?ui-glow-control/);
  assert.match(inviteModal, /invite-glow-field[\s\S]*?invite-emails[\s\S]*?ui-glow-control/);
  assert.match(inviteModal, /<InviteGlowPanel[\s\S]*?invite-list-panel/);
  assert.doesNotMatch(inviteModal, /import\s+Panel\s+from\s+"@\/components\/ui\/Panel"/);
  assert.match(glassCss, /\.invite-glow-panel/);
  assert.match(glassCss, /\.invite-glow-field/);
});
