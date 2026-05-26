import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("quick check workflow can save the private standardized record through the API", () => {
  const source = read("components/wellbeing/QuickCheckWorkflow.jsx");

  assert.match(source, /fetch\("\/api\/wellbeing\/quick-check"/);
  assert.match(source, /method:\s*"POST"/);
  assert.match(source, /standardizedFields:\s*fields/);
  assert.match(source, /Salvesta kiirkontroll/);
});

test("quick check offers user-controlled support drafts without automatic sharing", () => {
  const source = read("components/wellbeing/QuickCheckWorkflow.jsx");
  const panel = read("components/wellbeing/SupportRequestPanel.jsx");

  assert.match(source, /<SupportRequestPanel/);
  assert.match(panel, /@\/lib\/wellbeing\/supportDraftText/);
  assert.doesNotMatch(panel, /@\/lib\/wellbeing\/supportDrafts/);
  assert.match(panel, /fetch\("\/api\/wellbeing\/output-drafts"/);
  assert.match(panel, /Koosta juhiga arutelu memo/);
  assert.match(panel, /Koosta kovisiooni sisend/);
  assert.match(panel, /Koosta abipalve/);
  assert.match(panel, /Jäta privaatseks/);
  assert.match(panel, /userReviewed/);
  assert.match(panel, /userConfirmed/);
  assert.match(panel, /Ava olemasolevas Kovisioonis/);
  assert.doesNotMatch(panel, /sendEmail|mailto:|automaatselt saadetakse/);
});

test("overview tool renders a dedicated overview workflow that reads aggregate API data", () => {
  const pageSource = read("components/wellbeing/WellbeingPage.jsx");
  const overviewSource = read("components/wellbeing/OverviewWorkflow.jsx");

  assert.match(pageSource, /import OverviewWorkflow from "\.\/OverviewWorkflow"/);
  assert.match(pageSource, /activeTool\?\.id === "overview"/);
  assert.match(pageSource, /<OverviewWorkflow/);
  assert.match(overviewSource, /fetch\("\/api\/wellbeing\/overview"/);
  assert.match(overviewSource, /periodOptions/);
  assert.match(overviewSource, /selectedPeriod/);
  assert.match(overviewSource, /searchParams\.set\("period",\s*selectedPeriod\)/);
  assert.match(overviewSource, /Nädal|NĆ¤dal/);
  assert.match(overviewSource, /Kuu/);
  assert.match(overviewSource, /quickCheckCount/);
  assert.match(overviewSource, /recordCount/);
  assert.match(overviewSource, /periodSignal/);
  assert.match(overviewSource, /workDemands/);
  assert.match(overviewSource, /workResources/);
  assert.match(overviewSource, /riskEvents/);
  assert.match(overviewSource, /overviewDemandCard/);
  assert.match(overviewSource, /overviewResourceCard/);
  assert.match(overviewSource, /overviewRiskCard/);
  assert.match(overviewSource, /Töö nõudmised|TĆ¶Ć¶ nĆµudmised/);
  assert.match(overviewSource, /Tööressursid|TĆ¶Ć¶ressursid/);
  assert.match(overviewSource, /Riskisündmused|RiskisĆ¼ndmused/);
  assert.match(overviewSource, /Juhiga jagatav memo/);
  assert.match(overviewSource, /managerMemo/);
  assert.match(overviewSource, /fetch\("\/api\/wellbeing\/output-drafts"/);
  assert.match(overviewSource, /sourceWorkflowType:\s*"overview"/);
  assert.match(overviewSource, /outputType:\s*"manager_memo"/);
  assert.match(overviewSource, /recipientType:\s*"manager"/);
  assert.match(overviewSource, /userReviewed/);
  assert.match(overviewSource, /userConfirmed/);
  assert.match(overviewSource, /method:\s*"PATCH"/);
  assert.doesNotMatch(overviewSource, /sendEmail|mailto:|automaatselt saadetakse/);
});

test("recovery tool renders a dedicated 24-72h workflow with private save and support drafts", () => {
  const pageSource = read("components/wellbeing/WellbeingPage.jsx");
  const recoverySource = read("components/wellbeing/RecoveryWorkflow.jsx");

  assert.match(pageSource, /import RecoveryWorkflow from "\.\/RecoveryWorkflow"/);
  assert.match(pageSource, /activeTool\?\.id === "recovery"/);
  assert.match(pageSource, /<RecoveryWorkflow/);
  assert.match(recoverySource, /fetch\("\/api\/wellbeing\/recovery"/);
  assert.match(recoverySource, /24-72h taastumisplaan/);
  assert.match(recoverySource, /vältimatud ülesanded/i);
  assert.match(recoverySource, /edasilükatavad ülesanded/i);
  assert.match(recoverySource, /ümberjagatavad ülesanded/i);
  assert.match(recoverySource, /<SupportRequestPanel/);
});

test("work boundaries tool renders a dedicated agreement workflow with document-ready output", () => {
  const pageSource = read("components/wellbeing/WellbeingPage.jsx");
  const boundariesSource = read("components/wellbeing/WorkBoundariesWorkflow.jsx");

  assert.match(pageSource, /import WorkBoundariesWorkflow from "\.\/WorkBoundariesWorkflow"/);
  assert.match(pageSource, /activeTool\?\.id === "work-boundaries"/);
  assert.match(pageSource, /<WorkBoundariesWorkflow/);
  assert.match(boundariesSource, /fetch\("\/api\/wellbeing\/work-boundaries"/);
  assert.match(boundariesSource, /Tööpiiride kokkuleppe mustand/);
  assert.match(boundariesSource, /töövälise kättesaadavuse/i);
  assert.match(boundariesSource, /kriisiolukorra erandid/i);
  assert.match(boundariesSource, /Dokumendi koostamise sisend/);
  assert.match(boundariesSource, /<SupportRequestPanel/);
});

test("hard case tool renders a dedicated 24h aftercare workflow with safety notice and covision input", () => {
  const pageSource = read("components/wellbeing/WellbeingPage.jsx");
  const hardCaseSource = read("components/wellbeing/HardCaseWorkflow.jsx");

  assert.match(pageSource, /import HardCaseWorkflow from "\.\/HardCaseWorkflow"/);
  assert.match(pageSource, /activeTool\?\.id === "hard-case"/);
  assert.match(pageSource, /<HardCaseWorkflow/);
  assert.match(hardCaseSource, /fetch\("\/api\/wellbeing\/hard-case"/);
  assert.match(hardCaseSource, /24h järelplaan/);
  assert.match(hardCaseSource, /Ohutustekst/);
  assert.match(hardCaseSource, /Neutraalne kokkuvõte/);
  assert.match(hardCaseSource, /Kovisiooni sisend/);
  assert.match(hardCaseSource, /<SupportRequestPanel/);
  assert.doesNotMatch(hardCaseSource, /sendEmail|mailto:|automaatselt saadetakse/);
});

test("workplace violence tool renders a dedicated safety workflow without automatic sharing", () => {
  const pageSource = read("components/wellbeing/WellbeingPage.jsx");
  const violenceSource = read("components/wellbeing/WorkplaceViolenceWorkflow.jsx");

  assert.match(pageSource, /import WorkplaceViolenceWorkflow from "\.\/WorkplaceViolenceWorkflow"/);
  assert.match(pageSource, /activeTool\?\.id === "workplace-violence"/);
  assert.match(pageSource, /<WorkplaceViolenceWorkflow/);
  assert.match(violenceSource, /fetch\("\/api\/wellbeing\/workplace-violence"/);
  assert.match(violenceSource, /Ohutustekst/);
  assert.match(violenceSource, /Neutraalne juhtumikirjeldus/);
  assert.match(violenceSource, /Turvalisuse kokkuleppe sisend/);
  assert.match(violenceSource, /Kovisiooni sisend/);
  assert.match(violenceSource, /<SupportRequestPanel/);
  assert.doesNotMatch(violenceSource, /sendEmail|mailto:|automaatselt saadetakse/);
});

test("interruptions tool renders a dedicated fragmentation workflow with focus and channel agreements", () => {
  const pageSource = read("components/wellbeing/WellbeingPage.jsx");
  const interruptionsSource = read("components/wellbeing/InterruptionsWorkflow.jsx");

  assert.match(pageSource, /import InterruptionsWorkflow from "\.\/InterruptionsWorkflow"/);
  assert.match(pageSource, /activeTool\?\.id === "interruptions"/);
  assert.match(pageSource, /<InterruptionsWorkflow/);
  assert.match(interruptionsSource, /fetch\("\/api\/wellbeing\/interruptions"/);
  assert.match(interruptionsSource, /Katkestuste kaart/);
  assert.match(interruptionsSource, /Fookusaja kokkulepe/);
  assert.match(interruptionsSource, /Suhtluskanalite kokkulepe/);
  assert.match(interruptionsSource, /<SupportRequestPanel/);
});

test("work processes tool renders a dedicated workflow audit with simplification outputs", () => {
  const pageSource = read("components/wellbeing/WellbeingPage.jsx");
  const workProcessesSource = read("components/wellbeing/WorkProcessesWorkflow.jsx");

  assert.match(pageSource, /import WorkProcessesWorkflow from "\.\/WorkProcessesWorkflow"/);
  assert.match(pageSource, /activeTool\?\.id === "work-processes"/);
  assert.match(pageSource, /<WorkProcessesWorkflow/);
  assert.match(workProcessesSource, /fetch\("\/api\/wellbeing\/work-processes"/);
  assert.match(workProcessesSource, /Tööprotsessi kaart/);
  assert.match(workProcessesSource, /Kolm suurimat ajaröövlit/);
  assert.match(workProcessesSource, /Dokumenteerimise lihtsustamise ettepanek/);
  assert.match(workProcessesSource, /Info liikumise kokkuvõte/);
  assert.match(workProcessesSource, /<SupportRequestPanel/);
});

test("role boundaries tool renders a dedicated clarification workflow with explanation outputs", () => {
  const pageSource = read("components/wellbeing/WellbeingPage.jsx");
  const roleBoundariesSource = read("components/wellbeing/RoleBoundariesWorkflow.jsx");

  assert.match(pageSource, /import RoleBoundariesWorkflow from "\.\/RoleBoundariesWorkflow"/);
  assert.match(pageSource, /activeTool\?\.id === "role-boundaries"/);
  assert.match(pageSource, /<RoleBoundariesWorkflow/);
  assert.match(roleBoundariesSource, /fetch\("\/api\/wellbeing\/role-boundaries"/);
  assert.match(roleBoundariesSource, /Rollipiiride analüüs/);
  assert.match(roleBoundariesSource, /Kliendile selgitus/);
  assert.match(roleBoundariesSource, /Partnerile rolliselgitus/);
  assert.match(roleBoundariesSource, /Mida saan \/ mida ei saa teha/);
  assert.match(roleBoundariesSource, /<SupportRequestPanel/);
});

test("starter support tool renders a dedicated 100 day support workflow", () => {
  const pageSource = read("components/wellbeing/WellbeingPage.jsx");
  const starterSupportSource = read("components/wellbeing/StarterSupportWorkflow.jsx");

  assert.match(pageSource, /import StarterSupportWorkflow from "\.\/StarterSupportWorkflow"/);
  assert.match(pageSource, /activeTool\?\.id === "starter-support"/);
  assert.match(pageSource, /<StarterSupportWorkflow/);
  assert.match(starterSupportSource, /fetch\("\/api\/wellbeing\/starter-support"/);
  assert.match(starterSupportSource, /Esimese nädala plaan/);
  assert.match(starterSupportSource, /Esimese kuu fookused/);
  assert.match(starterSupportSource, /100 päeva töötoe plaan/);
  assert.match(starterSupportSource, /Küsimused juhile või mentorile/);
  assert.match(starterSupportSource, /<SupportRequestPanel/);
});

test("covision overview exposes wellbeing-prepared inputs as a separate start path", () => {
  const source = read("components/covision/CovisionPage.jsx");

  assert.match(source, /fetchWellbeingCovisionInputs/);
  assert.match(source, /\/api\/wellbeing\/output-drafts\?outputType=covision_input&recipientType=covision/);
  assert.match(source, /Alusta Tööheaolu sisendist/);
  assert.match(source, /Heaolu töövoogudest ette valmistatud sisendid/);
  assert.match(source, /Kasuta kovisioonis/);
});
