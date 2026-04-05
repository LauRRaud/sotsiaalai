import { helpWorkflowT } from "./chatWorkflowText.js";

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

function formatMunicipalityCandidateList(candidates = []) {
  return candidates
    .map((candidate, index) => `${index + 1}. ${candidate.displayName}${candidate.county ? ` (${candidate.county})` : ""}`)
    .join("\n");
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
          "categoryCode",
          "urgency",
          "helpType",
          "compensationDetails",
          "timeType",
          "availabilityOrStart",
          "contactPreference",
          "targetGroupCodes",
          "title"
        ]
      : [
          "description",
          "rawPlace",
          "municipalityId",
          "categoryCode",
          "helpType",
          "compensationDetails",
          "timeType",
          "availabilityOrStart",
          "providerScopeOrConditions",
          "contactPreference",
          "targetGroupCodes",
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

    const inferredCategory = inferCategoryFromText(state?.draft?.description || "", state?.draft?.categoryCode || "");
    const categoryCode = String(inferredCategory?.categoryCode || state?.draft?.categoryCode || "").trim().toUpperCase();

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

    if (missingField === "categoryCode") {
      return helpWorkflowT(replyLang, "questions.shared.category");
    }

    if (missingField === "rawPlace" && categoryCode === "TRANSPORT") {
      return helpWorkflowT(replyLang, state.intent === "create_help_offer"
        ? "questions.offer.rawPlaceTransport"
        : "questions.request.rawPlaceTransport");
    }

    if (missingField === "providerScopeOrConditions" && state.intent === "create_help_offer") {
      if (categoryCode === "TRANSPORT") return helpWorkflowT(replyLang, "questions.offer.scopeTransport");
      if (categoryCode === "DIGITAL_HELP") return helpWorkflowT(replyLang, "questions.offer.scopeDigital");
      if (categoryCode === "ADMIN_FORM_HELP") return helpWorkflowT(replyLang, "questions.offer.scopeAdmin");
      if (categoryCode === "HOME_HELP") return helpWorkflowT(replyLang, "questions.offer.scopeHome");
    }

    if (missingField === "availabilityOrStart" && state.intent === "create_help_request") {
      if (categoryCode === "TRANSPORT") return helpWorkflowT(replyLang, "questions.request.availabilityTransport");
      if (categoryCode === "DIGITAL_HELP") return helpWorkflowT(replyLang, "questions.request.availabilityDigital");
      if (categoryCode === "ADMIN_FORM_HELP") return helpWorkflowT(replyLang, "questions.request.availabilityAdmin");
    }

    return questions[missingField] || buildBroadPrompt(state.intent, replyLang);
  }

  return {
    buildFieldQuestion,
    computeMissingFields,
    nextMissingField
  };
}
