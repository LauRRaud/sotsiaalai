import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function readSource(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("home role card back faces stay decorative and unfocusable", () => {
  const source = readSource("components/HomePage.jsx");
  const backFaceTags = source.match(/<div className=\{cn\("card-face", "back"[\s\S]*?\}>/g) ?? [];

  assert.equal(backFaceTags.length, 2);
  for (const tag of backFaceTags) {
    assert.match(tag, /aria-hidden="true"/);
    assert.doesNotMatch(tag, /tabIndex=/);
    assert.doesNotMatch(tag, /onKeyDown=/);
    assert.doesNotMatch(tag, /onBlur=/);
  }

  assert.match(source, /role="link"/);
  assert.match(source, /onKeyDown=\{handleCardAccessibilityKeyDown/);
});
