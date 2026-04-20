import test from "node:test";
import assert from "node:assert/strict";

import {
  isAssistantSourceUiIssue,
  isLikelyConversationalTurn,
  shouldUseExternalSourcesForTurn
} from "../../lib/chat/sourceNeed.js";

test("source need skips conversational and platform feedback turns", () => {
  assert.equal(shouldUseExternalSourcesForTurn("mina olen Laur. selle platvormi looja"), false);
  assert.equal(shouldUseExternalSourcesForTurn("tundub koik hea?"), false);
  assert.equal(shouldUseExternalSourcesForTurn("Jah, tundub koik hea."), false);
  assert.equal(isLikelyConversationalTurn("tundub koik hea?"), true);
});

test("source need treats assistant source UI issues as no external lookup", () => {
  assert.equal(isAssistantSourceUiIssue("miks laks kaasa tarbetult allikad?"), true);
  assert.equal(isAssistantSourceUiIssue("mida teha, et selliseid vastuseid ei tekiks? ilma otsese allikavajaduseta"), true);
  assert.equal(shouldUseExternalSourcesForTurn("mida teha, et selliseid vastuseid ei tekiks? ilma otsese allikavajaduseta"), false);
});

test("source need keeps legal and social service questions source grounded", () => {
  assert.equal(shouldUseExternalSourcesForTurn("Kas sotsiaalhoolekande seaduse paragrahv 10 on olemas?"), true);
  assert.equal(shouldUseExternalSourcesForTurn("Kuidas taotleda Jogeva vallas koduteenust?"), true);
  assert.equal(shouldUseExternalSourcesForTurn("Mis tingimustel saab puudega lapse toetust?"), true);
});

test("source need can default RAG mode to source lookup for substantive turns", () => {
  assert.equal(shouldUseExternalSourcesForTurn("Võimaluste kohvik on või oli olemas?", {
    defaultToExternalSources: true
  }), true);
  assert.equal(shouldUseExternalSourcesForTurn("tere", {
    defaultToExternalSources: true
  }), false);
});

test("source need searches short followups in RAG mode when there is history", () => {
  assert.equal(shouldUseExternalSourcesForTurn("jah", {
    defaultToExternalSources: true
  }), false);
  assert.equal(shouldUseExternalSourcesForTurn("jah", {
    defaultToExternalSources: true,
    hasHistory: true
  }), true);
  assert.equal(shouldUseExternalSourcesForTurn("tere", {
    defaultToExternalSources: true,
    hasHistory: true
  }), false);
});

test("source need searches short comments and advice questions in default RAG mode", () => {
  assert.equal(shouldUseExternalSourcesForTurn("mul on täna halb tuju", {
    defaultToExternalSources: true
  }), true);
  assert.equal(shouldUseExternalSourcesForTurn("mida teha kui on halb tuju?", {
    defaultToExternalSources: true
  }), true);
});
