import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";

function readCss(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("light and mid glow controls keep the dynamic edge layer enabled", () => {
  const css = readCss("app/styles/components/glass.css");

  for (const control of [
    "ui-glow-button-frame",
    "ui-glow-option-card-frame",
    "ui-glow-field",
  ]) {
    const block = css.match(
      new RegExp(
        `:root\\.theme-light \\.${control} > \\[class\\*="edgeLight"\\][\\s\\S]*?:root\\.theme-mid \\.${control} > \\[class\\*="edgeLight"\\][\\s\\S]*?\\n\\}`
      )
    );

    assert.ok(block, `${control} should define light/mid edgeLight display`);
    assert.match(block[0], /display:\s*block\s*!important/);
    assert.doesNotMatch(block[0], /display:\s*none\s*!important/);
  }
});

test("light and mid hover primes full-edge glow before pointer tracking takes over", () => {
  const css = readCss("app/styles/components/glass.css");

  for (const control of [
    "ui-glow-button-frame",
    "ui-glow-option-card-frame",
    "ui-glow-field",
  ]) {
    const hoverBlock = css.match(
      new RegExp(
        `:root\\.theme-light \\.${control}:hover[\\s\\S]*?:root\\.theme-mid \\.${control}:hover[\\s\\S]*?\\n\\}`
      )
    );

    assert.ok(hoverBlock, `${control} should define light/mid hover priming`);
    assert.match(hoverBlock[0], /--edge-proximity:\s*100/);
    assert.match(hoverBlock[0], /--cursor-angle:\s*90deg/);
  }
});

test("option card glow transitions use the same slow easing as other glow controls", () => {
  const source = readCss("components/ui/OptionCard.jsx");

  assert.match(source, /duration-\[560ms\]/);
  assert.match(source, /cubic-bezier\(0\.22,0\.61,0\.36,1\)/);
  assert.doesNotMatch(
    source.match(/const baseCard = "[\s\S]*?";/)?.[0] || "",
    /duration-150 ease-out/
  );
});
