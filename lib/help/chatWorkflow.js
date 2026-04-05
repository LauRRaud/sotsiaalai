import prisma from "../prisma.js";
import { inferHelpCategoryCode } from "./categories.js";
import { createHelpMatch, listMatchingOffersForRequest, listMatchingRequestsForOffer } from "./matches.js";
import { detectHelpChatIntent } from "./intents.js";
import { findLocationAliasMatches } from "./locationAliases.js";
import {
  municipalityGuessNeedsConfirmation,
  normalizePlaceToMunicipality
} from "./locationNormalization.js";
import { helpWorkflowLabel, helpWorkflowT } from "./chatWorkflowText.js";
import {
  buildHelpListingMetaLine,
  formatHelpTypeLabel,
  formatTimeTypeLabel,
  toHelpListingView
} from "./listingViews.js";
import { createHelpOffer } from "./offers.js";
import { createHelpRequest } from "./requests.js";
import { inferTargetGroupCodes } from "./targetGroups.js";
import { createHelpWorkflowDraftState, isActiveHelpWorkflowState, normalizeHelpWorkflowState } from "./workflowState.js";

const CATEGORY_LABELS = Object.freeze({
  TRANSPORT: "Transport",
  DAILY_TASKS: "Igapäevaabi",
  HOME_HELP: "Koduabi",
  DIGITAL_HELP: "Digiabi",
  CARE_SUPPORT: "Tugi ja hooldus",
  CHILD_YOUTH_SUPPORT: "Laste ja noorte tugi",
  LEARNING_GUIDANCE: "Õppimise ja juhendamise abi",
  SOCIAL_SUPPORT: "Seltskond ja sotsiaalne tugi",
  ADMIN_FORM_HELP: "Asjaajamise ja vormide abi",
  OTHER: "Muu abi"
});

const TARGET_GROUP_LABELS = Object.freeze({
  CHILD: "Laps",
  YOUTH: "Noor",
  ADULT: "Täiskasvanu",
  ELDER: "Eakas",
  DISABILITY: "Puue või erivajadus"
});

const SHARED_REQUIRED_FIELD_ORDER = Object.freeze([
  "description",
  "rawPlace",
  "municipalityId",
  "helpType",
  "timeType",
  "availabilityOrStart",
  "contactPreference",
  "categoryCode",
  "targetGroupCodes",
  "title"
]);

const HELP_REQUEST_REQUIRED_FIELD_ORDER = Object.freeze([
  "beneficiaryLabel",
  "urgency"
]);

const HELP_OFFER_REQUIRED_FIELD_ORDER = Object.freeze([
  "providerScopeOrConditions"
]);

const LOCATION_PREPOSITION_PATTERN = /\b(?:asukohaks|asukohas|asukoht|piirkonnas|piirkond|kohas|kohale|kandis|linnas|vallas|külas|alevis|alevikus|juures|lähedal|near|in|at)\s+([\p{L}\d][\p{L}\d'.-]*(?:\s+[\p{L}\d][\p{L}\d'.-]*){0,3})/iu;
const MUNICIPALITY_PATTERN = /\b([\p{L}-]+(?:\s+[\p{L}-]+)?\s+(?:vald|linn))\b/iu;
const WEEKDAY_OR_TIME_PATTERN = /\b(esmaspäev|esmaspaev|teisipäev|teisipaev|kolmapäev|kolmapaev|neljapäev|neljapaev|reede|laupäev|laupaev|pühapäev|puhapaev|igal|iga|õhtuti|ohtuti|hommikuti|päeviti|paeviti|nädalavahetusel|nadalavahetusel|alates|kohe|lähiajal|lahiajal|järgmisest|jargmisest)\b/i;
const CONTACT_PATTERN = /\b(vestluse kaudu|siin vestluses|telefoni teel|telefonitsi|telefon|helista|e-posti teel|eposti teel|e-postiga|emaili teel|meili teel|kokkuleppel)\b/i;
const SCOPE_PATTERN = /\b(ainult|õhtuti|hommikuti|tööpäeviti|nädalavahetusel|kokkuleppel|kindlas piirkonnas|piiratud piirkonnas)\b/i;
const PAID_DETAILS_PATTERN = /\b(\d+\s*(?:eur|euro|€)|tunnihind|päevahind|kord|tasu|kokkuleppeline tasu|tasustamine)\b/i;
const TITLE_PREFIX_PATTERN = /^\s*(?:pealkiri|title)\s*[:=-]\s*/i;

function normalizeText(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .toLowerCase()
    .trim();
}

function collapseWhitespace(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function formatLabelledLine(label, value) {
  return `${label}: ${value}`;
}

function isAffirmative(text = "") {
  const normalized = normalizeText(text);
  return /^(jah|jaa|yes|ok|okay|kinnitan|confirm|salvesta|save|sobib)\b/.test(normalized);
}

function isCancel(text = "") {
  return /\b(katkesta|lopeta|lõpeta|cancel|abort|ara salvesta|ära salvesta)\b/.test(normalizeText(text));
}

function isEditSignal(text = "") {
  return /\b(muuda|muudan|edit|change|paranda|tegelikult|pigem)\b/.test(normalizeText(text));
}

function isNegative(text = "") {
  const normalized = normalizeText(text);
  return /^(ei|no|not really)\b/.test(normalized) && normalized.split(/\s+/).length <= 3;
}

function shortDescription(text = "", max = 220) {
  const normalized = collapseWhitespace(text);
  if (!normalized) return "";
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 1).trimEnd()}...`;
}

function uniqueStrings(values = []) {
  return Array.from(new Set((Array.isArray(values) ? values : []).map((value) => collapseWhitespace(value)).filter(Boolean)));
}

function formatMunicipalityCandidateList(candidates = []) {
  return candidates
    .map((candidate, index) => `${index + 1}. ${candidate.displayName}${candidate.county ? ` (${candidate.county})` : ""}`)
    .join("\n");
}

function parseOrdinalSelection(text = "", max = 0) {
  const normalized = normalizeText(text);
  const numericMatch = normalized.match(/\b([1-9]|10)\b/);
  if (numericMatch) {
    const index = Number(numericMatch[1]) - 1;
    if (index >= 0 && index < max) return index;
  }
  if (/\b(esimene|first)\b/.test(normalized)) return max > 0 ? 0 : null;
  if (/\b(teine|second)\b/.test(normalized)) return max > 1 ? 1 : null;
  if (/\b(kolmas|third)\b/.test(normalized)) return max > 2 ? 2 : null;
  return null;
}

function buildIntentTitle(intent) {
  if (intent === "create_help_offer") return "Abipakkumine";
  return "Abisoov";
}

function deriveHelpTypeEnum(description = "") {
  const normalized = normalizeText(description);
  const mentionsVoluntary = /\b(vabatahtlik|tasuta|volunteer|voluntary)\b/.test(normalized);
  const mentionsPaid = /\b(tasuline|paid|tasu eest)\b/.test(normalized);

  if (mentionsVoluntary && mentionsPaid) return "MIXED";
  if (mentionsPaid) return "PAID";
  if (mentionsVoluntary) return "VOLUNTARY";
  return "";
}

function deriveTimeTypeEnum(description = "") {
  const normalized = normalizeText(description);
  if (/\b(paar korda nadalas|paar korda nädalas|iga nadal|iga paev|igapaev|iga päev|weekly|daily|recurring|regular)\b/.test(normalized)) {
    return "RECURRING";
  }
  if (/\b(ukskord|üks kord|one time|one-off|uhekordne|ühekordne)\b/.test(normalized)) {
    return "ONE_TIME";
  }
  if (/\b(paindlik|ajutine|temporary|flexible|vastavalt vajadusele|as needed)\b/.test(normalized)) {
    return "FLEXIBLE";
  }
  return "";
}

function deriveDraftFields(description = "", intent = "create_help_request") {
  const normalized = normalizeText(description);
  let category = "";
  let categoryCode = "";
  let serviceLabel = "";
  let helpType = deriveHelpTypeEnum(description);
  let timeType = deriveTimeTypeEnum(description);
  let targetGroup = "";

  if (/\b(transport|soit|sõit|viia|autoga)\b/.test(normalized)) {
    category = "Transport";
    categoryCode = "TRANSPORT";
    serviceLabel = "Transpordiabi";
  } else if (/\b(pood|poes|ostud|toidupood|shop)\b/.test(normalized)) {
    category = "Igapaevaabi";
    categoryCode = "DAILY_TASKS";
    serviceLabel = "Poeabi";
  } else if (/\b(isiklik abistaja|abistaja|care assistant)\b/.test(normalized)) {
    category = "Tugi ja hooldus";
    categoryCode = "CARE_SUPPORT";
    serviceLabel = "Isikliku abistaja abi";
  } else if (/\b(koduabi|kodus|korist|majapid)\b/.test(normalized)) {
    category = "Koduabi";
    categoryCode = "HOME_HELP";
    serviceLabel = "Koduabi";
  } else if (/\b(selts|kaasa|saatm|compan)\b/.test(normalized)) {
    category = "Seltskond ja sotsiaalne tugi";
    categoryCode = "SOCIAL_SUPPORT";
    serviceLabel = "Saatmis- voi seltsimisabi";
  } else if (/\b(vorm|avald|dokum|asjaaj|admin|form)\b/.test(normalized)) {
    category = "Asjaajamise ja vormide abi";
    categoryCode = "ADMIN_FORM_HELP";
    serviceLabel = "Dokumentide ja vormide abi";
  } else if (/\b(digi|telefon|arvuti|internet|e-teenus|computer)\b/.test(normalized)) {
    category = "Digiabi";
    categoryCode = "DIGITAL_HELP";
    serviceLabel = "Digiabi";
  }

  if (/\b(emale|emalele|isale|vanaemale|vanaisale|eakale|senior)\b/.test(normalized)) {
    targetGroup = "Eakas inimene";
  } else if (/\b(lapsele|lastele|noorele|young person|child)\b/.test(normalized)) {
    targetGroup = "Laps / noor";
  } else if (/\b(puudega|erivajadusega|disabled)\b/.test(normalized)) {
    targetGroup = "Erivajadusega inimene";
  }

  const title = serviceLabel || buildIntentTitle(intent);
  return {
    title,
    category,
    categoryCode,
    serviceLabel,
    helpType,
    timeType,
    targetGroup
  };
}

function cleanInitialDescription(text = "") {
  return String(text || "")
    .replace(/^[\s,.-]*(aita mul\s+vormistada|soovin\s+pakkuda|pakun|saan\s+aidata|voin\s+aidata|voiksin\s+aidata|olen\s+valmis\s+aitama|aitan|mul oleks vaja|mul on vaja|vaja oleks|vajan|otsin|soovin leida|aita leida)\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function shouldAppendDescription(text = "", currentState = null) {
  const normalized = normalizeText(text);
  if (!normalized) return false;
  if (isAffirmative(text) || isCancel(text)) return false;
  if (currentState?.municipalityCandidates?.length && (normalized.length <= 40 || /^\d+$/.test(normalized))) return false;
  if (/\b(tallinn(as)?|tartu(s)?|narva(s)?|parnu(s)?|pärnu(s)?|viljandi(s)?|valga(s)?|keila(s)?)\b/.test(normalized) && normalized.length <= 24) {
    return false;
  }
  return normalized.length >= 6;
}

function getCategoryLabel(code = "") {
  return CATEGORY_LABELS[String(code || "").trim().toUpperCase()] || "";
}

function getTargetGroupLabels(codes = []) {
  return uniqueStrings(codes.map((code) => TARGET_GROUP_LABELS[String(code || "").trim().toUpperCase()] || ""));
}

function normalizeDraft(input = {}) {
  return {
    title: collapseWhitespace(input.title),
    description: collapseWhitespace(input.description),
    category: collapseWhitespace(input.category),
    categoryCode: collapseWhitespace(input.categoryCode).toUpperCase(),
    secondaryCategories: uniqueStrings(input.secondaryCategories),
    secondaryCategoryCodes: uniqueStrings(input.secondaryCategoryCodes).map((value) => value.toUpperCase()),
    serviceLabel: collapseWhitespace(input.serviceLabel),
    helpType: collapseWhitespace(input.helpType).toUpperCase(),
    timeType: collapseWhitespace(input.timeType).toUpperCase(),
    targetGroup: collapseWhitespace(input.targetGroup),
    targetGroups: uniqueStrings(input.targetGroups),
    targetGroupCodes: uniqueStrings(input.targetGroupCodes).map((value) => value.toUpperCase()),
    rawPlace: collapseWhitespace(input.rawPlace),
    availabilityOrStart: collapseWhitespace(input.availabilityOrStart),
    contactPreference: collapseWhitespace(input.contactPreference),
    compensationDetails: collapseWhitespace(input.compensationDetails),
    beneficiaryLabel: collapseWhitespace(input.beneficiaryLabel),
    urgency: collapseWhitespace(input.urgency),
    providerScopeOrConditions: collapseWhitespace(input.providerScopeOrConditions),
    conditions: collapseWhitespace(input.conditions),
    skillsOrBackground: collapseWhitespace(input.skillsOrBackground),
    accessibilityNotes: collapseWhitespace(input.accessibilityNotes),
    languagePreference: collapseWhitespace(input.languagePreference),
    structuredSummary: collapseWhitespace(input.structuredSummary),
    extraNotes: collapseWhitespace(input.extraNotes)
  };
}

function normalizedFieldValue(value) {
  if (Array.isArray(value)) return JSON.stringify(value);
  return collapseWhitespace(value);
}

function changedFieldNames(previousDraft = {}, nextDraft = {}) {
  const changed = [];
  const allKeys = new Set([...Object.keys(previousDraft), ...Object.keys(nextDraft)]);
  for (const key of allKeys) {
    if (normalizedFieldValue(previousDraft[key]) !== normalizedFieldValue(nextDraft[key])) {
      changed.push(key);
    }
  }
  return changed;
}

function detectCompensationType(message = "") {
  const normalized = normalizeText(message);
  const mentionsVoluntary = /\b(vabatahtlik|vabatahtlikult|tasuta|volunteer|voluntary)\b/.test(normalized);
  const mentionsPaid = /\b(tasuline|tasu eest|paid|eur|euro|€|tunnihind|kokkuleppeline tasu)\b/.test(normalized);
  const mentionsBoth = /\b(molemad|mõlemad|nii vabatahtlik kui tasuline|olen avatud molemale|olen avatud mõlemale)\b/.test(normalized);
  if (mentionsBoth || (mentionsVoluntary && mentionsPaid)) return "MIXED";
  if (mentionsPaid) return "PAID";
  if (mentionsVoluntary) return "VOLUNTARY";
  return "";
}

function detectCompensationDetails(message = "", helpType = "") {
  const trimmed = collapseWhitespace(message);
  if (!trimmed) return "";
  if (!PAID_DETAILS_PATTERN.test(trimmed) && !/\bkokkuleppel\b/i.test(trimmed)) return "";
  if (helpType === "VOLUNTARY" && !/\bkuluhuvitis|sõidukulu|sõidukulud\b/i.test(trimmed)) return "";
  return trimmed;
}

function detectTimeType(message = "") {
  const normalized = normalizeText(message);
  if (/\b(uhekordne|ühekordne|one time|one-off|seekord)\b/.test(normalized)) return "ONE_TIME";
  if (/\b(regulaarne|regulaarselt|iga nadal|iga nädal|kolmapaeviti|kolmapäeviti|esmaspaeviti|esmaspäeviti|teisipaeviti|teisipäeviti|neljapaeviti|neljapäeviti|reedeti|laupaeviti|laupäeviti|puhapaeviti|pühapäeviti|nadalavahetusel|nädalavahetusel)\b/.test(normalized)) return "RECURRING";
  if (/\b(paindlik|paindlikult|vastavalt vajadusele|as needed|kokkuleppel)\b/.test(normalized)) return "FLEXIBLE";
  return "";
}

function detectAvailabilityOrStart(message = "") {
  const trimmed = collapseWhitespace(message);
  if (!trimmed) return "";
  if (WEEKDAY_OR_TIME_PATTERN.test(trimmed) || /\b(kohe|lähiajal|paindlikult|saadaval|vaba)\b/i.test(trimmed)) {
    return trimmed;
  }
  return "";
}

function detectContactPreference(message = "") {
  const normalized = normalizeText(message);
  if (/\b(vestluse kaudu|siin vestluses|vestluses)\b/.test(normalized)) return "vestluse kaudu";
  if (/\b(telefoni teel|telefonitsi|telefon|helista)\b/.test(normalized)) return "telefoni teel";
  if (/\b(e-posti teel|eposti teel|e-postiga|emaili teel|meili teel|email|e-post)\b/.test(normalized)) return "e-posti teel";
  if (/\b(kokkuleppel)\b/.test(normalized)) return "kokkuleppel";
  return "";
}

function detectUrgency(message = "") {
  const normalized = normalizeText(message);
  if (/\b(kohe|esimesel voimalusel|esimesel võimalusel|niipea kui voimalik|niipea kui võimalik)\b/.test(normalized)) return "kohe";
  if (/\b(lahiajal|lähiajal|lähinadalal|lähinädalal|peagi|varsti)\b/.test(normalized)) return "lähiajal";
  if (/\b(paindlik|paindlikult|ei ole kiire|pole kiire)\b/.test(normalized)) return "paindlik";
  return "";
}

function detectBeneficiaryLabel(message = "") {
  const normalized = normalizeText(message);
  if (/\b(endale|mulle|minule|enda jaoks)\b/.test(normalized)) return "endale";
  if (/\b(emale)\b/.test(normalized)) return "emale";
  if (/\b(isale)\b/.test(normalized)) return "isale";
  if (/\b(lapsele)\b/.test(normalized)) return "lapsele";
  if (/\b(kliendile)\b/.test(normalized)) return "kliendile";
  if (/\b(vanaemale)\b/.test(normalized)) return "vanaemale";
  if (/\b(vanaisale)\b/.test(normalized)) return "vanaisale";
  return "";
}

function detectProviderScopeOrConditions(message = "") {
  const trimmed = collapseWhitespace(message);
  if (!trimmed) return "";
  if (SCOPE_PATTERN.test(trimmed) || /\b(kolmapaeviti|kolmapäeviti|esmaspaeviti|esmaspäeviti|teisipaeviti|teisipäeviti|õhtuti|ohtuti|hommikuti)\b/i.test(trimmed)) return trimmed;
  return "";
}

function detectConditions(message = "") {
  const trimmed = collapseWhitespace(message);
  if (!trimmed) return "";
  if (/\b(trepp|ratastool|liikumisraskus|vajab saatjat|ei saa üksinda|juurdepääs)\b/i.test(trimmed)) return trimmed;
  return "";
}

function detectSkillsOrBackground(message = "") {
  const trimmed = collapseWhitespace(message);
  if (!trimmed) return "";
  if (/\b(kogemus|oskused|juhiluba|auto olemas|hoolduskogemus|digiabi kogemus|taust)\b/i.test(trimmed)) return trimmed;
  return "";
}

function inferCategoryFromText(message = "", previousCode = "") {
  const normalized = normalizeText(message);
  if (!normalized) {
    return { categoryCode: previousCode || "", category: getCategoryLabel(previousCode), confidence: previousCode ? "high" : "low" };
  }
  if (/\btransport\w*\b/.test(normalized)) {
    return { categoryCode: "TRANSPORT", category: getCategoryLabel("TRANSPORT"), confidence: "high" };
  }
  if (/\b(pood|poes|poeabi|ostud|asjaajamine|kaimine|käimine)\b/.test(normalized)) {
    return { categoryCode: "DAILY_TASKS", category: getCategoryLabel("DAILY_TASKS"), confidence: "high" };
  }
  if (/\b(digi|arvuti|telefon|internet|e-teenus|e teenus)\b/.test(normalized)) {
    return { categoryCode: "DIGITAL_HELP", category: getCategoryLabel("DIGITAL_HELP"), confidence: "high" };
  }
  if (/\b(hooldus|hooldaja|isiklik abistaja|tugiisik|saatja)\b/.test(normalized)) {
    return { categoryCode: "CARE_SUPPORT", category: getCategoryLabel("CARE_SUPPORT"), confidence: "high" };
  }
  const inferredCode = inferHelpCategoryCode({
    primaryCategoryCode: previousCode,
    description: message
  });
  if (inferredCode && inferredCode !== "OTHER") {
    return { categoryCode: inferredCode, category: getCategoryLabel(inferredCode), confidence: "high" };
  }
  if (/\b(muu abi|muu)\b/.test(normalized)) {
    return { categoryCode: "OTHER", category: getCategoryLabel("OTHER"), confidence: "medium" };
  }
  return { categoryCode: previousCode || "", category: getCategoryLabel(previousCode), confidence: previousCode ? "high" : "low" };
}

function inferTargetGroupsFromMessage(message = "", previousCodes = []) {
  const normalized = normalizeText(message);
  const manualCodes = [];
  if (/\b(laps|lapsele|lastele|lapsed)\b/.test(normalized)) manualCodes.push("CHILD");
  if (/\b(noor|noorele|noortele|noored)\b/.test(normalized)) manualCodes.push("YOUTH");
  if (/\b(taiskasvanu|taiskasvanule|taiskasvanud)\b/.test(normalized)) manualCodes.push("ADULT");
  if (/\b(eakas|eakale|eakad|eakatele|pensionar|pensionarid)\b/.test(normalized)) manualCodes.push("ELDER");
  if (/\b(puue|puudega|erivajadus|erivajadusega)\b/.test(normalized)) manualCodes.push("DISABILITY");
  if (manualCodes.length) {
    return {
      targetGroupCodes: uniqueStrings(manualCodes),
      targetGroups: getTargetGroupLabels(manualCodes),
      confidence: "high"
    };
  }
  const codes = inferTargetGroupCodes({
    targetGroup: message
  });
  if (codes.length) {
    return {
      targetGroupCodes: uniqueStrings(codes),
      targetGroups: getTargetGroupLabels(codes),
      confidence: "high"
    };
  }
  if (previousCodes.length) {
    return {
      targetGroupCodes: uniqueStrings(previousCodes),
      targetGroups: getTargetGroupLabels(previousCodes),
      confidence: "high"
    };
  }
  return {
    targetGroupCodes: [],
    targetGroups: [],
    confidence: "low"
  };
}

function cleanNaturalDescription(text = "", intent = "create_help_request") {
  return String(text || "")
    .replace(TITLE_PREFIX_PATTERN, "")
    .replace(/^[\s,.-]*(?:aita mul\s+vormistada|soovin\s+pakkuda|pakun|saan\s+aidata|voin\s+aidata|voiksin\s+aidata|olen\s+valmis\s+aitama|aitan)\s+/i, "")
    .replace(/^[\s,.-]*(?:mul oleks vaja|mul on vaja|vaja oleks|vajan|otsin|soovin leida|aita leida)\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function looksLikeFieldOnlyAnswer(text = "") {
  const normalized = normalizeText(text);
  if (!normalized) return true;
  if (/^(jah|ei|vabatahtlik|tasuline|molemad|mõlemad|uhekordne|ühekordne|regulaarne|paindlik|kohe|lahiajal|lähiajal|vestluse kaudu|telefoni teel|e-posti teel|kokkuleppel)$/i.test(normalized)) {
    return true;
  }
  if (/^[1-9]\b/.test(normalized)) return true;
  if (CONTACT_PATTERN.test(normalized)) return true;
  if (WEEKDAY_OR_TIME_PATTERN.test(normalized) && normalized.split(/\s+/).length <= 6) return true;
  return false;
}

function explicitSwitchIntent(message = "", currentIntent = null) {
  const normalized = normalizeText(message);
  if (!normalized) return null;
  if (isCancel(normalized)) return "cancel";
  if (/\b(soovin hoopis abisoovi teha|see on abisoov|muudan see on abisoov|muudan, see on abisoov)\b/.test(normalized)) {
    return currentIntent === "create_help_request" ? null : "create_help_request";
  }
  if (/\b(soovin hoopis abipakkumist teha|see on abipakkumine|muudan see on abipakkumine|muudan, see on abipakkumine)\b/.test(normalized)) {
    return currentIntent === "create_help_offer" ? null : "create_help_offer";
  }
  return null;
}

function generateTitleFromDraft(draft = {}, intent = "create_help_request") {
  if (collapseWhitespace(draft.title)) return collapseWhitespace(draft.title);
  const baseDescription = collapseWhitespace(draft.description).replace(/[.?!]+$/g, "").slice(0, 72).trim();
  if (baseDescription) {
    return intent === "create_help_offer"
      ? collapseWhitespace(`Pakun ${baseDescription}`).replace(/^Pakun pakun/i, "Pakun")
      : collapseWhitespace(`Vajan ${baseDescription}`).replace(/^Vajan vajan/i, "Vajan");
  }
  if (draft.categoryCode) {
    return intent === "create_help_offer"
      ? `Pakun ${getCategoryLabel(draft.categoryCode).toLowerCase()}`
      : `Vajan ${getCategoryLabel(draft.categoryCode).toLowerCase()}`;
  }
  return buildIntentTitle(intent);
}

function generateStructuredSummary(draft = {}, municipalityLabel = "", intent = "create_help_request") {
  return collapseWhitespace([
    generateTitleFromDraft(draft, intent),
    draft.rawPlace,
    municipalityLabel,
    draft.helpType ? formatHelpTypeLabel(draft.helpType, "et") : "",
    draft.timeType ? formatTimeTypeLabel(draft.timeType, "et") : ""
  ].filter(Boolean).join(" · ")).slice(0, 280);
}

function buildSavedReply(state, record, replyLang, options = {}) {
  const includeNextStep = options?.includeNextStep !== false;
  const listingView = toHelpListingView(record, {
    kind: state.intent === "create_help_offer" ? "offer" : "request",
    locale: replyLang
  });
  const metaLine = buildHelpListingMetaLine(listingView, replyLang);

  return [
    helpWorkflowT(replyLang, state.intent === "create_help_offer" ? "saved.offer" : "saved.request"),
    "",
    listingView.title,
    listingView.summary || record.description || state.draft.description || "-",
    metaLine || "",
    listingView.municipalityLabel
      ? formatLabelledLine(helpWorkflowLabel(replyLang, "municipality", "Omavalitsus"), listingView.municipalityLabel)
      : "",
    listingView.statusLabel
      ? formatLabelledLine(helpWorkflowLabel(replyLang, "status", "Status"), listingView.statusLabel)
      : "",
    ...(includeNextStep
      ? [
          "",
          helpWorkflowT(replyLang, state.intent === "create_help_offer" ? "browse.nextRequests" : "browse.nextOffers")
        ]
      : [])
  ].filter(Boolean).join("\n");
}

function buildBrowseReply(intent, results, replyLang) {
  if (!results.length) {
    return helpWorkflowT(replyLang, intent === "browse_help_offers" ? "browse.emptyOffers" : "browse.emptyRequests");
  }

  const lines = results.map((item, index) => {
    const listingView = item?.listingView || toHelpListingView(item, { kind: item.kind, locale: replyLang });
    const meta = buildHelpListingMetaLine(listingView, replyLang);
    return [
      `${index + 1}. ${listingView.title}`,
      listingView.summary || "",
      meta || "",
      listingView.municipalityLabel
        ? formatLabelledLine(helpWorkflowLabel(replyLang, "municipality", "Omavalitsus"), listingView.municipalityLabel)
        : ""
    ].filter(Boolean).join("\n");
  });

  return [
    helpWorkflowT(replyLang, intent === "browse_help_offers" ? "browse.foundOffers" : "browse.foundRequests", {
      count: results.length
    }),
    "",
    lines.join("\n\n"),
    "",
    helpWorkflowT(replyLang, intent === "browse_help_offers" ? "browse.connectHintOffers" : "browse.connectHintRequests")
  ].join("\n");
}

function buildEntryConfirmationReply(intent, replyLang) {
  const confirmKey = intent === "create_help_offer" ? "entry.helpOffer" : "entry.helpRequest";
  return [
    helpWorkflowT(replyLang, confirmKey),
    helpWorkflowT(replyLang, "entry.reprompt")
  ].join("\n");
}

function buildBroadPrompt(intent, replyLang) {
  return helpWorkflowT(
    replyLang,
    intent === "create_help_offer" ? "questions.offer.describe" : "questions.request.describe"
  );
}

function computeMissingFields(state) {
  const draft = normalizeDraft(state?.draft || {});
  const required = [...SHARED_REQUIRED_FIELD_ORDER];
  if (state.intent === "create_help_request") required.push(...HELP_REQUEST_REQUIRED_FIELD_ORDER);
  if (state.intent === "create_help_offer") required.push(...HELP_OFFER_REQUIRED_FIELD_ORDER);
  if (draft.helpType === "PAID" || draft.helpType === "MIXED") required.push("compensationDetails");

  return required.filter((field) => {
    if (field === "municipalityId") return !state.municipalityId;
    if (field === "targetGroupCodes") return !draft.targetGroupCodes.length;
    return !draft[field];
  });
}

function nextMissingField(state) {
  if (state?.municipalityCandidates?.length) return "municipality_confirmation";
  const missing = computeMissingFields(state);
  const ordered = state.intent === "create_help_request"
    ? [
        "description",
        "rawPlace",
        "municipalityId",
        "beneficiaryLabel",
        "urgency",
        "helpType",
        "compensationDetails",
        "timeType",
        "availabilityOrStart",
        "contactPreference",
        "targetGroupCodes",
        "categoryCode",
        "title"
      ]
    : [
        "description",
        "rawPlace",
        "municipalityId",
        "helpType",
        "compensationDetails",
        "timeType",
        "availabilityOrStart",
        "providerScopeOrConditions",
        "contactPreference",
        "targetGroupCodes",
        "categoryCode",
        "title"
      ];
  for (const field of ordered) {
    if (missing.includes(field)) return field;
  }
  return missing[0] || null;
}

function buildFieldQuestion(state, replyLang) {
  const missingField = nextMissingField(state);
  if (missingField === "municipality_confirmation") {
    if (state.municipalityCandidates.length === 1) {
      const candidate = state.municipalityCandidates[0];
      return helpWorkflowT(replyLang, "questions.location.confirmSingle", {
        municipality: candidate.displayName
      });
    }

    return [
      helpWorkflowT(replyLang, "questions.location.confirmMany"),
      "",
      formatMunicipalityCandidateList(state.municipalityCandidates),
      "",
      helpWorkflowT(replyLang, "questions.location.confirmManyHint")
    ].join("\n");
  }

  const questions = {
    description: buildBroadPrompt(state.intent, replyLang),
    rawPlace: helpWorkflowT(replyLang, state.intent === "create_help_offer" ? "questions.offer.rawPlace" : "questions.request.rawPlace"),
    municipalityId: helpWorkflowT(replyLang, "questions.location.askMunicipality"),
    beneficiaryLabel: helpWorkflowT(replyLang, "questions.request.beneficiary"),
    urgency: helpWorkflowT(replyLang, "questions.request.urgency"),
    helpType: helpWorkflowT(replyLang, state.intent === "create_help_offer" ? "questions.offer.helpType" : "questions.request.helpType"),
    compensationDetails: helpWorkflowT(replyLang, state.intent === "create_help_offer" ? "questions.offer.compensationDetails" : "questions.request.compensationDetails"),
    timeType: helpWorkflowT(replyLang, state.intent === "create_help_offer" ? "questions.offer.timeType" : "questions.request.timeType"),
    availabilityOrStart: helpWorkflowT(replyLang, state.intent === "create_help_offer" ? "questions.offer.availability" : "questions.request.availability"),
    providerScopeOrConditions: helpWorkflowT(replyLang, "questions.offer.scope"),
    contactPreference: helpWorkflowT(replyLang, "questions.shared.contactPreference"),
    targetGroupCodes: helpWorkflowT(replyLang, "questions.shared.targetGroup"),
    categoryCode: helpWorkflowT(replyLang, "questions.shared.category"),
    title: helpWorkflowT(replyLang, "questions.shared.title")
  };

  return questions[missingField] || buildBroadPrompt(state.intent, replyLang);
}

function buildSummarySentence(state, replyLang) {
  const draft = normalizeDraft(state?.draft || {});
  const categoryPart = draft.category ? draft.category.toLowerCase() : "abi";
  const targetPart = draft.targetGroups.length ? ` ${draft.targetGroups.join(", ").toLowerCase()}` : "";
  const locationPart = draft.rawPlace ? ` ${draft.rawPlace}` : "";

  if (state.intent === "create_help_offer") {
    return helpWorkflowT(replyLang, "reflections.offerSummary", {
      category: categoryPart,
      target: targetPart,
      place: locationPart
    });
  }

  return helpWorkflowT(replyLang, "reflections.requestSummary", {
    category: categoryPart,
    target: targetPart,
    place: locationPart
  });
}

function buildChangeReflection(state, changedFields = [], replyLang = "et") {
  const draft = normalizeDraft(state?.draft || {});
  if (!changedFields.length) return "";
  if (changedFields.includes("rawPlace") || changedFields.includes("municipalityLabel")) {
    if (draft.rawPlace && state.municipalityLabel) {
      return helpWorkflowT(replyLang, "reflections.locationWithMunicipality", {
        rawPlace: draft.rawPlace,
        municipality: state.municipalityLabel
      });
    }
    if (draft.rawPlace) {
      return helpWorkflowT(replyLang, "reflections.locationOnly", {
        rawPlace: draft.rawPlace
      });
    }
  }
  if (changedFields.includes("helpType") && draft.helpType) {
    const helpTypeLabel = formatHelpTypeLabel(draft.helpType, replyLang).toLowerCase().replace(/\s+abi$/i, "");
    return helpWorkflowT(replyLang, "reflections.helpType", {
      helpType: helpTypeLabel
    });
  }
  if (changedFields.includes("timeType") && draft.timeType) {
    return helpWorkflowT(replyLang, "reflections.timeType", {
      timeType: formatTimeTypeLabel(draft.timeType, replyLang).toLowerCase()
    });
  }
  if (changedFields.includes("contactPreference") && draft.contactPreference) {
    return helpWorkflowT(replyLang, "reflections.contactPreference", {
      contactPreference: draft.contactPreference
    });
  }
  if (changedFields.includes("beneficiaryLabel") && draft.beneficiaryLabel) {
    return helpWorkflowT(replyLang, "reflections.beneficiary", {
      beneficiary: draft.beneficiaryLabel
    });
  }
  if (changedFields.includes("urgency") && draft.urgency) {
    return helpWorkflowT(replyLang, "reflections.urgency", {
      urgency: draft.urgency
    });
  }
  if (changedFields.includes("providerScopeOrConditions") && draft.providerScopeOrConditions) {
    return helpWorkflowT(replyLang, "reflections.conditions");
  }
  if (changedFields.includes("title") && draft.title) {
    return helpWorkflowT(replyLang, "reflections.title", {
      title: draft.title
    });
  }
  if (changedFields.includes("description") || changedFields.includes("categoryCode") || changedFields.includes("targetGroupCodes")) {
    return buildSummarySentence(state, replyLang);
  }
  return "";
}

function buildPreviewReply(state, replyLang, options = {}) {
  const prefix = collapseWhitespace(options.prefix);
  const draft = normalizeDraft(state?.draft || {});
  const lines = [];
  if (prefix) lines.push(prefix, "");
  if (state.intent === "create_help_offer") {
    lines.push(helpWorkflowT(replyLang, "preview.offerTitle"), "");
    lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "type", "Tüüp"), helpWorkflowT(replyLang, "preview.offerTypeValue")));
    lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "title", "Pealkiri"), draft.title));
    lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "description", "Kirjeldus"), draft.description));
    lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "primaryCategory", "Põhikategooria"), draft.category));
    if (draft.secondaryCategories.length) lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "secondaryCategories", "Lisakategooriad"), draft.secondaryCategories.join(", ")));
    lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "municipality", "Omavalitsus"), state.municipalityLabel));
    lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "rawPlace", "Täpsem asukoht"), draft.rawPlace));
    lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "targetGroups", "Sihtrühm"), draft.targetGroups.join(", ")));
    lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "helpForm", "Abi vorm"), formatHelpTypeLabel(draft.helpType, replyLang)));
    if (draft.compensationDetails) lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "compensationInfo", "Tasu info"), draft.compensationDetails));
    lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "timeType", "Ajalisus"), formatTimeTypeLabel(draft.timeType, replyLang)));
    lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "availabilityOrStart", "Saadavus / algus"), draft.availabilityOrStart));
    lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "conditions", "Tingimused"), draft.providerScopeOrConditions));
    if (draft.skillsOrBackground) lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "skillsOrBackground", "Oskused või taust"), draft.skillsOrBackground));
    lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "contactPreference", "Kontaktiviis"), draft.contactPreference));
  } else {
    lines.push(helpWorkflowT(replyLang, "preview.requestTitle"), "");
    lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "type", "Tüüp"), helpWorkflowT(replyLang, "preview.requestTypeValue")));
    lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "title", "Pealkiri"), draft.title));
    lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "description", "Kirjeldus"), draft.description));
    lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "beneficiaryLabel", "Kellele abi vaja on"), draft.beneficiaryLabel));
    lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "primaryCategory", "Põhikategooria"), draft.category));
    if (draft.secondaryCategories.length) lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "secondaryCategories", "Lisakategooriad"), draft.secondaryCategories.join(", ")));
    lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "municipality", "Omavalitsus"), state.municipalityLabel));
    lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "rawPlace", "Täpsem asukoht"), draft.rawPlace));
    lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "targetGroups", "Sihtrühm"), draft.targetGroups.join(", ")));
    lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "helpForm", "Abi vorm"), formatHelpTypeLabel(draft.helpType, replyLang)));
    if (draft.compensationDetails) lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "compensationPreference", "Tasu eelistus"), draft.compensationDetails));
    lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "urgency", "Kiireloomulisus"), draft.urgency));
    lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "timeType", "Ajalisus"), formatTimeTypeLabel(draft.timeType, replyLang)));
    lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "availabilityForRequest", "Vajalik aeg / algus"), draft.availabilityOrStart));
    if (draft.conditions) lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "conditions", "Tingimused"), draft.conditions));
    lines.push(formatLabelledLine(helpWorkflowLabel(replyLang, "contactPreference", "Kontaktiviis"), draft.contactPreference));
  }
  lines.push("", helpWorkflowT(replyLang, "preview.savePrompt"));
  return lines.join("\n");
}

async function readHelpWorkflowState(convId, userId, prismaClient = prisma) {
  const conversationId = String(convId || "").trim();
  const ownerId = String(userId || "").trim();
  if (!conversationId || !ownerId) return null;

  const conversation = await prismaClient.conversation.findUnique({
    where: { id: conversationId },
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
    const nextState = normalizeHelpWorkflowState(message?.metadata?.workflow?.help || message?.metadata?.helpWorkflow || null);
    if (nextState) return nextState;
  }

  return null;
}

function buildWorkflowMetadata(state) {
  return {
    workflow: {
      help: state || null
    }
  };
}

function extractLocationCandidates(message = "") {
  const text = String(message || "").trim();
  if (!text) return [];

  const candidates = [];
  const municipalityMatch = text.match(MUNICIPALITY_PATTERN);
  if (municipalityMatch?.[1]) candidates.push(collapseWhitespace(municipalityMatch[1]));

  const prepMatch = text.match(LOCATION_PREPOSITION_PATTERN);
  if (prepMatch?.[1]) candidates.push(collapseWhitespace(prepMatch[1]));

  const aliasMatches = findLocationAliasMatches(text);
  for (const alias of aliasMatches) {
    candidates.push(alias.place);
  }

  const plainWords = text
    .replace(/[.,!?;:()"]/g, " ")
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  for (const token of plainWords) {
    if (token.length < 4) continue;
    if (/\b(eakatele|eakale|lapsele|emale|isale|vabatahtlik|tasuline|regulaarne|paindlik|paindlikult|lahiajal|lähiajal|uhekordselt|ühekordselt|telefoni|vestluse|kaudu|poes|kaimiseks)\b/i.test(token)) {
      continue;
    }
    if (/(s|l|le|lt|st|ga)$/i.test(token)) candidates.push(token.replace(/[.,!?;:]+$/g, ""));
  }

  return uniqueStrings(candidates);
}

async function resolveMunicipalityUpdate(message, state, prismaClient = prisma) {
  if (state?.municipalityCandidates?.length) {
    if (state.municipalityCandidates.length === 1 && isNegative(message)) {
      return {
        municipalityId: null,
        municipalityLabel: "",
        municipalityCandidates: [],
        rawPlace: ""
      };
    }

    if (state.municipalityCandidates.length === 1 && isAffirmative(message)) {
      const selected = state.municipalityCandidates[0];
      return {
        municipalityId: selected.id,
        municipalityLabel: selected.displayName,
        municipalityCandidates: [],
        rawPlace: state?.draft?.rawPlace || selected.displayName
      };
    }

    const selectionIndex = parseOrdinalSelection(message, state.municipalityCandidates.length);
    if (selectionIndex != null) {
      const selected = state.municipalityCandidates[selectionIndex];
      return {
        municipalityId: selected.id,
        municipalityLabel: selected.displayName,
        municipalityCandidates: [],
        rawPlace: state?.draft?.rawPlace || selected.displayName
      };
    }

    const normalizedMessage = normalizeText(message);
    const byName = state.municipalityCandidates.find((candidate) => normalizeText(candidate.displayName) === normalizedMessage);
    if (byName) {
      return {
        municipalityId: byName.id,
        municipalityLabel: byName.displayName,
        municipalityCandidates: [],
        rawPlace: state?.draft?.rawPlace || byName.displayName
      };
    }
  }

  const locationCandidates = extractLocationCandidates(message);
  for (const candidate of locationCandidates) {
    const normalizedPlace = await normalizePlaceToMunicipality({
      rawPlace: candidate,
      message: candidate
    }, {}, prismaClient);
    if (!normalizedPlace?.rawPlace && !normalizedPlace?.municipalityId && !normalizedPlace?.candidates?.length) {
      continue;
    }

    if (normalizedPlace.municipalityId && !municipalityGuessNeedsConfirmation(normalizedPlace)) {
      return {
        municipalityId: normalizedPlace.municipalityId,
        municipalityLabel: normalizedPlace.municipalityDisplayName || normalizedPlace.municipality?.displayName || "",
        municipalityCandidates: [],
        rawPlace: normalizedPlace.rawPlace || candidate
      };
    }
    if (municipalityGuessNeedsConfirmation(normalizedPlace)) {
      return {
        municipalityId: null,
        municipalityLabel: "",
        municipalityCandidates: (normalizedPlace.candidates || []).map((item) => ({
          id: item.id,
          displayName: item.displayName,
          county: item.county,
          type: item.type
        })),
        rawPlace: normalizedPlace.rawPlace || candidate
      };
    }
    if (normalizedPlace?.rawPlace) {
      return {
        municipalityId: null,
        municipalityLabel: "",
        municipalityCandidates: [],
        rawPlace: normalizedPlace.rawPlace
      };
    }
  }
  return null;
}

async function mergeDraftState(state, message, prismaClient = prisma) {
  const previousDraft = normalizeDraft(state?.draft || {});
  const municipalityUpdate = await resolveMunicipalityUpdate(message, state, prismaClient);
  let description = previousDraft.description;
  if (!description) {
    description = cleanNaturalDescription(message, state.intent);
  } else if (shouldAppendDescription(message, state)) {
    const addition = cleanNaturalDescription(message, state.intent);
    if (addition && !description.includes(addition)) {
      description = collapseWhitespace(`${description} ${addition}`);
    }
  }

  const draft = {
    ...previousDraft,
    description
  };

  const helpType = detectCompensationType(message);
  if (helpType) draft.helpType = helpType;

  const compensationDetails = detectCompensationDetails(message, helpType || draft.helpType);
  if (compensationDetails) draft.compensationDetails = compensationDetails;

  const timeType = detectTimeType(message);
  if (timeType) draft.timeType = timeType;

  const availabilityOrStart = detectAvailabilityOrStart(message);
  if (availabilityOrStart) draft.availabilityOrStart = availabilityOrStart;

  const contactPreference = detectContactPreference(message);
  if (contactPreference) draft.contactPreference = contactPreference;

  const beneficiaryLabel = detectBeneficiaryLabel(message);
  if (beneficiaryLabel) draft.beneficiaryLabel = beneficiaryLabel;

  const urgency = detectUrgency(message);
  if (urgency) draft.urgency = urgency;

  const providerScopeOrConditions = detectProviderScopeOrConditions(message);
  if (providerScopeOrConditions) draft.providerScopeOrConditions = providerScopeOrConditions;

  const conditions = detectConditions(message);
  if (conditions) draft.conditions = conditions;

  const skillsOrBackground = detectSkillsOrBackground(message);
  if (skillsOrBackground) draft.skillsOrBackground = skillsOrBackground;

  const categoryInfo = inferCategoryFromText(`${message} ${draft.description}`, draft.categoryCode);
  if (categoryInfo.confidence !== "low") {
    draft.categoryCode = categoryInfo.categoryCode;
    draft.category = categoryInfo.category;
  }

  const targetGroupInfo = inferTargetGroupsFromMessage(`${message} ${draft.description}`, draft.targetGroupCodes);
  if (targetGroupInfo.confidence !== "low") {
    draft.targetGroupCodes = targetGroupInfo.targetGroupCodes;
    draft.targetGroups = targetGroupInfo.targetGroups;
    draft.targetGroup = targetGroupInfo.targetGroups.join(", ");
  }

  const municipalityId = municipalityUpdate?.municipalityId ?? state.municipalityId;
  const municipalityLabel = municipalityUpdate?.municipalityLabel ?? state.municipalityLabel;
  const municipalityCandidates = municipalityUpdate?.municipalityCandidates ?? state.municipalityCandidates;
  if (municipalityUpdate?.rawPlace) {
    draft.rawPlace = municipalityUpdate.rawPlace;
  } else if (!draft.rawPlace && municipalityLabel) {
    draft.rawPlace = municipalityLabel;
  }
  draft.title = generateTitleFromDraft(draft, state.intent);
  draft.structuredSummary = generateStructuredSummary(draft, municipalityLabel, state.intent);

  return createHelpWorkflowDraftState({
    ...state,
    step: "collect_required_fields",
    flowLocked: true,
    municipalityId,
    municipalityLabel,
    municipalityCandidates,
    confirmationPending: false,
    sourceMessage: state.sourceMessage || message,
    draft
  });
}

async function saveStructuredRecord(state, userId, prismaClient = prisma) {
  const draft = normalizeDraft(state?.draft || {});
  const descriptionLines = [
    draft.description,
    state.intent === "create_help_request" && draft.beneficiaryLabel ? `Kellele abi vaja on: ${draft.beneficiaryLabel}` : "",
    state.intent === "create_help_request" && draft.urgency ? `Kiireloomulisus: ${draft.urgency}` : "",
    state.intent === "create_help_offer" && draft.providerScopeOrConditions ? `Tingimused: ${draft.providerScopeOrConditions}` : "",
    draft.category ? `Põhikategooria: ${draft.category}` : "",
    state.municipalityLabel ? `Omavalitsus: ${state.municipalityLabel}` : "",
    draft.rawPlace ? `Täpsem asukoht: ${draft.rawPlace}` : "",
    draft.targetGroups.length ? `Sihtrühm: ${draft.targetGroups.join(", ")}` : "",
    draft.helpType ? `Abi vorm: ${formatHelpTypeLabel(draft.helpType, "et")}` : "",
    draft.compensationDetails ? `Tasu info: ${draft.compensationDetails}` : "",
    draft.timeType ? `Ajalisus: ${formatTimeTypeLabel(draft.timeType, "et")}` : "",
    draft.availabilityOrStart ? `Saadavus / algus: ${draft.availabilityOrStart}` : "",
    draft.contactPreference ? `Kontaktiviis: ${draft.contactPreference}` : "",
    draft.conditions ? `Lisatingimused: ${draft.conditions}` : "",
    draft.skillsOrBackground ? `Oskused või taust: ${draft.skillsOrBackground}` : ""
  ].filter(Boolean);

  const sharedPayload = {
    userId,
    municipalityId: state.municipalityId,
    primaryCategoryCode: draft.categoryCode || undefined,
    category: draft.category,
    serviceLabel: draft.category || draft.title,
    title: draft.title || buildIntentTitle(state.intent),
    description: descriptionLines.join("\n"),
    structuredSummary: draft.structuredSummary || generateStructuredSummary(draft, state.municipalityLabel, state.intent),
    roleLabel: state.intent === "create_help_request"
      ? draft.beneficiaryLabel || draft.category
      : draft.providerScopeOrConditions || draft.category,
    helpType: draft.helpType || undefined,
    timeType: draft.timeType,
    targetGroupCodes: draft.targetGroupCodes,
    rawPlace: draft.rawPlace || undefined,
    classificationSource: "USER",
    userConfirmedAt: new Date().toISOString()
  };

  if (state.intent === "create_help_offer") {
    return createHelpOffer(sharedPayload, prismaClient);
  }

  return createHelpRequest(sharedPayload, prismaClient);
}

function resolveBrowseSelection(message, browseResults = []) {
  if (!browseResults.length) return null;
  if (browseResults.length === 1) return browseResults[0];

  const selectionIndex = parseOrdinalSelection(message, browseResults.length);
  if (selectionIndex != null) {
    return browseResults[selectionIndex] || null;
  }

  return null;
}

function isCreateHelpIntent(intent = "") {
  return intent === "create_help_request" || intent === "create_help_offer";
}

function isBrowseHelpIntent(intent = "") {
  return intent === "browse_help_offers" || intent === "browse_help_requests";
}

function isConnectHelpIntent(intent = "") {
  return intent === "connect_to_offer" || intent === "connect_to_request";
}

async function handleCreateTurn({ state, message, userId, replyLang, prismaClient }) {
  const switchIntent = explicitSwitchIntent(message, state.intent);
  if (switchIntent === "cancel") {
    return {
      handled: true,
      workflowState: null,
      reply: helpWorkflowT(replyLang, "create.cancelled"),
      cards: [],
      attachments: []
    };
  }
  if (switchIntent && switchIntent !== state.intent) {
    const nextState = createHelpWorkflowDraftState({
      intent: switchIntent,
      step: "intent_confirmation",
      flowLocked: false,
      sourceMessage: ""
    });
    return {
      handled: true,
      workflowState: nextState,
      reply: buildEntryConfirmationReply(switchIntent, replyLang),
      cards: [],
      attachments: []
    };
  }

  if (!state.flowLocked || state.step === "intent_confirmation") {
    if (isNegative(message)) {
      return {
        handled: true,
        workflowState: null,
        reply: helpWorkflowT(replyLang, "entry.cancelled"),
        cards: [],
        attachments: []
      };
    }

    if (!isAffirmative(message)) {
      return {
        handled: true,
        workflowState: state,
        reply: buildEntryConfirmationReply(state.intent, replyLang),
        cards: [],
        attachments: []
      };
    }

    const lockedState = createHelpWorkflowDraftState({
      ...state,
      flowLocked: true,
      step: "collect_required_fields",
      confirmationPending: false
    });
    const sourceMessage = collapseWhitespace(state.sourceMessage);
    if (!sourceMessage) {
      return {
        handled: true,
        workflowState: lockedState,
        reply: buildBroadPrompt(lockedState.intent, replyLang),
        cards: [],
        attachments: []
      };
    }

    const mergedFromSource = await mergeDraftState(lockedState, sourceMessage, prismaClient);
    const missingAfterSource = computeMissingFields(mergedFromSource);
    const changedAfterSource = changedFieldNames({}, mergedFromSource.draft);
    const preparedState = createHelpWorkflowDraftState({
      ...mergedFromSource,
      missingFields: missingAfterSource,
      step: missingAfterSource.length ? "collect_required_fields" : "preview",
      confirmationPending: missingAfterSource.length === 0
    });

    if (!missingAfterSource.length) {
      return {
        handled: true,
        workflowState: createHelpWorkflowDraftState({
          ...preparedState,
          step: "edit_or_save",
          confirmationPending: true
        }),
        reply: buildPreviewReply(preparedState, replyLang),
        cards: [],
        attachments: []
      };
    }

    return {
      handled: true,
      workflowState: preparedState,
      reply: [
        buildChangeReflection(preparedState, changedAfterSource, replyLang) || buildSummarySentence(preparedState, replyLang),
        buildFieldQuestion(preparedState, replyLang)
      ].filter(Boolean).join("\n\n"),
      cards: [],
      attachments: []
    };
  }

  if ((state.step === "preview" || state.step === "edit_or_save") && isAffirmative(message)) {
    const record = await saveStructuredRecord(state, userId, prismaClient);
    const nextState = createHelpWorkflowDraftState({
      ...state,
      mode: "saved",
      step: "saved",
      flowLocked: false,
      confirmationPending: false,
      municipalityId: record.municipalityId,
      municipalityLabel: record?.municipality?.displayName || state.municipalityLabel,
      linkedRequestId: state.intent === "create_help_request" ? record.id : state.linkedRequestId,
      linkedOfferId: state.intent === "create_help_offer" ? record.id : state.linkedOfferId,
      sourceRecordId: record.id,
      missingFields: []
    });
    const browseResult = await handleBrowseTurn({
      state: nextState,
      replyLang,
      prismaClient
    });
    const savedReply = buildSavedReply(nextState, record, replyLang, {
      includeNextStep: false
    });
    const browseReply = String(browseResult?.reply || "").trim();
    return {
      handled: true,
      workflowState: browseResult?.workflowState || nextState,
      reply: [savedReply, browseReply].filter(Boolean).join("\n\n"),
      cards: [],
      attachments: Array.isArray(browseResult?.attachments) ? browseResult.attachments : []
    };
  }

  if ((state.step === "preview" || state.step === "edit_or_save") && isNegative(message)) {
    return {
      handled: true,
      workflowState: createHelpWorkflowDraftState({
        ...state,
        step: "edit_or_save",
        confirmationPending: true
      }),
      reply: helpWorkflowT(replyLang, "preview.editPrompt"),
      cards: [],
      attachments: []
    };
  }

  const mergedState = await mergeDraftState(state, message, prismaClient);
  const missingFields = computeMissingFields(mergedState);
  const changedFields = changedFieldNames(state.draft || {}, mergedState.draft || {}).concat(
    state.municipalityLabel !== mergedState.municipalityLabel ? ["municipalityLabel"] : []
  );
  const nextState = createHelpWorkflowDraftState({
    ...mergedState,
    mode: "draft",
    missingFields,
    step: missingFields.length ? "collect_required_fields" : "preview",
    confirmationPending: missingFields.length === 0
  });

  if (missingFields.length) {
    return {
      handled: true,
      workflowState: nextState,
      reply: [
        buildChangeReflection(nextState, changedFields, replyLang) || (changedFields.length ? buildSummarySentence(nextState, replyLang) : ""),
        buildFieldQuestion(nextState, replyLang)
      ].filter(Boolean).join("\n\n"),
      cards: [],
      attachments: []
    };
  }

  return {
    handled: true,
    workflowState: createHelpWorkflowDraftState({
      ...nextState,
      step: "edit_or_save",
      confirmationPending: true,
      missingFields: []
    }),
    reply: buildPreviewReply(nextState, replyLang, {
      prefix: buildChangeReflection(nextState, changedFields, replyLang)
    }),
    cards: [],
    attachments: []
  };
}

async function handleBrowseTurn({ state, replyLang, prismaClient }) {
  const intent = state.intent === "create_help_offer" || state.intent === "browse_help_requests"
    ? "browse_help_requests"
    : "browse_help_offers";
  const sourceId = intent === "browse_help_offers" ? state.linkedRequestId || state.sourceRecordId : state.linkedOfferId || state.sourceRecordId;

  if (!sourceId) {
    return {
      handled: true,
      workflowState: state,
      reply: helpWorkflowT(replyLang, intent === "browse_help_offers" ? "browse.sourceMissingOffers" : "browse.sourceMissingRequests"),
      cards: [],
      attachments: []
    };
  }

  const rawResults = intent === "browse_help_offers"
    ? await listMatchingOffersForRequest(sourceId, { limit: 5 }, prismaClient)
    : await listMatchingRequestsForOffer(sourceId, { limit: 5 }, prismaClient);
  const results = rawResults.map((item) => ({
    ...item,
    listingView: toHelpListingView(item, { kind: item.kind, locale: replyLang })
  }));

  const nextState = createHelpWorkflowDraftState({
    ...state,
    mode: "browse",
    step: "browse",
    intent,
    sourceRecordId: sourceId,
    browseResults: results,
    confirmationPending: false
  });

  return {
      handled: true,
      workflowState: nextState,
      reply: buildBrowseReply(intent, results, replyLang),
      cards: [],
      attachments: []
    };
  }

async function handleConnectTurn({ state, message, replyLang, prismaClient }) {
  if (!state.browseResults?.length) {
    return {
      handled: true,
      workflowState: state,
      reply: helpWorkflowT(replyLang, "connect.needBrowse"),
      cards: [],
      attachments: []
    };
  }

  const selected = resolveBrowseSelection(message, state.browseResults);
  if (!selected) {
    return {
      handled: true,
      workflowState: state,
      reply: helpWorkflowT(replyLang, "connect.askWhich"),
      cards: [],
      attachments: []
    };
  }

  const requestId = selected.kind === "offer"
    ? state.linkedRequestId || state.sourceRecordId
    : selected.id;
  const offerId = selected.kind === "offer"
    ? selected.id
    : state.linkedOfferId || state.sourceRecordId;

  try {
    const match = await createHelpMatch({
      requestId,
      offerId
    }, prismaClient);

    const nextState = createHelpWorkflowDraftState({
      ...state,
      mode: "done",
      step: "connect",
      matchId: match.id,
      roomId: match.roomId,
      confirmationPending: false
    });

    return {
      handled: true,
      workflowState: nextState,
      reply: helpWorkflowT(replyLang, "connect.created"),
      cards: [],
      attachments: []
    };
  } catch (error) {
    return {
      handled: true,
      workflowState: state,
      reply: helpWorkflowT(replyLang, error?.code === "HELP_MATCH_ALREADY_ACTIVE" ? "connect.alreadyActive" : "connect.failed"),
      cards: [],
      attachments: []
    };
  }
}

export async function runHelpChatWorkflow(input = {}, prismaClient = prisma) {
  const message = String(input?.message || "").trim();
  const userId = String(input?.userId || "").trim();
  if (!message || !userId) return { handled: false };

  const replyLang = String(input?.replyLang || "et").trim();
  const currentState = normalizeHelpWorkflowState(input?.workflowState || null)
    || await readHelpWorkflowState(input?.convId, userId, prismaClient);
  const forcedIntentRaw = String(input?.forcedIntent || "").trim();
  const forcedIntent =
    forcedIntentRaw === "create_help_request" || forcedIntentRaw === "create_help_offer"
      ? forcedIntentRaw
      : null;
  const detectedIntent = forcedIntent || detectHelpChatIntent(message);

  if (!currentState) {
    if (!detectedIntent || detectedIntent === "service_guidance") {
      return {
        handled: false,
        workflowState: null
      };
    }

    if (!forcedIntent && isCreateHelpIntent(detectedIntent)) {
      const confirmationState = createHelpWorkflowDraftState({
        intent: detectedIntent,
        step: "intent_confirmation",
        flowLocked: false,
        sourceMessage: message
      });
      return {
        handled: true,
        workflowState: confirmationState,
        reply: buildEntryConfirmationReply(detectedIntent, replyLang),
        cards: [],
        attachments: []
      };
    }

    if (forcedIntent) {
      const lockedState = createHelpWorkflowDraftState({
        intent: forcedIntent,
        step: "collect_required_fields",
        flowLocked: true,
        sourceMessage: message
      });
      return handleCreateTurn({
        state: lockedState,
        message,
        userId,
        replyLang,
        prismaClient
      });
    }
  }

  if (detectedIntent === "service_guidance" && !currentState) {
    return {
      handled: false,
      workflowState: currentState
    };
  }

  if (!currentState && !forcedIntent && !detectedIntent) {
    return {
      handled: false,
      workflowState: currentState
    };
  }

  let state = currentState
    ? createHelpWorkflowDraftState(currentState)
    : createHelpWorkflowDraftState({
        intent: forcedIntent || detectedIntent,
        step: forcedIntent ? "collect_required_fields" : "intent_confirmation",
        flowLocked: forcedIntent != null,
        sourceMessage: message
      });

  if (!forcedIntent && isBrowseHelpIntent(detectedIntent)) {
    state = createHelpWorkflowDraftState({
      ...state,
      intent: detectedIntent,
      mode: "browse",
      step: "browse",
      confirmationPending: false
    });
  } else if (!forcedIntent && isConnectHelpIntent(detectedIntent)) {
    state = createHelpWorkflowDraftState({
      ...state,
      intent: detectedIntent,
      step: "connect",
      confirmationPending: false
    });
  } else if (
    !forcedIntent
    && (state.mode === "saved" || state.mode === "done")
    && isCreateHelpIntent(detectedIntent)
  ) {
    const confirmationState = createHelpWorkflowDraftState({
      intent: detectedIntent,
      step: "intent_confirmation",
      flowLocked: false,
      sourceMessage: message
    });
    return {
      handled: true,
      workflowState: confirmationState,
      reply: buildEntryConfirmationReply(detectedIntent, replyLang),
      cards: [],
      attachments: []
    };
  }

  if (isBrowseHelpIntent(state.intent)) {
    return handleBrowseTurn({
      state,
      replyLang,
      prismaClient
    });
  }

  if (isConnectHelpIntent(state.intent)) {
    return handleConnectTurn({
      state,
      message,
      replyLang,
      prismaClient
    });
  }

  if (!isActiveHelpWorkflowState(state) && !state.flowLocked && !forcedIntent) {
    return {
      handled: false,
      workflowState: state
    };
  }

  return handleCreateTurn({
    state,
    message,
    userId,
    replyLang,
    prismaClient
  });
}

export function buildHelpWorkflowMetadata(state) {
  return buildWorkflowMetadata(state);
}

export async function getHelpWorkflowState(convId, userId, prismaClient = prisma) {
  return readHelpWorkflowState(convId, userId, prismaClient);
}
