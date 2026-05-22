import assert from "node:assert/strict";
import test from "node:test";

import {
  getWellbeingToolBySlug,
  wellbeingTools
} from "../../lib/wellbeingTools.js";

test("wellbeing workspace exposes the twelve configured tool cards in order", () => {
  assert.equal(wellbeingTools.length, 12);

  assert.deepEqual(
    wellbeingTools.map((tool) => tool.title),
    [
      "Kiirkontroll",
      "Ülevaade",
      "Raske juhtum",
      "Töövägivald",
      "Kovisioon",
      "Kolleegitugi",
      "Raportid",
      "Tööpiirid",
      "Tööprotsessid",
      "Selgitused",
      "Alustaja tugi",
      "Meeskond"
    ]
  );

  const routes = wellbeingTools.map((tool) => tool.route);
  assert.equal(new Set(routes).size, wellbeingTools.length);
  for (const tool of wellbeingTools) {
    assert.match(tool.id, /^[a-z0-9-]+$/);
    assert.match(tool.route, /^\/tooheaolu\/[a-z0-9-]+$/);
    assert.equal(typeof tool.description, "string");
    assert.ok(tool.description.length > 12);
    assert.equal(typeof tool.icon, "string");
  }
});

test("wellbeing tools can be resolved by route slug", () => {
  assert.equal(getWellbeingToolBySlug("kiirkontroll")?.id, "quick-check");
  assert.equal(getWellbeingToolBySlug("toovagivald")?.title, "Töövägivald");
  assert.equal(getWellbeingToolBySlug("puudub"), null);
});
