import test from "node:test";
import assert from "node:assert/strict";

import {
  buildHelpListingCard,
  toHelpListingDetailView,
  toHelpListingView
} from "../../lib/help/listingViews.js";

test("toHelpListingView builds a human-readable listing presentation", () => {
  const listing = toHelpListingView({
    id: "request-1",
    kind: "request",
    title: "Vajan eakale transporti",
    description: "Abi poes käimisel ja arsti juurde sõidutamisel.",
    helpType: "VOLUNTARY",
    timeType: "RECURRING",
    roleLabel: "Saatja",
    status: "OPEN",
    municipality: { displayName: "Rae vald" },
    primaryCategory: { code: "TRANSPORT", labelEt: "Transport" },
    targetGroupLinks: [{ targetGroup: { code: "ELDER", labelEt: "Eakas" } }]
  }, { locale: "et", kind: "request" });

  assert.equal(listing.title, "Vajan eakale transporti");
  assert.equal(listing.categoryLabel, "Transport");
  assert.equal(listing.municipalityLabel, "Rae vald");
  assert.equal(listing.helpTypeLabel, "Vabatahtlik abi");
  assert.equal(listing.timeTypeLabel, "Regulaarne");
  assert.equal(listing.statusLabel, "Aktiivne");
});

test("buildHelpListingCard keeps DB internals out of the compact UI shape", () => {
  const card = buildHelpListingCard({
    id: "offer-1",
    kind: "offer",
    title: "Pakun transporti Tallinnas",
    summary: "Saan aidata arsti juurde sõidutamisel.",
    categoryLabel: "Transport",
    municipalityLabel: "Tallinn",
    helpTypeLabel: "Vabatahtlik abi",
    timeTypeLabel: "Paindlik",
    roleLabel: "Saatja",
    statusLabel: "Aktiivne"
  }, { locale: "et" });

  assert.match(card.title, /Pakun transporti Tallinnas/);
  assert.match(card.subtitle, /Tallinn/);
  assert.match(card.body, /Transport/);
  assert.doesNotMatch(card.body, /primaryCategoryId/);
});

test("toHelpListingDetailView keeps editing context separate from stored ids", () => {
  const detail = toHelpListingDetailView({
    id: "offer-1",
    kind: "offer",
    title: "Pakun transporti Tallinnas",
    description: "Saan aidata arsti juurde sõidutamisel ja poes käimisel.",
    rawPlace: "Õismäe",
    municipalityId: "municipality-1",
    helpType: "VOLUNTARY",
    timeType: "FLEXIBLE",
    roleLabel: "Saatja",
    status: "OPEN",
    municipality: { displayName: "Tallinn" },
    primaryCategory: { id: "cat-transport", code: "TRANSPORT", labelEt: "Transport" },
    targetGroupLinks: [{ targetGroup: { code: "ELDER", labelEt: "Eakas" } }]
  }, { locale: "et", kind: "offer" });

  assert.equal(detail.editableTitle, "Pakun transporti Tallinnas");
  assert.equal(detail.editableDescription, "Saan aidata arsti juurde sõidutamisel ja poes käimisel.");
  assert.equal(detail.municipalityId, "municipality-1");
  assert.deepEqual(detail.targetGroupCodes, ["ELDER"]);
});

