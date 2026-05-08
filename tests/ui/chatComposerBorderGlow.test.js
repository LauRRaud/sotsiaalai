import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("chat composer supports opt-in edge-only BorderGlow on the input shell", () => {
  const composer = read("components/alalehed/chat/ChatComposer.jsx");
  const bodyView = read("components/alalehed/chat/ChatBodyView.jsx");

  assert.match(
    composer,
    /import\s+BorderGlow\s+from\s+"@\/components\/ui\/BorderGlow"/
  );
  assert.match(composer, /inputGlow = false/);
  assert.match(composer, /className=\{inputBarShellClassName\}/);
  assert.match(composer, /chat-composer-glow-shell/);
  assert.match(composer, /backgroundColor="transparent"/);
  assert.match(composer, /edgeOnly/);
  assert.match(composer, /glowColor="358 82 72"/);
  assert.match(composer, /edgeSensitivity=\{30\}/);
  assert.match(composer, /glowRadius=\{42\}/);
  assert.match(composer, /glowIntensity=\{0\.62\}/);
  assert.match(composer, /coneSpread=\{20\}/);
  assert.match(composer, /fillOpacity=\{0\}/);
  assert.doesNotMatch(composer, /"--edge-only-hot-end"/);
  assert.match(bodyView, /hideTools=\{hideComposerTools\}\s+inputGlow\s+placeholderText/);
});

test("chat composer glow shell owns the visible input chrome on the chat page", () => {
  const css = read("app/styles/components/chat-focus.css");

  assert.match(css, /\.chat-composer-glow-shell/);
  assert.match(
    css,
    /\.chat-page-shell\s+\.chat-composer-glow-shell\s*\{[\s\S]*?background:\s*transparent\s*!important/
  );
  assert.match(
    css,
    /\.chat-page-shell\s+\.chat-composer-glow-shell\s*\{[\s\S]*?var\(--chat-under-glow\)\s*!important/
  );
  assert.match(
    css,
    /:root:not\(\.theme-light\):not\(\.theme-mid\)\s+\.chat-page-shell\s+\.chat-composer-glow-shell:hover\s*\{[\s\S]*?background:\s*transparent\s*!important/
  );
  assert.match(
    css,
    /:root:not\(\.theme-light\):not\(\.theme-mid\)\s+\.chat-page-shell\s+\.chat-composer-glow-shell:hover\s*\{[\s\S]*?rgba\(255,\s*122,\s*126,\s*0\.38\)[\s\S]*?var\(--chat-under-glow-strong\)\s*!important/
  );
  assert.match(
    css,
    /\.chat-page-shell\s+\.chat-composer-glow-shell:focus-within:not\(:hover\)\s*>\s*\[class\*="edgeLight"\][\s\S]*?opacity:\s*0\s*!important/
  );
  assert.match(
    css,
    /html\[data-contrast="hc"\]\s+\.chat-composer-glow-shell[\s\S]*?--glow-color:\s*rgba\(255,\s*234,\s*0,\s*0\.64\)\s*!important/
  );
  assert.match(
    css,
    /html\[data-contrast="hc"\]\s+\.chat-page-shell\s+\.chat-composer-glow-shell:hover[\s\S]*?rgba\(255,\s*234,\s*0,\s*0\.72\)/
  );
  assert.match(
    css,
    /:root\.theme-light\s+\.chat-page-shell\s+\.chat-composer-glow-shell\s*\{[\s\S]*?0 5px 12px rgba\(82,\s*50,\s*46,\s*0\.045\)/
  );
  assert.match(
    css,
    /:root\.theme-light\s+\.chat-page-shell\s+\.chat-composer-glow-shell:hover\s*\{[\s\S]*?--edge-proximity:\s*100/
  );
  assert.doesNotMatch(
    css,
    /:root\.theme-light[\s\S]{0,260}\.chat-container--input-focus\s+\.chat-composer-glow-shell[\s\S]{0,180}box-shadow/
  );
  assert.doesNotMatch(
    css,
    /:root\.theme-light[\s\S]{0,300}:has\(\.chat-inputbar:focus-within\)\s+\.chat-composer-glow-shell[\s\S]{0,180}box-shadow/
  );
  assert.match(
    css,
    /:root\.theme-light\s+\.chat-page-shell\s+\.chat-composer-glow-shell\s*>\s*\[class\*="edgeLight"\][\s\S]*?opacity:\s*calc\(0\.36/
  );
  assert.match(
    css,
    /:root\.theme-light\s+\.chat-page-shell\s+\.chat-composer-glow-shell:hover\s*>\s*\[class\*="edgeLight"\]\s*\{[\s\S]*?opacity:\s*0\.36\s*!important/
  );
  assert.match(
    css,
    /:root\.theme-light\s+\.chat-page-shell\s+\.chat-composer-glow-shell:focus-within:not\(:hover\)\s*>\s*\[class\*="edgeLight"\],[\s\S]*?opacity:\s*0\s*!important/
  );
  assert.doesNotMatch(css, /\.chat-page-shell\s+\.chat-composer-glow-shell::after/);
  assert.match(
    css,
    /\.chat-composer-glow-shell\s+\.chat-inputbar[\s\S]*?background:\s*transparent\s*!important/
  );
  assert.match(
    css,
    /\.chat-composer-glow-shell\s+\.chat-inputbar[\s\S]*?border:\s*0\s*!important/
  );
});

test("chat send button exposes its own edge glow on the chat page", () => {
  const composer = read("components/alalehed/chat/ChatComposer.jsx");
  const button = read("components/ui/Button.jsx");
  const css = read("app/styles/components/chat-focus.css");

  assert.match(composer, /chat-send-btn invite-primary-btn/);
  assert.match(button, /ui-glow-button-frame ui-glow-button-control/);
  assert.match(
    css,
    /\.chat-page-shell\s+\.chat-inputbar\s+\.chat-send-btn\.ui-glow-button-frame\s*\{[\s\S]*?overflow:\s*visible\s*!important/
  );
  assert.match(
    css,
    /:root\.theme-light\s+\.chat-page-shell\s+\.chat-inputbar\s+\.chat-send-btn\.ui-glow-button-frame\s*>\s*\[class\*="edgeLight"\],[\s\S]*?:root\.theme-mid\s+\.chat-page-shell\s+\.chat-inputbar\s+\.chat-send-btn\.ui-glow-button-frame\s*>\s*\[class\*="edgeLight"\]\s*\{[\s\S]*?display:\s*block\s*!important/
  );
  assert.match(
    css,
    /\.chat-page-shell\s+\.chat-inputbar\s+\.chat-send-btn\.ui-glow-button-frame:is\(:hover,\s*:focus-visible\)\s*>\s*\[class\*="edgeLight"\]\s*\{[\s\S]*?opacity:\s*0\.42\s*!important/
  );
  assert.match(
    css,
    /\.chat-page-shell\s+\.chat-inputbar\s+\.chat-send-btn\.ui-glow-button-frame:is\(:hover,\s*:focus-visible\)\s*\{[\s\S]*?--edge-proximity:\s*100/
  );
});
