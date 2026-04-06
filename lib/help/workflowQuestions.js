import { helpWorkflowT } from "./chatWorkflowText.js";

const SHARED_REQUIRED_FIELD_ORDER = Object.freeze([
  "description",
  "categoryCode",
  "rawPlace",
  "timing",
  "helpCompensation"
]);

const HELP_REQUEST_REQUIRED_FIELD_ORDER = Object.freeze([
  "beneficiaryContext"
]);

const HELP_OFFER_REQUIRED_FIELD_ORDER = Object.freeze([
  "targetGroupCodes"
]);

const REQUEST_ENRICHMENT_PROMPT_KEYS = Object.freeze({
  TRANSPORT: "questions.request.detailsTransport",
  DAILY_TASKS: "questions.request.detailsDailyTasks",
  HOME_HELP: "questions.request.detailsHomeHelp",
  DIGITAL_HELP: "questions.request.detailsDigitalHelp",
  CARE_SUPPORT: "questions.request.detailsCareSupport",
  CHILD_YOUTH_SUPPORT: "questions.request.detailsChildYouthSupport",
  LEARNING_GUIDANCE: "questions.request.detailsLearningGuidance",
  SOCIAL_SUPPORT: "questions.request.detailsSocialSupport",
  ADMIN_FORM_HELP: "questions.request.detailsAdminFormHelp",
  OTHER: "questions.request.detailsOther"
});

const OFFER_ENRICHMENT_PROMPT_KEYS = Object.freeze({
  TRANSPORT: "questions.offer.detailsTransport",
  DAILY_TASKS: "questions.offer.detailsDailyTasks",
  HOME_HELP: "questions.offer.detailsHomeHelp",
  DIGITAL_HELP: "questions.offer.detailsDigitalHelp",
  CARE_SUPPORT: "questions.offer.detailsCareSupport",
  CHILD_YOUTH_SUPPORT: "questions.offer.detailsChildYouthSupport",
  LEARNING_GUIDANCE: "questions.offer.detailsLearningGuidance",
  SOCIAL_SUPPORT: "questions.offer.detailsSocialSupport",
  ADMIN_FORM_HELP: "questions.offer.detailsAdminFormHelp",
  OTHER: "questions.offer.detailsOther"
});

function formatMunicipalityCandidateList(candidates = []) {
  return candidates
    .map((candidate, index) => `${index + 1}. ${candidate.displayName}${candidate.county ? ` (${candidate.county})` : ""}`)
    .join("\n");
}

function hasTargetAudienceSignal(draft = {}) {
  return Boolean(
    String(draft?.targetGroup || "").trim()
    || (Array.isArray(draft?.targetGroups) && draft.targetGroups.length)
    || (Array.isArray(draft?.targetGroupCodes) && draft.targetGroupCodes.length)
  );
}

function needsCompensationDetails(draft = {}) {
  return draft?.helpType === "PAID" || draft?.helpType === "MIXED";
}

function hasRequestTimingInfo(draft = {}) {
  return Boolean(draft?.availabilityOrStart && draft?.timeType && draft?.urgency);
}

function hasOfferTimingInfo(draft = {}) {
  return Boolean(draft?.availabilityOrStart && draft?.timeType);
}

function isSparseDescription(text = "") {
  const normalized = String(text || "").trim();
  if (!normalized) return true;
  const words = normalized.split(/\s+/).filter(Boolean).length;
  return normalized.length < 40 || words < 6;
}

function getEnrichmentKey(intent = "", categoryCode = "") {
  const normalizedCategory = String(categoryCode || "").trim().toUpperCase();
  if (!normalizedCategory) return "";
  return `${intent}:${normalizedCategory}`;
}

function getEnrichmentPromptKey(intent = "", categoryCode = "") {
  const normalizedCategory = String(categoryCode || "").trim().toUpperCase();
  if (!normalizedCategory) return "";
  const source = intent === "create_help_offer" ? OFFER_ENRICHMENT_PROMPT_KEYS : REQUEST_ENRICHMENT_PROMPT_KEYS;
  return source[normalizedCategory] || "";
}

export function buildEntryConfirmationReply(intent, replyLang) {
  const confirmKey = intent === "create_help_offer" ? "entry.helpOffer" : "entry.helpRequest";
  return [
    helpWorkflowT(replyLang, confirmKey),
    helpWorkflowT(replyLang, "entry.reprompt")
  ].join("\n");
}

export function buildBroadPrompt(intent, replyLang) {
  return helpWorkflowT(
    replyLang,
    intent === "create_help_offer" ? "questions.offer.describe" : "questions.request.describe"
  );
}

export function createHelpQuestionFlow({ normalizeDraft, inferCategoryFromText }) {
  function computeMissingFields(state) {
    const draft = normalizeDraft(state?.draft || {});
    const required = [...SHARED_REQUIRED_FIELD_ORDER];
    if (state.intent === "create_help_request") required.push(...HELP_REQUEST_REQUIRED_FIELD_ORDER);
    if (state.intent === "create_help_offer") required.push(...HELP_OFFER_REQUIRED_FIELD_ORDER);

    return required.filter((field) => {
      if (field === "description") return !draft.description;
      if (field === "categoryCode") return !draft.categoryCode;
      if (field === "beneficiaryContext") return !draft.beneficiaryLabel;
      if (field === "targetGroupCodes") return !hasTargetAudienceSignal(draft);
      if (field === "rawPlace") return !draft.rawPlace;
      if (field === "timing") {
        return state.intent === "create_help_request"
          ? !hasRequestTimingInfo(draft)
          : !hasOfferTimingInfo(draft);
      }
      if (field === "helpCompensation") {
        return !draft.helpType || (needsCompensationDetails(draft) && !draft.compensationDetails);
      }
      return !draft[field];
    });
  }

  function nextMissingField(state) {
    if (state?.municipalityCandidates?.length) return "municipality_confirmation";
    const missing = computeMissingFields(state);
    const ordered = state.intent === "create_help_request"
      ? [
          "description",
          "categoryCode",
          "beneficiaryContext",
          "rawPlace",
          "timing",
          "helpCompensation"
        ]
      : [
          "description",
          "categoryCode",
          "targetGroupCodes",
          "rawPlace",
          "timing",
          "helpCompensation"
        ];
    for (const field of ordered) {
      if (missing.includes(field)) return field;
    }
    return missing[0] || null;
  }

  function buildBasicQuestion(state, replyLang, missingField) {
    if (missingField === "municipality_confirmation") {
      if (state.municipalityCandidates.length === 1) {
        const candidate = state.municipalityCandidates[0];
        return {
          layer: "basic",
          key: "municipality_confirmation",
          prompt: helpWorkflowT(replyLang, "questions.location.confirmSingle", {
            municipality: candidate.displayName
          })
        };
      }

      return {
        layer: "basic",
        key: "municipality_confirmation",
        prompt: [
          helpWorkflowT(replyLang, "questions.location.confirmMany"),
          "",
          formatMunicipalityCandidateList(state.municipalityCandidates),
          "",
          helpWorkflowT(replyLang, "questions.location.confirmManyHint")
        ].join("\n")
      };
    }

    const questions = {
      description: buildBroadPrompt(state.intent, replyLang),
      categoryCode: helpWorkflowT(replyLang, "questions.shared.category"),
      beneficiaryContext: helpWorkflowT(replyLang, "questions.request.beneficiaryContext"),
      targetGroupCodes: helpWorkflowT(replyLang, "questions.offer.targetGroup"),
      rawPlace: helpWorkflowT(replyLang, state.intent === "create_help_offer" ? "questions.offer.rawPlace" : "questions.request.rawPlace"),
      timing: helpWorkflowT(replyLang, state.intent === "create_help_offer" ? "questions.offer.timing" : "questions.request.timing"),
      helpCompensation: helpWorkflowT(replyLang, state.intent === "create_help_offer" ? "questions.offer.helpCompensation" : "questions.request.helpCompensation")
    };

    if (!questions[missingField]) return null;
    return {
      layer: "basic",
      key: missingField,
      prompt: questions[missingField]
    };
  }

  function buildEnrichmentQuestion(state, replyLang) {
    if (state?.municipalityCandidates?.length) return null;
    const draft = normalizeDraft(state?.draft || {});
    const inferredCategory = inferCategoryFromText(draft.description || "", draft.categoryCode || "");
    const categoryCode = String(inferredCategory?.categoryCode || draft.categoryCode || "").trim().toUpperCase();
    if (!categoryCode) return null;
    if (!isSparseDescription(draft.description)) return null;

    const enrichmentKey = getEnrichmentKey(state.intent, categoryCode);
    if (!enrichmentKey) return null;
    if (Array.isArray(state?.askedEnrichmentKeys) && state.askedEnrichmentKeys.includes(enrichmentKey)) return null;

    const promptKey = getEnrichmentPromptKey(state.intent, categoryCode);
    if (!promptKey) return null;

    return {
      layer: "enrichment",
      key: enrichmentKey,
      prompt: helpWorkflowT(replyLang, promptKey)
    };
  }

  function getNextQuestion(state, replyLang) {
    const missingField = nextMissingField(state);
    if (missingField) return buildBasicQuestion(state, replyLang, missingField);
    return buildEnrichmentQuestion(state, replyLang);
  }

  function buildFieldQuestion(state, replyLang) {
    return getNextQuestion(state, replyLang)?.prompt || "";
  }

  return {
    buildFieldQuestion,
    computeMissingFields,
    getNextQuestion,
    nextMissingField
  };
}
