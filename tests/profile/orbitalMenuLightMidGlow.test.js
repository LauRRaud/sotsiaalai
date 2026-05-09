import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";

function readCss(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("global light and mid button glow rules hide edgeLight by default", () => {
  const css = readCss("app/styles/components/glass.css");

  assert.match(
    css,
    /:root\.theme-light \.ui-glow-button-frame > \[class\*="edgeLight"\][\s\S]*?:root\.theme-mid \.ui-glow-button-frame > \[class\*="edgeLight"\][\s\S]*?display:\s*none\s*!important/
  );
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
