import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";

function readSource(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

function getIconStrokeWidth(source, functionName) {
  const match = source.match(new RegExp(`function ${functionName}\\([\\s\\S]*?return <svg[^>]*strokeWidth="([^"]+)"`));
  assert.ok(match, `${functionName} should define a base svg strokeWidth`);
  return match[1];
}

function getIconPaths(source, functionName) {
  const match = source.match(new RegExp(`function ${functionName}\\([\\s\\S]*?<svg[\\s\\S]*?<path d="([^"]+)"\\s*/>[\\s\\S]*?<path d="([^"]+)"\\s*/>[\\s\\S]*?<path d="([^"]+)"[^>]*/>[\\s\\S]*?</svg>`));
  assert.ok(match, `${functionName} should define three svg paths`);
  return match.slice(1, 4);
}

test("profile orbital theme mode icons use a consistent base stroke width", () => {
  const source = readSource("components/alalehed/ProfiilBody.jsx");
  const expectedStrokeWidth = getIconStrokeWidth(source, "ThemeSunDockIcon");

  for (const iconName of ["ThemeMoonDockIcon", "ThemeMidDockIcon", "ThemeHighContrastDockIcon", "ThemeMonoDockIcon"]) {
    assert.equal(getIconStrokeWidth(source, iconName), expectedStrokeWidth);
  }
});

test("profile dim theme icon keeps the middle line full width while narrowing the arc and detached lower line", () => {
  const source = readSource("components/alalehed/ProfiilBody.jsx");
  assert.deepEqual(getIconPaths(source, "ThemeMidDockIcon"), [
    "M2.8 14.2h18.4",
    "M5.4 14.2a6.6 6.6 0 0 1 13.2 0",
    "M6.7 17.35h10.6"
  ]);
});
