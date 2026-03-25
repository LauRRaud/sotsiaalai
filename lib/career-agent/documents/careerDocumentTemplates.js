// /lib/career-agent/documents/careerDocumentTemplates.js

import { DOCUMENT_TYPES } from "./careerDocumentFlows.js";
import { getCareerDocumentTemplateText } from "../careerText.js";

export const DOCUMENT_TEMPLATE_LANGUAGES = Object.freeze({
  ET: "et",
  EN: "en",
  RU: "ru",
});

function coerceString(value, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
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
  return Array.from(
    new Set(
      values
        .filter((value) => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean)
    )
  );
}

function requireString(value, errorMessage) {
  const normalized = coerceString(value);
  if (!normalized) {
    throw new Error(errorMessage);
  }
  return normalized;
}

function safeStringList(values = []) {
  return uniqueStrings(
    toSafeArray(values)
      .map((item) => (typeof item === "string" ? item.trim() : null))
      .filter(Boolean)
  );
}

function formatBullets(items = []) {
  return safeStringList(items).map((item) => `• ${item}`);
}

function joinParagraphs(paragraphs = []) {
  return compactList(paragraphs).join("\n\n");
}

function resolveLanguage(language) {
  const normalized = coerceString(language, DOCUMENT_TEMPLATE_LANGUAGES.ET).toLowerCase();
  if (normalized === DOCUMENT_TEMPLATE_LANGUAGES.EN) return DOCUMENT_TEMPLATE_LANGUAGES.EN;
  if (normalized === DOCUMENT_TEMPLATE_LANGUAGES.RU) return DOCUMENT_TEMPLATE_LANGUAGES.RU;
  return DOCUMENT_TEMPLATE_LANGUAGES.ET;
}

function displayName(person = {}) {
  return (
    coerceString(person.displayName) ||
    coerceString(person.fullName) ||
    null
  );
}

function contactLines(person = {}) {
  return compactList([
    coerceString(person.email),
    coerceString(person.phone),
    coerceString(person.location),
  ]);
}

function formatExperienceBlock(experience = []) {
  const safeExperience = toSafeArray(experience);

  if (!safeExperience.length) return [];

  return safeExperience.flatMap((role) => {
    const title = coerceString(role.title);
    const employer = coerceString(role.employer);
    const dateRange = compactList([
      coerceString(role.startDate),
      coerceString(role.endDate),
    ]).join(" – ");

    const header = compactList([
      [title, employer].filter(Boolean).join(", "),
      dateRange,
    ]).join(" | ");

    const bullets = formatBullets([
      ...toSafeArray(role.responsibilities),
      ...toSafeArray(role.achievements),
    ]);

    return compactList([
      header,
      bullets.length ? bullets.join("\n") : null,
    ]);
  });
}

function formatEducationBlock(education = []) {
  const safeEducation = toSafeArray(education);

  if (!safeEducation.length) return [];

  return safeEducation.map((item) => {
    const title = coerceString(item.title);
    const institution = coerceString(item.institution);
    const level = coerceString(item.level);
    const completionStatus = coerceString(item.completionStatus);

    return compactList([
      [title, institution].filter(Boolean).join(", "),
      compactList([level, completionStatus]).join(" | "),
    ]).join("\n");
  });
}

function buildDocumentResult(input = {}) {
  return {
    flow: input.flow || null,
    language: input.language || DOCUMENT_TEMPLATE_LANGUAGES.ET,
    documentType: input.documentType || null,
    title: input.title || null,
    subject: input.subject || null,
    body: input.body || "",
    sections: toSafeArray(input.sections),
    meta: input.meta || {},
  };
}

function validateCvData(data = {}, options = {}) {
  const texts = getTemplateText(options);
  const personName = displayName(data.person || {});
  if (!personName) {
    throw new Error(
      `${texts.errors.invalidPreparedDataMissing} person.displayName.`
    );
  }
}

function validateApplicationEmailData(data = {}, options = {}) {
  const texts = getTemplateText(options);
  requireString(
    displayName(data.person || {}),
    `${texts.errors.invalidPreparedDataMissing} person.displayName.`
  );
  requireString(data.targetRole, `${texts.errors.invalidPreparedDataMissing} targetRole.`);
  requireString(data.motivation, `${texts.errors.invalidPreparedDataMissing} motivation.`);
}

function validateCoverLetterData(data = {}, options = {}) {
  const texts = getTemplateText(options);
  requireString(
    displayName(data.person || {}),
    `${texts.errors.invalidPreparedDataMissing} person.displayName.`
  );
  requireString(data.targetRole, `${texts.errors.invalidPreparedDataMissing} targetRole.`);
  requireString(data.motivation, `${texts.errors.invalidPreparedDataMissing} motivation.`);
}

function validateMotivationLetterData(data = {}, options = {}) {
  const texts = getTemplateText(options);
  requireString(
    displayName(data.person || {}),
    `${texts.errors.invalidPreparedDataMissing} person.displayName.`
  );
  requireString(
    data.targetRole || data.programme,
    `${texts.errors.invalidPreparedDataMissing} targetRole/programme.`
  );
  requireString(data.motivation, `${texts.errors.invalidPreparedDataMissing} motivation.`);
}

function validateRecommendationHelpData(data = {}, options = {}) {
  const texts = getTemplateText(options);
  requireString(
    displayName(data.person || {}),
    `${texts.errors.invalidPreparedDataMissing} person.displayName.`
  );
  requireString(
    data.relationshipToCandidate,
    `${texts.errors.invalidPreparedDataMissing} relationshipToCandidate.`
  );
}

function validatePreparedData(flow, data = {}, options = {}) {
  switch (flow) {
    case DOCUMENT_TYPES.CV_BUILD:
    case DOCUMENT_TYPES.CV_TAILOR:
      return validateCvData(data, options);

    case DOCUMENT_TYPES.APPLICATION_EMAIL:
      return validateApplicationEmailData(data, options);

    case DOCUMENT_TYPES.COVER_LETTER:
      return validateCoverLetterData(data, options);

    case DOCUMENT_TYPES.MOTIVATION_LETTER:
      return validateMotivationLetterData(data, options);

    case DOCUMENT_TYPES.RECOMMENDATION_HELP:
      return validateRecommendationHelpData(data, options);

    default:
      throw new Error(`${getTemplateText(options).errors.unsupportedDocumentFlow}: ${flow}`);
  }
}

function getTemplateText(options = {}) {
  return getCareerDocumentTemplateText(
    resolveLocaleCode(options.language, options.documentLanguage, options.locale)
  );
}

function buildCvBodyET(data = {}, texts = getCareerDocumentTemplateText("et")) {
  const person = data.person || {};
  const summary = coerceString(data.summary);
  const skills = safeStringList(data.skills);
  const strengths = safeStringList(data.strengths);
  const experienceBlock = formatExperienceBlock(data.experience);
  const educationBlock = formatEducationBlock(data.education);

  const sections = compactList([
    displayName(person),
    contactLines(person).join(" | "),
    summary
      ? `${texts.cv.summaryLabel}\n${summary}`
      : null,
    experienceBlock.length
      ? `${texts.cv.experienceLabel}\n${experienceBlock.join("\n\n")}`
      : null,
    educationBlock.length
      ? `${texts.cv.educationLabel}\n${educationBlock.join("\n\n")}`
      : null,
    skills.length
      ? `${texts.cv.skillsLabel}\n${formatBullets(skills).join("\n")}`
      : null,
    strengths.length
      ? `${texts.cv.strengthsLabel}\n${formatBullets(strengths).join("\n")}`
      : null,
  ]);

  return joinParagraphs(sections);
}

function buildCvBodyEN(data = {}, texts = getCareerDocumentTemplateText("en")) {
  const person = data.person || {};
  const summary = coerceString(data.summary);
  const skills = safeStringList(data.skills);
  const strengths = safeStringList(data.strengths);
  const experienceBlock = formatExperienceBlock(data.experience);
  const educationBlock = formatEducationBlock(data.education);

  const sections = compactList([
    displayName(person),
    contactLines(person).join(" | "),
    summary ? `${texts.cv.summaryLabel}\n${summary}` : null,
    experienceBlock.length ? `${texts.cv.experienceLabel}\n${experienceBlock.join("\n\n")}` : null,
    educationBlock.length ? `${texts.cv.educationLabel}\n${educationBlock.join("\n\n")}` : null,
    skills.length ? `${texts.cv.skillsLabel}\n${formatBullets(skills).join("\n")}` : null,
    strengths.length ? `${texts.cv.strengthsLabel}\n${formatBullets(strengths).join("\n")}` : null,
  ]);

  return joinParagraphs(sections);
}

function buildCvBodyRU(data = {}, texts = getCareerDocumentTemplateText("ru")) {
  const person = data.person || {};
  const summary = coerceString(data.summary);
  const skills = safeStringList(data.skills);
  const strengths = safeStringList(data.strengths);
  const experienceBlock = formatExperienceBlock(data.experience);
  const educationBlock = formatEducationBlock(data.education);

  const sections = compactList([
    displayName(person),
    contactLines(person).join(" | "),
    summary ? `${texts.cv.summaryLabel}\n${summary}` : null,
    experienceBlock.length ? `${texts.cv.experienceLabel}\n${experienceBlock.join("\n\n")}` : null,
    educationBlock.length ? `${texts.cv.educationLabel}\n${educationBlock.join("\n\n")}` : null,
    skills.length ? `${texts.cv.skillsLabel}\n${formatBullets(skills).join("\n")}` : null,
    strengths.length ? `${texts.cv.strengthsLabel}\n${formatBullets(strengths).join("\n")}` : null,
  ]);

  return joinParagraphs(sections);
}

function buildCvTemplate(data = {}, options = {}) {
  const language = resolveLanguage(options.language || data.language);
  const texts = getTemplateText({ ...options, language });
  validateCvData(data, { ...options, language });
  const targetRole = coerceString(data.targetRole);
  const title =
    language === DOCUMENT_TEMPLATE_LANGUAGES.EN
      ? targetRole
        ? `CV – ${targetRole}`
        : "CV"
      : language === DOCUMENT_TEMPLATE_LANGUAGES.RU
      ? targetRole
        ? `CV – ${targetRole}`
        : "CV"
      : targetRole
      ? `CV – ${targetRole}`
      : "CV";

  let body = "";
  if (language === DOCUMENT_TEMPLATE_LANGUAGES.EN) {
    body = buildCvBodyEN(data, texts);
  } else if (language === DOCUMENT_TEMPLATE_LANGUAGES.RU) {
    body = buildCvBodyRU(data, texts);
  } else {
    body = buildCvBodyET(data, texts);
  }

  return buildDocumentResult({
    flow: options.flow || DOCUMENT_TYPES.CV_BUILD,
    language,
    documentType: "cv",
    title,
    body,
    meta: {
      targetRole: targetRole || null,
      tailored: options.flow === DOCUMENT_TYPES.CV_TAILOR,
    },
  });
}

function buildApplicationEmailTemplate(data = {}, options = {}) {
  const language = resolveLanguage(options.language || data.language);
  const texts = getTemplateText({ ...options, language });
  validateApplicationEmailData(data, { ...options, language });
  const person = data.person || {};
  const name = displayName(person);
  const targetRole = requireString(
    data.targetRole,
    `${texts.errors.invalidPreparedDataMissing} targetRole.`
  );
  const organization = coerceString(data.organization);
  const motivation = requireString(
    data.motivation,
    `${texts.errors.invalidPreparedDataMissing} motivation.`
  );
  const highlights = formatBullets(
    safeStringList(data.relevantExperienceHighlights || data.skills || [])
  );

  let subject = "";
  let body = "";

  if (language === DOCUMENT_TEMPLATE_LANGUAGES.EN) {
    subject = texts.applicationEmail.subject(targetRole, organization);

    body = joinParagraphs([
      texts.applicationEmail.greeting(organization),
      compactList([
        texts.applicationEmail.applySentence(targetRole, organization),
        motivation || null,
      ]).join(" "),
      highlights.length
        ? `${texts.applicationEmail.backgroundIntro}\n${highlights.join("\n")}`
        : null,
      texts.applicationEmail.closingLine,
      texts.applicationEmail.signoff(name),
    ]);
  } else if (language === DOCUMENT_TEMPLATE_LANGUAGES.RU) {
    subject = texts.applicationEmail.subject(targetRole, organization);

    body = joinParagraphs([
      texts.applicationEmail.greeting(organization),
      compactList([
        texts.applicationEmail.applySentence(targetRole, organization),
        motivation || null,
      ]).join(" "),
      highlights.length
        ? `${texts.applicationEmail.backgroundIntro}\n${highlights.join("\n")}`
        : null,
      texts.applicationEmail.closingLine,
      texts.applicationEmail.signoff(name),
    ]);
  } else {
    subject = texts.applicationEmail.subject(targetRole, organization);

    body = joinParagraphs([
      texts.applicationEmail.greeting(organization),
      compactList([
        texts.applicationEmail.applySentence(targetRole, organization),
        motivation || null,
      ]).join(" "),
      highlights.length
        ? `${texts.applicationEmail.backgroundIntro}\n${highlights.join("\n")}`
        : null,
      texts.applicationEmail.closingLine,
      texts.applicationEmail.signoff(name),
    ]);
  }

  return buildDocumentResult({
    flow: DOCUMENT_TYPES.APPLICATION_EMAIL,
    language,
    documentType: "application_email",
    title: subject,
    subject,
    body,
    meta: {
      targetRole: targetRole || null,
      organization: organization || null,
    },
  });
}

function buildCoverLetterTemplate(data = {}, options = {}) {
  const language = resolveLanguage(options.language || data.language);
  const texts = getTemplateText({ ...options, language });
  validateCoverLetterData(data, { ...options, language });
  const person = data.person || {};
  const name = displayName(person);
  const targetRole = requireString(
    data.targetRole,
    `${texts.errors.invalidPreparedDataMissing} targetRole.`
  );
  const organization = coerceString(data.organization);
  const motivation = requireString(
    data.motivation,
    `${texts.errors.invalidPreparedDataMissing} motivation.`
  );
  const highlights = formatBullets(safeStringList(data.relevantExperienceHighlights));
  const strengths = formatBullets(safeStringList(data.skills || data.strengths || []));

  let title = "";
  let body = "";

  if (language === DOCUMENT_TEMPLATE_LANGUAGES.EN) {
    title = texts.coverLetter.title(targetRole, organization);

    body = joinParagraphs([
      texts.coverLetter.greeting(organization),
      compactList([
        texts.coverLetter.applySentence(targetRole, organization),
        motivation || null,
      ]).join(" "),
      highlights.length ? `${texts.coverLetter.experienceIntro}\n${highlights.join("\n")}` : null,
      strengths.length ? `${texts.coverLetter.strengthsIntro}\n${strengths.join("\n")}` : null,
      texts.coverLetter.closingLine,
      texts.coverLetter.signoff(name),
    ]);
  } else if (language === DOCUMENT_TEMPLATE_LANGUAGES.RU) {
    title = texts.coverLetter.title(targetRole, organization);

    body = joinParagraphs([
      texts.coverLetter.greeting(organization),
      compactList([
        texts.coverLetter.applySentence(targetRole, organization),
        motivation || null,
      ]).join(" "),
      highlights.length ? `${texts.coverLetter.experienceIntro}\n${highlights.join("\n")}` : null,
      strengths.length ? `${texts.coverLetter.strengthsIntro}\n${strengths.join("\n")}` : null,
      texts.coverLetter.closingLine,
      texts.coverLetter.signoff(name),
    ]);
  } else {
    title = texts.coverLetter.title(targetRole, organization);

    body = joinParagraphs([
      texts.coverLetter.greeting(organization),
      compactList([
        texts.coverLetter.applySentence(targetRole, organization),
        motivation || null,
      ]).join(" "),
      highlights.length ? `${texts.coverLetter.experienceIntro}\n${highlights.join("\n")}` : null,
      strengths.length ? `${texts.coverLetter.strengthsIntro}\n${strengths.join("\n")}` : null,
      texts.coverLetter.closingLine,
      texts.coverLetter.signoff(name),
    ]);
  }

  return buildDocumentResult({
    flow: DOCUMENT_TYPES.COVER_LETTER,
    language,
    documentType: "cover_letter",
    title,
    body,
    meta: {
      targetRole: targetRole || null,
      organization: organization || null,
    },
  });
}

function buildMotivationLetterTemplate(data = {}, options = {}) {
  const language = resolveLanguage(options.language || data.language);
  const texts = getTemplateText({ ...options, language });
  validateMotivationLetterData(data, { ...options, language });
  const person = data.person || {};
  const name = displayName(person);
  const targetRole = requireString(
    data.targetRole || data.programme,
    `${texts.errors.invalidPreparedDataMissing} targetRole/programme.`
  );
  const motivation = requireString(
    data.motivation,
    `${texts.errors.invalidPreparedDataMissing} motivation.`
  );
  const values = formatBullets(safeStringList(data.values));
  const interests = formatBullets(safeStringList(data.interests));
  const highlights = formatBullets(safeStringList(data.relevantExperienceHighlights));

  let title = "";
  let body = "";

  if (language === DOCUMENT_TEMPLATE_LANGUAGES.EN) {
    title = texts.motivationLetter.title(targetRole);
    body = joinParagraphs([
      texts.motivationLetter.greeting,
      compactList([
        texts.motivationLetter.motivationSentence(targetRole),
        motivation || null,
      ]).join(" "),
      highlights.length ? `${texts.motivationLetter.backgroundIntro}\n${highlights.join("\n")}` : null,
      values.length ? `${texts.motivationLetter.valuesIntro}\n${values.join("\n")}` : null,
      interests.length ? `${texts.motivationLetter.interestsIntro}\n${interests.join("\n")}` : null,
      texts.motivationLetter.signoff(name),
    ]);
  } else if (language === DOCUMENT_TEMPLATE_LANGUAGES.RU) {
    title = texts.motivationLetter.title(targetRole);
    body = joinParagraphs([
      texts.motivationLetter.greeting,
      compactList([
        texts.motivationLetter.motivationSentence(targetRole),
        motivation || null,
      ]).join(" "),
      highlights.length ? `${texts.motivationLetter.backgroundIntro}\n${highlights.join("\n")}` : null,
      values.length ? `${texts.motivationLetter.valuesIntro}\n${values.join("\n")}` : null,
      interests.length ? `${texts.motivationLetter.interestsIntro}\n${interests.join("\n")}` : null,
      texts.motivationLetter.signoff(name),
    ]);
  } else {
    title = texts.motivationLetter.title(targetRole);
    body = joinParagraphs([
      texts.motivationLetter.greeting,
      compactList([
        texts.motivationLetter.motivationSentence(targetRole),
        motivation || null,
      ]).join(" "),
      highlights.length ? `${texts.motivationLetter.backgroundIntro}\n${highlights.join("\n")}` : null,
      values.length ? `${texts.motivationLetter.valuesIntro}\n${values.join("\n")}` : null,
      interests.length ? `${texts.motivationLetter.interestsIntro}\n${interests.join("\n")}` : null,
      texts.motivationLetter.signoff(name),
    ]);
  }

  return buildDocumentResult({
    flow: DOCUMENT_TYPES.MOTIVATION_LETTER,
    language,
    documentType: "motivation_letter",
    title,
    body,
    meta: {
      targetRole: targetRole || null,
    },
  });
}

function buildRecommendationHelpTemplate(data = {}, options = {}) {
  const language = resolveLanguage(options.language || data.language);
  const texts = getTemplateText({ ...options, language });
  validateRecommendationHelpData(data, { ...options, language });
  const person = data.person || {};
  const candidateName = displayName(person);
  const relationship = requireString(
    data.relationshipToCandidate,
    `${texts.errors.invalidPreparedDataMissing} relationshipToCandidate.`
  );
  const targetRole = coerceString(data.targetRole);
  const examples = formatBullets(safeStringList(data.examples || data.strengths || []));

  let title = "";
  let body = "";

  if (language === DOCUMENT_TEMPLATE_LANGUAGES.EN) {
    title = texts.recommendationHelp.title(candidateName);
    body = joinParagraphs([
      `${texts.recommendationHelp.candidateLabel} ${candidateName}`,
      relationship ? `${texts.recommendationHelp.relationshipLabel} ${relationship}` : null,
      targetRole ? `${texts.recommendationHelp.targetRoleLabel} ${targetRole}` : null,
      examples.length ? `${texts.recommendationHelp.examplesLabel}\n${examples.join("\n")}` : null,
      texts.recommendationHelp.closingLine,
    ]);
  } else if (language === DOCUMENT_TEMPLATE_LANGUAGES.RU) {
    title = texts.recommendationHelp.title(candidateName);
    body = joinParagraphs([
      `${texts.recommendationHelp.candidateLabel} ${candidateName}`,
      relationship ? `${texts.recommendationHelp.relationshipLabel} ${relationship}` : null,
      targetRole ? `${texts.recommendationHelp.targetRoleLabel} ${targetRole}` : null,
      examples.length ? `${texts.recommendationHelp.examplesLabel}\n${examples.join("\n")}` : null,
      texts.recommendationHelp.closingLine,
    ]);
  } else {
    title = texts.recommendationHelp.title(candidateName);
    body = joinParagraphs([
      `${texts.recommendationHelp.candidateLabel} ${candidateName}`,
      relationship ? `${texts.recommendationHelp.relationshipLabel} ${relationship}` : null,
      targetRole ? `${texts.recommendationHelp.targetRoleLabel} ${targetRole}` : null,
      examples.length ? `${texts.recommendationHelp.examplesLabel}\n${examples.join("\n")}` : null,
      texts.recommendationHelp.closingLine,
    ]);
  }

  return buildDocumentResult({
    flow: DOCUMENT_TYPES.RECOMMENDATION_HELP,
    language,
    documentType: "recommendation_help",
    title,
    body,
    meta: {
      candidateName,
      relationship: relationship || null,
      targetRole: targetRole || null,
    },
  });
}

export function buildDocumentTemplate(flow, data = {}, options = {}) {
  const language = resolveLanguage(options.language || data.language);
  const texts = getTemplateText({ ...options, language });
  validatePreparedData(flow, data, { ...options, language });

  switch (flow) {
    case DOCUMENT_TYPES.CV_BUILD:
    case DOCUMENT_TYPES.CV_TAILOR:
      return buildCvTemplate(data, { ...options, flow, language });

    case DOCUMENT_TYPES.APPLICATION_EMAIL:
      return buildApplicationEmailTemplate(data, options);

    case DOCUMENT_TYPES.COVER_LETTER:
      return buildCoverLetterTemplate(data, options);

    case DOCUMENT_TYPES.MOTIVATION_LETTER:
      return buildMotivationLetterTemplate(data, options);

    case DOCUMENT_TYPES.RECOMMENDATION_HELP:
      return buildRecommendationHelpTemplate(data, { ...options, language });

    default:
      throw new Error(`${texts.errors.unsupportedDocumentFlow}: ${flow}`);
  }
}

export {
  buildCvTemplate,
  buildApplicationEmailTemplate,
  buildCoverLetterTemplate,
  buildMotivationLetterTemplate,
  buildRecommendationHelpTemplate,
};
