import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

function cssBlock(source, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return source.match(new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\n\\}`))?.[0] || "";
}

test("covision overview uses the shared workspace feature panel footprint", () => {
  const source = read("components/covision/CovisionPage.jsx");
  const css = read("components/covision/CovisionPage.module.css");

  assert.match(source, /covision-page-surface/);
  assert.match(source, /mobile-keep-desktop-glass-cards/);
  assert.match(source, /workspaceGuidePanelClassName/);
  assert.doesNotMatch(source, /\[scrollbar-gutter:stable_both-edges\]/);
  assert.match(css, /\.surface\s*\{[\s\S]*?width:\s*var\(--workspace-glass-inline-size/);
  assert.match(css, /\.surface\.surface\s*\{[\s\S]*?height:\s*var\(--workspace-glass-block-size/);
  assert.match(css, /\.surface\.surface\s*\{[\s\S]*?min-height:\s*0\s*!important/);
  assert.match(css, /\.surface\.surface\s*\{[\s\S]*?max-height:\s*var\(--workspace-glass-block-size/);
  assert.doesNotMatch(css, /\.surface\s*\{[\s\S]*?--glass-subpage-edge-stroke:\s*radial-gradient\(/);
  assert.doesNotMatch(source, /!min-h-\[clamp\(40rem/);
});

test("covision HC surface keeps the shared blurred glass shell", () => {
  const css = read("components/covision/CovisionPage.module.css");
  const hcPageBlock = cssBlock(css, ':global(html[data-contrast="hc"]) .page');
  const hcSurfaceBlock = cssBlock(css, ':global(html[data-contrast="hc"]) .surface');

  assert.match(
    hcPageBlock,
    /--covision-surface-bg:\s*var\(--glass-ring-surface-bg/
  );
  assert.match(
    hcSurfaceBlock,
    /border:\s*0\s*!important[\s\S]*?background:[\s\S]*?var\(--glass-ring-sheen,\s*none\),[\s\S]*?var\(--covision-surface-bg\)\s*!important/
  );
  assert.match(
    hcSurfaceBlock,
    /backdrop-filter:\s*blur\(var\(--glass-modal-blur,\s*var\(--glass-blur-radius,\s*1rem\)\)\)\s*saturate\(100%\)\s*!important/
  );
  assert.doesNotMatch(
    hcSurfaceBlock,
    /background:\s*var\(--hc-bg/
  );
  assert.doesNotMatch(
    hcSurfaceBlock,
    /backdrop-filter:\s*none\s*!important/
  );
});

test("covision HC fields do not turn yellow on hover or focus", () => {
  const css = read("components/covision/CovisionPage.module.css");
  const borderGlow = read("components/ui/BorderGlow.module.css");
  const hcPageBlock = cssBlock(css, ':global(html[data-contrast="hc"]) .page');

  assert.match(
    hcPageBlock,
    /--covision-field-bg:\s*var\(--hc-field-bg/
  );
  assert.match(
    hcPageBlock,
    /--covision-field-hover-bg:\s*var\(--hc-field-bg-hover,\s*var\(--covision-field-bg\)\)/
  );
  assert.match(
    hcPageBlock,
    /--covision-field-focus-shadow:\s*none/
  );
  assert.match(
    css,
    /:global\(html\[data-contrast="hc"\]\) \.page :global\(\.covision-glow-field\),[\s\S]*?\.covision-glow-field:is\(:hover,\s*:focus-within,\s*:focus-visible,\s*:active\)\) \{[\s\S]*?background:\s*var\(--covision-field-bg\)\s*!important[\s\S]*?box-shadow:\s*none\s*!important/
  );
  assert.match(
    css,
    /:global\(html\[data-contrast="hc"\]\) \.page :global\(\.covision-glow-field::before\),[\s\S]*?\.covision-glow-field::after\),[\s\S]*?\.covision-glow-field > \.edgeLight\),[\s\S]*?display:\s*none\s*!important/
  );
  assert.match(
    css,
    /\.covision-glow-control:focus-visible\),[\s\S]*?box-shadow:\s*none\s*!important/
  );
  assert.match(
    borderGlow,
    /\.card:global\(\.covision-glow-field\),[\s\S]*?background:\s*var\(--hc-field-bg/
  );
});
