export const careerDocumentTemplateTextEt = Object.freeze({
  errors: {
    unsupportedDocumentFlow: "Toetamata dokumendivoog",
    invalidPreparedData: "Vigased ettevalmistatud andmed.",
    invalidPreparedDataMissing: "Vigased ettevalmistatud andmed: puudu on",
  },
  cv: {
    summaryLabel: "Lühitutvustus",
    experienceLabel: "Töökogemus",
    educationLabel: "Haridus",
    skillsLabel: "Oskused",
    strengthsLabel: "Tugevused",
  },
  applicationEmail: {
    subject(targetRole, organization) {
      return organization
        ? `Kandideerimine: ${targetRole} – ${organization}`
        : `Kandideerimine: ${targetRole}`;
    },
    greeting(organization) {
      return `Tere${organization ? `, ${organization}` : ""}!`;
    },
    applySentence(targetRole, organization) {
      return `Soovin kandideerida ${targetRole} rolli${organization ? ` organisatsioonis ${organization}` : ""}.`;
    },
    backgroundIntro: "Lühidalt minu sobivusest:",
    closingLine: "Hea meelega räägin enda kogemusest ja sobivusest lähemalt.",
    signoff(name) {
      return `Lugupidamisega\n${name}`;
    },
  },
  coverLetter: {
    title(targetRole, organization) {
      return organization
        ? `Kaaskiri – ${targetRole} / ${organization}`
        : `Kaaskiri – ${targetRole}`;
    },
    greeting(organization) {
      return `Tere${organization ? `, ${organization} värbamistiim` : ""}!`;
    },
    applySentence(targetRole, organization) {
      return `Soovin kandideerida ${targetRole} rolli${organization ? ` organisatsioonis ${organization}` : ""}.`;
    },
    experienceIntro: "Asjakohane kogemus:",
    strengthsIntro: "Peamised tugevused:",
    closingLine: "Aitäh, et kaalute minu kandideerimist.",
    signoff(name) {
      return `Lugupidamisega\n${name}`;
    },
  },
  motivationLetter: {
    title(targetRole) {
      return `Motivatsioonikiri – ${targetRole}`;
    },
    greeting: "Lugupeetud vastuvõtja,",
    motivationSentence(targetRole) {
      return `Soovin väljendada oma motivatsiooni seoses võimalusega „${targetRole}”.`;
    },
    backgroundIntro: "Asjakohane taust:",
    valuesIntro: "Väärtused ja eesmärgid:",
    interestsIntro: "Olulised huvid:",
    signoff(name) {
      return `Lugupidamisega\n${name}`;
    },
  },
  recommendationHelp: {
    title(candidateName) {
      return `Soovituse ettevalmistus – ${candidateName}`;
    },
    candidateLabel: "Kandidaat:",
    relationshipLabel: "Seos kandidaadiga:",
    targetRoleLabel: "Sihtroll või võimalus:",
    examplesLabel: "Esiletõstmist väärivad tugevused või näited:",
    closingLine: "Seda teksti saab kasutada soovituse koostamise või soovituse küsimise alusena.",
  },
});
