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

test("workspace dashboard cards reveal the top edge shine only on interaction", () => {
  const source = read("components/chat/WorkspacePanel.module.css");
  const cardAfterBlock = cssBlock(source, ".card::after");
  const cardHoverAfterBlock = cssBlock(
    source,
    ".card:not(.cardDisabled):is(:hover, :focus-visible)::after"
  );

  assert.match(cardAfterBlock, /content:\s*""/);
  assert.match(cardAfterBlock, /top:\s*0/);
  assert.match(cardAfterBlock, /height:\s*2px/);
  assert.match(cardAfterBlock, /opacity:\s*0\s*!important/);
  assert.match(cardHoverAfterBlock, /opacity:\s*1\s*!important/);
  assert.match(cardAfterBlock, /linear-gradient\(\s*90deg/);
  assert.match(cardAfterBlock, /box-shadow:/);
  assert.doesNotMatch(cardAfterBlock, /display:\s*none/);
});

test("workspace dashboard light card uses red edge glow without a large card shadow", () => {
  const source = read("components/chat/WorkspacePanel.module.css");
  const lightAfterBlock = source.match(
    /:global\(:root\.theme-light\) \.card::after\s*\{([\s\S]*?)\n\}/
  )?.[1] || "";
  const lightHoverBlock = source.match(
    /:global\(:root\.theme-light\) \.card:is\(:hover, :focus-visible\)\s*\{([\s\S]*?)\n\}/
  )?.[1] || "";
  const lightEdgeBlock = source.match(
    /:global\(:root\.theme-light body \.workspace-dashboard-card\) > :global\(\[class\*="edgeLight"\]\)::before\s*\{([\s\S]*?)\n\}/
  )?.[1] || "";
  const lightGlobalHoverBlock = source.match(
    /:global\(:root\.theme-light:not\(\[data-contrast="hc"\]\) body \.workspace-dashboard-card:is\(:hover, :focus-visible\)\)\s*\{([\s\S]*?)\n\}/
  )?.[1] || "";

  assert.match(lightAfterBlock, /rgba\(197,\s*113,\s*113,\s*0\.34\)/);
  assert.match(lightEdgeBlock, /rgba\(197,\s*113,\s*113,\s*0\.14\)/);
  assert.doesNotMatch(lightHoverBlock, /0 0 12px/);
  assert.doesNotMatch(lightHoverBlock, /0 12px 26px/);
  assert.doesNotMatch(lightGlobalHoverBlock, /0 0 12px/);
  assert.doesNotMatch(lightGlobalHoverBlock, /0 12px 26px/);
});

test("workspace dashboard mid card is neutral idle and red only on hover", () => {
  const source = read("components/chat/WorkspacePanel.module.css");
  const midAfterBlock = source.match(
    /:global\(:root\.theme-mid:not\(\[data-contrast="hc"\]\) body \.workspace-dashboard-card::after\)\s*\{([\s\S]*?)\n\}/
  )?.[1] || "";
  const midHoverAfterBlock = source.match(
    /:global\(:root\.theme-mid:not\(\[data-contrast="hc"\]\) body \.workspace-dashboard-card:not\(:disabled\):is\(:hover, :focus-visible\)::after\)\s*\{([\s\S]*?)\n\}/
  )?.[1] || "";
  const midHoverCardBlock = source.match(
    /:global\(:root\.theme-mid:not\(\[data-contrast="hc"\]\) body \.workspace-dashboard-card:is\(:hover, :focus-visible\)\)\s*\{([\s\S]*?)\n\}/
  )?.[1] || "";
  const midHoverEdgeBlock = source.match(
    /:global\(:root\.theme-mid:not\(\[data-contrast="hc"\]\) body \.workspace-dashboard-card:is\(:hover, :focus-visible\)\) > :global\(\[class\*="edgeLight"\]\)::before\s*\{([\s\S]*?)\n\}/
  )?.[1] || "";

  assert.match(midAfterBlock, /rgba\(255,\s*255,\s*255,\s*0\.58\)/);
  assert.doesNotMatch(midAfterBlock, /rgba\(197,\s*113,\s*113/);
  assert.match(midHoverCardBlock, /--glow-color:\s*rgba\(197,\s*113,\s*113,\s*0\.52\)/);
  assert.match(midHoverAfterBlock, /rgba\(197,\s*113,\s*113,\s*0\.34\)/);
  assert.match(midHoverEdgeBlock, /rgba\(197,\s*113,\s*113,\s*0\.14\)/);
});

test("workspace dashboard card shine stays decorative outside high contrast", () => {
  const hc = read("app/styles/theme/hc.css");

  assert.match(
    hc,
    /html\[data-contrast="hc"\] body \.workspace-dashboard-card::after\s*\{[\s\S]*?display:\s*none\s*!important/
  );
});
