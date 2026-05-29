import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  resolveMobileChatKeyboardOffset,
  resolveMobileChatKeyboardVisibilityOffset,
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

test("mobile keyboard visibility stays active when visual viewport is panned", () => {
  const offset = resolveMobileChatKeyboardOffset({
    baselineViewportExtent: 820,
    baselineContainerHeight: 820,
    currentViewportExtent: 820,
    currentContainerHeight: 820,
    currentContainerBottom: 820,
    layoutViewportHeight: 820,
    visualViewportHeight: 500,
    visualViewportOffsetTop: 320
  });
  const visibleOffset = resolveMobileChatKeyboardVisibilityOffset({
    baselineViewportExtent: 820,
    layoutViewportHeight: 820,
    visualViewportHeight: 500,
    visualViewportOffsetTop: 320
  });

  assert.equal(offset, 0);
  assert.equal(visibleOffset, 320);
});

test("mobile app height can stay stable only when keyboard stabilization is explicitly enabled", () => {
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

test("mobile layout no longer applies PWA-specific display mode anchoring", () => {
  const viewportSetter = read("components/ViewportLayoutSetter.jsx");
  const mobileCss = read("app/styles/mobile.css");

  assert.match(viewportSetter, /function detectDisplayMode\(\)/);
  assert.match(viewportSetter, /matchMedia\?\.\("\(display-mode:\s*standalone\)"\)/);
  assert.match(viewportSetter, /setAttribute\("data-display-mode",\s*mode\)/);
  assert.match(viewportSetter, /removeAttribute\("data-display-mode-sticky"\)/);
  assert.doesNotMatch(viewportSetter, /sessionStorage\.setItem\(DISPLAY_MODE_STORAGE_KEY,\s*mode\)/);
  assert.doesNotMatch(
    mobileCss,
    /data-display-mode="standalone"|data-display-mode="fullscreen"|data-display-mode-sticky|mobile-pwa/
  );
});

test("mobile chat keyboard lift does not double-apply to scroll padding", () => {
  const mobileCss = read("app/styles/mobile.css");
  const conversationView = read("components/alalehed/chat/ConversationView.jsx");
  const chatBodyView = read("components/alalehed/chat/ChatBodyView.jsx");
  const scrollRule = mobileCss.match(
    /\.chat-page-shell \.chat-container\[data-chat-layout="mobile"\] \.chat-window__scroll\s*\{[\s\S]*?\n\s*\}/
  )?.[0] || "";
  const scrollPaddingClasses = conversationView.match(
    /\[padding:calc\([\s\S]*?\[scroll-padding-bottom:calc\([^\n]+/
  )?.[0] || "";

  assert.ok(scrollRule, "expected a mobile chat scroll rule");
  assert.doesNotMatch(scrollRule, /--chat-vk-offset/);
  assert.ok(scrollPaddingClasses, "expected chat scroll padding classes");
  assert.doesNotMatch(scrollPaddingClasses, /--chat-vk-offset/);
  assert.match(
    chatBodyView,
    /max-\[768px\]:min-h-\[var\(--glass-mobile-root-vh,100dvh\)\][\s\S]*?max-\[768px\]:h-\[var\(--glass-mobile-root-vh,100dvh\)\][\s\S]*?max-\[768px\]:max-h-\[var\(--glass-mobile-root-vh,100dvh\)\]/,
    "mobile chat shell should use the stable app height while the keyboard opens"
  );
});

test("mobile chat keyboard offset is monotonic while the keyboard is open", () => {
  const chatBody = read("components/alalehed/ChatBody.jsx");

  assert.match(chatBody, /const MOBILE_KEYBOARD_OFFSET_JITTER_PX = 10;/);
  assert.match(
    chatBody,
    /const keyboardStillOpen =[\s\S]*?rawOffset > MOBILE_KEYBOARD_CLOSE_THRESHOLD \|\|[\s\S]*?keyboardVisibleOffset > MOBILE_KEYBOARD_CLOSE_THRESHOLD;/
  );
  assert.match(
    chatBody,
    /if \(lastResolvedOffset > 0\) \{[\s\S]*?if \(keyboardStillOpen\) \{[\s\S]*?lastResolvedOffset = viewportPanned[\s\S]*?\? rawOffset[\s\S]*?: Math\.max\(lastResolvedOffset,\s*rawOffset\);/
  );
  assert.match(
    chatBody,
    /offset > 0 &&[\s\S]*?lastAppliedOffset > 0 &&[\s\S]*?Math\.abs\(offset - lastAppliedOffset\) < MOBILE_KEYBOARD_OFFSET_JITTER_PX/
  );
});
