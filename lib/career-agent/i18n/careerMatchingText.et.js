export const careerMatchingTextEt = Object.freeze({
  fitLabels: {
    strong: "tugev sobivus",
    possible: "võimalik sobivus",
    needs_step: "vajab lisasammu",
  },
  nextStepMissingRequirements(missingRequirements = []) {
    return `Selgita või täienda esmalt neid puuduvaid kohti: ${missingRequirements.join(", ")}.`;
  },
  nextStepEducation:
    "Võrdle selle õpitee sisseastumise tingimusi ja sobivust oma eesmärgiga.",
  nextStepGeneral:
    "Vaata üle kandideerimise või järgmise praktilise sammu võimalus selle suuna puhul.",
  evidence: {
    directionMatch: "suund kattub: ",
    experienceMatch: "kogemus kattub: ",
    skillMatch: "oskus kattub: ",
    extraValue: "lisaväärtus: ",
  },
  oska: {
    occupationMatch: "OSKA ametivaste: ",
    fieldMatch: "OSKA valdkond: ",
    skillMatches: "OSKA oskuste vasteid: ",
    educationSignal: "OSKA ettevalmistus vĆµi Ćµpitee: ",
    workCondition: "OSKA tĆ¶Ć¶tingimus: ",
    confidencePrefix: "OSKA ametivaste usaldus: ",
  },
  confidence: {
    limitedConfirmedInfo: "profiilis on veel piiratud hulgal kinnitatud infot",
    partialSkillOverlap: "osa oskuste kattuvusest on osaline, mitte täielik",
    directionNotConfirmed: "soovitud suund ei ole profiilis veel selgelt kinnitatud",
    languageRequirementsNeedWork: "keelenõuded vajavad täpsustamist või täiendamist",
  },
});
