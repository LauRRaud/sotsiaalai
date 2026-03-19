export const careerDocumentFlowTextEt = Object.freeze({
  flows: {
    CV_BUILD: {
      label: "CV loomine",
      description: "Koosta uus või esmane CV olemasoleva profiili põhjal.",
    },
    CV_TAILOR: {
      label: "CV kohandamine",
      description: "Kohanda olemasolevat CV-d konkreetse rolli või võimaluse jaoks.",
    },
    APPLICATION_EMAIL: {
      label: "Kandideerimiskiri / e-kiri",
      description: "Koosta lühike kandideerimise e-kiri konkreetse võimaluse jaoks.",
    },
    COVER_LETTER: {
      label: "Kaaskiri",
      description: "Koosta struktureeritud kaaskiri tööle kandideerimiseks.",
    },
    MOTIVATION_LETTER: {
      label: "Motivatsioonikiri",
      description: "Koosta motivatsioonikiri õpi- või kandideerimiskontekstiks.",
    },
    RECOMMENDATION_HELP: {
      label: "Soovituskirja ettevalmistus",
      description: "Aita kokku panna alusinfo soovituskirja või soovituse küsimise jaoks.",
    },
  },
  inputs: {
    document_generation_consent: {
      prompt: "Dokumendi mustandi loomiseks on vaja kinnitatud nõusolekut dokumentide genereerimiseks.",
    },
    person_identity: {
      prompt: "Kuidas peaks dokumendis sind nimetama?",
    },
    experience_or_education: {
      prompt: "Palun lisa lühidalt oma kogemus või haridustee, mida peaks dokumendis arvesse võtma.",
    },
    skills_or_strengths: {
      prompt: "Milliseid oskusi või tugevusi peaks selles dokumendis kindlasti esile tooma?",
    },
    target_role_or_opportunity: {
      prompt: "Millise rolli, töö või võimaluse jaoks dokument koostatakse?",
    },
    target_role: {
      prompt: "Mis rollile või ametile soovid dokumenti suunata?",
    },
    motivation_focus: {
      prompt: "Miks see võimalus või suund sulle oluline on?",
    },
    relevant_experience_highlights: {
      prompt: "Millist varasemat kogemust või saavutust peaks kindlasti välja tooma?",
    },
    values_or_interests: {
      prompt: "Millised huvid, väärtused või motivatsioon sobivad selle dokumendi konteksti kõige paremini?",
    },
    relationship_to_candidate: {
      prompt: "Mis on soovitajal või kirjutajal seos kandidaadiga?",
    },
    strengths_or_examples: {
      prompt: "Millised tugevused või konkreetsed näited tuleks soovituse juures kindlasti välja tuua?",
    },
    language_preference: {
      prompt: "Mis keeles peaks dokumendi koostama?",
      options: {
        et: "Eesti",
        en: "English",
        ru: "Русский",
      },
    },
  },
});
