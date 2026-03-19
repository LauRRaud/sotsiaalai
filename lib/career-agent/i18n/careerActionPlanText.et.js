export const careerActionPlanTextEt = Object.freeze({
  clarifyProfile: {
    title: "Täpsusta profiili põhifaktid",
    descriptionWithMissing:
      "Enne järgmise sammu valikut tasub täpsustada need kohad: {missing}.",
    descriptionFallback:
      "Täpsusta oma kogemust, oskusi või töösoove, et järgmine soovitus oleks täpsem.",
    rationale: [
      "Praegu on profiilis veel lünki või kinnitamata infot.",
      "Täpsustatud profiil aitab anda realistlikuma järgmise sammu.",
    ],
  },
  clarifyDirection: {
    title: "Sõnasta 1–3 realistlikku suunda",
    description:
      "Pane kirja 1–3 ametit, rolli või õpiteed, mida soovid kõigepealt võrrelda või uurida.",
    rationale: [
      "Selgem siht aitab vältida liiga laialivalguvaid soovitusi.",
      "Suuna täpsustamine aitab järgmises sammus sobivust analüüsida.",
    ],
  },
  buildCv: {
    titleWithSignals: "Koosta või täienda CV mustandit",
    titleWithoutSignals: "Koosta esimene CV mustand",
    descriptionWithSignals:
      "Koonda senine kogemus, haridus ja peamised oskused ühte selgesse CV struktuuri.",
    descriptionWithoutSignals:
      "Alusta oma kogemuse, hariduse ja oskuste kirjapanekust, et saaksime luua esimese CV mustandi.",
    rationale: [
      "CV on praktiline alus kandideerimiseks ja järgmiste sammude tegemiseks.",
      "Dokumendivoog saab aidata olemasolevat infot paremini struktureerida.",
    ],
    documentReason: "Kasulik järgmine samm on CV koostamine või uuendamine.",
  },
  applyNow: {
    title: "Valmista kandideerimine ette",
    titleSuffixSeparator: ": ",
    descriptionWithOpportunity:
      "Kohanda oma CV ja kandideerimistekst konkreetse võimaluse „{title}” järgi.",
    descriptionFallback:
      "Vali üks konkreetne võimalus ja kohanda oma CV ning kandideerimistekst selle järgi.",
    rationaleFitLabel: "Praegune sobivus on hinnatud tasemele: {fitLabel}.",
    documentReason:
      "Kandideerimise ettevalmistus vajab tavaliselt CV kohandamist.",
  },
  compareOptions: {
    title: "Võrdle 1–3 realistlikku võimalust",
    descriptionWithDirections:
      "Võrdle esmalt neid suundi: {directions}. Vaata, mis sobib paremini sinu kogemuse, huvide ja piirangutega.",
    descriptionWithOpportunity:
      "Võrdle vähemalt üht realistlikku sihti, alustades võimalusest „{title}”.",
    descriptionFallback:
      "Võrdle 1–3 realistlikku tööd, rolli või õpiteed ning vaata, mis sobib sulle kõige paremini.",
    rationale: [
      "Võrdlus aitab teha teadlikuma valiku enne tegutsemist.",
      "See samm sobib eriti hästi siis, kui sul on mitu võimalikku suunda.",
    ],
  },
  exploreLearning: {
    titleWithEducationGoal: "Uuri sobivaid õpiteid",
    titleDefault: "Uuri oskuste täiendamise võimalusi",
    descriptionWithRetraining:
      "Kaardista 1–3 õpi- või ümberõppevõimalust, mis aitaksid sind soovitud sihile lähemale.",
    descriptionFallback:
      "Uuri, millised koolitused või õpiteed toetaksid sinu järgmist realistlikku sammu.",
    rationale: [
      "Õppimine või täiendamine võib vähendada sobivuslünki.",
      "See samm sobib hästi siis, kui eesmärk on uus valdkond või oskuste tugevdamine.",
    ],
  },
  prepareInterview: {
    title: "Valmistu töövestluseks",
    description:
      "Pane kirja oma tugevused, varasemad näited ja vastused põhilistele vestlusküsimustele.",
    rationale: [
      "Vestluseks valmistumine aitab sul oma sobivust veenvamalt esitada.",
    ],
  },
  requestSupport: {
    title: "Kaalu täiendavat inimtuge",
    descriptionWithReasons:
      "Praeguses olukorras võib olla kasulik kaasata lisatugi, sest pildis on {reasons}.",
    descriptionFallback:
      "Praegune olukord võib vajada rohkem tuge või inimnõustaja sekkumist.",
    rationale: [
      "Kõik olukorrad ei ole mõistlikud lahendada ainult AI toe abil.",
      "Täiendav inimtugi võib aidata kiiremini jõuda realistliku lahenduseni.",
    ],
    reasons: {
      minorUser: "alaealisusega seotud lisavajadus",
      multipleConstraints: "mitu samaaegset piirangut",
      highUrgency: "kõrge pakilisus",
      incomePressure: "tugev sissetuleku surve",
    },
  },
});
