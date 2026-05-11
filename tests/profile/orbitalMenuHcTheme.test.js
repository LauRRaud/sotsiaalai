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

test("HC orbital menu defines night keypad fills for center and edge buttons", () => {
  const css = readCss();
  const hcVarsBlock = css.match(
    /html\[data-contrast="hc"\]\s+\.profile-email-dock-wrapper\.profile-orbit-menu-wrapper\s*\{([\s\S]*?)\n\}/
  );
  const hcCenterBlock = css.match(
    /html\[data-contrast="hc"\]\s+\.profile-email-dock-wrapper\.profile-orbit-menu-wrapper\s+\.profile-orbit-menu__center\.dock-item\s*\{([\s\S]*?)\n\}/
  );

  assert.ok(hcVarsBlock, "HC orbital wrapper should define keypad fill variables");
  assert.match(hcVarsBlock[1], /--orbit-keypad-fill-center:/);
  assert.match(hcVarsBlock[1], /--orbit-keypad-fill:/);
  assert.match(hcVarsBlock[1], /--orbit-keypad-fill-item:/);
  assert.ok(hcCenterBlock, "HC center button should use the center keypad fill");
  assert.match(hcCenterBlock[1], /background:\s*var\(--orbit-keypad-fill-center,\s*var\(--orbit-keypad-fill\)\)/);
});

test("HC orbital item pseudo glow selector targets descendants", () => {
  const css = readCss();

  assert.doesNotMatch(
    css,
    /html\[data-contrast="hc"\]\s*\n\.profile-email-dock-wrapper\.profile-orbit-menu-wrapper/
  );
  assert.match(
    css,
    /html\[data-contrast="hc"\]\s+\.profile-email-dock-wrapper\.profile-orbit-menu-wrapper\s+\.profile-orbit-menu__item\.dock-item::before/
  );
});

test("BorderGlow HC reset preserves profile orbital night surfaces", () => {
  const css = readCss("../../components/ui/BorderGlow.module.css");

  assert.match(
    css,
    /:global\(html\[data-contrast="hc"\]\)\s+\.card:global\(\.profile-orbit-menu__item\),[\s\S]*?:global\(html\[data-contrast="hc"\]\)\s+\.card:global\(\.profile-orbit-mobile-action\),[\s\S]*?:global\(html\[data-contrast="hc"\]\)\s+\.card:global\(\.profile-orbit-stack-bubble\)\s*\{[\s\S]*?background:\s*var\(--orbit-keypad-fill-item,\s*var\(--orbit-keypad-fill,\s*transparent\)\)\s*!important/
  );
  assert.match(
    css,
    /:global\(html\[data-contrast="hc"\]\)\s+\.card:global\(\.profile-orbit-menu__center\)\s*\{[\s\S]*?background:\s*var\(--orbit-keypad-fill-center,\s*var\(--orbit-keypad-fill,\s*transparent\)\)\s*!important/
  );
});

test("global HC profile orbital rules expose night keypad fills", () => {
  const css = readCss("../../app/styles/theme/hc.css");
  const hcProfileWrapperBlock = css.match(
    /html\[data-contrast="hc"\]\s+body\s+\.profile-email-dock-wrapper\.profile-orbit-menu-wrapper\s*\{([\s\S]*?)\n\}/
  );
  const hcProfileCenterBlock = css.match(
    /html\[data-contrast="hc"\]\s+body\s+\.profile-email-dock-wrapper\.profile-orbit-menu-wrapper\s+\.profile-orbit-menu__center\.dock-item\s*\{([\s\S]*?)\n\}/
  );

  assert.ok(hcProfileWrapperBlock, "global HC profile orbital wrapper should define theme variables");
  assert.match(hcProfileWrapperBlock[1], /--orbit-keypad-fill-center:/);
  assert.match(hcProfileWrapperBlock[1], /--orbit-keypad-fill:/);
  assert.match(hcProfileWrapperBlock[1], /--orbit-keypad-fill-item:/);
  assert.ok(hcProfileCenterBlock, "global HC profile center rule should exist");
  assert.match(hcProfileCenterBlock[1], /background:\s*var\(--orbit-keypad-fill-center,\s*var\(--orbit-keypad-fill\)\)\s*!important/);
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

test("dark orbital menu edge glow stays red while HC edge glow is yellow", () => {
  const css = readCss();
  const darkEdgeBeforeBlock = css.match(
    /:root:not\(\.theme-light\):not\(\.theme-mid\):not\(\.theme-night\):not\(\[data-contrast="hc"\]\)[\s\S]*?:root\.theme-night[\s\S]*?\.profile-orbit-menu__item\.dock-item::before\s*\{([\s\S]*?)\n\}/
  );
  const hcEdgeGlowBeforeBlock = css.match(
    /html\[data-contrast="hc"\]\s+\.profile-email-dock-wrapper\.profile-orbit-menu-wrapper\s+\.profile-orbit-edge-glow\s*>\s*\[class\*="edgeLight"\]::before\s*\{([\s\S]*?)\n\}/
  );

  assert.ok(darkEdgeBeforeBlock, "dark and night orbital item edge pseudo glow should be defined");
  assert.match(darkEdgeBeforeBlock[1], /rgba\(255,\s*122,\s*126/);
  assert.doesNotMatch(darkEdgeBeforeBlock[1], /rgba\(255,\s*234,\s*0/);
  assert.ok(hcEdgeGlowBeforeBlock, "HC orbital edgeLight glow should be defined");
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
