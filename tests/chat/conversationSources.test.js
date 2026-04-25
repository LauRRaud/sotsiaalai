import test from "node:test";
import assert from "node:assert/strict";

import {
  collectConversationSources,
  collectLatestAnswerSources
} from "../../components/chat/hooks/useConversationSources.js";

test("source panel collectors prefer displayed_sources over legacy sources", () => {
  const messages = [
    {
      role: "user",
      text: "Kuidas taotleda koduteenust Tartus?"
    },
    {
      role: "assistant",
      text: "Koduteenuse taotlemiseks pöördu Tartu linna poole.",
      displayed_sources: [
        {
          id: "tartu-koduteenus",
          title: "Koduteenus",
          sourceType: "rag:kov_service_info",
          url: "https://tartu.ee/koduteenus"
        }
      ],
      sources: [
        {
          id: "retrieved-noise",
          title: "Koduteenuse üldine artikkel",
          sourceType: "rag:journal_article",
          url: "https://example.test/artikkel"
        }
      ]
    }
  ];

  const conversationSources = collectConversationSources(messages);
  const latestSources = collectLatestAnswerSources(messages);

  assert.equal(conversationSources.length, 1);
  assert.equal(latestSources.length, 1);
  assert.equal(conversationSources[0].key, "tartu-koduteenus");
  assert.equal(latestSources[0].key, "tartu-koduteenus");
});
