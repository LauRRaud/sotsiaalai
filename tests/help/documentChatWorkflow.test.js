import test from "node:test";
import assert from "node:assert/strict";

import { runDocumentChatWorkflow } from "../../lib/chat/documentOrchestration.js";

test("document workflow locks after confirmed document mode and asks only missing purpose", async () => {
  const result = await runDocumentChatWorkflow({
    message: "Mul on vaja koostada avaldus vallale.",
    replyLang: "et",
    role: "CLIENT",
    forceConfirmed: true
  });

  assert.equal(result.handled, true);
  assert.equal(result.workflowState?.flowLocked, true);
  assert.equal(result.workflowState?.step, "collect_required_fields");
  assert.equal(result.workflowState?.draft.documentType, "avaldus");
  assert.equal(result.workflowState?.draft.recipient, "vallale");
  assert.match(result.reply, /mis eesm.*dokumenti vaja on/i);
});

test("document workflow collects required fields, asks optional preferences, previews, edits, and becomes ready on yes", async () => {
  const first = await runDocumentChatWorkflow({
    message: "Mul on vaja koostada avaldus vallale.",
    replyLang: "et",
    role: "CLIENT",
    forceConfirmed: true
  });

  const second = await runDocumentChatWorkflow({
    message: "Ema transporditeenuse taotlemiseks.",
    replyLang: "et",
    role: "CLIENT",
    workflowState: first.workflowState
  });
  assert.match(second.reply, /tekst, m.*rge, dokument, vorm v.*i mall/i);

  const third = await runDocumentChatWorkflow({
    message: "Koosta minu kirjelduse pohjal.",
    replyLang: "et",
    role: "CLIENT",
    workflowState: second.workflowState
  });
  assert.match(third.reply, /oluline taust|asjaolu/i);

  const fourth = await runDocumentChatWorkflow({
    message: "Emal on liikumisraskus ja ta ei saa ise bussiga liikuda.",
    replyLang: "et",
    role: "CLIENT",
    workflowState: third.workflowState
  });
  assert.match(fourth.reply, /mis keeles ja mis toonis/i);

  const fifth = await runDocumentChatWorkflow({
    message: "Eesti keeles ja ametlikus toonis.",
    replyLang: "et",
    role: "CLIENT",
    workflowState: fourth.workflowState
  });
  assert.equal(fifth.workflowState?.step, "collect_conditional_fields");
  assert.match(fifth.reply, /tekst peaks olema pigem/i);
  assert.doesNotMatch(fifth.reply, /Palun vaata kokku/i);

  const sixth = await runDocumentChatWorkflow({
    message: "Pigem lĆ¼hike.",
    replyLang: "et",
    role: "CLIENT",
    workflowState: fifth.workflowState
  });
  assert.equal(sixth.workflowState?.confirmationPending, true);
  assert.match(sixth.reply, /Palun vaata kokku/i);

  const edited = await runDocumentChatWorkflow({
    message: "Muuda toon lihtsaks ja selgeks.",
    replyLang: "et",
    role: "CLIENT",
    workflowState: sixth.workflowState
  });
  assert.match(edited.reply, /Palun vaata kokku/i);
  assert.match(edited.reply, /lihtne ja selge/i);

  const confirmed = await runDocumentChatWorkflow({
    message: "jah",
    replyLang: "et",
    role: "CLIENT",
    workflowState: edited.workflowState
  });
  assert.equal(confirmed.readyToGenerate, true);
  assert.equal(confirmed.taskConfig?.artifactType, "LETTER_DRAFT");
  assert.match(confirmed.taskConfig?.instruction || "", /transporditeenuse taotlemiseks/i);
});

test("document workflow can start from a rerouted non-document topic without asking mode again", async () => {
  const result = await runDocumentChatWorkflow({
    message: "Soovin pakkuda transporti Tabasalus.",
    replyLang: "et",
    role: "CLIENT",
    forceConfirmed: true
  });

  assert.equal(result.handled, true);
  assert.equal(result.workflowState?.flowLocked, true);
  assert.match(result.reply, /millist dokumenti soovid koostada/i);
  assert.doesNotMatch(result.reply, /aruannet soovid koostada/i);
});

test("document workflow requires actual source material before preview when existing material is selected", async () => {
  const first = await runDocumentChatWorkflow({
    message: "Mul on vaja koostada avaldus vallale.",
    replyLang: "et",
    role: "CLIENT",
    forceConfirmed: true
  });

  const second = await runDocumentChatWorkflow({
    message: "Ema transporditeenuse taotlemiseks.",
    replyLang: "et",
    role: "CLIENT",
    workflowState: first.workflowState
  });

  const third = await runDocumentChatWorkflow({
    message: "Kasuta olemasolevat materjali.",
    replyLang: "et",
    role: "CLIENT",
    workflowState: second.workflowState
  });

  const fourth = await runDocumentChatWorkflow({
    message: "Emal on liikumisraskus ja ta ei saa ise bussiga liikuda.",
    replyLang: "et",
    role: "CLIENT",
    workflowState: third.workflowState
  });

  const fifth = await runDocumentChatWorkflow({
    message: "Eesti keeles ja ametlikus toonis.",
    replyLang: "et",
    role: "CLIENT",
    workflowState: fourth.workflowState
  });

  assert.match(fifth.reply, /lisa tekst|lisa .*fail/i);
  assert.doesNotMatch(fifth.reply, /Palun vaata kokku/i);

  const sixth = await runDocumentChatWorkflow({
    message: "Mul on eelmise taotluse mustand ja märkmed haiglast.",
    replyLang: "et",
    role: "CLIENT",
    workflowState: fifth.workflowState
  });

  assert.match(sixth.reply, /Kui soovid, võid lisada ka eelistuse/i);
});

test("document workflow supports cancel, restart, and explicit switch intents", async () => {
  const started = await runDocumentChatWorkflow({
    message: "Mul on vaja koostada avaldus vallale.",
    replyLang: "et",
    role: "CLIENT",
    forceConfirmed: true
  });

  const restarted = await runDocumentChatWorkflow({
    message: "alusta otsast",
    replyLang: "et",
    role: "CLIENT",
    workflowState: started.workflowState
  });
  assert.match(restarted.reply, /alustame .* otsast peale/i);
  assert.equal(restarted.workflowState?.flowLocked, true);

  const switched = await runDocumentChatWorkflow({
    message: "soovin hoopis abisoovi teha",
    replyLang: "et",
    role: "CLIENT",
    workflowState: started.workflowState
  });
  assert.equal(switched.switchTo, "help_request");
  assert.equal(switched.workflowState, null);

  const cancelled = await runDocumentChatWorkflow({
    message: "katkesta",
    replyLang: "et",
    role: "CLIENT",
    workflowState: started.workflowState
  });
  assert.equal(cancelled.handled, true);
  assert.equal(cancelled.workflowState, null);
  assert.match(cancelled.reply, /katkestasin/i);
});

