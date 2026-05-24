import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("covision home separates start, own cases and practice examples", () => {
  const source = read("components/covision/CovisionPage.jsx");

  assert.match(source, /Alusta uut kovisiooni/);
  assert.match(source, /Minu kovisioonid/);
  assert.match(source, /Praktikan(?:ä|Ć¤)ited/);
  assert.match(source, /startCase/);
  assert.doesNotMatch(source, /view === "overview"[\s\S]*?Anon(?:ü|Ć¼Ć¼)mne olukorrakirjeldus[\s\S]*?Keskne k(?:ü|Ć¼)simus/);
});

test("covision creation is a single stepped panel flow", () => {
  const source = read("components/covision/CovisionPage.jsx");

  assert.match(source, /caseCreationSteps/);
  assert.match(source, /P(?:õ|Ćµ)hiinfo/);
  assert.match(source, /Anon(?:üü|Ć¼Ć¼)mne olukorrakirjeldus/);
  assert.match(source, /Olukorra kulg/);
  assert.match(source, /Keskne k(?:ü|Ć¼)simus ja ootus/);
  assert.match(source, /(?:Ü|Ć)levaade ja salvesta/);
  assert.match(source, /setCaseStep/);
});

test("covision creation does not expose client journey terminology", () => {
  const source = read("components/covision/CovisionPage.jsx");

  assert.doesNotMatch(source, /Kliendi teekond/);
  assert.match(source, /Olukorra kulg/);
  assert.match(source, /T(?:ö|Ć¶)(?:ö|Ć¶)protsessi etapid/);
});

test("covision cannot be saved without explicit anonymity confirmation", () => {
  const source = read("components/covision/CovisionPage.jsx");
  const domain = read("lib/covision.js");

  assert.match(source, /Kinnitan, et juhtumip(?:ü|Ć¼)stitus on anon(?:üü|Ć¼Ć¼)mne/);
  assert.match(source, /caseForm\.anonymityConfirmed/);
  assert.match(source, /Salvesta ja ava kovisiooniruum/);
  assert.match(source, /!caseForm\.anonymityConfirmed/);
  assert.match(domain, /anonymityConfirmed_required/);
});

test("covision room centers a case canvas and typed contributions", () => {
  const source = read("components/covision/CovisionPage.jsx");

  assert.match(source, /Juhtumil(?:õ|Ćµ)uend/);
  assert.match(source, /Kolleegide k(?:ü|Ć¼)simused/);
  assert.match(source, /Peegeldused ja v(?:õ|Ćµ)imalikud seletused/);
  assert.match(source, /Ettepanekud/);
  assert.match(source, /J(?:ä|Ć¤)rgmised sammud/);
  assert.match(source, /Lahtised k(?:ü|Ć¼)simused/);
  assert.match(source, /messageType/);
  assert.match(source, /ADDED_TO_CANVAS|lisatud l(?:õ|Ćµ)uendile/i);
  assert.match(source, /CONVERTED_TO_NEXT_STEP|muudetud j(?:ä|Ć¤)rgmiseks sammuks/i);
});

test("covision room has invite, audio and request-to-speak surfaces outside creation", () => {
  const source = read("components/covision/CovisionPage.jsx");

  assert.match(source, /Kutsu osaleja/);
  assert.match(source, /CovisionCallBar/);
  assert.match(source, /contextType="COVISION"/);
  assert.match(source, /Soovin s(?:õ|Ćµ)na/);
  assert.match(source, /S(?:õ|Ćµ)nasoovid/);
  assert.doesNotMatch(source, /SectionPanel title="7\. Keda kutsun arutelusse\?"/);
});
