// /lib/career-agent/adapters/careerTurnInputAdapter.js

import {
  normalizeCareerProfile,
  mergeProfilePatch,
  applyComputedSupportNeed,
} from "../profile/careerProfile.helpers.js";
import { PROFILE_SOURCES } from "../profile/careerProfile.schema.js";
import { getCareerAdapterText } from "../careerText.js";

function coerceString(value) {
  const normalized = String(value || "").trim();
  return normalized || null;
}

function resolveLocaleCode(...candidates) {
  for (const candidate of candidates) {
    const value = coerceString(candidate);
    if (!value) continue;

    const shortLocale = value.toLowerCase().split(/[-_]/)[0];
    if (shortLocale === "et" || shortLocale === "en" || shortLocale === "ru") {
      return shortLocale;
    }
  }

  return "et";
}

function getAdapterText(payload = {}) {
  return getCareerAdapterText(
    resolveLocaleCode(payload.locale, payload.language, payload.documentLanguage)
  );
}

function coerceBoolean(value, fallback = false) {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
}

function toSafeArray(value) {
  return Array.isArray(value) ? value : [];
}

function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    !(value instanceof Date)
  );
}

function deepClone(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

function cloneSerializableObject(value) {
  if (!isPlainObject(value)) return {};

  const entries = Object.entries(value).filter(([, entryValue]) => {
    return typeof entryValue !== "function";
  });

  return deepClone(Object.fromEntries(entries));
}

function getLastUserMessageFromMessages(messages = []) {
  const safeMessages = toSafeArray(messages);

  for (let index = safeMessages.length - 1; index >= 0; index -= 1) {
    const message = safeMessages[index];
    if (!message || typeof message !== "object") continue;

    const role = coerceString(message.role || message.sender || message.author);
    if (role !== "user") continue;

    const content =
      coerceString(message.content) ||
      coerceString(message.text) ||
      coerceString(message.message);

    if (content) return content;
  }

  return null;
}

function buildRuntimeFromPayload(payload = {}) {
  const runtime = isPlainObject(payload.runtime) ? deepClone(payload.runtime) : {};

  const topLevelUserMessage =
    coerceString(payload.userMessage) ||
    coerceString(payload.message) ||
    coerceString(payload.text) ||
    coerceString(payload.input) ||
    coerceString(payload.freeText);

  const conversationUserMessage = getLastUserMessageFromMessages(payload.messages);

  const userMessage = topLevelUserMessage || conversationUserMessage || null;

  return {
    ...runtime,
    userMessage: runtime.userMessage || userMessage || null,
    lastUserMessage: runtime.lastUserMessage || userMessage || null,
    latestUserText: runtime.latestUserText || userMessage || null,
    freeText: runtime.freeText || coerceString(payload.freeText) || null,
  };
}

function buildDocumentSection(payload = {}) {
  const documentObject = isPlainObject(payload.document) ? payload.document : {};
  const documentInput =
    isPlainObject(payload.documentInput)
      ? payload.documentInput
      : isPlainObject(documentObject.input)
      ? documentObject.input
      : {};

  const documentFlow =
    coerceString(payload.documentFlow) ||
    coerceString(documentObject.flow) ||
    null;

  const generateDocumentNow =
    coerceBoolean(payload.generateDocumentNow, false) ||
    coerceBoolean(documentObject.generateNow, false) ||
    coerceBoolean(documentObject.generateDocumentNow, false);

  return {
    documentInput: deepClone(documentInput),
    documentFlow,
    generateDocumentNow,
  };
}

function buildOpportunitySection(payload = {}) {
  const opportunities =
    toSafeArray(payload.opportunities).length > 0
      ? payload.opportunities
      : toSafeArray(payload.jobs).length > 0
      ? payload.jobs
      : toSafeArray(payload.optionCandidates).length > 0
      ? payload.optionCandidates
      : [];

  const directionCandidates =
    toSafeArray(payload.directionCandidates).length > 0
      ? payload.directionCandidates
      : toSafeArray(payload.directions).length > 0
      ? payload.directions
      : [];

  return {
    opportunities: deepClone(toSafeArray(opportunities)),
    directionCandidates: deepClone(toSafeArray(directionCandidates)),
  };
}

function inferPatchSource(payload = {}) {
  const explicit =
    coerceString(payload.profilePatchSource) ||
    coerceString(payload.patchSource) ||
    null;

  if (explicit) return explicit;

  if (payload.cvProfilePatch || payload.parserProfilePatch || payload.parsedCvProfilePatch) {
    return PROFILE_SOURCES.FROM_CV;
  }

  return PROFILE_SOURCES.FROM_USER;
}

function extractCanonicalProfilePatch(payload = {}) {
  const directPatch =
    (isPlainObject(payload.profilePatch) && payload.profilePatch) ||
    (isPlainObject(payload.cvProfilePatch) && payload.cvProfilePatch) ||
    (isPlainObject(payload.parserProfilePatch) && payload.parserProfilePatch) ||
    (isPlainObject(payload.parsedCvProfilePatch) && payload.parsedCvProfilePatch) ||
    null;

  return directPatch ? deepClone(directPatch) : null;
}

function buildProfile(payload = {}) {
  const rawProfile =
    (isPlainObject(payload.profile) && payload.profile) ||
    (isPlainObject(payload.currentProfile) && payload.currentProfile) ||
    {};

  let profile = normalizeCareerProfile(rawProfile);

  const canonicalPatch = extractCanonicalProfilePatch(payload);
  if (canonicalPatch) {
    profile = mergeProfilePatch(profile, canonicalPatch, {
      defaultSource: inferPatchSource(payload),
    });
  }

  profile = applyComputedSupportNeed(profile);
  return profile;
}

function buildOptions(payload = {}) {
  const sourceOptions = isPlainObject(payload.options) ? payload.options : {};
  const rawOptions = cloneSerializableObject(sourceOptions);

  if (typeof sourceOptions.aiProfileExtractor === "function") {
    rawOptions.aiProfileExtractor = sourceOptions.aiProfileExtractor;
  }

  return {
    ...rawOptions,
    useOska:
      rawOptions.useOska !== undefined
        ? coerceBoolean(rawOptions.useOska, true)
        : payload.useOska !== undefined
        ? coerceBoolean(payload.useOska, true)
        : true,

    includeMatchingDebug:
      rawOptions.includeMatchingDebug !== undefined
        ? coerceBoolean(rawOptions.includeMatchingDebug, false)
        : coerceBoolean(payload.includeMatchingDebug, false),

    documentLanguage:
      rawOptions.documentLanguage ||
      coerceString(payload.documentLanguage) ||
      null,

    forceRefreshTaxonomy:
      rawOptions.forceRefreshTaxonomy !== undefined
        ? coerceBoolean(rawOptions.forceRefreshTaxonomy, false)
        : coerceBoolean(payload.forceRefreshTaxonomy, false),

    allowStaleTaxonomyOnError:
      rawOptions.allowStaleTaxonomyOnError !== undefined
        ? coerceBoolean(rawOptions.allowStaleTaxonomyOnError, true)
        : payload.allowStaleTaxonomyOnError !== undefined
        ? coerceBoolean(payload.allowStaleTaxonomyOnError, true)
        : true,
  };
}

function buildWarnings(payload = {}) {
  const warnings = [];
  const text = getAdapterText(payload);

  if (
    payload.cvParseResult &&
    !payload.profilePatch &&
    !payload.cvProfilePatch &&
    !payload.parserProfilePatch &&
    !payload.parsedCvProfilePatch
  ) {
    warnings.push(text.warnings.canonicalPatchMissing);
  }

  return warnings;
}

export function adaptCareerTurnInput(payload = {}) {
  if (!isPlainObject(payload)) {
    throw new Error(getAdapterText(payload).errors.turnPayloadMustBeObject);
  }

  const profile = buildProfile(payload);
  const runtime = buildRuntimeFromPayload(payload);
  const { opportunities, directionCandidates } = buildOpportunitySection(payload);
  const { documentInput, documentFlow, generateDocumentNow } = buildDocumentSection(payload);
  const options = buildOptions(payload);
  const profilePatch = extractCanonicalProfilePatch(payload);
  const profilePatchSource = inferPatchSource(payload);
  const warnings = buildWarnings(payload);

  return {
    profile,
    runtime,
    opportunities,
    directionCandidates,
    documentInput,
    documentFlow,
    generateDocumentNow,
    options: {
      ...options,
      profilePatch,
      profilePatchSource,
    },
    warnings,
  };
}

export function adaptCareerQuestionAnswerInput(payload = {}) {
  if (!isPlainObject(payload)) {
    throw new Error(getAdapterText(payload).errors.questionAnswerPayloadMustBeObject);
  }

  const profile = buildProfile(payload);
  const runtime = buildRuntimeFromPayload(payload);

  const questionId =
    coerceString(payload.questionId) ||
    coerceString(payload.id);

  if (!questionId) {
    throw new Error(getAdapterText(payload).errors.questionAnswerRequiresQuestionId);
  }

  const hasAnswerField = Object.prototype.hasOwnProperty.call(payload, "answer");
  const answer = hasAnswerField ? payload.answer : payload.value;

  return {
    profile,
    runtime,
    questionId,
    answer,
    source:
      coerceString(payload.source) ||
      inferPatchSource(payload),
    confirmed:
      payload.confirmed !== undefined
        ? coerceBoolean(payload.confirmed, true)
        : true,
    options: buildOptions(payload),
  };
}

export function adaptCareerRunRequest(payload = {}) {
  return adaptCareerTurnInput(payload);
}

export function adaptCareerApplyAnswerRequest(payload = {}) {
  return adaptCareerQuestionAnswerInput(payload);
}

export function buildCareerRuntimeFlagsPreview(payload = {}) {
  const runtime = buildRuntimeFromPayload(payload);
  const { opportunities } = buildOpportunitySection(payload);
  const documentObject = isPlainObject(payload.document) ? payload.document : {};
  const documentInput =
    isPlainObject(payload.documentInput)
      ? payload.documentInput
      : isPlainObject(documentObject.input)
      ? documentObject.input
      : {};

  const documentFlow =
    coerceString(payload.documentFlow) ||
    coerceString(documentObject.flow) ||
    null;

  return {
    hasUserMessage: Boolean(
      runtime.userMessage ||
        runtime.lastUserMessage ||
        runtime.latestUserText ||
        runtime.freeText
    ),
    hasOpportunities: opportunities.length > 0,
    hasDocumentFlow: Boolean(documentFlow),
    hasDocumentInput:
      documentInput && typeof documentInput === "object"
        ? Object.keys(documentInput).length > 0
        : false,
  };
}
