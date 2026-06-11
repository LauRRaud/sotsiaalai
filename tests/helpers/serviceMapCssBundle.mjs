import { existsSync, readFileSync } from "node:fs";

function readSource(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

export function readServiceMapCssBundle() {
  return [
    "app/styles/features/service-map/desktop.css",
    "app/styles/features/service-map/mobile.css",
    "app/styles/mobile/subpage-title-system.css"
  ].filter((path) => existsSync(new URL(`../../${path}`, import.meta.url))).map(readSource).join("\n");
}
