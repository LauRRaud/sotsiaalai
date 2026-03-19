export const careerDocumentTemplateTextEn = Object.freeze({
  errors: {
    unsupportedDocumentFlow: "Unsupported document flow",
    invalidPreparedData: "Invalid prepared data.",
    invalidPreparedDataMissing: "Invalid prepared data: missing",
  },
  cv: {
    summaryLabel: "Profile",
    experienceLabel: "Experience",
    educationLabel: "Education",
    skillsLabel: "Skills",
    strengthsLabel: "Strengths",
  },
  applicationEmail: {
    subject(targetRole, organization) {
      return organization
        ? `Application for ${targetRole} at ${organization}`
        : `Application for ${targetRole}`;
    },
    greeting(organization) {
      return `Hello${organization ? ` ${organization}` : ""},`;
    },
    applySentence(targetRole, organization) {
      return `I would like to apply for the ${targetRole} position${organization ? ` at ${organization}` : ""}.`;
    },
    backgroundIntro: "A few relevant points about my background:",
    closingLine: "I would be glad to discuss my background and suitability further.",
    signoff(name) {
      return `Best regards,\n${name}`;
    },
  },
  coverLetter: {
    title(targetRole, organization) {
      return organization
        ? `Cover Letter – ${targetRole} / ${organization}`
        : `Cover Letter – ${targetRole}`;
    },
    greeting(organization) {
      return `Dear Hiring Team${organization ? ` at ${organization}` : ""},`;
    },
    applySentence(targetRole, organization) {
      return `I am writing to apply for the ${targetRole} role${organization ? ` at ${organization}` : ""}.`;
    },
    experienceIntro: "Relevant experience:",
    strengthsIntro: "Key strengths:",
    closingLine: "Thank you for considering my application.",
    signoff(name) {
      return `Sincerely,\n${name}`;
    },
  },
  motivationLetter: {
    title(targetRole) {
      return `Motivation Letter – ${targetRole}`;
    },
    greeting: "To whom it may concern,",
    motivationSentence(targetRole) {
      return `I am writing to express my motivation for ${targetRole}.`;
    },
    backgroundIntro: "Relevant background:",
    valuesIntro: "Values and goals:",
    interestsIntro: "Relevant interests:",
    signoff(name) {
      return `Sincerely,\n${name}`;
    },
  },
  recommendationHelp: {
    title(candidateName) {
      return `Recommendation Support – ${candidateName}`;
    },
    candidateLabel: "Candidate:",
    relationshipLabel: "Relationship:",
    targetRoleLabel: "Target role or opportunity:",
    examplesLabel: "Suggested strengths or examples:",
    closingLine: "This note can be used as a basis for preparing a recommendation or asking for one.",
  },
});
