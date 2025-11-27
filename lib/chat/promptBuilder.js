import { DEFAULT_MODEL, OPENAI_MAX_OUTPUT_TOKENS, RAG_ALLOW_QUOTES } from "./settings.js";

export const ROLE_LABELS = {
  CLIENT: "elukysimusega poorduya",
  SOCIAL_WORKER: "sotsiaaltoo spetsialist",
  ADMIN: "administraator",
};

export const ROLE_BEHAVIOUR = {
  CLIENT: `
Räägi soojalt, rahulikult ja arusaadavalt. Ära hinda ega süüdista.
Sinu eesmärk on aidata inimesel mõista oma olukorda, õigusi ja võimalikke samme.

Kasuta lihtsat keelt, lühikesi lõike ja vajadusel konkreetseid näiteid.
Toetu vastamisel ainult RAG-kontekstis ette antud allikatele.
Ära lisa oletusi ega teadmisi, mida kontekst ei toeta.
`,
  SOCIAL_WORKER: `
Räägi professionaalselt ja kollegiaalselt.
Erista selgelt, mis tuleneb õigusest, ametlikest juhistest või heast praktikast.
Kui kontekst on napp, ütle seda ausalt ja väldi oletusi faktina.
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
      ? "RAG ei leidnud sobivat allikat. Palun vaata organisatsiooni juhiseid või küsi kolleegidelt/supervisioonist. Soovi korral täpsusta teemat (juhtum, KOV, teenus)."
      : "SotsiaalAI ei leidnud praegu sobivat allikat. Kirjelda olukorda või omavalitsust veidi täpsemalt; alati võid pöörduda oma KOV sotsiaaltöö teenistuse poole.",
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
    "Kasuta ainult ette antud konteksti.",
    "Ära lisa oletusi, mida kontekst ei toeta.",
    cite ? "Kui tsiteerid, tee seda lühidalt." : "Vasta omas sõnastuses, ära loo pikki tsitaate.",
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
    "Hoia vastus lühike ja selge.",
    "Ära esita palju küsimusi korraga.",
    includeSources ? "Lisa lühike viide allikatele, kui need on kontekstis olemas." : null,
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
    { role: "user", content: `${userMessage}\n\nKONTEKST:\n${context || "(puudub)"}\n\nGrounding: ${grounding}` },
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
