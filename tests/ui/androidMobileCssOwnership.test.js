import { readFile } from "node:fs/promises";
import { test } from "node:test";
import assert from "node:assert/strict";

function read(path) {
  return readFile(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("Android mobile CSS keeps feature rules beside their owners", async () => {
  const globalMobileCss = await read("app/styles/mobile.css");
  const accessibilityFieldsCss = await read("app/styles/features/accessibility/fields.css");
  const policyCss = await read("app/styles/features/policy/android-mobile.css");
  const profileCss = await read("app/styles/features/profile/android-mobile.css");
  const policyIndexCss = await read("app/styles/features/policy/index.css");
  const profileIndexCss = await read("app/styles/features/profile/index.css");

  assert.doesNotMatch(globalMobileCss, /platform-android\.css/);
  assert.doesNotMatch(globalMobileCss, /features\/(?:policy|profile)\/android-mobile\.css/);
  assert.match(accessibilityFieldsCss, /\.a11y-screenprofile-option--bottom/);

  assert.match(policyIndexCss, /@import url\("\.\/android-mobile\.css"\);/);
  assert.match(profileIndexCss, /@import url\("\.\/android-mobile\.css"\);/);
  assert.match(policyCss, /data-platform="android"[\s\S]*\.policy-section-heading/);
  assert.match(profileCss, /data-platform="android"[\s\S]*\.profile-container/);
});
