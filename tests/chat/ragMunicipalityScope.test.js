import test from "node:test";
import assert from "node:assert/strict";

import {
  filterMunicipalityScopedMatches,
  isMunicipalityScopedMatch
} from "../../lib/chat/ragContext.js";
import { toResponsesInput } from "../../lib/chat/promptBuilder.js";

test("municipality scoped RAG matches are withheld until the user names a municipality", () => {
  const matches = [
    {
      text: "Koduteenus: helista 776 6587.",
      metadata: {
        collection_id: "kov_services",
        source_type: "municipality_kov",
        municipality_name: "Jogeva vald"
      }
    },
    {
      text: "Kohaliku korra paragrahv.",
      metadata: {
        collection_id: "kov_regulations",
        source_type: "riigiteataja_regulation",
        jurisdiction_level: "MUNICIPAL",
        municipality_name: "Jogeva vald"
      }
    },
    {
      text: "Sotsiaalhoolekande seaduse uldreegel.",
      metadata: {
        collection_id: "national_regulations",
        source_type: "riigiteataja_regulation",
        jurisdiction_level: "NATIONAL",
        municipality_name: null
      }
    },
    {
      text: "Ajakirjaartikkel pikaajalisest hooldusest.",
      metadata: {
        collection_id: "periodicals",
        source_type: "file"
      }
    }
  ];

  assert.equal(isMunicipalityScopedMatch(matches[0]), true);
  assert.equal(isMunicipalityScopedMatch(matches[1]), true);
  assert.equal(isMunicipalityScopedMatch(matches[2]), false);
  assert.equal(isMunicipalityScopedMatch(matches[3]), false);

  const filtered = filterMunicipalityScopedMatches(matches, {
    allowMunicipalityScoped: false
  });

  assert.deepEqual(filtered.map(item => item.text), [
    "Sotsiaalhoolekande seaduse uldreegel.",
    "Ajakirjaartikkel pikaajalisest hooldusest."
  ]);
});

test("municipality scoped RAG matches are allowed after municipality is known", () => {
  const matches = [
    {
      text: "Koduteenus: helista 776 6587.",
      metadata: {
        collection_id: "kov_services",
        source_type: "municipality_kov",
        municipality_name: "Jogeva vald"
      }
    }
  ];

  assert.equal(filterMunicipalityScopedMatches(matches, {
    allowMunicipalityScoped: true
  }).length, 1);
});

test("chat prompt forbids assuming municipality from retrieved context", () => {
  const input = toResponsesInput({
    history: [],
    userMessage: "Ma ei tule enam kodus toime. Millist abi peab vald pakkuma?",
    context: "RAG contains one local example.",
    effectiveRole: "CLIENT",
    replyLang: "et"
  });

  const system = input.input[0].content;
  assert.match(system, /Do not assume the user's municipality/);
  assert.match(system, /explain the national rule first and ask for the municipality/);
});

test("chat prompt attributes mentioned details only to user messages", () => {
  const input = toResponsesInput({
    history: [
      {
        role: "assistant",
        content: "Kui sul on Jogeva vallas elukoht, helista 776 6587."
      }
    ],
    userMessage: "Kas ma mainisin Jogevat?",
    context: "Jogeva local service entry.",
    effectiveRole: "CLIENT",
    replyLang: "et"
  });

  const system = input.input[0].content;
  assert.match(system, /judge only from user-role messages/);
  assert.match(system, /Do not treat assistant replies/);
  assert.match(system, /acknowledge the error plainly/);
});
