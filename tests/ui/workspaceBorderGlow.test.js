import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("workspace dashboard cards stay plain buttons", () => {
  const workspacePanel = read("components/chat/WorkspacePanel.jsx");

  assert.doesNotMatch(
    workspacePanel,
    /import\s+BorderGlow\s+from\s+"@\/components\/ui\/BorderGlow"/
  );
  assert.doesNotMatch(workspacePanel, /<BorderGlow[\s\S]*?as="button"/);
  assert.match(workspacePanel, /<button[\s\S]*?className=\{cn\(styles\.card/);
  assert.match(workspacePanel, /className=\{cn\(styles\.card/);
});

test("BorderGlow keeps the mesh border edge-only and pointer-driven edge light", () => {
  const borderGlow = read("components/ui/BorderGlow.jsx");
  const borderGlowCss = read("components/ui/BorderGlow.module.css");

  assert.match(borderGlow, /onPointerMove=\{handlePointerMove\}/);
  assert.match(borderGlow, /buildGradientVars\(colors\)/);
  assert.match(borderGlow, /edgeOnly\s*=\s*false/);
  assert.match(borderGlow, /animationDurationScale\s*=\s*1/);
  assert.match(borderGlow, /duration:\s*500\s*\*\s*durationScale/);
  assert.match(borderGlowCss, /\.edgeOnly::before[\s\S]*?display:\s*none/);
  assert.match(borderGlowCss, /\.edgeOnly::after[\s\S]*?display:\s*none/);
  assert.match(borderGlowCss, /\.edgeOnly > \.edgeLight[\s\S]*?black 14%/);
  assert.match(borderGlowCss, /\.edgeOnly > \.edgeLight[\s\S]*?black 86%/);
  assert.match(borderGlowCss, /\.edgeOnly > \.edgeLight::before[\s\S]*?inset 0 0 0 1px/);
  assert.match(borderGlowCss, /conic-gradient\(\s*from var\(--cursor-angle\)/);
  assert.match(borderGlowCss, /mix-blend-mode:\s*plus-lighter/);
});
