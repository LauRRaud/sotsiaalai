import test from "node:test";
import assert from "node:assert/strict";

import { detectMentionedMunicipalitiesFromUserText } from "../../lib/chat/requestContext.js";

test("detectMentionedMunicipalitiesFromUserText distinguishes Viljandi vald inflection from city", async () => {
  const matches = await detectMentionedMunicipalitiesFromUserText(
    [],
    "kas viljandi valla sotsiaalteenused on andmebaasis?"
  );
  const partitiveMatches = await detectMentionedMunicipalitiesFromUserText([], "kolin Viljandi valda");

  assert.deepEqual(matches.map(item => item.id), ["viljandi_vald"]);
  assert.deepEqual(matches.map(item => item.displayName), ["Viljandi vald"]);
  assert.deepEqual(partitiveMatches.map(item => item.id), ["viljandi_vald"]);
});

test("detectMentionedMunicipalitiesFromUserText distinguishes Viljandi linn inflection from parish", async () => {
  const matches = await detectMentionedMunicipalitiesFromUserText([], "aga viljandi linna?");

  assert.deepEqual(matches.map(item => item.id), ["viljandi_linn"]);
  assert.deepEqual(matches.map(item => item.displayName), ["Viljandi linn"]);
});

test("detectMentionedMunicipalitiesFromUserText resolves settlement aliases to KOV scope", async () => {
  const ihasteMatches = await detectMentionedMunicipalitiesFromUserText(
    [],
    "mis sotsiaalteenuseid ja toetusi Ihastes pakutakse?"
  );
  const kaberneemeMatches = await detectMentionedMunicipalitiesFromUserText([], "aga Kaberneeme?");

  assert.deepEqual(ihasteMatches.map(item => item.id), ["tartu_linn"]);
  assert.deepEqual(ihasteMatches.map(item => item.displayName), ["Tartu linn"]);
  assert.deepEqual(ihasteMatches.map(item => item.matchedLocation), ["Ihaste"]);
  assert.deepEqual(kaberneemeMatches.map(item => item.id), ["joelahtme_vald"]);
  assert.deepEqual(kaberneemeMatches.map(item => item.displayName), ["Jõelähtme vald"]);
});
