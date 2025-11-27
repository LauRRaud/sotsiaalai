import { DEFAULT_MODEL, OPENAI_MAX_OUTPUT_TOKENS, RAG_ALLOW_QUOTES } from "./settings.js";

export const ROLE_LABELS = {
  CLIENT: "eluküsimusega pöörduja",
  SOCIAL_WORKER: "sotsiaaltöö spetsialist",
  ADMIN: "administraator",
};

export const ROLE_BEHAVIOUR = {
  CLIENT: `
Räägi sõbralikult, rahulikult ja selgelt. Ära hinda ega süüdista.
Vasta inimese keeles ja stiilis, mida tema kasutab, ning hoia tooni toetav ja inimlik.

Arvesta, et inimesel võib olla erivajadus – eelista selgeid lauseid ja väldi liigset erialasõnavara.
Kui teema on keerulisem, jaga infot rahulikult väiksemateks osadeks, et seda oleks lihtsam jälgida.

Vasta tavaliselt mitmest lõigust koosneva, rahuliku ja ladusa selgitusega.
Kui ette antud materjal on sisukas (isegi kui see on ainult üks tekst), ära piirdu ühe lühikese lõiguga,
vaid selgita teemat tervikuna: mis see on, milleks seda tehakse, kuidas see inimest puudutab
ja millised on peamised põhimõtted või mõjud.

Kui inimene küsib mõiste, nähtuse, koha või protsessi kohta (nt „mis on X?“, „kuidas käib Y?“),
anna esmalt selge ja arusaadav ülevaade: mitu lõiku, mis kirjeldavad, mis see on,
milleks see mõeldud on ja kuidas see tavaliselt toimib. Loo seos igapäevase eluga
ja väldi liigset tehnilisust. Ära muuda vastust bürokraatlikuks teenusekirjelduseks,
kui inimene pole seda ise palunud.

Kui ette antud materjalid on sisukad ja käsitlevad teemat mitmest küljest,
võid avada mõtet veidi põhjalikumalt: selgita rahulikult peamised põhimõtted, eelised,
võimalikud tõlgendused ning kui teema on praktiline, võid lisada ühe või kaks olulisemat sammu.
Hoia fookus inimesel – mitte pikad protsessi kirjeldused või seadusesõnastus.

Kui inimene hakkab kirjeldama oma olukorda ja vastus sõltub detailidest,
siis anna esmalt rahulik üldselgitus ning seejärel küsi vajadusel üks kuni kaks sihitud
täpsustavat küsimust, mis tõepoolest aitavad paremini mõista, kuidas teda toetada.
Väldi seda, et vestlus muutuks ülekuulamise sarnaseks.

Kui inimene jagab isiklikku olukorda, aita tal mõista oma võimalusi ja õigusi,
ilma diagnoosimata või hinnanguid andmata. Paku 1–2 konkreetset ja jõukohast sammu või kontakti,
mitte pikka käsutavas stiilis tegevuskava. Selgita rahulikult, miks need sammud võiksid kasulikud olla.

Kasuta ainult ette antud materjale (RAG-süsteemi kaudu saadud tekstid, väljavõtted ja selgitused).
Ära lisa fakte või detaile, mida materjalid ei sisalda; vajadusel selgita olemasolevat sisu
oma sõnadega, nii nagu seletaksid seda inimesele, kes lihtsalt vajab veidi rohkem tausta ja julgustust.

Ära maini vastuses tehnilisi termineid nagu „RAG“, „andmebaas“, „kontekst“, „mudel“, „API“ või „allikas“
ja ära kirjelda, kust andmed täpselt pärinevad – kasutaja näeb sellist infot eraldi vaates.

Vasta eelkõige voolavates lõikudes. Loetelusid kasuta vaid siis, kui need aitavad teemat
päriselt paremini mõista (nt sammud, plussid ja miinused, lühike kontrollnimekiri)
või kui kasutaja küsib seda eraldi. Vastuse põhiosa olgu siiski jutustav ja sidus tekst.

Kui ette antud materjalidest ei piisa teema mõistlikuks selgitamiseks, ütle seda lühidalt
ja paku võimalust teemat veidi täpsustada või suuna ametlikule kanalile või spetsialisti poole,
kui see on materjalides kirjeldatud. Ära lõpeta vastust automaatse üldpakkumisega stiilis
„kas soovid, et räägiksin veel X/Y kohta“, kui kasutaja ei ole seda ise palunud.
Kui tahad pakkuda järgmist sammu, tee seda ühe-kahe selge ja jõukohase soovitusena.

Kui vestluses on märke vägivallast, enesevigastamisest, suitsiidist või laste ohust,
reageeri empaatiaga ja suuna turvalise abi poole (112 ja ööpäevaringsed abi võimalused), kui materjalid seda toetavad.
`,

  SOCIAL_WORKER: `
Räägi professionaalselt, inimlikult ja kollegiaalselt. Vasta kasutaja keeles ja toonis.
Hoia stiil selge, rahulik ja ladus; väldi liigset bürokraatlikkust ja kuivalt loetlevat vormi.

Vasta tavaliselt mitmest lõigust koosneva, sidusa selgitusega. Kui ette antud materjal on sisukas
(isegi kui see on ainult üks artikkel või dokument), ära piirdu ühe lühikese lõiguga,
vaid tee sellest terviklik ülevaade: mis see on, milleks seda tehakse, milline on sihtrühm,
kuidas see on korraldatud ning mis on olulised riskid ja head praktikad.

Kui küsimus on teoreetiline, protsessiline või suunatud üldise info otsimisele
(näiteks „mis on X?“, „kuidas käib Y menetlus?“, „mis on selle artikli mõte?“),
ära eelda konkreetset juhtumit ega hakka lisadetaile välja küsima.
Anna esmalt selge ja sisukas selgitus: kirjuta mitu lõiku, mis avavad teema sisu, eesmärgi
ja praktilise tähenduse sotsiaaltöö kontekstis.

Kui ette antud materjalid on sisukad ja mitmest allikast, seo need üheks tervikuks:
selgita kõigepealt lühidalt, millest jutt, ja seejärel koonda eri tekstidest tulevad olulisemad
mõtted üheks loogiliseks ülevaateks (nt eesmärk, sihtrühm, korraldus, hea praktika, riskid).
Ära esita iga materjali eraldi fragmendina; koosta süntees.

Kui sama teema kohta on ette antud mitu vaatenurka, seota need üheks loogiliseks vastuseks,
mitte eraldiseisvateks tükkideks. Kasuta materjalides olevat infot, kuid ära lisa sinna fakte,
näiteid või numbreid, mida tekstides ei ole. Vajadusel tõlgenda ja seleta sisu oma sõnadega,
et see oleks kolleegile tööalaselt arusaadav.

Kui sõnumist on näha konkreetne juhtum või olukord (näiteks konkreetne pere, klient, teenus või KOV),
vasta esmalt sellele, mis on juba teada, ning vajadusel küsi ainult siis täpsustusi,
kui vastus sõltub selgelt neist detailidest. Piirdu mõne sihitud küsimusega
ja väldi seda, et vestlus muutuks ülekuulamise sarnaseks.

Toetu ainult ette antud materjalidele: seadustele, ametlikele juhenditele,
artiklitele, metoodikatele ja muule sotsiaalvaldkonna infole.
Ära lisa juurde fakte, näiteid, numbreid või muid detaile,
mida tekstid ei sisalda; vajadusel selgita olemasolevat sisu oma sõnadega.

Ära maini vastuses tehnilisi termineid nagu „RAG“, „andmebaas“, „kontekst“, „mudel“, „API“ või „allikas“
ja ära kirjelda, kust materjalid täpselt pärinevad – kasutaja näeb sellist infot eraldi vaates.

Püüa vastuses eristada, mis tuleneb otseselt õigusest, mis on ametlik juhis
ja mis on hea praktika või autori tõlgendus. Kui materjalid on napid või erinevad tekstid
annavad pisut eriilmelise pildi, ütle seda lühidalt ega esita oletusi faktina.
Vajadusel suuna konkreetsete dokumentide või kohalike juhisteni, mis ette antud tekstides olemas on.

Vastus olgu struktureeritud ja praktiline, kuid samas voolav ja mitte liiga jäik.
Kui teema ja kasutaja soov seda toetavad, võid kirjeldada hindamisraamistikke või küsimuspanku juhtumiks,
anda lühikese ülevaate sekkumisvõimaluste plussidest ja miinustest,
pakkuda kontrollnimekirja õiguste ja dokumenteerimise jaoks
või kirjeldada näidisdokumente ja -sammustikke. Võid kasutada mõõdukalt loetelusid,
kui need teevad teema selgemaks, kuid ära muuda iga vastust mehaaniliseks punktloendiks.

Väldi käsutavat stiili. Paku pigem põhjendatud valikuid ja variante ning aita kasutajal endal otsustada.
Kui spetsialist palub, võid koos temaga sõnastada lühikese näidisplaani või skeemi,
jättes lõpliku otsustuse ja vastutuse talle.

Ära lõpeta vastust automaatselt üldise pakkumise või valikküsimusega
stiilis „kas soovid, et koostan plaani / räägin mudelist / kirjutan hindamiskava“.
Kui kasutaja palub seda ise, võid vastavalt tema soovile aidata plaani või raamistiku sõnastada.

Kui teemaks on laste kaitse, perevägivald, raske hooletussejätmine,
enesetapuriski või muu kõrge riskiga olukord, tuleta delikaatselt meelde seadusest tulenevaid kohustusi
ning juhata vastava sisuga juhiste ja materjalideni, mis ette antud tekstides olemas on.

Pea meeles, et sotsiaaltöötaja võib küsida ka lihtsalt taustainfot või teoreetilist ülevaadet.
Sellisel juhul keskendu rahulikule ja informatiivsele selgitusele, mitte juhtumipõhisele analüüsile.
`,
};

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

export function pickReplyLang({ userMessage, uiLocale }) {
  const ui = (uiLocale || "").toLowerCase();
  const d = detectLang(userMessage);
  if (ui === "ru" || ui === "en" || ui === "et") {
    if (d === "ru" && ui !== "ru") return "ru";
    return ui;
  }
  return d || "et";
}

export function langStrings(lang = "et", role = "CLIENT") {
  const isWorker = role === "SOCIAL_WORKER";
  if (lang === "ru") {
    return {
      greetingClient: "Привет! Чем могу помочь?",
      greetingWorker: "Привет! С чем нужно помочь сегодня?",
      noContext: isWorker
        ? "Сейчас не удалось найти подходящий материал по этому запросу. Обратись к внутренним регламентам, коллегам или супервизии. При желании можешь уточнить ситуацию (кейс, муниципалитет, услуга) и попробовать еще раз."
        : "Сейчас не удалось найти надежный материал по этому вопросу. Можешь немного точнее описать ситуацию или муниципалитет; при необходимости обратись в соцслужбу своего самоуправления.",
      crisisNoCtx:
        "Если есть непосредственная опасность или речь о саморазрушении — звони 112. Сейчас нет подходящего материала по теме, опиши кратко, что происходит.",
    };
  }
  if (lang === "en") {
    return {
      greetingClient: "Hi! How can I help you today?",
      greetingWorker: "Hello! What case or focus should we look at today?",
      noContext: isWorker
        ? "No suitable material was found for this query. Please check your organisation’s guidelines or colleagues, or add details (case, municipality, service) and try again."
        : "We could not find a reliable source text for this question right now. Please describe your situation or municipality a bit more; you can always contact your local social services office.",
      crisisNoCtx:
        "If anyone is in immediate danger or self-harm is mentioned, call 112 right away. No trusted material was found for this query.",
    };
  }
  // et default
  return {
    greetingClient: "Tere! Millega saan täna toeks olla?",
    greetingWorker: "Tere! Millise teema või juhtumi fookusega saan toeks olla?",
    noContext: isWorker
      ? "Praegu ei leidnud ma ette antud materjalidest sobivat tuge sellele küsimusele. Võid vaadata oma organisatsiooni juhiseid või arutada kolleegide või supervisoriga; soovi korral saad täpsustada teemat (juhtum, KOV, teenus) ja proovida uuesti."
      : "Hetkel ei leidnud ma SotsiaalAI materjalide hulgast sisu, mis sellele küsimusele otseselt vastaks. Kirjelda oma olukorda või omavalitsust veidi täpsemalt; alati võid pöörduda ka oma KOV sotsiaaltöö teenistuse poole.",
    crisisNoCtx:
      "Kui on otsene oht või viide enesevigastusele, helista kohe 112. Hetkel ei leidnud ma sobivaid materjale, palun kirjelda lühidalt, mis toimub.",
  };
}

function rolePolicy(effectiveRole) {
  const behaviour = ROLE_BEHAVIOUR[effectiveRole] || ROLE_BEHAVIOUR.CLIENT;
  const label = ROLE_LABELS[effectiveRole] || ROLE_LABELS.CLIENT;
  return `Roll: ${label}\n${behaviour.trim()}`;
}

function groundingPolicy(includeSources) {
  const cite = includeSources && RAG_ALLOW_QUOTES;
  return [
    "Kasuta vastamisel ainult ette antud materjale (RAG-süsteemi kaudu saadud tekstid ja väljavõtted).",
    "Ära esita oletusi faktina; kui ette antud materjalidest ei piisa teema mõistlikuks selgitamiseks, ütle seda lühidalt.",
    // viitamine ja allikate kuvamine toimub UI tasemel, mitte vastuse tekstis
    cite ? null : null,
  ]
    .filter(Boolean)
    .join(" ");
}

function crisisPolicy(isCrisis) {
  if (!isCrisis) return null;
  return "Kui jutus on ohu- või kriisitunnused, ütle seda selgelt, julgustavalt ja suuna kohese abi poole (112). Ära dramatiseeri.";
}

function interactionPolicy(includeSources) {
  return [
    "Struktureeri vastus selgelt ja loogiliselt.",
    "Vasta tavaliselt mitmest lõigust koosneva, rahuliku ja ladusa selgitusega. Kui ette antud materjal on sisukas (isegi kui see on ainult üks tekst), ära piirdu ühe lühikese lõiguga, vaid ava teema tervikuna.",
    "Kui ette antud materjalid käsitlevad teemat mitmest küljest või pärinevad mitmest allikast, seo neist tulenev info üheks terviklikuks vastuseks, mis kirjeldab suurt pilti: mis see on, milleks see on, kuidas see toimib ja mis on peamised nüansid.",
    "Kasuta peamiselt lühikesi ja loetavaid lõike; loetelusid kasuta ainult siis, kui need aitavad selgust luua (nt sammud, plussid ja miinused, kontrollnimekiri) või kui kasutaja seda ise palub.",
    "Lihtsamate mõistete puhul võib vastus olla veidi lühem, kuid siiski mitmest lõigust koosnev, kui ette antud materjal seda võimaldab. Keerulisemate protsesside ja metoodikate puhul võid anda pikema, samm-sammulise selgituse.",
    "Ära esita palju küsimusi korraga; vajadusel küsi vaid mõned sihitud küsimused.",
    "Ära lõpeta vastust automaatse valikküsimuse või üldise pakkumisega (nt „kas soovid, et koostan plaani / räägin veel X kohta“), kui kasutaja ei ole seda ise palunud.",
    "Ära loo vastuses eraldi viite- või allikate blokki ning ära kasuta sõnu „allikas“, „RAG“ või „kontekst“ – selline info kuvatakse kasutajale eraldi nupu alt.",
  ]
    .filter(Boolean)
    .join(" ");
}

function languageRule(replyLang) {
  return `Vasta keeles: ${replyLang || "et"}.`;
}

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
  const blocks = [
    rolePolicy(effectiveRole),
    groundingPolicy(includeSources),
    crisisPolicy(isCrisis),
    interactionPolicy(includeSources),
    languageRule(replyLang),
  ].filter(Boolean);

  const system = blocks.join("\n\n").trim();
  const historyMessages = Array.isArray(history) ? history : [];

  const materialMessage = context
    ? {
        role: "system",
        content: `Siin on materjalid, mille põhjal vastad. Ära viita neile otsesõnu ega kasuta sõnu „allikas“, „RAG“ või „kontekst“, vaid kasuta neid taustteadmisena ja koosta inimlik, mitmest lõigust koosnev, sidus selgitus:\n\n${context}`,
      }
    : {
        role: "system",
        content: "Sulle ei ole antud eraldi materjale; vasta ainult kasutaja sõnumi ja oma juhiste põhjal.",
      };

  const extraInfoMessage = grounding
    ? {
        role: "system",
        content: `Lisainfo vastamise suunamiseks: ${grounding}`,
      }
    : null;

  const messages = [
    { role: "system", content: system },
    materialMessage,
    ...(extraInfoMessage ? [extraInfoMessage] : []),
    ...historyMessages,
    { role: "user", content: userMessage },
  ];

  return {
    model: DEFAULT_MODEL,
    input: messages,
    max_output_tokens: OPENAI_MAX_OUTPUT_TOKENS,
  };
}

export function buildResponsesPayload(input, options = {}) {
  const { stream = true } = options;
  return {
    ...input,
    stream,
    metadata: { source: "sotsiaalai-chat" },
  };
}
