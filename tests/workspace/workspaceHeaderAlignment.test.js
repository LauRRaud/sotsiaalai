import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("workspace dashboard keeps the measured desktop header top padding contract", () => {
  const css = readFileSync(new URL("../../components/chat/WorkspacePanel.module.css", import.meta.url), "utf8");

  assert.match(
    css,
    /@media \(min-width:\s*769px\)[\s\S]*?\.panel\s*\{[\s\S]*?padding-top:\s*clamp\(0\.18rem,\s*0\.65vh,\s*0\.42rem\);[\s\S]*?\}/
  );
  assert.match(
    css,
    /@media \(min-width:\s*769px\)[\s\S]*?\.backButton\s*\{[\s\S]*?top:\s*var\(--workspace-subpage-back-top,\s*0\.55rem\)\s*!important;[\s\S]*?\}/
  );
});
