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
  assert.match(composer, /glowRadius=\{46\}/);
  assert.match(composer, /glowIntensity=\{0\.92\}/);
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
    /\.chat-page-shell\s+\.chat-composer-glow-shell:hover,[\s\S]*?\.chat-composer-glow-shell:focus-within\s*\{[\s\S]*?background:\s*transparent\s*!important/
  );
  assert.match(
    css,
    /\.chat-page-shell\s+\.chat-composer-glow-shell:hover,[\s\S]*?\.chat-composer-glow-shell:focus-within\s*\{[\s\S]*?var\(--chat-under-glow-strong\)\s*!important/
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
