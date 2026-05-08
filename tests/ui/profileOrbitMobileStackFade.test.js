import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("mobile profile orbit stack keeps top and bottom fade visible", () => {
  const mobileCss = read("app/styles/mobile.css");

  assert.match(
    mobileCss,
    /\.profile-orbit-stack-fade\s*\{\s*display:\s*block\s*!important;/,
    "the late mobile override must keep stack fades visible"
  );
  assert.doesNotMatch(
    mobileCss,
    /\.profile-orbit-stack-fade\s*\{\s*display:\s*none\s*!important;/,
    "a late generic mobile override must not hide the orbit stack fades"
  );
  assert.match(
    mobileCss,
    /\.profile-orbit-stack-fade--top\s*\{[\s\S]*?top:\s*0\s*!important;/,
    "top fade remains pinned to the top edge"
  );
  assert.match(
    mobileCss,
    /\.profile-orbit-stack-fade--bottom\s*\{[\s\S]*?bottom:\s*0\s*!important;/,
    "bottom fade remains pinned to the bottom edge"
  );
});
