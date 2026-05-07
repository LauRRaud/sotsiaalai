import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("service profile fields use BorderGlow field wrappers", () => {
  const workspaceFeaturePage = read("components/workspace/WorkspaceFeaturePage.jsx");
  const serviceMapCss = read("app/styles/components/service-map.css");

  assert.match(
    workspaceFeaturePage,
    /import\s+BorderGlow\s+from\s+"@\/components\/ui\/BorderGlow"/
  );
  assert.match(workspaceFeaturePage, /function\s+ServiceProfileGlowField/);
  assert.match(workspaceFeaturePage, /<BorderGlow[\s\S]*?as="div"[\s\S]*?edgeOnly/);
  assert.match(workspaceFeaturePage, /service-profile-glow-field/);
  assert.match(workspaceFeaturePage, /service-profile-glow-control/);
  assert.match(serviceMapCss, /\.service-profile-glow-field/);
  assert.match(serviceMapCss, /\.service-profile-glow-control/);
  assert.doesNotMatch(workspaceFeaturePage, /<BorderGlow[\s\S]{0,240}<button/);
});
