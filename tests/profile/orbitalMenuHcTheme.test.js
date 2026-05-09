import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";

function readCss(path = "../../components/effects/Components/OrbitalMenu/OrbitalMenu.css") {
  return readFileSync(
    new URL(path, import.meta.url),
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

test("HC orbital edge buttons keep the yellow item glow", () => {
  const css = readCss();

  assert.match(
    css,
    /html\[data-contrast="hc"\]\s+\.profile-email-dock-wrapper\.profile-orbit-menu-wrapper\s+\.profile-orbit-menu__item\.dock-item\s*\{\s*box-shadow:\s*var\(--orbit-keypad-shadow-item/
  );
  assert.match(
    css,
    /html\[data-contrast="hc"\]\s+\.profile-email-dock-wrapper\.profile-orbit-menu-wrapper\s+\.profile-orbit-menu__item\.dock-item\s*\{[\s\S]*?border:\s*none\s*!important/
  );
  assert.match(
    css,
    /html\[data-contrast="hc"\]\s+\.profile-email-dock-wrapper\.profile-orbit-menu-wrapper\s+\.profile-orbit-menu__item\.dock-item:is\(:hover,\s*:focus-visible,\s*:active\)\s*\{\s*box-shadow:\s*var\(--orbit-keypad-shadow-item-hover/
  );
});

test("global HC button resets do not override orbital menu controls", () => {
  const css = readCss("../../app/styles/theme/hc.css");
  const orbitControlExclusion =
    /:not\(\.profile-orbit-menu__item\)\s*:not\(\.profile-orbit-menu__center\)\s*:not\(\.profile-orbit-mobile-action\)\s*:not\(\.profile-orbit-stack-bubble\)/g;
  const matches = css.match(orbitControlExclusion) || [];

  assert.ok(
    matches.length >= 3,
    "HC generic button/glow reset rules should exclude orbital controls so their night surface and yellow glow remain visible"
  );
});

test("global HC button resets do not override chat rail controls", () => {
  const css = readCss("../../app/styles/theme/hc.css");

  assert.match(css, /:not\(\.chat-rail-icon-btn\)/);
  assert.match(
    css,
    /html\[data-contrast="hc"\] body :is\(\.chat-left-actions, \.chat-right-actions\)[\s\S]*?background:\s*transparent\s*!important/
  );
});
