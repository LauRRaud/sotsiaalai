import { GOAL_TYPES, NEXT_STEP_TYPES } from "../profile/careerProfile.schema.js";
const DEFAULT_CAREER_AI_EXTRACTOR_MODEL = "gpt-5.4-nano";
const DEFAULT_TIMEOUT_MS = 8000;
const MIN_MESSAGE_LENGTH = 18;

const ALLOWED_GOAL_TYPES = new Set(Object.values(GOAL_TYPES));
const ALLOWED_NEXT_STEP_TYPES = new Set(Object.values(NEXT_STEP_TYPES));
const ALLOWED_DIRECTION_TYPES = new Set(["job", "education", "pathway"]);

function enabled(value = "") {
  return /^(1|true|yes|on)$/i.test(String(value || "").trim());
}

function disabled(value = "") {
  return /^(0|false|no|off)$/i.test(String(value || "").trim());
}

function coerceString(value) {
  const normalized = String(value || "").trim();
  return normalized || null;
}

function toSafeArray(value) {
  return Array.isArray(value) ? value : [];
}

function uniqueStrings(values = [], max = 8) {
  return Array.from(
    new Set(
      toSafeArray(values)
        .map((value) => coerceString(value))
        .filter(Boolean)
    )
  ).slice(0, max);
}

function safeText(value, max = 180) {
  const normalized = coerceString(value);
  return normalized ? normalized.slice(0, max) : null;
}

function extractResponseText(response = {}) {
  if (typeof response?.output_text === "string") return response.output_text;

  const parts = [];
  for (const item of Array.isArray(response?.output) ? response.output : []) {
    for (const content of Array.isArray(item?.content) ? item.content : []) {
      if (typeof content?.text === "string") {
        parts.push(content.text);
      }
    }
  }

  return parts.join("\n");
}

function parseJsonObject(text = "") {
  const trimmed = String(text || "").trim();
  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed);
  } catch {}

  const match = trimmed.match(/\{[\s\S]*\}/);
  if (!match) return null;

  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

function buildRoleItems(roles = []) {
  return toSafeArray(roles)
    .map((item) => {
      if (typeof item === "string") {
        const title = safeText(item, 120);
        return title ? { title } : null;
      }

      if (!item || typeof item !== "object") return null;

      const title = safeText(item.title, 120);
      if (!title) return null;

      return {
        title,
        employer: safeText(item.employer, 120),
        sector: safeText(item.sector, 120),
      };
    })
    .filter(Boolean)
    .slice(0, 4);
}

function buildEducationItems(entries = []) {
  return toSafeArray(entries)
    .map((item) => {
      if (typeof item === "string") {
        const title = safeText(item, 140);
        return title ? { title } : null;
      }

      if (!item || typeof item !== "object") return null;

      const title = safeText(item.title, 140);
      if (!title) return null;

      return {
        title,
        level: safeText(item.level, 80),
        institution: safeText(item.institution, 140),
      };
    })
    .filter(Boolean)
    .slice(0, 4);
}

function buildDirectionItems(entries = []) {
  return toSafeArray(entries)
    .map((item) => {
      if (typeof item === "string") {
        const title = safeText(item, 140);
        return title
          ? {
              title,
              type: "job",
            }
          : null;
      }

      if (!item || typeof item !== "object") return null;

      const title = safeText(item.title, 140);
      if (!title) return null;

      const type = coerceString(item.type);
      const priority = Number(item.priority);

      return {
        title,
        type: ALLOWED_DIRECTION_TYPES.has(type) ? type : "job",
        priority: Number.isFinite(priority) ? Math.max(1, Math.min(20, priority)) : 12,
        rationale: uniqueStrings(item.rationale, 3),
      };
    })
    .filter(Boolean)
    .slice(0, 4);
}

function buildSafeCareerPatch(rawPatch = {}) {
  if (!rawPatch || typeof rawPatch !== "object") return null;

  const patch = {};
  let changed = false;

  const displayName = safeText(rawPatch?.identity?.displayName, 80);
  const location = safeText(rawPatch?.identity?.location, 120);
  if (displayName || location) {
    patch.identity = {};
    if (displayName) patch.identity.displayName = displayName;
    if (location) patch.identity.location = location;
    changed = true;
  }

  const primaryGoal = coerceString(rawPatch?.goals?.primaryGoal);
  const preferredNextStep = coerceString(rawPatch?.goals?.preferredNextStep);
  if (
    ALLOWED_GOAL_TYPES.has(primaryGoal) ||
    ALLOWED_NEXT_STEP_TYPES.has(preferredNextStep)
  ) {
    patch.goals = {};
    if (ALLOWED_GOAL_TYPES.has(primaryGoal)) {
      patch.goals.primaryGoal = primaryGoal;
    }
    if (ALLOWED_NEXT_STEP_TYPES.has(preferredNextStep)) {
      patch.goals.preferredNextStep = preferredNextStep;
    }
    changed = true;
  }

  const roles = buildRoleItems(rawPatch?.experience?.roles);
  const sectors = uniqueStrings(rawPatch?.experience?.sectors, 6);
  if (roles.length || sectors.length) {
    patch.experience = {};
    if (roles.length) patch.experience.roles = roles;
    if (sectors.length) patch.experience.sectors = sectors;
    changed = true;
  }

  const educationCompleted = buildEducationItems(rawPatch?.education?.completed);
  if (educationCompleted.length) {
    patch.education = {
      completed: educationCompleted,
    };
    changed = true;
  }

  const domainSkills = uniqueStrings(rawPatch?.skills?.domainSkills, 8);
  const transferableSkills = uniqueStrings(rawPatch?.skills?.transferableSkills, 8);
  const digitalSkills = uniqueStrings(rawPatch?.skills?.digitalSkills, 8);
  if (domainSkills.length || transferableSkills.length || digitalSkills.length) {
    patch.skills = {};
    if (domainSkills.length) patch.skills.domainSkills = domainSkills;
    if (transferableSkills.length) {
      patch.skills.transferableSkills = transferableSkills;
    }
    if (digitalSkills.length) patch.skills.digitalSkills = digitalSkills;
    changed = true;
  }

  const strengths = uniqueStrings(rawPatch?.selfAnalysis?.strengths, 6);
  const interests = uniqueStrings(rawPatch?.selfAnalysis?.interests, 6);
  const values = uniqueStrings(rawPatch?.selfAnalysis?.values, 6);
  if (strengths.length || interests.length || values.length) {
    patch.selfAnalysis = {};
    if (strengths.length) patch.selfAnalysis.strengths = strengths;
    if (interests.length) patch.selfAnalysis.interests = interests;
    if (values.length) patch.selfAnalysis.values = values;
    changed = true;
  }

  const immediateTargets = buildDirectionItems(rawPatch?.directions?.immediateTargets);
  if (immediateTargets.length) {
    patch.directions = {
      immediateTargets,
    };
    changed = true;
  }

  const missingInformation = uniqueStrings(
    rawPatch?.recommendationContext?.missingInformation,
    8
  );
  if (missingInformation.length) {
    patch.recommendationContext = {
      missingInformation,
    };
    changed = true;
  }

  return changed ? patch : null;
}

function buildPromptPayload({
  message,
  questionId,
  currentState,
  locale,
  profileSummary,
}) {
  return {
    task:
      "Return a conservative JSON profilePatch for a career-guidance workflow. Use only supported fields and omit uncertain details.",
    locale,
    currentState: currentState || "",
    questionId: questionId || "",
    userMessage: String(message || "").trim(),
    existingProfileSummary: profileSummary || {},
    supportedPatchShape: {
      identity: ["displayName", "location"],
      goals: {
        primaryGoal: Array.from(ALLOWED_GOAL_TYPES),
        preferredNextStep: Array.from(ALLOWED_NEXT_STEP_TYPES),
      },
      experience: {
        roles: [{ title: "string", employer: "string?", sector: "string?" }],
        sectors: ["string"],
      },
      education: {
        completed: [{ title: "string", level: "string?", institution: "string?" }],
      },
      skills: {
        domainSkills: ["string"],
        transferableSkills: ["string"],
        digitalSkills: ["string"],
      },
      selfAnalysis: {
        strengths: ["string"],
        interests: ["string"],
        values: ["string"],
      },
      directions: {
        immediateTargets: [
          { title: "string", type: "job|education|pathway", priority: "1-20", rationale: ["string"] },
        ],
      },
      recommendationContext: {
        missingInformation: ["string"],
      },
    },
    responseFormat: {
      confidence: "high|medium|low",
      profilePatch: "object",
    },
  };
}

function buildProfileSummary(profile = {}) {
  return {
    identity: {
      displayName: coerceString(profile?.identity?.displayName?.value),
      location: coerceString(profile?.identity?.location?.value),
    },
    goals: {
      primaryGoal: coerceString(profile?.goals?.primaryGoal?.value),
      preferredNextStep: coerceString(profile?.goals?.preferredNextStep?.value),
    },
    experience: {
      roles: toSafeArray(profile?.experience?.roles?.items)
        .map((item) => item?.title?.value || item?.title || null)
        .filter(Boolean)
        .slice(0, 4),
    },
    directions: {
      immediateTargets: toSafeArray(profile?.directions?.immediateTargets?.items)
        .map((item) => item?.title?.value || item?.title || null)
        .filter(Boolean)
        .slice(0, 4),
    },
  };
}

export function isCareerAiExtractorEnabled(env = process.env) {
  const explicitValue = String(env.CAREER_WORKFLOW_AI_EXTRACTOR || "").trim();
  if (!explicitValue) return true;
  if (disabled(explicitValue)) return false;
  return enabled(explicitValue);
}

export function getCareerAiExtractorModel(env = process.env) {
  return (
    String(env.CAREER_WORKFLOW_AI_EXTRACTOR_MODEL || DEFAULT_CAREER_AI_EXTRACTOR_MODEL).trim() ||
    DEFAULT_CAREER_AI_EXTRACTOR_MODEL
  );
}

async function logCareerAiUsage(payload = {}) {
  try {
    const { logOpenAIUsage } = await import("../../openaiUsage.js");
    await logOpenAIUsage(payload);
  } catch {}
}

export async function extractCareerProfilePatchWithAi({
  message,
  questionId = "",
  currentState = "",
  profile = {},
  locale = "et",
  env = process.env,
  extractor = null,
  route = "api/career-agent/run",
  stage = "career_ai_extractor",
} = {}) {
  const safeMessage = coerceString(message);

  if (!safeMessage || safeMessage.length < MIN_MESSAGE_LENGTH) {
    return {
      profilePatch: null,
      warnings: [],
      meta: {
        enabled: false,
        used: false,
        reason: "message_too_short",
      },
    };
  }

  const model = getCareerAiExtractorModel(env);
  const startedAt = Date.now();

  const executeExtractor = async () => {
    if (typeof extractor === "function") {
      return extractor({
        message: safeMessage,
        questionId,
        currentState,
        profile,
        locale,
        env,
      });
    }

    if (!isCareerAiExtractorEnabled(env) || !env.OPENAI_API_KEY) {
      return null;
    }

    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    const response = await client.responses.create(
      {
        model,
        input: [
          {
            role: "system",
            content: [
              "You are a conservative career-profile extractor.",
              "Return only one JSON object with confidence and profilePatch.",
              "Use only the supported patch shape.",
              "Do not invent details or overgeneralize from short input.",
              "If the message is not informative enough, return confidence low and an empty profilePatch.",
              "Keep arrays short and specific.",
            ].join(" "),
          },
          {
            role: "user",
            content: JSON.stringify(
              buildPromptPayload({
                message: safeMessage,
                questionId,
                currentState,
                locale,
                profileSummary: buildProfileSummary(profile),
              })
            ),
          },
        ],
        text: { verbosity: "low" },
        reasoning: { effort: "low" },
        max_output_tokens: 900,
      },
      {
        timeout: Math.max(1000, Number(env.CAREER_WORKFLOW_AI_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS),
      }
    );

    await logCareerAiUsage({
      response,
      model,
      route,
      stage,
      latencyMs: Date.now() - startedAt,
    });

    return parseJsonObject(extractResponseText(response));
  };

  try {
    const raw = await executeExtractor();
    const confidence = coerceString(raw?.confidence)?.toLowerCase() || "low";

    if (confidence !== "high" && confidence !== "medium") {
      return {
        profilePatch: null,
        warnings: [],
        meta: {
          enabled: typeof extractor === "function" || isCareerAiExtractorEnabled(env),
          used: false,
          model,
          confidence,
        },
      };
    }

    const profilePatch = buildSafeCareerPatch(raw?.profilePatch || raw?.patch || {});

    return {
      profilePatch,
      warnings: [],
      meta: {
        enabled: typeof extractor === "function" || isCareerAiExtractorEnabled(env),
        used: Boolean(profilePatch),
        model,
        confidence,
      },
    };
  } catch (error) {
    return {
      profilePatch: null,
      warnings: [
        error instanceof Error ? error.message : "career_ai_extractor_failed",
      ],
      meta: {
        enabled: typeof extractor === "function" || isCareerAiExtractorEnabled(env),
        used: false,
        model,
        reason: "extractor_failed",
      },
    };
  }
}
