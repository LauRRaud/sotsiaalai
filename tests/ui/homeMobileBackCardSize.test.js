import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("mobile home card backs keep the visible circle as large as the front face", () => {
  const mobileCss = read("app/styles/mobile.css");
  const parentBlock = mobileCss.match(
    /\.centered-back-left,\s*\.centered-back-right\s*\{(?<body>[\s\S]*?)\n\s*\}/
  )?.groups?.body;
  const contentBlock = mobileCss.match(
    /\.centered-back-left\s+\.home-card-face-content,\s*\.centered-back-right\s+\.home-card-face-content\s*\{(?<body>[\s\S]*?)\n\s*\}/
  )?.groups?.body;

  assert.ok(parentBlock, "expected mobile back card parent rule");
  assert.ok(contentBlock, "expected mobile back card content padding rule");

  assert.match(parentBlock, /padding:\s*0;/);
  assert.doesNotMatch(parentBlock, /padding(?:-top|-bottom)?:\s*clamp/);
  assert.match(contentBlock, /padding:\s*clamp\(1\.45em,\s*5\.4vw,\s*2em\);/);
  assert.match(contentBlock, /padding-top:\s*clamp\(1\.9em,\s*6\.6vw,\s*2\.5em\);/);
  assert.match(contentBlock, /padding-bottom:\s*clamp\(1\.2em,\s*4\.1vw,\s*1\.7em\);/);
});
