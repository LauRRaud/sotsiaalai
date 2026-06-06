import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const composerSource = readFileSync(
  new URL("../../components/alalehed/chat/ChatComposer.jsx", import.meta.url),
  "utf8"
);

const chatBodySource = readFileSync(
  new URL("../../components/alalehed/ChatBody.jsx", import.meta.url),
  "utf8"
);

const workspaceCardsSource = readFileSync(
  new URL("../../lib/workspaceDashboardCards.js", import.meta.url),
  "utf8"
);

const journeyDashboardSource = readFileSync(
  new URL("../../components/journey/JourneyDashboard.jsx", import.meta.url),
  "utf8"
);

function getToolsMenuPanel(source) {
  const start = source.indexOf("const toolsMenuPanel =");
  const end = source.indexOf("const sideControlsClassName", start);
  assert.notEqual(start, -1, "ChatComposer should define toolsMenuPanel");
  assert.notEqual(end, -1, "ChatComposer should define sideControlsClassName after toolsMenuPanel");
  return source.slice(start, end);
}

test("chat plus menu does not expose Teekond as a persistent tool", () => {
  const toolsMenuPanel = getToolsMenuPanel(composerSource);

  assert.doesNotMatch(toolsMenuPanel, /journeyModeLabel/);
  assert.doesNotMatch(toolsMenuPanel, /JourneyModeIcon/);
  assert.doesNotMatch(composerSource, /showJourneyTool/);
  assert.doesNotMatch(chatBodySource, /onActivateJourneyMode/);
});

test("client workspace keeps Teekond as a separate dashboard card", () => {
  assert.match(workspaceCardsSource, /key:\s*"journey"/);
  assert.match(workspaceCardsSource, /title:\s*text\(t,\s*"chat\.workspace\.cards\.journey\.title",\s*"Teekond"\)/);
  assert.match(workspaceCardsSource, /route:\s*"\/teekond"/);
  assert.match(workspaceCardsSource, /\?\s*\[\[journeyCard,\s*serviceMapCard\]\]/);
});

test("journey empty start icon does not use GPU render classes that soften the icon", () => {
  const iconClass = journeyDashboardSource.match(/className="([^"]*journey-empty-orbit-icon[^"]*)"/)?.[1] || "";

  assert.ok(iconClass.includes("journey-empty-orbit-icon"));
  assert.doesNotMatch(iconClass, /transform-gpu/);
  assert.doesNotMatch(iconClass, /backface-visibility/);
});
