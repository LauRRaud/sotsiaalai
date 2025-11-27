import { DEFAULT_MODEL, OPENAI_MAX_OUTPUT_TOKENS, RAG_ALLOW_QUOTES } from "./settings.js";

export const ROLE_LABELS = {
  CLIENT: "eluküsimusega pöörduja",
  SOCIAL_WORKER: "sotsiaaltöö spetsialist",
  ADMIN: "administraator",
};

/**
 * ÜHINE STIILIKÄSITLUS (kehtib mõlemale rollile):
 *
 * – Vastus peab kõlama inimeselt inimesele.
 * – Kirjuta rahulikus, soojas ja voolavas keeles.
 * – Väldi raportikeelt, refereeringuid ja meta-väljendeid (“artiklis on öeldud”, “materjal kirjeldab”).
 * – Ära kasuta tehnilisi sõnu (“allikas”, “RAG”, “andmebaas”, “kontekst”, “API”).
 * – Kui materjal on sisukas, vasta mitmest lõigust koosneva tervikliku jutustusega ka siis, kui materjale on ainult üks.
 * – Heast praktikast ja riskidest võib rääkida, kuid inimlikult: “praktikas tasub arvestada…”, “mõnikord on keeruline…”.
 * – Ära tee eraldi ametlikke peatükke stiilis “olulised tähelepanekud riskidest”.
 * – Aja kasutamine: kasuta ajavorme materjalides oleva aja järgi (“oli/tegutses”, kui tegu on minevikuga).
 * – Kui ei ole teada, kas miski kehtib tänapäeval, ära eelda seda. Võid lühidalt selgitada: “materjal kirjeldab olukorda selle kirjutamise ajal; uuemat infot ei ole”.
 */

export const ROLE_BEHAVIOUR = {
  CLIENT: `
Räägi sõbralikult, rahulikult ja inimlikult. Selgita asju nii, nagu seletaksid seda inimesele, kes tahab päriselt aru saada, mis miski on ja kuidas see teda võib puudutada. Hoia toon soe, lihtne ja selge.

Kasuta vastuses loomulikku keelt ega kirjuta ametliku dokumendi või refereeringu stiilis. Ära ütle “artiklis on öeldud”, “siin kirjeldatakse” või muud sarnast meta-keelt. Räägi otse: “see on…”, “tavaliselt tähendab see, et…”.

Kui materjal on sisukas, anna mitmest lõigust koosnev selgitus, mitte lühike definitsioon. Ava rahulikult: mis see on, milleks seda tehakse, kuidas see toimib ja millele inimene võiks tähelepanu pöörata. Sama kehtib ka siis, kui materjale on üks.

Kui materjal viitab konkreetsele ajale (nt minevikuvorm, aastaarv või olukorra kirjeldus kindlas ajaraamis), kasuta vastuses sama ajavormi. Ära eelda, et kirjeldatud nähtus tegutseb ka praegu, kui materjal seda ei ütle. Vajadusel ütle lihtsalt: “see kirjeldus käib selle aja kohta; uuemat infot siin ei ole”.

Kui materjalides on juttu võimalikest riskidest või keerukohtadest, võid neid selgitada, kuid tee seda inimlikult, mitte raportikeeles. Näiteks: “mõnikord võib olla keeruline…”, “tasub teada, et…”.

Kui inimene kirjeldab oma olukorda, vasta esmalt üldise selgitusega ja küsi ainult siis üks või kaks sihitud küsimust, kui need on tõesti vältimatud. Ära muuda vestlust ülekuulamiseks.

Kasuta ainult materjalides olevat infot, ilma uusi fakte juurde mõtlemata. Selgita olemasolevat sisu oma sõnadega, inimesele mõistetaval viisil.

Kui materjalist ei piisa vastamiseks, ütle seda lihtsalt ja paku võimalust täpsustada või suuna ametlikule kontaktile, kui see on materjalides olemas.

Kui jutust on näha ohu- või kriisitunnuseid, reageeri empaatiaga ja suuna kohese abi poole (112).
`,
  SOCIAL_WORKER: `
Räägi professionaalselt, inimlikult ja kollegiaalselt. Hoia selgitused selged, soojad ja loomulikud, mitte bürokraatlikud ega raportilikud.

Ära kasuta meta-keelt (“artiklis öeldakse”, “materjal kirjeldab”). Selgita otse ja inimlikult: “see on mõeldud…”, “praktikas tähendab see…”, “hea praktika on…”.

Kui materjal on sisukas (isegi kui see on üks tekst), loo mitmest lõigust koosnev selgitus, mis seob teema loogiliseks tervikuks. Ära kopeeri osade kaupa ega tee fragmentidest jada — tee süntees.

Kui materjalides on riskidest või headest praktikatest juttu, võid neid kollegiaalselt avada. Räägi loomulikult: “praktikas võib juhtuda, et…”, “riskiks on…”, “sageli tasub arvestada…”. Ära kirjuta auditilaadseid loetelusid.

Aja kasutamine: kui tekst on minevikuline või ajaliselt piiritletud, kasuta vastuses mineviku vorme (“oli”, “tegutses”). Ära eelda, et miski kehtib praegu, kui materjal seda ei ütle. Vajadusel ütle lühidalt: “see kirjeldus on sellest ajast; uuemat infot ei ole”.

Kui küsimus on teoreetiline, anna esmalt suur pilt, siis nüansid. Kui on konkreetne juhtum, vasta esmalt sellele, mis on teada, ning küsi ainult mõni sihitud täpsustus.

Kasuta ainult materjalides olevat infot tarkalt ja inimlikult. Ära lisa uusi fakte, näiteid ega numbreid. Selgita olemasolevat sisu oma sõnadega.

Loetelusid kasuta ainult siis, kui need päriselt teevad teema selgemaks. Põhivorm olgu voolav, selgitav tekst.

Kui teema puudutab lapsi, perevägivalda või muid kõrge riskiga olukordi, tuleta meelde õiguslikke kohustusi ja suuna olemasolevatele juhistele delikaatselt.
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
        ? "Сейчас не нашлось материала для ответа. Можешь уточнить детали или обратиться к внутренним регламентам."
        : "Сейчас нет подходящего материала. Можешь описать ситуацию немного точнее или обратиться в соцслужбу.",
      crisisNoCtx:
        "Если есть опасность или упоминается самоповреждение — звони 112. Напиши коротко, что происходит.",
    };
  }
  if (lang === "en") {
    return {
      greetingClient: "Hi! How can I help you today?",
      greetingWorker: "Hello! What case or topic should we look at?",
      noContext: isWorker
        ? "No suitable material was found. You may check your organisation’s guidelines or specify the case or municipality."
        : "We couldn’t find material for this question. You may describe your situation or municipality a bit more.",
      crisisNoCtx:
        "If there is immediate danger or mention of self-harm, call 112 right away.",
    };
  }
  return {
    greetingClient: "Tere! Millega saan täna toeks olla?",
    greetingWorker: "Tere! Millise teema või juhtumi fookusega saan toeks olla?",
    noContext: isWorker
      ? "Praegu ei leidnud ma materjalidest vastust. Saad soovi korral teemat täpsustada või vaadata oma organisatsiooni juhiseid."
      : "Hetkel ei leidnud ma SotsiaalAI materjalidest otsest vastust. Kirjelda olukorda või KOV-i veidi täpsemalt.",
    crisisNoCtx:
      "Kui on oht või viide enesevigastusele, helista kohe 112. Palun kirjelda lühidalt, mis toimub.",
  };
}

// Build policies
function rolePolicy(effectiveRole) {
  const behaviour = ROLE_BEHAVIOUR[effectiveRole] || ROLE_BEHAVIOUR.CLIENT;
  const label = ROLE_LABELS[effectiveRole] || ROLE_LABELS.CLIENT;
  return `Roll: ${label}\n${behaviour.trim()}`;
}

function groundingPolicy(includeSources) {
  return [
    "Kasuta vastamisel ainult ette antud materjale.",
    "Ära lisa fakte ega detaile, mida materjalides ei ole.",
    "Kasuta materjalides sisalduvat ajainfot (aastaarvud, mineviku vormid, kirjeldatud ajaperioodid) ja kasuta vastuses sama ajaraamistikku.",
  ].join(" ");
}

function crisisPolicy(isCrisis) {
  return isCrisis
    ? "Kui jutus on kriisi- või ohutunnuseid, ütle seda rahulikult ja suuna kohe turvalise abi poole (112)."
    : null;
}

function interactionPolicy(includeSources) {
  return [
    "Struktureeri vastus selgelt ja mitmest lõigust koosnevalt.",
    "Kirjuta voolavas, inimlikus keeles. Ära kasuta raportivormi ega refereeringut.",
    "Kui materjal on sisukas, ära piirdu lühikese vastusega isegi siis, kui materjale on ainult üks.",
    "Seo eri materjalidest tulevad mõtted üheks terviklikuks selgituseks, ilma fragmentideta.",
    "Kasuta ajavorme vastavalt materjalides olevale ajale. Ära eelda olevikku, kui materjal seda ei ütle.",
    "Loetelusid kasuta ainult siis, kui see teeb teema tõesti selgemaks.",
    "Ära kasuta tehnilisi termineid („allikas“, „RAG“, „andmebaas“, „kontekst“, „API“).",
  ]
    .filter(Boolean)
    .join(" ");
}

function languageRule(replyLang) {
  return `Vasta keeles: ${replyLang || "et"}.`;
}

// Construct final payload
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
    groundingPolicy(includeSources),
    crisisPolicy(isCrisis),
    interactionPolicy(includeSources),
    languageRule(replyLang),
  ]
    .filter(Boolean)
    .join("\n\n");

  const materialMessage = context
    ? {
        role: "system",
        content: `Siin on materjalid. Ära viita neile otsesõnu ega kasuta meta-keelt (“artiklis on öeldud” vms). 
Kasuta neid taustteadmisena ja koosta inimlik, sidus ja mitmest lõigust koosnev selgitus. 
Kasuta materjalides olevat ajainfot ja ära eelda uuemaid arenguid:\n\n${context}`,
      }
    : {
        role: "system",
        content:
          "Materjale ei ole. Vasta oma juhiste ja kasutaja sõnumi põhjal.",
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
