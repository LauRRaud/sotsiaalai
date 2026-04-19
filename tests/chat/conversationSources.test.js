import test from "node:test";
import assert from "node:assert/strict";

import { collectLatestAnswerSources } from "../../components/chat/hooks/useConversationSources.js";

test("conversation source panel uses only the latest assistant answer sources", () => {
  const sources = collectLatestAnswerSources([
    {
      role: "ai",
      text: "Earlier sourced answer.",
      sources: [
        {
          id: "old-law",
          title: "Old source",
          url: "https://example.test/old",
          short_ref: "Old source"
        }
      ]
    },
    {
      role: "user",
      text: "kas sa oled openai asistent?"
    },
    {
      role: "ai",
      text: "Olen SotsiaalAI vestlusassistent.",
      sources: []
    }
  ]);

  assert.deepEqual(sources, []);
});

test("conversation source panel suppresses bogus sources on identity answers", () => {
  const bogusSources = [
    {
      id: "shs-1",
      title: "Eesti - Sotsiaalhoolekande seadus - § 1",
      url: "https://example.test/shs-1",
      short_ref: "Eesti - Sotsiaalhoolekande seadus - § 1"
    }
  ];
  const sources = collectLatestAnswerSources([
    {
      role: "user",
      text: "kas sa oled openai asistent või sotsiaalai assistent?"
    },
    {
      role: "ai",
      text: "Olen SotsiaalAI vestlusassistent.",
      sources: bogusSources
    }
  ]);

  assert.deepEqual(sources, []);
});

test("conversation source panel suppresses streaming identity metadata before text arrives", () => {
  const sources = collectLatestAnswerSources([
    {
      role: "user",
      text: "kas sa oled openai asistent või sotsiaalai assistent?"
    },
    {
      role: "ai",
      text: "",
      isStreaming: true,
      sources: [
        {
          id: "shs-1",
          title: "Eesti - Sotsiaalhoolekande seadus - § 1",
          url: "https://example.test/shs-1",
          short_ref: "Eesti - Sotsiaalhoolekande seadus - § 1"
        }
      ]
    }
  ]);

  assert.deepEqual(sources, []);
});

test("conversation source panel keeps current assistant answer sources", () => {
  const sources = collectLatestAnswerSources([
    {
      role: "ai",
      text: "Earlier sourced answer.",
      sources: [
        {
          id: "old-law",
          title: "Old source",
          url: "https://example.test/old",
          short_ref: "Old source"
        }
      ]
    },
    {
      role: "ai",
      text: "Current sourced answer.",
      sources: [
        {
          id: "current-law",
          title: "Current source",
          url: "https://example.test/current",
          short_ref: "Current source"
        }
      ]
    }
  ]);

  assert.equal(sources.length, 1);
  assert.equal(sources[0].key, "current-law");
  assert.equal(sources[0].label, "Current source");
  assert.deepEqual(sources[0].allUrls, ["https://example.test/current"]);
});
