export const careerResponseTextEn = Object.freeze({
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
});
