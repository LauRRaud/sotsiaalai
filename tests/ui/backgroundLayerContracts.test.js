import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";

const source = readFileSync(
  new URL("../../components/backgrounds/BackgroundLayer.jsx", import.meta.url),
  "utf8"
);
const colorBendsSource = readFileSync(
  new URL("../../components/backgrounds/ColorBends.jsx", import.meta.url),
  "utf8"
);
const backgroundCss = readFileSync(
  new URL("../../app/styles/base/backgrounds.css", import.meta.url),
  "utf8"
);
const accessibilityProviderSource = readFileSync(
  new URL("../../components/accessibility/AccessibilityProvider.jsx", import.meta.url),
  "utf8"
);

function setEntries(name) {
  const match = source.match(new RegExp(`const ${name} = new Set\\(\\[([\\s\\S]*?)\\]\\);`));
  assert.ok(match, `${name} set must exist`);
  return [...match[1].matchAll(/"([^"]+)"/g)].map((entry) => entry[1]);
}

test("service map keeps the shared color background while excluding particles", () => {
  assert.ok(!setEntries("COLOR_BENDS_EXCLUDED_PATHS").includes("/teenusekaart"));
  assert.ok(setEntries("PARTICLES_EXCLUDED_PATHS").includes("/teenusekaart"));
  assert.ok(!setEntries("BACKGROUND_LAYER_EXCLUDED_PATHS").includes("/teenusekaart"));
});

test("documents and agent mode keep color bends visible", () => {
  assert.ok(!setEntries("COLOR_BENDS_EXCLUDED_PATHS").includes("/documents"));
  assert.ok(!setEntries("COLOR_BENDS_EXCLUDED_PATHS").includes("/dokreziim"));
  assert.ok(!setEntries("MOBILE_COLOR_BENDS_READY_PATHS").includes("/documents"));
  assert.ok(!setEntries("MOBILE_COLOR_BENDS_READY_PATHS").includes("/dokreziim"));
});

test("covision keeps color bends while the glass corner glow stays on the surface edge", () => {
  assert.ok(!setEntries("COLOR_BENDS_EXCLUDED_PATHS").includes("/kovisioon"));
  assert.ok(!setEntries("BACKGROUND_LAYER_EXCLUDED_PATHS").includes("/kovisioon"));
});

test("light theme uses dark color bends with extra transparency", () => {
  assert.match(source, /const COLOR_BENDS_OPACITY_LIGHT = 0\.77;/);
  assert.doesNotMatch(source, /effectiveTheme === "light"\s*\?\s*\["#a06861"\]/);
  assert.match(
    source,
    /const colorBendsColors =\s*isHighContrast\s*\?\s*\["#ffea00"\]\s*:\s*effectiveTheme === "mono"\s*\?\s*\["#3d3d3d"\]\s*:\s*effectiveTheme === "mid"\s*\?\s*\["#794f4c"\]\s*:\s*\["#7e4442"\];/
  );
  assert.match(
    source,
    /const colorBendsOpacity =\s*isHighContrast\s*\?\s*COLOR_BENDS_OPACITY_HC\s*:\s*effectiveTheme === "light"\s*\?\s*COLOR_BENDS_OPACITY_LIGHT\s*:\s*effectiveTheme === "mono"\s*\?\s*COLOR_BENDS_OPACITY_MONO\s*:\s*effectiveTheme === "mid"\s*\?\s*COLOR_BENDS_OPACITY_FULL\s*:\s*COLOR_BENDS_OPACITY_DEFAULT;/
  );
});

test("high contrast color bends are yellow and independent of mono theme", () => {
  assert.match(source, /const COLOR_BENDS_OPACITY_HC = 0\.24;/);
  assert.match(source, /const readDomContrast = \(\) =>/);
  assert.match(source, /const \[domContrast, setDomContrast\] = useState\(readDomContrast\);/);
  assert.match(source, /setDomContrast\(html\.getAttribute\("data-contrast"\) \|\| "normal"\);/);
  assert.match(source, /const liveDomContrast = readDomContrast\(\);/);
  assert.match(source, /const effectiveContrast = liveDomContrast \?\? domContrast \?\? prefs\?\.contrast \?\? "normal";/);
  assert.match(source, /const isHighContrast = effectiveContrast === "hc";/);
  assert.match(
    source,
    /isHighContrast\s*\?\s*\["#ffea00"\]\s*:\s*effectiveTheme === "mono"\s*\?\s*\["#3d3d3d"\]\s*:\s*effectiveTheme === "mid"\s*\?\s*\["#794f4c"\]\s*:\s*\["#7e4442"\]/
  );
  assert.match(
    source,
    /const colorBendsOpacity =\s*isHighContrast\s*\?\s*COLOR_BENDS_OPACITY_HC\s*:\s*effectiveTheme === "light"/
  );
});

test("color bends do not render one frame at fallback strength", () => {
  assert.match(source, /const \[mobileBendsVisible, setMobileBendsVisible\] = useState\(true\);/);
  assert.doesNotMatch(source, /setMobileBendsVisible\(false\)/);
  assert.match(source, /style=\{\{\s*"--saai-bends-opacity": colorBendsOpacity\s*\}\}/);
  assert.match(backgroundCss, /html\[data-theme-switching="1"\]\s+\[data-bg-layer\]\s+\.bg-bends-layer\s*\{[\s\S]*?transition:\s*none\s*!important;/);
  assert.match(accessibilityProviderSource, /const hadContrast = html\.getAttribute\("data-contrast"\) \|\| DEFAULT_PREFS\.contrast;/);
  assert.match(accessibilityProviderSource, /hadContrast !== nextContrast \|\|/);
  assert.match(colorBendsSource, /import \{ useEffect, useLayoutEffect, useRef \} from "react";/);
  assert.match(colorBendsSource, /function applyColorUniforms\(material, colors\)/);
  assert.match(
    colorBendsSource,
    /materialRef\.current = material;\s*applyColorUniforms\(material, colorsRef\.current\);/
  );
});

test("color bends fail closed when WebGL shader setup or rendering breaks", () => {
  assert.match(colorBendsSource, /renderer\.compile\(scene, camera\);/);
  assert.match(colorBendsSource, /console\.warn\("ColorBends disabled after a WebGL renderer failure\."/);
  assert.match(colorBendsSource, /try\s*\{\s*renderer\.render\(scene, camera\);\s*\}\s*catch \(error\) \{\s*disableRenderer\(error\);\s*\}/);
  assert.match(colorBendsSource, /float resolveMonoChannel\(vec2 baseQ, float t, float channelOffset\)/);
});

test("homepage color bends still fade on scroll when motion is reduced", () => {
  assert.match(
    source,
    /el\.style\.setProperty\("--saai-bends-opacity", String\(colorBendsOpacity\)\);[\s\S]*if \(!isHomepage\) return;[\s\S]*const bendsOpacity = mobileBackgroundMode[\s\S]*: \(1 - clamp\(\(y - 240\) \/ 220, 0, 1\)\) \* colorBendsOpacity;/
  );
});

test("workspace route morph pauses animated color bends instead of repainting behind the panel", () => {
  assert.match(source, /WORKSPACE_MORPH_BACKGROUND_PAUSE_MS\s*=\s*WORKSPACE_PANEL_MORPH_MS \+ 240/);
  assert.match(source, /event\?\.detail\?\.workspacePanelMorph/);
  assert.match(source, /setColorBendsPaused\(true\)/);
  assert.match(source, /paused=\{colorBendsPaused\}/);
});
