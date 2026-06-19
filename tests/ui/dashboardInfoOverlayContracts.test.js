import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";
import { readMobileCssBundle } from "../helpers/mobileCssBundle.mjs";


function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("dashboard info content is shared with the features page and excludes non-dashboard tools", () => {
  const config = read("lib/dashboardInfoContent.js");
  const featuresPage = read("components/alalehed/VoimalusedBody.jsx");

  assert.match(config, /aboutFeatureKey:\s*"workspace"/);
  assert.match(config, /aboutFeatureKey:\s*"help"/);
  assert.match(config, /aboutFeatureKey:\s*"service_card"/);
  assert.match(config, /aboutFeatureKey:\s*"kovisioon"/);
  assert.doesNotMatch(config, /aboutFeatureKey:\s*"analysis"/);
  assert.doesNotMatch(config, /aboutFeatureKey:\s*"research"/);
  assert.match(featuresPage, /ABOUT_FEATURE_KEYS/);
});

test("dashboard info overlay uses the same close button system as the conversation drawer", () => {
  const overlay = read("components/ui/DashboardInfoOverlay.jsx");
  const drawer = read("components/alalehed/ConversationDrawer.jsx");
  const sharedStyle = read("components/ui/chatDrawerCloseButtonStyles.js");
  const helpersCss = read("app/styles/utilities/helpers.css");
  const helpersCoreCss = read("app/styles/utilities/helpers-core.css");
  const mobileCss = readMobileCssBundle();

  assert.match(overlay, /import IconButton from "@\/components\/ui\/IconButton"/);
  assert.match(read("components/ui/IconButton.jsx"), /from "lucide-react"/);
  assert.match(read("components/ui/CloseButton.jsx"), /from "lucide-react"/);
  assert.match(overlay, /chatDrawerCloseButtonClassName/);
  assert.match(overlay, /aria-modal="true"/);
  assert.match(overlay, /document\.addEventListener\("keydown", onKeyDown, true\)/);
  assert.match(overlay, /event\.key === "Escape"/);
  assert.match(overlay, /setAttribute\("aria-hidden", "true"\)/);
  assert.match(overlay, /\.inert = true/);
  assert.match(overlay, /\.chat-container--workspace-open/);
  assert.match(overlay, /\.materials-page-content/);
  assert.match(overlay, /--dashboard-info-panel-width/);
  assert.match(overlay, /--dashboard-info-surface-background/);
  assert.match(overlay, /--documents-heading-color/);
  assert.match(overlay, /const sectionTitleClassName =\s*\n\s*"[^"]*font-\[500\][^"]*var\(--documents-heading-color,var\(--title-color,var\(--brand-accent,#c57171\)\)\)/);
  assert.doesNotMatch(overlay, /const sectionTitleClassName =\s*\n\s*"[^"]*font-\[680\][^"]*var\(--glass-modal-text/);
  assert.match(overlay, /--dashboard-info-title-wrap-padding-top/);
  assert.match(overlay, /--dashboard-info-title-wrap-extra-top/);
  assert.match(overlay, /document\.documentElement\?\.getBoundingClientRect\?\.\(\)\.height \|\| window\.innerHeight/);
  assert.match(overlay, /dashboard-info-panel--with-title-metrics/);
  assert.match(overlay, /<IconButton[\s\S]*?style=\{overlayCloseStyle\}[\s\S]*?\/>\s*<div className=\{contentClassName\}/);
  assert.doesNotMatch(overlay, /<div className=\{contentClassName\}[\s\S]*?<IconButton[\s\S]*?style=\{overlayCloseStyle\}/);
  assert.match(helpersCss, /@import url\("\.\/helpers-core\.css"\);/);
  assert.match(helpersCoreCss, /--dashboard-info-surface-background/);
  assert.match(helpersCoreCss, /\.dashboard-info-panel\.workspace-guide-panel\.glass-subpage-surface\s*>\s*\.dashboard-info-content\.workspace-guide-panel-scroll\s*\{[\s\S]*?padding-top:\s*calc\([\s\S]*?var\(--workspace-guide-panel-pad-top,\s*0\.6rem\)[\s\S]*?var\(--workspace-guide-panel-overscan-top\)[\s\S]*?\)\s*!important;/);
  assert.match(helpersCoreCss, /var\(--dashboard-info-title-wrap-extra-top,\s*0px\)/);
  assert.match(helpersCoreCss, /\.dashboard-info-panel--with-title-metrics[\s\S]*?\.glass-subpage-title-wrap[\s\S]*?padding-top:\s*var\(--dashboard-info-title-wrap-padding-top\)\s*!important;/);
  assert.match(
    mobileCss,
    /:is\([\s\S]*?\.workspace-scroll-surface,[\s\S]*?\)\s*:is\(\.glass-subpage-title-wrap,\s*\.policy-mobile-title-wrap\)\s*\{[\s\S]*?padding-top:\s*calc\([\s\S]*?var\(--mobile-header-title-top\)/
  );
  assert.match(sharedStyle, /drawer-close-btn--chat/);
  assert.match(drawer, /chatDrawerCloseButtonClassName/);
});

test("workspace surfaces expose the shared dashboard info trigger", () => {
  const workspace = read("components/chat/WorkspacePanel.jsx");
  const featurePage = read("components/workspace/WorkspaceFeaturePage.jsx");
  const documents = read("components/documents/DocumentsPage.jsx");
  const agent = read("components/agent/AgentModePage.jsx");
  const materials = read("components/materials/MaterialsPage.jsx");
  const covision = read("components/covision/CovisionPage.jsx");
  const helpListings = read("components/chat/HelpListingsPanel.jsx");
  const invite = read("components/invite/InviteModal.jsx");

  assert.match(workspace, /DashboardInfoTrigger[\s\S]*infoId="workspace"/);
  assert.match(featurePage, /getWorkspaceFeatureInfoId/);
  assert.match(featurePage, /DashboardInfoTrigger[\s\S]*infoId=\{infoId\}/);
  assert.match(documents, /DashboardInfoTrigger[\s\S]*infoId="documents"/);
  assert.match(documents, /detailExtras=\{\{\s*3:\s*frameworkInfoPanel\s*\}\}/);
  assert.doesNotMatch(documents, /documents-library-intro[\s\S]*?<div className="documents-framework-banner documents-notice/);
  assert.match(agent, /DashboardInfoTrigger[\s\S]*infoId="document_drafting"/);
  assert.match(materials, /DashboardInfoTrigger[\s\S]*infoId="materials"/);
  assert.match(covision, /DashboardInfoTrigger[\s\S]*infoId="kovision"/);
  assert.doesNotMatch(covision, /<PageInfoButton/);
  assert.match(covision, /<GlassSubpageHeader[\s\S]*rightSlot=\{[\s\S]*<DashboardInfoTrigger[\s\S]*infoId="kovision"/);
  assert.match(helpListings, /infoId=\{infoId\}/);
  assert.match(invite, /DashboardInfoTrigger[\s\S]*infoId="invites"/);
  assert.match(invite, /const inviteHeaderTitle = t\("invite\.eyebrow"\)/);
  assert.match(invite, /titleWrapClassName=\{isWorkspaceReturn \? "invite-workspace-title-wrap" : undefined\}/);
  assert.match(invite, /title=\{inviteHeaderTitle\}/);
});
