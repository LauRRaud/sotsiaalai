import assert from "node:assert/strict";
import test from "node:test";

import {
  resolveMobileChatKeyboardOffset,
  resolveStableDisplayMode
} from "../../components/alalehed/chat/mobileViewportUtils.js";

test("mobile chat keyboard offset uses visible viewport overlap even when container height changes", () => {
  const offset = resolveMobileChatKeyboardOffset({
    baselineViewportExtent: 820,
    baselineContainerHeight: 820,
    currentViewportExtent: 500,
    currentContainerHeight: 500,
    currentContainerBottom: 820,
    layoutViewportHeight: 820
  });

  assert.equal(offset, 320);
});

test("mobile chat keyboard offset stays zero when layout already fits above the keyboard", () => {
  const offset = resolveMobileChatKeyboardOffset({
    baselineViewportExtent: 820,
    baselineContainerHeight: 820,
    currentViewportExtent: 500,
    currentContainerHeight: 500,
    currentContainerBottom: 500,
    layoutViewportHeight: 820
  });

  assert.equal(offset, 0);
});

test("standalone display mode is sticky across transient viewport resize reports", () => {
  assert.equal(resolveStableDisplayMode("standalone", "browser"), "standalone");
  assert.equal(resolveStableDisplayMode("browser", "standalone"), "standalone");
});
