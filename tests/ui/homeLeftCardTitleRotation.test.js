import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("home left card title rotates between specialist and service provider every two and a half seconds", () => {
  const homePage = read("components/HomePage.jsx");

  assert.match(homePage, /const LEFT_CARD_TITLE_SWAP_INTERVAL_MS = 2500;/);
  assert.match(homePage, /window\.setInterval\(\(\) => \{/);
  assert.match(homePage, /LEFT_CARD_TITLE_SWAP_INTERVAL_MS/);
  assert.match(homePage, /t\("home\.card\.specialist\.title"\)/);
  assert.match(homePage, /t\("home\.card\.service_provider\.title_line1"\)/);
  assert.match(homePage, /t\("home\.card\.service_provider\.title_line2"\)/);
  assert.match(homePage, /<span>\{leftCardTitle\.line1\}<\/span>\s*<span>\{leftCardTitle\.line2\}<\/span>/);

  const messages = read("messages/et.json");
  assert.match(messages, /"title_line1":\s*"Teenuse"/);
  assert.match(messages, /"title_line2":\s*"osutajale"/);
});
