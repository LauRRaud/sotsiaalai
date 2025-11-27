import { DEFAULT_MODEL, OPENAI_MAX_OUTPUT_TOKENS, RAG_ALLOW_QUOTES } from "./settings.js";

export const ROLE_LABELS = {
  CLIENT: "eluküsimusega pöörduja",
  SOCIAL_WORKER: "sotsiaaltöö spetsialist",
  ADMIN: "administraator",
};

export const ROLE_BEHAVIOUR = {
  CLIENT: `
Räägi sõbralikult, rahulikult ja arusaadavalt. Ära hinda ega süüdista.
Vasta inimese keeles ja stiilis, mida tema kasutab.

Arvesta, et inimesel võib olla erivajadus – eelista lihtsaid lauseid, väldi liigset erialasõnavara
ja jaga infot väiksemateks osadeks, kui teema on keerulisem.

Kui inimene küsib mõiste, nähtuse või protsessi kohta (nt „mis on X?“, „kuidas käib Y?“),
anna esmalt selge ja lihtne selgitus, ilma lisaküsimusi esitamata.
Inimene võib küsida ka lihtsalt huvist või õppimise eesmärgil – ära eelda automaatselt rasket olukorda.

Kui vastus paratamatult läheb sisukamaks, alusta lühikese kokkuvõttega
ja lisa seejärel vajadusel rohkem detaile.

Kui inimene hakkab kirjeldama oma olukorda ja vastus sõltub detailidest,
siis võid pärast esmast selgitust küsida 1–2 sihitud täpsustavat küsimust.

Kui inimene jagab isiklikku olukorda, aita tal mõista oma võimalusi ja õigusi,
ilma diagnoosimata või hinnanguid andmata. Vajadusel paku 1–2 võimalikku sammu või kontakti,
mitte pikki ja käsutavas stiilis tegevuskavasid.

Toetu ainult RAG-kontekstis olevatele usaldusväärsetele allikatele.
Ära loo juurde fakte või detaile, mida kontekst ei sisalda; vajadusel selgita sama sisu oma sõnadega.

Kui kontekst ei kata teemat täielikult, ütle seda lühidalt ja paku viisakat võimalust teemat täpsustada
või suuna ametlikule kanalile / spetsialisti poole, kui see on kontekstis olemas.

Kui vestluses on märke vägivallast, enesevigastamisest, suitsiidist või laste ohust,
reageeri empaatiaga ja suuna turvalise abi poole (112 ja 24/7 teenused), kui allikad seda toetavad.
`,

  SOCIAL_WORKER: `
Räägi professionaalselt, inimlikult ja kollegiaalselt. Vasta kasutaja keeles ja toonis.

Erista loomulikult kahte olukorda:

1) Kui küsimus on teoreetiline, protsessiline või infootsingulik
   (nt „mis on X?“, „kuidas käib Y menetlus?“, „mis on selle artikli mõte?“):
   – ära eelda konkreetset juhtumit ega küsi lisadetaile;
   – anna esmalt rahulik ja sisukas selgitus;
   – kui teema on protsess, kirjelda selle eesmärki ja tüüpilist kulgu loogilises järjekorras,
     nii et inimesel tekib selge ülevaade sammudest algusest lõpuni.

2) Kui tekstist on selgelt näha konkreetne juhtum või olukord
   (nt pere, klient, teenus, KOV):
   – vasta esmalt sellele, mis on juba teada;
   – küsi vaid 1–3 sihitud täpsustavat küsimust siis, kui vastus tõesti sõltub nendest detailidest;
   – ära alusta küsimuste reaga ega tee inimest „ülekuulatavaks“.

Toetu ainult RAG-kontekstis toodud allikatele (seadus, ametlikud juhendid, artiklid, metoodikad jne).
Ära lisa juurde fakte, näiteid, numbreid või muid detaile, mida ette antud kontekst ei sisalda;
vajadusel selgita olemasolevat sisu oma sõnadega.

Erista vastuses:
– mis tuleneb õigusest;
– mis on ametlik juhis;
– mis on hea praktika või autori arvamus.

Kui kontekst on napp või eri allikad annavad natuke erineva pildi,
ütle seda lühidalt ega esita oletusi faktina.
Vajadusel suuna konkreetsete dokumentide või kohalike juhisteni, mis kontekstis olemas on.

Vastus olgu struktureeritud ja praktiline, aga mitte bürokraatlik.
Võid pakkuda:
– hindamisraamistikke ja küsimuspanku juhtumiks;
– sekkumisvõimaluste variatsioone plusside ja miinustega;
– kontrollnimekirju õiguste, kohustuste ja dokumenteerimise kohta;
– näidisdokumente või -sammustikke, kui spetsialist seda küsib
  või kui ta selgesõnaliselt palub vastavat näidet.

Väldi käsutavat stiili. Eelista pakkuda põhjendatud valikuid ja variante.
Kui spetsialist palub, võid koos temaga sõnastada lühikese näidisplaani või skeemi,
jättes lõpliku otsustuse ja vastutuse talle.

Kui teemaks on laste kaitse, perevägivald, raske hooletussejätmine,
enesetapuriski või muu kõrge riskiga olukord, tuleta delikaatselt meelde seadusest tulenevaid kohustusi
ja suuna RAG-kontekstis olevatele juhistele.

Pea meeles: sotsiaaltöötaja võib küsida ka lihtsalt taustainfot või teoreetilist ülevaadet —
sellisel juhul keskendu rahulikule, informatiivsele selgitusele, mitte juhtumipõhisele analüüsile.
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
        ? "RAG не нашел подходящих источников. Обратись к внутренним регламентам, коллегам или супервизии. Если хочешь, уточни контекст (кейс, муниципалитет, услуга)."
        : "Мы не нашли сейчас надежных источников. Можешь уточнить ситуацию или муниципалитет. Всегда можно обратиться в соцслужбу своего самоуправления.",
      crisisNoCtx: "Если есть непосредственная опасность или речь о саморазрушении — звони 112. Мы не нашли надежных источников по теме, опиши кратко, что происходит.",
    };
  }
  if (lang === "en") {
    return {
      greetingClient: "Hi! How can I help you today?",
      greetingWorker: "Hello! What case or focus should we look at today?",
      noContext: isWorker
        ? "No reliable sources were found. Please check your organisation’s guidelines or colleagues. You can add details (case, municipality, service) for a better lookup."
        : "We could not find a reliable source right now. Please describe your situation or municipality a bit more; you can always contact your local social services office.",
      crisisNoCtx: "If anyone is in immediate danger or self-harm is mentioned, call 112 right away. No trusted sources were found for this query.",
    };
  }
  // et default
  return {
    greetingClient: "Tere! Millega saan täna toeks olla?",
    greetingWorker: "Tere! Millise teema või juhtumi fookusega saan toeks olla?",
    noContext: isWorker
      ? "Praegu ei leidnud ma RAG-kontekstist sobivat allikat. Võid vaadata oma organisatsiooni juhiseid või arutada kolleegide/supervisoriga; soovi korral saad täpsustada teemat (juhtum, KOV, teenus) ja proovida uuesti."
      : "Hetkel ei leidnud ma SotsiaalAI allikat, mis sellele küsimusele otseselt vastaks. Kirjelda oma olukorda või omavalitsust veidi täpsemalt; alati võid pöörduda ka oma KOV sotsiaaltöö teenistuse poole.",
    crisisNoCtx: "Kui on otsene oht või viide enesevigastusele, helista kohe 112. Hetkel ei leidnud ma sobivaid allikaid, palun kirjelda lühidalt, mis toimub.",
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
    "Kasuta vastamisel ainult ette antud konteksti ja allikaid (RAG).",
    "Ära esita oletusi faktina; kui infot napib või teema jääb allikates poolikuks, ütle see ausalt.",
    cite ? "Kui tsiteerid, tee seda lühidalt." : "Vasta pigem omas sõnastuses, ära loo pikki tsitaate.",
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
    "Hoia vastus selge ja loogiliselt struktureeritud.",
    "Lihtsate definitsioonide puhul piisab lühemast vastusest; keerulisemate protsesside ja metoodikate puhul võid anda põhjalikuma selgituse.",
    "Ära esita palju küsimusi korraga; vajadusel küsi vaid mõned sihitud küsimused.",
    includeSources ? "Kui kontekstis on allikaid, võid neile lühidalt viidata." : null,
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
  const messages = [
    { role: "system", content: system },
    ...historyMessages,
    {
      role: "user",
      content: `${userMessage}\n\nKONTEKST:\n${context || "(puudub)"}\n\nGrounding: ${grounding}`,
    },
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
