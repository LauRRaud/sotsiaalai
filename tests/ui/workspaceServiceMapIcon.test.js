import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("workspace service map card uses an Estonia outline with a location marker", () => {
  const workspacePanel = read("components/chat/WorkspacePanel.jsx");
  const styles = read("components/chat/WorkspacePanel.module.css");
  const logo = read("public/icons/eesti_kontuurkaart_logo.svg");

  assert.match(workspacePanel, /type === "map"/);
  assert.match(workspacePanel, /className=\{styles\.serviceMapLogoIcon\}/);
  assert.match(styles, /\.serviceMapLogoIcon/);
  assert.match(styles, /width:\s*132%/);
  assert.match(styles, /height:\s*132%/);
  assert.match(styles, /margin:\s*-16%/);
  assert.match(styles, /url\("\/icons\/eesti_kontuurkaart_logo\.svg"\)/);
  assert.match(logo, /viewBox="0 0 34\.12 32\.89"/);
  assert.match(logo, /M19\.8,19\.68/);
  assert.match(logo, /<mask id="map-cutout"/);
  assert.match(logo, /mask="url\(#map-cutout\)"/);
  assert.doesNotMatch(workspacePanel, /estoniaMapShape/);
  assert.doesNotMatch(styles, /estoniaMapShape/);
  assert.doesNotMatch(styles, /eesti_kontuurkaart\.svg/);
  assert.doesNotMatch(workspacePanel, /M9 18\.65 4\.7 20\.1V6\.1L9 4\.65/);
  assert.match(
    workspacePanel,
    /key:\s*"service_map"[\s\S]*?icon:\s*"map"/
  );
});
