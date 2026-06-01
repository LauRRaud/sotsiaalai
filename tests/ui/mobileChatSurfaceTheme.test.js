import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { readMobileCssBundle } from "../helpers/mobileCssBundle.mjs";


function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("mobile chat uses one glass surface layer across themes", () => {
  const chatBody = read("components/alalehed/ChatBody.jsx");
  const mobileCss = readMobileCssBundle();

  assert.match(
    chatBody,
    /const useMaskedChatSurface =[\s\S]*?!workspaceOpen &&[\s\S]*?\(viewportIsMobile \|\|[\s\S]*?usesInputHoleSurface/
  );
  assert.match(
    mobileCss,
    /\.chat-page-shell\s+\.chat-container\[data-chat-layout="mobile"\]:not\(\.chat-container--workspace-open\)\s*\{[\s\S]*?background:\s*transparent !important;[\s\S]*?background-color:\s*transparent !important;[\s\S]*?background-image:\s*none !important;[\s\S]*?backdrop-filter:\s*none !important;/
  );
  assert.match(
    mobileCss,
    /\.chat-page-shell \.chat-container\[data-chat-layout="mobile"\] \.chat-mask-tilt-fallback\s*\{[\s\S]*?var\(--glass-ring-surface-bg,\s*var\(--glass-surface-bg,\s*rgba\(0,\s*0,\s*0,\s*0\.25\)\)\) !important;/
  );
});
