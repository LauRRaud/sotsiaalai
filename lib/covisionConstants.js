export const COVISION_TOPICS = Object.freeze([
  "lapsed ja pered",
  "eakad",
  "puue",
  "vaimne tervis",
  "hoolduskoormus",
  "eluase",
  "võlad ja toimetulek",
  "lähisuhtevägivald",
  "sõltuvus",
  "töö ja karjäär",
  "abivahendid",
  "KOV teenused",
  "teenuseosutaja koostöö",
  "võrgustikutöö",
  "eetiline dilemma",
  "dokumenteerimine",
  "kriis",
  "muu"
]);

export const COVISION_JOURNEY_STEP_TYPES = Object.freeze([
  "esimene pöördumine",
  "esmane kontakt",
  "abivajaduse hindamine",
  "kodukülastus",
  "varasem teenus",
  "varasem toetus",
  "võrgustiku kohtumine",
  "teenuseosutajaga kontakt",
  "takistus",
  "teenusest keeldumine",
  "kriisiolukord",
  "uus info",
  "praegune seis",
  "järgmine küsimus"
]);

export const COVISION_PARTY_GROUPS = Object.freeze([
  {
    category: "Pere ja lähedased",
    options: [
      "vanem",
      "laps",
      "elukaaslane",
      "abikaasa",
      "täisealine laps",
      "hooldaja",
      "eestkostja",
      "muu lähedane",
      "naaber",
      "kogukonnaliige"
    ]
  },
  {
    category: "KOV ja avalik sektor",
    options: [
      "KOV sotsiaaltöötaja",
      "lastekaitsetöötaja",
      "sotsiaalosakond",
      "eluasemespetsialist",
      "hooldusspetsialist",
      "juhtumikorraldaja",
      "SKA",
      "Töötukassa",
      "Tervisekassa",
      "kohus",
      "eestkosteasutus"
    ]
  },
  {
    category: "Tervishoid ja vaimne tervis",
    options: [
      "perearst",
      "pereõde",
      "psühhiaater",
      "psühholoog",
      "vaimse tervise õde",
      "haigla",
      "rehabilitatsioonimeeskond",
      "eriarst",
      "kiirabi"
    ]
  },
  {
    category: "Haridus ja lastega seotud võrgustik",
    options: [
      "kool",
      "lasteaed",
      "klassijuhataja",
      "tugispetsialist",
      "HEV koordinaator",
      "sotsiaalpedagoog",
      "noorsootöötaja",
      "huvikool"
    ]
  },
  {
    category: "Turvalisus ja kriis",
    options: [
      "politsei",
      "ohvriabi",
      "turvakodu",
      "kriisiabi",
      "pääste",
      "hädaabi",
      "naiste tugikeskus",
      "lasteabi"
    ]
  },
  {
    category: "Teenuseosutajad",
    options: [
      "koduteenuse osutaja",
      "hooldekodu",
      "päevakeskus",
      "tugiisik",
      "isiklik abistaja",
      "sotsiaaltransport",
      "võlanõustaja",
      "rehabilitatsiooniteenus",
      "tegevusjuhendaja",
      "varjupaigateenus",
      "muu teenuseosutaja"
    ]
  },
  {
    category: "Muu osapool",
    options: ["vaba tekstina lisatav osapool"]
  }
]);

export const COVISION_PARTY_STATUSES = Object.freeze([
  "kaasatud",
  "vajab kaasamist",
  "info puudub",
  "koostöö toimib",
  "koostöö keeruline",
  "võimalik konflikt",
  "passiivne",
  "ei ole enam asjakohane"
]);

export const COVISION_RISK_OPTIONS = Object.freeze([
  "hoolduskoormuse kasv",
  "vägivalla või väärkohtlemise kahtlus",
  "lapse heaolu risk",
  "eluaseme kaotus",
  "võlgnevused",
  "ravist keeldumine",
  "teenusest keeldumine",
  "isolatsioon",
  "sõltuvus",
  "vaimse tervise kriis",
  "suitsiidirisk",
  "teenuste puudumine piirkonnas",
  "võrgustiku konflikt",
  "lähedaste läbipõlemine",
  "puudulik info",
  "õiguslik ebaselgus",
  "kiire sekkumise vajadus"
]);

export const COVISION_PROTECTIVE_OPTIONS = Object.freeze([
  "toetav pereliige",
  "toimiv kontakt spetsialistiga",
  "olemasolev teenus",
  "stabiilne eluase",
  "motivatsioon abi vastu võtta",
  "kooli või lasteaia tugi",
  "perearsti kontakt",
  "kogukonna või naabrite tugi",
  "varasem toimiv lahendus",
  "koostöövalmis teenuseosutaja",
  "selge pöördumine",
  "olemasolev tegevusplaan"
]);

export const COVISION_EXPECTED_HELP_TYPES = Object.freeze([
  "uusi vaatenurki",
  "metoodilist arutelu",
  "eetilist arutelu",
  "riskide läbimõtlemist",
  "järgmiste sammude kaalumist",
  "dokumenteerimise mõtteid",
  "võrgustiku kaasamise mõtteid",
  "kolleegide kogemusi",
  "toimiva praktika näiteid",
  "muu"
]);

export const COVISION_MESSAGE_TYPES = Object.freeze([
  { value: "free_text", label: "Vaba sõnum" },
  { value: "observation", label: "Mida märkan?" },
  { value: "question", label: "Mida küsiksin juurde?" },
  { value: "risk", label: "Millist riski näen?" },
  { value: "protective_factor", label: "Millist kaitsetegurit näen?" },
  { value: "next_step", label: "Millist järgmist sammu kaaluksin?" },
  { value: "experience", label: "Sarnane kogemus" },
  { value: "source_note", label: "Allikas või juhis" },
  { value: "documentation_note", label: "Dokumenteerimise tähelepanek" },
  { value: "network_note", label: "Võrgustikutöö mõte" }
]);

export const COVISION_PARTICIPANT_ROLES = Object.freeze([
  { value: "participant", label: "osaleja" },
  { value: "observer", label: "vaatleja" },
  { value: "co_moderator", label: "kaasmoderaator" },
  { value: "summary_reviewer", label: "kokkuvõtte ülevaataja" }
]);

export const COVISION_CASE_STATUSES = Object.freeze([
  { value: "draft", label: "mustand" },
  { value: "active", label: "arutelus" },
  { value: "summary_ready", label: "kokkuvõte valmis" },
  { value: "closed", label: "suletud" },
  { value: "archived", label: "arhiveeritud" }
]);

export const EFFECTIVE_PRACTICE_STATUSES = Object.freeze([
  { value: "draft", label: "mustand" },
  { value: "anonymity_check", label: "anonüümsuse kontroll" },
  { value: "review", label: "ülevaatamisel" },
  { value: "published", label: "avaldatud" },
  { value: "hidden", label: "peidetud" },
  { value: "archived", label: "arhiveeritud" }
]);
