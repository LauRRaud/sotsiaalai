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
  assert.match(workspaceFeaturePage, /glowIntensity=\{0\.62\}/);
  assert.match(workspaceFeaturePage, /service-profile-glow-field/);
  assert.match(workspaceFeaturePage, /service-profile-glow-control/);
  assert.match(serviceMapCss, /\.service-profile-glow-field/);
  assert.match(serviceMapCss, /\.service-profile-glow-control/);
  assert.match(
    serviceMapCss,
    /\.service-profile-glow-field\s*\{[\s\S]*?background:[\s\S]*?!important/
  );
  assert.match(
    serviceMapCss,
    /\.service-profile-glow-field:hover\s*\{[\s\S]*?background:[\s\S]*?!important/
  );
  assert.match(
    serviceMapCss,
    /\.service-profile-glow-field:focus-within:not\(:hover\)\s*>\s*\.edgeLight,\s*\n\.service-profile-glow-field:focus-within:not\(:hover\)\s*>\s*\[class\*="edgeLight"\]\s*\{[\s\S]*?opacity:\s*0\s*!important/
  );
  assert.doesNotMatch(workspaceFeaturePage, /<BorderGlow[\s\S]{0,240}<button/);
});

test("service profile form does not render internal separator lines", () => {
  const workspaceFeaturePage = read("components/workspace/WorkspaceFeaturePage.jsx");
  const serviceMapCss = read("app/styles/components/service-map.css");

  assert.match(workspaceFeaturePage, /className="service-profile-form mx-auto grid/);
  assert.doesNotMatch(workspaceFeaturePage, /className="grid gap-\[0\.72rem\] border-b/);
  assert.doesNotMatch(workspaceFeaturePage, /className="grid gap-\[0\.22rem\] border-t/);
  assert.doesNotMatch(workspaceFeaturePage, /className="grid gap-\[0\.64rem\] border-t/);
  assert.match(
    serviceMapCss,
    /\.service-profile-form\s+\.workspace-feature-inline-stat\s*\{[\s\S]*?border-left:\s*0/
  );
});
