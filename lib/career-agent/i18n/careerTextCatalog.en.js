export const careerTextCatalogEn = Object.freeze({
  actionPlan: Object.freeze({
  clarifyProfile: {
    title: "Clarify the key profile facts",
    descriptionWithMissing:
      "Before choosing the next step, it is worth clarifying these areas: {missing}.",
    descriptionFallback:
      "Clarify your experience, skills, or work preferences so the next suggestion can be more accurate.",
    rationale: [
      "The profile still has gaps or unconfirmed information.",
      "A clearer profile helps produce a more realistic next step.",
    ],
  },
  clarifyDirection: {
    title: "Define 1–3 realistic directions",
    description:
      "Write down 1–3 jobs, roles, or study paths that you want to compare or explore first.",
    rationale: [
      "A clearer target helps avoid overly broad recommendations.",
      "Clarifying the direction makes it easier to assess fit in the next step.",
    ],
  },
  buildCv: {
    titleWithSignals: "Create or improve a CV draft",
    titleWithoutSignals: "Create an initial CV draft",
    descriptionWithSignals:
      "Bring your experience, education, and main skills into one clear CV structure.",
    descriptionWithoutSignals:
      "Start by listing your experience, education, and skills so we can create an initial CV draft.",
    rationale: [
      "A CV is a practical basis for applying and taking the next steps.",
      "The document flow can help structure the existing information better.",
    ],
    documentReason: "A useful next step is building or updating a CV.",
  },
  applyNow: {
    title: "Prepare the application",
    titleSuffixSeparator: ": ",
    descriptionWithOpportunity:
      "Tailor your CV and application text to the specific opportunity \"{title}\".",
    descriptionFallback:
      "Choose one concrete opportunity and tailor your CV and application text to it.",
    rationaleFitLabel: "The current fit has been assessed at: {fitLabel}.",
    documentReason:
      "Application preparation usually requires tailoring the CV.",
  },
  compareOptions: {
    title: "Compare 1–3 realistic options",
    descriptionWithDirections:
      "Start by comparing these directions: {directions}. See what fits your experience, interests, and constraints best.",
    descriptionWithOpportunity:
      "Compare at least one realistic target, starting with \"{title}\".",
    descriptionFallback:
      "Compare 1–3 realistic jobs, roles, or study paths and see what suits you best.",
    rationale: [
      "Comparison helps you make a more informed choice before acting.",
      "This step is especially useful when you have several possible directions.",
    ],
  },
  exploreLearning: {
    titleWithEducationGoal: "Explore suitable study paths",
    titleDefault: "Explore skill development options",
    descriptionWithRetraining:
      "Map 1–3 learning or retraining options that would bring you closer to the target you want.",
    descriptionFallback:
      "Explore which courses or study paths would support your next realistic step.",
    rationale: [
      "Learning or upskilling can reduce fit gaps.",
      "This step works well when the goal is a new field or stronger skills.",
    ],
  },
  prepareInterview: {
    title: "Prepare for an interview",
    description:
      "List your strengths, past examples, and answers to the main interview questions.",
    rationale: [
      "Interview preparation helps you present your fit more convincingly.",
    ],
  },
  requestSupport: {
    title: "Consider additional human support",
    descriptionWithReasons:
      "In the current situation, additional support may be useful because {reasons} are in play.",
    descriptionFallback:
      "The current situation may require more support or a human advisor.",
    rationale: [
      "Not every situation should be handled with AI support alone.",
      "Additional human support can help you reach a realistic solution faster.",
    ],
    reasons: {
      minorUser: "additional needs related to being a minor",
      multipleConstraints: "multiple simultaneous constraints",
      highUrgency: "high urgency",
      incomePressure: "strong income pressure",
    },
  },
}),
  adapter: Object.freeze({
  errors: {
    turnPayloadMustBeObject: "Career turn payload must be an object.",
    questionAnswerPayloadMustBeObject: "Career question answer payload must be an object.",
    questionAnswerRequiresQuestionId: "Career question answer payload requires questionId.",
  },
  warnings: {
    canonicalPatchMissing:
      "The payload includes cvParseResult output, but the canonical profile patch is missing. Add the raw parser adapter separately.",
  },
}),
  cvParser: Object.freeze({
  confidenceLabel: "CV parser confidence",
  summaryDetected: "The CV parser provided profile summary text.",
  emptyOrUnsupported: "The CV parser result is empty or unsupported.",
}),
  documentFlow: Object.freeze({
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
}),
  documentGenerator: Object.freeze({
  summary: {
    primaryGoalLabel: "Primary goal",
    strengthsLabel: "Strengths",
    interestsLabel: "Interests",
  },
  errors: {
    unsupportedDocumentFlow: "Unsupported document flow",
    invalidPreparedData: "Invalid prepared data.",
    invalidPreparedDataMissing: "Invalid prepared data: missing",
  },
}),
  documentTemplate: Object.freeze({
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
}),
  handoff: Object.freeze({
  general: {
    testingBlockedByGuardianConsent:
      "It is not appropriate to continue with testing or assessment right now without the required guardian or parent consent.",
    requiredPrivacyConsentDenied:
      "The required consent for this action was explicitly denied, so it is not appropriate to continue this flow with AI support.",
    forcedHandoffDefault:
      "In the current situation, it is recommended to continue with human support.",
    crisisRisk:
      "Based on the current information, this may be a situation that requires urgent human or crisis-service intervention.",
    highDistress:
      "The current emotional load appears to be high enough that further support should come from a human.",
    humanAssessmentNeeded:
      "Based on the current profile, the next step could be involving a human counsellor or other additional support.",
    minorNeedsAdditionalSupport:
      "For a minor user, this activity may require additional support from an adult or specialist.",
    complexBarrierSet:
      "The current situation includes several simultaneous constraints, so further support could happen with human involvement.",
    insufficientEvidence:
      "There is currently too little reliable information to give a sufficiently confident and responsible recommendation with AI alone.",
    strongResistanceOrMismatch:
      "The current direction or suggestions do not seem to fit the user well, so the next step could be involving a human.",
  },
  ethical: {
    sharingWithoutValidConsent:
      "Sharing with third parties cannot continue without clear and valid consent.",
    testingEthicsLimit:
      "It is not ethically appropriate to continue with testing or assessment until the necessary consent and frame are clear.",
    privacyConsentDenied:
      "The required consent was denied, so it is not ethically appropriate to continue this activity with AI support.",
    deceptiveOrImpersonationRequest:
      "AI must not impersonate the user or help with deceptive or misleading representation.",
    thirdPartyRepresentationRequest:
      "Representing the user or speaking on their behalf needs clearer human oversight and responsibility.",
    legalOrFormalDecisionRequest:
      "AI cannot provide a binding or official decision. In this situation, a human or competent authority must make the call.",
    minorContextRequiresAdultParticipation:
      "For a minor user, this situation requires involvement from an adult or responsible support person.",
    identityOrContextTooUnclear:
      "The current context is too unclear or incomplete for it to be ethically justified to give strong guidance using AI alone.",
    roleConfusionOrOverreliance:
      "A clearer role boundary or human involvement is needed here to avoid misunderstanding AI's role.",
    highStakesHumanReviewNeeded:
      "For a high-impact or high-risk decision, it is ethically appropriate to involve a human before taking the final step.",
    specialistCollaborationNeeded:
      "The situation requires collaboration between multiple parties or specialists, which should not be left to AI alone.",
  },
}),
  matching: Object.freeze({
  fitLabels: {
    strong: "strong fit",
    possible: "possible fit",
    needs_step: "needs a next step",
  },
  nextStepMissingRequirements(missingRequirements = []) {
    return `Clarify or fill in these missing points first: ${missingRequirements.join(", ")}.`;
  },
  nextStepEducation:
    "Compare the admission requirements and fit for this study path with your goal.",
  nextStepGeneral:
    "Review the application or next practical step for this direction.",
  evidence: {
    directionMatch: "direction matches: ",
    experienceMatch: "experience matches: ",
    skillMatch: "skill matches: ",
    extraValue: "extra value: ",
  },
  oska: {
    occupationMatch: "OSKA occupation match: ",
    fieldMatch: "OSKA field: ",
    skillMatches: "OSKA skill matches: ",
    educationSignal: "OSKA preparation or study path: ",
    workCondition: "OSKA work condition: ",
    confidencePrefix: "OSKA occupation confidence: ",
  },
  confidence: {
    limitedConfirmedInfo: "there is still only a limited amount of confirmed information in the profile",
    partialSkillOverlap: "some of the skill overlap is partial rather than complete",
    directionNotConfirmed: "the desired direction is not yet clearly confirmed in the profile",
    languageRequirementsNeedWork: "language requirements need clarification or strengthening",
  },
}),
  orchestrator: Object.freeze({
  warnings: {
    oskaRankingFallback:
      "OSKA enrichment failed, so the standard matching logic was used.",
    oskaDirectionFallback:
      "OSKA direction enrichment failed, so the existing directions were used.",
  },
  direction: {
    oskaOccupationPrefix: "OSKA occupation match",
    oskaFieldPrefix: "OSKA field",
    possibleDirectionFallback: "Possible direction",
  },
  errors: {
    unknownCareerQuestion: "Unknown career question",
  },
}),
  privacy: Object.freeze({
  rawCvRetentionNotAllowed:
    "Raw CV retention is not allowed by default under the current privacy policy.",
  rawCvRetentionDisabledByDefault:
    "Raw CV retention is disabled by default. Keep only structured profile data unless policy changes explicitly.",
  requiredConsentDenied:
    "A required privacy or consent decision has been explicitly denied.",
  requiredConsentMissing:
    "A required privacy or consent decision is missing or not yet confirmed.",
}),
  question: Object.freeze({
  questions: {
    intake_reason: {
      prompt: "Briefly describe what kind of support you need right now with your career or work life.",
    },
    identity_display_name: {
      prompt: "How would you like me to address you?",
    },
    identity_age_group: {
      prompt: "Which age group describes you best?",
      options: {
        under_18: "Under 18",
        "18_24": "18–24",
        "25_34": "25–34",
        "35_49": "35–49",
        "50_plus": "50+",
      },
    },
    identity_location: {
      prompt: "In which city or region do you prefer to look for work or study opportunities?",
    },
    consent_profile_storage: {
      prompt:
        "Do you agree that your career profile is stored so guidance can continue consistently?",
    },
    consent_job_matching: {
      prompt:
        "Do you agree that your profile may be used to assess fit for job or direction suggestions?",
    },
    consent_document_generation: {
      prompt:
        "Do you agree that your information may be used to draft documents?",
    },
    consent_testing: {
      prompt:
        "Do you agree to testing or assessment-like activities if they turn out to be necessary?",
    },
    consent_minor_guardian: {
      prompt:
        "Is the consent of a parent or guardian for testing available?",
    },
    profile_background_summary: {
      prompt:
        "Briefly describe your recent work or study background and where you would like to get next.",
    },
    confirm_profile_approved: {
      prompt:
        "Is this profile summary accurate and detailed enough for us to continue?",
    },
    self_strengths: {
      prompt: "What are your main strengths? You can add multiple keywords.",
    },
    self_interests: {
      prompt: "Which topics, areas, or activities genuinely interest you?",
    },
    self_values: {
      prompt: "What matters to you at work? For example stability, development, meaning, flexibility.",
    },
    self_development_needs: {
      prompt: "In which skills or areas would you like to develop further?",
    },
    self_deal_breakers: {
      prompt: "Which working conditions or roles definitely do not suit you?",
    },
    self_competitive_advantages: {
      prompt: "What gives you an edge over others? For example experience, languages, network, or personal qualities.",
    },
    work_pref_pace: {
      prompt: "What work pace suits you?",
      options: {
        steady: "Rather calm and steady",
        varied: "Varied",
        fast: "Fast and dynamic",
      },
    },
    work_pref_team_vs_solo: {
      prompt: "Do you prefer team work or independent work?",
      options: {
        team: "Mostly team work",
        solo: "Mostly independent work",
        mixed: "Both are fine",
      },
    },
    work_pref_shift_work_ok: {
      prompt: "Does shift work suit you?",
    },
    work_pref_remote_ok: {
      prompt: "Does remote work suit you?",
    },
    work_pref_travel_ok: {
      prompt: "Does work-related travel or movement suit you?",
    },
    clarify_problem_statement: {
      prompt: "What is your main career question or obstacle right now?",
    },
    work_current_status: {
      prompt: "What is your current work or study status?",
      options: {
        employed: "Employed",
        unemployed: "Unemployed",
        studying: "Studying",
        changing_role: "I want a job or career change",
        returning_after_break: "Returning after a break",
      },
    },
    work_availability: {
      prompt: "How soon are you ready to take the next step?",
      options: {
        immediately: "Immediately",
        within_month: "Within the next month",
        within_3_months: "Within 1–3 months",
        later: "Later",
      },
    },
    work_mobility_constraints: {
      prompt: "Do you have any mobility or location constraints that should be considered?",
    },
    work_other_constraints: {
      prompt: "Are there any other constraints or conditions I should take into account when giving suggestions?",
    },
    goal_primary: {
      prompt: "What is your main goal right now?",
      options: {
        get_job: "Find a job",
        change_career: "Change career direction",
        choose_education: "Find a suitable study path",
        reskill: "Learn new skills",
        gain_clarity: "Gain clarity",
      },
    },
    goal_preferred_next_step: {
      prompt: "Which next step feels most realistic or useful to you?",
      options: {
        apply_now: "Apply now",
        compare_options: "Compare options",
        build_cv: "Create or update a CV",
        explore_learning: "Explore study opportunities",
        prepare_interview: "Prepare for an interview",
        request_support: "I need more support before deciding",
      },
    },
    goal_urgency: {
      prompt: "How urgent is this topic for you right now?",
      options: {
        low: "Not urgent",
        medium: "Moderately urgent",
        high: "Urgent",
        urgent: "Very urgent / pressing",
      },
    },
    goal_income_pressure: {
      prompt: "How strong is the income pressure for you right now?",
      options: {
        low: "Low",
        medium: "Medium",
        high: "High",
        very_high: "Very high",
      },
    },
    goal_willingness_to_compromise: {
      prompt: "How willing are you to make temporary compromises to get moving?",
      options: {
        low: "I would rather not compromise",
        medium: "I am open to some compromise",
        high: "I am fairly flexible",
      },
    },
    education_learning_readiness: {
      prompt: "How ready are you right now to learn or improve your skills?",
      options: {
        low: "Not really right now",
        medium: "Moderately ready",
        high: "Very ready",
      },
    },
    education_retraining_interest: {
      prompt: "Are you open to retraining or learning a new field?",
    },
    direction_seed_roles: {
      prompt: "Which jobs, roles, or fields seem most realistic or interesting to you right now?",
    },
    analyze_option_focus: {
      prompt: "Which direction or option would you like to compare first in more detail?",
    },
    action_plan_readiness: {
      prompt: "Are you ready to agree on at least one concrete next step?",
    },
  },
}),
  response: Object.freeze({
  stateIntro: {
    titles: {
      intake: "Let's start",
      service_level_check: "I'll check what kind of support is needed",
      contact: "Let's set the contact channel",
      agreements: "Let's agree on the important conditions",
      parse_profile: "I'm preparing a profile draft",
      confirm_profile: "Let's review the profile together",
      self_analysis: "Let's explore your strengths and preferences",
      clarify_problem: "Let's define the main problem more clearly",
      set_goals: "Let's set the goal",
      shortlist_directions: "Let's find realistic directions",
      analyze_options: "Let's compare options",
      action_plan: "Let's make a practical plan",
      summary: "I'll give a short summary",
      follow_up_or_handoff: "Let's decide the next step",
      handoff: "Let's look at a handoff option",
      default: "Let's continue with the next step",
    },
    message:
      "We'll move step by step so we can reach a realistic and practical next step.",
  },
  questionSet: {
    title: "I need a bit more detail",
    message:
      "Please answer these questions. Based on them, I can make the next step more precise.",
  },
  profileConfirmation: {
    title: "Please review the profile",
    message:
      "This is my current summary of your profile. Please check whether it is accurate and complete enough for us to continue.",
    labels: {
      name: "Name or salutation",
      primaryGoal: "Primary goal",
      nextStep: "Preferred next step",
      currentStatus: "Current work or study status",
    },
  },
  directionShortlist: {
    title: "Here are realistic directions to explore next",
    message:
      "I selected a few directions that seem reasonable or worth exploring based on your profile.",
    missingTitle: "Missing requirements",
    defaultTitle: "Possible direction",
  },
  optionAnalysis: {
    title: "Here is the fit comparison",
    message:
      "I compared the options based on your profile. See what fits better, what is missing, and where it makes sense to go next.",
    defaultTitle: "Option",
    missingTitle: "What is missing",
    nextStep: "Next step",
    score: "Score",
  },
  actionPlan: {
    title: "Recommended action plan",
    message:
      "I put together a practical set of next steps. Start with the first step and then move on to the next ones.",
    defaultTitle: "Action step",
    priority: "Priority",
    status: "Status",
    documentFlow: "Document flow",
  },
  summary: {
    title: "Short summary",
    message:
      "I'll briefly summarize where we got to and what is worth doing next.",
    labels: {
      goal: "Goal",
      mainDirection: "Main direction",
      firstStep: "First practical step",
      supportMode: "Suggested support mode",
    },
  },
  documentFlow: {
    titleDefault: "The next step could be a document draft",
    message:
      "It makes sense to continue into the document drafting flow from here.",
    missingInputTitle: "Missing inputs",
    blockedTitle: "A clear consent is needed before continuing",
    blockedMessage:
      "This next step requires confirmed consent. I can't continue with this flow right now.",
    transitionTitleMap: {
      CV_BUILD: "The next step could be building a CV",
      CV_TAILOR: "The next step could be tailoring a CV",
      APPLICATION_EMAIL: "The next step could be an application email draft",
      COVER_LETTER: "The next step could be a cover letter",
      MOTIVATION_LETTER: "The next step could be a motivation letter",
      RECOMMENDATION_HELP:
        "The next step could be preparing a recommendation request",
    },
  },
  documentQuestions: {
    title: "We need a bit more detail before drafting",
    message:
      "The document draft still needs a few inputs. If you answer these questions, I can prepare the draft in the next step.",
    missingPrompt: "Please clarify this information.",
  },
  consentBlocked: {
    title: "A clear consent is needed before continuing",
    message:
      "This next step requires confirmed consent. I can't continue with this flow right now.",
  },
  handoff: {
    title: "It would make sense to continue with additional support or a person",
    message:
      "Based on the current situation, it would be sensible to involve additional support or a human so we can move forward more safely and accurately.",
    labels: {
      reason: "Reason",
      channel: "Suggested channel",
    },
  },
}),
  run: Object.freeze({
  errors: {
    unknownServerError: "Unknown server error.",
  },
}),
  taxonomy: Object.freeze({
  errors: {
    clientRequiresBaseUrl: "The OSKA API client requires a baseUrl value.",
    missingEndpoint: "Missing endpoint for the OSKA resource type.",
    requestFailed: "OSKA API request failed with status",
    invalidJson: "OSKA API did not return JSON.",
    unknownApiError: "Unknown OSKA API error.",
    refreshError: "Unknown taxonomy refresh error.",
    refreshFailed: "Failed to refresh career taxonomy.",
    notReady: "Career taxonomy is not ready. Call ensureReady() first.",
    sharedConfigMismatch:
      "Shared career taxonomy service already exists with different configuration.",
  },
}),
  ui: Object.freeze({
  followUpLabel: "Next related step",
  profile: {
    name: "Name or salutation",
    location: "Location",
    primaryGoal: "Primary goal",
    nextStep: "Preferred next step",
    currentStatus: "Current status",
    strengths: "Strengths",
    directions: "Possible directions",
  },
  direction: {
    defaultTitle: "Possible direction",
    missingTitle: "Missing requirements",
  },
  option: {
    defaultTitle: "Option",
    score: "Score",
    missingTitle: "What is missing",
    nextStep: "Next step",
  },
  action: {
    defaultTitle: "Action step",
    priority: "Priority",
    status: "Status",
    documentFlow: "Document flow",
  },
  document: {
    flow: "Flow",
    status: "Status",
    missingInputCount: "Missing inputs",
    subject: "Subject",
    draftReady: "Draft is ready.",
    finalReady: "Final version is ready for download.",
    reviewAndConfirm: "Review and confirm it in the workspace. After confirmation it becomes downloadable.",
    savedToDocuments: "Draft saved to Documents.",
    savedToBuilder: "Draft saved to the document builder.",
    openDocuments: "Open in Documents",
    openBuilder: "Open in document builder",
    download: "Download",
  },
  question: {
    defaultTitle: "Question",
    required: "required",
    affirmative: "affirmative",
    answerInNextMessage: "Reply in your next message.",
    booleanAnswerInNextMessage: "Reply in your next message with yes or no.",
    exitModeHint: "To exit this mode, press the briefcase icon.",
    yes: "Yes",
    no: "No",
    confirmSelection: "Confirm selection",
    selectionHint: "Choose the relevant items and confirm.",
    textPlaceholder: "Write your answer here or reply in the chat.",
    replyInChatHint: "You can also answer with a normal message.",
    submitAnswer: "Send answer",
  },
}),
});
