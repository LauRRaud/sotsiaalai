import { readFileSync } from "node:fs";

function readSource(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

export function readServiceMapCssBundle() {
  return [
    "app/styles/components/service-map.css",
    "app/styles/components/service-map.mobile.css"
  ].map(readSource).join("\n");
}
