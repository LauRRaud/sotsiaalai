import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { readCssSourceBundle } from "../helpers/cssSourceBundle.mjs";
import { readMobileCssBundle } from "../helpers/mobileCssBundle.mjs";


function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("workspace modal headers use the shared glass subpage title contract", () => {
  const glassStyles = read("components/ui/glassPageStyles.js");
  const helpListings = read("components/chat/HelpListingsPanel.jsx");
  const selectedListing = read("components/chat/SelectedListingContext.jsx");
  const helpersCss = readCssSourceBundle("app/styles/utilities/helpers.css");
  const mobileCss = readMobileCssBundle();
  const helpListingsCss = readCssSourceBundle("app/styles/components/workspace-help-listings.css");
  const selectedListingCss = readCssSourceBundle("app/styles/components/selected-listing.css");
  const hcCss = read("app/styles/theme/hc.css");

  assert.match(glassStyles, /text-\[2\.15rem\]/);
  assert.doesNotMatch(glassStyles, /text-\[2\.15em\]/);
  assert.doesNotMatch(helpListings, /headerClassName="help-listings-title-wrap"|titleClassName="help-listings-title/);
  assert.doesNotMatch(selectedListing, /headerClassName="selected-listing-title-wrap"|titleClassName="selected-listing-title/);
  assert.doesNotMatch(mobileCss, /help-listings-title-wrap|selected-listing-title-wrap/);
  assert.doesNotMatch(hcCss, /help-listings-title|selected-listing-title/);
  assert.match(helpListingsCss, /\.help-listings-modal-content \.glass-subpage-header/);
  assert.match(selectedListingCss, /\.selected-listing-modal-content :is\(\.glass-subpage-header \+ div, \.panel\)/);
  assert.match(
    helpersCss,
    /:is\([\s\S]*?\.invite-modal-content--workspace,[\s\S]*?\.help-listings-modal-content--workspace[\s\S]*?\)\.workspace-guide-panel\.glass-subpage-surface[\s\S]*?> \.glass-subpage-header\s*\{[\s\S]*?margin-top:\s*0\s*!important;/
  );
  assert.match(helpersCss, /\.invite-modal-content--workspace \.invite-workspace-title-wrap[\s\S]*?padding-top:\s*0\.28rem\s*!important;/);
});
