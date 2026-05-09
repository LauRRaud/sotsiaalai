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
    /@media \(max-width:\s*768px\)[\s\S]*?\.service-map-workspace__filters-shell:has\(\.service-map-toolbar__resultsblock :is\(\.service-map-toolbar__results,\s*\.service-map-toolbar__summary\)\)\s*\{[\s\S]*?gap:\s*0\.5rem[\s\S]*?padding-bottom:\s*0\.52rem/
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
    /\.service-map-toolbar__results\s*\{[\s\S]*?padding:\s*0\.18rem 0\.12rem 0\.34rem/
  );
});
