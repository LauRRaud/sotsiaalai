export const ROLE_BOUNDARIES_SCHEMA_VERSION = "1.0";
export const ROLE_BOUNDARIES_SCORING_VERSION = "role-boundaries-v1";

export const ROLE_BOUNDARIES_FIELD_KEYS = Object.freeze([
  "expectationSource",
  "expectedAction",
  "myRole",
  "outsideRole",
  "neededResponsibility",
  "roleConflict",
  "partnerExplanationNeed",
  "managerDiscussionNeed",
  "availabilityPressure",
  "ethicalComplexity",
  "counterpart"
]);

const scoreMaps = {
  roleConflict: { none: 0, low: 0, moderate: 2, high: 4 },
  availabilityPressure: { none: 0, low: 0, moderate: 1, high: 2 },
  ethicalComplexity: { low: 0, moderate: 1, high: 2 }
};

function valueScore(fields, key) {
  return scoreMaps[key]?.[fields?.[key]] ?? 0;
}

function action(workflowType, label, reason) {
  return { workflowType, label, reason };
}

export function computeRoleBoundariesResult(fields = {}) {
  const loadFactors = [];
  const resourceFactors = [];
  const riskMarkers = [];
  const recommendedActions = [];

  if (fields.roleConflict === "high") loadFactors.push("role_boundaries.role_conflict_high");
  if (fields.roleConflict === "moderate") loadFactors.push("role_boundaries.role_conflict_moderate");
  if (fields.partnerExplanationNeed) loadFactors.push("role_boundaries.partner_explanation_needed");
  if (fields.availabilityPressure === "high") loadFactors.push("role_boundaries.availability_pressure_high");
  if (fields.ethicalComplexity === "high") loadFactors.push("role_boundaries.ethical_complexity_high");

  if (fields.managerDiscussionNeed) resourceFactors.push("role_boundaries.manager_discussion_needed");
  if (fields.partnerExplanationNeed) resourceFactors.push("role_boundaries.partner_clarification_needed");
  if (fields.neededResponsibility && fields.neededResponsibility !== "self") {
    resourceFactors.push("role_boundaries.shared_responsibility_needed");
  }

  if (fields.outsideRole && fields.outsideRole !== "none") riskMarkers.push("role_boundaries.responsibility_shift");
  if (fields.neededResponsibility === "partner_agency") riskMarkers.push("role_boundaries.partner_responsibility_gap");
  if (fields.ethicalComplexity === "high") riskMarkers.push("role_boundaries.ethical_tension");

  if (fields.availabilityPressure === "high") {
    recommendedActions.push(action(
      "work-boundaries",
      "Sõnasta kättesaadavuse piir",
      "Pidev kättesaadavus vajab tööpiiride kokkulepet."
    ));
  } else {
    recommendedActions.push(action(
      "work-boundaries",
      "Ava Tööpiirid",
      "Rolliselgitus vajab sageli ka piiri ja erandite kokkulepet."
    ));
  }
  recommendedActions.push(action(
    "work-processes",
    "Ava Tööprotsessid",
    "Rollide ebaselgus töövoos vajab protsessi ja vastutuse kaardistamist."
  ));
  recommendedActions.push(action(
    "interruptions",
    "Ava Katkestused",
    "Korduvad rolliootused võivad ilmuda katkestuste või valede kanalite kaudu."
  ));
  if (fields.ethicalComplexity !== "low") {
    recommendedActions.push(action(
      "covision",
      "Valmista kovisiooni sisend",
      "Eetiline keerukus või rollikonflikt sobib kovisioonis läbi mõelda."
    ));
  }
  recommendedActions.push(action(
    "overview",
    "Jälgi mustrit Ülevaates",
    "Rollipiiride marker aitab hiljem korduvaid vastutuse ja ootuste mustreid koondada."
  ));

  const totalScore =
    valueScore(fields, "roleConflict") +
    valueScore(fields, "availabilityPressure") +
    valueScore(fields, "ethicalComplexity") +
    (fields.partnerExplanationNeed ? 1 : 0) +
    (fields.managerDiscussionNeed ? 1 : 0) +
    (fields.outsideRole && fields.outsideRole !== "none" ? 1 : 0);

  const signalLevel = totalScore >= 7
    ? "needs_network_discussion"
    : totalScore >= 2
      ? "needs_clarification"
      : "clear";

  return {
    signalLevel,
    loadFactors,
    resourceFactors,
    riskMarkers,
    recommendedActions
  };
}

function buildOutputSummary(fields, result) {
  const roleBoundaryAnalysis = [
    "Rollipiiride analüüs",
    "",
    `Ootuse esitaja: ${fields.expectationSource || "täpsustamisel"}.`,
    `Oodatav tegevus: ${fields.expectedAction || "täpsustamisel"}.`,
    `Minu roll: ${fields.myRole || "täpsustamisel"}.`,
    `Minu rolli ei kuulu: ${fields.outsideRole || "täpsustamisel"}.`,
    `Vajalik vastutus või panus: ${fields.neededResponsibility || "täpsustamisel"}.`,
    `Signaal: ${result.signalLevel}.`
  ].join("\n");

  const clientExplanation = [
    "Kliendile selgitus",
    "",
    "Saan aidata oma rolli piires olukorda selgitada, järgmisi samme läbi mõelda ja vajadusel õige osapoole poole suunata.",
    `Minu roll: ${fields.myRole || "täpsustamisel"}.`,
    `Teise osapoole panus: ${fields.neededResponsibility || "täpsustamisel"}.`
  ].join("\n");

  const partnerClarification = [
    "Partnerile rolliselgitus",
    "",
    "Soovin täpsustada, milline osa on minu rollis ja milline osa vajab teie panust või otsust.",
    `Oodatav tegevus: ${fields.expectedAction || "täpsustamisel"}.`,
    `Minu rolli piir: ${fields.outsideRole || "täpsustamisel"}.`
  ].join("\n");

  const canCannotDoText = [
    "Mida saan / mida ei saa teha",
    "",
    `Saan teha: ${fields.myRole || "täpsustamisel"}.`,
    `Ei saa teha: ${fields.outsideRole || "täpsustamisel"}.`,
    `Vajalik panus: ${fields.neededResponsibility || "täpsustamisel"}.`
  ].join("\n");

  const managerMemo = [
    "Juhiga memo",
    "",
    "Soovin arutada rollipiiri, ootuse ja vastutuse selgitamist.",
    `Rollikonflikti tase: ${fields.roleConflict || "täpsustamisel"}.`,
    `Kättesaadavuse surve: ${fields.availabilityPressure || "täpsustamisel"}.`,
    `Arutelu osapool: ${fields.counterpart || "täpsustamisel"}.`
  ].join("\n");

  return {
    roleBoundaryAnalysis,
    clientExplanation,
    partnerClarification,
    canCannotDoText,
    managerMemo
  };
}

export function buildRoleBoundariesRecord({ period = null, roleGroup = null, standardizedFields = {} } = {}) {
  const computed = computeRoleBoundariesResult(standardizedFields);

  return {
    schemaVersion: ROLE_BOUNDARIES_SCHEMA_VERSION,
    scoringVersion: ROLE_BOUNDARIES_SCORING_VERSION,
    workflowType: "role-boundaries",
    createdAt: new Date().toISOString(),
    period,
    roleGroup,
    standardizedFields,
    computedSignal: { signalLevel: computed.signalLevel },
    loadFactors: computed.loadFactors,
    resourceFactors: computed.resourceFactors,
    riskMarkers: computed.riskMarkers,
    recommendedActions: computed.recommendedActions,
    outputSummary: buildOutputSummary(standardizedFields, computed),
    visibility: "private",
    aggregationEligible: true
  };
}
