import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("glass field hole masks stay aligned inside scrollable surfaces", () => {
  const hook = read("components/ui/useGlassFieldHoleMask.js");

  assert.match(
    hook,
    /function localHoleRect\([\s\S]*?target,[\s\S]*?root,[\s\S]*?rootWidth,[\s\S]*?rootHeight,[\s\S]*?rootScrollLeft = 0,[\s\S]*?rootScrollTop = 0[\s\S]*?\)/
  );
  assert.doesNotMatch(
    hook,
    /function localHoleRect[\s\S]*?const rootHeight = rootRect\.height/
  );
  assert.match(
    hook,
    /rect\.top - rootRect\.top \+ rootScrollTop \+ insetY/
  );
  assert.match(
    hook,
    /const rootHeight = Math\.max\([\s\S]*?rootRect\.height \|\| root\.offsetHeight \|\| 0,[\s\S]*?root\.scrollHeight \|\| 0[\s\S]*?\);/
  );
  assert.match(
    hook,
    /localHoleRect\([\s\S]*?target,[\s\S]*?root,[\s\S]*?rootWidth,[\s\S]*?rootHeight,[\s\S]*?rootScrollLeft,[\s\S]*?rootScrollTop[\s\S]*?\)/
  );
  assert.match(
    hook,
    /maskLayer\.style\.setProperty\("height", `\$\{rootHeight\}px`\);[\s\S]*?maskLayer\.style\.setProperty\("bottom", "auto"\);/
  );
  assert.match(hook, /removeProperty\("height"\);[\s\S]*?removeProperty\("bottom"\);/);
});
