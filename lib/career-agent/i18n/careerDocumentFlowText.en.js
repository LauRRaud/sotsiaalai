export const careerDocumentFlowTextEn = Object.freeze({
  flows: {
    CV_BUILD: {
      label: "CV building",
      description: "Create a new or initial CV based on the existing profile.",
    },
    CV_TAILOR: {
      label: "CV tailoring",
      description: "Tailor the existing CV for a specific role or opportunity.",
    },
    APPLICATION_EMAIL: {
      label: "Application email",
      description: "Draft a short application email for a specific opportunity.",
    },
    COVER_LETTER: {
      label: "Cover letter",
      description: "Draft a structured cover letter for a job application.",
    },
    MOTIVATION_LETTER: {
      label: "Motivation letter",
      description: "Draft a motivation letter for a study or application context.",
    },
    RECOMMENDATION_HELP: {
      label: "Recommendation prep",
      description: "Prepare the core information for a recommendation letter or request.",
    },
  },
  inputs: {
    document_generation_consent: {
      prompt: "Confirmed consent for document generation is required to draft the document.",
    },
    person_identity: {
      prompt: "How should you be referred to in the document?",
    },
    experience_or_education: {
      prompt: "Please briefly add your experience or education that should be considered in the document.",
    },
    skills_or_strengths: {
      prompt: "Which skills or strengths should definitely be highlighted in this document?",
    },
    target_role_or_opportunity: {
      prompt: "Which role, job, or opportunity is this document for?",
    },
    target_role: {
      prompt: "Which role or position should the document target?",
    },
    motivation_focus: {
      prompt: "Why is this opportunity or direction important to you?",
    },
    relevant_experience_highlights: {
      prompt: "Which past experience or achievement should definitely be highlighted?",
    },
    values_or_interests: {
      prompt: "Which interests, values, or motivations best fit the context of this document?",
    },
    relationship_to_candidate: {
      prompt: "What is the recommender's or writer's relationship to the candidate?",
    },
    strengths_or_examples: {
      prompt: "Which strengths or concrete examples should definitely be mentioned in the recommendation?",
    },
    language_preference: {
      prompt: "In which language should the document be prepared?",
      options: {
        et: "Estonian",
        en: "English",
        ru: "Russian",
      },
    },
  },
});
