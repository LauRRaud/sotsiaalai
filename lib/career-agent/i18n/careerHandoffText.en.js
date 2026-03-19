export const careerHandoffTextEn = Object.freeze({
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
});
