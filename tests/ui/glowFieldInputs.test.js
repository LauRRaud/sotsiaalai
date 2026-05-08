import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("profile update pages wrap visible inputs in dark-mode BorderGlow fields", () => {
  const glowField = read("components/ui/GlowField.jsx");
  const button = read("components/ui/Button.jsx");
  const optionCard = read("components/ui/OptionCard.jsx");
  const glassCss = read("app/styles/components/glass.css");
  const pinBody = read("components/alalehed/UuendaPinBody.jsx");
  const emailBody = read("components/alalehed/UuendaEpostiBody.jsx");
  const registerBody = read("components/alalehed/RegistreerimineBody.jsx");
  const chatSidebar = read("components/ChatSidebar.jsx");

  assert.match(glowField, /import\s+BorderGlow\s+from\s+"@\/components\/ui\/BorderGlow"/);
  assert.match(glowField, /className=\{cn\("ui-glow-field"/);
  assert.match(glowField, /edgeOnly/);
  assert.match(glowField, /glowColor="358 82 72"/);
  assert.match(glowField, /edgeSensitivity=\{22\}/);
  assert.match(glowField, /glowRadius=\{48\}/);
  assert.match(glowField, /glowIntensity=\{0\.98\}/);
  assert.match(glowField, /--edge-only-field-top-fade-end/);
  assert.match(glowField, /"--edge-only-fade-end":\s*"30%"/);
  assert.match(glowField, /"--edge-only-tail-end":\s*"50%"/);
  assert.match(glowField, /"--edge-only-gap-start":\s*"52%"/);
  assert.match(glowField, /"--edge-only-return-start":\s*"52%"/);
  assert.match(glowField, /"--edge-only-return-soft":\s*"70%"/);
  assert.match(glowField, /"--edge-only-return-bright":\s*"84%"/);
  assert.match(glowField, /"--edge-only-return-hot":\s*"94%"/);
  assert.match(glowField, /"--edge-only-bottom-tail-start":\s*"42%"/);
  assert.match(glowField, /"--edge-only-bottom-tail-end":\s*"100%"/);
  assert.match(glowField, /"--edge-only-bottom-line-left":\s*"clamp\(0\.85rem,\s*3\.5%,\s*1\.35rem\)"/);
  assert.match(glowField, /"--edge-only-bottom-line-right":\s*"clamp\(0\.85rem,\s*3\.5%,\s*1\.35rem\)"/);

  assert.match(glassCss, /\.ui-glow-field/);
  assert.match(glassCss, /\.ui-glow-control/);
  assert.match(glassCss, /\.ui-glow-button-frame/);
  assert.match(glassCss, /\.ui-glow-button-control/);
  assert.match(glassCss, /\.ui-glow-option-card-frame/);
  assert.match(glassCss, /:root:not\(\.theme-light\):not\(\.theme-mid\)\s+\.ui-glow-field:hover/);
  assert.match(glassCss, /:root:not\(\.theme-light\):not\(\.theme-mid\)\s+\.ui-glow-button-frame:hover:not\(\.ui-glow-button-frame--disabled\)/);
  assert.match(glassCss, /:root:not\(\.theme-light\):not\(\.theme-mid\)\s+\.ui-glow-option-card-frame:hover:not\(\.ui-glow-option-card-frame--disabled\)/);
  assert.match(glassCss, /var\(--btn-primary-shadow-hover\)[\s\S]*?rgba\(255,\s*122,\s*126,\s*0\.66\)/);
  assert.match(glassCss, /\.ui-glow-button-frame:focus-within:not\(:hover\)\s*>\s*\[class\*="edgeLight"\][\s\S]*?opacity:\s*0\s*!important/);
  assert.match(glassCss, /\.ui-glow-option-card-frame:focus-within:not\(:hover\)::after[\s\S]*?opacity:\s*0\s*!important/);
  assert.match(glassCss, /:root\.theme-light\s+\.ui-glow-button-frame\s*>\s*\[class\*="edgeLight"\]/);
  assert.match(glassCss, /:root\.theme-light\s+\.ui-glow-option-card-frame\s*>\s*\[class\*="edgeLight"\]/);
  assert.match(glassCss, /html\[data-contrast="hc"\]\s+\.ui-glow-button-frame\s*>\s*\[class\*="edgeLight"\][\s\S]*?display:\s*block\s*!important/);
  assert.match(glassCss, /html\[data-contrast="hc"\]\s+\.ui-glow-option-card-frame\s*>\s*\[class\*="edgeLight"\][\s\S]*?display:\s*block\s*!important/);
  assert.doesNotMatch(glassCss, /:root:not\(\.theme-light\):not\(\.theme-mid\)\s+\.ui-glow-field:focus-within/);
  assert.match(glassCss, /rgba\(255,\s*122,\s*126,\s*0\.66\)/);
  assert.match(glassCss, /\.ui-glow-field:focus-within:not\(:hover\)\s*>\s*\[class\*="edgeLight"\][\s\S]*?opacity:\s*0\s*!important/);
  assert.match(glassCss, /:root\.theme-light\s+\.ui-glow-field\s*>\s*\.edgeLight/);
  assert.match(glassCss, /:root\.theme-mid\s+\.ui-glow-field\s*>\s*\.edgeLight/);
  assert.match(glassCss, /html\[data-contrast="hc"\]\s+\.ui-glow-field/);
  assert.match(glassCss, /html\[data-contrast="hc"\]\s+\.ui-glow-field\s*>\s*\.edgeLight[\s\S]*?display:\s*block\s*!important/);

  assert.match(button, /import\s+BorderGlow\s+from\s+"@\/components\/ui\/BorderGlow"/);
  assert.match(button, /import\s+\{\s*fieldEdgeGlowStyle\s*\}\s+from\s+"@\/components\/ui\/GlowField"/);
  assert.match(button, /glow\s*=\s*variant\s*===\s*"primary"/);
  assert.match(button, /const\s+useGlow\s*=\s*useBaseStyles\s*&&\s*glow\s*&&\s*variant\s*===\s*"primary"/);
  assert.match(button, /<BorderGlow[\s\S]*?as=\{Component\}[\s\S]*?backgroundColor="var\(--btn-primary-bg\)"[\s\S]*?edgeOnly/);
  assert.match(button, /ui-glow-button-frame ui-glow-button-control/);
  assert.match(optionCard, /import\s+BorderGlow\s+from\s+"@\/components\/ui\/BorderGlow"/);
  assert.match(optionCard, /glow\s*=\s*true/);
  assert.match(optionCard, /<BorderGlow[\s\S]*?as="label"[\s\S]*?backgroundColor="var\(--seg-card-bg\)"[\s\S]*?edgeOnly/);
  assert.match(optionCard, /ui-glow-option-card-frame/);
  assert.match(pinBody, /import\s+GlowField\s+from\s+"@\/components\/ui\/GlowField"/);
  assert.doesNotMatch(pinBody, /function\s+EdgeGlowButton/);
  assert.match(pinBody, /<Button[\s\S]*?type="submit"[\s\S]*?variant="primary"[\s\S]*?buttons\.save/);
  assert.match(pinBody, /<GlowField[\s\S]*?current-pin[\s\S]*?ui-glow-control/);
  assert.match(pinBody, /<GlowField[\s\S]*?next-pin[\s\S]*?ui-glow-control/);
  assert.match(pinBody, /<GlowField[\s\S]*?confirm-pin[\s\S]*?ui-glow-control/);

  assert.match(emailBody, /import\s+GlowField\s+from\s+"@\/components\/ui\/GlowField"/);
  assert.match(emailBody, /<GlowField[\s\S]*?current-email[\s\S]*?ui-glow-control/);
  assert.match(emailBody, /<GlowField[\s\S]*?name="email"[\s\S]*?ui-glow-control/);
  assert.match(emailBody, /<GlowField[\s\S]*?name="pin"[\s\S]*?ui-glow-control/);

  assert.match(registerBody, /import\s+GlowField,\s*\{\s*fieldEdgeGlowStyle\s*\}\s+from\s+"@\/components\/ui\/GlowField"/);
  assert.match(registerBody, /import\s+BorderGlow\s+from\s+"@\/components\/ui\/BorderGlow"/);
  assert.match(registerBody, /<BorderGlow[\s\S]*?as="button"[\s\S]*?ui-glow-option-card-frame[\s\S]*?register-role-button/);
  assert.match(registerBody, /<GlowField[\s\S]*?id="email"[\s\S]*?ui-glow-control/);
  assert.match(registerBody, /<GlowField[\s\S]*?id="pin"[\s\S]*?ui-glow-control/);
  assert.match(chatSidebar, /import\s+GlowField,\s*\{\s*fieldEdgeGlowStyle\s*\}\s+from\s+"@\/components\/ui\/GlowField"/);
  assert.match(chatSidebar, /<GlowField\s+className="chat-sidebar-search-glow w-full">[\s\S]*?chat-sidebar-search[\s\S]*?ui-glow-control/);
  assert.match(chatSidebar, /import\s+BorderGlow\s+from\s+"@\/components\/ui\/BorderGlow"/);
  assert.match(chatSidebar, /drawer-chat-card-glow/);
  assert.match(chatSidebar, /<BorderGlow[\s\S]*?as="div"[\s\S]*?ui-glow-option-card-frame drawer-chat-card-glow/);
});

test("pre-inquiries use document-mode glow shells and service-profile style fields", () => {
  const workspaceFeaturePage = read("components/workspace/WorkspaceFeaturePage.jsx");
  const serviceMapCss = read("app/styles/components/service-map.css");
  const documentsModeCss = read("app/styles/components/documents-mode.css");
  const chatFocusCss = read("app/styles/components/chat-focus.css");

  assert.match(workspaceFeaturePage, /className="documents-agent-glow-window"/);
  assert.match(workspaceFeaturePage, /className="documents-agent-glow-composer"/);
  assert.match(workspaceFeaturePage, /<ServiceProfileInput[\s\S]*?recipientQuery/);
  assert.match(workspaceFeaturePage, /<ServiceProfileInput[\s\S]*?value=\{topic\}/);
  assert.match(workspaceFeaturePage, /<ServiceProfileTextarea[\s\S]*?value=\{draft\}/);
  assert.match(workspaceFeaturePage, /<ServiceProfileTextarea[\s\S]*?readOnly[\s\S]*?activeReceivedInquiry/);

  assert.match(
    documentsModeCss,
    /:root\.theme-light\s+:is\(\.documents-agent-glow-window,\s*\.documents-agent-glow-composer\)\s*>\s*\.edgeLight/
  );
  assert.match(
    documentsModeCss,
    /:root\.theme-mid\s+:is\(\.documents-agent-glow-window,\s*\.documents-agent-glow-composer\)\s*>\s*\.edgeLight/
  );
  assert.match(
    documentsModeCss,
    /html\[data-contrast="hc"\]\s+:is\(\.documents-agent-glow-window,\s*\.documents-agent-glow-composer\)\s*>\s*\.edgeLight[\s\S]*?display:\s*block\s*!important/
  );
  assert.match(
    serviceMapCss,
    /:root\.theme-light\s+\.service-profile-glow-field\s*>\s*\.edgeLight/
  );
  assert.match(
    serviceMapCss,
    /:root\.theme-mid\s+\.service-profile-glow-field\s*>\s*\.edgeLight/
  );
  assert.match(
    serviceMapCss,
    /html\[data-contrast="hc"\]\s+\.service-profile-glow-field\s*>\s*\.edgeLight[\s\S]*?display:\s*block\s*!important/
  );
  assert.match(workspaceFeaturePage, /--edge-only-field-top-fade-end/);
  assert.match(workspaceFeaturePage, /"--edge-only-fade-end":\s*"30%"/);
  assert.match(workspaceFeaturePage, /"--edge-only-tail-end":\s*"50%"/);
  assert.match(workspaceFeaturePage, /"--edge-only-gap-start":\s*"52%"/);
  assert.match(workspaceFeaturePage, /"--edge-only-return-start":\s*"52%"/);
  assert.match(workspaceFeaturePage, /"--edge-only-return-soft":\s*"70%"/);
  assert.match(workspaceFeaturePage, /"--edge-only-return-bright":\s*"84%"/);
  assert.match(workspaceFeaturePage, /"--edge-only-return-hot":\s*"94%"/);
  assert.match(workspaceFeaturePage, /"--edge-only-bottom-tail-start":\s*"42%"/);
  assert.match(workspaceFeaturePage, /"--edge-only-bottom-tail-end":\s*"100%"/);
  assert.match(workspaceFeaturePage, /"--edge-only-bottom-line-left":\s*"clamp\(0\.85rem,\s*3\.5%,\s*1\.35rem\)"/);
  assert.match(workspaceFeaturePage, /"--edge-only-bottom-line-right":\s*"clamp\(0\.85rem,\s*3\.5%,\s*1\.35rem\)"/);
  assert.match(
    chatFocusCss,
    /:root\.theme-light\s+\.chat-page-shell\s+\.chat-composer-glow-shell\s*>\s*\[class\*="edgeLight"\]/
  );
  assert.match(
    chatFocusCss,
    /:root\.theme-mid\s+\.chat-composer-glow-shell\s*>\s*\.edgeLight/
  );
  assert.match(
    chatFocusCss,
    /html\[data-contrast="hc"\]\s+\.chat-composer-glow-shell\s*>\s*\.edgeLight[\s\S]*?display:\s*block\s*!important/
  );
});
