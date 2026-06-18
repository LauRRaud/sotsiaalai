import { readFile } from "node:fs/promises";
import { test } from "node:test";
import assert from "node:assert/strict";

function read(path) {
  return readFile(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("Android mobile CSS keeps feature rules beside their owners", async () => {
  const platformCss = await read("app/styles/mobile/platform-android.css");
  const policyCss = await read("app/styles/features/policy/android-mobile.css");
  const profileCss = await read("app/styles/features/profile/android-mobile.css");

  assert.doesNotMatch(platformCss, /\.policy-/);
  assert.doesNotMatch(platformCss, /\.profile-/);

  assert.match(policyCss, /data-platform="android"[\s\S]*\.policy-section-heading/);
  assert.match(profileCss, /data-platform="android"[\s\S]*\.profile-container/);
});
