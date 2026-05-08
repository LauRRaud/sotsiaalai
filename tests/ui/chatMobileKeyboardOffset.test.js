import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("mobile chat keyboard offset uses a pre-focus viewport baseline", () => {
  const chatBody = read("components/alalehed/ChatBody.jsx");

  assert.match(chatBody, /mobileKeyboardBaselineRef\s*=\s*useRef/);
  assert.match(chatBody, /node\.contains\(active\)\s*&&\s*isEditableElement\(active\)/);
  assert.match(chatBody, /mobileKeyboardBaselineRef\.current\s*=\s*\{[\s\S]*?viewportExtent[\s\S]*?containerHeight[\s\S]*?\}/);
  assert.match(chatBody, /storedBaseline\.viewportExtent/);
  assert.match(chatBody, /storedBaseline\.containerHeight/);
});

test("mobile chat keyboard offset keeps the iOS visualViewport fallback", () => {
  const chatBody = read("components/alalehed/ChatBody.jsx");

  assert.match(chatBody, /const layoutViewportOffset\s*=\s*vv/);
  assert.match(chatBody, /window\.innerHeight[\s\S]*?vv\.height[\s\S]*?vv\.offsetTop/);
  assert.match(chatBody, /const rawOffset\s*=\s*Math\.max\([\s\S]*?layoutViewportOffset[\s\S]*?baselineViewportExtent - currentExtent/);
  assert.match(chatBody, /node\.style\.setProperty\("--chat-vk-offset", `\$\{offset\}px`\)/);
});
