import test from "node:test";
import assert from "node:assert/strict";

import { collectConversationSources } from "../../components/chat/hooks/useConversationSources.js";

test("conversation sources keep earlier sourced answers even when latest answer has no sources", () => {
  const sources = collectConversationSources(
    [
      { role: "user", text: "Esimene kysimus" },
      {
        role: "ai",
        text: "Esimene vastus",
        sources: [
          {
            key: "src-2019",
            label: "Rait Kuuse, 2019. Sotsiaalkaitse uue aasta valjakutsed.",
            journalTitle: "Sotsiaaltoo",
            year: 2019
          }
        ]
      },
      { role: "user", text: "Teine kysimus" },
      { role: "ai", text: "Teine vastus ilma allikateta", sources: [] }
    ],
    null
  );

  assert.equal(sources.length, 1);
  assert.equal(sources[0].label, "Rait Kuuse, 2019. Sotsiaalkaitse uue aasta valjakutsed.");
});

test("conversation sources merge duplicate sources across multiple answers", () => {
  const sources = collectConversationSources(
    [
      { role: "user", text: "Kysimus 1" },
      {
        role: "ai",
        text: "Vastus 1",
        sources: [
          {
            key: "src-2021",
            label: "Hede Sinisaar, 2021. Eesti inimeste toetamine majandusliku olukorra muutumisel.",
            url: "https://example.com/article",
            journalTitle: "Sotsiaaltoo",
            year: 2021
          }
        ]
      },
      { role: "user", text: "Kysimus 2" },
      {
        role: "ai",
        text: "Vastus 2",
        sources: [
          {
            key: "src-2021",
            label: "Hede Sinisaar, 2021. Eesti inimeste toetamine majandusliku olukorra muutumisel.",
            url: "https://example.com/article",
            journalTitle: "Sotsiaaltoo",
            year: 2021
          }
        ]
      }
    ],
    null
  );

  assert.equal(sources.length, 1);
  assert.equal(sources[0].occurrences, 2);
  assert.deepEqual(sources[0].allUrls, ["https://example.com/article"]);
});
