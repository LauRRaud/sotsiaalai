import test from "node:test";
import assert from "node:assert/strict";

import {
  displayUrl,
  displayUrlsInText,
  filterMunicipalityScopedMatches,
  isMunicipalityScopedMatch
} from "../../lib/chat/ragContext.js";
import { buildResponsesPayload, toResponsesInput } from "../../lib/chat/promptBuilder.js";

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

test("RAG context renders punycode URLs as readable IDN URLs", () => {
  assert.equal(
    displayUrl("https://xn--jgeva-dua.ee/sites/default/files/documents/2024-01/Sotsiaalabi_%20taotlus.pdf"),
    "https://j\u00f5geva.ee/sites/default/files/documents/2024-01/Sotsiaalabi_%20taotlus.pdf"
  );
  assert.equal(
    displayUrlsInText("Link: https://xn--jgeva-dua.ee/koduteenus."),
    "Link: https://j\u00f5geva.ee/koduteenus."
  );
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
  assert.match(system, /explain the national rule first, then ask which municipality or city/);
  assert.match(system, /Ask that municipality question directly/);
  assert.match(system, /do not offer to draft a letter, application, or call script before asking for the municipality/);
  assert.match(system, /Once the municipality is known/);
  assert.match(system, /provide that specific contact or form instead of a generic department or unrelated contact/);
  assert.match(system, /end with exactly one question asking which municipality or city applies/);
  assert.match(system, /include those details before any optional offer to draft wording/);
  assert.match(system, /provide it and stop without offering another version/);
});

test("client prompt layers social support answers without treating research as law", () => {
  const input = toResponsesInput({
    history: [],
    userMessage: "Kas saan hoolduskoormuse tĆµttu abi?",
    context: "Sotsiaalhoolekande seadus. Omastehoolduse uuring.",
    effectiveRole: "CLIENT",
    replyLang: "et"
  });

  const system = input.input[0].content;
  assert.match(system, /social services, benefits, support needs, care burden/);
  assert.match(system, /national legal frame or Social Welfare Act \(SHS\) principle/);
  assert.match(system, /concrete municipality regulation or service information/);
  assert.match(system, /practical explanation of what the service, assessment, or next step means/);
  assert.match(system, /research, monitoring, or report background/);
  assert.match(system, /Do not present research, monitoring, or policy reports as a legal basis/);
  assert.match(system, /For people seeking help, keep the legal frame short/);
  assert.match(system, /If the municipality is missing, still give the national frame/);
});

test("social worker prompt asks for legal, local, practical and evidence layers", () => {
  const input = toResponsesInput({
    history: [],
    userMessage: "Kuidas pĆµhjendada koduteenuse vajadust?",
    context: "SHS. KOV koduteenuse kord. Hoolduskoormuse hindamise metoodika.",
    effectiveRole: "SOCIAL_WORKER",
    replyLang: "et"
  });

  const system = input.input[0].content;
  assert.match(system, /make the source distinction explicit in plain professional language/);
  assert.match(system, /national rule, local rule or service entry, practical case handling, and evidence or monitoring context/);
  assert.match(system, /connect research background to assessment, documentation, service planning, risk factors, or rationale for intervention/);
  assert.match(system, /Do not force all four layers/);
});

test("social worker prompt stops rewrite loops after a yes", () => {
  const input = toResponsesInput({
    history: [
      {
        role: "assistant",
        content: "Kui soovid, saan selle vormistada kliendile suunatud juhisena."
      }
    ],
    userMessage: "jah",
    context: "Jogeva koduteenus.",
    effectiveRole: "SOCIAL_WORKER",
    replyLang: "et"
  });

  const system = input.input[0].content;
  const turnInstruction = input.input.find(item => item.role === "system" && /TURN_INSTRUCTION/.test(item.content))?.content || "";
  assert.match(system, /do not give a bare yes\/no answer followed mainly by an offer to continue/);
  assert.match(system, /3-5 concrete details from the source/);
  assert.match(system, /Do not use internal source-status phrases/);
  assert.match(system, /answer directly without meta-commentary about excerpts or available material/);
  assert.match(system, /provide that requested text and stop without offering another rewrite or format/);
  assert.match(system, /Do not start answers with label-like phrases/);
  assert.match(system, /State the conclusion directly in a natural sentence/);
  assert.match(turnInstruction, /Provide exactly the requested text or format now/);
  assert.match(turnInstruction, /Do not add another closing offer/);
});

test("permission-style affirmative replies also stop rewrite loops", () => {
  for (const userMessage of ["võid", "võid ikka", "no tee"]) {
    const input = toResponsesInput({
      history: [
        {
          role: "assistant",
          content: "Kui soovid, võin järgmise sammuna sõnastada lühikese kliendi pöördumise."
        }
      ],
      userMessage,
      context: "Jogeva koduteenus.",
      effectiveRole: "SOCIAL_WORKER",
      replyLang: "et"
    });

    const turnInstruction = input.input.find(item => item.role === "system" && /TURN_INSTRUCTION/.test(item.content))?.content || "";
    assert.match(turnInstruction, /Provide exactly the requested text or format now/);
    assert.match(turnInstruction, /Do not add another closing offer/);
  }
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

test("social worker responses use medium verbosity while client stays low", () => {
  const base = {
    model: "test-model",
    input: [],
    max_output_tokens: 100
  };

  assert.equal(buildResponsesPayload(base, {
    stream: false,
    effectiveRole: "SOCIAL_WORKER"
  }).text.verbosity, "medium");

  assert.equal(buildResponsesPayload(base, {
    stream: false,
    effectiveRole: "CLIENT"
  }).text.verbosity, "low");
});

test("extra system instructions are inserted before the user turn", () => {
  const input = toResponsesInput({
    history: [],
    userMessage: "Millisesse valda pöörduda?",
    context: "National social welfare context.",
    effectiveRole: "CLIENT",
    replyLang: "et",
    extraSystemInstructions: [
      "MUNICIPALITY_CLARIFICATION_REQUIRED: End with exactly one direct municipality question."
    ]
  });

  assert.equal(input.input.at(-2).role, "system");
  assert.match(input.input.at(-2).content, /MUNICIPALITY_CLARIFICATION_REQUIRED/);
  assert.equal(input.input.at(-1).role, "user");
});
