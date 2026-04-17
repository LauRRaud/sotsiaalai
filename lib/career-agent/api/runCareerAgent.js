import { createCareerOrchestrator } from "../core/careerOrchestrator.js";
import {
  adaptCareerRunRequest,
  adaptCareerApplyAnswerRequest,
} from "../adapters/careerTurnInputAdapter.js";
import {
  adaptCareerCvParserOutput,
  adaptCareerCvTextInput,
} from "../adapters/careerCvParserAdapter.js";
import { getCareerRunText } from "../careerText.js";

function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    !(value instanceof Date)
  );
}

function coerceString(value) {
  const normalized = String(value || "").trim();
  return normalized || null;
}

function hasCanonicalProfilePatch(payload = {}) {
  return (
    isPlainObject(payload.profilePatch) ||
    isPlainObject(payload.cvProfilePatch) ||
    isPlainObject(payload.parserProfilePatch) ||
    isPlainObject(payload.parsedCvProfilePatch)
  );
}

function extractCvParserPayload(payload = {}) {
  const candidates = [
    payload.cvParseResult,
    payload.cvParserResult,
    payload.smartCvParseResult,
    payload.parseResult,
    payload.parserResult,
  ];

  for (const candidate of candidates) {
    if (isPlainObject(candidate)) {
      return candidate;
    }
  }

  return null;
}

function extractCvTextPayload(payload = {}) {
  const text =
    coerceString(payload.cvText) ||
    coerceString(payload.cvFullText) ||
    coerceString(payload.cvRawText) ||
    coerceString(payload.cvContent) ||
    null;

  if (!text) {
    return null;
  }

  return {
    text,
    fileName:
      coerceString(payload.cvFileName) ||
      coerceString(payload.fileName) ||
      null,
  };
}

function stripCanonicalPatchFields(payload = {}) {
  const next = { ...payload };

  delete next.profilePatch;
  delete next.cvProfilePatch;
  delete next.parserProfilePatch;
  delete next.parsedCvProfilePatch;

  return next;
}

function stripQuestionAnswerFields(payload = {}) {
  const next = { ...payload };

  delete next.questionId;
  delete next.answer;
  delete next.id;
  delete next.value;
  delete next.confirmed;
  delete next.source;

  return next;
}

function withCanonicalCvPatch(payload = {}) {
  if (hasCanonicalProfilePatch(payload)) {
    return {
      payload,
      parserAdapter: null,
    };
  }

  const cvParserPayload = extractCvParserPayload(payload);
  if (!cvParserPayload) {
    const cvTextPayload = extractCvTextPayload(payload);
    if (!cvTextPayload) {
      return {
        payload,
        parserAdapter: null,
      };
    }

    const parserAdapter = adaptCareerCvTextInput(cvTextPayload, {
      locale: payload.locale || payload.language || payload.documentLanguage,
    });

    return {
      payload: {
        ...payload,
        parserProfilePatch: parserAdapter.profilePatch,
      },
      parserAdapter,
    };
  }

  const parserAdapter = adaptCareerCvParserOutput(cvParserPayload, {
    locale: payload.locale || payload.language || payload.documentLanguage,
  });

  return {
    payload: {
      ...payload,
      parserProfilePatch: parserAdapter.profilePatch,
    },
    parserAdapter,
  };
}

function getRunLocale(payload = {}) {
  return payload.locale || payload.language || payload.documentLanguage || "et";
}

function buildErrorMessage(error, payload = {}) {
  const text = getCareerRunText(getRunLocale(payload));
  return error instanceof Error ? error.message : text.errors.unknownServerError;
}

export async function runCareerAgentPayload(rawPayload = {}) {
  const payload = isPlainObject(rawPayload) ? rawPayload : {};
  const orchestrator = createCareerOrchestrator();

  const { payload: payloadWithCvPatch, parserAdapter } =
    withCanonicalCvPatch(payload);

  const incomingQuestionId =
    coerceString(payloadWithCvPatch.questionId) ||
    coerceString(payloadWithCvPatch.id);

  const hasQuestionAnswer =
    Boolean(incomingQuestionId) &&
    (Object.prototype.hasOwnProperty.call(payloadWithCvPatch, "answer") ||
      Object.prototype.hasOwnProperty.call(payloadWithCvPatch, "value"));

  let payloadForRun = payloadWithCvPatch;
  let appliedQuestion = null;

  if (hasQuestionAnswer) {
    const answerInput = adaptCareerApplyAnswerRequest(payloadWithCvPatch);
    const applied = orchestrator.applyQuestionAnswer(answerInput);

    appliedQuestion = {
      questionId: answerInput.questionId,
    };

    payloadForRun = {
      ...stripQuestionAnswerFields(stripCanonicalPatchFields(payloadWithCvPatch)),
      profile: applied.profile,
      runtime: applied.runtime,
    };
  }

  const turnInput = adaptCareerRunRequest(payloadForRun);
  const result = await orchestrator.resolveTurn(turnInput);

  return {
    ok: true,
    status: 200,
    body: {
      ok: true,
      result,
      meta: {
        questionApplied: Boolean(appliedQuestion),
        appliedQuestion,
        adapterWarnings: turnInput.warnings || [],
        parserWarnings: parserAdapter?.warnings || [],
        parserStats: parserAdapter?.stats || null,
      },
    },
  };
}

export async function runCareerAgentRequestBody(rawPayload = {}) {
  try {
    return await runCareerAgentPayload(rawPayload);
  } catch (error) {
    console.error("career-agent/run error:", error);

    return {
      ok: false,
      status: 500,
      body: {
        ok: false,
        error: buildErrorMessage(error, rawPayload),
      },
    };
  }
}
