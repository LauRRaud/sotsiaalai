import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  resolveMobileChatKeyboardOffset,
  resolveStableDisplayMode,
  resolveStableMobileAppHeight
} from "../../components/alalehed/chat/mobileViewportUtils.js";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

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

test("PWA app height stays stable while the software keyboard resizes the viewport", () => {
  const height = resolveStableMobileAppHeight({
    windowInnerHeight: 520,
    documentElementClientHeight: 520,
    visualViewportHeight: 500,
    visualViewportOffsetTop: 0,
    rawKeyboardOffset: 320,
    isEditable: true,
    stabilizeForKeyboard: true,
    previousStableLayoutHeight: 820
  });

  assert.equal(height, 820);
});

test("mobile app height follows the measured viewport outside keyboard stabilization", () => {
  const height = resolveStableMobileAppHeight({
    windowInnerHeight: 520,
    documentElementClientHeight: 520,
    visualViewportHeight: 500,
    visualViewportOffsetTop: 0,
    rawKeyboardOffset: 320,
    isEditable: true,
    stabilizeForKeyboard: false,
    previousStableLayoutHeight: 820
  });

  assert.equal(height, 520);
});

test("PWA display mode remains sticky for mobile chat input anchoring", () => {
  const viewportSetter = read("components/ViewportLayoutSetter.jsx");
  const mobileCss = read("app/styles/mobile.css");

  assert.match(viewportSetter, /sessionStorage\.setItem\(DISPLAY_MODE_STORAGE_KEY,\s*mode\)/);
  assert.match(viewportSetter, /data-display-mode-sticky/);
  assert.doesNotMatch(viewportSetter, /removeAttribute\("data-display-mode"\)/);
  assert.match(
    mobileCss,
    /data-display-mode-sticky="standalone"[\s\S]*?--chat-composer-mobile-bottom-base:\s*0\.5rem\s*!important/
  );
});
