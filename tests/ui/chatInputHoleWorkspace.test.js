import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("chat input hole mask is disabled while the workspace face unmounts the composer", () => {
  const chatBody = read("components/alalehed/ChatBody.jsx");
  const hookCallStart = chatBody.indexOf("useChatInputHoleMask({");
  assert.notEqual(hookCallStart, -1);

  const hookCallEnd = chatBody.indexOf("  });", hookCallStart);
  assert.notEqual(hookCallEnd, -1);

  const hookCall = chatBody.slice(hookCallStart, hookCallEnd);
  assert.match(hookCall, /enabled:[\s\S]*?!profileOpen[\s\S]*?&&[\s\S]*?!workspaceOpen/);
});
