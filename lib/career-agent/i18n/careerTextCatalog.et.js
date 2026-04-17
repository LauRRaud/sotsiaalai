export const careerTextCatalogEt = Object.freeze({
  actionPlan: Object.freeze({
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
}),
  adapter: Object.freeze({
  errors: {
    turnPayloadMustBeObject: "Karjääri turni payload peab olema objekt.",
    questionAnswerPayloadMustBeObject: "Karjääri küsimuse vastuse payload peab olema objekt.",
    questionAnswerRequiresQuestionId: "Karjääri küsimuse vastuse payload nõuab questionId väärtust.",
  },
  warnings: {
    canonicalPatchMissing:
      "Payload sisaldab cvParseResult väljundit, kuid canonical profile patch puudub. Toore parseri adapter tuleb lisada eraldi.",
  },
}),
  cvParser: Object.freeze({
  confidenceLabel: "CV-parseri kindlustunne",
  summaryDetected: "CV-parser tuvastas profiili kokkuvõtte teksti.",
  emptyOrUnsupported: "CV-parseri tulemus on tühi või toetamata.",
}),
  documentFlow: Object.freeze({
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
}),
  documentGenerator: Object.freeze({
  summary: {
    primaryGoalLabel: "Peamine eesmärk",
    strengthsLabel: "Tugevused",
    interestsLabel: "Huvid",
  },
  errors: {
    unsupportedDocumentFlow: "Toetamata dokumendivoog",
    invalidPreparedData: "Vigased ettevalmistatud andmed.",
    invalidPreparedDataMissing: "Vigased ettevalmistatud andmed: puudu on",
  },
}),
  documentTemplate: Object.freeze({
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
}),
  handoff: Object.freeze({
  general: {
    testingBlockedByGuardianConsent:
      "Testimise või hindamisega ei ole praegu sobiv jätkata ilma vajaliku eestkostja või lapsevanema nõusolekuta.",
    requiredPrivacyConsentDenied:
      "Selle tegevuse jaoks vajalik nõusolek on selgesõnaliselt tagasi lükatud, seega ei saa selle vooga AI abil edasi liikuda.",
    forcedHandoffDefault:
      "Praeguses olukorras on soovitatud liikuda edasi inimese toe abil.",
    crisisRisk:
      "Praeguse info põhjal võib olla tegemist olukorraga, mis vajab kiiret inimese või kriisiteenuse sekkumist.",
    highDistress:
      "Praegune emotsionaalne koormus paistab olevat nii suur, et edasine tugi võiks toimuda inimese abil.",
    humanAssessmentNeeded:
      "Praeguse profiili põhjal võiks järgmine samm olla inimnõustaja või muu täiendava toe kaasamine.",
    minorNeedsAdditionalSupport:
      "Alaealise kasutaja puhul võib see tegevus vajada täiendavat täiskasvanu või spetsialisti tuge.",
    complexBarrierSet:
      "Praeguses olukorras on mitu samaaegset piirangut, mille tõttu võiks edasine tugi toimuda inimese kaasabil.",
    insufficientEvidence:
      "Praegu on usaldusväärset infot liiga vähe, et anda piisavalt kindel ja vastutustundlik soovitus ainult AI abil.",
    strongResistanceOrMismatch:
      "Senine suund või soovitused ei näi kasutajale sobivat, seega võiks järgmine samm olla inimese kaasamine.",
  },
  ethical: {
    sharingWithoutValidConsent:
      "Kolmandatele osapooltele jagamisega ei saa edasi minna ilma selge ja kehtiva nõusolekuta.",
    testingEthicsLimit:
      "Testimise või hindamisega ei ole eetiliselt sobiv jätkata enne, kui vajalik nõusolek ja raam on selged.",
    privacyConsentDenied:
      "Nõutav nõusolek on tagasi lükatud, seega ei ole eetiliselt sobiv selle tegevusega AI abil edasi minna.",
    deceptiveOrImpersonationRequest:
      "AI ei tohi esineda kasutajana ega aidata kaasa petlikule või eksitavale esindamisele.",
    thirdPartyRepresentationRequest:
      "Kasutaja nimel esindamine või tema eest rääkimine vajab selgemat inimjuhtimist ja vastutust.",
    legalOrFormalDecisionRequest:
      "AI ei saa anda siduvat ega ametlikku otsust. Sellises olukorras on vaja inimese või pädeva asutuse hinnangut.",
    minorContextRequiresAdultParticipation:
      "Alaealise kasutaja puhul vajab see olukord täiskasvanu või vastutava toe kaasamist.",
    identityOrContextTooUnclear:
      "Praegune kontekst on liiga ebaselge või puudulik, et oleks eetiliselt põhjendatud anda tugeva mõjuga juhist ainult AI abil.",
    roleConfusionOrOverreliance:
      "Siin on vaja selgemat rollipiiri või inimese osalust, et vältida AI rolli valesti mõistmist.",
    highStakesHumanReviewNeeded:
      "Kõrge mõjuga või riskiga otsuse puhul on eetiliselt sobiv kaasata inimene enne lõpliku sammu tegemist.",
    specialistCollaborationNeeded:
      "Olukord eeldab mitme osapoole või erispetsialisti koostööd, mida ei ole mõistlik jätta ainult AI toe kanda.",
  },
}),
  matching: Object.freeze({
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
    educationSignal: "OSKA ettevalmistus või õpitee: ",
    workCondition: "OSKA töötingimus: ",
    confidencePrefix: "OSKA ametivaste usaldus: ",
  },
  confidence: {
    limitedConfirmedInfo: "profiilis on veel piiratud hulgal kinnitatud infot",
    partialSkillOverlap: "osa oskuste kattuvusest on osaline, mitte täielik",
    directionNotConfirmed: "soovitud suund ei ole profiilis veel selgelt kinnitatud",
    languageRequirementsNeedWork: "keelenõuded vajavad täpsustamist või täiendamist",
  },
}),
  orchestrator: Object.freeze({
  warnings: {
    oskaRankingFallback:
      "OSKA rikastus ebaõnnestus, kasutati tavalist matchingu loogikat.",
    oskaDirectionFallback:
      "OSKA suunarikastus ebaõnnestus, kasutati olemasolevaid suundi.",
  },
  direction: {
    oskaOccupationPrefix: "OSKA ametivaste",
    oskaFieldPrefix: "OSKA valdkond",
    possibleDirectionFallback: "Võimalik suund",
  },
  errors: {
    unknownCareerQuestion: "Tundmatu karjääriküsimus",
  },
}),
  privacy: Object.freeze({
  rawCvRetentionNotAllowed:
    "Toore CV säilitamine ei ole praegu vaikimisi lubatud privaatsuspoliitika järgi.",
  rawCvRetentionDisabledByDefault:
    "Toore CV säilitamine on vaikimisi välja lülitatud. Hoia alles ainult struktureeritud profiiliandmeid, kui poliitika seda selgesõnaliselt ei muuda.",
  requiredConsentDenied:
    "Vajalik privaatsus- või nõusolekuotsus on selgesõnaliselt tagasi lükatud.",
  requiredConsentMissing:
    "Vajalik privaatsus- või nõusolekuotsus puudub või ei ole veel kinnitatud.",
}),
  question: Object.freeze({
  questions: {
    intake_reason: {
      prompt: "Kirjelda rahulikult oma praegust olukorda ja seda, mille osas sa soovid kõige rohkem selgust või abi.",
    },
    identity_display_name: {
      prompt: "Kuidas soovid, et ma sind kõnetan?",
    },
    identity_age_group: {
      prompt: "Milline vanuserühm sind kõige paremini kirjeldab?",
      options: {
        under_18: "Alla 18",
        "18_24": "18–24",
        "25_34": "25–34",
        "35_49": "35–49",
        "50_plus": "50+",
      },
    },
    identity_location: {
      prompt: "Millises linnas või piirkonnas sa eelistatult otsid tööd või õppimisvõimalusi?",
    },
    consent_profile_storage: {
      prompt:
        "Kas nõustud, et sinu karjääriprofiili hoitakse, et nõustamist järjepidevalt jätkata?",
    },
    consent_job_matching: {
      prompt:
        "Kas nõustud, et sinu profiili kasutatakse töö- või suunasoovituste sobivuse hindamiseks?",
    },
    consent_document_generation: {
      prompt:
        "Kas nõustud, et sinu infot kasutatakse dokumentide mustandite koostamiseks?",
    },
    consent_testing: {
      prompt:
        "Kas nõustud testimise või hindamislaadsete tegevustega, kui need osutuvad vajalikuks?",
    },
    consent_minor_guardian: {
      prompt:
        "Kas lapsevanema v?i eestkostja n?usolek testimiseks on olemas?",
    },
    profile_cv_available: {
      prompt:
        "Kas sul on juba CV? Lisa see kirjaklambri ikooniga manusesse vasakul sisestuskasti k?rval.",
    },
    profile_background_summary: {
      prompt:
        "Kui lisasid CV, kirjelda palun, mida soovid enda kohta veel kindlasti lisada v?i r?hutada, enne kui panen kokku profiili kokkuv?tte. Kui CV-d ei ole, kirjelda l?hidalt oma senist t??- v?i ?pikogemust ja seda, kuhu sa tahaksid j?rgmisena liikuda.",
    },
    profile_background_correction: {
      prompt:
        "Kui midagi on puudu või valesti, täpsusta seda julgelt. Võid lisada kogemuse, oskused, piirangud või selle, kuhu sa tegelikult soovid jõuda.",
    },
    confirm_profile_approved: {
      prompt:
        "Kas see kokkuvõte kirjeldab sind piisavalt hästi, et saaksime järgmiste soovituste juurde liikuda?",
    },
    self_strengths: {
      prompt: "Millised on sinu peamised tugevused? Võid lisada mitu märksõna.",
    },
    self_interests: {
      prompt: "Millised teemad, valdkonnad või tegevused sind päriselt huvitavad?",
    },
    self_values: {
      prompt: "Mis on sinu jaoks töös oluline? Näiteks stabiilsus, areng, tähendus, paindlikkus.",
    },
    self_development_needs: {
      prompt: "Millistes oskustes või valdkondades tahaksid edasi areneda?",
    },
    self_deal_breakers: {
      prompt: "Millised töötingimused või rollid sinu jaoks kindlasti ei sobi?",
    },
    self_competitive_advantages: {
      prompt: "Mis annab sulle teiste ees eelise? Näiteks kogemus, keeleoskus, võrgustik või isikuomadused.",
    },
    work_pref_pace: {
      prompt: "Milline töötempo sulle sobib?",
      options: {
        steady: "Pigem rahulik ja stabiilne",
        varied: "Vahelduv",
        fast: "Kiire ja tempokas",
      },
    },
    work_pref_team_vs_solo: {
      prompt: "Kas eelistad pigem tiimitööd või iseseisvat tööd?",
      options: {
        team: "Pigem tiimitöö",
        solo: "Pigem iseseisev töö",
        mixed: "Mõlemad sobivad",
      },
    },
    work_pref_shift_work_ok: {
      prompt: "Kas vahetustega töö sobib sulle?",
    },
    work_pref_remote_ok: {
      prompt: "Kas kaugtöö sobib sulle?",
    },
    work_pref_travel_ok: {
      prompt: "Kas tööga seotud liikumine või sõitmine sobib sulle?",
    },
    clarify_problem_statement: {
      prompt: "Mis on sinu peamine küsimus või takistus praegu, millele sa tahaksid esmalt lahendust leida?",
    },
    work_current_status: {
      prompt: "Milline on sinu praegune töö- või õppeseis?",
      options: {
        employed: "Tööl",
        unemployed: "Tööta",
        studying: "Õpin",
        changing_role: "Soovin töö- või karjäärimuutust",
        returning_after_break: "Naasen pärast pausi",
      },
    },
    work_availability: {
      prompt: "Kui kiiresti oled valmis järgmise sammu tegema?",
      options: {
        immediately: "Kohe",
        within_month: "Järgmise kuu jooksul",
        within_3_months: "1–3 kuu jooksul",
        later: "Hiljem",
      },
    },
    work_mobility_constraints: {
      prompt: "Kas sul on liikumise või asukoha piiranguid, millega peaks arvestama?",
    },
    work_other_constraints: {
      prompt: "Kas on veel piiranguid või tingimusi, mida peaksin soovitusi tehes arvesse võtma?",
    },
    goal_primary: {
      prompt: "Mis on sinu peamine eesmärk praegu?",
      options: {
        get_job: "Leida töö",
        change_career: "Vahetada karjäärisuunda",
        choose_education: "Leida sobiv õpitee",
        reskill: "Õppida uusi oskusi",
        gain_clarity: "Saada selgust",
      },
    },
    goal_preferred_next_step: {
      prompt: "Milline järgmine samm tundub sulle kõige realistlikum või kasulikum?",
      options: {
        apply_now: "Kandideerida kohe",
        compare_options: "Võrrelda võimalusi",
        build_cv: "Koostada või uuendada CV-d",
        explore_learning: "Uurida õpivõimalusi",
        prepare_interview: "Valmistuda vestluseks",
        request_support: "Vajan rohkem tuge enne otsust",
      },
    },
    goal_urgency: {
      prompt: "Kui kiire see teema sinu jaoks praegu on?",
      options: {
        low: "Ei ole kiire",
        medium: "Mõõdukalt kiire",
        high: "Kiire",
        urgent: "Väga kiire / pakiline",
      },
    },
    goal_income_pressure: {
      prompt: "Kui tugev on sinu jaoks praegu sissetuleku surve?",
      options: {
        low: "Väike",
        medium: "Keskmine",
        high: "Suur",
        very_high: "Väga suur",
      },
    },
    goal_willingness_to_compromise: {
      prompt: "Kui valmis oled tegema ajutisi kompromisse, et liikuma saada?",
      options: {
        low: "Pigem ei soovi kompromisse",
        medium: "Mõnes osas olen valmis",
        high: "Olen üsna paindlik",
      },
    },
    education_learning_readiness: {
      prompt: "Kui valmis oled praegu õppima või täiendama oma oskusi?",
      options: {
        low: "Praegu mitte eriti",
        medium: "Mõõdukalt valmis",
        high: "Väga valmis",
      },
    },
    education_retraining_interest: {
      prompt: "Kas oled avatud ümberõppele või uue valdkonna õppimisele?",
    },
    direction_seed_roles: {
      prompt: "Millised ametid, rollid või valdkonnad tunduvad sulle praegu kõige realistlikumad, huvitavamad või vähemalt edasi uurimist väärt?",
    },
    analyze_option_focus: {
      prompt: "Millist suunda või võimalust soovid kõigepealt lähemalt võrrelda, et näha, mis sulle kõige paremini sobib?",
    },
    action_plan_readiness: {
      prompt: "Kas soovid, et paneksin sulle nüüd kirja vähemalt ühe konkreetse järgmise sammu?",
    },
  },
}),
  response: Object.freeze({
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
    title: "Vaatame veel mõned olulised detailid üle",
    message:
      "Vasta palun nendele küsimustele. Nii saan anda sulle täpsema ja kasulikuma soovituse.",
  },
  profileConfirmation: {
    title: "Vaatame su profiili koos üle",
    message:
      "See on minu praegune kokkuvõte sinu taustast. Vaata üle, kas see on piisavalt õige ja täielik, et saaksime soovitustega edasi minna.",
    labels: {
      name: "Nimi või pöördumine",
      primaryGoal: "Põhieesmärk",
      nextStep: "Eelistatud järgmine samm",
      currentStatus: "Praegune töö- või õpiseis",
    },
  },
  directionShortlist: {
    title: "Siin on mõned realistlikud suunad, mida edasi vaadata",
    message:
      "Valisin välja mõned suunad, mis tunduvad sinu vastuste põhjal realistlikud ja edasi uurimist väärt.",
    missingTitle: "Puudujäägid",
    defaultTitle: "Võimalik suund",
  },
  optionAnalysis: {
    title: "Vaatame, mis sobib sulle kõige paremini",
    message:
      "Võrdlesin võimalusi sinu profiili põhjal. Siit näed, mis sobib paremini, mis vajab veel täiendamist ja kuhu tasub edasi liikuda.",
    defaultTitle: "Võimalus",
    missingTitle: "Mis on puudu",
    nextStep: "Järgmine samm",
    score: "Skoor",
  },
  actionPlan: {
    title: "Järgmised praktilised sammud",
    message:
      "Panin sulle kokku praktilise plaani. Alusta esimesest sammust ja liigu siis edasi järgmiste juurde omas tempos.",
    defaultTitle: "Tegevussamm",
    priority: "Prioriteet",
    status: "Staatus",
    documentFlow: "Dokumendivoog",
  },
  summary: {
    title: "Kokkuvõte senisest",
    message:
      "Teen lühidalt kokkuvõtte sellest, kuhu oleme jõudnud ja milline järgmine samm paistab praegu kõige mõistlikum.",
    labels: {
      recommendation: "Peamine soovitus",
      recommendationReason: "Miks see sobib",
      goal: "Eesmärk",
      mainDirection: "Peamine suund",
      firstStep: "Esimene praktiline samm",
      supportMode: "Soovitatud toe laad",
    },
  },
  documentFlow: {
    titleDefault: "Järgmine mõistlik samm võiks olla dokumendi mustand",
    message:
      "Siit edasi võiks aidata see, kui paneme kokku vajaliku dokumendi mustandi.",
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
    title: "Enne mustandi loomist täpsustame veel paar asja",
    message:
      "Dokumendi mustandi jaoks on vaja veel mõnda detaili. Kui vastad neile küsimustele, saan järgmises sammus mustandi valmis panna.",
    missingPrompt: "Palun täpsusta seda infot.",
  },
  consentBlocked: {
    title: "Enne järgmise sammu juurde liikumist on vaja sinu nõusolekut",
    message:
      "Selle järgmise sammu jaoks on vaja sinu kinnitatud nõusolekut. Kui oled nõus, saame siit kohe edasi liikuda.",
  },
  handoff: {
    title: "Siin võiks lisatugi aidata järgmise sammuga edasi",
    message:
      "Praeguse olukorra põhjal võiks lisatugi või inimese abi aidata sul järgmise sammuga kindlamalt edasi liikuda.",
    labels: {
      reason: "Põhjus",
      channel: "Soovitatud kanal",
    },
  },
}),
  run: Object.freeze({
  errors: {
    unknownServerError: "Tundmatu serveri viga.",
  },
}),
  taxonomy: Object.freeze({
  errors: {
    clientRequiresBaseUrl: "OSKA API klient vajab baseUrl väärtust.",
    missingEndpoint: "OSKA ressursitüübi jaoks puudub endpoint.",
    requestFailed: "OSKA API päring ebaõnnestus staatusega",
    invalidJson: "OSKA API ei tagastanud JSON-i.",
    unknownApiError: "Tundmatu OSKA API viga.",
    refreshError: "Tundmatu taksonoomia värskenduse viga.",
    refreshFailed: "Karjääritaksonoomia värskendamine ebaõnnestus.",
    notReady: "Karjääritaksonoomia pole veel valmis. Kutsu ensureReady() esmalt.",
    sharedConfigMismatch:
      "Jagatud karjääritaksonoomia teenus on juba loodud teise konfiguratsiooniga.",
  },
}),
  ui: Object.freeze({
  followUpLabel: "Järgmine seotud samm",
  profile: {
    name: "Nimi või pöördumine",
    location: "Asukoht",
    primaryGoal: "Põhieesmärk",
    nextStep: "Eelistatud järgmine samm",
    currentStatus: "Praegune seis",
    strengths: "Tugevused",
    directions: "Võimalikud suunad",
    draft: "Praegune mustand",
  },
  direction: {
    defaultTitle: "Võimalik suund",
    missingTitle: "Puudujäägid",
  },
  option: {
    defaultTitle: "Võimalus",
    score: "Skoor",
    missingTitle: "Mis on puudu",
    nextStep: "Järgmine samm",
  },
  action: {
    defaultTitle: "Tegevussamm",
    priority: "Prioriteet",
    status: "Staatus",
    documentFlow: "Dokumendiflow",
  },
  document: {
    flow: "Flow",
    status: "Staatus",
    missingInputCount: "Puuduvate sisendite arv",
    subject: "Teema",
    draftReady: "Mustand on valmis.",
    finalReady: "Lõppversioon on allalaadimiseks valmis.",
    reviewAndConfirm: "Vaata see tööalas üle ja kinnita. Pärast kinnitamist saab selle alla laadida.",
    savedToDocuments: "Mustand salvestati Documents tööalale.",
    savedToBuilder: "Mustand salvestati dokumendi koostamise tööalale.",
    openDocuments: "Ava Documents",
    openBuilder: "Ava dokumendi koostamises",
    download: "Laadi alla",
  },
  question: {
    defaultTitle: "Küsimus",
    required: "kohustuslik",
    affirmative: "kinnitusega",
    answerInNextMessage: "Vasta järgmise sõnumiga.",
    booleanAnswerInNextMessage: "Vasta järgmise sõnumiga jah või ei.",
    exitModeHint: "Režiimi lõpetamiseks vajuta portfelli ikooni.",
    optionsPrefix: "Valikud:",
    yes: "Jah",
    no: "Ei",
    confirmSelection: "Kinnita valik",
    selectionHint: "Vali sobivad märksõnad ja kinnita.",
    textPlaceholder: "Kirjuta vastus siia või vasta tavalises vestluses.",
    replyInChatHint: "Soovi korral võid vastata ka tavalise sõnumina.",
    submitAnswer: "Saada vastus",
  },
}),
});
