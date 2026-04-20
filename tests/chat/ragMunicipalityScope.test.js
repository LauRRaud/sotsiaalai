import test from "node:test";
import assert from "node:assert/strict";

import {
  displayUrl,
  displayUrlsInText,
  filterMunicipalityScopedMatches,
  isMunicipalityScopedMatch,
  makeShortRef
} from "../../lib/chat/ragContext.js";
import {
  buildResponsesPayload,
  detectLang,
  isIdentityQuestion,
  pickReplyLang,
  toResponsesInput
} from "../../lib/chat/promptBuilder.js";

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

test("RT source labels prefer paragraph title over chapter section", () => {
  const ref = makeShortRef({
    title: "Eesti - Sotsiaalhoolekande seadus - § 10",
    section: "Üldsätted",
    paragraphTitle: "Lapse juhtumiplaan",
    authors: []
  });

  assert.equal(ref, "Eesti - Sotsiaalhoolekande seadus - § 10 · Lapse juhtumiplaan");
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

test("prompt avoids vague material caveats for broad municipality law comparisons", () => {
  const input = toResponsesInput({
    history: [],
    userMessage: "Sotsiaalteenused ja toetused Jõgeval, kas need lähevad kokku sotsiaalhoolekande seadusega?",
    context: "Jõgeva vald. Sotsiaalhoolekandelise abi andmise kord Jõgeva vallas. Sotsiaalhoolekande seadus.",
    effectiveRole: "SOCIAL_WORKER",
    replyLang: "et"
  });

  const system = input.input[0].content;
  assert.match(system, /broad questions about whether a municipality rule or service set aligns with national law/);
  assert.match(system, /answer the visible source relationship first/);
  assert.match(system, /complete service-by-service legal audit/);
  assert.match(system, /do not use vague caveats/);
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
  assert.match(system, /For simple source-availability or source-existence questions, answer in one short sentence/);
  assert.match(system, /do not mention source state, partial visibility, paragraph numbers, examples, or source details unless the user explicitly asks about completeness or coverage/);
  assert.match(system, /Only mention that something is partially visible when the user explicitly asks about completeness/);
  assert.match(system, /except for simple availability checks where a short direct answer is better/);
  assert.match(system, /do not imply that a source or paragraph is visible/);
  assert.match(system, /Exception: after a simple availability question about a law, document, source, or topic/);
});

test("prompt avoids user-facing my-materials phrasing when context supports an answer", () => {
  const input = toResponsesInput({
    history: [],
    userMessage: "Võimaluste kohvik on või oli olemas?",
    context: "2017. aasta Sotsiaaltöö artiklis kirjeldatakse Võimaluste kohvikut.",
    effectiveRole: "SOCIAL_WORKER",
    replyLang: "et"
  });

  const system = input.input[0].content;
  assert.match(system, /answer as a direct fact/);
  assert.match(system, /Do not say 'my materials'/);
  assert.match(system, /minu materjalides/);
  assert.match(system, /phrase it naturally as the document or article itself/);
});

test("prompt limits repeated article-source phrasing while allowing legal references", () => {
  const input = toResponsesInput({
    history: [],
    userMessage: "Mis on Võimaluste kohvik?",
    context: "Võimaluste kohvik pakkus psüühilise erivajadusega inimestele toetavat töökohta.",
    effectiveRole: "SOCIAL_WORKER",
    replyLang: "et"
  });

  const system = input.input[0].content;
  assert.match(system, /For journal articles, reports, guidance documents, and other non-legal sources/);
  assert.match(system, /at most once/);
  assert.match(system, /do not repeat phrases such as 'artiklis'/);
  assert.match(system, /For legal sources, regulations, Riigi Teataja materials, laws, sections, and paragraphs/);
  assert.match(system, /it is appropriate to name the act, regulation, section, or paragraph clearly/);
});

test("prompt keeps dated article facts separate from current status", () => {
  const input = toResponsesInput({
    history: [],
    userMessage: "Võimaluste kohvik on või oli olemas?",
    context: "Võimaluste kohvik võimalikuks. Sotsiaaltöö 4/2017.",
    effectiveRole: "SOCIAL_WORKER",
    replyLang: "et"
  });

  const system = input.input[0].content;
  assert.match(system, /Keep time context explicit for dated sources/);
  assert.match(system, /report what the article described at that time/);
  assert.match(system, /do not imply the situation is still current unless current evidence is present/);
  assert.match(system, /include the source year or exact date when it is visible/);
  assert.match(system, /separate that from current status/);
});

test("weak RAG grounding rule keeps source answers close to context", () => {
  const input = toResponsesInput({
    history: [],
    userMessage: "Mis on Võimaluste kohvik?",
    context: "Võimaluste kohvik pakkus psüühilise erivajadusega inimestele toetavat töökohta.",
    effectiveRole: "SOCIAL_WORKER",
    grounding: "weak",
    replyLang: "et"
  });

  const weakInstruction = input.input.find(item => item.role === "system" && /WEAK_RAG_GROUNDING/.test(item.content))?.content || "";
  assert.match(weakInstruction, /Use only facts directly visible in RAG_CONTEXT/);
  assert.match(weakInstruction, /Do not add inferred benefits, risks, causes, examples, or professional interpretations/);
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

test("prompt forbids speculating about internal causes when explaining answer mistakes", () => {
  const input = toResponsesInput({
    history: [
      {
        role: "assistant",
        content: "Pigem juhistes ja stiilis, mitte eraldi nähtavas verbosity seades. Если soovi, võin vastata lühemalt."
      }
    ],
    userMessage: "miks sa kirjutasid kogemata vene keeles?",
    context: "",
    effectiveRole: "SOCIAL_WORKER",
    replyLang: "et"
  });

  const system = input.input[0].content;
  assert.match(system, /If the user asks why an earlier answer was too long, mixed languages, contained a wording mistake/);
  assert.match(system, /A foreign-language word slipped in by mistake/);
  assert.match(system, /Do not speculate about prompts, hidden instructions, verbosity settings, model choice, decoding, internal decision processes/);
  assert.match(system, /If the user directly asks whether the cause was verbosity, prompt wording, model version/);
  assert.match(system, /Do not turn that kind of self-correction answer into a meta discussion about internal system behavior/);
});

test("prompt gives a short identity answer rule", () => {
  const input = toResponsesInput({
    history: [],
    userMessage: "kas oled chatgpt?",
    context: "",
    effectiveRole: "CLIENT",
    replyLang: "et"
  });

  const system = input.input[0].content;
  assert.match(system, /If the user asks who you are or whether you are ChatGPT/);
  assert.match(system, /Olen SotsiaalAI vestlusassistent/);
  assert.match(system, /Do not identify yourself as OpenAI, ChatGPT, or an OpenAI-created assistant/);
  assert.match(system, /Do not add meta explanations about product naming/);
});

test("turn rule handles simple availability questions with short confirm and follow-up", () => {
  const input = toResponsesInput({
    history: [],
    userMessage: "Kas sul on sotsiaalhoolekande seadus olemas?",
    context: "Sotsiaalhoolekande seadus.",
    effectiveRole: "CLIENT",
    replyLang: "et"
  });

  const turnInstruction = input.input.find(item => item.role === "system" && /TURN_INSTRUCTION/.test(item.content))?.content || "";
  assert.match(turnInstruction, /simple availability check about a law, document, source, or topic/);
  assert.match(turnInstruction, /Reply in one short sentence confirming availability or non-availability/);
  assert.match(turnInstruction, /Then ask one short follow-up question about what the user wants to know about it/);
});

test("turn rule fulfills affirmative answer to assistant explanation offer", () => {
  const input = toResponsesInput({
    history: [
      {
        role: "assistant",
        content: "Kui soovid, saan lühidalt selgitada, mis selle kohviku eesmärk oli ja kellele see mõeldud oli."
      }
    ],
    userMessage: "jah",
    context: "Võimaluste kohvik pakkus psüühilise erivajadusega inimestele toetavat töökohta.",
    effectiveRole: "SOCIAL_WORKER",
    replyLang: "et"
  });

  const turnInstruction = input.input.find(item => item.role === "system" && /TURN_INSTRUCTION/.test(item.content))?.content || "";
  assert.match(turnInstruction, /answered yes to the assistant's previous offer to explain/);
  assert.match(turnInstruction, /Fulfill that previous offer immediately/);
  assert.match(turnInstruction, /Do not repeat the offer/);
});

test("turn rule answers short factual follow-ups as complete anchored sentences", () => {
  const input = toResponsesInput({
    history: [
      {
        role: "user",
        content: "Mis asi on Võimaluste kohvik?"
      },
      {
        role: "assistant",
        content: "Võimaluste kohvik oli psüühilise erivajadusega inimestele mõeldud toetatud töökoht."
      }
    ],
    userMessage: "mis aastal?",
    context: "Võimaluste kohvik võimalikuks. Sotsiaaltöö 4/2017.",
    effectiveRole: "SOCIAL_WORKER",
    replyLang: "et"
  });

  const turnInstruction = input.input.find(item => item.role === "system" && /TURN_INSTRUCTION/.test(item.content))?.content || "";
  assert.match(turnInstruction, /short factual follow-up/);
  assert.match(turnInstruction, /answer directly in a complete sentence/);
  assert.match(turnInstruction, /Do not answer with a fragment such as 'aastal.'/);
  assert.match(turnInstruction, /include the exact year\/date and what that year\/date refers to/);
});

test("turn rule forbids internal-cause speculation and cyrillic continuation", () => {
  const input = toResponsesInput({
    history: [
      {
        role: "assistant",
        content: "Pigem juhistes ja stiilis. Если soovi, võin vastata lühemalt."
      }
    ],
    userMessage: "kas asi on verbosity settingus?",
    context: "",
    effectiveRole: "CLIENT",
    replyLang: "et"
  });

  const turnInstruction = input.input.find(item => item.role === "system" && /TURN_INSTRUCTION/.test(item.content))?.content || "";
  assert.match(turnInstruction, /The user is asking about the cause of a previous style or language mistake/);
  assert.match(turnInstruction, /Do not discuss prompts, verbosity, model version, decoding, or internal system behavior/);
  assert.match(turnInstruction, /Do not add a follow-up offer or preference question/);
  assert.match(turnInstruction, /An earlier assistant message mixed languages/);
  assert.match(turnInstruction, /Do not repeat or continue any Cyrillic text in this reply/);
});

test("turn rule catches short miks follow-up after self-correction", () => {
  const input = toResponsesInput({
    history: [
      {
        role: "assistant",
        content: "See oli keeleline viga. Vastus pidi olema ainult eesti keeles."
      }
    ],
    userMessage: "miks?",
    context: "",
    effectiveRole: "CLIENT",
    replyLang: "et"
  });

  const turnInstruction = input.input.find(item => item.role === "system" && /TURN_INSTRUCTION/.test(item.content))?.content || "";
  assert.match(turnInstruction, /short follow-up why-question after the assistant already acknowledged a style or language mistake/);
  assert.match(turnInstruction, /Answer briefly in user-facing terms only/);
  assert.match(turnInstruction, /Do not discuss prompts, verbosity, model version, decoding, or internal system behavior/);
  assert.match(turnInstruction, /Do not add a follow-up offer or preference question/);
});

test("turn rule gives a short identity answer", () => {
  const input = toResponsesInput({
    history: [],
    userMessage: "kas oled chatgpt?",
    context: "",
    effectiveRole: "CLIENT",
    replyLang: "et"
  });

  const turnInstruction = input.input.find(item => item.role === "system" && /TURN_INSTRUCTION/.test(item.content))?.content || "";
  assert.match(turnInstruction, /The user is asking about the assistant's identity/);
  assert.match(turnInstruction, /Answer in one short sentence/);
  assert.match(turnInstruction, /Olen SotsiaalAI vestlusassistent/);
  assert.match(turnInstruction, /Do not say that you are OpenAI, ChatGPT, or an OpenAI-created assistant/);
  assert.match(turnInstruction, /Do not add meta explanation about product naming or internal status/);
});

test("identity detection covers openai assistant phrasing", () => {
  assert.equal(isIdentityQuestion("openai assistent?"), true);
  assert.equal(isIdentityQuestion("kas sa oled openai asistent või sotsiaalai assistent?"), true);

  const input = toResponsesInput({
    history: [],
    userMessage: "openai assistent?",
    context: "",
    effectiveRole: "CLIENT",
    replyLang: "et"
  });

  const turnInstruction = input.input.find(item => item.role === "system" && /TURN_INSTRUCTION/.test(item.content))?.content || "";
  assert.match(turnInstruction, /The user is asking about the assistant's identity/);
  assert.match(turnInstruction, /Olen SotsiaalAI vestlusassistent/);
  assert.match(turnInstruction, /Do not say that you are OpenAI, ChatGPT, or an OpenAI-created assistant/);
});

test("identity detection does not trigger on substantive bare oled-sa questions", () => {
  const input = toResponsesInput({
    history: [],
    userMessage: "oled sa kursis sotsiaalhoolekande seadusega?",
    context: "Sotsiaalhoolekande seadus.",
    effectiveRole: "CLIENT",
    replyLang: "et"
  });

  const turnInstruction = input.input.find(item => item.role === "system" && /TURN_INSTRUCTION/.test(item.content))?.content || "";
  assert.doesNotMatch(turnInstruction, /assistant's identity/);
  assert.equal(buildResponsesPayload(input, {
    stream: false,
    effectiveRole: "CLIENT"
  }).text.verbosity, "medium");
});

test("identity detection catches what-assistant phrasing", () => {
  const input = toResponsesInput({
    history: [],
    userMessage: "mis assistent sa oled?",
    context: "",
    effectiveRole: "CLIENT",
    replyLang: "et"
  });

  const turnInstruction = input.input.find(item => item.role === "system" && /TURN_INSTRUCTION/.test(item.content))?.content || "";
  assert.match(turnInstruction, /assistant's identity/);
  assert.match(turnInstruction, /Olen SotsiaalAI vestlusassistent/);
});

test("simple availability detection stays off for broader law questions", () => {
  const input = toResponsesInput({
    history: [],
    userMessage: "Kas see seadus on olemas ja mis tingimustel see kehtib?",
    context: "Sotsiaalhoolekande seadus.",
    effectiveRole: "CLIENT",
    replyLang: "et"
  });

  const turnInstruction = input.input.find(item => item.role === "system" && /TURN_INSTRUCTION/.test(item.content))?.content || "";
  assert.doesNotMatch(turnInstruction, /simple availability check/);
  assert.equal(buildResponsesPayload(input, {
    stream: false,
    effectiveRole: "CLIENT"
  }).text.verbosity, "medium");
});

test("language detection recognizes Estonian without diacritics from common words", () => {
  assert.equal(detectLang("kas oled assistent"), "et");
  assert.equal(pickReplyLang({
    userMessage: "kas oled assistent",
    uiLocale: "en"
  }), "et");
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

test("simple availability turns prefer low verbosity", () => {
  const input = toResponsesInput({
    history: [],
    userMessage: "Kas sul on sotsiaalhoolekande seadus olemas?",
    context: "Sotsiaalhoolekande seadus.",
    effectiveRole: "CLIENT",
    replyLang: "et"
  });

  assert.equal(buildResponsesPayload(input, {
    stream: false,
    effectiveRole: "CLIENT"
  }).text.verbosity, "low");
});

test("internal-cause follow-up turns prefer low verbosity", () => {
  const input = toResponsesInput({
    history: [
      {
        role: "assistant",
        content: "See oli keeleline viga. Vastus pidi olema ainult eesti keeles."
      }
    ],
    userMessage: "miks?",
    context: "",
    effectiveRole: "CLIENT",
    replyLang: "et"
  });

  assert.equal(buildResponsesPayload(input, {
    stream: false,
    effectiveRole: "CLIENT"
  }).text.verbosity, "low");
});

test("identity turns prefer low verbosity", () => {
  const input = toResponsesInput({
    history: [],
    userMessage: "kas oled chatgpt?",
    context: "",
    effectiveRole: "CLIENT",
    replyLang: "et"
  });

  assert.equal(buildResponsesPayload(input, {
    stream: false,
    effectiveRole: "CLIENT"
  }).text.verbosity, "low");
});

test("preferred verbosity is not sent as a top-level responses payload field", () => {
  const input = toResponsesInput({
    history: [],
    userMessage: "Kas sul on sotsiaalhoolekande seadus olemas?",
    context: "Sotsiaalhoolekande seadus.",
    effectiveRole: "CLIENT",
    replyLang: "et"
  });

  const payload = buildResponsesPayload(input, {
    stream: false,
    effectiveRole: "CLIENT"
  });

  assert.equal("preferredVerbosity" in payload, false);
  assert.equal(payload.text.verbosity, "low");
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
