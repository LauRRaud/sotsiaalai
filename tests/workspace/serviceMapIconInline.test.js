import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function readSource(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("workspace service map card renders its icon inline without a late-loading mask asset", () => {
  const componentSource = readSource("components/chat/WorkspacePanel.jsx");
  const stylesSource = readSource("components/chat/WorkspacePanel.module.css");

  assert.match(componentSource, /if \(type === "map"\)[\s\S]*?<svg[\s\S]*?viewBox="0 0 34\.12 32\.89"/);
  assert.match(componentSource, /if \(type === "map"\)[\s\S]*?M25\.07,29\.15c-\.51\.01-1\.09-\.72-1\.14-\.79/);
  assert.match(componentSource, /if \(type === "map"\)[\s\S]*?M19\.8,19\.68c-\.66,0-1\.34-\.34-1\.82-\.91/);
  assert.match(componentSource, /if \(type === "map"\)[\s\S]*?M5\.34,23\.68c-\.81\.85-\.03,2\.26\.79\.86/);
  assert.match(componentSource, /fill="currentColor" mask=\{`url\(#\$\{serviceMapLogoMaskId\}\)`\}/);
  assert.doesNotMatch(componentSource, /M4\.3 14\.95 5\.9 14\.2l-\.62-1\.1/);
  assert.doesNotMatch(componentSource, /serviceMapLogoIcon/);
  assert.doesNotMatch(stylesSource, /serviceMapLogoIcon/);
  assert.doesNotMatch(stylesSource, /eesti_kontuurkaart_logo\.svg/);
});
