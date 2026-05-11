import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("service profile toggle cards keep checkbox text readable across themes", () => {
  const css = read("app/styles/components/service-map.css");

  assert.match(
    css,
    /\.workspace-feature-fancy-checkbox\s*\{[\s\S]*?--pt:\s*var\(--workspace-feature-checkbox-text\)/
  );
  assert.match(
    css,
    /\.workspace-feature-fancy-checkbox\s*\{[\s\S]*?--otp-check-text:\s*var\(--workspace-feature-checkbox-text\)/
  );
  assert.match(
    css,
    /\.workspace-feature-toggle-row \.text\s*\{[\s\S]*?color:\s*var\(--workspace-feature-checkbox-text\)\s*!important/
  );
  assert.match(
    css,
    /\.workspace-feature-toggle-row \.text > span > span:last-child:not\(:first-child\)\s*\{[\s\S]*?opacity:\s*1/
  );
  assert.match(
    css,
    /:root\.theme-light:not\(\.theme-mid\) \.workspace-feature-fancy-checkbox\s*\{[\s\S]*?--workspace-feature-checkbox-body-text:\s*#4b5567/
  );
  assert.match(
    css,
    /:root\.theme-mid \.workspace-feature-fancy-checkbox\s*\{[\s\S]*?--workspace-feature-checkbox-body-text:\s*#536071/
  );
  assert.match(
    css,
    /html\[data-contrast="hc"\] \.workspace-feature-panel \.workspace-feature-fancy-checkbox\s*\{[\s\S]*?--workspace-feature-checkbox-body-text:\s*var\(--hc-accent,\s*#ffea00\)/
  );
});

test("service profile page keeps the shared workspace feature desktop width", () => {
  const source = read("components/workspace/WorkspaceFeaturePage.jsx");
  const css = read("app/styles/utilities/helpers.css");

  assert.match(source, /workspaceGuidePanelClassName/);
  assert.match(css, /\.workspace-guide-panel\.glass-subpage-surface\s*\{[\s\S]*?--ring-base-max:\s*calc\(54 \* var\(--base-rem\)\)/);
  assert.doesNotMatch(source, /workspace-feature-panel--service-profile/);
  assert.doesNotMatch(source, /clamp\(38rem,76vw,56rem\)/);
});
