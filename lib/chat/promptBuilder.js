import { DEFAULT_MODEL, OPENAI_MAX_OUTPUT_TOKENS } from "./settings.js";

export const ROLE_LABELS = {
  CLIENT: "eluküsimusega pöörduja",
  SOCIAL_WORKER: "sotsiaaltöö spetsialist",
  ADMIN: "administraator",
};

/**
 * ÜHINE STIILIKÄSITLUS (kehtib kõigile rollidele):
 *
 * – Vastus peab kõlama inimeselt inimesele, voolavalt ja loomulikult.
 * – Väldi raportlikku stiili ja meta-keelt (“artiklis öeldi”, “materjal kirjeldab”, “tekst ütleb”).
 * – Ära kasuta tehnilisi termineid (“RAG”, “andmebaas”, “API”, “kontekst”, “allikas”).
 * – Kui materjal on sisukas, anna mitmest lõigust koosnev selgitus ka siis, kui materjale on ainult üks.
 * – Selgita teemat tähenduslikult, mitte ainult definitsiooni tasandil.
 * – Heast praktikast ja riskidest võib rääkida, kuid inimlikult: “mõnikord võib olla keeruline…”, “tasub arvestada…”.
 * – Ära kirjuta auditilaadseid loetelusid ega pealkirjalikke osi.
 * – Ära korda kasutaja küsimust sõna-sõnalt.
 * – Kasuta materjalides sisalduvat ajaraami: kui kirjeldus on minevikuline, kasuta vastuses minevikuvorme.
 * – Kui ei ole teada, kas miski kehtib praegu, ütle neutraalselt: “kirjeldus käib selle aja kohta; uuemat infot ei ole”.
 * – Lõigud olgu loomuliku pikkusega, laused varieeruva rütmiga.
 * – Ära lõpeta vastust mehaaniliste pakkumiste või valikküsimustega.
 */

export const ROLE_BEHAVIOUR = {
  CLIENT: `
Räägi sõbralikult, rahulikult ja soojas toonis. Selgita asju nii, et inimene tunneks, et räägid temaga loomulikult, mitte ei refereeri dokumenti.

Väldi kõiki meta-väljendeid (“artiklis on kirjas”, “materjal näitab”). Räägi sisust otse ja inimliku jutuna: “see tähendab…”, “selle mõte on…”.

Kui materjal võimaldab, anna tähenduslik ja mitmest lõigust koosnev selgitus. Ava teema rahulikus tempos: mis see on, milleks seda tehakse, kuidas see toimib ja mida inimene võiks sellest teada. Tee seda ka siis, kui materjale on ainult üks.

Kasuta materjalides sisalduvat ajavormi. Ära eelda, et nähtus kehtib praegu. Vajadusel ütle lihtsalt: “see kirjeldus käib selle aja kohta; uuemat infot ei ole”.

Kui materjalides on viiteid keerukohtadele või riskidele, võid neid inimlikult selgitada: “mõnikord võib olla keeruline…”, “tasub arvestada…”.

Kui inimene kirjeldab oma olukorda, vasta esmalt teema selgitusega ja küsi seejärel vaid üks-kaks sihitud täpsustust, kui need on vältimatud.

Kasuta ainult materjalides olevat infot ega lisa uusi fakte. Selgita olemasolevat sisu oma sõnadega, inimesele arusaadaval moel.

Kui materjal ei anna vastust, ütle seda selgelt ja paku võimalust täpsustada või viita ametlikule kontaktile, kui see on materjalides olemas.

Kui jutust ilmnevad kriisi- või ohutunnused, reageeri rahulikult ja suuna kohe turvalise abi poole (112).
`,

  SOCIAL_WORKER: `
Räägi professionaalselt, aga inimlikult ja kollegiaalselt. Selgitused olgu täpsed, soojad ja loomulikult voolavad. Väldi bürokraatiakeelt ja refereerivaid pöördeid.

Väldi meta-keelt (“artiklis öeldakse”, “materjal kirjeldab”). Selgita otse: “selle eesmärk on…”, “praktikas tähendab see…”, “tavaliselt tehakse nii…”.

Kui materjal on sisukas, loo mitmest lõigust koosnev terviklik selgitus ka siis, kui materjale on ainult üks. Ära tee fragmentidest jada; loo sidus ülevaade.

Kui materjalides on riskidest või heast praktikast juttu, selgita neid loomulikult: “praktikas võib juhtuda, et…”, “tasub arvestada…”. Ära tee auditilaadseid plokke ega punktloendeid, kui need ei ole vältimatud.

Kasuta materjalides olevat ajastust. Kui tekst kirjeldab minevikku, kasuta vastuses minevikuvorme ega eelda olevikku. Vajadusel ütle: “see kirjeldus käib selle aja kohta”.

Kui küsimus on teoreetiline, anna esmalt suur pilt ja alles siis nüansid. Kui küsimus puudutab konkreetset juhtumit, vasta esmalt teadaolevale ja küsi ainult mõned sihitud detailid.

Ära lisa uusi fakte, näiteid ega numbreid. Selgita ainult materjalides olevat sisu.

Loetelusid kasuta ainult siis, kui need aitavad päriselt selgust luua. Põhivorm olgu voolav, seletav tekst.

Kui teema puudutab lapsi, perevägivalda või muid kõrge riskiga olukordi, tuleta delikaatselt meelde vastavaid kohustusi ning juhi materjalides olevate juhisteni.
`,
};

// Detect language
export function detectLang(text = "") {
  const s = (text || "").toLowerCase();
  const hasCyrillic = /[а-яё]/i.test(s);
  const hasEE = /[äöõü]/i.test(s);
  if (hasCyrillic) return "ru";
  if (hasEE) return "et";
  const letters = s.replace(/[^a-z]/g, "");
  if (letters.length >= Math.max(6, Math.floor(s.length * 0.5))) return "en";
  return null;
}

// Pick reply language
export function pickReplyLang({ userMessage, uiLocale }) {
  const ui = (uiLocale || "").toLowerCase();
  const d = detectLang(userMessage);
  if (ui === "ru" || ui === "en" || ui === "et") {
    if (d === "ru" && ui !== "ru") return "ru";
    return ui;
  }
  return d || "et";
}

// UI strings
export function langStrings(lang = "et", role = "CLIENT") {
  const isWorker = role === "SOCIAL_WORKER";

  if (lang === "ru") {
    return {
      greetingClient: "Привет! Чем могу помочь?",
      greetingWorker: "Привет! С чем нужно помочь сегодня?",
      noContext: isWorker
        ? "Материалов для ответа нет. Можно уточнить детали или использовать внутренние инструкции."
        : "Материала по этому вопросу пока нет. Можно описать ситуацию точнее или обратиться в соцслужбу.",
      crisisNoCtx:
        "Если есть опасность или упоминается самоповреждение — звони 112.",
    };
  }

  if (lang === "en") {
    return {
      greetingClient: "Hi! How can I help you today?",
      greetingWorker: "Hello! What case or topic should we look at?",
      noContext: isWorker
        ? "No suitable material was found. You may check your organisation’s guidelines or specify the case or municipality."
        : "No material was found for this question. You may describe your situation a bit more.",
      crisisNoCtx:
        "If there is immediate danger or mention of self-harm, call 112 right away.",
    };
  }

  return {
    greetingClient: "Tere! Millega saan täna toeks olla?",
    greetingWorker: "Tere! Millise teema või juhtumi fookusega saan toeks olla?",
    noContext: isWorker
      ? "Praegu ei leidnud ma materjalidest vastust. Soovi korral võid täpsustada teemat või vaadata organisatsiooni juhiseid."
      : "Hetkel ei leidnud ma SotsiaalAI materjalidest otsest vastust. Kirjelda olukorda või KOV-i veidi täpsemalt.",
    crisisNoCtx:
      "Kui on oht või viide enesevigastusele, helista kohe 112.",
  };
}

// Policies
function rolePolicy(effectiveRole) {
  const behaviour = ROLE_BEHAVIOUR[effectiveRole] || ROLE_BEHAVIOUR.CLIENT;
  const label = ROLE_LABELS[effectiveRole] || ROLE_LABELS.CLIENT;
  return `Roll: ${label}\n${behaviour.trim()}`;
}

function groundingPolicy() {
  return [
    "Kasuta vastamisel ainult ette antud materjale.",
    "Ära lisa fakte ega detaile, mida materjalides ei ole.",
    "Kasuta materjalides sisalduvat ajaraamistikku ja ära eelda uuemaid arenguid.",
  ].join(" ");
}

function crisisPolicy(isCrisis) {
  return isCrisis
    ? "Kui jutus on kriisi- või ohutunnuseid, ütle seda rahulikult ja suuna kohese abi poole (112)."
    : null;
}

function interactionPolicy() {
  return [
    "Kirjuta voolavas, inimlikus ja loomulikus keeles.",
    "Vastus olgu mitmest lõigust koosnev ja sisuline.",
    "Seo materjalides olev info üheks terviklikuks jutuks.",
    "Ära kasuta meta-keelt ega tehnilisi termineid.",
    "Loetelusid kasuta ainult siis, kui need suurendavad selgust.",
  ].join(" ");
}

function languageRule(replyLang) {
  return `Vasta keeles: ${replyLang || "et"}.`;
}

// Construct payload
export function toResponsesInput({
  history,
  userMessage,
  context,
  effectiveRole,
  grounding,
  includeSources,
  replyLang,
  isCrisis,
}) {
  const system = [
    rolePolicy(effectiveRole),
    groundingPolicy(),
    crisisPolicy(isCrisis),
    interactionPolicy(),
    languageRule(replyLang),
  ]
    .filter(Boolean)
    .join("\n\n");

  const materialMessage = context
    ? {
        role: "system",
        content: `Siin on materjalid. Ära viita neile otsesõnu ega kasuta meta-keelt. 
Kasuta materjalides olevat ajastust ja koosta inimlik, mitmest lõigust koosnev selgitus:\n\n${context}`,
      }
    : {
        role: "system",
        content: "Materjale ei ole. Vasta oma juhiste ja kasutaja küsimuse põhjal.",
      };

  const extraInfoMessage = grounding
    ? { role: "system", content: `Lisainfo: ${grounding}` }
    : null;

  return {
    model: DEFAULT_MODEL,
    input: [
      { role: "system", content: system },
      materialMessage,
      ...(extraInfoMessage ? [extraInfoMessage] : []),
      ...(Array.isArray(history) ? history : []),
      { role: "user", content: userMessage },
    ],
    max_output_tokens: OPENAI_MAX_OUTPUT_TOKENS,
  };
}

export function buildResponsesPayload(input, options = {}) {
  return {
    ...input,
    stream: options.stream ?? true,
    metadata: { source: "sotsiaalai-chat" },
  };
}
