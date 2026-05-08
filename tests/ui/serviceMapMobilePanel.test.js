import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("service map mobile filter panel stays within the viewport when opened", () => {
  const styles = read("app/styles/components/service-map.css");
  const mobile560 = styles.match(/@media \(max-width: 560px\) \{([\s\S]*)\n\}/)?.[1] || "";
  const openPanel = mobile560.match(/\.service-map-workspace__filters \{([\s\S]*?)\n  \}/)?.[1] || "";
  const collapsedPanel = mobile560.match(/\.service-map-workspace__filters--collapsed \{([\s\S]*?)\n  \}/)?.[1] || "";
  const toggle = mobile560.match(/\.service-map-workspace__toggle \{([\s\S]*?)\n  \}/)?.[1] || "";

  assert.match(openPanel, /left:\s*calc\(env\(safe-area-inset-left,\s*0px\) \+ 0\.42rem\);/);
  assert.match(openPanel, /right:\s*calc\(env\(safe-area-inset-right,\s*0px\) \+ 0\.42rem\);/);
  assert.match(openPanel, /transform:\s*none;/);
  assert.match(collapsedPanel, /transform:\s*none;/);
  assert.match(toggle, /left:\s*50%;/);
  assert.match(toggle, /transform:\s*translateX\(-50%\);/);
});
