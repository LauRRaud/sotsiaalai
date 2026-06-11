import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function readSource(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("home role cards do not render edge glow wrappers", () => {
  const source = readSource("components/HomePage.jsx");

  assert.doesNotMatch(source, /home-card-edge-glow/);
  assert.doesNotMatch(source, /HOME_CARD_GLOW_PROPS/);
  assert.doesNotMatch(source, /<BorderGlow[\s>]/);
  assert.doesNotMatch(source, /edgeOnly/);
});

test("home role card stylesheet does not reintroduce edge glow rules", () => {
  const source = readSource("app/styles/features/home/desktop.css");

  assert.doesNotMatch(source, /home-card-edge-glow/);
  assert.doesNotMatch(source, /home-card-static-glow/);
  assert.doesNotMatch(source, /edgeLight/);
  assert.doesNotMatch(source, /--home-card-glow-/);
});

test("home role cards keep ordinary idle and hover light shadows", () => {
  const componentStyles = readSource("app/styles/features/home/desktop.css");
  const darkTheme = readSource("app/styles/theme/dark.css");

  assert.match(componentStyles, /--home-card-idle-shadow/);
  assert.match(componentStyles, /--home-card-hover-shadow/);
  assert.match(darkTheme, /--home-card-idle-shadow:/);
  assert.match(darkTheme, /--home-card-hover-shadow:/);
});
