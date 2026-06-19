import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import test from "node:test";
import { readServiceMapCssBundle } from "../helpers/serviceMapCssBundle.mjs";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

function readRaw(path) {
  return readFile(new URL(`../../${path}`, import.meta.url), "utf8");
}

function braceBalance(css) {
  return [...css].reduce((balance, char) => {
    if (char === "{") return balance + 1;
    if (char === "}") return balance - 1;
    return balance;
  }, 0);
}

const desktopParts = [
  "base.css",
  "shell.css",
  "toolbar.css",
  "leaflet.css",
  "popup.css",
  "leaflet-attribution.css",
  "pre-inquiry-agent.css",
  "responsive.css",
];

test("service map desktop entrypoint keeps owner files in cascade order", async () => {
  const entry = await readRaw("app/styles/features/service-map/desktop.css");
  const imports = [...entry.matchAll(/@import url\("\.\/desktop\/([^"]+)"\);/g)].map((match) => match[1]);

  assert.deepEqual(imports, desktopParts);
  assert.doesNotMatch(entry, /\.service-map-toolbar__/);
  assert.doesNotMatch(entry, /\.service-map-leaflet/);
  assert.doesNotMatch(entry, /\.service-map-popup/);
});

test("service map desktop owner files are independently balanced CSS chunks", () => {
  for (const part of desktopParts) {
    const css = read(`app/styles/features/service-map/desktop/${part}`);
    assert.equal(braceBalance(css), 0, `${part} has unbalanced braces`);
  }
});

test("service map desktop toolbar, Leaflet and popup selectors live in their owner files", () => {
  const shell = read("app/styles/features/service-map/desktop/shell.css");
  const toolbar = read("app/styles/features/service-map/desktop/toolbar.css");
  const leaflet = read("app/styles/features/service-map/desktop/leaflet.css");
  const popup = read("app/styles/features/service-map/desktop/popup.css");
  const attribution = read("app/styles/features/service-map/desktop/leaflet-attribution.css");
  const preInquiry = read("app/styles/features/service-map/desktop/pre-inquiry-agent.css");

  assert.match(shell, /\.service-map-workspace\s*\{/);
  assert.match(shell, /\.service-map-workspace__filters-shell\s*\{/);
  assert.doesNotMatch(shell, /\.service-map-toolbar__/);
  assert.doesNotMatch(shell, /\.service-map-leaflet/);
  assert.doesNotMatch(shell, /\.service-map-popup/);

  assert.match(toolbar, /\.service-map-toolbar__identity\s*\{/);
  assert.match(toolbar, /\.service-map-toolbar__results\s*\{/);
  assert.doesNotMatch(toolbar, /\.service-map-leaflet__popup/);
  assert.doesNotMatch(toolbar, /\.service-map-popup/);

  assert.match(leaflet, /\.service-map-leaflet-shell\s*\{/);
  assert.match(leaflet, /\.service-map-leaflet__marker\s*\{/);
  assert.doesNotMatch(leaflet, /\.service-map-popup\s*\{/);

  assert.match(popup, /\.service-map-leaflet__popup \.leaflet-popup-content-wrapper\s*\{/);
  assert.match(popup, /\.service-map-popup__actions\s*\{/);
  assert.doesNotMatch(popup, /\.service-map-toolbar__/);

  assert.match(attribution, /\.leaflet-control-attribution\s*\{/);
  assert.match(preInquiry, /\.pre-inquiry-agent-chat\s*\{/);
});

test("service map resolved bundle still exposes toolbar, Leaflet and popup contracts", () => {
  const css = readServiceMapCssBundle();

  assert.match(css, /\.service-map-toolbar__back\s*\{[\s\S]*?background:\s*transparent/);
  assert.match(css, /\.service-map-leaflet \.leaflet-div-icon\s*\{[\s\S]*?background:\s*transparent\s*!important/);
  assert.match(css, /\.service-map-leaflet__popup \.leaflet-popup-content-wrapper\s*\{[\s\S]*?background:\s*var\(--service-map-popup-glass-bg\)\s*!important/);
  assert.match(css, /\.pre-inquiry-agent-chat\s*\{[\s\S]*?--chat-input-max-w:\s*100%/);
});
