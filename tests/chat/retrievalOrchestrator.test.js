import test from "node:test";
import assert from "node:assert/strict";

import {
  dedupeRagMatches,
  inferRetrieversUsed,
  searchRagQueries
} from "../../lib/chat/retrievalOrchestrator.js";

test("dedupeRagMatches annotates dense retriever metadata by default", () => {
  const deduped = dedupeRagMatches([
    {
      id: "chunk-1",
      title: "Koduteenus",
      text: "Koduteenuse kirjeldus"
    }
  ]);

  assert.equal(deduped.length, 1);
  assert.equal(deduped[0].retriever, "dense");
  assert.equal(deduped[0].retrieval_channel, "dense");
  assert.deepEqual(deduped[0].retrieval_channels, ["dense"]);
  assert.deepEqual(inferRetrieversUsed(deduped), ["dense"]);
});

test("dedupeRagMatches merges retriever channels for duplicate chunks", () => {
  const deduped = dedupeRagMatches([
    {
      id: "chunk-1",
      retrieval_channel: "dense",
      text: "Koduteenuse kirjeldus"
    },
    {
      id: "chunk-1",
      retrieval_channel: "title_match",
      text: "Koduteenuse kirjeldus"
    }
  ]);

  assert.equal(deduped.length, 1);
  assert.deepEqual(deduped[0].retrieval_channels, ["dense", "title_match"]);
  assert.deepEqual(inferRetrieversUsed(deduped), ["dense", "title_match"]);
});

test("searchRagQueries sends hybrid retriever request and preserves returned channels", async () => {
  const previousFetch = global.fetch;
  const calls = [];
  global.fetch = async (_url, options = {}) => {
    const body = JSON.parse(String(options.body || "{}"));
    calls.push(body);
    return {
      ok: true,
      async text() {
        return JSON.stringify({
          retrievers_used: ["dense", "title_match"],
          results: [
            {
              id: "chunk-title",
              title: "Tartu linn koduteenus",
              text: "Koduteenuse taotlemine Tartus.",
              retrieval_channels: ["dense", "title_match"]
            }
          ]
        });
      }
    };
  };

  try {
    const results = await searchRagQueries({
      queries: "Tartu linn koduteenus",
      topK: 5
    });

    assert.deepEqual(calls[0].retrievers, ["dense", "title_match", "exact_phrase"]);
    assert.deepEqual(results[0].retrieval_channels, ["dense", "title_match"]);
    assert.deepEqual(inferRetrieversUsed(results), ["dense", "title_match"]);
  } finally {
    global.fetch = previousFetch;
  }
});
