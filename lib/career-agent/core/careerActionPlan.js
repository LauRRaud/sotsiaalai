// /lib/career-agent/core/careerActionPlan.js

import {
  computeSupportNeed,
  getMetaValue,
  getMetaStatus,
  getListItems,
  getListStatus,
  hasMeaningfulValue,
} from "../profile/careerProfile.helpers.js";
import {
  GOAL_TYPES,
  NEXT_STEP_TYPES,
  PROFILE_STATUS,
  SUPPORT_LEVELS,
  RECOMMENDED_MODES,
} from "../profile/careerProfile.schema.js";
import { getCareerActionPlanText } from "../careerText.js";

export const ACTION_STEP_STATUS = Object.freeze({
  READY: "ready",
  NEEDS_INFO: "needs_info",
  RECOMMENDED: "recommended",
});

export const ACTION_STEP_TYPES = Object.freeze({
  ...NEXT_STEP_TYPES,
  CLARIFY_PROFILE: "clarify_profile",
  CLARIFY_DIRECTION: "clarify_direction",
});

function toSafeArray(value) {
  return Array.isArray(value) ? value : [];
}

function getActionPlanLocaleText(options = {}) {
  const locale =
    options.locale || options.documentLanguage || options.language || "et";
  return getCareerActionPlanText(locale);
}

function formatTemplate(template, replacements = {}) {
  return String(template || "").replace(/\{(\w+)\}/g, (match, key) => {
    const value = replacements[key];
    return value === undefined || value === null ? match : String(value);
  });
}

function uniqueStrings(values = []) {
  return Array.from(new Set(values.filter(Boolean)));
}

function compactList(values = []) {
  return values.filter((value) => hasMeaningfulValue(value));
}

function getDirectionTitleValue(item) {
  if (typeof item === "string") return item;

  const title = getMetaValue(item?.title);
  if (hasMeaningfulValue(title)) return title;

  const label = getMetaValue(item?.label);
  if (hasMeaningfulValue(label)) return label;

  if (hasMeaningfulValue(item?.label)) return item.label;

  return null;
}

function topDirectionTitles(profile) {
  return getListItems(profile?.directions?.immediateTargets, [])
    .map((item) => getDirectionTitleValue(item))
    .filter(Boolean);
}

function topMissingInformation(profile) {
  return getListItems(profile?.recommendationContext?.missingInformation, []).filter(Boolean);
}

function hasConfirmedListContent(field) {
  return (
    getListStatus(field) === PROFILE_STATUS.CONFIRMED &&
    getListItems(field, []).length > 0
  );
}

function hasCvSignals(profile) {
  return (
    hasConfirmedListContent(profile?.experience?.roles) ||
    hasConfirmedListContent(profile?.education?.completed) ||
    hasConfirmedListContent(profile?.skills?.domainSkills) ||
    hasConfirmedListContent(profile?.skills?.transferableSkills)
  );
}

function hasDirectionSignals(profile) {
  return (
    hasConfirmedListContent(profile?.directions?.immediateTargets) ||
    hasConfirmedListContent(profile?.directions?.nearTargets) ||
    hasConfirmedListContent(profile?.directions?.educationPaths)
  );
}

function canSuggestDocumentFlow(profile) {
  return (
    getMetaStatus(profile?.consent?.documentGenerationApproved) ===
      PROFILE_STATUS.CONFIRMED &&
    getMetaValue(profile?.consent?.documentGenerationApproved) === true
  );
}

function getTopOpportunity(options = {}) {
  const ranked = toSafeArray(options?.rankedOpportunities);
  return ranked.length ? ranked[0] : null;
}

function choosePrimaryActionType(profile, supportNeed) {
  const preferredNextStep = getMetaValue(profile?.goals?.preferredNextStep);
  if (preferredNextStep) return preferredNextStep;

  const primaryGoal = getMetaValue(profile?.goals?.primaryGoal);

  if (supportNeed.recommendedMode === RECOMMENDED_MODES.HANDOFF) {
    return ACTION_STEP_TYPES.REQUEST_SUPPORT;
  }

  switch (primaryGoal) {
    case GOAL_TYPES.GET_JOB:
      return hasCvSignals(profile)
        ? ACTION_STEP_TYPES.APPLY_NOW
        : ACTION_STEP_TYPES.BUILD_CV;

    case GOAL_TYPES.CHANGE_CAREER:
      return hasDirectionSignals(profile)
        ? ACTION_STEP_TYPES.COMPARE_OPTIONS
        : ACTION_STEP_TYPES.CLARIFY_DIRECTION;

    case GOAL_TYPES.CHOOSE_EDUCATION:
      return ACTION_STEP_TYPES.EXPLORE_LEARNING;

    case GOAL_TYPES.RESKILL:
      return ACTION_STEP_TYPES.EXPLORE_LEARNING;

    case GOAL_TYPES.GAIN_CLARITY:
      return hasDirectionSignals(profile)
        ? ACTION_STEP_TYPES.COMPARE_OPTIONS
        : ACTION_STEP_TYPES.CLARIFY_DIRECTION;

    default:
      return hasDirectionSignals(profile)
        ? ACTION_STEP_TYPES.COMPARE_OPTIONS
        : ACTION_STEP_TYPES.CLARIFY_PROFILE;
  }
}

function createActionStep(input) {
  return {
    id: input.id,
    type: input.type,
    title: input.title,
    description: input.description,
    rationale: uniqueStrings(input.rationale || []),
    priority: Number.isFinite(input.priority) ? input.priority : 50,
    status: input.status || ACTION_STEP_STATUS.RECOMMENDED,
    documentSuggestion: input.documentSuggestion || null,
    relatedOpportunity: input.relatedOpportunity || null,
  };
}

function buildClarifyProfileStep(profile, options = {}) {
  const text = getActionPlanLocaleText(options);
  const missing = topMissingInformation(profile).slice(0, 4);
  const hasMissing = missing.length > 0;

  return createActionStep({
    id: "clarify-profile",
    type: ACTION_STEP_TYPES.CLARIFY_PROFILE,
    title: text.clarifyProfile.title,
    description: hasMissing
      ? formatTemplate(text.clarifyProfile.descriptionWithMissing, {
          missing: missing.join(", "),
        })
      : text.clarifyProfile.descriptionFallback,
    rationale: text.clarifyProfile.rationale,
    priority: 20,
    status: ACTION_STEP_STATUS.NEEDS_INFO,
  });
}

function buildClarifyDirectionStep(options = {}) {
  const text = getActionPlanLocaleText(options);
  return createActionStep({
    id: "clarify-direction",
    type: ACTION_STEP_TYPES.CLARIFY_DIRECTION,
    title: text.clarifyDirection.title,
    description: text.clarifyDirection.description,
    rationale: text.clarifyDirection.rationale,
    priority: 25,
    status: ACTION_STEP_STATUS.NEEDS_INFO,
  });
}

function buildBuildCvStep(profile, options = {}) {
  const text = getActionPlanLocaleText(options);
  const hasSignals = hasCvSignals(profile);
  const documentSuggestion = canSuggestDocumentFlow(profile)
    ? {
        flow: "CV_BUILD",
        reason: text.buildCv.documentReason,
      }
    : null;

  return createActionStep({
    id: "build-cv",
    type: ACTION_STEP_TYPES.BUILD_CV,
    title: hasSignals ? text.buildCv.titleWithSignals : text.buildCv.titleWithoutSignals,
    description: hasSignals
      ? text.buildCv.descriptionWithSignals
      : text.buildCv.descriptionWithoutSignals,
    rationale: text.buildCv.rationale,
    priority: 10,
    status: ACTION_STEP_STATUS.READY,
    documentSuggestion,
  });
}

function buildApplyNowStep(profile, options = {}) {
  const text = getActionPlanLocaleText(options);
  const topOpportunity = getTopOpportunity(options);

  if (!hasCvSignals(profile)) {
    return buildBuildCvStep(profile, options);
  }

  const titleSuffix = topOpportunity?.opportunity?.title
    ? `${text.applyNow.titleSuffixSeparator}${topOpportunity.opportunity.title}`
    : "";
  const documentSuggestion = canSuggestDocumentFlow(profile)
    ? {
        flow: "CV_TAILOR",
        reason: text.applyNow.documentReason,
      }
    : null;

  return createActionStep({
    id: "apply-now",
    type: ACTION_STEP_TYPES.APPLY_NOW,
    title: `${text.applyNow.title}${titleSuffix}`,
    description: topOpportunity?.opportunity?.title
      ? formatTemplate(text.applyNow.descriptionWithOpportunity, {
          title: topOpportunity.opportunity.title,
        })
      : text.applyNow.descriptionFallback,
    rationale: compactList([
      topOpportunity?.fitLabel
        ? formatTemplate(text.applyNow.rationaleFitLabel, {
            fitLabel: topOpportunity.fitLabel,
          })
        : null,
      ...(topOpportunity?.whyItFits || []),
    ]),
    priority: 10,
    status: ACTION_STEP_STATUS.READY,
    relatedOpportunity: topOpportunity?.opportunity || null,
    documentSuggestion,
  });
}

function buildCompareOptionsStep(profile, options = {}) {
  const text = getActionPlanLocaleText(options);
  const directions = topDirectionTitles(profile).slice(0, 3);
  const topOpportunity = getTopOpportunity(options);

  return createActionStep({
    id: "compare-options",
    type: ACTION_STEP_TYPES.COMPARE_OPTIONS,
    title: text.compareOptions.title,
    description:
      directions.length > 0
        ? formatTemplate(text.compareOptions.descriptionWithDirections, {
            directions: directions.join(", "),
          })
        : topOpportunity?.opportunity?.title
        ? formatTemplate(text.compareOptions.descriptionWithOpportunity, {
            title: topOpportunity.opportunity.title,
          })
        : text.compareOptions.descriptionFallback,
    rationale: text.compareOptions.rationale,
    priority: 15,
    status: ACTION_STEP_STATUS.READY,
  });
}

function buildExploreLearningStep(profile, options = {}) {
  const text = getActionPlanLocaleText(options);
  const primaryGoal = getMetaValue(profile?.goals?.primaryGoal);
  const retrainingInterest = getMetaValue(profile?.education?.retrainingInterest);

  return createActionStep({
    id: "explore-learning",
    type: ACTION_STEP_TYPES.EXPLORE_LEARNING,
    title:
      primaryGoal === GOAL_TYPES.CHOOSE_EDUCATION
        ? text.exploreLearning.titleWithEducationGoal
        : text.exploreLearning.titleDefault,
    description:
      retrainingInterest === true
        ? text.exploreLearning.descriptionWithRetraining
        : text.exploreLearning.descriptionFallback,
    rationale: text.exploreLearning.rationale,
    priority: 20,
    status: ACTION_STEP_STATUS.READY,
  });
}

function buildPrepareInterviewStep(options = {}) {
  const text = getActionPlanLocaleText(options);
  return createActionStep({
    id: "prepare-interview",
    type: ACTION_STEP_TYPES.PREPARE_INTERVIEW,
    title: text.prepareInterview.title,
    description: text.prepareInterview.description,
    rationale: text.prepareInterview.rationale,
    priority: 20,
    status: ACTION_STEP_STATUS.READY,
  });
}

function buildRequestSupportStep(profile, supportNeed, options = {}) {
  const text = getActionPlanLocaleText(options);
  const reasonBits = [
    supportNeed.reasonTags.includes("minor_user") ? text.requestSupport.reasons.minorUser : null,
    supportNeed.reasonTags.includes("multiple_constraints")
      ? text.requestSupport.reasons.multipleConstraints
      : null,
    supportNeed.reasonTags.includes("high_urgency") ? text.requestSupport.reasons.highUrgency : null,
    supportNeed.reasonTags.includes("income_pressure")
      ? text.requestSupport.reasons.incomePressure
      : null,
  ].filter(Boolean);

  return createActionStep({
    id: "request-support",
    type: ACTION_STEP_TYPES.REQUEST_SUPPORT,
    title: text.requestSupport.title,
    description:
      reasonBits.length > 0
        ? formatTemplate(text.requestSupport.descriptionWithReasons, {
            reasons: reasonBits.join(", "),
          })
        : text.requestSupport.descriptionFallback,
    rationale: text.requestSupport.rationale,
    priority: 5,
    status: ACTION_STEP_STATUS.RECOMMENDED,
  });
}

function maybeAddSupportingStep(steps, profile, primaryType, options = {}) {
  const missing = topMissingInformation(profile);

  if (
    missing.length >= 4 &&
    !steps.some((step) => step.type === ACTION_STEP_TYPES.CLARIFY_PROFILE)
  ) {
    steps.push(buildClarifyProfileStep(profile, options));
    return;
  }

  if (
    (primaryType === ACTION_STEP_TYPES.APPLY_NOW ||
      primaryType === ACTION_STEP_TYPES.COMPARE_OPTIONS) &&
    !hasDirectionSignals(profile) &&
    !steps.some((step) => step.type === ACTION_STEP_TYPES.CLARIFY_DIRECTION)
  ) {
    steps.push(buildClarifyDirectionStep(options));
  }
}

function stepForPrimaryType(primaryType, profile, supportNeed, options) {
  switch (primaryType) {
    case ACTION_STEP_TYPES.APPLY_NOW:
      return buildApplyNowStep(profile, options);

    case ACTION_STEP_TYPES.COMPARE_OPTIONS:
      return buildCompareOptionsStep(profile, options);

    case ACTION_STEP_TYPES.BUILD_CV:
      return buildBuildCvStep(profile, options);

    case ACTION_STEP_TYPES.EXPLORE_LEARNING:
      return buildExploreLearningStep(profile, options);

    case ACTION_STEP_TYPES.PREPARE_INTERVIEW:
      return buildPrepareInterviewStep(options);

    case ACTION_STEP_TYPES.REQUEST_SUPPORT:
      return buildRequestSupportStep(profile, supportNeed, options);

    case ACTION_STEP_TYPES.CLARIFY_DIRECTION:
      return buildClarifyDirectionStep(options);

    case ACTION_STEP_TYPES.CLARIFY_PROFILE:
    default:
      return buildClarifyProfileStep(profile, options);
  }
}

function sortSteps(steps) {
  return [...steps].sort((a, b) => a.priority - b.priority);
}

export function buildCareerActionPlan(profile, options = {}) {
  const supportNeed = computeSupportNeed(profile);
  const primaryType = choosePrimaryActionType(profile, supportNeed);

  const steps = [];

  if (
    supportNeed.level === SUPPORT_LEVELS.DEEP &&
    supportNeed.recommendedMode === RECOMMENDED_MODES.HANDOFF
  ) {
    steps.push(buildRequestSupportStep(profile, supportNeed, options));
  }

  steps.push(stepForPrimaryType(primaryType, profile, supportNeed, options));
  maybeAddSupportingStep(steps, profile, primaryType, options);

  const deduped = [];
  const seenIds = new Set();

  for (const step of steps) {
    if (!step || seenIds.has(step.id)) continue;
    seenIds.add(step.id);
    deduped.push(step);
  }

  const sortedSteps = sortSteps(deduped);

  return {
    primaryType,
    supportNeed,
    steps: sortedSteps,
    summary: summarizeCareerActionPlan(sortedSteps),
  };
}

export function summarizeCareerActionPlan(steps = []) {
  const safeSteps = toSafeArray(steps);
  const firstStep = safeSteps[0];

  return {
    totalSteps: safeSteps.length,
    firstStepTitle: firstStep?.title || null,
    includesDocumentFlow: safeSteps.some((step) => step.documentSuggestion?.flow),
    documentFlows: uniqueStrings(
      safeSteps.map((step) => step.documentSuggestion?.flow).filter(Boolean)
    ),
    stepTypes: uniqueStrings(safeSteps.map((step) => step.type).filter(Boolean)),
  };
}
