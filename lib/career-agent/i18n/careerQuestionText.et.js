export const careerQuestionTextEt = Object.freeze({
  questions: {
    intake_reason: {
      prompt: "Kirjelda lühidalt, millega sa praegu karjääri või tööelu osas abi vajad.",
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
    contact_preferred_channel: {
      prompt: "Mis kanalis on sulle kõige mugavam nõustamist jätkata?",
      options: {
        chat: "Vestlus siin samas",
        email: "E-post",
        phone: "Telefon",
      },
    },
    contact_email: {
      prompt: "Sisesta oma e-posti aadress.",
    },
    contact_phone: {
      prompt: "Sisesta oma telefoninumber.",
    },
    consent_profile_storage: {
      prompt: "Kas nõustud, et sinu karjääriprofiili hoitakse, et nõustamist järjepidevalt jätkata?",
    },
    consent_job_matching: {
      prompt: "Kas nõustud, et sinu profiili kasutatakse töö- või suunasoovituste sobivuse hindamiseks?",
    },
    consent_document_generation: {
      prompt: "Kas nõustud, et sinu infot kasutatakse dokumentide mustandite koostamiseks?",
    },
    consent_testing: {
      prompt: "Kas nõustud testimise või hindamislaadsete tegevustega, kui need osutuvad vajalikuks?",
    },
    consent_minor_guardian: {
      prompt: "Kas lapsevanema või eestkostja nõusolek testimiseks on olemas?",
    },
    confirm_profile_approved: {
      prompt: "Kas see profiili kokkuvõte on õige ja piisavalt täpne, et saaksime edasi liikuda?",
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
      prompt: "Mis on sinu peamine praegune karjääriküsimus või takistus?",
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
      prompt: "Millised ametid, rollid või valdkonnad tunduvad sulle praegu kõige realistlikumad või huvitavamad?",
    },
    analyze_option_focus: {
      prompt: "Millist suunda või võimalust soovid kõigepealt lähemalt võrrelda?",
    },
    action_plan_readiness: {
      prompt: "Kas oled valmis kokku leppima vähemalt ühe konkreetse järgmise sammu?",
    },
  },
});
