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
    /function localHoleRect\(target,\s*root,\s*rootScrollLeft = 0,\s*rootScrollTop = 0\)/
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
    /maskLayer\.style\.setProperty\("height", `\$\{rootHeight\}px`\);[\s\S]*?maskLayer\.style\.setProperty\("bottom", "auto"\);/
  );
  assert.match(hook, /removeProperty\("height"\);[\s\S]*?removeProperty\("bottom"\);/);
});
