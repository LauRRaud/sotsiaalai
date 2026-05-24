import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const ROOT = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

test("chat page keeps quick microphone dictation", () => {
  const chatBody = read("components/alalehed/ChatBody.jsx");
  const chatComposer = read("components/alalehed/chat/ChatComposer.jsx");

  assert.match(chatBody, /useSpeech\(/);
  assert.match(chatComposer, /chat-dictate-btn/);
  assert.match(chatComposer, /handleMic/);
});

test("document drafting page does not use quick dictation or auto-append STT into draft", () => {
  const agent = read("components/agent/AgentModePage.jsx");

  assert.doesNotMatch(agent, /useSpeech/);
  assert.doesNotMatch(agent, /\/api\/stt/);
  assert.doesNotMatch(agent, /onAppendText:\s*\(text\)\s*=>\s*composerDraftApiRef\.current\?\.appendText/);
  assert.doesNotMatch(agent, /requestRegularSpeechToText/);
  assert.doesNotMatch(agent, /handleSpeechTranscription/);
  assert.doesNotMatch(agent, /meeting-summary\/jobs/);
  assert.match(agent, /showDictationButton=\{false\}/);
});

test("document audio input copy describes a file based workflow and removes old checkbox text", () => {
  const et = readJson("messages/et.json");
  const en = readJson("messages/en.json");
  const ru = readJson("messages/ru.json");
  const oldEt = "Koosta kohtumise kokkuvõte hiljem";
  const oldHelp = "Kui see valik on väljas";

  const etAudio = et.documents.agent_workspace.audio_input;
  assert.equal(et.documents.agent_workspace.meeting_summary, undefined);
  assert.doesNotMatch(JSON.stringify(et.documents.agent_workspace), new RegExp(oldEt));
  assert.doesNotMatch(JSON.stringify(et.documents.agent_workspace), new RegExp(oldHelp));
  assert.equal(etAudio.title, "Kasuta helisisendit dokumendi koostamiseks");
  assert.match(etAudio.description, /Helist ei lisata teksti automaatselt mustandisse/);
  assert.match(etAudio.processing_note, /Transkriptsioon ja mustand tekivad eraldi kasutaja tegevuse alusel/);
  assert.deepEqual(
    etAudio.source_options.map((option) => option.label),
    [
      "Salvesta uus helifail",
      "Laadi üles helifail",
      "Vali olemasolev helisalvestus dokumentidest"
    ]
  );
  assert.equal(en.documents.agent_workspace.audio_input.source_options.length, 3);
  assert.equal(ru.documents.agent_workspace.audio_input.source_options.length, 3);
});

test("document audio workflow offers draft type choices after transcription without auto draft", () => {
  const agent = read("components/agent/AgentModePage.jsx");
  const et = readJson("messages/et.json");
  const draftOptions = et.documents.agent_workspace.audio_input.draft_type_options;

  assert.deepEqual(draftOptions.map((option) => option.value), [
    "MEETING_SUMMARY",
    "CASE_SUMMARY",
    "PRE_ASSESSMENT_SUMMARY",
    "STAR_HELPER",
    "LETTER_DRAFT",
    "ACTION_PLAN",
    "OTHER"
  ]);
  assert.match(agent, /audio_input\.coming_soon/);
  assert.doesNotMatch(agent, /summaryText[\s\S]{0,120}appendText/);
});
