import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("profile orbital menu renders center and edge buttons through BorderGlow", () => {
  const orbitalMenu = read("components/effects/Components/OrbitalMenu/OrbitalMenu.jsx");
  const orbitalMenuCss = read("components/effects/Components/OrbitalMenu/OrbitalMenu.css");

  assert.match(
    orbitalMenu,
    /import\s+BorderGlow\s+from\s+"@\/components\/ui\/BorderGlow"/
  );
  assert.match(
    orbitalMenu,
    /import\s+\{\s*fieldEdgeGlowStyle\s*\}\s+from\s+"@\/components\/ui\/GlowField"/
  );
  assert.match(orbitalMenu, /const\s+ORBIT_BUTTON_GLOW_PROPS\s*=\s*\{/);
  assert.match(orbitalMenu, /edgeOnly:\s*true/);
  assert.match(orbitalMenu, /glowIntensity:\s*0\.92/);
  assert.match(orbitalMenu, /glowRadius:\s*38/);
  assert.match(orbitalMenu, /const\s+ORBIT_BUTTON_GLOW_STYLE\s*=\s*\{[\s\S]*?\.{3}fieldEdgeGlowStyle/);
  assert.match(orbitalMenu, /glowColor:\s*"358 82 72"/);
  assert.match(orbitalMenu, /fillOpacity:\s*0/);
  assert.match(
    orbitalMenu,
    /<BorderGlow\s+as="button"[\s\S]*?style=\{ORBIT_BUTTON_GLOW_STYLE\}[\s\S]*?ui-glow-button-frame ui-glow-button-control profile-orbit-edge-glow profile-orbit-menu__item/
  );
  assert.match(orbitalMenu, /<span\s+className="profile-orbit-static-glow"\s+aria-hidden="true"\s*\/>/);
  assert.match(
    orbitalMenu,
    /<BorderGlow\s+ref=\{hubBtnRef\}\s+as="button"[\s\S]*?glowIntensity=\{0\.68\}[\s\S]*?glowRadius=\{42\}[\s\S]*?edgeSensitivity=\{20\}[\s\S]*?style=\{ORBIT_BUTTON_GLOW_STYLE\}[\s\S]*?ui-glow-button-frame ui-glow-button-control profile-orbit-edge-glow profile-orbit-menu__center/
  );
  assert.match(
    orbitalMenu,
    /<BorderGlow\s+as="button"[\s\S]*?style=\{ORBIT_BUTTON_GLOW_STYLE\}[\s\S]*?profile-orbit-edge-glow profile-orbit-mobile-action/
  );
  assert.match(
    orbitalMenu,
    /<BorderGlow\s+as="span"[\s\S]*?style=\{ORBIT_BUTTON_GLOW_STYLE\}[\s\S]*?profile-orbit-edge-glow profile-orbit-stack-bubble/
  );
  assert.match(
    orbitalMenuCss,
    /\.profile-orbit-menu__item\.profile-orbit-edge-glow\.dock-item\s*\{[\s\S]*?transform:\s*scale\(var\(--item-scale\)\)/
  );
  assert.match(
    orbitalMenuCss,
    /\.profile-orbit-mobile-action\.profile-orbit-edge-glow\.dock-item\[data-orbit-mobile-active="true"\]\s*\{[\s\S]*?--edge-proximity:\s*100/
  );
  assert.match(orbitalMenuCss, /--orbit-keypad-shadow-item-hover:/);
  assert.doesNotMatch(
    orbitalMenuCss,
    /\.profile-orbit-menu__item\.dock-item:is\(:hover, :focus-visible, :active\)\s*\{[\s\S]*?--edge-proximity:\s*100\s*!important/
  );
  assert.match(
    orbitalMenuCss,
    /\.profile-orbit-menu\.is-open[\s\S]*?\.profile-orbit-menu__item\.profile-orbit-edge-glow\.dock-item[\s\S]*?>\s*\.profile-orbit-static-glow\s*\{[\s\S]*?opacity:\s*0\.34/
  );
  assert.match(
    orbitalMenuCss,
    /\.profile-orbit-static-glow\s*\{[\s\S]*?0 0 22px rgba\(122,\s*58,\s*56,\s*0\.06\)/
  );
  assert.match(
    orbitalMenuCss,
    /\.profile-orbit-edge-glow\s*>\s*\[class\*="edgeLight"\]::before\s*\{[\s\S]*?0 0 62px 2px var\(--glow-color-20/
  );
  assert.match(
    orbitalMenuCss,
    /\.profile-orbit-menu__center\.profile-orbit-edge-glow\.dock-item:is\(:hover, :focus-visible, :active\)\s*\{[\s\S]*?var\(--orbit-button-shadow-center-hover/
  );
  assert.doesNotMatch(
    orbitalMenu,
    /profile-orbit-menu__center[\s\S]{0,500}<span\s+className="profile-orbit-static-glow"/
  );
});
