import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("home about panel uses the shared edge glow layers", () => {
  const aboutSection = read("components/HomeSections/HomeAboutSection.jsx");
  const homeCss = read("app/styles/components/home.css");

  assert.match(
    aboutSection,
    /import\s+BorderGlow\s+from\s+"@\/components\/ui\/BorderGlow"/
  );
  assert.match(
    aboutSection,
    /import\s+\{\s*fieldEdgeGlowStyle\s*\}\s+from\s+"@\/components\/ui\/GlowField"/
  );
  assert.match(aboutSection, /const\s+HOME_ABOUT_PANEL_GLOW_PROPS\s*=\s*\{/);
  assert.match(aboutSection, /const\s+HOME_ABOUT_PANEL_GLOW_STYLE\s*=\s*\{[\s\S]*?\.{3}fieldEdgeGlowStyle/);
  assert.match(
    aboutSection,
    /<BorderGlow\s+as="div"\s+edgeOnly[\s\S]*?HOME_ABOUT_PANEL_GLOW_PROPS[\s\S]*?home-about-edge-glow/
  );
  assert.match(
    aboutSection,
    /<span\s+className="home-about-static-glow"\s+aria-hidden="true"\s*\/>/
  );
  assert.match(
    homeCss,
    /\.home-about-static-glow\s*\{[\s\S]*?0 0 72px rgba\(122,\s*58,\s*56,\s*0\.11\)/
  );
  assert.match(
    homeCss,
    /\.home-about-edge-glow\s*>\s*\[class\*="edgeLight"\]::before\s*\{[\s\S]*?0 0 56px 2px var\(--glow-color-20/
  );
});
