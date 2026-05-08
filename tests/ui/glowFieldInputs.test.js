import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("profile update pages wrap visible inputs in dark-mode BorderGlow fields", () => {
  const glowField = read("components/ui/GlowField.jsx");
  const glassCss = read("app/styles/components/glass.css");
  const pinBody = read("components/alalehed/UuendaPinBody.jsx");
  const emailBody = read("components/alalehed/UuendaEpostiBody.jsx");

  assert.match(glowField, /import\s+BorderGlow\s+from\s+"@\/components\/ui\/BorderGlow"/);
  assert.match(glowField, /className=\{cn\("ui-glow-field"/);
  assert.match(glowField, /edgeOnly/);
  assert.match(glowField, /glowColor="358 82 72"/);
  assert.match(glowField, /edgeSensitivity=\{22\}/);
  assert.match(glowField, /glowRadius=\{48\}/);
  assert.match(glowField, /glowIntensity=\{1\.15\}/);

  assert.match(glassCss, /\.ui-glow-field/);
  assert.match(glassCss, /\.ui-glow-control/);
  assert.match(glassCss, /:root:not\(\.theme-light\):not\(\.theme-mid\)\s+\.ui-glow-field:focus-within/);
  assert.match(glassCss, /rgba\(255,\s*122,\s*126,\s*0\.82\)/);
  assert.match(glassCss, /:root\.theme-light\s+\.ui-glow-field\s*>\s*\.edgeLight/);
  assert.match(glassCss, /:root\.theme-mid\s+\.ui-glow-field\s*>\s*\.edgeLight/);
  assert.match(glassCss, /html\[data-contrast="hc"\]\s+\.ui-glow-field/);
  assert.match(glassCss, /html\[data-contrast="hc"\]\s+\.ui-glow-field\s*>\s*\.edgeLight[\s\S]*?display:\s*block\s*!important/);

  assert.match(pinBody, /import\s+GlowField\s+from\s+"@\/components\/ui\/GlowField"/);
  assert.match(pinBody, /<GlowField[\s\S]*?current-pin[\s\S]*?ui-glow-control/);
  assert.match(pinBody, /<GlowField[\s\S]*?next-pin[\s\S]*?ui-glow-control/);
  assert.match(pinBody, /<GlowField[\s\S]*?confirm-pin[\s\S]*?ui-glow-control/);

  assert.match(emailBody, /import\s+GlowField\s+from\s+"@\/components\/ui\/GlowField"/);
  assert.match(emailBody, /<GlowField[\s\S]*?current-email[\s\S]*?ui-glow-control/);
  assert.match(emailBody, /<GlowField[\s\S]*?name="email"[\s\S]*?ui-glow-control/);
  assert.match(emailBody, /<GlowField[\s\S]*?name="pin"[\s\S]*?ui-glow-control/);
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
  assert.match(
    chatFocusCss,
    /:root\.theme-light\s+\.chat-composer-glow-shell\s*>\s*\.edgeLight/
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
