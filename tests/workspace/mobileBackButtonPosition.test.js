import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function readSource(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("workspace dashboard mobile back icon is not offset from the shared chat back anchor", () => {
  const workspaceSource = readSource("components/chat/WorkspacePanel.jsx");
  const chatTopNavSource = readSource("components/alalehed/chat/view/ChatMobileTopNav.jsx");
  const stylesSource = readSource("components/chat/WorkspacePanel.module.css");

  assert.match(
    workspaceSource,
    /className=\{cn\(glassPageBackTopLeftClassName,\s*styles\.backButton\)\}/
  );
  assert.match(
    chatTopNavSource,
    /className=\{cn\(\s*glassPageBackMobileBottomCenterClassName,[\s\S]*?"pointer-events-auto !z-\[123\] rounded-full"/
  );
  assert.match(
    stylesSource,
    /@media \(max-width:\s*768px\)[\s\S]*?\.backButton\s*\{[\s\S]*?position:\s*fixed/
  );
  assert.match(
    stylesSource,
    /@media \(max-width:\s*768px\)[\s\S]*?\.backButton\s*\{[\s\S]*?left:\s*calc\(env\(safe-area-inset-left,\s*0px\) \+ 0\.04rem - 1rem\)\s*!important/
  );
  assert.match(
    stylesSource,
    /@media \(max-width:\s*768px\)[\s\S]*?\.backButton\s*\{[\s\S]*?top:\s*calc\(env\(safe-area-inset-top,\s*0px\) \+ 0\.2rem - var\(--chat-pad-top,\s*1rem\)\)\s*!important/
  );

  assert.doesNotMatch(
    stylesSource,
    /@media \(max-width:\s*768px\)[\s\S]*?\.backButtonIcon\s*\{[\s\S]*?margin-(?:top|left):/
  );
});
