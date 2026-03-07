import { AGENT_ARTIFACT_TYPE_VALUES } from "../documents/constants.js";
import { chooseOrchestrationPlan, WORK_MODES } from "./orchestrationPolicy.js";

const CLIENT_TASK_OPTIONS = [
  { value: "LETTER_REQUEST", artifactType: "LETTER_DRAFT" },
  { value: "LETTER_REPLY", artifactType: "LETTER_DRAFT" },
  { value: "FILL_FORM", artifactType: "OTHER" }
];

function normalizeAgentLanguage(value, fallback = "et") {
  const normalized = String(value || "").trim().toLowerCase();
  return ["et", "en", "ru"].includes(normalized) ? normalized : fallback;
}

export function normalizeIntentText(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .toLowerCase()
    .trim();
}

export function collectRecentUserInputs(history = [], currentMessage = "", maxItems = 8) {
  const items = [];
  if (Array.isArray(history)) {
    for (let i = history.length - 1; i >= 0 && items.length < maxItems; i -= 1) {
      const entry = history[i];
      const role = String(entry?.role || "").toLowerCase();
      if (!(role === "user" || role === "client")) continue;
      const text = String(entry?.text || entry?.content || "").trim();
      if (!text) continue;
      items.push(text);
    }
  }
  const current = String(currentMessage || "").trim();
  if (current) items.unshift(current);
  return items.reverse();
}

function detectClientTaskFromText(text = "") {
  const lower = normalizeIntentText(text);
  if (/\b(vorm|ankeet|blank|form|fill\s*form|fill in|taida vorm|taida ankeet)\b/.test(lower)) {
    return "FILL_FORM";
  }
  if (/\b(vastus|vastuskiri|reply|response|answer|reply letter)\b/.test(lower)) {
    return "LETTER_REPLY";
  }
  return "LETTER_REQUEST";
}

function artifactTypeFromClientTask(task = "LETTER_REQUEST") {
  const option = CLIENT_TASK_OPTIONS.find((entry) => entry.value === String(task || "").trim().toUpperCase());
  return option?.artifactType || "LETTER_DRAFT";
}

function clientTaskInstruction(task = "LETTER_REQUEST") {
  if (task === "LETTER_REPLY") {
    return "Draft a clear and practical reply to the received letter. Base it only on the user's instruction and the selected source files.";
  }
  if (task === "FILL_FORM") {
    return "Help fill in the selected form or blank. Treat the uploaded files as the working materials for this task: one file may be the form itself and the second file may contain the information that should go into it. If the file is not directly fillable, produce a structured draft the user can copy into the form.";
  }
  return "Draft a clear request or application text that the user can review, edit, and send.";
}

function inferWorkerArtifactTypeFromText(text = "") {
  const lower = normalizeIntentText(text);
  if (/\b(checklist|kontrollnimekiri|kontroll)\b/.test(lower)) return "CHECKLIST";
  if (/\b(koosolek|meeting|protokoll|minut)\b/.test(lower)) return "MEETING_SUMMARY";
  if (/\b(case\s*brief|juhtumi|juhtum)\b/.test(lower)) return "CASE_BRIEF";
  if (/\b(kiri|letter|avaldus|taotlus)\b/.test(lower)) return "LETTER_DRAFT";
  if (/\b(other|muu|vaba\s*vorm)\b/.test(lower)) return "OTHER";
  return "REPORT_DRAFT";
}

function inferToneFromText(text = "") {
  const lower = normalizeIntentText(text);
  if (/\b(supportive|toetav|rahulik|hooliv)\b/.test(lower)) return "supportive";
  if (/\b(plain|lihtne|simple|selge)\b/.test(lower)) return "plain";
  return "professional";
}

function inferLengthFromText(text = "") {
  const lower = normalizeIntentText(text);
  if (/\b(short|luhike|luhidalt|brief)\b/.test(lower)) return "short";
  if (/\b(detailed|detailne|pohjalik|thorough)\b/.test(lower)) return "detailed";
  return "standard";
}

function inferAudienceFromText(text = "", fallback = "worker") {
  const lower = normalizeIntentText(text);
  if (/\b(client|abivaj|poor|poordu|help[-\s]?seeker|service user)\b/.test(lower)) return "client";
  if (/\b(worker|spetsialist|sotsiaaltootaja|ametnik|social worker|institution)\b/.test(lower)) return "worker";
  return fallback;
}

function inferLanguageFromText(text = "", fallback = "et") {
  const lower = normalizeIntentText(text);
  if (/\b(in english|english|inglise)\b/.test(lower)) return "en";
  if (/\b(in russian|russian|vene)\b/.test(lower)) return "ru";
  if (/\b(in estonian|estonian|eesti)\b/.test(lower)) return "et";
  return fallback;
}

function wantsTemplateFromText(text = "") {
  const lower = normalizeIntentText(text);
  return /\b(mall|template)\b/.test(lower);
}

export function isTemplateCompatibleForType(template, artifactType) {
  const templateType = String(template?.templateFor || "").trim().toUpperCase();
  const targetType = String(artifactType || "").trim().toUpperCase();
  return !templateType || templateType === "OTHER" || templateType === targetType;
}

export function detectDocumentTaskIntent(message = "") {
  const text = normalizeIntentText(message);
  if (!text) return false;
  const hasAction = /\b(koost\w*|kirjut\w*|loo|luu\w*|loom\w*|aita\w*|valmista\w*|vormista\w*|prepare\w*|create\w*|draft\w*|write\w*|generate\w*|compose\w*)\b/.test(text);
  const hasType = /\b(aruan\w*|raport\w*|report\w*|kokkuv\w*|summary\w*|letter\w*|kiri\w*|memo\w*|checklist\w*|protokoll\w*|brief\w*|case\w*|vorm\w*|form\w*|taotlus\w*|avaldus\w*|vastus\w*)\b/.test(text);
  return hasAction && hasType;
}

export function detectDocumentTaskFollowup(message = "") {
  const text = normalizeIntentText(message);
  if (!text) return false;
  return /\b(mall|template|allik|source|tahtaeg|deadline|sihtr|audience|toon|tone|pikkus|length|keel|language|eesmark|goal|format|taotlus|vastus|vorm)\b/.test(text);
}

export function hasDocumentTaskContext(history = []) {
  if (!Array.isArray(history) || !history.length) return false;
  for (let i = history.length - 1; i >= 0 && i >= history.length - 10; i -= 1) {
    const entry = history[i];
    const role = String(entry?.role || "").toLowerCase();
    if (!(role === "user" || role === "client")) continue;
    const text = String(entry?.text || entry?.content || "").trim();
    if (!text) continue;
    if (detectDocumentTaskIntent(text)) return true;
  }
  return false;
}

export function isAffirmativeMessage(message = "") {
  const text = normalizeIntentText(message);
  if (!text) return false;
  return ["jah", "j", "yes", "y", "ok", "okay", "okei"].includes(text);
}

export function isDocumentStartCommand(message = "", history = []) {
  const text = normalizeIntentText(message);
  if (!text) return false;
  if (/\b(alust\w*|kaivit\w*|hakka\w*|start\w*|run\w*|begin\w*)\b/.test(text) && /\b(mustand\w*|draft\w*|aruan\w*|raport\w*|kokkuv\w*|kiri\w*|checklist\w*|protokoll\w*|vorm\w*|document\w*|dokument\w*|report\w*|summary\w*|letter\w*|form\w*|taotlus\w*|avaldus\w*)\b/.test(text)) {
    return true;
  }
  return isAffirmativeMessage(text) && hasDocumentTaskContext(history);
}

export function extractDocumentTaskInstruction(history = [], currentMessage = "") {
  const inputs = collectRecentUserInputs(history, currentMessage, 6);
  const filtered = inputs.filter((text) => {
    if (!text) return false;
    if (isDocumentStartCommand(text, history)) return false;
    if (isAffirmativeMessage(text)) return false;
    return true;
  });
  return filtered.slice(-4).join("\n").trim();
}

export function buildDocumentIntakeReply({
  replyLang,
  sourceCount = 0,
  role = "SOCIAL_WORKER",
  defaults = {},
  clientDocumentLimit = 2
}) {
  const outputList = role === "CLIENT"
    ? "LETTER_REQUEST, LETTER_REPLY, FILL_FORM"
    : AGENT_ARTIFACT_TYPE_VALUES.join(", ");
  const audience = String(defaults?.audience || (role === "CLIENT" ? "client" : "worker"));
  const tone = String(defaults?.tone || "professional");
  const language = String(defaults?.language || "et");
  const length = String(defaults?.length || "standard");
  if (replyLang === "en") {
    return [
      "Understood: this is a document task and I can run the same agent workflow as in Agent mode.",
      "",
      `Role profile: ${role === "CLIENT" ? "help-seeker" : "social work specialist"}.`,
      `Available output options: ${outputList}.`,
      "",
      "Before starting, confirm:",
      "1. Output type / task",
      "2. Instruction details",
      "3. Audience, tone, language, length",
      "4. Template usage (if needed)",
      "5. Source documents",
      "",
      `Current defaults: audience=${audience}, tone=${tone}, language=${language}, length=${length}.`,
      `Currently agent-allowed source documents: ${sourceCount}.`,
      role === "CLIENT"
        ? `Client mode limit is ${clientDocumentLimit} source documents per run.`
        : "Specialist mode supports more source documents per run.",
      "When ready, write: \"Start draft generation\"."
    ].join("\n");
  }
  if (replyLang === "ru") {
    return [
      "Ponjal: eto zadacha na dokument, i mozhno zapustit agent workflow kak v Agent mode.",
      "",
      `Profil roli: ${role === "CLIENT" ? "help-seeker" : "social work specialist"}.`,
      `Dostupnye varianty vyhoda: ${outputList}.`,
      "",
      "Pered zapuskom utochnite:",
      "1. Tip vyhoda / zadachi",
      "2. Detali instrukcii",
      "3. Audience, tone, language, length",
      "4. Nuzhen li template",
      "5. Kakie istochniki ispolzovat",
      "",
      `Tekushchie defaulty: audience=${audience}, tone=${tone}, language=${language}, length=${length}.`,
      `Razreshennye istochniki: ${sourceCount}.`,
      role === "CLIENT"
        ? `V client profile limit = ${clientDocumentLimit} istochnika na zapusk.`
        : "V specialist profile mozhno bolshe istochnikov.",
      "Kogda gotovy, napishite: \"Start draft generation\"."
    ].join("\n");
  }
  return [
    "Sain aru: see on dokumendiulesanne ja saan kaivitada sama agent-too voo nagu agendireziimis.",
    "",
    `Rolliprofiil: ${role === "CLIENT" ? "elukusimusega poorduja" : "sotsiaaltoo spetsialist"}.`,
    `Valjundi valikud: ${outputList}.`,
    "",
    "Enne kaivitamist tapsusta:",
    "1. Valjundi tuup / ulesanne",
    "2. Tapne juhis",
    "3. Audience, tone, language, length",
    "4. Kas kasutada malli",
    "5. Milliseid allikaid kasutada",
    "",
    `Vaikesatted: audience=${audience}, tone=${tone}, language=${language}, length=${length}.`,
    `Praegu on agendile lubatud allikaid: ${sourceCount}.`,
    role === "CLIENT"
      ? `Poorduja profiilis on piirang ${clientDocumentLimit} allikat jooksu kohta.`
      : "Spetsialisti profiilis saab kasutada suuremat allikate hulka.",
    "Kui valmis, kirjuta: \"Alusta mustandi loomist\"."
  ].join("\n");
}

export function buildDocumentMissingSourcesReply(replyLang) {
  if (replyLang === "en") {
    return "I cannot start the draft yet because there are no agent-allowed source documents. Add files in Documents and allow them for agent mode.";
  }
  if (replyLang === "ru") {
    return "Ne mogu zapustit draft: net istochnikov s dostupom dlya agenta. Dobavte faily v Documents i vklyuchite agent mode.";
  }
  return "Mustandit ei saa veel kaivitada, sest agendile lubatud allikaid ei ole. Lisa failid Dokumentidesse ja luba need agendireziimi jaoks.";
}

export function buildDocumentMissingInstructionReply(replyLang) {
  if (replyLang === "en") {
    return "To run 1:1 agent workflow I still need a concrete instruction. Describe what exactly should be created and what to emphasize.";
  }
  if (replyLang === "ru") {
    return "Dlya zapuska 1:1 agent workflow nuzhna konkretnaya instrukciya: chto sozdavat i chto podcherknut.";
  }
  return "1:1 agent-workflow kaivitamiseks on vaja konkreetset juhist: mida tapselt koostada ja mida rohutada.";
}

export function buildDocumentTaskAttachments({ replyLang, artifactId = "", includeAgentWorkspace = true }) {
  const labels = replyLang === "en"
    ? {
        addSources: "Add sources",
        openDocuments: "Open documents",
        openDraft: "Open draft",
        openEditor: "Open in editor",
        openAgent: "Open Agent mode"
      }
    : replyLang === "ru"
      ? {
          addSources: "Dobavit istochniki",
          openDocuments: "Otkryt documents",
          openDraft: "Otkryt draft",
          openEditor: "Otkryt v redaktore",
          openAgent: "Otkryt Agent mode"
        }
      : {
          addSources: "Lisa allikad",
          openDocuments: "Ava dokumendid",
          openDraft: "Ava mustand",
          openEditor: "Ava redigeerijas",
          openAgent: "Ava agendireziim"
        };
  if (!artifactId) {
    const links = [
      { label: labels.addSources, url: "/documents" },
      { label: labels.openDocuments, url: "/documents" }
    ];
    if (includeAgentWorkspace) links.push({ label: labels.openAgent, url: "/agendireziim" });
    return links;
  }
  const links = [
    { label: labels.openDraft, url: `/documents/artifacts/${encodeURIComponent(artifactId)}` },
    { label: labels.openEditor, url: `/agendireziim?artifact=${encodeURIComponent(artifactId)}` }
  ];
  if (includeAgentWorkspace) links.push({ label: labels.openAgent, url: "/agendireziim" });
  return links;
}

export function buildDocumentTaskRuntimeConfig({ role = "SOCIAL_WORKER", replyLang = "et", history = [], message = "" }) {
  const defaultAudience = role === "CLIENT" ? "client" : "worker";
  const inputs = collectRecentUserInputs(history, message, 8);
  const contextText = normalizeIntentText(inputs.join("\n"));
  const instruction = extractDocumentTaskInstruction(history, message) || String(message || "").trim();
  const tone = inferToneFromText(contextText);
  const length = inferLengthFromText(contextText);
  const audience = inferAudienceFromText(contextText, defaultAudience);
  const language = normalizeAgentLanguage(inferLanguageFromText(contextText, replyLang), replyLang);
  const wantsTemplate = role !== "CLIENT" && wantsTemplateFromText(contextText);
  if (role === "CLIENT") {
    const clientTask = detectClientTaskFromText(contextText);
    const artifactType = artifactTypeFromClientTask(clientTask);
    const mergedInstruction = `${clientTaskInstruction(clientTask)}\n\n${instruction}`.trim();
    return [
      {
        role,
        artifactType,
        clientTask,
        instruction: mergedInstruction,
        audience,
        tone,
        language,
        length,
        wantsTemplate: false
      },
      {
        role,
        audience,
        tone,
        language,
        length
      }
    ];
  }
  const artifactType = inferWorkerArtifactTypeFromText(contextText);
  const safeType = AGENT_ARTIFACT_TYPE_VALUES.includes(artifactType) ? artifactType : "REPORT_DRAFT";
  return [
    {
      role,
      artifactType: safeType,
      clientTask: null,
      instruction,
      audience,
      tone,
      language,
      length,
      wantsTemplate
    },
    {
      role,
      audience,
      tone,
      language,
      length
    }
  ];
}

function resolveDocumentWorkMode(message = "") {
  const text = normalizeIntentText(message);
  if (/\b(aruan\w*|raport\w*|report\w*|analysis\w*|analuu\w*)\b/.test(text)) {
    return WORK_MODES.REPORT_DRAFTING;
  }
  return WORK_MODES.DOCUMENT_DRAFTING;
}

export function resolveDocumentTaskDecision({
  message = "",
  history = [],
  role = "SOCIAL_WORKER",
  replyLang = "et",
  sourceCount = 0,
  clarifyingTurns = 0,
  requestedThoroughness = false,
  forceDocumentTask = false
} = {}) {
  const historyHasDocumentTask = hasDocumentTaskContext(history);
  const documentTaskStart = isDocumentStartCommand(message, history);
  const isDocumentTask =
    forceDocumentTask ||
    detectDocumentTaskIntent(message) ||
    (historyHasDocumentTask && (detectDocumentTaskFollowup(message) || documentTaskStart));

  if (!isDocumentTask) {
    return {
      isDocumentTask: false,
      historyHasDocumentTask,
      documentTaskStart,
      plan: null,
      taskConfig: null,
      taskDefaults: null
    };
  }

  const [taskConfig, taskDefaults] = buildDocumentTaskRuntimeConfig({
    role,
    replyLang,
    history,
    message
  });

  const plan = chooseOrchestrationPlan({
    intent: resolveDocumentWorkMode(message),
    message,
    sourceCount,
    clarifyingTurns,
    requestedThoroughness,
    workflowState: {
      intent: resolveDocumentWorkMode(message),
      draft: {
        description: taskConfig?.instruction || ""
      },
      missingFields: []
    }
  });

  return {
    isDocumentTask: true,
    historyHasDocumentTask,
    documentTaskStart,
    plan,
    taskConfig,
    taskDefaults
  };
}
