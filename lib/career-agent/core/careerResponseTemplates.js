// /lib/career-agent/core/careerResponseTemplates.js

import {
  getMetaValue,
  getListItems,
} from "../profile/careerProfile.helpers.js";
import { CAREER_AGENT_STATES } from "./careerStateMachine.js";
import { getCareerResponseText } from "../careerText.js";

export const CAREER_RESPONSE_KINDS = Object.freeze({
  INFO: "info",
  QUESTION_SET: "question_set",
  PROFILE_CONFIRMATION: "profile_confirmation",
  DIRECTION_SHORTLIST: "direction_shortlist",
  OPTION_ANALYSIS: "option_analysis",
  ACTION_PLAN: "action_plan",
  SUMMARY: "summary",
  DOCUMENT_FLOW: "document_flow",
  HANDOFF: "handoff",
  WARNING: "warning",
});

function toSafeArray(value) {
  return Array.isArray(value) ? value : [];
}

function compactList(values = []) {
  return values.filter((value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === "string") return value.trim().length > 0;
    return true;
  });
}

function uniqueStrings(values = []) {
  return Array.from(new Set(compactList(values)));
}

function coerceString(value, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function makeResponse(input = {}) {
  return {
    kind: input.kind || CAREER_RESPONSE_KINDS.INFO,
    state: input.state || null,
    title: input.title || null,
    message: input.message || "",
    bullets: toSafeArray(input.bullets),
    questions: toSafeArray(input.questions),
    cards: toSafeArray(input.cards),
    actionPlan: input.actionPlan || null,
    profileSummary: input.profileSummary || null,
    documentStep: input.documentStep || null,
    handoff: input.handoff || null,
    meta: input.meta || {},
  };
}

function formatQuestion(question) {
  return {
    id: question.id,
    state: question.state || null,
    group: question.group || null,
    prompt: question.prompt,
    type: question.type,
    required: question.required === true,
    requiresAffirmative: question.requiresAffirmative === true,
    options: toSafeArray(question.options),
    targetPath: question.targetPath || null,
    valueKind: question.valueKind || null,
    runtimeKey: question.runtimeKey || null,
  };
}

function getDirectionTitle(item) {
  if (typeof item === "string") return item;

  const title = getMetaValue(item?.title);
  if (title) return title;

  if (typeof item?.title === "string") return item.title;

  const label = getMetaValue(item?.label);
  if (label) return label;

  if (typeof item?.label === "string") return item.label;

  return "Võimalik suund";
}

function getDirectionRationale(item) {
  if (Array.isArray(item?.rationale)) return item.rationale;
  return getListItems(item?.rationale, []);
}

function getDirectionMissingRequirements(item) {
  if (Array.isArray(item?.missingRequirements)) return item.missingRequirements;
  return getListItems(item?.missingRequirements, []);
}

function takeTop(items, limit = 5) {
  return toSafeArray(items).slice(0, limit);
}

function getLocaleText(options = {}) {
  const locale =
    options.locale ||
    options.documentLanguage ||
    options.language ||
    "et";
  return getCareerResponseText(locale);
}

export function buildStateIntroResponse(state, _workflowFocus = null, options = {}) {
  const text = getLocaleText(options);
  const titles = text.stateIntro.titles;

  return makeResponse({
    kind: CAREER_RESPONSE_KINDS.INFO,
    state,
    title: titles[state] || titles.default,
    message:
      text.stateIntro.messages?.[state] ||
      text.stateIntro.message,
  });
}

export function buildQuestionSetResponse(state, questions = [], options = {}) {
  const text = getLocaleText(options);
  const safeQuestions = toSafeArray(questions).map(formatQuestion);

  return makeResponse({
    kind: CAREER_RESPONSE_KINDS.QUESTION_SET,
    state,
    title: options.title || text.questionSet.title,
    message: options.message || text.questionSet.message,
    questions: safeQuestions,
    meta: {
      questionCount: safeQuestions.length,
      requiredQuestionIds: safeQuestions
        .filter((question) => question.required)
        .map((question) => question.id),
    },
  });
}

export function buildProfileConfirmationResponse(profileSummary, options = {}) {
  const text = getLocaleText(options);
  const confirmQuestion = options.confirmQuestion
    ? formatQuestion(options.confirmQuestion)
    : null;

  return makeResponse({
    kind: CAREER_RESPONSE_KINDS.PROFILE_CONFIRMATION,
    state: CAREER_AGENT_STATES.CONFIRM_PROFILE,
    title: options.title || text.profileConfirmation.title,
    message: options.message || text.profileConfirmation.message,
    profileSummary,
    questions: confirmQuestion ? [confirmQuestion] : [],
    bullets: compactList([
      profileSummary?.identity?.displayName
        ? `${text.profileConfirmation.labels.name}: ${profileSummary.identity.displayName}`
        : null,
      profileSummary?.goals?.primaryGoal
        ? `${text.profileConfirmation.labels.primaryGoal}: ${profileSummary.goals.primaryGoal}`
        : null,
      profileSummary?.goals?.preferredNextStep
        ? `${text.profileConfirmation.labels.nextStep}: ${profileSummary.goals.preferredNextStep}`
        : null,
      profileSummary?.workStatus?.currentStatus
        ? `${text.profileConfirmation.labels.currentStatus}: ${profileSummary.workStatus.currentStatus}`
        : null,
    ]),
    meta: {
      canConfirm: true,
      canCorrect: true,
      confirmQuestionId: confirmQuestion?.id || null,
    },
  });
}

export function buildDirectionShortlistResponse(directions = [], options = {}) {
  const text = getLocaleText(options);
  const safeDirections = takeTop(directions, options.limit || 5);

  const cards = safeDirections.map((item) => ({
    title: getDirectionTitle(item),
    type: getMetaValue(item?.type) || item?.type || null,
    rationale: takeTop(getDirectionRationale(item), 3),
    missingRequirements: takeTop(getDirectionMissingRequirements(item), 3),
  }));

  return makeResponse({
    kind: CAREER_RESPONSE_KINDS.DIRECTION_SHORTLIST,
    state: CAREER_AGENT_STATES.SHORTLIST_DIRECTIONS,
    title: options.title || text.directionShortlist.title,
    message: options.message || text.directionShortlist.message,
    cards,
    meta: {
      directionCount: cards.length,
    },
  });
}

export function buildOptionAnalysisResponse(analysis = [], options = {}) {
  const text = getLocaleText(options);
  const safeAnalysis = takeTop(analysis, options.limit || 5);

  const cards = safeAnalysis.map((item) => ({
    title: item?.opportunity?.title || text.optionAnalysis.defaultTitle,
    fitLevel: item?.fitLevel || null,
    fitLabel: item?.fitLabel || null,
    score: typeof item?.score === "number" ? item.score : null,
    whyItFits: takeTop(item?.whyItFits || [], 4),
    whatIsMissing: takeTop(item?.whatIsMissing || [], 4),
    whatUserCanOfferExtra: takeTop(item?.whatUserCanOfferExtra || [], 4),
    nextStep: item?.nextStep || null,
    confidenceNotes: takeTop(item?.confidenceNotes || [], 3),
  }));

  return makeResponse({
    kind: CAREER_RESPONSE_KINDS.OPTION_ANALYSIS,
    state: CAREER_AGENT_STATES.ANALYZE_OPTIONS,
    title: options.title || text.optionAnalysis.title,
    message: options.message || text.optionAnalysis.message,
    cards,
    meta: {
      optionCount: cards.length,
    },
  });
}

export function buildActionPlanResponse(actionPlan, options = {}) {
  const text = getLocaleText(options);
  const steps = toSafeArray(actionPlan?.steps);

  const cards = steps.map((step) => ({
    id: step.id,
    type: step.type,
    title: step.title,
    description: step.description,
    rationale: takeTop(step.rationale || [], 4),
    priority: step.priority,
    status: step.status,
    documentSuggestion: step.documentSuggestion || null,
    relatedOpportunity: step.relatedOpportunity || null,
  }));

  return makeResponse({
    kind: CAREER_RESPONSE_KINDS.ACTION_PLAN,
    state: CAREER_AGENT_STATES.ACTION_PLAN,
    title: options.title || text.actionPlan.title,
    message: options.message || text.actionPlan.message,
    cards,
    actionPlan,
    meta: {
      stepCount: cards.length,
      firstStepType: cards[0]?.type || null,
      includesDocumentFlow: cards.some((card) => card.documentSuggestion?.flow),
    },
  });
}

export function buildSummaryResponse(summary = {}, options = {}) {
  const text = getLocaleText(options);
  return makeResponse({
    kind: CAREER_RESPONSE_KINDS.SUMMARY,
    state: CAREER_AGENT_STATES.SUMMARY,
    title: options.title || text.summary.title,
    message: options.message || text.summary.message,
    bullets: uniqueStrings([
      summary?.goal ? `${text.summary.labels.goal}: ${summary.goal}` : null,
      summary?.mainDirection ? `${text.summary.labels.mainDirection}: ${summary.mainDirection}` : null,
      summary?.firstStep ? `${text.summary.labels.firstStep}: ${summary.firstStep}` : null,
      summary?.supportMode ? `${text.summary.labels.supportMode}: ${summary.supportMode}` : null,
    ]),
    meta: {
      summary,
    },
  });
}

export function buildDocumentFlowTransitionResponse(documentStep, options = {}) {
  const text = getLocaleText(options);
  const flow = documentStep?.flow || documentStep?.documentFlow || null;
  const titleMap = text.documentFlow.transitionTitleMap;

  return makeResponse({
    kind: CAREER_RESPONSE_KINDS.DOCUMENT_FLOW,
    state: options.state || CAREER_AGENT_STATES.ACTION_PLAN,
    title: options.title || titleMap[flow] || text.documentFlow.titleDefault,
    message: options.message || documentStep?.reason || text.documentFlow.message,
    documentStep,
    bullets: compactList([
      flow ? `Dokumendiflow: ${flow}` : null,
      documentStep?.reason ? `Põhjus: ${documentStep.reason}` : null,
    ]),
    meta: {
      flow,
      needsAdditionalInput: toSafeArray(documentStep?.missingInputs).length > 0,
    },
  });
}

export function buildDocumentQuestionsResponse(documentStep, options = {}) {
  const text = getLocaleText(options);
  const missingInputs = toSafeArray(documentStep?.missingInputs);

  const questions = missingInputs.map((item, index) => {
    if (typeof item === "string") {
      return {
        id: `document_missing_${index + 1}`,
        prompt: item,
        type: "short_text",
        required: true,
      };
    }

    return {
      id: item?.id || `document_missing_${index + 1}`,
      prompt: item?.prompt || item?.label || text.documentQuestions.missingPrompt,
      type: item?.type || "short_text",
      required: item?.required !== false,
      options: toSafeArray(item?.options),
    };
  });

  return makeResponse({
    kind: CAREER_RESPONSE_KINDS.DOCUMENT_FLOW,
    state: options.state || CAREER_AGENT_STATES.ACTION_PLAN,
    title: options.title || text.documentQuestions.title,
    message: options.message || text.documentQuestions.message,
    questions,
    documentStep,
    meta: {
      flow: documentStep?.flow || null,
      missingInputCount: questions.length,
    },
  });
}

export function buildConsentBlockedResponse(options = {}) {
  const text = getLocaleText(options);
  return makeResponse({
    kind: CAREER_RESPONSE_KINDS.WARNING,
    state: options.state || CAREER_AGENT_STATES.AGREEMENTS,
    title: options.title || text.consentBlocked.title,
    message: options.message || text.consentBlocked.message,
    bullets: toSafeArray(options.bullets),
    meta: {
      blockedByConsent: true,
      requiredConsentKeys: toSafeArray(options.requiredConsentKeys),
    },
  });
}

export function buildHandoffResponse(handoff, options = {}) {
  const text = getLocaleText(options);
  return makeResponse({
    kind: CAREER_RESPONSE_KINDS.HANDOFF,
    state: CAREER_AGENT_STATES.HANDOFF,
    title: options.title || text.handoff.title,
    message: options.message || handoff?.message || text.handoff.message,
    handoff,
    bullets: compactList([
      handoff?.reasonCode ? `${text.handoff.labels.reason}: ${handoff.reasonCode}` : null,
      handoff?.reasonLabel ? handoff.reasonLabel : null,
      handoff?.recommendedChannel ? `${text.handoff.labels.channel}: ${handoff.recommendedChannel}` : null,
    ]),
    meta: {
      severity: handoff?.severity || null,
    },
  });
}

export function buildSimpleInfoResponse(message, options = {}) {
  return makeResponse({
    kind: options.kind || CAREER_RESPONSE_KINDS.INFO,
    state: options.state || null,
    title: options.title || null,
    message: coerceString(message, ""),
    bullets: toSafeArray(options.bullets),
    meta: options.meta || {},
  });
}
