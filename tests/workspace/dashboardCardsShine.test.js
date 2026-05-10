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

test("workspace dashboard cards render a desktop-like top edge shine", () => {
  const source = read("components/chat/WorkspacePanel.module.css");
  const cardAfterBlock = cssBlock(source, ".card::after");

  assert.match(cardAfterBlock, /content:\s*""/);
  assert.match(cardAfterBlock, /top:\s*0/);
  assert.match(cardAfterBlock, /height:\s*2px/);
  assert.match(cardAfterBlock, /opacity:\s*1\s*!important/);
  assert.match(cardAfterBlock, /linear-gradient\(\s*90deg/);
  assert.match(cardAfterBlock, /box-shadow:/);
  assert.doesNotMatch(cardAfterBlock, /display:\s*none/);
});

test("workspace dashboard card shine stays decorative outside high contrast", () => {
  const hc = read("app/styles/theme/hc.css");

  assert.match(
    hc,
    /html\[data-contrast="hc"\] body \.workspace-dashboard-card::after\s*\{[\s\S]*?display:\s*none\s*!important/
  );
});
