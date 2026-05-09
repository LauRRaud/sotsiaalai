import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function readSource(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("workspace dashboard uses left route tilt on mobile navigation", () => {
  const source = readSource("components/chat/WorkspacePanel.jsx");

  assert.match(source, /const MOBILE_VIEWPORT_QUERY = "\([^"]*max-width:\s*768px[^"]*\)"/);
  assert.match(source, /function resolveWorkspaceNavigationTiltDirection\(\)\s*\{/);
  assert.match(source, /return isMobileViewport \? "left" : "right";/);
  assert.match(
    source,
    /glassRingTilt:\s*resolveWorkspaceNavigationTiltDirection\(\)/
  );
});
