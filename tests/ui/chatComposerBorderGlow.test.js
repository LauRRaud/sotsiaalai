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
  assert.match(composer, /glowIntensity=\{1\.05\}/);
  assert.match(composer, /coneSpread=\{20\}/);
  assert.match(composer, /fillOpacity=\{0\}/);
  assert.match(bodyView, /inputGlow=\{!isLightTheme\}/);
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
    /\.chat-composer-glow-shell\s+\.chat-inputbar[\s\S]*?background:\s*transparent\s*!important/
  );
  assert.match(
    css,
    /\.chat-composer-glow-shell\s+\.chat-inputbar[\s\S]*?border:\s*0\s*!important/
  );
});
