import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";

function readCss(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

function themeWrapperBlock(css, selector) {
  const match = css.match(new RegExp(`${selector}[\\s\\S]*?\\{([\\s\\S]*?)\\n\\}`));
  assert.ok(match, `${selector} wrapper variables should exist`);
  return match[1];
}

test("light orbital center hover uses a dedicated compact shadow token like mid", () => {
  const css = readCss("components/effects/Components/OrbitalMenu/OrbitalMenu.css");
  const lightBlock = themeWrapperBlock(
    css,
    String.raw`:root\.theme-light:not\(\.theme-mid\)\s+\.profile-email-dock-wrapper\.profile-orbit-menu-wrapper`
  );
  const midBlock = themeWrapperBlock(
    css,
    String.raw`:root\.theme-mid\s+\.profile-email-dock-wrapper\.profile-orbit-menu-wrapper`
  );
  const centerHoverRule = css.match(
    /:root:not\(\[data-contrast="hc"\]\)[\s\S]*?\.profile-orbit-menu__center\.profile-orbit-edge-glow\.dock-item:is\(:hover,\s*:focus-visible,\s*:active\)\s*\{([\s\S]*?)\n\}/
  );

  assert.match(midBlock, /--orbit-button-shadow-center-hover:/);
  assert.match(lightBlock, /--orbit-button-shadow-center-hover:/);
  assert.doesNotMatch(
    lightBlock,
    /--orbit-button-shadow-center-hover:[\s\S]*?0\s+16px\s+30px/,
    "light hover shadow should not reuse the wide resting fallback shadow"
  );
  assert.ok(centerHoverRule, "edge-glow center hover rule should exist");
  assert.match(
    centerHoverRule[1],
    /box-shadow:\s*var\(--orbit-button-shadow-center-hover,\s*var\(--orbit-button-shadow-center\)\)\s*!important/
  );
});

test("global glow button idle shadow does not override orbital center shadow", () => {
  const css = readCss("app/styles/shared/ui-glow.css");
  const idleGlowRule = css.match(
    /(^:root\.theme-light \.ui-glow-button-frame[^\n]*,\r?\n:root\.theme-mid \.ui-glow-button-frame[^\n]*)\s*\{\s*box-shadow:\s*([\s\S]*?var\(--btn-primary-shadow\)[\s\S]*?)\n\}/m
  );

  assert.ok(idleGlowRule, "light/mid ui-glow idle shadow rule should exist");
  assert.match(idleGlowRule[1], /:not\(\.profile-orbit-menu__center\)/);
  assert.match(idleGlowRule[1], /:not\(\.profile-orbit-edge-glow\)/);
  assert.match(idleGlowRule[2], /var\(--btn-primary-shadow\)/);
});
