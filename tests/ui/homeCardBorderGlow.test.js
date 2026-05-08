import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("homepage primary cards use BorderGlow without stealing the logo surface pseudo-element", () => {
  const homePage = read("components/HomePage.jsx");
  const homeCss = read("app/styles/components/home.css");

  assert.match(
    homePage,
    /import\s+BorderGlow\s+from\s+"@\/components\/ui\/BorderGlow"/
  );
  assert.match(
    homePage,
    /import\s+\{\s*fieldEdgeGlowStyle\s*\}\s+from\s+"@\/components\/ui\/GlowField"/
  );
  assert.match(homePage, /const\s+HOME_CARD_GLOW_PROPS\s*=\s*\{/);
  assert.match(homePage, /const\s+homeCardFadeStyle\s*=\s*\{/);
  assert.match(homePage, /glowColor:\s*"358 82 72"/);
  assert.match(homePage, /glowIntensity:\s*0\.68/);
  assert.match(homePage, /glowRadius:\s*58/);
  assert.match(
    homePage,
    /style=\{shouldFadeLeft\s*\?\s*\{\s*...fieldEdgeGlowStyle,\s*...homeCardFadeStyle\s*\}\s*:\s*fieldEdgeGlowStyle\}/
  );
  assert.match(
    homePage,
    /style=\{shouldFadeRight\s*\?\s*\{\s*...fieldEdgeGlowStyle,\s*...homeCardFadeStyle\s*\}\s*:\s*fieldEdgeGlowStyle\}/
  );
  assert.match(
    homePage,
    /<BorderGlow\s+as="div"\s+edgeOnly[\s\S]*?ui-glow-button-frame ui-glow-button-control[\s\S]*?home-card-edge-glow[\s\S]*?glass-card-light[\s\S]*?<span\s+className="home-card-static-glow"[\s\S]*?<div\s+ref=\{setLeftCardEl\}\s+className="home-card-face-content[\s\S]*?before:bg-\[url\('\/logo\/kerahele\.svg'\)\]/
  );
  assert.match(
    homePage,
    /<BorderGlow\s+as="div"\s+edgeOnly[\s\S]*?home-card-edge-glow[\s\S]*?glass-card-dark[\s\S]*?<div\s+ref=\{setRightCardEl\}\s+className="home-card-face-content[\s\S]*?before:bg-\[url\('\/logo\/keratume\.svg'\)\]/
  );
  assert.match(
    homePage,
    /<BorderGlow\s+as="div"\s+edgeOnly[\s\S]*?home-card-edge-glow[\s\S]*?centered-back-left[\s\S]*?home-card-face-content[\s\S]*?before:bg-\[url\('\/logo\/kerahele\.svg'\)\]/
  );
  assert.match(
    homePage,
    /<BorderGlow\s+as="div"\s+edgeOnly[\s\S]*?home-card-edge-glow[\s\S]*?centered-back-right[\s\S]*?home-card-face-content[\s\S]*?before:bg-\[url\('\/logo\/keratume\.svg'\)\]/
  );
  assert.match(
    homeCss,
    /\.home-card-edge-glow\s*\{[\s\S]*?var\(--btn-primary-shadow-hover\)[\s\S]*?0 0 26px rgba\(255,\s*122,\s*126,\s*0\.07\)/
  );
  assert.match(
    homeCss,
    /\.home-card-static-glow\s*\{[\s\S]*?0 0 70px rgba\(122,\s*58,\s*56,\s*0\.12\)/
  );
  assert.match(
    homeCss,
    /\.home-card-edge-glow\s*>\s*\[class\*="edgeLight"\]::before\s*\{[\s\S]*?0 0 56px 2px var\(--glow-color-20/
  );
});
