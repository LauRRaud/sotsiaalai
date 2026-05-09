import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";

function readCss() {
  return readFileSync(
    new URL("../../components/effects/Components/OrbitalMenu/OrbitalMenu.css", import.meta.url),
    "utf8"
  );
}

test("HC orbital menu buttons keep the night-mode surface over global HC controls", () => {
  const css = readCss();
  const hcNightSurfaceBlock = css.match(
    /:root\.theme-night[\s\S]*?html\[data-contrast="hc"\][\s\S]*?:is\([\s\S]*?\.profile-orbit-menu__item[\s\S]*?\)\.dock-item\s*\{([\s\S]*?)\n\}/
  );

  assert.ok(hcNightSurfaceBlock, "HC should share the night-mode orbital button surface block");
  assert.match(hcNightSurfaceBlock[1], /background:[\s\S]*!important/);
});

test("HC orbital menu restores the yellow edge glow suppressed by global HC controls", () => {
  const css = readCss();
  const hcEdgeGlowBlock = css.match(
    /html\[data-contrast="hc"\]\s+\.profile-email-dock-wrapper\.profile-orbit-menu-wrapper\s+\.profile-orbit-edge-glow\s*>\s*\[class\*="edgeLight"\]\s*\{([\s\S]*?)\n\}/
  );
  const hcEdgeGlowBeforeBlock = css.match(
    /html\[data-contrast="hc"\]\s+\.profile-email-dock-wrapper\.profile-orbit-menu-wrapper\s+\.profile-orbit-edge-glow\s*>\s*\[class\*="edgeLight"\]::before\s*\{([\s\S]*?)\n\}/
  );

  assert.ok(hcEdgeGlowBlock, "HC should explicitly restore orbital edge glow opacity");
  assert.match(hcEdgeGlowBlock[1], /opacity:[\s\S]*!important/);
  assert.ok(hcEdgeGlowBeforeBlock, "HC should explicitly restore orbital edge glow color");
  assert.match(hcEdgeGlowBeforeBlock[1], /rgba\(255,\s*234,\s*0/);
});
