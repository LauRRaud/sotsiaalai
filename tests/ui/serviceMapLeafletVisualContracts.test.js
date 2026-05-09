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
  assert.match(
    css,
    /@media \(max-width:\s*768px\)[\s\S]*?\.service-map-toolbar__back,[\s\S]*?\.service-map-toolbar__back:is\(:hover,\s*:focus-visible,\s*:active\)\s*\{[\s\S]*?background:\s*transparent\s*!important[\s\S]*?box-shadow:\s*none\s*!important[\s\S]*?backdrop-filter:\s*none\s*!important/
  );
});

test("service map multi-line mobile toolbar stays compact and gives provider tab enough width", () => {
  const css = read("app/styles/components/service-map.css");

  assert.match(
    css,
    /@media \(max-width:\s*768px\)[\s\S]*?\.service-map-workspace__filters-shell:has\(\.service-map-toolbar__resultsblock :is\(\.service-map-toolbar__results,\s*\.service-map-toolbar__summary\)\)\s*\{[\s\S]*?gap:\s*0\.5rem[\s\S]*?padding-bottom:\s*0\.28rem/
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

test("service map mobile route keeps animated page background behind a rounded card", () => {
  const backgroundLayer = read("components/backgrounds/BackgroundLayer.jsx");
  const css = read("app/styles/components/service-map.css");

  assert.doesNotMatch(
    backgroundLayer,
    /COLOR_BENDS_EXCLUDED_PATHS[\s\S]*?["']\/teenusekaart["']/
  );
  assert.match(
    css,
    /@media \(max-width:\s*768px\)[\s\S]*?\.service-map-page-panel\.service-map-page-panel\s*\{[\s\S]*?inset:\s*calc\(env\(safe-area-inset-top,\s*0px\) \+ var\(--mobile-glass-card-gap[\s\S]*?border-radius:\s*var\(--mobile-glass-card-radius[\s\S]*?background:[\s\S]*?var\(--glass-ring-sheen,\s*none\)[\s\S]*?var\(--glass-ring-surface-bg/
  );
  assert.match(
    css,
    /@media \(max-width:\s*768px\)[\s\S]*?\.service-map-workspace\s*\{[\s\S]*?--service-map-map-radius:\s*clamp\([\s\S]*?--service-map-mobile-map-inset:/
  );
  assert.match(
    css,
    /@media \(max-width:\s*768px\)[\s\S]*?\.service-map-workspace__map\s*\{[\s\S]*?inset:\s*var\(--service-map-mobile-map-inset\)[\s\S]*?border-radius:\s*var\(--service-map-map-radius\)/
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
    /\.service-map-toolbar__results\s*\{[\s\S]*?min-height:\s*0[\s\S]*?padding:\s*0\.34rem 0\.12rem 0\.42rem/
  );
  assert.match(
    css,
    /@media \(max-width:\s*768px\)[\s\S]*?\.service-map-workspace__filters-shell:has\(\.service-map-toolbar__resultsblock :is\(\.service-map-toolbar__results,\s*\.service-map-toolbar__summary\)\)\s*\{[\s\S]*?padding-bottom:\s*0\.28rem/
  );
  assert.match(
    css,
    /@media \(max-width:\s*768px\)[\s\S]*?\.service-map-toolbar__results\s*\{[\s\S]*?padding:\s*0\.08rem 0\.12rem 0\.12rem/
  );
  assert.match(
    css,
    /@media \(max-width:\s*560px\)[\s\S]*?\.service-map-workspace__filters-shell:has\(\.service-map-toolbar__resultsblock :is\(\.service-map-toolbar__results,\s*\.service-map-toolbar__summary\)\)\s*\{[\s\S]*?padding-bottom:\s*0\.24rem/
  );
});
