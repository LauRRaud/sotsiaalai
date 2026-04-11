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
    "Do not use audit-style phrases such as 'confirmed', 'not confirmed', 'kinnitatud', or 'ei ole kinnitatud' in user-facing answers.",
    "Do not guess eligibility, legal outcomes, deadlines, amounts, or official requirements.",
    "Distinguish clearly between source-grounded fact and general practical guidance."
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

function styleRule(effectiveRole) {
  if (effectiveRole === "SOCIAL_WORKER") {
    return [
      "Be professional, structured, and practical.",
      "Assume some domain knowledge but avoid unnecessary jargon.",
      "When relevant, distinguish between service, benefit, legal basis, and practical next step.",
      "Highlight conditions, exceptions, risks, and next steps when useful.",
      "Prefer concise answers with clear structure."
    ].join(" ");
  }

  return [
    "Be calm, supportive, and practical.",
    "Use plain language and avoid bureaucratic or technical wording.",
    "Do not assume the user understands institutions, service names, or administrative logic.",
    "Explain things from the user's point of view.",
    "Focus on what the user can do next."
  ].join(" ");
}

function answerShapeRule(effectiveRole) {
  if (effectiveRole === "SOCIAL_WORKER") {
    return [
      "When useful, structure the answer like this:",
      "1. Main conclusion.",
      "2. Key distinctions, conditions, or risks.",
      "3. Most practical next step."
    ].join(" ");
  }

  return [
    "When useful, structure the answer like this:",
    "1. Simple explanation.",
    "2. What the person can do next.",
    "3. Then add only the most relevant extra detail."
  ].join(" ");
}

function formattingRule(effectiveRole) {
  if (effectiveRole === "SOCIAL_WORKER") {
    return "Prefer short paragraphs. Use up to 5 bullets only when steps, options, or distinctions clearly benefit from it. Do not use Markdown bold, italic, or emphasis markers.";
  }
  return "Prefer short paragraphs. Use bullets only when they make next steps easier to follow. Do not use Markdown bold, italic, or emphasis markers.";
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

export function toResponsesInput({
  history,
  userMessage,
  context,
  effectiveRole,
  grounding: _grounding,
  replyLang,
  isCrisis = false,
  maxOutputTokens = OPENAI_MAX_OUTPUT_TOKENS
}) {
  const resolvedMaxOutputTokens = resolveMaxOutputTokens(effectiveRole, maxOutputTokens);

  const system = buildSystemPrompt({
    effectiveRole,
    replyLang,
    isCrisis
  });

  const materialMessage = buildMaterialMessage({ context });

  return {
    model: DEFAULT_MODEL,
    input: [
      { role: "system", content: system },
      materialMessage,
      ...(Array.isArray(history) ? history : []),
      { role: "user", content: userMessage }
    ],
    max_output_tokens: resolvedMaxOutputTokens
  };
}

export function buildResponsesPayload(input, options = {}) {
  const payload = {
    ...input,
    stream: options.stream ?? true,
    metadata: {
      source: "sotsiaalai-chat"
    },
    text: {
      verbosity: "low"
    },
    reasoning: {
      effort: "low"
    }
  };

  return payload;
}
