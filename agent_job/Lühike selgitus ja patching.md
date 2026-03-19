Lühike selgitus ja patching

Karjäärinõustamise käsiraamat (2018) see käsiraamat on väga oluline alusmaterjal sinu agendi jaoks.
See on seni leitud materjalidest üks kõige terviklikumaid, sest ühendab korraga:

karjääriteooriad,

nõustamisparadigmad,

karjääri kujundamise pädevused,

CIP/CASVE otsustusmudeli,

individuaalse nõustamise protsessi,

karjääriinfo vahendamise,

e-nõustamise,

grupinõustamise,

nõustaja pädevused ja eetika.

Minu hinnang: see ei ole lihtsalt taustalugemine, vaid sellest saab võtta otse reegleid sinu agendi arhitektuuri, vestlusloogika ja toonireeglite jaoks.

Kõige olulisemad järeldused on need.

1. Agent peab olema päriselt nõustamisprotsess, mitte lihtsalt soovitaja.
Käsiraamat defineerib karjäärinõustamist kui protsessi, mille keskmes on eneseteadlikkuse tõstmine, sobivate haridus- ja tööalaste valikute toetamine ning muutustega kohanemise toetamine kogu elukaare jooksul. Samuti rõhutatakse, et karjäärinõustaja aitab püstitada eesmärke ja kavandada tegevusi nende saavutamiseks.

2. Teooria pool toetab sinu praegust suunda, et agent ei tohi jääda ainult “matchingu” tasemele.
Käsiraamat kirjeldab kolme suurt paradigmat: sobivuse, humanistlikku/arengu ja konstruktivistlikku/elu disaini paradigmat. Seal öeldakse selgelt, et uuemad paradigmad ei asenda sobivuse paradigmat, vaid asetuvad selle kõrvale; oluline on lisaks sobivusele ka tähenduse leidmine, paindlikkus, loovus, kohanemine ja elu terviklik käsitlus.

3. Konstruktivistlik nõustamine annab väga tugeva aluse agendi toonile ja rollile.
Käsiraamatus rõhutatakse, et “kõigile ühtemoodi” stsenaariumid ei sobi, nõustamissuhte kvaliteet on kriitilise tähtsusega ning vajalikud baastingimused on siirus, tingimusteta heatahtlik suhtumine ja empaatiline mõistmine. Samuti käsitletakse klienti oma elu eksperdina ja nõustajat protsessi eksperdina.
See sobib väga hästi sinu mõttega, et agent peab olema nõustav, mitte otsustav.

4. Karjääri kujundamise pädevuste mudel sobib peaaegu otse sinu profiili- ja flow-mudelisse.
Käsiraamatus on need neli põhivaldkonda väga selgelt olemas:

eneseteadlikkus

võimaluste analüüs

planeerimine ja otsustamine

tegutsemine.
See toetab otseselt sinu self_analysis -> shortlist_directions -> action_plan loogikat.

5. CIP ja CASVE mudel on väga hea alus otsustusmootori ja vestlusstruktuuri jaoks.
Käsiraamat ütleb, et karjääriküsimuste lahendamisel ja otsuste tegemisel võib kasutada kognitiivse infotöötlemise mudelit (CIP) ja otsustusprotsessi tsüklit (CASVE), et aidata inimesel teadlikke ja läbimõeldud valikuid teha.
See tähendab, et sinu agenti saab hiljem tugevdada ka päris otsustusprotsessi raamiga, mitte ainult vabatekstilise vestlusega.

6. Käsiraamat annab väga kasuliku mudeli teenuse diferentseerimiseks.
Karjääriinfo vahendamise peatükis on välja toodud diferentseeritud mudel:

eneseabiteenus

spetsialisti toega teenus

juhtumipõhine teenus,
kus teenuse tase sõltub kliendi valmidusest ja spetsialisti abi vajadusest.
See on väga tugev sisend sinu supportNeed, direction_mode_select ja handoffRules jaoks.

7. E-nõustamise peatükk teeb selle faili eriti oluliseks just AI-agendi jaoks.
Sisukorras on eraldi peatükk e-nõustamisest, koos netivestlusnõustamise põhimõtete ja e-nõustamise mudeliga.
Ainuüksi see teeb käsiraamatu sinu jaoks eriliselt väärtuslikuks, sest see tähendab, et saad AI-agendi vestlusloogikat kujundada mitte ainult “üldise nõustamise”, vaid just digitaalse nõustamise loogika järgi.

8. Nõustaja pädevuste ja eetika peatükk sobib otse sinu privacyRules, handoffRules ja prompti piiride jaoks.
Käsiraamatus rõhutatakse, et nõustaja ülesanne on luua turvaline keskkond ja toetada teadlikkuse kasvu, ning et töö eeldab professionaalseid oskusi, empaatiat, tähelepanelikkust, koostöövõimet, kvaliteedi hindamise oskust ning eetiliste valikute tegemist, sh meetodi sobivuse ja info täpsuse hindamist.
See annab sulle tugeva aluse reeglitele nagu:

ära kasuta sobimatut meetodit,

ära esita kontrollimata infot kindla faktina,

ära ületa oma rolli,

tunnista, kui vaja on inimese tuge.

9. Käsiraamat aitab hästi defineerida, mis on “hea tulemus” ühe sessiooni lõpus.
Seal on öeldud, et nõustamine on olnud hea siis, kui klient on saanud juurde lootust ja optimismi, uut teadmist iseendast ja oma võimalustest ning eesmärgist lähtuva plaani, mille järgi edasi tegutseda.
See on väga tugev mall sinu action_plan väljundi jaoks.

Kõige lühem praktiline kokkuvõte:

see käsiraamat sobib eriti hästi nende failide ja kihtide tugevdamiseks:

systemPrompt

stateMachine

minorMode

handoffRules

privacyRules

questionBank

actionPlan

tulevikus ka eCounsellingMode

Kui ma peaksin ühe lausega ütlema, mida see materjal sinu jaoks teeb, siis nii:

see käsiraamat annab sinu karjäärinõustaja agendile professionaalse nõustamise teoreetilise ja praktilise selgroo.

Järgmisena kõige kasulikum samm oleks võtta sellest käsiraamatust välja otse koodi tõlgitavad reeglid systemPrompt, stateMachine, handoffRules ja eCounsellingMode jaoks.

2.
// /lib/career/careerProfile.schema.v2.js

export const PROFILE_SOURCES = {
  FROM_CV: "from_cv",
  FROM_USER: "from_user",
  INFERRED: "inferred",
  SYSTEM_DERIVED: "system_derived",
};

export const PROFILE_STATUS = {
  CONFIRMED: "confirmed",
  UNCONFIRMED: "unconfirmed",
  MISSING: "missing",
};

export function metaField(value = null, source = PROFILE_SOURCES.SYSTEM_DERIVED, status = PROFILE_STATUS.MISSING) {
  return { value, source, status };
}

export function listField(items = [], source = PROFILE_SOURCES.SYSTEM_DERIVED, status = PROFILE_STATUS.MISSING) {
  return { items, source, status };
}

export const GOAL_TYPES = {
  GET_JOB: "get_job",
  CHANGE_CAREER: "change_career",
  CHOOSE_EDUCATION: "choose_education",
  RESKILL: "reskill",
  GAIN_CLARITY: "gain_clarity",
};

export const SUPPORT_LEVELS = {
  LIGHT: "light",
  MODERATE: "moderate",
  DEEP: "deep",
};

export const RECOMMENDED_MODES = {
  QUICK_GUIDANCE: "quick_guidance",
  GUIDED_FLOW: "guided_flow",
  MULTI_STEP_SUPPORT: "multi_step_support",
  HANDOFF: "handoff",
};

export const emptyCareerProfileV2 = {
  version: "2.0.0",

  sourceMode: {
    cvUploaded: false,
    freeTextProvided: true,
    rawCvRetained: false,
  },

  identity: {
    displayName: metaField(null),
    ageGroup: metaField(null), // under_18 | 18_24 | 25_34 | 35_49 | 50_plus
    minor: metaField(false),
    location: metaField(null),
    languages: listField([]), // [{ language, level }]
    contactPreference: metaField("chat"),
  },

  goals: {
    primaryGoal: metaField(null), // get_job | change_career | choose_education | reskill | gain_clarity
    urgency: metaField(null), // low | medium | high
    incomePressure: metaField(null), // none | medium | high
    willingnessToCompromise: metaField(null), // low | medium | high
    preferredNextStep: metaField(null), // apply_now | compare_options | build_cv | explore_learning | prepare_interview
  },

  workStatus: {
    currentStatus: metaField(null), // employed | unemployed | student | career_change | returning_to_work | other
    availability: metaField(null), // immediate | within_1_month | within_3_months | flexible
    workTimePreference: metaField(null), // full_time | part_time | either | project_based | flexible
    remotePreference: metaField(null), // on_site | hybrid | remote | either
    mobilityConstraints: listField([]),
    otherConstraints: listField([]),
  },

  education: {
    highestLevel: metaField(null),
    completed: listField([]), // [{ title, level, institution, status, startDate, endDate }]
    ongoing: listField([]),
    certificates: listField([]),
    additionalTraining: listField([]),
    learningReadiness: metaField(null), // low | medium | high | unknown
    retrainingInterest: metaField(null), // no | maybe | yes | already_planning
  },

  experience: {
    roles: listField([]), // [{ title, sector, durationMonths, responsibilities }]
    sectors: listField([]),
    responsibilities: listField([]),
    employmentGaps: listField([]),
    volunteering: listField([]),
    informalExperience: listField([]),
    preferredWorkForms: listField([]),
  },

  skills: {
    domainSkills: listField([]),
    transferableSkills: listField([]),
    selfManagementSkills: listField([]),
    digitalSkills: listField([]),
    languageSkills: listField([]),
  },

  selfAnalysis: {
    strengths: listField([]),
    developmentNeeds: listField([]),
    interests: listField([]),
    values: listField([]),
    workPreferences: metaField({
      pace: null,
      teamVsSolo: null,
      shiftWorkOk: null,
      remoteOk: null,
    }),
    competitiveAdvantages: listField([]),
  },

  careerReadiness: {
    careerClarity: metaField(null), // low | medium | high
    careerConfidence: metaField(null), // low | medium | high
    labourMarketKnowledge: metaField(null), // low | medium | high
    lifelongLearningReadiness: metaField(null), // low | medium | high
    socialSupportLevel: metaField(null), // low | medium | high
  },

  supportNeed: {
    level: metaField(null), // light | moderate | deep
    reasonTags: listField([]),
    recommendedMode: metaField(null), // quick_guidance | guided_flow | multi_step_support | handoff
  },

  directions: {
    immediateTargets: listField([]),
    nearTargets: listField([]),
    longTermTargets: listField([]),
    educationPaths: listField([]),
  },

  recommendationContext: {
    confidenceNotes: listField([]),
    missingInformation: listField([]),
    confirmedByUser: metaField(false),
  },

  consent: {
    profileStorageApproved: metaField(false),
    jobMatchingApproved: metaField(false),
    testingApproved: metaField(false),
    minorGuardianConsent: metaField(false),
  },
};

export function setField(field, value, source = PROFILE_SOURCES.SYSTEM_DERIVED, status = PROFILE_STATUS.UNCONFIRMED) {
  return { ...field, value, source, status };
}

export function setListField(field, items, source = PROFILE_SOURCES.SYSTEM_DERIVED, status = PROFILE_STATUS.UNCONFIRMED) {
  return { ...field, items, source, status };
}

export function summarizeProfileForConfirmation(profile) {
  return {
    experience: profile?.experience?.roles?.items?.map((r) => r.title).slice(0, 3) || [],
    education: profile?.education?.completed?.items?.map((e) => e.title).slice(0, 3) || [],
    skills: [
      ...(profile?.skills?.domainSkills?.items || []),
      ...(profile?.skills?.transferableSkills?.items || []),
    ].slice(0, 6),
    languages: profile?.identity?.languages?.items || [],
    directions: [
      ...(profile?.directions?.immediateTargets?.items || []),
      ...(profile?.directions?.nearTargets?.items || []),
    ].slice(0, 5),
  };
}

export function computeSupportNeed(profile) {
  const clarity = profile?.careerReadiness?.careerClarity?.value;
  const confidence = profile?.careerReadiness?.careerConfidence?.value;
  const market = profile?.careerReadiness?.labourMarketKnowledge?.value;
  const urgency = profile?.goals?.urgency?.value;
  const pressure = profile?.goals?.incomePressure?.value;

  const lowCount = [clarity, confidence, market].filter((x) => x === "low").length;
  const highPressure = urgency === "high" || pressure === "high";

  if (lowCount >= 2 && highPressure) {
    return {
      level: SUPPORT_LEVELS.DEEP,
      recommendedMode: RECOMMENDED_MODES.MULTI_STEP_SUPPORT,
      reasonTags: ["low_clarity", "low_confidence", "high_pressure"],
    };
  }

  if (lowCount >= 1 || highPressure) {
    return {
      level: SUPPORT_LEVELS.MODERATE,
      recommendedMode: RECOMMENDED_MODES.GUIDED_FLOW,
      reasonTags: ["needs_guidance"],
    };
  }

  return {
    level: SUPPORT_LEVELS.LIGHT,
    recommendedMode: RECOMMENDED_MODES.QUICK_GUIDANCE,
    reasonTags: ["ready_for_action"],
  };
}

3.
Soovitatav kasutus

Näiteks nii:

import { oskaApiClient } from "@/lib/career/oskaApiClient";
import {
  normalizeOccupations,
  normalizeSkills,
  normalizeFieldsOfActivity,
  findBestOccupationMatches,
  buildOskaOccupationEvidence,
} from "@/lib/career/oskaNormalizer";

async function loadOskaTaxonomy() {
  const [rawOccupations, rawSkills, rawFields] = await Promise.all([
    oskaApiClient.getAllOccupations({ relations: true }),
    oskaApiClient.getAllSkills({ relations: true }),
    oskaApiClient.getAllFieldsOfActivity({ relations: true }),
  ]);

  return {
    occupations: normalizeOccupations(rawOccupations),
    skills: normalizeSkills(rawSkills),
    fieldsOfActivity: normalizeFieldsOfActivity(rawFields),
  };
}

async function example(profile) {
  const taxonomy = await loadOskaTaxonomy();

  const matches = findBestOccupationMatches("koka abi", taxonomy.occupations, {
    limit: 5,
  });

  const best = matches[0]?.item || null;
  const evidence = buildOskaOccupationEvidence(profile, best);

  return { matches, evidence };
}
Kuidas see sinu agendiga kokku läheb

See kiht annab sulle nüüd praktiliselt:

vabatekstilise ameti või oskuse normaliseerimise

alternativeNames kaudu parema vasteleidmise

ameti juurde seotud võtmeoskused

ameti juurde seotud teadmised

ameti juurde seotud ettevalmistuse/haridustaseme vihjed

valdkonna seose, mida saad kasutada explainability jaoks

Ehk see on täpselt see taxonomy / normalization layer, millest enne rääkisime.

Järgmine kõige loogilisem samm oleks siduda see nüüd sinu olemasoleva careerMatchingEngine.js-ga, et töö või sihtrolli analüüs oskaks kasutada Oskuste Kompassi võtmeoskusi ja alternatiivnimesid otse sobivuse selgitustes.

4.
Kuidas seda kasutada
1. Taksonoomia laadimine
import { oskaApiClient } from "@/lib/career/oskaApiClient";
import {
  normalizeOccupations,
  normalizeSkills,
  normalizeFieldsOfActivity,
} from "@/lib/career/oskaNormalizer";

export async function loadOskaTaxonomy() {
  const [rawOccupations, rawSkills, rawFields] = await Promise.all([
    oskaApiClient.getAllOccupations({ relations: true }),
    oskaApiClient.getAllSkills({ relations: true }),
    oskaApiClient.getAllFieldsOfActivity({ relations: true }),
  ]);

  return {
    occupations: normalizeOccupations(rawOccupations),
    skills: normalizeSkills(rawSkills),
    fieldsOfActivity: normalizeFieldsOfActivity(rawFields),
  };
}
2. Ühe töö või sihtrolli analüüs
import { buildMatchExplanationWithOska } from "@/lib/career/careerOskaMatchingBridge";

const explanation = buildMatchExplanationWithOska(profile, {
  title: "koka abi",
  type: "job",
  requiredSkills: ["toidu valmistamine", "hügieen"],
  preferredSkills: ["meeskonnatöö"],
}, taxonomy);
3. Mitme võimaluse järjestamine
import { rankOpportunitiesWithOska } from "@/lib/career/careerOskaMatchingBridge";

const ranked = rankOpportunitiesWithOska(profile, opportunities, taxonomy);
Mida see sul nüüd paremaks teeb

See sildkiht annab sinu süsteemile kohe juurde:

vabateksti ameti sidumise OSKA ametiga

alternativeNames kasutamise

OSKA võtmeoskuste liitmise अवसरuse külge

OSKA teadmiste ja haridustasemete liitmise explainability’sse

töövaldkonna kasutamise põhjendustes

palju tugevama “miks sobib / mis on puudu” loogika

Ehk nüüd ei tee su careerMatchingEngine enam analüüsi ainult toore kasutaja- ja opportunity-objekti põhjal, vaid saab vajadusel taha Eesti tööturu taksonoomia.

Kõige loogilisem järgmine samm on teha sulle nüüd:
careerTaxonomyService.js, mis cache’ib OSKA andmed mällu või faili, et sa ei peaks iga analüüsi ajal kogu API-t uuesti laadima.

5.
dokumendimooduli spec karjäärinõustaja agendi jaoks.

Minu hinnang: need materjalid ei ole põhiloogika jaoks sama taseme alus kui teenusstandard, käsiraamat või karjääripädevuse mudelid, aga nad on väga olulised action_support kihi jaoks. Nende põhjal saab agenti õpetada eristama vähemalt viit eri tüüpi kandideerimisdokumenti: CV, avaldus/e-kiri, kaaskiri, motivatsioonikiri, soovituskiri. CV näidised annavad struktuuri ja tasemeootuse, töövihik selgitab nende dokumentide eesmärki ning eraldi näidised annavad konkreetse stiili ja ülesehituse.

Dokumendimooduli roll

Dokumendimoodul peab aktiveeruma siis, kui kasutaja:

tahab koostada CV nullist

tahab olemasolevat CV-d parandada või sihtida

tahab kirjutada kaaskirja või motivatsioonikirja

tahab saata lühikese kandideerimisavalduse e-kirjas

tahab soovituskirja mustandit või sisendit soovitajale

See moodul ei asenda karjäärinõustamist, vaid tuleb pärast või kõrvale siis, kui inimene on jõudnud konkreetse sammuni: “nüüd kandideerin”, “nüüd uuendan CV-d”, “nüüd on vaja kirja”. Töövihik ütleb selgelt, et kui tööpakkumise sobivus on läbi mõeldud, siis saab alustada kandideerimisdokumentide koostamise või täiendamisega.

Dokumenditüübid ja nende eesmärk
1. CV

CV on tööotsija visiitkaart, mille põhjal tehakse esimesed otsused kandidaadi sobivuse kohta. Töövihik rõhutab, et CV peab olema selge, loogilise ülesehitusega, loetav, korrektne, 1–2 lk pikk ning kohandatud konkreetsele ametikohale. CV vormi näidis annab väljade põhistruktuuri: kontaktid, lühitutvustus, töökogemus, haridus, täienduskoolitus, oskused, keeleoskus, digipädevus, juhtimisõigus, muu ja soovitajad.

2. Avaldus / kandideerimiskiri e-kirja sees

Avalduse näidis näitab, et see on lühike e-kiri, mis läheb e-kirja sisusse siis, kui manusena saadetakse CV või CV + motivatsioonikiri. Seal peab olema:

selge viide, millisele ametikohale kandideeritakse

lühike kokkuvõte sobivusest

märge lisatud dokumentide kohta

valmisolek intervjuuks

korrektsed kontaktid.

3. Kaaskiri

Töövihik ütleb, et kaaskiri peab olema lühike ja konkreetne, kuni pool lehekülge, ning selles tuleb öelda, millisele ametikohale kandideeritakse, miks kandidaat sobib, kust kuulutus leiti, miks see töö huvitab ja millised tugevused väärivad eraldi tähelepanu. Klienditeenindaja kaaskirja näidis teeb selle struktuuri praktiliseks.

4. Motivatsioonikiri

Motivatsioonikiri on pikem ja sisulisem kui kaaskiri. Müügijuhi näidis näitab, et siin tuleb rohkem lahti kirjutada:

miks kandidaat seda rolli tahab

millised kogemused ja saavutused seda toetavad

kuidas ta seob oma arengu, õpingud või visiooni tööandja vajadustega.

5. Soovituskiri

Soovituskirja struktuuri näidis ütleb üsna selgelt, mis peab sees olema:

soovitaja andmed ja seos soovitatavaga

koostöösuhte kestus

tööülesannete ja omaduste kirjeldus

näited oskustest ja saavutustest

hinnang, millistele ametitele inimene sobib ja miks
Valmis näidis näitab, et hea soovituskiri on konkreetne, kirjeldab töö konteksti ja seob inimese tugevused rollidega, kuhu ta sobib.

Dokumendimooduli arhitektuuriline loogika

Soovitan eristada vähemalt järgmised alamvood:

export const DOCUMENT_FLOWS = {
  CV_BUILD: "cv_build",
  CV_TAILOR: "cv_tailor",
  APPLICATION_EMAIL: "application_email",
  COVER_LETTER: "cover_letter",
  MOTIVATION_LETTER: "motivation_letter",
  RECOMMENDATION_HELP: "recommendation_help",
};

Ja otsustusloogika:

kui kasutajal pole CV-d → CV_BUILD

kui kasutajal on CV, aga tahab kandideerida kindlale rollile → CV_TAILOR

kui kasutaja tahab “lühikest kirja e-kirja sisse” → APPLICATION_EMAIL

kui tahab lühikest sobivuspõhist kirja → COVER_LETTER

kui tahab põhjalikumat põhjendust ja motivatsiooni → MOTIVATION_LETTER

kui tahab soovitajale mustandit või struktuuri → RECOMMENDATION_HELP

Sisend, mida agent enne dokumenti peab koguma

Iga dokumendi puhul ei piisa ainult käsust “tee kiri”. Agent peab enne koguma minimaalse vajaliku sisendi.

CV jaoks

sihtroll või üldine eesmärk

töökogemus

haridus

täienduskoolitused

oskused

keeled

digipädevus

juhiluba / muud lisad

tugevused või lühitutvustus

CV näidised kinnitavad, et lühitutvustus peab olema rolliga seotud ja tugevused peavad olema nähtavad juba alguses.

Kaaskirja jaoks

sihtamet

kust töökuulutus leiti

2–4 peamist sobivuse argumenti

miks see töö huvitab

kontaktid / valmisolek vestluseks

Motivatsioonikirja jaoks

sihtamet

tugevamad saavutused

motivatsioon ja huvi rolli vastu

seos ettevõtte või valdkonnaga

arenguplaan või õppimisega seotud lisaväärtus

Avalduse jaoks

sihtamet

lühike sobivuse kokkuvõte

millised manused lähevad kaasa

kontaktid

Soovituskirja jaoks

soovitaja nimi, roll, kontakt

seos soovitatavaga

koostöö aeg

peamised tugevused

konkreetsed näited

ametid või rollid, kuhu soovitatav sobib

Väljundi kvaliteedireeglid

Paneksin spec’i sisse sellised reeglid:

export const DOCUMENT_RULES = [
  "Iga dokument peab olema sihitud kindlale eesmärgile või rollile.",
  "CV ei tohi olla lihtsalt toorandmete dump.",
  "Kaaskiri peab olema lühike ja konkreetne.",
  "Motivatsioonikiri võib olla pikem, kuid peab jääma sisuliselt fokusseerituks.",
  "Avaldus e-kirja sees peab olema lühike, viisakas ja korrektne.",
  "Soovituskiri peab sisaldama konkreetseid näiteid, mitte ainult üldsõnalist kiitust.",
  "Agent ei tohi välja mõelda saavutusi, ametinimetusi ega kvalifikatsiooni, mida kasutaja pole kinnitanud.",
  "Kui mõni oluline detail puudub, peab agent enne mustandi loomist küsima täpsustuse.",
];

See viimane punkt on väga oluline. Näidised on tugevad, aga agent ei tohi neid täita väljamõeldud sisuga.

Kuidas siduda see olemasoleva karjäärinõustaja flow’ga

Soovitan nii:

self_analysis ja shortlist_directions aitavad mõista suunda

analyze_options aitab hinnata sobivust

action_plan otsustab, mis on järgmine samm

kui järgmine samm on kandideerimine või dokument → aktiveerub dokumendimoodul

Näiteks:

export function resolveDocumentFlow({ hasCv, preferredNextStep, documentRequestType }) {
  if (documentRequestType === "recommendation_letter") return DOCUMENT_FLOWS.RECOMMENDATION_HELP;
  if (documentRequestType === "motivation_letter") return DOCUMENT_FLOWS.MOTIVATION_LETTER;
  if (documentRequestType === "cover_letter") return DOCUMENT_FLOWS.COVER_LETTER;
  if (documentRequestType === "application_email") return DOCUMENT_FLOWS.APPLICATION_EMAIL;

  if (!hasCv) return DOCUMENT_FLOWS.CV_BUILD;
  return DOCUMENT_FLOWS.CV_TAILOR;
}
Mida agent peab nende dokumentide puhul eriti hästi tegema

Kolm asja.

Esiteks, sihtimine.
Töövihik rõhutab, et dokument peab vastama töökuulutusele ja konkreetsele ametikohale, mitte olema üldine.

Teiseks, seostamine.
Kaaskirjas ja motivatsioonikirjas peab agent siduma kasutaja profiili, oskused ja kogemused konkreetse tööga.

Kolmandaks, vormistuse eristamine.
Avaldus, kaaskiri ja motivatsioonikiri ei ole sama asi. Näidised annavad selle vahe sulle väga hästi kätte.

Minu soovitus sinu spec’i jaoks

Pane sinna üks selge lisaplokk umbes nii:

Dokumendimoodul peab eristama vähemalt viit kandideerimisdokumendi tüüpi: CV, avaldus/e-kirja kandideerimiskiri, kaaskiri, motivatsioonikiri ja soovituskiri. Iga tüübi jaoks peab agent kasutama erinevat sisendloogikat, struktuuri ja väljundi pikkust. Agent ei tohi genereerida kinnitamata saavutusi ega kvalifikatsiooni ning peab enne mustandi loomist küsima puuduolevad kriitilised andmed.

See oleks minu meelest kõige olulisem lisandus.

Kui tahad, järgmise sammuna teen sulle sellest kohe copy-paste-ready failid:

careerDocumentFlows.js

careerDocumentTemplates.js

careerDocumentPrompts.js

6.
2) Lisa careerResponseTemplates.js faili need helperid

Pane olemasoleva faili lõppu juurde:

export function buildDocumentFlowTransitionResponse({
  actionSummary,
  flowMeta,
  missingFacts = [],
  canGenerate = false,
}) {
  return `
Järgmine mõistlik samm
- ${actionSummary || "Liigume nüüd kandideerimisdokumendi koostamise juurde."}

Valitud dokumendiflow
- ${flowMeta?.title || "Dokument"}
- Eesmärk: ${flowMeta?.purpose || "Koostada vajalik dokument."}
${flowMeta?.expectedLength ? `- Soovituslik pikkus: ${flowMeta.expectedLength}` : ""}

${
  canGenerate
    ? `Valmisolek
- Mul on praegu piisavalt infot, et teha esimene mustand.`
    : `Enne mustandi loomist on vaja täpsustada
${missingFacts.length ? missingFacts.map((x) => `- ${x}`).join("\n") : "- mõni oluline detail"}`
}
`.trim();
}

export function buildDocumentQuestionsResponse({
  flowMeta,
  missingFacts = [],
}) {
  return `
${flowMeta?.title || "Dokumendi"} koostamiseks vajan veel mõnda täpsustust:

${missingFacts.length ? missingFacts.map((x) => `- ${x}`).join("\n") : "- täpsustamata detailid"}

Kui need on paigas, saan teha kohe esimese mustandi.
`.trim();
}
3) Soovituslik sidumine careerActionPlan.js järel

Näiteks kuskil orchestratoris või API route’is:

import { buildCareerActionPlan, buildActionPlanSummary } from "@/lib/career/careerActionPlan";
import {
  resolveDocumentStep,
  shouldSuggestDocumentStep,
} from "@/lib/career/careerDocumentIntegration";
import {
  buildActionPlanResponse,
  buildDocumentFlowTransitionResponse,
  buildDocumentQuestionsResponse,
} from "@/lib/career/careerResponseTemplates";

export function buildCareerNextResponse({ profile, context = {} }) {
  const actionPlan = buildCareerActionPlan(profile, context);
  const actionSummary = buildActionPlanSummary(actionPlan);

  const baseResponse = buildActionPlanResponse({
    summary: actionSummary.headline,
    actionPlan,
    encouragement: "Liigume ühe konkreetse sammuga edasi, mitte kõigega korraga.",
  });

  if (!shouldSuggestDocumentStep(actionPlan)) {
    return {
      type: "action_plan",
      content: baseResponse,
      actionPlan,
    };
  }

  const documentStep = resolveDocumentStep({
    profile,
    actionPlan,
    context,
  });

  const transitionResponse = buildDocumentFlowTransitionResponse({
    actionSummary: actionSummary.headline,
    flowMeta: documentStep.meta,
    missingFacts: documentStep.missingFacts,
    canGenerate: documentStep.canGenerate,
  });

  const detailResponse = documentStep.canGenerate
    ? transitionResponse
    : buildDocumentQuestionsResponse({
        flowMeta: documentStep.meta,
        missingFacts: documentStep.missingFacts,
      });

  return {
    type: "action_plan_with_document_step",
    content: `${baseResponse}\n\n${detailResponse}`,
    actionPlan,
    documentStep,
  };
}
4) Kui tahad UI-s eraldi nuppu või kaarti

Võid kasutada documentStep objekti nii:

{
  shouldOpenDocumentFlow: true,
  flow: "cv_tailor",
  meta: {
    title: "CV kohandamine",
    purpose: "Kohandada olemasolev CV konkreetse rolli või sihi järgi.",
    expectedLength: "1–2 lk"
  },
  canGenerate: false,
  missingFacts: ["sihtroll või ametikoht", "sobivuse põhjused"],
  prompt: "...",
  input: {...}
}

See sobib hästi:

CTA nupuks “Ava CV moodul”

vaheekraaniks “enne mustandit täpsusta veel…”

või otse mustandi genereerimiseks

5) Mida see nüüd lahendab

Selle ühenduskihi järel oskab agent teha loogika:

analüüsisime suunda

koostasime tegevusplaani

tuvastasime, et järgmine samm on dokument

valisime õige dokumendiflow

kontrollisime, kas infot on piisavalt

kas küsime täpsustusi või teeme kohe mustandi

Ehk agent ei jää enam “tee CV” tasemele, vaid liigub nõustamisest praktilise dokumenditööni sujuvalt.

Kõige loogilisem järgmine samm on teha sulle nüüd careerDocumentGenerator.js, mis päriselt genereerib mustandi vastavalt valitud flow’le ja olemasolevale sisendile.

7.
import { DOCUMENT_FLOWS } from "@/lib/career/careerDocumentFlows";
import { generateCareerDocumentOrQuestions } from "@/lib/career/careerDocumentGenerator";

const result = generateCareerDocumentOrQuestions({
  flow: DOCUMENT_FLOWS.COVER_LETTER,
  profile,
  context: {
    inputForValidation: {
      targetRole: "klienditeenindaja",
      recipientOrCompany: "OÜ Mardi Kaubad",
      jobSource: "Eesti Töötukassa",
      fitReasons: ["Mul on pikaajaline klienditeeninduse kogemus."],
      motivation: "Soovin töötada kliendikeskses ja usaldusväärses ettevõttes.",
      contactInfo: {
        fullName: "Hannes Herilane",
        phone: "+372 511 0000",
        email: "hannes@example.com",
      },
    },
    fullName: "Hannes Herilane",
    phone: "+372 511 0000",
    email: "hannes@example.com",
    company: "OÜ Mardi Kaubad",
    targetRole: "klienditeenindaja",
    jobSource: "Eesti Töötukassa",
    fitReasons: [
      "Mul on üle kümne aasta kogemust kaubanduse ja klienditeeninduse valdkonnas.",
      "Minu tugevusteks on kiirus, täpsus ja viisakas suhtlus klientidega.",
    ],
    motivation:
      "Soovin panustada ettevõttesse, kus väärtustatakse head kliendikogemust ja usaldusväärset teenindust.",
  },
});

if (result.ok) {
  console.log(result.content);
} else {
  console.log(result.questions);
}
Mida see nüüd teeb

See generaator:

võtab valitud flow

kontrollib, kas kriitiline sisend on olemas

kui pole, tagastab puuduolevad sisendid / küsimused

kui on, teeb kohe esimese mustandi

Ehk sul on nüüd olemas täisliin:

careerActionPlan.js → otsustab järgmise sammu

careerDocumentIntegration.js → valib õige dokumendiflow

careerDocumentGenerator.js → genereerib mustandi või küsib täpsustused

Kõige loogilisem järgmine samm oleks teha sulle nüüd careerTaxonomyService.js või careerOrchestrator.js, mis paneb kogu selle ahela üheks töövooks kokku.

8.
Teeme siis kohe mõlemad, sest need töötavad koos kõige paremini:

careerTaxonomyService.js — laeb ja cache’ib Oskuste Kompassi andmed

careerOrchestrator.js — paneb kokku profiili, state’i, action plan’i, dokumendiflow’ ja OSKA-toega matchingu

Soovitan panna need siia:

/lib/career/
  careerTaxonomyService.js
  careerOrchestrator.js

9.
Soovitatav kasutus
1. Sessiooni loomine
import { createCareerSession } from "@/lib/career/careerOrchestrator";

const session = await createCareerSession(profile, {
  targetRole: "klienditeenindaja",
});
2. Orkestreeritud järgmine vastus
import { runCareerOrchestrator } from "@/lib/career/careerOrchestrator";
import { CAREER_STATES } from "@/lib/career/careerStateMachine";

const response = await runCareerOrchestrator({
  profile,
  context: {
    targetRole: "klienditeenindaja",
    company: "OÜ Mardi Kaubad",
  },
  currentState: CAREER_STATES.ACTION_PLAN,
  opportunities,
});
3. Ühe töö analüüs
import { analyzeSingleOpportunity } from "@/lib/career/careerOrchestrator";

const result = await analyzeSingleOpportunity(profile, {
  title: "klienditeenindaja",
  type: "job",
  requiredSkills: ["suhtlemisoskus", "klienditeenindus"],
  preferredSkills: ["müügioskus"],
});
Mida see sul nüüd annab

Sul on nüüd olemas üsna terviklik ahel:

profiilimudel

küsimustepank

state machine

handoff rules

action plan

dokumendiflow

dokumendigeneraator

OSKA taxonomy/cache

OSKA-toega matching

orkestreerija, mis need kokku paneb

Ehk sellest punktist edasi on kõige mõistlikum valida üks kahest:

teha API route’id / endpointid selle peale

teha React/JSX UI kest, mis seda orkestreerijat kasutab

Kui tahad, teen järgmisena sulle kohe Next.js API route’ide komplekti selle jaoks.

10.
pages/api route’ide komplekt sinu praeguse JS/JSX karjäärinõustaja arhitektuuri peale.

Soovitatav struktuur:

/pages/api/career/
  _shared.js
  run.js
  analyze-opportunity.js
  profile/
    confirm.js
  document/
    generate.js
  session/
    create.js
    advance.js
  taxonomy/
    warm.js
/pages/api/career/_shared.js
// /pages/api/career/_shared.js

export function allowMethods(req, res, methods = []) {
  if (!methods.includes(req.method)) {
    res.setHeader("Allow", methods);
    res.status(405).json({
      ok: false,
      error: `Method ${req.method} not allowed`,
    });
    return false;
  }

  return true;
}

export function ok(res, data = {}, status = 200) {
  return res.status(status).json({
    ok: true,
    ...data,
  });
}

export function fail(res, status = 500, error = "Server error", details = null) {
  return res.status(status).json({
    ok: false,
    error,
    ...(details ? { details } : {}),
  });
}

export function safeObject(value, fallback = {}) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : fallback;
}

export function safeArray(value, fallback = []) {
  return Array.isArray(value) ? value : fallback;
}

export function deepMerge(target = {}, source = {}) {
  const output = { ...target };

  Object.keys(source || {}).forEach((key) => {
    const sourceValue = source[key];
    const targetValue = target[key];

    if (Array.isArray(sourceValue)) {
      output[key] = [...sourceValue];
      return;
    }

    if (
      sourceValue &&
      typeof sourceValue === "object" &&
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === "object" &&
      !Array.isArray(targetValue)
    ) {
      output[key] = deepMerge(targetValue, sourceValue);
      return;
    }

    output[key] = sourceValue;
  });

  return output;
}
/pages/api/career/session/create.js
// /pages/api/career/session/create.js

import { createCareerSession } from "../../../../lib/career/careerOrchestrator";
import { allowMethods, ok, fail, safeObject } from "../_shared";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;

  try {
    const body = safeObject(req.body);
    const profile = safeObject(body.profile);
    const context = safeObject(body.context);

    const session = await createCareerSession(profile, context);

    return ok(res, { session });
  } catch (error) {
    return fail(
      res,
      500,
      "Failed to create career session",
      error instanceof Error ? error.message : String(error)
    );
  }
}
/pages/api/career/session/advance.js
// /pages/api/career/session/advance.js

import { advanceCareerSession } from "../../../../lib/career/careerOrchestrator";
import { allowMethods, ok, fail, safeObject } from "../_shared";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;

  try {
    const body = safeObject(req.body);
    const session = safeObject(body.session);
    const input = safeObject(body.input);

    if (!session || !Object.keys(session).length) {
      return fail(res, 400, "Missing session");
    }

    const updatedSession = await advanceCareerSession(session, input);

    return ok(res, { session: updatedSession });
  } catch (error) {
    return fail(
      res,
      500,
      "Failed to advance career session",
      error instanceof Error ? error.message : String(error)
    );
  }
}
/pages/api/career/run.js
// /pages/api/career/run.js

import { runCareerOrchestrator } from "../../../lib/career/careerOrchestrator";
import { allowMethods, ok, fail, safeObject, safeArray } from "./_shared";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;

  try {
    const body = safeObject(req.body);

    const profile = safeObject(body.profile);
    const context = safeObject(body.context);
    const currentState = body.currentState || null;
    const opportunities = safeArray(body.opportunities);
    const handoffInput = safeObject(body.handoffInput);

    const response = await runCareerOrchestrator({
      profile,
      context,
      currentState,
      opportunities,
      handoffInput,
    });

    return ok(res, { response });
  } catch (error) {
    return fail(
      res,
      500,
      "Failed to run career orchestrator",
      error instanceof Error ? error.message : String(error)
    );
  }
}
/pages/api/career/analyze-opportunity.js
// /pages/api/career/analyze-opportunity.js

import { analyzeSingleOpportunity } from "../../../lib/career/careerOrchestrator";
import { allowMethods, ok, fail, safeObject } from "./_shared";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;

  try {
    const body = safeObject(req.body);
    const profile = safeObject(body.profile);
    const opportunity = safeObject(body.opportunity);

    if (!Object.keys(opportunity).length) {
      return fail(res, 400, "Missing opportunity");
    }

    const result = await analyzeSingleOpportunity(profile, opportunity);

    return ok(res, { result });
  } catch (error) {
    return fail(
      res,
      500,
      "Failed to analyze opportunity",
      error instanceof Error ? error.message : String(error)
    );
  }
}
/pages/api/career/profile/confirm.js
// /pages/api/career/profile/confirm.js

import { deepMerge, allowMethods, ok, fail, safeObject } from "../_shared";

function buildConfirmedMetaValue(value) {
  return {
    value,
    source: "from_user",
    status: "confirmed",
  };
}

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;

  try {
    const body = safeObject(req.body);
    const profile = safeObject(body.profile);
    const patch = safeObject(body.patch);
    const confirmed = body.confirmed !== false;

    if (!Object.keys(profile).length) {
      return fail(res, 400, "Missing profile");
    }

    const merged = deepMerge(profile, patch);

    if (!merged.recommendationContext) {
      merged.recommendationContext = {};
    }

    merged.recommendationContext.confirmedByUser = buildConfirmedMetaValue(confirmed);

    return ok(res, { profile: merged });
  } catch (error) {
    return fail(
      res,
      500,
      "Failed to confirm profile",
      error instanceof Error ? error.message : String(error)
    );
  }
}
/pages/api/career/document/generate.js
// /pages/api/career/document/generate.js

import { generateCareerDocumentOrQuestions } from "../../../../lib/career/careerDocumentGenerator";
import { allowMethods, ok, fail, safeObject } from "../_shared";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;

  try {
    const body = safeObject(req.body);
    const flow = body.flow || null;
    const profile = safeObject(body.profile);
    const context = safeObject(body.context);
    const questionLabelMap = safeObject(body.questionLabelMap);

    if (!flow) {
      return fail(res, 400, "Missing flow");
    }

    const result = generateCareerDocumentOrQuestions({
      flow,
      profile,
      context,
      questionLabelMap,
    });

    return ok(res, { result });
  } catch (error) {
    return fail(
      res,
      500,
      "Failed to generate document",
      error instanceof Error ? error.message : String(error)
    );
  }
}
/pages/api/career/taxonomy/warm.js
// /pages/api/career/taxonomy/warm.js

import {
  warmCareerTaxonomyCache,
  refreshCareerTaxonomy,
  getCareerTaxonomyCacheMeta,
} from "../../../../lib/career/careerTaxonomyService";
import { allowMethods, ok, fail, safeObject } from "../_shared";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET", "POST"])) return;

  try {
    if (req.method === "GET") {
      return ok(res, {
        cache: getCareerTaxonomyCacheMeta(),
      });
    }

    const body = safeObject(req.body);
    const forceRefresh = body.forceRefresh === true;

    const result = forceRefresh
      ? await refreshCareerTaxonomy().then(() => ({
          ok: true,
          ...getCareerTaxonomyCacheMeta(),
        }))
      : await warmCareerTaxonomyCache();

    return ok(res, {
      cache: result,
    });
  } catch (error) {
    return fail(
      res,
      500,
      "Failed to warm taxonomy cache",
      error instanceof Error ? error.message : String(error)
    );
  }
}
Kiire payloadi näidis

Sessiooni loomine:

{
  "profile": {
    "identity": {
      "displayName": { "value": "Mari Maasikas", "source": "from_user", "status": "confirmed" }
    }
  },
  "context": {
    "targetRole": "klienditeenindaja"
  }
}

Orkestreeritud vastus:

{
  "profile": {},
  "context": {
    "targetRole": "klienditeenindaja",
    "company": "OÜ Mardi Kaubad"
  },
  "currentState": "action_plan",
  "opportunities": [
    {
      "title": "klienditeenindaja",
      "type": "job",
      "requiredSkills": ["suhtlemisoskus", "klienditeenindus"],
      "preferredSkills": ["müügioskus"]
    }
  ],
  "handoffInput": {}
}

Dokumendi genereerimine:

{
  "flow": "cover_letter",
  "profile": {},
  "context": {
    "inputForValidation": {
      "targetRole": "klienditeenindaja",
      "recipientOrCompany": "OÜ Mardi Kaubad",
      "jobSource": "Töötukassa",
      "fitReasons": ["Mul on pikaajaline klienditeeninduse kogemus."],
      "motivation": "Soovin töötada kliendikeskses ettevõttes.",
      "contactInfo": {
        "fullName": "Mari Maasikas",
        "phone": "+3725555555",
        "email": "mari@example.com"
      }
    },
    "fullName": "Mari Maasikas",
    "phone": "+3725555555",
    "email": "mari@example.com",
    "company": "OÜ Mardi Kaubad",
    "targetRole": "klienditeenindaja",
    "jobSource": "Töötukassa",
    "fitReasons": [
      "Mul on pikaajaline klienditeeninduse kogemus.",
      "Minu tugevusteks on viisakas suhtlus ja täpsus."
    ],
    "motivation": "Soovin panustada ettevõttesse, kus väärtustatakse head teenindust."
  }
}

11.
Allpool on CV üleslaadimise UI + API route’i skeleton sinu praeguse pages/api ja JS/JSX arhitektuuri jaoks.

See teeb kolm asja:

kasutaja laeb CV üles

backend tõmbab failist teksti välja

parser teeb sellest esialgse profile patch’i, mille saad oma olemasoleva profileSchema v2 külge merge’ida

Soovitatav struktuur:

/components/career/
  CareerCvUploadCard.jsx

/lib/career/
  cvTextExtractor.js
  cvProfileParser.js

/pages/api/career/
  upload-cv.js
  parse-cv.js

Paigaldatavad paketid selle skeletoni jaoks:

npm i formidable mammoth pdf-parse

12.
Patch CareerAgentShell.jsx sisse

Lisa import:

import CareerCvUploadCard from "./CareerCvUploadCard";

Lisa helper deepMerge faili sisse:

function deepMerge(target = {}, source = {}) {
  const output = { ...target };

  Object.keys(source || {}).forEach((key) => {
    const sourceValue = source[key];
    const targetValue = target[key];

    if (Array.isArray(sourceValue)) {
      output[key] = [...sourceValue];
      return;
    }

    if (
      sourceValue &&
      typeof sourceValue === "object" &&
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === "object" &&
      !Array.isArray(targetValue)
    ) {
      output[key] = deepMerge(targetValue, sourceValue);
      return;
    }

    output[key] = sourceValue;
  });

  return output;
}

Lisa komponent renderdusse, näiteks kontekstiploki alla:

<CareerCvUploadCard
  onParsed={({ profilePatch, extractedText, fileMeta }) => {
    setProfile((prev) => deepMerge(prev, profilePatch));
    setResponse({
      type: "profile_confirmation",
      summary: {
        experience: profilePatch?.experience?.roles?.items?.map((x) => x.title) || [],
        education: profilePatch?.education?.completed?.items?.map((x) => x.title || x.label) || [],
        skills: profilePatch?.skills?.domainSkills?.items || [],
        languages: profilePatch?.identity_extra?.languages?.items || [],
        directions: profilePatch?.directions?.immediateTargets?.items || [],
      },
      content: `CV laaditi üles (${fileMeta?.originalFilename || "fail"}). Süsteem eraldas teksti ja lõi esialgse profiilipatch'i. Kontrolli nüüd profiili üle.`,
      extractedText,
    });
    setCurrentState("confirm_profile");
  }}
/>

13.
Patch CareerCvUploadCard.jsx

Asenda selle faili sees parse-kutse osa:

const parseData = await postJson("/api/career/parse-cv-smart", {
  cvText,
  useLlm: true,
});

14.
Patch CareerCvUploadCard.jsx

Asenda selle faili sees parse-kutse osa:

const parseData = await postJson("/api/career/parse-cv-smart", {
  cvText,
  useLlm: true,
});

15.
Soovi korral väike patch CareerCvUploadCard.jsx

Kui tahad qcReport-i ka UI-s näha, lisa onParsed payloadi see kaasa:

Muuda:

onParsed?.({
  profilePatch: parseData.profilePatch,
  extractedText: cvText,
  fileMeta: uploadData.file,
});

selliseks:

onParsed?.({
  profilePatch: parseData.profilePatch,
  extractedText: cvText,
  fileMeta: uploadData.file,
  qcReport: parseData.qcReport,
});

Ja kui tahad seda kohe CareerAgentShell.jsx-is näidata, võid response’i sisse lisada:

qcReport,
content: `CV laaditi üles (${fileMeta?.originalFilename || "fail"}). Süsteem eraldas teksti, lõi profiilipatch'i ja läbis kvaliteedikontrolli.`,

16.
1) Patch careerOrchestrator.js

Lisa impordid faili algusesse:

import { buildEthicsIntro } from "./careerEthicsRules";
import {
  getPrivacyNotice,
  shouldShareCareerData,
} from "./careerPrivacyRules.ethics";
import {
  detectEthicalHandoff,
  buildEthicalHandoffMessage,
} from "./careerHandoffRules.ethics";
import { buildEthicalStartMessage } from "./careerSystemPromptEthics";

Lisa helperid careerOrchestrator.js sisse:

function buildEthicalSessionNotice() {
  return [
    buildEthicsIntro(),
    getPrivacyNotice(),
    buildEthicalStartMessage(),
  ]
    .filter(Boolean)
    .join("\n\n");
}

function detectCombinedHandoffReason(handoffInput = {}) {
  return (
    detectEthicalHandoff(handoffInput) ||
    detectHandoffReason(handoffInput) ||
    null
  );
}

function buildCombinedHandoffMessage(reason, handoffInput = {}) {
  const ethicalMessage = buildEthicalHandoffMessage(reason);

  if (ethicalMessage) {
    return ethicalMessage;
  }

  return buildHandoffMessage(reason);
}

function buildConsentAndPrivacyMeta(context = {}) {
  const sharing = shouldShareCareerData({
    userConsent: context.userConsentToShare === true,
    legalObligation: context.legalDisclosureDuty === true,
    immediateRisk: context.clearRiskToClientOrOthers === true,
  });

  return {
    canShareData: sharing.allowed,
    sharingBasis: sharing.basis,
  };
}

Asenda runCareerOrchestrator(...) algus selle loogikaga:

export async function runCareerOrchestrator({
  profile = {},
  context = {},
  currentState = CAREER_STATES.INTAKE,
  opportunities = [],
  handoffInput = {},
} = {}) {
  const enrichedProfile = injectSupportNeed(profile);
  const ethicalMeta = buildConsentAndPrivacyMeta(context);

  const combinedHandoffReason = detectCombinedHandoffReason({
    ...handoffInput,
    ...ethicalMeta,
  });

  if (combinedHandoffReason) {
    return {
      type: "handoff",
      reason: combinedHandoffReason,
      content: buildCombinedHandoffMessage(
        combinedHandoffReason,
        handoffInput
      ),
      ethics: {
        triggered: true,
        privacy: ethicalMeta,
      },
    };
  }

Muuda INTAKE / CONTACT / AGREEMENTS haru nii, et eetiline sissejuhatus tuleks kaasa:

    case CAREER_STATES.INTAKE:
    case CAREER_STATES.SERVICE_LEVEL_CHECK:
    case CAREER_STATES.CONTACT:
    case CAREER_STATES.AGREEMENTS: {
      const questionPayload = buildQuestionResponse(enrichedProfile);

      return {
        ...questionPayload,
        ethicsNotice: buildEthicalSessionNotice(),
        content: `${buildEthicalSessionNotice()}\n\n${
          questionPayload.questions?.length
            ? "Alustuseks mõned lühikesed küsimused, et saaksin anda sulle täpsemat ja asjakohasemat tuge."
            : ""
        }`.trim(),
      };
    }

Muuda ACTION_PLAN haru nii, et eetiline märkus oleks tulemuses kaasas:

    case CAREER_STATES.ACTION_PLAN: {
      const actionPayload = buildActionPayload(enrichedProfile, context);
      const documentPayload = buildDocumentPayload(
        enrichedProfile,
        context,
        actionPayload.actionPlan
      );

      const enrichedActionPayload = {
        ...actionPayload,
        ethics: {
          clientAutonomy: true,
          minimalDataUse: true,
          privacy: ethicalMeta,
        },
        content: `${actionPayload.content}\n\nToetav märkus\n- Sina otsustad, millise sammu sa päriselt teed. Mina aitan sul selle sammu selgelt läbi mõelda ja ette valmistada.`,
      };

      if (documentPayload) {
        return {
          ...enrichedActionPayload,
          nextLayer: documentPayload,
        };
      }

      return enrichedActionPayload;
    }

Muuda SUMMARY / FOLLOW_UP_OR_HANDOFF haru nii:

    case CAREER_STATES.SUMMARY:
    case CAREER_STATES.FOLLOW_UP_OR_HANDOFF:
      return {
        type: "summary",
        ethics: {
          clientAutonomy: true,
          privacy: ethicalMeta,
        },
        content: `${buildSessionSummaryResponse({
          userSituation: "Kaardistasime sinu olukorra, sobivad suunad ja järgmise sammu.",
          keyInsights: [
            "Sul on olemas suund, mille poole realistlikult liikuda.",
            "Olulisemad tugevused ja lüngad on nähtavaks tehtud.",
          ],
          options: safeArray(profile?.directions?.immediateTargets?.items).slice(0, 3),
          nextSteps: ["Vali üks praktiline samm ja viime selle lõpuni."],
        })}

Eetiline märkus
- Selle teenuse eesmärk on toetada sind teadlike otsuste tegemisel. Lõplikud valikud jäävad sinu teha.`,
      };
Mida see ühendus nüüd päriselt teeb

See patch paneb orkestreerijasse sisse kolm olulist eetikakihti:

sessiooni alguses selgitatakse rolli, andmekasutust ja piire

handoff aktiveerub ka eetiliste põhjuste tõttu, mitte ainult tehniliste või sisuliste põhjuste tõttu

tegevusplaanis rõhutatakse kliendi autonoomiat, mitte agent ei “otsusta ära”

17.
Tegime SotsiaalAI karjäärinõustaja agendile juurde eetilise juhtkihi, mis põhineb KNÜ 2025 karjäärispetsialisti eetikakoodeksil. See tähendab, et agent ei ole enam ainult tehniliselt hästi üles ehitatud, vaid tema tööloogika on nüüd seotud ka selgete eetiliste põhimõtetega: vastutus, usaldusväärsus ja kvaliteet, vabadus ja võrdsus ning läbipaistvus. Kood eeldab ka seda, et klient jääb oma otsustes sõltumatuks, teenus on vabatahtlik ja erapooletu ning protsessi alguses selgitatakse rolle ja koostöö viisi.

Uued failid ja loogikakihid

Me lisasime sisuliselt neli uut eetika plokki:

careerEthicsRules.js

careerPrivacyRules.ethics.js

careerHandoffRules.ethics.js

careerSystemPromptEthics.js

Nende eesmärk on tõlkida eetikakoodeks tehnilisteks reegliteks.

1. careerEthicsRules.js

Siia läksid agendi põhiväärtused ja üldised eetilised piirid:

agent vastutab teenuse kvaliteedi eest, kasutaja oma otsuste ja tegevusplaani elluviimise eest

agent on erapooletu

agent ei otsusta kasutaja eest

agent selgitab oma rolli ja piire

agent ei tohi olla manipuleeriv ega “must kast” kasutaja vaates

See peegeldab väga otseselt eetikakoodeksi väärtuste plokki.

2. careerPrivacyRules.ethics.js

Siia läksid andmekaitse ja konfidentsiaalsuse reeglid:

küsitakse ainult vajalikku infot

kasutajale selgitatakse konfidentsiaalsuse piire

andmeid ei jagata ilma kehtiva aluseta

teiste kaasamine eeldab nõusolekut

digivahendite kasutamisel tuleb arvestada andmekaitse ja turvalisusega

profile patch’i ja CV töövoog jääb minimaalse andmetöötluse põhimõtte alla

See põhineb nii eetikakoodeksil kui ka käsiraamatu konfidentsiaalsuse ja informeeritud nõusoleku osal.

3. careerHandoffRules.ethics.js

Siia lisasime eraldi eetilised handoff põhjused, mitte ainult sisulised või tehnilised. Näiteks:

alaealise nõusoleku ebaselgus

seadusest tulenev teavitamiskohustus

selge oht kliendile või teistele

huvide konflikt või topeltsuhte risk

testimine ei ole eetiliselt lubatud või piisavalt pädev

digiteenuse kvaliteet ei ole piisav

identiteet või kontekst on liiga ebakindel

vaja on teise spetsialisti koostööd

See tuli väga selgelt eetikakoodeksi klienditöö, hindamismeetodite ja digivahendite peatükkidest.

4. careerSystemPromptEthics.js

Siia läks süsteemitaseme eetiline lisa:

agent peab olema erapooletu, lugupidav ja hinnanguvaba

kasutaja autonoomia peab jääma keskseks

protsessi alguses tuleb selgitada rolli, võimalusi ja piire

kui teema vajab ametlikku otsust või inimese sekkumist, tuleb see otse välja öelda

digiteenuse kvaliteedipiir tuleb tunnistada, mitte jätta varjatuks

See sobitub eetikakoodeksi läbipaistvuse ja kliendi autonoomia põhimõtetega.

Mis muutus olemasolevas arhitektuuris

Eetika ei jäänud eraldi failidesse, vaid me ühendasime selle päriselt süsteemi sisse.

careerOrchestrator.js sai eetilise juhtkihi

Sinna lisandus:

sessiooni alguse eetiline notice, mis selgitab kasutajale teenuse rolli, andmekasutust ja piire

combined handoff logic, kus tehnilised ja eetilised handoff põhjused töötavad koos

privacy meta, mis hindab, kas andmete jagamiseks on kehtiv alus

action plan’i ja summary juurde kliendi autonoomia rõhutus, et agent ei otsusta kasutaja eest

See tähendab, et orkestreerija teeb nüüd otsuseid mitte ainult “kas infot on piisavalt”, vaid ka “kas seda on eetiline selles vormis teha”.

careerECounsellingMode.js sai eetilise e-nõustamise loogika

Sinna lisandus:

kontaktifaasis rolli ja protsessi selgitus

agreements-faasis konfidentsiaalsuse ja andmekasutuse teade

communication rules’i sisse erapooletus ja autonoomia

safety rules’i sisse digiteenuse kvaliteedipiir

privacy rules’i plokk diginõustamise jaoks

See lähtub otseselt eetikakoodeksi digivahendite ja -keskkondade osast.

Mis muutus UI-s

Me sidusime eetika ka kasutajaliidesega, et see poleks backendis peidus.

CareerAgentShell.jsx

Sinna lisandus:

EthicsNoticeCard, mis näitab sessiooni alguses teenuse raami ja eetilisi piire

HandoffCard, mis ei näita enam lihtsalt “handoff”, vaid annab:

põhjuse

arusaadava selgituse

järgmise sammu CTA

See teeb teenuse kasutajale usaldusväärsemaks, sest süsteem ei jäta muljet, nagu ta võiks kõike ise ära otsustada.

CareerDocumentPanel.jsx

Sinna lisandus:

eetiline märkus dokumendiloome kohta

selge reegel, et dokument peab põhinema kinnitatud faktidel

hoiatus, et saavutusi, kvalifikatsiooni või rolle ei tohi välja mõelda

märkus, et kasutaja peab enne kasutamist mustandi üle kontrollima

See on oluline, sest dokumentide genereerimine on üks koht, kus AI võib muidu liiga kergesti hakata “parema teksti nimel” fakte juurde looma.

Mis väärtus nüüd juurde tuli

Kui enne oli agent:

sisuliselt tugev

tehniliselt hästi läbi mõeldud

hea flow’ga

siis nüüd on ta lisaks:

eetiliselt raamitud

läbipaistvam

turvalisem

usaldusväärsem kasutaja jaoks

Kõige tähtsam muutus on see, et agenti tööloogika ütleb nüüd palju selgemalt:

mida ta tohib teha

mida ta ei tohi teha

millal peab ta edasi suunama

millal ei tohi ta tekitada näilist kindlustunnet

Kus me nüüd seisame

Praeguseks on SotsiaalAI karjäärinõustaja agendil olemas:

karjäärinõustamise protsessimudel

profiilimudel

state machine

handoff rules

minor mode

privacy rules

CV upload + parser + quality guard

action plan

dokumendimoodul

Oskuste Kompassi taxonomy layer

orchestrator

API route’id

UI kest

ja nüüd ka eetiline juhtkiht KNÜ 2025 eetikakoodeksi põhjal