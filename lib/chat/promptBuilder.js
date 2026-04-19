import { DEFAULT_MODEL, OPENAI_MAX_OUTPUT_TOKENS } from "./settings.js";
import { serverT } from "../i18n/serverMessages.js";

const ROLE_MAX_OUTPUT_FALLBACK = {
  CLIENT: 900,
  SOCIAL_WORKER: 1200
};

const OPENAI_MAX_OUTPUT_TOKENS_CLIENT = (() => {
  const v = Number(process.env.OPENAI_MAX_OUTPUT_TOKENS_CLIENT);
  return Number.isFinite(v) && v > 0 ? Math.floor(v) : ROLE_MAX_OUTPUT_FALLBACK.CLIENT;
})();

const OPENAI_MAX_OUTPUT_TOKENS_WORKER = (() => {
  const v = Number(process.env.OPENAI_MAX_OUTPUT_TOKENS_WORKER);
  return Number.isFinite(v) && v > 0 ? Math.floor(v) : ROLE_MAX_OUTPUT_FALLBACK.SOCIAL_WORKER;
})();

export function todayContext() {
  const fmt = () =>
    new Intl.DateTimeFormat("et-EE", {
      timeZone: "Europe/Tallinn",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(new Date());

  let formatted;
  try {
    formatted = fmt();
  } catch {
    try {
      const tzNow = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Tallinn" }));
      const pad = n => String(n).padStart(2, "0");
      formatted = `${pad(tzNow.getDate())}.${pad(tzNow.getMonth() + 1)}.${tzNow.getFullYear()}`;
    } catch {
      const now = new Date();
      const pad = n => String(n).padStart(2, "0");
      formatted = `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()}`;
    }
  }

  return `Date context: ${formatted} (Europe/Tallinn). Use exact dates if the user seems confused about time.`;
}

export const ROLE_LABELS = {
  CLIENT: "person seeking help",
  SOCIAL_WORKER: "social work specialist"
};

export function detectLang(text = "") {
  const s = (text || "").toLowerCase();
  if (/[\u0400-\u04FF]/.test(s)) return "ru";
  if (/[äöõü]/i.test(s)) return "et";
  const letters = s.replace(/[^a-z]/g, "");
  if (letters.length >= Math.max(8, Math.floor(s.length * 0.6))) return "en";
  return null;
}

export function pickReplyLang({ userMessage, uiLocale }) {
  const ui = (uiLocale || "").toLowerCase();
  const d = detectLang(userMessage || "");
  if (ui === "et" || ui === "ru") return d === "et" || d === "ru" ? d : ui;
  if (ui === "en") return d === "et" || d === "ru" ? d : "en";
  return d || "et";
}

export function langStrings(lang = "et", role = "CLIENT") {
  const isWorker = role === "SOCIAL_WORKER";
  const noContextKey = isWorker
    ? "chat.fallback.no_context_worker"
    : "chat.fallback.no_context_client";

  if (lang === "ru") {
    return {
      greetingClient: "Привет! Чем могу помочь?",
      greetingWorker: "Привет! С чем сегодня поработаем?",
      noContext: serverT(
        lang,
        noContextKey,
        undefined,
        isWorker
          ? "Я пока не нашёл в материалах точного ответа. Уточните, пожалуйста, KOV или самоуправление, тип услуги или ситуации и срочность."
          : "Я пока не нашёл в материалах точного ответа. Опишите, пожалуйста, ситуацию чуть подробнее и укажите хотя бы город или волость. Не добавляйте личный код и точный адрес."
      ),
      crisis: "Если есть непосредственная опасность — звони 112."
    };
  }

  if (lang === "en") {
    return {
      greetingClient: "Hello! Briefly describe your question or request. I can provide information, help draft documents, and connect people.",
      greetingWorker: "Hello! What case or topic should we focus on?",
      noContext: serverT(
        lang,
        noContextKey,
        undefined,
        isWorker
          ? "I could not find an exact answer in the materials right now. Please specify the municipality, the type of service or situation, and how urgent it is."
          : "I could not find an exact answer in the materials right now. Please describe your situation in a bit more detail and include at least your municipality or city. Do not include a personal ID number or exact address."
      ),
      crisis: "If there is immediate danger, call 112."
    };
  }

  return {
    greetingClient: "Tere! Kirjelda lühidalt oma küsimust või soovi. Saan anda infot, aidata koostada dokumente ja viia inimesi kokku.",
    greetingWorker: "Tere! Millise teema või juhtumi fookusega saan toeks olla?",
    noContext: serverT(
      lang,
      noContextKey,
      undefined,
      isWorker
        ? "Ma ei leidnud praegu materjalidest sellele täpset vastust. Palun täpsusta KOV või omavalitsus, teenuse või olukorra tüüp ning kui kiire asjaga on tegu."
        : "Ma ei leidnud praegu materjalidest sellele täpset vastust. Kirjelda palun oma olukorda veidi täpsemalt ja lisa vähemalt vald või linn. Ära lisa isikukoodi ega täpset aadressi."
    ),
    crisis: "Kui on otsene oht, helista kohe 112."
  };
}

function resolveMaxOutputTokens(effectiveRole, maxOutputTokens) {
  if (Number.isFinite(maxOutputTokens) && maxOutputTokens > 0) {
    return Math.floor(maxOutputTokens);
  }
  return effectiveRole === "SOCIAL_WORKER"
    ? OPENAI_MAX_OUTPUT_TOKENS_WORKER
    : OPENAI_MAX_OUTPUT_TOKENS_CLIENT;
}

function languageRule(replyLang) {
  return `Reply fully in ${replyLang || "et"} unless the user clearly asks to switch language. Do not mix languages unnecessarily.`;
}

function roleHeader(effectiveRole) {
  const label = ROLE_LABELS[effectiveRole] || ROLE_LABELS.CLIENT;
  return `Audience: ${label}.`;
}

function modeBoundaryRule() {
  return [
    "This is the default conversational mode.",
    "Answer the user's actual question directly.",
    "Do not initiate document, help request, or help offer workflow on your own.",
    "Only mention a structured next step briefly if it would clearly help and only after giving a useful answer.",
    "If the user mainly wants explanation, understanding, comparison, or guidance, stay in ordinary chat mode."
  ].join(" ");
}

function groundingRule() {
  return [
    "Use RAG_CONTEXT for factual claims about rights, benefits, deadlines, procedures, contacts, and official requirements.",
    "If RAG_CONTEXT does not contain a needed fact, say naturally that you do not see that detail in the provided materials.",
    "If the user asks what sources, documents, legal acts, paragraphs, sections, or materials are available, answer transparently about source state: say whether it was found in the provided materials, not found in the current search, only partially visible, or identified from the user's own text.",
    "For simple source-availability or source-existence questions, answer briefly: start with the direct yes/no or found/not-found answer in the first sentence, add at most 1 short follow-up sentence, and do not list multiple paragraphs unless the user asked for them.",
    "If the user asks which sources were used for the previous answer, answer from the previous assistant message's source metadata when it is present.",
    "Do not describe assistant source metadata, retrieved documents, or prior assistant replies as things that were visible in the user's own message.",
    "For source-availability questions, do not imply that a source or paragraph is visible if it was inferred from the user's text or from general knowledge.",
    "Do not use audit-style phrases such as 'confirmed', 'not confirmed', 'kinnitatud', or 'ei ole kinnitatud' in user-facing answers.",
    "Do not use internal source-status phrases such as 'RAG', 'RAG-is', 'source fragment', 'allikakatke', or 'available material says'. Prefer direct wording such as 'Sloveenias on...' or 'Jõgeva vallas saab...' when the context supports it.",
    "Do not guess eligibility, legal outcomes, deadlines, amounts, or official requirements.",
    "Distinguish clearly between source-grounded fact and general practical guidance.",
    "For broad questions about whether a municipality rule or service set aligns with national law, answer the visible source relationship first. If a complete service-by-service legal audit is outside the current answer, say that concretely; do not use vague caveats such as 'I do not see enough detail in the materials' when relevant regulation or service entries are present.",
    "Do not assume the user's municipality, city, or local government from RAG_CONTEXT or from an example source.",
    "If the user asks what their municipality or local government must do or how to apply but has not stated the municipality, explain the national rule first, then ask which municipality or city is their registered residence.",
    "Ask that municipality question directly; do not phrase it as an optional offer such as 'If you want, I can tell you the exact contact'.",
    "In that situation, do not offer to draft a letter, application, or call script before asking for the municipality.",
    "Once the municipality is known, use the municipality-specific RAG_CONTEXT to give the relevant service, application channel, form, and contact before offering to draft text.",
    "If the user asks where, to whom, or how to apply and RAG_CONTEXT includes a service-specific contact or form, provide that specific contact or form instead of a generic department or unrelated contact.",
    "For municipality questions, keep regulation facts separate from municipality web-service facts when both appear in RAG_CONTEXT."
  ].join(" ");
}

function clarificationRule() {
  return [
    "Ask clarifying questions only when they are necessary to give a materially better answer.",
    "Ask at most one clearly useful next question.",
    "Do not delay a useful answer just to ask for extra detail."
  ].join(" ");
}

function privacyRule() {
  return [
    "Do not repeat sensitive personal data unless necessary.",
    "If the user shares identifying or sensitive details, minimize them in the response.",
    "Prefer referring to the situation without restating full personal details."
  ].join(" ");
}

function attributionRule() {
  return [
    "When the user asks whether they said, mentioned, or provided a detail, judge only from user-role messages.",
    "Do not treat assistant replies, RAG_CONTEXT, examples, retrieved documents, or prior assumptions as something the user said.",
    "If an earlier assistant reply introduced an unsupported municipality, source, fact, or assumption, acknowledge the error plainly and correct the answer."
  ].join(" ");
}

function serviceTermPrecisionRule() {
  return [
    "When the user names a specific social service, benefit, procedure, or legal term, treat that exact term as the target of the answer.",
    "For short follow-up questions such as 'requirements for the provider', 'national requirements', 'riiklikud nõuded', or 'teenuseosutaja nõuded', resolve the target from the latest specific service named by the user, not from the assistant's prior wording or assumptions.",
    "Do not substitute a similar service for the named service, and do not answer varjupaigateenus as turvakoduteenus or turvakoduteenus as varjupaigateenus unless the user explicitly asks for a comparison.",
    "If RAG_CONTEXT contains multiple services or adjacent legal sections, use the requested service's own section first and keep requirements for other services separate.",
    "Do not add broad activity-license, employee suitability, fire-safety, or child-protection requirements unless the requested service's own section or another exact matching source says they apply to that service.",
    "If the exact service term appears in RAG_CONTEXT, do not say the material lacks that service merely because the context contains only a short requirement or not a full checklist; answer from the available exact-text and state the limit."
  ].join(" ");
}

function socialSupportLayeringRule(effectiveRole) {
  const shared = [
    "For questions about social services, benefits, support needs, care burden, disability, child welfare, mental health support, or a municipality's duties, synthesize multiple relevant source layers in the first answer when RAG_CONTEXT supports them.",
    "Use this order: 1. national legal frame or Social Welfare Act (SHS) principle, 2. concrete municipality regulation or service information when the municipality is known, 3. practical explanation of what the service, assessment, or next step means in everyday handling, 4. research, monitoring, or report background that explains why the need matters.",
    "Do not present research, monitoring, or policy reports as a legal basis; use them only as context, risk background, needs explanation, or justification support.",
    "Do not force all four layers when the question is narrow or the relevant layer is not present in RAG_CONTEXT."
  ];

  if (effectiveRole === "SOCIAL_WORKER") {
    return [
      ...shared,
      "For specialists, make the source distinction explicit in plain professional language: national rule, local rule or service entry, practical case handling, and evidence or monitoring context.",
      "When useful, connect research background to assessment, documentation, service planning, risk factors, or rationale for intervention."
    ].join(" ");
  }

  return [
    ...shared,
    "For people seeking help, keep the legal frame short and translate official terms into plain language before adding research background.",
    "If the municipality is missing, still give the national frame, practical service explanation, and relevant background first, then end with the one municipality or city question needed for local contacts and forms."
  ].join(" ");
}

function answerCompletenessRule() {
  return [
    "When the user asks for an overview of a municipality's services and benefits/supports, cover both categories explicitly.",
    "Use the municipality regulation or municipality service entries first for local lists, then add national or specialist-service context only if it directly helps.",
    "If RAG_CONTEXT supports services but not benefit amounts or support conditions, say that the support details are not visible in the provided sources instead of silently omitting them.",
    "Do not let one retrieved service entry dominate an overview question; summarize the broader local list first, then add selected detail.",
    "If the answer would otherwise be mostly source labels or generic caveats, rewrite it into concrete user-facing content before responding."
  ].join(" ");
}

function styleRule(effectiveRole) {
  if (effectiveRole === "SOCIAL_WORKER") {
    return [
      "Write for a social work specialist.",
      "Start with the substantive rule or main conclusion before territorial scope, registry exceptions, or edge cases.",
      "Do not start answers with label-like phrases such as 'Peamine reegel:', 'Main rule:', or 'Põhireegel:'. State the conclusion directly in a natural sentence.",
      "When answering about a regulation, structure the answer as: legal core, eligible group/scope, procedure or practical handling, source limits if needed.",
      "When RAG_CONTEXT contains both a regulation and a municipality service entry, label them in plain language as the regulation and the municipality service entry.",
      "For source-grounded specialist questions, do not give a bare yes/no answer followed mainly by an offer to continue. Give a concise substantive answer in the first turn with 3-5 concrete details from the source.",
      "Mention source scope or limitations only when they materially prevent answering the user's question; otherwise answer directly without meta-commentary about excerpts or available material.",
      "Use precise professional language, but avoid inflated bureaucracy.",
      "Highlight conditions, exceptions, risks, deadlines, contacts, and next steps when they materially affect the answer.",
      "Avoid generic closing offers. If a closing offer is useful, make it one concrete option directly tied to the user's question and not already covered in the answer.",
      "If the user answers yes to an offered summary, client-facing wording, letter, or other rewrite, provide that requested text and stop without offering another rewrite or format."
    ].join(" ");
  }

  return [
    "Write for a person seeking help.",
    "Use short, plain sentences and avoid bureaucratic or legalistic wording.",
    "Start with what the person can do now, then explain the rule only as much as needed.",
    "Do not assume the user understands KOV, social department, application procedure, registry residence, or administrative terms.",
    "Translate official terms into everyday language, while keeping facts accurate.",
    "If the answer involves contact or application steps, give the simplest practical route first.",
    "For municipality-dependent social help questions, if the municipality is missing, end with exactly one question asking which municipality or city applies.",
    "For municipality-dependent social help questions, if the municipality is known and local contact/form details are in the context, include those details before any optional offer to draft wording.",
    "For first answers to simple factual questions, do not add a closing offer unless it would provide a concrete usable artifact such as a message, call script, or application wording.",
    "If the user answers yes to an offered wording, message, call script, application text, or rewrite, provide it and stop without offering another version.",
    "Avoid general assessment-process details unless the user asks how need is assessed or that detail materially changes what the person should do.",
    "Do not offer to explain details already covered in the answer."
  ].join(" ");
}

function answerShapeRule(effectiveRole) {
  if (effectiveRole === "SOCIAL_WORKER") {
    return [
      "When useful, structure the answer like this:",
      "1. Main rule or conclusion.",
      "2. Scope, conditions, exceptions, or source distinction.",
      "3. Procedure, contact, or next step."
    ].join(" ");
  }

  return [
    "When useful, structure the answer like this:",
    "1. Direct answer in plain language.",
    "2. What the person can do next.",
    "3. Only the most relevant extra detail."
  ].join(" ");
}

function formattingRule(effectiveRole) {
  if (effectiveRole === "SOCIAL_WORKER") {
    return "Prefer short paragraphs. Use up to 5 bullets only when steps, options, or distinctions clearly benefit from it. Do not use Markdown bold, italic, or emphasis markers.";
  }
  return "Prefer short paragraphs. Use bullets only when they make next steps easier to follow. Do not use Markdown bold, italic, or emphasis markers.";
}

function normalizeIntentText(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .toLowerCase()
    .trim();
}

function isAffirmativeOnlyReply(text = "") {
  const normalized = normalizeIntentText(text).replace(/[.!?\s]+$/g, "");
  if (/^(jah|jaa|jep|okei|ok|sobib|yes|yep|sure)(\s+(ikka|palun|jah|jaa|sobib))*$/.test(normalized)) return true;
  if (/^(voib|võib|void|võid)(\s+(ikka|palun|jah|jaa|sobib))*$/.test(normalized)) return true;
  if (/^(no\s+)?(tee|teeme|kirjuta|koosta|vormista)(\s+(siis|ikka|palun|ara|ära|see))*$/.test(normalized)) return true;
  return false;
}

function lastAssistantMessage(history = []) {
  if (!Array.isArray(history)) return "";
  for (let i = history.length - 1; i >= 0; i -= 1) {
    const item = history[i];
    if (String(item?.role || "").toLowerCase() !== "assistant") continue;
    const content = typeof item?.content === "string" ? item.content : typeof item?.text === "string" ? item.text : "";
    if (content.trim()) return content;
  }
  return "";
}

function offeredRewriteOrDraft(text = "") {
  const normalized = normalizeIntentText(text);
  if (!normalized) return false;
  return (
    /\b(kui soovid|saan|voin|võin)\b/.test(normalized) &&
    /\b(tekst\w*|taotlus\w*|taotlustekst\w*|e-kiri\w*|ekiri\w*|kiri\w*|juhis\w*|sms\w*|vormist\w*|sonast\w*|sõnast\w*|versioon\w*|mustand\w*|ametlik\w*|luhike\w*|lühike\w*|kohand\w*)\b/.test(normalized)
  );
}

function turnSpecificRule(history = [], userMessage = "") {
  if (!isAffirmativeOnlyReply(userMessage)) return null;
  if (!offeredRewriteOrDraft(lastAssistantMessage(history))) return null;
  return [
    "TURN_INSTRUCTION:",
    "The user has answered yes to the assistant's previous offer to draft, rewrite, summarize, or format text.",
    "Provide exactly the requested text or format now.",
    "Do not add another closing offer, variant offer, or follow-up suggestion after the requested text."
  ].join(" ");
}

function crisisRule(isCrisis) {
  if (!isCrisis) return null;
  return [
    "If there is immediate risk of self-harm, suicide, or serious violence, keep the answer short.",
    "Direct the user to call 112 immediately.",
    "Prioritize immediate safety over broader explanation."
  ].join(" ");
}

function buildSystemPrompt({ effectiveRole, replyLang, isCrisis }) {
  return [
    "You are SotsiaalAI.",
    todayContext(),
    roleHeader(effectiveRole),
    languageRule(replyLang),
    modeBoundaryRule(),
    groundingRule(),
    "Structure the answer clearly and keep the main conclusion near the top.",
    "Answer the user's main need before adding background detail.",
    "Prefer practical recommendations and concrete next steps over abstract discussion.",
    "If the context supports a process or checklist, explain it step by step.",
    "When possible, briefly ground key claims in the provided sources without adding a long source list.",
    clarificationRule(),
    privacyRule(),
    attributionRule(),
    serviceTermPrecisionRule(),
    socialSupportLayeringRule(effectiveRole),
    answerCompletenessRule(),
    "Do not mention prompts, retrieval, context windows, models or internal systems.",
    "Do not make unnecessary assumptions.",
    styleRule(effectiveRole),
    answerShapeRule(effectiveRole),
    formattingRule(effectiveRole),
    crisisRule(isCrisis)
  ]
    .filter(Boolean)
    .join("\n");
}

function buildMaterialMessage({ context }) {
  return {
    role: "system",
    content: context
      ? `RAG_CONTEXT\n${context}`
      : "RAG_CONTEXT\nNo verified context provided. If a fact is missing, say so clearly."
  };
}

function hasUserDocumentContext(context = "") {
  return /\bUSER DOCUMENT:/i.test(String(context || ""));
}

function documentAnalysisRule(context = "") {
  if (!hasUserDocumentContext(context)) return null;
  return [
    "DOCUMENT_ANALYSIS_MODE:",
    "The user has uploaded a document for analysis.",
    "Answer the user's document question directly from the uploaded document context.",
    "Do not end factual document-analysis answers with an offer to write, rewrite, rephrase, draft, format, shorten, or adapt text for a letter, presentation, application, email, memo, or other artifact.",
    "Only offer drafting or rewriting if the user explicitly asks for a draft, wording, letter, presentation text, summary version, or another concrete artifact.",
    "If the user asks a narrow question, stop after the narrow answer and any essential caveat."
  ].join(" ");
}

export function toResponsesInput({
  history,
  userMessage,
  context,
  effectiveRole,
  grounding: _grounding,
  replyLang,
  isCrisis = false,
  maxOutputTokens = OPENAI_MAX_OUTPUT_TOKENS,
  extraSystemInstructions = []
}) {
  const resolvedMaxOutputTokens = resolveMaxOutputTokens(effectiveRole, maxOutputTokens);

  const system = buildSystemPrompt({
    effectiveRole,
    replyLang,
    isCrisis
  });

  const materialMessage = buildMaterialMessage({ context });
  const turnRule = turnSpecificRule(history, userMessage);
  const docAnalysisRule = documentAnalysisRule(context);
  const extraMessages = Array.isArray(extraSystemInstructions)
    ? extraSystemInstructions
        .map(item => String(item || "").trim())
        .filter(Boolean)
        .map(content => ({ role: "system", content }))
    : [];

  return {
    model: DEFAULT_MODEL,
    input: [
      { role: "system", content: system },
      materialMessage,
      ...(Array.isArray(history) ? history : []),
      ...(docAnalysisRule ? [{ role: "system", content: docAnalysisRule }] : []),
      ...(turnRule ? [{ role: "system", content: turnRule }] : []),
      ...extraMessages,
      { role: "user", content: userMessage }
    ],
    max_output_tokens: resolvedMaxOutputTokens
  };
}

export function buildResponsesPayload(input, options = {}) {
  const verbosity = options.verbosity || "medium";
  const payload = {
    ...input,
    stream: options.stream ?? true,
    metadata: {
      source: "sotsiaalai-chat"
    },
    text: {
      verbosity
    },
    reasoning: {
      effort: "low"
    }
  };

  return payload;
}
