import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("document agent conversation and composer use edge-only BorderGlow shells", () => {
  const agentPage = read("components/agent/AgentModePage.jsx");

  assert.match(
    agentPage,
    /import\s+BorderGlow\s+from\s+"@\/components\/ui\/BorderGlow"/
  );
  assert.match(agentPage, /className="documents-agent-glow-window"/);
  assert.match(agentPage, /className="documents-agent-glow-composer"/);
  assert.match(agentPage, /edgeOnly/);
  assert.match(agentPage, /glowColor="358 82 72"/);
  assert.match(agentPage, /glowIntensity=\{0\.62\}/);
  assert.match(agentPage, /coneSpread=\{20\}/);
  assert.match(agentPage, /fillOpacity=\{0\}/);
  assert.doesNotMatch(agentPage, /animated/);
});

test("document agent glow shells own the visible card and field chrome", () => {
  const css = read("app/styles/components/documents-mode.css");

  assert.match(css, /\.documents-agent-glow-window/);
  assert.match(css, /\.documents-agent-glow-composer/);
  assert.match(
    css,
    /\.documents-agent-glow-window,\s*\n\.documents-agent-glow-composer\s*\{[\s\S]*?rgba\(255,\s*255,\s*255,\s*0\.08\)[\s\S]*?64%, transparent\) !important/
  );
  assert.match(
    css,
    /\.documents-agent-glow-window:hover,[\s\S]*?\.documents-agent-glow-composer:focus-within\s*\{[\s\S]*?rgba\(255,\s*255,\s*255,\s*0\.13\)[\s\S]*?60%, transparent\) !important/
  );
  assert.match(
    css,
    /\.documents-agent-glow-window\s+\.documents-agent-conversation-window[\s\S]*?background:\s*transparent\s*!important/
  );
  assert.match(
    css,
    /:root:not\(\.theme-light\):not\(\.theme-mid\)[\s\S]*?\.documents-agent-glow-window[\s\S]*?\.documents-agent-conversation-window[\s\S]*?background:\s*transparent\s*!important/
  );
  assert.match(
    css,
    /\.documents-agent-glow-composer\s+\.chat-inputbar[\s\S]*?background:\s*transparent\s*!important/
  );
  assert.match(
    css,
    /\.documents-agent-glow-composer\s+\.chat-inputbar[\s\S]*?border:\s*0\s*!important/
  );
});
