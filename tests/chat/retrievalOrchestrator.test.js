import test from "node:test";
import assert from "node:assert/strict";

import {
  buildRagSearchQuery,
  buildSourceAnchoredRagQueries,
  dedupeRagMatches,
  extractRecentAssistantSourceAnchors,
  extractRecentAssistantSourceFocus,
  hasRecentAssistantSources,
  inferRetrieversUsed,
  isBroadMultiSourceRagQuestion,
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

test("buildRagSearchQuery anchors short follow-ups to recent assistant sources", () => {
  const history = [
    {
      role: "assistant",
      text: "Laur Raudsoo on kirjutanud artikli „Tehisintellekt sotsiaaltöös: praktika, kaalutlused ja väärtuspõhised piirid“.",
      sources: [
        {
          source_id: "sotsiaaltoo-ai-2025",
          title: "Tehisintellekt sotsiaaltöös: praktika, kaalutlused ja väärtuspõhised piirid",
          authors: ["Laur Raudsoo"],
          journalTitle: "Sotsiaaltöö",
          year: 2025,
          source_type: "journal_article"
        }
      ]
    },
    {
      role: "user",
      text: "Kas seal Eestit ka mainitakse?"
    }
  ];

  const query = buildRagSearchQuery("Soome", history);

  assert.match(query, /Soome/);
  assert.match(query, /Tehisintellekt sotsiaaltöös/);
  assert.match(query, /Laur Raudsoo/);
  assert.equal(hasRecentAssistantSources(history), true);
  assert.deepEqual(extractRecentAssistantSourceAnchors(history, 1), [
    "Tehisintellekt sotsiaaltöös: praktika, kaalutlused ja väärtuspõhised piirid Laur Raudsoo Sotsiaaltöö 2025"
  ]);
});

test("buildSourceAnchoredRagQueries adds focused source filters before fallback query", () => {
  const history = [
    {
      role: "assistant",
      text: "Artikli vastus.",
      sources: [
        {
          source_id: "sotsiaaltoo-ai-2025",
          doc_id: "article-doc-2025",
          title: "Tehisintellekt sotsiaaltöös: praktika, kaalutlused ja väärtuspõhised piirid",
          authors: ["Laur Raudsoo"],
          journalTitle: "Sotsiaaltöö",
          year: 2025
        }
      ]
    }
  ];

  const focus = extractRecentAssistantSourceFocus(history, 1);
  const queries = buildSourceAnchoredRagQueries("Eesti", history, buildRagSearchQuery("Eesti", history));

  assert.deepEqual(focus, [
    {
      anchor: "Tehisintellekt sotsiaaltöös: praktika, kaalutlused ja väärtuspõhised piirid Laur Raudsoo Sotsiaaltöö 2025",
      filters: {
        doc_id: "article-doc-2025"
      }
    }
  ]);
  assert.equal(queries.length, 2);
  assert.deepEqual(queries[0].filters, { doc_id: "article-doc-2025" });
  assert.match(queries[0].query, /Eesti/);
  assert.match(queries[0].query, /Tehisintellekt sotsiaaltöös/);
  assert.equal(typeof queries[1], "string");
});

test("buildSourceAnchoredRagQueries keeps broad synthesis queries unfiltered first", () => {
  const history = [
    {
      role: "assistant",
      text: "Artikli vastus.",
      sources: [
        {
          source_id: "sotsiaaltoo-ai-2025",
          doc_id: "article-doc-2025",
          title: "Tehisintellekt sotsiaaltöös: praktika, kaalutlused ja väärtuspõhised piirid",
          authors: ["Laur Raudsoo"],
          journalTitle: "Sotsiaaltöö",
          year: 2025
        }
      ]
    }
  ];

  const message = "võrdle seda teiste Sotsiaaltöö artiklitega tehisintellekti teemal";
  const queries = buildSourceAnchoredRagQueries(message, history, buildRagSearchQuery(message, history));

  assert.equal(isBroadMultiSourceRagQuestion(message), true);
  assert.equal(typeof queries[0], "string");
  assert.match(queries[0], /võrdle seda teiste/);
  assert.match(queries[0], /Tehisintellekt sotsiaaltöös/);
  assert.deepEqual(queries[1].filters, { doc_id: "article-doc-2025" });
});

test("searchRagQueries merges per-query source filters with base filters", async () => {
  const previousFetch = global.fetch;
  const calls = [];
  global.fetch = async (_url, options = {}) => {
    const body = JSON.parse(String(options.body || "{}"));
    calls.push(body);
    return {
      ok: true,
      async text() {
        return JSON.stringify({
          retrievers_used: ["dense"],
          results: []
        });
      }
    };
  };

  try {
    await searchRagQueries({
      queries: [
        {
          query: "Eesti\nTehisintellekt sotsiaaltöös",
          filters: {
            doc_id: "article-doc-2025"
          }
        },
        "Eesti\nTehisintellekt sotsiaaltöös"
      ],
      filters: {
        audience: { $in: ["CLIENT", "BOTH"] }
      },
      topK: 8
    });

    assert.equal(calls.length, 2);
    assert.deepEqual(calls[0].where, {
      audience: { $in: ["CLIENT", "BOTH"] },
      doc_id: "article-doc-2025"
    });
    assert.deepEqual(calls[1].where, {
      audience: { $in: ["CLIENT", "BOTH"] }
    });
  } finally {
    global.fetch = previousFetch;
  }
});
