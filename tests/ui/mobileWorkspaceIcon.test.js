import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("mobile workspace nav icon uses the tuned mobile shape and stroke weights", () => {
  const topNav = read("components/alalehed/chat/view/ChatMobileTopNav.jsx");
  const rightRail = read("components/chat/RightRail.jsx");
  const icons = read("components/ui/icons/ChatIcons.jsx");

  assert.match(topNav, /key:\s*"workspace",\s*scale:\s*1\.14/);
  assert.match(topNav, /outerStrokeWidth=\{1\.52\}/);
  assert.match(topNav, /innerStrokeWidth=\{1\.34\}/);
  assert.match(topNav, /variant="mobileNav"/);

  assert.match(rightRail, /outerStrokeWidth:\s*1\.52/);
  assert.match(rightRail, /innerStrokeWidth:\s*1\.34/);
  assert.match(rightRail, /variant:\s*"mobileNav"/);

  assert.match(icons, /variant = "default"/);
  assert.match(icons, /variant === "mobileNav"/);
  assert.match(icons, /x:\s*3\.18,\s*y:\s*3\.95,\s*width:\s*17\.64,\s*height:\s*16\.08/);
});
