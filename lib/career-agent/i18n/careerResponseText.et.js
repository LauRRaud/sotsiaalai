export const careerResponseTextEt = Object.freeze({
  stateIntro: {
    titles: {
      intake: "Alustame",
      service_level_check: "Vaatan, millist tuge on vaja",
      contact: "Paneme suhtlusviisi paika",
      agreements: "Lepime olulised tingimused kokku",
      parse_profile: "Koostan profiili mustandi",
      confirm_profile: "Vaatame profiili koos üle",
      self_analysis: "Uurime sinu tugevusi ja eelistusi",
      clarify_problem: "Sõnastame põhiprobleemi täpsemalt",
      set_goals: "Paneme eesmärgi paika",
      shortlist_directions: "Leiame realistlikud suunad",
      analyze_options: "Võrdleme võimalusi",
      action_plan: "Teeme praktilise plaani",
      summary: "Teen lühikokkuvõtte",
      follow_up_or_handoff: "Otsustame järgmise sammu",
      handoff: "Vaatame edasi suunamise varianti",
      default: "Jätkame järgmise sammuga",
    },
    message:
      "Liigume samm-sammult edasi, et jõuda realistliku ja praktilise järgmise sammuni.",
  },
  questionSet: {
    title: "Mul on vaja veel mõnda täpsustust",
    message:
      "Vasta palun nendele küsimustele. Nende põhjal saan järgmise sammu täpsemaks teha.",
  },
  profileConfirmation: {
    title: "Palun vaata profiil üle",
    message:
      "See on minu praegune kokkuvõte sinu profiilist. Vaata üle, kas see on piisavalt õige ja täielik, et saaksime edasi minna.",
    labels: {
      name: "Nimi või pöördumine",
      primaryGoal: "Põhieesmärk",
      nextStep: "Eelistatud järgmine samm",
      currentStatus: "Praegune töö- või õpiseis",
    },
  },
  directionShortlist: {
    title: "Siin on realistlikud suunad, mida edasi uurida",
    message:
      "Valisin välja mõned suunad, mis paistavad sinu profiili põhjal mõistlikud või edasi uurimist väärt.",
    missingTitle: "Puudujäägid",
    defaultTitle: "Võimalik suund",
  },
  optionAnalysis: {
    title: "Siin on sobivuse võrdlus",
    message:
      "Võrdlesin võimalusi sinu profiili põhjal. Vaata, mis sobib paremini, mis on puudu ja kuhu tasub edasi liikuda.",
    defaultTitle: "Võimalus",
    missingTitle: "Mis on puudu",
    nextStep: "Järgmine samm",
    score: "Skoor",
  },
  actionPlan: {
    title: "Soovitatud tegevusplaan",
    message:
      "Panin kokku praktilise järgmiste sammude plaani. Alusta esimesest sammust ja liigu siis edasi järgmiste juurde.",
    defaultTitle: "Tegevussamm",
    priority: "Prioriteet",
    status: "Staatus",
    documentFlow: "Dokumendivoog",
  },
  summary: {
    title: "Lühikokkuvõte",
    message:
      "Teen lühidalt kokkuvõtte sellest, kuhu oleme jõudnud ja mida tasub järgmisena teha.",
    labels: {
      goal: "Eesmärk",
      mainDirection: "Peamine suund",
      firstStep: "Esimene praktiline samm",
      supportMode: "Soovitatud toe laad",
    },
  },
  documentFlow: {
    titleDefault: "Järgmine samm võiks olla dokumendi mustand",
    message:
      "Siit on mõistlik edasi liikuda dokumendi koostamise voogu.",
    missingInputTitle: "Puuduvad sisendid",
    blockedTitle: "Enne jätkamist on vaja selget nõusolekut",
    blockedMessage:
      "Selle järgmise sammu jaoks on vaja kinnitatud nõusolekut. Praegu ei saa ma selle vooga edasi liikuda.",
    transitionTitleMap: {
      CV_BUILD: "Järgmine samm võiks olla CV loomine",
      CV_TAILOR: "Järgmine samm võiks olla CV kohandamine",
      APPLICATION_EMAIL: "Järgmine samm võiks olla kandideerimiskirja mustand",
      COVER_LETTER: "Järgmine samm võiks olla kaaskiri",
      MOTIVATION_LETTER: "Järgmine samm võiks olla motivatsioonikiri",
      RECOMMENDATION_HELP:
        "Järgmine samm võiks olla soovituskirja ettevalmistus",
    },
  },
  documentQuestions: {
    title: "Enne mustandi loomist on vaja veel mõnda täpsustust",
    message:
      "Dokumendi mustandi jaoks on vaja veel mõnda sisendit. Kui vastad neile küsimustele, saan järgmises sammus mustandi kokku panna.",
    missingPrompt: "Palun täpsusta seda infot.",
  },
  consentBlocked: {
    title: "Enne jätkamist on vaja selget nõusolekut",
    message:
      "Selle järgmise sammu jaoks on vaja kinnitatud nõusolekut. Praegu ei saa ma selle vooga edasi liikuda.",
  },
  handoff: {
    title: "Siin oleks mõistlik edasi liikuda lisatoe või inimese abiga",
    message:
      "Praeguse olukorra põhjal oleks mõistlik kaasata täiendav tugi või inimene, et edasi liikuda turvalisemalt ja täpsemalt.",
    labels: {
      reason: "Põhjus",
      channel: "Soovitatud kanal",
    },
  },
});
