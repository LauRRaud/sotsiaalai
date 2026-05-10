import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

function cssBlock(source, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = source.match(new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\n\\}`));
  return match?.[0] || "";
}

test("workspace subpage surfaces do not build a shell edge-shine layer", () => {
  const stylesSource = read("components/ui/glassPageStyles.js");
  const helpersCss = read("app/styles/utilities/helpers.css");
  const glassCss = read("app/styles/components/glass.css");
  const surfaceBlock = cssBlock(helpersCss, ".glass-subpage-surface");

  assert.match(
    stylesSource,
    /glassSubpageSurfaceScopeClassName\s*=[\s\S]*?glass-subpage-surface/
  );
  assert.doesNotMatch(helpersCss, /\.glass-subpage-surface::before/);
  assert.doesNotMatch(helpersCss, /--glass-subpage-edge-stroke/);
  assert.doesNotMatch(helpersCss, /:root:not\(\[data-contrast="hc"\]\) \.glass-subpage-surface/);
  assert.doesNotMatch(surfaceBlock, /--glass-ring-edge-stroke/);
  assert.match(
    helpersCss,
    /\.glass-subpage-surface\s*\{[\s\S]*?--subpage-card-bg:\s*color-mix\([\s\S]*?var\(--glass-ring-surface-bg/
  );
  assert.match(
    helpersCss,
    /:root\.theme-light:not\(\.theme-mid\) \.glass-subpage-surface\s*\{[\s\S]*?--subpage-card-bg:\s*rgba\(251,\s*248,\s*246,\s*0\.64\)/
  );
  assert.match(
    helpersCss,
    /:root\.theme-mid \.glass-subpage-surface\s*\{[\s\S]*?--subpage-card-bg:\s*rgba\(232,\s*222,\s*218,\s*0\.42\)/
  );
  assert.match(
    helpersCss,
    /\.workspace-feature-panel\.glass-subpage-surface,[\s\S]*?--subpage-card-bg:\s*color-mix\([\s\S]*?!important/
  );
  assert.match(
    glassCss,
    /\.workspace-feature-glow-card > \[class\*="edgeLight"\],[\s\S]*?\.materials-glow-card::after\s*\{[\s\S]*?display:\s*none !important/
  );
});
