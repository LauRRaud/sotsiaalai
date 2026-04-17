import test from "node:test";
import assert from "node:assert/strict";

const { adaptCareerCvTextInput } = await import(
  "../../lib/career-agent/adapters/careerCvParserAdapter.js"
);
const { runCareerAgentPayload } = await import(
  "../../lib/career-agent/api/runCareerAgent.js"
);

const sampleCvText = `
Mari Maasik
Tallinn
mari.maasik@example.com
+372 5551 2345

Profile
Klienditeeninduse taustaga kandidaat, kes soovib liikuda disaini ja digiturunduse valdkonda.

Experience
2022-2025 Klienditeenindaja, Nord Pood
- Noustasin kliente ja lahendasin kiireid olukordi
- Koostasin lihtsaid kampaaniate materjale Canva abil

Education
2021 Tallinna Teeninduskool, kutseharidus

Skills
Suhtlemisoskus, Canva, sisuloome, meeskonnatoo

Languages
Eesti keel - emakeel
Inglise keel - B2
`;

const estonianSocialWorkCvText = `
Curriculum Vitae

Nimi: LAUR RAUDSOO
Aadress: Kolde 6/1, Tabasalu, Harku vald 76901
Telefon: +372 5650 5942
E-post: raudsoolaur@gmail.com

Hariduskaik
2018 Tallinna Ulikool
Sotsiaalteadused, sotsiaaltoo magistriope
2017 Tallinna Ulikool
Sotsiaalteadused, sotsiaaltoo bakalaureuseope

Taiendkoolitus
2022 Projektijuhtimise koolitus, Eesti Pimedate Liit

Tookogemus
2019 Tallinna Sotsiaaltoo Keskus, majandamisnoustaja
Peamised tegevused: klienditoo, noustamine, toimetuleku toetamine
2016 Tabasalu Uhisgumnaasium, sotsiaalpedagoogi abi
Peamised tegevused: opilaste probleemide kaardistamine, ennetus, hindamine

Keeleoskus
eesti keel emakeel
inglise keel C1

Arvutioskus
Microsoft Office, Google programmid, Adobe Illustrator

Huvialad
Sotsiaalne innovatsioon, infotehnoloogia, vabatahtlik too

Isikuomadused
Teotahteline, sihikindel, sotsiaalne
`;

test("adaptCareerCvTextInput builds a canonical profile patch from uploaded CV text", () => {
  const result = adaptCareerCvTextInput({
    text: sampleCvText,
    fileName: "Mari-Maasik-CV.pdf",
  });

  assert.equal(result.profilePatch?.sourceMode?.cvUploaded, true);
  assert.equal(
    result.profilePatch?.contact?.email?.value,
    "mari.maasik@example.com"
  );
  assert.match(result.profilePatch?.contact?.phone?.value || "", /\+372/);
  assert.ok(result.profilePatch?.experience?.roles?.items?.length > 0);
  assert.ok(result.profilePatch?.education?.completed?.items?.length > 0);
  assert.ok(result.profilePatch?.skills?.domainSkills?.items?.length > 0);
});

test("runCareerAgentPayload uses raw uploaded CV text when no structured parser output exists", async () => {
  const response = await runCareerAgentPayload({
    questionId: "profile_cv_available",
    answer: true,
    cvText: sampleCvText,
    cvFileName: "Mari-Maasik-CV.pdf",
    profile: {},
    runtime: {
      currentState: "parse_profile",
    },
  });

  assert.equal(response.ok, true);
  assert.equal(response.body?.ok, true);
  assert.equal(
    response.body?.result?.profile?.contact?.email?.value,
    "mari.maasik@example.com"
  );
  assert.ok(
    response.body?.result?.profile?.experience?.roles?.items?.length > 0
  );
  assert.ok(
    response.body?.meta?.parserStats?.experienceCount > 0
  );
  assert.ok(
    Array.isArray(response.body?.result?.questions) &&
      response.body.result.questions.length > 0
  );
});

test("estonian CV headings produce structured profile data and inferred social work directions", () => {
  const result = adaptCareerCvTextInput({
    text: estonianSocialWorkCvText,
    fileName: "CV-Laur-Raudsoo.docx",
  });

  assert.equal(result.profilePatch?.identity?.displayName?.value, "Laur Raudsoo");
  assert.match(
    result.profilePatch?.identity?.location?.value || "",
    /Tabasalu/
  );
  assert.ok(result.profilePatch?.education?.completed?.items?.length >= 2);
  assert.ok(result.profilePatch?.experience?.roles?.items?.length >= 2);
  assert.ok(result.profilePatch?.skills?.digitalSkills?.items?.length >= 2);
  assert.ok(
    (result.profilePatch?.directions?.immediateTargets?.items || []).some(
      (item) => item?.title?.value === "sotsiaaltootaja"
    )
  );
});

test("social work CV can reach shortlist and summary without manual direction seed roles", async () => {
  const scriptedAnswers = {
    intake_reason:
      "Soovin aru saada, milline amet mulle praegu koige paremini sobib.",
    profile_cv_available: true,
    profile_background_summary:
      "Soovin kasutada sotsiaaltoo, noustamise ja kogukonna arendamise kogemust.",
    confirm_profile_approved: true,
    clarify_problem_statement:
      "Otsin rolli, kus saan uhendada sotsiaaltoo teadmised ja praktilise klienditoo.",
    goal_primary: "get_job",
    goal_preferred_next_step: "compare_options",
    analyze_option_focus:
      "Soovin vorrelda variante selle jargi, kus minu sotsiaalvaldkonna taust koige paremini rakendub.",
    action_plan_readiness: true,
  };

  let payload = {
    profile: {},
    runtime: {},
  };

  let sawShortlist = false;
  let sawOptionAnalysis = false;
  let summaryResponse = null;

  for (let turn = 0; turn < 16; turn += 1) {
    const response = await runCareerAgentPayload(payload);
    const result = response.body?.result;
    const questions = Array.isArray(result?.questions) ? result.questions : [];

    if (result?.response?.kind === "direction_shortlist") {
      sawShortlist = true;
      assert.ok(
        (result.response?.cards || []).some(
          (card) => card?.title === "sotsiaaltootaja"
        )
      );
      payload = {
        profile: result.profile,
        runtime: result.runtime,
      };
      continue;
    }

    if (result?.response?.kind === "option_analysis") {
      sawOptionAnalysis = true;
      assert.equal(result.response?.cards?.[0]?.title, "sotsiaaltootaja");
      payload = {
        profile: result.profile,
        runtime: result.runtime,
      };
      continue;
    }

    if (result?.response?.kind === "summary") {
      summaryResponse = result.response;
      break;
    }

    if (!questions.length) {
      payload = {
        profile: result.profile,
        runtime: result.runtime,
      };
      continue;
    }

    const question = questions[0];
    payload = {
      questionId: question.id,
      answer: scriptedAnswers[question.id],
      profile: result.profile,
      runtime: result.runtime,
      ...(question.id === "profile_cv_available"
        ? {
            cvText: estonianSocialWorkCvText,
            cvFileName: "CV-Laur-Raudsoo.docx",
          }
        : {}),
    };
  }

  assert.equal(sawShortlist, true);
  assert.equal(sawOptionAnalysis, true);
  assert.equal(summaryResponse?.kind, "summary");
  assert.match((summaryResponse?.bullets || []).join("\n"), /sotsiaaltootaja/i);
});



