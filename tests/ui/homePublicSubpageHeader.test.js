import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("home public subpages keep the shared mobile glass card gap", () => {
  const features = read("components/alalehed/VoimalusedBody.jsx");
  const pricing = read("components/alalehed/HinnastusBody.jsx");

  for (const source of [features, pricing]) {
    assert.match(source, /<GlassSubpageHeader[\s\S]*?titleId=/);
    assert.doesNotMatch(source, /--mobile-glass-card-gap/);
    assert.doesNotMatch(source, /headerClassName=|titleClassName=|backClassName=/);
  }
});

test("home quick links route to the checked public glass subpages", () => {
  const homeAbout = read("components/HomeSections/HomeAboutSection.jsx");

  for (const pathname of [
    "/voimalused",
    "/kasutusjuhend",
    "/kasutustingimused",
    "/privaatsustingimused",
    "/hinnastus"
  ]) {
    assert.match(homeAbout, new RegExp(`href[:=]\\s*"${pathname}"`));
  }
});
