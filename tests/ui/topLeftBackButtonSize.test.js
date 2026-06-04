import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(path, "utf8");
}

test("shared top-left back button is smaller on desktop while mobile size is unchanged", () => {
  const styles = read("components/ui/glassPageStyles.js");

  assert.match(styles, /glassPageBackMobileBottomCenterClassName[\s\S]*?max-\[768px\]:h-\[4\.2rem\][\s\S]*?max-\[768px\]:w-\[4\.2rem\]/);
  assert.match(styles, /glassPageBackMobileBottomCenterClassName[\s\S]*?max-\[768px\]:\[&>svg\]:h-\[4\.2rem\][\s\S]*?max-\[768px\]:\[&>svg\]:w-\[4\.2rem\]/);
  assert.match(styles, /glassPageBackTopLeftClassName[\s\S]*?min-\[769px\]:!h-\[4\.65rem\][\s\S]*?min-\[769px\]:!w-\[4\.65rem\]/);
  assert.match(styles, /glassPageBackTopLeftClassName[\s\S]*?min-\[769px\]:\[&>svg\]:!h-\[4\.65rem\][\s\S]*?min-\[769px\]:\[&>svg\]:!w-\[4\.65rem\]/);
  assert.doesNotMatch(styles, /glassPageBackTopLeftClassName[\s\S]*?min-\[769px\]:!h-\[5rem\]/);
});

test("subpage headers inherit the shared top-left back button sizing", () => {
  const styles = read("components/ui/glassPageStyles.js");
  const header = read("components/ui/GlassSubpageHeader.jsx");

  assert.match(styles, /glassSubpageBackButtonClassName\s*=[\s\S]*?\$\{glassPageBackTopLeftClassName\}/);
  assert.match(header, /className=\{cn\([\s\S]*?glassSubpageBackButtonClassName[\s\S]*?backClassName[\s\S]*?\)\}/);
});
