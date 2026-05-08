import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("workspace icon waits for focused chat ring to return round before opening workspace", () => {
  const chatBody = read("components/alalehed/ChatBody.jsx");

  assert.match(chatBody, /WORKSPACE_FOCUS_RESET_OPEN_MS\s*=\s*720/);
  assert.match(chatBody, /workspaceOpenDelayTimerRef\s*=\s*useRef\(0\)/);
  assert.match(chatBody, /const shouldOpenAfterFocusReset[\s\S]*?!profileOpen[\s\S]*?!viewportIsMobile[\s\S]*?inputFocused/);
  assert.match(chatBody, /setInputFocused\(false\)[\s\S]*?shouldOpenAfterFocusReset[\s\S]*?window\.setTimeout\([\s\S]*?setWorkspaceOpen\(true\)[\s\S]*?WORKSPACE_FOCUS_RESET_OPEN_MS/);
});
