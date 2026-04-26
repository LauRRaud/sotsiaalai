import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const plannerFixturePath = path.resolve(__dirname, "../fixtures/query-planner-v2-cases.json");

function readPlannerCases() {
  return JSON.parse(readFileSync(plannerFixturePath, "utf8"));
}

function assertQueryKind(query, kind, id) {
  if (!kind) return;
  if (kind === "filtered") {
    assert.equal(typeof query, "object", `${id}: expected filtered query object`);
    assert.equal(query && !Array.isArray(query), true, `${id}: expected filtered query object`);
    assert.equal(typeof query.query, "string", `${id}: expected filtered query text`);
    assert.equal(typeof query.filters, "object", `${id}: expected filtered query filters`);
    return;
  }
  if (kind === "unfiltered") {
    assert.equal(typeof query, "string", `${id}: expected unfiltered query string`);
    return;
  }
  assert.fail(`${id}: unknown query kind ${kind}`);
}

function queryText(query) {
  return typeof query === "string" ? query : String(query?.query || "");
}

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
          retrievers_used: ["dense", "title_match", "bm25"],
          search_strategy: "hybrid",
          merge_strategy: {
            strategy: "weighted_hybrid_rrf",
            rrf_k: 60,
            requested_retrievers: ["dense", "title_match", "exact_phrase", "bm25"]
          },
          channel_stats: {
            result_count: 1,
            channel_counts: {
              dense: 1,
              title_match: 1,
              bm25: 1
            },
            top_channels: ["dense", "title_match", "bm25"],
            dense_only_count: 0,
            lexical_only_count: 0,
            dense_and_lexical_count: 1,
            bm25: {
              result_count: 1,
              only_count: 0,
              average_score: 2.4,
              top_score: 2.4,
              average_coverage: 0.75
            }
          },
          results: [
            {
              id: "chunk-title",
              title: "Tartu linn koduteenus",
              text: "Koduteenuse taotlemine Tartus.",
              retrieval_channels: ["dense", "title_match", "bm25"],
              hybrid_score: 0.82,
              bm25_score: 2.4,
              bm25_coverage: 0.75,
              bm25_matches: 3,
              bm25_query_tokens: 4,
              rrf_score: 0.04,
              retrieval_scores: {
                hybrid_score: 0.82,
                rrf_score: 0.04,
                dense_rank: 1,
                lexical_rank: 1
              }
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

    assert.deepEqual(calls[0].retrievers, ["dense", "title_match", "exact_phrase", "bm25"]);
    assert.deepEqual(results[0].retrieval_channels, ["dense", "title_match", "bm25"]);
    assert.equal(results[0].hybrid_score, 0.82);
    assert.equal(results[0].rrf_score, 0.04);
    assert.equal(results[0].search_strategy, "hybrid");
    assert.equal(results[0].retrieval_merge_strategy.strategy, "weighted_hybrid_rrf");
    assert.equal(results[0].retrieval_channel_stats.channel_counts.title_match, 1);
    assert.equal(results[0].retrieval_channel_stats.bm25.average_coverage, 0.75);
    assert.equal(results[0].bm25_score, 2.4);
    assert.equal(results[0].bm25_coverage, 0.75);
    assert.equal(results[0].retrieval_scores.dense_rank, 1);
    assert.deepEqual(inferRetrieversUsed(results), ["dense", "title_match", "bm25"]);
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

test("source anchored retrieval queries follow planner eval fixture contracts", () => {
  const cases = readPlannerCases().filter(item => item.expected?.first_query_kind);
  assert.equal(cases.length >= 6, true);

  for (const item of cases) {
    const baseQuery = buildRagSearchQuery(item.message, item.history || []);
    const queries = buildSourceAnchoredRagQueries(item.message, item.history || [], baseQuery);

    assert.equal(queries.length >= 1, true, item.id);
    assertQueryKind(queries[0], item.expected.first_query_kind, item.id);

    if (item.expected.first_query_filters) {
      assert.deepEqual(queries[0]?.filters, item.expected.first_query_filters, item.id);
    }
    if (item.expected.second_query_filters) {
      assert.deepEqual(queries[1]?.filters, item.expected.second_query_filters, item.id);
    }
    for (const needle of item.expected.first_query_contains || []) {
      assert.match(queryText(queries[0]), new RegExp(needle, "i"), `${item.id}: first query should contain ${needle}`);
    }
  }
});
