import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";
import { readServiceMapCssBundle } from "../helpers/serviceMapCssBundle.mjs";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("pre-inquiry assistant renders assessment details inside the conversation message", () => {
  const source = read("components/workspace/WorkspaceFeaturePage.jsx");

  assert.match(source, /const assistantConversationText = useMemo/);
  assert.match(source, /assessmentQuestions\.map\(\(question\) => `- \$\{question\}`\)/);
  assert.match(source, /text=\{assistantConversationText\}/);
  assert.doesNotMatch(source, /assistantWarnings\.map\(\(warning\)/);
});

test("pre-inquiry draft and recipient selection have clear visible contracts", () => {
  const source = read("components/workspace/WorkspaceFeaturePage.jsx");
  const css = readServiceMapCssBundle();

  assert.match(source, /PRE_INQUIRY_ASSESSMENT_PATHS\.map/);
  assert.match(source, /definition\.primaryQuestions\.map/);
  assert.match(source, /buildPreInquiryAssessmentExportText/);
  assert.match(source, /buildPreInquiryAssessmentReview/);
  assert.match(source, /buildPreInquiryAssessmentDraftSummary/);
  assert.match(source, /buildPreInquiryAssessmentAssistContext/);
  assert.match(source, /municipality:\s*assessmentAssistContext\.municipality/);
  assert.match(source, /selectedNeedAreas:\s*assessmentAssistContext\.selectedNeedAreas/);
  assert.match(source, /urgencyLevel:\s*assessmentAssistContext\.urgencyLevel/);
  assert.match(source, /assistantRoutingConfidence/);
  assert.match(source, /entry\.routingReason/);
  assert.match(source, /Vaata eelinfo üle/);
  assert.match(source, /review\.unansweredQuestions\.map/);
  assert.match(source, /review=\{assessmentReview\}/);
  assert.match(source, /assessmentDraftSummary:\s*assessmentDraftSummary/);
  assert.match(source, /assessmentState:\s*assessmentStateForSave/);
  assert.match(source, /Saada platvormis/);
  assert.match(source, /handleSelectRecipient\(entry\)/);
  assert.match(source, /Vali see kontakt/);
  assert.match(source, /data-selected=\{isSelectedRecipient \? "true" : undefined\}/);
  assert.match(source, /className="pre-inquiry-draft-textarea"/);
  assert.match(css, /\.pre-inquiry-draft-textarea\s*\{[\s\S]*?min-height:\s*clamp\(24rem,\s*54vh,\s*34rem\)/);
  assert.match(css, /\.workspace-feature-list-card\[data-selected="true"\]\s*\{[\s\S]*?background:\s*color-mix\(in srgb,\s*var\(--workspace-feature-accent\) 16%/);
});

test("pre-inquiry assessment uses one questionnaire control set without quick action button rows", () => {
  const source = read("components/workspace/WorkspaceFeaturePage.jsx");

  assert.doesNotMatch(source, /pre-inquiry-page-head/);
  assert.doesNotMatch(source, /workspace_feature_pages\.pre_inquiries\.creating_new/);
  assert.doesNotMatch(source, /workspace_feature_pages\.pre_inquiries\.editing_existing/);
  assert.doesNotMatch(source, /pre-inquiry-quick-actions/);
  assert.doesNotMatch(source, /workspace_feature_pages\.pre_inquiries\.actions\.start_assessment/);
  assert.doesNotMatch(source, /workspace_feature_pages\.pre_inquiries\.actions\.prepare_draft/);
  assert.doesNotMatch(source, /name="pre-inquiry-subject"/);
  assert.doesNotMatch(source, /name="pre-inquiry-urgency"/);
  assert.doesNotMatch(source, /name="pre-inquiry-consent"/);
  assert.doesNotMatch(source, /pre-inquiry-select/);
  assert.doesNotMatch(source, /<select[\s\S]*?pre-inquiry/);
  assert.match(source, /pre-inquiry-dropdown--assessment-path/);
  assert.match(source, /pre-inquiry-dropdown--subject/);
  assert.match(source, /pre-inquiry-dropdown--urgency/);
  assert.match(source, /pre-inquiry-dropdown--consent/);
  assert.match(source, /menuClassName="pre-inquiry-dropdown pre-inquiry-dropdown-menu"/);
  assert.match(source, /<DocumentsDropdown[\s\S]*?portal/);
});

test("pre-inquiry dropdowns are custom themed controls, not browser-native menus", () => {
  const css = readServiceMapCssBundle();

  assert.match(css, /\.workspace-feature-dropdown\.pre-inquiry-dropdown \.documents-dropdown-trigger/);
  assert.match(css, /\.workspace-feature-dropdown\.pre-inquiry-dropdown \.documents-dropdown-menu/);
  assert.match(css, /:root\.theme-light:not\(\.theme-mid\) \.pre-inquiry-dropdown/);
  assert.match(css, /:root\.theme-mid \.pre-inquiry-dropdown/);
  assert.match(css, /:root:not\(\.theme-light\):not\(\.theme-mid\):not\(\.theme-night\):not\(\.theme-mono\):not\(\[data-contrast="hc"\]\) \.pre-inquiry-dropdown/);
  assert.match(css, /:root\.theme-night \.pre-inquiry-dropdown/);
  assert.match(css, /:root\.theme-mono:not\(\[data-contrast="hc"\]\) \.pre-inquiry-dropdown/);
  assert.match(css, /html\[data-contrast="hc"\] \.pre-inquiry-dropdown/);
  assert.match(css, /\.pre-inquiry-field:has\(\.documents-dropdown\.is-open\)\s*\{[\s\S]*?z-index:\s*80/);
  const fieldRule = css.match(/\.pre-inquiry-field\s*\{(?<body>[\s\S]*?)\}/);
  assert.ok(fieldRule?.groups?.body);
  assert.doesNotMatch(fieldRule.groups.body, /opacity/);
  assert.match(css, /background-color:\s*var\(--pre-inquiry-dropdown-menu-bg\)\s*!important/);
  assert.match(css, /opacity:\s*1\s*!important/);
  assert.match(css, /\.documents-dropdown-menu\.pre-inquiry-dropdown-menu/);
});

test("pre-inquiry panels and extra detail fields keep readable spacing", () => {
  const source = read("components/workspace/WorkspaceFeaturePage.jsx");
  const css = readServiceMapCssBundle();

  assert.match(source, /pre-inquiry-extra-grid/);
  assert.match(source, /pre-inquiry-section-card/);
  assert.doesNotMatch(source, /md:grid-cols-3/);
  assert.match(css, /\.pre-inquiry-workspace\s*\{[\s\S]*?row-gap:\s*clamp\(1\.35rem,\s*2\.4vw,\s*1\.85rem\)/);
  assert.match(css, /\.pre-inquiry-workspace\s*>\s*:where\(\.workspace-feature-glow-card,\s*\.pre-inquiry-details\)\s*\+\s*:where\(\.workspace-feature-glow-card,\s*\.pre-inquiry-details\)/);
  assert.match(css, /\.pre-inquiry-section-card\s*\{[\s\S]*?margin-block:\s*0\.12rem\s*!important/);
  assert.match(css, /\.pre-inquiry-section-card\s*\+\s*\.pre-inquiry-section-card\s*\{[\s\S]*?margin-top:\s*clamp\(1rem,\s*1\.8vw,\s*1\.35rem\)\s*!important/);
  assert.match(css, /\.pre-inquiry-extra-grid\s*\{[\s\S]*?grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(min\(100%,\s*20rem\),\s*1fr\)\)/);
  assert.match(css, /\.pre-inquiry-extra-grid\s+\.documents-field--textarea\s*\{[\s\S]*?min-height:\s*8\.4rem/);
  assert.match(css, /\.pre-inquiry-extra-grid\s+\.documents-field--textarea\s*\{[\s\S]*?resize:\s*none/);
});

test("pre-inquiry recipient type filter is optional and aligned with search", () => {
  const source = read("components/workspace/WorkspaceFeaturePage.jsx");
  const css = readServiceMapCssBundle();

  assert.match(source, /const \[recipientType, setRecipientType\] = useState\(""\)/);
  assert.match(source, /type="checkbox"[\s\S]*?name="pre-inquiry-recipient-type"/);
  assert.match(source, /setRecipientType\(\(current\) => current === value \? "" : value\)/);
  assert.match(source, /pre-inquiry-recipient-controls/);
  assert.match(css, /\.pre-inquiry-recipient-controls\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\)/);
  assert.match(css, /\.pre-inquiry-recipient-types\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
});

test("pre-inquiry receiver view shows structured assessment review, not only raw export", () => {
  const source = read("components/workspace/WorkspaceFeaturePage.jsx");

  assert.match(source, /function PreInquiryAssessmentReviewSection/);
  assert.match(source, /activeReceivedInquiryAssessmentReview/);
  assert.match(source, /buildPreInquiryAssessmentReview\(activeReceivedInquiry\.assessmentState/);
  assert.match(source, /workspace_feature_pages\.pre_inquiries\.sections\.received_assessment_review/);
  assert.match(source, /activeReceivedInquiryAssessmentReview[\s\S]*?PreInquiryAssessmentReviewSection/);
  assert.match(source, /handleDownloadReceivedInquiry/);
  assert.match(source, /received_download/);
  assert.match(source, /receiverChecklistDraft/);
  assert.match(source, /handleSaveReceiverWorkflow/);
  assert.match(source, /api\/pre-inquiries\/\$\{encodeURIComponent\(inquiryId\)\}\/workflow/);
});

test("pre-inquiry assistant clears stale draft and recipient when no draft or contact is returned", () => {
  const source = read("components/workspace/WorkspaceFeaturePage.jsx");

  assert.match(source, /if \(payload\?\.draftBody \|\| payload\?\.draft\) \{[\s\S]*?setDraft\(payload\.draftBody \|\| payload\.draft\);[\s\S]*?\} else \{[\s\S]*?setDraft\(""\);[\s\S]*?setDraftTouched\(false\);[\s\S]*?\}/);
  assert.match(source, /if \(firstSuggestion\?\.id\) \{[\s\S]*?setSelectedRecipientId\(firstSuggestion\.id\);[\s\S]*?\} else \{[\s\S]*?setSelectedRecipientId\(""\);[\s\S]*?\}/);
});

test("pre-inquiry assistant conversation surfaces non-urgent workflow warnings", () => {
  const source = read("components/workspace/WorkspaceFeaturePage.jsx");

  assert.match(source, /const otherWarnings = assistantWarnings\.filter/);
  assert.match(source, /otherWarnings\.map\(\(warning\) => `Oluline: \$\{warning\}`\)/);
});

test("pre-inquiry assistant conversation and input shadows stay close to the element", () => {
  const css = readServiceMapCssBundle();

  assert.match(
    css,
    /\.pre-inquiry-agent-chat \.documents-agent-glow-window,[\s\S]*?\.pre-inquiry-agent-chat \.documents-agent-glow-composer\s*\{[\s\S]*?0 4px 10px rgba\(0,\s*0,\s*0,\s*0\.12\)\s*!important/
  );
  assert.match(
    css,
    /\.pre-inquiry-agent-chat \.documents-agent-glow-window:hover,[\s\S]*?\.pre-inquiry-agent-chat \.documents-agent-glow-composer:focus-within\s*\{[\s\S]*?0 6px 13px rgba\(0,\s*0,\s*0,\s*0\.14\)\s*!important/
  );
  assert.doesNotMatch(
    css,
    /\.pre-inquiry-agent-chat \.documents-agent-glow-window,[\s\S]*?\.pre-inquiry-agent-chat \.documents-agent-glow-composer\s*\{[\s\S]*?0 10px 24px/
  );
});

test("workspace feature pages are anchored to the viewport", () => {
  const source = read("components/workspace/WorkspaceFeaturePage.jsx");
  const css = readServiceMapCssBundle();

  assert.match(source, /workspace-feature-page-shell/);
  assert.match(source, /fixed inset-0 isolate z-\[30\]/);
  assert.match(source, /w-screen max-w-\[100vw\]/);
  assert.match(source, /bg-transparent/);
  assert.match(source, /persistGlassRingTilt:\s*false/);
  assert.match(source, /workspace-feature-admin-role--viewport/);
  assert.match(
    css,
    /\.workspace-feature-admin-role--viewport\s*\{[\s\S]*?position:\s*fixed;[\s\S]*?top:\s*calc\(env\(safe-area-inset-top,\s*0px\) \+ clamp\(0\.72rem,\s*2\.2vh,\s*1\.15rem\)\);[\s\S]*?right:\s*calc\(env\(safe-area-inset-right,\s*0px\) \+ clamp\(0\.72rem,\s*2vw,\s*1\.15rem\)\);/
  );
});

test("workspace feature panels keep a stable desktop footprint across role views", () => {
  const css = read("app/styles/utilities/helpers.css");
  const source = read("components/workspace/WorkspaceFeaturePage.jsx");

  assert.match(
    css,
    /@media \(min-width:\s*769px\)[\s\S]*?\.workspace-guide-panel\.glass-subpage-surface\s*\{[\s\S]*?width:\s*var\(--workspace-glass-shell-inline-size\)\s*!important/
  );
  assert.match(
    css,
    /@media \(min-width:\s*769px\)[\s\S]*?\.workspace-guide-panel\.glass-subpage-surface\s*\{[\s\S]*?height:\s*var\(--workspace-glass-block-size\)\s*!important/
  );
  assert.match(
    source,
    /workspaceGuidePanelClassName/
  );
  assert.match(source, /workspace-feature-content/);
  assert.match(source, /workspace-feature-content relative/);
  assert.match(
    source,
    /<div className=\{cn\(isServiceMap \? "workspace-feature-content service-map-page-content relative" : contentClassName\)\}>[\s\S]*?<GlassSubpageHeader/
  );
  assert.match(source, /overflow-hidden/);
  assert.doesNotMatch(source, /!max-w-\[66rem\]/);
});

test("workspace-launched feature pages keep their scroll content unmasked", () => {
  const css = read("app/styles/utilities/helpers.css");

  assert.match(
    css,
    /\.workspace-feature-page-shell,[\s\S]*?\.covision-page-shell,[\s\S]*?\.invite-modal-content--workspace,[\s\S]*?\.help-listings-modal-content--workspace[\s\S]*?\.workspace-guide-panel-scroll\s*\{[\s\S]*?mask-image:\s*none\s*!important;[\s\S]*?-webkit-mask-image:\s*none\s*!important;/
  );
  assert.doesNotMatch(
    css,
    /:is\(\.documents-workspace-page--documents,\s*\.documents-workspace-page--agent\)\s*\{[\s\S]*?overflow:\s*hidden\s*!important;/
  );
  assert.doesNotMatch(
    css,
    /\.documents-page-shell\.workspace-guide-panel-scroll\s*\{[\s\S]*?overflow-y:\s*auto\s*!important;/
  );
});

test("workspace feature pages use the same desktop width as help listings", () => {
  const source = read("components/workspace/WorkspaceFeaturePage.jsx");
  const css = read("app/styles/utilities/helpers.css");
  const covisionSource = read("components/covision/CovisionPage.jsx");
  const materialsSource = read("components/materials/MaterialsPage.jsx");
  const helpListingsSource = read("components/chat/HelpListingsPanel.jsx");
  const chatFocusCss = read("app/styles/components/chat-focus.css");

  assert.match(helpListingsSource, /help-listings-modal-content--workspace/);
  assert.match(chatFocusCss, /help-listings-workspace-inline-size/);
  assert.match(
    css,
    /\.workspace-guide-panel\.glass-subpage-surface\s*\{[\s\S]*?--ring-base-max:\s*calc\(54 \* var\(--base-rem\)\)/
  );
  assert.match(source, /workspaceGuidePanelClassName/);
  assert.doesNotMatch(source, /workspace-guide-panel--route-enter/);
  assert.doesNotMatch(source, /workspace-guide-panel--collapse/);
  assert.match(covisionSource, /workspaceGuidePanelClassName/);
  assert.match(materialsSource, /workspaceGuidePanelClassName/);
  assert.match(covisionSource, /const bodyClassName =[\s\S]*?`relative \$\{workspaceGuidePanelScrollClassName\}/);
  assert.match(materialsSource, /materials-page-body relative \$\{workspaceGuidePanelScrollClassName\}/);
  assert.match(covisionSource, /<div className=\{bodyClassName\}>[\s\S]*?<GlassSubpageHeader/);
  assert.match(materialsSource, /materials-page-body relative[\s\S]*?<GlassSubpageHeader/);
  assert.doesNotMatch(source, /workspace-feature-panel--pre-inquiries/);
  assert.doesNotMatch(css, /workspace-feature-panel--pre-inquiries/);
});
