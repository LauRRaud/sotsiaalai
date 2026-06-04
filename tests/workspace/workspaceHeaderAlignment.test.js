import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("workspace dashboard header starts at the same desktop top edge as embedded subpages", () => {
  const css = readFileSync(new URL("../../components/chat/WorkspacePanel.module.css", import.meta.url), "utf8");

  assert.match(
    css,
    /@media \(min-width:\s*769px\)[\s\S]*?\.panel\s*\{[\s\S]*?padding-top:\s*0;[\s\S]*?\}/
  );
  assert.doesNotMatch(css, /padding-top:\s*clamp\(0\.18rem,\s*0\.65vh,\s*0\.42rem\);/);
});
