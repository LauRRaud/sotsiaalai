import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("profile dim theme icon reads as a restrained sunrise or sunset", () => {
  const profileBody = read("components/alalehed/ProfiilBody.jsx");

  assert.match(profileBody, /function ThemeMidDockIcon/);
  assert.match(profileBody, /strokeWidth="1\.52"/);
  assert.match(profileBody, /M4\.1 12\.75h15\.8/);
  assert.match(profileBody, /M6\.8 12\.75a5\.2 5\.2 0 0 1 10\.4 0/);
  assert.match(profileBody, /M5\.7 15\.5h12\.6/);
  assert.match(profileBody, /<ThemeMidDockIcon width=\{33\} height=\{33\}/);
  assert.doesNotMatch(profileBody, /ThemeMidDockIcon width=\{30\} height=\{30\} className="scale-\[1\.12\]"/);
  assert.doesNotMatch(profileBody, /<circle cx="12" cy="12" r="6\.25"/);
  assert.doesNotMatch(profileBody, /M12 5\.75a6\.25 6\.25 0 0 0 0 12\.5z/);
  assert.doesNotMatch(profileBody, /mid-sun-disc-clip/);
  assert.doesNotMatch(profileBody, /clipPath="url\(#mid-sun/);
});
