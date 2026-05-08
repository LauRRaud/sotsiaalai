import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("workspace dashboard cards render through BorderGlow as buttons", () => {
  const workspacePanel = read("components/chat/WorkspacePanel.jsx");
  const workspacePanelCss = read("components/chat/WorkspacePanel.module.css");

  assert.match(
    workspacePanel,
    /import\s+BorderGlow\s+from\s+"@\/components\/ui\/BorderGlow"/
  );
  assert.match(workspacePanel, /<BorderGlow[\s\S]*?as="button"/);
  assert.match(workspacePanel, /edgeOnly/);
  assert.match(workspacePanel, /glowColor="358 82 72"/);
  assert.match(workspacePanel, /glowIntensity=\{0\.72\}/);
  assert.match(workspacePanel, /coneSpread=\{20\}/);
  assert.doesNotMatch(workspacePanel, /animated/);
  assert.doesNotMatch(workspacePanel, /animationDurationScale=\{2\}/);
  assert.match(workspacePanel, /className=\{cn\(styles\.card/);
  assert.match(workspacePanel, /fillOpacity=\{0\}/);
  assert.doesNotMatch(workspacePanel, /<BorderGlow[\s\S]{0,240}<button/);
  assert.match(
    workspacePanelCss,
    /\.card\s*\{[\s\S]*?background:[\s\S]*?!important/
  );
  assert.match(
    workspacePanelCss,
    /:global\(:root\.theme-light\)\s+\.card[\s\S]*?background:\s*rgba\(255,\s*255,\s*255,\s*0\.64\)\s*!important/
  );
});

test("BorderGlow keeps the mesh border edge-only and pointer-driven edge light", () => {
  const borderGlow = read("components/ui/BorderGlow.jsx");
  const borderGlowCss = read("components/ui/BorderGlow.module.css");

  assert.match(borderGlow, /onPointerMove=\{handlePointerMove\}/);
  assert.match(borderGlow, /onPointerLeave=\{handlePointerLeave\}/);
  assert.match(borderGlow, /buildGradientVars\(colors\)/);
  assert.match(borderGlow, /edgeOnly\s*=\s*false/);
  assert.match(borderGlow, /animationDurationScale\s*=\s*1/);
  assert.match(borderGlow, /duration:\s*500\s*\*\s*durationScale/);
  assert.match(borderGlow, /targetProximityRef/);
  assert.match(borderGlow, /requestAnimationFrame\(animatePointerState\)/);
  assert.match(borderGlowCss, /\.edgeOnly::before[\s\S]*?display:\s*none/);
  assert.match(borderGlowCss, /\.edgeOnly::after[\s\S]*?display:\s*block/);
  assert.match(borderGlowCss, /\.edgeOnly::after[\s\S]*?bottom:\s*0/);
  assert.match(borderGlowCss, /left:\s*var\(--edge-only-bottom-line-left/);
  assert.match(borderGlowCss, /right:\s*var\(--edge-only-bottom-line-right/);
  assert.match(borderGlowCss, /--edge-only-bottom-tail-start,\s*84%/);
  assert.match(borderGlowCss, /--edge-only-bottom-tail-end,\s*100%/);
  assert.match(borderGlowCss, /transparent var\(--edge-only-bottom-fade-end,\s*100%\)/);
  assert.match(borderGlowCss, /\.edgeOnly > \.edgeLight[\s\S]*?opacity:\s*calc\(1\.08/);
  assert.match(borderGlowCss, /--edge-only-hot-end,\s*4%/);
  assert.match(borderGlowCss, /--edge-only-fade-end,\s*28%/);
  assert.match(borderGlowCss, /--edge-only-tail-end,\s*58%/);
  assert.match(borderGlowCss, /--edge-only-gap-start,\s*64%/);
  assert.match(borderGlowCss, /--edge-only-return-start,\s*60%/);
  assert.match(borderGlowCss, /--edge-only-return-soft,\s*70%/);
  assert.match(borderGlowCss, /--edge-only-return-bright,\s*84%/);
  assert.match(borderGlowCss, /--edge-only-return-hot,\s*94%/);
  assert.match(borderGlowCss, /\.edgeOnly > \.edgeLight::before[\s\S]*?inset 0 0 0 1px/);
  assert.match(borderGlowCss, /\.edgeOnly > \.edgeLight::before[\s\S]*?0 0 52px 2px/);
  assert.match(borderGlowCss, /conic-gradient\(\s*from var\(--cursor-angle\)/);
  assert.match(borderGlowCss, /mix-blend-mode:\s*plus-lighter/);
});
