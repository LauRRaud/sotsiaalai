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
  assert.equal(etAudio.title, "Kasuta helifaili dokumendi koostamiseks");
  assert.match(etAudio.description, /kogu salvestise transkript/);
  assert.match(etAudio.description, /t.pse kokkuv.tte/);
  assert.match(etAudio.processing_note, /Transkript ja kokkuv.te tekivad eraldi kasutaja tegevuse alusel/);
  assert.deepEqual(etAudio.source_options.map((option) => option.value), ["upload_file", "choose_existing"]);
  assert.equal(en.documents.agent_workspace.audio_input.source_options.length, 2);
  assert.equal(ru.documents.agent_workspace.audio_input.source_options.length, 2);
  assert.equal(etAudio.transcribe, "Koosta transkript");
  assert.equal(etAudio.create_summary, "Koosta kokkuvõte");
});

test("document audio workflow creates one standard summary after transcript review", () => {
  const agent = read("components/agent/AgentModePage.jsx");
  const et = readJson("messages/et.json");

  assert.equal(et.documents.agent_workspace.audio_input.draft_type_options, undefined);
  assert.match(agent, /handleTranscribeAudio/);
  assert.match(agent, /handleCreateAudioSummary/);
  assert.match(agent, /saveAudioTranscriptIfNeeded/);
  assert.match(agent, /\/api\/documents\/audio-sources/);
  assert.match(agent, /\/transcribe/);
  assert.match(agent, /\/summary/);
  assert.doesNotMatch(agent, /handleCreateDraftFromAudioTranscript/);
  assert.doesNotMatch(agent, /audioInputDraftTypeOptions/);
  assert.doesNotMatch(agent, /STAR_HELPER[\s\S]{0,120}audio_input/);
  assert.doesNotMatch(agent, /summaryText[\s\S]{0,120}appendText/);
});

test("document audio workflow keeps transcription and summary behind explicit user actions", () => {
  const agent = read("components/agent/AgentModePage.jsx");
  const summaryRoute = read("app/api/documents/[id]/summary/route.js");
  const generation = read("lib/documents/generation.js");

  assert.match(agent, /disabled=\{!canCreateAudioSummary\}/);
  assert.match(summaryRoute, /type:\s*"TRANSCRIPT_SUMMARY"/);
  assert.match(summaryRoute, /sourceTranscriptDocumentId:\s*transcript\.id/);
  assert.match(summaryRoute, /generateTranscriptSummaryContent\(\{\s*transcriptText,/);
  assert.match(generation, /must not change the transcript's meaning/);
  assert.match(generation, /Do not create a sentence-by-sentence paraphrase/);
  assert.match(generation, /consolidate repeated points under the same theme/);
  assert.match(generation, /Transkriptist ei selgu/);
  assert.match(generation, /splitTranscriptIntoBlocks/);
});
