import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";

function readCss(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("global light and mid button glow rules keep edgeLight available", () => {
  const css = readCss("app/styles/components/glass.css");
  const block = css.match(
    /:root\.theme-light \.ui-glow-button-frame > \.edgeLight,[\s\S]*?:root\.theme-mid \.ui-glow-button-frame > \[class\*="edgeLight"\]\s*\{([\s\S]*?)\n\}/
  );

  assert.ok(block, "light/mid button glow edgeLight rule should exist");
  assert.match(block[1], /display:\s*block\s*!important/);
  assert.doesNotMatch(block[1], /display:\s*none\s*!important/);
});

test("profile orbital menu restores light and mid edgeLight with darker red glow", () => {
  const css = readCss("components/effects/Components/OrbitalMenu/OrbitalMenu.css");
  const lightMidDisplayBlock = css.match(
    /:root\.theme-light:not\(\.theme-mid\)[\s\S]*?\.profile-orbit-edge-glow\s*>\s*\[class\*="edgeLight"\][\s\S]*?:root\.theme-mid[\s\S]*?\.profile-orbit-edge-glow\s*>\s*\[class\*="edgeLight"\]\s*\{([\s\S]*?)\n\}/
  );
  const lightMidColorBlock = css.match(
    /:root\.theme-light:not\(\.theme-mid\)[\s\S]*?\.profile-orbit-edge-glow\s*>\s*\[class\*="edgeLight"\]::before[\s\S]*?:root\.theme-mid[\s\S]*?\.profile-orbit-edge-glow\s*>\s*\[class\*="edgeLight"\]::before\s*\{([\s\S]*?)\n\}/
  );
  const staticGlowBlock = css.match(
    /:root\.theme-light:not\(\.theme-mid\)[\s\S]*?\.profile-orbit-static-glow[\s\S]*?:root\.theme-mid[\s\S]*?\.profile-orbit-static-glow\s*\{([\s\S]*?)\n\}/
  );

  assert.ok(lightMidDisplayBlock, "orbital menu should override the global light/mid display:none edgeLight rule");
  assert.match(lightMidDisplayBlock[1], /display:\s*block\s*!important/);
  assert.match(lightMidDisplayBlock[1], /opacity:[\s\S]*!important/);
  assert.ok(lightMidColorBlock, "orbital menu should define light/mid edge glow colors");
  assert.match(lightMidColorBlock[1], /rgba\(122,\s*58,\s*56/);
  assert.ok(staticGlowBlock, "orbital menu should define a stronger light/mid static glow");
  assert.match(staticGlowBlock[1], /rgba\(122,\s*58,\s*56/);
});

test("profile orbital menu clears red edge glow when items are not hovered", () => {
  const css = readCss("components/effects/Components/OrbitalMenu/OrbitalMenu.css");
  const openStaticBlock = css.match(
    /\.profile-orbit-menu\.is-open[\s\S]*?\.profile-orbit-menu__item\.profile-orbit-edge-glow\.dock-item[\s\S]*?>\s*\.profile-orbit-static-glow\s*\{([\s\S]*?)\n\}/
  );
  const hoverStaticBlock = css.match(
    /:is\(\.profile-orbit-menu__item,\s*\.profile-orbit-mobile-action,\s*\.profile-orbit-stack-bubble\)\.profile-orbit-edge-glow\.dock-item:is\(:hover,\s*:focus-visible,\s*:active,\s*\[data-orbit-mobile-active="true"\]\)[\s\S]*?>\s*\.profile-orbit-static-glow\s*\{([\s\S]*?)\n\}/
  );
  const idleEdgeLightBlock = css.match(
    /:root:not\(\[data-contrast="hc"\]\)[\s\S]*?\.profile-orbit-edge-glow\.dock-item:not\(:hover\):not\(:focus-visible\):not\(:active\):not\(\[data-orbit-mobile-active="true"\]\)[\s\S]*?>\s*\[class\*="edgeLight"\]\s*\{([\s\S]*?)\n\}/
  );

  assert.ok(openStaticBlock, "open orbital menu items should explicitly clear idle static glow");
  assert.match(openStaticBlock[1], /opacity:\s*0\s*;/);
  assert.ok(hoverStaticBlock, "hovered orbital menu items should still show static glow");
  assert.match(hoverStaticBlock[1], /opacity:\s*0\.66\s*;/);
  assert.ok(idleEdgeLightBlock, "idle orbital menu items should reset pointer edgeLight");
  assert.match(idleEdgeLightBlock[1], /opacity:\s*0\s*!important/);
});
