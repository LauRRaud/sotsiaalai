import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("mobile workspace back button compensates for nested chat ring padding", () => {
  const styles = read("components/chat/WorkspacePanel.module.css");

  assert.match(
    styles,
    /\.backButton\s*\{[\s\S]*?left:\s*calc\(env\(safe-area-inset-left,\s*0px\)\s*\+\s*0\.04rem\s*-\s*1rem\)\s*!important;/
  );
  assert.match(
    styles,
    /\.backButton\s*\{[\s\S]*?top:\s*calc\(env\(safe-area-inset-top,\s*0px\)\s*\+\s*0\.2rem\s*-\s*var\(--chat-pad-top,\s*var\(--glass-ring-pad-top,\s*0px\)\)\)\s*!important;/
  );
});

test("workspace title keeps the shared subpage vertical rhythm", () => {
  const styles = read("components/chat/WorkspacePanel.module.css");

  assert.match(styles, /\.title\s*\{[\s\S]*?margin-top:\s*clamp\(2\.15rem,\s*5\.4vh,\s*3\.25rem\)\s*!important;/);
  assert.match(styles, /@media\s*\(max-width:\s*768px\)\s*\{[\s\S]*?\.title\s*\{[\s\S]*?margin-top:\s*clamp\(0\.52rem,\s*1\.45vh,\s*0\.72rem\)\s*!important;/);
  assert.doesNotMatch(styles, /margin-top:\s*clamp\(0\.08rem,\s*0\.7vh,\s*0\.28rem\)\s*!important;/);
});
