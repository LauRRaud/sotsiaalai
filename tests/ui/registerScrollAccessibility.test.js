import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("registration wheel proxy avoids preventDefault on passive non-cancelable events", () => {
  const hook = read("components/ui/useSmoothWheelProxy.js");

  assert.match(hook, /function preventDefaultIfCancelable\(event\)/);
  assert.match(hook, /event\?\.cancelable\s*===\s*false/);
  assert.doesNotMatch(hook, /(?<!function preventDefaultIfCancelable\(event\)[\s\S]{0,240})event\.preventDefault\(\);/);
});

test("centered scroll picker moves focus before hiding the focused step", () => {
  const picker = read("components/CenteredScrollPicker.jsx");
  const focusGuardIndex = picker.indexOf("const moveFocusOutOfItemBeforeHide");
  const applyGuardIndex = picker.indexOf("const applyHiddenFocusGuards");
  const hiddenLoopIndex = picker.indexOf("for (let i = 0; i < items.length; i += 1)", applyGuardIndex);

  assert.notEqual(focusGuardIndex, -1);
  assert.notEqual(applyGuardIndex, -1);
  assert.notEqual(hiddenLoopIndex, -1);
  assert.ok(focusGuardIndex < hiddenLoopIndex);
  assert.match(picker, /moveFocusOutOfItemBeforeHide\(items\[i\], items\[newActiveIdx\]\)/);
  assert.match(picker, /focus\(\{\s*preventScroll:\s*true\s*\}\)/);
});
