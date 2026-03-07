import test from "node:test";
import assert from "node:assert/strict";

import { analyzeHelpChatIntent, detectHelpChatIntent } from "../../lib/help/intents.js";

test("detectHelpChatIntent recognizes starting a help offer workflow from natural Estonian phrasing", () => {
  assert.equal(
    detectHelpChatIntent("Tere, soovin sisestada abipakkumise."),
    "create_help_offer"
  );
});

test("detectHelpChatIntent recognizes starting a help request workflow from natural Estonian phrasing", () => {
  assert.equal(
    detectHelpChatIntent("Soovin sisestada abipalve."),
    "create_help_request"
  );
});

test("detectHelpChatIntent recognizes offering transport in a municipality", () => {
  assert.equal(
    detectHelpChatIntent("Soovin pakkuda transporti Tabasalus."),
    "create_help_offer"
  );
});

test("detectHelpChatIntent recognizes direct helper phrasing without the word abipakkumine", () => {
  assert.equal(
    detectHelpChatIntent("Aitan transpordiga Tabasalus kolmapäeval."),
    "create_help_offer"
  );
});

test("detectHelpChatIntent recognizes a timed transport offer", () => {
  assert.equal(
    detectHelpChatIntent("Pakun nädalavahetusel transporti Tallinnas."),
    "create_help_offer"
  );
});

test("detectHelpChatIntent recognizes a helper offer for grocery support", () => {
  assert.equal(
    detectHelpChatIntent("Saan aidata eakat poes käimisega."),
    "create_help_offer"
  );
});

test("detectHelpChatIntent recognizes natural request phrasing without the word abipalve", () => {
  assert.equal(
    detectHelpChatIntent("Mul on vaja transporti Tabasalus."),
    "create_help_request"
  );
});

test("detectHelpChatIntent recognizes a grocery-support need", () => {
  assert.equal(
    detectHelpChatIntent("Mul oleks vaja emale abi poes käimiseks."),
    "create_help_request"
  );
});

test("detectHelpChatIntent recognizes a search for a personal assistant", () => {
  assert.equal(
    detectHelpChatIntent("Otsin isiklikku abistajat."),
    "create_help_request"
  );
});

test("detectHelpChatIntent treats likely mediation questions as help requests", () => {
  assert.equal(
    detectHelpChatIntent("Kas keegi pakub transporti Tabasalus?"),
    "create_help_request"
  );
});

test("detectHelpChatIntent does not treat municipality/service info seeking as a help listing request", () => {
  assert.equal(
    detectHelpChatIntent("Elan selles kohalikus omavalitsuses ja vajan infot abi saamiseks."),
    "service_guidance"
  );
});

test("detectHelpChatIntent keeps category words out of trigger logic for info-seeking questions", () => {
  assert.equal(
    detectHelpChatIntent("Mul oleks vaja infot koduhoolduse kohta meie koduvallas."),
    "service_guidance"
  );
});

test("detectHelpChatIntent keeps service-info searches out of mediation workflow", () => {
  assert.equal(
    detectHelpChatIntent("Otsin infot tugiisiku teenuse kohta Tallinnas."),
    "service_guidance"
  );
});

test("detectHelpChatIntent keeps KOV service questions in service guidance", () => {
  assert.equal(
    detectHelpChatIntent("Kas tugiisik võiks olla KOV teenus või peaksin ise otsima?"),
    "service_guidance"
  );
});

test("analyzeHelpChatIntent exposes why a natural offer matched", () => {
  const result = analyzeHelpChatIntent("Soovin pakkuda transporti Tabasalus.");

  assert.equal(result.intent, "create_help_offer");
  assert.ok(result.signals.offerStrength >= 1);
  assert.equal(result.signals.substantive, true);
});

test("analyzeHelpChatIntent marks informational KOV queries as service guidance", () => {
  const result = analyzeHelpChatIntent("Elan selles kohalikus omavalitsuses ja vajan infot abi saamiseks.");

  assert.equal(result.intent, "service_guidance");
  assert.equal(result.signals.hasInformationalIntent, true);
});

test("detectHelpChatIntent still routes browsing requests correctly", () => {
  assert.equal(
    detectHelpChatIntent("Näita mulle aktiivseid abipakkumisi Tallinnas."),
    "browse_help_offers"
  );
});
