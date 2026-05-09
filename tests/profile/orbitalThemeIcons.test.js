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

test("profile orbital theme mode icons use a consistent base stroke width", () => {
  const source = readSource("components/alalehed/ProfiilBody.jsx");
  const expectedStrokeWidth = getIconStrokeWidth(source, "ThemeSunDockIcon");

  for (const iconName of ["ThemeMoonDockIcon", "ThemeMidDockIcon", "ThemeHighContrastDockIcon"]) {
    assert.equal(getIconStrokeWidth(source, iconName), expectedStrokeWidth);
  }
});
