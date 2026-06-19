import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import test from "node:test";
import { readCssSourceBundle } from "../helpers/cssSourceBundle.mjs";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

function readRaw(path) {
  return readFile(new URL(`../../${path}`, import.meta.url), "utf8");
}

async function assertBalancedCss(path) {
  const source = (await readRaw(path))
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, "");

  let depth = 0;
  for (const char of source) {
    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;
    assert.ok(depth >= 0, `${path} closes a block before it opens one`);
  }
  assert.equal(depth, 0, `${path} must be a standalone balanced stylesheet`);
}

const sharedImports = [
  "./mobile/background-layer.css",
  "./mobile/interaction-surfaces.css",
  "./mobile/content-surfaces.css"
];

const homeImports = [
  "./background-mobile.css",
  "./cards-mobile.css",
  "./circular-text-mobile.css"
];

const ownerFiles = [
  "app/styles/mobile/background-layer.css",
  "app/styles/mobile/interaction-surfaces.css",
  "app/styles/mobile/content-surfaces.css",
  "app/styles/features/home/background-mobile.css",
  "app/styles/features/home/cards-mobile.css",
  "app/styles/features/home/circular-text-mobile.css"
];

test("global mobile chain owns only shared background and surface rules", async () => {
  const mobileEntry = await readRaw("app/styles/mobile.css");
  let cursor = -1;

  for (const specifier of sharedImports) {
    const index = mobileEntry.indexOf(`@import url("${specifier}");`);
    assert.ok(index > cursor, `${specifier} must keep its shared cascade position`);
    cursor = index;
  }

  assert.doesNotMatch(mobileEntry, /features\/home\/background\.css/);
  assert.doesNotMatch(mobileEntry, /background-mobile\.css|cards-mobile\.css|circular-text-mobile\.css/);
});

test("home route owns its mobile background, cards and circular typography", async () => {
  const homeIndex = await readRaw("app/styles/features/home/index.css");
  const homeEntry = await readRaw("app/styles/features/home/background.css");
  const backgroundIndex = homeIndex.indexOf('@import url("./background.css");');
  const desktopIndex = homeIndex.indexOf('@import url("./desktop.css");');

  assert.ok(backgroundIndex >= 0, "home route must import its background entrypoint");
  assert.ok(backgroundIndex < desktopIndex, "mobile baseline must stay before home desktop refinements");

  let cursor = -1;
  for (const specifier of homeImports) {
    const index = homeEntry.indexOf(`@import url("${specifier}");`);
    assert.ok(index > cursor, `${specifier} must keep its home cascade position`);
    cursor = index;
  }

  assert.doesNotMatch(homeEntry, /\.\.\/\.\.\/mobile\//);
  assert.doesNotMatch(homeEntry, /(^|\n)\s*[^@/\s][^{]*\{/m, "entrypoint should contain imports, not owned rules");
});

test("every extracted owner file is syntactically standalone", async () => {
  for (const path of ownerFiles) await assertBalancedCss(path);
});

test("background rules remain separated by owner", () => {
  const backgroundLayer = read("app/styles/mobile/background-layer.css");
  const homeBackground = read("app/styles/features/home/background-mobile.css");
  const interactionSurfaces = read("app/styles/mobile/interaction-surfaces.css");
  const homeCards = read("app/styles/features/home/cards-mobile.css");
  const contentSurfaces = read("app/styles/mobile/content-surfaces.css");
  const circularText = read("app/styles/features/home/circular-text-mobile.css");

  assert.match(backgroundLayer, /data-mobile-bends="ready"/);
  assert.match(backgroundLayer, /data-page="subpage"/);
  assert.doesNotMatch(backgroundLayer, /\.homepage-root|\.three-d-card|\.glass-ring/);

  assert.match(homeBackground, /data-page="home"/);
  assert.match(homeBackground, /--home-browser-base-bg/);
  assert.match(homeBackground, /\.homepage-root \.home-about-panel/);
  assert.doesNotMatch(homeBackground, /\.three-d-card|\.glass-ring/);

  assert.match(interactionSurfaces, /-webkit-tap-highlight-color:\s*transparent/);
  assert.match(interactionSurfaces, /\.glass-field-hole-surface/);
  assert.doesNotMatch(
    interactionSurfaces,
    /--home-browser-base-bg|\.circular-text-line|\.three-d-card/
  );

  assert.match(homeCards, /\.three-d-card\.mobile-flipped-left/);
  assert.match(homeCards, /\.homepage-root \.three-d-card\.float-card/);
  assert.match(homeCards, /\.home-hero-shell/);
  assert.doesNotMatch(homeCards, /\[data-bg-layer\]|\.glass-ring/);

  assert.match(contentSurfaces, /\.glass-box/);
  assert.match(contentSurfaces, /\[data-bg-layer\]\s*\{[\s\S]*?pointer-events:\s*none/);

  assert.match(circularText, /\.circular-text-line/);
  assert.match(circularText, /\.circular-text-svg\.circular-ring/);
  assert.doesNotMatch(circularText, /\.three-d-card|\[data-bg-layer\]/);
});

test("global and home bundles expose only their owned contracts", () => {
  const globalMobileBundle = readCssSourceBundle("app/styles/mobile.css");
  const homeBundle = readCssSourceBundle("app/styles/features/home/index.css");

  assert.match(globalMobileBundle, /--mobile-background-reveal-duration:\s*900ms/);
  assert.match(globalMobileBundle, /\.glass-field-hole-surface/);
  assert.match(globalMobileBundle, /\.glass-box/);
  assert.doesNotMatch(globalMobileBundle, /--home-browser-base-bg\s*:/);
  assert.doesNotMatch(globalMobileBundle, /\.three-d-card\.mobile-flipped-left/);
  assert.doesNotMatch(globalMobileBundle, /\.circular-text-svg\.circular-ring/);

  assert.match(homeBundle, /\[data-bg-layer\]\[data-page="home"\]/);
  assert.match(homeBundle, /\.three-d-card\.mobile-flipped-left/);
  assert.match(homeBundle, /\.homepage-root \.three-d-card\.float-card/);
  assert.match(homeBundle, /\.circular-text-svg\.circular-ring/);
});
