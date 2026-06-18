import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("chat rail tooltip anchor cannot steal hover from the active rail icon", () => {
  const css = read("components/chat/rail.module.css");
  const combinedAnchorRule =
    css.match(/\.item\.tooltipAnchor\s*\{(?<body>[\s\S]*?)\n\}/)?.groups?.body ||
    "";

  assert.match(combinedAnchorRule, /pointer-events:\s*none;/);
  assert.doesNotMatch(combinedAnchorRule, /!important/);
});
