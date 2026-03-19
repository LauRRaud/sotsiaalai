// /lib/career-agent/documents/careerDocumentIntegration.js

import { ACTION_STEP_TYPES } from "../core/careerActionPlan.js";
import {
  DOCUMENT_TYPES,
  resolveDocumentFlow,
  getMissingDocumentInputs,
} from "./careerDocumentFlows.js";

export const DOCUMENT_STEP_STATUS = Object.freeze({
  READY: "ready",
  NEEDS_INPUT: "needs_input",
  NOT_SUGGESTED: "not_suggested",
});

function toSafeArray(value) {
  return Array.isArray(value) ? value : [];
}

function coerceString(value) {
  const normalized = String(value || "").trim();
  return normalized || null;
}

function normalizePriority(value, fallback = 999) {
  return Number.isFinite(value) ? value : fallback;
}

function inferDocumentFlowFromActionType(stepType) {
  switch (stepType) {
    case ACTION_STEP_TYPES.BUILD_CV:
      return DOCUMENT_TYPES.CV_BUILD;

    case ACTION_STEP_TYPES.APPLY_NOW:
      return DOCUMENT_TYPES.APPLICATION_EMAIL;

    default:
      return null;
  }
}

function normalizeDocumentSuggestion(step) {
  if (!step || typeof step !== "object") return null;

  const explicitFlow = coerceString(step?.documentSuggestion?.flow);
  const inferredFlow = inferDocumentFlowFromActionType(step?.type);
  const flow = explicitFlow || inferredFlow;

  if (!flow) return null;

  const resolvedFlow = resolveDocumentFlow(flow);
  if (!resolvedFlow) return null;

  return {
    flow: resolvedFlow.id,
    reason:
      coerceString(step?.documentSuggestion?.reason) ||
      coerceString(step?.description) ||
      null,
    sourceStepId: coerceString(step?.id),
    sourceStepType: coerceString(step?.type),
    sourceStepTitle: coerceString(step?.title),
    priority: normalizePriority(step?.priority),
    relatedOpportunity: step?.relatedOpportunity || null,
  };
}

function collectDocumentCandidates(actionPlan) {
  const steps = toSafeArray(actionPlan?.steps);

  return steps
    .map((step) => ({
      step,
      suggestion: normalizeDocumentSuggestion(step),
    }))
    .filter((item) => item.suggestion !== null)
    .sort((a, b) => a.suggestion.priority - b.suggestion.priority);
}

export function mapActionPlanToDocumentSuggestion(actionPlan) {
  const candidates = collectDocumentCandidates(actionPlan);
  return candidates.length ? candidates[0].suggestion : null;
}

function isConsentMissingPrompt(item) {
  return item?.id === "document_generation_consent";
}

function getConsentBlockingInputIds(missingInputs = []) {
  return missingInputs
    .filter((item) => isConsentMissingPrompt(item))
    .map((item) => item.id)
    .filter(Boolean);
}

function mapConsentInputIdToConsentKey(inputId) {
  switch (inputId) {
    case "document_generation_consent":
      return "documentGenerationApproved";
    default:
      return null;
  }
}

function buildDocumentStep({
  suggestion,
  missingInputs,
  readyToGenerate,
  validationInput,
}) {
  if (!suggestion) {
    return {
      flow: null,
      status: DOCUMENT_STEP_STATUS.NOT_SUGGESTED,
      readyToGenerate: false,
      missingInputs: [],
      missingInputCount: 0,
      blockedByConsent: false,
      consentBlockingInputIds: [],
      blockedConsentKeys: [],
      reason: null,
      sourceStepId: null,
      sourceStepType: null,
      sourceStepTitle: null,
      relatedOpportunity: null,
      inputForValidation: validationInput || {},
    };
  }

  const consentBlockingInputIds = getConsentBlockingInputIds(missingInputs);
  const blockedByConsent = consentBlockingInputIds.length > 0;
  const blockedConsentKeys = consentBlockingInputIds
    .map((id) => mapConsentInputIdToConsentKey(id))
    .filter(Boolean);

  return {
    flow: suggestion.flow,
    status: readyToGenerate
      ? DOCUMENT_STEP_STATUS.READY
      : DOCUMENT_STEP_STATUS.NEEDS_INPUT,
    readyToGenerate,
    missingInputs,
    missingInputCount: missingInputs.length,
    blockedByConsent,
    consentBlockingInputIds,
    blockedConsentKeys,
    reason: suggestion.reason,
    sourceStepId: suggestion.sourceStepId,
    sourceStepType: suggestion.sourceStepType,
    sourceStepTitle: suggestion.sourceStepTitle,
    relatedOpportunity: suggestion.relatedOpportunity,
    inputForValidation: validationInput || {},
  };
}

export function shouldSuggestDocumentStep(actionPlan) {
  return mapActionPlanToDocumentSuggestion(actionPlan) !== null;
}

export function resolveDocumentStep(
  actionPlan,
  profile = {},
  inputForValidation = {},
  options = {}
) {
  const suggestion = mapActionPlanToDocumentSuggestion(actionPlan);

  if (!suggestion) {
    return buildDocumentStep({
      suggestion: null,
      missingInputs: [],
      readyToGenerate: false,
      validationInput: inputForValidation,
    });
  }

  const missingInputs = getMissingDocumentInputs(
    suggestion.flow,
    profile,
    inputForValidation
  );

  const readyToGenerate = missingInputs.length === 0;

  const documentStep = buildDocumentStep({
    suggestion,
    missingInputs,
    readyToGenerate,
    validationInput: inputForValidation,
  });

  if (options.includeFlowMeta) {
    const flowMeta = resolveDocumentFlow(suggestion.flow);
    return {
      ...documentStep,
      flowMeta,
    };
  }

  return documentStep;
}
