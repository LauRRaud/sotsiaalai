// /lib/career-agent/profile/careerProfile.helpers.js

import {
  createEmptyCareerProfile,
  PROFILE_SOURCES,
  PROFILE_STATUS,
  SUPPORT_LEVELS,
  RECOMMENDED_MODES,
} from "./careerProfile.schema.js";

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

  if (value instanceof Date) {
    return new Date(value.getTime());
  }

  if (Array.isArray(value)) {
    return value.map((item) => deepClone(item));
  }

  if (isPlainObject(value)) {
    const result = {};
    for (const [key, item] of Object.entries(value)) {
      result[key] = deepClone(item);
    }
    return result;
  }

  return value;
}

export function isMetaField(value) {
  return (
    isPlainObject(value) &&
    Object.prototype.hasOwnProperty.call(value, "value") &&
    Object.prototype.hasOwnProperty.call(value, "source") &&
    Object.prototype.hasOwnProperty.call(value, "status")
  );
}

export function isListField(value) {
  return (
    isPlainObject(value) &&
    Array.isArray(value.items) &&
    Object.prototype.hasOwnProperty.call(value, "source") &&
    Object.prototype.hasOwnProperty.call(value, "status")
  );
}

export function hasMeaningfulValue(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value === "boolean") return true;
  if (Array.isArray(value)) return value.length > 0;
  if (value instanceof Date) return Number.isFinite(value.getTime());

  if (isPlainObject(value)) {
    return Object.values(value).some((item) => {
      if (isMetaField(item)) return hasMeaningfulValue(item.value);
      if (isListField(item)) return item.items.length > 0;
      return hasMeaningfulValue(item);
    });
  }

  return true;
}

export function inferMetaStatus(value) {
  return hasMeaningfulValue(value)
    ? PROFILE_STATUS.UNCONFIRMED
    : PROFILE_STATUS.MISSING;
}

export function inferListStatus(items) {
  return Array.isArray(items) && items.length > 0
    ? PROFILE_STATUS.UNCONFIRMED
    : PROFILE_STATUS.MISSING;
}

export function getMetaValue(field, fallback = null) {
  return isMetaField(field) ? field.value : fallback;
}

export function getMetaSource(field, fallback = null) {
  return isMetaField(field) ? field.source : fallback;
}

export function getMetaStatus(field, fallback = PROFILE_STATUS.MISSING) {
  return isMetaField(field) ? field.status : fallback;
}

export function getListItems(field, fallback = []) {
  return isListField(field) ? field.items : fallback;
}

export function getListSource(field, fallback = null) {
  return isListField(field) ? field.source : fallback;
}

export function getListStatus(field, fallback = PROFILE_STATUS.MISSING) {
  return isListField(field) ? field.status : fallback;
}

function splitPath(path) {
  if (Array.isArray(path)) return path;

  return String(path)
    .split(".")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function getValueAtPath(target, path, fallback = undefined) {
  const parts = splitPath(path);
  let current = target;

  for (const part of parts) {
    if (!isPlainObject(current) && !Array.isArray(current)) return fallback;
    if (!(part in current)) return fallback;
    current = current[part];
  }

  return current === undefined ? fallback : current;
}

function setValueAtPathMutable(target, path, nextValue) {
  const parts = splitPath(path);
  if (!parts.length) return target;

  let current = target;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const key = parts[i];
    if (!isPlainObject(current[key])) {
      current[key] = {};
    }
    current = current[key];
  }

  current[parts[parts.length - 1]] = nextValue;
  return target;
}

export function setMetaValue(profile, path, value, options = {}) {
  const {
    source = PROFILE_SOURCES.FROM_USER,
    status = inferMetaStatus(value),
  } = options;

  const nextProfile = deepClone(profile);
  const current = getValueAtPath(nextProfile, path);

  if (!isMetaField(current)) {
    throw new Error(`Path "${path}" is not a meta field.`);
  }

  setValueAtPathMutable(nextProfile, path, {
    value,
    source,
    status,
  });

  return nextProfile;
}

export function setListItems(profile, path, items, options = {}) {
  const {
    source = PROFILE_SOURCES.FROM_USER,
    status = inferListStatus(items),
  } = options;

  const nextProfile = deepClone(profile);
  const current = getValueAtPath(nextProfile, path);

  if (!isListField(current)) {
    throw new Error(`Path "${path}" is not a list field.`);
  }

  setValueAtPathMutable(nextProfile, path, {
    items: Array.isArray(items) ? items : [],
    source,
    status,
  });

  return nextProfile;
}

function mergeMetaField(baseField, patchField, defaultSource) {
  if (isMetaField(patchField)) {
    return {
      value: patchField.value,
      source: patchField.source || defaultSource,
      status: patchField.status || inferMetaStatus(patchField.value),
    };
  }

  return {
    value: patchField,
    source: defaultSource,
    status: inferMetaStatus(patchField),
  };
}

function mergeListField(baseField, patchField, defaultSource) {
  if (isListField(patchField)) {
    return {
      items: Array.isArray(patchField.items) ? patchField.items : [],
      source: patchField.source || defaultSource,
      status: patchField.status || inferListStatus(patchField.items),
    };
  }

  const items = Array.isArray(patchField) ? patchField : [];
  return {
    items,
    source: defaultSource,
    status: inferListStatus(items),
  };
}

function mergeByShape(
  baseNode,
  patchNode,
  defaultSource,
  options = {}
) {
  const { allowUnknownKeys = false } = options;

  if (patchNode === undefined) {
    return deepClone(baseNode);
  }

  if (isMetaField(baseNode)) {
    return mergeMetaField(baseNode, patchNode, defaultSource);
  }

  if (isListField(baseNode)) {
    return mergeListField(baseNode, patchNode, defaultSource);
  }

  if (Array.isArray(baseNode)) {
    return Array.isArray(patchNode) ? deepClone(patchNode) : deepClone(baseNode);
  }

  if (isPlainObject(baseNode)) {
    if (!isPlainObject(patchNode)) {
      return deepClone(baseNode);
    }

    const result = {};
    const baseKeys = Object.keys(baseNode);

    for (const key of baseKeys) {
      result[key] = mergeByShape(
        baseNode[key],
        patchNode[key],
        defaultSource,
        options
      );
    }

    if (allowUnknownKeys) {
      for (const key of Object.keys(patchNode)) {
        if (!(key in baseNode)) {
          result[key] = deepClone(patchNode[key]);
        }
      }
    }

    return result;
  }

  return patchNode ?? baseNode;
}

export function normalizeCareerProfile(input = {}, options = {}) {
  const {
    defaultSource = PROFILE_SOURCES.SYSTEM_DERIVED,
    allowUnknownKeys = false,
  } = options;

  const emptyProfile = createEmptyCareerProfile();

  return mergeByShape(
    emptyProfile,
    input,
    defaultSource,
    { allowUnknownKeys }
  );
}

export function mergeProfilePatch(profile, patch, options = {}) {
  const {
    defaultSource = PROFILE_SOURCES.FROM_USER,
    allowUnknownKeys = false,
  } = options;

  const safeProfile = normalizeCareerProfile(profile || {}, {
    defaultSource: PROFILE_SOURCES.SYSTEM_DERIVED,
    allowUnknownKeys: false,
  });

  return mergeByShape(
    safeProfile,
    patch || {},
    defaultSource,
    { allowUnknownKeys }
  );
}

function pushReason(reasons, tag) {
  if (!reasons.includes(tag)) reasons.push(tag);
}

function isLowSignal(field) {
  const value = getMetaValue(field);
  return value === "low" || value === "very_low";
}

function isHighPressure(field) {
  const value = getMetaValue(field);
  return value === "high" || value === "very_high" || value === "urgent";
}

export function computeSupportNeed(profile) {
  const reasons = [];

  const missingInformationCount = getListItems(
    profile?.recommendationContext?.missingInformation,
    []
  ).length;

  if (isLowSignal(profile?.careerReadiness?.careerClarity)) {
    pushReason(reasons, "low_clarity");
  }

  if (isLowSignal(profile?.careerReadiness?.careerConfidence)) {
    pushReason(reasons, "low_confidence");
  }

  if (isLowSignal(profile?.careerReadiness?.labourMarketKnowledge)) {
    pushReason(reasons, "low_labour_market_knowledge");
  }

  if (isLowSignal(profile?.careerReadiness?.socialSupportLevel)) {
    pushReason(reasons, "low_social_support");
  }

  if (isHighPressure(profile?.goals?.urgency)) {
    pushReason(reasons, "high_urgency");
  }

  if (isHighPressure(profile?.goals?.incomePressure)) {
    pushReason(reasons, "income_pressure");
  }

  if (getMetaValue(profile?.identity?.minor) === true) {
    pushReason(reasons, "minor_user");
  }

  if (missingInformationCount >= 5) {
    pushReason(reasons, "many_unknowns");
  }

  const constraintsCount =
    getListItems(profile?.workStatus?.mobilityConstraints, []).length +
    getListItems(profile?.workStatus?.otherConstraints, []).length;

  if (constraintsCount >= 3) {
    pushReason(reasons, "multiple_constraints");
  }

  let level = SUPPORT_LEVELS.LIGHT;
  let recommendedMode = RECOMMENDED_MODES.QUICK_GUIDANCE;

  const hasDeepSignal =
    reasons.includes("multiple_constraints");

  const score = reasons.length;

  if (hasDeepSignal || score >= 5) {
    level = SUPPORT_LEVELS.DEEP;
    recommendedMode = RECOMMENDED_MODES.HANDOFF;
  } else if (score >= 2) {
    level = SUPPORT_LEVELS.MODERATE;
    recommendedMode = RECOMMENDED_MODES.MULTI_STEP_SUPPORT;
  }

  return {
    level,
    reasonTags: reasons,
    recommendedMode,
  };
}

export function applyComputedSupportNeed(profile) {
  const decision = computeSupportNeed(profile);

  let nextProfile = setMetaValue(
    profile,
    "supportNeed.level",
    decision.level,
    {
      source: PROFILE_SOURCES.SYSTEM_DERIVED,
      status: PROFILE_STATUS.UNCONFIRMED,
    }
  );

  nextProfile = setListItems(
    nextProfile,
    "supportNeed.reasonTags",
    decision.reasonTags,
    {
      source: PROFILE_SOURCES.SYSTEM_DERIVED,
      status: inferListStatus(decision.reasonTags),
    }
  );

  nextProfile = setMetaValue(
    nextProfile,
    "supportNeed.recommendedMode",
    decision.recommendedMode,
    {
      source: PROFILE_SOURCES.SYSTEM_DERIVED,
      status: PROFILE_STATUS.UNCONFIRMED,
    }
  );

  return nextProfile;
}

function compactList(values) {
  return values.filter((value) => hasMeaningfulValue(value));
}

export function summarizeProfileForConfirmation(profile) {
  const displayLocation = (() => {
    const rawLocation = getMetaValue(profile?.identity?.location);
    const locationSource = getMetaSource(profile?.identity?.location);
    if (!hasMeaningfulValue(rawLocation)) return null;

    const normalized = String(rawLocation || "")
      .replace(/\b\d{4,}\b/g, "")
      .replace(/\s+,/g, ",")
      .replace(/\s{2,}/g, " ")
      .trim();

    if (locationSource !== PROFILE_SOURCES.FROM_CV) {
      return normalized || null;
    }

    const parts = normalized
      .split(",")
      .map((part) =>
        String(part || "")
          .replace(/\b\d[\d/-]*\b/g, "")
          .replace(/\s{2,}/g, " ")
          .trim()
      )
      .filter(Boolean);

    if (!parts.length) return normalized || null;
    if (parts.length === 1) return parts[0];

    return parts.slice(-2).join(", ");
  })();

  const currentStatus = (() => {
    const statusField = profile?.workStatus?.currentStatus;
    const value = getMetaValue(statusField);
    const source = getMetaSource(statusField);
    if (!hasMeaningfulValue(value)) return null;
    if (source === PROFILE_SOURCES.FROM_CV || source === PROFILE_SOURCES.INFERRED) {
      return null;
    }
    return value;
  })();

  const languages = getListItems(profile?.identity?.languages, [])
    .map((entry) => {
      if (isPlainObject(entry) && isMetaField(entry.language)) {
        const language = getMetaValue(entry.language);
        const level = getMetaValue(entry.level);
        return compactList([language, level]).join(" – ");
      }
      return typeof entry === "string" ? entry : null;
    })
    .filter(Boolean);

  const topSkills = compactList([
    ...getListItems(profile?.skills?.domainSkills, []),
    ...getListItems(profile?.skills?.transferableSkills, []),
  ]).slice(0, 8);

  const directions = getListItems(profile?.directions?.immediateTargets, [])
    .map((entry) => {
      if (isPlainObject(entry) && isMetaField(entry.title)) {
        return getMetaValue(entry.title);
      }
      if (typeof entry === "string") return entry;
      if (entry?.label) return entry.label;
      return null;
    })
    .filter(Boolean);

  return {
    identity: {
      displayName: getMetaValue(profile?.identity?.displayName),
      ageGroup: getMetaValue(profile?.identity?.ageGroup),
      location: displayLocation,
      languages,
    },
    goals: {
      primaryGoal: getMetaValue(profile?.goals?.primaryGoal),
      preferredNextStep: getMetaValue(profile?.goals?.preferredNextStep),
      urgency: getMetaValue(profile?.goals?.urgency),
    },
    workStatus: {
      currentStatus,
      availability: getMetaValue(profile?.workStatus?.availability),
      preferredWorkForms: getListItems(profile?.workStatus?.preferredWorkForms, []),
    },
    education: {
      highestLevel: getMetaValue(profile?.education?.highestLevel),
      learningReadiness: getMetaValue(profile?.education?.learningReadiness),
      retrainingInterest: getMetaValue(profile?.education?.retrainingInterest),
    },
    selfAnalysis: {
      strengths: getListItems(profile?.selfAnalysis?.strengths, []).slice(0, 5),
      interests: getListItems(profile?.selfAnalysis?.interests, []).slice(0, 5),
      values: getListItems(profile?.selfAnalysis?.values, []).slice(0, 5),
      dealBreakers: getListItems(profile?.selfAnalysis?.dealBreakers, []).slice(0, 5),
    },
    skills: {
      topSkills,
    },
    directions: {
      immediateTargets: directions,
    },
    supportNeed: computeSupportNeed(profile),
    missingInformation: getListItems(
      profile?.recommendationContext?.missingInformation,
      []
    ),
  };
}
