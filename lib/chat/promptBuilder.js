import { DEFAULT_MODEL, OPENAI_MAX_OUTPUT_TOKENS } from "./settings.js";
import { serverT } from "../i18n/serverMessages.js";

/* ------------------------------------------------------------------ */
/* Limits                                                              */
/* ------------------------------------------------------------------ */

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

export const ROLE_LABELS = {
  CLIENT: "person seeking help",
  SOCIAL_WORKER: "social work specialist"
};

function resolveMaxOutputTokens(effectiveRole, maxOutputTokens) {
  if (Number.isFinite(maxOutputTokens) && maxOutputTokens > 0) {
    return Math.floor(maxOutputTokens);
  }

  return effectiveRole === "SOCIAL_WORKER"
    ? OPENAI_MAX_OUTPUT_TOKENS_WORKER
    : OPENAI_MAX_OUTPUT_TOKENS_CLIENT;
}

/* ------------------------------------------------------------------ */
/* Date context                                                        */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/* Language                                                             */
/* ------------------------------------------------------------------ */

/**
 * Lightweight language hinting only.
 * The model itself is good at language understanding; this is just to keep
 * replyLang stable when the app needs a concrete value.
 */
const CYRILLIC_RE = /[\u0400-\u04FF]/;
const ESTONIAN_HINT_RE =
  /[äöõüšž]|\b(aga|aitäh|aitah|ei|ja|kas|kuidas|kus|mida|miks|millal|mis|olen|oled|olete|palun|soovin|tahan|tere|vajan|vald|või|voi)\b/i;
const ENGLISH_HINT_RE =
  /\b(hello|hi|please|thanks|thank you|what|why|how|when|where|who|can you|could you|help)\b/i;

export function detectLang(text = "") {
  const raw = String(text || "").trim();
  if (!raw) return null;

  if (CYRILLIC_RE.test(raw)) return "ru";
  if (ESTONIAN_HINT_RE.test(raw)) return "et";
  if (ENGLISH_HINT_RE.test(raw)) return "en";

  return null;
}

function lastLanguageFromHistory(history = []) {
  if (!Array.isArray(history)) return null;

  for (let i = history.length - 1; i >= 0; i -= 1) {
    const item = history[i];
    const content =
      typeof item?.content === "string"
        ? item.content
        : typeof item?.text === "string"
          ? item.text
          : "";

    const detected = detectLang(content);
    if (detected) return detected;
  }

  return null;
}

export function pickReplyLang({ userMessage, uiLocale, history, lastReplyLang } = {}) {
  const detected = detectLang(userMessage || "");
  if (detected) return detected;

  if (lastReplyLang === "et" || lastReplyLang === "ru" || lastReplyLang === "en") {
    return lastReplyLang;
  }

  const historyLang = lastLanguageFromHistory(history);
  if (historyLang) return historyLang;

  const ui = String(uiLocale || "").toLowerCase();
  if (ui === "et" || ui === "ru" || ui === "en") return ui;

  return "et";
}

/* ------------------------------------------------------------------ */
/* UI locale strings                                                   */
/* ------------------------------------------------------------------ */

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
          ? "Я пока не нашёл точного ответа. Уточните, пожалуйста, муниципалитет, тип услуги или ситуации и срочность."
          : "Я пока не нашёл точного ответа. Опишите, пожалуйста, ситуацию чуть подробнее и укажите хотя бы город или волость. Личный код и PIN-коды не нужны."
      ),
      crisis: "Если есть непосредственная опасность — звони 112."
    };
  }

  if (lang === "en") {
    return {
      greetingClient: "Hello! Briefly describe your question or request.",
      greetingWorker: "Hello! What case or topic should we focus on?",
      noContext: serverT(
        lang,
        noContextKey,
        undefined,
        isWorker
          ? "I could not find an exact answer right now. Please specify the municipality, the type of service or situation, and how urgent it is."
          : "I could not find an exact answer right now. Please describe your situation a bit more and include at least your municipality or city. Personal ID numbers and PIN codes are not needed."
      ),
      crisis: "If there is immediate danger, call 112."
    };
  }

  return {
    greetingClient: "Tere! Kirjelda lühidalt oma küsimust või soovi.",
    greetingWorker: "Tere! Millise teema või juhtumi fookusega saan toeks olla?",
    noContext: serverT(
      lang,
      noContextKey,
      undefined,
      isWorker
        ? "Ma ei leidnud praegu täpset vastust. Palun täpsusta omavalitsus, teenuse või olukorra tüüp ning kui kiire asjaga on tegu."
        : "Ma ei leidnud praegu täpset vastust. Kirjelda palun oma olukorda veidi täpsemalt ja lisa vähemalt vald või linn. Isikukoodi ega PIN-koode ei ole vaja."
    ),
    crisis: "Kui on otsene oht, helista kohe 112."
  };
}

/* ------------------------------------------------------------------ */
/* Prompt rules                                                        */
/* ------------------------------------------------------------------ */

function buildBaseSystemPrompt({ isCrisis = false, replyLang = "et" }) {
  return [
    "You are SotsiaalAI.",

    todayContext(),

    `Reply in ${replyLang} unless the user clearly asks to switch language.`,
    "Do not mix languages unnecessarily.",

    "Answer only questions that are directly related to social work, social welfare, local government support, benefits, services, child welfare, disability support, caregiving, mental health support in a social-support context, crisis help, or this platform's related workflows.",
    "If the question is outside that scope, reply briefly in the user's language that you help here only with social-sector questions.",

    "Use RAG_CONTEXT for factual claims about rights, benefits, procedures, deadlines, contacts, and official requirements.",
    "If a necessary detail is not visible, say that briefly and naturally.",
    "Do not guess legal outcomes, eligibility, deadlines, amounts, or official requirements.",
    "For benefit or eligibility calculations, ask for the specific facts and exact amounts needed for a reliable calculation; approximate amounts are only for an initial estimate.",
    "Do not ask for personal ID codes, PIN codes, passwords, authentication codes, or bank/card credentials. If an official draft normally needs a personal ID code, use a placeholder only; do not make it required for guidance or calculation.",

    "Use the content directly.",
    "Do not present the answer as 'an article says' or 'a source says' unless the user explicitly asks about the source or time context is necessary for accuracy.",

    "Answer the user's question directly.",
    "A brief follow-up offer is allowed when it is a natural and useful next step. Make it specific, and do not add one automatically to every answer.",
    "When relevant, explain the issue through the levels that help the user understand it: the wider framework, the local or organizational level, and the specific service, support, provider, or practical situation.",
    "Keep these connected in one clear explanation.",
    "Do not force every level if it is not relevant to the question.",

    "If the user asks what something is or was, answer directly using the available context.",
    "Start with what it is or was and what it is or was for, then add the main context needed to understand how it works or worked.",
    "Keep the explanation clear, with enough substance to answer the question.",

    "If the answer depends on the user's municipality or city and it is not known, first explain the general rule, then ask which municipality or city applies.",

    "When the user names a specific service, benefit, procedure, or legal term, answer about that exact term.",
    "Do not substitute a similar service unless the user explicitly asks for a comparison.",

    "If the user asks who you are, answer briefly that you are SotsiaalAI vestlusassistent.",

    isCrisis
      ? "If there is immediate danger, answer very briefly. Tell the user to call 112 first, then add at most one or two immediate safety steps."
      : null
  ]
    .filter(Boolean)
    .join("\n");
}

function buildRolePrompt(effectiveRole) {
  if (effectiveRole === "SOCIAL_WORKER") {
    return [
      "Write for a social work specialist.",
      "Use precise professional language, but keep the answer natural and readable.",
      "Start with the substantive answer.",
      "Do not add a closing offer to every answer."
    ].join("\n");
  }

  if (effectiveRole === "CLIENT") {
    return [
      "Write for a person seeking help.",
      "Use clear and natural language, but do not oversimplify away important meaning.",
      "Help the user understand how the issue works, not only what to do next.",
      "Do not add a closing offer to every answer."
    ].join("\n");
  }

  return [
    "Write clearly, naturally, and directly.",
    "Start with the substantive answer.",
    "Do not add a closing offer to every answer."
  ].join("\n");
}

function buildSystemPrompt({ effectiveRole, isCrisis = false, replyLang = "et" }) {
  return [
    buildBaseSystemPrompt({ isCrisis, replyLang }),
    buildRolePrompt(effectiveRole)
  ].join("\n\n");
}

/* ------------------------------------------------------------------ */
/* Context packing                                                     */
/* ------------------------------------------------------------------ */

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
    "Do not automatically offer rewriting, drafting, or reformatting unless the user explicitly asks for it."
  ].join(" ");
}

/* ------------------------------------------------------------------ */
/* Responses API assembly                                              */
/* ------------------------------------------------------------------ */

export function toResponsesInput({
  history,
  userMessage,
  context,
  effectiveRole,
  grounding,
  replyLang,
  isCrisis = false,
  maxOutputTokens = OPENAI_MAX_OUTPUT_TOKENS,
  extraSystemInstructions = []
}) {
  void grounding;

  const resolvedMaxOutputTokens = resolveMaxOutputTokens(effectiveRole, maxOutputTokens);

  const system = buildSystemPrompt({
    effectiveRole,
    isCrisis,
    replyLang: replyLang || "et"
  });

  const materialMessage = buildMaterialMessage({ context });
  const docAnalysis = documentAnalysisRule(context);

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
      ...(docAnalysis ? [{ role: "system", content: docAnalysis }] : []),
      materialMessage,
      ...(Array.isArray(history) ? history : []),
      ...extraMessages,
      { role: "user", content: userMessage }
    ],
    max_output_tokens: resolvedMaxOutputTokens
  };
}

export function buildResponsesPayload(input, options = {}) {
  const responseInput = { ...(input || {}) };
  delete responseInput.preferredVerbosity;

  const verbosity = options.verbosity || "medium";

  return {
    ...responseInput,
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
}
