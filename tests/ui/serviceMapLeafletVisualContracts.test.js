import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("service map Leaflet markers do not inherit the default div icon plate", () => {
  const css = read("app/styles/components/service-map.css");

  assert.match(
    css,
    /\.service-map-leaflet \.leaflet-div-icon\s*\{[\s\S]*?border:\s*0\s*!important[\s\S]*?background:\s*transparent\s*!important/
  );
});

test("service map popup glass is applied on the wrapper immediately", () => {
  const css = read("app/styles/components/service-map.css");

  assert.match(css, /--service-map-popup-glass-bg:\s*color-mix\(/);
  assert.match(
    css,
    /\.service-map-leaflet__popup \.leaflet-popup-content-wrapper\s*\{[\s\S]*?background:[\s\S]*?var\(--service-map-popup-glass-bg\)\s*!important[\s\S]*?backdrop-filter:\s*blur/
  );
  assert.match(
    css,
    /\.service-map-leaflet\.leaflet-fade-anim \.service-map-leaflet__popup\.leaflet-popup\s*\{[\s\S]*?opacity:\s*1\s*!important[\s\S]*?transition:\s*none\s*!important/
  );
});

test("service map close button and toolbar controls keep the intended brand/control surfaces", () => {
  const css = read("app/styles/components/service-map.css");

  assert.match(
    css,
    /\.service-map-leaflet__popup \.leaflet-popup-close-button\s*\{[\s\S]*?color:\s*var\(--workspace-feature-accent,\s*var\(--title-color,\s*#c57171\)\)\s*!important/
  );
  assert.match(css, /--service-map-control-glass-bg:\s*color-mix\(/);
  assert.match(
    css,
    /\.service-map-workspace__filters:not\(\.service-map-workspace__filters--collapsed\) \.service-map-workspace__toggle\s*\{[\s\S]*?var\(--service-map-control-glass-bg\)/
  );
});

test("service map toolbar pills use compact local shadows instead of wide glow shadows", () => {
  const css = read("app/styles/components/service-map.css");

  assert.match(
    css,
    /--service-map-control-shadow:\s*inset 0 1px 0 rgba\(255,\s*255,\s*255,\s*0\.22\),\s*0 2px 5px rgba\(15,\s*23,\s*42,\s*0\.075\)/
  );
  assert.match(
    css,
    /--service-map-control-shadow-hover:\s*inset 0 1px 0 rgba\(255,\s*255,\s*255,\s*0\.28\),\s*0 3px 7px rgba\(15,\s*23,\s*42,\s*0\.09\)/
  );
  assert.match(
    css,
    /\.service-map-toolbar__glow-field\s*>\s*\[class\*="edgeLight"\][\s\S]*?display:\s*none\s*!important[\s\S]*?opacity:\s*0\s*!important/
  );
  assert.match(
    css,
    /:root\.theme-light \.service-map-toolbar__glow-field\.ui-glow-field\s*>\s*\[class\*="edgeLight"\][\s\S]*?display:\s*none\s*!important[\s\S]*?opacity:\s*0\s*!important/
  );
  assert.match(
    css,
    /:root\.theme-light \.service-map-toolbar__glow-field\.ui-glow-field[\s\S]*?box-shadow:\s*var\(--service-map-control-shadow\)\s*!important/
  );
  assert.match(
    css,
    /:root\.theme-light \.service-map-toolbar__type-card\.ui-glow-option-card-frame[\s\S]*?box-shadow:\s*var\(--service-map-control-shadow\)\s*!important/
  );
});

test("service map back button uses desktop toolbar panel and mobile page anchor", () => {
  const source = read("components/workspace/WorkspaceFeaturePage.jsx");
  const css = read("app/styles/components/service-map.css");

  assert.match(
    source,
    /className=\{cn\(glassPageBackTopLeftClassName,\s*"service-map-workspace__back"\)\}/
  );
  assert.match(source, /className="service-map-toolbar__back"/);
  assert.match(
    css,
    /\.service-map-workspace__back\s*\{[\s\S]*?z-index:\s*450\s*!important/
  );
  assert.match(
    css,
    /@media \(min-width:\s*769px\)[\s\S]*?\.service-map-workspace__back\s*\{[\s\S]*?display:\s*none\s*!important/
  );
  assert.match(
    css,
    /@media \(max-width:\s*768px\)[\s\S]*?\.service-map-toolbar__identity\s*\{[\s\S]*?display:\s*none\s*!important/
  );
  assert.match(
    css,
    /\.service-map-toolbar__back\s*\{[\s\S]*?background:\s*transparent\s*!important[\s\S]*?box-shadow:\s*none\s*!important/
  );
});

test("workspace dashboard back button keeps the same shared page anchor", () => {
  const source = read("components/chat/WorkspacePanel.jsx");
  const css = read("components/chat/WorkspacePanel.module.css");

  assert.match(
    source,
    /className=\{cn\(glassPageBackTopLeftClassName,\s*styles\.backButton\)\}/
  );
  assert.match(css, /\.backButton\s*\{[^}]*z-index:\s*92\s*!important/);
  assert.doesNotMatch(css, /^\.backButton\s*\{[^}]*\bleft:/m);
  assert.doesNotMatch(css, /^\.backButton\s*\{[^}]*\btop:/m);
});

test("service map multi-line mobile toolbar stays compact and gives provider tab enough width", () => {
  const css = read("app/styles/components/service-map.css");

  assert.match(
    css,
    /@media \(max-width:\s*768px\)[\s\S]*?\.service-map-workspace__filters-shell:has\(\.service-map-toolbar__resultsblock :is\(\.service-map-toolbar__results,\s*\.service-map-toolbar__summary\)\)\s*\{[\s\S]*?gap:\s*0\.5rem[\s\S]*?padding-bottom:\s*0\.56rem/
  );
  assert.match(
    css,
    /\.service-map-toolbar__types\s*\{[\s\S]*?grid-template-columns:\s*minmax\(5\.25rem,\s*1fr\) minmax\(6\.9rem,\s*1\.28fr\) minmax\(3\.35rem,\s*0\.62fr\)/
  );
  assert.match(
    css,
    /\.service-map-toolbar__type-card\s*\{[\s\S]*?font-size:\s*0\.82rem[\s\S]*?letter-spacing:\s*0/
  );
  assert.match(
    css,
    /\.service-map-toolbar__type-card \.service-map-toolbar__type-label\s*\{[\s\S]*?text-wrap:\s*nowrap[\s\S]*?white-space:\s*nowrap/
  );
  assert.match(
    css,
    /\.service-map-toolbar__results\s*\{[\s\S]*?padding:\s*0\.08rem 0\.12rem 0\.12rem/
  );
});

test("service map mobile route removes animated overlays and lets the map fill the panel", () => {
  const backgroundLayer = read("components/backgrounds/BackgroundLayer.jsx");
  const css = read("app/styles/components/service-map.css");

  assert.match(
    backgroundLayer,
    /COLOR_BENDS_EXCLUDED_PATHS[\s\S]*?["']\/teenusekaart["']/
  );
  assert.match(
    backgroundLayer,
    /PARTICLES_EXCLUDED_PATHS[\s\S]*?["']\/teenusekaart["']/
  );
  assert.match(
    css,
    /@media \(max-width:\s*768px\)[\s\S]*?\.service-map-page-panel\.service-map-page-panel\s*\{[\s\S]*?inset:\s*calc\(env\(safe-area-inset-top,\s*0px\) \+ var\(--mobile-glass-card-gap[\s\S]*?border-radius:\s*var\(--mobile-glass-card-radius[\s\S]*?background:\s*var\(--service-map-safe-area-bg,\s*#10151d\)\s*!important[\s\S]*?backdrop-filter:\s*none/
  );
  assert.match(
    css,
    /@media \(max-width:\s*768px\)[\s\S]*?\.service-map-workspace\s*\{[\s\S]*?--service-map-map-radius:\s*clamp\([\s\S]*?--service-map-mobile-map-inset:\s*0px/
  );
  assert.match(
    css,
    /@media \(max-width:\s*768px\)[\s\S]*?\.service-map-workspace__map\s*\{[\s\S]*?inset:\s*var\(--service-map-mobile-map-inset\)[\s\S]*?border-radius:\s*var\(--service-map-map-radius\)[\s\S]*?box-shadow:\s*none/
  );
});

test("service map clears its global page-active state before delayed back navigation", () => {
  const source = read("components/workspace/WorkspaceFeaturePage.jsx");

  assert.match(source, /function clearServiceMapPageState\(\)\s*\{[\s\S]*?service-map-page-active/);
  assert.match(source, /return \(\) => \{\s*clearServiceMapPageState\(\);\s*\};/);
  assert.match(source, /const handleServiceMapBack = useCallback\(\(\) => \{\s*clearServiceMapPageState\(\);\s*onBack\?\.\(\);/);
  assert.match(source, /onClick=\{handleServiceMapBack\}/);
});

test("service map mobile inputs keep 16px text to avoid browser focus zoom", () => {
  const css = read("app/styles/components/service-map.css");

  assert.match(
    css,
    /@media \(max-width:\s*768px\)[\s\S]*?\.service-map-toolbar__input\s*\{[\s\S]*?font-size:\s*16px/
  );
  assert.match(
    css,
    /@media \(max-width:\s*560px\)[\s\S]*?\.service-map-workspace__filters input\s*\{[\s\S]*?font-size:\s*16px\s*!important/
  );
});

test("service map results do not force oversized panel bottom padding", () => {
  const css = read("app/styles/components/service-map.css");

  assert.match(
    css,
    /\.service-map-toolbar__resultsblock\s*\{[\s\S]*?align-self:\s*start/
  );
  assert.match(
    css,
    /\.service-map-toolbar__results\s*\{[\s\S]*?min-height:\s*0[\s\S]*?padding:\s*0\.34rem 0\.34rem 0\.5rem/
  );
  assert.match(
    css,
    /@media \(max-width:\s*768px\)[\s\S]*?\.service-map-workspace__filters-shell:has\(\.service-map-toolbar__resultsblock :is\(\.service-map-toolbar__results,\s*\.service-map-toolbar__summary\)\)\s*\{[\s\S]*?padding-bottom:\s*0\.56rem/
  );
  assert.match(
    css,
    /@media \(max-width:\s*768px\)[\s\S]*?\.service-map-toolbar__results\s*\{[\s\S]*?padding:\s*0\.08rem 0\.12rem 0\.12rem/
  );
  assert.match(
    css,
    /@media \(max-width:\s*560px\)[\s\S]*?\.service-map-workspace__filters-shell:has\(\.service-map-toolbar__resultsblock :is\(\.service-map-toolbar__results,\s*\.service-map-toolbar__summary\)\)\s*\{[\s\S]*?padding-bottom:\s*0\.48rem/
  );
});

test("service map popup and two-line toolbar preserve glass and back alignment", () => {
  const css = read("app/styles/components/service-map.css");

  assert.match(
    css,
    /--service-map-popup-glass-bg:\s*color-mix\([\s\S]*?68%,\s*transparent/
  );
  assert.match(
    css,
    /\.service-map-leaflet__popup \.leaflet-popup-content-wrapper\s*\{[\s\S]*?background-clip:\s*padding-box[\s\S]*?backdrop-filter:\s*blur/
  );
  assert.match(
    css,
    /\.service-map-workspace__filters-shell\s*\{[\s\S]*?align-items:\s*flex-start/
  );
  assert.match(
    css,
    /@media \(max-width:\s*1180px\)[\s\S]*?\.service-map-workspace__filters-shell\s*\{[\s\S]*?align-items:\s*flex-start/
  );
  assert.match(
    css,
    /\.service-map-toolbar__identity\s*\{[\s\S]*?align-self:\s*flex-start[\s\S]*?padding-top:\s*0\.08rem/
  );
  assert.match(
    css,
    /:root\.theme-light:not\(\.theme-mid\) \.service-map-toolbar__type-card\.ui-glow-option-card-frame,[\s\S]*?\.service-map-toolbar__results \.workspace-feature-list-card[\s\S]*?border:\s*1px solid rgba\(148,\s*163,\s*184,\s*0\.16\)\s*!important/
  );
});

test("service map mobile map edge does not expose a blue Leaflet fallback seam", () => {
  const css = read("app/styles/components/service-map.css");

  assert.doesNotMatch(css, /background:\s*#a8d5e0\s*!important/);
  assert.match(css, /--service-map-map-bg:\s*#eef0ef/);
  assert.match(
    css,
    /\.service-map-leaflet(?:\.leaflet-container)?\s*\{[\s\S]*?background:\s*var\(--service-map-map-bg\)\s*!important/
  );
});

test("service map mobile dark and night panels stay translucent, while high contrast remains black", () => {
  const css = read("app/styles/components/service-map.css");

  assert.match(
    css,
    /@media \(max-width:\s*768px\)[\s\S]*?:root:not\(\.theme-light\):not\(\.theme-mid\):not\(\.theme-night\):not\(\[data-contrast="hc"\]\) \.service-map-workspace[\s\S]*?--service-map-panel-glass-bg:\s*rgba\(24,\s*28,\s*36,\s*0\.72\)/
  );
  assert.match(
    css,
    /@media \(max-width:\s*768px\)[\s\S]*?:root\.theme-night \.service-map-workspace[\s\S]*?--service-map-panel-glass-bg:\s*rgba\(16,\s*22,\s*34,\s*0\.76\)/
  );
  assert.match(
    css,
    /@media \(max-width:\s*768px\)[\s\S]*?html\[data-contrast="hc"\] \.service-map-workspace[\s\S]*?--service-map-panel-glass-bg:\s*#000/
  );
});
