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

test("prompt keeps the named social service separate from similar services", () => {
  const input = toResponsesInput({
    history: [],
    userMessage: "Nouded varjupaigateenuse osutamisele?",
    context: [
      "6. jagu Varjupaigateenus. Elukeskkond, kus osutatakse varjupaigateenust, peab vastama rahvatervishoiu seaduse paragrahv 21 nouetele.",
      "Turvakoduteenuse tegevusloa noudeid ei tohi segi ajada varjupaigateenusega."
    ].join("\n"),
    effectiveRole: "SOCIAL_WORKER",
    replyLang: "et"
  });

  const system = input.input[0].content;
  assert.match(system, /treat that exact term as the target/);
  assert.match(system, /Do not substitute a similar service/);
  assert.match(system, /do not answer varjupaigateenus as turvakoduteenus/);
  assert.match(system, /use the requested service's own section first/);
  assert.match(system, /answer from the available exact-text and state the limit/);
});

test("prompt anchors short national-requirements follow-ups to the user's named service", () => {
  const input = toResponsesInput({
    history: [
      {
        role: "user",
        content: "soovin varjupaiga teenust"
      },
      {
        role: "assistant",
        content: "Jogeva vallas saad poorduda hoolekandekeskusse."
      },
      {
        role: "user",
        content: "Nouded teenuseosutajale?"
      },
      {
        role: "assistant",
        content: "Selles kohalikus materjalis ma teenuseosutaja eraldi noudeid ei nae."
      }
    ],
    userMessage: "riiklik ma motlesin, riiklikud nouded",
    context: [
      "6. jagu Varjupaigateenus. Paragrahv 32. Varjupaigateenuse osutaja kehtestab sisekorraeeskirja.",
      "Paragrahv 32-1. Elukeskkond, kus osutatakse varjupaigateenust, peab vastama rahvatervishoiu seaduse paragrahv 21 nouetele.",
      "Turvakoduteenuse tegevusloa ja tuleohutuse noudeid ei kohaldata selle varjupaigateenuse loigu pohjal."
    ].join("\n"),
    effectiveRole: "CLIENT",
    replyLang: "et"
  });

  const system = input.input[0].content;
  assert.match(system, /resolve the target from the latest specific service named by the user/);
  assert.match(system, /not from the assistant's prior wording or assumptions/);
  assert.match(system, /Do not add broad activity-license, employee suitability, fire-safety, or child-protection requirements/);
  assert.match(system, /unless the requested service's own section or another exact matching source says they apply/);
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

test("chat prompt requires complete municipality service and support overviews", () => {
  const input = toResponsesInput({
    history: [],
    userMessage: "Kirjelda mulle Jogeva valla toetusi ja teenuseid.",
    context: "Jogeva vald. Sotsiaalteenused: koduteenus, tugiisikuteenus. Toetused: toimetulekutoetus, vajaduspohine toetus.",
    effectiveRole: "SOCIAL_WORKER",
    replyLang: "et"
  });

  const system = input.input[0].content;
  assert.match(system, /cover both categories explicitly/);
  assert.match(system, /municipality regulation or municipality service entries first/);
  assert.match(system, /services but not benefit amounts or support conditions/);
  assert.match(system, /Do not let one retrieved service entry dominate an overview question/);
});

test("prompt requires transparent source-state answers for availability questions", () => {
  const input = toResponsesInput({
    history: [],
    userMessage: "Kas sul on sotsiaalhoolekande seaduse paragrahv 10 olemas?",
    context: "Sotsiaalhoolekande seadus. Paragrahv 10. Lapsele juhtumiplaani koostamine.",
    effectiveRole: "SOCIAL_WORKER",
    replyLang: "et"
  });

  const system = input.input[0].content;
  assert.match(system, /what sources, documents, legal acts, paragraphs, sections, or materials are available/);
  assert.match(system, /found in the provided materials/);
  assert.match(system, /not found in the current search/);
  assert.match(system, /only partially visible/);
  assert.match(system, /identified from the user's own text/);
  assert.match(system, /do not imply that a source or paragraph is visible/);
});

test("prompt requires source-use answers to rely on assistant source metadata", () => {
  const input = toResponsesInput({
    history: [
      {
        role: "assistant",
        content: [
          "Jõgeva valla kord lähtub sotsiaalhoolekande seadusest.",
          "Assistant source metadata for this answer:",
          "1. Jõgeva vald - Sotsiaalhoolekandelise abi andmise kord Jõgeva vallas - § 1"
        ].join("\n")
      }
    ],
    userMessage: "Milliseid allikaid sa selle vastuse jaoks kasutasid?",
    context: "Jõgeva vald. Sotsiaalhoolekandelise abi andmise kord Jõgeva vallas.",
    effectiveRole: "SOCIAL_WORKER",
    replyLang: "et"
  });

  const system = input.input[0].content;
  assert.match(system, /which sources were used for the previous answer/);
  assert.match(system, /previous assistant message's source metadata/);
  assert.match(system, /Do not describe assistant source metadata/);
  assert.match(system, /visible in the user's own message/);
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

test("document analysis prompt blocks unsolicited drafting or presentation offers", () => {
  const input = toResponsesInput({
    history: [],
    userMessage: "Mis lisab eraldi kaitsekihi serveri halduse ja ligipääsu poolel?",
    context: [
      "USER DOCUMENT:",
      "Avalikult on ette nähtud ainult 80/443; rakendus 3000, RAG-teenus 8000 ja PostgreSQL 5432 kuulavad ainult 127.0.0.1 peal.",
      "Serveri haldus ja sisemine ligipääs käivad Tailscale'i privaatse ühenduse kaudu."
    ].join("\n"),
    effectiveRole: "SOCIAL_WORKER",
    replyLang: "et"
  });

  const docInstruction = input.input.find(
    item => item.role === "system" && /DOCUMENT_ANALYSIS_MODE/.test(item.content)
  )?.content || "";

  assert.match(docInstruction, /uploaded a document for analysis/);
  assert.match(docInstruction, /Do not end factual document-analysis answers with an offer/);
  assert.match(docInstruction, /letter, presentation, application, email, memo/);
  assert.match(docInstruction, /Only offer drafting or rewriting if the user explicitly asks/);
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

test("chat responses default to medium verbosity for both roles", () => {
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
  }).text.verbosity, "medium");
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
