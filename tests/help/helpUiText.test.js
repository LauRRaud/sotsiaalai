import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { getHelpUiText } from "../../components/chat/helpUiText.js";

const REQUIRED_KEYS = [
  "helpRequests",
  "helpOffers",
  "myHelpRequests",
  "myHelpOffers",
  "loadMore",
  "loading",
  "emptyGlobalRequests",
  "emptyGlobalOffers",
  "emptyMyRequests",
  "emptyMyOffers",
  "openListing",
  "listingSingular",
  "listingPlural",
  "close",
  "edit",
  "save",
  "cancel",
  "delete",
  "deleteConfirm",
  "closeListing",
  "askAi",
  "contact",
  "offerHelp",
  "startChat",
  "selectOwnListing",
  "selectedListing",
  "ownListing",
  "updateFailed",
  "deleteFailed",
  "loadFailed",
  "detailLoadFailed",
  "connectFailed",
  "title",
  "description",
  "roleLabel",
  "helpType",
  "timeType",
  "targetGroups",
  "emptyOption",
  "voluntaryLabel",
  "paidLabel",
  "mixedLabel",
  "oneTimeLabel",
  "recurringLabel",
  "flexibleLabel",
  "statusClosed",
  "noOwnOptions",
  "targetGroupsHint",
  "aiPromptPrefix"
];

function readMessages(locale) {
  const filePath = path.join(process.cwd(), "messages", `${locale}.json`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

test("help UI copy is sourced from messages JSON for et, en, and ru", () => {
  for (const locale of ["et", "en", "ru"]) {
    const bundle = readMessages(locale);
    const help = bundle?.chat?.help;

    assert.ok(help && typeof help === "object", `${locale}: chat.help missing`);
    for (const key of REQUIRED_KEYS) {
      assert.equal(typeof help[key], "string", `${locale}: missing ${key}`);
      assert.ok(help[key].length > 0, `${locale}: empty ${key}`);
    }
  }
});

test("getHelpUiText resolves a full help UI shape from the i18n translator", () => {
  const fakeT = (key) => `value:${key}`;
  const copy = getHelpUiText(fakeT);

  for (const key of REQUIRED_KEYS) {
    assert.equal(copy[key], `value:chat.help.${key}`);
  }
});
