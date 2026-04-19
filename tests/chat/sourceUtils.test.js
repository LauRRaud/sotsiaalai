import test from "node:test";
import assert from "node:assert/strict";

import {
  collapsePages,
  formatSourceLabel,
  normalizePageRange,
  normalizeSources
} from "../../components/chat/utils/sources.js";

test("source page helpers do not expose technical page zero", () => {
  assert.equal(collapsePages([0]), "");
  assert.equal(collapsePages([0, 2, 3]), "2-3");
  assert.equal(normalizePageRange("0"), "");
  assert.equal(normalizePageRange("0, 2-3"), "2-3");
});

test("source labels and normalized source page ranges omit page zero", () => {
  assert.equal(
    formatSourceLabel({
      title: "Toetatud elamise teenus",
      pageRange: "0"
    }),
    "Toetatud elamise teenus."
  );

  assert.equal(
    normalizeSources([
      {
        title: "Toetatud elamise teenus",
        page: 0
      }
    ])[0].pageRange,
    undefined
  );
});

test("source labels prefer paragraph titles over generic sections", () => {
  assert.equal(
    formatSourceLabel({
      title: "Eesti - Sotsiaalhoolekande seadus - § 10",
      section: "Üldsätted",
      paragraphTitle: "Lapse juhtumiplaan"
    }),
    "Eesti - Sotsiaalhoolekande seadus - § 10. Lapse juhtumiplaan."
  );
});
