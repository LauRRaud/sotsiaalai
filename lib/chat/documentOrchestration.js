import prisma from "../prisma.js";
import { AGENT_ARTIFACT_TYPE_VALUES } from "../documents/constants.js";
import { clientTaskInstruction } from "../documents/agentTasks.js";
import { documentWorkflowLabel, documentWorkflowT } from "./documentWorkflowText.js";
import {
  createDocumentWorkflowState,
  isActiveDocumentWorkflowState,
  normalizeDocumentWorkflowState
} from "./documentWorkflowState.js";
import { chooseOrchestrationPlan, WORK_MODES } from "./orchestrationPolicy.js";

const CLIENT_TASK_OPTIONS = [
  { value: "LETTER_REQUEST", artifactType: "LETTER_DRAFT" },
  { value: "LETTER_REPLY", artifactType: "LETTER_DRAFT" },
  { value: "FILL_FORM", artifactType: "OTHER" }
];

function normalizeFlowRole(role = "") {
  return String(role || "").trim().toUpperCase() === "CLIENT" ? "CLIENT" : "SOCIAL_WORKER";
}

function buildArtifactDownloadPath(id, format = "docx") {
  return `/api/documents/artifacts/${encodeURIComponent(id)}/download?format=${encodeURIComponent(format)}`;
}

function isClientRole(role = "") {
  return normalizeFlowRole(role) === "CLIENT";
}

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

function documentTypePatternForRole(role = "SOCIAL_WORKER") {
  if (isClientRole(role)) {
    return /\b(dokument\w*|document\w*|letter\w*|kiri\w*|e-?mail\w*|e-?kiri\w*|taotlus\w*|avaldus\w*|vastus\w*|reply\w*|request\w*|application\w*|vorm\w*|form\w*|blank\w*|ankeet\w*)\b/;
  }
  return /\b(aruan\w*|raport\w*|report\w*|kokkuv\w*|summary\w*|letter\w*|kiri\w*|memo\w*|checklist\w*|protokoll\w*|brief\w*|case\w*|vorm\w*|form\w*|taotlus\w*|avaldus\w*|vastus\w*|dokument\w*|document\w*)\b/;
}

export function detectDocumentTaskIntent(message = "", role = "SOCIAL_WORKER") {
  const text = normalizeIntentText(message);
  if (!text) return false;
  const hasAction = /\b(koost\w*|kirjut\w*|loo|luu\w*|loom\w*|aita\w*|valmista\w*|vormista\w*|prepare\w*|create\w*|draft\w*|write\w*|generate\w*|compose\w*)\b/.test(text);
  const hasType = documentTypePatternForRole(role).test(text);
  return hasAction && hasType;
}

export function detectDocumentTaskFollowup(message = "") {
  const text = normalizeIntentText(message);
  if (!text) return false;
  return /\b(mall|template|allik|source|tahtaeg|deadline|sihtr|audience|toon|tone|pikkus|length|keel|language|eesmark|goal|format|taotlus|vastus|vorm)\b/.test(text);
}

export function hasDocumentTaskContext(history = [], role = "SOCIAL_WORKER") {
  if (!Array.isArray(history) || !history.length) return false;
  for (let i = history.length - 1; i >= 0 && i >= history.length - 10; i -= 1) {
    const entry = history[i];
    const role = String(entry?.role || "").toLowerCase();
    if (!(role === "user" || role === "client")) continue;
    const text = String(entry?.text || entry?.content || "").trim();
    if (!text) continue;
    if (detectDocumentTaskIntent(text, role)) return true;
  }
  return false;
}

export function isAffirmativeMessage(message = "") {
  const text = normalizeIntentText(message);
  if (!text) return false;
  return ["jah", "j", "yes", "y", "ok", "okay", "okei"].includes(text);
}

export function isDocumentStartCommand(message = "", history = [], role = "SOCIAL_WORKER") {
  const text = normalizeIntentText(message);
  if (!text) return false;
  if (/\b(alust\w*|kaivit\w*|hakka\w*|start\w*|run\w*|begin\w*)\b/.test(text) && documentTypePatternForRole(role).test(text)) {
    return true;
  }
  return isAffirmativeMessage(text) && hasDocumentTaskContext(history, role);
}

export function extractDocumentTaskInstruction(history = [], currentMessage = "", role = "SOCIAL_WORKER") {
  const inputs = collectRecentUserInputs(history, currentMessage, 6);
  const filtered = inputs.filter((text) => {
    if (!text) return false;
    if (isDocumentStartCommand(text, history, role)) return false;
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

export function buildDocumentGeneratedIntro({ replyLang, role = "SOCIAL_WORKER" }) {
  const key = isClientRole(role) ? "generated.client" : "generated.worker";
  const fallback = replyLang === "en"
    ? isClientRole(role)
      ? "Draft ready. Open it on the Agent mode page."
      : "Draft ready. Open it on the Documents page."
    : replyLang === "ru"
      ? isClientRole(role)
        ? "Черновик готов. Откройте его на странице режима агента."
        : "Черновик готов. Откройте его на странице документов."
      : isClientRole(role)
        ? "Mustand valmis. Ava see Agendireziimi lehel."
        : "Mustand valmis. Ava see Dokumentide lehel.";
  return documentWorkflowT(replyLang, key, undefined, fallback);
}

export function buildDocumentTaskAttachments({
  replyLang,
  artifactId = "",
  includeAgentWorkspace = true,
  role = "SOCIAL_WORKER",
  downloadReady = false
}) {
  const normalizedRole = normalizeFlowRole(role);
  const labels = replyLang === "en"
    ? {
        openDocumentsPage: "Open on the Documents page",
        openAgentPage: "Open on the Agent mode page",
        openResults: "Open in results",
        openDraft: "Open draft",
        openEditor: "Open in Agent mode",
        openResult: "Open result",
        downloadDocx: "Download DOCX",
        downloadPdf: "Download PDF"
      }
    : replyLang === "ru"
      ? {
          openDocumentsPage: "Открыть на странице документов",
          openAgentPage: "Открыть на странице режима агента",
          openResults: "Открыть в результатах",
          openDraft: "Открыть черновик",
          openEditor: "Открыть в режиме агента",
          openResult: "Открыть результат",
          downloadDocx: "Скачать DOCX",
          downloadPdf: "Скачать PDF"
        }
      : {
          openDocumentsPage: "Ava Dokumentide lehel",
          openAgentPage: "Ava Agendireziimi lehel",
          openResults: "Ava tulemustes",
          openDraft: "Ava mustand",
          openEditor: "Ava agendireziimis",
          openResult: "Ava tulemus",
          downloadDocx: "Laadi DOCX alla",
          downloadPdf: "Laadi PDF alla"
        };
  if (!artifactId) {
    if (normalizedRole === "CLIENT") {
      return includeAgentWorkspace ? [{ label: labels.openAgentPage, url: "/agendireziim" }] : [];
    }
    const links = [{ label: labels.openDocumentsPage, url: "/documents" }];
    if (includeAgentWorkspace) links.push({ label: labels.openAgentPage, url: "/agendireziim" });
    return links;
  }
  if (normalizedRole === "CLIENT") {
    const links = [{ label: labels.openResult, url: `/agendireziim?artifact=${encodeURIComponent(artifactId)}` }];
    if (downloadReady) {
      links.push({ label: labels.downloadDocx, url: buildArtifactDownloadPath(artifactId, "docx") });
      links.push({ label: labels.downloadPdf, url: buildArtifactDownloadPath(artifactId, "pdf") });
    }
    if (includeAgentWorkspace) links.push({ label: labels.openAgentPage, url: "/agendireziim" });
    return links;
  }
  const links = [
    { label: labels.openDocumentsPage, url: "/documents?artifacts=all#artifacts" },
    { label: labels.openDraft, url: `/documents/artifacts/${encodeURIComponent(artifactId)}` }
  ];
  if (downloadReady) {
    links.push({ label: labels.downloadDocx, url: buildArtifactDownloadPath(artifactId, "docx") });
    links.push({ label: labels.downloadPdf, url: buildArtifactDownloadPath(artifactId, "pdf") });
  }
  if (includeAgentWorkspace) links.push({ label: labels.openEditor, url: `/agendireziim?artifact=${encodeURIComponent(artifactId)}` });
  return links;
}

function collapseWhitespace(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function isAffirmativeDocumentReply(message = "") {
  return isAffirmativeMessage(message);
}

function isNegativeDocumentReply(message = "") {
  return /^(ei|no|not really|pole vaja|skip|jatan vahele|jatan selle vahele)$/i.test(normalizeIntentText(message));
}

function isDocumentCancel(message = "") {
  return /\b(katkesta|alusta otsast|lopeta|lĆµpeta|cancel|abort)\b/.test(normalizeIntentText(message));
}

function detectDocumentSwitchIntent(message = "") {
  const normalized = normalizeIntentText(message);
  if (!normalized) return "";
  if (/\b(katkesta|lopeta|cancel|abort)\b/.test(normalized)) return "cancel";
  if (/\b(alusta otsast|uuesti algusest|restart|start over)\b/.test(normalized)) return "restart";
  if (/\b(hoopis\s+abisoov\w*|abisoov\w*|abipalv\w*)\b/.test(normalized)) return "help_request";
  if (/\b(hoopis\s+abipakkum\w*|abipakkum\w*)\b/.test(normalized)) return "help_offer";
  if (/\b(ainult infot|soovin infot|juhendamist|info ja juhendamine|info)\b/.test(normalized)) return "rag";
  return "";
}

function detectExplicitTone(text = "") {
  const lower = normalizeIntentText(text);
  if (/\b(ametlik\w*|professional|professiona)\b/.test(lower)) return "professional";
  if (/\b(liht\w*|selg\w*|plain|simple)\b/.test(lower)) return "plain";
  if (/\b(toetav\w*|rahulik\w*|hooliv\w*|supportive|calm)\b/.test(lower)) return "supportive";
  if (/\b(neutraal\w*|neutral)\b/.test(lower)) return "professional";
  return "";
}

function detectExplicitLength(text = "") {
  const lower = normalizeIntentText(text);
  if (/\b(luhike|lĆ¼hi|short|brief)\b/.test(lower)) return "short";
  if (/\b(pohjalik|pĆµhjalik|detailne|detailed|longer)\b/.test(lower)) return "detailed";
  if (/\b(tavaline|keskmine|standard)\b/.test(lower)) return "standard";
  return "";
}

function inferDocumentTypeLabel(text = "", role = "SOCIAL_WORKER") {
  const lower = normalizeIntentText(text);
  if (!isClientRole(role)) {
    if (/\b(aruan\w*|raport\w*|report\w*)\b/.test(lower)) return "aruanne";
    if (/\b(kokkuv\w*|summary\w*)\b/.test(lower)) return "kokkuvĆµte";
    if (/\b(protokoll\w*|meeting\s*summary)\b/.test(lower)) return "protokoll";
  }
  if (/\b(selgituskir\w*|selgitus\w*)\b/.test(lower)) return "selgituskiri";
  if (/\b(taotlus\w*)\b/.test(lower)) return "taotlus";
  if (/\b(avaldus\w*)\b/.test(lower)) return "avaldus";
  if (/\b(e-?kiri\w*|email|e-mail)\b/.test(lower)) return "e-kiri";
  if (/\b(vastus\w*|vastuskir\w*|reply)\b/.test(lower)) return "vastus";
  if (/\b(kiri\w*|letter)\b/.test(lower)) return "kiri";
  if (/\b(vorm\w*|blank\w*|ankeet\w*|form)\b/.test(lower)) return "vorm";
  return role === "SOCIAL_WORKER" && /\b(juhtum\w*|case)\b/.test(lower) ? "juhtumikokkuvĆµte" : "";
}

function inferArtifactTypeFromDraft(draft = {}, role = "SOCIAL_WORKER") {
  const lower = normalizeIntentText(`${draft.documentType || ""} ${draft.purpose || ""}`);
  if (!isClientRole(role)) {
    if (/\b(aruan\w*|raport\w*|report\w*)\b/.test(lower)) return "REPORT_DRAFT";
    if (/\b(juhtumi|case)\b/.test(lower)) return "CASE_BRIEF";
    if (/\b(protokoll\w*|meeting)\b/.test(lower)) return "MEETING_SUMMARY";
    if (/\b(checklist|kontrollnimekiri|kontroll)\b/.test(lower)) return "CHECKLIST";
  }
  if (/\b(vorm\w*|blank\w*|ankeet\w*|form)\b/.test(lower)) return role === "CLIENT" ? "OTHER" : "OTHER";
  if (/\b(kiri\w*|taotlus\w*|avaldus\w*|vastus\w*|e-kiri\w*|selgituskiri\w*)\b/.test(lower)) return "LETTER_DRAFT";
  return role === "SOCIAL_WORKER" ? "REPORT_DRAFT" : "LETTER_DRAFT";
}

function extractRecipient(text = "") {
  const raw = collapseWhitespace(text);
  if (!raw) return "";
  const patterns = [
    /\b((?:[\p{L}.-]+\s+){0,2}(?:vallale|linnale|omavalitsusele|ametile|asutusele|koolile|lasteaiale|haiglale|arstile|perearstile|kohtule|tootukassale|töötukassale|sotsiaalkindlustusametile))\b/iu,
    /\b(kellele\s+.+)$/iu
  ];
  for (const pattern of patterns) {
    const match = raw.match(pattern);
    if (!match?.[1]) continue;
    const cleaned = collapseWhitespace(
      String(match[1]).replace(/\b(?:mul|mul on|vaja|koostada|koosta|avaldus|taotlus|kiri|aruanne)\b/giu, "")
    );
    if (cleaned) return cleaned;
  }
  return "";
}

function extractPurpose(text = "") {
  const raw = collapseWhitespace(text);
  if (!raw) return "";
  const patterns = [
    /\b(?:eesmargil|eesmĆ¤rgil)\s+(.+)$/iu,
    /\b(?:selleks et|et)\s+(.+)$/iu,
    /\b((?:[A-Za-zĆ•Ć„Ć–ĆĆµĆ¤Ć¶Ć¼.-]+\s+){0,6}(?:taotlemiseks|saamiseks|esitamiseks|selgitamiseks|vastuseks|palumiseks|korraldamiseks))\b/iu
  ];
  for (const pattern of patterns) {
    const match = raw.match(pattern);
    if (match?.[1]) return collapseWhitespace(match[1]);
  }
  return "";
}

function extractSubjectLabel(text = "") {
  const lower = normalizeIntentText(text);
  if (/\b(endale|enda jaoks|minule|minu jaoks)\b/.test(lower)) return "endale";
  if (/\b(emale|ema jaoks)\b/.test(lower)) return "emale";
  if (/\b(isale|isa jaoks)\b/.test(lower)) return "isale";
  if (/\b(lapsele|lapse jaoks)\b/.test(lower)) return "lapsele";
  if (/\b(kliendile|kliendi jaoks|kliendi kohta)\b/.test(lower)) return "kliendile";
  if (/\b(lahedasele|lahedase jaoks|lahedane)\b/.test(lower)) return "lähedasele";
  return "";
}

function extractSourceMode(text = "") {
  const lower = normalizeIntentText(text);
  if (/\b(kirjelduse pohjal|minu info pohjal|uue teksti|koosta ise|minu kirjelduse pohjal)\b/.test(lower)) {
    return "description";
  }
  if (/\b(materjali pohjal|olemasoleva|olemasolev tekst|markmed|dokumendi pohjal|vormi pohjal|malli pohjal|aluseks votta)\b/.test(lower)
    || /\b(kasuta|vota)\s+(olemasolevat|olemasolevat teksti|markmeid|dokumenti|vormi|malli|materjali)\b/.test(lower)) {
    return "existing_material";
  }
  return "";
}

function extractSourceDetails(text = "", sourceMode = "") {
  const raw = collapseWhitespace(text);
  const lower = normalizeIntentText(text);
  if (!raw) return "";
  if (sourceMode === "description" && /\b(kirjelduse pohjal|minu info pohjal|minu kirjelduse pohjal)\b/.test(lower)) {
    return "Sinu kirjelduse põhjal.";
  }
  if (sourceMode === "existing_material") {
    return raw;
  }
  return "";
}

function extractBackground(text = "") {
  const raw = collapseWhitespace(text);
  const lower = normalizeIntentText(text);
  if (!raw) return "";
  if (isNegativeDocumentReply(text)) return "Kasutaja ei soovinud lisatausta lisada.";
  if (/\b(sest|kuna|oluline|taust|asjaolu|vajadus|ei saa|ei suuda|liikumisrask|tervise|toimetulek)\b/.test(lower)) {
    return raw;
  }
  return "";
}

function extractDeadline(text = "") {
  const raw = collapseWhitespace(text);
  const match = raw.match(/\b(tahtajaks|tĆ¤htajaks|hiljemalt|enne)\s+(.+)$/iu);
  if (match?.[2]) return collapseWhitespace(match[0]);
  return "";
}

function extractReportPeriod(text = "") {
  const raw = collapseWhitespace(text);
  const match = raw.match(/\b(viimase\s+.+|perioodi\s+.+|ajavahemiku\s+.+|kuup\w*.+)\b/iu);
  if (match?.[1] && /\b(kuu|nadal|nĆ¤dal|aasta|periood|ajavahemik|kuup)\b/iu.test(match[1])) {
    return collapseWhitespace(match[1]);
  }
  return "";
}

function extractTemplatePreference(text = "") {
  const raw = collapseWhitespace(text);
  if (/\b(mall|template|vorm|blankett)\b/i.test(raw)) return raw;
  return "";
}

function extractDocumentDraftUpdate(message = "", previousDraft = {}, role = "SOCIAL_WORKER", replyLang = "et") {
  const raw = collapseWhitespace(message);
  if (!raw) return {};

  const next = {};
  const documentType = inferDocumentTypeLabel(raw, role);
  if (documentType) {
    next.documentType = documentType;
    next.artifactType = inferArtifactTypeFromDraft({ ...previousDraft, documentType }, role);
  }

  const purpose = extractPurpose(raw);
  if (purpose) next.purpose = purpose;

  const recipient = extractRecipient(raw);
  if (recipient) next.recipient = recipient;

  const subjectLabel = extractSubjectLabel(raw);
  if (subjectLabel) next.subjectLabel = subjectLabel;

  let sourceMode = extractSourceMode(raw);
  const normalizedRaw = normalizeIntentText(raw);
  if (!sourceMode && /\b(kirjelduse pohjal|minu kirjelduse pohjal|minu info pohjal)\b/.test(normalizedRaw)) {
    sourceMode = "description";
  }
  if (!sourceMode && (/\b(olemasoleva|markmed|materjali pohjal|dokumendi pohjal|vormi pohjal|malli pohjal)\b/.test(normalizedRaw)
    || /\b(kasuta|vota)\s+(olemasolevat|olemasolevat teksti|markmeid|dokumenti|vormi|malli|materjali)\b/.test(normalizedRaw))) {
    sourceMode = "existing_material";
  }
  if (sourceMode) {
    next.sourceMode = sourceMode;
    const sourceDetails = extractSourceDetails(raw, sourceMode);
    if (sourceDetails) next.sourceDetails = sourceDetails;
  }

  const background = extractBackground(raw);
  if (background) next.background = background;

  const language = inferLanguageFromText(raw, "");
  if (language) next.language = language;

  const tone = detectExplicitTone(raw);
  if (tone) next.tone = tone;

  const length = detectExplicitLength(raw);
  if (length) next.length = length;

  const templatePreference = extractTemplatePreference(raw);
  if (templatePreference) next.templatePreference = templatePreference;

  const deadline = extractDeadline(raw);
  if (deadline) next.deadline = deadline;

  const reportPeriod = extractReportPeriod(raw);
  if (reportPeriod) next.reportPeriod = reportPeriod;

  if (!next.artifactType && (next.documentType || previousDraft?.documentType)) {
    next.artifactType = inferArtifactTypeFromDraft({ ...previousDraft, ...next }, role);
  }

  if (!next.language && isNegativeDocumentReply(raw)) {
    next.language = normalizeAgentLanguage(replyLang, replyLang);
  }

  return next;
}

function mergeDocumentDraft(previousDraft = {}, update = {}) {
  const merged = {
    ...previousDraft,
    ...Object.fromEntries(Object.entries(update).filter(([, value]) => collapseWhitespace(value)))
  };

  if (!merged.artifactType && merged.documentType) {
    merged.artifactType = inferArtifactTypeFromDraft(merged);
  }

  return merged;
}

const DOCUMENT_REQUIRED_FIELDS = Object.freeze([
  "documentType",
  "purpose",
  "recipient",
  "sourceMode",
  "background",
  "language",
  "tone"
]);

function isGenericExistingMaterialDetails(value = "") {
  const normalized = normalizeIntentText(value);
  if (!normalized) return true;
  return (
    /^(olemasoleva|olemasolevat|olemasoleva materjali pohjal|materjali pohjal|dokumendi pohjal|vormi pohjal|malli pohjal|markmed|tekst|dokument|vorm|mall)$/.test(normalized)
    || /^(kasuta|vota aluseks|aluseks votta)\s+(olemasoleva|olemasolevat|materjali|dokumendi|vormi|malli)(\s+pohjal)?$/.test(normalized)
  );
}

function hasConcreteExistingMaterialSource(draft = {}, options = {}) {
  if (String(draft?.sourceMode || "").trim().toLowerCase() !== "existing_material") return true;
  if (options?.hasSourceMaterial) return true;
  const details = collapseWhitespace(draft?.sourceDetails);
  if (!details) return false;
  if (isGenericExistingMaterialDetails(details)) return false;
  return details.length >= 40 || /[\r\n]/.test(String(draft?.sourceDetails || ""));
}

function computeMissingDocumentFields(draft = {}, options = {}) {
  const missing = DOCUMENT_REQUIRED_FIELDS.filter((field) => !collapseWhitespace(draft?.[field]));
  if (!missing.includes("sourceMode") && !hasConcreteExistingMaterialSource(draft, options)) {
    missing.push("sourceMaterial");
  }
  return missing;
}

function hasConditionalPreferences(draft = {}) {
  return Boolean(
    collapseWhitespace(draft.length) ||
    collapseWhitespace(draft.templatePreference) ||
    collapseWhitespace(draft.deadline) ||
    collapseWhitespace(draft.reportPeriod) ||
    collapseWhitespace(draft.recipientDetail)
  );
}

function formatLanguageLabel(locale = "et", language = "") {
  const normalized = normalizeAgentLanguage(language, "et");
  const key = normalized === "ru" ? "russian" : normalized === "en" ? "english" : "estonian";
  return documentWorkflowLabel(locale, `languageValues.${key}`, normalized);
}

function formatToneLabel(locale = "et", tone = "") {
  const normalized = String(tone || "").trim().toLowerCase();
  const key = normalized === "plain" ? "plain" : normalized === "supportive" ? "supportive" : "professional";
  return documentWorkflowLabel(locale, `toneValues.${key}`, normalized || "professional");
}

function formatLengthLabel(locale = "et", length = "") {
  const normalized = String(length || "").trim().toLowerCase();
  const key = normalized === "short" ? "short" : normalized === "detailed" ? "detailed" : "standard";
  return documentWorkflowLabel(locale, `lengthValues.${key}`, normalized || "standard");
}

function formatSourceModeLabel(locale = "et", sourceMode = "") {
  const normalized = String(sourceMode || "").trim().toLowerCase();
  const key = normalized === "existing_material" ? "existingMaterial" : "description";
  return documentWorkflowLabel(locale, `sourceModeValues.${key}`, normalized || "description");
}

function buildDocumentSummarySentence(draft = {}, replyLang = "et") {
  const type = collapseWhitespace(draft.documentType);
  const recipient = collapseWhitespace(draft.recipient);
  const purpose = collapseWhitespace(draft.purpose);
  if (!type && !recipient && !purpose) return "";

  if (replyLang === "en") {
    return `I understood that you want to prepare ${type || "a document"}${recipient ? ` for ${recipient}` : ""}${purpose ? ` with the purpose of ${purpose}` : ""}.`;
  }
  if (replyLang === "ru") {
    return `ŠÆ ŠæŠ¾Š½Ń¸Š», Ń‡Ń‚Š¾ Š²Ń‹ Ń…Š¾Ń‚ŠøŃ‚Šµ ŠæŠ¾Š´Š³Š¾Ń‚Š¾Š²ŠøŃ‚Ń ${type || "Š´Š¾ŠŗŃŠ¼ŠµŠ½Ń‚"}${recipient ? ` Š´Š»Ń¸ ${recipient}` : ""}${purpose ? ` Ń Ń†ŠµŠ»ŃŃˇ ${purpose}` : ""}.`;
  }
  return `Sain aru, et soovid koostada ${type || "dokumendi"}${recipient ? ` ${recipient}` : ""}${purpose ? ` eesmĆ¤rgiga ${purpose}` : ""}.`;
}

function buildDocumentReflection(draft = {}, update = {}, replyLang = "et") {
  if (update.documentType || update.recipient || update.purpose) {
    return buildDocumentSummarySentence(draft, replyLang);
  }
  if (update.sourceMode) {
    return documentWorkflowT(
      replyLang,
      update.sourceMode === "existing_material" ? "reflections.sourceExisting" : "reflections.sourceDescription",
      null,
      ""
    );
  }
  if (update.background) {
    return documentWorkflowT(replyLang, "reflections.background", null, "");
  }
  if (update.language || update.tone) {
    return documentWorkflowT(replyLang, "reflections.languageTone", {
      language: formatLanguageLabel(replyLang, draft.language),
      tone: formatToneLabel(replyLang, draft.tone)
    }, "");
  }
  if (update.length || update.templatePreference || update.deadline || update.reportPeriod) {
    return documentWorkflowT(replyLang, "reflections.preferences", null, "");
  }
  return "";
}

function buildMissingFieldPrompt(draft = {}, missingField = "", replyLang = "et", role = "SOCIAL_WORKER") {
  const describeKey = isClientRole(role) ? "questions.describeClient" : "questions.describe";
  const purposeKey = isClientRole(role) ? "questions.purposeClient" : "questions.purpose";
  if (missingField === "documentType" || missingField === "purpose") {
    if (draft.documentType && !draft.purpose) {
      return documentWorkflowT(replyLang, purposeKey, { documentType: draft.documentType }, "");
    }
    return documentWorkflowT(replyLang, describeKey, null, "");
  }
  if (missingField === "recipient") {
    return documentWorkflowT(replyLang, "questions.recipient", null, "");
  }
  if (missingField === "sourceMode") {
    return documentWorkflowT(replyLang, "questions.sourceBasis", null, "");
  }
  if (missingField === "sourceMaterial") {
    return documentWorkflowT(replyLang, "questions.sourceMaterial", null, "");
  }
  if (missingField === "background") {
    return documentWorkflowT(replyLang, "questions.background", null, "");
  }
  if (missingField === "language" || missingField === "tone") {
    return documentWorkflowT(replyLang, "questions.languageTone", null, "");
  }
  return documentWorkflowT(replyLang, describeKey, null, "");
}

function buildConditionalPrompt(replyLang = "et", role = "SOCIAL_WORKER") {
  const key = isClientRole(role) ? "questions.optionalPreferencesClient" : "questions.optionalPreferences";
  return documentWorkflowT(replyLang, key, null, "");
}

function buildPreviewReply(draft = {}, replyLang = "et") {
  const lines = [
    documentWorkflowT(replyLang, "preview.title", null, "Palun vaata kokkuvĆµte Ć¼le."),
    "",
    `${documentWorkflowLabel(replyLang, "documentType", "Dokumendi liik")}: ${draft.documentType}`,
    `${documentWorkflowLabel(replyLang, "purpose", "EesmĆ¤rk")}: ${draft.purpose}`,
    `${documentWorkflowLabel(replyLang, "recipient", "Kellele / kuhu")}: ${draft.recipient}`,
    `${documentWorkflowLabel(replyLang, "sourceBasis", "Alus")}: ${formatSourceModeLabel(replyLang, draft.sourceMode)}`,
    `${documentWorkflowLabel(replyLang, "background", "Oluline taust")}: ${draft.background}`,
    `${documentWorkflowLabel(replyLang, "language", "Keel")}: ${formatLanguageLabel(replyLang, draft.language)}`,
    `${documentWorkflowLabel(replyLang, "tone", "Toon")}: ${formatToneLabel(replyLang, draft.tone)}`
  ];

  if (draft.subjectLabel) {
    lines.push(`${documentWorkflowLabel(replyLang, "subjectLabel", "Kelle kohta / kelle jaoks")}: ${draft.subjectLabel}`);
  }
  if (draft.sourceDetails) {
    lines.push(`${documentWorkflowLabel(replyLang, "sourceDetails", "Alusmaterjal")}: ${draft.sourceDetails}`);
  }
  if (draft.length) {
    lines.push(`${documentWorkflowLabel(replyLang, "length", "Pikkus")}: ${formatLengthLabel(replyLang, draft.length)}`);
  }
  if (draft.templatePreference) {
    lines.push(`${documentWorkflowLabel(replyLang, "templatePreference", "Mall vĆµi vorm")}: ${draft.templatePreference}`);
  }
  if (draft.deadline) {
    lines.push(`${documentWorkflowLabel(replyLang, "deadline", "TĆ¤htaeg")}: ${draft.deadline}`);
  }
  if (draft.reportPeriod) {
    lines.push(`${documentWorkflowLabel(replyLang, "reportPeriod", "Aruande periood")}: ${draft.reportPeriod}`);
  }
  if (draft.recipientDetail) {
    lines.push(`${documentWorkflowLabel(replyLang, "recipientDetail", "Adressaadi tĆ¤psustus")}: ${draft.recipientDetail}`);
  }

  lines.push("", documentWorkflowT(replyLang, "preview.confirm", null, ""));
  return lines.join("\n");
}

function buildDocumentInstructionFromDraft(draft = {}) {
  const lines = [
    `Prepare a ${draft.documentType || "document"} draft.`,
    draft.purpose ? `Purpose: ${draft.purpose}.` : "",
    draft.recipient ? `Recipient or destination: ${draft.recipient}.` : "",
    draft.subjectLabel ? `Prepared for/about: ${draft.subjectLabel}.` : "",
    draft.sourceMode === "existing_material"
      ? "Use the user's existing material and notes as the primary basis."
      : "Use the user's description as the primary basis.",
    draft.sourceDetails ? `Material details: ${draft.sourceDetails}.` : "",
    draft.background ? `Important context: ${draft.background}.` : "",
    draft.deadline ? `Keep this timing or deadline in mind: ${draft.deadline}.` : "",
    draft.reportPeriod ? `Report period: ${draft.reportPeriod}.` : "",
    draft.templatePreference ? `Follow this template or form preference if possible: ${draft.templatePreference}.` : ""
  ];
  return lines.filter(Boolean).join("\n");
}

function buildDocumentTitleFromDraft(draft = {}, replyLang = "et") {
  const type = collapseWhitespace(draft.documentType);
  const purpose = collapseWhitespace(draft.purpose);
  if (type && purpose) return collapseWhitespace(`${type}: ${purpose}`);
  if (type) return type;
  return replyLang === "en" ? "Draft document" : replyLang === "ru" ? "Š§ŠµŃ€Š½Š¾Š²ŠøŠŗ Š´Š¾ŠŗŃŠ¼ŠµŠ½Ń‚Š°" : "Dokumendi mustand";
}

function buildTaskConfigFromDraft(draft = {}, role = "SOCIAL_WORKER", replyLang = "et") {
  return {
    role,
    artifactType: inferArtifactTypeFromDraft(draft, role),
    clientTask: role === "CLIENT"
      ? (/\b(vorm|blankett|ankeet|form)\b/.test(normalizeIntentText(draft.documentType || "")) ? "FILL_FORM" : "LETTER_REQUEST")
      : null,
    instruction: buildDocumentInstructionFromDraft(draft),
    audience: role === "CLIENT" ? "client" : "worker",
    tone: draft.tone || "professional",
    language: normalizeAgentLanguage(draft.language || replyLang, replyLang),
    length: draft.length || "standard",
    wantsTemplate: Boolean(draft.templatePreference),
    generatedTitle: buildDocumentTitleFromDraft(draft, replyLang)
  };
}

function buildDocumentWorkflowMetadata(state) {
  return {
    workflow: {
      document: state || null
    }
  };
}

async function readDocumentWorkflowState(conversationId, ownerId, prismaClient = prisma) {
  if (!conversationId || !ownerId) return null;
  const conversation = await prismaClient.conversation.findUnique({
    where: {
      id: conversationId
    },
    select: {
      userId: true
    }
  });
  if (!conversation || conversation.userId !== ownerId) return null;

  const assistantMessages = await prismaClient.conversationMessage.findMany({
    where: {
      conversationId,
      role: "ASSISTANT"
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 12,
    select: {
      metadata: true
    }
  });

  for (const message of assistantMessages) {
    const nextState = normalizeDocumentWorkflowState(message?.metadata?.workflow?.document || message?.metadata?.documentWorkflow || null);
    if (nextState) return nextState;
  }

  return null;
}

function buildReplyWithQuestion(reflection = "", question = "") {
  return [reflection, question].filter(Boolean).join("\n\n").trim();
}

export async function runDocumentChatWorkflow(input = {}, prismaClient = prisma) {
  const message = collapseWhitespace(input?.message);
  const replyLang = String(input?.replyLang || "et").trim() || "et";
  const role = normalizeFlowRole(input?.role || "SOCIAL_WORKER");
  const forceConfirmed = input?.forceConfirmed === true;
  const hasSourceMaterial = input?.hasSourceMaterial === true;
  const currentState = normalizeDocumentWorkflowState(input?.workflowState || null)
    || (input?.convId && input?.userId ? await readDocumentWorkflowState(input.convId, input.userId, prismaClient) : null);

  if (!currentState && !forceConfirmed) {
    return {
      handled: false,
      workflowState: null
    };
  }

  if (currentState) {
    const switchIntent = detectDocumentSwitchIntent(message);
    if (switchIntent === "cancel") {
      return {
        handled: true,
        reply: documentWorkflowT(replyLang, isClientRole(role) ? "cancelledClient" : "cancelled", null, ""),
        workflowState: null
      };
    }
    if (switchIntent === "restart") {
      const restarted = await runDocumentChatWorkflow({
        message: currentState.sourceMessage || message,
        replyLang,
        role,
        forceConfirmed: true
      }, prismaClient);
      return {
        ...restarted,
        reply: [documentWorkflowT(replyLang, isClientRole(role) ? "restartedClient" : "restarted", null, ""), restarted.reply].filter(Boolean).join("\n\n")
      };
    }
    if (switchIntent === "help_request" || switchIntent === "help_offer") {
      return {
        handled: false,
        switchTo: switchIntent,
        switchMessage: currentState.sourceMessage || "",
        workflowState: null
      };
    }
    if (switchIntent === "rag") {
      return {
        handled: true,
        reply: documentWorkflowT(replyLang, "switchToInfo", null, ""),
        workflowState: null
      };
    }
  }

  const baseState = currentState || createDocumentWorkflowState({
    flowLocked: true,
    sourceMessage: message,
    step: "collect_required_fields",
    draft: {}
  });

  const draftUpdate = extractDocumentDraftUpdate(
    currentState ? message : baseState.sourceMessage || message,
    baseState.draft,
    role,
    replyLang
  );
  const mergedDraft = mergeDocumentDraft(baseState.draft, draftUpdate);
  const missingFields = computeMissingDocumentFields(mergedDraft, {
    hasSourceMaterial
  });

  if (baseState.confirmationPending || baseState.step === "preview" || baseState.step === "edit_or_generate") {
    if (isAffirmativeDocumentReply(message) && missingFields.length === 0) {
      const finalState = createDocumentWorkflowState({
        ...baseState,
        draft: mergedDraft,
        missingFields: [],
        step: "done",
        confirmationPending: false,
        flowLocked: false
      });
      return {
        handled: true,
        readyToGenerate: true,
        workflowState: finalState,
        taskConfig: buildTaskConfigFromDraft(mergedDraft, role, replyLang)
      };
    }

    const nextState = createDocumentWorkflowState({
      ...baseState,
      draft: mergedDraft,
      missingFields,
      step: missingFields.length ? "collect_required_fields" : "preview",
      confirmationPending: missingFields.length === 0,
      flowLocked: true
    });
    const reflection = buildDocumentReflection(mergedDraft, draftUpdate, replyLang);
    const reply = missingFields.length
      ? buildReplyWithQuestion(reflection, buildMissingFieldPrompt(mergedDraft, missingFields[0], replyLang, role))
      : buildReplyWithQuestion(reflection, buildPreviewReply(mergedDraft, replyLang));

    return {
      handled: true,
      reply,
      workflowState: nextState
    };
  }

  if (!missingFields.length && !baseState.optionalPromptShown) {
    const nextState = createDocumentWorkflowState({
      ...baseState,
      draft: mergedDraft,
      missingFields: [],
      step: "collect_conditional_fields",
      optionalPromptShown: true,
      confirmationPending: false,
      flowLocked: true
    });
    const reflection = buildDocumentReflection(mergedDraft, draftUpdate, replyLang) || buildDocumentSummarySentence(mergedDraft, replyLang);
    return {
      handled: true,
      reply: buildReplyWithQuestion(reflection, buildConditionalPrompt(replyLang, role)),
      workflowState: nextState
    };
  }

  if (baseState.step === "collect_conditional_fields") {
    const nextState = createDocumentWorkflowState({
      ...baseState,
      draft: mergedDraft,
      missingFields: [],
      step: "preview",
      optionalPromptShown: true,
      confirmationPending: true,
      flowLocked: true
    });
    const reflection = buildDocumentReflection(mergedDraft, draftUpdate, replyLang);
    return {
      handled: true,
      reply: buildReplyWithQuestion(reflection, buildPreviewReply(mergedDraft, replyLang)),
      workflowState: nextState
    };
  }

  const nextState = createDocumentWorkflowState({
    ...baseState,
    draft: mergedDraft,
    missingFields,
    step: missingFields.length ? "collect_required_fields" : "preview",
    confirmationPending: missingFields.length === 0,
    flowLocked: true
  });

  if (!missingFields.length) {
    return {
      handled: true,
      reply: buildPreviewReply(mergedDraft, replyLang),
      workflowState: nextState
    };
  }

  const reflection = buildDocumentReflection(mergedDraft, draftUpdate, replyLang) || buildDocumentSummarySentence(mergedDraft, replyLang);
  return {
    handled: true,
    reply: buildReplyWithQuestion(reflection, buildMissingFieldPrompt(mergedDraft, missingFields[0], replyLang, role)),
    workflowState: nextState
  };
}

export function getDocumentWorkflowPlanInput(workflowState, requestedThoroughness = false, clarifyingTurns = 0) {
  const state = normalizeDocumentWorkflowState(workflowState);
  const message = state?.draft ? buildDocumentInstructionFromDraft(state.draft) : "";
  return chooseOrchestrationPlan({
    intent: resolveDocumentWorkMode(message),
    message,
    clarifyingTurns,
    requestedThoroughness,
    workflowState: {
      intent: resolveDocumentWorkMode(message),
      draft: {
        description: message
      },
      missingFields: Array.isArray(state?.missingFields) ? state.missingFields : []
    }
  });
}

export async function getDocumentWorkflowState(convId, userId, prismaClient = prisma) {
  return readDocumentWorkflowState(convId, userId, prismaClient);
}

export { buildDocumentWorkflowMetadata, isActiveDocumentWorkflowState };

export function buildDocumentTaskRuntimeConfig({ role = "SOCIAL_WORKER", replyLang = "et", history = [], message = "" }) {
  const normalizedRole = normalizeFlowRole(role);
  const defaultAudience = normalizedRole === "CLIENT" ? "client" : "worker";
  const inputs = collectRecentUserInputs(history, message, 8);
  const contextText = normalizeIntentText(inputs.join("\n"));
  const instruction = extractDocumentTaskInstruction(history, message, normalizedRole) || String(message || "").trim();
  const tone = inferToneFromText(contextText);
  const length = inferLengthFromText(contextText);
  const audience = inferAudienceFromText(contextText, defaultAudience);
  const language = normalizeAgentLanguage(inferLanguageFromText(contextText, replyLang), replyLang);
  const wantsTemplate = normalizedRole !== "CLIENT" && wantsTemplateFromText(contextText);
  if (normalizedRole === "CLIENT") {
    const clientTask = detectClientTaskFromText(contextText);
    const artifactType = artifactTypeFromClientTask(clientTask);
    const mergedInstruction = `${clientTaskInstruction(clientTask)}\n\n${instruction}`.trim();
    return [
      {
        role: normalizedRole,
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
        role: normalizedRole,
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
      role: normalizedRole,
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
      role: normalizedRole,
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

function resolveDocumentWorkModeForRole(message = "", role = "SOCIAL_WORKER") {
  if (isClientRole(role)) return WORK_MODES.DOCUMENT_DRAFTING;
  return resolveDocumentWorkMode(message);
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
  const normalizedRole = normalizeFlowRole(role);
  const historyHasDocumentTask = hasDocumentTaskContext(history, normalizedRole);
  const documentTaskStart = isDocumentStartCommand(message, history, normalizedRole);
  const isDocumentTask =
    forceDocumentTask ||
    detectDocumentTaskIntent(message, normalizedRole) ||
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
    role: normalizedRole,
    replyLang,
    history,
    message
  });

  const plan = chooseOrchestrationPlan({
    intent: resolveDocumentWorkModeForRole(message, normalizedRole),
    message,
    sourceCount,
    clarifyingTurns,
    requestedThoroughness,
    workflowState: {
      intent: resolveDocumentWorkModeForRole(message, normalizedRole),
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

